---
version: alpha
name: AI Builders Network
description: Visual identity for a community of builders shipping AI solutions. Built from the aibn logo — a 2x2 vermilion grid of lowercase letters on near-black.
colors:
  primary: "#C73E22"
  primary-deep: "#B83A22"
  on-primary: "#FFFFFF"
  ink: "#1A1A1A"
  on-ink: "#F4F1EA"
  neutral: "#F4F1EA"
  on-neutral: "#1A1A1A"
  muted: "#5C5C5C"
  surface: "#FFFFFF"
  divider: "#1A1A1A"
typography:
  display-xl:
    fontFamily: DM Mono
    fontSize: 5rem
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: "-0.03em"
  display-l:
    fontFamily: DM Mono
    fontSize: 3.25rem
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  heading:
    fontFamily: DM Mono
    fontSize: 1.5rem
    fontWeight: 500
    lineHeight: 1.2
  body-lg:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  label-caps:
    fontFamily: DM Mono
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.12em"
rounded:
  none: 0px
  sm: 4px
  md: 8px
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 48px
  xl: 120px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.heading}"
    rounded: "{rounded.sm}"
    padding: 16px
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
  logo-cell:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
  card-on-neutral:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-neutral}"
    rounded: "{rounded.md}"
    padding: 24px
  card-on-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.md}"
    padding: 24px
  header-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
  section-divider:
    backgroundColor: "{colors.divider}"
  eyebrow:
    textColor: "{colors.muted}"
    typography: "{typography.label-caps}"
---

## Overview

Architectural restraint meets builder warmth. The identity descends from one object: the aibn logo, a 2x2 grid spelling the name in lowercase, white letterforms inside a confident vermilion square, set against a near-black header on warm off-white paper.

The grid is the idea. A network is a set of cells that connect, so every structural decision on the page repeats the four-cell shape with its thin dividing cross. The grid is the signature; everything around it stays quiet so it can carry the page. The voice follows the logo: lowercase, unbothered, builder-to-builder rather than brand-to-customer.

## Colors

The palette is taken directly from the logo: a single hot accent, deep ink, and warm paper. Vermilion is earned, not sprinkled. It belongs to the logo, primary buttons, and the grid dividing lines, with at most one extra accent moment per section.

- **Primary (#D9472B):** "aibn vermilion." The brand square and the sole driver of interaction.
- **Primary Deep (#B83A22):** Hover and pressed state for accent surfaces, and the divider lines inside the logo grid.
- **Ink (#1A1A1A):** Near-black from the logo header. Primary text and dark sections.
- **Neutral (#F4F1EA):** Warm off-white paper, the framed margin in the source artwork. The page background.
- **Muted (#5C5C5C):** Secondary text, captions, FAQ answers.
- **Surface (#FFFFFF):** Letterforms on vermilion, cards lifted on paper or ink.

Body text reads in ink on neutral or on-ink on ink. Vermilion is a surface color, never a long-form reading color.

## Typography

One mono face for display and labels, one humanist face for body copy.

- **DM Mono** carries display, headings, and eyebrow labels. Fixed-width and precise, it reads as code and craft at the same time — fitting for a community that ships. Set lowercase with tight tracking at display sizes, wide tracking for all-caps labels.
- **Inter** handles body copy. Neutral and screen-native, the language builders already read inside their tools.

All headings are lowercase. The logo sets that rule and the page keeps it.

## Layout

Content sits in a max width of 1100px with generous side margins, echoing the framed look of the source artwork where the dark header is inset from the paper edge. Section rhythm runs on `{spacing.xl}` vertically on desktop, compressing on mobile. Section breaks are hairline rules in ink at low opacity, not whitespace alone.

The hero, the "what / who / why / inside" block, and the benefits all render as literal 2x2 grids with the same white cross divider and proportions as the logo, so the reader watches the mark become the page. On mobile the grid stacks to a single column but keeps the cross as a horizontal rule so the motif survives.

## Shapes

Corners stay tight. `{rounded.sm}` on buttons and logo cells matches the slight softening of the logo square; `{rounded.md}` on lifted cards. Nothing is fully rounded. The four-cell grid with its dividing cross is the one recurring form, reused at three scales: the logo, the section blocks, and tiny four-dot bullet markers where the lower-left dot is filled vermilion.

## Components

- **button-primary:** Vermilion fill, white label, tight 4px radius. Deepens to `{colors.primary-deep}` and nudges up 1px on hover. Labels name the action ("join the network," "see what's inside"), never "submit."
- **logo-cell:** A single grid cell, vermilion on white dividers, lowercase letter centered.
- **card-on-neutral / card-on-ink:** Lifted content blocks for benefits and activity previews; choose by section background.
- **eyebrow:** Mono caps label that names a real thing (`members`, `est. 2026`, `built in public`), not decoration.

## Do's and Don'ts

- **Do** let the 2x2 grid appear in every full viewport. It is the one memorable element.
- **Do** keep headings lowercase and copy specific ("weekly build demos," not "a space to grow").
- **Don't** put a third vermilion element in a single viewport. If it wants to appear, cut it.
- **Don't** use vermilion for body text or em dashes or contractions in headline copy.
- **Don't** add motion beyond the one-time hero cell assembly and quiet hover and scroll reveals. Respect prefers-reduced-motion everywhere.
