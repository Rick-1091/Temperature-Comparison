import {groupQuotes,convert,quoteCents,inInterval as nativeMembership} from './interval-model.js';
async function startExplorer(){
// Shared observation convention and location-specific provenance for both airports.
function updateMexicoView() {
  const english = language === 'en';
  const meta = activeSnapshot.metadata;
  const first = series[0].date, last = series.at(-1).date;
  const city = isMexico ? (english ? 'Mexico City' : '墨西哥城') : (english ? 'New York' : '纽约');
  const airport = isMexico ? (english ? 'International Airport' : '国际机场') : (english ? 'LaGuardia Airport' : '拉瓜迪亚机场');
  const set = (selector, zh, en) => document.querySelectorAll(selector).forEach(node => { node.innerHTML = english ? en : zh; });
  locationSelects.forEach(select => Array.from(select.options).forEach(option => {
    option.textContent = option.value === 'mexico' ? (english ? 'Mexico City · International Airport' : '墨西哥城 · 国际机场') : (english ? 'New York · LaGuardia Airport' : '纽约 · 拉瓜迪亚机场');
  }));
  document.querySelectorAll('[data-unit-label]').forEach(node => {node.textContent=english?'Unit':'单位';});
  document.querySelectorAll('[data-sources-open]').forEach(node => {node.textContent=english?'Data sources ↗':'数据来源 ↗';});
  set('.guided-entry', `<a href="guide.html?location=${isMexico?'mexico':'laguardia'}&day=${series[state.selected].date}&unit=${temperatureUnit}&lang=zh">← 先从一天下手：历史对照与逐日来源</a> · 这里是扩展视图，不是实时天气预报。`, `<a href="guide.html?location=${isMexico?'mexico':'laguardia'}&day=${series[state.selected].date}&unit=${temperatureUnit}&lang=en">← Start with one day: comparison and sources</a> · This is an advanced view, not a live forecast.`);
  document.querySelectorAll('.unit-switch').forEach(node => {
    node.setAttribute('aria-label',english?'Temperature unit':'温度单位');
    node.querySelectorAll('[data-unit]').forEach(button => {
      button.textContent = button.dataset.unit === 'C' ? (english ? '°C Celsius' : '°C 摄氏度') : (english ? '°F Fahrenheit' : '°F 华氏度');
    });
  });
  simpleSvg?.setAttribute('aria-label', `${city} ${first}–${last}: NOAA METAR × Polymarket`);
  set('.simple-copy .eyebrow', `${city} · ${airport} · 2026 年 9 月`, `${city} · ${airport} · SEPTEMBER 2026`);
  set('.simple-summary>small', `共 ${series.length} 天 · 同口径历史快照`, `${series.length} days · standardized historical snapshot`);
  set('#location-title', `${city}${airport} · 观测最高温`, `${city} ${airport} · Reported high`);
  set('.workspace-head>div:first-child>p', `${first} 至 ${last} <span>/</span> °${temperatureUnit} <span>/</span> 当地当日零点前报价`, `${first} to ${last} <span>/</span> °${temperatureUnit} <span>/</span> pre-midnight local quotes`);
  set('.reading>.reading-metric:nth-child(2)>span', '观测最高温 <small>NOAA METAR</small>', 'Reported high <small>NOAA METAR</small>');
  set('.reading-diff>span', '与 NOAA 观测最高温对照', 'Compared with NOAA reported high');
  set('.legend', '<span><i class="legend-key actual-key"></i>观测最高温（NOAA METAR）</span><span><i class="legend-key market-key"></i>市场预测值（历史最高报价区间）</span>', '<span><i class="legend-key actual-key"></i>Reported high (NOAA METAR)</span><span><i class="legend-key market-key"></i>Market forecast (top-priced range)</span>');
  set('.data-note-summary', '<strong>数据说明</strong> 用当天开始前的市场判断，对照当天的机场观测。', '<strong>About the data</strong> Pre-day market expectations compared with that day’s airport observations.');
  set('.data-details-body', `<div class="reading-sections"><section><h3>机场观测</h3><dl class="reading-facts"><div><dt>观测站</dt><dd>${city}${airport} · ${meta.station}</dd></div><div><dt>每日最高温</dt><dd>当地当天最高的一次报告温度。</dd></div><div><dt>最低覆盖要求</dt><dd>至少 20 条记录，覆盖至少 20 个不同小时。</dd></div></dl><p>报告之间的温度峰值可能没有被记录。</p></section><section><h3>市场报价</h3><dl class="reading-facts"><div><dt>来源</dt><dd>Polymarket 官方接口的温度区间与历史 Yes 报价。</dd></div><div><dt>取价时段</dt><dd>当地零点前 24 小时内各档最后可得值，按 5 分钟间隔采样。</dd></div></dl><p>使用事前报价，不使用结果已知后的价格。</p></section><section><h3>怎样计算命中</h3><ol class="reading-list"><li>把观测换算成市场原生单位，再取整判断是否在区间内。</li><li>切换显示单位不改变结果。</li><li>不同城市的区间宽度不同，不能直接按命中率排名。</li></ol></section><section><h3>核对来源与结算</h3><p>机场观测与市场结算值可能不同。点击上方“数据来源”，核对所选日期的报价、记录和结算规则。</p></section></div>`,
    `<div class="reading-sections"><section><h3>Airport observations</h3><dl class="reading-facts"><div><dt>Station</dt><dd>${city} ${airport} · ${meta.station}</dd></div><div><dt>Daily high</dt><dd>The highest reported temperature within the local day.</dd></div><div><dt>Minimum coverage</dt><dd>20 reports spanning at least 20 distinct local hours.</dd></div></dl><p>Temperature peaks between reports may be missed.</p></section><section><h3>Market quotes</h3><dl class="reading-facts"><div><dt>Source</dt><dd>Temperature bins and historical Yes prices from Polymarket’s official APIs.</dd></div><div><dt>Quote window</dt><dd>The latest available quote in the 24 hours before local midnight, sampled at five-minute intervals.</dd></div></dl><p>These are pre-day quotes, not prices after the outcome.</p></section><section><h3>How hits are calculated</h3><ol class="reading-list"><li>Convert the observation to the native market unit and round before checking the interval.</li><li>Display units do not change the result.</li><li>Different bin widths prevent a direct city ranking.</li></ol></section><section><h3>Check sources and settlement</h3><p>Airport observations may differ from settlement values. Open Data sources above to check the selected day’s quotes, records and settlement rules.</p></section></div>`);
  set('.simple-footer>p', '两地统一使用 METAR 观测最高温；单位切换不改变命中率。观测不一定等于市场结算值。', 'Both cities use maximum reported METAR temperatures; switching units does not change hits. Observations may differ from settlement.');
  document.querySelector('#observation-status').textContent = english ? 'NOAA METAR snapshot · historical quotes' : 'NOAA METAR 快照 · 历史报价';
  ['simple-check', 'professional-check'].forEach(id => {
    const target = document.getElementById(id);
    const definitions = target?.querySelector('.formula-definitions');
    if (definitions) definitions.innerHTML = definitions.innerHTML.replace('NOAA 观测最高温', 'METAR 最高温换算至市场原始单位后取整').replace('NOAA observed high', 'METAR maximum converted and rounded in the native market unit');
    const caveat = target?.lastElementChild;
    if (caveat) caveat.textContent = english
      ? 'Shared local-day METAR convention; interval membership uses native whole-degree market precision, regardless of display units. Small historical sample, not settlement win rates or overall forecasting skill. Different native interval widths limit cross-city hit-rate comparisons.'
      : '统一采用当地日 METAR 统计；命中判定按市场原始单位的整数度精度进行，与显示单位无关。短期样本覆盖率不是结算胜率或整体预测能力；两地原始区间宽度不同，不宜直接比较命中率高低。';
  });
}
// Native market bounds remain immutable; display-unit changes never alter hit membership.
if(new URLSearchParams(location.search).get('embed')==='true')document.documentElement.classList.add('evidence-embedded');
const isMexico = new URLSearchParams(location.search).get('location') === 'mexico';
const nativeUnit = isMexico ? 'C' : 'F';
const temperatureUnit = (() => {
  const requested = new URLSearchParams(location.search).get('unit');
  if (requested === 'C' || requested === 'F') return requested;
  try { return localStorage.getItem('temperature-unit') === 'F' ? 'F' : 'C'; } catch { return 'C'; }
})();
const displayValue = value => convert(value,nativeUnit,temperatureUnit);
const formatNumber = value => Number.isFinite(value)?Number(value.toFixed(1)).toString():'—';
const temperature = value => `${formatNumber(displayValue(value))}°${temperatureUnit}`;
const temperatureDelta = value => `${formatNumber(value * (nativeUnit === temperatureUnit ? 1 : nativeUnit === 'C' ? 9/5 : 5/9))}°${temperatureUnit}`;
const intervalLabel = bucket => bucket.low === null ? `≤${temperature(bucket.high)}` : bucket.high === null ? `≥${temperature(bucket.low)}` : bucket.low === bucket.high ? temperature(bucket.low) : `${formatNumber(displayValue(bucket.low))}–${temperature(bucket.high)}`;
const inInterval = (bucket,value) => !bucket||(bucket.low===null&&bucket.high===null)?null:nativeMembership(bucket,value);
const monthNumber = 9;
const monthName = 'September';
const monthShort = 'Sep';
const bucketStep = isMexico ? 1 : 2;
const tickStep = isMexico ? 2 : 4;
const response = await fetch('../data/'+(isMexico?'mexico':'laguardia')+'-unified.json');
if(!response.ok)throw new Error('Historical records unavailable');
const activeSnapshot = await response.json();
if(!activeSnapshot.days?.length)throw new Error('Historical records missing');
const series = activeSnapshot.days.map(item => ({
  ...item, actual: convert(item.actualC,'C',nativeUnit),
  outcomes: item.outcomes.map(bucket => ({...bucket, originalLabel:bucket.label, label: intervalLabel(bucket)}))
}));
const grouped = groupQuotes(activeSnapshot);
const buckets = grouped.groups;
const bucketLows = buckets.map(b=>b.low).filter(Number.isFinite);
const bucketLabel = intervalLabel;
const binFor = outcome => buckets.findIndex(g=>(g.low===null||(outcome.low!==null&&outcome.low>=g.low))&&(g.high===null||(outcome.high!==null&&outcome.high<=g.high)));
const marketShares=grouped.rows.map(row=>row.cells.map(c=>c.weight===null?null:c.weight*100));
const marketSums=grouped.rows.map(row=>row.cells.map(c=>c.sum));
const choiceByDay = series.map((item) => item.outcomes.findIndex((outcome) => outcome.price === Math.max(...item.outcomes.map((entry) => entry.price))));
const pct = value => `${quoteCents(value)} ${language==='en'?'cents':'美分'}`;
const sharePct = value => Number.isFinite(value)?`${value.toFixed(1)}%`:'—';
const outcomeForBin = (dayIndex, binIndex) => series[dayIndex].outcomes.findIndex((outcome) => binFor(outcome) === binIndex);
const requestedView=({daily:'dumbbell',trend:'lines',three:'three-d'}[new URLSearchParams(location.search).get('view')]||new URLSearchParams(location.search).get('view'));
const state = { view: ["dumbbell","lines","three-d","heatmap","area"].includes(requestedView)?requestedView:"dumbbell", selected: Math.max(0, series.findIndex(item => item.date === new URLSearchParams(location.search).get('day'))), angle: 38, draggingX: null, showActual: false };
let sourceDayIndex = state.selected;
const svg = document.querySelector("#main-chart");
const wrap = document.querySelector("#chart-wrap");
const tooltip = document.querySelector("#tooltip");
const glass = document.querySelector("#selection-glass");
const focusMarkers = document.querySelector("#focus-markers");
const predictionPanel = document.querySelector("#prediction-panel");
const predictionBars = document.querySelector("#prediction-bars");
const heatmapOptions = document.querySelector("#heatmap-options");
const areaLegend = document.querySelector("#area-legend");
const areaLegendItems = document.querySelector("#area-legend-items");
const summaryLegend = document.querySelector(".legend");
const actualToggles = [document.querySelector("#toggle-actual"), document.querySelector("#toggle-actual-area")];
const tabs = [...document.querySelectorAll("[data-view]")];
const pageDeck = document.querySelector("#page-deck");
const pagePanels = [...document.querySelectorAll("[data-page]")];
const pageButtons = [...document.querySelectorAll("[data-page-target]")];
const languageButtons = [...document.querySelectorAll("[data-language]")];
const locationSelects = [document.querySelector("#simple-location-select"), document.querySelector("#location-select")].filter(Boolean);
const simpleSvg = document.querySelector("#simple-chart");
const simpleDetail = document.querySelector("#simple-detail");
const simpleLeaders = series.map((item) => item.outcomes.reduce((leader, outcome) => outcome.price > leader.price ? outcome : leader));
let areaColors = buckets.map((_, index) => `hsl(${210 - index * 148 / Math.max(1, buckets.length - 1)} 58% ${50 + (index % 3) * 4}%)`);
const NS = "http://www.w3.org/2000/svg";
const nativeValues=series.flatMap(d=>[d.actual,...d.outcomes.flatMap(o=>[o.low,o.high])]).filter(Number.isFinite);
const yMin = Math.floor((Math.min(...nativeValues)-1)/tickStep)*tickStep;
const yMax = Math.ceil((Math.max(...nativeValues)+1)/tickStep)*tickStep;
const yTicks = Array.from({ length: Math.floor((yMax - yMin) / tickStep) + 1 }, (_, index) => yMin + index * tickStep);
let dragStart = null;
let flatMetrics = null;
let suppressPointClick = false;
let observationFresh = false;
let language = (() => { try { return (new URLSearchParams(location.search).get('lang') || localStorage.getItem("temperature-language")) === "en" ? "en" : "zh"; } catch { return "zh"; } })();

const localizedCopy = {
  zh: {
    documentTitle: "Weatherbridge · 02 预测与实测",
    chapterOrigin: "<span>01</span>天气与日常生活", chapterSignals: "<span>02</span>预测与实测", chapterNomadcast: "<span>03</span>从信息到行动", chapterNext: "下一章 · 03 从信息到行动 <span aria-hidden=\"true\">→</span>",
    basicsTitle: "先了解：Polymarket 是什么？",
    basicsCopy: "Polymarket 是一个预测市场：它把未来的问题列成可交易的结果选项，例如“某城市某天的最高温会落在哪个区间？”参与者根据预报、新闻和自己的判断买卖合约，价格随供需变化，形成一个可观察的集体预期。它不是气象机构。",
    interfaceCaption: "Polymarket 天气市场 · 香港最低温",
    priceTitle: "一、价格为什么能表达判断？", priceCopy: "一个结果的 Yes（会发生）份额价格在 0 到 1 美元之间；按规则结算后，正确结果的份额兑付 1 美元，错误结果为 0。因此，0.60 美元通常读作约 60% 的市场隐含概率。这是价格信号，不是六成人投票赞成；它也会受流动性和交易行为影响。",
    chartTitle: "二、截图里的曲线怎么看？", chartCopy: "每条曲线对应一个温度结果，展示其价格判断随时间怎样变化。截图中的 28°C · 75% 表示该结果当时更受市场看好，不代表最后一定出现。右侧选中的是“22°C 或以下”，2¢ 属于这个选项。各选项报价可能不同时更新、合计也未必恰好为 100%，不能直接当作人数比例。",
    useTitle: "三、Weatherbridge 帮你读什么？", useCopy: "我们不要求你交易，而是把价格整理为温度范围、判断分散程度和历史实测对照。先看市场倾向什么，再看分歧有多大，最后看过去接近实际吗。每个市场须核对地点、日期、最高温或最低温、观测站与结算规则；价格集中也不等于一定准确。",
    docsLink: "Polymarket 官方说明：价格如何计算 →",
    basicsReading: "读图顺序：看预测的温度范围 → 看判断是否分散 → 看过去接近实际吗。百分比来自价格，不是人数占比。",
    basicsCase: "当前展示纽约 2026 年 8 月的历史案例，不是锦溪或非洲地区明天的天气预报。查看信息无需交易。",
    navResearch: "<span>01</span> 研究原理", navSimple: "<span>02</span> 简明版", navProfessional: "<span>03</span> 专业版",
    brand: "<span class=\"brand-mark\" aria-hidden=\"true\"></span>温度对照",
    researchNote: "研究笔记 · 企业收益市场", reliabilityTitle: "为什么预测市场价格可能有信息价值？",
    reliabilityLead: "预测市场价格汇总了许多有金钱激励的参与者判断，并随着新信息持续更新。",
    flowInfo: "分散信息", flowTraders: "交易者", flowTrades: "交易", flowPrice: "市场价格", flowProbability: "集体概率",
    flowNote: "<strong>价格不是简单投票。</strong> 不同交易者带来不同的信息、信心和资金。",
    evidenceTitle: "论文中的收益预测证据", evidenceClaim: "在所研究的收益市场中，Polymarket 概率比分析师基准校准得更好，也包含额外预测信息。",
    observations: "公司—季度观测", marketAccuracy: "Polymarket 预测准确率", analystAccuracy: "分析师基准准确率", brier: "Brier 分数 · 越低越好",
    calibration: "论文指出，Polymarket 相对分析师的测量优势，很大一部分来自分析师概率相对于基准率的校准偏差。",
    incentiveTitle: "金钱激励", incentiveText: "参与者有理由把掌握的信息转化为交易。",
    updatingTitle: "持续更新", updatingText: "新证据进入市场后，价格可以随之变化。",
    crowdTitle: "群体智慧", crowdText: "彼此独立的判断有机会抵消个人误差。",
    distributedTitle: "分散信息", distributedText: "不同交易者带来拼图中的不同部分。",
    specialist: "少量专业参与者与广泛、多样的参与者共同存在，可以把不同信息汇入一个价格。",
    bridgeTitle: "从企业收益到天气", bridgeOne: "论文研究的是企业收益，而不是天气；它并不能证明 Polymarket 的天气预测准确。",
    bridgeTwo: "这个项目把同一种信息聚合机制放到天气领域，用市场温度概率与最终观测结果进行对照。",
    explore: "查看天气预测 <span aria-hidden=\"true\">→</span>", source: "来源",
    location: "地点", locationOption: "纽约 · 拉瓜迪亚机场", simpleEyebrow: "纽约 · 拉瓜迪亚机场 · 2026 年 8 月",
    simpleTitle: "市场最看好的温度，<br><span>后来猜对了吗？</span>", simpleLead: "每天挑出市场最看好的温度，再和当天实际最高气温放在一起看。",
    simpleLegend: "<span><i class=\"actual-key\"></i>实际气温</span><span><i class=\"market-key\"></i>市场预测值</span>",
    hitLabel: "天落在最高报价区间", historyCount: "共 12 天 · 历史快照", dailyComparison: "每日对照", forecastResult: "预测与结果", shorter: "线段越短，两者越接近",
    simpleFooter: "Yes 价格代表市场价格，不代表人数。NOAA 日最高与市场结算来源可能存在口径差异。", professionalCta: "向右查看专业版 <span aria-hidden=\"true\">→</span>",
    proTitle: "市场猜的温度 <em>v.s.</em><br><span>天气最后给的答案</span>", proLead: "按日期比较市场报价最高的温度区间与机场报告的最高温，也可查看各区间的报价分布。",
    locationTitle: "纽约拉瓜迪亚机场 · 最高气温", period: "历史记录 <span>/</span> 华氏度 °F <span>/</span> 市场价取当地当日 00:00 前最近报价",
    legend: "<span><i class=\"legend-key actual-key\"></i> 实际气温值（NOAA）</span><span><i class=\"legend-key market-key\"></i> 市场预测值（历史价最高区间）</span>",
    tabDumbbell: "<span class=\"tab-icon icon-pair\" aria-hidden=\"true\"></span>逐日对照", tabLines: "<span class=\"tab-icon icon-lines\" aria-hidden=\"true\"></span>双线趋势", tab3d: "<span class=\"tab-icon icon-cube\" aria-hidden=\"true\"></span>3D 双轨", tabHeatmap: "<span class=\"tab-icon icon-heat\" aria-hidden=\"true\"></span>预测热力图", tabArea: "<span class=\"tab-icon icon-area\" aria-hidden=\"true\"></span>预测面积图",
    heatScale: "<span>归一化历史价格占比</span><i aria-hidden=\"true\"></i><small>低</small><small>高</small>", showActual: "<span class=\"toggle-track\" aria-hidden=\"true\"><span></span></span>显示机场观测最高温",
    predictionSource: "Polymarket · Yes 历史价格", predictionIntro: "点击一个温度区间，将其作为主图的市场预测值。", predictionFoot: "各区间报价取自当天开始前；来源页可核对具体时间", resetPrediction: "恢复最高报价",
    currentDate: "当前日期", actualMetric: "实际气温值 <small>NOAA 实测</small>", marketMetric: "市场预测值 <small>历史价格</small><b>查看全部预测 ↗</b>", compareMetric: "与 NOAA 日最高对照",
    dataSummary: "<strong>真实历史数据</strong> NOAA 日最高 × Polymarket 当日零点前价格。口径差异见详情。", dataDetails: "查看数据口径",
    observedDetail: "<strong>实测</strong> NOAA METAR 机场报告，按当地日内最高的一次报告温度统计。逐日来源与归档记录见数据来源页。",
    marketDetail: "<strong>市场</strong> Polymarket 各温度区间的历史 Yes 报价，取当地当日开始前 24 小时内最后可得值。热力图和面积图将每天各档报价归一化，用于比较价格分布。",
    limitDetail: "<strong>口径限制</strong> 机场报告与合约结算可能使用不同来源。完整的比较规则见方法页，市场链接随所选日期切换。", noaaLink: "NOAA 实测数据接口 ↗"
  },
  en: {
    documentTitle: "Weatherbridge · 02 Forecasts & observations",
    chapterOrigin: "<span>01</span>Weather &amp; daily life", chapterSignals: "<span>02</span>Forecasts &amp; observations", chapterNomadcast: "<span>03</span>From information to action", chapterNext: "Next · Chapter 03: From information to action <span aria-hidden=\"true\">→</span>",
    basicsTitle: "First: what is Polymarket?",
    basicsCopy: "Polymarket is a prediction market: questions about future events become tradable outcomes, such as a city’s daily high-temperature range. Participants trade using forecasts, news and their own judgments. Prices change with supply and demand, creating an observable collective expectation. Polymarket is not a meteorological agency.",
    interfaceCaption: "Polymarket weather market · Hong Kong daily low",
    priceTitle: "1. Why can a price express expectations?", priceCopy: "A Yes share is priced between $0 and $1. After resolution under the rules, a correct share pays $1 and an incorrect share pays $0. A $0.60 price is therefore commonly read as roughly 60% implied probability. It is a price signal, not a count of people voting, and is affected by liquidity and trading behavior.",
    chartTitle: "2. How do we read these curves?", chartCopy: "Each curve tracks the changing price of one temperature outcome. The screenshot’s 28°C · 75% was the favored outcome at that moment, not a certain result. The right panel selects 22°C or below; its 2¢ quote belongs to that outcome. Quotes may update at different times and need not sum to exactly 100%. They are not participant shares.",
    useTitle: "3. What does Weatherbridge help you read?", useCopy: "You do not need to trade. We organize prices into temperature ranges, disagreement and historical comparisons with observations. Read the favored outcome, the spread of expectations and past performance. Check each market’s place, date, daily high or low, station and settlement rules. Concentrated expectations do not guarantee accuracy.",
    docsLink: "Polymarket Help Center: how prices are calculated →",
    basicsReading: "Read the expected range → notice disagreement → compare past outcomes. Percentages come from prices, not participant counts.",
    basicsCase: "This is a New York historical case from August 2026, not tomorrow's forecast for Jinxi or African communities. Reading the information does not require trading.",
    navResearch: "<span>01</span> Research", navSimple: "<span>02</span> Simple", navProfessional: "<span>03</span> Pro",
    brand: "<span class=\"brand-mark\" aria-hidden=\"true\"></span>Temperature Compare",
    researchNote: "Research note · Earnings markets", reliabilityTitle: "Why Can Prediction Markets Be Informative?",
    reliabilityLead: "Prediction-market prices aggregate the beliefs of financially incentivized participants and update as new information arrives.",
    flowInfo: "Dispersed<br>Information", flowTraders: "Traders", flowTrades: "Trades", flowPrice: "Market<br>Price", flowProbability: "Collective<br>Probability",
    flowNote: "<strong>Not a simple vote.</strong> Traders contribute different information, confidence, and capital.",
    evidenceTitle: "Evidence from earnings markets", evidenceClaim: "In the earnings markets studied, Polymarket probabilities were better calibrated than the analyst benchmark and contained additional predictive information.",
    observations: "firm-quarter observations", marketAccuracy: "Polymarket accuracy", analystAccuracy: "analyst benchmark accuracy", brier: "Brier Score · lower is better",
    calibration: "Much of the measured advantage over analysts comes from analyst probability miscalibration relative to the base rate.",
    incentiveTitle: "Financial Incentives", incentiveText: "Participants have a reason to act on what they know.",
    updatingTitle: "Continuous Updating", updatingText: "Prices move when new evidence reaches the market.",
    crowdTitle: "Wisdom of Crowds", crowdText: "Independent judgments can offset individual errors.",
    distributedTitle: "Distributed Information", distributedText: "Different traders bring different pieces of the picture.",
    specialist: "A small specialist core and a broad, diverse participant base can combine different pieces of information in one price.",
    bridgeTitle: "From earnings to weather", bridgeOne: "This paper studies corporate earnings, not weather. It does not prove that Polymarket weather forecasts are accurate.",
    bridgeTwo: "Our visualization tests the same information-aggregation idea by comparing temperature probabilities with realized weather observations.",
    explore: "Explore Weather Predictions <span aria-hidden=\"true\">→</span>", source: "Source",
    location: "Location", locationOption: "New York · LaGuardia Airport", simpleEyebrow: "NEW YORK · LAGUARDIA AIRPORT · AUGUST 2026",
    simpleTitle: "The market’s top forecast—<br><span>was it right?</span>", simpleLead: "Each day pairs the market’s highest-priced temperature forecast with the observed daily high.",
    simpleLegend: "<span><i class=\"actual-key\"></i>Observed temperature</span><span><i class=\"market-key\"></i>Market forecast</span>",
    hitLabel: "days inside the top-priced range", historyCount: "12 days · historical snapshot", dailyComparison: "DAILY COMPARISON", forecastResult: "Forecast vs. result", shorter: "Shorter lines mean closer estimates",
    simpleFooter: "Yes prices are market prices, not bettor counts. NOAA daily highs and market resolution sources may differ.", professionalCta: "View professional analysis <span aria-hidden=\"true\">→</span>",
    proTitle: "What the market predicted <em>v.s.</em><br><span>what the weather delivered</span>", proLead: "Compare the top-priced temperature range with the airport’s reported high for each day, and explore quotes across ranges.",
    locationTitle: "New York LaGuardia Airport · Daily High", period: "Historical records <span>/</span> Fahrenheit °F <span>/</span> latest price before local midnight",
    legend: "<span><i class=\"legend-key actual-key\"></i> Observed high (NOAA)</span><span><i class=\"legend-key market-key\"></i> Market forecast (top-priced range)</span>",
    tabDumbbell: "<span class=\"tab-icon icon-pair\" aria-hidden=\"true\"></span>Daily compare", tabLines: "<span class=\"tab-icon icon-lines\" aria-hidden=\"true\"></span>Trends", tab3d: "<span class=\"tab-icon icon-cube\" aria-hidden=\"true\"></span>3D tracks", tabHeatmap: "<span class=\"tab-icon icon-heat\" aria-hidden=\"true\"></span>Heatmap", tabArea: "<span class=\"tab-icon icon-area\" aria-hidden=\"true\"></span>Area view",
    heatScale: "<span>Normalized historical price share</span><i aria-hidden=\"true\"></i><small>Low</small><small>High</small>", showActual: "<span class=\"toggle-track\" aria-hidden=\"true\"><span></span></span>Show observed high",
    predictionSource: "Polymarket · Historical Yes price", predictionIntro: "Choose a temperature range to replace the market value in the main chart.", predictionFoot: "Quotes are from before the day began; check exact times on the sources page", resetPrediction: "Restore top price",
    currentDate: "Selected date", actualMetric: "Observed high <small>NOAA</small>", marketMetric: "Market forecast <small>Historical price</small><b>View all forecasts ↗</b>", compareMetric: "Compared with NOAA daily high",
    dataSummary: "<strong>Historical data</strong> NOAA daily highs × Polymarket prices before local midnight. See methodology for caveats.", dataDetails: "View methodology",
    observedDetail: "<strong>Observed</strong> NOAA METAR airport reports, summarized by the maximum reported temperature within each local day. Check the source page for daily evidence and archived records.",
    marketDetail: "<strong>Market</strong> Historical Yes quotes across Polymarket temperature ranges, using the last available quote in the 24 hours before the local day began. Heatmap and area views normalize each day’s quotes to compare their distribution.",
    limitDetail: "<strong>Method limit</strong> Airport reports and contract settlement may use different sources. See Methods for the comparison rules; market links follow the selected date.", noaaLink: "NOAA observed-data API ↗"
  }
};

const staticBindings = [
  ["#market-interface-caption","interfaceCaption"],["#market-price-title","priceTitle"],["#market-price-copy","priceCopy"],["#market-chart-title","chartTitle"],["#market-chart-copy","chartCopy"],["#market-use-title","useTitle"],["#market-use-copy","useCopy"],["#market-docs-link","docsLink"],
  ["#market-basics-title", "basicsTitle"], ["#market-basics-copy", "basicsCopy"], ["#market-basics-reading", "basicsReading"], ["#market-basics-case", "basicsCase"],
  [".chapter-origin", "chapterOrigin"], [".chapter-signals", "chapterSignals"], [".chapter-nomadcast", "chapterNomadcast"], [".cb-next", "chapterNext"],
  [".page-dot[data-page-target='reliability']", "navResearch"], [".page-dot[data-page-target='simple']", "navSimple"], [".page-dot[data-page-target='professional']", "navProfessional"],
  [".brand", "brand"], [".research-topbar>span", "researchNote"], ["#reliability-title", "reliabilityTitle"], [".reliability-copy>p", "reliabilityLead"],
  [".information-flow li:nth-child(1) span", "flowInfo"], [".information-flow li:nth-child(2) span", "flowTraders"], [".information-flow li:nth-child(3) span", "flowTrades"], [".information-flow li:nth-child(4) span", "flowPrice"], [".information-flow li:nth-child(5) span", "flowProbability"], [".information-flow>p", "flowNote"],
  ["#evidence-title", "evidenceTitle"], [".evidence-heading>p", "evidenceClaim"], [".stat-strip article:nth-child(1)>span", "observations"], [".stat-strip article:nth-child(2)>span", "marketAccuracy"], [".stat-strip article:nth-child(3)>span", "analystAccuracy"], [".stat-strip article:nth-child(4)>span", "brier"], [".calibration-note", "calibration"],
  [".mechanism-grid article:nth-child(1) h3", "incentiveTitle"], [".mechanism-grid article:nth-child(1) p", "incentiveText"], [".mechanism-grid article:nth-child(2) h3", "updatingTitle"], [".mechanism-grid article:nth-child(2) p", "updatingText"], [".mechanism-grid article:nth-child(3) h3", "crowdTitle"], [".mechanism-grid article:nth-child(3) p", "crowdText"], [".mechanism-grid article:nth-child(4) h3", "distributedTitle"], [".mechanism-grid article:nth-child(4) p", "distributedText"], [".specialist-note", "specialist"],
  [".weather-bridge h2", "bridgeTitle"], [".weather-bridge p:nth-of-type(1)", "bridgeOne"], [".weather-bridge p:nth-of-type(2)", "bridgeTwo"], [".research-cta", "explore"], [".paper-source>span", "source"],
  [".location-picker>span", "location"], [".location-picker option", "locationOption"], [".simple-copy .eyebrow", "simpleEyebrow"], ["#simple-title", "simpleTitle"], [".simple-copy>p:last-of-type", "simpleLead"], [".simple-legend", "simpleLegend"], [".simple-summary>span", "hitLabel"], [".simple-summary>small", "historyCount"], [".figure-heading>div>span", "dailyComparison"], [".figure-heading h2", "forecastResult"], [".figure-heading>p", "shorter"], [".simple-footer>p", "simpleFooter"], [".go-professional", "professionalCta"],
  ["#page-title", "proTitle"], [".intro>div:first-child>p", "proLead"], ["#location-title", "locationTitle"], [".workspace-head>div:first-child>p", "period"], [".legend", "legend"],
  [".view-tab[data-view='dumbbell']", "tabDumbbell"], [".view-tab[data-view='lines']", "tabLines"], [".view-tab[data-view='three-d']", "tab3d"], [".view-tab[data-view='heatmap']", "tabHeatmap"], [".view-tab[data-view='area']", "tabArea"],
  [".heatmap-scale", "heatScale"], ["#toggle-actual", "showActual"], ["#toggle-actual-area", "showActual"], [".prediction-head>div>span", "predictionSource"], [".prediction-panel>p", "predictionIntro"], [".prediction-foot>span", "predictionFoot"], ["#reset-prediction", "resetPrediction"],
  [".reading-date>span", "currentDate"], [".reading>.reading-metric:nth-child(2)>span", "actualMetric"], ["#open-prediction>span", "marketMetric"], [".reading-diff>span", "compareMetric"], [".data-note-summary", "dataSummary"], [".data-details>summary", "dataDetails"], [".data-details-body p:nth-child(1)", "observedDetail"], [".data-details-body p:nth-child(2)", "marketDetail"], [".data-details-body p:nth-child(3)", "limitDetail"], ["#noaa-link", "noaaLink"]
];

const viewHints = {
  zh: { dumbbell: "比较当日市场最高报价区间与 NOAA 日最高气温。", lines: "观察最高报价预测区间与实测值如何变化。", "three-d": "前轨为 NOAA 日最高，后轨为市场最高报价区间；拖动调整视角。", heatmap: "色块深浅代表归一化历史价格占比。", area: "每条彩色带表示一个预测温度区间的归一化价格占比。" },
  en: { dumbbell: "Compare each day’s top-priced range with the NOAA daily high.", lines: "Track how the leading forecast and observed high change over time.", "three-d": "Front track: NOAA high. Rear track: top-priced market range. Drag to rotate.", heatmap: "Color intensity shows normalized historical price share.", area: "Each band shows one forecast range’s normalized price share." }
};

const interactionHints = {
  zh: { dumbbell: "拖动竖向选区切换日期；点击市场预测点查看全部历史报价。", lines: "拖动竖向选区切换日期；点击市场预测点查看全部历史报价。", "three-d": "拖动图表调整 3D 视角；点击市场预测点查看全部历史报价。", heatmap: "点击色块切换日期；下方保留该日所选报价区间。可开启观测温度叠加。", area: "点击彩色带选择日期与温度区间；纵轴为归一化价格占比。" },
  en: { dumbbell: "Drag the vertical selection area across dates; select a market forecast point for all historical prices.", lines: "Drag the vertical selection area across dates; select a market forecast point for all historical prices.", "three-d": "Drag to rotate the 3D view; select a market forecast point for all historical prices.", heatmap: "Select a cell to change the date; the reading keeps that day’s selected quote range. Observed highs can be overlaid.", area: "Select a colored band to choose a date and temperature range; the y-axis is normalized price share." }
};

function formatDate(day) { return language === "en" ? `${monthShort} ${day}` : `${monthNumber} 月 ${day} 日`; }
function updateObservationStatus() {
  document.querySelector("#observation-status").textContent = language === "en"
    ? `NOAA ${observationFresh ? "updated" : "snapshot"} · market history`
    : `NOAA ${observationFresh ? "已更新" : "快照"} · 市场历史价`;
}
function updateViewCopy() {
  document.querySelector("#view-hint").textContent = viewHints[language][state.view].replaceAll("NOAA 日最高气温", "NOAA 已报告最高温").replaceAll("NOAA 日最高", "NOAA 已报告最高温").replaceAll("NOAA daily high", "NOAA reported high");
  if(state.view==="heatmap")document.querySelector("#view-hint").textContent=language==="en"?"Whole original bins · sum of Yes quotes":"完整原始档合并 · 组内 Yes 报价和";
  if(state.view==="area")document.querySelector("#view-hint").textContent=language==="en"?"Daily steps · relative quote weights":"逐日阶梯 · 相对报价权重";
  document.querySelector("#angle-note").textContent=state.view==="area"?(language==="en"?"Group quote sum / daily quote total; not weather probability.":"组内报价和 ÷ 当日全部报价和，不是天气概率。"):interactionHints[language][state.view];
}
function applyLanguage(nextLanguage) {
  language = nextLanguage === "en" ? "en" : "zh";
  try { localStorage.setItem("temperature-language", language); } catch {}
  document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  document.title = language==='en'?'Weatherbridge · Advanced exploration':'Weatherbridge · 高级探索';
  document.querySelectorAll('[data-zh][data-en]').forEach(el=>el.textContent=el.dataset[language]);
  window.dispatchEvent(new CustomEvent('wb-language',{detail:language}));
  staticBindings.forEach(([selector, key]) => document.querySelectorAll(selector).forEach((node) => { node.innerHTML = localizedCopy[language][key]; }));
  languageButtons.forEach((button) => { const active = button.dataset.language === language; button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active)); });
  document.querySelector(".page-switcher")?.setAttribute("aria-label", language === "en" ? "Pages and language" : "页面与语言");
  document.querySelector(".chapterbar")?.setAttribute("aria-label", language === "en" ? "Website chapters" : "网站章节");
  locationSelects.forEach((select) => select.setAttribute("aria-label", language === "en" ? "Choose location" : "选择地点"));
  document.querySelector("#prev-point").setAttribute("aria-label", language === "en" ? "Previous day" : "选择前一天");
  document.querySelector("#next-point").setAttribute("aria-label", language === "en" ? "Next day" : "选择后一天");
  document.querySelector("#close-prediction").setAttribute("aria-label", language === "en" ? "Close forecast distribution" : "关闭预测分布面板");
  for (const [selector, zh, en] of [
    ['#professional-page', '高级数据探索', 'Advanced data exploration'],
    ['.workspace', '气温时间序列可视化', 'Temperature time-series charts'],
    ['.legend', '图例', 'Chart legend'],
    ['.view-tabs', '选择图表视图', 'Choose chart view'],
    ['#area-legend', '温度区间组图例', 'Temperature interval group legend'],
    ['#prediction-panel', '当日所有市场报价区间', 'All market quote ranges for the selected day'],
    ['.reading', '选中日期的详情', 'Selected day details'],
    ['#open-prediction', '查看并选择当日市场报价区间', 'View and select a market quote range for this day']
  ]) document.querySelector(selector).setAttribute('aria-label', language === 'en' ? en : zh);
  updateObservationStatus();
  updateViewCopy();
  document.querySelector("#toggle-actual-area").hidden=true;
  const scale=document.querySelector(".heatmap-scale>span");if(scale)scale.textContent=language==="en"?"Sum of Yes quotes (cents)":"组内 Yes 报价和（美分）";
  renderSimple();
  select(state.selected);
  updateMexicoView();
  document.querySelector('#page-title').textContent=language==='en'?'Advanced exploration':'高级探索';

}

