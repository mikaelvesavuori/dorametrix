import { BitbucketParser } from './parsers/BitbucketParser';
import { DirectParser } from './parsers/DirectParser';
import { GitHubParser } from './parsers/GitHubParser';
import { JiraParser } from './parsers/JiraParser';

import { Parser } from '../interfaces/Parser';

/**
 * @description Infer the correct parser to use, based on metadata from headers.
 */
export function getParser(headers: any): Parser {
  const ua = headers?.['User-Agent'] || headers?.['user-agent'];
  if (ua && ua.includes('GitHub')) return new GitHubParser();
  if (ua && ua.includes('Bitbucket')) return new BitbucketParser();
  if (ua && ua.includes('Atlassian')) return new JiraParser();
  return new DirectParser();
}
