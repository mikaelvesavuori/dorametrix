import { MissingTimeError } from '../../application/errors/MissingTimeError';

/**
 * @description Convert a regular date to (JS) Unix timestamp.
 */
export function convertDateToUnixTimestamp(time: Date | string): string {
  if (!time) throw new MissingTimeError();
  return new Date(time).getTime().toString();
}
