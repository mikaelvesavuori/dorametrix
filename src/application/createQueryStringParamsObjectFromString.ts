/**
 * @description Create a conventional object of query string parameters
 * from an HTTP API's `event` object that only has query string parameters
 * in the shape of a "raw" string.
 */
export function createQueryStringParamsObjectFromString(event: Record<string, any>) {
  const queryStringParameters: Record<string, any> = {};

  const parts = event?.rawQueryString?.split('&');
  if (parts && parts.length > 0)
    parts.forEach((part: string) => {
      const [key, value] = part.split('=');
      queryStringParameters[key] = value.replace('%2F', '/');
    });

  return queryStringParameters;
}
