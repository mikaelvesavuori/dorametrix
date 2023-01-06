import { DirectParser } from '../../../src/application/parsers/DirectParser';

import { UnknownEventTypeError } from '../../../src/application/errors/UnknownEventTypeError';

describe('Failure cases', () => {
  test('It should throw an UnknownEventTypeError if event type is unknown', async () => {
    const parser = new DirectParser();
    expect(() =>
      parser.getEventType({
        body: {
          asdf: '1234'
        }
      })
    ).toThrowError(UnknownEventTypeError);
  });
});

describe('Success cases', () => {
  describe('Event types', () => {
    test('It should take in a "change" event and return "change"', () => {
      const parser = new DirectParser();
      const eventType = parser.getEventType({
        body: {
          eventType: 'change'
        }
      });
      expect(eventType).toBe('change');
    });
  });

  describe('Payloads', () => {
    test('It should take in a typical "direct call" event and return time created and ID', () => {
      const parser = new DirectParser();
      const payload = parser.getPayload();
      expect(payload).toHaveProperty('timeCreated');
      expect(payload).toHaveProperty('id');
    });
  });

  describe('Product name', () => {
    test('It should take in a typical "direct call" event and return the product name', () => {
      const parser = new DirectParser();
      const productName = parser.getProductName({
        product: 'my-project'
      });
      expect(productName).toBe('my-project');
    });

    test('It should take in a typical "direct call" event and return an empty string if it is missing', () => {
      const parser = new DirectParser();
      const productName = parser.getProductName({});
      expect(productName).toBe('');
    });

    test('It should take in a typical "direct call" event and return an empty string even if no input is provided', () => {
      const parser = new DirectParser();
      // @ts-ignore
      const productName = parser.getProductName();
      expect(productName).toBe('');
    });
  });
});
