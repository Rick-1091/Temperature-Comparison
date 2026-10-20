# Preserve Weatherbridge design — implementation and verification

## Definition restoration and research handoff — 2026-10-21

Restored the original `453010d` Polymarket definition chapter as the independent homepage section `#polymarket-definition`, including the fixed October 4 Mexico City example, original chart renderer, settlement explanation and sources. Restored the legacy introduction URL to this section, preserved purple styling and full bilingual content, and kept the later mechanism comparison separate in `#market-comparison`. The previous currency wording change to cents/美分 is retained. The requested GPT research prompt defines a future CME definition page parallel to this original chapter; no CME prices are added.

Fresh pre-publication checks passed: market-data, decision-accounting (81 combinations), remediation/parser and exploration-model checks; production build (616 modules); intro-market provenance and UI (11 quotes, C/F, Chinese/English, 1440/390/320px, failure/reload and legacy route); transition, five-view explorer, full market/decision UI and study-footer checks. Software WebGL and forced-failure flows passed; physical-device touch/GPU and the Render deployment were not verified. Restored full-chapter screenshots: `.cache/intro-market-qa/definition-1440-zh.png` and `definition-390-zh.png`. Chart and quote-row keyboard focus recovery also handles deferred browser blur after key dispatch.

## Explorer audit fixes — 2026-10-21

Fixed the four reproduced audit findings. The legacy guided route now returns to daily exploration instead of the July homepage study; the link names that destination and retains location, day, units, language and selected original contract. Heatmap instructions now describe date selection without promising grouped-cell contract selection. SVG redraws and quote-row rebuilds preserve keyboard focus. English accessible names cover the explorer regions, view controls, legend and quote selector.

Fresh verification: `node --check public/signals/src/app.js`, `verify-exploration.mjs`, production build and `verify-exploration-ui.cjs` passed. Browser checks cover Chinese/English, 1440px/390px, both cities and all five views, state-preserving return navigation, Enter/Space focus retention, translated ARIA labels, missing-data retry and no page errors. Current screenshots remain in `.cache/decision-qa/original-explorer/`. No deployment or merge performed.

## Study footer layout correction

The study's scattered below-chart controls are now a single full-width resource footer with three aligned disclosure rows: observations/CDD method, exact quotes/settlement, and sources/comparison method. The CME-unavailable notice is compact; its explanation remains in the source disclosure. Advanced exploration keeps its state-carrying link with a shorter description. Advanced explorer appearance and the courtyard are unchanged.

Files: `src/market-comparison.js`, `src/market-comparison.css`, `src/remediation.css`, `index.html`. Fresh build and `run-restoration-ui.cjs scripts/verify-study-footer.cjs` passed: 1440px/390px, Chinese/English, three compact closed rows, keyboard expand/collapse, 31 observation rows, study-view switching, no horizontal overflow or page errors. Screenshots: `../.cache/decision-qa/study-footer/footer-1440-zh.png` and `footer-390-zh.png`.

## Latest correction: restore the actual original advanced explorer

After the user rejected the redrawn advanced chart appearance, the explorer was replaced with the actual `453010d` page, styles and interaction/renderer code. The original icon tabs, compact plotting workspace, four-column readings, floating original-quote panel, selection glass and drag controls are restored. The remaining sections below describe the preceding iteration; this correction supersedes their explorer appearance, DOM and rendering-file descriptions.

Necessary data patches remain local: immutable open bounds with arrows and line breaks, finite geometric midpoints labeled in tooltips, validated whole-original-bin grouping, raw quote sums in heatmap, daily steps/relative weights in area, no temperature overlay on percentage axes, native-unit membership and synchronized URL state. Raw quote selection also survives refresh. Missing grouped data displays an unavailable view; loading failure has a retry button.

Current files: `public/signals/explore/index.html`, `public/signals/explore/explore.css`, `public/signals/src/app.js`, the retained `interval-model.js`, and updated `scripts/verify-exploration-ui.cjs`. The rejected custom plotting helper was removed after checking it had no remaining imports.

Fresh checks passed: Node syntax check; `verify-exploration.mjs`; production build; `run-restoration-ui.cjs scripts/verify-exploration-ui.cjs`. Browser verification covers all five views in Chinese/English at 1440px and 390px, both cities, Sep 23/25 open intervals, both units, original quote panel, custom choice/reload, keyboard tab switching, 3D reset and loading failure/retry, with no page errors. Homepage, courtyard and economic parameters were not modified by this correction.