function chosenBucket(index) { return series[index].outcomes[choiceByDay[index]]||{low:null,high:null,label:"—",price:null}; }
function marketMid(index) { const o=chosenBucket(index); return o.low===null||o.high===null?null:(o.low+o.high)/2; }
function temperatureY(value, top, bottom) { return bottom - (value - yMin) / (yMax - yMin) * (bottom - top); }
function el(name, attrs = {}, parent = svg) {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  parent.appendChild(node);
  return node;
}
function label(text, x, y, className, anchor = "middle") {
  const node = el("text", { x, y, class: className, "text-anchor": anchor });
  node.textContent = text;
  return node;
}
function line(x1, y1, x2, y2, className) { return el("line", { x1, y1, x2, y2, class: className }); }
function path(points, className) { return el("polyline", { points: points.map(([x, y]) => `${x},${y}`).join(" "), class: className }); }
function point(x, y, index, type, radius = 6) {
  const item = series[index];
  const bucket = chosenBucket(index);
  const isSelected = index === state.selected;
  const pointLabel = language === "en"
    ? `${formatDate(item.day)}, observed high ${temperature(item.actual)}, market forecast ${bucket.label}${type === "market" ? ", select to view all forecasts" : ""}`
    : `${formatDate(item.day)}，实际气温值${temperature(item.actual)}，市场预测值${bucket.label}${type === "market" ? "，点击查看全部预测" : ""}`;
  const group = el("g", { class: `data-point${isSelected ? " is-selected" : ""}`, tabindex: "0", role: "button", "aria-label": pointLabel, "data-index": index, "data-type": type });
  el("circle", { cx: x, cy: y, r: 17, class: "hit-target" }, group);
  el("circle", { cx: x, cy: y, r: isSelected ? radius + 8 : radius + 4, class: isSelected ? "point-halo visible" : "point-halo" }, group);
  el("circle", { cx: x, cy: y, r: isSelected ? radius + 2 : radius, class: `point-core ${type}` }, group);
  const activate = () => { if (suppressPointClick) return; select(index); if (type === "market") openPrediction(); };
  group.addEventListener("click", activate);
  group.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
  group.addEventListener("pointerenter", (event) => showTooltip(event, index));
  group.addEventListener("pointermove", moveTooltip);
  group.addEventListener("pointerleave", () => { tooltip.hidden = true; });
}
function renderAxes(left, right, top, bottom, xAt) {
  yTicks.forEach((tick) => {
    const y = temperatureY(tick, top, bottom);
    line(left, y, right, y, "grid-line");
    label(temperature(tick), left - 13, y + 4, "axis-label", "end");
  });
  series.forEach((item, index) => {
    const step = right - left < 500 ? 3 : 2;
    if (index === state.selected || (index % step === 0 && Math.abs(index - state.selected) > 1)) label(`${item.day}`, xAt(index), bottom + 29, index === state.selected ? "axis-label selected" : "axis-label");
  });
  label(language === "en" ? `${monthName} date` : `${monthNumber} 月日期`, right, bottom + 52, "axis-caption", "end");
  label(language === "en" ? `Temperature °${temperatureUnit}` : `气温 °${temperatureUnit}`, left, top - 18, "axis-caption", "start");
}
function rangeMark(index,x,top,bottom,projectY){
 const o=chosenBucket(index),a=o.low===null?yMin:o.low-.5,b=o.high===null?yMax:o.high+.5,ya=projectY(a),yb=projectY(b);
 const g=el("g",{class:"data-point interval-mark",role:"button",tabindex:0,"data-index":index,"aria-label":series[index].date+" · "+o.label});
 el("line",{x1:x,x2:x,y1:ya,y2:yb,class:"market-line",stroke:"var(--market)","stroke-width":3},g);
 if(o.high===null||o.low===null){
  const up=o.high===null,py=up?yb:ya,sign=up?-1:1;
  el("path",{d:`M${x-6} ${py-sign*9}L${x} ${py}L${x+6} ${py-sign*9}`,fill:"none",stroke:"var(--market)","stroke-width":2},g);
  const text=el("text",{x,y:py+(up?-10:19),class:"axis-label market-label","text-anchor":"middle"},g);text.textContent=o.label;
 }
 g.addEventListener("click",()=>{select(index);openPrediction();});
 g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();select(index);openPrediction();}});
 g.addEventListener("pointerenter",e=>showTooltip(e,index));g.addEventListener("pointerleave",()=>tooltip.hidden=true);
}
function segmentedLine(project,value,className){
 let run=[];const flush=()=>{if(run.length>1)path(run,className);run=[];};
 series.forEach((d,i)=>{const v=value(d,i);if(Number.isFinite(v))run.push(project(i,v));else flush();});flush();
}
function renderFlat(width,height){
 const mobile=width<640,left=mobile?48:64,right=width-(mobile?20:34),top=60,bottom=height-78;
 const xAt=i=>left+i/(series.length-1)*(right-left);
 flatMetrics={left,right,top,bottom,step:(right-left)/(series.length-1),xAt};
 placeGlass();renderAxes(left,right,top,bottom,xAt);
 if(state.view==="lines"){
  segmentedLine((i,v)=>[xAt(i),temperatureY(v,top,bottom)],d=>d.actual,"series-line actual-line");
  segmentedLine((i,v)=>[xAt(i),temperatureY(v,top,bottom)],(_,i)=>marketMid(i),"series-line market-line");
 }
 series.forEach((item,i)=>{
  const x=xAt(i),mid=marketMid(i);
  if(Number.isFinite(item.actual))point(x,temperatureY(item.actual,top,bottom),i,"actual",mobile?4.5:6);
  if(Number.isFinite(mid)){
   if(state.view==="dumbbell"&&Number.isFinite(item.actual))line(x,temperatureY(item.actual,top,bottom),x,temperatureY(mid,top,bottom),"difference-line");
   point(x,temperatureY(mid,top,bottom),i,"market",mobile?4.5:6);
  }else if(chosenBucket(i).label!=="—")rangeMark(i,x,top,bottom,v=>temperatureY(v,top,bottom));
 });
}
function renderThreeD(width,height){
 flatMetrics=null;glass.hidden=true;focusMarkers.hidden=true;
 const mobile=width<640,angle=state.angle*Math.PI/180,originX=mobile?47:82,bottom=height-(mobile?120:100),span=width-(mobile?132:222),depth=mobile?74:116,rise=height-(mobile?218:172);
 const project=(i,v,lane)=>[originX+i/(series.length-1)*span+lane*depth*Math.sin(angle),bottom-(v-yMin)/(yMax-yMin)*rise-lane*depth*Math.cos(angle)*.46-i/(series.length-1)*24*Math.sin(angle)];
 yTicks.forEach(tick=>{const a=project(0,tick,0),b=project(series.length-1,tick,0),c=project(series.length-1,tick,1),d=project(0,tick,1);path([a,b,c,d],tick===yMin?"plane-edge":"plane-grid");label(temperature(tick),a[0]-13,a[1]+4,"axis-label","end");});
 segmentedLine((i,v)=>project(i,v,0),d=>d.actual,"series-line actual-line");
 segmentedLine((i,v)=>project(i,v,1),(_,i)=>marketMid(i),"series-line market-line");
 series.forEach((d,i)=>{
  const mid=marketMid(i),a=project(i,d.actual,0);
  if(Number.isFinite(d.actual))point(...a,i,"actual",mobile?4.5:6);
  if(Number.isFinite(mid)){
   const b=project(i,mid,1);if(Number.isFinite(d.actual))line(...a,...b,i===state.selected?"depth-link active":"depth-link");point(...b,i,"market",mobile?4.5:6);
  }else if(chosenBucket(i).label!=="—"){const p=project(i,yMin,1);rangeMark(i,p[0],0,0,v=>project(i,v,1)[1]);}
  const stride=mobile?3:2;if(i===state.selected||(i%stride===0&&Math.abs(i-state.selected)>1)){const date=project(i,yMin,0);label(String(d.day),date[0],date[1]+29,i===state.selected?"axis-label selected":"axis-label");}
 });
 const top=project(0,yMax,0),end=project(series.length-1,yMin,0);
 label(language==="en"?"Time →":"时间 →",end[0],end[1]+55,"axis-caption","end");
 label(language==="en"?"Temperature °"+temperatureUnit:"气温 °"+temperatureUnit,top[0],top[1]-17,"axis-caption","start");
 label(language==="en"?"Front: observed":"前轨：观测",originX,bottom+68,"lane-label actual-label","start");
 label(language==="en"?"Back: market range":"后轨：市场区间",width-16,bottom+68,"lane-label market-label","end");
}
function renderHeatmap(width, height) {
  flatMetrics = null;
  glass.hidden = true;
  focusMarkers.hidden = true;
  const mobile = width < 640;
  const left = mobile ? 64 : 88;
  const right = width - (mobile ? 12 : 26);
  const top = 56;
  const bottom = height - 70;
  const cellWidth = (right - left) / series.length;
  const cellHeight = (bottom - top) / buckets.length;
  const maxShare = Math.max(...marketSums.flat().filter(Number.isFinite).map(v=>v*100),.01);
  label(language === "en" ? `Temperature groups °${temperatureUnit}` : `温度区间组 °${temperatureUnit}`, left, top - 18, "axis-caption", "start");
  buckets.forEach((bucket, bucketIndex) => {
    const y = top + (buckets.length - 1 - bucketIndex) * cellHeight;
    label(bucketLabel(bucket), left - 10, y + cellHeight / 2 + 4, "axis-label", "end");
    series.forEach((item, dayIndex) => {
      const sum=marketSums[dayIndex][bucketIndex];
      const share=sum===null?null:sum*100;
      const x = left + dayIndex * cellWidth;
      const actualInBucket = inInterval(bucket, item.actual);
      const cellLabel = language === "en"
        ? `${formatDate(item.day)}, ${bucketLabel(bucket)}, sum of Yes quotes ${quoteCents(sum)} cents${state.showActual && actualInBucket ? ", observed high is in this range" : ""}`
        : `${formatDate(item.day)}，${bucketLabel(bucket)}，组内 Yes 报价和 ${quoteCents(sum)} 美分${state.showActual && actualInBucket ? "，实测气温落在此区间" : ""}`;
      const group = el("g", { class: "heat-cell-group", role: "button", tabindex: "0", "data-day": dayIndex, "data-bucket": bucketIndex, "aria-label": cellLabel });
      el("rect", { x: x + 1.5, y: y + 1.5, width: cellWidth - 3, height: cellHeight - 3, rx: 4, class: "heat-cell", style: `--cell-alpha:${(share===null?0:.12 + .88 * share / maxShare).toFixed(3)}` }, group);
      if (state.showActual && actualInBucket) {
        el("rect", { x: x + 2.5, y: y + 2.5, width: cellWidth - 5, height: cellHeight - 5, rx: 4, class: "heat-actual-frame" }, group);
        const actualPosition = bucket.low===null||bucket.high===null?.5:(item.actual - bucket.low + .5) / (bucket.high - bucket.low + 1);
        el("circle", { cx: x + cellWidth / 2, cy: y + cellHeight * (1 - actualPosition), r: mobile ? 4 : 5, class: "heat-actual-dot" }, group);
      }
      const activate = () => select(dayIndex);
      group.addEventListener("click", activate);
      group.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
      group.addEventListener("pointerenter", (event) => {
        tooltip.innerHTML = language === "en"
          ? `<strong>${formatDate(item.day)}</strong><span>${bucketLabel(bucket)} · sum of Yes quotes ${quoteCents(sum)} cents</span>${state.showActual && actualInBucket ? `<span>Observed high ${temperature(item.actual)}</span>` : ""}`
          : `<strong>${formatDate(item.day)}</strong><span>${bucketLabel(bucket)} · 组内 Yes 报价和 ${quoteCents(sum)} 美分</span>${state.showActual && actualInBucket ? `<span>实际气温值 ${temperature(item.actual)}</span>` : ""}`;
        tooltip.innerHTML += `<span>${grouped.rows[dayIndex].cells[bucketIndex].members.map(o=>o.label+" · "+quoteCents(o.price)+" "+(language==="en"?"cents":"美分")+" · "+o.quotedAt).join("<br>")}</span>`;
        tooltip.hidden = false;
        moveTooltip(event);
      });
      group.addEventListener("pointermove", moveTooltip);
      group.addEventListener("pointerleave", () => { tooltip.hidden = true; });
    });
  });
  el("rect", { x: left + state.selected * cellWidth + 1, y: top + 1, width: cellWidth - 2, height: bottom - top - 2, rx: 5, class: "heat-selected-column" });
  series.forEach((item, index) => {
    if (!mobile || index % 2 === 0 || index === state.selected) label(`${item.day}`, left + (index + .5) * cellWidth, bottom + 24, index === state.selected ? "axis-label selected" : "axis-label");
  });
  label(language === "en" ? `${monthName} date` : `${monthNumber} 月日期`, right, bottom + 48, "axis-caption", "end");
}
function renderArea(width, height) {
  flatMetrics = null;
  glass.hidden = true;
  focusMarkers.hidden = true;
  const mobile = width < 640;
  const left = mobile ? 49 : 66;
  const right = width - (mobile ? 13 : 28);
  const top = 80;
  const bottom = height - 68;
  const step = (right - left) / series.length;
  const xAt = (index) => left + (index + .5) * step;
  const yAt = (share) => bottom - share / 100 * (bottom - top);
  const cumulative = (dayIndex, bucketIndex) => bucketIndex < 0 ? 0 :
    marketShares[dayIndex].slice(0, bucketIndex + 1).reduce((sum, share) => sum + share, 0);
  const boundary = bucketIndex => series.flatMap((_,i)=>[[left+i*step,yAt(cumulative(i,bucketIndex))],[left+(i+1)*step,yAt(cumulative(i,bucketIndex))]]);
  const smoothSegment = (points,initialCommand) => points.map((p,i)=>(i?"L":initialCommand)+" "+p.join(" ")).join(" ");
  [0, 25, 50, 75, 100].forEach((tick) => {
    const y = yAt(tick);
    line(left, y, right, y, "grid-line");
    label(`${tick}%`, left - 12, y + 4, "axis-label", "end");
  });
  label(language === "en" ? "Relative quote weight" : "相对报价权重", left, top - 41, "axis-caption", "start");
  buckets.forEach((_, bucketIndex) => {
    const upper = boundary(bucketIndex);
    const lower = boundary(bucketIndex - 1).reverse();
    const d = `${smoothSegment(upper, "M")} ${smoothSegment(lower, "L")} Z`;
    el("path", { d, fill: areaColors[bucketIndex], class: "area-band", "data-bucket": bucketIndex });
  });
  el("rect", { x: left + state.selected * step + 1, y: top + 1, width: step - 2, height: bottom - top - 2, rx: 4, class: "area-selected-column" });
  if (false) {
    series.forEach((item, index) => {
      const x = xAt(index);
      const marker = el("circle", { cx: x, cy: top - 13, r: index === state.selected ? 5 : 4, class: `area-actual-dot${index === state.selected ? " selected" : ""}`,
        role: "button", tabindex: "0", "aria-label": language === "en" ? `${formatDate(item.day)}, NOAA observed high ${temperature(item.actual)}, select date` : `${formatDate(item.day)} NOAA 实际气温 ${temperature(item.actual)}，点击选择日期` });
      marker.addEventListener("click", () => select(index));
      marker.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(index); } });
      if (!mobile || index === state.selected) label(temperature(item.actual), x, top - 23, index === state.selected ? "area-actual-label selected" : "area-actual-label");
    });
  }
  series.forEach((item, index) => {
    if (!mobile || index % 2 === 0 || index === state.selected) {
      label(`${item.day}`, xAt(index), bottom + 25, index === state.selected ? "axis-label selected" : "axis-label");
    }
  });
  label(language === "en" ? `${monthName} date` : `${monthNumber} 月日期`, right, bottom + 48, "axis-caption", "end");
  const bandAt = (event, dayIndex) => {
    const { y } = svgCoordinates(event);
    const shareFromBottom = Math.max(0, Math.min(99.999, (bottom - y) / (bottom - top) * 100));
    return buckets.findIndex((_, bucketIndex) => shareFromBottom < cumulative(dayIndex, bucketIndex));
  };
  series.forEach((item, dayIndex) => {
    const target = el("rect", { x: left + dayIndex * step, y: top, width: step, height: bottom - top,
      class: "area-hit-target", role: "button", tabindex: "0", "aria-label": language === "en" ? `${formatDate(item.day)}, view forecast temperature distribution` : `${formatDate(item.day)}，查看市场预测温度区间分布` });
    target.addEventListener("pointermove", (event) => {
      const bucketIndex = bandAt(event, dayIndex);
      if (bucketIndex < 0) return;
      const bucket = buckets[bucketIndex];
      tooltip.innerHTML = `<strong>${formatDate(item.day)}</strong><span>${bucketLabel(bucket)} · ${language === "en" ? "normalized price share" : "相对报价权重"} ${sharePct(marketShares[dayIndex][bucketIndex])}</span><span>${quoteCents(marketSums[dayIndex][bucketIndex])} / ${quoteCents(grouped.rows[dayIndex].total)} ${language==="en"?"cents":"美分"}</span><span>${grouped.rows[dayIndex].cells[bucketIndex].members.map(o=>o.label+" · "+quoteCents(o.price)+" · "+o.quotedAt).join("<br>")}</span>`;
      tooltip.hidden = false;
      moveTooltip(event);
    });
    target.addEventListener("pointerleave", () => { tooltip.hidden = true; });
    target.addEventListener("click", (event) => {
      const bucketIndex = bandAt(event, dayIndex);
      // Grouped support does not select an arbitrary original member contract.
      select(dayIndex);
    });
    target.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(dayIndex); }
    });
  });
}
function placeGlass() {
  if (!flatMetrics) return;
  const { top, bottom, step, xAt } = flatMetrics;
  const wrapRect = wrap.getBoundingClientRect();
  const svgRect = svg.getBoundingClientRect();
  const svgLeft = svgRect.left - wrapRect.left;
  const svgTop = svgRect.top - wrapRect.top;
  const width = Math.max(step * .86, 38);
  const x = state.draggingX ?? xAt(state.selected);
  glass.hidden = false;
  focusMarkers.hidden = false;
  glass.style.width = `${width}px`;
  glass.style.height = `${bottom - top}px`;
  glass.style.top = `${svgTop + top}px`;
  glass.style.transform = `translate3d(${svgLeft + x - width / 2}px,0,0)`;
  const actualMarker = focusMarkers.querySelector(".actual");
  const marketMarker = focusMarkers.querySelector(".market");
  const markerX = `${svgLeft + xAt(state.selected)}px`;
  actualMarker.style.left = markerX;
  marketMarker.style.left = markerX;
  actualMarker.style.top = `${svgTop + temperatureY(series[state.selected].actual, top, bottom)}px`;
  marketMarker.hidden=!Number.isFinite(marketMid(state.selected));
  marketMarker.style.top = `${svgTop + temperatureY(marketMid(state.selected)??yMin, top, bottom)}px`;
}
function renderSimpleDetail(index) {
  if (!simpleDetail) return;
  sourceDayIndex = index;
  const item = series[index];
  const leader = simpleLeaders[index];
  const inside = inInterval(leader, item.actual);
  simpleDetail.innerHTML = language === "en"
    ? `<strong>${formatDate(item.day)}</strong><span class="market-text">Market ${leader.label} · ${pct(leader.price)}</span><span class="actual-text">Observed ${temperature(item.actual)}</span><span>${inside ? "Observed high is inside the forecast range" : "Observed high is outside the forecast range"}</span>`
    : `<strong>${formatDate(item.day)}</strong><span class="market-text">市场 ${leader.label} · ${pct(leader.price)}</span><span class="actual-text">实际 ${temperature(item.actual)}</span><span>${inside ? "实际值落在预测区间内" : "实际值未落在预测区间内"}</span>`;
}
function renderSimple() {
  if (!simpleSvg) return;
  const width = Math.max(simpleSvg.clientWidth, 310);
  const height = Math.max(simpleSvg.clientHeight, 390);
  const mobile = width < 620;
  const left = mobile ? 43 : 54;
  const right = width - (mobile ? 13 : 24);
  const top = 36;
  const bottom = height - 48;
  const xAt = (index) => left + index / (series.length - 1) * (right - left);
  const yAt = (value) => bottom - (value - yMin) / (yMax - yMin) * (bottom - top);
  simpleSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  simpleSvg.replaceChildren();
  yTicks.forEach((tick) => {
    const y = yAt(tick);
    const grid = document.createElementNS(NS, "line");
    grid.setAttribute("x1", left); grid.setAttribute("x2", right); grid.setAttribute("y1", y); grid.setAttribute("y2", y); grid.setAttribute("class", "simple-grid"); simpleSvg.append(grid);
    const tickLabel = document.createElementNS(NS, "text");
    tickLabel.setAttribute("x", left - 10); tickLabel.setAttribute("y", y + 4); tickLabel.setAttribute("text-anchor", "end"); tickLabel.setAttribute("class", "simple-axis"); tickLabel.textContent = temperature(tick); simpleSvg.append(tickLabel);
  });
  series.forEach((item, index) => {
    const leader = simpleLeaders[index];
    const x = xAt(index);
    const midpointY = yAt(leader.midpoint);
    const actualY = yAt(item.actual);
    const group = document.createElementNS(NS, "g");
    group.setAttribute("class", "simple-point"); group.setAttribute("tabindex", "0"); group.setAttribute("role", "button");
    group.setAttribute("aria-label", language === "en"
      ? `${formatDate(item.day)}, top-priced market range ${leader.label}, Yes price ${pct(leader.price)}, observed high ${temperature(item.actual)}`
      : `${formatDate(item.day)}，市场最高报价区间${leader.label}，Yes价格${pct(leader.price)}，实际气温${temperature(item.actual)}`);
    const connector = document.createElementNS(NS, "line"); connector.setAttribute("x1", x); connector.setAttribute("x2", x); connector.setAttribute("y1", midpointY); connector.setAttribute("y2", actualY); connector.setAttribute("class", "simple-link"); group.append(connector);
    const mid = document.createElementNS(NS, "circle"); mid.setAttribute("cx", x); mid.setAttribute("cy", midpointY); mid.setAttribute("r", 6); mid.setAttribute("class", "simple-mid"); group.append(mid);
    const actual = document.createElementNS(NS, "circle"); actual.setAttribute("cx", x); actual.setAttribute("cy", actualY); actual.setAttribute("r", 6); actual.setAttribute("class", "simple-actual"); group.append(actual);
    const hit = inInterval(leader, item.actual);
    if (hit) { const ring = document.createElementNS(NS, "circle"); ring.setAttribute("cx", x); ring.setAttribute("cy", actualY); ring.setAttribute("r", 10); ring.setAttribute("class", "simple-hit"); group.append(ring); }
    const activate = () => renderSimpleDetail(index);
    group.addEventListener("pointerenter", activate); group.addEventListener("focus", activate); group.addEventListener("click", activate);
    simpleSvg.append(group);
    if (!mobile || index % 2 === 0 || index === series.length - 1) { const date = document.createElementNS(NS, "text"); date.setAttribute("x", x); date.setAttribute("y", bottom + 28); date.setAttribute("text-anchor", "middle"); date.setAttribute("class", "simple-date"); date.textContent = item.day; simpleSvg.append(date); }
  });
  const hits = series.filter((item, index) => { const leader = simpleLeaders[index]; return inInterval(leader, item.actual); }).length;
  document.querySelector("#simple-hit-count").textContent = hits;
  renderSimpleDetail(state.selected);
  renderSimpleHitHistory();
  updateMexicoView();
}
function renderSimpleHitHistory() {
  // 严格命中只看最高报价档；宽松命中加入相邻档，曲线按截至该日的有效样本累计。
  const observations = series.filter(item => Number.isFinite(item.actual));
  let strict = 0, wide = 0;
  const points = observations.map((item, index) => {
    const sorted = [...item.outcomes].sort((a,b) => a.midpoint-b.midpoint);
    const leader = sorted.reduce((best,entry) => entry.price > best.price ? entry : best);
    const neighbors = sorted.slice(Math.max(0,sorted.indexOf(leader)-1), sorted.indexOf(leader)+2);
    const contains = bucket => inInterval(bucket, item.actual);
    strict += Number(contains(leader)); wide += Number(neighbors.some(contains));
    return {day:item.day,strict:strict/(index+1),wide:wide/(index+1)};
  });
  const n = points.length;
  if (!n) return;
  const x = i => 48+i*690/Math.max(1,n-1), y = value => 230-value*200;
  const english = language === 'en';
  [
    {id:'simple-check',key:'wide',hits:wide,color:'var(--actual)',dash:'8 4',title:english?'How often was the broader range close?':'过去有多少天大致接近实际？',label:english?'Broad-range hit rate':'宽松命中率'},
    {id:'professional-check',key:'strict',hits:strict,color:'var(--market)',dash:'',title:english?'How often did the leading range contain the observation?':'最高报价区间有多少天命中实际？',label:english?'Strict-range hit rate':'严格命中率'}
  ].forEach(config => {
    const target = document.getElementById(config.id);
    if (!target) return;
    const definition = config.key === 'wide'
      ? (english ? 'A broad-range hit includes the top-priced interval and its immediately adjacent intervals.' : '宽松命中：观测最高温落在最高报价区间或相邻的上下各一档内。')
      : (english ? 'Only the highest-priced interval counts; its bounds are not expanded.' : '只统计观测最高温落在市场最高报价区间内的日期，不向两侧扩展。');
    const path = points.map((point,i)=>`${i?'L':'M'}${x(i)},${y(point[config.key])}`).join(' ');
    target.innerHTML = `<h2>${config.title}</h2>
      <p>${config.label}: <b>${config.hits}/${n} · ${(config.hits/n*100).toFixed(1)}%</b></p>
      <svg viewBox="0 0 790 278" role="img" aria-label="${config.label}">
        ${Array.from({length:11},(_,i)=>i/10).map(value=>`<line x1="48" x2="738" y1="${y(value)}" y2="${y(value)}" stroke="#dcded7" stroke-opacity="${value===0||value===.5||value===1?1:.5}"/><text x="40" y="${y(value)+4}" text-anchor="end" font-size="12" fill="#4f5e57">${Math.round(value*100)}%</text>`).join('')}
        <path data-hit-rate="${config.key}" d="${path}" fill="none" stroke="${config.color}" stroke-width="3" stroke-dasharray="${config.dash}"/>
        ${points.filter((_,i)=>i%2===0||i===n-1).map(point=>`<text x="${x(points.indexOf(point))}" y="257" text-anchor="middle" font-size="13" fill="#4f5e57">${english ? monthShort+' ' : monthNumber+'/'}${point.day}</text>`).join('')}
      </svg>
      <div class="hit-legend"><span><svg class="hit-legend-key" viewBox="0 0 40 12" aria-hidden="true"><line x1="2" x2="38" y1="6" y2="6" stroke="${config.color}" stroke-width="3" stroke-dasharray="${config.dash}"/></svg>${config.label}</span></div>
      ${config.key === 'wide' ? `<div class="hit-formula">
        <p>${english?'Broad-range hit condition':'宽松命中条件'}：<span class="formula-expression">h<sub>i</sub> = 𝟙[T<sub>i</sub> ∈ (I<sub>i,−1</sub> ∪ I<sub>i,0</sub> ∪ I<sub>i,+1</sub>)]</span></p>
        <p>${english?'Cumulative broad-range hit rate':'累计宽松命中率'}：<span class="formula-expression">R<sub>t</sub> = <span class="formula-fraction"><span>∑<sub>i ∈ V<sub>t</sub></sub> h<sub>i</sub></span><span>|V<sub>t</sub>|</span></span> × 100%</span></p>
        <p class="formula-definitions">${english?'Tᵢ: NOAA observed high; Iᵢ,₀: highest-priced interval; Iᵢ,−1 / Iᵢ,+1: immediately lower / higher intervals, where available; 𝟙: 1 when the condition holds, otherwise 0; Vₜ: valid days up to date t with both a market interval and an observation.':'Tᵢ：NOAA 观测最高温；Iᵢ,₀：当日最高报价区间；Iᵢ,−1、Iᵢ,+1：相邻的下、上各一档（有该档时）；𝟙：条件成立记 1，否则记 0；Vₜ：截至日期 t，同时具备市场区间与实测数据的有效日期集合。'}</p>
        <p>${english ? (isMexico ? `Example: native 1°C bins, ${temperature(25)} → ${intervalLabel({low:24,high:26})}.` : `Example: native 2°F bins, ${intervalLabel({low:84,high:85})} → ${intervalLabel({low:82,high:87})}.`) : (isMexico ? `示例：原始 1°C 档，${temperature(25)} → ${intervalLabel({low:24,high:26})}。` : `示例：原始 2°F 档，${intervalLabel({low:84,high:85})} → ${intervalLabel({low:82,high:87})}。`)} ${english ? 'Sample result' : '本样本'}：${wide} ÷ ${n} × 100% ≈ ${(wide/n*100).toFixed(1)}%。</p>
      </div>` : `<div class="hit-formula">
        <p>${english?'Strict-range hit condition':'严格命中条件'}：<span class="formula-expression">h<sub>i</sub> = 𝟙[T<sub>i</sub> ∈ I<sub>i,0</sub>]</span></p>
        <p>${english?'Cumulative strict-range hit rate':'累计严格命中率'}：<span class="formula-expression">R<sub>t</sub> = <span class="formula-fraction"><span>∑<sub>i ∈ V<sub>t</sub></sub> h<sub>i</sub></span><span>|V<sub>t</sub>|</span></span> × 100%</span></p>
        <p class="formula-definitions">${english?'Tᵢ: NOAA observed high; Iᵢ,₀: highest-priced interval; 𝟙: 1 when the condition holds, otherwise 0; Vₜ: valid days up to date t with both a market interval and an observation.':'Tᵢ：NOAA 观测最高温；Iᵢ,₀：当日最高报价区间；𝟙：条件成立记 1，否则记 0；Vₜ：截至日期 t，同时具备市场区间与实测数据的有效日期集合。'}</p>
        <p>${definition}</p>
        <p>${english ? 'Sample result' : '本样本'}：${strict} ÷ ${n} × 100% ≈ ${(strict/n*100).toFixed(1)}%。</p>
      </div>`}
      <p>${english?'Cumulative hit rate = qualifying days / days with both a market interval and an observation, up to each date. Broad-range hits measure interval coverage at a wider tolerance, not probability calibration or overall forecasting skill. Compare methods at the same interval width. This small historical sample uses NOAA daily highs; observation stations and settlement rules may differ.':'累计命中率＝截至该日的命中天数 ÷ 同时具备市场区间与实测数据的有效天数。宽松命中率衡量较大容差下的区间覆盖率，不等同于概率校准程度或整体预测能力；比较不同方法时应统一区间宽度。本图仅反映短期历史样本，NOAA 观测站点与市场结算规则可能存在差异。'}</p>`;
  });
  if(document.getElementById('simple-hit-count'))document.getElementById('simple-hit-count').textContent = wide;
  if(document.querySelector('.simple-summary>span'))document.querySelector('.simple-summary>span').textContent = english ? 'days inside the broader range' : '天落在宽松范围内';
}
function goToPage(name) {
  const target = document.querySelector(`[data-page="${name}"]`);
  if (!target || !pageDeck) return;
  pageDeck.style.scrollBehavior = "auto";
  pageDeck.scrollLeft = target.offsetLeft;
  requestAnimationFrame(() => { pageDeck.style.scrollBehavior = ""; });
}
function restoreRebuiltFocus(container, index, selector) {
  if (index < 0) return;
  const replacement = container.querySelectorAll(selector)[index];
  replacement?.focus({preventScroll:true});
  // Some browsers finish blurring a removed key-event target after dispatch.
  // Recover on the next frame only if focus has not moved to another control.
  requestAnimationFrame(() => {
    if (replacement?.isConnected && document.activeElement === document.body) replacement.focus({preventScroll:true});
  });
}
function render() {
  // Preserve the keyboard position when the SVG's interactive nodes are rebuilt.
  const focusedIndex = [...svg.querySelectorAll('[tabindex="0"]')].indexOf(document.activeElement);
  tabs.forEach(button=>{const active=button.dataset.view===state.view;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active));});
  const address=new URL(location.href);address.searchParams.set("view",state.view);address.searchParams.set("location",isMexico?"mexico":"laguardia");address.searchParams.set("unit",temperatureUnit);history.replaceState(null,"",address);
  document.getElementById("reset-view").hidden=state.view!=="three-d";
  const width = Math.max(svg.clientWidth, 310), height = Math.max(svg.clientHeight, 430);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.innerHTML = "";
  wrap.classList.toggle("flat-view", state.view === "dumbbell" || state.view === "lines");
  heatmapOptions.hidden = state.view !== "heatmap";
  areaLegend.hidden = state.view !== "area";
  summaryLegend.hidden = state.view === "area";
  svg.setAttribute("aria-label", language === "en"
    ? (state.view === "area" ? "Daily stepped area chart of relative quote weights" : "Daily NOAA observed highs and Polymarket historical temperature forecasts for the selected airport")
    : (state.view === "area" ? "每日温度区间相对报价权重的阶梯面积图" : "所选机场每日 NOAA 实测气温与 Polymarket 历史预测价格对比图"));
  if(["heatmap","area"].includes(state.view)&&(!grouped.available||grouped.rows.some(r=>r.total===null||r.total===0))){glass.hidden=true;focusMarkers.hidden=true;label(language==="en"?"Missing complete bins or quotes; use daily comparison.":"原始档或报价不完整，请切换逐日对照。",width/2,height/2,"axis-label");return;}
  if (state.view === "three-d") renderThreeD(width, height);
  else if (state.view === "heatmap") renderHeatmap(width, height);
  else if (state.view === "area") renderArea(width, height);
  else renderFlat(width, height);
  restoreRebuiltFocus(svg, focusedIndex, '[tabindex="0"]');
}
function select(index) {
  // 所有图表、详情和来源链接共用选中日期，避免显示不同日期的数据。
  state.selected = (index + series.length) % series.length;
  sourceDayIndex = state.selected;
  const item = series[state.selected];
  const bucket = chosenBucket(state.selected);
  const share = bucket.price;
  const defaultChoice = choiceByDay[state.selected] === item.outcomes.findIndex((outcome) => outcome.price === Math.max(...item.outcomes.map((entry) => entry.price)));
  document.querySelector("#selected-date").textContent = formatDate(item.day);
  document.querySelector("#actual-value").textContent = `${temperature(item.actual)}`;
  document.querySelector("#market-value").textContent = bucket.label;
  const hit = inInterval(bucket, item.actual);
  const distance = hit===null?null:hit ? 0 : bucket.low !== null && item.actual < bucket.low ? bucket.low - item.actual : item.actual - bucket.high;
  document.querySelector("#difference-value").textContent = hit===null?"—":language === "en" ? (hit ? "Inside range" : `${temperatureDelta(distance)} apart`) : (hit ? "落在区间内" : `相差 ${temperatureDelta(distance)}`);
  document.querySelector("#difference-explain").textContent = language === "en"
    ? `NOAA maximum reported temperature ${temperature(item.actual)}; ${defaultChoice ? "top-priced" : "selected"} range ${bucket.label}, Yes price ${pct(share)}. Market resolution may use a different source.`
    : `NOAA 已报告观测最高温 ${temperature(item.actual)}；${defaultChoice ? "最高报价" : "所选区间"} ${bucket.label}，Yes 价格 ${pct(share)}。市场结算值可能采用不同来源。`;
  const marketLink = document.querySelector("#market-link");
  marketLink.href = item.marketUrl;
  marketLink.textContent = language === "en" ? `Polymarket ${isMexico ? "Mexico City" : "NYC"} ${monthShort} ${item.day} market ↗` : `Polymarket ${isMexico ? "墨西哥城" : "纽约"} ${monthNumber}/${item.day} 市场 ↗`;
  const guidedLink=document.querySelector('.back-guided');
  if(guidedLink)guidedLink.href = `../guide/?location=${isMexico?'mexico':'laguardia'}&day=${item.date}&unit=${temperatureUnit}&lang=${language}&outcome=${encodeURIComponent(bucket.marketId||'')}`;
  const address=new URL(location.href);
  address.searchParams.set('outcome',bucket.marketId||'');
  address.searchParams.set('day',item.date);
  address.searchParams.set('lang',language);
  history.replaceState(null,'',address);
  document.querySelector("#point-counter").textContent = `${String(state.selected + 1).padStart(2, "0")} / ${series.length}`;
  render();
  if (!predictionPanel.hidden) renderPrediction();
}
function showTooltip(event, index) {
  const item = series[index];
  const bucket = chosenBucket(index);
  tooltip.innerHTML = language === "en"
    ? `<strong>${formatDate(item.day)}</strong><span>NOAA observed ${temperature(item.actual)}</span><span>Market range ${bucket.label} · ${pct(bucket.price)}</span>`
    : `<strong>${formatDate(item.day)}</strong><span>NOAA 实测 ${temperature(item.actual)}</span><span>市场区间 ${bucket.label} · ${pct(bucket.price)}</span>`;
  tooltip.innerHTML += `<span>${bucket.originalLabel||bucket.label} · ${bucket.quotedAt||"—"}</span>${marketMid(index)!==null?`<span>${language==="en"?"Market points: geometric interval midpoints":"市场圆点：有限区间的几何中点"}</span>`:""}`;
  tooltip.hidden = false;
  moveTooltip(event);
}
function moveTooltip(event) {
  const bounds = wrap.getBoundingClientRect();
  tooltip.style.left = `${Math.max(2, Math.min(event.clientX - bounds.left + 12, bounds.width - 166))}px`;
  tooltip.style.top = `${Math.max(event.clientY - bounds.top - 80, 4)}px`;
}
function renderPrediction() {
  const focusedIndex = [...predictionBars.querySelectorAll('button')].indexOf(document.activeElement);
  const item = series[state.selected];
  const outcomes = item.outcomes;
  const max = Math.max(...outcomes.map((outcome) => outcome.price));
  document.querySelector("#prediction-title").textContent = formatDate(item.day);
  predictionBars.replaceChildren();
  outcomes.forEach((bucket, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `prediction-row${choiceByDay[state.selected] === index ? " chosen" : ""}`;
    button.setAttribute("aria-pressed", String(choiceByDay[state.selected] === index));
    button.setAttribute("aria-label", language === "en"
      ? `${bucket.label}, historical Yes price ${pct(bucket.price)}${bucket.price === max ? ", top price" : ""}`
      : `${bucket.label}，Yes 历史价格${pct(bucket.price)}，${bucket.price === max ? "最高报价" : ""}`);
    const label = document.createElement("span");
    label.className = "prediction-bucket";
    label.textContent = bucket.label;
    const track = document.createElement("span");
    track.className = "prediction-track";
    const fill = document.createElement("span");
    fill.className = "prediction-fill";
    fill.style.width = `${bucket.price / max * 100}%`;
    track.append(fill);
    const percent = document.createElement("span");
    percent.className = "prediction-percent";
    percent.textContent = pct(bucket.price);
    button.append(label, track, percent);
    if (bucket.price === max) {
      const peak = document.createElement("span");
      peak.className = "peak-tag";
      peak.textContent = language === "en" ? "Top" : "最高";
      button.append(peak);
    }
    button.addEventListener("click", () => { choiceByDay[state.selected] = index; select(state.selected); });
    predictionBars.append(button);
  });
  restoreRebuiltFocus(predictionBars, focusedIndex, 'button');
}
function openPrediction() {
  predictionPanel.hidden = false;
  tooltip.hidden = true;
  renderPrediction();
  if (window.matchMedia("(max-width: 640px)").matches) {
    wrap.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
}
function closePrediction() { predictionPanel.hidden = true; }
function svgCoordinates(event) {
  const rect = svg.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * svg.viewBox.baseVal.width / rect.width, y: (event.clientY - rect.top) * svg.viewBox.baseVal.height / rect.height };
}
buckets.forEach((bucket, index) => {
  const item = document.createElement("span");
  const swatch = document.createElement("i");
  swatch.style.backgroundColor = areaColors[index];
  swatch.setAttribute("aria-hidden", "true");
  item.append(swatch, document.createTextNode(`${bucketLabel(bucket)}`));
  areaLegendItems.append(item);
});
tabs.forEach((tab) => tab.addEventListener("click", () => {
  state.view = tab.dataset.view;
  tabs.forEach((button) => { const active = button === tab; button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active)); });
  updateViewCopy();
  tooltip.hidden = true;
  render();
}));
document.querySelector("#prev-point").addEventListener("click", () => select(state.selected - 1));
document.querySelector("#next-point").addEventListener("click", () => select(state.selected + 1));
document.querySelector("#open-prediction").addEventListener("click", openPrediction);
document.querySelector("#close-prediction").addEventListener("click", closePrediction);
document.querySelector("#reset-prediction").addEventListener("click", () => { const outcomes = series[state.selected].outcomes; choiceByDay[state.selected] = outcomes.findIndex((outcome) => outcome.price === Math.max(...outcomes.map((entry) => entry.price))); select(state.selected); });
actualToggles.forEach((button) => button.addEventListener("click", () => {
  state.showActual = !state.showActual;
  actualToggles.forEach((toggle) => toggle.setAttribute("aria-pressed", String(state.showActual)));
  render();
}));
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !predictionPanel.hidden) closePrediction(); });
svg.addEventListener("pointerdown", (event) => {
  const { x, y } = svgCoordinates(event);
  if (state.view === "three-d") {
    if (!event.target.closest(".data-point")) {
      event.preventDefault();
      window.getSelection()?.removeAllRanges();
      dragStart = { mode: "angle", x: event.clientX, angle: state.angle };
    }
  } else if (flatMetrics && y >= flatMetrics.top && y <= flatMetrics.bottom && Math.abs(x - flatMetrics.xAt(state.selected)) <= Math.max(flatMetrics.step * .55, 22)) {
    event.preventDefault();
    window.getSelection()?.removeAllRanges();
    dragStart = { mode: "scrub", x: event.clientX, moved: false };
  }
});
window.addEventListener("pointermove", (event) => {
  if (!dragStart) return;
  if (dragStart.mode === "angle") {
    state.angle = Math.min(70, Math.max(12, dragStart.angle + (event.clientX - dragStart.x) * .28));
    render();
    return;
  }
  if (Math.abs(event.clientX - dragStart.x) < 4 && !dragStart.moved) return;
  dragStart.moved = true;
  suppressPointClick = true;
  glass.classList.add("dragging");
  const { x } = svgCoordinates(event);
  state.draggingX = Math.max(flatMetrics.left, Math.min(flatMetrics.right, x));
  const index = Math.round((state.draggingX - flatMetrics.left) / flatMetrics.step);
  if (index !== state.selected) select(index); else placeGlass();
});
window.addEventListener("pointerup", () => {
  if (dragStart?.mode === "scrub") {
    state.draggingX = null;
    glass.classList.remove("dragging");
    placeGlass();
    window.setTimeout(() => { suppressPointClick = false; }, 50);
  }
  dragStart = null;
});
new ResizeObserver(render).observe(svg);
if(simpleSvg)new ResizeObserver(renderSimple).observe(simpleSvg);
pageButtons.forEach((button) => button.addEventListener("click", () => goToPage(button.dataset.pageTarget)));
languageButtons.forEach((button) => button.addEventListener("click", () => applyLanguage(button.dataset.language)));

