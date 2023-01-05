import { createNewDorametrix } from '../domain/services/Dorametrix';

import { DoraMetrics } from '../interfaces/DoraMetrics';
import { RequestDTO } from '../interfaces/Input';
import { Repository } from '../interfaces/Repository';

/**
 * @description The use-case for getting our DORA metrics, using interactors for each sub-case.
 * @todo Improve this so we have a new, clearer shape and less of the optionals in the type?
 */
export async function getMetrics(repository: Repository, input: RequestDTO): Promise<DoraMetrics> {
  const { repo } = input;

  const metrics = await getMetricsFromDatabase(repository, input);
  const { changes, deployments, incidents } = metrics;
  const deploymentCount = deployments.length;
  const incidentCount = incidents.length;

  const dorametrix = createNewDorametrix(repo);
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

// TODO: Could this be simplified by using Events instead of the specific types?
async function getMetricsFromDatabase(repository: Repository, input: RequestDTO) {
  const { repo, from, to } = input;

  const changes = await repository.getMetrics({
    fromDate: from,
    toDate: to,
    key: `CHANGE_${repo}`
  });

  const deployments = await repository.getMetrics({
    fromDate: from,
    toDate: to,
    key: `DEPLOYMENT_${repo}`
  });

  const incidents = await repository.getMetrics({
    fromDate: from,
    toDate: to,
    key: `INCIDENT_${repo}`
  });

  return {
    changes,
    deployments,
    incidents
  };
}
