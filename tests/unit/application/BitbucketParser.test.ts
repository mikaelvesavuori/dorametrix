import { BitbucketParser } from '../../../src/application/parsers/BitbucketParser';

import { UnknownEventType } from '../../../src/application/errors/UnknownEventType';
import { MissingEventTimeError } from '../../../src/application/errors/MissingEventTimeError';

describe('Failure cases', () => {
  describe('Event types', () => {
    test('It should throw an UnknownEventType if event type is unknown', async () => {
      const parser = new BitbucketParser();
      expect(() =>
        parser.getEventType({
          headers: {
            asdf: '12345'
          }
        })
      ).toThrowError(UnknownEventType);
    });
  });

  describe('Payloads', () => {
    test('It should throw a MissingEventTimeError if event time is missing', () => {
      const parser = new BitbucketParser();
      expect(() =>
        parser.getPayload({
          headers: {
            'x-event-key': 'issue:created',
            'x-hook-uuid': '1234-asdf-8080-PING'
          }
        })
      ).toThrowError(MissingEventTimeError);
    });

    test('It should return the default case if payload is unknown', () => {
      const parser = new BitbucketParser();
      const payload = parser.getPayload({
        headers: {
          'x-event-key': 'nothing-that-exists'
        }
      });
      expect(payload).toMatchObject({
        eventTime: 'UNKNOWN',
        id: 'UNKNOWN',
        message: 'UNKNOWN',
        timeCreated: 'UNKNOWN'
      });
    });
  });

  test('It should throw a MissingEventTimeError if a "repo:push" event does not include a timestamp', () => {
    const parser = new BitbucketParser();
    expect(() =>
      parser.getPayload({
        headers: {
          'x-event-key': 'repo:push',
          'x-event-time': '2021-12-31T10:01:37Z',
          'x-hook-uuid': '1234-asdf-8080-PING'
        },
        body: {
          push: {
            changes: [
              {
                old: {
                  target: {}
                },
                new: {
                  target: {
                    hash: '123412341234'
                  }
                }
              }
            ]
          }
        }
      })
    ).toThrowError(MissingEventTimeError);
  });

  test('It should throw a MissingEventTimeError if a "issue:updated" event does not include a "created_on" timestamp', () => {
    const parser = new BitbucketParser();
    expect(() =>
      parser.getPayload({
        headers: {
          'x-event-key': 'issue:updated',
          'x-event-time': '2021-12-31T10:01:37Z',
          'x-hook-uuid': '1234-asdf-8080-PING'
        },
        body: {
          issue: {
            id: 1,
            updated_on: '2022-01-30T20:27:56.607215+00:00'
          },
          changes: {
            status: {
              new: 'resolved'
            }
          }
        }
      })
    ).toThrowError(MissingEventTimeError);
  });

  test('It should throw a MissingEventTimeError if a "issue:updated" event does not include a "updated_on" timestamp', () => {
    const parser = new BitbucketParser();
    expect(() =>
      parser.getPayload({
        headers: {
          'x-event-key': 'issue:updated',
          'x-event-time': '2021-12-31T10:01:37Z',
          'x-hook-uuid': '1234-asdf-8080-PING'
        },
        body: {
          issue: {
            id: 1,
            created_on: '2022-01-30T20:25:08.657085+00:00'
          },
          changes: {
            status: {
              new: 'resolved'
            }
          }
        }
      })
    ).toThrowError(MissingEventTimeError);
  });
});

describe('Success cases', () => {
  describe('Event types', () => {
    test('It should take in a "repo:push" event and return "change"', () => {
      const parser = new BitbucketParser();
      const eventType = parser.getEventType({
        headers: {
          'x-event-key': 'repo:push'
        }
      });
      expect(eventType).toBe('change');
    });

    test('It should take in a "issue:created" event and return "incident"', () => {
      const parser = new BitbucketParser();
      const eventType = parser.getEventType({
        headers: {
          'x-event-key': 'issue:created'
        }
      });
      expect(eventType).toBe('incident');
    });

    test('It should take in a "issue:updated" event and return "incident"', () => {
      const parser = new BitbucketParser();
      const eventType = parser.getEventType({
        headers: {
          'x-event-key': 'issue:updated'
        }
      });
      expect(eventType).toBe('incident');
    });
  });

  describe('Payloads', () => {
    test('It should take in a typical Bitbucket "repo:push" event and return time created and ID', () => {
      const parser = new BitbucketParser();
      const payload = parser.getPayload({
        headers: {
          'x-event-key': 'repo:push',
          'x-event-time': '2021-12-31T10:01:37Z',
          'x-hook-uuid': '1234-asdf-8080-PING'
        },
        body: {
          push: {
            changes: [
              {
                old: {
                  target: {
                    date: '2022-01-18T16:45:22+00:00'
                  }
                },
                new: {
                  target: {
                    hash: '123412341234'
                  }
                }
              }
            ]
          }
        }
      });

      expect(payload).toHaveProperty('id');
      expect(payload).toHaveProperty('timeCreated');
    });

    test('It should take in a typical Bitbucket "issue:updated" (status is "resolved") event and return time created and ID', () => {
      const parser = new BitbucketParser();
      const payload = parser.getPayload({
        headers: {
          'x-event-key': 'issue:updated'
        },
        body: {
          issue: {
            id: 1,
            created_on: '2022-01-30T20:25:08.657085+00:00',
            updated_on: '2022-01-30T20:27:56.607215+00:00'
          },
          changes: {
            status: {
              new: 'resolved'
            }
          }
        }
      });

      expect(payload).toHaveProperty('id');
      expect(payload).toHaveProperty('timeCreated');
    });

    test('It should take in a typical Bitbucket "issue:updated" (labeled with "bug") event and return time created and ID', () => {
      const parser = new BitbucketParser();
      const payload = parser.getPayload({
        headers: {
          'x-event-key': 'issue:updated'
        },
        body: {
          issue: {
            id: 1,
            created_on: '2022-01-30T20:25:08.657085+00:00'
          },
          changes: {
            kind: {
              new: 'bug'
            }
          }
        }
      });

      expect(payload).toHaveProperty('id');
      expect(payload).toHaveProperty('timeCreated');
    });

    test('It should take in a typical Bitbucket "issue:updated" (unlabeled "bug") event and return time created and ID', () => {
      const parser = new BitbucketParser();
      const payload = parser.getPayload({
        headers: {
          'x-event-key': 'issue:updated'
        },
        body: {
          issue: {
            id: 1,
            created_on: '2022-01-30T20:25:08.657085+00:00',
            updated_on: '2022-01-30T20:27:56.607215+00:00'
          },
          changes: {
            kind: {
              new: 'something-else'
            }
          }
        }
      });

      expect(payload).toHaveProperty('id');
      expect(payload).toHaveProperty('timeCreated');
    });
  });

  describe('Product name', () => {
    test('It should take in a typical Bitbucket event and return the product name', () => {
      const parser = new BitbucketParser();
      const productName = parser.getProductName({
        repository: {
          project: {
            name: 'my-project'
          }
        }
      });
      expect(productName).toBe('my-project');
    });

    test('It should take in a typical Bitbucket event and return an empty string if it is missing', () => {
      const parser = new BitbucketParser();
      const productName = parser.getProductName({});
      expect(productName).toBe('');
    });

    test('It should take in a typical Bitbucket event and return an empty string even if no input is provided', () => {
      const parser = new BitbucketParser();
      // @ts-ignore
      const productName = parser.getProductName();
      expect(productName).toBe('');
    });
  });
});
