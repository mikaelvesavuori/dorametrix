import { RequestDTO } from '../interfaces/Input';

import {
  getTimestampForInputDate,
  getTimestampsForPeriod
} from '../infrastructure/frameworks/time';
import { getCurrentDate } from '../infrastructure/frameworks/date';

/**
 * @description Retrieve query string parameters from an AWS Lambda event.
 */
export function getRequestDTO(queryStringParameters: Record<string, string>): RequestDTO {
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

  const maxDate = getTimestampForInputDate(getCurrentDate(true), offset);
  if (parseInt(requestDto['to']) >= parseInt(maxDate)) throw new Error('TODO');

  return requestDto as RequestDTO;
}

/**
 * @description TODO
 */
function validateRequestInput(repo: string, to: string, from: string, lastNumDays: number) {
  if (!repo) throw new Error('TODO');
  if ((!to || !from) && !lastNumDays) throw new Error('TODO');
  if (to === getCurrentDate(true) || from === getCurrentDate(true)) throw new Error('TODO');
  if (from && to && lastNumDays) throw new Error('TODO');
}

/**
 * @description TODO
 */
const sanitizeKey = (
  queryStringParameters: Record<string, string>,
  key: string,
  isNumeric = false
) => {
  if (isNumeric) return queryStringParameters[key] ? parseInt(queryStringParameters[key]) : 0;

  return queryStringParameters[key] ? queryStringParameters[key] : ('' as string);
};
