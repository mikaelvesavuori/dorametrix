/**
 * @description The Deployment is one of the three primary event type.
 */
export type Deployment = {
  eventType: string;
  product: string;
  timeCreated: string;
  id: string;
  changes: Change[];
  date: string;
};

export type Change = {
  id: string;
  timeCreated: string;
};
