const prerender = false;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function getWebhookUrl() {
  return "https://n8n.srv833787.hstgr.cloud/webhook/site-registration-link";
}
function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
const POST = async ({ request }) => {
  const webhookUrl = getWebhookUrl();
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid request" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const linkedin = typeof body.linkedin === "string" ? body.linkedin.trim() : "";
  const github = typeof body.github === "string" && body.github.trim() ? body.github.trim() : null;
  if (!name || !email || !EMAIL_RE.test(email) || !phone || !linkedin || !isValidUrl(linkedin)) {
    return Response.json({ error: "validation failed" }, { status: 400 });
  }
  if (github && !isValidUrl(github)) {
    return Response.json({ error: "validation failed" }, { status: 400 });
  }
  if (body.acceptedTerms !== true) {
    return Response.json({ error: "validation failed" }, { status: 400 });
  }
  const payload = {
    name,
    email,
    phone,
    linkedin,
    github,
    acceptedTerms: true,
    source: typeof body.source === "string" ? body.source : "community-page",
    submittedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!upstream.ok) {
      return Response.json({ error: "upstream failed" }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "upstream error" }, { status: 502 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
