import { getLastDeployment } from '../../src/usecases/getLastDeployment';

import { createNewLocalRepository } from '../../src/infrastructure/repositories/LocalRepository';

import { deployments, changes, incidents } from '../../testdata/TestDatabase';

describe('Success cases', () => {
  const repo = createNewLocalRepository({ deployments, changes, incidents });
  const input = { repo: 'test', from: '', to: '' };

  test('Given a product, it should get the last deployment data', async () => {
    const result = await getLastDeployment(repo, input);

    expect(result).toMatchObject({
      id: '5a8c1b761edc95512a0083f35454915304cc9498',
      timeCreated: 1641039310000
    });
  });

  test('Given no deployments, it should return an empty object', async () => {
    const repo = createNewLocalRepository({ deployments: [], changes, incidents });

    const result = await getLastDeployment(repo, input);

    expect(result).toMatchObject({ id: '', timeCreated: '' });
  });
});
