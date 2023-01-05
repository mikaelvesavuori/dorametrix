import { Change } from './Change';
import { Deployment } from './Deployment';
import { Event } from './Event';
import { Incident } from './Incident';

/**
 * @description The Repository allows us to access a database of some kind.
 */
export interface Repository {
  /**
   * @description Add (create/update) an Event in the source database.
   */
  handleEvent(event: Event): Promise<any>;
  /**
   * @description Add (create/update) a Change in the source database.
   */
  handleChange(change: Change): Promise<any>;
  /**
   * @description Add (create/update) a Deployment in the source database.
   */
  handleDeployment(deployment: Deployment): Promise<any>;
  /**
   * @description Update (or create) an Incident in the source database.
   */
  handleIncident(incident: Incident): Promise<any>;

  /**
   * @description Get metrics from source system.
   */
  getMetrics(dataRequest: DataRequest): Promise<any>;

  // TODO: Make "private"
  /*
  private addEventItem(data: any): Promise<void>;
  private addChangeItem(data: any): Promise<void>;
  private addDeploymentItem(data: any, isLastDeployedCommit?: boolean): Promise<void>;
  private updateIncidentItem(data: any): Promise<void>;
  */
}

// TODO: Check
export type DataRequest = {
  key: string;
  fromDate: string;
  toDate: string;
  getLastDeployedCommit?: boolean;
  days?: number;
};