Current screenshots are in `../.cache/decision-qa/original-explorer/`, including `dumbbell-1440-zh.png`, `three-d-1440-zh.png`, `heatmap-390-zh.png` and `area-1440-zh.png`. The earlier comparison gallery remains a historical record of the now-rejected intermediate explorer.

User-approved direction: retain the five historical views, chapter palette, stories and decision courtyard; correct interval encoding without removing exploration.

Baseline: local remediation on `1aee607`, with uncommitted changes preserved. Fetched `origin/main` at `4fe8ca8` and fast-forwarded the work branch `codex/preserve-exploration-20261020`; upstream changes only affect `jinxi/README.md`. Design references `453010d` and `1aee607` are available locally.

## Implementation plan

- [x] Extend `public/signals/src/interval-model.js` with validated whole-bin grouping, missing-value propagation and raw-record preservation. Add `scripts/verify-exploration.mjs`; run failing assertions before implementation, then verify both datasets and open-bound dates.
- [x] Restore five SVG views in the standalone explorer, reusing the earlier dual-track projection and daily reading structure. Keep native interval membership; use interval bands, open arrows, grouped quote sums and stepped relative weights. Keep URL state, keyboard support and original quotes available.
- [x] Restore chapter colors and Mexico narrative through existing homepage components. Keep a visible advanced-exploration entry; maintain current semantic corrections and light chart surfaces. Do not restore conflicting iframe state.
- [x] Check existing weather parsing, July market semantics and simulation accounting; preserve correct code. Run the 81-combination accounting check and relevant browser flows.
- [x] Verify Chinese/English, desktop/390px, all five views, URL reload, missing data, retry and WebGL fallback; capture before/after screenshots and build.

## Boundaries

No deployment, push or main merge. No new CME prices, inferred open-tail distributions or probability claims. Existing local work and unrelated `.impeccable` files remain intact.

## Results

Completed locally on the named work branch. No upload, main merge or deployment was performed. Previous local remediation and unrelated files were preserved.

### Issue coverage

| Priority | Implemented result | Main files |
|---|---|---|
| Native intervals and five views | Original null bounds, labels, prices, quote times and date identity retained. Daily comparison and trend use bands; 3D uses interval posts/arrows. Sep 23/25 remain ≥26°C / ≥78.8°F. No open-tail midpoint is generated. | public/signals/src/interval-model.js, exploration-plots.js, app.js |
| Comparable groups | Verified complete native partitions for both cities. Mexico ≤23/24/25/≥26°C; New York ≤61/62–63/64–65/66–67/68–69/70–71/72–73/≥74°F. All group sums conserve source quotes. Missing prices/totals remain missing; incomplete partitions show an unavailable grouped view. | interval-model.js, verify-exploration.mjs |
| Heatmap and area meaning | Heatmap shows group sums in cents, with original-member prices/timestamps. Area uses daily stepped relative quote weight, with numerator/denominator details, no smooth interpolation or temperature overlay. Small raw prices retain precision, including 0.05 cents. | exploration-plots.js, app.js |
| State and discoverability | Five local tabs, date/location/unit/language URL state, synchronized readings and links, keyboard arrows, angle reset. Shared sticky navigation and the homepage study both expose Advanced exploration. Fixed the old homepage CSS hiding navigation and the development server directory-URL fallback. | public/site-header.js, public/site.css, explore/index.html, explore.css, src/journey-app.js, src/remediation.css, vite.config.js |
| Original visual identity | Blue hero, yellow Malawi, teal Mexico story/map/timeline/network, purple market and decision chapters; light plotting panels, quieter controls, original images and small panel shadows. Observations teal / quotes coral; provider heading colors remain distinct. | index.html, src/journey.css, src/remediation.css, src/market-comparison.css, src/research-examples.js |
| CME and settlement | Kept NWS CDD title, published monthly total 435, original 341 July quotes, distinct settlements and nearby July 2 mismatch warning. No CME prices added. | src/market-comparison.js, src/market-comparison-model.js |
| Weather and decisions | Retained TS/rain/missing parser and recomputed report counts. Preserved economic parameters and all 81 combinations, teaching-market identity, conditional contract terms and compact results/text fallback. Fixed an additional verified interaction bug: active carrying/payment/weather operations continue if the user scrolls away; idle offscreen rendering stays paused. | src/weather-report-model.js, src/weather-network.js, src/decision-diorama.js, src/decision-scene.js, src/simulation-reference.js |

