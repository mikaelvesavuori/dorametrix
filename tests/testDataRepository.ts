import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

/**
 * @description Minimalist implementation for DynamoDB when adding test data.
 */
export class TestDataRepository {
  readonly dynamoDb: DynamoDBClient;
  readonly repoName: string;
  readonly tableName: string;
  readonly region: string;

  constructor(repoName: string, tableName: string, region: string) {
    this.repoName = repoName;
    this.tableName = tableName;
    this.region = region;
    this.dynamoDb = new DynamoDBClient({ region: this.region });
  }

  public async updateItem(input: Record<string, any>): Promise<void> {
    const date = Object.keys(input)[0];
    const {
      additions,
      approved,
      changedFiles,
      changesRequested,
      closed,
      comments,
      deletions,
      merged,
      opened,
      pickupTime,
      pushed,
      reviewTime
    } = input[date];

    const primaryKey = `METRICS_${this.repoName}`;

    const params = {
      Item: {
        p: { N: `${pushed}` },
        o: { N: `${opened}` },
        m: { N: `${merged}` },
        cl: { N: `${closed}` },
        cm: { N: `${comments}` },
        ap: { N: `${approved}` },
        chr: { N: `${changesRequested}` },
        ad: { N: `${additions}` },
        chf: { N: `${changedFiles}` },
        d: { N: `${deletions}` },
        pt: { S: `${pickupTime}` },
        rt: { S: `${reviewTime}` },
        pk: { S: primaryKey },
        sk: { S: date }
      },
      TableName: this.tableName
    };

    await this.dynamoDb.send(new PutItemCommand(params));
  }
}
