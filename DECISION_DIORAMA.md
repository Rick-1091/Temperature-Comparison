# Weatherbridge decision diorama

## Three selectable market scenarios — 2026-10-13

This section supersedes the single-scenario restriction below. The courtyard
keeps heavy-rain-leading as the initial scenario and adds dry-leading and
light-rain-leading scenarios. The scenario selector starts a clean round;
the restart button cycles heavy → dry → light → heavy. Outcome replays stay
inside their existing scenario and do not change its quotes or costs.

| Scenario | Dry / light / heavy probability and cent quote | Best unhedged plan | Average result |
|---|---|---|---|
| Dry leads | 80 / 15 / 5 | Keep drying | +14.0 |
| Light leads | 20 / 75 / 5 | Shelter | +7.5 |
| Heavy leads | 15 / 15 / 70 | Storage | -5 |

All quote histories, explanations, weather draws, expected results, contract
costs, receipts and counterfactuals use the selected scenario. Rain contracts
still buy 30 units and pay 30 only in their matching outcome. Their costs are
4.5 / 1.5 in dry-leading, 22.5 / 1.5 in light-leading and 4.5 / 21 in
heavy-leading (light contract / heavy contract). No bonus is granted for viewing.
There is no guaranteed ending; each non-leading weather retains nonzero probability.

Verification covers 81 plan/weather/contract combinations across all scenarios,
three independently calculated expected-result tables, each scenario's exact
sampling frequencies, bilingual market/receipt/result flows, and cycling/reset.

## Current signal-linked scenario — 2026-10-13

This section supersedes all older quote, probability and contract-cost examples below.
One synthetic high-risk scenario now supplies both the displayed quotes and the
weather draw: dry 15%, light rain 15%, heavy rain 70%. Each round draws once before
the view/skip decision; viewing, preparing and buying cannot change the outcome.
This correspondence is an explicit teaching assumption, not calibration of a live
Polymarket market. Known-weather replays remain labelled separately.

30 light units cost 4.5; 30 heavy units cost 21. Matching payouts remain 30;
light-contract net is +25.5 or -4.5, heavy-contract net is +9 or -21.
Fair pricing gives zero expected contract profit in this simplified model.
The benefit of acting on information is physical preparation, not free trading profit.

Unhedged weighted average results: keep drying -55.4, shelter -56.5, storage -5
(displayed to one decimal). The market panel explains the storage tradeoff before
the decision. Results prominently compare the user's actual result with keep
drying/no contract under the SAME weather, splitting preparation and contract effects.
For heavy rain: baseline -82.8, storage -5, storage plus heavy contract +4.
For dry weather: baseline +24, storage -5, storage plus heavy contract -26.
Viewing alone never changes payouts or earns a bonus; the comparison is not a
claim that all uninformed users leave maize out or informed users always win.

Verification adds exact sampling boundaries and 10,000 evenly spaced draws
(1,500 dry / 1,500 light / 7,000 heavy), all 27 accounting cases, quote/cost
consistency, expected contract profit neutrality, and bilingual responsive result comparisons.

## Current three-plan model — 2026-10-12

This revision supersedes the older five-plan preparation descriptions and
case tables below. The active model, hotspots, fallback and comparison have
only three mutually exclusive preparations:

| Plan | Light-rain crop loss | Heavy-rain crop loss | Sunny drying | Preparation delay | Moving cost | Dry / light / heavy net without contract |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Keep drying | 25 | 90 | 24 | 0 | 0 | +24 / −7 / −82.8 |
| Move all under the open roof | 0 | 90 | 18 | 6 | 2 | +16 / +11.5 / −86.6 |
| Store everything | 0 | 0 | 0 | 24 | 5 | −5 / −5 / −5 |

Delay is forgone drying value, not a second charge. Rain reduces ongoing
drying to 75% (light) or 30% (heavy), after preparation has reduced the sunny
window. Costs, physical damage and contract cash flow remain separate.
All values are synthetic teaching units, not empirical agricultural estimates.
Dry, light and heavy weather each has a distinct best unhedged plan.

The roof is open-sided: light rain stops at the roof; wind-driven heavy
rain enters from the front and visibly wets all 48 ears under the shelter.
Storage keeps all 48 ears dry but stops drying. The removed tarp station
and half-storage submenu do not remain as hidden choices. Both moving plans
use the existing three-trip carrying choreography; choosing a plan is reversible
until continuing. Object labels show rain coverage and delay before selection.

