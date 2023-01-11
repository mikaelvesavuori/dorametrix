import { MikroLog } from 'mikrolog';
import { MikroMetric } from 'mikrometric';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import { getMetrics } from '../../../usecases/getMetrics';

import { createNewDynamoDbRepository } from '../../repositories/DynamoDbRepository';

import { getRequestDTO } from '../../../application/getRequestDTO';

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
    const queryParams = getRequestDTO(event.queryStringParameters || {});
    const repo = createNewDynamoDbRepository();
    const metrics = await getMetrics(repo, queryParams);

    return {
      statusCode: 200,
      body: JSON.stringify(metrics)
    };
  } catch (error: any) {
    const statusCode: number = error?.['cause']?.['statusCode'] || 400;
    const message: string = error.message;
    logger.error(error);

    return {
      statusCode,
      body: JSON.stringify(message)
    };
  }
}
