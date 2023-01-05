import { getRequestDTO } from '../../src/application/getRequestDTO';
import { getCurrentDate } from '../../src/infrastructure/frameworks/date';

describe('Success cases', () => {
  describe('Static set period', () => {
    test('It should create a request DTO for a set period', () => {
      const expected = { from: '1669852800', repo: 'SOMEORG/SOMEREPO', to: '1672531199' };

      const result = getRequestDTO({
        from: '20221201',
        to: '20221231',
        repo: 'SOMEORG/SOMEREPO'
      });

      expect(result).toMatchObject(expected);
    });

    test('It should create a request DTO for a set period with a negative offset', () => {
      const expected = { from: '1669834800', repo: 'SOMEORG/SOMEREPO', to: '1672513199' };

      const result = getRequestDTO({
        from: '20221201',
        to: '20221231',
        offset: '-5',
        repo: 'SOMEORG/SOMEREPO'
      });

      expect(result).toMatchObject(expected);
    });

    test('It should create a request DTO for a set period with a positive offset', () => {
      const expected = { from: '1669870800', repo: 'SOMEORG/SOMEREPO', to: '1672549199' };

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
      const expected = { from: '1586476800', repo: 'SOMEORG/SOMEREPO', to: '1672876799' };

      const result = getRequestDTO({
        last: '7',
        repo: 'SOMEORG/SOMEREPO'
      });

      expect(result).toMatchObject(expected);
    });

    test('It should create a request DTO for a dynamic period with a negative offset', () => {
      const expected = { from: '1586458800', repo: 'SOMEORG/SOMEREPO', to: '1672858799' };

      const result = getRequestDTO({
        last: '7',
        offset: '-5',
        repo: 'SOMEORG/SOMEREPO'
      });

      expect(result).toMatchObject(expected);
    });

    test('It should create a request DTO for a dynamic period with a positive offset', () => {
      const expected = { from: '1586494800', repo: 'SOMEORG/SOMEREPO', to: '1672894799' };

      const result = getRequestDTO({
        last: '7',
        offset: '5',
        repo: 'SOMEORG/SOMEREPO'
      });

      expect(result).toMatchObject(expected);
    });
  });
});

describe('Failure cases', () => {
  test('It should throw a TODO error if no repo name is present', () => {
    expect(() => {
      getRequestDTO({
        from: '20221201',
        to: '20221231'
      });
    }).toThrow();
  });

  test('It should throw a TODO error if no "to" date is present', () => {
    expect(() => {
      getRequestDTO({
        from: '20221201'
      });
    }).toThrow();
  });

  test('It should throw a TODO error if no "from" date is present', () => {
    expect(() => {
      getRequestDTO({
        to: '20221201'
      });
    }).toThrow();
  });

  test('It should throw a TODO error if the "to" date is today', () => {
    expect(() => {
      getRequestDTO({
        from: '20221201',
        to: getCurrentDate()
      });
    }).toThrow();
  });

  test('It should throw a TODO error if the "from" date is today', () => {
    expect(() => {
      getRequestDTO({
        from: getCurrentDate(),
        to: '20221201'
      });
    }).toThrow();
  });

  test('It should throw a TODO error if using both "from" + "to" and "last" parameters', () => {
    expect(() => {
      getRequestDTO({
        from: '20221201',
        to: '20221231',
        repo: 'SOMEORG/SOMEREPO',
        last: '7'
      });
    }).toThrow();
  });
});
