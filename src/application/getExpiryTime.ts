import { getMillisecondsForDays } from 'chrono-utils';

/**
 * @description Get the expiry time for a database item.
 */
export function getExpiryTime() {
  const MAX_DATE_RANGE = parseInt(process.env.MAX_DATE_RANGE || '') || 365;
  const currentTimeStamp = Math.floor(Date.now() / 1000);
  return (currentTimeStamp + getMillisecondsForDays(MAX_DATE_RANGE + 1) / 1000).toString();
}
