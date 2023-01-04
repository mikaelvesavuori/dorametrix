import { DeploymentResponse } from './DeploymentResponse';

/**
 * @description Dorametrix creates and gets events in our expected DORA metrics
 * format using a repository.
 */
export interface Dorametrix {
  /**
   * @description Set the product name.
   */
  setProductName(productName: string): void;

  /**
   * @description Get the commit ID for the last deployment to production.
   */
  getLastDeployment(lastDeployment: any): DeploymentResponse;

  /**
   * @description Get the averaged deployment frequency for a period of time (default: 7 days).
   */
  getDeploymentFrequency(deploymentCount: number): string;

  /**
   * @description Get the averaged lead time for a change getting into production (deployment).
   */
  getLeadTimeForChanges(deployments: any[], changes: any[]): string;

  /**
   * @description Get a change failure rate as an averaged number for a period of time (default: 30 days).
   */
  getChangeFailureRate(incidentCount: number, deploymentCount: number): string;

  /**
   * @description Get the time to restore service as an averaged value.
   */
  getTimeToRestoreServices(incidents: any[]): string;
}
