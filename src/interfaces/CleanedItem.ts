import { DeploymentChange } from './Deployment';

/**
 * @description Item from database that has been cleaned and conformed.
 */
export type CleanedItem = {
  id?: string;
  timeCreated?: string;
  timeResolved?: string;
  changes?: DeploymentChange[];
  title?: string;
  message?: string;
};
