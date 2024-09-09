import { describe, test, expect } from 'vitest';

import { GitHubParser } from '../../../src/application/parsers/GitHubParser';

import {
  UnknownEventTypeError,
  MissingEventError,
  MissingEventTimeError,
  MissingIdError
} from '../../../src/application/errors/errors';

describe('Success cases', () => {
  describe('Event types', () => {
    test('Given a lower-case "push" event header, it should return "change"', async () => {
      const parser = new GitHubParser();
      const eventType = await parser.getEventType({
        headers: {
          'x-github-event': 'push'
        }
      });
      expect(eventType).toBe('change');
    });

    test('It should take in a "push" event and return "change"', async () => {
      const parser = new GitHubParser();
      const eventType = await parser.getEventType({
        headers: {
          'X-GitHub-Event': 'push'
        }
      });
      expect(eventType).toBe('change');
    });

    test('It should take in a "opened" event and return "incident"', async () => {
      const parser = new GitHubParser();
      const eventType = await parser.getEventType({
        headers: {
          'X-GitHub-Event': 'issues'
        },
        body: {
          action: 'opened'
        }
      });
      expect(eventType).toBe('incident');
    });

    test('It should take in a "closed" event and return "incident"', async () => {
      const parser = new GitHubParser();
      const eventType = await parser.getEventType({
        headers: {
          'X-GitHub-Event': 'issues'
        },
        body: {
          action: 'closed'
        }
      });
      expect(eventType).toBe('incident');
    });

    test('It should take in a "deleted" event and return "incident"', async () => {
      const parser = new GitHubParser();
      const eventType = await parser.getEventType({
        headers: {
          'X-GitHub-Event': 'issues'
        },
        body: {
          action: 'deleted'
        }
      });
      expect(eventType).toBe('incident');
    });

    test('It should take in a "labeled" event and return "incident"', async () => {
      const parser = new GitHubParser();
      const eventType = await parser.getEventType({
        headers: {
          'X-GitHub-Event': 'issues'
        },
        body: {
          action: 'labeled'
        }
      });
      expect(eventType).toBe('incident');
    });

    test('It should take in a "unlabeled" event and return "incident"', async () => {
      const parser = new GitHubParser();
      const eventType = await parser.getEventType({
        headers: {
          'X-GitHub-Event': 'issues'
        },
        body: {
          action: 'unlabeled'
        }
      });
      expect(eventType).toBe('incident');
    });
  });

  describe('Payloads', () => {
    test('It should take in a typical GitHub "push" event and return time created and ID', async () => {
      const parser = new GitHubParser();
      const payload = await parser.getPayload({
        headers: {
          'X-GitHub-Event': 'push'
        },
        body: {
          head_commit: {
            timestamp: '2021-12-31T10:01:37Z',
            id: '1234-asdf-8080-PING'
          }
        }
      });
      expect(payload).toMatchObject({
        timeCreated: '1640944897000',
        id: '1234-asdf-8080-PING'
      });
    });

    test('Given incident label(s) and a typical GitHub "opened" event, it should return time created and ID', async () => {
      const parser = new GitHubParser();
      const payload = await parser.getPayload({
        headers: {
          'X-GitHub-Event': 'issues'
        },
        body: {
          action: 'opened',
          issue: {
            created_at: '2021-12-31T10:01:37Z',
            id: '1234-asdf-8080-PING',
            labels: [
              {
                id: 3687227377,
                node_id: 'LA_kwDOGmxd2s7bxp_x',
                url: 'https://api.github.com/repos/someuser/somerepo/labels/incident',
                name: 'incident',
                color: 'B60205',
                default: false,
                description: 'Something broke'
              }
            ]
          }
        }
      });

      expect(payload).toMatchObject({
        timeCreated: '1640944897000',
        id: '1234-asdf-8080-PING'
      });
    });

    test('Given no incident label(s) and a typical GitHub "opened" event, it should return empty for id and timeCreated', async () => {
      const parser = new GitHubParser();
      const payload = await parser.getPayload({
        headers: {
          'X-GitHub-Event': 'issues'
        },
        body: {
          action: 'opened',
          issue: {
            created_at: '2021-12-31T10:01:37Z',
            id: '1234-asdf-8080-PING'
          }
        }
      });

      expect(payload).toMatchObject({
        timeCreated: '',
        id: ''
      });
    });

    test('It should take in a typical GitHub "unlabeled" event and return time created and ID', async () => {
      const parser = new GitHubParser();
      const payload = await parser.getPayload({
        headers: {
          'X-GitHub-Event': 'issues'
        },
        body: {
          action: 'unlabeled',
          issue: {
            created_at: '2021-12-31T09:01:37Z',
            updated_at: '2021-12-31T10:01:37Z',
            id: '1234-asdf-8080-PING'
          }
        }
      });
      expect(payload).toMatchObject({
        timeCreated: '1640941297000',
        id: '1234-asdf-8080-PING'
      });
    });

    test('It should take in a typical GitHub "closed" event and return time created and ID', async () => {
      const parser = new GitHubParser();
      const payload = await parser.getPayload({
        headers: {
          'X-GitHub-Event': 'issues'
        },
        body: {
          action: 'closed',
          issue: {
            created_at: '2021-12-31T10:01:37Z',
            closed_at: '2021-12-31T10:02:37Z',
            id: '1234-asdf-8080-PING'
          }
        }
      });
      expect(payload).toMatchObject({
        timeCreated: '1640944897000',
        id: '1234-asdf-8080-PING'
      });
    });

    test('It should handle unknown events', async () => {
      const parser = new GitHubParser();
      const payload = await parser.getPayload({
        headers: {
          'X-GitHub-Event': 'something_that_does_not_exist'
        },
        body: {
          issue: {
            created_at: '2021-12-31T10:01:37Z',
            closed_at: '2021-12-31T10:02:37Z',
            id: '1234-asdf-8080-PING'
          }
        }
      });
      expect(payload).toMatchObject({
        timeCreated: 'UNKNOWN',
        id: 'UNKNOWN'
      });
    });
  });

  describe('Repository name', () => {
    test('It should take in a typical GitHub event and return the repository name', async () => {
      const parser = new GitHubParser();
      const repoName = parser.getRepoName({
        repository: {
          full_name: 'SOMEORG/SOMEREPO'
        }
      });
      expect(repoName).toBe('SOMEORG/SOMEREPO');
    });

    test('It should take in a typical GitHub event and return an empty string if it is missing', async () => {
      const parser = new GitHubParser();
      const repoName = parser.getRepoName({});
      expect(repoName).toBe('');
    });

    test('It should take in a typical GitHub event and return an empty string even if no input is provided', async () => {
      const parser = new GitHubParser();
      // @ts-ignore
      const repoName = parser.getRepoName();
      expect(repoName).toBe('');
    });
  });
});

