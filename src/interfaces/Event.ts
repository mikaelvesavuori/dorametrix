/**
 * @description The Event is the primitive, raw event type.
 */
export interface Event {
  /**
   * @description The type of event that has happened.
   * Can be `change`, `deployment`, or `incident`.
   */
  eventType: EventType;

  /**
   * @description The Git repository name, such as the name of the API
   * or Git repository that we are measuring metrics for.
   * @example `SOMEORG/SOMEREPO`
   */
  repo: string;

  /**
   * @description The underlying ID taken from the main/head commit ID
   * which is a 40-character SHA1 string.
   * @example `387aa161993865e33b2e687ce199c25dde76a805`
   */
  id: string;

  /**
   * @description SHA of commit that led to this deployment.
   * Applicable only if `eventType` is `deployment`, will stay empty otherwise.
   * @note Only for deployments.
   */
  changeSha: string;

  /**
   * @description Unix timestamp of event time.
   */
  eventTime: string;

  /**
   * @description Unix timestamp of creation of original event.
   */
  timeCreated: string;

  /**
   * @description Unix timestamp when an incident is
   * handled. Only applicable if `eventType` is `incident`.
   * Will stay empty otherwise.
   */
  timeResolved: string;

  /**
   * @description Used for incident titles.
   * @note Only for incidents.
   */
  title: string;

  /**
   * @description The input body serialized to a string.
   */
  message: string;

  /**
   * @description Date of event.
   */
  date: string;
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
