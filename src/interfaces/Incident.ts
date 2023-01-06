/**
 * @description The Incident is one of the three primary event types.
 */
export type Incident = {
  eventType: string;
  repo: string;
  timeCreated: string;
  id: string;
  timeResolved: string;
  title: string;
  date: string;
};
