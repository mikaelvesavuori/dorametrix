import { describe, test, expect } from 'vitest';

import { DirectParser } from '../../../src/application/parsers/DirectParser';

import { UnknownEventTypeError } from '../../../src/application/errors/errors';

describe('Failure cases', () => {
  test('It should throw an UnknownEventTypeError if event type is unknown', async () => {
    const parser = new DirectParser();
    try {
      await parser.getEventType({
        body: {
          asdf: '1234'
        }
      });
    } catch (e) {
      expect(e).toBeInstanceOf(UnknownEventTypeError);
    }
  });
});

describe('Success cases', () => {
  describe('Event types', () => {
    test('It should take in a "change" event and return "change"', async () => {
      const parser = new DirectParser();
      const eventType = await parser.getEventType({
        body: {
          eventType: 'change'
        }
      });
      expect(eventType).toBe('change');
    });
  });

  describe('Payloads', () => {
    test('It should take in a typical "direct call" event and return time created and ID', async () => {
      const parser = new DirectParser();
      const payload = await parser.getPayload();
      expect(payload).toHaveProperty('timeCreated');
      expect(payload).toHaveProperty('id');
    });
  });

  describe('Repository name', () => {
    test('It should take in a typical "direct call" event and return the repository name', async () => {
      const parser = new DirectParser();
      const repoName = parser.getRepoName({
        repo: 'SOMEORG/SOMEREPO'
      });
      expect(repoName).toBe('SOMEORG/SOMEREPO');
    });

    test('It should take in a typical "direct call" event and return an empty string if it is missing', async () => {
      const parser = new DirectParser();
      const repoName = parser.getRepoName({});
      expect(repoName).toBe('');
    });

    test('It should take in a typical "direct call" event and return an empty string even if no input is provided', async () => {
      const parser = new DirectParser();
      // @ts-ignore
      const repoName = parser.getRepoName();
      expect(repoName).toBe('');
    });
  });
});
