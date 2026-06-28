import type { CollectionEntry } from 'astro:content';
import {
  compareEventStatus,
  resolveEventStatus,
  type EventStatus,
} from '../../lib/event-status';

export type EventEntry = CollectionEntry<'events'>;

export interface ResolvedEvent {
  event: EventEntry;
  status: EventStatus;
}

export function resolveEvents(events: EventEntry[], now = new Date()): ResolvedEvent[] {
  return events.map((event) => ({
    event,
    status: resolveEventStatus(event.data.eventDate, now),
  }));
}

export function sortEventsByDate(events: EventEntry[]): EventEntry[] {
  return [...events].sort((a, b) => a.data.eventDate.valueOf() - b.data.eventDate.valueOf());
}

export function pickFeaturedEvent(resolved: ResolvedEvent[]): ResolvedEvent | null {
  if (resolved.length === 0) return null;

  const live = resolved.filter((entry) => entry.status === 'live');
  if (live.length > 0) return live[0];

  const upcoming = resolved.filter((entry) => entry.status === 'upcoming');
  if (upcoming.length > 0) return upcoming[0];

  const past = resolved.filter((entry) => entry.status === 'past');
  return past[past.length - 1] ?? null;
}

export function pickHomeEvent(resolved: ResolvedEvent[]): ResolvedEvent | null {
  const active = resolved
    .filter((entry) => entry.status === 'live' || entry.status === 'upcoming')
    .sort((a, b) => {
      const statusOrder = compareEventStatus(a.status, b.status);
      if (statusOrder !== 0) return statusOrder;
      return a.event.data.eventDate.valueOf() - b.event.data.eventDate.valueOf();
    });

  return active[0] ?? null;
}
