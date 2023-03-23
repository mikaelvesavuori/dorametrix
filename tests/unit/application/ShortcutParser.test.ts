import { convertDateToUnixTimestamp } from 'chrono-utils';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();
jest.setMock('cross-fetch', fetchMock);

import { ShortcutParser } from '../../../src/application/parsers/ShortcutParser';

import {
  MissingIdError,
  MissingShortcutFieldsError,
  ShortcutConfigurationError
} from '../../../src/application/errors/errors';


import webhook_push_event from '../../../testdata/webhook-events/shortcut/push_event.json';
import webhook_story_create_with_label from '../../../testdata/webhook-events/shortcut/story_create_with_label.json';
import webhook_story_create_without_label from '../../../testdata/webhook-events/shortcut/story_create.json';
import webhook_story_delete from '../../../testdata/webhook-events/shortcut/story_delete.json';
import webhook_story_bulk_update from '../../../testdata/webhook-events/shortcut/story_bulk_update.json';
import webhook_story_update_archived from '../../../testdata/webhook-events/shortcut/story_update_archived.json';
import webhook_story_update_completed from '../../../testdata/webhook-events/shortcut/story_update_completed.json';
import webhook_story_update_label_added from '../../../testdata/webhook-events/shortcut/story_update_label_added.json';
import webhook_story_update_label_removed from '../../../testdata/webhook-events/shortcut/story_update_label_removed.json';
import webhook_story_update_started from '../../../testdata/webhook-events/shortcut/story_update_started.json';
import webhook_story_update_stopped from '../../../testdata/webhook-events/shortcut/story_update_stopped.json';
import webhook_story_update from '../../../testdata/webhook-events/shortcut/story_update.json';

import genericStoryData from '../../../testdata/webhook-events/shortcut/story_generic.json';


