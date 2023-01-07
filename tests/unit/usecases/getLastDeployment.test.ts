import { getLastDeployment } from '../../../src/usecases/getLastDeployment';

import { createNewLocalRepository } from '../../../src/infrastructure/repositories/LocalRepository';

describe('Success cases', () => {
  const repo = createNewLocalRepository();
  const input = { repo: 'SOMEORG/SOMEREPO', from: '20000101', to: '20991231', offset: 0 };

  test('Given a repository name, it should get the last deployment data', async () => {
    const result = await getLastDeployment(repo, input);

    expect(result).toMatchObject({
      id: '5a8c1b761edc95512a0083f35454915304cc9498',
      timeCreated: '1641039310000'
    });
  });

  test('Given no deployments, it should return an empty object', async () => {
    const repo = createNewLocalRepository({ deployments: [] });

    const result = await getLastDeployment(repo, input);

    expect(result).toMatchObject({ id: '', timeCreated: '' });
  });
});
