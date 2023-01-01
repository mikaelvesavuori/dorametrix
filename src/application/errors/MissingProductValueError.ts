/**
 * @description Used when a value object is missing the `product` property/value.
 */
export class MissingProductValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingProductValueError';
    console.error(message);
  }
}
