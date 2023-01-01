import { createNewDorametrix } from '../../src/domain/services/Dorametrix';

import { getLastDeployment } from '../../src/usecases/getLastDeployment';

import { createNewLocalRepository } from '../../src/infrastructure/repositories/LocalRepository';
import { deployments, changes, incidents } from '../../testdata/TestDatabase';

describe('Success cases', () => {
  test('Given no product, it should get the last deployment data', async () => {
    const dorametrix = createNewDorametrix(
      createNewLocalRepository({ deployments, changes, incidents })
    );
    const result = await getLastDeployment(dorametrix, {});
    expect(result).toMatchObject({
      id: '5a8c1b761edc95512a0083f35454915304cc9498',
      timeCreated: 1641039310000
    });
  });

  test('Given a product, it should get the last deployment data', async () => {
    const dorametrix = createNewDorametrix(
      createNewLocalRepository({ deployments, changes, incidents })
    );
    const result = await getLastDeployment(dorametrix, { product: 'test' });
    expect(result).toMatchObject({
      id: '5a8c1b761edc95512a0083f35454915304cc9498',
      timeCreated: 1641039310000
    });
  });

  test('Given no deployments, it should return an empty object', async () => {
    const dorametrix = createNewDorametrix(
      createNewLocalRepository({ deployments: [], changes, incidents })
    );
    const result = await getLastDeployment(dorametrix, { product: 'test' });
    expect(result).toMatchObject({ id: '', timeCreated: '' });
  });
});
