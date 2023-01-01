import { Dorametrix } from '../interfaces/Dorametrix';
import { Parser } from '../interfaces/Parser';

import { makeChange } from '../domain/valueObjects/Change';
import { makeDeployment } from '../domain/valueObjects/Deployment';
import { makeEvent } from '../domain/valueObjects/Event';
import { makeIncident } from '../domain/valueObjects/Incident';

/**
 * @description The use-case for creating an event.
 */
export async function createEvent(
  dorametrix: Dorametrix,
  parser: Parser,
  body: any,
  headers: any
): Promise<void> {
  const event = makeEvent(parser, body, headers);
  const { eventType, product } = event;
  dorametrix.setProductName(product);

  // Catch any events, payloads or other things that make us want to eject right here and now
  if (!event.id) return;

  // First, add event for record keeping
  await dorametrix.handleEvent(event);

  // Next, create a customized type for the specific variant (Change, Deployment, Incident)
  if (eventType === 'change') await dorametrix.handleChange(makeChange(event));
  if (eventType === 'deployment') await dorametrix.handleDeployment(makeDeployment(event));
  if (eventType === 'incident') await dorametrix.handleIncident(makeIncident(event));
}
