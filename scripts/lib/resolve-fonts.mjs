import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ALLOWLIST = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../data/google-fonts-allowlist.json'),
    'utf-8'
  )
);

const ALLOWLIST_MAP = new Map(
  ALLOWLIST.map((name) => [normalizeFontName(name), name])
);

const CUSTOM_HINTS = [
  /notion/i,
  /linear/i,
  /stripe/i,
  /geist/i,
  /sf pro/i,
  /sf mono/i,
  /helvetica neue/i,
  /product sans/i,
  /google sans/i,
  /soehne/i,
  /cereal/i,
  /sodo/i,
  /forma/i,
  /universal sans/i,
  /lambotype/i,
  /nouvelr/i,
  /manuka/i,
  /lato(?! )/i,
];

function normalizeFontName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function isLikelyCustom(name) {
  return CUSTOM_HINTS.some((re) => re.test(name));
}

function matchGoogleFont(name) {
  const normalized = normalizeFontName(name);
  if (ALLOWLIST_MAP.has(normalized)) {
    return ALLOWLIST_MAP.get(normalized);
  }
  for (const [key, value] of ALLOWLIST_MAP) {
    if (key === normalized || key.replace(/ /g, '') === normalized.replace(/ /g, '')) {
      return value;
    }
  }
  return null;
}

export function collectFontFamilies(typography = {}) {
  const families = new Set();
  for (const style of Object.values(typography)) {
    if (style && typeof style === 'object' && style.fontFamily) {
      families.add(String(style.fontFamily).trim());
    }
  }
  return [...families];
}

export function resolveFonts(typography = {}) {
  const families = collectFontFamilies(typography);
  return families.map((name) => {
    const googleFamily = matchGoogleFont(name);
    if (googleFamily && !isLikelyCustom(name)) {
      return {
        name,
        source: 'google',
        googleFamily,
        cssUrl: googleFontsCssUrl(googleFamily),
      };
    }
    return {
      name,
      source: 'custom',
      note: 'proprietary or not available on google fonts',
    };
  });
}

export function googleFontsCssUrl(family) {
  const param = family.trim().replace(/\s+/g, '+');
  return `https://fonts.googleapis.com/css2?family=${param}:wght@300;400;500;600;700&display=swap`;
}

export function googleFontsLinkTags(fonts) {
  const google = fonts.filter((f) => f.source === 'google');
  const seen = new Set();
  return google
    .filter((f) => {
      if (seen.has(f.googleFamily)) return false;
      seen.add(f.googleFamily);
      return true;
    })
    .map((f) => f.cssUrl);
}
