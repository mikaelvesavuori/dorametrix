import { makeIncident } from '../../../../src/domain/valueObjects/Incident';
import { makeEvent } from '../../../../src/domain/valueObjects/Event';

import { BitbucketParser } from '../../../../src/application/parsers/BitbucketParser';
import { GitHubParser } from '../../../../src/application/parsers/GitHubParser';
import { DirectParser } from '../../../../src/application/parsers/DirectParser';

import { MissingProductValueError } from '../../../../src/application/errors/MissingProductValueError';
import { MissingEventTypeValueError } from '../../../../src/application/errors/MissingEventTypeValueError';
import { MissingIdValueError } from '../../../../src/application/errors/MissingIdValueError';

import bitbucketIssueCreated from '../../../../testdata/webhook-events/bitbucket/issue-created.json';
import bitbucketIssueUpdatedResolved from '../../../../testdata/webhook-events/bitbucket/issue-updated-resolved.json';
import {
  bitbucketIssueCreatedHeaders,
  bitbucketIssueUpdatedHeaders
} from '../../../../testdata/headers/bitbucket';
import { githubIncidentHeaders } from '../../../../testdata/headers/github';

describe('Failure cases', () => {
  test('It should throw a MissingProductValueError if missing the "product" property', () => {
    expect(() =>
      // @ts-ignore
      makeIncident({
        eventType: 'deployment',
        id: 'something',
        changes: [''],
        eventTime: '',
        timeCreated: '',
        timeResolved: '',
        title: '',
        message: '',
        date: ''
      })
    ).toThrowError(MissingProductValueError);
  });

  test('It should throw a MissingEventTypeValueError if missing the "eventType" property', () => {
    expect(() =>
      // @ts-ignore
      makeIncident({
        product: 'something',
        id: 'something',
        changes: [''],
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
        product: 'something',
        eventType: 'deployment',
        changes: [''],
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
    test('It should create a valid Incident', () => {
      const parser = new DirectParser();
      const body = {
        eventType: 'incident',
        product: 'demo'
      };
      const headers = {};

      const event = makeEvent(parser, body, headers);
      const incident = makeIncident(event);
      console.log('-->', incident);

      expect(incident).toHaveProperty('product');
      expect(incident).toHaveProperty('eventType');
      expect(incident).toHaveProperty('id');
      expect(incident).toHaveProperty('timeCreated');
      expect(incident).toHaveProperty('timeResolved');
      expect(incident).toHaveProperty('title');
    });
  });

  describe('Bitbucket parser', () => {
    test('It should create a valid Incident', () => {
      const parser = new BitbucketParser();
      const body = bitbucketIssueCreated;
      const headers = bitbucketIssueCreatedHeaders;

      const event = makeEvent(parser, body, headers);
      const incident = makeIncident(event);

      expect(incident).toHaveProperty('product');
      expect(incident).toHaveProperty('eventType');
      expect(incident).toHaveProperty('id');
      expect(incident).toHaveProperty('timeCreated');
      expect(incident).toHaveProperty('timeResolved');
      expect(incident).toHaveProperty('title');
    });

    test('It should update a valid Incident', () => {
      const parser = new BitbucketParser();
      const body = bitbucketIssueUpdatedResolved;
      const headers = bitbucketIssueUpdatedHeaders;

      const event = makeEvent(parser, body, headers);
      const incident = makeIncident(event);

      expect(incident).toHaveProperty('product');
      expect(incident).toHaveProperty('eventType');
      expect(incident).toHaveProperty('id');
      expect(incident).toHaveProperty('timeCreated');
      expect(incident).toHaveProperty('timeResolved');
      expect(incident).toHaveProperty('title');
    });
  });

  describe('GitHub parser', () => {
    test('It should create a valid Incident', () => {
      const parser = new GitHubParser();
      const body = {
        repository: {
          full_name: 'somesomeuser/somereporepo'
        }
      };
      const headers = githubIncidentHeaders;

      const event = makeEvent(parser, body, headers);
      const incident = makeIncident(event);

      expect(incident).toHaveProperty('product');
      expect(incident).toHaveProperty('eventType');
      expect(incident).toHaveProperty('id');
      expect(incident).toHaveProperty('timeCreated');
      expect(incident).toHaveProperty('timeResolved');
      expect(incident).toHaveProperty('title');
    });
  });
});
