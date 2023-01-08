import { Dorametrix } from '../../interfaces/Dorametrix';
import { Change } from '../../interfaces/Change';
import { Deployment, DeploymentChange } from '../../interfaces/Deployment';
import { Incident } from '../../interfaces/Incident';
import { DeploymentResponse } from '../../interfaces/DeploymentResponse';

import { prettifyTime } from '../../infrastructure/frameworks/prettifyTime';
import { getDiffInSeconds } from '../../infrastructure/frameworks/getDiffInSeconds';

/**
 * @description Factory function to create new Dorametrix instance.
 */
export function createNewDorametrix(repoName: string): Dorametrix {
  return new DorametrixConcrete(repoName);
}

/**
 * @description Concrete implementation of Dorametrix.
 */
class DorametrixConcrete implements Dorametrix {
  repoName: string;

  constructor(repoName: string) {
    this.repoName = repoName;
  }

  /**
   * @description Get the commit ID for the last deployment to production.
   */
  public getLastDeployment(lastDeployment: Deployment): DeploymentResponse {
    if (lastDeployment?.changes) {
      const changes: DeploymentChange[] = lastDeployment?.changes;

      // Get latest deployment
      const deploymentTimes = changes
        .map((change: any) => change.timeCreated)
        .sort()
        .reverse();
      const latestTime = deploymentTimes[0];

      // Get the ID of the latest deployment
      const matchingChange = changes.filter(
        (change: DeploymentChange) => change.timeCreated === latestTime
      );

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
   * @description Get the averaged deployment frequency for a period of time.
   */
  public getDeploymentFrequency(
    deploymentCount: number,
    fromTimestamp: string,
    toTimestamp: string
  ): string {
    return (deploymentCount / this.calculateDaysInScope(fromTimestamp, toTimestamp))
      .toFixed(2)
      .toString();
  }

  /**
   * @description Calculates number of days within scope of two timestamps. Minimum is 1.
   */
  private calculateDaysInScope(fromTimestamp: string, toTimestamp: string) {
    const diff = getDiffInSeconds(fromTimestamp, toTimestamp) * 1000; // Add milliseconds
    return Math.ceil(diff / 86400) || 1; // If 0 round up to 1 or fallback to 1 day
  }

  /**
   * @description Get the averaged lead time for a change getting into production (deployment).
   */
  public getLeadTimeForChanges(changes: Change[], deployments: Deployment[]): string {
    if (deployments.length === 0) return '00:00:00:00';

    let accumulatedTime = 0;
    deployments.forEach(
      (deployment: Deployment) => (accumulatedTime += this.calculateLeadTime(deployment, changes))
    );

    return prettifyTime(accumulatedTime / deployments.length);
  }

  /**
   * @description Calculate the lead time of a change for an individual deployment.
   */
  private calculateLeadTime(deployment: Deployment, allChanges: Change[]): number {
    const { changes, timeCreated } = deployment;

    /**
     * Each change might lead to one or more deployments, so go and get each one.
     */
    const changeIds = changes.map((change: DeploymentChange) => change.id);
    const matches = allChanges
      .filter((change: DeploymentChange) => changeIds.includes(change.id))
      .map((change: DeploymentChange) => change.timeCreated)
      .sort((a: any, b: any) => a.timeCreated - b.timeCreated);

    /**
     * Calculate diff between earliest commit timestamp (`firstMatch`) and deployment timestamp (`timeCreated`).
     */
    if (matches?.length > 0) {
      const firstMatch = matches[0];

      if (firstMatch && timeCreated && firstMatch > timeCreated) {
        console.warn(
          `Unexpected deployment data: firstMatch field is later than timeCreated...Skipping it.\n--> timeCreated: ${firstMatch} firstMatch: ${firstMatch}`
        );
        return 0;
      }

      return getDiffInSeconds(firstMatch, timeCreated);
    }

    return 0;
  }

  /**
   * @description Get a change failure rate as an averaged number for a period of time (default: 30 days).
   */
  public getChangeFailureRate(incidentCount: number, deploymentCount: number): string {
    if (incidentCount === 0 || deploymentCount === 0) return '0.00';

    return (incidentCount / deploymentCount).toFixed(2).toString();
  }

  /**
   * @description Get the time to restore service as an averaged value.
   */
  public getTimeToRestoreServices(incidents: any[]): string {
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
          `Unexpected incident data: timeCreated field is later than timeResolved...Skipping it.\n--> timeCreated: ${timeCreated}\n--> timeResolved: ${timeResolved}`
        );
        return;
      }

      accumulatedTime += timeResolved
        ? (parseInt(timeResolved) - parseInt(timeCreated)) / 1000
        : (parseInt(Date.now().toString()) - parseInt(timeCreated)) / 1000;

      incidentCount++;
    });

    return prettifyTime(accumulatedTime / incidentCount);
  }
}
