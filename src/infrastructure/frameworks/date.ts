/**
 * @description Returns the current date in `YYYY-MM-DD` format.
 *
 * The `noDashes` option will strip any dashes between days, months, etc.
 *
 * @example `2022-11-20`
 * @example `20221120`
 */
export function getCurrentDate(noDashes = false): string {
  const date = new Date();
  const day = makeTwoDigitDate(date, 'day');
  const month = makeTwoDigitDate(date.getMonth() + 1, 'day');
  const year = date.getFullYear();

  const dateString = `${year}-${month}-${day}`;

  if (noDashes) return dateString.replaceAll('-', '');
  return dateString;
}

/**
 * @description Add leading zero if date (day, month) is under 10.
 */
export function makeTwoDigitDate(date: Date | number, unit: 'day' | 'month'): string {
  const value = (() => {
    if (unit === 'day') return typeof date === 'number' ? `${date}` : `${date.getDate()}`;
    if (unit === 'month') return typeof date === 'number' ? `${date}` : `${date.getMonth()}`;
    return `${date}`; //throw new InvalidDateUnitError(); // TODO
  })();

  return value.length === 1 ? `0${value}` : value;
}

/**
 * @description TODO
 */
export function getTimestamp() {
  return new Date().toUTCString();
}

/**
 * @description TODO
 */
export function getDateFromTimestamp(timestamp: string) {
  const fixedTimestamp = timestamp.length === 10 ? timestamp + '000' : timestamp; // Convert from seconds to milliseconds
  return new Date(parseInt(fixedTimestamp)).toISOString().substring(0, 10);
}
