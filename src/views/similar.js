import * as d3 from 'd3';
import { ACTIVITIES, BINS, BASELINE, HISTORICAL, dayByDate, fmtDate, findSimilar, activityMeans, modeBin, weatherById } from '../data.js';
import { subscribe, setState, getState } from '../state.js';
import { showTip, moveTip, hideTip, row, level } from '../util.js';

export const heatColor = d3.scaleSequential(d3.interpolateRgbBasis(['#f0ece3', '#c3d0b2', '#7f9c6c', '#3f5e45', '#28402d'])).domain([0, 1]);
const LABEL_W = 140, HEAD_H = 92, CELL_H = 40;

export function currentSimilar(s) {
  return findSimilar(dayByDate[s.date], s.showAllSimilar ? 16 : 8, s.weather);
}

export function initSimilar() {
  const btn = document.getElementById('btn-all-similar');
  btn.addEventListener('click', () => setState({ showAllSimilar: !getState().showAllSimilar }));

  const svg = d3.select('#heatmap').append('svg');
  const defs = svg.append('defs');
  defs.append('pattern').attr('id', 'h-hatch').attr('width', 5).attr('height', 5).attr('patternUnits', 'userSpaceOnUse').attr('patternTransform', 'rotate(45)')
    .call((p) => { p.append('rect').attr('width', 5).attr('height', 5).attr('fill', '#faf8f3'); p.append('line').attr('y2', 5).attr('stroke', '#bdb6a8'); });
  const rowsG = svg.append('g');
  const colsG = svg.append('g');

  document.getElementById('heat-legend').innerHTML = `
    <span class="ramp">Low <i style="background:linear-gradient(90deg,${[0, 0.25, 0.5, 0.75, 1].map((v) => heatColor(v)).join(',')})"></i> High</span>
    <span>Cell = normalised observed activity (0–1) on that day</span>
    <span class="miss"><i></i>No observation available</span>
    <span>Columns ordered by similarity →</span>`;

  subscribe((s) => {
    const sim = currentSimilar(s);
    const res = sim.results;
    btn.textContent = s.showAllSimilar ? 'Show the 8 closest only' : 'View all similar days';
    renderTarget(s, sim);

    const avail = document.getElementById('heatmap').clientWidth || 800;
    const cw = Math.max(46, Math.min(112, (avail - LABEL_W) / Math.max(res.length, 1)));
    const width = LABEL_W + Math.max(res.length, 1) * cw;
    svg.attr('width', width).attr('height', HEAD_H + ACTIVITIES.length * CELL_H + 8).attr('viewBox', `0 0 ${width} ${HEAD_H + ACTIVITIES.length * CELL_H + 8}`);

    const rowOn = (a) => (s.activity ? a.id === s.activity : s.group === 'all' || a.group === s.group);

    rowsG.selectAll('text').data(ACTIVITIES).join('text').attr('class', 'h-rowlabel')
      .attr('x', 0).attr('y', (a, i) => HEAD_H + i * CELL_H + CELL_H / 2 + 4).text((a) => a.short)
      .style('opacity', (a) => (rowOn(a) ? 1 : 0.3)).style('font-weight', (a) => (s.activity === a.id ? 600 : 400));

    const col = colsG.selectAll('g.h-col').data(res, (r) => r.day.date).join(
      (en) => {
        const g = en.append('g').attr('class', 'h-col').style('opacity', 0);
        g.append('rect').attr('class', 'colbg').attr('y', 0).attr('height', HEAD_H + ACTIVITIES.length * CELL_H + 6);
        g.append('text').attr('class', 'h-date').attr('y', 18);
        g.append('text').attr('class', 'h-sub wk').attr('y', 34);
        g.append('text').attr('class', 'h-sub wx').attr('y', 48);
        g.append('rect').attr('class', 'simtrack').attr('y', 60).attr('height', 4).attr('fill', 'var(--rule-2)');
        g.append('rect').attr('class', 'simbar').attr('y', 60).attr('height', 4).attr('fill', 'var(--ink-2)');
        g.append('text').attr('class', 'h-sub sim').attr('y', 80);
        return g;
      },
    );
    col.transition().duration(450).style('opacity', 1).attr('transform', (r, i) => `translate(${LABEL_W + i * cw},0)`);
    col.classed('open', (r) => r.day.date === s.panelDate);
    col.select('.colbg').attr('x', 1).attr('width', cw - 2);
    col.select('.h-date').attr('x', 6).text((r) => fmtDate(r.day.date));
    col.select('.wk').attr('x', 6).text((r) => `${fmtDate(r.day.date, { weekday: 'short' })} · ${r.day.actual}°C`);
    col.select('.wx').attr('x', 6).text((r) => `${r.day.precip} mm`);
    col.select('.simtrack').attr('x', 6).attr('width', cw - 14);
    col.select('.simbar').attr('x', 6).transition().duration(450).attr('width', (r) => (cw - 14) * r.sim);
    col.select('.sim').attr('x', 6).text((r) => `sim ${r.sim.toFixed(2)}`);

    col.selectAll('g.cell').data((r) => ACTIVITIES.map((a, i) => ({ r, a, i, v: r.day.activity?.[a.id] ?? null })), (c) => c.a.id).join(
      (en) => {
        const g = en.append('g').attr('class', 'cell');
        g.append('rect').attr('class', 'h-cell');
        g.append('text').attr('class', 'h-val');
        return g;
      },
    ).each(function (c) {
      const g = d3.select(this);
      g.select('rect').attr('x', 2).attr('y', HEAD_H + c.i * CELL_H + 1).attr('width', cw - 4).attr('height', CELL_H - 2)
        .transition().duration(450)
        .attr('fill', c.v == null ? 'url(#h-hatch)' : heatColor(c.v))
        .style('opacity', rowOn(c.a) ? 1 : 0.22);
      g.select('text').attr('x', cw / 2).attr('y', HEAD_H + c.i * CELL_H + CELL_H / 2 + 4).attr('text-anchor', 'middle')
        .attr('fill', c.v == null ? 'var(--ink-3)' : c.v > 0.55 ? '#f4f1ea' : 'var(--ink-2)')
        .style('opacity', rowOn(c.a) ? 1 : 0.3)
        .text(c.v == null ? 'n/a' : cw > 60 ? level(c.v) : c.v.toFixed(1));
    });

    col.on('click', (e, r) => setState({ panelDate: r.day.date }))
      .on('mouseenter', (e, r) => showTip(e, colTip(r))).on('mousemove', moveTip).on('mouseleave', hideTip);
    col.selectAll('g.cell').on('mouseenter', (e, c) => {
      e.stopPropagation();
      showTip(e, `<div class="tt-h">${c.a.short} · ${fmtDate(c.r.day.date)}</div>` +
        row('Observed level', c.v == null ? '<span class="tt-miss">No observation available</span>' : `${level(c.v)} · ${c.v.toFixed(2)}`) +
        row('All-day average', BASELINE[c.a.id].mean.toFixed(2)) + row('Observations that day', c.r.day.obsCount) +
        '<div class="tt-note">Click for the full day record.</div>');
    });

    const n = res.length;
    document.getElementById('sim-count').innerHTML = n
      ? `${n} similar day${n > 1 ? 's' : ''} found <small>from a pool of ${sim.poolSize}${s.weather !== 'all' ? ` ${weatherById[s.weather].label.toLowerCase()}` : ''} days · ${sim.excluded.length} excluded for missing observations</small>`
      : 'No similar days found <small>try clearing the weather filter</small>';

    renderBars(res.map((r) => r.day), s);
  });
}

