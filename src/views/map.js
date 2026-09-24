import * as d3 from 'd3';
import {
  HISTORICAL, WEATHER, GROUPS, ACTIVITIES, CATEGORIES, categoryById, activityById, weatherById,
  PLACES, CORRIDORS, DISTRICTS, GREEN_AREAS, STREETS, MAP_EXTENT, dayByDate, fmtDate,
  activityMeans, BASELINE, findSimilar,
} from '../data.js';
import { subscribe, setState, getState } from '../state.js';
import { showTip, moveTip, hideTip, row, level } from '../util.js';

const W = 880;
const lonSpan = MAP_EXTENT.lon[1] - MAP_EXTENT.lon[0];
const latSpan = MAP_EXTENT.lat[1] - MAP_EXTENT.lat[0];
const H = Math.round((W * latSpan) / (lonSpan * Math.cos((19.42 * Math.PI) / 180)));
const px = ([lon, lat]) => [((lon - MAP_EXTENT.lon[0]) / lonSpan) * W, ((MAP_EXTENT.lat[1] - lat) / latSpan) * H];
const path = (pts, close) => 'M' + pts.map((p) => px(p).join(',')).join('L') + (close ? 'Z' : '');

export function mapContext(s) {
  const sel = dayByDate[s.date];
  if (s.weather !== 'all') {
    const days = HISTORICAL.filter((d) => d.tags.includes(s.weather));
    return { mode: 'weather', days, label: `${days.length} historical ${weatherById[s.weather].label.toLowerCase()} days` };
  }
  if (sel.activity) return { mode: 'observed', days: [sel], label: fmtDate(sel.date, { month: 'long', day: 'numeric' }) };
  const sim = findSimilar(sel, 8, 'all').results.map((r) => r.day);
  return { mode: 'similar', days: sim, label: `${sim.length} days similar to ${sel.isForecast ? 'tomorrow' : fmtDate(sel.date)}` };
}

function visibleCat(s, catId, activityId) {
  if (s.activity) return activityId === s.activity;
  if (s.group !== 'all') return activityById[activityId].group === s.group;
  return true;
}

