/**
 * @description The Deployment is one of the three primary event types.
 */
export type Deployment = {
  eventType: string;
  repo: string;
  timeCreated: string;
  id: string;
  /**
   * Refers to the commit SHA that led to this deployment.
   */
  changeSha: string;
  date: string;
};
