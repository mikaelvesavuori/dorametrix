import { sanitizeString } from '../../src/infrastructure/frameworks/sanitizeString';

import { MissingStringError } from '../../src/application/errors/MissingStringError';

describe('Failure cases', () => {
  test('It should throw a MissingStringError', async () => {
    // @ts-ignore
    expect(() => sanitizeString()).toThrowError(MissingStringError);
  });
});

describe('Success cases', () => {
  test('Given a set of chaotic characters as a key, it should sanitize them', () => {
    expect(sanitizeString('LJKH#()7tycp89aghf98+ty2q4asdäfÖÄ* LSDF   as]≈||[||')).toBe(
      'LJKH7tycp89aghf98ty2q4asdäfÖÄLSDFas'
    );
  });

  test('Given a URL as a key, it should sanitize it', () => {
    expect(sanitizeString('https://www.mydomain.com/something/')).toBe(
      'httpswwwmydomaincomsomething'
    );
  });

  test('Given a set of chaotic characters as a value, it should sanitize a subset of characters', () => {
    expect(sanitizeString('LJKH#()7tycp89aghf98+ty2q4asdäfÖÄ* LSDF   as]≈||[||', true)).toBe(
      'LJKH()7tycp89aghf98ty2q4asdäfÖÄ LSDF   as]['
    );
  });

  test('Given a URL as a value, it should not sanitize it', () => {
    expect(sanitizeString('https://www.mydomain.com/something/', true)).toBe(
      'https://www.mydomain.com/something/'
    );
  });
});
