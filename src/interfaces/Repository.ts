import { Change } from './Change';
import { Deployment } from './Deployment';
import { Event } from './Event';
import { Incident } from './Incident';

/**
 * @description The Repository allows us to access a database of some kind.
 */
export interface Repository {
  /**
   * @description Add (create/update) an Event in the repository.
   */
  addEvent(event: Event): Promise<any>;

  /**
   * @description Add (create/update) a Change in the repository.
   */
  addChange(change: Change): Promise<any>;

  /**
   * @description Add (create/update) a Deployment in the repository.
   */
  addDeployment(deployment: Deployment): Promise<any>;

  /**
   * @description Update (or create) an Incident in the repository.
   */
  addIncident(incident: Incident): Promise<any>;

  /**
   * @description Get metrics from source system.
   */
  getMetrics(dataRequest: DataRequest): Promise<any>;
}

// TODO: Check
export type DataRequest = {
  key: string;
  fromDate: string;
  toDate: string;
  getLastDeployedCommit?: boolean;
  days?: number;
};
