import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getMetrics } from '../../../usecases/getMetrics';

import { createNewDynamoRepository } from '../../repositories/DynamoDbRepository';

import { getRequestDTO } from '../../../application/getRequestDTO';

/**
 * @description The controller for our service that gets the DORA metrics.
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const queryParams = getRequestDTO(event.queryStringParameters || {});
    const repo = createNewDynamoRepository();
    const metrics = await getMetrics(repo, queryParams);

    return {
      statusCode: 200,
      body: JSON.stringify(metrics)
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message)
    };
  }
}
