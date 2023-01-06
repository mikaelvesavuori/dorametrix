import { createNewDorametrix } from '../domain/services/Dorametrix';

import { Metrics } from '../interfaces/Metrics';
import { RequestDTO } from '../interfaces/Input';
import { Repository } from '../interfaces/Repository';

/**
 * @description The use-case for getting our DORA metrics, using interactors for each sub-case.
 * @todo Improve this so we have a new, clearer shape and less of the optionals in the type?
 */
export async function getMetrics(repository: Repository, input: RequestDTO): Promise<Metrics> {
  const { repo, from, to } = input;

  const metrics = await getMetricsFromDatabase(repository, input);
  const { changes, deployments, incidents } = metrics;
  const deploymentCount = deployments.length;
  const incidentCount = incidents.length;

  const dorametrix = createNewDorametrix(repo);
  const deploymentFrequency = dorametrix.getDeploymentFrequency(deploymentCount, from, to);
  const leadTimeForChanges = dorametrix.getLeadTimeForChanges(changes, deployments);
  const changeFailureRate = dorametrix.getChangeFailureRate(incidentCount, deploymentCount);
  const timeToRestoreServices = dorametrix.getTimeToRestoreServices(incidents);

  return {
    repo,
    period: {
      from,
      to
    },
    total: {
      deploymentCount,
      incidentCount
    },
    metrics: {
      changeFailureRate,
      deploymentFrequency,
      leadTimeForChanges,
      timeToRestoreServices
    }
  };
}

async function getMetricsFromDatabase(repository: Repository, input: RequestDTO) {
  const { repo, from, to } = input;
  const request = {
    fromDate: from,
    toDate: to
  };

  const changes = await repository.getMetrics({
    ...request,
    key: `CHANGE_${repo}`
  });

  const deployments = await repository.getMetrics({
    ...request,
    key: `DEPLOYMENT_${repo}`
  });

  const incidents = await repository.getMetrics({
    ...request,
    key: `INCIDENT_${repo}`
  });

  return {
    changes,
    deployments,
    incidents
  };
}