describe('Success cases', () => {
  describe('Event types', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
      process.env.SHORTCUT_INCIDENT_LABEL_ID = '2805';
      process.env.SHORTCUT_TOKEN = '11111111';
      process.env.SHORTCUT_REPONAME = 'SOMEREPO';
    });

    test('It should return "change" for event types', async () => {
      var storyData = genericStoryData;

      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: {},
        body: webhook_story_update_started
      });

      expect(eventType).toBe('change');
    });

    test('It should return "incident" for event types', async () => {
      var storyData = genericStoryData;
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: {},
        body: webhook_story_update_label_added
      });

      expect(eventType).toBe('incident');
    });

    test('It should return "incident" for event types on story created with incident label', async () => {
      var storyData = genericStoryData;
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: {},
        body: webhook_story_create_with_label
      });

      expect(eventType).toBe('incident');
    });

    test('It should return "change" for event types on story created without incident label', async () => {
      var storyData = genericStoryData;
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: {},
        body: webhook_story_create_without_label
      });

      expect(eventType).toBe('change');
    });

    test('It should use the environment shortcut incident label id', async () => {
      var webhookData = JSON.parse(JSON.stringify(webhook_story_create_with_label));
      webhookData.actions[0].label_ids = [1234];

      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      process.env.SHORTCUT_INCIDENT_LABEL_ID = '1234';

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: {},
        body: webhookData
      });

      expect(eventType).toBe('incident');
    });

    test('It should use the environment shortcut incident label id and report a change', async () => {
      process.env.SHORTCUT_INCIDENT_LABEL_ID = '1234';

      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: {},
        body: webhook_story_create_with_label
      });

      expect(eventType).toBe('change');
    });
  });

  describe('Payloads', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
      process.env.SHORTCUT_INCIDENT_LABEL_ID = '2805';
      process.env.SHORTCUT_TOKEN = '11111111';
      process.env.SHORTCUT_REPONAME = 'SOMEREPO';
    });

    test('It should return the provided event if it is unknown together with the a correct object', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhook_story_update_started
      });

      expect(payload).toHaveProperty('eventTime');
      expect(payload).toHaveProperty('timeCreated');
      expect(payload).not.toHaveProperty('timeResolved');
      expect(payload).toHaveProperty('id');
      expect(payload).toHaveProperty('title');
      expect(payload).toHaveProperty('message');
    });

    test('It should return assigned properties on update', async () => {
      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhook_story_update_label_added
      });

      expect(payload.eventTime).toBe('2023-03-22T21:38:19.067Z');
      expect(payload.timeCreated).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
      expect(payload.timeResolved).toBe(undefined);
      expect(payload.id).toBe('123');
      expect(payload.title).toBe('foo');
    });


    test('It should return assigned properties on create', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      fetchMock.mockResponse(JSON.stringify(storyData));

      var webhookData = webhook_story_create_with_label;
      webhookData.actions[0].action = 'create';

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload.eventTime).toBe('2023-03-22T21:39:21.838Z');
      expect(payload.timeCreated).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
      expect(payload.timeResolved).toBe(undefined);
      expect(payload.id).toBe('123');
      expect(payload.title).toBe('foo');
      expect(payload.message).toBe(JSON.stringify(storyData));
    });

    test('It should return assigned properties on create without incident label', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      fetchMock.mockResponse(JSON.stringify(storyData));

      var webhookData = webhook_story_create_without_label;

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload.eventTime).toBe('2023-03-22T21:39:21.838Z');
      expect(payload.timeCreated).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
      expect(payload.timeResolved).toBe(undefined);
      expect(payload.id).toBe('123');
      expect(payload.title).toBe('foo');
      expect(payload.message).toBe(JSON.stringify(storyData));
    });

    test('It should return assigned properties on completed with override', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      storyData.completed = true;
      storyData.completed_at = '2016-12-31T12:30:00Z';
      storyData.completed_at_override = '2017-12-31T12:30:00Z';

      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhook_story_update_completed
      });

      expect(payload.timeResolved).toBe(convertDateToUnixTimestamp('2017-12-31T12:30:00Z'));
    });

    test('It should return assigned properties on completed', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      storyData.deleted = true;
      storyData.completed_at = '2016-12-31T12:30:00Z';
      storyData.deleted_at = '2016-12-31T13:30:00Z';

      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhook_story_delete
      });

      expect(payload.timeResolved).toBe(convertDateToUnixTimestamp('2016-12-31T13:30:00Z'));
    });

    test('It should return assigned properties on deleted', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      storyData.deleted = true;
      storyData.completed_at = '2016-12-31T12:30:00Z';

      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhook_story_update_completed
      });

      expect(payload.timeResolved).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
    });

    test('It should mark unlabeled events are closed', async () => {
      var webhookData = webhook_story_update_label_removed;

      Date.now = jest.fn(() => 1487076708000);
      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload.timeResolved).toBe(Date.now().toString());
    });

    test('It should ignore push events', async () => {
      Date.now = jest.fn(() => 1487076708000);
      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhook_push_event
      });

      expect(payload.timeResolved).toBe("UNKNOWN");
    });

    test('It should make updates with no labels as opened', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));

      Date.now = jest.fn(() => 1487076708000);
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhook_story_update
      });

      expect(payload.timeResolved).toBe("UNKNOWN");
    });

    test('It should return assigned properties on started', async () => {
      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhook_story_update_started
      });

      expect(payload).not.toHaveProperty("timeResolved");
    });

    test('It should return assigned properties on stopped', async () => {
      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhook_story_update_stopped
      });

      expect(payload).toHaveProperty("timeResolved");
    });

    test('It should return assigned properties on archived', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      storyData.archived = true;
      storyData.completed_at = '2016-12-31T12:30:00Z';

      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhook_story_update_archived
      });

      expect(payload.timeResolved).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
    });

    test('It should return assigned properties on when removed from archive', async () => {
      var webhookData = JSON.parse(JSON.stringify(webhook_story_update_archived));
      webhookData.actions[0].changes.archived.new = false;
      webhookData.actions[0].changes.archived.old = true;

      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload).not.toHaveProperty("timeResolved");
    });

    test('It should return assigned properties on when moved from completed', async () => {
      var webhookData = JSON.parse(JSON.stringify(webhook_story_update_completed));
      webhookData.actions[0].changes.completed.new = false;
      webhookData.actions[0].changes.completed.old = true;

      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload).not.toHaveProperty("timeResolved");
    });

    test('It should parse the story id from the webhook payload', async () => {
      var webhookData = JSON.parse(JSON.stringify(webhook_story_update_label_added));
      webhookData.primary_id = 123456;
      webhookData.actions[0].id = 123456;

      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(fetchMock).toHaveBeenCalledWith('https://api.app.shortcut.com/api/v3/stories/123456', {
        headers: { 'Shortcut-Token': '11111111' }
      });
    });

    test('It should parse the story id from the webhook payload and ignore all none matching actions', async () => {
      var webhookData = JSON.parse(JSON.stringify(webhook_story_update_label_added));
      webhookData.primary_id = 456;

      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(fetchMock).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalledWith('https://api.app.shortcut.com/api/v3/stories/456', {
        headers: { 'Shortcut-Token': '11111111' }
      });
    });

    test('It should use the environment shortcut token', async () => {
      process.env.SHORTCUT_TOKEN = '222222';
      
      var webhookData = JSON.parse(JSON.stringify(webhook_story_update_label_added));
      const storyId = webhookData.primary_id;

      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(fetchMock).toHaveBeenCalledWith("https://api.app.shortcut.com/api/v3/stories/" + storyId, {
        headers: { 'Shortcut-Token': '222222' }
      });
    });
  });

  describe('Repository name', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
      process.env.SHORTCUT_INCIDENT_LABEL_ID = '2805';
      process.env.SHORTCUT_TOKEN = '11111111';
      process.env.SHORTCUT_REPONAME = 'SOMEREPO';
    });

    test('It should take in a typical Jira event and return the GitHub repository name', async () => {
      var storyData = genericStoryData;

      fetchMock.mockResponse(JSON.stringify(storyData));

      const expected = 'SOMEREPO';
      const parser = new ShortcutParser();
      const repoName = await parser.getRepoName({
        user: {
          self: 'https://something.atlassian.net/rest/api/2/user?accountId=12345-123asd-12ab12-1234567-abcdefg'
        },
        issue: {
          id: '10004',
          fields: {
            created: '2022-02-03T20:04:45.243+0100',
            customfield_10035: `https://github.com/${expected}`
          }
        }
      });

      expect(repoName).toBe(expected);
    });
  });
});

