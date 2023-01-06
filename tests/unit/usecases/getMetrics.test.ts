import { getMetrics } from '../../../src/usecases/getMetrics';

import { createNewLocalRepository } from '../../../src/infrastructure/repositories/LocalRepository';

describe('Success cases', () => {
  const repo = createNewLocalRepository();

  // Setup for checking warning messages
  const warn = console.warn;
  beforeEach(() => (console.warn = jest.fn()));
  afterAll(() => (console.warn = warn));

  describe('Get all metrics', () => {
    test('It should get all metrics when given no query string parameters', async () => {
      const expected = {
        period: {
          from: '',
          to: ''
        },
        repo: '',
        total: {
          deploymentCount: 1,
          incidentCount: 1
        },
        metrics: {
          changeFailureRate: '1.00',
          deploymentFrequency: '0.14',
          leadTimeForChanges: '00:01:25:00',
          timeToRestoreServices: '01:03:05:10'
        }
      };

      const result = await getMetrics(repo, { repo: '', from: '', to: '' });

      expect(result).toMatchObject(expected);
    });
  });

  /* TODO
  test('It should return a zero value if no deployments are recorded', async () => {

  test('It should warn about the first match timestamp being later than the deployment', async () => {
    const repo = createNewLocalRepository({
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
    });
    await getMetrics(repo, { leadTimeForChanges: '' });

    expect(console.warn).toHaveBeenCalled();
    // @ts-ignore
    const message = console.warn.mock.calls[0][0];
    const hasWarningText = message.startsWith('Unexpected deployment data');
    expect(hasWarningText).toBe(true);
  });

  test('It should warn about the incident timestamp being later than timeResolved', async () => {
    const repo = createNewLocalRepository({
      incidents: [
        {
          id: '19028dj1klaf2',
          // @ts-ignore
          timeCreated: 1642034800000,
          // @ts-ignore
          timeResolved: 1641132310000
        }
      ]
    });
    await getMetrics(repo, { timeToRestoreServices: '' });

    expect(console.warn).toHaveBeenCalled();
    // @ts-ignore
    const message = console.warn.mock.calls[0][0];
    const hasWarningText = message.startsWith('Unexpected incident data');
    expect(hasWarningText).toBe(true);
  });
  */
});
