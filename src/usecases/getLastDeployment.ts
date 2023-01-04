import { createNewDorametrix } from '../domain/services/Dorametrix';

import { DeploymentResponse } from '../interfaces/DeploymentResponse';
import { Repository } from '../interfaces/Repository';

/**
 * @description The use-case for getting the commit ID for the last production deployment.
 */
export async function getLastDeployment(
  repository: Repository,
  queryParams: any
): Promise<DeploymentResponse> {
  const product = queryParams['product'];

  // TODO: Check date handling here
  const lastDeployment = await repository.getMetrics({
    fromDate: '0',
    toDate: '2600000000000',
    key: `DEPLOYMENT_${product}`,
    getLastDeployedCommit: true
  });

  const dorametrix = createNewDorametrix();
  dorametrix.setProductName(product);
  if (queryParams['product']) delete queryParams['product'];

  return dorametrix.getLastDeployment(lastDeployment);
}
