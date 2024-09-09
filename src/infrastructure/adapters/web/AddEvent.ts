import { MikroLog } from 'mikrolog';
import { MikroMetric } from 'mikrometric';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import { makeEvent } from '../../../domain/valueObjects/Event';

import { getParser } from '../../../application/getParser';

import { createEvent } from '../../../usecases/createEvent';

import { createNewDynamoDbRepository } from '../../repositories/DynamoDbRepository';

import { parseEventBody } from '../../frameworks/parseEventBody';
import { end } from '../../frameworks/end';

import { metadataConfig } from '../../../config/metadata';

/**
 * @description The controller for our service that handles incoming new events.
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
    const body = parseEventBody(event);
    const headers = event.headers;

    const repo = createNewDynamoDbRepository();
    const parser = getParser(headers);
    const metricEvent = await makeEvent(parser, body, headers);

    await createEvent(repo, metricEvent);

    return end(204);
  } catch (error: any) {
    const statusCode: number = error?.['cause']?.['statusCode'] || 400;
    const message: string = error.message;
    logger.error(error);

    return end(statusCode, message);
  }
}
