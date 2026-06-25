const REF_PATTERN = /^\{([^}]+)\}$/;
const EMBEDDED_REF_PATTERN = /\{([^}]+)\}/g;

export function parseFrontmatterYaml(content, yaml) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  try {
    return yaml.parse(match[1]) ?? {};
  } catch {
    return {};
  }
}

export function extractPrimaryColors(colors = {}) {
  const result = {};
  const seen = new Set();

  for (const [key, value] of Object.entries(colors)) {
    if (typeof value !== 'string' || !value.startsWith('#')) continue;
    if (key === 'on-primary' || key.startsWith('primary')) {
      const norm = value.toLowerCase();
      if (!seen.has(norm)) {
        seen.add(norm);
        result[key] = value;
      }
    }
  }

  if (!result.primary && colors.primary && String(colors.primary).startsWith('#')) {
    result.primary = colors.primary;
  }

  return result;
}

export function isValidDesignMeta(meta) {
  const colors = meta.colors ?? {};
  const primary = colors.primary ?? colors['brand-primary'];
  const hasPrimary = typeof primary === 'string' && primary.startsWith('#');
  const hasTypography = Object.keys(meta.typography ?? {}).length > 0;
  const primaryColors = extractPrimaryColors(colors);
  return hasPrimary && hasTypography && Object.keys(primaryColors).length > 0;
}

function getPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

function formatTokenValue(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return '';
  const s = String(value).trim();
  if (/^\d+(\.\d+)?$/.test(s)) return `${s}px`;
  return s;
}

export function resolveStringRefs(value, meta) {
  if (typeof value !== 'string') return value;
  const resolved = value.replace(EMBEDDED_REF_PATTERN, (_, path) => {
    const token = getPath(meta, path.trim());
    return formatTokenValue(token);
  });
  return resolved.replace(/\s+/g, ' ').trim();
}

export function resolveRef(value, meta) {
  if (typeof value !== 'string') return value;

  const ref = value.match(REF_PATTERN);
  if (!ref) return resolveStringRefs(value, meta);

  const resolved = getPath(meta, ref[1]);
  if (resolved === undefined) return value;
  if (typeof resolved === 'object') return resolved;
  return resolveRef(String(resolved), meta);
}

