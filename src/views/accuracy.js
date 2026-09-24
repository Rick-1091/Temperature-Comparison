import * as d3 from 'd3';
import { BINS, DAYS, modeBin, binOfTemp, fmtDate } from '../data.js';
import { subscribe, setState, getState } from '../state.js';
import { showTip, moveTip, hideTip, row } from '../util.js';

const W = 1296, H = 280;
const M = { t: 26, r: 8, b: 56, l: 40 };
const STRIP = H - M.b + 14;

const COPY = {
  zh: {
    windows: { all: '累计', 7: '7 日线', 14: '14 日线' },
    legendAcc: '猜中率：实测落在最高报价区间的比例',
    legendConf: '市场自己给的把握：最高报价的平均值',
    legendStrip: '每日结果：■ 猜中 · □ 没猜中 · 斜线 无法判断',
    axis: '比例',
    tomorrow: '明天 · 未结算',
    warmup: (w) => `前 ${w - 1} 天数据不足`,
    asOf: (date) => `截至 ${date}`,
    hitLabel: '猜中率', confLabel: '市场自己给的把握',
    counted: (k, n) => `${n} 个可判断的日子里猜中 ${k} 天`,
    confSub: '同一窗口内最高报价的平均值',
    verdict: (diff) => Math.abs(diff) <= 5
      ? `两条线相差 ${Math.abs(diff).toFixed(0)} 个百分点：市场最看好的选项，猜中的频率和它自己的报价大致相符。`
      : diff > 0
        ? `猜中率比市场的把握高 ${diff.toFixed(0)} 个百分点：这段时间市场偏保守，最高报价可能被低估。`
        : `猜中率比市场的把握低 ${(-diff).toFixed(0)} 个百分点：这段时间市场偏自信，最高报价可能被高估。`,
    tooFew: '这个窗口里可判断的日子太少，暂不计算。',
    tip: { acc: '猜中率', conf: '市场把握', counted: '可判断天数', result: '当天结果', hit: '猜中', miss: '没猜中', none: '无法判断', top: '最高报价区间', actual: '实测最高' },
    reason: { market: '没有市场', actual: '没有实测' },
  },
  en: {
    windows: { all: 'Cumulative', 7: '7-day', 14: '14-day' },
    legendAcc: 'Hit rate: share of days the observed max fell in the top-priced range',
    legendConf: 'Market’s own confidence: average top price',
    legendStrip: 'Daily result: ■ hit · □ miss · hatched no verdict',
    axis: 'Share',
    tomorrow: 'Tomorrow · unsettled',
    warmup: (w) => `First ${w - 1} days: not enough data`,
    asOf: (date) => `As of ${date}`,
    hitLabel: 'Hit rate', confLabel: 'Market’s own confidence',
    counted: (k, n) => `${k} hits in ${n} days with a verdict`,
    confSub: 'Average top price over the same window',
    verdict: (diff) => Math.abs(diff) <= 5
      ? `The lines are ${Math.abs(diff).toFixed(0)} point${Math.abs(diff).toFixed(0) === '1' ? '' : 's'} apart: the market’s favourite came true about as often as its own price said it would.`
      : diff > 0
        ? `Hits run ${diff.toFixed(0)} points above the market’s confidence: over this window the market looks too cautious, underpricing its top range.`
        : `Hits run ${(-diff).toFixed(0)} points below the market’s confidence: over this window the market looks overconfident, overpricing its top range.`,
    tooFew: 'Too few days with a verdict in this window to compute.',
    tip: { acc: 'Hit rate', conf: 'Market confidence', counted: 'Days with a verdict', result: 'That day', hit: 'Hit', miss: 'Miss', none: 'No verdict', top: 'Top-priced range', actual: 'Observed max' },
    reason: { market: 'no market', actual: 'no observation' },
  },
};

const lang = () => { try { return localStorage.getItem('temperature-language') === 'en' ? 'en' : 'zh'; } catch { return 'zh'; } };
const pct = (v) => `${Math.round(v * 100)}%`;
const dateLabel = (iso) => (lang() === 'en'
  ? fmtDate(iso, { month: 'short', day: 'numeric' })
  : `${Number(iso.slice(5, 7))} 月 ${Number(iso.slice(8, 10))} 日`);

