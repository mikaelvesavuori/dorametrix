import { convertDateToUnixTimestamp } from 'chrono-utils';

import { EventDto } from '../../interfaces/Event';
import { Parser, EventTypeInput, PayloadInput } from '../../interfaces/Parser';

import {
  MissingEventTimeError,
  MissingEventError,
  MissingIdError,
  UnknownEventTypeError
} from '../errors/errors';

/**
 * @description Parser adapted for Bitbucket.
 */
export class BitbucketParser implements Parser {
  /**
   * @description Normalize the incoming event into one of the three
   * supported types: `change`, `deployment`, or `incident`.
   */
  public async getEventType(eventTypeInput: EventTypeInput): Promise<string> {
    const { headers } = eventTypeInput;
    const eventType = headers?.['X-Event-Key'] || headers?.['x-event-key'];
    if (eventType === 'repo:push') return 'change';
    if (eventType && eventType.startsWith('issue:')) return 'incident';
    throw new UnknownEventTypeError();
  }

  /**
   * @description Get payload fields from the right places.
   */
  public async getPayload(payloadInput: PayloadInput): Promise<EventDto> {
    const { headers } = payloadInput;
    const body = payloadInput.body || {};

    const event = (() => {
      const eventKeyHeader = headers?.['X-Event-Key'] || headers?.['x-event-key'];
      if (eventKeyHeader === 'issue:created') return 'opened';
      if (eventKeyHeader === 'issue:updated') {
        if (body?.['changes']?.['status']?.['new'] === 'resolved') return 'closed';
        if (body?.['changes']?.['kind']?.['new'] === 'bug') return 'labeled';
        if (body?.['changes']?.['kind']?.['new'] !== 'bug') return 'unlabeled';
      }
      return eventKeyHeader;
    })();

    if (!event) throw new MissingEventError();

    switch (event) {
      case 'repo:push':
        return this.handlePush(body);
      case 'opened':
      case 'labeled':
        return this.handleOpenedLabeled(body);
      case 'closed':
      case 'unlabeled':
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
    const timeCreated = body?.['push']?.['changes']?.[0]?.['old']?.['target']?.['date'];
    if (!timeCreated)
      throw new MissingEventTimeError('Missing expected timestamp in handlePush()!');

    const id = body?.['push']?.['changes']?.[0]?.['new']?.['target']?.['hash'];
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
    const timeCreated = body?.['issue']?.['created_on'];
    if (!timeCreated)
      throw new MissingEventTimeError('Missing expected timestamp in handleOpenedLabeled()!');

    const id = body?.['issue']?.['id'];
    if (!id) throw new MissingIdError('Missing ID in handleOpenedLabeled()!');

    const title = body?.['issue']?.['title'] || '';

    return {
      eventTime: Date.now().toString(),
      timeCreated: convertDateToUnixTimestamp(timeCreated),
      timeResolved: '',
      id: id.toString(),
      title,
      message: JSON.stringify(body)
    };
  }

  /**
   * @description Utility to resolve an incident.
   */
  private handleClosedUnlabeled(body: Record<string, any>) {
    const timeCreated = body?.['issue']?.['created_on'];
    if (!timeCreated)
      throw new MissingEventTimeError('Missing expected timestamp in handleClosedUnlabeled()!');

    const timeResolved = body?.['issue']?.['updated_on'];
    if (!timeResolved)
      throw new MissingEventTimeError(
        'Missing expected updated/resolved timestamp in handleClosedUnlabeled()!'
      );

    const id = body?.['issue']?.['id'];
    if (!id) throw new MissingIdError('Missing ID in handleClosedUnlabeled()!');

    const title = body?.['issue']?.['title'] || '';

    return {
      eventTime: Date.now().toString(),
      timeCreated: convertDateToUnixTimestamp(timeCreated),
      timeResolved: convertDateToUnixTimestamp(timeResolved),
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
