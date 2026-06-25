import type { CollectionEntry } from 'astro:content';

export function getEventSlug(event: CollectionEntry<'events'>): string {
  return event.data.slug ?? event.id;
}
