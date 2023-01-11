/**
 * @description Valid request data transfer object.
 */
export type RequestDTO = {
  /**
   * @description Repository name to get metrics for.
   */
  repo: string;
  /**
   * @description Unix timestamp.
   */
  from: string;
  /**
   * @description Unix timestamp.
   */
  to: string;
  /**
   * @description UTC offset in hours.
   * @example -5
   * @example 3
   */
  offset: number;
};
