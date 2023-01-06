/**
 * @description Used when a date to be ISO-formatted is not valid.
 */
export class InvalidIsoDateConversionError extends Error {
  constructor() {
    super();
    this.name = 'InvalidIsoDateConversionError';
    const message =
      'Either missing date to convert to ISO format or the length is not 8 characters long (YYYYMMDD format)!';
    this.message = message;
    console.error(message);
  }
}
