import { createNewDorametrix } from '../../src/domain/entities/Dorametrix';
import { DirectParser } from '../../src/domain/application/DirectParser';

import { createEvent } from '../../src/usecases/createEvent';

import { createNewLocalRepository } from '../../src/repositories/LocalRepo';

describe('Success cases', () => {
  test('It should create a change', async () => {
    const dorametrix = createNewDorametrix(createNewLocalRepository());
    const parser = new DirectParser();
    expect(
      async () =>
        await createEvent(
          dorametrix,
          parser,
          {
            eventType: 'change',
            product: 'demo'
          },
          {}
        )
    ).not.toThrowError();
  });

  test('It should create a deployment', async () => {
    const dorametrix = createNewDorametrix(createNewLocalRepository());
    const parser = new DirectParser();
    expect(
      async () =>
        await createEvent(
          dorametrix,
          parser,
          {
            eventType: 'deployment',
            product: 'demo'
          },
          {}
        )
    ).not.toThrowError();
  });

  test('It should create a incident', async () => {
    const dorametrix = createNewDorametrix(createNewLocalRepository());
    const parser = new DirectParser();
    expect(
      async () =>
        await createEvent(
          dorametrix,
          parser,
          {
            eventType: 'incident',
            product: 'demo'
          },
          {}
        )
    ).not.toThrowError();
  });
});
