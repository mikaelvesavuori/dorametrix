import { makeEvent } from '../../../src/domain/valueObjects/Event';

import { DirectParser } from '../../../src/application/parsers/DirectParser';

import { createEvent } from '../../../src/usecases/createEvent';

import { createNewLocalRepository } from '../../../src/infrastructure/repositories/LocalRepository';

describe('Success cases', () => {
  const repo = createNewLocalRepository();
  const parser = new DirectParser();

  test('It should create a change', async () => {
    const metricEvent = makeEvent(
      parser,
      {
        eventType: 'change',
        product: 'demo'
      },
      {}
    );

    expect(async () => await createEvent(repo, metricEvent)).not.toThrowError();
  });

  test('It should create a deployment', async () => {
    const metricEvent = makeEvent(
      parser,
      {
        eventType: 'change',
        product: 'demo'
      },
      {}
    );

    expect(async () => await createEvent(repo, metricEvent)).not.toThrowError();
  });

  test('It should create an incident', async () => {
    const metricEvent = makeEvent(
      parser,
      {
        eventType: 'change',
        product: 'demo'
      },
      {}
    );

    expect(async () => await createEvent(repo, metricEvent)).not.toThrowError();
  });
});
