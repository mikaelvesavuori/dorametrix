import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

import { Repository, DataRequest } from '../../interfaces/Repository';
import { Change } from '../../interfaces/Change';
import { Deployment } from '../../interfaces/Deployment';
import { Event } from '../../interfaces/Event';
import { Incident } from '../../interfaces/Incident';

import { getMilliseconds } from '../frameworks/getMilliseconds';

const docClient = new DynamoDBClient({
  region: process.env.REGION || 'eu-north-1'
});
const TABLE_NAME = process.env.TABLE_NAME || 'dorametrix';

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
  cache: Record<string, unknown>;

  constructor() {
    this.cache = {};
  }

  /**
   * @description Get data from local cache.
   */
  public getCachedData(key: string): Record<string, unknown> | undefined {
    const cachedData: any = this.cache[key];
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
    const { key, onlyGetCount, getLastDeployedCommit, days } = dataRequest;

    // Check cache first
    const cachedData = this.getCachedData(key);
    if (cachedData) return onlyGetCount ? cachedData.length : cachedData;

    const milliseconds = getMilliseconds(days);

    /**
     * Only fetch days within our time window (30 days).
     * Use a projection expression to cut back on unnecessary data transfer.
     * Fetch even less data if "onlyGetCount" is true.
     * Get by "lastDeployedCommit" value if "getLastDeployedCommit" is true.
     */
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND timeCreated >= :timeCreated',
      // KeyConditionExpression: 'pk = :pk AND sk BETWEEN :from AND :to', // TODO Gitmetrix
      ProjectionExpression: onlyGetCount
        ? 'pk, timeCreated'
        : 'pk, timeCreated, timeResolved, id, changes',
      ExpressionAttributeValues: {
        //':pk': { S: `METRICS_${repoName}` }, // TODO Gitmetrix
        ':pk': { S: key },
        ':timeCreated': {
          S: getLastDeployedCommit ? 'lastDeployedCommit' : (Date.now() - milliseconds).toString()
        }
      }
    };

    const data = await docClient.send(new QueryCommand(params));

    // Return item count if that's the only thing user wants
    if (onlyGetCount) return data?.Count || 0;

    // Clean up data objects
    const items = this.getCleanedItems(data?.Items as any);

    // Set cache
    this.cache[key] = JSON.stringify(items);

    return items;
  }

  /**
   * @description Get data from DynamoDB.
   * @todo
   */
  /*
  private async getItem(repoName: string, fromDate: string, toDate: string): Promise<DynamoItems> {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: 'pk = :pk AND sk BETWEEN :from AND :to',
      ExpressionAttributeValues: {
        ':pk': { S: `METRICS_${repoName}` },
        ':from': { S: fromDate },
        ':to': { S: toDate }
      }
    };

    // @ts-ignore
    return process.env.NODE_ENV !== 'test'
      ? await this.dynamoDb.send(new QueryCommand(params))
      : { Items: testDataItem };
  }
  */

  /**
   * @description Clean up and return items in a normalized format.
   * @todo Break out into separate function
   */
  private getCleanedItems(items: any[]) {
    const fixedItems: any = [];

    if (items && typeof items === 'object' && items.length > 0) {
      try {
        items.forEach((item: any) => {
          const cleanedItem = {};

          Object.entries(item).forEach((entry: any) => {
            const [key, value] = entry;
            // @ts-ignore
            cleanedItem[key] = Object.values(value)[0];
          });

          fixedItems.push(cleanedItem);
        });
      } catch (error: any) {
        console.error(error);
        throw new Error(error);
      }
    }

    return fixedItems;
  }

  /**
   * @description Add (create/update) an Event in the source database.
   */
  public async addEventItem(event: Event): Promise<void> {
    const { product, id, timeCreated, timeResolved, message } = event;

    const params = {
      TableName: TABLE_NAME,
      Item: {
        pk: { S: `EVENT_${product}` },
        timeCreated: { S: timeCreated },
        timeResolved: { S: timeResolved },
        message: { S: message },
        id: { S: id }
      }
    };

    await docClient.send(new PutItemCommand(params));
  }

  /**
   * @description Add (create/update) a Change in the source database.
   */
  public async addChangeItem(change: Change): Promise<void> {
    const { product, id, timeCreated } = change;

    const params = {
      TableName: TABLE_NAME,
      Item: {
        pk: { S: `CHANGE_${product}` },
        timeCreated: { S: timeCreated },
        id: { S: id }
      }
    };

    await docClient.send(new PutItemCommand(params));
  }

  /**
   * @description Add (create/update) a Deployment in the source database.
   */
  public async addDeploymentItem(
    deployment: Deployment,
    isLastDeployedCommit = false
  ): Promise<void> {
    const { product, id, changes, timeCreated } = deployment;

    const params = {
      TableName: TABLE_NAME,
      Item: {
        pk: { S: `DEPLOYMENT_${product}` },
        timeCreated: { S: isLastDeployedCommit ? 'lastDeployedCommit' : timeCreated },
        changes: { S: JSON.stringify(changes) },
        id: { S: id }
      }
    };

    await docClient.send(new PutItemCommand(params));
  }

  /**
   * @description Update (or create) an Incident in the source database.
   */
  public async updateIncidentItem(incident: Incident): Promise<void> {
    const { product, id, timeCreated, timeResolved, title } = incident;

    const params = {
      TableName: TABLE_NAME,
      Item: {
        pk: { S: `INCIDENT_${product}` },
        timeCreated: { S: timeCreated },
        timeResolved: { S: timeResolved || '' },
        title: { S: title },
        id: { S: id }
      }
    };

    await docClient.send(new PutItemCommand(params));
  }
}
