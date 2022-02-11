import { Dorametrix } from '../../domain/interfaces/Dorametrix';

/**
 * @description The use-case interactor for getting the lead time for changes.
 */
export async function getLeadTimeForChanges(dorametrix: Dorametrix): Promise<string> {
  return await dorametrix.getLeadTimeForChanges();
}
