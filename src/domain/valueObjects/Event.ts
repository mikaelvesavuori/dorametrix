import { getCurrentDate } from 'chrono-utils';

import { Event, EventType } from '../../interfaces/Event';
import { Change } from '../../interfaces/Change';
import { Parser } from '../../interfaces/Parser';

/**
 * @description Create the main type of event, the titular `Event` which
 * can be reassembled to other, more specific types or "value objects" later.
 */
export async function makeEvent(
  parser: Parser,
  body: Record<string, any>,
  headers: Record<string, any>
): Promise<Event> {
  const eventConcrete = new EventConcrete(parser, body, headers);
  await EventConcrete.populate(eventConcrete, parser, body, headers);
  return eventConcrete.getDTO();
}

class EventConcrete {
  repo = '';
  date: string;
  eventType = '';
  id = '';
  changes: Change[] = new Array<Change>(0);
  eventTime = '';
  timeCreated = '';
  timeResolved = '';
  title = '';
  message = '';

  constructor(parser: Parser, body: Record<string, any>, headers: Record<string, any>) {
    this.date = getCurrentDate(true);
    EventConcrete.populate(this, parser, body, headers);
  }

  static async populate(
    event: EventConcrete,
    parser: Parser,
    body: Record<string, any>,
    headers: Record<string, any>
  ): Promise<EventConcrete> {
    const eventType = await parser.getEventType({ body, headers });

    const repo = await parser.getRepoName(body);

    event.repo = repo;
    event.date = getCurrentDate(true);
    event.eventType = eventType;
    event.changes = body.changes || [];

    const { id, eventTime, timeCreated, timeResolved, title, message } = await parser.getPayload({
      body,
      headers
    });

    event.id = id;
    event.eventTime = eventTime.toString();
    event.timeCreated = timeCreated.toString();
    event.timeResolved = timeResolved ? timeResolved.toString() : '';
    event.title = title || '';
    event.message = message || '';

    return event;
  }

  static async create(
    parser: Parser,
    body: Record<string, any>,
    headers: Record<string, any>
  ): Promise<EventConcrete> {
    const event = new EventConcrete(parser, body, headers);
    return EventConcrete.populate(event, parser, body, headers);
  }

  public getDTO(): Event {
    return Object.freeze({
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
    });
  }
}
