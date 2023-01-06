/**
 * @description Used when an unknown event type is encountered.
 */
export class UnknownEventTypeError extends Error {
  constructor() {
    super();
    this.name = 'UnknownEventTypeError';
    const message = 'Unknown event type seen in getEventType()!';
    this.message = message;
    console.error(message);
  }
}
