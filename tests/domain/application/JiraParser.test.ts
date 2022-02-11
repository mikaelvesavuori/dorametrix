import { JiraParser } from '../../../src/domain/application/JiraParser';

import { MissingEventTimeError } from '../../../src/domain/errors/MissingEventTimeError';
import { MissingIdError } from '../../../src/domain/errors/MissingIdError';

describe('Success cases', () => {
  describe('Payloads', () => {
    test('It should throw a MissingEventTimeError if "issue created" event is missing a timestamp', () => {
      const parser = new JiraParser();
      expect(() =>
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
      ).toThrowError(MissingEventTimeError);
    });
  });

  test('It should throw a MissingIdError if "issue closed/unlabeled" event is missing an ID', () => {
    const parser = new JiraParser();
    expect(() =>
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
    ).toThrowError(MissingIdError);
  });

  test('It should throw a MissingEventTimeError if "issue updated (resolved)" event is missing a creation timestamp', () => {
    const parser = new JiraParser();
    expect(() =>
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
    ).toThrowError(MissingEventTimeError);
  });

  test('It should throw a MissingEventTimeError if "issue updated (resolved)" event is missing an updated timestamp', () => {
    const parser = new JiraParser();
    expect(() =>
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
    ).toThrowError(MissingEventTimeError);
  });
});

describe('Success cases', () => {
  describe('Event types', () => {
    test('It should return "incident" for event types', () => {
      const parser = new JiraParser();
      const eventType = parser.getEventType();
      expect(eventType).toBe('incident');
    });
  });

  describe('Payloads', () => {
    test('It should return the provided event if it is unknown together with the a correct object', () => {
      const parser = new JiraParser();
      const payload = parser.getPayload({
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

    test('It should take in an "issue created" ("issue_created") event and return a correct object', () => {
      const parser = new JiraParser();
      const payload = parser.getPayload({
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

    test('It should take in an "issue updated (resolved)" ("issue_generic") event and return a correct object', () => {
      const parser = new JiraParser();
      const payload = parser.getPayload({
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

    test('It should take in an "issue deleted" event and return a correct object', () => {
      const parser = new JiraParser();
      const payload = parser.getPayload({
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

    test('It should take in a "labeled as incident" ("issue_updated") event and return a correct object', () => {
      const parser = new JiraParser();
      const payload = parser.getPayload({
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

    test('It should take in a "labeled as something other than incident" ("issue_updated") event and return a correct object', () => {
      const parser = new JiraParser();
      const payload = parser.getPayload({
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

  describe('Product name', () => {
    test('It should take in a typical Jira event and return the product name', () => {
      const parser = new JiraParser();
      const productName = parser.getProductName({
        issue: {
          id: '10004',
          fields: {
            created: '2022-02-03T20:04:45.243+0100',
            project: {
              name: 'my-project'
            }
          }
        }
      });
      expect(productName).toBe('my-project');
    });

    test('It should take in a typical Jira event and return an empty string if it is missing', () => {
      const parser = new JiraParser();
      const productName = parser.getProductName({});
      expect(productName).toBe('');
    });

    test('It should take in a typical Jira event and return an empty string even if no input is provided', () => {
      const parser = new JiraParser();
      // @ts-ignore
      const productName = parser.getProductName();
      expect(productName).toBe('');
    });
  });
});
