import { getCurrentDate } from 'chrono-utils';

import { Change } from '../../interfaces/Change';
import { Event } from '../../interfaces/Event';

import {
  MissingRepoNameError,
  MissingEventTypeValueError,
  MissingIdValueError
} from '../../application/errors/errors';

/**
 * @description Factory function to make a Change value object.
 */
export function makeChange(changeEvent: Event): Change {
  const changeConcrete = new ChangeConcrete(changeEvent);
  return changeConcrete.getDTO();
}

class ChangeConcrete {
  repo: string;
  eventType: string;
  id: string;
  timeCreated: string;
  date: string;

  constructor(changeEvent: Event) {
    const { repo, eventType, id } = changeEvent;

    if (!repo)
      throw new MissingRepoNameError('Missing "repo" when trying to create a Change value object!');
    if (!eventType)
      throw new MissingEventTypeValueError(
        'Missing "eventType" when trying to create a Change value object!'
      );
    if (!id)
      throw new MissingIdValueError('Missing "id" when trying to create a Change value object!');

    this.repo = repo;
    this.eventType = eventType;
    this.id = id;
    this.timeCreated = Date.now().toString();
    this.date = getCurrentDate(true);
  }

  public getDTO(): Change {
    return Object.freeze({
      repo: this.repo,
      eventType: this.eventType,
      id: this.id,
      timeCreated: this.timeCreated,
      date: this.date
    });
  }
}
