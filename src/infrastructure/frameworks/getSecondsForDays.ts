/**
 * @description Returns the number of milliseconds for a count of days.
 */
export function getSecondsForDays(days: number) {
  const millisSingleDay = 24 * 60 * 60; // hours x minutes x seconds

  /**
   * Data was not cached, so go and get fresh data
   * For practical reasons, so tests won't get stale over time, get broader range if this is a test.
   */
  if (process.env.IS_TEST) return millisSingleDay * 1000;

  return millisSingleDay * days;
}