function colTip(r) {
  const d = r.day;
  return `<div class="tt-h">${fmtDate(d.date, { weekday: 'short', month: 'short', day: 'numeric' })}</div>` +
    row('Similarity', r.sim.toFixed(2)) + row('Observed max', `${d.actual}°C`) + row('Precipitation', `${d.precip} mm`) +
    row('Tags', d.tags.map((t) => weatherById[t].label).join(', ') || '—') + '<div class="tt-note">Click to open the day record.</div>';
}

function renderTarget(s, sim) {
  const d = dayByDate[s.date];
  const t = modeBin(d);
  const el = document.getElementById('sim-target');
  const rain = d.isForecast
    ? `<div class="v">${Math.round(d.rainProb * 100)}%</div><div class="s">Rain probability · forecast model</div>`
    : `<div class="v">${d.precip} mm</div><div class="s">Observed precipitation</div>`;
  const temp = d.actual != null
    ? `<div class="v">${d.actual}°C</div><div class="s">Observed maximum</div>`
    : d.market ? `<div class="v">${BINS[t].label}</div><div class="s">Most likely max · market ${d.market[t]}%</div>`
      : '<div class="v ro-missing">No temperature</div><div class="s">No market or observation</div>';
  el.innerHTML = `
    <div class="ro-cell"><div class="k">Selected ${d.isForecast ? 'forecast' : 'day'}</div><div class="ro-date">${d.isForecast ? 'Tomorrow' : fmtDate(d.date, { month: 'long', day: 'numeric' })}</div></div>
    <div class="ro-cell"><div class="k"><span class="tag ${d.isForecast ? 'tag-inf' : 'tag-obs'}">${d.isForecast ? 'Forecast' : 'Observed'}</span> Rain</div>${rain}</div>
    <div class="ro-cell"><div class="k"><span class="tag ${d.actual != null ? 'tag-obs' : 'tag-market'}">${d.actual != null ? 'Observed' : 'Market'}</span> Temperature</div>${temp}</div>
    <div class="ro-cell"><div class="k"><span class="tag tag-inf">Inferred</span> Matching rule</div>
      <div class="s" style="max-width:none">Distance on max temperature (per 2°C) and wetness (dry / light / ≥ 2 mm, per 0.5), matched against each past day’s <em>observed</em> weather. Target uses ${sim.target.tempSource} temperature and ${sim.target.rainSource} rain.</div></div>`;
}

