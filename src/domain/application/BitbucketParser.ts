import { EventDto } from '../interfaces/Event';
import { Parser, EventTypeInput, PayloadInput } from '../interfaces/Parser';

import { MissingEventTimeError } from '../errors/MissingEventTimeError';
import { MissingEventError } from '../errors/MissingEventError';
import { MissingIdError } from '../errors/MissingIdError';
import { UnknownEventType } from '../errors/UnknownEventType';

import { convertDateToUnixTimestamp } from '../../frameworks/convertDateToUnixTimestamp';

/**
 * @description Parser adapted for Bitbucket.
 */
export class BitbucketParser implements Parser {
  /**
   * @description Normalize the incoming type of event into the three
   * supported categories: `change`, `deployment`, or `incident`.
   */
  public getEventType(eventTypeInput: EventTypeInput): string {
    const { headers } = eventTypeInput;
    const eventType = headers['X-Event-Key'] || headers['x-event-key'];
    if (eventType === 'repo:push') return 'change';
    if (eventType && eventType.startsWith('issue:')) return 'incident';
    throw new UnknownEventType('Unknown event type seen in "getEventType()"!');
  }

  /**
   * @description Get payload fields from the right places.
   */
  public getPayload(payloadInput: PayloadInput): EventDto {
    const { body, headers } = payloadInput;

    const event = (() => {
      const eventKeyHeader = headers['X-Event-Key'] || headers['x-event-key'];
      if (eventKeyHeader === 'issue:created') return 'opened';
      if (eventKeyHeader === 'issue:updated') {
        if (body?.['changes']?.['status']?.['new'] === 'resolved') return 'closed';
        if (body?.['changes']?.['kind']?.['new'] === 'bug') return 'labeled';
        if (body?.['changes']?.['kind']?.['new'] !== 'bug') return 'unlabeled';
      }
      return eventKeyHeader;
    })();

    if (!event) throw new MissingEventError('Missing event in headers, in "getPayload()"!');

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
  private handlePush(body: any) {
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
  private handleOpenedLabeled(body: any) {
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
  private handleClosedUnlabeled(body: any) {
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
   * @description Get the product name.
   */
  public getProductName(body: any): string {
    return (body && body?.['repository']?.['project']?.['name']) || '';
  }
}
