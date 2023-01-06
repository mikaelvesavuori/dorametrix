/**
 * @description Used when cleaning items fails.
 */
export class CleanedItemsError extends Error {
  constructor() {
    super();
    this.name = 'CleanedItemsError';
    const message = 'Failed when attempting to retrieve cleaned items!';
    this.message = message;
    console.error(message);
  }
}
