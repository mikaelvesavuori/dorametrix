import { convertDateToUnixTimestamp } from '../../src/infrastructure/frameworks/convertDateToUnixTimestamp';
import { MissingTimeError } from '../../src/application/errors/MissingTimeError';

describe('Failure cases', () => {
  test('It should throw a MissingTimeError if no time is passed to the function', async () => {
    // @ts-ignore
    expect(() => convertDateToUnixTimestamp()).toThrowError(MissingTimeError);
  });
});

describe('Success cases', () => {
  test('It should convert a GitHub-style date', async () => {
    const date = '2021-12-31T10:01:37Z';
    expect(convertDateToUnixTimestamp(date)).toBe('1640944897000');
  });

  test('It should convert a Bitbucket-style date', async () => {
    const date = '2022-01-10T08:42:43+00:00';
    expect(convertDateToUnixTimestamp(date)).toBe('1641804163000');
  });
});
