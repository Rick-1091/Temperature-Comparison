# Weatherbridge scoped remediation · 2026-10-18

Historical record: the chart removal and warm-paper-only visual direction below were superseded by the user-approved restoration on 2026-10-20. See `restoration-2026-10-20.md` and current `DESIGN.md`. The interval, weather parsing, settlement and simulation corrections remain in effect.

## Scope and branch

Based on latest fetched `origin/main`, `1aee60740e72fd9002473d38d7e66546b8b1ae42`.
Branch: `codex/weatherbridge-scoped-remediation-20261018`.
This is a local implementation, not an upload, merge or deployment.

The Impeccable distillation playbook guided removal of duplicate surfaces; frontend-ui-standards guided shared tokens, controls and responsive composition. The optional Impeccable engine was unavailable, so no automated Impeccable score is claimed.

## Issue coverage and files

| Issue | Change | Primary files |
|---|---|---|
| Open temperature intervals | Retired midpoint lines, 3D tracks, merged-bin heatmap and area. The standalone explorer now retains only the daily interval comparison. Original low/high null boundaries remain untouched. ≥26°C displays as ≥78.8°F, never as an exact predicted temperature. Event identity includes date, native unit and both bounds. | `public/signals/src/app.js`, `public/signals/src/interval-model.js`, `public/signals/explore/index.html`, `public/signals/explore/explore.css` |
| TS mistaken for rain | Separate rain / drizzle and thunder descriptors; unknown present weather and unavailable measurements remain null. Recompute correlations with pairwise finite values. Count routine METAR reports, not deduplicated hours or rainfall amounts. | `src/weather-report-model.js`, `src/weather-network.js` |
| Unsupported homepage positioning | Replace the title and subtitle in both languages. No better-forecast promise or claim that public market data makes the entire market open-source. | `index.html`, `src/remediation.css` |
| CME / observation confusion | Mechanism comparison names trading target, period, price meaning and settlement. Left chart is NWS observations, not CME prices or final settlement. Preserve the report’s integer daily CDD and monthly total 435. No new CME series or normalization. | `src/market-comparison.js` |
| Observation / settlement mismatch | Preserve July 2 NWS 104°F and saved paying market range 102–103°F. Show a nearby warning when a verified paying range excludes the NWS high. Never rewrite either record. Explain fixed archives, quote cutoff, source precision and separate event rules. | `src/market-comparison-model.js`, `src/market-comparison.js` |
| Conflicting embedded state | Remove the iframe and duplicate archive controls. A single independent history link carries location/day/unit/language. The standalone page owns filters, readings, market/source links and URL persistence. | `src/journey-app.js`, standalone explorer files |
| Fictional platform identity | Rename the simulated panel Teaching rain market and its entry View simulated market signal. Clearly label fictional prices/trends and the pedagogical price/draw correspondence. Remove pre-choice optimal-plan advice; scenario averages appear only after the result in a secondary disclosure. | `src/decision-diorama.js` |
| Contract terms | Before purchase, aligned columns show cost, exclusive weather trigger, payout, net if triggered, zero payout and nonrefundable cost otherwise. Payment is not based on crop damage. Rename work-delay amounts as drying value forgone. | `src/decision-diorama.js`, `src/simulation-reference.js` |
| Overloaded result | One same-weather, same-plan comparison: no contract versus the purchased contract (or one clearly labeled hypothetical if none was bought). Signed numbers, no absolute-value net bars. Ledger, sunny baseline gap, other weather / preparations and averages are secondary. Text mode removes the large image placeholder. | `src/decision-diorama.js`, `src/remediation.css` |
| Overlong homepage | Main path is purpose → Malawi → mechanisms → July records → maize exercise → short recap. Jinxi, Mexico business map/timeline, weather network and earnings preprint move intact to the existing research page. Old case links resolve there. | `index.html`, `research/index.html`, `src/research.js`, `src/research-examples.js`, `cases/jinxi/index.html`, `cases/mexico-city/index.html` |
| Stale chart-method copy | Remove documentation of retired tolerant curves and explain open boundaries and native-unit membership. | `public/signals/methods/index.html` |

The economic model and 3D scene implementation were deliberately not changed. Neither July source JSON file was changed. Existing loss parameters, weather probabilities, contract triggers and payouts are preserved. Starting a new random round clears known-weather replay and retains the selected scenario; inspecting information never changes the drawn weather or cash flow.

## Weather parse sources and recalculation

Official references checked:

