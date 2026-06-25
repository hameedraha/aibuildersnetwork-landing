const CERTIFICATE_ID_RE = /^CERT\/AIBN\/2026\/W01\/(?:[1-9]|[1-4]\d|50)$/;

type VerifyResult =
  | { valid: true; name: string }
  | { valid: false; reason: 'format' | 'not_found' };

function normalizeCertificateId(input: string): string | null {
  const normalized = input.trim().toUpperCase();
  return CERTIFICATE_ID_RE.test(normalized) ? normalized : null;
}

function stampMarkup(uniqueId: string): string {
  return `
    <div class="cert-stamp" aria-hidden="true">
      <div class="cert-stamp__shadow"></div>
      <div class="cert-stamp__body cert-stamp__body--animate">
        <svg class="cert-stamp__svg" viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <path id="cert-stamp-arc-top-${uniqueId}" d="M 34,100 A 66,66 0 0,1 166,100" fill="none" />
            <path id="cert-stamp-arc-bottom-${uniqueId}" d="M 166,100 A 66,66 0 0,1 34,100" fill="none" />
            <filter id="cert-stamp-roughen-${uniqueId}" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="8" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <g class="cert-stamp__graphic" filter="url(#cert-stamp-roughen-${uniqueId})">
            <circle class="cert-stamp__ring cert-stamp__ring--outer" cx="100" cy="100" r="88" />
            <circle class="cert-stamp__ring cert-stamp__ring--inner" cx="100" cy="100" r="72" />
            <text class="cert-stamp__arc-text cert-stamp__arc-text--top">
              <textPath href="#cert-stamp-arc-top-${uniqueId}" startOffset="50%" text-anchor="middle">
                AI BUILDERS NETWORK
              </textPath>
            </text>
            <text class="cert-stamp__arc-text cert-stamp__arc-text--bottom">
              <textPath href="#cert-stamp-arc-bottom-${uniqueId}" startOffset="50%" text-anchor="middle">
                VERIFIED
              </textPath>
            </text>
            <rect class="cert-stamp__mark" x="84" y="84" width="12" height="12" rx="2" />
            <rect class="cert-stamp__mark" x="104" y="84" width="12" height="12" rx="2" />
            <rect class="cert-stamp__mark" x="84" y="104" width="12" height="12" rx="2" />
            <rect class="cert-stamp__mark cert-stamp__mark--accent" x="104" y="104" width="12" height="12" rx="2" />
            <path class="cert-stamp__check" d="M 74 104 L 93 123 L 130 81" />
          </g>
        </svg>
      </div>
    </div>
  `;
}

function showError(errorEl: HTMLElement, recordEl: HTMLElement) {
  recordEl.classList.add('cert-record--error');
  errorEl.hidden = false;
  errorEl.innerHTML = `
    <p class="cert-record__alert-title">verification failed</p>
    <p class="body-md">no matching record was found. contact <a href="mailto:ceo@icrewsystems.com">ceo@icrewsystems.com</a> if you need assistance.</p>
  `;
}

function hideError(errorEl: HTMLElement, recordEl: HTMLElement) {
  errorEl.hidden = true;
  errorEl.innerHTML = '';
  recordEl.classList.remove('cert-record--error');
}

function setLoading(loadingEl: HTMLElement, isLoading: boolean) {
  loadingEl.hidden = !isLoading;
}

function showSuccess(
  successEl: HTMLElement,
  layoutEl: HTMLElement,
  asideEl: HTMLElement,
  name: string,
  certificateId: string
) {
  const stampId = `s${Date.now()}`;
  layoutEl.classList.add('cert-portal__layout--verified');
  asideEl.hidden = true;
  successEl.hidden = false;
  successEl.innerHTML = `
    <article class="cert-diploma" aria-label="verified certificate">
      <div class="cert-diploma__frame">
        <div class="cert-diploma__inner">
          <header class="cert-diploma__header">
            <img src="/aibn-logo.svg" alt="" class="cert-diploma__logo" aria-hidden="true" />
            <span class="eyebrow cert-diploma__issuer">ai builders network</span>
            <h2 class="cert-diploma__title">certificate of completion</h2>
            <div class="cert-diploma__rule" aria-hidden="true"></div>
          </header>

          <p class="cert-diploma__awarded body-md">this is to certify that</p>
          <p class="cert-diploma__name">${escapeHtml(name)}</p>
          <p class="cert-diploma__body body-md">
            has successfully completed the in-person workshop
            <strong>vibe coding: the right way</strong>
            and is recorded in the official ai builders network credential registry.
          </p>

          <footer class="cert-diploma__footer">
            <div class="cert-diploma__signatory">
              <span class="cert-diploma__sign-line" aria-hidden="true"></span>
              <span class="cert-diploma__sign-label">authorized issuer</span>
              <span class="cert-diploma__sign-name">ai builders network</span>
            </div>
            <div class="cert-diploma__id">
              <span class="cert-diploma__id-label">credential no.</span>
              <span class="cert-diploma__id-value">${escapeHtml(certificateId)}</span>
            </div>
          </footer>

          <div class="cert-diploma__stamp">
            ${stampMarkup(stampId)}
          </div>
        </div>
      </div>
    </article>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function initCertificateVerification() {
  const form = document.getElementById('certificate-verify-form') as HTMLFormElement | null;
  if (!form || form.dataset.wired === 'true') return;
  form.dataset.wired = 'true';

  const layoutEl = document.getElementById('certificate-verify-layout') as HTMLElement | null;
  const asideEl = document.getElementById('certificate-verify-aside') as HTMLElement | null;
  const panelEl = document.getElementById('certificate-verify-panel') as HTMLElement | null;
  const recordEl = panelEl;
  const input = document.getElementById('certificate-id') as HTMLInputElement | null;
  const submitBtn = document.getElementById('certificate-verify-submit') as HTMLButtonElement | null;
  const errorEl = document.getElementById('certificate-verify-error') as HTMLElement | null;
  const loadingEl = document.getElementById('certificate-verify-loading') as HTMLElement | null;
  const successEl = document.getElementById('certificate-verify-success') as HTMLElement | null;

  if (!layoutEl || !asideEl || !panelEl || !recordEl || !input || !submitBtn || !errorEl || !loadingEl || !successEl) {
    return;
  }

  const defaultLabel = submitBtn.textContent ?? 'verify';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(errorEl, recordEl);

    const rawValue = input.value;
    const normalized = normalizeCertificateId(rawValue);

    if (!normalized) {
      showError(errorEl, recordEl);
      return;
    }

    submitBtn.disabled = true;
    setLoading(loadingEl, true);

    try {
      const res = await fetch('/api/workshop-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateId: normalized }),
      });

      const data = (await res.json()) as VerifyResult;

      if (data.valid) {
        panelEl.hidden = true;
        showSuccess(successEl, layoutEl, asideEl, data.name, normalized);
      } else {
        showError(errorEl, recordEl);
      }
    } catch {
      showError(errorEl, recordEl);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = defaultLabel;
      setLoading(loadingEl, false);
    }
  });
}
