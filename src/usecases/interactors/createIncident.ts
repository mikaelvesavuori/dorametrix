import { makeIncident } from '../../domain/valueObjects/Incident';

import { Repository } from '../../interfaces/Repository';
import { Event } from '../../interfaces/Event';

/**
 * @description The use-case for creating an event.
 */
export async function createIncident(repository: Repository, event: Event): Promise<void> {
  const incident = makeIncident(event);
  await repository.addIncident(incident);
}
