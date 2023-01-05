import { makeDeployment } from '../../../../src/domain/valueObjects/Deployment';
import { makeEvent } from '../../../../src/domain/valueObjects/Event';

import { DirectParser } from '../../../../src/application/parsers/DirectParser';

import { MissingProductValueError } from '../../../../src/application/errors/MissingProductValueError';
import { MissingEventTypeValueError } from '../../../../src/application/errors/MissingEventTypeValueError';
import { MissingIdValueError } from '../../../../src/application/errors/MissingIdValueError';

describe('Failure cases', () => {
  test('It should throw a MissingProductValueError if missing the "product" property', () => {
    expect(() =>
      // @ts-ignore
      makeDeployment({
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
      makeDeployment({
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
      makeDeployment({
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
    test('It should create a valid Deployment', () => {
      const parser = new DirectParser();
      const body = {
        eventType: 'deployment',
        product: 'demo',
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

      const event = makeEvent(parser, body, headers);
      const deployment = makeDeployment(event);

      expect(deployment).toHaveProperty('id');
      expect(deployment).toHaveProperty('timeCreated');
    });
  });
});
