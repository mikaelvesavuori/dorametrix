import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { makeEvent } from '../../../domain/valueObjects/Event';

import { getParser } from '../../../application/getParser';

import { createEvent } from '../../../usecases/createEvent';

import { createNewDynamoDbRepository } from '../../repositories/DynamoDbRepository';

/**
 * @description The controller for our service that handles incoming new events.
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const body = event.body && typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const headers = event.headers;

    const repo = createNewDynamoDbRepository();
    const parser = getParser(headers);
    const metricEvent = makeEvent(parser, body, headers);

    await createEvent(repo, metricEvent);

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
