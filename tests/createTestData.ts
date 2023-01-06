import { TestDataRepository } from './testDataRepository';

// Configuration
const REGION = process.env.REGION || 'eu-north-1';
const TABLE_NAME = process.env.TABLE_NAME || 'dorametrix';
const REPO_NAME = process.env.REPO_NAME || 'SOMEORG/SOMEREPO';
const DEFAULT_COUNT = process.env.DEFAULT_COUNT || 365;

/**
 * @description Outputs a valid metric object.
 */
function createDemoMetric() {
  return {
    additions: randomInteger(),
    approved: randomInteger(),
    changedFiles: randomInteger(),
    changesRequested: randomInteger(),
    closed: randomInteger(),
    comments: randomInteger(),
    deletions: randomInteger(),
    merged: randomInteger(),
    opened: randomInteger(),
    pickupTime: randomTime(),
    pushed: randomInteger(),
    reviewTime: randomTime()
  };
}

/**
 * @description Generates a random integer up to a maximum value.
 * Optionally, can take `addLeadingZero` for values that need to be
 * double digit such as `05`.
 */
function randomInteger(maxValue = 100, addLeadingZero = false) {
  const value = Math.round(Math.random() * maxValue);
  if (addLeadingZero && value.toString().length === 1) return `0${value}`;
  return value;
}

/**
 * @description Generates a random time signature such as `02:13:51:04`.
 */
function randomTime() {
  return `${randomInteger(3, true)}:${randomInteger(24, true)}:${randomInteger(
    59,
    true
  )}:${randomInteger(59, true)}`;
}

/**
 * @description Writes metrics to DynamoDB under the `METRICS_{REPO_NAME}` primary key.
 */
async function writeMetrics(metrics: Record<string, any>[]) {
  const ddb = new TestDataRepository(REPO_NAME, TABLE_NAME, REGION);

  const promises = metrics.map(async (metric: Record<string, any>) => await ddb.updateItem(metric));

  await Promise.all(promises);
}

/**
 * @description The controller for test data generation.
 */
async function createTestDataController(dataCount = DEFAULT_COUNT) {
  const demoData: any = [];

  for (let index = 0; index < dataCount; index++) {
    const date = new Date('2022-01-01');
    date.setDate(date.getDate() + index);
    demoData.push(createDemoMetric);
  }

  await writeMetrics(demoData);
}

// Run
createTestDataController();