export function resolveObject(obj, meta) {
  if (!obj || typeof obj !== 'object') return {};
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const resolved = resolveRef(value, meta);
      out[key] = typeof resolved === 'object' ? resolved : resolved;
    } else if (value && typeof value === 'object') {
      out[key] = resolveObject(value, meta);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function pickComponent(components, patterns) {
  if (!components) return null;
  for (const pattern of patterns) {
    if (components[pattern]) return components[pattern];
  }
  for (const key of Object.keys(components)) {
    for (const pattern of patterns) {
      if (key.includes(pattern)) return components[key];
    }
  }
  return null;
}

function typographyToStyle(typo) {
  if (!typo || typeof typo !== 'object') return {};
  const style = {};
  if (typo.fontFamily) {
    const family = String(typo.fontFamily).split(',')[0].trim().replace(/^["']|["']$/g, '');
    style.fontFamily = `"${family}", system-ui, sans-serif`;
  }
  if (typo.fontSize) {
    const fs = String(typo.fontSize);
    style.fontSize = fs.includes('px') || fs.includes('rem') || fs.includes('em') ? fs : `${fs}px`;
  }
  if (typo.fontWeight) style.fontWeight = String(typo.fontWeight);
  if (typo.lineHeight) style.lineHeight = String(typo.lineHeight);
  if (typo.letterSpacing) {
    const ls = String(typo.letterSpacing);
    style.letterSpacing = ls.includes('px') || ls.includes('em') ? ls : `${ls}px`;
  }
  return style;
}

function isUnresolved(value) {
  if (value === undefined || value === null || value === '') return true;
  if (typeof value === 'string' && (value.includes('{') || value === '0' || value === '0px')) return true;
  return false;
}

function componentToStyle(comp, meta) {
  if (!comp) return {};
  const resolved = resolveObject(comp, meta);
  const style = {};

  if (resolved.backgroundColor) style.backgroundColor = resolveStringRefs(String(resolved.backgroundColor), meta);
  if (resolved.textColor || resolved.color) {
    style.color = resolveStringRefs(String(resolved.textColor ?? resolved.color), meta);
  }
  if (resolved.padding) {
    const padding = resolveStringRefs(String(resolved.padding), meta);
    if (!isUnresolved(padding)) style.padding = padding;
  }
  if (resolved.rounded) {
    const radius = resolveStringRefs(String(resolved.rounded), meta);
    if (!isUnresolved(radius)) style.borderRadius = radius;
  }
  if (resolved.border) {
    const border = resolveStringRefs(String(resolved.border), meta);
    if (!isUnresolved(border)) style.border = border;
  }
  if (resolved.borderColor) {
    const borderColor = resolveStringRefs(String(resolved.borderColor), meta);
    if (!isUnresolved(borderColor) && !style.border) {
      style.border = `1px solid ${borderColor}`;
    }
  }

  if (resolved.typography && typeof resolved.typography === 'object') {
    Object.assign(style, typographyToStyle(resolved.typography));
  }

  return style;
}

function finalizeButtonStyle(style, { primary, onPrimary, ink, surface, hairline, radiusMd, bodyTypo }) {
  const out = { ...style };
  if (!out.backgroundColor) out.backgroundColor = primary;
  if (!out.color) out.color = onPrimary ?? '#ffffff';
  if (isUnresolved(out.padding)) out.padding = '12px 20px';
  if (!out.borderRadius) out.borderRadius = radiusMd;
  if (!out.fontSize) Object.assign(out, typographyToStyle(bodyTypo));
  if (!out.fontWeight) out.fontWeight = out.fontWeight ?? '500';
  if (!out.lineHeight) out.lineHeight = out.lineHeight ?? '1.2';
  if (!out.cursor) out.cursor = 'default';
  if (!out.display) out.display = 'inline-flex';
  if (!out.alignItems) out.alignItems = 'center';
  if (!out.justifyContent) out.justifyContent = 'center';
  return out;
}

function finalizeSecondaryButton(style, { ink, surface, hairline, radiusMd, bodyTypo }) {
  const base = finalizeButtonStyle(style, {
    primary: surface,
    onPrimary: ink,
    ink,
    surface,
    hairline,
    radiusMd,
    bodyTypo,
  });
  if (!style.backgroundColor) base.backgroundColor = 'transparent';
  if (!style.color) base.color = ink;
  if (!style.border && !style.backgroundColor) {
    base.border = `1px solid ${hairline}`;
  }
  return base;
}

function finalizeInputStyle(style, { ink, surface, hairline, radiusMd, bodyTypo }) {
  const out = { ...style };
  if (!out.backgroundColor) out.backgroundColor = surface;
  if (!out.color) out.color = ink;
  if (isUnresolved(out.padding)) out.padding = '10px 14px';
  if (!out.borderRadius) out.borderRadius = radiusMd;
  if (!out.border) out.border = `1px solid ${hairline}`;
  if (!out.fontSize) Object.assign(out, typographyToStyle(bodyTypo));
  if (!out.width) out.width = '100%';
  if (!out.boxSizing) out.boxSizing = 'border-box';
  return out;
}

function finalizeCardStyle(style, { ink, surface, hairline, radiusMd, headlineTypo, bodyTypo }) {
  const out = { ...style };
  if (!out.backgroundColor) out.backgroundColor = surface;
  if (!out.color) out.color = ink;
  if (isUnresolved(out.padding)) out.padding = '24px';
  if (!out.borderRadius) out.borderRadius = radiusMd;
  if (!out.border) out.border = `1px solid ${hairline}`;
  if (!out.fontSize && bodyTypo) Object.assign(out, typographyToStyle(bodyTypo));
  if (!headlineTypo && !out.fontFamily) Object.assign(out, typographyToStyle(bodyTypo));
  return out;
}

function finalizeBadgeStyle(style, { primary, onPrimary, ink, radiusMd, bodyTypo }) {
  const out = { ...style };
  if (!out.backgroundColor) out.backgroundColor = primary;
  if (!out.color) out.color = onPrimary ?? '#ffffff';
  if (isUnresolved(out.padding)) out.padding = '4px 10px';
  if (!out.borderRadius) out.borderRadius = radiusMd;
  if (!out.fontSize) Object.assign(out, typographyToStyle(bodyTypo));
  if (!out.fontWeight) out.fontWeight = '500';
  if (!out.display) out.display = 'inline-block';
  if (!out.lineHeight) out.lineHeight = '1.3';
  return out;
}

function finalizeNavBarStyle(style, { ink, surface, hairline, radiusMd }) {
  const out = { ...style };
  if (!out.backgroundColor) out.backgroundColor = surface;
  if (!out.color) out.color = ink;
  if (!out.border) out.border = `1px solid ${hairline}`;
  if (!out.borderRadius) out.borderRadius = radiusMd;
  if (isUnresolved(out.padding)) out.padding = '12px 16px';
  if (!out.display) out.display = 'flex';
  if (!out.alignItems) out.alignItems = 'center';
  if (!out.gap) out.gap = '20px';
  if (!out.flexWrap) out.flexWrap = 'wrap';
  return out;
}

function finalizeLinkStyle(style, { primary, ink, bodyTypo }) {
  const out = { ...style };
  if (!out.color) out.color = primary ?? ink;
  if (!out.textDecoration) out.textDecoration = 'underline';
  if (!out.textUnderlineOffset) out.textUnderlineOffset = '2px';
  if (!out.fontSize) Object.assign(out, typographyToStyle(bodyTypo));
  if (!out.cursor) out.cursor = 'default';
  return out;
}

function finalizeNavLinkStyle(style, { ink, primary, bodyTypo }) {
  const out = { ...typographyToStyle(bodyTypo), ...style };
  if (!out.color) out.color = ink;
  if (!out.fontWeight) out.fontWeight = '500';
  if (!out.fontSize) out.fontSize = out.fontSize ?? '14px';
  return out;
}

function finalizeTabStyle(style, { ink, surface, hairline, primary, onPrimary, radiusMd, bodyTypo, active }) {
  const out = { ...style };
  if (active) {
    if (!out.backgroundColor) out.backgroundColor = primary;
    if (!out.color) out.color = onPrimary ?? '#ffffff';
  } else {
    if (!out.backgroundColor) out.backgroundColor = surface;
    if (!out.color) out.color = ink;
    if (!out.border) out.border = `1px solid ${hairline}`;
  }
  if (isUnresolved(out.padding)) out.padding = '8px 14px';
  if (!out.borderRadius) out.borderRadius = radiusMd;
  if (!out.fontSize) Object.assign(out, typographyToStyle(bodyTypo));
  if (!out.fontWeight) out.fontWeight = active ? '500' : '400';
  if (!out.cursor) out.cursor = 'default';
  if (!out.display) out.display = 'inline-block';
  return out;
}

function finalizeAlertStyle(style, { primary, ink, surface, hairline, radiusMd, bodyTypo }) {
  const out = { ...style };
  if (!out.backgroundColor) out.backgroundColor = surface;
  if (!out.color) out.color = ink;
  if (isUnresolved(out.padding)) out.padding = '12px 16px';
  if (!out.borderRadius) out.borderRadius = radiusMd;
  if (!out.border) out.border = `1px solid ${hairline}`;
  if (!out.borderLeft) out.borderLeft = `3px solid ${primary}`;
  if (!out.fontSize) Object.assign(out, typographyToStyle(bodyTypo));
  return out;
}

function finalizeCodeStyle(style, { ink, surface, radiusMd }) {
  const out = { ...style };
  if (!out.backgroundColor) out.backgroundColor = ink;
  if (!out.color) out.color = '#f4f1ea';
  if (isUnresolved(out.padding)) out.padding = '14px 16px';
  if (!out.borderRadius) out.borderRadius = radiusMd;
  if (!out.fontFamily) out.fontFamily = '"DM Mono", ui-monospace, monospace';
  if (!out.fontSize) out.fontSize = '13px';
  if (!out.lineHeight) out.lineHeight = '1.5';
  if (!out.display) out.display = 'block';
  if (!out.overflowX) out.overflowX = 'auto';
  return out;
}

export function buildPlayground(meta) {
  const colors = meta.colors ?? {};
  const typography = meta.typography ?? {};
  const components = meta.components ?? {};
  const rounded = meta.rounded ?? {};

  const canvas =
    colors.canvas ?? colors.neutral ?? colors['canvas-soft'] ?? colors.surface ?? '#f4f1ea';
  const ink = colors.ink ?? colors['on-neutral'] ?? colors['inverse-ink'] ?? '#1a1a1a';
  const surface = colors['surface-1'] ?? colors.surface ?? colors['inverse-canvas'] ?? '#ffffff';
  const hairline = colors.hairline ?? colors.divider ?? 'rgba(26,26,26,0.15)';
  const muted = colors.muted ?? colors['ink-muted'] ?? colors['ink-subtle'] ?? colors.body ?? '#5c5c5c';
  const primary = colors.primary ?? '#1a1a1a';
  const onPrimary = colors['on-primary'] ?? '#ffffff';

  const buttonPrimaryComp = pickComponent(components, [
    'button-primary',
    'button-primary-pill',
  ]) ?? Object.entries(components).find(([k]) => k.startsWith('button-primary'))?.[1];

  const buttonSecondaryComp =
    pickComponent(components, ['button-secondary', 'button-tertiary', 'button-inverse']) ??
    Object.entries(components).find(([k]) => k.startsWith('button-secondary'))?.[1];

  const cardComp =
    pickComponent(components, ['feature-card', 'pricing-card', 'card-on-neutral']) ??
    Object.entries(components).find(([k]) => k.includes('card'))?.[1];

  const inputComp =
    pickComponent(components, ['text-input', 'text-input-focused']) ??
    Object.entries(components).find(([k]) => k.includes('input'))?.[1];

  const badgeComp =
    pickComponent(components, ['badge-pill', 'status-badge', 'badge-popular', 'badge-tag-purple']) ??
    Object.entries(components).find(([k]) => k.startsWith('badge'))?.[1];

  const linkComp =
    pickComponent(components, ['text-link', 'nav-link', 'footer-link']) ??
    Object.entries(components).find(([k]) => k.includes('link') && !k.includes('button'))?.[1];

  const navBarComp =
    pickComponent(components, ['nav-bar', 'top-nav', 'header-bar', 'nav-bar-on-mesh']) ??
    Object.entries(components).find(([k]) => k.includes('nav') && !k.includes('link'))?.[1];

  const navLinkComp =
    pickComponent(components, ['nav-link', 'nav-item', 'footer-link']) ??
    linkComp;

  const tabActiveComp =
    pickComponent(components, [
      'category-tab-active',
      'pricing-tab-selected',
      'pill-tab-active',
      'segmented-tab-active',
      'tab-active',
    ]) ?? Object.entries(components).find(([k]) => k.includes('tab') && (k.includes('active') || k.includes('selected')))?.[1];

  const tabInactiveComp =
    pickComponent(components, [
      'category-tab',
      'pricing-tab-default',
      'pill-tab',
      'segmented-tab',
      'tab-default',
    ]) ?? Object.entries(components).find(([k]) => k.includes('tab') && !k.includes('active') && !k.includes('selected'))?.[1];

  const alertComp =
    pickComponent(components, ['ex-toast', 'toast', 'hero-band', 'banner', 'alert', 'callout']) ??
    Object.entries(components).find(([k]) => k.includes('toast') || k.includes('banner'))?.[1];

  const codeComp =
    pickComponent(components, ['code-block', 'code-inline', 'ex-code']) ??
    Object.entries(components).find(([k]) => k.includes('code'))?.[1];

  const bodyTypo =
    typography.body ?? typography['body-md'] ?? typography['body-lg'] ?? typography['body-sm'];

  const headlineTypo =
    typography.headline ?? typography['display-md'] ?? typography['card-title'] ?? typography.subhead ?? typography['display-sm'];

  const buttonTypo =
    typography['button-md'] ?? typography['button-large'] ?? typography['button-sm'] ?? bodyTypo;

  const labelTypo =
    typography['label-caps'] ?? typography.eyebrow ?? typography.caption ?? bodyTypo;

  const radiusMd = rounded.md ?? rounded.sm ?? '8px';
  const tokens = { primary, onPrimary, ink, surface, hairline, radiusMd, bodyTypo, headlineTypo, buttonTypo };

  const summaryTypo = headlineTypo ?? bodyTypo;
  const navLinkStyle = finalizeNavLinkStyle(componentToStyle(navLinkComp, meta), tokens);

  return {
    canvas,
    ink,
    surface,
    hairline,
    muted,
    radiusMd,
    buttonPrimary: finalizeButtonStyle(componentToStyle(buttonPrimaryComp, meta), {
      ...tokens,
      primary,
      onPrimary,
      bodyTypo: buttonTypo,
    }),
    buttonSecondary: finalizeSecondaryButton(componentToStyle(buttonSecondaryComp, meta), tokens),
    body: typographyToStyle(bodyTypo) || { fontSize: '16px', lineHeight: '1.5', color: ink },
    headline: typographyToStyle(headlineTypo) || { fontSize: '1.25rem', fontWeight: '500', lineHeight: '1.2', color: ink },
    card: finalizeCardStyle(componentToStyle(cardComp, meta), { ...tokens, headlineTypo, bodyTypo }),
    input: finalizeInputStyle(componentToStyle(inputComp, meta), tokens),
    badge: finalizeBadgeStyle(componentToStyle(badgeComp, meta), tokens),
    link: finalizeLinkStyle(componentToStyle(linkComp, meta), { ...tokens, primary: colors.link ?? primary }),
    nav: {
      bar: finalizeNavBarStyle(componentToStyle(navBarComp, meta), tokens),
      link: navLinkStyle,
      linkActive: { ...navLinkStyle, color: primary },
    },
    tabActive: finalizeTabStyle(componentToStyle(tabActiveComp, meta), { ...tokens, active: true }),
    tabInactive: finalizeTabStyle(componentToStyle(tabInactiveComp, meta), { ...tokens, active: false }),
    alert: finalizeAlertStyle(componentToStyle(alertComp, meta), tokens),
    code: finalizeCodeStyle(componentToStyle(codeComp, meta), tokens),
    label: typographyToStyle(labelTypo) || { fontSize: '12px', fontWeight: '500', letterSpacing: '0.08em', textTransform: 'uppercase', color: muted },
    accordion: {
      backgroundColor: surface,
      color: ink,
      border: `1px solid ${hairline}`,
      borderRadius: radiusMd,
      summaryColor: ink,
      summaryStyle: {
        ...typographyToStyle(summaryTypo),
        color: ink,
        fontWeight: typographyToStyle(summaryTypo).fontWeight ?? '500',
        fontSize: typographyToStyle(summaryTypo).fontSize ?? '1rem',
        padding: '12px 16px',
      },
      mutedColor: muted,
    },
  };
}
