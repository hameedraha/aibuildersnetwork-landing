export type EventStatus = 'live' | 'upcoming' | 'past';

/** Workshop events are scheduled in India — compare calendar days in IST. */
export const EVENT_TIMEZONE = 'Asia/Kolkata';

export function toEventDateKey(date: Date, timeZone = EVENT_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date);
}

export function resolveEventStatus(eventDate: Date, now = new Date()): EventStatus {
  const eventKey = toEventDateKey(eventDate);
  const nowKey = toEventDateKey(now);

  if (nowKey < eventKey) return 'upcoming';
  if (nowKey > eventKey) return 'past';
  return 'live';
}

export function resolveEventStatusFromKey(eventDateKey: string, now = new Date()): EventStatus {
  const nowKey = toEventDateKey(now);
  if (nowKey < eventDateKey) return 'upcoming';
  if (nowKey > eventDateKey) return 'past';
  return 'live';
}

export function getEventStatusLabel(status: EventStatus): string {
  switch (status) {
    case 'live':
      return 'happening now';
    case 'upcoming':
      return 'upcoming';
    case 'past':
      return 'past event';
  }
}

export function getFeaturedEyebrow(status: EventStatus): string {
  switch (status) {
    case 'live':
      return 'happening now';
    case 'upcoming':
      return 'next up';
    case 'past':
      return 'past event';
  }
}

export function compareEventStatus(a: EventStatus, b: EventStatus): number {
  const rank: Record<EventStatus, number> = { live: 0, upcoming: 1, past: 2 };
  return rank[a] - rank[b];
}
