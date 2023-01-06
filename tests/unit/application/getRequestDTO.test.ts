import { getRequestDTO } from '../../../src/application/getRequestDTO';

import { getCurrentDate } from '../../../src/infrastructure/frameworks/date';
import { getTimestampsForPeriod } from '../../../src/infrastructure/frameworks/time';

import { MissingRepoNameError } from '../../../src/application/errors/MissingRepoNameError';
import { MissingRequiredInputParamsError } from '../../../src/application/errors/MissingRequiredInputParamsError';
import { OutOfRangeQueryError } from '../../../src/application/errors/OutOfRangeQueryError';
import { TooManyInputParamsError } from '../../../src/application/errors/TooManyInputParamsError';
import { InvalidIsoDateConversionError } from '../../../src/application/errors/InvalidIsoDateConversionError';

const getRandomInteger = () => Math.floor(Math.random() * 15) + 1;

describe('Success cases', () => {
  describe('Static set period', () => {
    test('It should create a request DTO for a set period', () => {
      const expected = { repo: 'SOMEORG/SOMEREPO', from: '1669852800', to: '1672531199' };

      const result = getRequestDTO({
        from: '20221201',
        to: '20221231',
        repo: 'SOMEORG/SOMEREPO'
      });

      expect(result).toMatchObject(expected);
    });

    test('It should create a request DTO for a set period with a negative offset', () => {
      const expected = { repo: 'SOMEORG/SOMEREPO', from: '1669834800', to: '1672513199' };

      const result = getRequestDTO({
        from: '20221201',
        to: '20221231',
        offset: '-5',
        repo: 'SOMEORG/SOMEREPO'
      });

      expect(result).toMatchObject(expected);
    });

    test('It should create a request DTO for a set period with a positive offset', () => {
      const expected = { repo: 'SOMEORG/SOMEREPO', from: '1669870800', to: '1672549199' };

      const result = getRequestDTO({
        from: '20221201',
        to: '20221231',
        offset: '5',
        repo: 'SOMEORG/SOMEREPO'
      });

      expect(result).toMatchObject(expected);
    });
  });

  describe('Dynamic period', () => {
    test('It should create a request DTO for a dynamic period', () => {
      const days = getRandomInteger();
      const time = getTimestampsForPeriod(days);
      const expected = { repo: 'SOMEORG/SOMEREPO', from: time.from, to: time.to };

      const result = getRequestDTO({
        last: `${days}`,
        repo: 'SOMEORG/SOMEREPO'
      });

      expect(result).toMatchObject(expected);
    });

    test('It should create a request DTO for a dynamic period with a negative offset', () => {
      const days = getRandomInteger();
      const offset = -5;
      const time = getTimestampsForPeriod(days, offset);
      const expected = { repo: 'SOMEORG/SOMEREPO', from: time.from, to: time.to };

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
      const time = getTimestampsForPeriod(days, offset);
      const expected = { repo: 'SOMEORG/SOMEREPO', from: time.from, to: time.to };

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
    expect(() => {
      getRequestDTO({
        from: '20221201',
        to: '20221231'
      });
    }).toThrowError(MissingRepoNameError);
  });

  test('It should throw a MissingRequiredInputParamsError error if no "to" date is present', () => {
    expect(() => {
      getRequestDTO({
        repo: 'SOMEORG/SOMEREPO',
        from: '20221201'
      });
    }).toThrowError(MissingRequiredInputParamsError);
  });

  test('It should throw a MissingRequiredInputParamsError error if no "from" date is present', () => {
    expect(() => {
      getRequestDTO({
        repo: 'SOMEORG/SOMEREPO',
        to: '20221201'
      });
    }).toThrowError(MissingRequiredInputParamsError);
  });

  test('It should throw a OutOfRangeQueryError error if the "to" date is beyond the maximum date range', () => {
    expect(() => {
      getRequestDTO({
        repo: 'SOMEORG/SOMEREPO',
        from: '20221201',
        to: '20991231'
      });
    }).toThrowError(OutOfRangeQueryError);
  });

  // TODO?
  test('It should throw a InvalidIsoDateConversionError error if the "to" date is today', () => {
    expect(() => {
      getRequestDTO({
        repo: 'SOMEORG/SOMEREPO',
        from: '20221201',
        to: getCurrentDate()
      });
    }).toThrowError(InvalidIsoDateConversionError);
  });

  // TODO?
  test('It should throw a OutOfRangeQueryError error if the "from" date is today', () => {
    expect(() => {
      getRequestDTO({
        repo: 'SOMEORG/SOMEREPO',
        from: getCurrentDate(),
        to: '20221201'
      });
    }).toThrowError(InvalidIsoDateConversionError);
  });

  test('It should throw a TooManyInputParamsError error if using both "from" + "to" and "last" parameters', () => {
    expect(() => {
      getRequestDTO({
        repo: 'SOMEORG/SOMEREPO',
        from: '20221201',
        to: '20221231',
        last: '7'
      });
    }).toThrowError(TooManyInputParamsError);
  });
});
