export interface DesignRepoSource {
  repo: string;
  url: string;
  syncedAt: string;
}

export interface FontMeta {
  name: string;
  source: 'google' | 'custom';
  googleFamily?: string;
  cssUrl?: string;
  note?: string;
}

export interface DesignRepoPlaygroundAccordion {
  backgroundColor: string;
  color: string;
  border: string;
  borderRadius: string;
  summaryColor: string;
  summaryStyle?: Record<string, string>;
  mutedColor: string;
}

export interface DesignRepoPlaygroundNav {
  bar: Record<string, string>;
  link: Record<string, string>;
  linkActive: Record<string, string>;
}

export interface DesignRepoPlayground {
  canvas: string;
  ink: string;
  surface: string;
  hairline: string;
  muted: string;
  radiusMd: string;
  buttonPrimary: Record<string, string>;
  buttonSecondary: Record<string, string>;
  body: Record<string, string>;
  headline: Record<string, string>;
  label: Record<string, string>;
  card: Record<string, string>;
  input: Record<string, string>;
  badge: Record<string, string>;
  link: Record<string, string>;
  nav: DesignRepoPlaygroundNav;
  tabActive: Record<string, string>;
  tabInactive: Record<string, string>;
  alert: Record<string, string>;
  code: Record<string, string>;
  accordion: DesignRepoPlaygroundAccordion;
}

export interface DesignRepoTokens {
  colors: Record<string, string>;
  primaryColors: Record<string, string>;
  typography: Record<string, Record<string, string | number>>;
  components: Record<string, unknown>;
  rounded: Record<string, string>;
  fonts: FontMeta[];
  playground: DesignRepoPlayground;
}

export interface DesignRepoEntry {
  slug: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  primaryColor: string;
  primaryColors: Record<string, string>;
  colorFamily: string;
  logo: string | null;
  siteUrl: string;
  visitUrl: string;
  fonts: FontMeta[];
  hasPreview: boolean;
  sourcePath: string;
}

export interface DesignRepoIndex {
  source: DesignRepoSource;
  categories: string[];
  colorFamilies: string[];
  entries: DesignRepoEntry[];
}

export type DesignRepoView = 'cards' | 'list' | 'colors' | 'brands';
