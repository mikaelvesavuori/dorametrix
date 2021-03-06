import { makeChange } from '../../../src/domain/valueObjects/Change';
import { makeEvent } from '../../../src/domain/valueObjects/Event';

import { BitbucketParser } from '../../../src/domain/application/BitbucketParser';
import { DirectParser } from '../../../src/domain/application/DirectParser';
import { GitHubParser } from '../../../src/domain/application/GitHubParser';

import { MissingProductValueError } from '../../../src/domain/errors/MissingProductValueError';
import { MissingEventTypeValueError } from '../../../src/domain/errors/MissingEventTypeValueError';
import { MissingIdValueError } from '../../../src/domain/errors/MissingIdValueError';

import bitbucketPush from '../../../testdata/webhook-events/bitbucket/push.json';
import { bitbucketPushHeaders } from '../../../testdata/headers/bitbucket';

import githubPush from '../../../testdata/webhook-events/github/push.json';
import { githubPushHeaders } from '../../../testdata/headers/github';

describe('Failure cases', () => {
  test('It should throw a MissingProductValueError if missing the "product" property', () => {
    expect(() =>
      makeChange({
        eventType: 'something',
        id: 'something'
      })
    ).toThrowError(MissingProductValueError);
  });

  test('It should throw a MissingEventTypeValueError if missing the "eventType" property', () => {
    expect(() =>
      makeChange({
        product: 'something',
        id: 'something'
      })
    ).toThrowError(MissingEventTypeValueError);
  });

  test('It should throw a MissingIdValueError if missing the "id" property', () => {
    expect(() =>
      makeChange({
        product: 'something',
        eventType: 'something'
      })
    ).toThrowError(MissingIdValueError);
  });
});

describe('Success cases', () => {
  describe('Direct parser', () => {
    test('It should create a valid Change', () => {
      const parser = new DirectParser();
      const body = {
        eventType: 'change',
        product: 'demo'
      };
      const headers = {};

      const event = makeEvent(parser, body, headers);
      const change = makeChange(event);

      expect(change).toHaveProperty('eventType');
      expect(change).toHaveProperty('id');
      expect(change).toHaveProperty('product');
      expect(change).toHaveProperty('timeCreated');
    });
  });

  describe('Bitbucket parser', () => {
    test('It should create a valid Change', () => {
      const parser = new BitbucketParser();
      const body = bitbucketPush;
      const headers = bitbucketPushHeaders;

      const event = makeEvent(parser, body, headers);
      const change = makeChange(event);

      expect(change).toHaveProperty('eventType');
      expect(change).toHaveProperty('id');
      expect(change).toHaveProperty('product');
      expect(change).toHaveProperty('timeCreated');
    });
  });

  describe('GitHub parser', () => {
    test('It should create a valid Change', () => {
      const parser = new GitHubParser();
      const body = githubPush;
      const headers = githubPushHeaders;

      const event = makeEvent(parser, body, headers);
      const change = makeChange(event);

      expect(change).toHaveProperty('eventType');
      expect(change).toHaveProperty('id');
      expect(change).toHaveProperty('product');
      expect(change).toHaveProperty('timeCreated');
    });
  });
});
