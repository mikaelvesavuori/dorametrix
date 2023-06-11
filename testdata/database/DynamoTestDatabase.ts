/**
 * @description Change items as stored in DynamoDB.
 */
export const testChangeItems = {
  Items: [
    {
      timeCreated: { S: '1641034800000' },
      sk: { S: '1641034800000' },
      pk: { S: 'CHANGE_SOMEORG/SOMEREPO' },
      id: { S: '73ea2c4b72ed28ebf7f00e785fc4fc1c7365139e' }
    },
    {
      timeCreated: { S: '1640784652540' },
      sk: { S: '1640784652540' },
      pk: { S: 'CHANGE_SOMEORG/SOMEREPO' },
      id: { S: 'df211ccdd94a63e0bcb9e6ae427a249484a49d60' }
    },
    {
      timeCreated: { S: '1641038400000' },
      sk: { S: '1641038400000' },
      pk: { S: 'CHANGE_SOMEORG/SOMEREPO' },
      id: { S: '94b98567fa5abfe9c003fbb9cb541f1735cefff0' }
    },
    {
      timeCreated: { S: '1640784652530' },
      sk: { S: '1640784652530' },
      pk: { S: 'CHANGE_SOMEORG/SOMEREPO' },
      id: { S: '2eebe17407138ae15d7cbfff2a79a051d3770a64' }
    },
    {
      timeCreated: { S: '1641039310000' },
      sk: { S: '1641039310000' },
      pk: { S: 'CHANGE_SOMEORG/SOMEREPO' },
      id: { S: '5a8c1b761edc95512a0083f35454915304cc9498' }
    }
  ]
};

/**
 * @description Deployment item as stored in DynamoDB.
 */
export const testDeploymentItems = {
  Items: [
    {
      timeCreated: { S: '1641039900000' },
      sk: { S: '1641039900000' },
      pk: { S: 'DEPLOYMENT_SOMEORG/SOMEREPO' },
      id: { S: '4e594023e1642a161820951d25970301c38b3728' },
      changeSha: { S: '73ea2c4b72ed28ebf7f00e785fc4fc1c7365139e' }
    }
  ]
};

/**
 * @description Incident item as stored in DynamoDB.
 */
export const testIncidentItems = {
  Items: [
    {
      timeResolved: { S: '1671945000000' },
      timeCreated: { S: '1670945000000' },
      sk: { S: '1670945000000' },
      pk: { S: 'INCIDENT_SOMEORG/SOMEREPO' },
      id: { S: 'e4ea294c062c525643df036a35ca579b905fa400' },
      title: { S: 'some test issue' }
    }
  ]
};

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

/**
 * @description Return cached test data or basic empty shape.
 */
export function getCachedTestData(key: string, fromDate: string, toDate: string) {
  const fixedKey = key.toUpperCase();
  const range = `${fromDate}_${toDate}`;

  // 20220101_20220131
  if (fixedKey === 'SOMEORG/SOMEREPO' && range === '1640995200000_1643673599000')
    return {
      Items: [
        {
          data: {
            S: JSON.stringify(testCachedMetrics)
          }
        }
      ]
    };

  return { Items: [] };
}

/**
 * @description Return test data or basic empty shape.
 */
export function getTestData(key: string) {
  const fixedKey = key.toUpperCase();

  if (fixedKey.startsWith('CHANGE_')) return testChangeItems;
  if (fixedKey.startsWith('DEPLOYMENT_')) return testDeploymentItems;
  if (fixedKey.startsWith('INCIDENT_')) return testIncidentItems;

  return { Items: [] };
}
