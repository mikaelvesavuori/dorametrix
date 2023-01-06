/**
 * @description Used when a provided offset is not valid.
 */
export class InvalidOffsetError extends Error {
  constructor() {
    super();
    this.name = 'InvalidOffsetError';
    const message = 'Offset in hours must be provided as a number between -12 and 12!';
    this.message = message;
    console.error(message);
  }
}
