import { CleanedItem } from './CleanedItem';
import { Change } from './Change';
import { Deployment } from './Deployment';
import { Event } from './Event';
import { Incident } from './Incident';
import { Metrics } from './Metrics';

/**
 * @description The Repository allows us to access a database of some kind.
 */
export interface Repository {
  /**
   * @description Get metrics from repository.
   */
  getMetrics(dataRequest: DataRequest): Promise<CleanedItem[]>;

  /**
   * @description Get metrics from cache.
   */
  getCachedMetrics(dataRequest: DataRequest): Promise<Metrics>;

  /**
   * @description Cache Metrics item into read-optimized result.
   */
  cacheMetrics(cacheRequest: CacheRequest): Promise<void>;

  /**
   * @description Add (create/update) an Event in the repository.
   */
  addEvent(event: Event): Promise<void>;

  /**
   * @description Add (create/update) a Change in the repository.
   */
  addChange(change: Change): Promise<void>;

  /**
   * @description Add (create/update) a Deployment in the repository.
   */
  addDeployment(deployment: Deployment): Promise<void>;

  /**
   * @description Update (or create) an Incident in the repository.
   */
  addIncident(incident: Incident): Promise<void>;
}

/**
 * @description Input request to retrieve data from the repository.
 */
export type DataRequest = {
  key: string;
  /**
   * @description Unit timestamp to start "from".
   */
  from: string;
  /**
   * @description Unit timestamp to query "to".
   */
  to: string;
  getLastDeployedCommit?: boolean;
};

/**
 * @description Input request to cache a Metrics object.
 */
export type CacheRequest = {
  /**
   * @description The key (Git repo name) under which to cache.
   * @example `SOMEORG/SOMEREPO`
   */
  key: string;
  /**
   * @description The date range for the lookup.
   * @example `20230101_20230131`
   */
  range: string;
  /**
   * @description A valid and complete `Metrics` object.
   */
  metrics: Metrics;
};
