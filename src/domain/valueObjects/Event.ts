import { getCurrentDate } from 'chrono-utils';

import { Event, EventType } from '../../interfaces/Event';
import { Change } from '../../interfaces/Change';
import { Parser } from '../../interfaces/Parser';

/**
 * @description Create the main type of event, the titular `Event` which
 * can be reassembled to other, more specific types or "value objects" later.
 */
export function makeEvent(
  parser: Parser,
  body: Record<string, any>,
  headers: Record<string, any>
): Event {
  const eventConcrete = new EventConcrete(parser, body, headers);
  return eventConcrete.getDTO();
}

class EventConcrete {
  repo: string;
  date: string;
  eventType: string;
  id: string;
  changes: Change[];
  eventTime: string;
  timeCreated: string;
  timeResolved: string;
  title: string;
  message: string;

  constructor(parser: Parser, body: Record<string, any>, headers: Record<string, any>) {
    const eventType = parser.getEventType({ body, headers });
    const { id, eventTime, timeCreated, timeResolved, title, message } = parser.getPayload({
      body,
      headers
    });
    const repo = parser.getRepoName(body);

    this.repo = repo;
    this.date = getCurrentDate(true);
    this.eventType = eventType;
    this.id = id;
    this.changes = body.changes || [];
    this.eventTime = eventTime.toString();
    this.timeCreated = timeCreated.toString();
    this.timeResolved = timeResolved ? timeResolved.toString() : '';
    this.title = title || '';
    this.message = message || '';
  }

  public getDTO(): Event {
    return {
      repo: this.repo,
      date: this.date,
      eventType: this.eventType as EventType,
      id: this.id,
      changes: this.changes,
      eventTime: this.eventTime,
      timeCreated: this.timeCreated,
      timeResolved: this.timeResolved,
      title: this.title,
      message: this.message
    };
  }
}
