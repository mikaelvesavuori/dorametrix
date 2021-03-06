import { createNewDorametrix } from '../../src/domain/entities/Dorametrix';

import { getMetrics } from '../../src/usecases/getMetrics';

import { createNewLocalRepository } from '../../src/repositories/LocalRepo';

describe('Success cases', () => {
  // Setup for checking warning messages
  const warn = console.warn;
  beforeEach(() => (console.warn = jest.fn()));
  afterAll(() => (console.warn = warn));

  describe('Get all metrics', () => {
    test('It should not throw an error when given no query string parameters', async () => {
      const dorametrix = createNewDorametrix(createNewLocalRepository());
      expect(async () => await getMetrics(dorametrix, [''])).not.toThrowError();
    });

    test('It should get all metrics when given no query string parameters', async () => {
      const dorametrix = createNewDorametrix(createNewLocalRepository());
      const result = await getMetrics(dorametrix, {});
      expect(result).toMatchObject({
        changeFailureRate: '1.00',
        deploymentFrequency: '0.14',
        leadTimeForChanges: '00:01:25:00',
        timeToRestoreServices: '01:03:05:10'
      });
    });
  });

  describe('Get deployment frequency', () => {
    test('It should return deployment frequency when given "deploymentFrequency" query string parameter', async () => {
      const dorametrix = createNewDorametrix(createNewLocalRepository());
      const result = await getMetrics(dorametrix, { deploymentFrequency: '' });
      expect(result).toMatchObject({
        deploymentFrequency: '0.14'
      });
    });

    test('It should return a zero value if no deployments are recorded', async () => {
      const dorametrix = createNewDorametrix(
        createNewLocalRepository({
          //@ts-ignore
          deployments: []
        })
      );
      const result = await getMetrics(dorametrix, { deploymentFrequency: '' });
      expect(result).toMatchObject({
        deploymentFrequency: '0.00'
      });
    });
  });

  describe('Get lead time for changes', () => {
    test('It should return lead time for changes when given "leadTimeForChanges" query string parameter', async () => {
      const dorametrix = createNewDorametrix(createNewLocalRepository());
      const result = await getMetrics(dorametrix, { leadTimeForChanges: '' });
      expect(result).toMatchObject({
        leadTimeForChanges: '00:01:25:00'
      });
    });

    test('It should warn about the first match timestamp being later than the deployment', async () => {
      const dorametrix = createNewDorametrix(
        createNewLocalRepository({
          deployments: [
            {
              //@ts-ignore
              timeCreated: 1640039900000,
              eventType: 'deployment',
              id: '987236hfahc82',
              changes: JSON.stringify([
                { id: '5a8c1b761edc95512a0083f35454915304cc9498', timeCreated: 1641039310000 }
              ])
            }
          ]
        })
      );
      await getMetrics(dorametrix, { leadTimeForChanges: '' });

      expect(console.warn).toHaveBeenCalled();
      // @ts-ignore
      const message = console.warn.mock.calls[0][0];
      const hasWarningText = message.startsWith('Weird deployment data');
      expect(hasWarningText).toBe(true);
    });
  });

  describe('Get change failure rate', () => {
    test('It should return change failure rate when given "changeFailureRate" query string parameter', async () => {
      const dorametrix = createNewDorametrix(createNewLocalRepository());
      const result = await getMetrics(dorametrix, { changeFailureRate: '' });
      expect(result).toMatchObject({
        changeFailureRate: '1.00'
      });
    });
  });

  describe('Get time to restore services', () => {
    test('It should return time to restore services when given "timeToRestoreServices" query string parameter', async () => {
      const dorametrix = createNewDorametrix(createNewLocalRepository());
      const result = await getMetrics(dorametrix, { timeToRestoreServices: '' });
      expect(result).toMatchObject({
        timeToRestoreServices: '01:03:05:10'
      });
    });
  });

  test('It should warn about the incident timestamp being later than timeResolved', async () => {
    const dorametrix = createNewDorametrix(
      createNewLocalRepository({
        incidents: [
          {
            id: '19028dj1klaf2',
            // @ts-ignore
            timeCreated: 1642034800000,
            // @ts-ignore
            timeResolved: 1641132310000
          }
        ]
      })
    );
    await getMetrics(dorametrix, { timeToRestoreServices: '' });

    expect(console.warn).toHaveBeenCalled();
    // @ts-ignore
    const message = console.warn.mock.calls[0][0];
    const hasWarningText = message.startsWith('Weird incident data');
    expect(hasWarningText).toBe(true);
  });
});
