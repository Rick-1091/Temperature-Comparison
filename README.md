# Weatherbridge

A bilingual, continuous weather-information journey.

## Demo video

[![Weatherbridge demo video](https://img.youtube.com/vi/J4l93IC2vnM/hqdefault.jpg)](https://youtu.be/J4l93IC2vnM)

## Current architecture

`/`: Hero → Jinxi → Malawi → Mexico City → Polymarket → historical evidence → inline Three.js courtyard → inline reflection → final takeaway.

The header contains the brand and language switch, not a story directory. The hero has one primary action. Sources, methods, raw APIs and advanced charts are secondary depth under `/research/`. About remains in the footer.

Former case, introduction, guided-evidence, exercise and debrief routes redirect to corresponding main-page anchors while preserving query parameters. Valid historical debrief choice/weather parameters restore the inline four-way comparison. Original story/controller modules remain unbuilt migration sources.

## Run and deploy

```sh
npm ci
npm run dev
npm run build
npm run preview -- --host 127.0.0.1 --port 8017
```

Render: build `npm ci && npm run build`, publish `dist`. Production builds copy public research/legacy chart assets and emit legacy Jinxi photo assets. Verify the production preview, not only development routing.

## Data and boundaries

Immutable archived snapshots cover September 19–27, 2026 for MMMX and KLGA. NOAA/AviationWeather METAR/SPECI reports are grouped by airport-local date, requiring at least 20 reports spanning 20 distinct local hours. The highest reported temperature is not an authoritative official daily TMAX or necessarily the market's settlement temperature.

For each Polymarket Yes outcome, the saved quote is the latest available in the 24 hours strictly before local midnight; CLOB query fidelity is five minutes. Actual quote timestamps can differ. Evaluate interval membership using rounded market-native temperatures, independent of the user's Celsius/Fahrenheit display preference.

The main page uses actual historical values, not authored decimals. Price bars compare raw Yes quotes and are not normalized to 100%. The five-bin introductory example is explicitly illustrative. Nine days describe a short history, not proven forecasting skill.

Jinxi photographs come from field observations. Thoko and Diego are fictional. The courtyard uses independent synthetic rain/sun outcomes; it does not consume the airport temperatures, live Malawi forecasts or market quotes. It qualitatively compares exposure, protection and drying opportunity, not food safety, yields or economic losses. Official local forecasts and warnings take priority. Hedging requires matching location/date/variable/settlement as well as eligibility, liquidity, cost and basis risk.

## Verification

```sh
node scripts/verify-guided-data.mjs
node scripts/verify-journey.cjs
```

Browser checks require Playwright and Chrome; set `WEATHERBRIDGE_PLAYWRIGHT` and `WEATHERBRIDGE_BROWSER` to their installed locations when necessary. Artifacts and browser profiles stay in ignored `.cache/` on the project drive.

The journey suite covers 1522/1440/768/390/320px, both languages and display units, city/date comparisons, eight exercise outcomes, reduced motion, text fallback, restart, research and seven deep-link migrations. The older `verify-refactor.cjs` describes the retired multi-page UX and is not the current acceptance suite.

Automated checks and developer walkthroughs do not replace testing with novice users. Three.js remains a separately lazy-loaded chunk; Vite's large-chunk warning refers to that engine, not the initial journey controller. See DESIGN.md and docs/journey-refactor.md for the current design and migration record.