Small-rain and heavy-rain contracts remain separate, with unchanged costs and
triggers. Independent fixtures cover 3 plans × 3 weather outcomes × 3 contract
choices = 27 cases. Browser checks verify all physical states, numerical
ledgers, 8 width/language combinations, animation, keyboard, interruption,
weather replay, text fallback and WebGL restoration.

## Scope and visual contract

Rebuild only the courtyard experience and its inline comparison. Preserve the
Weatherbridge typography, bilingual content elsewhere, Depo-inspired palette,
fixed orthographic camera and existing navigation. The approved user brief is
code-led: an editorial architectural miniature, not a free-roaming game or a
static yard with buttons. No new external services, assets or purchases.

The miniature contains a house, elevated drying rack, individual maize ears,
working left-hand shelter with a drying bench, hinged storage box,
articulated household member with carrying basket, planted
boundary, paving, sky/clouds/sun, rain streaks/puddles, information terminal,
contract desk and animated value tokens. DOM hotspots follow camera-projected
object anchors and are keyboard-operable; meshes also support raycast picking.

## State sequence

1. Signal: a fictional regional forecast lacks village-level timing. Read the
   supplementary market panel or explicitly skip it.
2. Market (optional): multiple judgments feed a visible, illustrative price
   signal. The price panel is not a calibrated probability or an official forecast.
3. Preparation: choose exposed drying, the light-rain shelter or full storage.
   Corn is transported, character arms/legs and basket move, storage lid opens.
   Repeat a plan before locking it in.
   Transport now uses three explicit pick/carry/place trips around the rack:
   actual maize ears follow the carrying basket, not independent flying paths.
   Short scene captions track each beat. Cloth geometry unrolls with a raised
   leading fold and revealed stitched seams, rather than scaling a flat box.
4. Hedge: decline, buy the light-rain contract, or buy the heavy-rain contract.
   Amber cost tokens move toward the desk; green payout tokens return only after
   the purchased contract's matching weather. The receipt retains cost, payout and contract net,
   with signed amounts as well as color. Changing preparation before
   revealing reverses this provisional choice, without charging twice.
5. Weather: resolve the previously drawn outcome. Cloud color, light, rain,
   puddles and maize appearance change. Rain is blocked by shelter/tarp/storage
   footprints. Shelter roof becomes translucent to reveal the relocated corn.
6. Result: separate drying benefit, crop loss, preparation cost, contract cost,
   payout and net outcome. Show purchased and unpurchased counterfactuals under
   the same weather. The inline table compares all five preparations. Explicitly
   labeled known-weather replays keep the decisions but swap the outcome.

## Teaching model (not financial or agricultural estimates)

All prices and amounts are synthetic teaching units. There is no real payment,
account connection, live Polymarket quote or weather API in this exercise.
Weather is sampled once before the decisions: dry .35, late light rain .40,
early heavy rain .25. Looking at information, preparing and buying do not
change this sampled outcome. Illustrative market prices are 32 / 28 / 40 cents,
intentionally different from the sampling weights.

| Plan | Outside | Shelter | Storage | Tarp | Cost |
| --- | ---: | ---: | ---: | ---: | ---: |
| All outside | 1 | 0 | 0 | 0 | 0 |
| Store half | .5 | 0 | .5 | 0 | 2 |
| Tarp | 0 | 0 | 0 | 1 | 4 |
| Left shelter | .4 | .6 | 0 | 0 | 3 |
| Store all | 0 | 0 | 1 | 0 | 5 |

Maximum drying value is 24. Weather drying multipliers are 1 / .75 / .3.
Relative drying under shelter is .55 and under tarp .35; storage stops outdoor
drying. Exposed crop losses are 0 / 25 / 90; shelter residual exposure is .04
and tarp residual exposure .1. These coefficients are explanatory assumptions,
not measurements of maize, safety, humidity, ventilation or farm economics.
Storage is idealized; the miniature rounds .6 of 48 maize ears to 29.

Example contract: 30 heavy-rain Yes units at .40 each, total cost 12.
Heavy rain pays 30; dry or light rain pays zero, regardless of crop loss.
Thus contract net is +18 for heavy rain, −12 otherwise. A fixed event payout
can exceed protected crop loss or leave losses uncovered; it is not indemnity
insurance. The model does not simulate market liquidity, fees, settlement
disputes, counterparty risk, regulatory access or a real hedging strategy.

`net = drying − crop loss − preparation cost − contract cost + payout`

