import { BitbucketParser } from './parsers/BitbucketParser';
import { DirectParser } from './parsers/DirectParser';
import { GitHubParser } from './parsers/GitHubParser';
import { JiraParser } from './parsers/JiraParser';
import { ShortcutParser } from './parsers/ShortcutParser';

import { Parser } from '../interfaces/Parser';

/**
 * @description Infer the correct parser to use, based on metadata from headers.
 */
export function getParser(headers: Record<string, any>): Parser {
  
  const ua = headers?.['User-Agent'] || headers?.['user-agent'];
  const signature = 'Clubhouse-Signature' in (headers || {}) || 'Shortcut-Signature' in (headers || {});

  if (ua && ua.includes('GitHub')) return new GitHubParser();
  if (ua && ua.includes('Bitbucket')) return new BitbucketParser();
  if (ua && ua.includes('Atlassian')) return new JiraParser();
  if (ua && ua.includes('Apache-HttpClient') && signature) return new ShortcutParser();
  return new DirectParser();
}
