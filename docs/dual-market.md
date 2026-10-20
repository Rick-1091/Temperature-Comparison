# Dual-market weather comparison

> Historical implementation record. Current layout, five-view semantics and color roles are documented in [restoration-2026-10-20.md](./restoration-2026-10-20.md) and DESIGN.md. The standalone explorer replaces the embedded archive. July numeric data and economic parameters remain unchanged.

The July 2026 LaGuardia case compares two market mechanisms while keeping their measurements separate. The existing story, historical samples and decision diorama remain in the same journey.

## Reading and interaction

- CME appears left / first; Polymarket appears right / second. Four keyboard-accessible comparison tabs update both descriptions together.
- The research area defaults to Overview. The date slider and cumulative-chart day selection update both market records. CME and Polymarket views expand the corresponding research.
- The former September temperature comparison, hit-rate plots and five advanced chart views remain in the Polymarket archive, explicitly dated separately from July. The original October 4 introductory quote example is also retained there.
- Blue identifies CME-related index observations; teal identifies Polymarket quotes. Every graph retains its variable, unit and provider label. The NWS curve never represents a futures price.

## Verified data and provenance

`public/signals/data/laguardia-july-2026-cdd.json` contains the 31 daily MAX, MIN, AVG and CDD columns transcribed from the NWS CF6 LGA July 2026 report, identifier `#FINAL-07-26#`, verified on October 18, 2026. Published daily CDD sum to 435 °F·day. The NWS report's rotating `version=4` URL is included with a warning that versions roll over. The local numeric snapshot preserves the retrieved month. This is not an authenticated CME / Speedwell final settlement series.

`public/signals/data/laguardia-july-2026-markets.json` contains 31 Gamma events and 341 outcome quotes retrieved from Polymarket's official APIs. For each outcome, the price is the last available five-minute CLOB sample within 24 hours strictly before local midnight (04:00 UTC, EDT). The last sample timestamp is preserved. Each history retains up to eight evenly spaced original samples, including first and last; it is not a complete or trade-by-trade series. No normalization is applied.

Each outcome retains its market ID, Yes token, history URL, original timestamp, sample count, settlement price and resolution-source link. Closed-market settlement values are displayed separately from pre-event quotes. The July events specify Weather Underground KLGA observations; these are not assumed identical to the NWS CF6 daily maximum.

Official references:

- NWS report: https://forecast.weather.gov/product.php?format=txt&glossary=0&issuedby=LGA&product=CF6&site=MSO&version=4
- CME degree-day methodology, station WBAN 14732 and Speedwell settlement: https://www.cmegroup.com/rulebook/CME/IV/400/403/403.pdf
- Example event: https://polymarket.com/event/highest-temperature-in-nyc-on-july-21-2026
- Historical price endpoint: https://docs.polymarket.com/api-reference/markets/get-prices-history

## Future CME prices

No CME trading prices, volume, open interest or verified final settlement have been acquired for this case. The UI provides a missing-data state; it does not fetch or invent CME prices. `admittedFuturesHistory` in `src/market-comparison-model.js` defines the admission boundary for a future package:

```js
{
  status: 'available',
  redistributionApproved: true,
  station: 'KLGA',
  contractMonth: '2026-07',
  quoteType: 'settlement', // or trade / bid / ask; explicitly label it
  sourceUrl: 'verified provider URL',
  records: [/* {date: 'YYYY-MM-DD', indexPoints, volume, openInterest} */],
  finalSettlementIndex: null,
  settlementSourceUrl: null
}
```

The package requires verified provenance and permission for public redistribution. Pass an admitted package as `initMarketComparison(language, {futuresHistory: package})` to activate the prepared price renderer. It uses trade dates and index points, labels the quote type, exposes volume and open interest (null if unavailable) in point details, and identifies any verified final index independently of the NWS monthly total. Provider acquisition and licensing are still required; filling the NWS total into this package as a price or final settlement is invalid. No package is supplied in the live page.

The diorama continues to use simulated rain contracts. Its contract explanation states that payout depends on the specified location, metric and period; a New York temperature contract does not pay merely because Malawi experiences rain.

## Checks

Run `node scripts/verify-market-data.mjs`, `node scripts/verify-decision-accounting.mjs`, and `npm run build`. The package does not define lint or typecheck commands. `scripts/verify-market-ui.cjs` provides browser regression checks using an available Playwright installation and browser; set `WEATHERBRIDGE_PLAYWRIGHT` and `WEATHERBRIDGE_BROWSER_EXECUTABLE` to their existing paths, and optionally `WEATHERBRIDGE_PREVIEW_URL` to a running preview. The application adds no Playwright runtime dependency.

