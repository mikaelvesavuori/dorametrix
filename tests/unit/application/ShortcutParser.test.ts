import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();
jest.setMock('cross-fetch', fetchMock);

import { convertDateToUnixTimestamp } from 'chrono-utils';

import { ShortcutParser } from '../../../src/application/parsers/ShortcutParser';

import {
  MissingIdError,
  MissingShortcutFieldsError,
  ShortcutConfigurationError
} from '../../../src/application/errors/errors';

const webHookIncoming_16927 = {
  id: '595285dc-9c43-4b9c-a1e6-0cd9aff5b084',
  changed_at: '2017-06-27T16:20:44Z',
  primary_id: 16927,
  member_id: '56d8a839-1c52-437f-b981-c3a15a11d6d4',
  version: 'v1',
  actions: [
    {
      id: 16927,
      entity_type: 'story',
      action: 'update',
      name: 'test story',
      changes: {
        started: {
          new: true,
          old: false
        },
        workflow_state_id: {
          new: 1495,
          old: 1493
        },
        owner_ids: {
          adds: ['56d8a839-1c52-437f-b981-c3a15a11d6d4']
        }
      }
    }
  ]
};

const webHookIncoming_labeled_16927 = {
  id: '595285dc-9c43-4b9c-a1e6-0cd9aff5b084',
  changed_at: '2017-06-27T16:20:44Z',
  primary_id: 16927,
  member_id: '56d8a839-1c52-437f-b981-c3a15a11d6d4',
  version: 'v1',
  actions: [
    {
      id: 2507,
      entity_type: 'story',
      action: 'update',
      name: 'Deploy current product to np-usea1-3',
      story_type: 'feature',
      app_url: 'https://app.shortcut.com/ehawk/story/2507',
      changes: {
        label_ids: {
          adds: [2805]
        }
      }
    }
  ]
};

const webHookIncoming_create_with_labeled_16927 = {
  id: '595285dc-9c43-4b9c-a1e6-0cd9aff5b084',
  changed_at: '2017-06-27T16:20:44Z',
  primary_id: 16927,
  member_id: '56d8a839-1c52-437f-b981-c3a15a11d6d4',
  version: 'v1',
  actions: [
    {
      id: 2507,
      entity_type: 'story',
      action: 'create',
      name: 'Deploy current product to np-usea1-3',
      story_type: 'feature',
      app_url: 'https://app.shortcut.com/ehawk/story/2507',
      label_ids: [2805]
    }
  ]
};

const webHookIncoming_create_with_out_labeled_16927 = {
  id: '595285dc-9c43-4b9c-a1e6-0cd9aff5b084',
  changed_at: '2017-06-27T16:20:44Z',
  primary_id: 16927,
  member_id: '56d8a839-1c52-437f-b981-c3a15a11d6d4',
  version: 'v1',
  actions: [
    {
      id: 2507,
      entity_type: 'story',
      action: 'create',
      name: 'Deploy current product to np-usea1-3',
      story_type: 'feature',
      app_url: 'https://app.shortcut.com/ehawk/story/2507'
    }
  ]
};

const webHookIncoming_remove_labeled_16927 = {
  id: '595285dc-9c43-4b9c-a1e6-0cd9aff5b084',
  changed_at: '2017-06-27T16:20:44Z',
  primary_id: 16927,
  member_id: '56d8a839-1c52-437f-b981-c3a15a11d6d4',
  version: 'v1',
  actions: [
    {
      id: 2507,
      entity_type: 'story',
      action: 'update',
      name: 'Deploy current product to np-usea1-3',
      story_type: 'feature',
      app_url: 'https://app.shortcut.com/ehawk/story/2507',
      changes: {
        label_ids: {
          removes: [2805]
        }
      }
    },
    {
      id: 2507,
      entity_type: 'story',
      action: 'update',
      name: 'Deploy current product to np-usea1-3',
      story_type: 'feature',
      app_url: 'https://app.shortcut.com/ehawk/story/2507',
      changes: {
        moved: {
          new: true,
          old: false
        }
      }
    }
  ]
};

