/**
 * @description Final metrics output object.
 */
export type Metrics = {
  repo: RepoName;
  period: Period;
  total: TotalMetrics;
  metrics: DoraMetrics;
};

/**
 * @description Repository name.
 * @example `SOMEORG/SOMEREPO`
 */
type RepoName = string;

/**
 * @description Time period object.
 */
type Period = {
  /**
   * @example `20221201`
   */
  from: string;
  /**
   * @example `20221231`
   */
  to: string;
};

/**
 * @description Numeric metrics for the total time period.
 */
type TotalMetrics = {
  changesCount: number;
  deploymentCount: number;
  incidentCount: number;
};

/**
 * @description Represents the final user-facing DORA metrics.
 */
type DoraMetrics = {
  changeFailureRate: string;
  deploymentFrequency: string;
  leadTimeForChanges: string;
  timeToRestoreServices: string;
};
