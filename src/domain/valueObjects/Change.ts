import { Change } from '../../interfaces/Change';
import { Event } from '../../interfaces/Event';

import { getCurrentDate } from '../../infrastructure/frameworks/date';

import { MissingProductValueError } from '../../application/errors/MissingProductValueError';
import { MissingEventTypeValueError } from '../../application/errors/MissingEventTypeValueError';
import { MissingIdValueError } from '../../application/errors/MissingIdValueError';

/**
 * @description Factory function to make a Change value object.
 */
export function makeChange(changeEvent: Event): Change {
  const changeConcrete = new ChangeConcrete(changeEvent);
  return changeConcrete.getDTO();
}

class ChangeConcrete {
  product: string;
  eventType: string;
  id: string;
  timeCreated: string;
  date: string;

  constructor(changeEvent: any) {
    const { product, eventType, id } = changeEvent;

    if (!product)
      throw new MissingProductValueError(
        'Missing "product" when trying to create a Change value object!'
      );
    if (!eventType)
      throw new MissingEventTypeValueError(
        'Missing "eventType" when trying to create a Change value object!'
      );
    if (!id)
      throw new MissingIdValueError('Missing "id" when trying to create a Change value object!');

    this.product = product;
    this.eventType = eventType;
    this.id = id;
    this.timeCreated = Date.now().toString();
    this.date = getCurrentDate(true);
  }

  public getDTO(): Change {
    return {
      product: this.product,
      eventType: this.eventType,
      id: this.id,
      timeCreated: this.timeCreated,
      date: this.date
    };
  }
}