Source of truth: `src/decision-model.js` (pure, validated functions).
Controller: `src/decision-diorama.js` via the stable `src/game.js` entry.
Rendering/animation: `src/decision-scene.js`; styles: `src/decision-diorama.css`.
The old binary `game-model.js` remains solely for compatibility with archived
debrief links; it does not drive this courtyard.

## Accessibility and lifecycle

Fixed camera, native keyboard controls, labeled progress, live status and
focus handoff; fallback retains the complete decision and accounting flow.
Reduced-motion mode applies final states without travel/rain/token/count-up
motion. Pause completes an in-flight action without trapping the user.
Offscreen/background rendering stops; reduced-motion idle scenes do not redraw
each frame. GPU resources/listeners are disposed on
context loss or page exit. Restart invalidates old async transitions. Currency
values use signed numbers as well as semantic color, never color alone. Text-mode
to WebGL recovery restores the complete snapshot before controls unlock; it
does not replay a purchase. Pausing finishes the action and resets the character
pose. Restart clears the terminal's viewed state and the contract receipt.
Light rain uses 140 slower, lighter streaks versus 380 for heavy rain. Initial
and reduced-motion rain positions obey the same roof footprints as moving rain.
Wet maize gradually darkens as rain builds; puddles grow and small ripples fade.
The dry outcome lowers the sun and warms the light. Cost transfer finishes before
weather can be revealed; pause, restart or context loss resolve its pending task.
Projected scene labels avoid each other, with thin stems preserving their object
association. Label layout updates only when state, locale or viewport changes.
Native hotspot focus and mesh hover identify an object through a ground marker.
Picking respects the nearest solid surface, preventing selection through a house;
relocated maize belongs to its current shelter/storage interaction. Turning uses
shortest-angle easing and the actor keeps the final facing direction.
On compact screens, offscreen animation actions bring the scene into view. The
existing next-step button moves beneath it (no duplicate control); text/reduced
motion modes do not force a watching scroll. Outcome swatches distinguish model
ears moved/covered from exposed wet ears, without asserting a measured yield.

## Contract decision refinement

The contract desk now focuses the inline terms, never buys on object click.
Buying requires the explicit purchase button; buying and declining use the same
visual weight and neither is selected by default. A selected choice receives
the same highlight whichever option it is. Before purchase, a three-weather
table separates gross payout (0 / 0 / 30) from contract net (-12 / -12 / +18).
The current preparation and remaining exposed maize stay in context. The fixed
heavy-rain trigger is not crop-loss insurance: light-rain damage does not pay,
while protected maize does not prevent heavy-rain payout. Detailed teaching-unit
terms disclose that this is not evidence of an available Malawi market.

After weather unfolds, a sequential waterfall bridges the net before a contract,
purchase cost, payout and final net. Zero and signed amounts remain visible even
where a zero-cost/payout bar has no height. Its common scale and calculation come
from the same model as the ledger; physical loss is unchanged by the contract.
Connectors trace the intermediate balances, and a dashed line marks zero.
Settlement numbers remain exact throughout bar animation, matching the equation.
Declining shows a concise unchanged-net statement instead of empty change bars.
The animation is skipped for reduced motion and pause. Choices can be adjusted
before reveal in this simulation; this is explicitly not a real trading workflow.

## Verification coverage

`scripts/verify-decision-diorama.cjs`: 45 accounting combinations, all five
preparations, three outcomes, optional information, contract cost/payout,
protected corn counts, known-weather replays, bilingual layouts at
1440/768/390/320px, reduced motion, animated transport/tarp/cost/rain/payout
captures, context-loss fallback and console errors. Keyboard-only decisions,
pausing mid-carry, live language/reduced-motion changes, receipt reset and WebGL
snapshot restoration are also checked.
Choreography helpers in `src/decision-motion.js` have deterministic phase/route
checks. Mid-carry captures verify actual carried ears and progressive shelter
occupancy; partial/full tarp states, payment gating and hotspot non-overlap are
checked in the browser.
Compact 390×780 viewport tests assert visible carrying, a single continuation,
keyboard object focus and the rain-to-dry outcome legend after replay.
Reports and screenshots are local-only in `.cache/decision-qa/`.
`node scripts/verify-decision-accounting.mjs` separately checks 30 independent,
hand-calculated accounting fixtures without requiring a browser or dependencies.
Run against the Vite preview with `node scripts/verify-decision-diorama.cjs` and
Playwright available. Optional environment overrides are
`WEATHERBRIDGE_PLAYWRIGHT_MODULE`, `WEATHERBRIDGE_BROWSER_EXECUTABLE` and
`WEATHERBRIDGE_PREVIEW_URL`; the test no longer assumes a contributor's Windows paths.
Visual review is performed in-thread against the user-supplied Depo references.

