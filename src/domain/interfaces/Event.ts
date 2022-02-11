/**
 * @description The Event is the primitive, raw event type.
 */
export interface Event {
  /**
   * @description The type of event that has happened. Can be
   * `change`, `deployment`, or `incident`.
   */
  eventType: EventType;

  /**
  /**
   * @description The product name, such as the name of the API
   * or Git repository that we are measuring metrics for.
   */
  product: string;

  /**
   * @description The underlying event ID, such as the event
   * ID from GitHub.
   */
  id: string;

  /**
   * @description Optional. Array of changes. Applicable if
   * `eventType` is `deployment`. Will stay empty otherwise.
   */
  changes: string[];

  /**
   * @description Unix timestamp of event time.
   */
  eventTime: string;

  /**
   * @description Unix timestamp of creation of original event.
   */
  timeCreated: string;

  /**
   * @description Optional. Unix timestamp when an incident is
   * handled. Only applicable if `eventType` is `incident`.
   * Will stay empty otherwise.
   */
  timeResolved: string;

  /**
   * @description Optional. Used for incident titles.
   */
  title: string;

  /**
   * @description The input body serialized to a string.
   */
  message: string;
}

/**
 * @description Can be one of the three refined event types.
 */
export type EventType = 'change' | 'deployment' | 'incident';

/**
 * @description Used when transferring the basic, raw event.
 */
export type EventDto = {
  id: string;
  eventTime: string;
  timeCreated: string;
  timeResolved?: string;
  title?: string;
  message: string;
};
