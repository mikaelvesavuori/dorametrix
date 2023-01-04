/**
 * @description Used when something is missing time.
 */
export class MissingTimeError extends Error {
  constructor() {
    super();
    this.name = 'MissingTimeError';
    const message = 'Missing time in "convertDateToUnixTimestamp"!';
    this.message = message;
    console.error(message);
  }
}
