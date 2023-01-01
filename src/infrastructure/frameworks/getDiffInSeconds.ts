/**
 * @description Get the difference in seconds between two moments in time (i.e. Unix timestamps).
 */
export const getDiffInSeconds = (earlierTime: string, laterTime: string): number =>
  Math.floor((parseFloat(laterTime) - parseFloat(earlierTime)) / 1000);