export function initMap() {
  buildFilters();

  const svg = d3.select('#map').append('svg').attr('viewBox', `0 0 ${W} ${H}`);
  const defs = svg.append('defs');
  defs.append('pattern').attr('id', 'hatch').attr('width', 4).attr('height', 4).attr('patternUnits', 'userSpaceOnUse').attr('patternTransform', 'rotate(45)')
    .call((p) => { p.append('rect').attr('width', 4).attr('height', 4).attr('fill', '#faf8f3'); p.append('line').attr('y2', 4).attr('stroke', '#a39c8e'); });

  svg.append('g').selectAll('path').data(GREEN_AREAS).join('path').attr('class', 'm-green').attr('d', (d) => path(d.poly, true));
  svg.append('g').selectAll('path').data(DISTRICTS).join('path').attr('class', 'm-district').attr('d', (d) => path(d.poly, true));
  svg.append('g').selectAll('path').data(STREETS).join('path').attr('class', 'm-street').attr('d', (d) => path(d.pts));

  const sl = svg.append('g');
  sl.append('text').attr('class', 'm-street-label').attr('transform', () => { const [x, y] = px([-99.1552, 19.4348]); return `translate(${x},${y}) rotate(-24)`; }).text('PASEO DE LA REFORMA');
  sl.append('text').attr('class', 'm-street-label').attr('transform', () => { const [x, y] = px([-99.1648, 19.4400]); return `translate(${x},${y}) rotate(84)`; }).text('AV. INSURGENTES');
  svg.append('text').attr('class', 'm-green-label').attr('x', px([-99.2005, 19.4135])[0]).attr('y', px([-99.2005, 19.4135])[1]).text('Bosque de Chapultepec');
  svg.append('g').selectAll('text').data(DISTRICTS).join('text').attr('class', 'm-district-label')
    .attr('x', (d) => px(d.label)[0]).attr('y', (d) => px(d.label)[1]).attr('text-anchor', 'middle').text((d) => d.name);

  const corr = svg.append('g').selectAll('path').data(CORRIDORS).join('path').attr('class', 'm-corridor')
    .attr('d', (d) => path(d.pts)).attr('stroke', categoryById.corridor.color);

  const places = svg.append('g').selectAll('g').data(PLACES).join('g').attr('class', 'm-place')
    .attr('transform', (d) => `translate(${px(d.ll)})`);
  places.append('circle').attr('class', 'halo').attr('stroke', (d) => categoryById[d.cat].color);
  places.append('circle').attr('class', 'core').attr('fill', (d) => categoryById[d.cat].color);

  // scale + north
  const kmPx = (1 / (111.32 * Math.cos((19.42 * Math.PI) / 180)) / lonSpan) * W;
  const sc = svg.append('g').attr('class', 'm-scale').attr('transform', `translate(${W - kmPx - 24},${H - 22})`);
  sc.append('path').attr('d', `M0,0V5H${kmPx}V0`).attr('fill', 'none').attr('stroke', '#8a857a');
  sc.append('text').attr('x', kmPx / 2).attr('y', -5).attr('text-anchor', 'middle').text('1 km');
  const no = svg.append('g').attr('class', 'm-north').attr('transform', `translate(${W - 28},30)`);
  no.append('path').attr('d', 'M0,-12L5,4L0,0L-5,4Z').attr('fill', '#4f4b44');
  no.append('text').attr('y', 18).attr('text-anchor', 'middle').text('N');

  const r = d3.scaleSqrt([0, 1], [0, 17]);

  const tipFor = (e, d, v, isCorr) => {
    const s = getState();
    const ctx = mapContext(s);
    const act = isCorr ? d.activity : categoryById[d.cat].activity;
    const cat = isCorr ? categoryById.corridor : categoryById[d.cat];
    const src = ctx.mode === 'observed' ? `Observed on ${ctx.label}` : `Mean over ${ctx.label}`;
    showTip(e, `<div class="tt-h">${d.name}</div>` + row('Area', d.area) + row('Category', cat.label) +
      row(`${activityById[act].short} level`, v == null ? '<span class="tt-miss">No observation available</span>' : `${level(v)} · ${v.toFixed(2)}`) +
      `<div class="tt-note">${ctx.mode === 'observed' ? '● ' : '◌ Inferred · '}${src}. Click to focus ${activityById[act].short.toLowerCase()} across all views.</div>`);
  };

  places.on('mouseenter', function (e, d) { tipFor(e, d, this.__v, false); }).on('mousemove', moveTip).on('mouseleave', hideTip)
    .on('click', (e, d) => { const a = categoryById[d.cat].activity; setState({ activity: getState().activity === a ? null : a }); });
  corr.on('mouseenter', function (e, d) { tipFor(e, d, this.__v, true); }).on('mousemove', moveTip).on('mouseleave', hideTip)
    .on('click', (e, d) => setState({ activity: getState().activity === d.activity ? null : d.activity }));

  window.addEventListener('site-language-change', () => { const s = getState(); const ctx = mapContext(s); renderMode(ctx, s); renderPattern(ctx, activityMeans(ctx.days), s); });
  subscribe((s) => {
    const ctx = mapContext(s);
    const m = activityMeans(ctx.days);
    const val = (act, pop) => (m[act].mean == null ? null : m[act].mean * pop);

    places.each(function (d) { this.__v = val(categoryById[d.cat].activity, d.pop); });
    corr.each(function (d) { this.__v = val(d.activity, d.pop); });

    places.classed('missing', function () { return this.__v == null; })
      .transition().duration(500).ease(d3.easeCubicOut)
      .style('opacity', (d) => (visibleCat(s, d.cat, categoryById[d.cat].activity) ? 1 : 0.08));
    places.select('circle.core').transition().duration(500).ease(d3.easeCubicOut)
      .attr('r', function () { const v = this.parentNode.__v; return v == null ? 6 : Math.max(3, r(v)); })
      .attr('fill-opacity', 0.88);
    places.select('circle.halo').transition().duration(500)
      .attr('r', function () { const v = this.parentNode.__v; return v == null ? 0 : Math.max(3, r(v)) + 3.5; })
      .attr('stroke-opacity', 0.35);
    corr.transition().duration(500)
      .attr('stroke-width', function () { const v = this.__v; return v == null ? 2 : 2 + v * 9; })
      .attr('stroke-dasharray', function () { return this.__v == null ? '2 4' : null; })
      .attr('stroke-opacity', (d) => (visibleCat(s, 'corridor', d.activity) ? 0.75 : 0.06));

    renderMode(ctx, s);
    renderLegend(s);
    renderPattern(ctx, m, s);
    renderDistricts(s);
    syncFilters(s);
  });

  function renderDistricts(s) {
    const areas = ['Roma Norte', 'Condesa', 'Juárez', 'Centro Histórico', 'Polanco', 'Chapultepec'];
    const sums = areas.map((a) => {
      let ind = 0, out = 0;
      places.each(function (d) {
        if (d.area !== a || this.__v == null || !visibleCat(s, d.cat, categoryById[d.cat].activity)) return;
        if (categoryById[d.cat].indoor) ind += this.__v; else out += this.__v;
      });
      corr.each(function (d) {
        if (d.area !== a || this.__v == null || !visibleCat(s, 'corridor', d.activity)) return;
        out += this.__v;
      });
      return { a, ind, out, tot: ind + out };
    });
    const max = Math.max(...sums.map((x) => x.tot), 0.001);
    document.getElementById('district-bars').innerHTML = `
      <h4>Activity by district · indoor vs outdoor</h4>
      ${sums.map((x) => `
        <div class="dbar"><span>${x.a}</span>
          <span class="track"><i style="width:${(x.ind / max) * 100}%;background:#3F5F86"></i><i style="width:${(x.out / max) * 100}%;background:#9DB38F"></i></span>
          <span class="pct">${x.tot ? Math.round((x.ind / x.tot) * 100) + '% in' : '—'}</span></div>`).join('')}
      <div class="dbar-key"><span><i style="background:#3F5F86"></i>Indoor</span><span><i style="background:#9DB38F"></i>Outdoor</span><span>Bar length = summed activity of visible places</span></div>`;
  }
}

