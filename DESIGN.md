---
name: Weatherbridge
description: A bilingual weather decision story with colorful chapters, historical interval exploration and an interactive courtyard.
colors:
  chapter-blue: "#1965e9"
  chapter-yellow: "#f7ba3a"
  chapter-teal: "#38bbb3"
  chapter-purple: "#783de8"
  paper: "#faf7f2"
  ink: "#193d37"
  observation: "#167c77"
  market-quote: "#b84b34"
  cme-identity: "#285b96"
  polymarket-identity: "#167970"
---

# Weatherbridge design — current authority, 2026-10-20

## Definitions remain independent — 2026-10-21

Market definitions, mechanism comparison and historical research are separate reading tasks. The pre-CME `453010d` Polymarket definition chapter is restored as `#polymarket-definition`, including the original October 4 price example, $1/$0 settlement explanation, non-vote-count explanation and sources. Its renderer and original colored presentation are reused. `signals/introduction/` resolves to that definition again. The mechanism comparison follows in `#market-comparison`, before July research.

A future CME/weather-futures definition belongs at the same chapter level, with matching explanatory depth; it must not replace this restored chapter. The user requested a research prompt before that further page is implemented; see `docs/gpt-weather-market-definition-prompt.md`. The existing concise CME overview and contract-rule disclosure remain available.

## Advanced explorer appearance correction — latest user direction

The user rejected the newly drawn explorer and requested the original appearance. The advanced explorer now directly reuses the `453010d` HTML, CSS, icon tabs, four-column readings, floating quote chooser, selection glass, drag handling and SVG renderer. This takes precedence over the newly drawn explorer descriptions below. Finite market points represent explicitly identified geometric interval midpoints; open intervals use arrows and break the connecting line. Heatmap uses valid whole-bin quote sums; area retains the original multicolor group palette with semantically correct daily steps. The homepage and courtyard are unchanged by this visual rollback.

The user selected preservation of the pre-CME visual identity (453010d) while retaining the accurate dual-market research extension (1aee607) and subsequent semantic fixes. This document supersedes the warm-paper-only direction recorded in the October 18 remediation.

## Identity and reading path

Keep the blue opening, yellow Malawi dilemma, teal Mexico business example, purple market introduction and purple decision courtyard. Existing illustrations, photographs, map, timeline and real Three.js scene carry the story. Paper plotting and reading surfaces sit inside the colored chapters. Generous spacing, self-hosted Plex typography and brief bilingual headings support the continuous reading path.

The homepage presents an approachable New York historical study. A sticky shared header includes Advanced exploration and Research & Data. A visible study link carries historical location, date, unit and language to the standalone explorer. July New York records and September airport samples remain separate cases. The independent explorer owns its own filters, chart context and URL state; no embedded explorer duplicates homepage state.

## Five historical views

- Daily comparison: teal observed dots and coral highest-priced native intervals, with arrows for open bounds.
- Time trend: observed line and daily interval band. No synthetic open-bin midpoint.
- SVG 3D dual track: front observed line/points, back native market intervals; labeled temperature, local dates and track identities. View angle control and reset are local to this SVG view. Projected distance has no error meaning.
- Heatmap: shared groups made exclusively from complete original outcomes; color and printed values encode sums of Yes quotes in cents, not a single contract price.
- Area: daily stepped relative quote weights, group sum divided by that day's total; no smoothing or temperature overlay on the percentage axis. Missing totals leave a gap.

Original labels, native boundaries including nulls, quote timestamps, dates and raw prices remain inspectable. Unit conversion changes labels, not native membership. Incomplete partitions produce an unavailable grouped view instead of inferred data. Charts keep legible dimensions on narrow screens with contained horizontal scrolling and visible guidance.

## Four distinct color roles

Chapter backgrounds carry the narrative. CME deep blue and Polymarket deep teal identify providers in headings and column accents. Teal observations and coral quotes carry consistent data meaning across the historical explorer and July plots. Selected states use outlines or pale fills; selection never changes a datum's identity. Grouped quote weights use a coral sequential ramp with explicit interval labels.

Main illustrations/panels may retain fine black borders and small offset shadows. Ordinary buttons, tables and secondary containers use quieter thin rules, modest corners and visible focus indicators. Avoid blanket theme overrides that erase chapters.

## Scientific and financial meanings

NWS cumulative CDD is an observation used to explain a weather index; it is neither CME prices nor verified CME settlement. Preserve the original report's 435 monthly CDD. No unverified or unlicensed CME series is invented. Historical Polymarket quotes, resolved outcome ranges and weather observations are distinct records; July 2 retains both 104°F NWS high and the saved 102–103°F paying range, with a nearby explanation.

Rain parsing distinguishes TS from observed rain, RA/DZ from missing/unknown codes, and report counts from hours or precipitation amounts. Correlations use valid pairs and are descriptive.

## Courtyard and interaction

Retain fixed-camera geometry, shelter, storage, carrying, weather and financial animations. Fictional information is labeled Teaching rain market / View simulated market signal, with the price-to-weather-draw assumption identified as a teaching setting. Signal viewing changes no weather, reward or payout.

Purchase terms show cost, exclusive trigger, payment and zero payment/nonrefundable cost otherwise; light rain excludes heavy rain. Net result equals actual drying benefit minus crop loss, preparation cost and contract cost plus contract payment. Drying value forgone is already reflected in actual benefit. The default result compares buying versus not buying under identical weather and preparation, with detailed calculations secondary.

The compact text fallback completes the same decisions and results when WebGL is unavailable. Known-weather replay and a new random round remain distinct.

## Verification and scope

Check Chinese and English, keyboard focus, desktop and 390px, both cities, both units, open September 23/25 intervals, reloadable state, missing data, retries, all 81 simulation combinations and WebGL fallback. Evidence and before/after screenshots are listed in docs/restoration-2026-10-20.md. No deployment or main merge is part of this round.
