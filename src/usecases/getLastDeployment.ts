import { createNewDorametrix } from '../domain/services/Dorametrix';

import { DeploymentResponse } from '../interfaces/DeploymentResponse';
import { RequestDTO } from '../interfaces/Input';
import { Repository } from '../interfaces/Repository';

//import { getMillisecondsForDays } from '../infrastructure/frameworks/getMillisecondsForDays';

/**
 * @description The use-case for getting the commit ID for the last production deployment.
 */
export async function getLastDeployment(
  repository: Repository,
  input: RequestDTO
): Promise<DeploymentResponse> {
  const { repo } = input;

  // TODO: Check date handling here and convert `YYYYMMDD` format to milliseconds
  // TODO: Use `last` (days) format to succeed after previous `days` concept?
  // (Date.now() - milliseconds).toString()
  //const milliseconds = getMillisecondsForDays(days);

  const lastDeployment = await repository.getMetrics({
    fromDate: '0',
    toDate: '3000000000000',
    key: `DEPLOYMENT_${repo}`,
    getLastDeployedCommit: true
  });

  const dorametrix = createNewDorametrix(repo);

  return dorametrix.getLastDeployment(lastDeployment);
}
