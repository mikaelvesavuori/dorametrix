import { randomBytes } from 'crypto';

import { EventDto } from '../../interfaces/Event';
import { EventTypeInput, Parser, PayloadInput } from '../../interfaces/Parser';

import { UnknownEventTypeError } from '../errors/errors';

/**
 * @description Parser adapted for "direct call" use cases, when not using a CI system or similar.
 */
export class DirectParser implements Parser {
  /**
   * @description Normalize the incoming type of event into the three
   * supported categories: `change`, `deployment`, or `incident`.
   */
  public async getEventType(eventTypeInput: EventTypeInput): Promise<string> {
    const { body } = eventTypeInput;
    const eventType = body && body.eventType;
    if (eventType === 'change' || eventType === 'deployment' || eventType === 'incident')
      return eventType;
    throw new UnknownEventTypeError();
  }

  /**
   * @description Create payload data, as these won't exist on the original material.
   */
  public async getPayload(payloadInput?: PayloadInput): Promise<EventDto> {
    const body = payloadInput ? payloadInput.body : undefined;
    const date = Date.now().toString();

    return {
      eventTime: date,
      timeCreated: date,
      /**
       * Create a 40-character string similar to SHA1 to
       * replicate the appearance of a Git commit ID.
       */
      id: randomBytes(20).toString('hex'),
      message: body ? JSON.stringify(body) : ''
    };
  }

  /**
   * @description Get the repository name.
   */
  public getRepoName(body: Record<string, any>): string {
    return (body && body?.['repo']) || '';
  }
}
