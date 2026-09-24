import { HISTORICAL, binOfTemp } from '../data.js';

const THREATS = {
  cold: { bins: [0, 1] },
  hot: { bins: [4, 5] },
};
const withMarket = HISTORICAL.filter((d) => d.market);
const observed = HISTORICAL.filter((d) => d.actual != null);
for (const t of Object.values(THREATS)) {
  t.price = withMarket.reduce((s, d) => s + t.bins.reduce((a, b) => a + d.market[b], 0), 0) / withMarket.length / 100;
  t.freq = observed.filter((d) => t.bins.includes(binOfTemp(d.actual))).length / observed.length;
  t.days = observed.length;
}

const PRESETS = {
  cafe: { threat: 'cold', revenue: 1000, loss: 20 },
  tour: { threat: 'hot', revenue: 800, loss: 35 },
};

const COPY = {
  zh: {
    business: '经营者', presets: { cafe: '屋顶咖啡馆 · 怕冷', tour: '户外步行导览 · 怕热' },
    threat: '让他亏钱的天气', threats: { cold: '低温 · 最高 ≤23°C', hot: '高温 · 最高 ≥28°C' },
    revenue: '正常一天的营业额', loss: '坏天气时营业额减少', price: '这种天气在 Polymarket 上的价格', stake: '每天买合约花费', badDays: '这个月出现坏天气的天数',
    full: '完全对冲', fullHint: (v) => `完全对冲 = 损失 × 价格 ≈ $${v}`,
    priceHint: (t) => `本页过去 ${t.days} 天的平均价格为 ${Math.round(t.price * 100)}¢`,
    daysHint: (t) => `本页数据里这种天气出现的比例为 ${Math.round(t.freq * 100)}%`,
    mech: (p, s, stake, name) => `以每股 ${p}¢ 买入 <b>${s}</b> 股 Yes，花费 <b>$${stake}</b>。如果出现${name}，每股赔付 $1，共 <b>$${s}</b>；否则合约作废。`,
    cols: ['', '不对冲', '对冲'],
    rows: { good: '正常天气的一天', bad: '坏天气的一天', month: '一个月（30 天）', worst: '最糟糕的一天' },
    rowSub: { good: '只付出合约费用', bad: '合约赔付抵消损失', month: (n) => `其中 ${n} 天坏天气`, worst: '单日最大损失' },
    cost: '对冲成本', payout: '赔付', vsNormal: '与正常营业日相比的盈亏',
    verdictWin: (v) => `这个月坏天气比市场价格暗示的更多，对冲不仅抵消了损失，还多赚了 <b>$${v}</b>。`,
    verdictLose: (v, a, b) => `这个月坏天气不多，对冲净花费 <b>$${v}</b>，就像一笔保险费；换来的是最糟糕的一天从 <b>−$${a}</b> 缩小到 <b>−$${b}</b>。`,
    verdictEven: '这个月对冲基本不赚不亏，但把最糟糕一天的损失压低了。',
    breakeven: (n) => `盈亏平衡：一个月里坏天气超过约 ${n} 天，对冲就会净赚。价格越公道，长期平均下来越接近不赚不亏。`,
    note: '模拟不计手续费、买卖价差和流动性，也假设合约按同一气象站结算；天气合约只覆盖所买的温度区间。本模拟只用于说明原理，并非投资建议。',
  },
  en: {
    business: 'Business', presets: { cafe: 'Rooftop café · hurt by cold', tour: 'Walking-tour operator · hurt by heat' },
    threat: 'Weather that costs them money', threats: { cold: 'Cold · max ≤23°C', hot: 'Hot · max ≥28°C' },
    revenue: 'Revenue on a normal day', loss: 'Revenue lost on a bad-weather day', price: 'Polymarket price of that weather', stake: 'Spent on contracts each day', badDays: 'Bad-weather days this month',
    full: 'Full hedge', fullHint: (v) => `Full hedge = loss × price ≈ $${v}`,
    priceHint: (t) => `Average price over this page’s ${t.days} past days: ${Math.round(t.price * 100)}¢`,
    daysHint: (t) => `Share of days with this weather in this page’s data: ${Math.round(t.freq * 100)}%`,
    mech: (p, s, stake, name) => `Buy <b>${s}</b> Yes shares at ${p}¢ for <b>$${stake}</b>. If the day turns out ${name}, each share pays $1, <b>$${s}</b> in total; otherwise the contract expires.`,
    cols: ['', 'No hedge', 'Hedged'],
    rows: { good: 'A normal-weather day', bad: 'A bad-weather day', month: 'One month (30 days)', worst: 'Worst single day' },
    rowSub: { good: 'Only the contract cost', bad: 'Payout offsets the loss', month: (n) => `${n} of them bad-weather days`, worst: 'Largest one-day loss' },
    cost: 'Hedge cost', payout: 'Payout', vsNormal: 'Result compared with a normal trading day',
    verdictWin: (v) => `This month had more bad weather than the market price implied, so the hedge covered the losses and came out <b>$${v}</b> ahead.`,
    verdictLose: (v, a, b) => `This month had little bad weather, so the hedge cost <b>$${v}</b> net, like an insurance premium. In return the worst day shrank from <b>−$${a}</b> to <b>−$${b}</b>.`,
    verdictEven: 'The hedge roughly broke even this month, and it made the worst day smaller.',
    breakeven: (n) => `Break-even: with more than about ${n} bad-weather days in a month, the hedge earns money. The fairer the price, the closer it averages to zero over time.`,
    note: 'Ignores fees, bid–ask spreads and liquidity, and assumes settlement on the same station. A temperature contract only covers the range bought. This illustrates a mechanism and is not financial advice.',
  },
};
const THREAT_NAME = { zh: { cold: '低温', hot: '高温' }, en: { cold: 'cold', hot: 'hot' } };

