import { describe, test, expect } from 'vitest';

import { makeIncident } from '../../../../src/domain/valueObjects/Incident';
import { makeEvent } from '../../../../src/domain/valueObjects/Event';

import { BitbucketParser } from '../../../../src/application/parsers/BitbucketParser';
import { GitHubParser } from '../../../../src/application/parsers/GitHubParser';
import { DirectParser } from '../../../../src/application/parsers/DirectParser';

import {
  MissingRepoNameError,
  MissingEventTypeValueError,
  MissingIdValueError
} from '../../../../src/application/errors/errors';

import bitbucketIssueCreated from '../../../../testdata/webhook-events/bitbucket/issue-created.json';
import bitbucketIssueUpdatedResolved from '../../../../testdata/webhook-events/bitbucket/issue-updated-resolved.json';
import {
  bitbucketIssueCreatedHeaders,
  bitbucketIssueUpdatedHeaders
} from '../../../../testdata/headers/bitbucket';
import { githubIncidentHeaders } from '../../../../testdata/headers/github';

describe('Failure cases', () => {
  test('It should throw a MissingRepoNameError if missing the "repo" property', () => {
    expect(() =>
      // @ts-ignore
      makeIncident({
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
      makeIncident({
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
      makeIncident({
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
    test('It should create a valid Incident', async () => {
      const parser = new DirectParser();
      const body = {
        eventType: 'incident',
        repo: 'demo'
      };
      const headers = {};

      const event = await makeEvent(parser, body, headers);
      const incident = makeIncident(event);

      expect(incident).toHaveProperty('repo');
      expect(incident).toHaveProperty('eventType');
      expect(incident).toHaveProperty('id');
      expect(incident).toHaveProperty('timeCreated');
      expect(incident).toHaveProperty('timeResolved');
      expect(incident).toHaveProperty('title');
    });
  });

  describe('Bitbucket parser', () => {
    test('It should create a valid Incident', async () => {
      const parser = new BitbucketParser();
      const body = bitbucketIssueCreated;
      const headers = bitbucketIssueCreatedHeaders;

      const event = await makeEvent(parser, body, headers);
      const incident = makeIncident(event);

      expect(incident).toHaveProperty('repo');
      expect(incident).toHaveProperty('eventType');
      expect(incident).toHaveProperty('id');
      expect(incident).toHaveProperty('timeCreated');
      expect(incident).toHaveProperty('timeResolved');
      expect(incident).toHaveProperty('title');
    });

    test('It should update a valid Incident', async () => {
      const parser = new BitbucketParser();
      const body = bitbucketIssueUpdatedResolved;
      const headers = bitbucketIssueUpdatedHeaders;

      const event = await makeEvent(parser, body, headers);
      const incident = makeIncident(event);

      expect(incident).toHaveProperty('repo');
      expect(incident).toHaveProperty('eventType');
      expect(incident).toHaveProperty('id');
      expect(incident).toHaveProperty('timeCreated');
      expect(incident).toHaveProperty('timeResolved');
      expect(incident).toHaveProperty('title');
    });
  });

  describe('GitHub parser', () => {
    test('It should create a valid Incident', async () => {
      const parser = new GitHubParser();
      const body = {
        repository: {
          full_name: 'somesomeuser/somereporepo'
        }
      };
      const headers = githubIncidentHeaders;

      const event = await makeEvent(parser, body, headers);
      const incident = makeIncident(event);

      expect(incident).toHaveProperty('repo');
      expect(incident).toHaveProperty('eventType');
      expect(incident).toHaveProperty('id');
      expect(incident).toHaveProperty('timeCreated');
      expect(incident).toHaveProperty('timeResolved');
      expect(incident).toHaveProperty('title');
    });
  });
});