describe('Failure cases', () => {
  describe('Constructor', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
      process.env.SHORTCUT_INCIDENT_LABEL_ID = '2805';
      process.env.SHORTCUT_TOKEN = '11111111';
      process.env.SHORTCUT_REPONAME = 'SOMEREPO';
    });

    test('It should throw a ShortcutConfigurationError error if non-numeric shortcut label is provided', () => {
      process.env.SHORTCUT_INCIDENT_LABEL_ID = 'This is not a number';

      try {
        new ShortcutParser();
      } catch (e) {
        expect(e).toBeInstanceOf(ShortcutConfigurationError);
        return;
      }

      fail();
    });

    test('It should throw a ShortcutConfigurationError error if a shortcut auth token is empty', () => {
      process.env.SHORTCUT_TOKEN = '';

      try {
        new ShortcutParser();
      } catch (e) {
        expect(e).toBeInstanceOf(ShortcutConfigurationError);
        return;
      }

      fail();
    });

    test('It should throw a ShortcutConfigurationError error if a shortcut auth token is undefined', () => {
      process.env.SHORTCUT_TOKEN = undefined;

      try {
        new ShortcutParser();
      } catch (e) {
        expect(e).toBeInstanceOf(ShortcutConfigurationError);
        return;
      }

      fail();
    });

    test('It should throw a ShortcutConfigurationError error if a SHORTCUT_REPONAME is empty', () => {
      process.env.SHORTCUT_REPONAME = '';

      try {
        new ShortcutParser();
      } catch (e) {
        expect(e).toBeInstanceOf(ShortcutConfigurationError);
        return;
      }

      fail();
    });

    test('It should throw a ShortcutConfigurationError error if a SHORTCUT_REPONAME is undefined', () => {
      process.env.SHORTCUT_REPONAME = undefined;

      try {
        new ShortcutParser();
      } catch (e) {
        expect(e).toBeInstanceOf(ShortcutConfigurationError);
        return;
      }

      fail();
    });
  });

  describe('Event types', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
      process.env.SHORTCUT_INCIDENT_LABEL_ID = '2805';
      process.env.SHORTCUT_TOKEN = '11111111';
      process.env.SHORTCUT_REPONAME = 'SOMEREPO';
    });

    test('It should throw a MissingShortcutFieldsError if webhook data is empty', () => {
      var storyData = genericStoryData;
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();

      expect.assertions(1);
      expect(parser.getEventType({
          headers: {},
          body: {}
        })).rejects.toThrowError(MissingShortcutFieldsError); 
    });

    test('It should throw a MissingShortcutFieldsError if webhook data is undefined', () => {
      var storyData = genericStoryData;
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
            
      expect.assertions(1);
      expect(parser.getEventType({
          headers: {},
          body: undefined
        })).rejects.toThrowError(MissingShortcutFieldsError); 
    });

    test('It should throw a MissingShortcutFieldsError if story data is empty', () => {
      var webhookData = webhook_story_update_label_added;
      fetchMock.mockResponse(JSON.stringify({}));

      const parser = new ShortcutParser();
      
      expect.assertions(1);
      expect(parser.getPayload({
          headers: {},
          body: webhookData
        })).rejects.toThrowError(MissingShortcutFieldsError); 
    });

    test('It should throw a MissingIdError on bulk updated', () => {
      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      expect(parser.getPayload({
        headers: {},
        body: webhook_story_bulk_update
      })).rejects.toThrowError(MissingIdError); 
    });
  });

  describe('Payloads', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
      process.env.SHORTCUT_INCIDENT_LABEL_ID = '2805';
      process.env.SHORTCUT_TOKEN = '11111111';
      process.env.SHORTCUT_REPONAME = 'SOMEREPO';
    });
    test('It should throw a MissingIdError if event is missing an ID', () => {
      const webHookIncoming = {
        id: '595285dc-9c43-4b9c-a1e6-0cd9aff5b084',
        changed_at: '2017-06-27T16:20:44Z',
        member_id: '56d8a839-1c52-437f-b981-c3a15a11d6d4',
        version: 'v1'
      };
      const parser = new ShortcutParser();

      expect.assertions(1);
      expect(parser.getPayload({
          headers: {},
          body: webHookIncoming
        })).rejects.toThrowError(MissingIdError); 
    });

    test('It should throw a MissingShortcutFieldsError if webhook data is empty', () => {
      const webHookIncoming = {};
      const parser = new ShortcutParser();

      expect.assertions(1);
      expect(parser.getPayload({
          headers: {},
          body: webHookIncoming
        })).rejects.toThrowError(MissingShortcutFieldsError); 
    });

    test('It should throw a MissingShortcutFieldsError if webhook data is undefined', () => {
      const parser = new ShortcutParser();

      expect.assertions(1);
      expect(parser.getPayload({
          headers: {},
          body: undefined
        })).rejects.toThrowError(MissingShortcutFieldsError); 
    });

    test('It should throw a MissingShortcutFieldsError if story data is empty', () => {
      var webhookData = webhook_story_update_label_added;

      fetchMock.mockResponse(JSON.stringify({}));

      const parser = new ShortcutParser();

      expect.assertions(1);
      expect(parser.getPayload({
          headers: {},
          body: webhookData
        })).rejects.toThrowError(MissingShortcutFieldsError); 
    });
  });
});
