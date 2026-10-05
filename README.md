# Weatherbridge
A bilingual course prototype: Story → Evidence → Action.

## Current journey
Cover → SEE / Jinxi → NEED / Malawi → USE / Mexico City → What is Polymarket? → Guided historical comparison → 3D food-drying courtyard → Debrief.

| Route | Purpose |
|---|---|
| / | Three connected story entrances; no competing chapter menu |
| /cases/jinxi/ | Field observations, expandable photographs and weather questions |
| /cases/malawi/ | Fictional Thoko household: information needs and preparation |
| /cases/mexico-city/ | Fictional business decisions; preparation before possible hedging |
| /signals/introduction/ | Authored price example; prices are not voter shares |
| /signals/guide/ | One historical day first, distribution next, nine days on request |
| /signals/explore/ | Five optional advanced SVG chart views |
| /signals/methods/ | Quote timing, units, interval membership and limitations |
| /signals/sources/ | Date-specific market, quote and archived observation evidence |
| /experience/food-drying/ | Three.js fixed-camera courtyard with four preparations |
| /experience/food-drying/debrief/ | Same-weather comparison, without a right/wrong score |
| /about/ | Project question, users and information equity |

## Run and deploy
```sh
npm ci
npm run dev
npm run build
npm run preview -- --host 127.0.0.1 --port 8017
```
Render: build `npm ci && npm run build`, publish `dist`.
Always test the production build: legacy Jinxi and NomadCast URLs are redirected in build output rather than exposed as chapters. Their original source is retained as migration material. Native signals pages under `public/` are copied without bundling.

## Evidence and boundaries
Both current airports use September 19–27, 2026 archived snapshots. NOAA Aviation Weather Center METAR observations are grouped by airport-local date; the maximum reported temperature is retained when at least 20 reports span at least 20 distinct hours. METAR maxima can miss peaks between reports and are not necessarily market settlement temperatures.

For each Polymarket interval, use the last available Yes quote within 24 hours before local midnight, sampled at five-minute intervals. Quote timestamps can differ. Celsius/Fahrenheit changes display only: rounded market-native units determine interval membership. Different native bin widths prevent simple city rankings; nine days do not establish forecasting skill. Historical prices are not voter shares or calibrated weather probabilities.

Current snapshots: `public/signals/data/mexico-unified.json`, `laguardia-unified.json`, `unified-market.js`. Earlier August data and original extraction scripts remain archival material, not the current default. Daily Sources links distinguish derived project archives from original APIs and settlement sources.

The drying game uses an independent teaching model for rainfall. Its information panel describes uncertainty in words and suggests preparations; it displays no market quotes or historical rainfall records. The scenario does not use the temperature snapshots or a live Malawi forecast. It models exposure and drying opportunity qualitatively—not food safety, yield, economic loss or financial advice. Official warnings take priority. Hedging requires matched place/date/variable/settlement, liquidity, costs and basis risk.

## Verification
```sh
node scripts/verify-guided-data.mjs
node scripts/verify-refactor.cjs
```
Browser regression requires Playwright and Chrome; set `WEATHERBRIDGE_PLAYWRIGHT` and `WEATHERBRIDGE_BROWSER` when they are not on standard paths. Screenshots and Chrome profiles are ignored under `.cache/` on the project drive. Includes 12 routes, bilingual widths 320/390/768/1440, 15 story states, five advanced charts, seven redirects, eight game outcome states, reduced motion and text fallback. Automated correctness is not evidence of novice comprehension; user testing remains necessary.

Legacy `src/main.js`, `src/views/`, `jinxi/index.html`, `nomadcast/` are intentionally unbuilt migration sources. Build inputs in `vite.config.js` own the final public routes. See `docs/restructure-audit.md`.
