import { Repository, DataRequest } from '../../interfaces/Repository';
import { Change } from '../../interfaces/Change';
import { Deployment } from '../../interfaces/Deployment';
import { Event } from '../../interfaces/Event';
import { Incident } from '../../interfaces/Incident';
import { CleanedItem } from '../../interfaces/CleanedItem';

import { deployments, changes, incidents } from '../../../testdata/TestDatabase';
import { Metrics } from '../../interfaces/Metrics';

/**
 * @description Factory function for local repository.
 */
export function createNewLocalRepository(testData?: TestData): LocalRepo {
  return new LocalRepo(testData);
}

type TestData = {
  changes?: Change[];
  deployments?: Deployment[];
  incidents?: Incident[];
};

/**
 * @description The local repo acts as a simple mock for testing and similar purposes.
 * The LocalRepo can optionally be initialized with custom test data, else will default
 * to a set of functional test data.
 */
class LocalRepo implements Repository {
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
    const { key, fromDate, toDate } = dataRequest;

    const cachedData = this.getCachedData(key, `${fromDate}_${toDate}`);
    if (cachedData && Object.keys(cachedData).length !== 0) return cachedData as any;

    const data = this.getItem(dataRequest);

    return data;
  }

  /**
   * @description TODO
   */
  async cacheMetrics(key: string, range: string, metrics: Metrics): Promise<void> {
    if (1 > 2) console.log('TODO', key, range, metrics);
  }

  /**
   * @description Get data from local cache.
   * @todo
   */
  public async getCachedData(key: string, range: string): Promise<Metrics> {
    if (1 > 2) console.log(key, range);
    const cachedData = false; // TODO
    if (cachedData) {
      console.log('Returning cached data...');
      return JSON.parse(cachedData);
    }
    return {} as any;
  }

  /**
   * @description Get data from local repository.
   */
  private getItem(dataRequest: DataRequest): any[] {
    const { key } = dataRequest;
    const repoName = key.split('_')[1];

    if (key.toLowerCase().startsWith('change_')) {
      return this.changes.filter((item: Change) => item.repo === repoName) || [];
    }

    if (key.toLowerCase().startsWith('deployment_')) {
      return this.deployments.filter((item: Deployment) => item.repo === repoName) || [];
    }

    if (key.toLowerCase().startsWith('incident_')) {
      return this.incidents.filter((item: Incident) => item.repo === repoName) || [];
    }

    return [];
  }

  /**
   * @description Add (create/update) an Event in the repository.
   */
  public addEvent(event: Event): Promise<any> {
    console.log('Added event item', event);
    // @ts-ignore
    return;
  }

  /**
   * @description Add (create/update) a Change in the repository.
   */
  public addChange(change: Change): Promise<any> {
    console.log('Added change item', change);
    // @ts-ignore
    return;
  }

  /**
   * @description Add (create/update) a Deployment in the repository.
   */
  public addDeployment(deployment: Deployment): Promise<any> {
    console.log('Added deployment item', deployment);

    // @ts-ignore
    return;
  }

  /**
   * @description Update (or create) an Incident in the repository.
   */
  public addIncident(incident: Incident): Promise<any> {
    console.log('Added incident item', incident);
    // @ts-ignore
    return;
  }
}
