import {
  COMMUNITY_REGISTRATION_WEBHOOK_URL,
  forwardRegistration,
  parseRegistrationBody,
} from '../../lib/community-registration.ts';

export async function onRequestPost({
  request,
}: {
  request: Request;
}): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid request' }, { status: 400 });
  }

  const parsed = parseRegistrationBody(body);
  if (!parsed.ok) {
    return Response.json({ error: 'validation failed' }, { status: 400 });
  }

  return forwardRegistration(COMMUNITY_REGISTRATION_WEBHOOK_URL, parsed.payload);
}