locationSelects.forEach((select) => select.addEventListener("change", () => {
  const next = new URL(location.href);
  if (select.value === 'mexico') next.searchParams.set('location', 'mexico');
  else next.searchParams.set('location','laguardia');
  next.hash = document.querySelector('.page-dot.active')?.dataset.pageTarget || 'professional';
  location.assign(next.href);
}));
if (new URLSearchParams(location.search).get('location') === 'mexico') {
  locationSelects.forEach(select => { select.value = 'mexico'; });
}
document.querySelectorAll('[data-unit]').forEach(control => {
  control.setAttribute('aria-pressed', String(control.dataset.unit === temperatureUnit));
  control.addEventListener('click', () => {
    if (control.dataset.unit === temperatureUnit) return;
    try { localStorage.setItem('temperature-unit', control.dataset.unit); } catch {}
    const next = new URL(location.href);
    next.searchParams.set('unit', control.dataset.unit);
    next.searchParams.set('day', series[sourceDayIndex].date);
    next.hash = document.querySelector('.page-dot.active')?.dataset.pageTarget || 'professional';
    location.assign(next.href);
  });
});
document.querySelectorAll('[data-sources-open]').forEach(button => button.addEventListener('click', () => {
  location.assign(`../sources/?location=${isMexico?'mexico':'laguardia'}&day=${series[state.selected].date}&unit=${temperatureUnit}&lang=${language}`);
}));
const restoredOutcome=new URLSearchParams(location.search).get("outcome");
const restoredIndex=series[state.selected].outcomes.findIndex(o=>o.marketId===restoredOutcome);
if(restoredIndex>=0)choiceByDay[state.selected]=restoredIndex;
document.getElementById("reset-view").addEventListener("click",()=>{state.angle=38;render();});
tabs.forEach((tab,i)=>tab.addEventListener("keydown",e=>{let next=e.key==="ArrowRight"?(i+1)%tabs.length:e.key==="ArrowLeft"?(i+tabs.length-1)%tabs.length:e.key==="Home"?0:e.key==="End"?tabs.length-1:null;if(next!==null){e.preventDefault();tabs[next].click();tabs[next].focus();}}));
applyLanguage(language);
// Case-study links open their matching view directly; ordinary visits stay simple.
function openLinkedPage() {
  const name = location.hash.slice(1).replace(/-page$/, "");
  goToPage(["simple", "professional", "reliability"].includes(name) ? name : "simple");
}
window.addEventListener("hashchange", openLinkedPage);
requestAnimationFrame(openLinkedPage);

// Verified observation archives are immutable; do not overwrite them with a different statistic.


window.addEventListener('chart-palette-change', ({detail}) => {
  const rgb = color => color.match(/[\da-f]{2}/gi).map(channel => parseInt(channel,16));
  const from=rgb(detail.primary), to=rgb(detail.secondary);
  areaColors=buckets.map((_,i)=>`rgb(${from.map((channel,k)=>Math.round(channel+(to[k]-channel)*i/Math.max(1,buckets.length-1))).join(',')})`);
  areaLegendItems.querySelectorAll('i').forEach((swatch,i)=>swatch.style.backgroundColor=areaColors[i]);
  render();renderSimple();
});


}
startExplorer().catch(error=>{document.querySelector(".workspace").hidden=true;document.querySelector(".reading").hidden=true;const status=document.getElementById("observation-status");status.textContent=new URLSearchParams(location.search).get("lang")==="en"?"Records could not load.":"历史记录暂时无法读取。";const retry=document.createElement("button");retry.id="retry-load";retry.textContent=new URLSearchParams(location.search).get("lang")==="en"?"Retry":"重试";retry.onclick=()=>location.reload();status.parentElement.append(retry);});
