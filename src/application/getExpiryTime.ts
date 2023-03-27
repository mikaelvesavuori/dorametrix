import { getMillisecondsForDays } from 'chrono-utils';

/**
 * @description Get the expiry time for a database item.
 */
export function getExpiryTime(isShortExpiry = false) {
  const SHORTER_RETENTION_PERIOD = 14;

  const maxDateRange = (() => {
    const durationInDays = parseInt(process.env.MAX_DATE_RANGE || '');
    if (isShortExpiry)
      return durationInDays < SHORTER_RETENTION_PERIOD ? durationInDays : SHORTER_RETENTION_PERIOD;
    return durationInDays || 365;
  })();

  const currentTimeStamp = Math.floor(Date.now() / 1000);
  return (currentTimeStamp + getMillisecondsForDays(maxDateRange + 1) / 1000).toString();
}
