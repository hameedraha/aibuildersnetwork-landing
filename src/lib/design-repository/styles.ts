import type { DesignRepoPlayground } from '../../data/design-repository.types';

function isBad(value: string | undefined): boolean {
  if (!value) return true;
  return value.includes('{') || value === '0' || value === '0px';
}

function withDefaults(
  style: Record<string, string>,
  defaults: Record<string, string>
): Record<string, string> {
  const out = { ...defaults, ...style };
  for (const [key, fallback] of Object.entries(defaults)) {
    if (isBad(out[key])) out[key] = fallback;
  }
  return out;
}

export function normalizePlayground(playground: DesignRepoPlayground): DesignRepoPlayground {
  const { ink, surface, hairline, radiusMd, muted } = playground;

  const buttonPrimary = withDefaults(playground.buttonPrimary, {
    padding: '12px 20px',
    borderRadius: radiusMd,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    lineHeight: '1.2',
    cursor: 'default',
  });

  const buttonSecondary = withDefaults(playground.buttonSecondary, {
    padding: '12px 20px',
    borderRadius: radiusMd,
    backgroundColor: 'transparent',
    color: ink,
    border: `1px solid ${hairline}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    lineHeight: '1.2',
    cursor: 'default',
  });

  const input = withDefaults(playground.input, {
    padding: '10px 14px',
    borderRadius: radiusMd,
    backgroundColor: surface,
    color: ink,
    border: `1px solid ${hairline}`,
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '16px',
  });

  const card = withDefaults(playground.card, {
    padding: '24px',
    borderRadius: radiusMd,
    backgroundColor: surface,
    color: ink,
    border: `1px solid ${hairline}`,
  });

  const body = withDefaults(playground.body, {
    fontSize: '16px',
    lineHeight: '1.5',
    color: ink,
  });

  const headline = withDefaults(playground.headline, {
    fontSize: '1.25rem',
    fontWeight: '500',
    lineHeight: '1.2',
    color: ink,
  });

  const label = withDefaults(playground.label ?? {}, {
    fontSize: '12px',
    fontWeight: '500',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: muted,
  });

  const badge = withDefaults(playground.badge ?? {}, {
    padding: '4px 10px',
    borderRadius: radiusMd,
    display: 'inline-block',
    fontWeight: '500',
    lineHeight: '1.3',
  });

  const link = withDefaults(playground.link ?? {}, {
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
    cursor: 'default',
    color: ink,
  });

  const nav = {
    bar: withDefaults(playground.nav?.bar ?? {}, {
      padding: '12px 16px',
      borderRadius: radiusMd,
      backgroundColor: surface,
      border: `1px solid ${hairline}`,
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
    }),
    link: withDefaults(playground.nav?.link ?? {}, {
      fontWeight: '500',
      fontSize: '14px',
      color: ink,
    }),
    linkActive: withDefaults(playground.nav?.linkActive ?? {}, {
      fontWeight: '500',
      fontSize: '14px',
      color: ink,
    }),
  };

  const tabActive = withDefaults(playground.tabActive ?? {}, {
    padding: '8px 14px',
    borderRadius: radiusMd,
    display: 'inline-block',
    fontWeight: '500',
    cursor: 'default',
  });

  const tabInactive = withDefaults(playground.tabInactive ?? {}, {
    padding: '8px 14px',
    borderRadius: radiusMd,
    display: 'inline-block',
    fontWeight: '400',
    cursor: 'default',
    border: `1px solid ${hairline}`,
    backgroundColor: surface,
    color: ink,
  });

  const alert = withDefaults(playground.alert ?? {}, {
    padding: '12px 16px',
    borderRadius: radiusMd,
    backgroundColor: surface,
    color: ink,
    border: `1px solid ${hairline}`,
  });

  const code = withDefaults(playground.code ?? {}, {
    padding: '14px 16px',
    borderRadius: radiusMd,
    fontFamily: '"DM Mono", ui-monospace, monospace',
    fontSize: '13px',
    lineHeight: '1.5',
    display: 'block',
    overflowX: 'auto',
  });

  const summaryStyle = withDefaults(playground.accordion.summaryStyle ?? {}, {
    color: playground.accordion.summaryColor || ink,
    fontSize: '1rem',
    fontWeight: '500',
    lineHeight: '1.3',
    padding: '12px 16px',
  });

  return {
    ...playground,
    buttonPrimary,
    buttonSecondary,
    input,
    card,
    body,
    headline,
    label,
    badge,
    link,
    nav,
    tabActive,
    tabInactive,
    alert,
    code,
    accordion: {
      ...playground.accordion,
      summaryStyle,
    },
  };
}

export function styleToCss(style: Record<string, string | undefined>): string {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== '' && !String(value).includes('{'))
    .map(([key, value]) => {
      const prop = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      return `${prop}: ${value}`;
    })
    .join('; ');
}

export function isLightColor(hex: string): boolean {
  const normalized = hex.replace('#', '').trim();
  if (!normalized) return true;
  let r: number;
  let g: number;
  let b: number;
  if (normalized.length === 3) {
    r = parseInt(normalized[0] + normalized[0], 16);
    g = parseInt(normalized[1] + normalized[1], 16);
    b = parseInt(normalized[2] + normalized[2], 16);
  } else if (normalized.length === 6) {
    r = parseInt(normalized.slice(0, 2), 16);
    g = parseInt(normalized.slice(2, 4), 16);
    b = parseInt(normalized.slice(4, 6), 16);
  } else {
    return true;
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55;
}
