import { createNewDorametrix } from '../domain/services/Dorametrix';

import { Metrics } from '../interfaces/Metrics';
import { RequestDTO } from '../interfaces/Input';
import { Repository } from '../interfaces/Repository';
import { Change } from '../interfaces/Change';
import { Deployment } from '../interfaces/Deployment';
import { Incident } from '../interfaces/Incident';

/**
 * @description The use-case for getting our DORA metrics, using interactors for each sub-case.
 */
export async function getMetrics(repository: Repository, input: RequestDTO): Promise<Metrics> {
  const { repo, from, to } = input;

  const metrics = await getMetricsFromDatabase(repository, input);
  const { changes, deployments, incidents } = metrics;
  const changesCount = changes.length;
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
      changesCount,
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
    changes: changes as Change[],
    deployments: deployments as Deployment[],
    incidents: incidents as Incident[]
  };
}
