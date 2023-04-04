import { MikroLog } from 'mikrolog';

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
  shortcutEndpoint: string;
  repoName: string;
  logger: MikroLog;

  constructor() {
    this.logger = MikroLog.start({ metadataConfig: metadataConfig });

    /* istanbul ignore next */
    this.shortcutToken = process.env.SHORTCUT_TOKEN ?? '';
    /* istanbul ignore next */
    this.repoName = process.env.SHORTCUT_REPONAME ?? '';
    /* istanbul ignore next */
    this.shortcutIncidentLabelId = global.parseInt(process.env.SHORTCUT_INCIDENT_LABEL_ID ?? '0');
    this.shortcutEndpoint = 'https://api.app.shortcut.com/api/v3/stories';

    this.validateShortcutToken();
    this.validateShortcutConfiguration();
    this.validateShortcutIncidentLabelId();
  }

  private validateShortcutToken() {
    if (this.shortcutToken === '' || this.shortcutToken === 'undefined')
      throw new ShortcutConfigurationError('SHORTCUT_TOKEN');
  }

  private validateShortcutConfiguration() {
    if (this.repoName === '' || this.repoName === 'undefined')
      throw new ShortcutConfigurationError('SHORTCUT_REPONAME');
  }

  private validateShortcutIncidentLabelId() {
    if (this.shortcutIncidentLabelId === 0 || isNaN(this.shortcutIncidentLabelId))
      throw new ShortcutConfigurationError('SHORTCUT_INCIDENT_LABEL_ID');
  }

  /**
   * @description Fetch original Shortcut story.
   */
  private async fetchStory(storyId: string): Promise<Record<string, any>> {
    this.logger.info('fetching story ' + storyId);

    return await fetch(`${this.shortcutEndpoint}/${storyId}`, {
      headers: { 'Shortcut-Token': this.shortcutToken }
    }).then(async (response: any) => {
      const storyData = await response.json();
      if (!storyData || Object.keys(storyData).length === 0) throw new MissingShortcutFieldsError();
      return storyData;
    });
  }

  /**
   * @description Scan the webhook for labels matching the specified ID.
   */
  private hasLabelId(
    check: string,
    incidentLabelId: number,
    webhookActions: Record<string, any>
  ): boolean {
    for (const index in Object.keys(webhookActions)) {
      const action: Record<string, any> = Object.values(webhookActions)[index];

      // Check labels when a story is created
      if (action?.['label_ids']?.filter((label: number) => label === incidentLabelId).length > 0)
        return true;

      // Check labels when a story is changed
      if (
        action?.['changes']?.['label_ids']?.[check]?.filter(
          (label: number) => label === incidentLabelId
        ).length > 0
      )
        return true;
    }

    return false;
  }

  /**
   * @description Get the event type, being either an `incident` or a `change`.
   */
  public async getEventType(eventTypeInput: EventTypeInput): Promise<string> {
    const webhookBody = eventTypeInput.body || {};
    if (!webhookBody || Object.keys(webhookBody).length === 0)
      throw new MissingShortcutFieldsError();

    // Check if incident or change
    return this.hasLabelId('adds', this.shortcutIncidentLabelId, webhookBody?.['actions'])
      ? 'incident'
      : 'change';
  }

  /**
   * @description Get payload fields from the right places.
   */
  public async getPayload(payloadInput: PayloadInput): Promise<EventDto> {
    const webhook = payloadInput.body || {};
    if (!webhook || Object.keys(webhook).length === 0) throw new MissingShortcutFieldsError();

    // Some webhooks contain multiple actions, without the primay id we cannot determine which story to update
    const storyId: string = webhook?.['primary_id'];
    if (!storyId) throw new MissingIdError('Missing ID in getStoryData()!');

    // The webhook can contain multiple story payloads, we only care about stories that match the primary ID
    const webhookActions: Record<string, any>[] = webhook?.['actions'].filter(
      (action: Record<string, any>) =>
        action?.['entity_type'] === 'story' && action?.['id'] === storyId
    );

    const event = this.getEventName(webhookActions);

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

  /**
   * @description Get the correct event name.
   */
  private getEventName(actions: Record<string, any>[]) {
    if (actions.length === 0) return 'unknown';

    if (this.hasLabelId('adds', this.shortcutIncidentLabelId, actions)) return 'labeled';
    if (this.hasLabelId('removes', this.shortcutIncidentLabelId, actions)) return 'unlabeled';

    const isClosed = this.isClosed(actions);
    if (isClosed) return 'closed';

    const isOpen = this.isOpen(actions);
    if (isOpen) return 'opened';

    return 'unknown';
  }

  /**
   * @description Check if this is a `closed` event.
   */
  private isClosed(actions: Record<string, any>[]) {
    if (
      actions.filter((action: Record<string, any>) => action?.['action'] === 'delete').length > 0 ||
      actions.filter(
        (action: Record<string, any>) => action?.['changes']?.['archived']?.['new'] === true
      ).length > 0 ||
      actions.filter(
        (action: Record<string, any>) => action?.['changes']?.['started']?.['new'] === false
      ).length > 0 ||
      actions.filter(
        (action: Record<string, any>) => action?.['changes']?.['completed']?.['new'] === true
      ).length > 0
    )
      return true;

    return false;
  }

  /**
   * @description Check if this is an `opened` event.
   */
  private isOpen(actions: Record<string, any>[]) {
    if (
      actions.filter(
        (action: Record<string, any>) => action?.['changes']?.['archived']?.['new'] === false
      ).length > 0 ||
      actions.filter(
        (action: Record<string, any>) => action?.['changes']?.['started']?.['new'] === true
      ).length > 0 ||
      actions.filter(
        (action: Record<string, any>) => action?.['changes']?.['completed']?.['new'] === false
      ).length > 0
    )
      return true;

    return false;
  }

  private async handleOpenedLabeled(webhook: Record<string, any>, storyId: string) {
    const body = await this.fetchStory(storyId);

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
    if (body?.['completed'] || body?.['archived'] || body?.['deleted']) {
      const time =
        body?.['deleted_at']?.toString() ||
        body?.['archived_at']?.toString() ||
        body?.['completed_at_override']?.toString() ||
        body?.['completed_at']?.toString();
      return convertDateToUnixTimestamp(time);
    }

    return Date.now().toString();
  }

  /**
   * @description Get the repository name.
   */
  public getRepoName(): string {
    return this.repoName;
  }
}
