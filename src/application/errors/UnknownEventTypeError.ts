/**
 * @description Used when an unknown event type is encountered.
 */
export class UnknownEventTypeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnknownEventTypeError';
    console.error(message);
  }
}
