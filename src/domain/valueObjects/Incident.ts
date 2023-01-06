import { Incident } from '../../interfaces/Incident';
import { Event } from '../../interfaces/Event';

import { getCurrentDate } from '../../infrastructure/frameworks/date';

import { MissingProductValueError } from '../../application/errors/MissingProductValueError';
import { MissingEventTypeValueError } from '../../application/errors/MissingEventTypeValueError';
import { MissingIdValueError } from '../../application/errors/MissingIdValueError';

/**
 * @description Factory function to make an Incident value object.
 */
export function makeIncident(incidentEvent: Event): Incident {
  const incidentConcrete = new IncidentConcrete(incidentEvent);
  return incidentConcrete.getData();
}

class IncidentConcrete implements Incident {
  product: string;
  date: string;
  eventType: string;
  id: string;
  timeCreated: string;
  timeResolved: string;
  title: string;

  constructor(incidentEvent: Event) {
    const { product, eventType, id, timeCreated, timeResolved, title } = incidentEvent;

    if (!product)
      throw new MissingProductValueError(
        'Missing "product" when trying to create an Incident value object!'
      );
    if (!eventType)
      throw new MissingEventTypeValueError(
        'Missing "eventType" when trying to create an Incident value object!'
      );
    if (!id)
      throw new MissingIdValueError('Missing "id" when trying to create an Incident value object!');

    this.product = product;
    this.date = getCurrentDate(true);
    this.eventType = eventType;
    this.id = id;
    this.timeCreated = timeCreated.toString();
    this.timeResolved = timeResolved.toString();
    this.title = title;
  }

  public getData() {
    return {
      product: this.product,
      date: this.date,
      eventType: this.eventType,
      id: this.id,
      timeCreated: this.timeCreated,
      timeResolved: this.timeResolved,
      title: this.title
    };
  }
}
