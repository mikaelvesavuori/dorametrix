import { Change } from './Change';
import { Deployment } from './Deployment';
import { Event } from './Event';
import { Incident } from './Incident';
import { DeploymentResponse } from './DeploymentResponse';

/**
 * @description Dorametrix creates and gets events in our expected DORA metrics
 * format using a repository.
 */
export interface Dorametrix {
  /**
   * @description Handle (create/update) an event in the repository.
   */
  handleEvent(event: Event): Promise<void>;

  /**
   * @description Handle (create/update) a change in the repository.
   */
  handleChange(change: Change): Promise<void>;

  /**
   * @description Handle (create/update) a deployment in the repository.
   */
  handleDeployment(deployment: Deployment): Promise<void>;

  /**
   * @description Handle (create/update) an incident in the repository.
   */
  handleIncident(incident: Incident): Promise<void>;

  /**
   * @description Set the product name.
   */
  setProductName(productName: string): void;

  /**
   * @description Get the commit ID for the last deployment to production.
   */
  getLastDeployment(): Promise<DeploymentResponse>;

  /**
   * @description Get the averaged deployment frequency for a period of time (default: 7 days).
   */
  getDeploymentFrequency(): Promise<string>;

  /**
   * @description Get the averaged lead time for a change getting into production (deployment).
   */
  getLeadTimeForChanges(): Promise<string>;

  /**
   * @description Get a change failure rate as an averaged number for a period of time (default: 30 days).
   */
  getChangeFailureRate(): Promise<string>;

  /**
   * @description Get the time to restore service as an averaged value.
   */
  getTimeToRestoreServices(): Promise<string>;
}
