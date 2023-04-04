import { EventDto } from './Event';

/**
 * @description Parsers interpret incoming events into one the refined event types.
 */
export interface Parser {
  /**
   * @description Normalize the incoming type of event into the three
   * supported categories: `change`, `deployment`, or `incident`.
   */
  getEventType(eventTypeInput: EventTypeInput): Promise<string>;

  /**
   * @description Get payload fields from the right places.
   */
  getPayload(payloadInput: PayloadInput): Promise<EventDto>;

  /**
   * @description Get the repository name.
   */
  getRepoName(body?: Record<string, any>): string;
}

export type EventTypeInput = {
  body?: Record<string, any>;
  headers?: Record<string, any>;
};

export type PayloadInput = EventTypeInput;
