import { Change } from '../../src/interfaces/Change';
import { Deployment } from '../../src/interfaces/Deployment';
import { Incident } from '../../src/interfaces/Incident';

export const deployments: Deployment[] = [
  {
    repo: 'SOMEORG/SOMEREPO',
    timeCreated: '1641039900000', // Sat Jan 01 2022 13:25:00 GMT+0100 (CET)
    date: '20220101',
    eventType: 'deployment',
    id: '3705e751cf44780483a2c3df5327dd61777ef697',
    changeSha: '94b98567fa5abfe9c003fbb9cb541f1735cefff0'
  },
  {
    repo: 'SOMEORG/SOMEREPO',
    timeCreated: '1641038410000', // Sat Jan 01 2022 13:00:00 GMT+0100 (CET)
    date: '20220101',
    eventType: 'deployment',
    id: '743f328470810c2dfbfbc0d7b9a17c0c22af5e96',
    changeSha: '94b98567fa5abfe9c003fbb9cb541f1735cefff0'
  }
];

export const changes: Change[] = [
  {
    repo: 'SOMEORG/SOMEREPO',
    id: '73ea2c4b72ed28ebf7f00e785fc4fc1c7365139e',
    timeCreated: '1641034800000', // Sat Jan 01 2022 12:00:00 GMT+0100 (CET)
    date: '20220101',
    eventType: 'deployment'
  },
  {
    repo: 'SOMEORG/SOMEREPO',
    id: 'ae3fe7b03bffe4c2d5b8973eff72675373c88302',
    timeCreated: '1640784652540',
    date: '20220101',
    eventType: 'deployment'
  },
  {
    repo: 'SOMEORG/SOMEREPO',
    id: '94b98567fa5abfe9c003fbb9cb541f1735cefff0',
    timeCreated: '1641038400000', // Sat Jan 01 2022 13:00:00 GMT+0100 (CET)
    date: '20220101',
    eventType: 'deployment'
  },
  {
    repo: 'SOMEORG/SOMEOTHERREPO',
    id: 'bc81466e46f874d658101817602e9bb47d8e3f4e',
    timeCreated: '1640784652530',
    date: '20220101',
    eventType: 'deployment'
  },
  {
    repo: 'SOMEORG/SOMEREPO',
    id: '5a8c1b761edc95512a0083f35454915304cc9498',
    timeCreated: '1641039310000', // Sat Jan 01 2022 13:15:10 GMT+0100 (CET)
    date: '20220101',
    eventType: 'deployment'
  }
];

export const incidents: Incident[] = [
  {
    repo: 'SOMEORG/SOMEREPO',
    id: '4f5724887853c77ba8e2136af8e35a5840b6be52',
    timeCreated: '1641034800000', // Sat Jan 01 2022 12:00:00 GMT+0100 (CET)
    timeResolved: '1641132310000', // Sun Jan 02 2022 15:05:10 GMT+0100 (CET)
    date: '20220101',
    eventType: 'deployment',
    title: 'Some title'
  },
  {
    repo: 'SOMEORG/SOMEOTHERREPO',
    id: '907451a5ac22fbddf5111dfe1c3d3d27351148d1',
    timeCreated: '1641034200000', // Sat Jan 01 2022 10:50:00 GMT+0000
    timeResolved: '1641131310000', // Sun Jan 02 2022 13:48:30 GMT+0000
    date: '20220101',
    eventType: 'deployment',
    title: 'Some title'
  }
];

/**
 * @description Cached test metrics.
 */
export const testCachedMetrics = {
  repo: 'SOMEORG/SOMEREPO',
  period: { from: '20220101', to: '20220131', offset: 0 },
  total: { changesCount: 5, deploymentCount: 1, incidentCount: 1 },
  metrics: {
    changeFailureRate: '1.00',
    deploymentFrequency: '1.00',
    leadTimeForChanges: '00:00:04:04',
    timeToRestoreServices: '11:13:46:40'
  }
};
