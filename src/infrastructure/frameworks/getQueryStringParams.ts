import { sanitizeString } from './sanitizeString';

/**
 * @description Retrieve query string parameters from an AWS Lambda event.
 */
export function getQueryStringParams(
  queryStringParameters: Record<string, string>
): Record<string, string> {
  const validQueryStringKeys = [
    'changeFailureRate',
    'deploymentFrequency',
    'leadTimeForChanges',
    'timeToRestoreServices',
    'product'
  ];

  const validatedQueryStrings: any = {};
  validQueryStringKeys.forEach((validKey: any) => {
    if (queryStringParameters && queryStringParameters.hasOwnProperty(validKey))
      validatedQueryStrings[validKey] = queryStringParameters[validKey]
        ? sanitizeString(queryStringParameters[validKey])
        : '';
  });

  return (validatedQueryStrings as ValidatedQueryStrings) || {};
}

type ValidatedQueryStrings = {
  changeFailureRate?: string;
  deploymentFrequency?: string;
  leadTimeForChanges?: string;
  timeToRestoreServices?: string;
  product?: string;
};
