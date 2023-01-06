import { getDateBefore } from './date';
import { getMillisecondsForDays } from './getMillisecondsForDays';

/**
 * @description Calculates `from` and `to` timestamps for a provided period in days.
 *
 * Using `lastNumDays` means getting specified range excluding current day.
 */
export function getTimestampsForPeriod(lastNumDays: number, offsetInHours = 0) {
  const toTime = getTimestampForInputDate(getDateBefore(true), offsetInHours, true);
  const fromTimeUTCString: any = `${toTime}999`;
  const fromTime = new Date(fromTimeUTCString - getMillisecondsForDays(lastNumDays) + 1).getTime();

  return {
    from: `${fromTime}`.substring(0, 10),
    to: `${toTime}`.substring(0, 10)
  };
}

/**
 * @description TODO
 *
 * @param date Date in YYYYMMDD format
 * @param offsetInHours Optional timezone offset in hours, using the format `0` (UTC; default), `-4` (behind UTC), or `7` (before UTC)
 */
export function getTimestampForInputDate(
  date: string,
  offsetInHours = 0,
  lastPossibleTime = false
) {
  const formatted = convertToIsoDate(date);
  const timestamp = getTimestampForISODate(formatted, offsetInHours, lastPossibleTime);
  return `${timestamp}`;
}

/**
 * @description TODO
 * @example `20230101`
 */
function convertToIsoDate(input: string) {
  if (!input || input.length !== 8) throw new Error('TODO 1');

  const year = input.substring(0, 4);
  const month = input.substring(4, 6);
  const day = input.substring(6, 8);

  return `${year}-${month}-${day}`;
}

/**
 * @description TODO
 *
 * @param formattedDate Date in the ISO format of `2023-01-01`
 * @param offsetInHours Optional timezone offset in hours, using the format `0` (UTC; default), `-4` (behind UTC), or `7` (before UTC)
 *
 * @example `1672531200`
 */
function getTimestampForISODate(
  formattedDate: string,
  offsetInHours = 0,
  lastPossibleTime = false
) {
  if (offsetInHours < -12 || offsetInHours > 12) throw new Error('TODO 2');

  const date = new Date(
    createTimezoneConvertedDateString(formattedDate, offsetInHours, lastPossibleTime)
  );
  return Math.floor(date.getTime() / 1000);
}

/**
 * @description TODO
 * @example `2023-01-01T00:00:00.000+05:00`
 */
function createTimezoneConvertedDateString(
  formattedDate: string,
  offsetInHours: number,
  lastPossibleTime = false
) {
  /**
   * Note that this is "flipped" and works contrary to how we normally
   * think about timezones. We typically think of e.g. New York as
   * several hours "behind" (minus, -) London/GMT/UTC/Zulu time.
   *
   * However, for some unknown reason when adding the offset we get
   * precisely the reverse results: That's why we do the flip of +/- here.
   */
  const offsetMarker = offsetInHours.toString().includes('-') ? '+' : '-';
  const numericOffset = offsetInHours.toString().replace('-', '');
  const leadingZero = numericOffset.length === 1 ? '0' : '';
  const time = lastPossibleTime ? 'T23:59:59.999' : 'T00:00:00.000';

  return `${formattedDate}${time}${offsetMarker}${leadingZero}${numericOffset}:00`;
}

/**
 * @description Get the difference in seconds between two moments in time (i.e. Unix timestamps).
 */
export const getDiffInSeconds = (earlierTime: number, laterTime: number): number =>
  Math.floor((laterTime - earlierTime) / 1000);
