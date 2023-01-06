import { Deployment, DeploymentChange } from '../../interfaces/Deployment';
import { Event } from '../../interfaces/Event';

import { getCurrentDate } from '../../infrastructure/frameworks/date';

import { MissingRepoNameError } from '../../application/errors/MissingRepoNameError';
import { MissingEventTypeValueError } from '../../application/errors/MissingEventTypeValueError';
import { MissingIdValueError } from '../../application/errors/MissingIdValueError';

/**
 * @description Factory function to make a Deployment value object.
 */
export function makeDeployment(deploymentEvent: Event): Deployment {
  const deploymentConcrete = new DeploymentConcrete(deploymentEvent);
  return deploymentConcrete.getDTO();
}

class DeploymentConcrete {
  repo: string;
  date: string;
  eventType: string;
  id: string;
  changes: DeploymentChange[];
  timeCreated: string;

  constructor(deploymentEvent: Event) {
    const { repo, id, eventType, timeCreated, changes } = deploymentEvent;

    if (!repo)
      throw new MissingRepoNameError(
        'Missing "repo" when trying to create a Deployment value object!'
      );
    if (!eventType)
      throw new MissingEventTypeValueError(
        'Missing "eventType" when trying to create a Deployment value object!'
      );
    if (!id)
      throw new MissingIdValueError(
        'Missing "id" when trying to create a Deployment value object!'
      );

    this.repo = repo;
    this.date = getCurrentDate(true);
    this.eventType = eventType;
    this.id = id;
    this.changes = changes || [];
    this.timeCreated = timeCreated.toString();
  }

  public getDTO(): Deployment {
    return {
      repo: this.repo,
      date: this.date,
      eventType: this.eventType,
      id: this.id,
      changes: this.changes,
      timeCreated: this.timeCreated
    };
  }
}
