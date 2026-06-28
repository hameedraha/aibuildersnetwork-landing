const CERTIFICATE_ID_RE = /^CERT\/AIBN\/2026\/W01\/(?:[1-9]|[1-4]\d|50)$/;

type VerifyResult =
  | { valid: true; name: string }
  | { valid: false; reason: 'format' | 'not_found' };

function normalizeCertificateId(input: string): string | null {
  const normalized = input.trim().toUpperCase();
  return CERTIFICATE_ID_RE.test(normalized) ? normalized : null;
}

function showSuccess(
  successEl: HTMLElement,
  layoutEl: HTMLElement,
  asideEl: HTMLElement,
  panelEl: HTMLElement,
  input: HTMLInputElement,
  name: string,
  certificateId: string
) {
  const verifiedOn = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  layoutEl.classList.add('cert-portal__layout--verified');
  asideEl.hidden = true;
  successEl.hidden = false;
  successEl.innerHTML = `
    <article class="cert-verify-success" aria-label="verification successful">
      <div class="cert-verify-success__banner" aria-hidden="true"></div>

      <div class="cert-record__top cert-verify-success__top">
        <div class="cert-verify-success__brand">
          <img src="/aibn-logo.svg" alt="" class="cert-verify-success__logo" width="28" height="28" />
          <span class="cert-record__badge eyebrow">registry result</span>
        </div>
        <span class="cert-verify-success__pill">
          <span class="cert-verify-success__pill-dot" aria-hidden="true"></span>
          verified
        </span>
      </div>

      <div class="cert-verify-success__hero">
        <div class="cert-verify-success__icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="cert-verify-success__intro">
          <h2 class="cert-verify-success__title">verification successful</h2>
          <p class="body-md cert-verify-success__lead">
            this credential is on file with ai builders network.
          </p>
          <p class="cert-verify-success__meta">checked ${escapeHtml(verifiedOn)}</p>
        </div>
      </div>

      <section class="cert-verify-success__holder" aria-label="credential holder">
        <span class="cert-verify-success__holder-label">issued to</span>
        <p class="cert-verify-success__holder-name">${escapeHtml(name)}</p>
      </section>

      <dl class="cert-verify-success__details">
        <div class="cert-verify-success__row">
          <dt>certificate number</dt>
          <dd><code class="cert-verify-success__code">${escapeHtml(certificateId)}</code></dd>
        </div>
        <div class="cert-verify-success__row">
          <dt>program</dt>
          <dd>vibe coding: the right way</dd>
        </div>
        <div class="cert-verify-success__row">
          <dt>issuer</dt>
          <dd>ai builders network</dd>
        </div>
        <div class="cert-verify-success__row">
          <dt>registry status</dt>
          <dd><span class="cert-verify-success__status">active · authenticated</span></dd>
        </div>
      </dl>

      <div class="cert-verify-success__actions">
        <button type="button" class="btn-secondary cert-verify-success__reset" data-verify-reset>
          verify another certificate
        </button>
      </div>
    </article>
  `;

  successEl.querySelector<HTMLButtonElement>('[data-verify-reset]')?.addEventListener('click', () => {
    resetVerification(layoutEl, asideEl, panelEl, successEl, input);
  });
}

function resetVerification(
  layoutEl: HTMLElement,
  asideEl: HTMLElement,
  panelEl: HTMLElement,
  successEl: HTMLElement,
  input: HTMLInputElement
) {
  layoutEl.classList.remove('cert-portal__layout--verified');
  asideEl.hidden = false;
  panelEl.hidden = false;
  successEl.hidden = true;
  successEl.innerHTML = '';
  input.value = '';
  input.focus();
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
        showSuccess(successEl, layoutEl, asideEl, panelEl, input, data.name, normalized);
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
