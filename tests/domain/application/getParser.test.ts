import { BitbucketParser } from '../../../src/domain/application/BitbucketParser';
import { DirectParser } from '../../../src/domain/application/DirectParser';
import { getParser } from '../../../src/domain/application/getParser';
import { GitHubParser } from '../../../src/domain/application/GitHubParser';

describe('Success cases', () => {
  test('It should get the GitHub parser', () => {
    const parser = getParser({
      'User-Agent': 'GitHub'
    });
    expect(parser).toBeInstanceOf(GitHubParser);
  });

  test('It should get the Bitbucket parser', () => {
    const parser = getParser({
      'User-Agent': 'Bitbucket'
    });
    expect(parser).toBeInstanceOf(BitbucketParser);
  });

  test('It should get the direct parser', () => {
    const parser = getParser({
      'User-Agent': 'something_else'
    });
    expect(parser).toBeInstanceOf(DirectParser);
  });

  test('It should get the direct parser with lower-case user-agent headers', () => {
    const parser = getParser({
      'user-agent': 'something_else'
    });
    expect(parser).toBeInstanceOf(DirectParser);
  });

  test('It should get the direct parser if missing User-Agent headers', () => {
    // @ts-ignore
    const parser = getParser();
    expect(parser).toBeInstanceOf(DirectParser);
  });
});