const lang = () => { try { return localStorage.getItem('temperature-language') === 'en' ? 'en' : 'zh'; } catch { return 'zh'; } };
const money = (v) => `${v < 0 ? '−' : v > 0 ? '+' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;

export function initHedge() {
  const root = document.getElementById('hedge');
  const v = { preset: 'cafe', ...PRESETS.cafe };
  const resetMarket = () => {
    const t = THREATS[v.threat];
    v.price = Math.max(2, Math.round(t.price * 100));
    v.badDays = Math.round(t.freq * 30);
    v.stake = Math.round((v.revenue * v.loss / 100) * v.price / 100);
  };
  resetMarket();

  const slider = (key, min, max, step, fmt) => `
    <label class="hg-ctl"><span class="hg-lab" data-l="${key}"></span>
      <span class="hg-row"><input type="range" min="${min}" max="${max}" step="${step}" data-k="${key}" /><output data-o="${key}"></output></span>
      <small data-h="${key}"></small></label>`;

  root.innerHTML = `
    <div class="hg-grid">
      <div class="hg-controls">
        <div class="hg-ctl"><span class="hg-lab" data-l="business"></span><div class="toggle hg-toggle" data-g="preset"><button type="button" data-v="cafe"></button><button type="button" data-v="tour"></button></div></div>
        <div class="hg-ctl"><span class="hg-lab" data-l="threat"></span><div class="toggle hg-toggle" data-g="threat"><button type="button" data-v="cold"></button><button type="button" data-v="hot"></button></div></div>
        ${slider('revenue', 200, 3000, 50)}
        ${slider('loss', 5, 60, 1)}
        ${slider('price', 2, 80, 1)}
        <div class="hg-stake">${slider('stake', 0, 600, 5)}<button type="button" class="btn-link hg-full" data-full></button></div>
        ${slider('badDays', 0, 30, 1)}
      </div>
      <div class="hg-out">
        <p class="hg-mech" data-mech></p>
        <p class="hg-caption" data-l="vsNormal"></p>
        <table class="hg-table"><thead><tr><th></th><th data-col="1"></th><th data-col="2"></th></tr></thead><tbody data-rows></tbody></table>
        <p class="hg-verdict" data-verdict></p>
        <p class="hg-breakeven" data-breakeven></p>
        <p class="fineprint" data-l="note"></p>
      </div>
    </div>`;

  root.addEventListener('input', (e) => {
    const k = e.target.dataset.k;
    if (!k) return;
    v[k] = Number(e.target.value);
    update();
  });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-full')) { v.stake = fullStake(); update(); return; }
    const g = b.parentElement.dataset.g;
    if (g === 'preset') { Object.assign(v, { preset: b.dataset.v }, PRESETS[b.dataset.v]); resetMarket(); update(); }
    if (g === 'threat') { v.threat = b.dataset.v; resetMarket(); update(); }
  });
  window.addEventListener('site-language-change', update);

  const fullStake = () => Math.round((v.revenue * v.loss / 100) * v.price / 100);

  function update() {
    const L = COPY[lang()];
    const t = THREATS[v.threat];
    root.querySelectorAll('[data-l]').forEach((n) => { n.textContent = L[n.dataset.l]; });
    root.querySelectorAll('[data-g] button').forEach((b) => {
      const g = b.parentElement.dataset.g;
      b.textContent = g === 'preset' ? L.presets[b.dataset.v] : L.threats[b.dataset.v];
      b.classList.toggle('on', v[g] === b.dataset.v);
    });
    root.querySelectorAll('input[data-k]').forEach((i) => { i.value = v[i.dataset.k]; });
    const out = { revenue: `$${v.revenue.toLocaleString('en-US')}`, loss: `${v.loss}%`, price: `${v.price}¢`, stake: `$${v.stake}`, badDays: `${v.badDays}` };
    root.querySelectorAll('[data-o]').forEach((o) => { o.textContent = out[o.dataset.o]; });
    const hints = { price: L.priceHint(t), badDays: L.daysHint(t), stake: L.fullHint(fullStake()) };
    root.querySelectorAll('[data-h]').forEach((h) => { h.textContent = hints[h.dataset.h] || ''; });
    root.querySelector('[data-full]').textContent = L.full;
    root.querySelector('[data-col="1"]').textContent = L.cols[1];
    root.querySelector('[data-col="2"]').textContent = L.cols[2];

    const loss = v.revenue * v.loss / 100;
    const p = v.price / 100;
    const shares = Math.floor(v.stake / p);
    const cost = shares * p;
    const good = { no: 0, yes: -cost };
    const bad = { no: -loss, yes: -loss + shares - cost };
    const month = { no: -v.badDays * loss, yes: v.badDays * bad.yes + (30 - v.badDays) * good.yes };
    const worst = { no: -loss, yes: Math.min(good.yes, bad.yes) };

    root.querySelector('[data-mech]').innerHTML = L.mech(v.price, shares.toLocaleString('en-US'), Math.round(cost), THREAT_NAME[lang()][v.threat]);

    const rows = [['good', good, L.rowSub.good], ['bad', bad, L.rowSub.bad], ['month', month, L.rowSub.month(v.badDays)], ['worst', worst, L.rowSub.worst]];
    root.querySelector('[data-rows]').innerHTML = rows.map(([k, r, sub]) => {
      const max = Math.max(Math.abs(r.no), Math.abs(r.yes), 1);
      const cell = (val) => `<td><span class="hg-val ${val < 0 ? 'neg' : val > 0 ? 'pos' : ''}">${money(val)}</span>
        <span class="hg-bar"><i class="${val < 0 ? 'neg' : 'pos'}" style="${val < 0 ? `right:50%;width:${Math.abs(val) / max * 50}%` : `left:50%;width:${val / max * 50}%`}"></i></span></td>`;
      return `<tr class="hg-${k}"><th>${L.rows[k]}<small>${sub}</small></th>${cell(r.no)}${cell(r.yes)}</tr>`;
    }).join('');

    const diff = month.yes - month.no;
    root.querySelector('[data-verdict]').innerHTML = shares === 0 ? ''
      : Math.abs(diff) < 1
      ? L.verdictEven
      : diff > 0 ? L.verdictWin(Math.round(diff).toLocaleString('en-US')) : L.verdictLose(Math.round(-diff).toLocaleString('en-US'), Math.round(-worst.no), Math.round(-worst.yes));
    root.querySelector('[data-breakeven]').textContent = shares > 0 ? L.breakeven(Math.round(30 * cost / shares)) : '';
  }
  update();
}
