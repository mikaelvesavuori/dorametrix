/**
 * @description Missing required environment variables when setting up DynamoDB.
 */
export class MissingEnvironmentVariablesDynamoError extends Error {
  constructor() {
    super();
    this.name = 'MissingEnvironmentVariablesDynamoError';
    const message = `Missing required environment variables in DynamoDB!`;
    this.message = message;
    //@ts-ignore
    this.cause = {
      statusCode: 500
    };
  }
}
