import { convertDateToUnixTimestamp } from 'chrono-utils';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

import { ShortcutParser } from '../../../src/application/parsers/ShortcutParser';

import {
  MissingIdError,
  MissingShortcutFieldsError,
  ShortcutConfigurationError
} from '../../../src/application/errors/errors';

import webhookPushEvent from '../../../testdata/webhook-events/shortcut/push_event.json';
import webhookStoryCreateWithLabel from '../../../testdata/webhook-events/shortcut/story_create_with_label.json';
import webhookStoryCreateWithoutLabel from '../../../testdata/webhook-events/shortcut/story_create.json';
import webhookStoryDelete from '../../../testdata/webhook-events/shortcut/story_delete.json';
import webhookStoryBulkUpdate from '../../../testdata/webhook-events/shortcut/story_bulk_update.json';
import webhookStoryUpdateArchived from '../../../testdata/webhook-events/shortcut/story_update_archived.json';
import webhookStoryUpdateCompleted from '../../../testdata/webhook-events/shortcut/story_update_completed.json';
import webhookStoryUpdateLabelAdded from '../../../testdata/webhook-events/shortcut/story_update_label_added.json';
import webhookStoryUpdateLabelRemoved from '../../../testdata/webhook-events/shortcut/story_update_label_removed.json';
import webhookStoryUpdateStarted from '../../../testdata/webhook-events/shortcut/story_update_started.json';
import webhookStoryUpdateStopped from '../../../testdata/webhook-events/shortcut/story_update_stopped.json';
import webhookStoryUpdate from '../../../testdata/webhook-events/shortcut/story_update.json';

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
      const storyData = genericStoryData;

      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: {},
        body: webhookStoryUpdateStarted
      });

      expect(eventType).toBe('change');
    });

    test('It should return "incident" for event types', async () => {
      const storyData = genericStoryData;
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: {},
        body: webhookStoryUpdateLabelAdded
      });

      expect(eventType).toBe('incident');
    });

    test('It should return "incident" for event types on story created with incident label', async () => {
      const storyData = genericStoryData;
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: {},
        body: webhookStoryCreateWithLabel
      });

      expect(eventType).toBe('incident');
    });

    test('It should return "change" for event types on story created without incident label', async () => {
      const storyData = genericStoryData;
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: {},
        body: webhookStoryCreateWithoutLabel
      });

      expect(eventType).toBe('change');
    });

    test('It should use the environment shortcut incident label id', async () => {
      const webhookData = JSON.parse(JSON.stringify(webhookStoryCreateWithLabel));
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

    test('It should use the environment shortcut incident label ID and report a change', async () => {
      process.env.SHORTCUT_INCIDENT_LABEL_ID = '1234';

      const storyData = JSON.parse(JSON.stringify(genericStoryData));
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: {},
        body: webhookStoryCreateWithLabel
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
      const storyData = JSON.parse(JSON.stringify(genericStoryData));
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookStoryUpdateStarted
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
        body: webhookStoryUpdateLabelAdded
      });

      expect(payload.eventTime).toBe('2023-03-22T21:38:19.067Z');
      expect(payload.timeCreated).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
      expect(payload.timeResolved).toBe(undefined);
      expect(payload.id).toBe('123');
      expect(payload.title).toBe('foo');
    });

    test('It should return assigned properties on create', async () => {
      const storyData = JSON.parse(JSON.stringify(genericStoryData));
      fetchMock.mockResponse(JSON.stringify(storyData));

      const webhookData = webhookStoryCreateWithLabel;
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

    test('It should return an unknown event for a create without an label', async () => {
      const storyData = JSON.parse(JSON.stringify(genericStoryData));
      fetchMock.mockResponse(JSON.stringify(storyData));

      const webhookData = webhookStoryCreateWithoutLabel;

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload.eventTime).toBe('UNKNOWN');
    });

    test('It should return assigned properties on completed with override', async () => {
      const storyData = JSON.parse(JSON.stringify(genericStoryData));
      storyData.completed = true;
      storyData.completed_at = '2016-12-31T12:30:00Z';
      storyData.completed_at_override = '2017-12-31T12:30:00Z';

      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookStoryUpdateCompleted
      });

      expect(payload.timeResolved).toBe(convertDateToUnixTimestamp('2017-12-31T12:30:00Z'));
    });

    test('It should return assigned properties on completed', async () => {
      const storyData = JSON.parse(JSON.stringify(genericStoryData));
      storyData.deleted = true;
      storyData.completed_at = '2016-12-31T12:30:00Z';
      storyData.deleted_at = '2016-12-31T13:30:00Z';

      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookStoryDelete
      });

      expect(payload.timeResolved).toBe(convertDateToUnixTimestamp('2016-12-31T13:30:00Z'));
    });

    test('It should return assigned properties on deleted', async () => {
      const storyData = JSON.parse(JSON.stringify(genericStoryData));
      storyData.deleted = true;
      storyData.completed_at = '2016-12-31T12:30:00Z';

      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookStoryUpdateCompleted
      });

      expect(payload.timeResolved).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
    });

    test('It should mark unlabeled events are closed', async () => {
      const webhookData = webhookStoryUpdateLabelRemoved;

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
        body: webhookPushEvent
      });

      expect(payload.timeResolved).toBe('UNKNOWN');
    });

    test('It should make updates with no labels as opened', async () => {
      const storyData = JSON.parse(JSON.stringify(genericStoryData));

      Date.now = jest.fn(() => 1487076708000);
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookStoryUpdate
      });

      expect(payload.timeResolved).toBe('UNKNOWN');
    });

    test('It should return assigned properties on started', async () => {
      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookStoryUpdateStarted
      });

      expect(payload).not.toHaveProperty('timeResolved');
    });

    test('It should return assigned properties on stopped', async () => {
      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookStoryUpdateStopped
      });

      expect(payload).toHaveProperty('timeResolved');
    });

    test('It should return assigned properties on archived', async () => {
      const storyData = JSON.parse(JSON.stringify(genericStoryData));
      storyData.archived = true;
      storyData.completed_at = '2016-12-31T12:30:00Z';

      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookStoryUpdateArchived
      });

      expect(payload.timeResolved).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
    });

    test('It should return assigned properties on when removed from archive', async () => {
      const webhookData = JSON.parse(JSON.stringify(webhookStoryUpdateArchived));
      webhookData.actions[0].changes.archived.new = false;
      webhookData.actions[0].changes.archived.old = true;

      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload).not.toHaveProperty('timeResolved');
    });

    test('It should return assigned properties on when moved from completed', async () => {
      const webhookData = JSON.parse(JSON.stringify(webhookStoryUpdateCompleted));
      webhookData.actions[0].changes.completed.new = false;
      webhookData.actions[0].changes.completed.old = true;

      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload).not.toHaveProperty('timeResolved');
    });

    test('It should parse the story ID from the webhook payload', async () => {
      const webhookData = JSON.parse(JSON.stringify(webhookStoryUpdateLabelAdded));
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

    test('It should parse the story ID from the webhook payload and ignore all none matching actions', async () => {
      const webhookData = JSON.parse(JSON.stringify(webhookStoryUpdateLabelAdded));
      webhookData.primary_id = 456;

      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(fetchMock).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalledWith(
        'https://api.app.shortcut.com/api/v3/stories/456',
        {
          headers: { 'Shortcut-Token': '11111111' }
        }
      );
    });

    test('It should use the environment shortcut token', async () => {
      process.env.SHORTCUT_TOKEN = '222222';

      const webhookData = JSON.parse(JSON.stringify(webhookStoryUpdateLabelAdded));
      const storyId = webhookData.primary_id;

      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.app.shortcut.com/api/v3/stories/' + storyId,
        {
          headers: { 'Shortcut-Token': '222222' }
        }
      );
    });
  });

  describe('Repository name', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
      process.env.SHORTCUT_INCIDENT_LABEL_ID = '2805';
      process.env.SHORTCUT_TOKEN = '11111111';
      process.env.SHORTCUT_REPONAME = 'SOMEREPO';
    });

    test('It should take in a typical Shortcut event and return the GitHub repository name', async () => {
      const storyData = genericStoryData;

      fetchMock.mockResponse(JSON.stringify(storyData));

      const expected = 'SOMEREPO';
      const parser = new ShortcutParser();
      const repoName = parser.getRepoName();

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
      const storyData = genericStoryData;
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();

      expect.assertions(1);
      expect(
        parser.getEventType({
          headers: {},
          body: {}
        })
      ).rejects.toThrowError(MissingShortcutFieldsError);
    });

    test('It should throw a MissingShortcutFieldsError if webhook data is undefined', () => {
      const storyData = genericStoryData;
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();

      expect.assertions(1);
      expect(
        parser.getEventType({
          headers: {},
          body: undefined
        })
      ).rejects.toThrowError(MissingShortcutFieldsError);
    });

    test('It should throw a MissingShortcutFieldsError if story data is empty', () => {
      const webhookData = webhookStoryUpdateLabelAdded;
      fetchMock.mockResponse(JSON.stringify({}));

      const parser = new ShortcutParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          headers: {},
          body: webhookData
        })
      ).rejects.toThrowError(MissingShortcutFieldsError);
    });

    test('It should throw a MissingIdError on bulk updated', () => {
      fetchMock.mockResponse(JSON.stringify(genericStoryData));

      const parser = new ShortcutParser();
      expect(
        parser.getPayload({
          headers: {},
          body: webhookStoryBulkUpdate
        })
      ).rejects.toThrowError(MissingIdError);
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
      expect(
        parser.getPayload({
          headers: {},
          body: webHookIncoming
        })
      ).rejects.toThrowError(MissingIdError);
    });

    test('It should throw a MissingShortcutFieldsError if webhook data is empty', () => {
      const webHookIncoming = {};
      const parser = new ShortcutParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          headers: {},
          body: webHookIncoming
        })
      ).rejects.toThrowError(MissingShortcutFieldsError);
    });

    test('It should throw a MissingShortcutFieldsError if webhook data is undefined', () => {
      const parser = new ShortcutParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          headers: {},
          body: undefined
        })
      ).rejects.toThrowError(MissingShortcutFieldsError);
    });

    test('It should throw a MissingShortcutFieldsError if story data is empty', () => {
      const webhookData = webhookStoryUpdateLabelAdded;

      fetchMock.mockResponse(JSON.stringify({}));

      const parser = new ShortcutParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          headers: {},
          body: webhookData
        })
      ).rejects.toThrowError(MissingShortcutFieldsError);
    });
  });
});
