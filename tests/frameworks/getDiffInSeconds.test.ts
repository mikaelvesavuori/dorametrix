import { getDiffInSeconds } from '../../src/infrastructure/frameworks/getDiffInSeconds';

describe('Success cases', () => {
  test('Given inputs as strings, it should return positive numbers from them', async () => {
    expect(getDiffInSeconds('12345', '23456')).toBe(11);
  });

  test('Given inputs as numbers, it should return positive numbers from them', async () => {
    // @ts-ignore
    expect(getDiffInSeconds(12345, 23456)).toBe(11);
  });

  test('Given inputs as strings, it should return negative numbers from them', async () => {
    expect(getDiffInSeconds('23456', '12345')).toBe(-12);
  });

  test('Given inputs as numbers, it should return negative numbers from them', async () => {
    // @ts-ignore
    expect(getDiffInSeconds(23456, 12345)).toBe(-12);
  });
});
