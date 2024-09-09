import { describe, test, expect } from 'vitest';

import { createNewDynamoDbRepository } from '../../../../src/infrastructure/repositories/DynamoDbRepository';

import { MissingEnvironmentVariablesDynamoError } from '../../../../src/application/errors/errors';

describe('Failure cases', () => {
  test('It should throw a MissingEnvironmentVariablesDynamoError if missing required environment variables', async () => {
    expect(() => createNewDynamoDbRepository()).toThrowError(
      MissingEnvironmentVariablesDynamoError
    );
  });
});
