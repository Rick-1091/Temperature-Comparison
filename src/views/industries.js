import { HISTORICAL, BASELINE, activityMeans } from '../data.js';
import { subscribe, getState, setState } from '../state.js';

const INDUSTRIES = [
  { id: 'hospitality', rows: [['rainy', 'cafe'], ['cool', 'cafe']] },
  { id: 'workspace', rows: [['rainy', 'cowork'], ['hot', 'cowork']] },
  { id: 'tourism', rows: [['rainy', 'park'], ['hot', 'park'], ['rainy', 'museum']] },
  { id: 'mobility', rows: [['rainy', 'walk'], ['rainy', 'cycle'], ['windy', 'cycle']] },
];

const COPY = {
  zh: {
    hospitality: ['餐饮与咖啡馆', '露台咖啡馆、屋顶酒吧、街边餐饮'],
    workspace: ['共享办公', '按天或按月出租工位的办公空间'],
    tourism: ['旅游与文化', '公园活动、导览、博物馆与室内场馆'],
    mobility: ['城市出行', '共享单车、步行导览、配送'],
    weather: { rainy: '降雨日', cool: '凉爽日', hot: '炎热日', windy: '大风日' },
    activity: { cafe: '户外咖啡馆', cowork: '共享办公', park: '公园', museum: '室内休闲', walk: '步行', cycle: '骑行' },
    days: (n) => `${n} 天`,
    vs: '与全部日期相比',
  },
  en: {
    hospitality: ['Hospitality', 'Terrace cafés, rooftop bars, street food'],
    workspace: ['Flexible workspace', 'Coworking desks rented by the day or month'],
    tourism: ['Tourism & culture', 'Park activity, guided tours, museums and indoor venues'],
    mobility: ['Urban mobility', 'Bike share, walking tours, delivery'],
    weather: { rainy: 'Rainy days', cool: 'Cool days', hot: 'Hot days', windy: 'Windy days' },
    activity: { cafe: 'Outdoor café', cowork: 'Coworking', park: 'Park', museum: 'Indoor leisure', walk: 'Walking', cycle: 'Cycling' },
    days: (n) => `${n} days`,
    vs: 'vs all observed days',
  },
};

const lang = () => { try { return localStorage.getItem('temperature-language') === 'en' ? 'en' : 'zh'; } catch { return 'zh'; } };

const change = (w, a) => {
  const sub = HISTORICAL.filter((d) => d.tags.includes(w));
  const m = activityMeans(sub)[a].mean;
  return { delta: m / BASELINE[a].mean - 1, n: sub.length };
};
const ROWS = INDUSTRIES.map((ind) => ({ ...ind, rows: ind.rows.map(([w, a]) => ({ w, a, ...change(w, a) })) }));
const MAX = Math.max(...ROWS.flatMap((r) => r.rows.map((x) => Math.abs(x.delta))));

export function initIndustries() {
  const root = document.getElementById('industries');
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-w]');
    if (!b) return;
    const w = b.dataset.w;
    setState({ weather: getState().weather === w ? 'all' : w });
  });
  const draw = (s) => {
    const L = COPY[lang()];
    root.innerHTML = ROWS.map((ind) => `
      <article class="ind-card">
        <h4>${L[ind.id][0]}</h4>
        <p class="ind-ex">${L[ind.id][1]}</p>
        <ul>
          ${ind.rows.map((r) => {
            const w = Math.abs(r.delta) / MAX * 50;
            const on = s.weather === r.w;
            return `<li class="${on ? 'on' : ''}">
              <button type="button" data-w="${r.w}" aria-pressed="${on}">
                <span class="ind-lab">${L.weather[r.w]} · ${L.activity[r.a]}<small>${L.days(r.n)}</small></span>
                <span class="ind-bar"><i class="${r.delta < 0 ? 'neg' : 'pos'}" style="${r.delta < 0 ? `right:50%;width:${w}%` : `left:50%;width:${w}%`}"></i></span>
                <span class="ind-val ${r.delta < 0 ? 'neg' : 'pos'}">${r.delta > 0 ? '+' : r.delta < 0 ? '−' : ''}${Math.abs(Math.round(r.delta * 100))}%</span>
              </button>
            </li>`;
          }).join('')}
        </ul>
        <p class="ind-vs">${L.vs}</p>
      </article>`).join('');
  };
  subscribe(draw);
  window.addEventListener('site-language-change', () => draw(getState()));
}
