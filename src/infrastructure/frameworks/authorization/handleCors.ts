import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * @description CORS handler.
 */
export function handleCors() {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify('OK')
  } as APIGatewayProxyResult;
}
