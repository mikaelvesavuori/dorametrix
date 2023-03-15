import axios from 'axios';
import { ShortcutParser } from '../../../src/application/parsers/ShortcutParser';

import { convertDateToUnixTimestamp } from 'chrono-utils';


import {
  MissingIdError,
  MissingShortcutFieldsError,
} from '../../../src/application/errors/errors';


const webHookIncoming_16927 = {
  id: "595285dc-9c43-4b9c-a1e6-0cd9aff5b084",
  changed_at: "2017-06-27T16:20:44Z",
  primary_id: 16927,
  member_id: "56d8a839-1c52-437f-b981-c3a15a11d6d4",
  version: "v1",
  actions: [
    {
      id: 16927,
      entity_type: "story",
      action: "update",
      name: "test story",
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
          adds: ["56d8a839-1c52-437f-b981-c3a15a11d6d4"]
        }
      }
    }
  ]
}


const webHookIncoming_labeled_16927 = {
  id: "595285dc-9c43-4b9c-a1e6-0cd9aff5b084",
  changed_at: "2017-06-27T16:20:44Z",
  primary_id: 16927,
  member_id: "56d8a839-1c52-437f-b981-c3a15a11d6d4",
  version: "v1",
  actions: [
    {
        "id": 2507,
        "entity_type": "story",
        "action": "update",
        "name": "Deploy current product to np-usea1-3",
        "story_type": "feature",
        "app_url": "https://app.shortcut.com/ehawk/story/2507",
        "changes": {
            "label_ids": {
                "adds": [
                    2805
                ]
            }
        }
    }
  ],
  "references": [
      {
          "id": 2805,
          "entity_type": "label",
          "name": "Incident",
          "app_url": "https://app.shortcut.com/ehawk/label/2805"
      }
  ]
}

const webHookIncoming_remove_labeled_16927 = {
  id: "595285dc-9c43-4b9c-a1e6-0cd9aff5b084",
  changed_at: "2017-06-27T16:20:44Z",
  primary_id: 16927,
  member_id: "56d8a839-1c52-437f-b981-c3a15a11d6d4",
  version: "v1",
  actions: [
    {
        "id": 2507,
        "entity_type": "story",
        "action": "update",
        "name": "Deploy current product to np-usea1-3",
        "story_type": "feature",
        "app_url": "https://app.shortcut.com/ehawk/story/2507",
        "changes": {
            "label_ids": {
                "removes": [
                    2805
                ]
            }
        }
    }
  ]
}

const webHookIncoming_no_label_changes_16927 = {
  id: "595285dc-9c43-4b9c-a1e6-0cd9aff5b084",
  changed_at: "2017-06-27T16:20:44Z",
  primary_id: 16927,
  member_id: "56d8a839-1c52-437f-b981-c3a15a11d6d4",
  version: "v1",
  actions: [
    {
        "id": 2507,
        "entity_type": "story",
        "action": "update",
        "name": "Deploy current product to np-usea1-3",
        "story_type": "feature",
        "app_url": "https://app.shortcut.com/ehawk/story/2507",
        "changes": { }
    }
  ]
}

const genericStoryData : Record<string, any> = {
  "archived": false,
  "completed": false,
  //"completed_at": "2016-12-31T12:30:00Z",
  //"completed_at_override": "2017-12-31T12:30:00Z",
  "created_at": "2016-12-31T12:30:00Z",
  "id": 123,
  "name": "foo",
  "started": true,
  "started_at": "2016-12-31T12:30:00Z",
  "started_at_override": "2016-12-31T12:30:00Z",
  "description": "foo desc"
}


