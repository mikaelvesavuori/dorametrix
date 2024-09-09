import { describe, test, expect } from 'vitest';

import { BitbucketParser } from '../../../src/application/parsers/BitbucketParser';
import { DirectParser } from '../../../src/application/parsers/DirectParser';
import { getParser } from '../../../src/application/getParser';
import { GitHubParser } from '../../../src/application/parsers/GitHubParser';
import { ShortcutParser } from '../../../src/application/parsers/ShortcutParser';
import { JiraParser } from '../../../src/application/parsers/JiraParser';

describe('Success cases', () => {
  test('It should get the GitHub parser', async () => {
    const parser = getParser({
      'User-Agent': 'GitHub'
    });
    expect(parser).toBeInstanceOf(GitHubParser);
  });

  test('It should get the Jira parser', async () => {
    const parser = getParser({
      'User-Agent': 'Atlassian'
    });
    expect(parser).toBeInstanceOf(JiraParser);
  });

  test('It should get the Bitbucket parser', async () => {
    const parser = getParser({
      'User-Agent': 'Bitbucket'
    });
    expect(parser).toBeInstanceOf(BitbucketParser);
  });

  test('It should get the direct parser', async () => {
    const parser = getParser({
      'User-Agent': 'something_else'
    });
    expect(parser).toBeInstanceOf(DirectParser);
  });

  test('It should get the direct parser with lower-case user-agent headers', async () => {
    const parser = getParser({
      'user-agent': 'something_else'
    });
    expect(parser).toBeInstanceOf(DirectParser);
  });

  test('It should get the direct parser if missing User-Agent headers', async () => {
    // @ts-ignore
    const parser = getParser();
    expect(parser).toBeInstanceOf(DirectParser);
  });

  test('It should get the Shortcut parser', async () => {
    process.env.SHORTCUT_TOKEN = 'A';
    process.env.SHORTCUT_REPONAME = 'A';
    process.env.SHORTCUT_INCIDENT_LABEL_ID = '1';

    const parser = getParser({
      'User-Agent': 'Apache-HttpClient',
      'Shortcut-Signature': '---'
    });
    expect(parser).toBeInstanceOf(ShortcutParser);
  });
});
