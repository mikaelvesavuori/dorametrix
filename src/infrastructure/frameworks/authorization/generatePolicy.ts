/**
 * @description Creates the IAM policy for the response.
 */
export const generatePolicy = (principalId: any, effect: string, resource: string, data: any) => {
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
