/**
 * @description Used when a value object is missing the `id` property/value.
 */
export class MissingIdValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingIdValueError';
    console.error(message);
  }
}
