import { getDiffInSeconds, prettifyTime } from 'chrono-utils';

import { Dorametrix } from '../../interfaces/Dorametrix';
import { Change } from '../../interfaces/Change';
import { Deployment } from '../../interfaces/Deployment';
import { Incident } from '../../interfaces/Incident';
import { DeploymentResponse } from '../../interfaces/DeploymentResponse';

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
    if (lastDeployment?.id && lastDeployment?.timeCreated) {
      const { id, timeCreated } = lastDeployment;
      return {
        id,
        timeCreated
      };
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
    const multiplier = fromTimestamp.length === 10 ? 1000 : 0; // Add milliseconds if 10-digit timestamp
    const diff = getDiffInSeconds(fromTimestamp, toTimestamp) * multiplier;
    return Math.ceil(diff / 86400) || 1; // If 0 round up to 1 or fallback to 1 day
  }

  /**
   * @description Get the median lead time for a change getting into production (deployment).
   */
  public getLeadTimeForChanges(changes: Change[], deployments: Deployment[]): string {
    if (deployments.length === 0) return '00:00:00:00';

    const accumulatedTimes = deployments
      .map((deployment: Deployment) => this.calculateLeadTime(deployment, changes))
      .sort();

    const medianPoint =
      accumulatedTimes.length < 2 ? 0 : Math.floor(accumulatedTimes.length / 2) - 1;
    const medianValue = accumulatedTimes[medianPoint] || 0;

    return prettifyTime(medianValue);
  }

  /**
   * @description Calculate the lead time of a change for an individual deployment.
   */
  private calculateLeadTime(deployment: Deployment, changes: Change[]): number {
    const { changeSha, timeCreated } = deployment;

    const commitTimeCreated = changes
      .filter((change: Change) => change.id === changeSha)
      .map((change: Change) => change.timeCreated)[0];

    if (!commitTimeCreated) return 0;

    if (commitTimeCreated > timeCreated) {
      console.warn(
        `Unexpected deployment data: Commit timeCreated is later than deployment timeCreated...Skipping it.\n--> Deployment: ${timeCreated} Commit: ${commitTimeCreated}`
      );
      return 0;
    }

    return getDiffInSeconds(commitTimeCreated, timeCreated);
  }

  /**
   * @description Get a change failure rate as an averaged number for a period of time.
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
