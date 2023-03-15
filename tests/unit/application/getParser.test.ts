import { BitbucketParser } from '../../../src/application/parsers/BitbucketParser';
import { DirectParser } from '../../../src/application/parsers/DirectParser';
import { getParser } from '../../../src/application/getParser';
import { GitHubParser } from '../../../src/application/parsers/GitHubParser';

describe('Success cases', () => {
  test('It should get the GitHub parser', async () => {
    const parser = await getParser({
      'User-Agent': 'GitHub'
    });
    expect(parser).toBeInstanceOf(GitHubParser);
  });

  test('It should get the Bitbucket parser', async () => {
    const parser = await getParser({
      'User-Agent': 'Bitbucket'
    });
    expect(parser).toBeInstanceOf(BitbucketParser);
  });

  test('It should get the direct parser',async () => {
    const parser = await getParser({
      'User-Agent': 'something_else'
    });
    expect(parser).toBeInstanceOf(DirectParser);
  });

  test('It should get the direct parser with lower-case user-agent headers', async  () => {
    const parser = await getParser({
      'user-agent': 'something_else'
    });
    expect(parser).toBeInstanceOf(DirectParser);
  });

  test('It should get the direct parser if missing User-Agent headers', async () => {
    // @ts-ignore
    const parser = await getParser();
    expect(parser).toBeInstanceOf(DirectParser);
  });
});
