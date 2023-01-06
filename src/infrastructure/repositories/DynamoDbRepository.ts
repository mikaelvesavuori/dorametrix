import { randomUUID } from 'crypto';
import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

import { Repository, DataRequest } from '../../interfaces/Repository';
import { Change } from '../../interfaces/Change';
import { Deployment } from '../../interfaces/Deployment';
import { Event } from '../../interfaces/Event';
import { Incident } from '../../interfaces/Incident';

import { getCleanedItems } from '../frameworks/getCleanedItems';

const dynamoDb = new DynamoDBClient({
  region: process.env.REGION || 'eu-north-1'
});

/**
 * @description Factory function to create a DynamoDB repository.
 */
export function createNewDynamoRepository() {
  return new DynamoRepository();
}

/**
 * @description Concrete implementation of DynamoDB repository.
 * @see https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-example-table-read-write.html
 */
class DynamoRepository implements Repository {
  tableName: string;

  constructor() {
    this.tableName = process.env.TABLE_NAME || 'dorametrix'; // TODO: Add error if not set
  }

  /**
   * @description Add (create/update) an Event in the repository.
   *
   * Events need to be uniquely identifiable, so overwrite the ID here.
   * To keep individual records, we'll use the event time as the timeCreated
   * so they don't stack on the same record.
   */
  public async addEvent(event: Event): Promise<void> {
    const { repo, timeCreated, timeResolved, message, eventTime } = event;

    const command = {
      TableName: this.tableName,
      Item: {
        pk: { S: `EVENT_${repo}` },
        sk: { S: timeCreated },
        timeResolved: { S: timeResolved },
        message: { S: message },
        timeCreated: { S: eventTime },
        id: { S: randomUUID() }
      }
    };

    await dynamoDb.send(new PutItemCommand(command));
  }

  /**
   * @description Add (create/update) a Change in the repository.
   */
  public async addChange(change: Change): Promise<void> {
    const { repo, id, timeCreated } = change;

    const command = {
      TableName: this.tableName,
      Item: {
        pk: { S: `CHANGE_${repo}` },
        sk: { S: timeCreated },
        timeCreated: { S: timeCreated },
        id: { S: id }
      }
    };

    await dynamoDb.send(new PutItemCommand(command));
  }

  /**
   * @description Handle (create/update) a Deployment in the repository.
   */
  public async addDeployment(deployment: Deployment): Promise<void> {
    const { repo, id, changes, timeCreated } = deployment;

    const command = {
      TableName: this.tableName,
      Item: {
        pk: { S: `DEPLOYMENT_${repo}` },
        sk: { S: timeCreated },
        changes: { S: JSON.stringify(changes) },
        id: { S: id }
      }
    };

    await dynamoDb.send(new PutItemCommand(command));

    // Update the special "last deployed" item in the database
    command['Item']['sk']['S'] = 'lastDeployedCommit';
    await dynamoDb.send(new PutItemCommand(command));
  }

  /**
   * @description Handle (create/update) an Incident in the repository.
   */
  public async addIncident(incident: Incident): Promise<void> {
    const { repo, id, timeCreated, timeResolved, title } = incident;

    const command = {
      TableName: this.tableName,
      Item: {
        pk: { S: `INCIDENT_${repo}` },
        sk: { S: timeCreated },
        timeCreated: { S: timeCreated },
        timeResolved: { S: timeResolved || '' },
        title: { S: title },
        id: { S: id }
      }
    };

    await dynamoDb.send(new PutItemCommand(command));
  }

  /**
   * @description Get metrics for a given repository and a period of time.
   */
  public async getMetrics(dataRequest: DataRequest): Promise<any> {
    const { key } = dataRequest;

    // Check cache first - TODO rewrite
    const cachedData = this.getCachedData(key);
    if (cachedData && Object.keys(cachedData).length !== 0) return cachedData;

    const data = await this.getItem(dataRequest);

    // Clean up data objects
    const items = getCleanedItems(data?.Items as any);

    return items;
  }

  /**
   * @description Get data from cache.
   */
  private getCachedData(key: string): Record<string, unknown> {
    const cachedData = false; // TODO
    if (cachedData) {
      console.log('Returning cached data...', key);
      return JSON.parse(cachedData);
    }
    return {};
  }

  /**
   * @description Get data from DynamoDB.
   * @todo
   */
  private async getItem(dataRequest: DataRequest): Promise<any> {
    const { key, fromDate, toDate, getLastDeployedCommit } = dataRequest;

    /**
     * @todo Revise text
     * Only fetch days within our time window (30 days).
     * Use a projection expression to cut back on unnecessary data transfer.
     * Get by "lastDeployedCommit" value if "getLastDeployedCommit" is true.
     */
    const command = {
      TableName: this.tableName,
      KeyConditionExpression: 'pk = :pk AND sk BETWEEN :sk AND :toDate',
      ProjectionExpression: 'pk, sk, toDate, timeResolved, id, changes',
      ExpressionAttributeValues: {
        ':pk': { S: key },
        ':sk': {
          S: getLastDeployedCommit ? 'lastDeployedCommit' : fromDate
        },
        ':toDate': { S: toDate }
      }
    };

    // @ts-ignore
    return process.env.NODE_ENV !== 'test'
      ? await dynamoDb.send(new QueryCommand(command))
      : { Items: testDataItem };
  }
}

/**
 * @description Dummy data for testing purposes.
 * @todo Use actual data shape
 */
const testDataItem = [
  {
    pk: { S: 'SOMEORG/SOMEREPO' },
    sk: { S: '1669870800' },
    chf: { N: '67' },
    rt: { N: '5313' },
    d: { N: '50' },
    ad: { N: '67' },
    pt: { N: '1413' },
    cl: { N: '33' },
    cm: { N: '40' },
    m: { N: '29' },
    chr: { N: '60' },
    o: { N: '58' },
    p: { N: '23' },
    ap: { N: '22' }
  }
];
