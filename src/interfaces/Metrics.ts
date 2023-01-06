/**
 * @description TODO
 */
export type Metrics = {
  repo: RepoName;
  period: Period;
  total: TotalMetrics;
  metrics: DoraMetrics;
};

/**
 * @description TODO
 */
type RepoName = string;

/**
 * @description TODO
 */
type Period = {
  /**
   * @example 20221201
   */
  from: string;
  /**
   * @example 20221231
   */
  to: string;
};

/**
 * @description TODO
 */
type TotalMetrics = {
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
