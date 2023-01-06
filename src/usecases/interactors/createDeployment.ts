import { makeDeployment } from '../../domain/valueObjects/Deployment';

import { Repository } from '../../interfaces/Repository';
import { Event } from '../../interfaces/Event';

/**
 * @description The use-case for creating an event.
 */
export async function createDeployment(repository: Repository, event: Event): Promise<void> {
  const deployment = makeDeployment(event);
  await repository.addDeployment(deployment);
}
