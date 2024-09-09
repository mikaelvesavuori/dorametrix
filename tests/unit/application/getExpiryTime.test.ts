import { describe, test, expect } from 'vitest';

import { getMillisecondsForDays } from 'chrono-utils';

import { getExpiryTime } from '../.././../src/application/getExpiryTime';

describe('Success cases', () => {
  test('It should get the default expiration time when not using "process.env.MAX_DATE_RANGE"', () => {
    const maxDateRange = 365;
    const currentTimeStamp = Math.floor(Date.now() / 1000);
    const expected = (
      currentTimeStamp +
      getMillisecondsForDays(maxDateRange + 1) / 1000
    ).toString();

    const result = getExpiryTime();
    expect(result).toBe(expected);
  });

  test('It should get the short expiration time when not using "process.env.MAX_DATE_RANGE"', () => {
    const maxDateRange = 14;
    const currentTimeStamp = Math.floor(Date.now() / 1000);
    const expected = (
      currentTimeStamp +
      getMillisecondsForDays(maxDateRange + 1) / 1000
    ).toString();

    const result = getExpiryTime(true);
    expect(result).toBe(expected);
  });

  test('It should set the expiration time when using "process.env.MAX_DATE_RANGE"', () => {
    const maxDateRange = 30;
    process.env.MAX_DATE_RANGE = `${maxDateRange}`;
    const currentTimeStamp = Math.floor(Date.now() / 1000);
    const expected = (
      currentTimeStamp +
      getMillisecondsForDays(maxDateRange + 1) / 1000
    ).toString();

    const result = getExpiryTime();
    expect(result).toBe(expected);
    process.env.MAX_DATE_RANGE = undefined;
  });

  test('It should set the shorter expiration time when using "process.env.MAX_DATE_RANGE" and having a value of 14', () => {
    process.env.MAX_DATE_RANGE = `30`;
    const currentTimeStamp = Math.floor(Date.now() / 1000);
    const expected = (currentTimeStamp + getMillisecondsForDays(14 + 1) / 1000).toString();

    const result = getExpiryTime(true);
    expect(result).toBe(expected);
    process.env.MAX_DATE_RANGE = undefined;
  });
});
