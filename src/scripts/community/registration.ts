const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showError(el: HTMLElement, message: string) {
  el.textContent = message;
  el.hidden = false;
}

function clearError(el: HTMLElement) {
  el.textContent = '';
  el.hidden = true;
}

function validateForm(form: HTMLFormElement): string | null {
  const data = new FormData(form);
  const name = (data.get('name') as string)?.trim();
  const email = (data.get('email') as string)?.trim();
  const phone = (data.get('phone') as string)?.trim();
  const linkedin = (data.get('linkedin') as string)?.trim();
  const github = (data.get('github') as string)?.trim();
  const terms = data.get('terms');

  if (!name) return 'please enter your name.';
  if (!email || !EMAIL_RE.test(email)) return 'please enter a valid email address.';
  if (!phone) return 'please enter your phone number.';
  if (!linkedin) return 'please enter your linkedin profile url.';
  if (github) {
    try {
      new URL(github);
    } catch {
      return 'please enter a valid github profile url.';
    }
  }
  try {
    new URL(linkedin);
  } catch {
    return 'please enter a valid linkedin profile url.';
  }
  if (!terms) return 'please accept the terms and conditions.';

  return null;
}

function openJoinModal() {
  const modal = document.getElementById('join-modal');
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const firstInput = modal.querySelector<HTMLInputElement>('input[name="name"]');
  firstInput?.focus();
}

function closeJoinModal() {
  const modal = document.getElementById('join-modal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function wireJoinModal() {
  if (document.body.dataset.joinModalWired === 'true') return;
  document.body.dataset.joinModalWired = 'true';

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-open-join-modal]')) {
      e.preventDefault();
      openJoinModal();
      return;
    }
    if (target.closest('[data-join-modal-close]')) {
      closeJoinModal();
      return;
    }
    if (target.id === 'join-modal') {
      closeJoinModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('join-modal');
    if (!modal?.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeJoinModal();
  });

  if (window.location.hash === '#join') {
    openJoinModal();
  }
}

export function initCommunityRegistration() {
  wireJoinModal();

  const form = document.getElementById('community-registration-form') as HTMLFormElement | null;
  if (!form || form.dataset.wired === 'true') return;
  form.dataset.wired = 'true';

  const errorEl = document.getElementById('community-form-error') as HTMLElement | null;
  const submitBtn = document.getElementById('community-form-submit') as HTMLButtonElement | null;
  if (!errorEl || !submitBtn) return;

  const webhookUrl = import.meta.env.PUBLIC_COMMUNITY_REGISTRATION_WEBHOOK_URL as string | undefined;
  const defaultLabel = submitBtn.textContent ?? 'apply now';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError(errorEl);

    const validationError = validateForm(form);
    if (validationError) {
      showError(errorEl, validationError);
      return;
    }

    if (!webhookUrl) {
      showError(errorEl, 'registration is temporarily unavailable. please try again later.');
      return;
    }

    const data = new FormData(form);
    const payload = {
      name: (data.get('name') as string).trim(),
      email: (data.get('email') as string).trim(),
      phone: (data.get('phone') as string).trim(),
      linkedin: (data.get('linkedin') as string).trim(),
      github: (data.get('github') as string)?.trim() || null,
      acceptedTerms: true,
      source: 'community-page',
      submittedAt: new Date().toISOString(),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'sending…';

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`request failed: ${res.status}`);
      }

      window.location.href = '/community/thank-you';
    } catch {
      showError(errorEl, 'something went wrong. please try again in a moment.');
      submitBtn.disabled = false;
      submitBtn.textContent = defaultLabel;
    }
  });
}
