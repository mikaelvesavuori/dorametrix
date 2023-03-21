import { MikroLog } from 'mikrolog';
import fetch from 'cross-fetch';

import { metadataConfig } from '../../config/metadata';
import { convertDateToUnixTimestamp } from 'chrono-utils';

import { EventDto } from '../../interfaces/Event';
import { EventTypeInput, Parser, PayloadInput } from '../../interfaces/Parser';

import {
  MissingIdError,
  MissingShortcutFieldsError,
  ShortcutConfigurationError
} from '../errors/errors';

/**
 * @description Parser adapted for Shortcut.
 */
export class ShortcutParser implements Parser {
  shortcutIncidentLabelId: number;
  shortcutToken: string;
  repoName: string;
  logger: MikroLog;

  constructor() {
    /* istanbul ignore next */
    this.shortcutToken = process.env.SHORTCUT_TOKEN ?? '';
    if (this.shortcutToken === '' || this.shortcutToken === 'undefined')
      throw new ShortcutConfigurationError('SHORTCUT_TOKEN');

    /* istanbul ignore next */
    this.repoName = process.env.SHORTCUT_REPONAME ?? '';
    if (this.repoName === '' || this.repoName === 'undefined')
      throw new ShortcutConfigurationError('SHORTCUT_REPONAME');

    this.shortcutIncidentLabelId = global.parseInt(process.env.SHORTCUT_INCIDENT_LABEL_ID ?? '0');
    if (this.shortcutIncidentLabelId === 0 || isNaN(this.shortcutIncidentLabelId))
      throw new ShortcutConfigurationError('SHORTCUT_INCIDENT_LABEL_ID');

    this.logger = MikroLog.start({ metadataConfig: metadataConfig });
  }

  /**
   * @description Fetch original shortcut story
   */
  private async getStoryData(body: Record<string, any>): Promise<Record<string, any>> {
    const id: string = body?.['primary_id'];
    if (!id) throw new MissingIdError('Missing ID in getStoryData()!');

    let storyData: Record<string, any> = {};
    this.logger.info('fetching story ' + id);

    await fetch('https://api.app.shortcut.com/api/v3/stories/' + id, {
      headers: { 'Shortcut-Token': this.shortcutToken }
    }).then(async (response: any) => {
      storyData = await response.json();
    });

    if (!storyData || Object.keys(storyData).length == 0) throw new MissingShortcutFieldsError();
    return storyData;
  }

  /**
   * @description Scan webhook for labels matching the specified id
   */
  private hasLabelId(
    check: string,
    incidentLabelId: number,
    webhookActions: Record<string, any>
  ): boolean {
    for (const index in Object.keys(webhookActions)) {
      const action: Record<string, any> = Object.values(webhookActions)[index];

      //Check labels when a story is created
      if (action?.['label_ids']?.filter((label: number) => label == incidentLabelId).length > 0)
        return true;

      //Check labels when a story is changed
      if (
        action?.['changes']?.['label_ids']?.[check]?.filter(
          (label: number) => label == incidentLabelId
        ).length > 0
      )
        return true;
    }

    return false;
  }

  /**
   * @description Shortcut utilizes labels to distinguish between changes and incidents
   */
  public async getEventType(eventTypeInput: EventTypeInput): Promise<string> {
    const webhookbody = eventTypeInput.body || {};
    if (!webhookbody || Object.keys(webhookbody).length == 0)
      throw new MissingShortcutFieldsError();

    const isIncident = this.hasLabelId(
      'adds',
      this.shortcutIncidentLabelId,
      webhookbody?.['actions']
    );
    return isIncident ? 'incident' : 'change';
  }

  /**
   * @description Get payload fields from the right places.
   */
  public async getPayload(payloadInput: PayloadInput): Promise<EventDto> {
    const webhookbody = payloadInput.body || {};
    if (!webhookbody || Object.keys(webhookbody).length == 0)
      throw new MissingShortcutFieldsError();

    const body = await this.getStoryData(webhookbody);

    const event = (() => {
      if (body?.['completed'] == true) return 'closed';
      if (body?.['archived'] == true) return 'closed';

      // Check if webhook is a 'create' event
      const isCreate =
        webhookbody?.['actions'].filter(
          (action: Record<string, any>) => action?.['action'] == 'create'
        ).length > 0;

      // Check if webhook is an 'update' event
      const isUpdate =
        webhookbody?.['actions'].filter(
          (action: Record<string, any>) => action?.['action'] == 'update'
        ).length > 0;

      if (isCreate || isUpdate) {
        if (this.hasLabelId('adds', this.shortcutIncidentLabelId, webhookbody?.['actions']))
          return 'labeled';
        if (this.hasLabelId('removes', this.shortcutIncidentLabelId, webhookbody?.['actions']))
          return 'unlabeled';
        return 'opened';
      }

      return 'unknown';
    })();

    switch (event) {
      case 'opened':
      case 'labeled':
        return this.handleOpenedLabeled(webhookbody, body);
      case 'closed':
      case 'unlabeled':
        return this.handleClosedUnlabeled(webhookbody, body);
      default:
        return {
          eventTime: 'UNKNOWN',
          timeCreated: 'UNKNOWN',
          timeResolved: 'UNKNOWN',
          id: 'UNKNOWN',
          title: 'UNKNOWN',
          message: 'UNKNOWN'
        };
    }
  }

  private handleOpenedLabeled(webhook: Record<string, any>, body: Record<string, any>) {
    return {
      eventTime: webhook?.['changed_at'],
      timeCreated: convertDateToUnixTimestamp(body?.['created_at']),
      id: `${body?.['id']}`,
      title: body?.['name'],
      message: JSON.stringify(body)
    };
  }

  private handleClosedUnlabeled(webhook: Record<string, any>, body: Record<string, any>) {
    return {
      eventTime: webhook?.['changed_at'],
      timeCreated: convertDateToUnixTimestamp(body?.['created_at']),
      timeResolved: this.handleTimeResolved(body),
      id: `${body?.['id']}`,
      title: body?.['name'],
      message: JSON.stringify(body)
    };
  }

  private handleTimeResolved(body: Record<string, any>) {
    return body?.['completed'] || body?.['archived']
      ? convertDateToUnixTimestamp(
          body?.['completed_at_override']?.toString() || body?.['completed_at']?.toString()
        )
      : Date.now().toString();
  }

  /**
   * @description Get the repository name.
   */
  public async getRepoName(body: Record<string, any>): Promise<string> {
    console.log('getRepoName', body);
    return this.repoName;
  }
}
