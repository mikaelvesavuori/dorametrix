import { Event, EventType } from '../../interfaces/Event';
import { Parser } from '../../interfaces/Parser';

import { getCurrentDate } from '../../infrastructure/frameworks/date';

/**
 * @description Create the main type of event, the titular `Event` which
 * can be reassembled to other, more specific types/"value objects" later.
 */
export function makeEvent(parser: Parser, body: any, headers: any): Event {
  const eventConcrete = new EventConcrete(parser, body, headers);
  return eventConcrete.getData();
}

class EventConcrete {
  product: string;
  date: string;
  eventType: string;
  id: string;
  changes: string[];
  eventTime: string;
  timeCreated: string;
  timeResolved: string;
  title: string;
  message: string;

  constructor(parser: Parser, body: any, headers: any) {
    const eventType = parser.getEventType({ body, headers });
    const { id, eventTime, timeCreated, timeResolved, title, message } = parser.getPayload({
      body,
      headers
    });
    const product = parser.getProductName(body);

    this.product = product;
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

  public getData(): Event {
    return {
      product: this.product,
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