- [NWS METAR decoding](https://www.weather.gov/lzk/metar.htm): RA/DZ precipitation codes versus TS/SH/FZ descriptors.
- [NWS TDL Office Note 00-1](https://www.weather.gov/media/mdl/TDL_OfficeNote00-1.pdf): weather-code table distinguishes TS / VCTS from rain / drizzle.

| Sample | Routine reports | Old rain count | Corrected reports containing rain/drizzle | Unknown weather in saved sample |
|---|---:|---:|---:|---:|
| MMMX | 236 | 18 | 4 | 0 |
| KLGA | 240 | 64 | 64 | 0 |

No rain code means no RA/DZ reported, not proof that the station was dry. Unknowns are covered by synthetic parser fixtures even though these saved samples contain none.

Corrected MMMX rain correlations: temperature −0.0209, humidity +0.0865, wind +0.1020, pressure −0.0202, cloud +0.1633, visibility −0.1786. None reaches the displayed |r| ≥ 0.3 threshold, so no rain link remains in that sample.
KLGA rain links meeting the threshold: humidity +0.6753, pressure −0.7356, cloud +0.6669, visibility −0.7515. All use 240 valid report pairs. These are sample associations, not causal estimates.

## Actual validation

- `node scripts/verify-market-data.mjs`: PASS — 31 days, 435 CDD, 341 pre-midnight prices; settlement separate; unlicensed futures data excluded.
- `node scripts/verify-decision-accounting.mjs`: PASS — 27 independent default-scenario fixtures and all 81 scenario/preparation/weather/contract combinations; exact sampling frequencies, premiums, payouts and ledgers.
- `node scripts/verify-remediation.mjs`: PASS — both open-interval dates, °C/°F labels, date/bound identity, native membership, TS/RA/DZ/vicinity/unknown/missing cases, pairwise correlations, July 2 mismatch and unchanged 435 total.
- `node scripts/verify-market-ui.cjs`: PASS — production preview, Chinese/English, 1440/390/360px; keyboard focus and interval selection; no document overflow; source/reading/filter/URL agreement after switching city/day/unit and reload; relocated examples/network; failed NWS or market response and retry; missing market day; 12 bilingual known-weather financial fixtures.
- Same browser suite: PASS — software WebGL rendering, non-reduced-motion preparation / purchase / heavy-rain reveal, correct net −77.6, new random round behavior, compact text mode, and a complete English 360px flow with WebGL deliberately unavailable. No page errors were reported.
- After final CSS alignment: targeted browser checks passed for both signed amounts sharing the same vertical position at 360/390/1440px in both languages. Updated result screenshots were saved.
- Production build: PASS. Existing Three.js chunk remains about 569 kB with Vite’s chunk-size warning. No lint/typecheck script exists; no lint/typecheck pass is claimed.
- `git diff --check`: checked before local handoff. Local design-review artifacts and QA browser caches are not project changes.

The seven requested reference values are unchanged: dry/store/no contract −5; its sunny full-drying comparison gap 29; light/shelter/no contract +11.5; light/shelter/light contract +37; heavy/shelter/no contract −86.6; heavy/shelter/light contract −91.1; heavy/shelter/heavy contract −77.6.

## Screenshots

Local ignored screenshots live in `.cache/decision-qa/remediation/`:

- `hero-1440-zh.png`, `hero-360-zh.png` (also English).
- `study-1440-zh.png`, `study-360-zh.png` (also English).
- `explorer-1440-zh.png`: both September ≥26°C ranges visible.
- `signal-1440-zh.png`, `contract-1440-zh.png`.
- `result-360-zh.png`, `result-390-zh.png`, `result-1440-zh.png` (also English).
- `webgl-fallback-360-en.png`: complete WebGL-failure result.

## Limits / manual review

- Phone widths were tested in desktop Chrome emulation, not physical iOS / Android devices. Touch behavior and device-specific WebGL performance still need hardware review.
- WebGL runs used Chrome software rendering; no discrete/mobile GPU performance claim is made.
- NWS coding references were accessible. The live Render page and July 2 Polymarket page timed out through the retrieval tool; this round validates the local latest-main implementation and saved data, not an independently re-audited live deployment or full event-resolution history.
- The cause of the July 2 mismatch was not established. Do not attribute it to rounding. Per-event source finalization / revision details should be checked against archived original rules before making a stronger reconciliation claim.
- No CME pricing, licensing, market-accuracy ranking or external financial recommendation was added.
- This task stops at this bounded local remediation. No automatic deployment, GitHub upload or main merge.
