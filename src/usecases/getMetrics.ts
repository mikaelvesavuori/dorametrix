import { getDateFromTimestamp } from 'chrono-utils';

import { Metrics } from '../interfaces/Metrics';
import { RequestDTO } from '../interfaces/Input';
import { Repository } from '../interfaces/Repository';
import { Change } from '../interfaces/Change';
import { Deployment } from '../interfaces/Deployment';
import { Incident } from '../interfaces/Incident';

import { createNewDorametrix } from '../domain/services/Dorametrix';

import { addCustomMetric } from '../infrastructure/frameworks/addCustomMetric';

/**
 * @description The use-case for getting our DORA metrics, using interactors for each sub-case.
 */
export async function getMetrics(repository: Repository, input: RequestDTO): Promise<Metrics> {
  const cachedMetrics = await getCachedMetricsFromDatabase(input, repository);

  if (cachedMetrics) {
    addCustomMetric('cached');
    return cachedMetrics;
  }

  const metricsData = await getMetricsFromDatabase(input, repository);
  const metrics = compileResultMetrics(input, metricsData);
  await cacheMetrics(input, repository, metrics);

  addCustomMetric('uncached');
  return metrics;
}

/**
 * @description Get cached metrics from repository.
 */
async function getCachedMetricsFromDatabase(
  input: RequestDTO,
  repository: Repository
): Promise<Metrics | void> {
  const { repo, from, to } = input;

  const cachedData = await repository.getCachedMetrics({ key: repo, from, to });

  if (Object.keys(cachedData).length > 0) return cachedData;
}

/**
 * @description Get fresh metrics from repository.
 */
async function getMetricsFromDatabase(input: RequestDTO, repository: Repository) {
  const { repo, from, to } = input;
  const request = {
    from,
    to
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

/**
 * @description Cache Metrics object in repository.
 */
async function cacheMetrics(input: RequestDTO, repository: Repository, metrics: Metrics) {
  const { repo, from, to } = input;
  await repository.cacheMetrics({ key: repo, range: `${from}_${to}`, metrics });
}

/**
 * @description Return final Metrics object.
 */
function compileResultMetrics(
  input: RequestDTO,
  metricsData: {
    changes: Change[];
    deployments: Deployment[];
    incidents: Incident[];
  }
): Metrics {
  const { repo, from, to, offset } = input;
  const { changes, deployments, incidents } = metricsData;

  const changesCount = changes.length;
  const deploymentCount = deployments.length;
  const incidentCount = incidents.length;

  const dorametrix = createNewDorametrix(repo);
  const changeFailureRate = dorametrix.getChangeFailureRate(incidentCount, deploymentCount);
  const deploymentFrequency = dorametrix.getDeploymentFrequency(deploymentCount, from, to);
  const leadTimeForChanges = dorametrix.getLeadTimeForChanges(changes, deployments);
  const timeToRestoreServices = dorametrix.getTimeToRestoreServices(incidents);

  return {
    repo,
    period: {
      from: getDateFromTimestamp(from),
      to: getDateFromTimestamp(to),
      offset
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
