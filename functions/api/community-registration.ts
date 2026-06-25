import {
  forwardRegistration,
  parseRegistrationBody,
} from '../../lib/community-registration.ts';

interface Env {
  COMMUNITY_REGISTRATION_WEBHOOK_URL: string;
}

export async function onRequestPost({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const webhookUrl = env.COMMUNITY_REGISTRATION_WEBHOOK_URL;
  if (!webhookUrl) {
    return Response.json({ error: 'registration unavailable' }, { status: 503 });
  }

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

  return forwardRegistration(webhookUrl, parsed.payload);
};
