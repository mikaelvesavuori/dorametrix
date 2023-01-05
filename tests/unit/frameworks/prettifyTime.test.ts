import { prettifyTime } from '../../../src/infrastructure/frameworks/prettifyTime';

describe('Success cases', () => {
  test('It should prettify a small number', async () => {
    expect(prettifyTime(60)).toBe('00:00:01:00');
  });

  test('It should prettify a large number, representing more than one day', async () => {
    expect(prettifyTime(123456)).toBe('01:10:17:36');
  });
});
