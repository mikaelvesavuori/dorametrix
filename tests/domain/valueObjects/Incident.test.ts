import { makeIncident } from '../../../src/domain/valueObjects/Incident';
import { makeEvent } from '../../../src/domain/valueObjects/Event';

import { BitbucketParser } from '../../../src/domain/application/BitbucketParser';
import { GitHubParser } from '../../../src/domain/application/GitHubParser';
import { DirectParser } from '../../../src/domain/application/DirectParser';

import { MissingProductValueError } from '../../../src/domain/errors/MissingProductValueError';
import { MissingEventTypeValueError } from '../../../src/domain/errors/MissingEventTypeValueError';
import { MissingIdValueError } from '../../../src/domain/errors/MissingIdValueError';

import bitbucketIssueCreated from '../../../testdata/webhook-events/bitbucket/issue-created.json';
import bitbucketIssueUpdatedResolved from '../../../testdata/webhook-events/bitbucket/issue-updated-resolved.json';
import {
  bitbucketIssueCreatedHeaders,
  bitbucketIssueUpdatedHeaders
} from '../../../testdata/headers/bitbucket';
import { githubIncidentHeaders } from '../../../testdata/headers/github';

describe('Failure cases', () => {
  test('It should throw a MissingProductValueError if missing the "product" property', () => {
    expect(() =>
      makeIncident({
        eventType: 'something',
        id: 'something'
      })
    ).toThrowError(MissingProductValueError);
  });

  test('It should throw a MissingEventTypeValueError if missing the "eventType" property', () => {
    expect(() =>
      makeIncident({
        product: 'something',
        id: 'something'
      })
    ).toThrowError(MissingEventTypeValueError);
  });

  test('It should throw a MissingIdValueError if missing the "id" property', () => {
    expect(() =>
      makeIncident({
        product: 'something',
        eventType: 'something'
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

      expect(incident).toHaveProperty('eventType');
      expect(incident).toHaveProperty('id');
      expect(incident).toHaveProperty('product');
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

      expect(incident).toHaveProperty('eventType');
      expect(incident).toHaveProperty('id');
      expect(incident).toHaveProperty('product');
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

      expect(incident).toHaveProperty('eventType');
      expect(incident).toHaveProperty('id');
      expect(incident).toHaveProperty('product');
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
          name: 'somerepo'
        }
      };
      const headers = githubIncidentHeaders;

      const event = makeEvent(parser, body, headers);
      const incident = makeIncident(event);

      expect(incident).toHaveProperty('eventType');
      expect(incident).toHaveProperty('id');
      expect(incident).toHaveProperty('product');
      expect(incident).toHaveProperty('timeCreated');
      expect(incident).toHaveProperty('timeResolved');
      expect(incident).toHaveProperty('title');
    });
  });
});
