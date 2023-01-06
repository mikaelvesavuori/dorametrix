/**
 * @description Get the difference in seconds between two moments in time (i.e. Unix timestamps).
 */
export const getDiffInSeconds = (earlierTime: string, laterTime: string): number =>
  Math.floor((parseInt(laterTime) - parseInt(earlierTime)) / 1000);