const outcomes = DAYS.map((d) => {
  if (d.isForecast) return { d, status: 'open' };
  if (!d.market) return { d, status: 'none', reason: 'market' };
  if (d.actual == null) return { d, status: 'none', reason: 'actual' };
  const top = modeBin(d);
  return { d, status: 'ok', hit: top === binOfTemp(d.actual) ? 1 : 0, conf: d.market[top] / 100, top };
});

function stats(w) {
  return outcomes.map((o, i) => {
    if (o.status === 'open') return null;
    const start = w === 'all' ? 0 : i - w + 1;
    if (start < 0) return null;
    const valid = outcomes.slice(start, i + 1).filter((x) => x.status === 'ok');
    const minN = w === 'all' ? 1 : Math.ceil(w / 2);
    if (valid.length < minN) return null;
    return { i, acc: d3.mean(valid, (x) => x.hit), conf: d3.mean(valid, (x) => x.conf), hits: d3.sum(valid, (x) => x.hit), n: valid.length };
  });
}

export function initAccuracy() {
  const root = document.getElementById('accuracy');
  const toggle = document.getElementById('acc-window');
  const readout = document.getElementById('acc-readout');
  let win = 7;

  toggle.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-w]');
    if (!b) return;
    win = b.dataset.w === 'all' ? 'all' : Number(b.dataset.w);
    draw(getState());
  });
  window.addEventListener('site-language-change', () => draw(getState()));
  subscribe(draw);

  function draw(s) {
    const L = COPY[lang()];
    toggle.querySelectorAll('button').forEach((b) => {
      const on = String(win) === b.dataset.w;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
      b.textContent = L.windows[b.dataset.w];
    });
    const series = stats(win);
    renderChart(root, series, win, s.date, L);
    renderReadout(readout, series, s.date, L);
  }
}

