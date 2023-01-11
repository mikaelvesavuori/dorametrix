import { Change } from './Change';
import { Deployment } from './Deployment';
import { DeploymentResponse } from './DeploymentResponse';
import { Incident } from './Incident';

/**
 * @description Dorametrix creates and gets events in our expected DORA metrics
 * format using a repository.
 */
export interface Dorametrix {
  /**
   * @description Get the commit ID for the last deployment to production.
   */
  getLastDeployment(lastDeployment: Deployment): DeploymentResponse;

  /**
   * @description Get the averaged deployment frequency for a period of time.
   */
  getDeploymentFrequency(
    deploymentCount: number,
    fromTimestamp: string,
    toTimestamp: string
  ): string;

  /**
   * @description Get the averaged lead time for a change getting into production (deployment).
   */
  getLeadTimeForChanges(changes: Change[], deployments: Deployment[]): string;

  /**
   * @description Get a change failure rate as an averaged number for a period of time.
   */
  getChangeFailureRate(incidentCount: number, deploymentCount: number): string;

  /**
   * @description Get the time to restore service as an averaged value.
   */
  getTimeToRestoreServices(incidents: Incident[]): string;
}
