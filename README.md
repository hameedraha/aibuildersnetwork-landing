# AI Builders Network — landing site

Static site for [AI Builders Network](https://aibuildersnetwork.com), built with Astro. Visual identity follows [`DESIGN.md`](./DESIGN.md).

## Commands

| Command | Action |
| :------ | :----- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` (runs certificate CSV build via `predev`) |
| `npm run build` | Production build to `./dist/` (runs certificate CSV build via `prebuild`) |
| `npm run preview` | Preview the production build |
| `npm run design-repo:update` | Sync the design repository catalog (see below) |

Requires **Node.js ≥ 22.12**.

## Environment variables

Copy `.env.example` to `.env` and set your values before running locally or deploying:

```sh
cp .env.example .env
```

| Variable | Purpose |
| :------- | :------ |
| `COMMUNITY_REGISTRATION_WEBHOOK_URL` | n8n webhook URL for `/community` signups (server-side only; proxied via `/api/community-registration` to avoid CORS) |

The community signup form posts to `/api/community-registration` on the same origin. In production on Cloudflare Pages, `functions/api/community-registration.ts` forwards submissions to the webhook. Locally, `npm run dev` proxies the same path via `astro.config.mjs` when `COMMUNITY_REGISTRATION_WEBHOOK_URL` is set.

For production, set the same variable in your hosting provider’s environment settings (not only in a local `.env` file).

### Cloudflare Pages

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Environment variable:** `COMMUNITY_REGISTRATION_WEBHOOK_URL` in Pages → Settings → Environment variables

The `functions/` directory provides Cloudflare Pages Functions:

- `/api/community-registration` — community signup proxy
- `/api/workshop-certificate` — certificate verification lookup

Do not use an Astro server adapter — static output must deploy from `dist/` directly.

## Workshop certificate verification

Public verifier at **`/certificate`**. Third parties enter a certificate number; valid IDs show a diploma-style credential with the holder's name. Invalid numbers show a generic error and a contact link — the page does not reveal certificate format hints.

### Certificate data (CSV)

Copy the example and add your attendee rows before building or deploying:

```sh
cp data/workshop-certificates.example.csv data/workshop-certificates.csv
```

| Column | Description |
| :----- | :---------- |
| `name` | Certificate holder name (shown when verified) |
| `check_in` | `TRUE` to include in the live registry; `FALSE` rows are kept for records only |
| `certificate_id` | Format `CERT/AIBN/2026/W01/1` through `CERT/AIBN/2026/W01/50` |

`npm run build` and `npm run dev` run `scripts/build-certificates.mjs`, which validates the CSV and writes `src/data/workshop-certificates.json`. Only rows with `check_in=TRUE` are published. That registry is bundled into `functions/api/workshop-certificate.ts` on Cloudflare Pages.

- **Registry CSV:** `data/workshop-certificates.csv` (committed)
- **Example CSV:** `data/workshop-certificates.example.csv` (format reference)

Locally, `npm run dev` serves `POST /api/workshop-certificate` via middleware in `astro.config.mjs` using the generated JSON.

Invalid or unknown certificates prompt contact at [ceo@icrewsystems.com](mailto:ceo@icrewsystems.com).

### Certificate files

| File | Role |
| :--- | :--- |
| `src/pages/certificate.astro` | Verification portal + diploma success UI |
| `src/scripts/certificate-verify.ts` | Form handling, API call, result states |
| `src/styles/certificate.css` | Certificate page styles |
| `lib/certificate-verification.ts` | ID validation + registry lookup (shared by API and dev middleware) |
| `functions/api/workshop-certificate.ts` | Cloudflare Pages Function for production |
| `scripts/build-certificates.mjs` | CSV → JSON build step |

## Design repository

Browse real brand design systems at **`/design-repository`**.

The catalog syncs from [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md). Each entry includes:

- **Local logos** — fetched at sync time to `public/design-repository/logos/` (no runtime third-party logo URLs in the built site)
- **Primary colors only** on cards and detail swatches
- **Typography** — Google Fonts loaded when available; custom/proprietary fonts labeled honestly
- **Component playground** — live previews styled from parsed `DESIGN.md` tokens:
  - type scale (eyebrow, headline, body)
  - links & badges
  - navigation
  - tabs
  - primary & secondary buttons
  - card
  - alert
  - accordion
  - form (inputs + actions)
  - code block
- **Visit site** link with UTM params on each detail page
- **Download** `design.md` and view upstream on GitHub

The aibn design system (this site’s own tokens) lives separately at **`/resources/design-repository`**.

### Sync pipeline

```sh
npm run design-repo:update
```

This script:

1. Pulls `vendor/awesome-design-md` (cloned on first run)
2. Runs `scripts/build-design-index.mjs`, which:
   - Parses YAML frontmatter from each `DESIGN.md`
   - **Skips** entries without structured tokens (no `colors.primary`, typography, etc.) — prose-only analyses are excluded
   - Fetches logos from [apistemic](https://logos.apistemic.com/) server-side only
   - Writes `public/design-repository/{slug}/tokens.json` per brand
   - Writes `src/data/design-repository/index.json` for the catalog

### Generated assets

| Path | Purpose |
| :--- | :------ |
| `src/data/design-repository/index.json` | Catalog metadata (61 entries after validation) |
| `public/design-repository/logos/{slug}.webp` | Cached brand logos |
| `public/design-repository/{slug}/tokens.json` | Resolved colors, typography, components, playground |
| `public/design-repository/{slug}/DESIGN.md` | Copy of upstream design file |

Token resolution (`scripts/lib/resolve-tokens.mjs`) dereferences `{colors.*}`, `{spacing.*}`, and `{typography.*}` refs and applies fallbacks when values are missing or unresolved — so playgrounds stay usable even when upstream tokens are incomplete.

### Key files

| File | Role |
| :--- | :--- |
| `scripts/update-design-repository.sh` | Clone/pull vendor + run indexer |
| `scripts/build-design-index.mjs` | Index builder, logo fetch, validation |
| `scripts/lib/resolve-tokens.mjs` | Token parsing, playground assembly, fallbacks |
| `scripts/lib/resolve-fonts.mjs` | Google Fonts matching |
| `scripts/lib/domains.mjs` | Site URLs + UTM visit links |
| `src/pages/design-repository/` | Catalog + detail pages |
| `src/components/design-repository/` | Cards, toolbar, typography, playground |

## Project structure

```text
/
├── data/                    # workshop-certificates CSV + example
├── functions/api/           # Cloudflare Pages Functions (registration + certificates)
├── lib/                     # Shared server logic (registration, certificate verification)
├── public/                  # Static assets + synced design-repo files
├── scripts/                 # Design repo sync, certificate CSV build, token resolution
├── src/
│   ├── components/
│   ├── content/             # Events, resources (markdown)
│   ├── data/                # workshop.json, design-repository index, generated certificates JSON
│   ├── pages/               # Routes (including /certificate)
│   └── styles/
├── vendor/awesome-design-md # Gitignored upstream clone
├── DESIGN.md                # aibn styleguide
└── package.json
```

## Other routes

- `/` — home
- `/events` — events
- `/resources` — guides, prompts, workflows
- `/workshop` — members-only workshop prompts (OTP-gated)
- `/certificate` — workshop credential verification
- `/community` — community signup
- `/resources/design-generator` — design.md generator tool
