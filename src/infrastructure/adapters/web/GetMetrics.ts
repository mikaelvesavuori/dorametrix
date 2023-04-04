import { MikroLog } from 'mikrolog';
import { MikroMetric } from 'mikrometric';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import { getMetrics } from '../../../usecases/getMetrics';

import { createNewDynamoDbRepository } from '../../repositories/DynamoDbRepository';

import { getRequestDTO } from '../../../application/getRequestDTO';
import { createQueryStringParamsObjectFromString } from '../../../application/createQueryStringParamsObjectFromString';

import { end } from '../../frameworks/end';

import { metadataConfig } from '../../../config/metadata';

/**
 * @description The controller for our service that gets the DORA metrics.
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
    const queryParams = getRequestDTO(queryStringParameters);
    const repo = createNewDynamoDbRepository();
    const metrics = await getMetrics(repo, queryParams);

    return end(200, metrics);
  } catch (error: any) {
    const statusCode: number = error?.['cause']?.['statusCode'] || 400;
    const message: string = error.message;
    logger.error(error);

    return end(statusCode, message);
  }
}
