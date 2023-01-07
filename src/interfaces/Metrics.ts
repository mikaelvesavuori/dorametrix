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
   * @description The date the metrics start from.
   * @example `20221201`
   */
  from: string;
  /**
   * @description The date the metrics end at (inclusive).
   * @example `20221231`
   */
  to: string;
  /**
   * @description The UTC timezone offset used.
   * @example `0`
   * @example `-5`
   * @example `7`
   */
  offset: number;
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