const lang = () => { try { return localStorage.getItem('temperature-language') === 'en' ? 'en' : 'zh'; } catch { return 'zh'; } };
const ZH_WEATHER = { sunny: '晴朗', rainy: '降雨', hot: '炎热', cool: '凉爽', windy: '大风' };
const ZH_ACT = { cafe: '户外咖啡店', cowork: '共享办公', walk: '步行', cycle: '骑行', park: '公园', museum: '室内休闲' };
const zhDate = (iso) => { const [, m, d] = iso.split('-').map(Number); return `${m}月${d}日`; };

function renderMode(ctx, s) {
  const el = document.getElementById('map-mode');
  const tag = ctx.mode === 'observed' ? '<span class="tag tag-obs">Observed</span>' : '<span class="tag tag-inf">Inferred</span>';
  const sel = dayByDate[s.date];
  let txt;
  if (lang() === 'zh') {
    txt = ctx.mode === 'observed'
      ? `显示 <b>${zhDate(sel.date)}实测</b>的活动。`
      : ctx.mode === 'weather'
        ? `显示 <b>历史上 ${ctx.days.length} 个${ZH_WEATHER[s.weather]}日</b>的平均活动。设置天气筛选时，所选日期不起作用。`
        : `${sel.isForecast ? '明天' : '这一天'}没有活动实测，因此显示 <b>与${sel.isForecast ? '明天' : zhDate(sel.date)}相似的 ${ctx.days.length} 天</b>的平均值（见第 03 节）。`;
  } else {
    txt = ctx.mode === 'observed'
      ? `Showing activity <b>observed on ${ctx.label}</b>.`
      : ctx.mode === 'weather'
        ? `Showing mean activity across <b>${ctx.label}</b>. The selected date is ignored while a weather filter is set.`
        : `No activity is observed for ${sel.isForecast ? 'tomorrow' : 'this day'}. Showing the mean across <b>${ctx.label}</b> (see section 03).`;
  }
  el.innerHTML = tag + `<span>${txt}</span>`;
}

