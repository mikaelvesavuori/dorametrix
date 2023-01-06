import { Change } from '../src/interfaces/Change';
import { Deployment } from '../src/interfaces/Deployment';
import { Incident } from '../src/interfaces/Incident';

export const deployments: Deployment[] = [
  {
    repo: 'SOMEORG/SOMEREPO',
    timeCreated: '1641039900000', // Sat Jan 01 2022 13:25:00 GMT+0100 (CET)
    date: '20230101',
    eventType: 'deployment',
    id: '987236hfahc82',
    changes: [
      {
        id: '5a8c1b761edc95512a0083f35454915304cc9498',
        timeCreated: '1641039310000'
      },
      {
        id: '94b98567fa5abfe9c003fbb9cb541f1735cefff0',
        timeCreated: '1641038400000'
      },
      {
        id: '73ea2c4b72ed28ebf7f00e785fc4fc1c7365139e',
        timeCreated: '1641034800000'
      }
    ]
  }
];

export const changes: Change[] = [
  {
    repo: 'SOMEORG/SOMEREPO',
    id: '73ea2c4b72ed28ebf7f00e785fc4fc1c7365139e',
    timeCreated: '1641034800000', // Sat Jan 01 2022 12:00:00 GMT+0100 (CET)
    date: '20230101',
    eventType: 'deployment'
  },
  {
    repo: 'SOMEORG/SOMEREPO',
    id: 'abc123',
    timeCreated: '1640784652540',
    date: '20230101',
    eventType: 'deployment'
  },
  {
    repo: 'SOMEORG/SOMEREPO',
    id: '94b98567fa5abfe9c003fbb9cb541f1735cefff0',
    timeCreated: '1641038400000', // Sat Jan 01 2022 13:00:00 GMT+0100 (CET)
    date: '20230101',
    eventType: 'deployment'
  },
  {
    repo: 'SOMEORG/SOMEOTHERREPO',
    id: 'qwerty123',
    timeCreated: '1640784652530',
    date: '20230101',
    eventType: 'deployment'
  },
  {
    repo: 'SOMEORG/SOMEREPO',
    id: '5a8c1b761edc95512a0083f35454915304cc9498',
    timeCreated: '1641039310000', // Sat Jan 01 2022 13:15:10 GMT+0100 (CET)
    date: '20230101',
    eventType: 'deployment'
  }
];

export const incidents: Incident[] = [
  {
    repo: 'SOMEORG/SOMEREPO',
    id: '19028dj1klaf2',
    timeCreated: '1641034800000', // Sat Jan 01 2022 12:00:00 GMT+0100 (CET)
    timeResolved: '1641132310000', // Sun Jan 02 2022 15:05:10 GMT+0100 (CET)
    date: '20230101',
    eventType: 'deployment',
    title: 'Some title'
  },
  {
    repo: 'SOMEORG/SOMEOTHERREPO',
    id: 'jau387fauigag8736',
    timeCreated: '1641034200000', // Sat Jan 01 2022 10:50:00 GMT+0000
    timeResolved: '1641131310000', // Sun Jan 02 2022 13:48:30 GMT+0000
    date: '20230101',
    eventType: 'deployment',
    title: 'Some title'
  }
];