function renderBars(days, s) {
  const m = activityMeans(days);
  const rows = ACTIVITIES.map((a) => ({ a, m: m[a.id], b: BASELINE[a.id] })).sort((x, y) => (y.m.mean ?? -1) - (x.m.mean ?? -1));
  const rowOn = (a) => (s.activity ? a.id === s.activity : s.group === 'all' || a.group === s.group);
  document.getElementById('bars-sub').textContent = days.length ? `Mean over ${days.length} similar days, compared with all ${HISTORICAL.length} observed days` : 'No similar days to summarise';
  const root = document.getElementById('bars');
  if (!root.children.length) {
    root.innerHTML = ACTIVITIES.map((a) => `<div class="bar" data-a="${a.id}"><span class="lbl">${a.short}</span><span class="track"><span class="fill"></span><span class="base"></span></span><span class="val"></span></div>`).join('') +
      '<div class="bars-key"><span><i style="width:14px;height:10px;background:var(--green)"></i>Similar days</span><span><i style="width:0;height:12px;border-left:1.5px solid var(--ink)"></i>All days</span></div>';
  }
  rows.forEach((r, i) => {
    const el = root.querySelector(`[data-a="${r.a.id}"]`);
    el.style.order = i;
    el.style.opacity = rowOn(r.a) ? 1 : 0.3;
    el.querySelector('.fill').style.width = `${(r.m.mean ?? 0) * 100}%`;
    el.querySelector('.base').style.left = `${r.b.mean * 100}%`;
    const delta = r.m.mean == null ? '' : Math.round((r.m.mean / r.b.mean - 1) * 100);
    el.querySelector('.val').innerHTML = r.m.mean == null ? '—' : `${r.m.mean.toFixed(2)}<span class="delta">${delta >= 0 ? '+' : ''}${delta}%</span>`;
    el.title = `${r.a.label}: ${r.m.n} of ${r.m.of} days with data`;
  });
  root.style.display = 'flex';
  root.style.flexDirection = 'column';
  root.querySelector('.bars-key').style.order = 99;
}
