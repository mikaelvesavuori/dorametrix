/**
 * @description The Deployment is one of the three primary event type.
 */
export type Deployment = {
  eventType: string;
  repo: string;
  timeCreated: string;
  id: string;
  changes: DeploymentChange[];
  date: string;
};

/**
 * @description Representation of a change inside the Deployment.
 */
export type DeploymentChange = {
  id: string;
  timeCreated: string;
};
