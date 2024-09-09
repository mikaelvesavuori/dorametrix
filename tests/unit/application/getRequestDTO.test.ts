import { describe, test, expect } from 'vitest';

import { getTimestampsForPeriod } from 'chrono-utils';

import { getRequestDTO } from '../../../src/application/getRequestDTO';

import {
  InvalidOffsetError,
  MissingRepoNameError,
  MissingRequiredInputParamsError,
  OutOfRangeQueryError,
  TooManyInputParamsError
} from '../../../src/application/errors/errors';

const getRandomInteger = () => Math.floor(Math.random() * 15) + 1;

describe('Success cases', () => {
  describe('Static set period', () => {
    test('It should create a request DTO for a set period', () => {
      const expected = { repo: 'SOMEORG/SOMEREPO', from: '1701388800', to: '1701734399' };

      const result = getRequestDTO({
        from: '20231201',
        to: '20231204',
        repo: 'SOMEORG/SOMEREPO'
      });

      expect(result).toMatchObject(expected);
    });

    test('It should create a request DTO for a set period with a negative offset', () => {
      const expected = { repo: 'SOMEORG/SOMEREPO', from: '1698778800', to: '1701370799' };

      const result = getRequestDTO({
        from: '20231101',
        to: '20231130',
        offset: '-5',
        repo: 'SOMEORG/SOMEREPO'
      });

      expect(result).toMatchObject(expected);
    });

    test('It should create a request DTO for a set period with a positive offset', () => {
      const expected = { repo: 'SOMEORG/SOMEREPO', from: '1700456400', to: '1701406799' };

      const result = getRequestDTO({
        from: '20231120',
        to: '20231130',
        offset: '5',
        repo: 'SOMEORG/SOMEREPO'
      });

      expect(result).toMatchObject(expected);
    });
  });

  describe('Dynamic period', () => {
    test('It should create a request DTO for a dynamic period', () => {
      const days = getRandomInteger();
      const { from, to } = getTimestampsForPeriod(days);
      const expected = { repo: 'SOMEORG/SOMEREPO', from, to };

      const result = getRequestDTO({
        last: `${days}`,
        repo: 'SOMEORG/SOMEREPO'
      });

      expect(result).toMatchObject(expected);
    });

    test('It should create a request DTO for a dynamic period with a negative offset', () => {
      const days = getRandomInteger();
      const offset = -5;
      const { from, to } = getTimestampsForPeriod(days, offset);
      const expected = { repo: 'SOMEORG/SOMEREPO', from, to };

      const result = getRequestDTO({
        last: `${days}`,
        offset: `${offset}`,
        repo: 'SOMEORG/SOMEREPO'
      });

      expect(result).toMatchObject(expected);
    });

    test('It should create a request DTO for a dynamic period with a positive offset', () => {
      const days = getRandomInteger();
      const offset = 5;
      const { from, to } = getTimestampsForPeriod(days, offset);
      const expected = { repo: 'SOMEORG/SOMEREPO', from, to };

      const result = getRequestDTO({
        last: `${days}`,
        offset: `${offset}`,
        repo: 'SOMEORG/SOMEREPO'
      });

      expect(result).toMatchObject(expected);
    });
  });
});

describe('Failure cases', () => {
  test('It should throw a MissingRepoNameError error if no repo name is present', () => {
    expect(() =>
      getRequestDTO({
        from: '20231201',
        to: '20231231'
      })
    ).toThrowError(MissingRepoNameError);
  });

  test('It should throw a MissingRequiredInputParamsError error if no "to" date is present', () => {
    expect(() =>
      getRequestDTO({
        repo: 'SOMEORG/SOMEREPO',
        from: '20231201'
      })
    ).toThrowError(MissingRequiredInputParamsError);
  });

  test('It should throw a MissingRequiredInputParamsError error if no "from" date is present', () => {
    expect(() =>
      getRequestDTO({
        repo: 'SOMEORG/SOMEREPO',
        to: '20231201'
      })
    ).toThrowError(MissingRequiredInputParamsError);
  });

  test('It should throw a OutOfRangeQueryError error if the "to" date is beyond the maximum date range', () => {
    expect(() =>
      getRequestDTO({
        repo: 'SOMEORG/SOMEREPO',
        from: '20231201',
        to: '20991231'
      })
    ).toThrowError(OutOfRangeQueryError);
  });

  test('It should throw a TooManyInputParamsError error if using both "from" + "to" and "last" parameters', () => {
    expect(() =>
      getRequestDTO({
        repo: 'SOMEORG/SOMEREPO',
        from: '20231201',
        to: '20231231',
        last: '7'
      })
    ).toThrowError(TooManyInputParamsError);
  });

  test('It should throw an InvalidOffsetError if offset is too small (negative)', () => {
    expect(() =>
      getRequestDTO({
        repo: 'SOMEORG/SOMEREPO',
        from: '20231201',
        to: '20231231',
        offset: -13
      })
    ).toThrowError(InvalidOffsetError);
  });

  test('It should throw an InvalidOffsetError if offset is too big (positive)', () => {
    expect(() =>
      getRequestDTO({
        repo: 'SOMEORG/SOMEREPO',
        from: '20231201',
        to: '20231231',
        offset: 13
      })
    ).toThrowError(InvalidOffsetError);
  });
});
