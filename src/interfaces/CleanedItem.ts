/**
 * @description Item from database that has been cleaned and conformed.
 */
export type CleanedItem = {
  id?: string;
  timeCreated?: string;
  timeResolved?: string;
  changeSha?: string;
  title?: string;
  message?: string;
};
