/**
 * @description Used when all mutually exclusive query parameters are used at the same time.
 */
export class TooManyInputParamsError extends Error {
  constructor() {
    super();
    this.name = 'TooManyInputParamsError';
    const message = 'To perform a query use either "to"/"from" or "last" parameters.';
    this.message = message;
    console.error(message);
  }
}
