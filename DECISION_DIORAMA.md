# Weatherbridge decision diorama

## Scope and visual contract

Rebuild only the courtyard experience and its inline comparison. Preserve the
Weatherbridge typography, bilingual content elsewhere, Depo-inspired palette,
fixed orthographic camera and existing navigation. The approved user brief is
code-led: an editorial architectural miniature, not a free-roaming game or a
static yard with buttons. No new external services, assets or purchases.

The miniature contains a house, elevated drying rack, individual maize ears,
working left-hand shelter with a drying bench, hinged storage box, unfolding
tarp and roll, articulated household member with carrying basket, planted
boundary, paving, sky/clouds/sun, rain streaks/puddles, information terminal,
contract desk and animated value tokens. DOM hotspots follow camera-projected
object anchors and are keyboard-operable; meshes also support raycast picking.

## State sequence

1. Signal: a fictional regional forecast lacks village-level timing. Read the
   supplementary market panel or explicitly skip it.
2. Market (optional): multiple judgments feed a visible, illustrative price
   signal. The price panel is not a calibrated probability or an official forecast.
3. Preparation: choose one plan via the objects; storage offers half or all.
   Corn is transported, character arms/legs and basket move, storage lid opens,
   or the tarp progressively unfolds. Repeat a plan before locking it in.
   Transport now uses three explicit pick/carry/place trips around the rack:
   actual maize ears follow the carrying basket, not independent flying paths.
   Short scene captions track each beat. Cloth geometry unrolls with a raised
   leading fold and revealed stitched seams, rather than scaling a flat box.
4. Hedge: buy the example heavy-rain contract or decline it. Amber cost tokens move
   toward the contract desk; green payout tokens return to the household after
   heavy rain. A receipt beneath the scene retains cost, payout and contract net,
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

`scripts/verify-decision-diorama.cjs`: 30 accounting combinations, all five
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
