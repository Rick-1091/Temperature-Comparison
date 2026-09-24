import { BINS, DAYS, dayByDate, fmtDate, modeBin, binOfTemp, TOMORROW_ISO } from '../data.js';
import { subscribe, setState } from '../state.js';

export function initHero() {
  const sel = document.getElementById('sel-date');
  sel.innerHTML = [...DAYS].reverse().map((d) =>
    `<option value="${d.date}">${d.date === TOMORROW_ISO ? 'Tomorrow · September 25' : fmtDate(d.date, { weekday: 'short', month: 'long', day: 'numeric' })}</option>`
  ).join('');
  sel.addEventListener('change', () => setState({ date: sel.value }));

  const root = document.getElementById('market');
  subscribe((s) => {
    sel.value = s.date;
    render(root, dayByDate[s.date]);
  });
}

function render(root, d) {
  const isT = d.isForecast;
  const title = isT ? 'Tomorrow’s Maximum Temperature' : 'Maximum Temperature';
  const dateLine = isT
    ? '<b>Tomorrow</b> · September 25 · market open'
    : `<b>${fmtDate(d.date, { weekday: 'long', month: 'long', day: 'numeric' })}</b> · market settled`;

  if (!d.market) {
    root.innerHTML = `
      <div class="market-head"><span class="market-kicker">Market-implied probability</span><span class="tag tag-missing">Missing</span></div>
      <h2 class="market-title">${title}</h2>
      <div class="market-date">${dateLine}</div>
      <p class="p-empty" style="margin-top:40px">No market was listed for this day. We show nothing rather than estimate a distribution.</p>
      ${d.actual != null ? `<p class="mrain">Observed maximum: <b style="color:var(--ink)">${d.actual}°C</b></p>` : ''}`;
    return;
  }

  const top = modeBin(d);
  const hit = binOfTemp(d.actual);
  const shown = BINS.map((b, i) => ({ b, i, p: d.market[i] })).filter((r) => r.p >= 1 || r.i === hit);
  const hidden = 100 - shown.reduce((s, r) => s + r.p, 0);
  const max = Math.max(...d.market);

  root.innerHTML = `
    <div class="market-head">
      <span class="market-kicker">Market-implied probability</span>
      <span class="tag tag-market">Market-implied</span>
    </div>
    <h2 class="market-title">${title}</h2>
    <div class="market-date">${dateLine}</div>
    <div class="mrows">
      ${shown.map((r) => {
        const w = (r.p / Math.max(max, 60)) * 100;
        return `
        <div class="mrow ${r.i === top ? 'top' : ''} ${r.i === hit ? 'hit' : ''}">
          <span class="mlabel">${r.b.label}
            ${r.i === top ? '<span class="mnote">← Most likely</span>' : ''}
            ${r.i === hit ? `<span class="mnote obs">● Observed ${d.actual}°C</span>` : ''}</span>
          <span class="mbar"><span class="mbar-track"></span><span class="mbar-fill" style="width:${w}%"></span></span>
          <span class="mpct">${r.p < 1 ? '<1' : r.p}<small>%</small></span>
        </div>`;
      }).join('')}
    </div>
    ${hidden > 0 ? `<p class="mother">Other ranges: ${hidden}% combined</p>` : ''}
    ${!isT ? `<p class="mrain">${d.actual != null
        ? `Observed maximum <b style="color:var(--ink)">${d.actual}°C</b> — inside the range priced at ${d.market[hit]}%.`
        : '<span class="tag tag-missing">Missing</span> No observation available from the settlement station.'}</p>`
      : `<p class="mrain"><span>Rain probability</span><b>${Math.round(d.rainProb * 100)}%</b><span class="tag tag-inf">Forecast model · not a market</span></p>`}
    <dl class="mmeta">
      <div><dt>Measure</dt><dd>Market-implied probability</dd></div>
      <div><dt>Last updated</dt><dd>${isT ? '10:32 AM · Sep 24' : 'Final price at settlement'}</dd></div>
      <div><dt>Source</dt><dd>Polymarket <span class="ph">mock values</span></dd></div>
      <div><dt>Settlement source</dt><dd>Official weather station (MMMX)</dd></div>
    </dl>
    <p class="mnote-sub">Market probabilities represent expectations, not guaranteed forecasts.</p>`;
}
