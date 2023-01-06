/**
 * @description Used when a value object is missing the `repoName` property/value.
 */
export class MissingRepoNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingRepoNameError';
    console.error(message);
  }
}
