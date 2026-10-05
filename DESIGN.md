---
name: Weatherbridge
description: Restrained dark-teal entry, warm-paper stories, evidence, and decisions.
colors:
  wb-paper: "#f5f2e9"
  wb-ink: "#183e3a"
  wb-muted: "#52685e"
  wb-line: "#d5d7c9"
  wb-accent: "#a94b2e"
  cover-background: "#102a2a"
  cover-text: "#f4f2e9"
  cover-accent: "#e6b878"
  cover-muted: "#b5c6c1"
  action-text: "#fff"
typography:
  display:
    fontFamily: "'IBM Plex Sans', Arial, sans-serif"
    fontSize: "clamp(44px,6.8vw,92px)"
    fontWeight: 600
    lineHeight: 1.14
    letterSpacing: "-.045em"
  headline:
    fontFamily: "Plex, 'Microsoft YaHei', sans-serif"
    fontSize: "clamp(32px,4.5vw,58px)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.03em"
  story-body:
    fontFamily: "'IBM Plex Sans', 'Microsoft YaHei', sans-serif"
    fontSize: "18px"
    lineHeight: 1.7
  navigation:
    fontFamily: "Plex, 'Microsoft YaHei', sans-serif"
    fontSize: "14px"
rounded:
  wb-radius: "4px"
spacing:
  wb-inset: "clamp(20px,6vw,86px)"
components:
  button-primary:
    backgroundColor: "{colors.wb-ink}"
    textColor: "{colors.action-text}"
    rounded: "{rounded.wb-radius}"
    padding: "12px 20px"
---

# Design System: Weatherbridge

## Overview

**Creative North Star: "Dark-teal cover, warm-paper stories"**

Weatherbridge opens with a restrained, pure dark-teal cover and three independent SEE / NEED / USE story entries. Stories, evidence, and action occupy warm-paper surfaces, with a shared Weatherbridge / About / Sources / language header. Existing fonts, logo, photographs, illustrations, and case icons remain the visual vocabulary.

Understanding unfolds through story steps and optional explanations. The action experience is a real fixed-camera, lowpoly Three.js courtyard with visible decisions and consequences. This document records implemented styles, not a proposed refactor or a new chart standard.

**Key Characteristics:**

- Dark-teal entry and warm-paper reading surfaces.
- Shared navigation and retained bilingual typography and assets.
- Progressive disclosure with a real courtyard decision experience.

Source snapshot: 2026-10-05. Inspected `public/site.css`, `src/cover.css`, `src/story.css`, `src/game.css`, `public/signals/explore/explore.css`, and `public/journey.css`, plus current markup, shared header, and scene code. Frontmatter extracts reusable values; it does not imply that every literal is an existing CSS variable. Browser verification was outside this documentation pass.

## Colors

Primary: `wb-ink` supplies interior text and filled actions; `wb-accent` supplies emphasis, current story steps, and shared focus outlines. Cover emphasis uses `cover-accent` against `cover-background`, with `cover-text` and `cover-muted` supporting the hierarchy.

Neutral: `wb-paper`, `wb-muted`, and `wb-line` form the shared interior shell. Guided evidence retains its existing journey palette internally: paper (`#f4f1ea`), light (`#faf8f3`), ink (`#243d3b`), teal (`#167c77`), and orange (`#bb5738`). Advanced exploration maps its shell to the shared variables while retaining actual (`#167c77`) and market (`#a94b2e`) encodings.

**The Chart Context Rule.** Legacy charts retain renderer-specific styles and semantic encodings; their palettes and controls are not a new universal standard.

## Typography

Retain IBM Plex Sans and the current local WOFF2 assets. The shared stylesheet registers the `Plex` alias at weights 400 and 600; cover and story modules retain the `IBM Plex Sans` family name through their existing font imports. Preserve Chinese fallbacks rather than substituting a new typeface.

The frontmatter display role describes the cover; headline describes shared informational pages. Story titles use `clamp(27px,3.5vw,44px)` with a 1.25 line height; story step headings use `clamp(26px,3vw,40px)` with a 1.3 line height. Captions and story navigation are generally 13px, explanations 15px. Shared leads are 19px with a 58ch limit; disclosures cap at 75ch. Journey body text remains 17px / 1.55. These are surface-specific roles, not a uniform mathematical scale.

At 640px and below, the cover display becomes `clamp(34px,9vw,52px)` and shared leads become 16px. Story step headings become 29px and intros 16px at 650px and below. Preserve complete phrases in both languages.

## Layout

