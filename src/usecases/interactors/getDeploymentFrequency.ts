import { Dorametrix } from '../../interfaces/Dorametrix';

/**
 * @description The use-case interactor for getting the deployment frequency.
 */
export async function getDeploymentFrequency(dorametrix: Dorametrix): Promise<string> {
  return await dorametrix.getDeploymentFrequency();
}
