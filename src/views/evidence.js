import { HISTORICAL, DAYS } from '../data.js';

export function initEvidence() {
  const noActual = HISTORICAL.filter((d) => d.actual == null).length;
  const noMarket = HISTORICAL.filter((d) => !d.market).length;
  const noAct = HISTORICAL.filter((d) => !d.activity).length;
  const cells = HISTORICAL.filter((d) => d.activity).flatMap((d) => Object.values(d.activity));
  const missCells = cells.filter((v) => v == null).length;

  const cards = [
    {
      id: 'A', title: 'Prediction market', sum: 'Crowd-priced probabilities for tomorrow’s maximum temperature, by 2°C range.',
      side: 'Market-implied. A price is an expectation held by traders, shaped by liquidity and incentives, not a meteorological model.',
      rows: [
        ['Source', 'Polymarket · daily “Highest temperature in Mexico City” markets'],
        ['Market URL', '<code>polymarket.com/event/highest-temperature-in-mexico-city-on-september-25</code><span class="ph">placeholder</span>'],
        ['Timestamp', 'Sep 24, 2026 · 10:32 AM CST (snapshot); historical days use the final pre-settlement price'],
        ['Market ID', '<code>PM-MEXC-TMAX-20260925</code><span class="ph">placeholder</span>'],
        ['Settlement source', 'Official weather station, as named in the market rules (MMMX, Mexico City Intl. Airport), whole °C'],
        ['Coverage', `${DAYS.length - noMarket} of ${DAYS.length} days · ${noMarket} day without a listed market`],
        ['Real-data counterpart', '<a href="../signals/index.html">Chapter 02 · New York</a> compares actual Polymarket prices with NOAA observations (Aug 17–28, 2026)'],
      ],
    },
    {
      id: 'B', title: 'Weather observation', sum: 'What actually happened, from the same station the market settles on.',
      side: 'Observed. Airport conditions may differ from Roma Norte or Condesa, several kilometres away.',
      rows: [
        ['Source', 'Official daily weather summary for the settlement station'],
        ['Station ID', '<code>MMMX</code> · Benito Juárez International Airport'],
        ['Observation dates', 'Aug 1 – Sep 24, 2026'],
        ['Variables used', 'Daily max temperature (°C), total precipitation (mm), max sustained wind (km/h)'],
        ['Rain probability', 'For tomorrow only: forecast model output. Shown separately and never labelled as a market'],
        ['Missing', `${noActual} days without a max-temperature record · shown as “No observation available”`],
      ],
    },
    {
      id: 'C', title: 'Activity data', sum: 'How often nomads were observed working, moving, and relaxing in different place types.',
      side: 'This prototype uses simulated data. The structure matches what a real diary study would produce.',
      rows: [
        ['Origin', `<div class="src-opts"><span>Survey</span><span>Field observation</span><span>Secondary dataset</span><span class="on">Prototype / mock data</span></div>`],
        ['Planned collection', 'Diary study with nomads in Roma Norte, Condesa, and Centro: daily check-ins by place type'],
        ['Unit', 'Normalised activity level (0–1) per activity per day; 18–58 simulated check-ins per day'],
        ['Places', 'Café and coworking IDs are anonymised. Parks and museums are real public places at approximate positions'],
        ['Missing', `${noAct} day with no activity data · ${missCells} of ${cells.length} activity cells missing (${Math.round((missCells / cells.length) * 100)}%)`],
      ],
    },
    {
      id: 'D', title: 'Data transformations', sum: 'Normalization, similar-day matching, missing values, and aggregation.',
      side: 'Inferred. Everything in this card is a choice we made, and each choice could change what you see.',
      rows: [
        ['Normalization', 'Activity counts are scaled to 0–1 per activity across the study period, so levels are comparable across rows but not across cities'],
        ['Weather tags', 'Rule-based: Rainy ≥ 2 mm · Sunny < 0.5 mm and mostly clear · Hot ≥ 27°C · Cool ≤ 23°C · Windy ≥ 22 km/h. A day can carry several tags'],
        ['Similar-day matching', 'Euclidean distance on (max temp ÷ 2°C, wetness ÷ 0.5), with wetness 0 / 0.5 / 1 for dry, light, ≥ 2 mm. Similarity = 1 / (1 + distance). Top 8 (or 16) are shown'],
        ['Association (network)', 'Lift = mean activity on days with a tag ÷ mean on all days. Links drawn only when lift ≥ 1.05'],
        ['Missing values', 'Excluded from means and shown as hatched cells. Days without an observed temperature are excluded from matching. Nothing is interpolated'],
        ['Aggregation', 'Map and bar chart use unweighted means over the relevant days; the map multiplies by a fixed per-place popularity weight'],
      ],
    },
    {
      id: 'E', title: 'Limitations', sum: 'What this tool cannot tell you, and where it could mislead.',
      side: 'Read these before drawing any conclusion from the views above.',
      rows: [
        ['Market ≠ forecast', 'Market probability is not an official weather forecast and can be thin or wrong'],
        ['Association ≠ causation', 'Weekday, events, and season all co-vary with weather'],
        ['Past ≠ future', 'Historical activity patterns do not guarantee future behavior'],
        ['Sample', 'Observed users may not represent all digital nomads; 8 similar days is a small sample'],
        ['Spatial mismatch', 'A single airport station stands in for the whole city'],
        ['Missingness', 'Missing data is visibly marked rather than silently interpolated'],
      ],
    },
  ];

  document.getElementById('ev-list').innerHTML = cards.map((c) => `
    <details class="ev" id="ev-${c.id}" ${c.id === 'A' ? 'open' : ''}>
      <summary><span class="ev-letter">${c.id}</span><span class="ev-title">${c.title}</span><span class="ev-sum">${c.sum}</span><span class="ev-plus">+</span></summary>
      <div class="ev-body"><span></span><p class="ev-side">${c.side}</p>
        <dl>${c.rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
      </div>
    </details>`).join('');

  document.querySelector('a[href="#ev-D"]').addEventListener('click', () => { document.getElementById('ev-D').open = true; });
}
