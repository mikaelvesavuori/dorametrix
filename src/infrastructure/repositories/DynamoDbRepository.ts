import { randomUUID } from 'crypto';
import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

import { Repository, DataRequest } from '../../interfaces/Repository';
import { CleanedItem } from '../../interfaces/CleanedItem';
import { Change } from '../../interfaces/Change';
import { Deployment } from '../../interfaces/Deployment';
import { Event } from '../../interfaces/Event';
import { Incident } from '../../interfaces/Incident';

import { getCleanedItems } from '../frameworks/getCleanedItems';

import { MissingEnvironmentVariablesDynamoError } from '../../application/errors/MissingEnvironmentVariablesDynamoError';
import { DynamoItem, DynamoItems } from '../../interfaces/DynamoDb';
import { Metrics } from '../../interfaces/Metrics';

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
  readonly dynamoDb: DynamoDBClient;
  readonly tableName: string;
  readonly region: string;

  constructor() {
    const REGION = process.env.REGION;
    const TABLE_NAME = process.env.TABLE_NAME;
    if (!REGION || !TABLE_NAME) throw new MissingEnvironmentVariablesDynamoError();

    this.tableName = TABLE_NAME;
    this.region = REGION;
    this.dynamoDb = new DynamoDBClient({ region: this.region });
  }

  /////////////
  // Metrics //
  /////////////

  /**
   * @description Get metrics for a given repository and a period of time.
   */
  public async getMetrics(dataRequest: DataRequest): Promise<CleanedItem[]> {
    const data = await this.getItem(dataRequest);
    const items = data?.Items || [];

    return getCleanedItems(items);
  }

  /**
   * @description Caches metrics with PutItem command.
   * @todo Input type
   */
  public async cacheMetrics(key: string, range: string, metrics: Metrics): Promise<void> {
    const command = {
      TableName: this.tableName,
      Item: {
        pk: { S: `CACHED_${key}` },
        sk: { S: range },
        data: { S: JSON.stringify(metrics) }
      }
    };

    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'test') await this.dynamoDb.send(new PutItemCommand(command));
  }

  ////////////
  // Events //
  ////////////

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
        timeCreated: { S: eventTime },
        timeResolved: { S: timeResolved },
        message: { S: message },
        id: { S: randomUUID() }
      }
    };

    await this.dynamoDb.send(new PutItemCommand(command));
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

    await this.dynamoDb.send(new PutItemCommand(command));
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
        timeCreated: { S: timeCreated },
        changes: { S: JSON.stringify(changes) },
        id: { S: id }
      }
    };

    await this.dynamoDb.send(new PutItemCommand(command));

    // Update the special "last deployed" item in the database
    command['Item']['sk']['S'] = 'LastDeployedCommit';
    await this.dynamoDb.send(new PutItemCommand(command));
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

    await this.dynamoDb.send(new PutItemCommand(command));
  }

  /////////////////////
  // Private methods //
  /////////////////////

  /**
   * @description Get data from cache.
   * @todo
   */
  public async getCachedData(key: string, range: string): Promise<Metrics> {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: 'pk = :pk AND sk = :sk',
      ExpressionAttributeValues: {
        ':pk': { S: `CACHED_${key}` },
        ':sk': { S: range }
      },
      Limit: 1
    };

    // @ts-ignore
    const cachedData: DynamoItems | null = await this.dynamoDb.send(new QueryCommand(params));

    if (cachedData?.Items && cachedData.Items.length > 0)
      return JSON.parse(cachedData.Items[0].data['S']);

    return {} as any;
  }

  /**
   * @description Get data from DynamoDB.
   */
  private async getItem(dataRequest: DataRequest): Promise<any> {
    const { key, fromDate, toDate, getLastDeployedCommit } = dataRequest;

    /**
     * @todo Revise text
     * Get by "LastDeployedCommit" value if "getLastDeployedCommit" is true.
     */
    const command = {
      TableName: this.tableName,
      KeyConditionExpression: 'pk = :pk AND sk BETWEEN :sk AND :toDate',
      ExpressionAttributeValues: {
        ':pk': { S: key },
        ':sk': {
          S: getLastDeployedCommit ? 'LastDeployedCommit' : fromDate
        },
        ':toDate': { S: toDate }
      }
    };

    // @ts-ignore
    return process.env.NODE_ENV !== 'test'
      ? await this.dynamoDb.send(new QueryCommand(command))
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
