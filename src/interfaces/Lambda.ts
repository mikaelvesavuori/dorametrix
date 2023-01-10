/**
 * @description Simplified representation of AWS Lambda `event` object.
 */
export type EventInput = {
  body: Record<string, any>;
  headers: Headers;
  httpMethod: HttpMethod;
  queryStringParameters: QueryStringParameters;
  methodArn: string;
  /**
   * @description Ending URL path
   * @example '/GetMetrics';
   */
  resource: string;
};

/**
 * @description Simplified headers object.
 */
export type Headers = {
  'User-Agent': string;
};

/**
 * @description Supported HTTP methods.
 */
export type HttpMethod = 'GET' | 'POST' | 'OPTIONS';

/**
 * @description Simplified query string parameters object.
 */
export type QueryStringParameters = {
  [key: string]: string;
  authorization: string;
};
