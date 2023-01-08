/**
 * @description Used when an ID or event type is missing when creating events.
 */
export class MissingEventMetadataError extends Error {
  constructor() {
    super();
    this.name = 'MissingEventMetadataError';
    const message = 'Missing ID and/or eventType in createEvent()!';
    this.message = message;
    console.error(message);
  }
}
