/**
 * @description Used when an unknown event type is encountered.
 */
export class UnknownEventType extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnknownEventType';
    console.error(message);
  }
}
