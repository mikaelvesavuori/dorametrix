import { convertDateToUnixTimestamp } from 'chrono-utils';

import { EventDto } from '../../interfaces/Event';
import { Parser, EventTypeInput, PayloadInput } from '../../interfaces/Parser';
import {
  UnknownEventTypeError,
  MissingEventTimeError,
  MissingEventError,
  MissingIdError
} from '../errors/errors';

/**
 * @description Parser adapted for GitHub.
 */
export class GitHubParser implements Parser {
  /**
   * @description Normalize the incoming event into one of the three
   * supported types: `change`, `deployment`, or `incident`.
   */
  // @ts-ignore
  public async getEventType(eventTypeInput: EventTypeInput): Promise<string> {
    const { headers } = eventTypeInput;
    const eventType = headers?.['X-GitHub-Event'] || headers?.['x-github-event'];

    if (eventType === 'push') return 'change';
    if (eventType === 'issues') return 'incident';

    throw new UnknownEventTypeError();
  }

  /**
   * @description Get payload fields from the right places.
   */
  public async getPayload(payloadInput: PayloadInput): Promise<EventDto> {
    const { headers } = payloadInput;
    const body = payloadInput.body || {};

    const event = (() => {
      // `body.action` will contain any specifics, so if it exists that's the one we want to use
      if (body?.action) return body.action;
      return headers?.['X-GitHub-Event'] || headers?.['x-github-event'];
    })();
    if (!event) throw new MissingEventError();

    switch (event) {
      case 'push':
        return this.handlePush(body);
      case 'opened':
      case 'labeled':
        return this.handleOpenedLabeled(body);
      case 'closed':
      case 'unlabeled':
      case 'deleted':
        return this.handleClosedUnlabeled(body);
      default:
        return {
          eventTime: 'UNKNOWN',
          timeCreated: 'UNKNOWN',
          id: 'UNKNOWN',
          message: 'UNKNOWN'
        };
    }
  }

  /**
   * @description Utility to create a change.
   */
  private handlePush(body: Record<string, any>) {
    const timeCreated = body?.['head_commit']?.['timestamp'];
    if (!timeCreated)
      throw new MissingEventTimeError('Missing expected timestamp in handlePush()!');
    const id = body?.['head_commit']?.['id'];
    if (!id) throw new MissingIdError('Missing ID in handlePush()!');

    return {
      eventTime: Date.now().toString(),
      timeCreated: convertDateToUnixTimestamp(timeCreated),
      id: id.toString(),
      message: JSON.stringify(body)
    };
  }

  /**
   * @description Utility to create an incident.
   */
  private handleOpenedLabeled(body: Record<string, any>) {
    const timeCreated = body?.['issue']?.['created_at'];
    if (!timeCreated)
      throw new MissingEventTimeError('Missing expected timestamp in handleOpenedLabeled()!');

    const id = body?.['issue']?.['id'];
    if (!id) throw new MissingIdError('Missing ID in handleOpenedLabeled()!');

    const title = body?.['issue']?.['title'] || '';

    // Check for incident label
    const labels = body?.['issue']?.['labels'];
    if (labels && labels.length > 0) {
      const incidentLabels = labels.filter(
        (label: Record<string, any>) => label.name === 'incident' || label.name === 'bug'
      );
      if (incidentLabels.length > 0)
        return {
          eventTime: Date.now().toString(),
          timeCreated: convertDateToUnixTimestamp(timeCreated),
          timeResolved: '',
          id: id.toString(),
          title,
          message: JSON.stringify(body)
        };
    }

    // If we don't have any bug/incident labels it's time to eject
    return {
      eventTime: '',
      timeCreated: '',
      timeResolved: '',
      id: '',
      title: '',
      message: ''
    };
  }

  /**
   * @description Utility to resolve an incident.
   */
  private handleClosedUnlabeled(body: Record<string, any>) {
    const timeCreated = body?.['issue']?.['created_at'];
    if (!timeCreated)
      throw new MissingEventTimeError('Missing expected timestamp in handleClosedUnlabeled()!');

    const timeResolved = body?.['issue']?.['closed_at'] || body?.['issue']?.['updated_at']; // Use "updated_at" for unlabeled
    if (!timeResolved)
      throw new MissingEventTimeError(
        'Missing expected updated/resolved in handleClosedUnlabeled()!'
      );

    const id = body?.['issue']?.['id'];
    if (!id) throw new MissingIdError('Missing ID in handleClosedUnlabeled()!');

    const title = body?.['issue']?.['title'] || '';

    return {
      eventTime: Date.now().toString(),
      timeCreated: convertDateToUnixTimestamp(timeCreated),
      timeResolved: timeResolved ? convertDateToUnixTimestamp(timeResolved) : Date.now().toString(),
      id: id.toString(),
      title,
      message: JSON.stringify(body)
    };
  }

  /**
   * @description Get the repository name.
   */
  public getRepoName(body: Record<string, any>): string {
    return (body && body?.['repository']?.['full_name']) || '';
  }
}
