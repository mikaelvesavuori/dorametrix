import { getCurrentDate } from 'chrono-utils';

import { Deployment } from '../../interfaces/Deployment';
import { Event } from '../../interfaces/Event';

import {
  MissingRepoNameError,
  MissingEventTypeValueError,
  MissingIdValueError
} from '../../application/errors/errors';

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
  changeSha: string;
  timeCreated: string;

  constructor(deploymentEvent: Event) {
    const { repo, id, eventType, timeCreated, changeSha } = deploymentEvent;

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
    this.changeSha = changeSha || '';
    this.timeCreated = timeCreated.toString();
  }

  public getDTO(): Deployment {
    return Object.freeze({
      repo: this.repo,
      date: this.date,
      eventType: this.eventType,
      id: this.id,
      changeSha: this.changeSha,
      timeCreated: this.timeCreated
    });
  }
}
