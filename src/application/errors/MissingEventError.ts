/**
 * @description Used when headers are missing the event time.
 */
export class MissingEventError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingEventError';
    console.error(message);
  }
}
