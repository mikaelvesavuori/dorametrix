import { MikroLog } from 'mikrolog';

import { EventInput } from '../interfaces/Lambda';

import { handleCors } from '../infrastructure/frameworks/authorization/handleCors';

import { InvalidAuthTokenError } from '../application/errors/errors';

const AUTHORIZATION_TOKEN =
  process.env.NODE_ENV === 'test'
    ? '82490d5a-1950-4527-ab2f-5c984c861462'
    : process.env.API_KEY || '';

/**
 * @description Authorizer that will check for the `authorization` query string
 * parameter or `Authorization` header for an authorization token and see if it's
 * the correct and expected one.
 *
 * @example `?authorization=82490d5a-1950-4527-ab2f-5c984c861462` query string parameter.
 * @example `Authorization: 82490d5a-1950-4527-ab2f-5c984c861462` header.
 */
export async function authorize(event: EventInput) {
  try {
    if (event?.requestContext?.http?.method === 'OPTIONS') return handleCors();

    const userToken = getAuthToken(event);
    const isValid = userToken === AUTHORIZATION_TOKEN;
    if (!isValid) throw new InvalidAuthTokenError();

    return {
      isAuthorized: true
    };
  } catch (error: any) {
    const message: string = error.message;
    const logger = MikroLog.start();
    logger.error(message);
    return {
      isAuthorized: false
    };
  }
}

const getAuthToken = (event: EventInput) =>
  event.headers?.['Authorization'] || event?.identitySource[0] || '';
