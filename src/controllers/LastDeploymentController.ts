import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createNewDorametrix } from '../domain/entities/Dorametrix';
import { createNewDynamoRepository } from '../repositories/DynamoDbRepo';
import { getLastDeployment } from '../usecases/getLastDeployment';
import { getQueryStringParams } from '../frameworks/getQueryStringParams';

/**
 * @description The controller for our service that handles getting the commit ID for the last deployment to production.
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const queryParams = getQueryStringParams(
      event?.queryStringParameters as unknown as Record<string, string>
    );
    const repo = createNewDynamoRepository();
    const dorametrix = createNewDorametrix(repo);
    const lastDeployment = await getLastDeployment(dorametrix, queryParams);

    return {
      statusCode: 200,
      body: JSON.stringify(lastDeployment)
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message)
    };
  }
}
