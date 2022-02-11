import { DoraMetrics } from '../domain/interfaces/DoraMetrics';
import { Dorametrix } from '../domain/interfaces/Dorametrix';

import { getChangeFailureRate } from './interactors/getChangeFailureRate';
import { getDeploymentFrequency } from './interactors/getDeploymentFrequency';
import { getLeadTimeForChanges } from './interactors/getLeadTimeForChanges';
import { getTimeToRestoreServices } from './interactors/getTimeToRestoreServices';

/**
 * @description The use-case for getting our DORA metrics, using interactors for each sub-case.
 */
export async function getMetrics(dorametrix: Dorametrix, queryParams: any): Promise<DoraMetrics> {
  const data: DoraMetrics = {};

  const product = queryParams['product'] || ''; // Makes it possible to not use product
  dorametrix.setProductName(product);
  if (queryParams['product']) delete queryParams['product'];

  // Get all metrics
  if (Object.keys(queryParams).length === 0) {
    data.changeFailureRate = await getChangeFailureRate(dorametrix);
    data.deploymentFrequency = await getDeploymentFrequency(dorametrix);
    data.leadTimeForChanges = await getLeadTimeForChanges(dorametrix);
    data.timeToRestoreServices = await getTimeToRestoreServices(dorametrix);
  }
  // Get specific metrics
  else {
    if (Object.keys(queryParams).includes('changeFailureRate'))
      data.changeFailureRate = await getChangeFailureRate(dorametrix);
    if (Object.keys(queryParams).includes('deploymentFrequency'))
      data.deploymentFrequency = await getDeploymentFrequency(dorametrix);
    if (Object.keys(queryParams).includes('leadTimeForChanges'))
      data.leadTimeForChanges = await getLeadTimeForChanges(dorametrix);
    if (Object.keys(queryParams).includes('timeToRestoreServices'))
      data.timeToRestoreServices = await getTimeToRestoreServices(dorametrix);
  }

  return data;
}
