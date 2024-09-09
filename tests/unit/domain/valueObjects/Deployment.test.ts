import { describe, test, expect } from 'vitest';

import { makeDeployment } from '../../../../src/domain/valueObjects/Deployment';
import { makeEvent } from '../../../../src/domain/valueObjects/Event';

import { DirectParser } from '../../../../src/application/parsers/DirectParser';

import {
  MissingRepoNameError,
  MissingEventTypeValueError,
  MissingIdValueError
} from '../../../../src/application/errors/errors';

describe('Failure cases', () => {
  test('It should throw a MissingRepoNameError if missing the "repo" property', () => {
    expect(() =>
      // @ts-ignore
      makeDeployment({
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
      makeDeployment({
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
      makeDeployment({
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
    test('It should create a valid Deployment', async () => {
      const parser = new DirectParser();
      const body = {
        eventType: 'deployment',
        repo: 'demo',
        changes: [
          {
            id: 'be022558-dca1-4876-84ef-c3b3b5f5cf34',
            timeCreated: '1642879177'
          },
          {
            id: '8274716a-4047-4a18-9428-f22e1d26730e',
            timeCreated: '1642874964'
          },
          {
            id: 'c5b43f9d-a722-41a8-8d95-65c20b929202',
            timeCreated: '1642873353'
          }
        ]
      };
      const headers = {};

      const event = await makeEvent(parser, body, headers);
      const deployment = makeDeployment(event);

      expect(deployment).toHaveProperty('id');
      expect(deployment).toHaveProperty('timeCreated');
    });
  });
});
