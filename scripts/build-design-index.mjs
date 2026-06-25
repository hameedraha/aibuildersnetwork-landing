#!/usr/bin/env node
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { domainForSlug, logoApiUrlForSlug, siteUrlForSlug, visitUrlForSlug } from './lib/domains.mjs';
import { resolveFonts } from './lib/resolve-fonts.mjs';
import {
  buildPlayground,
  extractPrimaryColors,
  isValidDesignMeta,
  parseFrontmatterYaml,
} from './lib/resolve-tokens.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VENDOR = join(ROOT, 'vendor/awesome-design-md');
const DESIGN_MD_ROOT = join(VENDOR, 'design-md');
const README_PATH = join(VENDOR, 'README.md');
const PUBLIC_ROOT = join(ROOT, 'public/design-repository');
const LOGOS_ROOT = join(PUBLIC_ROOT, 'logos');
const INDEX_PATH = join(ROOT, 'src/data/design-repository/index.json');

const COLOR_FAMILY_ORDER = [
  'red',
  'orange',
  'yellow',
  'green',
  'cyan',
  'blue',
  'purple',
  'pink',
  'neutral',
];

const FETCH_USER_AGENT = 'aibuildersnetwork-landing/1.0 (https://aibuildersnetwork.com)';

function hexToRgb(hex) {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return { r, g, b };
  }
  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return null;
  return { r, g, b };
}

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}

function colorFamilyFromHex(hex) {
  if (!hex || !hex.startsWith('#')) return 'neutral';
  const rgb = hexToRgb(hex);
  if (!rgb) return 'neutral';

  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  if (s < 0.12 || l < 0.08 || l > 0.92) return 'neutral';

  if (h < 15 || h >= 345) return 'red';
  if (h < 45) return 'orange';
  if (h < 70) return 'yellow';
  if (h < 160) return 'green';
  if (h < 200) return 'cyan';
  if (h < 250) return 'blue';
  if (h < 290) return 'purple';
  if (h < 345) return 'pink';
  return 'neutral';
}

function slugToDisplayName(slug) {
  return slug
    .replace(/\.(app|ai|ml)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toLowerCase());
}

function parseReadmeCategories(readme) {
  const slugToCategory = new Map();
  let currentCategory = 'Uncategorized';

  for (const line of readme.split('\n')) {
    const heading = line.match(/^### (.+)$/);
    if (heading) {
      currentCategory = heading[1].trim();
      continue;
    }
    const link = line.match(/\[[^\]]+\]\([^)]*\/([^/)]+)\/design-md\)/);
    if (link) slugToCategory.set(link[1], currentCategory);
  }

  return slugToCategory;
}

function copyIfExists(src, dest) {
  if (existsSync(src)) {
    cpSync(src, dest);
    return true;
  }
  return false;
}

async function fetchLogo(slug) {
  const url = logoApiUrlForSlug(slug);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': FETCH_USER_AGENT },
    });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 100) return null;
    const dest = join(LOGOS_ROOT, `${slug}.webp`);
    writeFileSync(dest, buffer);
    return `/design-repository/logos/${slug}.webp`;
  } catch {
    return null;
  }
}

async function main() {
  if (!existsSync(DESIGN_MD_ROOT)) {
    console.error(`Missing vendor source: ${DESIGN_MD_ROOT}`);
    console.error('Run scripts/update-design-repository.sh first.');
    process.exit(1);
  }

  const readme = existsSync(README_PATH) ? readFileSync(README_PATH, 'utf-8') : '';
  const slugToCategory = parseReadmeCategories(readme);

  if (existsSync(PUBLIC_ROOT)) {
    rmSync(PUBLIC_ROOT, { recursive: true, force: true });
  }
  mkdirSync(PUBLIC_ROOT, { recursive: true });
  mkdirSync(LOGOS_ROOT, { recursive: true });

  const entries = [];
  const categories = new Set();
  const colorFamilies = new Set();
  let logosFetched = 0;
  const skipped = [];

  const slugs = readdirSync(DESIGN_MD_ROOT).filter((name) => {
    const full = join(DESIGN_MD_ROOT, name);
    return statSync(full).isDirectory();
  });

  for (const slug of slugs.sort()) {
    const srcDir = join(DESIGN_MD_ROOT, slug);
    const designPath = join(srcDir, 'DESIGN.md');
    if (!existsSync(designPath)) continue;

    const content = readFileSync(designPath, 'utf-8');
    const meta = parseFrontmatterYaml(content, YAML);

    if (!isValidDesignMeta(meta)) {
      skipped.push(slug);
      continue;
    }

    const colors = meta.colors ?? {};
    const primaryColor = colors.primary ?? colors['brand-primary'] ?? '#888888';
    const primaryColors = extractPrimaryColors(colors);
    const colorFamily = colorFamilyFromHex(primaryColor);
    const category = slugToCategory.get(slug) ?? 'Uncategorized';
    const fonts = resolveFonts(meta.typography ?? {});
    const playground = buildPlayground(meta);
    const siteUrl = siteUrlForSlug(slug);
    const visitUrl = visitUrlForSlug(slug);

    categories.add(category);
    colorFamilies.add(colorFamily);

    const destDir = join(PUBLIC_ROOT, slug);
    mkdirSync(destDir, { recursive: true });
    cpSync(designPath, join(destDir, 'DESIGN.md'));

    const hasPreview = copyIfExists(join(srcDir, 'preview.html'), join(destDir, 'preview.html'));
    copyIfExists(join(srcDir, 'preview-dark.html'), join(destDir, 'preview-dark.html'));

    const logo = await fetchLogo(slug);
    if (logo) logosFetched += 1;

    const tokens = {
      colors,
      primaryColors,
      typography: meta.typography ?? {},
      components: meta.components ?? {},
      rounded: meta.rounded ?? {},
      fonts,
      playground,
    };
    writeFileSync(join(destDir, 'tokens.json'), `${JSON.stringify(tokens, null, 2)}\n`);

    const description = (meta.description ?? '').replace(/\s+/g, ' ').trim();

    entries.push({
      slug,
      name: meta.name ?? slug,
      displayName: slugToDisplayName(slug),
      description: description.slice(0, 280),
      category,
      primaryColor,
      primaryColors,
      colorFamily,
      logo,
      siteUrl,
      visitUrl,
      fonts,
      hasPreview,
      sourcePath: `design-md/${slug}/DESIGN.md`,
    });
  }

  const index = {
    source: {
      repo: 'VoltAgent/awesome-design-md',
      url: 'https://github.com/VoltAgent/awesome-design-md',
      syncedAt: new Date().toISOString(),
    },
    categories: [...categories].sort(),
    colorFamilies: COLOR_FAMILY_ORDER.filter((f) => colorFamilies.has(f)),
    entries: entries.sort((a, b) => a.displayName.localeCompare(b.displayName)),
  };

  mkdirSync(dirname(INDEX_PATH), { recursive: true });
  writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`);

  console.log(`Synced ${entries.length} design systems`);
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} entries (missing structured tokens): ${skipped.join(', ')}`);
  }
  console.log(`Logos fetched: ${logosFetched}/${entries.length}`);
  console.log(`Categories: ${index.categories.length}`);
  console.log(`Index: ${INDEX_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
