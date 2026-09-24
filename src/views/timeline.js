import * as d3 from 'd3';
import { BINS, DAYS, dayByDate, fmtDate, modeBin, binOfTemp, matchesWeather, weatherById } from '../data.js';
import { subscribe, setState, getState } from '../state.js';
import { showTip, moveTip, hideTip, row } from '../util.js';

const W = 1296, H = 330;
const M = { t: 30, r: 8, b: 40, l: 40 };

export function initTimeline() {
  const root = d3.select('#timeline');
  root.append('div').attr('class', 'map-legend').style('margin', '0 0 10px').html(`
    <span><i style="background:var(--rain);border-radius:1px;width:10px;height:14px"></i>Market’s most likely range · darker = higher probability</span>
    <span><i style="background:var(--ink)"></i>Observed maximum (settlement station)</span>
    <span><i style="background:repeating-linear-gradient(45deg,#b4aea2 0 1px,transparent 1px 4px);border:1px solid #d8d1c3;border-radius:1px;width:12px"></i>No market / no observation</span>
    <span><i style="border:1.5px dashed var(--ink-2);border-radius:1px;background:transparent;width:12px;height:14px"></i>Tomorrow · not yet observed</span>`);

  const svg = root.append('svg').attr('viewBox', `0 0 ${W} ${H}`);
  const defs = svg.append('defs');
  defs.append('pattern').attr('id', 'tl-hatch').attr('width', 5).attr('height', 5).attr('patternUnits', 'userSpaceOnUse').attr('patternTransform', 'rotate(45)')
    .append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 5).attr('stroke', '#c9c2b4').attr('stroke-width', 1);

  const x = d3.scaleBand(DAYS.map((d) => d.date), [M.l, W - M.r]).paddingInner(0.2);
  const y = d3.scaleLinear([19.5, 31.5], [H - M.b, M.t]);

  // grid + axes
  const gy = svg.append('g').attr('class', 'axis');
  for (let t = 20; t <= 31; t++) {
    if (t % 2) continue;
    gy.append('line').attr('class', 'gridline').attr('x1', M.l).attr('x2', W - M.r).attr('y1', y(t)).attr('y2', y(t));
    gy.append('text').attr('x', M.l - 10).attr('y', y(t) + 4).attr('text-anchor', 'end').text(`${t}°`);
  }
  gy.append('text').attr('x', M.l - 10).attr('y', M.t - 14).attr('text-anchor', 'end').text('°C max');

  const gx = svg.append('g').attr('class', 'axis');
  DAYS.forEach((d, i) => {
    const cx = x(d.date) + x.bandwidth() / 2;
    const first = d.date.endsWith('-01');
    const beforeFirst = DAYS[i + 1]?.date.endsWith('-01') || DAYS[i - 1]?.date.endsWith('-01');
    if ((d.dow === 1 && !beforeFirst) || first || d.isForecast) {
      gx.append('line').attr('x1', cx).attr('x2', cx).attr('y1', H - M.b).attr('y2', H - M.b + 5);
      gx.append('text').attr('x', cx).attr('y', H - M.b + 18).attr('text-anchor', 'middle')
        .style('fill', d.isForecast ? 'var(--ink)' : null)
        .text(d.isForecast ? 'Tomorrow' : fmtDate(d.date));
    }
    if (first && i > 0) {
      gx.append('line').attr('x1', x(d.date) - 3).attr('x2', x(d.date) - 3).attr('y1', M.t - 6).attr('y2', H - M.b).attr('stroke', '#cbc3b3').attr('stroke-dasharray', '2 3');
      gx.append('text').attr('x', x(d.date) + 2).attr('y', M.t - 12).attr('class', 'tl-annot').text('September →');
    }
  });
  gx.append('text').attr('x', M.l).attr('y', M.t - 12).attr('class', 'tl-annot').text('August');

  const selG = svg.append('g');
  const selRule = selG.append('rect').attr('fill', 'rgba(201,113,63,0.09)');
  const selLabel = selG.append('text').attr('class', 'tl-sel-label').attr('text-anchor', 'middle');

  const line = svg.append('path').attr('class', 'tl-actual-line');
  const cols = svg.append('g');

  const col = cols.selectAll('g').data(DAYS, (d) => d.date).join('g').attr('class', 'tl-col')
    .attr('transform', (d) => `translate(${x(d.date)},0)`);

  col.append('rect').attr('class', 'tl-hit').attr('x', -x.step() * 0.1).attr('width', x.step()).attr('y', M.t - 8).attr('height', H - M.b - M.t + 8);

  const bw = x.bandwidth();
  col.filter((d) => !d.market).append('rect').attr('width', bw).attr('y', y(31.5)).attr('height', y(19.5) - y(31.5)).attr('fill', 'url(#tl-hatch)');
  col.filter((d) => d.isForecast).append('rect').attr('x', -3).attr('width', bw + 6).attr('y', M.t - 6).attr('height', H - M.b - M.t + 6)
    .attr('fill', 'none').attr('stroke', 'var(--ink-2)').attr('stroke-dasharray', '3 3');

  col.filter((d) => d.market).selectAll('rect.band').data((d) => BINS.map((b, i) => ({ d, b, i, p: d.market[i] / 100 })))
    .join('rect').attr('class', 'band').attr('width', bw).attr('rx', 1)
    .attr('y', (r) => y(r.b.hi) + 0.5).attr('height', (r) => y(r.b.lo) - y(r.b.hi) - 1)
    .attr('fill', 'var(--rain)').attr('opacity', 0);

  col.filter((d) => d.actual != null).append('circle').attr('class', 'tl-dot')
    .attr('cx', bw / 2).attr('cy', (d) => y(d.actual)).attr('r', 4.2);
  col.filter((d) => d.actual == null && !d.isForecast).append('text')
    .attr('x', bw / 2).attr('y', H - M.b - 8).attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', 'var(--ink-3)').text('×');
  col.filter((d) => d.isForecast).append('text').attr('x', bw / 2).attr('y', y(20.2)).attr('text-anchor', 'middle').attr('class', 'tl-annot').attr('font-size', 16).text('?');

  line.attr('d', d3.line().defined((d) => d.actual != null).x((d) => x(d.date) + bw / 2).y((d) => y(d.actual)).curve(d3.curveMonotoneX)(DAYS));

  col.on('click', (e, d) => setState({ date: d.date }))
    .on('mouseenter', (e, d) => showTip(e, tipHtml(d)))
    .on('mousemove', moveTip)
    .on('mouseleave', hideTip);

  // toggle
  const tg = document.getElementById('tl-toggle');
  tg.addEventListener('click', (e) => {
    const m = e.target.closest('button')?.dataset.mode;
    if (m) setState({ tlMode: m });
  });

  const readout = document.getElementById('tl-readout');
  readout.addEventListener('click', (e) => {
    const dir = e.target.closest('button')?.dataset.dir;
    if (!dir) return;
    const idx = DAYS.findIndex((d) => d.date === getState().date) + (dir === 'next' ? 1 : -1);
    if (DAYS[idx]) setState({ date: DAYS[idx].date });
  });

  subscribe((s) => {
    tg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.mode === s.tlMode));

    col.selectAll('rect.band').transition().duration(450).ease(d3.easeCubicOut)
      .attr('opacity', (r) => {
        if (s.tlMode === 'dist') return r.p < 0.005 ? 0 : 0.08 + r.p * 1.3;
        return r.i === modeBin(r.d) ? 0.25 + r.p * 1.1 : 0;
      });

    col.transition().duration(350).attr('opacity', (d) => (matchesWeather(d, s.weather) ? 1 : 0.18));
    col.selectAll('.tl-dot').attr('r', (d) => (d.date === s.date ? 6 : 4.2));

    const sx = x(s.date);
    selRule.transition().duration(300).attr('x', sx - x.step() * 0.1).attr('width', x.step()).attr('y', M.t - 8).attr('height', H - M.b - M.t + 8);
    selLabel.transition().duration(300).attr('x', sx + bw / 2).attr('y', M.t - 12)
      .text(dayByDate[s.date].isForecast ? '' : fmtDate(s.date).toUpperCase());

    renderReadout(readout, dayByDate[s.date], s);
  });
}

