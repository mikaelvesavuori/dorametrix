import { Change } from '../../interfaces/Change';
import { CleanedItem } from '../../interfaces/CleanedItem';
import { Deployment } from '../../interfaces/Deployment';
import { Event } from '../../interfaces/Event';
import { Incident } from '../../interfaces/Incident';
import { Metrics } from '../../interfaces/Metrics';
import { Repository, DataRequest, CacheRequest } from '../../interfaces/Repository';

import {
  deployments,
  changes,
  incidents,
  testCachedMetrics
} from '../../../testdata/database/LocalTestDatabase';

/**
 * @description Factory function for local repository.
 */
export function createNewLocalRepository(testData?: TestData): LocalRepository {
  return new LocalRepository(testData);
}

type TestData = {
  changes?: Change[];
  deployments?: Deployment[];
  incidents?: Incident[];
};

/**
 * @description The local repo acts as a simple mock for testing and similar purposes.
 * The LocalRepository can optionally be initialized with custom test data, else will default
 * to a set of functional test data.
 */
class LocalRepository implements Repository {
  changes: Change[];
  deployments: Deployment[];
  incidents: Incident[];

  constructor(testData?: TestData) {
    this.changes = testData?.changes ? testData.changes : changes;
    this.deployments = testData?.deployments ? testData.deployments : deployments;
    this.incidents = testData?.incidents ? testData.incidents : incidents;
  }

  /**
   * @description Get metrics for a given repository and a period of time.
   */
  async getMetrics(dataRequest: DataRequest): Promise<CleanedItem[]> {
    const { key, from, to } = dataRequest;

    const cachedData = this.getCachedMetrics({ key, from, to });
    if (cachedData && Object.keys(cachedData).length !== 0) return cachedData as any;

    const data = this.getItem(dataRequest);

    return data;
  }

  /**
   * @description Cache metrics locally in memory.
   */
  public async cacheMetrics(cacheRequest: CacheRequest): Promise<void> {
    const { key, range, metrics } = cacheRequest;
    console.log('Caching item...', key, range, metrics);
  }

  /**
   * @description Get data from local cache.
   */
  public async getCachedMetrics(dataRequest: DataRequest): Promise<Metrics> {
    const { key, from, to } = dataRequest;

    const cachedData = (() => {
      const repoName = key.toUpperCase();
      const range = `${from}_${to}`;

      // 20220101_20220131
      if (repoName === 'SOMEORG/SOMEREPO' && range === '1640995200000_1643673599000')
        return testCachedMetrics;
    })();

    if (cachedData) {
      console.log('Returning cached data...');
      return cachedData;
    }
    return {} as any;
  }

  /**
   * @description Get data from local repository.
   */
  private getItem(dataRequest: DataRequest): any {
    const { key } = dataRequest;
    const type = key.split('_')[0].toUpperCase();
    const repoName = key.split('_')[1];

    if (type === 'CHANGE')
      return this.changes.filter((item: Change) => item.repo === repoName) || [];

    if (type === 'DEPLOYMENT')
      return this.deployments.filter((item: Deployment) => item.repo === repoName) || [];

    if (type === 'INCIDENT')
      return this.incidents.filter((item: Incident) => item.repo === repoName) || [];
  }

  /**
   * @description Add (create/update) an Event in the repository.
   */
  public async addEvent(event: Event): Promise<void> {
    console.log('Added event item', event);
  }

  /**
   * @description Add (create/update) a Change in the repository.
   */
  public async addChange(change: Change): Promise<void> {
    console.log('Added change item', change);
  }

  /**
   * @description Add (create/update) a Deployment in the repository.
   */
  public async addDeployment(deployment: Deployment): Promise<void> {
    console.log('Added deployment item', deployment);
  }

  /**
   * @description Update (or create) an Incident in the repository.
   */
  public async addIncident(incident: Incident): Promise<void> {
    console.log('Added incident item', incident);
  }
}
