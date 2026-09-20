# Polymarket Climate Viz

Local static prototype for comparing daily Polymarket temperature market modes with Central Park daily highs on a shared time axis.

## Case

- Market: highest temperature in NYC market on Polymarket
- Truth source: NOAA Daily Summaries, Central Park station `USW00094728`
- Metric: daily maximum temperature, Fahrenheit
- Polymarket signal: default highest-priced temperature outcome bucket before settlement, with a selectable illustrative distribution per day; the selected bucket is plotted by its midpoint
- Views: daily paired points, two time-series lines, an interactive projected 3D view (time × temperature × data source), a temperature-by-date heatmap, and a smooth stacked area chart of seven illustrative outcome shares (each date totals 100%). The heatmap and area chart can both show the final NOAA observation. The area chart uses equal-width date columns, including the first and last dates, and places actual °F readings on a separate marker rail above its percentage axis. It supports date-and-bucket selection.
- Flat views: draggable frosted acrylic date selector; selecting a day enlarges its data markers. Click the market prediction value or orange point to open the per-day distribution, then choose a different bucket to replace the plotted prediction.
- Location: the selector currently contains Central Park only; add future locations together with their own source-backed market and observation series.

## Open

Open `index.html` directly in a browser, or serve the folder with any static server.

The actual-temperature layer uses NOAA NCEI Daily Summaries `TMAX`, `units=standard`, station `USW00094728`. All 12 values for 2026-08-17–28 were retrieved from the official API and verified on 2026-09-20. An embedded **real-data snapshot** renders immediately and serves as an offline/CORS fallback; the page also attempts to refresh the same API on load and reports which path was used. The snapshot values in date order are `81, 86, 85, 84, 79, 77, 80, 79, 78, 81, 77, 84` °F.

The market buckets and every per-day market distribution are still **illustrative**, not verified historical Polymarket observations. The page labels the two layers separately, links the NOAA public API and one corresponding Polymarket NYC daily-high market (August 24, 2026), and warns not to interpret mixed-layer differences as real forecast accuracy. That single market link does not source all 12 displayed days. For research use, replace the market buckets and `marketShares` in `src/app.js` with fixed pre-settlement snapshots from each corresponding multi-outcome Polymarket market. Keep the outcome interval and plot its midpoint while displaying the full interval in the details. Heatmap intensity shows outcome share/probability, **not a count of people**. NOAA TMAX is an independent observation series; verify the market resolution source separately before claiming settlement equivalence.

## Hugging Face Static Space

Upload [`huggingface/index.html`](huggingface/index.html) and [`huggingface/README.md`](huggingface/README.md) to the root of a Static Space. The HTML is self-contained; after changing the source site, regenerate it with `node scripts/build-huggingface.mjs`.