### Actual verification

Commands used the existing Node runtime. Browser commands supplied the installed Playwright and Chrome paths through WEATHERBRIDGE_PLAYWRIGHT and WEATHERBRIDGE_BROWSER_EXECUTABLE.

- PASS: node scripts/verify-exploration.mjs — native open bounds; both complete partitions; price conservation; member provenance; missing values; unchanged native membership; small-quote precision. Its new assertions were observed failing before the corresponding implementation.
- PASS: node scripts/verify-market-data.mjs — 31 NWS days, 435 CDD, 341 original pre-midnight quotes; settlement separated; unlicensed CME history excluded.
- PASS: node scripts/verify-decision-accounting.mjs — 27 independent fixtures and 81 preparation/weather/contract combinations across three scenarios.
- PASS: node scripts/verify-remediation.mjs — Sep 23/25 open ranges, independent TS, RA/DZ, unknown codes, missing correlations and July 2 record mismatch. Mexico: 236 routine METAR reports, 4 with rain; New York: 240 reports, 64 with rain.
- PASS: node scripts/run-restoration-ui.cjs scripts/verify-scene-flow.cjs scripts/verify-exploration-ui.cjs scripts/verify-market-ui.cjs — current built pages. Five views, both cities, Chinese/English, 1440px/390px, native-unit membership, Sep 23/25 labels, keyboard focus, 3D angle reset, URL refresh, invalid-date repair, loading failure/retry and missing-data paths. Homepage additionally tested at 360px. July source failures/retry, known-weather bilingual outcomes, normal software WebGL carrying/cost/weather/result, mobile net-number alignment, and deliberately failed WebGL complete fallback all passed. No page errors.
- PASS: targeted development-server directory-route check — /signals/explore/ and /signals/methods/ serve their own documents rather than the homepage.
- PASS: vite build — 613 modules; existing Three.js 568.88 kB chunk-size warning remains.
- PASS: git diff --check — no whitespace errors; Git reports normal LF/CRLF conversion notices.
- PASS: capture-restoration.cjs — final chapter and navigation screenshots, with sticky header hidden only while stitching tall section captures. Normal navigation has its own unaltered viewport screenshot.

The offscreen animation regression was reproduced before correction: the preparation stayed busy at the first basket when its section was outside the viewport. The targeted regression then passed, including purchase, weather and final −77.6 result.

### Before / after evidence

[Open the side-by-side comparison](./restoration-comparison.html).

The “before” images are saved local October 18 remediation captures, not screenshots of today's online deployment. The “after” images are from the current build.

- Before homepage: ../.cache/decision-qa/remediation/hero-1440-zh.png
- After homepage: ../.cache/decision-qa/restoration/hero-1440-zh.png
- Before explorer: ../.cache/decision-qa/remediation/explorer-1440-zh.png
- After five-view explorer: ../.cache/decision-qa/restoration/three-1440-zh.png
- Restored colors/stories: ../.cache/decision-qa/restoration/malawi-1440-zh.png, mexico-1440-zh.png, mechanisms-1440-zh.png
- Phone navigation: ../.cache/decision-qa/restoration/navigation-390-zh.png
- Five-view and bilingual phone captures: ../.cache/decision-qa/restoration/
- Courtyard terms: ../.cache/decision-qa/restoration/contract-1440-zh.png

### Remaining manual checks and limits

- Browser mobile viewports were tested; physical phone touch/scroll and device GPU performance were not tested.
- WebGL was verified using Chrome software rendering, plus an intentionally failed context; hardware GPU coverage is still manual.
- The online Render URL could not be opened by the web tool, so this report makes no claim about the current deployed page.
- Independent reviewer could not complete because its usage limit was reached; the main agent reviewed the implementation and verification evidence.
- The optional Impeccable engine is absent. Its written guidance informed the restoration; no engine score or automated design audit is claimed.
- Sources and archived records were preserved; this round did not re-verify all historical external records or add CME data.
- Screenshot files live in the existing ignored F-drive project cache. Keep them with this local report when sharing the comparison page.