Completed on October 18, 2026: production build; numerical checks for the 31 daily observations and 341 pre-midnight quotes; existing 27 accounting fixtures and 81 scenario combinations; browser checks at 1440, 768, 390 and 320px in Chinese and English. A blocked market-data response was retried successfully while the observation plot remained usable. A light-rain / keep-drying / light-contract diorama run reached its expected +18.5 net result. No page errors were reported in these runs. Vite retains the existing Three.js chunk-size warning; no lint or typecheck success is claimed.

## Files in this extension

Modified: `index.html` (comparison, research and preserved archive), `src/journey-app.js` (initialization), `src/decision-diorama.js` (location / indicator / period explanation), `DESIGN.md` (implemented surface record).

Additional hardening touches `src/page-language.js` (URL language persistence) and `public/signals/src/app.js` (initial chart / tab agreement). The archive now promotes its iframe to eager loading once opened and carries the selected chart view into unit or language navigation.

Added: `src/market-comparison.js`, `src/market-comparison.css`, `src/market-comparison-model.js`, `public/signals/data/laguardia-july-2026-cdd.json`, `public/signals/data/laguardia-july-2026-markets.json`, `scripts/verify-market-data.mjs`, `scripts/verify-market-ui.cjs`, and this document. Earlier uncommitted readability fixes were preserved. Browser profiles and screenshots are local ignored QA artifacts. Publication status is recorded in the associated GitHub pull request; these checks do not imply deployment.

## Requirement coverage and remaining dependency

| Brief requirement | Implemented behavior |
|---|---|
| Balanced market introduction | CME left / first, Polymarket right / second; matching hierarchy and native details. |
| Four synchronized dimensions | Target, period, price meaning and settlement update both columns; keyboard navigation included. |
| Shared July LaGuardia case | One fixed location / month and shared study date; no non-working location selector. |
| Real CDD observations | All 31 NWS daily values and their cumulative sum, 435 °F·day; explicit provider and observation label. |
| Polymarket records | All 31 events, 341 pre-event snapshots and sampled histories; final payouts and NWS highs labeled separately. |
| Preserve historical charts | Original interval, trend, 3D-track, heatmap, area and accuracy views remain available in the dated archive. |
| Honest CME missing state | No invented series or public CME fetching. A verified-data adapter and price renderer are reserved. |
| Connect to decisions | Forecasting / pricing / hedging explanation and the diorama’s location / metric / period limitation. |
| Minimal responsive interface | Two semantic colors, thin rules, one view switch, native disclosures; no new shadowed card stack. |
| Robust interaction | Independent requests, 12-second timeout, retry, partial failure and missing-day state; chosen date and expanded records preserved. |

The only remaining data dependency from the brief's future phase is a verifiable CME trading-price package with public-display permission and, if shown, a separately verified CME final settlement index. It cannot be supplied by relabeling NWS observations. No application work here implies that such data has been acquired or licensed.

## Follow-up hardening · October 18, 2026

- Each source now loads independently, with a 12-second request timeout and an explicit retry. A successful side remains usable while the other is pending or unavailable. Changing the study date during a slow request is retained after completion or retry. Both sources failing produces a genuine empty state, without claiming that the other side is available.
- Open method / record / source disclosures survive language changes and asynchronous completion; focused controls are restored when the dashboard rebuilds. The chosen language is written into the URL, so reloading an explicit `lang=zh` link after switching to English no longer silently reverts it.
- Once the historical archive is opened, its iframe is loaded eagerly. Previously a requested unit could change in the outer controls while the inner document retained the prior unit. The selected chart view is now carried into unit and language navigation.
- The advanced renderer now updates tab selection on every render, including its initial URL-selected view. Previously the graph could correctly render an area or heatmap view while the static markup still highlighted the first tab.
- Runtime data checks reject incorrect observation units, malformed outcome records, repeated labels, nonnumeric settlement payouts, out-of-order samples, and quote snapshots inconsistent with the last sample. Original validated data remains unchanged.

The browser suite additionally exercises all five historical views, language persistence after reload, preserved disclosures, slow requests, timeout recovery, failure of either source, missing study dates, and 27 full diorama UI results (three preparations × three contract choices × three weather outcomes). These UI fixtures use independent expected numbers in addition to the model-level 81-combination check. CME data acquisition / permission remains the external dependency above; no market curve was invented to close it.
