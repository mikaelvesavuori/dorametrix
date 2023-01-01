/**
 * @description Used when headers are missing the event time.
 */
export class MissingEventTimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingEventTimeError';
    console.error(message);
  }
}
