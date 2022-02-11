import { Dorametrix } from '../../domain/interfaces/Dorametrix';

/**
 * @description The use-case interactor for getting the change failure rate.
 */
export async function getChangeFailureRate(dorametrix: Dorametrix): Promise<string> {
  return await dorametrix.getChangeFailureRate();
}
