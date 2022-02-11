/**
 * @description Used when a value object is missing the `eventType` property/value.
 */
export class MissingEventTypeValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingEventTypeValueError';
    console.error(message);
  }
}
