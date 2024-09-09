/**
 * @description Parse and decode the event body, handling base64-encoded payloads.
 */
export function parseEventBody(event: Record<string, any>) {
  let bodyString = event.body;
  if (event.isBase64Encoded) bodyString = Buffer.from(event.body, 'base64').toString('utf-8');
  return bodyString ? JSON.parse(bodyString) : null;
}
