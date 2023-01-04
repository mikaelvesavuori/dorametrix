/**
 * @description TODO
 * @example `20230101`
 */
export function formatDate(input: string) {
  if (!input || input.length !== 8) throw new Error('TODO 1');

  const year = input.substring(0, 4);
  const month = input.substring(4, 6);
  const day = input.substring(6, 8);

  return `${year}-${month}-${day}`;
}

/**
 * @description TODO
 *
 * @param formattedDate Date in the format of `2023-01-01`
 * @param offset Optional offset in hours, using the format `0` (UTC; default), `-4` (behind UTC), or `7` (before UTC)
 *
 * @example `1672531200`
 */
export function getTimestampForDate(formattedDate: string, offset = 0) {
  const parsedOffset = offset;
  if (parsedOffset < -12 || parsedOffset > 12) throw new Error('TODO 2');

  const date = new Date(createTimezoneConvertedDateString(formattedDate, parsedOffset));
  return Math.floor(date.getTime() / 1000);
}

/**
 * @description TODO
 * @example `2023-01-01T00:00:00.000+05:00`
 */
export function createTimezoneConvertedDateString(formattedDate: string, parsedOffset: number) {
  /**
   * Note that this is "flipped" and works contrary to how we normally
   * think about timezones. We typically think of e.g. New York as
   * several hours "behind" (minus, -) London/GMT/UTC/Zulu time.
   *
   * However, for some unknown reason when adding the offset we get
   * precisely the reverse results: That's why we do the flip of +/- here.
   */
  const offsetMarker = parsedOffset.toString().includes('-') ? '+' : '-';
  const numericOffset = parsedOffset.toString().replace('-', '');
  const leadingZero = numericOffset.length === 1 ? '0' : '';

  return `${formattedDate}T00:00:00.000${offsetMarker}${leadingZero}${numericOffset}:00`;
}
