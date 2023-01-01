import { Repository, DataRequest } from '../../interfaces/Repository';

import { deployments, changes, incidents } from '../../../testdata/TestDatabase';

/**
 * @description Factory function for local repository.
 */
export function createNewLocalRepository(testData?: TestData): LocalRepo {
  return new LocalRepo(testData);
}

type TestData = {
  changes?: Record<string, string>[];
  deployments?: Record<string, string>[];
  incidents?: Record<string, string>[];
};

/**
 * @description The local repo acts as a simple mock for testing and similar purposes.
 * The LocalRepo can optionally be initialized with custom test data, else will default
 * to a set of functional test data.
 */
class LocalRepo implements Repository {
  changes: Record<string, string>[];
  deployments: Record<string, string>[];
  incidents: Record<string, string>[];

  constructor(testData?: TestData) {
    this.changes = testData && testData.changes ? testData.changes : changes;
    this.deployments = testData && testData.deployments ? testData.deployments : deployments;
    this.incidents = testData && testData.incidents ? testData.incidents : incidents;
  }

  /**
   * @description Get metrics for a given repository and a period of time.
   */
  async getMetrics(dataRequest: DataRequest): Promise<any> {
    const { key, onlyGetCount } = dataRequest;

    const data = (() => {
      if (key.toLowerCase().startsWith('change')) return this.changes || [];
      if (key.toLowerCase().startsWith('deployment')) return this.deployments || [];
      if (key.toLowerCase().startsWith('incident')) return this.incidents || [];
    })();

    if (data && onlyGetCount) return data.length;
    return data;
  }

  /**
   * @description Add (create/update) an Event in the source database.
   */
  async addEventItem(data: any): Promise<void> {
    console.log('Added event item', data);
  }

  /**
   * @description Add (create/update) a Change in the source database.
   */
  async addChangeItem(data: any): Promise<void> {
    console.log('Added change item', data);
  }

  /**
   * @description Add (create/update) a Deployment in the source database.
   */
  async addDeploymentItem(data: any): Promise<void> {
    console.log('Added deployment item', data);
  }

  /**
   * @description Update (or create) an Incident in the source database.
   */
  async updateIncidentItem(data: any): Promise<void> {
    console.log('Added incident item', data);
  }
}
