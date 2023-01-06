import { TestDataRepository } from './testDataRepository';

// Configuration
const REGION = process.env.REGION || 'eu-north-1';
const TABLE_NAME = process.env.TABLE_NAME || 'dorametrix';
const REPO_NAME = process.env.REPO_NAME || 'SOMEORG/SOMEREPO';
const DEFAULT_COUNT = process.env.DEFAULT_COUNT || 365;
const MAX_DAILY_EVENT_COUNT = 20;

/**
 * @description Outputs a valid change event.
 */
function createChangeEvent() {
  return {
    eventType: 'change',
    repo: REPO_NAME
  };
}

/**
 * @description Outputs a valid deployment event.
 */
function createDeploymentEvent() {
  return {
    eventType: 'deployment',
    repo: REPO_NAME,
    changes: [
      {
        id: '66146e134e45c9e3945eb91814d68989f79f1db9',
        timeCreated: '1673020000'
      },
      {
        id: 'a8fa8e40-122d-4741-a9f1-b70f813b7e1b',
        timeCreated: '1642879177'
      },
      {
        id: '6b2467d5-0d91-4945-af6b-483aaf762f56',
        timeCreated: '1642874964'
      },
      {
        id: 'eb6dad65-9e9c-44c8-ad6a-da0ca4ba9e98',
        timeCreated: '1642873353'
      }
    ]
  };
}

/**
 * @description Outputs a valid incident event.
 */
function createIncidentEvent() {
  return {
    eventType: 'incident',
    repo: REPO_NAME
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
 * @description Generates a random timestamp for a provided date.
 */
function randomTimestampForDate(date: string) {
  return new Date(date).getTime();
}

/**
 * @description Writes metrics to DynamoDB under the `{TYPE}_{REPO_NAME}` primary key.
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

  const randomEventCount = Math.ceil(Math.random() * MAX_DAILY_EVENT_COUNT) + 10;

  for (let index = 0; index < dataCount; index++) {
    const date = new Date('2022-01-01');
    date.setDate(date.getDate() + index);
    demoData.push(createDemoMetric);
  }

  await writeMetrics(demoData);
}

// Run
createTestDataController();