## Interface distillation — 2026-10-10

The courtyard and the full signal → preparation → contract → outcome model remain.
The default UI now asks one question per step, using the existing cream, bold type,
flat colors and black-outline visual language rather than adding nested cards.

- Market: one rain-leaning verdict and a weather icon. Decorative judgment squares,
  the unexplained 68¢ aggregate and the default vertical quote chart are removed.
  The three original simulated quotes are available under “What is this signal based on?”.
  Supplementary-only / not-an-official-forecast wording stays visible.
- Preparation: storage choices appear only after selecting the storage object;
  rack, shelter and tarp retain direct scene interaction and their real animations.
- Contract: visible cost and two trigger cases; neither buy nor decline is preselected.
  Full three-weather accounting and settlement terms are in a lightweight disclosure.
  Weather-trigger payout versus crop-loss compensation stays explicit before buying.
- Result: three outcome metrics and one same-plan with/without-contract comparison.
  The duplicate five-bar cash-flow chart is removed. Full ledger and waterfall are
  available under “See the calculation”; amounts stay exact while bars animate.
- Known-weather replay and the five-preparation table remain available on demand.
  Pause / text fallback live under “Animation options”, with one restart entry.
  The compact result view moves directly from courtyard to accounting, omitting
  the repeated weather paragraph without removing its accessible live status.

No weather weights, preparation effects, contract prices or payout rules changed.
QA additionally checks hidden raw quotes, progressive storage choices, neutral
contract decisions, no duplicate cash-flow chart, and all disclosure entry points.

## Teammate integration — 2026-10-10

Merged latest main `497a350` (timeline range blocks, duplicate-view cleanup,
seven-element weather correlation network and README demo link). The old
`game.js` aria-label edit conflicted with the new lazy entry; the new controller
retains bilingual scene and market labels. No retired evidence views are restored.

The network retains its original data, SVG, computation and keyboard selection.
Its container now owns horizontal scrolling, like the neighbouring timeline,
so inherited narrow-screen SVG minimum widths cannot widen the entire page.
`scripts/verify-team-integration.cjs` checks both features together in Chinese
and English at desktop/mobile widths, with city, unit and keyboard interactions.

## Comprehension and interaction fixes — 2026-10-10

The default result now includes a compact, labelled equation with preparation
cost, and its heading responds to the chosen preparation and weather. Covered
maize is explicitly distinguished from damage-free maize; model amounts are
unchanged. Scene labels describe actions. On compact screens the existing task
instruction moves above the courtyard instead of being duplicated. Completed
preparations focus the next-step button. Pause/resume updates only motion
controls, preserving open terms, calculations and the reading position.

## Illustrative market image — 2026-10-10

The signal step now includes a responsive SVG market graphic: three authored
quote traces, weather icons and the model's current 32/28/40-cent example prices.
It is labelled simulated and non-live; the reading guide explains cents and
distinguishes prices from rain probabilities. The graphic replaces the standalone
rain icon and the duplicate quote bars. Its invented history does not feed the
weather draw, preparation model or contract settlement.

## Numeric drying trade-offs — 2026-10-11

Each preparation now shows a dry-weather example with drying earned, forgone
drying value, preparation cost and net without a contract. Results expand the
equation into available drying value minus forgone value, crop damage and
preparation cost, plus contract net. The five-plan comparison includes forgone
value and preparation cost. Forgone value is derived from the same-weather
full-drying baseline; it is already reflected in drying earned and is never
deducted twice. Existing outcome totals and weather sampling remain unchanged.

## First-time walkthrough — 2026-10-11

Manual browser walkthroughs covered the signal/preparation/contract/result flow
on desktop and mobile. On compact screens, the preparation continuation now
stays after its numerical readout, so the user encounters the trade-off before
advancing. Contract headings and selected buttons explicitly acknowledge a
purchase or a decision to decline. Preparation focus still advances to the
continuation after the animation, and the weather and result controls remain
available from the scene.

## Common-baseline accounting audit — 2026-10-12

Every weather now starts from the same full-rack sunny value of 24. The old
same-weather drying opportunity baseline (24 / 18 / 7.2) hid the weather's
interruption and made preparation delay change retrospectively with weather.
The model now separates two causal losses, without double counting them:

