/**
 * @description Used when a queried date is out of range.
 */
export class OutOfRangeQueryError extends Error {
  constructor() {
    super();
    this.name = 'OutOfRangeQueryError';
    const message = 'The queried date is out of range.';
    this.message = message;
    console.error(message);
  }
}
