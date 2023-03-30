import { MikroLog } from 'mikrolog';
import { MikroMetric } from 'mikrometric';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import { getLastDeployment } from '../../../usecases/getLastDeployment';

import { createNewDynamoDbRepository } from '../../repositories/DynamoDbRepository';

import { getLastDeployedDTO } from '../../../application/getRequestDTO';
import { createQueryStringParamsObjectFromString } from '../../../application/createQueryStringParamsObjectFromString';

import { end } from '../../frameworks/end';

import { metadataConfig } from '../../../config/metadata';

/**
 * @description The controller for our service that handles getting the commit ID for the last deployment to production.
 */
export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const logger = MikroLog.start({ metadataConfig, event, context });
  MikroMetric.start({
    namespace: metadataConfig.service,
    serviceName: metadataConfig.service,
    event,
    context
  });

  try {
    const queryStringParameters = createQueryStringParamsObjectFromString(event);
    const input = getLastDeployedDTO(queryStringParameters);
    const repo = createNewDynamoDbRepository();
    const lastDeployment = await getLastDeployment(repo, input);

    return end(200, lastDeployment);
  } catch (error: any) {
    const statusCode: number = error?.['cause']?.['statusCode'] || 400;
    const message: string = error.message;
    logger.error(error);

    return end(statusCode, message);
  }
}
