import { describe, test, expect } from 'vitest';

import { BitbucketParser } from '../../../src/application/parsers/BitbucketParser';

import {
  UnknownEventTypeError,
  MissingEventTimeError
} from '../../../src/application/errors/errors';

describe('Success cases', () => {
  describe('Event types', () => {
    test('It should take in a "repo:push" event and return "change"', async () => {
      const parser = new BitbucketParser();
      const eventType = await parser.getEventType({
        headers: {
          'x-event-key': 'repo:push'
        }
      });
      expect(eventType).toBe('change');
    });

    test('It should take in a "issue:created" event and return "incident"', async () => {
      const parser = new BitbucketParser();
      const eventType = await parser.getEventType({
        headers: {
          'x-event-key': 'issue:created'
        }
      });
      expect(eventType).toBe('incident');
    });

    test('It should take in a "issue:updated" event and return "incident"', async () => {
      const parser = new BitbucketParser();
      const eventType = await parser.getEventType({
        headers: {
          'x-event-key': 'issue:updated'
        }
      });
      expect(eventType).toBe('incident');
    });
  });

  describe('Payloads', () => {
    test('It should take in a typical Bitbucket "repo:push" event and return time created and ID', async () => {
      const parser = new BitbucketParser();
      const payload = await parser.getPayload({
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

    test('It should take in a typical Bitbucket "issue:updated" (status is "resolved") event and return time created and ID', async () => {
      const parser = new BitbucketParser();
      const payload = await parser.getPayload({
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

    test('It should take in a typical Bitbucket "issue:updated" (labeled with "bug") event and return time created and ID', async () => {
      const parser = new BitbucketParser();
      const payload = await parser.getPayload({
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

    test('It should take in a typical Bitbucket "issue:updated" (unlabeled "bug") event and return time created and ID', async () => {
      const parser = new BitbucketParser();
      const payload = await parser.getPayload({
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

  describe('Repository name', () => {
    test('It should take in a typical Bitbucket event and return the repository name', async () => {
      const parser = new BitbucketParser();
      const repoName = parser.getRepoName({
        repository: {
          full_name: 'SOMEORG/SOMEREPO'
        }
      });
      expect(repoName).toBe('SOMEORG/SOMEREPO');
    });

    test('It should take in a typical Bitbucket event and return an empty string if it is missing', async () => {
      const parser = new BitbucketParser();
      const repoName = parser.getRepoName({});
      expect(repoName).toBe('');
    });

    test('It should take in a typical Bitbucket event and return an empty string even if no input is provided', async () => {
      const parser = new BitbucketParser();
      // @ts-ignore
      const repoName = parser.getRepoName();
      expect(repoName).toBe('');
    });
  });
});

describe('Failure cases', () => {
  describe('Event types', () => {
    test('It should throw an UnknownEventTypeError if event type is unknown', async () => {
      const parser = new BitbucketParser();
      try {
        await parser.getEventType({
          headers: {
            asdf: '12345'
          }
        });
      } catch (e) {
        expect(e).toBeInstanceOf(UnknownEventTypeError);
      }
    });
  });

  describe('Payloads', () => {
    test('It should throw a MissingEventTimeError if event time is missing', async () => {
      const parser = new BitbucketParser();
      try {
        await parser.getPayload({
          headers: {
            'x-event-key': 'issue:created',
            'x-hook-uuid': '1234-asdf-8080-PING'
          }
        });
      } catch (e) {
        expect(e).toBeInstanceOf(MissingEventTimeError);
      }
    });

    test('It should return the default case if payload is unknown', async () => {
      const parser = new BitbucketParser();
      const payload = await parser.getPayload({
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

    expect.assertions(1);
    expect(
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
    ).rejects.toThrowError(MissingEventTimeError);
  });

  test('It should throw a MissingEventTimeError if a "issue:updated" event does not include a "created_on" timestamp', () => {
    const parser = new BitbucketParser();

    expect.assertions(1);
    expect(
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
    ).rejects.toThrowError(MissingEventTimeError);
  });

  test('It should throw a MissingEventTimeError if a "issue:updated" event does not include a "updated_on" timestamp', () => {
    const parser = new BitbucketParser();

    expect.assertions(1);
    expect(
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
    ).rejects.toThrowError(MissingEventTimeError);
  });
});
