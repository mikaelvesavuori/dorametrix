import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createNewDorametrix } from '../domain/entities/Dorametrix';
import { getParser } from '../domain/application/getParser';
import { createNewDynamoRepository } from '../repositories/DynamoDbRepository';
import { createEvent } from '../usecases/createEvent';

/**
 * @description The controller for our service that handles incoming new events.
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const body = event.body && typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const headers = event.headers;

    const repo = createNewDynamoRepository();
    const dorametrix = createNewDorametrix(repo);
    const parser = getParser(headers);

    await createEvent(dorametrix, parser, body, headers);

    return {
      statusCode: 204,
      body: ''
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message)
    };
  }
}
