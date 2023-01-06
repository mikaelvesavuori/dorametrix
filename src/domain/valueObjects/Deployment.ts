import { Deployment } from '../../interfaces/Deployment';
import { Change } from '../../interfaces/Change';
import { Event } from '../../interfaces/Event';

import { getCurrentDate } from '../../infrastructure/frameworks/date';

import { MissingProductValueError } from '../../application/errors/MissingProductValueError';
import { MissingEventTypeValueError } from '../../application/errors/MissingEventTypeValueError';
import { MissingIdValueError } from '../../application/errors/MissingIdValueError';

/**
 * @description Factory function to make a Deployment value object.
 */
export function makeDeployment(deploymentEvent: Event): Deployment {
  const deploymentConcrete = new DeploymentConcrete(deploymentEvent);
  return deploymentConcrete.getData();
}

class DeploymentConcrete {
  product: string;
  date: string;
  eventType: string;
  id: string;
  changes: Change[];
  timeCreated: string;

  constructor(deploymentEvent: Event) {
    const { product, id, eventType, timeCreated, changes } = deploymentEvent;

    if (!product)
      throw new MissingProductValueError(
        'Missing "product" when trying to create a Deployment value object!'
      );
    if (!eventType)
      throw new MissingEventTypeValueError(
        'Missing "eventType" when trying to create a Deployment value object!'
      );
    if (!id)
      throw new MissingIdValueError(
        'Missing "id" when trying to create a Deployment value object!'
      );

    this.product = product;
    this.date = getCurrentDate(true);
    this.eventType = eventType;
    this.id = id;
    this.changes = changes || [];
    this.timeCreated = timeCreated.toString();
  }

  public getData() {
    return {
      product: this.product,
      date: this.date,
      eventType: this.eventType,
      id: this.id,
      changes: this.changes,
      timeCreated: this.timeCreated
    };
  }
}
