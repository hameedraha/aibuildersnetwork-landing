const DOMAIN_OVERRIDES = {
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

export function domainForSlug(slug) {
  if (DOMAIN_OVERRIDES[slug]) return DOMAIN_OVERRIDES[slug];
  if (slug.includes('.')) return slug;
  return `${slug}.com`;
}

export function siteUrlForSlug(slug) {
  return `https://${domainForSlug(slug)}`;
}

export function visitUrlForSlug(slug) {
  const url = new URL(siteUrlForSlug(slug));
  url.searchParams.set('utm_source', 'aibuildersnetwork');
  url.searchParams.set('utm_medium', 'design-repository');
  url.searchParams.set('utm_campaign', slug);
  return url.toString();
}

export function logoApiUrlForSlug(slug) {
  return `https://logos-api.apistemic.com/domain:${domainForSlug(slug)}`;
}
