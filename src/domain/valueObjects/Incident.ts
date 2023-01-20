import { getCurrentDate } from 'chrono-utils';

import { Incident } from '../../interfaces/Incident';
import { Event } from '../../interfaces/Event';

import {
  MissingRepoNameError,
  MissingEventTypeValueError,
  MissingIdValueError
} from '../../application/errors/errors';

/**
 * @description Factory function to make an Incident value object.
 */
export function makeIncident(incidentEvent: Event): Incident {
  const incidentConcrete = new IncidentConcrete(incidentEvent);
  return incidentConcrete.getDTO();
}

class IncidentConcrete implements Incident {
  repo: string;
  date: string;
  eventType: string;
  id: string;
  timeCreated: string;
  timeResolved: string;
  title: string;

  constructor(incidentEvent: Event) {
    const { repo, eventType, id, timeCreated, timeResolved, title } = incidentEvent;

    if (!repo)
      throw new MissingRepoNameError(
        'Missing "repo" when trying to create an Incident value object!'
      );
    if (!eventType)
      throw new MissingEventTypeValueError(
        'Missing "eventType" when trying to create an Incident value object!'
      );
    if (!id)
      throw new MissingIdValueError('Missing "id" when trying to create an Incident value object!');

    this.repo = repo;
    this.date = getCurrentDate(true);
    this.eventType = eventType;
    this.id = id;
    this.timeCreated = timeCreated.toString();
    this.timeResolved = timeResolved.toString();
    this.title = title;
  }

  public getDTO(): Incident {
    return Object.freeze({
      repo: this.repo,
      date: this.date,
      eventType: this.eventType,
      id: this.id,
      timeCreated: this.timeCreated,
      timeResolved: this.timeResolved,
      title: this.title
    });
  }
}
