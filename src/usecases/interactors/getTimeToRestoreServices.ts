import { Dorametrix } from '../../interfaces/Dorametrix';

/**
 * @description The use-case interactor for getting the time to restore services.
 */
export async function getTimeToRestoreServices(dorametrix: Dorametrix): Promise<string> {
  return await dorametrix.getTimeToRestoreServices();
}
