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

    /* istanbul ignore next */
    this.shortcutIncidentLabelId = global.parseInt(process.env.SHORTCUT_INCIDENT_LABEL_ID ?? '0');
    if (this.shortcutIncidentLabelId === 0 || isNaN(this.shortcutIncidentLabelId))
      throw new ShortcutConfigurationError('SHORTCUT_INCIDENT_LABEL_ID');

    this.logger = MikroLog.start({ metadataConfig: metadataConfig });
  }

  /**
   * @description Fetch original shortcut story
   */
  private async fetchStory(storyId: string): Promise<Record<string, any>> {
    this.logger.info('fetching story ' + storyId);

    return await fetch('https://api.app.shortcut.com/api/v3/stories/' + storyId, {
      headers: { 'Shortcut-Token': this.shortcutToken }
    }).then(async (response: any) => {
      const storyData = await response.json();
      if (!storyData || Object.keys(storyData).length == 0) throw new MissingShortcutFieldsError();
      return storyData;
    });
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
    const webhook = payloadInput.body || {};
    if (!webhook || Object.keys(webhook).length == 0) throw new MissingShortcutFieldsError();

    // Some webhooks contain multiple actions, without the primay id we cannot determine which story to update
    const storyId: string = webhook?.['primary_id'];
    if (!storyId) throw new MissingIdError('Missing ID in getStoryData()!');

    console.log('storyId-webhook', storyId);
    //The webhook can contain multiple story payloads, we only care about stories that match the primary id
    const webhookActions: Record<string, any>[] = webhook?.['actions'].filter(
      (action: Record<string, any>) =>
        action?.['entity_type'] == 'story' && action?.['id'] == storyId
    );

    console.log('webhookActions', webhookActions);

    const event = ((actions: Record<string, any>[]) => {
      console.log('actions', actions);
      if (actions.length == 0) return 'unknown';

      if (
        actions.filter((action: Record<string, any>) => action?.['action'] == 'delete').length > 0
      )
        return 'closed';

      // Check if webhook is a 'create' event
      const isCreate =
        actions.filter((action: Record<string, any>) => action?.['action'] == 'create').length > 0;

      // Check if webhook is an 'update' event
      const isUpdate =
        actions.filter((action: Record<string, any>) => action?.['action'] == 'update').length > 0;

      if (isCreate || isUpdate) {
        console.log(
          'archived',
          actions.filter(
            (action: Record<string, any>) => action?.['changes']?.['archived']?.['new'] === true
          )
        );
        if (
          actions.filter(
            (action: Record<string, any>) => action?.['changes']?.['archived']?.['new'] === true
          ).length > 0
        )
          return 'closed';

        if (
          actions.filter(
            (action: Record<string, any>) => action?.['changes']?.['started']?.['new'] === false
          ).length > 0
        )
          return 'closed';

        if (
          actions.filter(
            (action: Record<string, any>) => action?.['changes']?.['completed']?.['new'] === true
          ).length > 0
        )
          return 'closed';

        if (this.hasLabelId('adds', this.shortcutIncidentLabelId, actions)) return 'labeled';

        if (this.hasLabelId('removes', this.shortcutIncidentLabelId, actions)) return 'unlabeled';

        if (
          actions.filter(
            (action: Record<string, any>) => action?.['changes']?.['archived']?.['new'] === false
          ).length > 0
        )
          return 'opened';

        if (
          actions.filter(
            (action: Record<string, any>) => action?.['changes']?.['started']?.['new'] === true
          ).length > 0
        )
          return 'opened';

        if (
          actions.filter(
            (action: Record<string, any>) => action?.['changes']?.['completed']?.['new'] === false
          ).length > 0
        )
          return 'opened';
      }

      if (isCreate) return 'opened';

      return 'unknown';
    })(webhookActions);

    console.log('event', storyId, event);

    switch (event) {
      case 'opened':
      case 'labeled':
        return await this.handleOpenedLabeled(webhook, storyId);
      case 'closed':
      case 'unlabeled':
        return await this.handleClosedUnlabeled(webhook, storyId);
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

  private async handleOpenedLabeled(webhook: Record<string, any>, storyId: string) {
    const body = await this.fetchStory(storyId);

    console.log('handleOpenedLabeled');

    return {
      eventTime: webhook?.['changed_at'],
      timeCreated: convertDateToUnixTimestamp(body?.['created_at']),
      id: `${body?.['id']}`,
      title: body?.['name'],
      message: JSON.stringify(body)
    };
  }

  private async handleClosedUnlabeled(webhook: Record<string, any>, storyId: string) {
    const body = await this.fetchStory(storyId);
    console.log('handleClosedUnlabeled');

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
    return body?.['completed'] || body?.['archived'] || body?.['deleted']
      ? convertDateToUnixTimestamp(
          body?.['deleted_at']?.toString() ||
            body?.['archived_at']?.toString() ||
            body?.['completed_at_override']?.toString() ||
            body?.['completed_at']?.toString()
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
