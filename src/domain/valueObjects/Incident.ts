import { Incident } from '../interfaces/Incident';

import { MissingProductValueError } from '../errors/MissingProductValueError';
import { MissingEventTypeValueError } from '../errors/MissingEventTypeValueError';
import { MissingIdValueError } from '../errors/MissingIdValueError';

/**
 * @description Factory function to make an Incident value object.
 */
export function makeIncident(incident: any): Incident {
  const incidentConcrete = new IncidentConcrete(incident);
  return incidentConcrete.getData();
}

class IncidentConcrete implements Incident {
  product: string;
  eventType: string;
  id: string;
  timeCreated: string;
  timeResolved: string;
  title: string;

  constructor(incident: any) {
    const { product, eventType, id, timeCreated, timeResolved, title } = incident;

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
    this.eventType = eventType;
    this.id = id;
    this.timeCreated = timeCreated.toString();
    this.timeResolved = timeResolved.toString();
    this.title = title;
  }

  public getData() {
    return {
      product: this.product,
      eventType: this.eventType,
      id: this.id,
      timeCreated: this.timeCreated,
      timeResolved: this.timeResolved,
      title: this.title
    };
  }
}
