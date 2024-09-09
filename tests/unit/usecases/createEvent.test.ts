import { describe, test, expect } from 'vitest';

import { makeEvent } from '../../../src/domain/valueObjects/Event';

import { DirectParser } from '../../../src/application/parsers/DirectParser';

import { createEvent } from '../../../src/usecases/createEvent';

import { createNewLocalRepository } from '../../../src/infrastructure/repositories/LocalRepository';
import { createNewDynamoDbRepository } from '../../../src/infrastructure/repositories/DynamoDbRepository';

import { MissingEventMetadataError } from '../../../src/application/errors/errors';

import { clearEnv, setEnv } from '../../testUtils';

// Shared setup
const parser = new DirectParser();
const expected = 'OK';
const input = {
  repo: 'SOMEORG/SOMEREPO'
};

describe('Success cases', () => {
  describe('Using local repository', () => {
    const repo = createNewLocalRepository();

    test('It should create a change', async () => {
      const metricEvent = await makeEvent(
        parser,
        {
          ...input,
          eventType: 'change'
        },
        {}
      );

      expect(await createEvent(repo, metricEvent)).toBe(expected);
    });

    test('It should create a deployment', async () => {
      const metricEvent = await makeEvent(
        parser,
        {
          ...input,
          eventType: 'deployment'
        },
        {}
      );

      expect(await createEvent(repo, metricEvent)).toBe(expected);
    });

    test('It should create an incident', async () => {
      const metricEvent = await makeEvent(
        parser,
        {
          ...input,
          eventType: 'incident'
        },
        {}
      );

      expect(await createEvent(repo, metricEvent)).toBe(expected);
    });
  });

  describe('Using DynamoDB repository', () => {
    setEnv();
    const repo = createNewDynamoDbRepository();

    test('It should create a change', async () => {
      const metricEvent = await makeEvent(
        parser,
        {
          ...input,
          eventType: 'change'
        },
        {}
      );

      expect(await createEvent(repo, metricEvent)).toBe(expected);
    });

    test('It should create a deployment', async () => {
      const metricEvent = await makeEvent(
        parser,
        {
          ...input,
          eventType: 'deployment'
        },
        {}
      );

      expect(await createEvent(repo, metricEvent)).toBe(expected);
    });

    test('It should create an incident', async () => {
      const metricEvent = await makeEvent(
        parser,
        {
          ...input,
          eventType: 'incident'
        },
        {}
      );

      expect(await createEvent(repo, metricEvent)).toBe(expected);
    });

    clearEnv();
  });
});

describe('Failure cases', () => {
  const repo = createNewLocalRepository();

  test('It should throw a MissingEventMetadataError if missing ID', async () => {
    const metricEvent = {
      eventType: 'deployment'
    };

    // @ts-ignore
    expect(async () => await createEvent(repo, metricEvent)).rejects.toThrowError(
      MissingEventMetadataError
    );
  });

  test('It should throw a MissingEventMetadataError if missing event type', async () => {
    const metricEvent = {
      id: 'abc123'
    };

    // @ts-ignore
    expect(async () => await createEvent(repo, metricEvent)).rejects.toThrowError(
      MissingEventMetadataError
    );
  });
});
