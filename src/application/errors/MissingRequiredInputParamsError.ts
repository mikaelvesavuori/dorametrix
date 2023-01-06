/**
 * @description Used when all possible input query parameters are missing.
 */
export class MissingRequiredInputParamsError extends Error {
  constructor() {
    super();
    this.name = 'MissingRequiredInputParamsError';
    const message =
      'Unable to perform a query as either "to"/"from" or "last" parameters are missing.';
    this.message = message;
    console.error(message);
  }
}