describe('Failure cases', () => {
  describe('General', () => {
    test('It should throw an UnknownEventTypeError if event type is unknown', () => {
      const parser = new GitHubParser();

      expect.assertions(1);
      expect(
        parser.getEventType({
          headers: {
            'X-GitHub-Event': '12345'
          }
        })
      ).rejects.toThrowError(UnknownEventTypeError);
    });

    test('It should throw a MissingEventError if no event is detected in headers', () => {
      const parser = new GitHubParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          body: {
            head_commit: {
              asdf: '1234'
            }
          },
          headers: {
            asdf: '1234'
          }
        })
      ).rejects.toThrowError(MissingEventError);
    });

    test('It should throw a MissingIdError if event ID is missing', () => {
      const parser = new GitHubParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          body: {
            head_commit: {
              timestamp: '1234'
            }
          },
          headers: {
            'X-GitHub-Event': 'push'
          }
        })
      ).rejects.toThrowError(MissingIdError);
    });
  });
  describe('Payloads', () => {
    test('It should throw a MissingEventTimeError if a GitHub "push" event is missing a timestamp', () => {
      const parser = new GitHubParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          headers: {
            'X-GitHub-Event': 'push'
          },
          body: {
            head_commit: {
              id: '1234-asdf-8080-PING'
            }
          }
        })
      ).rejects.toThrowError(MissingEventTimeError);
    });

    test('It should throw a MissingIdError if a GitHub "push" event is missing an ID', () => {
      const parser = new GitHubParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          headers: {
            'X-GitHub-Event': 'push'
          },
          body: {
            head_commit: {
              timestamp: '2021-12-31T10:01:37Z'
            }
          }
        })
      ).rejects.toThrowError(MissingIdError);
    });

    test('It should throw a MissingEventTimeError if a GitHub "labeled" event is missing a timestamp', () => {
      const parser = new GitHubParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          headers: {
            'X-GitHub-Event': 'issues'
          },
          body: {
            action: 'labeled',
            issue: {
              id: '1234-asdf-8080-PING'
            }
          }
        })
      ).rejects.toThrowError(MissingEventTimeError);
    });
    test('It should throw a MissingEventTimeError if a GitHub "closed" event is missing a "closed_at" timestamp', () => {
      const parser = new GitHubParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          headers: {
            'X-GitHub-Event': 'issues'
          },
          body: {
            action: 'closed',
            issue: {
              created_at: '2021-12-31T10:01:37Z'
            }
          }
        })
      ).rejects.toThrowError(MissingEventTimeError);
    });

    test('It should throw a MissingEventTimeError if a GitHub "unlabeled" event is missing a "closed_at" timestamp', () => {
      const parser = new GitHubParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          headers: {
            'X-GitHub-Event': 'issues'
          },
          body: {
            action: 'unlabeled',
            issue: {
              created_at: '2021-12-31T10:01:37Z'
            }
          }
        })
      ).rejects.toThrowError(MissingEventTimeError);
    });

    test('It should throw a MissingIdError if a GitHub "labeled" event is missing a timestamp', () => {
      const parser = new GitHubParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          headers: {
            'X-GitHub-Event': 'issues'
          },
          body: {
            action: 'labeled',
            issue: {
              created_at: '2021-12-31T10:01:37Z'
            }
          }
        })
      ).rejects.toThrowError(MissingIdError);
    });

    test('It should throw a MissingEventTimeError if a GitHub "unlabeled" event is missing a timestamp', () => {
      const parser = new GitHubParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          headers: {
            'X-GitHub-Event': 'issues'
          },
          body: {
            action: 'unlabeled',
            issue: {
              id: '1234-asdf-8080-PING'
            }
          }
        })
      ).rejects.toThrowError(MissingEventTimeError);
    });

    test('It should throw a MissingIdError if a GitHub "unlabeled" event is missing a timestamp', () => {
      const parser = new GitHubParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          headers: {
            'X-GitHub-Event': 'issues'
          },
          body: {
            action: 'unlabeled',
            issue: {
              created_at: '2021-12-31T09:01:37Z',
              updated_at: '2021-12-31T10:01:37Z'
            }
          }
        })
      ).rejects.toThrowError(MissingIdError);
    });

    test('It should throw a MissingEventTimeError if a GitHub "closed" event is missing a timestamp', () => {
      const parser = new GitHubParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          headers: {
            'X-GitHub-Event': 'issues'
          },
          body: {
            action: 'closed',
            issue: {
              id: '1234-asdf-8080-PING'
            }
          }
        })
      ).rejects.toThrowError(MissingEventTimeError);
    });

    test('It should throw a MissingIdError if a GitHub "closed" event is missing a timestamp', () => {
      const parser = new GitHubParser();

      expect.assertions(1);
      expect(
        parser.getPayload({
          headers: {
            'X-GitHub-Event': 'issues'
          },
          body: {
            action: 'closed',
            issue: {
              created_at: '2021-12-31T10:01:37Z',
              closed_at: '2021-12-31T10:02:37Z'
            }
          }
        })
      ).rejects.toThrowError(MissingIdError);
    });
  });
});
