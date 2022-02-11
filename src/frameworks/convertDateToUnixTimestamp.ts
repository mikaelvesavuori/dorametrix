import { MissingTimeError } from '../domain/errors/MissingTimeError';

/**
 * @description Convert a regular date to (JS) Unix timestamp.
 */
export function convertDateToUnixTimestamp(time: Date | string): string {
  if (!time) throw new MissingTimeError('Missing time in "convertDateToUnixTimestamp"!');
  return Math.floor(new Date(time).getTime()).toString();
}
