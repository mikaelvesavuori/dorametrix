import { EventDto } from '../interfaces/Event';

/**
 * @description Parsers interpret incoming events into one the refined event types.
 */
export interface Parser {
  /**
   * @description Normalize the incoming type of event into the three
   * supported categories: `change`, `deployment`, or `incident`.
   */
  getEventType(eventTypeInput: EventTypeInput): string;

  /**
   * @description Get payload fields from the right places.
   */
  getPayload(payloadInput: PayloadInput): EventDto;

  /**
   * @description Get the product name.
   */
  getProductName(body?: any): string;
}

export type EventTypeInput = {
  body?: any;
  headers?: any;
};

export type PayloadInput = EventTypeInput;