function renderLegend(s) {
  document.getElementById('map-legend').innerHTML = CATEGORIES.map((c) => {
    const on = c.id === 'corridor' ? ['walk', 'cycle'].some((a) => visibleCat(s, c.id, a)) : visibleCat(s, c.id, c.activity);
    return `<span class="${on ? '' : 'off'}"><i class="${c.id === 'corridor' ? 'line' : ''}" style="background:${c.color}"></i>${c.label}</span>`;
  }).join('') + '<span class="size">Size = relative activity level · hatched = no observation</span>';
}

function renderPattern(ctx, m, s) {
  if (lang() === 'zh') { renderPatternZh(ctx, m, s); return; }
  const b = BASELINE;
  const scope = ctx.mode === 'weather' ? `On historically ${weatherById[s.weather].label.toLowerCase()} days <span class="num">(n = ${ctx.days.length})</span>`
    : ctx.mode === 'observed' ? `On ${ctx.label}` : `On the ${ctx.days.length} historically similar days`;
  const sum = (mm, ids) => ids.reduce((acc, id) => acc + (mm[id].mean || 0), 0);
  const share = (mm, num, den) => sum(mm, num) / (sum(mm, den) || 1);
  const P = (v) => `${Math.round(v * 100)}%`;
  let text;

  if (s.activity) {
    const a = activityById[s.activity];
    if (m[a.id].mean == null) text = `${scope}, <span class="num">no observation available</span> for ${a.short.toLowerCase()}.`;
    else {
      const rel = m[a.id].mean / b[a.id].mean - 1;
      text = `${scope}, ${a.short.toLowerCase()} activity was <span class="num ${rel > 0 ? 'warm' : ''}">${Math.abs(Math.round(rel * 100))}% ${rel >= 0 ? 'higher' : 'lower'}</span> than its average across all observed days.`;
    }
  } else if (s.group === 'work') {
    text = `${scope}, indoor coworking made up <span class="num">${P(share(m, ['cowork'], ['cowork', 'cafe']))}</span> of observed work-related activity, compared with ${P(share(b, ['cowork'], ['cowork', 'cafe']))} across all days.`;
  } else if (s.group === 'mobility') {
    const rel = sum(m, ['walk', 'cycle']) / sum(b, ['walk', 'cycle']) - 1;
    text = `${scope}, walking and cycling were <span class="num ${rel > 0 ? 'warm' : ''}">${Math.abs(Math.round(rel * 100))}% ${rel >= 0 ? 'above' : 'below'}</span> their average level across all days.`;
  } else if (s.group === 'leisure') {
    text = `${scope}, indoor venues made up <span class="num">${P(share(m, ['museum'], ['museum', 'park']))}</span> of observed leisure activity, compared with ${P(share(b, ['museum'], ['museum', 'park']))} across all days.`;
  } else {
    const all = ACTIVITIES.map((a) => a.id);
    const si = share(m, ['cowork', 'museum'], all), bi = share(b, ['cowork', 'museum'], all);
    const more = si > bi + 0.02 ? 'more' : si < bi - 0.02 ? 'less' : 'about as';
    text = `${scope}, indoor locations were ${more} frequently represented in the observed activity data: <span class="num">${P(si)}</span> of activity, vs ${P(bi)} across all days.`;
  }
  document.getElementById('map-pattern').innerHTML = text +
    '<span class="caveat">A description of the (simulated) activity log. It does not indicate which place is better, and says nothing about why.</span>';
}

