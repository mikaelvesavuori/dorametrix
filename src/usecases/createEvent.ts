import { Repository } from '../interfaces/Repository';
import { Event } from '../interfaces/Event';

import { createChange } from './interactors/createChange';
import { createDeployment } from './interactors/createDeployment';
import { createIncident } from './interactors/createIncident';

import { MissingEventMetadataError } from '../application/errors/errors';

/**
 * @description The use-case for creating an event.
 */
export async function createEvent(repository: Repository, event: Event): Promise<'OK'> {
  const id = event.id;
  const eventType = event.eventType;

  // Catch any events, payloads or other things that make us want to eject right here and now
  if (!id || !eventType) throw new MissingEventMetadataError();

  // First, add event for record keeping
  await repository.addEvent(event);

  // Next, create a customized type for the specific variant (Change, Deployment, Incident)
  if (eventType === 'change') await createChange(repository, event);
  if (eventType === 'deployment') await createDeployment(repository, event);
  if (eventType === 'incident') await createIncident(repository, event);

  return 'OK';
}