- `sunnyDrying`: this preparation's drying in dry weather, rounded to 0.1.
- `dryingOpportunityLoss = 24 − sunnyDrying`: drying forgone by preparing.
- `weatherDryingLoss = sunnyDrying − drying`: rain interruption on corn that
  was still drying. Stored corn cannot lose drying time to rain again.
- `drying = 24 − dryingOpportunityLoss − weatherDryingLoss`.
- `net = drying − physicalLoss − preparationCost − premium + payout`.
- `gapFromFullDrying = 24 − net`: a benchmark comparison, not a second charge.

Losses are derived from displayed rounded balances so every visible equation
reconciles exactly to 0.1. The synthetic damage/drying coefficients, weather
sampling, fixed preparation costs and heavy-rain contract trigger are unchanged;
the audited net totals were already arithmetically correct, and are not forced
to differ where the assumptions legitimately produce equal totals.

| Preparation | Dry (no / with contract) | Light rain (no / with) | Heavy rain (no / with) |
| --- | ---: | ---: | ---: |
| Keep all outside | +24 / +12 | −7 / −19 | −82.8 / −64.8 |
| Store half | +10 / −2 | −5.5 / −17.5 | −43.4 / −25.4 |
| Tarp | +4.4 / −7.6 | −0.2 / −12.2 | −10.5 / +7.5 |
| Left shelter | +14.5 / +2.5 | −0.5 / −12.5 | −35.9 / −17.9 |
| Store all | −5 / −17 | −5 / −17 | −5 / +13 |

For all-stored maize, every weather has zero drying, zero crop damage and
preparation cost 5. Dry/light totals are genuinely equal, and this limitation
is explicitly explained. Both fail the heavy-rain trigger, so purchased
contract net is −12 in each; this equality must not be mistaken for equal
whole-courtyard outcomes under the other four preparations.

The default result explains the dry-versus-light difference numerically.
“Compare cash flow / replay weather” contains a side-by-side three-weather
ledger with preparation delay, rain interruption, crop damage, costs, payouts
and both net totals. The existing same-weather five-plan table uses the same
common baseline and includes the separate rain interruption column.

Regression fixtures hard-code all 15 plan/weather rows with and without a
contract (30 cases), rather than checking the function against itself.

### Accounting reading-path confirmation

The result header explicitly names the weather and arrival timing, including
compact layouts where the scene-side result heading is hidden. Open calculation
and three-weather comparison disclosures stay open across weather replay,
language changes and responsive re-rendering; restart clears the old result DOM.
The compact table uses short labels with one shared no-double-charge note.
Regression checks capture the actual expanded ledger at all eight width/locale
combinations, assert numeric cells are not clipped, replay light rain and confirm
the comparison remains open and its net updates to the expected amount.

## Clear quote inspection and two contract choices — 2026-10-12

Current illustrative prices stay visible together (dry 32¢, light 28¢, heavy
40¢), but the user selects one weather to inspect its six-quote trace. The
selected weather, units and quote order are explicit, and dollars are shown
to two decimal places (28¢ = $0.28, never $0.3). Quote inspection does not buy,
set the preparation, preselect a contract, or change the independent weather.

| Contract choice | 30-unit cost | Dry contract net | Light contract net | Heavy contract net |
| --- | ---: | ---: | ---: | ---: |
| None | 0 | 0 | 0 | 0 |
| Light rain (28¢ per unit) | 8.4 | −8.4 | +21.6 | −8.4 |
| Heavy rain (40¢ per unit) | 12 | −12 | −12 | +18 |

These are mutually exclusive weather outcomes, not nested rain thresholds:
the light contract does not pay for heavy rain. The exercise permits one
contract at a time, not a portfolio. Costs, payout conditions, receipts,
cost/payout motion, waterfall, current result, three-weather ledger and
five-preparation comparison all use the selected contract from CONTRACTS.
For full exposure in light rain: 18 drying − 25 crop loss = −7 without a
contract; a light contract gives −7 − 8.4 + 30 = +14.6; a heavy contract gives
−7 − 12 + 0 = −19. Crop loss is unchanged in every case.

All 45 no/light/heavy outcomes have independent expected fixtures. Both
contract types are exercised across five preparations and three weather
replays. Mobile light-rain cost/payout motion, choosing another contract,
receipts, language changes and text/WebGL restoration are regression targets.
The legacy boolean true still means heavy rain solely for prior callers.
