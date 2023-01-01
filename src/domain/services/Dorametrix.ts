import { Dorametrix } from '../../interfaces/Dorametrix';
import { Repository } from '../../interfaces/Repository';
import { Change } from '../../interfaces/Change';
import { Event } from '../../interfaces/Event';
import { Deployment } from '../../interfaces/Deployment';
import { Incident } from '../../interfaces/Incident';
import { DeploymentResponse } from '../../interfaces/DeploymentResponse';

import { prettifyTime } from '../../infrastructure/frameworks/prettifyTime';
import { getDiffInSeconds } from '../../infrastructure/frameworks/getDiffInSeconds';

import { v4 as uuidv4 } from 'uuid';

/**
 * @description Factory function to create new Dorametrix instance.
 */
export function createNewDorametrix(repo: Repository): Dorametrix {
  return new DorametrixConcrete(repo);
}

/**
 * @description Concrete implementation of Dorametrix.
 */
class DorametrixConcrete implements Dorametrix {
  repo: Repository;
  deploymentPeriodDays: number;
  product: string;

  constructor(repo: Repository) {
    this.repo = repo;
    this.deploymentPeriodDays = process.env.DEPLOYMENT_PERIOD_DAYS
      ? parseInt(process.env.DEPLOYMENT_PERIOD_DAYS)
      : 7;
    this.product = '';
  }

  /**
   * @description Set the product name.
   */
  public setProductName(productName: string) {
    this.product = productName;
  }

  /**
   * @description Handle (create/update) an event in the repository.
   * Events need to be uniquely identifiable, so overwrite the ID here.
   * To keep individual records, we'll use the event time as the timeCreated
   * so they don't stack on the same record.
   */
  public async handleEvent(event: Event): Promise<void> {
    await this.repo.addEventItem({
      ...event,
      timeCreated: event.eventTime,
      id: uuidv4()
    });
  }

  /**
   * @description Handle (create/update) a change in the repository.
   */
  public async handleChange(change: Change): Promise<void> {
    await this.repo.addChangeItem(change);
  }

  /**
   * @description Handle (create/update) a deployment in the repository.
   */
  public async handleDeployment(deployment: Deployment): Promise<void> {
    await this.repo.addDeploymentItem(deployment);
    await this.repo.addDeploymentItem(deployment, true);
  }

  /**
   * @description Handle (create/update) an incident in the repository.
   */
  public async handleIncident(incident: Incident): Promise<void> {
    await this.repo.updateIncidentItem(incident);
  }

  /**
   * @description Get the commit ID for the last deployment to production.
   */
  public async getLastDeployment(): Promise<DeploymentResponse> {
    const lastDeployment = await this.repo.getMetrics({
      key: `DEPLOYMENT_${this.product}`,
      getLastDeployedCommit: true
    });

    if (lastDeployment[0]?.changes) {
      const changes = JSON.parse(lastDeployment[0]?.changes);

      // Get latest deployment
      const deploymentTimes = changes
        .map((change: any) => change.timeCreated)
        .sort()
        .reverse();
      const latestTime = deploymentTimes[0];

      // Get the ID of the latest deployment
      const matchingChange = changes.filter((change: any) => change.timeCreated === latestTime);
      if (matchingChange && matchingChange.length > 0) {
        const { id } = matchingChange[0];

        // If the timestamp uses a 10-digit format, add zeroes to be in line with how JavaScript does it
        const timeCreated = latestTime.length === 10 ? latestTime + '000' : latestTime;

        return {
          id,
          timeCreated
        };
      }
    }

    return {
      id: '',
      timeCreated: ''
    };
  }

  /**
   * @description Get the averaged deployment frequency for a period of time (default: 7 days).
   */
  public async getDeploymentFrequency(): Promise<string> {
    const deploymentCount = await this.repo.getMetrics({
      key: `DEPLOYMENT_${this.product}`,
      onlyGetCount: true,
      days: 7
    });

    return (deploymentCount / this.deploymentPeriodDays).toFixed(2).toString();
  }

  /**
   * @description Get the averaged lead time for a change getting into production (deployment).
   */
  public async getLeadTimeForChanges(): Promise<string> {
    const changesData = await this.repo.getMetrics({ key: `CHANGE_${this.product}` });
    const deploymentsData = await this.repo.getMetrics({ key: `DEPLOYMENT_${this.product}` });
    if (deploymentsData.length === 0) return '00:00:00:00';

    let accumulatedTime = 0;

    /**
     * Loop through all deployments...
     */
    deploymentsData.forEach((deployment: Deployment): void => {
      const { changes, timeCreated } = deployment;
      // @ts-ignore
      const parsedChanges = JSON.parse(changes);

      /**
       * Each change might lead to one or more deployments, so go and get each one.
       */
      const changesDataIds = parsedChanges.map((change: Change) => change.id);
      const matches = changesData
        .filter((change: Change) => changesDataIds.includes(change.id))
        .map((change: Change) => change.timeCreated)
        .sort((a: any, b: any) => a - b);

      /**
       * Calculate diff between earliest commit timestamp (`firstMatch`) and deployment timestamp (`timeCreated`).
       */
      if (matches && matches.length > 0) {
        const firstMatch = matches[0];

        if (firstMatch && timeCreated && firstMatch > timeCreated) {
          console.warn(
            `Unexpected deployment data: firstMatch field is later than timeCreated...Skipping it.\n--> timeCreated: ${firstMatch} firstMatch: ${firstMatch}`
          );
          return;
        }

        accumulatedTime += getDiffInSeconds(firstMatch, timeCreated);
      }
    });

    return prettifyTime(accumulatedTime / deploymentsData.length);
  }

  /**
   * @description Get a change failure rate as an averaged number for a period of time (default: 30 days).
   */
  public async getChangeFailureRate(): Promise<string> {
    const deploymentCount = await this.repo.getMetrics({
      key: `DEPLOYMENT_${this.product}`,
      onlyGetCount: true
    });

    const incidentCount = await this.repo.getMetrics({
      key: `INCIDENT_${this.product}`,
      onlyGetCount: true
    });

    if (incidentCount === 0 || deploymentCount === 0) return '0.00';

    return (parseInt(incidentCount) / parseInt(deploymentCount)).toFixed(2).toString();
  }

  /**
   * @description Get the time to restore service as an averaged value.
   */
  public async getTimeToRestoreServices(): Promise<string> {
    const incidents = await this.repo.getMetrics({ key: `INCIDENT_${this.product}` });
    if (incidents.length === 0) return '00:00:00:00';

    let accumulatedTime = 0;
    let incidentCount = 0;

    /**
     * Loop all incidents and add up the time they all took.
     */
    incidents.forEach((incident: Incident): void => {
      const { timeCreated, timeResolved } = incident;

      if (timeCreated && timeResolved && timeCreated > timeResolved) {
        console.warn(
          `Unexpected incident data: timeCreated field is later than timeResolved...Skipping it.\n--> timeCreated: ${timeCreated} timeResolved: ${timeResolved}`
        );
        return;
      }

      accumulatedTime += timeResolved
        ? (parseFloat(timeResolved) - parseFloat(timeCreated)) / 1000
        : (parseFloat(Date.now().toString()) - parseFloat(timeCreated)) / 1000;

      incidentCount++;
    });

    return prettifyTime(accumulatedTime / incidentCount);
  }
}
