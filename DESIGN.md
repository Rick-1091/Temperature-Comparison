---
name: Weatherbridge
description: Typography-led, warm-paper single-page journey with dark-green story contrasts.
colors:
  wb-paper: "#f4f1e8"
  wb-ink: "#163e38"
  wb-muted: "#53665f"
  wb-line: "#c9cec2"
  wb-accent: "#167970"
  observation: "#b34c32"
  action-text: "#ffffff"
typography:
  display:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "clamp(48px,5.6vw,88px)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-.045em"
  headline:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "clamp(38px,4.5vw,68px)"
    fontWeight: 600
    lineHeight: 1.14
  body:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "19px"
    lineHeight: 1.65
rounded:
  wb-radius: "3px"
components:
  button-primary:
    backgroundColor: "{colors.wb-accent}"
    textColor: "{colors.action-text}"
    rounded: "{rounded.wb-radius}"
    padding: "17px 26px"
---
# Design System: Weatherbridge

## Overview

**Creative North Star: "One continuous weather story"**

The current main experience is a typography-led reading path, not a directory of independent stories. Depo supplies the compositional reference: a large left headline, a single entry action, a meaningful right-hand product visual, large numeric moments and a continuous scrolling rhythm. Weatherbridge keeps its own logo, field photographs, fictional illustrations, scientific boundaries and courtyard model.

This refresh reconciles the previous multi-page record with the implemented October 5 journey. Retained incumbent decisions: self-hosted IBM Plex fonts, bilingual content, unobstructed imagery, reduced-motion support, and an actual fixed-camera Three.js scene. Legacy advanced chart styles remain renderer-local rather than defining this main journey.

**Key Characteristics:**

- Warm-paper reading surfaces alternate with dark-green story surfaces.
- Large type and real numbers establish hierarchy before containers.
- A continuous main road keeps technical depth in disclosures and the research hub.

## Colors

Primary teal supplies actions, market support and emphasis. Dark green supplies main text and the contrasting story backgrounds. Warm paper supplies reading surfaces; muted green supports captions and thin rules. Rust identifies observed temperature values and visible focus outlines.

**The Data Contrast Rule.** Market-leading values and observed values remain explicitly labeled; color alone never supplies their meaning.

## Typography

IBM Plex Sans is retained, with the browser's Chinese sans-serif fallback. Main headings are semibold (600), tightly tracked and brief. Main body uses a comfortable line height (1.65) with paragraphs capped at 55ch. Supporting captions are smaller (14px), not oversized disclaimer panels.

The Chinese hero display uses the frontmatter clamp. English uses a smaller language-specific clamp to keep both complete phrases readable. At mobile widths, headings reduce while temperature values remain prominent; especially narrow Fahrenheit values use a responsive numeric size.

**The Complete Phrase Rule.** Translate full meaning and verify actual wrapping in both languages instead of copying desktop font sizes onto narrow screens.

## Layout

Desktop spreads use two columns and generous intervening space (7vw). Reading content is inset by the larger of 5vw or the space outside a 1280px content span. Sections have large vertical padding (100px). Below 850px, spreads become one column, section padding reduces, and the reader encounters one idea followed by its visual.

The header is brand and language only on the main journey. The hero has one entry action. Former story tabs and competing chapter menus are absent. Context changes in evidence stay below the first concrete comparison.

**The Continuous Road Rule.** Main story transitions are sentences and scroll, not new destinations.

## Elevation & Depth

Flat paper and tonal contrasts establish hierarchy. The hero's historical comparison has a slight desktop rotation; mobile removes it. There are no decorative image overlays or ambient card-shadow stacks.

The courtyard retains genuine flat-shaded Three.js geometry and directional shadows. The orthographic camera is fixed; this is not an orbit viewer or a screenshot pretending to be interactive. Its renderer loads near the action section and pauses outside that section. Reduced motion starts paused. A household illustration and text controls preserve decisions and reflection without WebGL.

## Shapes

Small rectangular corners (3px) characterize actions and fields. Thin rules organize comparisons and disclosures. Existing identity artwork is retained rather than reconstructed. Photographs and fictional illustrations remain visible as whole image regions without new cloud or card overlays.

## Components

- **Main header:** original logo and name; 中文 / EN state uses aria-pressed; footer holds About and Research & Data.
- **Primary action:** teal fill, white semibold text, generous padding and a 48px minimum height.
- **Historical comparison:** large labeled market range beside the observation; explicit inside/outside verdict; price bars carry their own labels and cents.
- **Nine-day overview:** selectable days with interval and textual symbol legend; selecting a date updates the same comparison without leaving the page.
- **Disclosures:** native details/summary keeps city/date, exercise utilities and research depth secondary.
- **Courtyard choices:** same paper, teal and type system; qualitative consequences update the scene, then the four-way comparison below.
- **Research hub:** large quote-window and observation-coverage figures; day-specific timestamps and raw links progressively disclosed.

Focus uses a visible rust outline (3px with 5px offset). Evidence comparisons preserve market-native membership when display units change. Current-price bars are relative to the largest price, not normalized probability shares. Neither nine historical days nor the separate rainfall exercise establishes forecast skill.

## Do's and Don'ts

- Do retain real assets and clearly distinguish field photographs, fictional illustrations, historical observations and synthetic teaching information.
- Do keep language switches, selected evidence context and old deep links functional.
- Do keep official-warning priority and scientific boundaries accessible without making them the dominant visual.
- Don't add story selectors or competing chapter navigation to the main road. Research-view tabs are local to the explicitly requested dual-market comparison.
- Don't infer real economic losses or Malawi rainfall from airport temperature snapshots.
- Don't promote local advanced chart palettes into the main journey's shared design system.

## Dual-market research surface · 2026-10-18

This section records the implemented extension requested for CME / Polymarket, and takes precedence over older component descriptions for `#polymarket` and `#evidence` only. The surrounding Depo-themed stories and courtyard keep their existing presentation.

The comparison uses warm paper, existing Plex / Inter typography, thin rules, open columns and no shadowed disclosure cards. CME is blue (`#285b96`), Polymarket is teal (`#167970`), with provider names in text. Desktop columns have equal width; below 850px CME appears before Polymarket. Four local mechanism tabs change both descriptions; the study area has Overview / CME / Polymarket views and one shared July date slider.

The cumulative CDD plot is labeled as NWS observation, not futures prices. Price bars use US cents per share, temperature bins use °F, and the daily NWS maximum and resolved market range are separately labeled. Dark teal identifies the highest pre-event quote; a thin outline identifies the chosen range. Sources, precise records and formulas use flat native disclosures. The old historical charts remain inside the Polymarket archive with an explicit separate-date label.

Keyboard tab navigation, chart day selection, live language change, partial-load retry, 1440 / 768 / 390 / 320px layouts in both languages and a full diorama light-rain payout were checked on the production build. Desktop and phone screenshots are local QA evidence under `.cache/decision-qa/dual-market/`; numerical provenance and the future licensed-data boundary are described in `docs/dual-market.md`.

Follow-up verification preserves expanded records across language changes and keeps the language on reload. The two sources load independently with bounded waits and retry, without adding a new navigation layer. The archive's selected graph and unit agree after reload; the advanced renderer synchronizes its initial selected tab with the requested graph. The browser suite now covers all five legacy views and 27 diorama UI outcomes; details are in the same implementation record.
