import { EventDto } from '../../interfaces/Event';
import { Parser, EventTypeInput, PayloadInput } from '../../interfaces/Parser';
import { UnknownEventTypeError } from '../errors/UnknownEventTypeError';
import { MissingEventTimeError } from '../errors/MissingEventTimeError';
import { MissingEventError } from '../errors/MissingEventError';
import { MissingIdError } from '../errors/MissingIdError';

import { convertDateToUnixTimestamp } from '../../infrastructure/frameworks/convertDateToUnixTimestamp';

/**
 * @description Parser adapted for GitHub.
 */
export class GitHubParser implements Parser {
  /**
   * @description Normalize the incoming type of event into the three
   * supported categories: `change`, `deployment`, or `incident`.
   */
  // @ts-ignore
  public getEventType(eventTypeInput: EventTypeInput): string {
    const { headers } = eventTypeInput;
    const eventType = headers?.['X-GitHub-Event'] || headers?.['x-github-event'];

    if (eventType === 'push') return 'change';
    if (eventType === 'issues') return 'incident';

    throw new UnknownEventTypeError('Unknown event type seen in "getEventType()"!');
  }

  /**
   * @description Get payload fields from the right places.
   */
  public getPayload(payloadInput: PayloadInput): EventDto {
    const { body, headers } = payloadInput;
    const event = (() => {
      // `body.action` will contain any specifics, so if it exists that's the one we want to use
      if (body?.action) return body.action;
      return headers?.['X-GitHub-Event'] || headers?.['x-github-event'];
    })();
    if (!event) throw new MissingEventError('Missing event in headers, in "getPayload()"!');

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
  private handlePush(body: any) {
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
  private handleOpenedLabeled(body: any) {
    const timeCreated = body?.['issue']?.['created_at'];
    if (!timeCreated)
      throw new MissingEventTimeError('Missing expected timestamp in handleOpenedLabeled()!');

    const id = body?.['issue']?.['id'];
    if (!id) throw new MissingIdError('Missing ID in handleOpenedLabeled()!');

    const title = body?.['issue']?.['title'] || '';

    // Check for incident label
    const labels = body?.['issue']?.['labels'];
    if (labels && labels.length > 0) {
      const incidentLabels = labels.filter((label: any) => label.name === 'incident');
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

    // If we don't have any incident labels it's time to eject
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
  private handleClosedUnlabeled(body: any) {
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
  public getRepoName(body: any): string {
    return (body && body?.['repository']?.['full_name']) || '';
  }
}
