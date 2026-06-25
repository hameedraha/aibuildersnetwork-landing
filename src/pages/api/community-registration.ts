import type { APIRoute } from 'astro';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getWebhookUrl(): string | undefined {
  return (
    import.meta.env.COMMUNITY_REGISTRATION_WEBHOOK_URL ||
    import.meta.env.PUBLIC_COMMUNITY_REGISTRATION_WEBHOOK_URL
  );
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) {
    return Response.json({ error: 'registration unavailable' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid request' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const linkedin = typeof body.linkedin === 'string' ? body.linkedin.trim() : '';
  const github =
    typeof body.github === 'string' && body.github.trim() ? body.github.trim() : null;

  if (!name || !email || !EMAIL_RE.test(email) || !phone || !linkedin || !isValidUrl(linkedin)) {
    return Response.json({ error: 'validation failed' }, { status: 400 });
  }
  if (github && !isValidUrl(github)) {
    return Response.json({ error: 'validation failed' }, { status: 400 });
  }
  if (body.acceptedTerms !== true) {
    return Response.json({ error: 'validation failed' }, { status: 400 });
  }

  const payload = {
    name,
    email,
    phone,
    linkedin,
    github,
    acceptedTerms: true,
    source: typeof body.source === 'string' ? body.source : 'community-page',
    submittedAt: new Date().toISOString(),
  };

  try {
    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      return Response.json({ error: 'upstream failed' }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'upstream error' }, { status: 502 });
  }
};
