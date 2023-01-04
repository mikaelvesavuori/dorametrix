import { createNewDorametrix } from '../domain/services/Dorametrix';

import { DoraMetrics } from '../interfaces/DoraMetrics';
import { MetricsRequest } from '../interfaces/MetricsRequest';
import { Repository } from '../interfaces/Repository';

/**
 * @description The use-case for getting our DORA metrics, using interactors for each sub-case.
 * @todo Improve this so we have a new, clearer shape and less of the optionals in the type?
 */
export async function getMetrics(
  repository: Repository,
  queryParams: Record<string, any>
): Promise<DoraMetrics> {
  const product = queryParams['product'];

  const dorametrix = createNewDorametrix();
  dorametrix.setProductName(product);

  const input = getDTO(product, queryParams);
  const metrics = await getMetricsFromDatabase(repository, input);

  const { changes, deployments, incidents } = metrics;
  const deploymentCount = deployments.length;
  const incidentCount = incidents.length;

  const deploymentFrequency = dorametrix.getDeploymentFrequency(deploymentCount);
  const leadTimeForChanges = dorametrix.getLeadTimeForChanges(changes, deployments);
  const changeFailureRate = dorametrix.getChangeFailureRate(incidentCount, deploymentCount);
  const timeToRestoreServices = dorametrix.getTimeToRestoreServices(incidents);

  return {
    deploymentFrequency,
    leadTimeForChanges,
    changeFailureRate,
    timeToRestoreServices
  } as unknown as DoraMetrics;
}

// TODO
function getDTO(repoName: string, queryParams: Record<string, any>): MetricsRequest {
  return {
    repoName,
    fromDate: queryParams['from'] || '',
    toDate: queryParams['to'] || ''
  };
}

// TODO
async function getMetricsFromDatabase(repository: Repository, input: MetricsRequest) {
  const { repoName, fromDate, toDate } = input;

  /**
   * TODO: Could this be simplified by using Events instead of the specific types?
   */

  const changes = await repository.getMetrics({
    fromDate,
    toDate,
    key: `CHANGE_${repoName}`
  });

  const deployments = await repository.getMetrics({
    fromDate,
    toDate,
    key: `DEPLOYMENT_${repoName}`
  });

  const incidents = await repository.getMetrics({
    fromDate,
    toDate,
    key: `INCIDENT_${repoName}`
  });

  return {
    changes,
    deployments,
    incidents
  };
}
