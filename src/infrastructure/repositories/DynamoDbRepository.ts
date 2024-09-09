import { randomUUID } from 'crypto';
import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

import { Repository, DataRequest, CacheRequest } from '../../interfaces/Repository';
import { CleanedItem } from '../../interfaces/CleanedItem';
import { Change } from '../../interfaces/Change';
import { Deployment } from '../../interfaces/Deployment';
import { Event } from '../../interfaces/Event';
import { Incident } from '../../interfaces/Incident';
import { DynamoItems } from '../../interfaces/DynamoDb';
import { Metrics } from '../../interfaces/Metrics';

import { getExpiryTime } from '../../application/getExpiryTime';

import { getCleanedItems } from '../frameworks/getCleanedItems';

import { MissingEnvironmentVariablesDynamoError } from '../../application/errors/errors';

import { getCachedTestData, getTestData } from '../../../testdata/database/DynamoTestDatabase';

/**
 * @description Factory function to create a DynamoDB repository.
 */
export function createNewDynamoDbRepository() {
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
   * @description Get metrics (changes/deployments/incidents) for a given repository and a period of time.
   */
  public async getMetrics(dataRequest: DataRequest): Promise<CleanedItem[]> {
    return await this.getItem(dataRequest);
  }

  /**
   * @description Get metrics from cache.
   */
  public async getCachedMetrics(dataRequest: DataRequest): Promise<Metrics> {
    const { key, from, to } = dataRequest;

    const params = {
      TableName: this.tableName,
      KeyConditionExpression: 'pk = :pk AND sk = :sk',
      ExpressionAttributeValues: {
        ':pk': { S: `CACHED_${key}` },
        ':sk': { S: `${from}_${to}` }
      },
      Limit: 1
    };

    // @ts-ignore
    const cachedData: DynamoItems | null =
      process.env.NODE_ENV !== 'test'
        ? await this.dynamoDb.send(new QueryCommand(params))
        : getCachedTestData(key, from, to);

    if (cachedData?.Items && cachedData.Items.length > 0)
      return JSON.parse(cachedData.Items[0].data['S']);

    return {} as any;
  }

  /**
   * @description Caches metrics with PutItem command.
   */
  public async cacheMetrics(cacheRequest: CacheRequest): Promise<void> {
    const { key, range, metrics } = cacheRequest;

    const command = {
      TableName: this.tableName,
      Item: {
        pk: { S: `CACHED_${key}` },
        sk: { S: range },
        expiresAt: { S: getExpiryTime() },
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
        expiresAt: { S: getExpiryTime(true) },
        timeCreated: { S: eventTime },
        timeResolved: { S: timeResolved },
        message: { S: message },
        id: { S: randomUUID() }
      }
    };

    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'test') await this.dynamoDb.send(new PutItemCommand(command));
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
        expiresAt: { S: getExpiryTime() },
        timeCreated: { S: timeCreated },
        id: { S: id }
      }
    };

    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'test') await this.dynamoDb.send(new PutItemCommand(command));
  }

  /**
   * @description Handle (create/update) a Deployment in the repository.
   */
  public async addDeployment(deployment: Deployment): Promise<void> {
    const { repo, id, changeSha, timeCreated } = deployment;

    const command = {
      TableName: this.tableName,
      Item: {
        pk: { S: `DEPLOYMENT_${repo}` },
        sk: { S: timeCreated },
        expiresAt: { S: getExpiryTime() },
        timeCreated: { S: timeCreated },
        changeSha: { S: JSON.stringify(changeSha) },
        id: { S: id }
      }
    };

    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'test') await this.dynamoDb.send(new PutItemCommand(command));

    // Update the special "last deployed" item in the database
    command['Item']['sk']['S'] = 'LastDeployedCommit';
    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'test') await this.dynamoDb.send(new PutItemCommand(command));
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
        expiresAt: { S: getExpiryTime() },
        timeCreated: { S: timeCreated },
        timeResolved: { S: timeResolved || '' },
        title: { S: title },
        id: { S: id }
      }
    };

    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'test') await this.dynamoDb.send(new PutItemCommand(command));
  }

  /////////////////////
  // Private methods //
  /////////////////////

  /**
   * @description Get data from DynamoDB.
   */
  private async getItem(dataRequest: DataRequest): Promise<any> {
    const { key, from, to, getLastDeployedCommit } = dataRequest;

    const command: any = (() => {
      if (getLastDeployedCommit)
        return {
          TableName: this.tableName,
          KeyConditionExpression: 'pk = :pk AND sk = :sk',
          ExpressionAttributeValues: {
            ':pk': { S: key },
            ':sk': { S: 'LastDeployedCommit' }
          }
        };
      return {
        TableName: this.tableName,
        KeyConditionExpression: 'pk = :pk AND sk BETWEEN :sk AND :to',
        ExpressionAttributeValues: {
          ':pk': { S: key },
          ':sk': { S: from },
          ':to': { S: to }
        }
      };
    })();

    const data: any =
      process.env.NODE_ENV !== 'test'
        ? await this.dynamoDb.send(new QueryCommand(command))
        : getTestData(key);

    // Unless we really want the last deployed commit, let's filter it out
    return getCleanedItems(data?.Items || []).filter((item) => {
      if (getLastDeployedCommit) return item;
      else if (item.timeCreated !== 'LastDeployedCommit') return item;
    });
  }
}