describe('Success cases', () => {

  describe('Event types', () => {

    test('It should return "change" for event types', async () => {
      var storyData = genericStoryData;
      axios.get = jest.fn(() => Promise.resolve<any>(storyData));

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: { },
        body: webHookIncoming_16927
      });
      
      expect(eventType).toBe('change');
    });

    test('It should return "incident" for event types', async () => {
      var storyData = genericStoryData;
      axios.get = jest.fn(() => Promise.resolve<any>(storyData));

      const parser = new ShortcutParser();
      const eventType = await parser.getEventType({
        headers: { },
        body: webHookIncoming_labeled_16927
      });
      
      expect(eventType).toBe('incident');
    });
  });


  describe('Payloads', () => {
    test('It should return the provided event if it is unknown together with the a correct object', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      axios.get = jest.fn(() => Promise.resolve<any>({ data: storyData }));

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
      axios.get = jest.fn(() => Promise.resolve<any>( { data: storyData }));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webHookIncoming_labeled_16927
      });

      expect(payload.eventTime).toBe("2017-06-27T16:20:44Z");
      expect(payload.timeCreated).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
      expect(payload.timeResolved).toBe(undefined)
      expect(payload.id).toBe(123);
      expect(payload.title).toBe("foo");
      expect(payload.message).toBe(JSON.stringify(storyData));
    });

    test('It should return assigned properties on create', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));;
      axios.get = jest.fn(() => Promise.resolve<any>({ data: storyData }));

      var webhookData = webHookIncoming_labeled_16927
      webhookData.actions[0].action = "create";

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload.eventTime).toBe("2017-06-27T16:20:44Z");
      expect(payload.timeCreated).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
      expect(payload.timeResolved).toBe(undefined)
      expect(payload.id).toBe(123);
      expect(payload.title).toBe("foo");
      expect(payload.message).toBe(JSON.stringify(storyData));
    });


    test('It should return assigned properties on completed with override', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData))
      storyData.id = 876
      storyData.completed = true;
      storyData.completed_at = "2016-12-31T12:30:00Z"
      storyData.completed_at_override = "2017-12-31T12:30:00Z"

      var webhookData = webHookIncoming_labeled_16927
      webhookData.actions[0].action = "updated";

      axios.get = jest.fn(() => Promise.resolve<any>({ data: storyData }));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload.timeResolved).toBe(convertDateToUnixTimestamp('2017-12-31T12:30:00Z'));
    });

    test('It should return assigned properties on completed', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      storyData.id = 876
      storyData.completed = true;
      storyData.completed_at = "2016-12-31T12:30:00Z"

      var webhookData = webHookIncoming_labeled_16927 || webHookIncoming_16927
      webhookData.actions[0].action = "updated";

      axios.get = jest.fn(() => Promise.resolve<any>({ data: storyData }));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload.eventTime).toBe("2017-06-27T16:20:44Z");
      expect(payload.timeCreated).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
      expect(payload.timeResolved).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
      expect(payload.id).toBe(876);
      expect(payload.title).toBe("foo");
      expect(payload.message).toBe(JSON.stringify(storyData));
    });

    test('It should mark unlabeled events are closed', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));;
      var webhookData = webHookIncoming_remove_labeled_16927

      Date.now = jest.fn(() => 1487076708000) 
      axios.get = jest.fn(() => Promise.resolve<any>({ data: storyData }));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });
      expect(payload.timeResolved).toBe(Date.now().toString());
    });

    test('It should make updates with no labels as opened', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));;
      var webhookData = webHookIncoming_no_label_changes_16927

      Date.now = jest.fn(() => 1487076708000) 
      axios.get = jest.fn(() => Promise.resolve<any>({ data: storyData }));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });
      expect(payload.timeResolved).toBe(undefined)
    });

    test('It should return assigned properties on archived', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));;
      storyData.id = 876
      storyData.archived = true;
      storyData.completed_at = "2016-12-31T12:30:00Z"

      var webhookData = webHookIncoming_labeled_16927
      webhookData.actions[0].action = "create";

      axios.get = jest.fn(() => Promise.resolve<any>({ data: storyData }));

      const parser = new ShortcutParser();
      const payload = await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(payload.timeResolved).toBe(convertDateToUnixTimestamp('2016-12-31T12:30:00Z'));
    });

    test('It should used cached data to prevent excess api calls', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));;
      storyData.id = 876
      storyData.archived = true;
      storyData.completed_at = "2016-12-31T12:30:00Z"

      var webhookData = webHookIncoming_labeled_16927
      webhookData.actions[0].action = "created";

      axios.get = jest.fn(() => Promise.resolve<any>({ data: storyData }));
      const spy = jest.spyOn(axios, 'get');

      const parser = new ShortcutParser();
      await parser.getPayload({
        headers: {},
        body: webhookData
      });

      await parser.getPayload({
        headers: {},
        body: webhookData
      });

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('It should parse the story id from the webhook payload', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      var webhookData = webHookIncoming_labeled_16927
      webhookData.primary_id = 123456;

      const mockCallback = jest.fn((url, header) => {
        console.log(url, header);
        return Promise.resolve<any>({ data: storyData });
      });

      axios.get = mockCallback

      const parser = new ShortcutParser();
      await parser.getPayload({
        headers: {},
        body: webhookData
      });

   
      const argUrl = 0;
      expect(mockCallback.mock.calls[0][argUrl]).toBe("https://api.app.shortcut.com/api/v3/stories/123456");
    });

    test('It should use the environment shortcut token', async () => {
      var storyData = JSON.parse(JSON.stringify(genericStoryData));
      var webhookData = webHookIncoming_labeled_16927
      webhookData.primary_id = 123456;

      const mockCallback = jest.fn((url, header) => {
        console.log(url, header);
        return Promise.resolve<any>({ data: storyData });
      });

      axios.get = mockCallback

      const parser = new ShortcutParser();
      await parser.getPayload({
        headers: {},
        body: webhookData
      });

   
      const argHeader = 1
      expect(mockCallback.mock.calls[0][argHeader].headers["Shortcut-Token"]).toBe("7c874900-b038-4ac8-89d6-813d6daea148")
    });
  });

  describe('Repository name', () => {
    test('It should take in a typical Jira event and return the GitHub repository name', async () => {
      var storyData = genericStoryData;
      axios.get = jest.fn(() => Promise.resolve<any>(storyData));

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
  describe('Event types', () => {
    test('It should throw a MissingShortcutFieldsError if webhook data is empty', async () => {
      var storyData = genericStoryData;
      axios.get = jest.fn(() => Promise.resolve<any>(storyData));

      const parser = new ShortcutParser();
      try {
        await parser.getEventType({
          headers: { },
          body: webHookIncoming_labeled_16927
        });
      } catch(e){
        expect(e).toBeInstanceOf(MissingShortcutFieldsError);
      }
    });

    test('It should throw a MissingShortcutFieldsError if story data is empty',async () => {
      var webhookData = webHookIncoming_labeled_16927

      axios.get = jest.fn(() => Promise.resolve<any>({ data : { } }));

      const parser = new ShortcutParser();

      try {
        await parser.getPayload({
            headers: {},
            body: webhookData
          })
      } catch(e){
        expect(e).toBeInstanceOf(MissingShortcutFieldsError);
      }
    });
  });
  describe('Payloads', () => {
    test('It should throw a MissingIdError if event is missing an ID',async () => {
      const webHookIncoming = {
        id: "595285dc-9c43-4b9c-a1e6-0cd9aff5b084",
        changed_at: "2017-06-27T16:20:44Z",
        member_id: "56d8a839-1c52-437f-b981-c3a15a11d6d4",
        version: "v1",
      }

      const parser = new ShortcutParser();
      try {
      await parser.getPayload({
          headers: {},
          body: webHookIncoming
        })
      } catch(e){
        expect(e).toBeInstanceOf(MissingIdError);
      }
    });

    test('It should throw a MissingShortcutFieldsError if webhook data is empty',async () => {
      const webHookIncoming = { }

      const parser = new ShortcutParser();
      try {
      await parser.getPayload({
          headers: {},
          body: webHookIncoming
        })
      } catch(e){
        expect(e).toBeInstanceOf(MissingShortcutFieldsError);
      }
    });

    test('It should throw a MissingShortcutFieldsError if webhook data is undefined',async () => {
      const parser = new ShortcutParser();
      try {
      await parser.getPayload({
          headers: {},
          body: undefined
        })
      } catch(e){
        expect(e).toBeInstanceOf(MissingShortcutFieldsError);
      }
    });

    test('It should throw a MissingShortcutFieldsError if story data is empty',async () => {
      var webhookData = webHookIncoming_labeled_16927

      axios.get = jest.fn(() => Promise.resolve<any>({ data : { } }));

      const parser = new ShortcutParser();

      try {
        await parser.getPayload({
            headers: {},
            body: webhookData
          })
      } catch(e){
        expect(e).toBeInstanceOf(MissingShortcutFieldsError);
      }
    });
  });
});