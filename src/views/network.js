import * as d3 from 'd3';
import { WEATHER, ACTIVITIES, associations, BASELINE, dayByDate, fmtDate, weatherById, activityById } from '../data.js';
import { subscribe, setState, getState } from '../state.js';
import { showTip, moveTip, hideTip, row } from '../util.js';

const W = 1296, H = 520;
const LX = 330, RX = 966, TOP = 86, BOT = 480;
const THRESH = 1.05;
const SMALL_N = 10;

export function initNetwork() {
  const { edges: all, counts } = associations();
  const edges = all.filter((e) => e.lift >= THRESH);
  const maxLift = d3.max(edges, (e) => e.lift);
  const sw = d3.scaleLinear([THRESH - 1, maxLift - 1], [1.5, 16]);

  const yl = d3.scalePoint(WEATHER.map((w) => w.id), [TOP, BOT]).padding(0.3);
  const yr = d3.scalePoint(ACTIVITIES.map((a) => a.id), [TOP, BOT]).padding(0.3);

  const svg = d3.select('#network').append('svg').attr('viewBox', `0 0 ${W} ${H}`);
  svg.append('text').attr('class', 'n-colhead').attr('x', LX).attr('y', 34).attr('text-anchor', 'end').text('Weather condition · days observed');
  svg.append('text').attr('class', 'n-colhead').attr('x', RX).attr('y', 34).text('Activity · average level, all days');
  svg.append('line').attr('x1', 60).attr('x2', LX + 10).attr('y1', 46).attr('y2', 46).attr('stroke', 'var(--rule)');
  svg.append('line').attr('x1', RX - 10).attr('x2', W - 60).attr('y1', 46).attr('y2', 46).attr('stroke', 'var(--rule)');
  svg.append('text').attr('class', 'n-colhead').attr('x', (LX + RX) / 2).attr('y', 34).attr('text-anchor', 'middle').text('Observed association (lift over all-day average)');

  const link = d3.linkHorizontal().x((p) => p[0]).y((p) => p[1]);
  const eG = svg.append('g');
  const eSel = eG.selectAll('path').data(edges).join('path').attr('class', 'n-edge')
    .attr('d', (e) => link({ source: [LX + 14, yl(e.source)], target: [RX - 14, yr(e.target)] }))
    .attr('stroke', (e) => weatherById[e.source].color)
    .attr('stroke-width', (e) => sw(e.lift - 1))
    .attr('stroke-dasharray', (e) => (e.n < SMALL_N ? '8 6' : null))
    .attr('stroke-linecap', (e) => (e.n < SMALL_N ? 'butt' : 'round'));

  const lblG = svg.append('g').style('pointer-events', 'none');

  // weather nodes
  const wn = svg.append('g').selectAll('g').data(WEATHER).join('g').attr('class', 'n-node')
    .attr('transform', (w) => `translate(${LX},${yl(w.id)})`);
  wn.append('rect').attr('class', 'bg').attr('x', -300).attr('y', -26).attr('width', 320).attr('height', 52);
  wn.append('circle').attr('class', 'mark').attr('r', 8).attr('fill', (w) => w.color);
  wn.append('text').attr('class', 'lbl').attr('x', -22).attr('y', 3).attr('text-anchor', 'end').text((w) => w.label);
  wn.append('text').attr('class', 'sub').attr('x', -22).attr('y', 20).attr('text-anchor', 'end')
    .text((w) => `${counts[w.id]} days${counts[w.id] < SMALL_N ? ' · small sample' : ''}${edges.some((e) => e.source === w.id) ? '' : ' · no link ≥ 5%'}`);
  const today = wn.append('text').attr('class', 'n-today').attr('text-anchor', 'end').attr('y', -16).attr('x', -22);

  // activity nodes
  const an = svg.append('g').selectAll('g').data(ACTIVITIES).join('g').attr('class', 'n-node')
    .attr('transform', (a) => `translate(${RX},${yr(a.id)})`);
  an.append('rect').attr('class', 'bg').attr('x', -20).attr('y', -26).attr('width', 320).attr('height', 52);
  an.append('circle').attr('class', 'mark').attr('r', 8).attr('fill', 'var(--paper)').attr('stroke', 'var(--green-dark)').attr('stroke-width', 1.5);
  an.append('circle').attr('r', (a) => 8 * Math.sqrt(BASELINE[a.id].mean)).attr('fill', 'var(--green)');
  an.append('text').attr('class', 'lbl').attr('x', 22).attr('y', 3).text((a) => a.label);
  an.append('text').attr('class', 'sub').attr('x', 22).attr('y', 20).text((a) => `${a.group} · avg ${BASELINE[a.id].mean.toFixed(2)} · ${a.indoor ? 'indoor' : 'outdoor'}`);

  let hover = null;
  const apply = () => {
    const s = getState();
    const focusW = hover?.type === 'weather' ? hover.id : s.weather !== 'all' ? s.weather : null;
    const focusA = hover?.type === 'activity' ? hover.id : s.activity;
    const focusE = hover?.type === 'edge' ? hover.e : null;
    const groupA = !focusA && s.group !== 'all' ? s.group : null;

    const edgeOn = (e) => {
      if (focusE) return e === focusE;
      if (focusW && focusA) return e.source === focusW && e.target === focusA;
      if (focusW) return e.source === focusW;
      if (focusA) return e.target === focusA;
      if (groupA) return activityById[e.target].group === groupA;
      return true;
    };
    const anyFocus = focusE || focusW || focusA || groupA;
    eSel.transition().duration(250).attr('stroke-opacity', (e) => (edgeOn(e) ? (anyFocus ? 0.85 : 0.42) : 0.05));

    const onEdges = edges.filter(edgeOn);
    wn.transition().duration(250).style('opacity', (w) => (!anyFocus || w.id === focusW || onEdges.some((e) => e.source === w.id) ? 1 : 0.25));
    an.transition().duration(250).style('opacity', (a) =>
      (!anyFocus || a.id === focusA || (groupA && a.group === groupA) || onEdges.some((e) => e.target === a.id) ? 1 : 0.25));
    wn.classed('sel', (w) => w.id === s.weather);
    an.classed('sel', (a) => a.id === s.activity);

    const labels = anyFocus ? onEdges : [];
    lblG.selectAll('text').data(labels, (e) => e.source + e.target).join(
      (en) => en.append('text').attr('font-family', 'var(--mono)').attr('font-size', 11).attr('fill', 'var(--ink-2)').attr('text-anchor', 'start')
        .attr('paint-order', 'stroke').attr('stroke', 'var(--bg)').attr('stroke-width', 4),
    ).attr('x', RX - 72).attr('y', (e) => yr(e.target) - 8 + (yl(e.source) - yr(e.target)) * 0.12)
      .text((e) => `+${Math.round((e.lift - 1) * 100)}%`);
  };

  wn.on('mouseenter', (e, w) => { hover = { type: 'weather', id: w.id }; apply(); showTip(e, weatherTip(w, counts, edges)); })
    .on('mousemove', moveTip).on('mouseleave', () => { hover = null; apply(); hideTip(); })
    .on('click', (e, w) => setState({ weather: getState().weather === w.id ? 'all' : w.id }));
  an.on('mouseenter', (e, a) => { hover = { type: 'activity', id: a.id }; apply(); showTip(e, activityTip(a, edges)); })
    .on('mousemove', moveTip).on('mouseleave', () => { hover = null; apply(); hideTip(); })
    .on('click', (e, a) => setState({ activity: getState().activity === a.id ? null : a.id }));
  eSel.on('mouseenter', (ev, e) => {
    hover = { type: 'edge', e }; apply();
    showTip(ev, `<div class="tt-h">${weatherById[e.source].label} → ${activityById[e.target].short}</div>` +
      row(`Mean on ${weatherById[e.source].label.toLowerCase()} days`, e.mean.toFixed(2)) + row('Mean on all days', e.base.toFixed(2)) +
      row('Lift', `+${Math.round((e.lift - 1) * 100)}%`) + row('Days with data', e.n + (e.n < SMALL_N ? ' · small sample' : '')) +
      '<div class="tt-note">Co-occurrence in the activity log. Not a causal effect.</div>');
  }).on('mousemove', moveTip).on('mouseleave', () => { hover = null; apply(); hideTip(); })
    .on('click', (ev, e) => setState({ weather: e.source, activity: e.target }));

  // legend
  document.getElementById('net-legend').innerHTML = [0.05, 0.2, 0.4].filter((v) => v <= maxLift - 1 + 0.01).map((v) =>
    `<span><svg width="44" height="18"><line x1="2" x2="42" y1="9" y2="9" stroke="#8a857a" stroke-width="${sw(v)}" stroke-linecap="round"/></svg> +${Math.round(v * 100)}%</span>`).join('') +
    '<span>above all-day average</span>' +
    `<span><svg width="44" height="18"><line x1="2" x2="42" y1="9" y2="9" stroke="#8a857a" stroke-width="3" stroke-dasharray="7 6"/></svg> fewer than ${SMALL_N} days — treat with caution</span>` +
    '<span style="color:var(--ink-3)">Color = weather condition · links below +5% not drawn</span>';

  subscribe((s) => {
    const d = dayByDate[s.date];
    const tags = d.isForecast ? d.expectedTags : d.tags;
    today.text((w) => (tags.includes(w.id) ? (d.isForecast ? 'EXPECTED TOMORROW' : fmtDate(d.date).toUpperCase()) : ''));
    wn.select('circle.mark').transition().duration(300).attr('r', (w) => (tags.includes(w.id) ? 11 : 8))
      .attr('stroke', (w) => (tags.includes(w.id) ? 'var(--warm)' : 'none')).attr('stroke-width', 2);
    apply();
  });
}

function weatherTip(w, counts, edges) {
  const es = edges.filter((e) => e.source === w.id).sort((a, b) => b.lift - a.lift);
  return `<div class="tt-h">${w.label}</div>` + row('Definition', w.rule) + row('Days observed', counts[w.id]) +
    (es.length ? es.map((e) => row(activityById[e.target].short, `+${Math.round((e.lift - 1) * 100)}%`)).join('')
      : '<div class="tt-note">No activity is ≥ 5% above its average on these days.</div>') +
    '<div class="tt-note">Click to filter every view to this condition.</div>';
}
function activityTip(a, edges) {
  const es = edges.filter((e) => e.target === a.id).sort((x, y) => y.lift - x.lift);
  return `<div class="tt-h">${a.label}</div>` + row('Average level', BASELINE[a.id].mean.toFixed(2)) + row('Days with data', BASELINE[a.id].n) +
    (es.length ? es.map((e) => row(weatherById[e.source].label, `+${Math.round((e.lift - 1) * 100)}%`)).join('')
      : '<div class="tt-note">Not ≥ 5% above average under any condition.</div>') +
    '<div class="tt-note">Click to focus this activity across views.</div>';
}
