import { v4 as uuidv4 } from 'uuid';

import { EventDto } from '../../interfaces/Event';
import { EventTypeInput, Parser, PayloadInput } from '../../interfaces/Parser';
import { UnknownEventType } from '../errors/UnknownEventType';

/**
 * @description Parser adapted for "direct call" use cases, when not using a CI system or similar.
 */
export class DirectParser implements Parser {
  /**
   * @description Normalize the incoming type of event into the three
   * supported categories: `change`, `deployment`, or `incident`.
   */
  public getEventType(eventTypeInput: EventTypeInput): string {
    const { body } = eventTypeInput;
    const eventType = body && body.eventType;
    if (eventType === 'change' || eventType === 'deployment' || eventType === 'incident')
      return eventType;
    throw new UnknownEventType('Unknown event type seen in "getEventType()"!');
  }

  /**
   * @description Create payload data, as these won't exist on the original material.
   */
  public getPayload(payloadInput?: PayloadInput): EventDto {
    const body = payloadInput ? payloadInput.body : undefined;
    return {
      eventTime: Date.now().toString(),
      timeCreated: Date.now().toString(),
      id: uuidv4(),
      message: body ? JSON.stringify(body) : ''
    };
  }

  /**
   * @description Get the product name.
   */
  public getProductName(body: any): string {
    return (body && body?.['product']) || '';
  }
}
