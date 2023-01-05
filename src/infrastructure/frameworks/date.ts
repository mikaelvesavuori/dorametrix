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
  const year = date.getUTCFullYear();

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
 * @description Return the date of the day before today in `YYYY-MM-DD` format.
 *
 * The `noDashes` option will strip any dashes between days, months, etc.
 *
 * @example `2022-11-20`
 * @example `20221120`
 */
export function getDateBefore(noDashes = false): string {
  const today = new Date(getCurrentDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const dateString = yesterday.toISOString().split('T')[0];

  if (noDashes) return dateString.replaceAll('-', '');
  return dateString;
}

/**
 * @description TODO
 */
export function getCurrentUTCTimestamp() {
  return new Date().toUTCString();
}

/**
 * @description TODO
 */
export function getDateFromTimestamp(timestamp: string) {
  const fixedTimestamp = timestamp.length === 10 ? timestamp + '000' : timestamp; // Convert from seconds to milliseconds
  return new Date(parseInt(fixedTimestamp)).toISOString().substring(0, 10);
}

/**
 * @description Returns the first date in the current month in `YYYY-MM-DD` format.
 * @example `2022-12-01`
 */
export function getFirstDateInCurrentMonth(): string {
  const date = new Date();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  return `${year}-${month}-01`;
}

/**
 * @description Return the last date in the current month in `YYYY-MM-DD` format.
 * @example `2022-12-31`
 */
export function getLastDateInCurrentMonth(): string {
  const date = new Date();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();
  const day = new Date(year, month).toISOString().split('T')[0].substring(8);

  return `${year}-${month}-${day}`;
}
