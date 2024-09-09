import { describe, test, expect } from 'vitest';

import { makeChange } from '../../../../src/domain/valueObjects/Change';
import { makeEvent } from '../../../../src/domain/valueObjects/Event';

import { BitbucketParser } from '../../../../src/application/parsers/BitbucketParser';
import { DirectParser } from '../../../../src/application/parsers/DirectParser';
import { GitHubParser } from '../../../../src/application/parsers/GitHubParser';

import {
  MissingRepoNameError,
  MissingEventTypeValueError,
  MissingIdValueError
} from '../../../../src/application/errors/errors';

import bitbucketPush from '../../../../testdata/webhook-events/bitbucket/push.json';
import { bitbucketPushHeaders } from '../../../../testdata/headers/bitbucket';

import githubPush from '../../../../testdata/webhook-events/github/push.json';
import { githubPushHeaders } from '../../../../testdata/headers/github';

describe('Failure cases', () => {
  test('It should throw a MissingRepoNameError if missing the "repo" property', () => {
    expect(() =>
      // @ts-ignore
      makeChange({
        eventType: 'deployment',
        id: 'something',
        changeSha: '',
        eventTime: '',
        timeCreated: '',
        timeResolved: '',
        title: '',
        message: '',
        date: ''
      })
    ).toThrowError(MissingRepoNameError);
  });

  test('It should throw a MissingEventTypeValueError if missing the "eventType" property', () => {
    expect(() =>
      // @ts-ignore
      makeChange({
        repo: 'something',
        id: 'something',
        changeSha: '',
        eventTime: '',
        timeCreated: '',
        timeResolved: '',
        title: '',
        message: '',
        date: ''
      })
    ).toThrowError(MissingEventTypeValueError);
  });

  test('It should throw a MissingIdValueError if missing the "id" property', () => {
    expect(() =>
      // @ts-ignore
      makeChange({
        repo: 'something',
        eventType: 'deployment',
        changeSha: '',
        eventTime: '',
        timeCreated: '',
        timeResolved: '',
        title: '',
        message: '',
        date: ''
      })
    ).toThrowError(MissingIdValueError);
  });
});

describe('Success cases', () => {
  describe('Direct parser', () => {
    test('It should create a valid Change', async () => {
      const parser = new DirectParser();
      const body = {
        eventType: 'change',
        repo: 'demo'
      };
      const headers = {};

      const event = await makeEvent(parser, body, headers);
      const change = makeChange(event);

      expect(change).toHaveProperty('eventType');
      expect(change).toHaveProperty('id');
      expect(change).toHaveProperty('repo');
      expect(change).toHaveProperty('timeCreated');
    });
  });

  describe('Bitbucket parser', () => {
    test('It should create a valid Change', async () => {
      const parser = new BitbucketParser();
      const body = bitbucketPush;
      const headers = bitbucketPushHeaders;

      const event = await makeEvent(parser, body, headers);
      const change = makeChange(event);

      expect(change).toHaveProperty('eventType');
      expect(change).toHaveProperty('id');
      expect(change).toHaveProperty('repo');
      expect(change).toHaveProperty('timeCreated');
    });
  });

  describe('GitHub parser', () => {
    test('It should create a valid Change', async () => {
      const parser = new GitHubParser();
      const body = githubPush;
      const headers = githubPushHeaders;

      const event = await makeEvent(parser, body, headers);
      const change = makeChange(event);

      expect(change).toHaveProperty('eventType');
      expect(change).toHaveProperty('id');
      expect(change).toHaveProperty('repo');
      expect(change).toHaveProperty('timeCreated');
    });
  });
});
