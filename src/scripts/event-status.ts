import {
  getEventStatusLabel,
  getFeaturedEyebrow,
  resolveEventStatusFromKey,
  type EventStatus,
} from '../../lib/event-status';

function setHidden(el: HTMLElement, hidden: boolean) {
  if (hidden) el.setAttribute('hidden', '');
  else el.removeAttribute('hidden');
}

function applyStatusToRoot(root: HTMLElement, status: EventStatus) {
  root.dataset.eventStatus = status;

  root.querySelectorAll<HTMLElement>('[data-event-status-text]').forEach((el) => {
    el.textContent = getEventStatusLabel(status);
  });

  root.querySelectorAll<HTMLElement>('[data-event-featured-eyebrow]').forEach((el) => {
    el.textContent = getFeaturedEyebrow(status);
  });

  root.querySelectorAll<HTMLElement>('[data-event-home-eyebrow]').forEach((el) => {
    el.textContent = status === 'live' ? 'happening now' : 'next event';
  });

  root.querySelectorAll<HTMLElement>('[data-event-ticket]').forEach((el) => {
    setHidden(el, status === 'past');
  });

  root.querySelectorAll<HTMLElement>('[data-event-past-note]').forEach((el) => {
    setHidden(el, status !== 'past');
  });

  root.querySelectorAll<HTMLElement>('[data-event-live-badge]').forEach((el) => {
    setHidden(el, status !== 'live');
  });

  root.querySelectorAll<HTMLElement>('[data-event-past-badge]').forEach((el) => {
    setHidden(el, status !== 'past');
  });

  for (const prefix of ['events-timeline__item', 'event-featured', 'event-hero']) {
    root.classList.remove(`${prefix}--live`, `${prefix}--upcoming`, `${prefix}--past`);
  }
  root.classList.add(`events-timeline__item--${status}`);
  if (root.classList.contains('event-featured')) {
    root.classList.add(`event-featured--${status}`);
  }
  if (root.classList.contains('event-hero')) {
    root.classList.toggle('event-hero--past', status === 'past');
  }

  root.querySelectorAll<HTMLElement>('.events-timeline__status').forEach((el) => {
    el.classList.toggle('events-timeline__status--live', status === 'live');
  });
}

export function initEventStatus(): void {
  document.querySelectorAll<HTMLElement>('[data-event-root]').forEach((root) => {
    const dateKey = root.dataset.eventDate;
    if (!dateKey) return;
    applyStatusToRoot(root, resolveEventStatusFromKey(dateKey));
  });
}
