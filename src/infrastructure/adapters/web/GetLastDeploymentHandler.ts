import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getLastDeployment } from '../../../usecases/getLastDeployment';

import { createNewDynamoDbRepository } from '../../repositories/DynamoDbRepository';

import { getRequestDTO } from '../../../application/getRequestDTO';

/**
 * @description The controller for our service that handles getting the commit ID for the last deployment to production.
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const input = getRequestDTO(event?.queryStringParameters as unknown as Record<string, string>);
    const repo = createNewDynamoDbRepository();
    const lastDeployment = await getLastDeployment(repo, input);

    return {
      statusCode: 200,
      body: JSON.stringify(lastDeployment)
    };
  } catch (error: any) {
    console.error(error);

    return {
      statusCode: error.cause.statusCode,
      body: JSON.stringify(error.message)
    };
  }
}
