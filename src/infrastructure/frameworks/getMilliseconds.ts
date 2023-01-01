/**
 * @description Returns the number of milliseconds for a count of days.
 *
 * Default to fetching last 30 days.
 */
export function getMilliseconds(days = 30) {
  const millisSingleDay = 24 * 60 * 60 * 1000; // hours x minutes x seconds x milliseconds per second

  /**
   * Data was not cached, so go and get fresh data
   * For practical reasons, so tests won't get stale over time, get broader range if this is a test.
   */
  if (process.env.IS_TEST) return millisSingleDay * 1000;

  return millisSingleDay * days;
}
