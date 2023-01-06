import { makeChange } from '../../domain/valueObjects/Change';

import { Repository } from '../../interfaces/Repository';
import { Event } from '../../interfaces/Event';

/**
 * @description The use-case for creating an event.
 */
export async function createChange(repository: Repository, event: Event): Promise<void> {
  const change = makeChange(event);
  await repository.addChange(change);
}
