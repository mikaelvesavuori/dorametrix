/**
 * @description Utility function to create a valid AWS Lambda return object.
 */
export function end(statusCode = 200, message?: Record<string, any> | number | string) {
  if (!message) message = '';
  const contentType =
    typeof message === 'string' || typeof message === 'number' ? 'text/plain' : 'application/json';

  return {
    statusCode,
    body: JSON.stringify(message),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': contentType
    }
  };
}
