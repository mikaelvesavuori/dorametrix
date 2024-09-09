import { describe, test, expect } from 'vitest';

import { createQueryStringParamsObjectFromString } from '../../../src/application/createQueryStringParamsObjectFromString';

describe('Success cases', () => {
  test('It should return a clean object from a query parameter string', () => {
    const expected = { repo: 'SOMEORG/SOMEREPO', from: '20230220', to: '20230225' };

    const result = createQueryStringParamsObjectFromString({
      rawQueryString: 'repo=SOMEORG/SOMEREPO&from=20230220&to=20230225'
    });

    expect(result).toMatchObject(expected);
  });

  test('It should return an empty object for an unknown input', () => {
    const expected = {};

    const result = createQueryStringParamsObjectFromString({});

    expect(result).toMatchObject(expected);
  });
});
