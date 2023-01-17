/**
 * @description Change items as stored in DynamoDB.
 */
export const testChangeItem = {
  Items: [
    {
      timeCreated: { S: '1673104450286' },
      sk: { S: '1672104450286' },
      pk: { S: 'CHANGE_SOMEORG/SOMEREPO' },
      id: { S: 'bdc284af8b859959457b0ac2d82f5547f96345bb' }
    },
    {
      timeCreated: { S: '1673104450455' },
      sk: { S: '1672104450455' },
      pk: { S: 'CHANGE_SOMEORG/SOMEREPO' },
      id: { S: 'a11f3ccab218e1218e04b69a70e7f351bfd104f7' }
    },
    {
      timeCreated: { S: '1673104450201' },
      sk: { S: '1673104450201' },
      pk: { S: 'CHANGE_SOMEORG/SOMEREPO' },
      id: { S: '2a7bd974a431b994732d7b0295878fb2bd3e821b' }
    },
    {
      timeCreated: { S: '1673104450412' },
      sk: { S: '1673104450412' },
      pk: { S: 'CHANGE_SOMEORG/SOMEREPO' },
      id: { S: 'f14af16a77ac735d441ea6c96a30c2ad3f17d6a8' }
    },
    {
      timeCreated: { S: '1673104450591' },
      sk: { S: '1673104450591' },
      pk: { S: 'CHANGE_SOMEORG/SOMEREPO' },
      id: { S: '650996873306355e22bdb13ff8e035e3748a7956' }
    }
  ]
};

/**
 * @description Deployment item as stored in DynamoDB.
 */
export const testDeploymentItem = {
  Items: [
    {
      timeCreated: { S: '1673104694874' },
      sk: { S: '1673104694874' },
      pk: { S: 'DEPLOYMENT_SOMEORG/SOMEREPO' },
      id: { S: '4e594023e1642a161820951d25970301c38b3728' },
      changes: {
        S: '[{"id":"2a7bd974a431b994732d7b0295878fb2bd3e821b","timeCreated":"1673020000"},{"id":"a8fa8e40-122d-4741-a9f1-b70f813b7e1b","timeCreated":"1642879177"},{"id":"6b2467d5-0d91-4945-af6b-483aaf762f56","timeCreated":"1642874964"},{"id":"eb6dad65-9e9c-44c8-ad6a-da0ca4ba9e98","timeCreated":"1642873353"}]'
      }
    }
  ]
};

/**
 * @description Incident item as stored in DynamoDB.
 */
export const testIncidentItem = {
  Items: [
    {
      timeResolved: { S: '1671945000000' },
      timeCreated: { S: '1670945000000' },
      sk: { S: '1670945000000' },
      pk: { S: 'INCIDENT_SOMEORG/SOMEREPO' },
      id: { S: '1091505287' },
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

  if (fixedKey.startsWith('CHANGE_')) return testChangeItem;
  if (fixedKey.startsWith('DEPLOYMENT_')) return testDeploymentItem;
  if (fixedKey.startsWith('INCIDENT_')) return testIncidentItem;

  return { Items: [] };
}
