import { ACTIVITIES, BINS, BASELINE, dayByDate, fmtDate, modeBin, binOfTemp, completeness, weatherById } from '../data.js';
import { subscribe, setState } from '../state.js';
import { currentSimilar } from './similar.js';

export function initPanel() {
  const panel = document.getElementById('panel');
  const scrim = document.getElementById('scrim');
  const close = () => setState({ panelDate: null });
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  panel.addEventListener('click', (e) => {
    if (e.target.closest('.p-close')) close();
    const f = e.target.closest('[data-focus]');
    if (f) setState({ date: f.dataset.focus, panelDate: null });
  });

  subscribe((s) => {
    const on = !!s.panelDate;
    panel.classList.toggle('on', on);
    scrim.classList.toggle('on', on);
    panel.setAttribute('aria-hidden', String(!on));
    if (on) render(panel, dayByDate[s.panelDate], s);
  });
}

function render(root, d, s) {
  const sim = currentSimilar(s).results;
  const rank = sim.findIndex((r) => r.day.date === d.date);
  const top = modeBin(d);
  const hit = binOfTemp(d.actual);
  const comp = completeness(d);

  root.innerHTML = `
    <button class="p-close" type="button" aria-label="Close">×</button>
    <p class="p-kicker">Historical day record</p>
    <h3 class="p-date">${fmtDate(d.date, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
    <p class="p-sim">${rank >= 0 ? `Similarity ${sim[rank].sim.toFixed(2)} · rank ${rank + 1} of ${sim.length} similar days` : 'Not in the current similar-day set'}</p>

    <div class="p-sec">
      <h4>Prediction-market probabilities <span class="tag tag-market">Market</span></h4>
      ${d.market ? BINS.map((b, i) => `
        <div class="p-mrow ${i === top ? 'top' : ''} ${i === hit ? 'hit' : ''}"><span class="l">${b.label}</span><span class="t"><i style="width:${d.market[i]}%"></i></span><span class="v">${d.market[i]}%</span></div>`).join('')
        : '<p class="p-empty">No market was listed for this day.</p>'}
    </div>

    <div class="p-sec">
      <h4>Actual weather <span class="tag tag-obs">Observed</span></h4>
      <div class="p-wx">
        <div><div class="v">${d.actual != null ? d.actual + '°C' : '—'}</div><div class="k">${d.actual != null ? 'Max temperature' : 'No observation available'}</div></div>
        <div><div class="v">${d.precip} mm</div><div class="k">Precipitation</div></div>
        <div><div class="v">${d.wind}</div><div class="k">Max wind, km/h</div></div>
      </div>
      <div class="p-tags">${d.tags.length ? d.tags.map((t) => `<span class="wtag" style="background:${weatherById[t].color}">${weatherById[t].label}</span>`).join('') : '<span class="p-empty">No condition tags</span>'}</div>
    </div>

    <div class="p-sec">
      <h4>Observed activity <span class="tag tag-mock">Simulated</span></h4>
      ${d.activity ? ACTIVITIES.map((a) => {
        const v = d.activity[a.id];
        return v == null
          ? `<div class="p-act miss"><span>${a.short}</span><span class="t"></span><span class="v">n/a</span></div>`
          : `<div class="p-act"><span>${a.short}</span><span class="t"><i style="width:${v * 100}%"></i><span class="b" style="left:${BASELINE[a.id].mean * 100}%"></span></span><span class="v">${v.toFixed(2)}</span></div>`;
      }).join('') + `<p class="fineprint" style="margin-top:10px">${d.obsCount} activity observations logged. Tick = all-day average.</p>`
        : '<p class="p-empty">No activity observation available for this day.</p>'}
    </div>

    <div class="p-sec">
      <h4>Data completeness <span>${Math.round(comp.pct * 100)}%</span></h4>
      <div class="p-comp">${comp.fields.map((f) => `<i class="${f.ok ? '' : 'no'}" title="${f.key}"></i>`).join('')}</div>
      <ul class="p-comp-list">${comp.fields.map((f) => `<li class="${f.ok ? '' : 'no'}">${f.key}</li>`).join('')}</ul>
    </div>

    <div class="p-sec p-src">
      <h4>Provenance</h4>
      Market <code>${d.marketId ?? 'none'}</code> · Polymarket (mock)<br/>
      Station <code>MMMX</code> · daily summary ${d.date}<br/>
      Activity log <code>act_${d.date.replaceAll('-', '')}</code> · simulated
    </div>

    <div class="p-sec">
      <button class="btn-reset" type="button" data-focus="${d.date}">Set ${fmtDate(d.date)} as the selected day</button>
    </div>`;
}
