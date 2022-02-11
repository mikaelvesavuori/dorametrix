/**
 * @description Used when something is missing time.
 */
export class MissingTimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingTimeError';
    console.error(message);
  }
}
