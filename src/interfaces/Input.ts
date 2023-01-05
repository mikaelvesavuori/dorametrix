/**
 * @description TODO
 */
export type RequestDTO = {
  /**
   * @description Repository name to get metrics for
   */
  repo: string;
  /**
   * @description Unix timestamp
   */
  from: string;
  /**
   * @description Unix timestamp
   */
  to: string;
};
