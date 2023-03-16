import axios from 'axios';
import { MikroLog } from 'mikrolog';
import { metadataConfig } from '../../config/metadata';
import { convertDateToUnixTimestamp } from 'chrono-utils';

import { EventDto } from '../../interfaces/Event';
import { EventTypeInput, Parser, PayloadInput } from '../../interfaces/Parser';


import {
  MissingIdError,
  MissingShortcutFieldsError,
} from '../errors/errors';

/**
 * @description Parser adapted for Shortcut.
 */
export class ShortcutParser implements Parser {

  storyData: Record<string, any> = {};
  shortcutToken: string;
  logger: MikroLog;

  constructor() {
    this.shortcutToken = process.env.SHORTCUT_TOKEN ?? "11111111-1111-1111-1111-111111111111"
    this.logger = MikroLog.start({ metadataConfig: metadataConfig });
  }
  
  private async getStoryData(body: Record<string, any>) : Promise<Record<string, any>>
  {
    if(Object.keys(this.storyData).length > 0) return this.storyData;

    const id : string = body?.['primary_id'];
    if (!id) throw new MissingIdError('Missing ID in getStoryData()!');

    this.logger.info("fetching story " + id);
    return axios.get("https://api.app.shortcut.com/api/v3/stories/" + id, { headers: {"Shortcut-Token" : this.shortcutToken}})
                        .then((rsp) => {
                          this.storyData = rsp.data;
                          return rsp.data;
                        });
  }

  /**
   * @description Shortcut only handles Incidents, so this simply returns a hard coded value for it.
   */
  public async getEventType(eventTypeInput: EventTypeInput): Promise<string> {
    const webhookbody = eventTypeInput.body || {};
    if(!webhookbody || Object.keys(webhookbody).length == 0) throw new MissingShortcutFieldsError();

    const labelAdds = webhookbody?.['actions'][0]?.['changes']?.['label_ids']?.['adds'] || [];
    if (labelAdds && labelAdds.length > 0
      && (labelAdds).filter((label: number) => label == 2805 ).length > 0) {
        return "incident"
    }

    return "change"
  }

  /**
   * @description Get payload fields from the right places.
   */
  public async getPayload(payloadInput: PayloadInput): Promise<EventDto> {
    const webhookbody = payloadInput.body || {};
    if(!webhookbody || Object.keys(webhookbody).length == 0) throw new MissingShortcutFieldsError();

    const body = await this.getStoryData(webhookbody);
    if(!body || Object.keys(body).length == 0) throw new MissingShortcutFieldsError();

    const event = (() => {
      if(body?.['completed'] == true) return "closed";
      if(body?.['archived'] == true) return "closed";

      if (webhookbody?.['actions'].filter((action: Record<string, any>) => action?.['action'] == "create" ).length > 0) return "opened";

      const eventType = webhookbody?.['actions'].filter((action: Record<string, any>) => action?.['action'] == "update" ).length > 0 ? "opened" : "unknown";
      if (eventType == 'opened') {
        const checkLabels = (check:string, actions: Record<string, any>) : boolean => {
          for (let index in Object.keys(actions)) {
            let action: Record<string, any> = Object.values(actions)[index];
            if (action?.['changes']?.['label_ids']?.[check]?.filter((label: number) => label == 2805 ).length > 0) return true;
          }
          return false;
        }

        const labelAdds = checkLabels("adds", webhookbody?.['actions'])
        if (labelAdds) return "labeled"

        const labelRemoves = checkLabels("removes", webhookbody?.['actions'])
        if (labelRemoves) return "unlabeled"

        return "opened";
      }
      
      return "unknown";
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
      id: `${ body?.['id'] }`,
      title: body?.['name'],
      message: JSON.stringify(body)
    };
  }

  private handleClosedUnlabeled(webhook: Record<string, any>, body: Record<string, any>) {
    return {
      eventTime: webhook?.['changed_at'],
      timeCreated: convertDateToUnixTimestamp(body?.['created_at']),
      timeResolved: this.handleTimeResolved(body),
      id: `${ body?.['id'] }`,
      title: body?.['name'],
      message: JSON.stringify(body)
    };
  }

  private handleTimeResolved(body: Record<string, any>) {
    return body?.['completed'] || body?.['archived']
             ? convertDateToUnixTimestamp(body?.['completed_at_override']?.toString() || body?.['completed_at']?.toString()) 
             : Date.now().toString();
  }

  
  /**
   * @description Get the repository name.
   */
  public async getRepoName(body: Record<string, any>): Promise<string> {
   
    console.log("getRepoName", body)
    const repoName: string = "eHawk";
    return repoName;
  }
}