function renderChart(root, series, win, selected, L) {
  root.innerHTML = `<div class="map-legend acc-legend">
      <span><i class="acc-key-acc"></i>${L.legendAcc}</span>
      <span><i class="acc-key-conf"></i>${L.legendConf}</span>
      <span class="acc-key-text">${L.legendStrip}</span></div>`;
  const svg = d3.select(root).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img').attr('aria-label', L.legendAcc);
  const defs = svg.append('defs');
  defs.append('pattern').attr('id', 'acc-hatch').attr('width', 4).attr('height', 4).attr('patternUnits', 'userSpaceOnUse').attr('patternTransform', 'rotate(45)')
    .append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 4).attr('stroke', '#b4aea2').attr('stroke-width', 1);

  const x = d3.scaleBand(DAYS.map((d) => d.date), [M.l, W - M.r]).paddingInner(0.2);
  const cx = (i) => x(DAYS[i].date) + x.bandwidth() / 2;
  const y = d3.scaleLinear([0, 1], [H - M.b, M.t]);

  const ga = svg.append('g').attr('class', 'axis');
  [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
    ga.append('line').attr('class', t === 0.5 ? 'gridline acc-mid' : 'gridline').attr('x1', M.l).attr('x2', W - M.r).attr('y1', y(t)).attr('y2', y(t));
    ga.append('text').attr('x', M.l - 10).attr('y', y(t) + 4).attr('text-anchor', 'end').text(pct(t));
  });
  ga.append('text').attr('x', M.l - 10).attr('y', M.t - 12).attr('text-anchor', 'end').text(L.axis);

  if (win !== 'all') {
    const x1 = cx(win - 2) + x.step() / 2;
    svg.append('rect').attr('class', 'acc-warmup').attr('x', M.l).attr('width', x1 - M.l).attr('y', M.t).attr('height', H - M.b - M.t);
    svg.append('text').attr('class', 'tl-annot').attr('x', M.l + 6).attr('y', M.t + 14).text(L.warmup(win));
  }

  const segs = [];
  let cur = [];
  series.forEach((p) => { if (p) cur.push(p); else if (cur.length) { segs.push(cur); cur = []; } });
  if (cur.length) segs.push(cur);
  const line = (key) => d3.line().x((p) => cx(p.i)).y((p) => y(p[key])).curve(d3.curveMonotoneX);
  segs.forEach((seg) => {
    svg.append('path').attr('class', 'acc-conf').attr('d', line('conf')(seg));
    svg.append('path').attr('class', 'acc-acc').attr('d', line('acc')(seg));
  });

  const selIdx = DAYS.findIndex((d) => d.date === selected);
  const sx = cx(selIdx);
  svg.append('line').attr('class', 'tl-sel-rule').attr('x1', sx).attr('x2', sx).attr('y1', M.t - 6).attr('y2', STRIP + 8);

  const s = x.bandwidth();
  outcomes.forEach((o, i) => {
    const g = svg.append('g').attr('class', 'tl-col');
    g.append('rect').attr('class', 'tl-hit').attr('x', x(o.d.date) - (x.step() - s) / 2).attr('width', x.step()).attr('y', M.t).attr('height', STRIP + 10 - M.t);
    const size = Math.min(s, 10);
    const bx = cx(i) - size / 2;
    if (o.status === 'ok') g.append('rect').attr('class', o.hit ? 'acc-cell hit' : 'acc-cell miss').attr('x', bx).attr('y', STRIP - size / 2).attr('width', size).attr('height', size);
    else if (o.status === 'none') g.append('rect').attr('class', 'acc-cell none').attr('x', bx).attr('y', STRIP - size / 2).attr('width', size).attr('height', size).attr('fill', 'url(#acc-hatch)');
    else g.append('rect').attr('class', 'acc-cell open').attr('x', bx).attr('y', STRIP - size / 2).attr('width', size).attr('height', size);

    const p = series[i];
    if (p) {
      g.append('circle').attr('class', 'acc-conf-dot').attr('cx', cx(i)).attr('cy', y(p.conf)).attr('r', i === selIdx ? 4 : 2.2);
      g.append('circle').attr('class', 'acc-acc-dot').attr('cx', cx(i)).attr('cy', y(p.acc)).attr('r', i === selIdx ? 5 : 2.6);
    }
    g.on('click', () => setState({ date: o.d.date }))
      .on('pointerenter', (e) => {
        const day = o.status === 'ok'
          ? `${row(L.tip.top, BINS[o.top].label)}${row(L.tip.actual, `${o.d.actual}°C`)}${row(L.tip.result, o.hit ? L.tip.hit : L.tip.miss)}`
          : o.status === 'none' ? row(L.tip.result, `${L.tip.none} · ${L.reason[o.reason]}`) : row(L.tip.result, L.tomorrow);
        const agg = p ? `${row(L.tip.acc, `${pct(p.acc)} (${p.hits}/${p.n})`)}${row(L.tip.conf, pct(p.conf))}` : '';
        showTip(e, `<div class="tt-h">${dateLabel(o.d.date)}</div>${day}${agg}`);
      })
      .on('pointermove', moveTip).on('pointerleave', hideTip);
  });

  const last = outcomes.length - 1;
  svg.append('text').attr('class', 'tl-annot').attr('x', cx(last)).attr('y', STRIP + 26).attr('text-anchor', 'end').text(L.tomorrow);
}

function renderReadout(node, series, selected, L) {
  let idx = DAYS.findIndex((d) => d.date === selected);
  if (DAYS[idx].isForecast) idx -= 1;
  const p = series[idx];
  const head = `<p class="side-kicker">${L.asOf(dateLabel(DAYS[idx].date))}</p>`;
  if (!p) { node.innerHTML = `${head}<p class="acc-verdict">${L.tooFew}</p>`; return; }
  node.innerHTML = `${head}
    <div class="acc-figs">
      <div><span>${L.hitLabel}</span><strong class="acc-acc-text">${pct(p.acc)}</strong><small>${L.counted(p.hits, p.n)}</small></div>
      <div><span>${L.confLabel}</span><strong class="acc-conf-text">${pct(p.conf)}</strong><small>${L.confSub}</small></div>
    </div>
    <p class="acc-verdict">${L.verdict((p.acc - p.conf) * 100)}</p>`;
}
