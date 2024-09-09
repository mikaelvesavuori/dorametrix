import { describe, test, expect, afterAll, beforeEach, vi } from 'vitest';

import { clearEnv, setEnv } from '../../testUtils';

import { getMetrics } from '../../../src/usecases/getMetrics';

import { createNewLocalRepository } from '../../../src/infrastructure/repositories/LocalRepository';
import { createNewDynamoDbRepository } from '../../../src/infrastructure/repositories/DynamoDbRepository';

import { testCachedMetrics } from '../../../testdata/database/DynamoTestDatabase';

// Basic valid input that will be reused across tests
const basicInput = {
  repo: 'SOMEORG/SOMEREPO',
  from: '1640995200000',
  to: '1672531199000'
};

describe('Success cases', () => {
  // Setup for checking warning messages
  const warn = console.warn;
  beforeEach(() => (console.warn = vi.fn()));
  // @ts-ignore
  afterAll(() => (console.warn = warn));

  describe('Get metrics', () => {
    describe('Using local repository', () => {
      const repo = createNewLocalRepository();
      const expected = {
        repo: 'SOMEORG/SOMEREPO',
        period: {
          from: '20220101',
          to: '20221231'
        },
        total: {
          deploymentCount: 2,
          incidentCount: 1
        },
        metrics: {
          changeFailureRate: '0.50',
          deploymentFrequency: '2.00',
          leadTimeForChanges: '00:00:00:10',
          timeToRestoreServices: '01:03:05:10'
        }
      };

      test('It should get metrics', async () => {
        const result = await getMetrics(repo, {
          ...basicInput,
          offset: 0
        });

        expect(result).toMatchObject(expected);
      });

      test('It should get cached metrics', async () => {
        const result = await getMetrics(repo, {
          ...basicInput,
          from: '1640995200000',
          to: '1643673599000',
          offset: 0
        });

        expect(result).toMatchObject(testCachedMetrics);
      });
    });

    describe('Using DynamoDB repository', () => {
      setEnv();
      const repo = createNewDynamoDbRepository();
      const expected = {
        repo: 'SOMEORG/SOMEREPO',
        period: { from: '20220101', to: '20221231', offset: 0 },
        total: { changesCount: 5, deploymentCount: 1, incidentCount: 1 },
        metrics: {
          changeFailureRate: '1.00',
          deploymentFrequency: '1.00',
          leadTimeForChanges: '00:01:25:00',
          timeToRestoreServices: '11:13:46:40'
        }
      };

      test('It should get metrics', async () => {
        const result = await getMetrics(repo, {
          ...basicInput,
          offset: 0
        });

        expect(result).toMatchObject(expected);
      });

      test('It should get cached metrics', async () => {
        setEnv();
        const response = await getMetrics(repo, {
          repo: 'SOMEORG/SOMEREPO',
          from: '1640995200000',
          to: '1643673599000',
          offset: 0
        });

        expect(response).toMatchObject(testCachedMetrics);
        clearEnv();
      });

      clearEnv();
    });
  });
});
