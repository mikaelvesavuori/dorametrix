import { MikroLog } from 'mikrolog';

import { EventInput } from '../interfaces/Lambda';

import { generatePolicy } from '../infrastructure/frameworks/authorization/generatePolicy';
import { handleCors } from '../infrastructure/frameworks/authorization/handleCors';

import {
  InvalidAuthTokenError,
  MissingAuthorizationHeaderError
} from '../application/errors/errors';

const AUTHORIZATION_TOKEN =
  process.env.NODE_ENV === 'test'
    ? '65a662ab-9d57-4f72-aff1-3a63e0738ace'
    : process.env.AUTH_TOKEN || '';

/**
 * @description Authorizer that will check for the `Authorization` header
 * for an authorization token and see if it's the correct and expected one.
 *
 * @example `Authorization: 65a662ab-9d57-4f72-aff1-3a63e0738ace` header.
 */
export async function authorizeUseCase(event: EventInput) {
  try {
    // @ts-ignore
    if (event.httpMethod === 'OPTIONS') return handleCors();

    const userToken = event?.headers['Authorization'] || '';
    if (!userToken) throw new MissingAuthorizationHeaderError();

    const isValid = userToken === AUTHORIZATION_TOKEN;
    if (!isValid) throw new InvalidAuthTokenError();

    return generatePolicy(userToken, 'Allow', event.methodArn, '');
  } catch (error: any) {
    const message: string = error.message;
    const logger = MikroLog.start();
    logger.error(message);
    const id = event?.headers['Authorization'] || 'UNKNOWN';
    return generatePolicy(id, 'Deny', event.methodArn, {});
  }
}
