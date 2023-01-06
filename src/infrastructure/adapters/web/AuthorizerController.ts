import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * @description The authorizer controller.
 */
export async function handler(event: Record<string, any>): Promise<APIGatewayProxyResult> {
  if (event && event.httpMethod === 'OPTIONS') return handleCors();

  // Additionally, you could also verify the IP if you want to accept requests only from your own networks or similar
  // const sourceIp = event.requestContext?.identity?.sourceIp;

  const authHeader = event?.headers['Authorization'];
  if (!authHeader || authHeader !== process.env.API_KEY)
    return generatePolicy(authHeader, 'Deny', event.methodArn, {});

  return generatePolicy(authHeader, 'Allow', event.methodArn, JSON.stringify(''));
}

/**
 * @description CORS handler.
 */
function handleCors() {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      Vary: 'Origin'
    },
    body: JSON.stringify('OK')
  } as APIGatewayProxyResult;
}

/**
 * @description Creates the IAM policy for the response.
 */
const generatePolicy = (principalId: any, effect: string, resource: string, data: any) => {
  // @see https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer-output.html
  const authResponse: any = {
    principalId
  };

  if (effect && resource) {
    const policyDocument: Record<string, any> = {
      Version: '2012-10-17',
      Statement: []
    };

    const statement = {
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: resource
    };

    policyDocument.Statement[0] = statement;
    authResponse.policyDocument = policyDocument;
  }

  authResponse.context = {
    stringKey: JSON.stringify(data)
  };

  return authResponse;
};
