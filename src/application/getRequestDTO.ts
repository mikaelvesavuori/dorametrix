import { RequestDTO } from '../interfaces/Input';

import {
  getTimestampForInputDate,
  getTimestampsForPeriod
} from '../infrastructure/frameworks/time';
import { getCurrentDate } from '../infrastructure/frameworks/date';

import { MissingRequiredInputParamsError } from './errors/MissingRequiredInputParamsError';
import { TooManyInputParamsError } from './errors/TooManyInputParamsError';
import { OutOfRangeQueryError } from './errors/OutOfRangeQueryError';
import { MissingRepoNameError } from './errors/MissingRepoNameError';

/**
 * @description Retrieve query string parameters from an AWS Lambda event.
 */
export function getRequestDTO(queryStringParameters: Record<string, any>): RequestDTO {
  const repo = sanitizeKey(queryStringParameters, 'repo') as string;
  const from = sanitizeKey(queryStringParameters, 'from') as string;
  const to = sanitizeKey(queryStringParameters, 'to') as string;
  const offset = sanitizeKey(queryStringParameters, 'offset', true) as number;
  const lastNumDays = sanitizeKey(queryStringParameters, 'last', true) as number;

  validateRequestInput(repo, to, from, lastNumDays);

  const requestDto: Record<string, any> = {
    repo
  };

  if (lastNumDays) {
    const { from, to } = getTimestampsForPeriod(lastNumDays, offset);
    requestDto['from'] = from;
    requestDto['to'] = to;
  } else {
    const fromDate = getTimestampForInputDate(from, offset);
    const toDate = getTimestampForInputDate(to, offset, true);
    requestDto['from'] = fromDate;
    requestDto['to'] = toDate;
  }

  validateDateRange(requestDto['to'], offset);

  return requestDto as RequestDTO;
}

/**
 * @description Validates user request input.
 */
function validateRequestInput(repo: string, to: string, from: string, lastNumDays: number) {
  if (!repo) throw new MissingRepoNameError('Missing required "repo" query parameter!');
  if ((!to || !from) && !lastNumDays) throw new MissingRequiredInputParamsError();
  if (from && to && lastNumDays) throw new TooManyInputParamsError();
}

/**
 * @description Validate the final date range (timestamps).
 */
function validateDateRange(toDate: string, offset: number) {
  const maxDate = getTimestampForInputDate(getCurrentDate(true), offset);
  if (parseInt(toDate) >= parseInt(maxDate)) throw new OutOfRangeQueryError();
}

/**
 * @description Minor sanity fix on input.
 */
const sanitizeKey = (
  queryStringParameters: Record<string, string>,
  key: string,
  isNumeric = false
) => {
  if (isNumeric) return queryStringParameters[key] ? parseInt(queryStringParameters[key]) : 0;

  return queryStringParameters[key] ? queryStringParameters[key] : ('' as string);
};
