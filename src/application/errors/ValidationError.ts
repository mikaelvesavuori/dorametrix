/**
 * @description Used when a validation problem has occurred.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    console.error(message);
  }
}
