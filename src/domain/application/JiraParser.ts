import { EventDto } from '../interfaces/Event';
import { Parser, PayloadInput } from '../interfaces/Parser';

import { MissingEventTimeError } from '../errors/MissingEventTimeError';
import { MissingEventError } from '../errors/MissingEventError';
import { MissingIdError } from '../errors/MissingIdError';

import { convertDateToUnixTimestamp } from '../../frameworks/convertDateToUnixTimestamp';

/**
 * @description Parser adapted for Jira.
 */
export class JiraParser implements Parser {
  /**
   * @description Jira only handles Incidents, so this simply returns a hard coded value for it.
   */
  public getEventType(): string {
    return 'incident';
  }

  /**
   * @description Get payload fields from the right places.
   */
  public getPayload(payloadInput: PayloadInput): EventDto {
    const { body } = payloadInput;

    const event = (() => {
      const eventType = body?.['issue_event_type_name'] || body?.['webhookEvent'];
      if (eventType === 'issue_created') return 'opened';
      if (eventType === 'issue_generic') {
        const resolved = body.changelog.items.filter(
          (item: any) => item.field === 'resolution' && item.toString === 'Done'
        );
        if (resolved.length > 0) return 'closed';
      }
      if (eventType === 'issue_updated') {
        if (body?.['changes']?.['status']?.['new'] === 'resolved') return 'closed';
        if (body?.['changelog']?.['items'][0]?.['toString'] === 'incident') return 'labeled';
        if (body?.['changelog']?.['items'][0]?.['toString'] !== 'incident') return 'unlabeled';
      }
      if (eventType === 'jira:issue_deleted') return 'deleted';
      return eventType;
    })();

    if (!event) throw new MissingEventError('Missing event in "getPayload()"!');

    switch (event) {
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
   * @description Utility to create an incident.
   */
  private handleOpenedLabeled(body: any) {
    const timeCreated = body?.['issue']?.['fields']?.['created'];
    if (!timeCreated)
      throw new MissingEventTimeError('Missing expected timestamp in handleOpenedLabeled()!');

    const id = body?.['issue']?.['id'];
    if (!id) throw new MissingIdError('Missing ID in handleOpenedLabeled()!');

    const title = body?.['issue']?.['fields']?.['summary'] || '';

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
    const timeCreated = body?.['issue']?.['fields']?.['created'];
    if (!timeCreated)
      throw new MissingEventTimeError('Missing expected timestamp in handleClosedUnlabeled()!');

    const timeResolved =
      body?.['issue']?.['fields']?.['resolutiondate'] || body?.['issue']?.['fields']?.['updated'];
    if (!timeResolved)
      throw new MissingEventTimeError(
        'Missing expected updated/resolved timestamp in handleClosedUnlabeled()!'
      );

    const id = body?.['issue']?.['id'];
    if (!id) throw new MissingIdError('Missing ID in handleClosedUnlabeled()!');

    const title = body?.['issue']?.['fields']?.['summary'] || '';

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
    return (body && body?.['issue']?.['fields']?.['project']?.['name']) || '';
  }
}
