import { MissingStringError } from '../../application/errors/MissingStringError';

/**
 * @description String sanitizer utility to cap length and allow only certain characters.
 * @see https://stackoverflow.com/questions/23187013/is-there-a-better-way-to-sanitize-input-with-javascript
 */
export function sanitizeString(str: string, isValue = false) {
  if (!str) throw new MissingStringError('Missing string when calling "sanitizeString"!');

  const maxLength = isValue ? 500 : 50;
  const regexKeys = new RegExp(/[^a-z0-9@åäöøáéíóúñü\-_]/gim);
  const regexValues = new RegExp(/[^a-z0-9()\[\]\/\:åäöøáéíóúñü\.\s\-_]/gim);

  return (isValue ? str.replace(regexValues, '') : str.replace(regexKeys, ''))
    .trim()
    .substring(0, maxLength);
}
