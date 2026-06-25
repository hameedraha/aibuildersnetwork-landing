const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export type RegistrationPayload = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string | null;
  acceptedTerms: true;
  source: string;
  submittedAt: string;
};

export function parseRegistrationBody(
  body: Record<string, unknown>
): { ok: true; payload: RegistrationPayload } | { ok: false } {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const linkedin = typeof body.linkedin === 'string' ? body.linkedin.trim() : '';
  const github =
    typeof body.github === 'string' && body.github.trim() ? body.github.trim() : null;

  if (!name || !email || !EMAIL_RE.test(email) || !phone || !linkedin || !isValidUrl(linkedin)) {
    return { ok: false };
  }
  if (github && !isValidUrl(github)) {
    return { ok: false };
  }
  if (body.acceptedTerms !== true) {
    return { ok: false };
  }

  return {
    ok: true,
    payload: {
      name,
      email,
      phone,
      linkedin,
      github,
      acceptedTerms: true,
      source: typeof body.source === 'string' ? body.source : 'community-page',
      submittedAt: new Date().toISOString(),
    },
  };
}

export async function forwardRegistration(
  webhookUrl: string,
  payload: RegistrationPayload
): Promise<Response> {
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
}
