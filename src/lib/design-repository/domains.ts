const DOMAIN_OVERRIDES: Record<string, string> = {
  'bmw-m': 'bmw.com',
  cal: 'cal.com',
  'dell-1996': 'dell.com',
  'nintendo-2001': 'nintendo.com',
  notion: 'notion.so',
  runwayml: 'runway.com',
  theverge: 'theverge.com',
  voltagent: 'voltagent.dev',
  wired: 'wired.com',
};

export function domainForSlug(slug: string): string {
  if (DOMAIN_OVERRIDES[slug]) return DOMAIN_OVERRIDES[slug];
  if (slug.includes('.')) return slug;
  return `${slug}.com`;
}

export function siteUrlForSlug(slug: string): string {
  return `https://${domainForSlug(slug)}`;
}

export function visitUrlForSlug(slug: string): string {
  const url = new URL(siteUrlForSlug(slug));
  url.searchParams.set('utm_source', 'aibuildersnetwork');
  url.searchParams.set('utm_medium', 'design-repository');
  url.searchParams.set('utm_campaign', slug);
  return url.toString();
}
