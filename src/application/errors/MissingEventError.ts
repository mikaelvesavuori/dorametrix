/**
 * @description Used when headers are missing the event time.
 */
export class MissingEventError extends Error {
  constructor() {
    super();
    this.name = 'MissingEventError';
    const message = 'Missing event in getPayload()!';
    this.message = message;
    console.error(message);
  }
}
