import { getQueryStringParams } from '../../src/frameworks/getQueryStringParams';

describe('Success cases', () => {
  test('It should drop unknown values', () => {
    expect(getQueryStringParams({ asdf: '1234' })).toMatchObject({});
  });

  test('It should accept "changeFailureRate" as a value', () => {
    expect(getQueryStringParams({ changeFailureRate: '' })).toMatchObject({
      changeFailureRate: ''
    });
  });

  test('It should accept "deploymentFrequency" as a value', () => {
    expect(getQueryStringParams({ deploymentFrequency: '' })).toMatchObject({
      deploymentFrequency: ''
    });
  });

  test('It should accept "leadTimeForChanges" as a value', () => {
    expect(getQueryStringParams({ leadTimeForChanges: '' })).toMatchObject({
      leadTimeForChanges: ''
    });
  });

  test('It should accept "timeToRestoreServices" as a value', () => {
    expect(getQueryStringParams({ timeToRestoreServices: '' })).toMatchObject({
      timeToRestoreServices: ''
    });
  });

  test('It should accept "product" as a value', () => {
    expect(getQueryStringParams({ product: 'my-service' })).toMatchObject({
      product: 'my-service'
    });
  });

  test('It should accept all possible values in one call', () => {
    const fullSet = {
      changeFailureRate: '',
      deploymentFrequency: '',
      leadTimeForChanges: '',
      timeToRestoreServices: '',
      product: 'my-service'
    };
    expect(getQueryStringParams(fullSet)).toMatchObject(fullSet);
  });
});
