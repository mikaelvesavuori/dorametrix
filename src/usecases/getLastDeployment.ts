import { Dorametrix } from '../interfaces/Dorametrix';
import { DeploymentResponse } from '../interfaces/DeploymentResponse';

/**
 * @description The use-case for getting the commit ID for the last production deployment.
 */
export async function getLastDeployment(
  dorametrix: Dorametrix,
  queryParams: any
): Promise<DeploymentResponse> {
  const product = queryParams['product'];
  dorametrix.setProductName(product);
  if (queryParams['product']) delete queryParams['product'];

  return await dorametrix.getLastDeployment();
}
