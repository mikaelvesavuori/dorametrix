/**
 * @description Used when an expected identifier is missing.
 */
export class MissingIdError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingIdError';
    console.error(message);
  }
}