function renderPatternZh(ctx, m, s) {
  const b = BASELINE;
  const scope = ctx.mode === 'weather' ? `在历史上的${ZH_WEATHER[s.weather]}日 <span class="num">(n = ${ctx.days.length})</span>`
    : ctx.mode === 'observed' ? `在${zhDate(dayByDate[s.date].date)}` : `在历史上 ${ctx.days.length} 个相似天气日`;
  const sum = (mm, ids) => ids.reduce((acc, id) => acc + (mm[id].mean || 0), 0);
  const share = (mm, num, den) => sum(mm, num) / (sum(mm, den) || 1);
  const P = (v) => `${Math.round(v * 100)}%`;
  let text;

  if (s.activity) {
    const id = s.activity;
    if (m[id].mean == null) text = `${scope}，${ZH_ACT[id]}<span class="num">没有可用实测</span>。`;
    else {
      const rel = m[id].mean / b[id].mean - 1;
      text = `${scope}，${ZH_ACT[id]}活动比全部实测日的平均水平${rel >= 0 ? '高' : '低'} <span class="num ${rel > 0 ? 'warm' : ''}">${Math.abs(Math.round(rel * 100))}%</span>。`;
    }
  } else if (s.group === 'work') {
    text = `${scope}，室内共享办公占实测工作类活动的 <span class="num">${P(share(m, ['cowork'], ['cowork', 'cafe']))}</span>，全部日期为 ${P(share(b, ['cowork'], ['cowork', 'cafe']))}。`;
  } else if (s.group === 'mobility') {
    const rel = sum(m, ['walk', 'cycle']) / sum(b, ['walk', 'cycle']) - 1;
    text = `${scope}，步行与骑行比全部日期的平均水平${rel >= 0 ? '高' : '低'} <span class="num ${rel > 0 ? 'warm' : ''}">${Math.abs(Math.round(rel * 100))}%</span>。`;
  } else if (s.group === 'leisure') {
    text = `${scope}，室内场馆占实测休闲活动的 <span class="num">${P(share(m, ['museum'], ['museum', 'park']))}</span>，全部日期为 ${P(share(b, ['museum'], ['museum', 'park']))}。`;
  } else {
    const all = ACTIVITIES.map((a) => a.id);
    const si = share(m, ['cowork', 'museum'], all), bi = share(b, ['cowork', 'museum'], all);
    const more = si > bi + 0.02 ? '更高' : si < bi - 0.02 ? '更低' : '相近';
    text = `${scope}，室内地点在实测活动中的占比${more}：<span class="num">${P(si)}</span>，全部日期为 ${P(bi)}。`;
  }
  document.getElementById('map-pattern').innerHTML = text +
    '<span class="caveat">这只是对（模拟）活动记录的描述，不代表哪个地点更好，也不解释原因。</span>';
}

function buildFilters() {
  const fw = document.getElementById('f-weather');
  fw.innerHTML = `<button class="chip" data-w="all" type="button">All</button>` + WEATHER.map((w) =>
    `<button class="chip" data-w="${w.id}" type="button" title="${w.rule}"><span class="sw" style="background:${w.color}"></span>${w.label}<span class="cnt">${HISTORICAL.filter((d) => d.tags.includes(w.id)).length}</span></button>`).join('');
  fw.addEventListener('click', (e) => { const w = e.target.closest('button')?.dataset.w; if (w) setState({ weather: w }); });

  const fg = document.getElementById('f-group');
  fg.innerHTML = `<button class="chip" data-g="all" type="button">All</button>` + GROUPS.map((g) =>
    `<button class="chip" data-g="${g.id}" type="button">${g.label}</button>`).join('');
  fg.addEventListener('click', (e) => { const g = e.target.closest('button')?.dataset.g; if (g) setState({ group: g, activity: null }); });
}

function syncFilters(s) {
  document.querySelectorAll('#f-weather .chip').forEach((b) => b.classList.toggle('on', b.dataset.w === s.weather));
  document.querySelectorAll('#f-group .chip').forEach((b) => b.classList.toggle('on', b.dataset.g === (s.activity ? activityById[s.activity].group : s.group)));
}
