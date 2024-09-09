import { describe, test, expect } from 'vitest';

import { JiraParser } from '../../../src/application/parsers/JiraParser';

import {
  MissingEventTimeError,
  MissingIdError,
  MissingJiraFieldsError,
  MissingJiraMatchedCustomFieldKeyError
} from '../../../src/application/errors/errors';

describe('Success cases', () => {
  describe('Event types', () => {
    test('It should return "incident" for event types', async () => {
      const parser = new JiraParser();
      const eventType = await parser.getEventType();

      expect(eventType).toBe('incident');
    });
  });

  describe('Payloads', () => {
    test('It should return the provided event if it is unknown together with the a correct object', async () => {
      const parser = new JiraParser();
      const payload = await parser.getPayload({
        headers: {},
        body: {
          issue_event_type_name: 'something-else'
        }
      });

      expect(payload).toHaveProperty('eventTime');
      expect(payload).toHaveProperty('timeCreated');
      expect(payload).toHaveProperty('id');
      expect(payload).toHaveProperty('message');
    });

    test('It should take in an "issue created" ("issue_created") event and return a correct object', async () => {
      const parser = new JiraParser();
      const payload = await parser.getPayload({
        headers: {},
        body: {
          issue_event_type_name: 'issue_created',
          issue: {
            id: '10004',
            fields: {
              created: '2022-02-03T20:04:45.243+0100'
            }
          }
        }
      });

      expect(payload).toHaveProperty('eventTime');
      expect(payload).toHaveProperty('timeCreated');
      expect(payload).toHaveProperty('id');
      expect(payload).toHaveProperty('message');
    });

    test('It should take in an "issue updated (resolved)" ("issue_generic") event and return a correct object', async () => {
      const parser = new JiraParser();
      const payload = await parser.getPayload({
        headers: {},
        body: {
          issue_event_type_name: 'issue_generic',
          issue: {
            id: '10004',
            fields: {
              created: '2022-02-03T20:04:45.243+0100',
              updated: '2022-02-03T20:05:45.243+0100',
              summary: 'Test issue'
            }
          },
          changelog: {
            id: '10014',
            items: [
              {
                field: 'resolution',
                fieldtype: 'jira',
                fieldId: 'resolution',
                from: null,
                fromString: null,
                to: '10000',
                toString: 'Done'
              },
              {
                field: 'status',
                fieldtype: 'jira',
                fieldId: 'status',
                from: '10000',
                fromString: 'Backlog',
                to: '10002',
                toString: 'Done'
              }
            ]
          }
        }
      });

      expect(payload).toHaveProperty('eventTime');
      expect(payload).toHaveProperty('timeCreated');
      expect(payload).toHaveProperty('id');
      expect(payload).toHaveProperty('message');
    });

    test('It should take in an "issue deleted" event and return a correct object', async () => {
      const parser = new JiraParser();
      const payload = await parser.getPayload({
        headers: {},
        body: {
          webhookEvent: 'jira:issue_deleted',
          issue: {
            id: '10004',
            fields: {
              created: '2022-02-03T20:04:45.243+0100',
              updated: '2022-02-03T20:05:45.243+0100',
              summary: 'Test issue'
            }
          }
        }
      });

      expect(payload).toHaveProperty('eventTime');
      expect(payload).toHaveProperty('timeCreated');
      expect(payload).toHaveProperty('id');
      expect(payload).toHaveProperty('message');
    });

    test('It should take in a "labeled as incident" ("issue_updated") event and return a correct object', async () => {
      const parser = new JiraParser();
      const payload = await parser.getPayload({
        headers: {},
        body: {
          issue_event_type_name: 'issue_updated',
          issue: {
            id: '10004',
            fields: {
              created: '2022-02-03T20:04:45.243+0100',
              updated: '2022-02-03T20:05:45.243+0100',
              summary: 'Test issue'
            }
          },
          changelog: {
            id: '10014',
            items: [
              {
                toString: 'incident'
              }
            ]
          }
        }
      });

      expect(payload).toHaveProperty('eventTime');
      expect(payload).toHaveProperty('timeCreated');
      expect(payload).toHaveProperty('id');
      expect(payload).toHaveProperty('message');
    });

    test('It should take in a "labeled as something other than incident" ("issue_updated") event and return a correct object', async () => {
      const parser = new JiraParser();
      const payload = await parser.getPayload({
        headers: {},
        body: {
          issue_event_type_name: 'issue_updated',
          issue: {
            id: '10004',
            fields: {
              created: '2022-02-03T20:04:45.243+0100',
              updated: '2022-02-03T20:05:45.243+0100',
              summary: 'Test issue'
            }
          },
          changelog: {
            id: '10014',
            items: [
              {
                toString: 'something-else'
              }
            ]
          }
        }
      });

      expect(payload).toHaveProperty('eventTime');
      expect(payload).toHaveProperty('timeCreated');
      expect(payload).toHaveProperty('id');
      expect(payload).toHaveProperty('message');
    });
  });

  describe('Repository name', () => {
    test('It should take in a typical Jira event and return the GitHub repository name', async () => {
      const expected = 'SOMEORG/SOMEREPO';

      const parser = new JiraParser();
      const repoName = parser.getRepoName({
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

    test('It should take in a typical Jira event and return the Bitbucket repository name', async () => {
      const expected = 'SOMEORG/SOMEREPO';

      const parser = new JiraParser();
      const repoName = parser.getRepoName({
        user: {
          self: 'https://something.atlassian.net/rest/api/2/user?accountId=12345-123asd-12ab12-1234567-abcdefg'
        },
        issue: {
          id: '10004',
          fields: {
            created: '2022-02-03T20:04:45.243+0100',
            customfield_10035: `https://bitbucket.org/${expected}`
          }
        }
      });
      expect(repoName).toBe(expected);
    });

    test('It should take in a typical Jira event and return the Bitbucket repository name from longform input', async () => {
      const expected = 'SOMEORG/SOMEREPO';

      const parser = new JiraParser();
      const repoName = parser.getRepoName({
        user: {
          self: 'https://something.atlassian.net/rest/api/2/user?accountId=12345-123asd-12ab12-1234567-abcdefg'
        },
        issue: {
          id: '10004',
          fields: {
            created: '2022-02-03T20:04:45.243+0100',
            customfield_10035: `https://bitbucket.org/${expected}/src/master/`
          }
        }
      });
      expect(repoName).toBe(expected);
    });
  });
});

describe('Failure cases', () => {
  describe('Payloads', () => {
    test('It should throw a MissingEventTimeError if "issue created" event is missing a timestamp', () => {
      const parser = new JiraParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          headers: {},
          body: {
            issue_event_type_name: 'issue_created',
            issue: {
              id: '10004',
              fields: {}
            }
          }
        })
      ).rejects.toThrowError(MissingEventTimeError);
    });
  });

  test('It should throw a MissingIdError if "issue closed/unlabeled" event is missing an ID', () => {
    const parser = new JiraParser();

    expect.assertions(1);
    expect(
      parser.getPayload({
        headers: {},
        body: {
          issue_event_type_name: 'issue_created',
          issue: {
            fields: {
              created: '2022-02-03T20:04:45.243+0100'
            }
          }
        }
      })
    ).rejects.toThrowError(MissingIdError);
  });

  test('It should throw a MissingEventTimeError if "issue updated (resolved)" event is missing a creation timestamp', () => {
    const parser = new JiraParser();

    expect.assertions(1);
    expect(
      parser.getPayload({
        headers: {},
        body: {
          issue_event_type_name: 'issue_generic',
          issue: {
            id: '10004',
            fields: {
              updated: '2022-02-03T20:05:45.243+0100',
              summary: 'Test issue'
            }
          },
          changelog: {
            id: '10014',
            items: [
              {
                field: 'resolution',
                toString: 'Done'
              }
            ]
          }
        }
      })
    ).rejects.toThrowError(MissingEventTimeError);
  });

  test('It should throw a MissingEventTimeError if "issue updated (resolved)" event is missing an updated timestamp', () => {
    const parser = new JiraParser();

    expect.assertions(1);
    expect(
      parser.getPayload({
        headers: {},
        body: {
          issue_event_type_name: 'issue_generic',
          issue: {
            id: '10004',
            fields: {
              created: '2022-02-03T20:04:45.243+0100',
              summary: 'Test issue'
            }
          },
          changelog: {
            id: '10014',
            items: [
              {
                field: 'resolution',
                toString: 'Done'
              }
            ]
          }
        }
      })
    ).rejects.toThrowError(MissingEventTimeError);
  });

  test('It should throw a MissingJiraFieldsError if the "fields" object is missing', () => {
    const parser = new JiraParser();

    expect(() => parser.getRepoName({})).toThrow(MissingJiraFieldsError);
  });

  test('It should throw a MissingJiraFieldsError if the input is missing', () => {
    const parser = new JiraParser();

    // @ts-ignore
    expect(() => parser.getRepoName()).toThrow(MissingJiraFieldsError);
  });

  test('It should throw a MissingJiraMatchedCustomFieldKeyError if there is no repository URL in a custom field', () => {
    const parser = new JiraParser();

    expect(() =>
      parser.getRepoName({
        issue: {
          fields: {}
        }
      })
    ).toThrow(MissingJiraMatchedCustomFieldKeyError);
  });
});
