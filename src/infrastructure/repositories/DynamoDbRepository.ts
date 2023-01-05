import { v4 as uuidv4 } from 'uuid';

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
    this.tableName = process.env.TABLE_NAME || 'dorametrix';
  }

  /**
   * @description Handle (create/update) an event in the repository.
   * Events need to be uniquely identifiable, so overwrite the ID here.
   * To keep individual records, we'll use the event time as the timeCreated
   * so they don't stack on the same record.
   */
  public async handleEvent(event: Event): Promise<void> {
    await this.addEventItem({
      ...event,
      timeCreated: event.eventTime,
      id: uuidv4()
    });
  }

  /**
   * @description Handle (create/update) a change in the repository.
   */
  public async handleChange(change: Change): Promise<void> {
    await this.addChangeItem(change);
  }

  /**
   * @description Handle (create/update) a deployment in the repository.
   */
  public async handleDeployment(deployment: Deployment): Promise<void> {
    await this.addDeploymentItem(deployment);
    await this.addDeploymentItem(deployment, true);
  }

  /**
   * @description Handle (create/update) an incident in the repository.
   */
  public async handleIncident(incident: Incident): Promise<void> {
    await this.updateIncidentItem(incident);
  }

  /**
   * @description Get data from local cache.
   */
  public getCachedData(key: string): Record<string, unknown> | undefined {
    if (1 > 2) console.log(key);
    const cachedData = false; // TODO
    if (cachedData) {
      console.log('Returning cached data...');
      return JSON.parse(cachedData);
    }
    return undefined;
  }

  /**
   * @description Get metrics for a given repository and a period of time.
   */
  public async getMetrics(dataRequest: DataRequest): Promise<any> {
    const { key } = dataRequest;

    // Check cache first - TODO rewrite
    const cachedData = this.getCachedData(key);
    if (cachedData) return cachedData;

    const data = await this.getItem(dataRequest);

    // Clean up data objects
    const items = getCleanedItems(data?.Items as any);

    return items;
  }

  /**
   * @description Get data from DynamoDB.
   * @todo
   */
  private async getItem(dataRequest: DataRequest): Promise<any> {
    // repoName: string, fromDate: string, toDate: string
    // DynamoItems
    const { fromDate, toDate, key, getLastDeployedCommit } = dataRequest; // ,days

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

  /**
   * @description Add (create/update) an Event in the source database.
   */
  private async addEventItem(event: Event): Promise<void> {
    const { product, id, timeCreated, timeResolved, message } = event;

    const command = {
      TableName: this.tableName,
      Item: {
        pk: { S: `EVENT_${product}` },
        sk: { S: timeCreated },
        timeResolved: { S: timeResolved },
        message: { S: message },
        id: { S: id }
      }
    };

    await dynamoDb.send(new PutItemCommand(command));
  }

  /**
   * @description Add (create/update) a Change in the source database.
   */
  private async addChangeItem(change: Change): Promise<void> {
    const { product, id, timeCreated } = change;

    const command = {
      TableName: this.tableName,
      Item: {
        pk: { S: `CHANGE_${product}` },
        sk: { S: timeCreated },
        id: { S: id }
      }
    };

    await dynamoDb.send(new PutItemCommand(command));
  }

  /**
   * @description Add (create/update) a Deployment in the source database.
   */
  private async addDeploymentItem(
    deployment: Deployment,
    isLastDeployedCommit = false
  ): Promise<void> {
    const { product, id, changes, timeCreated } = deployment;

    const command = {
      TableName: this.tableName,
      Item: {
        pk: { S: `DEPLOYMENT_${product}` },
        sk: { S: isLastDeployedCommit ? 'lastDeployedCommit' : timeCreated },
        changes: { S: JSON.stringify(changes) },
        id: { S: id }
      }
    };

    await dynamoDb.send(new PutItemCommand(command));
  }

  /**
   * @description Update (or create) an Incident in the source database.
   */
  private async updateIncidentItem(incident: Incident): Promise<void> {
    const { product, id, timeCreated, timeResolved, title } = incident;

    const command = {
      TableName: this.tableName,
      Item: {
        pk: { S: `INCIDENT_${product}` },
        sk: { S: timeCreated },
        timeResolved: { S: timeResolved || '' },
        title: { S: title },
        id: { S: id }
      }
    };

    await dynamoDb.send(new PutItemCommand(command));
  }
}

/**
 * @description Dummy data for testing purposes.
 * @todo
 */
const testDataItem = [
  {
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
    ap: { N: '22' },
    sk: { S: '20221115' },
    pk: { S: 'METRICS_SOMEORG/SOMEREPO' }
  }
];
