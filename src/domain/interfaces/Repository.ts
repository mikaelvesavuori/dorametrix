/**
 * @description The Repository allows us to access a database of some kind.
 */
export interface Repository {
  /**
   * @description Get data from source system.
   */
  getData(dataRequest: DataRequest): Promise<any>;
  /**
   * @description Add (create/update) an Event in the source database.
   */
  addEventItem(data: any): Promise<void>;
  /**
   * @description Add (create/update) a Change in the source database.
   */
  addChangeItem(data: any): Promise<void>;
  /**
   * @description Add (create/update) a Deployment in the source database.
   */
  addDeploymentItem(data: any, isLastDeployedCommit?: boolean): Promise<void>;
  /**
   * @description Update (or create) an Incident in the source database.
   */
  updateIncidentItem(data: any): Promise<void>;
}

export type DataRequest = {
  key: string;
  onlyGetCount?: boolean;
  getLastDeployedCommit?: boolean;
  days?: number;
};