function tipHtml(d) {
  const t = modeBin(d);
  const head = `<div class="tt-h">${d.isForecast ? 'Tomorrow · Sep 25' : fmtDate(d.date, { weekday: 'short', month: 'short', day: 'numeric' })}</div>`;
  const mk = d.market ? row('Market most likely', `${BINS[t].label} · ${d.market[t]}%`) : row('Market', '<span class="tt-miss">No market listed</span>');
  const ac = d.isForecast ? row('Observed', '<span class="tt-miss">Not yet observed</span>')
    : d.actual != null ? row('Observed max', `${d.actual}°C`) : row('Observed', '<span class="tt-miss">No observation available</span>');
  const pr = d.precip != null ? row('Precipitation', `${d.precip} mm`) : row('Rain probability', `${Math.round(d.rainProb * 100)}% (forecast)`);
  const tags = d.tags.length ? `<div class="tt-note">Tagged: ${d.tags.map((t) => weatherById[t].label).join(', ')} · click to focus</div>` : '<div class="tt-note">Click to focus this day</div>';
  return head + mk + ac + pr + tags;
}

function renderReadout(root, d, s) {
  const i = d.i;
  const t = modeBin(d);
  const hit = binOfTemp(d.actual);
  let marketV, marketS, actualV, actualS, cmpV, cmpS;

  if (d.market) {
    const sorted = [...d.market].sort((a, b) => b - a);
    marketV = `${BINS[t].label}<small>${d.market[t]}%</small>`;
    marketS = `Top two ranges together hold ${sorted[0] + sorted[1]}% — the remaining ${100 - sorted[0] - sorted[1]}% is spread across other ranges.`;
  } else {
    marketV = '<span class="ro-missing">No market listed</span>';
    marketS = 'We do not estimate a distribution for days without a market.';
  }
  if (d.isForecast) {
    actualV = '<span class="ro-missing">Not yet observed</span>';
    actualS = 'The station reports after the day ends.';
  } else if (d.actual == null) {
    actualV = '<span class="ro-missing">No observation available</span>';
    actualS = 'Station record missing; not interpolated.';
  } else {
    actualV = `${d.actual}°C`;
    actualS = `${d.precip} mm precipitation · wind ${d.wind} km/h`;
  }
  if (d.market && d.actual != null) {
    const rank = [...d.market].map((p, k) => [p, k]).sort((a, b) => b[0] - a[0]).findIndex(([, k]) => k === hit) + 1;
    cmpV = hit === t ? 'Inside the most likely range' : `In the ${ordinal(rank)} most likely range`;
    cmpS = hit === t
      ? `The observed ${d.actual}°C fell in ${BINS[hit].label}, priced at ${d.market[hit]}%.`
      : `The observed ${d.actual}°C fell in ${BINS[hit].label}, which the market priced at ${d.market[hit]}%.`;
  } else {
    cmpV = '<span class="ro-missing">No comparison</span>';
    cmpS = d.isForecast ? 'Comparison becomes possible once the day is observed.' : 'Both a market and an observation are needed.';
  }

  root.innerHTML = `
    <div class="ro-date">${d.isForecast ? 'Tomorrow' : fmtDate(d.date, { month: 'long', day: 'numeric' })}
      <small>${d.isForecast ? 'Friday, September 25' : fmtDate(d.date, { weekday: 'long' }) + ' · selected day'}</small></div>
    <div class="ro-cell"><div class="k"><span class="tag tag-market">Market</span> Most likely range</div><div class="v">${marketV}</div><div class="s">${marketS}</div></div>
    <div class="ro-cell"><div class="k"><span class="tag tag-obs">Observed</span> Maximum temperature</div><div class="v">${actualV}</div><div class="s">${actualS}</div></div>
    <div class="ro-cell"><div class="k">Comparison</div><div class="v" style="font-size:21px">${cmpV}</div><div class="s">${cmpS}</div></div>
    <div class="ro-nav">
      <button type="button" data-dir="prev" aria-label="Previous day" ${i === 0 ? 'disabled' : ''}>‹</button>
      <button type="button" data-dir="next" aria-label="Next day" ${i === DAYS.length - 1 ? 'disabled' : ''}>›</button>
    </div>`;
}

const ordinal = (n) => ['', '', '2nd', '3rd', '4th', '5th', '6th'][n] || `${n}th`;