const webHookIncoming_no_label_changes_16927 = {
  id: '595285dc-9c43-4b9c-a1e6-0cd9aff5b084',
  changed_at: '2017-06-27T16:20:44Z',
  primary_id: 16927,
  member_id: '56d8a839-1c52-437f-b981-c3a15a11d6d4',
  version: 'v1',
  actions: [
    {
      id: 2507,
      entity_type: 'story',
      action: 'update',
      name: 'Deploy current product to np-usea1-3',
      story_type: 'feature',
      app_url: 'https://app.shortcut.com/ehawk/story/2507',
      changes: {}
    }
  ]
};

const genericStoryData: Record<string, any> = {
  archived: false,
  completed: false,
  //"completed_at": "2016-12-31T12:30:00Z",
  //"completed_at_override": "2017-12-31T12:30:00Z",
  created_at: '2016-12-31T12:30:00Z',
  id: 123,
  name: 'foo',
  started: true,
  started_at: '2016-12-31T12:30:00Z',
  started_at_override: '2016-12-31T12:30:00Z',
  description: 'foo desc'
};

describe('Success cases', () => {
  describe('Event types', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
      process.env.SHORTCUT_INCIDENT_LABEL_ID = '2805';
      process.env.SHORTCUT_TOKEN = '11111111';
    });

    test('It should return "change" for event types', async () => {
      var storyData = genericStoryData;

      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: {},
        body: webHookIncoming_16927
      });

      expect(eventType).toBe('change');
    });

    test('It should return "incident" for event types', async () => {
      var storyData = genericStoryData;
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: {},
        body: webHookIncoming_labeled_16927
      });

      expect(eventType).toBe('incident');
    });

    test('It should return "incident" for event types on story created with incident label', async () => {
      var storyData = genericStoryData;
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: {},
        body: webHookIncoming_create_with_labeled_16927
      });

      expect(eventType).toBe('incident');
    });

    test('It should return "change" for event types on story created without incident label', async () => {
      var storyData = genericStoryData;
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: {},
        body: webHookIncoming_create_with_out_labeled_16927
      });

      expect(eventType).toBe('change');
    });

    test('It should use the environment shortcut incident label id', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      var webhookData = JSON.parse(JSON.stringify(webHookIncoming_create_with_labeled_16927));
      webhookData.actions[0].label_ids = [1234];

      fetchMock.mockResponse(JSON.stringify(storyData));

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
        body: webHookIncoming_create_with_labeled_16927
      });

      expect(eventType).toBe('change');
    });
  });

  describe('Payloads', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
      process.env.SHORTCUT_INCIDENT_LABEL_ID = '2805';
      process.env.SHORTCUT_TOKEN = '11111111';
    });

    test('It should return the provided event if it is unknown together with the a correct object', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webHookIncoming_16927
      });

      expect(payload).toHaveProperty('eventTime');
      expect(payload).toHaveProperty('timeCreated');
      expect(payload).not.toHaveProperty('timeResolved');
      expect(payload).toHaveProperty('id');
      expect(payload).toHaveProperty('title');
      expect(payload).toHaveProperty('message');
    });

    test('It should return assigned properties on update', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webHookIncoming_labeled_16927
      });

      expect(payload.eventTime).toBe('2017-06-27T16:20:44Z');
      expect(payload.timeCreated).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
      expect(payload.timeResolved).toBe(undefined);
      expect(payload.id).toBe('123');
      expect(payload.title).toBe('foo');
      expect(payload.message).toBe(JSON.stringify(storyData));
    });

    test('It should return assigned properties on create', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      fetchMock.mockResponse(JSON.stringify(storyData));

      var webhookData = webHookIncoming_create_with_labeled_16927;
      webhookData.actions[0].action = 'create';

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload.eventTime).toBe('2017-06-27T16:20:44Z');
      expect(payload.timeCreated).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
      expect(payload.timeResolved).toBe(undefined);
      expect(payload.id).toBe('123');
      expect(payload.title).toBe('foo');
      expect(payload.message).toBe(JSON.stringify(storyData));
    });

    test('It should return assigned properties on create without incident label', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      fetchMock.mockResponse(JSON.stringify(storyData));

      var webhookData = webHookIncoming_create_with_out_labeled_16927;

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload.eventTime).toBe('2017-06-27T16:20:44Z');
      expect(payload.timeCreated).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
      expect(payload.timeResolved).toBe(undefined);
      expect(payload.id).toBe('123');
      expect(payload.title).toBe('foo');
      expect(payload.message).toBe(JSON.stringify(storyData));
    });

    test('It should return assigned properties on completed with override', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      storyData.id = 876;
      storyData.completed = true;
      storyData.completed_at = '2016-12-31T12:30:00Z';
      storyData.completed_at_override = '2017-12-31T12:30:00Z';

      var webhookData = webHookIncoming_labeled_16927;
      webhookData.actions[0].action = 'updated';

      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload.timeResolved).toBe(convertDateToUnixTimestamp('2017-12-31T12:30:00Z'));
    });

    test('It should return assigned properties on completed', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      storyData.id = 876;
      storyData.completed = true;
      storyData.completed_at = '2016-12-31T12:30:00Z';

      var webhookData = webHookIncoming_labeled_16927 || webHookIncoming_16927;
      webhookData.actions[0].action = 'updated';

      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload.eventTime).toBe('2017-06-27T16:20:44Z');
      expect(payload.timeCreated).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
      expect(payload.timeResolved).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
      expect(payload.id).toBe('876');
      expect(payload.title).toBe('foo');
      expect(payload.message).toBe(JSON.stringify(storyData));
    });

    test('It should mark unlabeled events are closed', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      var webhookData = webHookIncoming_remove_labeled_16927;

      Date.now = jest.fn(() => 1487076708000);
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });
      expect(payload.timeResolved).toBe(Date.now().toString());
    });

    test('It should mark unlabeled events are closed when label change occurs at the end of the actions', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      var webhookData = webHookIncoming_remove_labeled_16927;

      webhookData.actions = [webhookData.actions[1], webhookData.actions[0]];

      Date.now = jest.fn(() => 1487076708000);
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });
      expect(payload.timeResolved).toBe(Date.now().toString());
    });

    test('It should make updates with no labels as opened', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      var webhookData = webHookIncoming_no_label_changes_16927;

      Date.now = jest.fn(() => 1487076708000);
      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });
      expect(payload.timeResolved).toBe(undefined);
    });

    test('It should return assigned properties on archived', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      storyData.id = 876;
      storyData.archived = true;
      storyData.completed_at = '2016-12-31T12:30:00Z';

      var webhookData = webHookIncoming_labeled_16927;

      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload.timeResolved).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
    });

    test('It should parse the story id from the webhook payload', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      var webhookData = webHookIncoming_labeled_16927;
      webhookData.primary_id = 123456;

      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(fetchMock).toHaveBeenCalledWith('https://api.app.shortcut.com/api/v3/stories/123456', {
        headers: { 'Shortcut-Token': '11111111' }
      });
    });

    test('It should use the environment shortcut token', async () => {
      process.env.SHORTCUT_TOKEN = '222222';

      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      var webhookData = webHookIncoming_labeled_16927;
      webhookData.primary_id = 123456;

      fetchMock.mockResponse(JSON.stringify(storyData));

      const parser = new ShortcutParser();
      await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(fetchMock).toHaveBeenCalledWith('https://api.app.shortcut.com/api/v3/stories/123456', {
        headers: { 'Shortcut-Token': '222222' }
      });
    });
  });

  describe('Repository name', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
      process.env.SHORTCUT_INCIDENT_LABEL_ID = '2805';
      process.env.SHORTCUT_TOKEN = '11111111';
    });

    test('It should take in a typical Jira event and return the GitHub repository name', async () => {
      var storyData = genericStoryData;

      fetchMock.mockResponse(JSON.stringify(storyData));

      const expected = 'eHawk';
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
    });

    test('It should throw a ShortcutConfigurationError error if non-numeric shortcut label is provided', () => {
      process.env.SHORTCUT_TOKEN = 'ABC';
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
      process.env.SHORTCUT_INCIDENT_LABEL_ID = '1';

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
      process.env.SHORTCUT_INCIDENT_LABEL_ID = '1';

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
      var webhookData = webHookIncoming_labeled_16927;
      fetchMock.mockResponse(JSON.stringify({}));

      const parser = new ShortcutParser();
      
      expect.assertions(1);
      expect(parser.getPayload({
          headers: {},
          body: webhookData
        })).rejects.toThrowError(MissingShortcutFieldsError); 
    });
  });

  describe('Payloads', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
      process.env.SHORTCUT_INCIDENT_LABEL_ID = '2805';
      process.env.SHORTCUT_TOKEN = '11111111';
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
      var webhookData = webHookIncoming_labeled_16927;

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