The shared header is a flex row with a 76px minimum height, 14px vertical padding, and the shared fluid inset. Navigation moves right, followed by the language buttons. At 640px it wraps, uses a 66px minimum height, and reduces brand and navigation text. The header is shared across current routes; old journey and landing navigation selectors are not a second navigation system.

The cover is centered within 1250px, with a three-column linked case path and an 80px top gap. It ends after the story entries. At 640px the path becomes a vertical sequence, its circles shrink from 128px to 92px, and the top gap becomes 44px. The cover minimum height is `calc(100dvh - 76px)`.

Shared informational pages cap at 1120px; story, action, and advanced exploration surfaces at 1240px. Story imagery and copy use a `1.08fr 1fr` grid with a 48px gap; imagery is 350px high. At 650px the grid stacks with a 24px gap and 230px imagery. Field observations also collapse to one column.

The desktop courtyard is 620px high. Above 850px, the scene reserves 380px for the 340px decision overlay and its surrounding space. At 850px and below the overlay follows the 360px scene in normal flow; at 400px the scene is 290px high. Guided comparisons stack at 760px; history tables retain a 620px minimum width inside a horizontal scroll container. These observed breakpoints remain local to their surfaces.

## Elevation & Depth

Reading surfaces rely mostly on paper tones, whitespace, and thin dividing rules. Story image overlays use `0 4px 22px #183e3a22`; the courtyard decision panel uses near-opaque warm paper (`rgba(248,247,240,.96)`) with a border. Neither establishes a universal raised-card system.

The courtyard's depth comes from actual Three.js geometry, flat-shaded rough materials, and directional shadows. Its orthographic camera remains fixed at `(10,10,12)`, looking at `(0,1,0)`. It is not an orbit-controlled viewer or an image pretending to be a scene. The retained household illustration is the fallback when text mode or a rendering failure requires it.

## Shapes

Shared actions and language controls use the small `wb-radius` corner. Reading sections and the courtyard panel remain predominantly rectangular. Circular cover entries and the circular brand image are deliberate exceptions. Thin rules organize disclosures, story progress, and comparisons. Existing journey fields retain 3px corners and range bars 8px corners; these are local component shapes.

## Components

- **Shared header:** Weatherbridge identity, About, Sources, then Chinese/English buttons. The selected language uses `aria-pressed` and a current-color border. Links preserve language. Keep the existing logo asset; the sidecar navigation preview isolates only the text/action portion.
- **Primary action:** dark ink fill, white text, small corner, and a 48px minimum height. No custom shared hover fill is defined. Story Continue/Finish actions use 13px 20px padding and 15px text; Back is an unfilled text button. Shared buttons have a 44px minimum height.
- **Story progress:** equal-width buttons above a bottom rule, with a 3px rust underline, ink text, and weight 600 on the current step. Copy updates through a polite live region. Supporting Why, sources, field observations, and hedging explanations use native disclosures.
- **Disclosure:** a top rule with a padded, semibold summary; explanatory copy uses muted ink. Sources and limitations remain accessible without crowding the story's immediate decision.
- **Courtyard choices:** paper-filled rectangular buttons with a thin border, at least 44px high; hover uses `#e2ece5`. The second-choice group is a two-column grid. Pause, text mode, restart, and debrief support the staged experience.
- **Evidence controls:** retain the journey select, segmented unit control, date/history interactions, and renderer-specific advanced chart controls. Guided markup removes comparison cards' colored left borders and softens section dividers; do not infer current appearance from `journey.css` alone.

**The Shared Shell Rule.** Use the shared Weatherbridge / About / Sources / language header on current routes; preserve language and selected evidence context across navigation.

The Mexico historical example now passes through the Polymarket introduction before Guided view, preserving selection. This route correction changes no layout or tokens.

Focus is visible: shared links, buttons, summaries, and selects use a 3px rust outline offset 4px. Cover buttons, links, and summaries override this with gold and a 6px offset. Journey's earlier blue focus rule is superseded by the later shared stylesheet on current Guided pages. Cover case circles scale to 1.04 on hover over .2s; story image filtering transitions over .3s. Reduced-motion CSS removes transitions and animations; the courtyard starts paused under reduced motion and offers manual pause. Exact extensions are recorded in the sidecar.

## Do's and Don'ts

- Do retain the existing fonts, identity assets, photographs, and illustrations.
- Do keep the cover focused on the connected SEE → NEED → USE story entries.
- Do reveal technical explanation progressively while keeping sources and limitations accessible.
- Do preserve language and selected evidence context across navigation.
- Don't promote retained renderer-specific chart styles into a universal standard.
- Don't replace the real courtyard scene with a decorative screenshot or an orbit-controlled viewer.
- Don't invent palette ramps, typography scales, hover states, or layout tokens absent from the implementation.
