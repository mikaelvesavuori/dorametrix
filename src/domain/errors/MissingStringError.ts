/**
 * @description Used when sanitizer is missing an input string.
 */
export class MissingStringError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingStringError';
    console.error(message);
  }
}
