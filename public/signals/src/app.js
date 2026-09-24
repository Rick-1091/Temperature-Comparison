// The embedded snapshot contains original SDK quotes and NOAA LaGuardia daily TMAX.
const series = climateSnapshot.days.map((item) => ({ ...item }));
const bucketLows = [...new Set(series.flatMap((item) => item.outcomes.map((outcome) => Math.floor(outcome.midpoint / 2) * 2)))].sort((a, b) => a - b);
const buckets = bucketLows.map((low) => ({ low, high: low + 1 }));
const binFor = (outcome) => bucketLows.indexOf(Math.floor(outcome.midpoint / 2) * 2);
const marketShares = series.map((item) => {
  const total = item.outcomes.reduce((sum, outcome) => sum + outcome.price, 0);
  return buckets.map((_, index) => item.outcomes.filter((outcome) => binFor(outcome) === index).reduce((sum, outcome) => sum + outcome.price, 0) / total * 100);
});
const choiceByDay = series.map((item) => item.outcomes.findIndex((outcome) => outcome.price === Math.max(...item.outcomes.map((entry) => entry.price))));
const pct = (value) => `${(value * 100).toFixed(1)}%`;
const sharePct = (value) => `${value.toFixed(1)}%`;
const outcomeForBin = (dayIndex, binIndex) => series[dayIndex].outcomes.findIndex((outcome) => binFor(outcome) === binIndex);
const state = { view: "dumbbell", selected: 0, angle: 38, draggingX: null, showActual: false };
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
const areaColors = buckets.map((_, index) => `hsl(${210 - index * 148 / Math.max(1, buckets.length - 1)} 58% ${50 + (index % 3) * 4}%)`);
const NS = "http://www.w3.org/2000/svg";
const yMin = Math.floor(Math.min(...bucketLows, ...series.map((item) => item.actual)) / 4) * 4;
const yMax = Math.ceil(Math.max(...buckets.map((bucket) => bucket.high), ...series.map((item) => item.actual)) / 4) * 4;
const yTicks = Array.from({ length: Math.floor((yMax - yMin) / 4) + 1 }, (_, index) => yMin + index * 4);
let dragStart = null;
let flatMetrics = null;
let suppressPointClick = false;
let observationFresh = false;
let language = (() => { try { return localStorage.getItem("temperature-language") === "en" ? "en" : "zh"; } catch { return "zh"; } })();

const localizedCopy = {
  zh: {
    documentTitle: "温度对照 | 市场预测与实际气温",
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
    proTitle: "市场猜的温度 <em>v.s.</em><br><span>天气最后给的答案</span>", proLead: "把市场预测的温度区间与最终实测值放在同一条时间轴上，逐日查看预测分布和偏差。",
    locationTitle: "纽约拉瓜迪亚机场 · 最高气温", period: "2026 年 8 月 17–28 日 <span>/</span> 华氏度 °F <span>/</span> 市场价取当地当日 00:00 前最近报价",
    legend: "<span><i class=\"legend-key actual-key\"></i> 实际气温值（NOAA）</span><span><i class=\"legend-key market-key\"></i> 市场预测值（历史价最高区间）</span>",
    tabDumbbell: "<span class=\"tab-icon icon-pair\" aria-hidden=\"true\"></span>逐日对照", tabLines: "<span class=\"tab-icon icon-lines\" aria-hidden=\"true\"></span>双线趋势", tab3d: "<span class=\"tab-icon icon-cube\" aria-hidden=\"true\"></span>3D 双轨", tabHeatmap: "<span class=\"tab-icon icon-heat\" aria-hidden=\"true\"></span>预测热力图", tabArea: "<span class=\"tab-icon icon-area\" aria-hidden=\"true\"></span>预测面积图",
    heatScale: "<span>归一化历史价格占比</span><i aria-hidden=\"true\"></i><small>低</small><small>高</small>", showActual: "<span class=\"toggle-track\" aria-hidden=\"true\"><span></span></span>显示最终实际温度",
    predictionSource: "Polymarket · Yes 历史价格", predictionIntro: "点击一个温度区间，将其作为主图的市场预测值。", predictionFoot: "价格不是押注人数；各档取最近可得报价", resetPrediction: "恢复最高报价",
    currentDate: "当前日期", actualMetric: "实际气温值 <small>NOAA 实测</small>", marketMetric: "市场预测值 <small>历史价格</small><b>查看全部预测 ↗</b>", compareMetric: "与 NOAA 日最高对照",
    dataSummary: "<strong>真实历史数据</strong> NOAA 日最高 × Polymarket 当日零点前价格。口径差异见详情。", dataDetails: "查看数据口径",
    observedDetail: "<strong>实测</strong> NOAA NCEI 拉瓜迪亚机场站 USW00014732，每日最高气温 TMAX（°F），2026 年 8 月 17–28 日；内置核验快照并尝试在线刷新。",
    marketDetail: "<strong>市场</strong> 逐日 11 个温度区间的 Polymarket Yes-token 历史价格，取纽约当地日期 00:00 前最近可得报价。不同区间的实际报价时间可能不同；价格不是预测人数，各区间价格之和也未必是 100%。热力图与面积图将当日价格之和归一化，仅供分布对照。",
    limitDetail: "<strong>口径限制</strong> NOAA 日最高与市场规则指定的逐小时结算来源不同，不能仅据两者差值判定市场结算是否预测正确。市场链接随所选日期切换。", noaaLink: "NOAA 实测数据接口 ↗"
  },
  en: {
    documentTitle: "Temperature Compare | Market Forecasts vs. Observed Weather",
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
    proTitle: "What the market predicted <em>v.s.</em><br><span>what the weather delivered</span>", proLead: "Compare forecast temperature ranges with observed highs on the same timeline, day by day.",
    locationTitle: "New York LaGuardia Airport · Daily High", period: "August 17–28, 2026 <span>/</span> Fahrenheit °F <span>/</span> latest price before local midnight",
    legend: "<span><i class=\"legend-key actual-key\"></i> Observed high (NOAA)</span><span><i class=\"legend-key market-key\"></i> Market forecast (top-priced range)</span>",
    tabDumbbell: "<span class=\"tab-icon icon-pair\" aria-hidden=\"true\"></span>Daily compare", tabLines: "<span class=\"tab-icon icon-lines\" aria-hidden=\"true\"></span>Trends", tab3d: "<span class=\"tab-icon icon-cube\" aria-hidden=\"true\"></span>3D tracks", tabHeatmap: "<span class=\"tab-icon icon-heat\" aria-hidden=\"true\"></span>Heatmap", tabArea: "<span class=\"tab-icon icon-area\" aria-hidden=\"true\"></span>Area view",
    heatScale: "<span>Normalized historical price share</span><i aria-hidden=\"true\"></i><small>Low</small><small>High</small>", showActual: "<span class=\"toggle-track\" aria-hidden=\"true\"><span></span></span>Show observed high",
    predictionSource: "Polymarket · Historical Yes price", predictionIntro: "Choose a temperature range to replace the market value in the main chart.", predictionFoot: "Prices are not bettor counts; each range uses its latest available quote", resetPrediction: "Restore top price",
    currentDate: "Selected date", actualMetric: "Observed high <small>NOAA</small>", marketMetric: "Market forecast <small>Historical price</small><b>View all forecasts ↗</b>", compareMetric: "Compared with NOAA daily high",
    dataSummary: "<strong>Historical data</strong> NOAA daily highs × Polymarket prices before local midnight. See methodology for caveats.", dataDetails: "View methodology",
    observedDetail: "<strong>Observed</strong> NOAA NCEI LaGuardia Airport station USW00014732 daily TMAX (°F), August 17–28, 2026; the site keeps a verified snapshot and attempts an online refresh.",
    marketDetail: "<strong>Market</strong> Historical Polymarket Yes-token prices for 11 temperature ranges per day, using the latest available quote before 00:00 local time. Prices are not bettor counts and may not sum to 100%; heatmap and area views normalize each day’s prices.",
    limitDetail: "<strong>Method limit</strong> NOAA daily TMAX and the market’s specified hourly resolution source can differ, so their gap alone does not determine whether the market resolved correctly. The market link follows the selected date.", noaaLink: "NOAA observed-data API ↗"
  }
};

const staticBindings = [
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
  zh: { dumbbell: "拖动亚克力板选择日期；点击橙色点查看全部历史报价。", lines: "拖动亚克力板选择日期；点击橙色点查看全部历史报价。", "three-d": "拖动图表调整 3D 视角；点击橙色点查看全部历史报价。", heatmap: "点击色块选择日期与预测区间；可显示 NOAA 最终气温。", area: "点击彩色带选择日期与温度区间；纵轴为归一化价格占比。" },
  en: { dumbbell: "Drag the acrylic selector across dates; select an orange point for all historical prices.", lines: "Drag the acrylic selector across dates; select an orange point for all historical prices.", "three-d": "Drag to rotate the 3D view; select an orange point for all historical prices.", heatmap: "Select a cell to choose a date and forecast range; NOAA highs can be overlaid.", area: "Select a colored band to choose a date and temperature range; the y-axis is normalized price share." }
};

function formatDate(day) { return language === "en" ? `Aug ${day}` : `8 月 ${day} 日`; }
function updateObservationStatus() {
  document.querySelector("#observation-status").textContent = language === "en"
    ? `NOAA ${observationFresh ? "updated" : "snapshot"} · market history`
    : `NOAA ${observationFresh ? "已更新" : "快照"} · 市场历史价`;
}
function updateViewCopy() {
  document.querySelector("#view-hint").textContent = viewHints[language][state.view];
  document.querySelector("#angle-note").textContent = interactionHints[language][state.view];
}
function applyLanguage(nextLanguage) {
  language = nextLanguage === "en" ? "en" : "zh";
  try { localStorage.setItem("temperature-language", language); } catch {}
  document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  document.title = localizedCopy[language].documentTitle;
  staticBindings.forEach(([selector, key]) => document.querySelectorAll(selector).forEach((node) => { node.innerHTML = localizedCopy[language][key]; }));
  languageButtons.forEach((button) => { const active = button.dataset.language === language; button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active)); });
  document.querySelector(".page-switcher").setAttribute("aria-label", language === "en" ? "Pages and language" : "页面与语言");
  locationSelects.forEach((select) => select.setAttribute("aria-label", language === "en" ? "Choose location" : "选择地点"));
  document.querySelector("#prev-point").setAttribute("aria-label", language === "en" ? "Previous day" : "选择前一天");
  document.querySelector("#next-point").setAttribute("aria-label", language === "en" ? "Next day" : "选择后一天");
  document.querySelector("#close-prediction").setAttribute("aria-label", language === "en" ? "Close forecast distribution" : "关闭预测分布面板");
  updateObservationStatus();
  updateViewCopy();
  renderSimple();
  select(state.selected);
}

function chosenBucket(index) { return series[index].outcomes[choiceByDay[index]]; }
function marketMid(index) { return chosenBucket(index).midpoint; }
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
    ? `${formatDate(item.day)}, observed high ${item.actual}°F, market forecast ${bucket.label}${type === "market" ? ", select to view all forecasts" : ""}`
    : `8月${item.day}日，实际气温值${item.actual}华氏度，市场预测值${bucket.label}${type === "market" ? "，点击查看全部预测" : ""}`;
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
    label(`${tick}°`, left - 13, y + 4, "axis-label", "end");
  });
  series.forEach((item, index) => {
    const step = right - left < 500 ? 3 : 2;
    if (index === state.selected || (index % step === 0 && Math.abs(index - state.selected) > 1)) label(`${item.day}`, xAt(index), bottom + 29, index === state.selected ? "axis-label selected" : "axis-label");
  });
  label(language === "en" ? "August date" : "8 月日期", right, bottom + 52, "axis-caption", "end");
  label(language === "en" ? "Temperature °F" : "气温 °F", left, top - 18, "axis-caption", "start");
}
function renderFlat(width, height) {
  const mobile = width < 640;
  const left = mobile ? 48 : 64;
  const right = width - (mobile ? 20 : 34);
  const top = 60;
  const bottom = height - 78;
  const xAt = (index) => left + index / (series.length - 1) * (right - left);
  flatMetrics = { left, right, top, bottom, step: (right - left) / (series.length - 1), xAt };
  placeGlass();
  renderAxes(left, right, top, bottom, xAt);
  if (state.view === "lines") {
    path(series.map((item, i) => [xAt(i), temperatureY(item.actual, top, bottom)]), "series-line actual-line");
    path(series.map((item, i) => [xAt(i), temperatureY(marketMid(i), top, bottom)]), "series-line market-line");
  }
  series.forEach((item, index) => {
    const x = xAt(index);
    const actualY = temperatureY(item.actual, top, bottom);
    const marketY = temperatureY(marketMid(index), top, bottom);
    if (state.view === "dumbbell") line(x, actualY, x, marketY, "difference-line");
    point(x, actualY, index, "actual", mobile ? 4.5 : 6);
    point(x, marketY, index, "market", mobile ? 4.5 : 6);
  });
}
function renderThreeD(width, height) {
  flatMetrics = null;
  glass.hidden = true;
  focusMarkers.hidden = true;
  const mobile = width < 640;
  const angle = state.angle * Math.PI / 180;
  const originX = mobile ? 47 : 82;
  const bottom = height - (mobile ? 120 : 100);
  const span = width - (mobile ? 132 : 222);
  const depth = mobile ? 74 : 116;
  const rise = height - (mobile ? 218 : 172);
  // Project x=time, y=temperature, z=series lane into the SVG viewport.
  const project = (index, value, lane) => {
    const t = index / (series.length - 1);
    return [originX + t * span + lane * depth * Math.sin(angle), bottom - (value - yMin) / (yMax - yMin) * rise - lane * depth * Math.cos(angle) * .46 - t * 24 * Math.sin(angle)];
  };
  yTicks.forEach((tick) => {
    const a = project(0, tick, 0), b = project(series.length - 1, tick, 0), c = project(series.length - 1, tick, 1), d = project(0, tick, 1);
    path([a, b, c, d], tick === yMin ? "plane-edge" : "plane-grid");
    label(`${tick}°`, a[0] - 13, a[1] + 4, "axis-label", "end");
  });
  const base = project(0, yMin, 0), top = project(0, yMax, 0);
  line(base[0], base[1], top[0], top[1], "axis-strong");
  series.forEach((item, i) => {
    const a = project(i, item.actual, 0), b = project(i, marketMid(i), 1);
    line(a[0], a[1], b[0], b[1], i === state.selected ? "depth-link active" : "depth-link");
    const step = mobile ? 3 : 2;
    if (i === state.selected || (i % step === 0 && Math.abs(i - state.selected) > 1)) { const date = project(i, yMin, 0); label(`${item.day}`, date[0], date[1] + 29, i === state.selected ? "axis-label selected" : "axis-label"); }
  });
  path(series.map((item, i) => project(i, item.actual, 0)), "series-line actual-line");
  path(series.map((item, i) => project(i, marketMid(i), 1)), "series-line market-line");
  series.forEach((item, i) => {
    const a = project(i, item.actual, 0), b = project(i, marketMid(i), 1);
    point(a[0], a[1], i, "actual", mobile ? 4.5 : 6);
    point(b[0], b[1], i, "market", mobile ? 4.5 : 6);
  });
  const xLabel = project(series.length - 1, yMin, 0);
  label(language === "en" ? "Time →" : "时间 →", xLabel[0], xLabel[1] + 55, "axis-caption", "end");
  label(language === "en" ? "Temperature °F" : "气温 °F", top[0], top[1] - 17, "axis-caption", "start");
  const laneA = project(10, yMin + 4, 0), laneB = project(10, yMin + 4, 1);
  label(language === "en" ? "Observed high" : "实际气温值", laneA[0], laneA[1] + 21, "lane-label actual-label");
  label(language === "en" ? "Market forecast" : "市场预测值", laneB[0], laneB[1] - 14, "lane-label market-label");
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
  const maxShare = Math.max(...marketShares.flat());
  label(language === "en" ? "Forecast temperature °F" : "预测温度 °F", left, top - 18, "axis-caption", "start");
  buckets.forEach((bucket, bucketIndex) => {
    const y = top + (buckets.length - 1 - bucketIndex) * cellHeight;
    label(`${bucket.low}-${bucket.high}°`, left - 10, y + cellHeight / 2 + 4, "axis-label", "end");
    series.forEach((item, dayIndex) => {
      const share = marketShares[dayIndex][bucketIndex];
      const x = left + dayIndex * cellWidth;
      const actualInBucket = item.actual >= bucket.low && item.actual <= bucket.high;
      const cellLabel = language === "en"
        ? `${formatDate(item.day)}, ${bucket.low}–${bucket.high}°F, normalized price share ${sharePct(share)}${state.showActual && actualInBucket ? ", observed high is in this range" : ""}`
        : `8月${item.day}日，${bucket.low}至${bucket.high}华氏度，归一化价格占比${sharePct(share)}${state.showActual && actualInBucket ? "，实测气温落在此区间" : ""}`;
      const group = el("g", { class: "heat-cell-group", role: "button", tabindex: "0", "data-day": dayIndex, "data-bucket": bucketIndex, "aria-label": cellLabel });
      el("rect", { x: x + 1.5, y: y + 1.5, width: cellWidth - 3, height: cellHeight - 3, rx: 4, class: "heat-cell", style: `--cell-alpha:${(.12 + .88 * share / maxShare).toFixed(3)}` }, group);
      if (state.showActual && actualInBucket) {
        el("rect", { x: x + 2.5, y: y + 2.5, width: cellWidth - 5, height: cellHeight - 5, rx: 4, class: "heat-actual-frame" }, group);
        const actualPosition = (item.actual - bucket.low + .5) / (bucket.high - bucket.low + 1);
        el("circle", { cx: x + cellWidth / 2, cy: y + cellHeight * (1 - actualPosition), r: mobile ? 4 : 5, class: "heat-actual-dot" }, group);
      }
      const activate = () => { const outcomeIndex = outcomeForBin(dayIndex, bucketIndex); if (outcomeIndex >= 0) choiceByDay[dayIndex] = outcomeIndex; select(dayIndex); };
      group.addEventListener("click", activate);
      group.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
      group.addEventListener("pointerenter", (event) => {
        tooltip.innerHTML = language === "en"
          ? `<strong>${formatDate(item.day)}</strong><span>${bucket.low}-${bucket.high}°F · normalized price share ${sharePct(share)}</span>${state.showActual && actualInBucket ? `<span>Observed high ${item.actual}°F</span>` : ""}`
          : `<strong>${formatDate(item.day)}</strong><span>${bucket.low}-${bucket.high}°F · 归一化价格占比 ${sharePct(share)}</span>${state.showActual && actualInBucket ? `<span>实际气温值 ${item.actual}°F</span>` : ""}`;
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
  label(language === "en" ? "August date" : "8 月日期", right, bottom + 48, "axis-caption", "end");
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
  const boundary = (bucketIndex) => [
    [left, yAt(cumulative(0, bucketIndex))],
    ...series.map((_, dayIndex) => [xAt(dayIndex), yAt(cumulative(dayIndex, bucketIndex))]),
    [right, yAt(cumulative(series.length - 1, bucketIndex))]
  ];
  const smoothSegment = (points, initialCommand) => {
    let d = `${initialCommand} ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const [x1, y1] = points[i - 1], [x2, y2] = points[i];
      const middle = (x1 + x2) / 2;
      d += ` C ${middle} ${y1}, ${middle} ${y2}, ${x2} ${y2}`;
    }
    return d;
  };
  [0, 25, 50, 75, 100].forEach((tick) => {
    const y = yAt(tick);
    line(left, y, right, y, "grid-line");
    label(`${tick}%`, left - 12, y + 4, "axis-label", "end");
  });
  label(language === "en" ? "Normalized price share" : "归一化价格占比", left, top - 41, "axis-caption", "start");
  buckets.forEach((_, bucketIndex) => {
    const upper = boundary(bucketIndex);
    const lower = boundary(bucketIndex - 1).reverse();
    const d = `${smoothSegment(upper, "M")} ${smoothSegment(lower, "L")} Z`;
    el("path", { d, fill: areaColors[bucketIndex], class: "area-band", "data-bucket": bucketIndex });
  });
  el("rect", { x: left + state.selected * step + 1, y: top + 1, width: step - 2, height: bottom - top - 2, rx: 4, class: "area-selected-column" });
  if (state.showActual) {
    series.forEach((item, index) => {
      const x = xAt(index);
      const marker = el("circle", { cx: x, cy: top - 13, r: index === state.selected ? 5 : 4, class: `area-actual-dot${index === state.selected ? " selected" : ""}`,
        role: "button", tabindex: "0", "aria-label": language === "en" ? `${formatDate(item.day)}, NOAA observed high ${item.actual}°F, select date` : `8月${item.day}日 NOAA 实际气温 ${item.actual} 华氏度，点击选择日期` });
      marker.addEventListener("click", () => select(index));
      marker.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(index); } });
      if (!mobile || index === state.selected) label(`${item.actual}°`, x, top - 23, index === state.selected ? "area-actual-label selected" : "area-actual-label");
    });
  }
  series.forEach((item, index) => {
    if (!mobile || index % 2 === 0 || index === state.selected) {
      label(`${item.day}`, xAt(index), bottom + 25, index === state.selected ? "axis-label selected" : "axis-label");
    }
  });
  label(language === "en" ? "August date" : "8 月日期", right, bottom + 48, "axis-caption", "end");
  const bandAt = (event, dayIndex) => {
    const { y } = svgCoordinates(event);
    const shareFromBottom = Math.max(0, Math.min(99.999, (bottom - y) / (bottom - top) * 100));
    return buckets.findIndex((_, bucketIndex) => shareFromBottom < cumulative(dayIndex, bucketIndex));
  };
  series.forEach((item, dayIndex) => {
    const target = el("rect", { x: left + dayIndex * step, y: top, width: step, height: bottom - top,
      class: "area-hit-target", role: "button", tabindex: "0", "aria-label": language === "en" ? `${formatDate(item.day)}, view forecast temperature distribution` : `8月${item.day}日，查看市场预测温度区间分布` });
    target.addEventListener("pointermove", (event) => {
      const bucketIndex = bandAt(event, dayIndex);
      if (bucketIndex < 0) return;
      const bucket = buckets[bucketIndex];
      tooltip.innerHTML = `<strong>${formatDate(item.day)}</strong><span>${bucket.low}-${bucket.high}°F · ${language === "en" ? "normalized price share" : "归一化价格占比"} ${sharePct(marketShares[dayIndex][bucketIndex])}</span>`;
      tooltip.hidden = false;
      moveTooltip(event);
    });
    target.addEventListener("pointerleave", () => { tooltip.hidden = true; });
    target.addEventListener("click", (event) => {
      const bucketIndex = bandAt(event, dayIndex);
      if (bucketIndex >= 0) { const outcomeIndex = outcomeForBin(dayIndex, bucketIndex); if (outcomeIndex >= 0) choiceByDay[dayIndex] = outcomeIndex; }
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
  marketMarker.style.top = `${svgTop + temperatureY(marketMid(state.selected), top, bottom)}px`;
}
function renderSimpleDetail(index) {
  const item = series[index];
  const leader = simpleLeaders[index];
  const inside = (leader.low === null || item.actual >= leader.low) && (leader.high === null || item.actual <= leader.high);
  simpleDetail.innerHTML = language === "en"
    ? `<strong>${formatDate(item.day)}</strong><span class="market-text">Market ${leader.label} · ${pct(leader.price)}</span><span class="actual-text">Observed ${item.actual}°F</span><span>${inside ? "Observed high is inside the forecast range" : "Observed high is outside the forecast range"}</span>`
    : `<strong>${formatDate(item.day)}</strong><span class="market-text">市场 ${leader.label} · ${pct(leader.price)}</span><span class="actual-text">实际 ${item.actual}°F</span><span>${inside ? "实际值落在预测区间内" : "实际值未落在预测区间内"}</span>`;
}
function renderSimple() {
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
    tickLabel.setAttribute("x", left - 10); tickLabel.setAttribute("y", y + 4); tickLabel.setAttribute("text-anchor", "end"); tickLabel.setAttribute("class", "simple-axis"); tickLabel.textContent = `${tick}°`; simpleSvg.append(tickLabel);
  });
  series.forEach((item, index) => {
    const leader = simpleLeaders[index];
    const x = xAt(index);
    const midpointY = yAt(leader.midpoint);
    const actualY = yAt(item.actual);
    const group = document.createElementNS(NS, "g");
    group.setAttribute("class", "simple-point"); group.setAttribute("tabindex", "0"); group.setAttribute("role", "button");
    group.setAttribute("aria-label", language === "en"
      ? `${formatDate(item.day)}, top-priced market range ${leader.label}, Yes price ${pct(leader.price)}, observed high ${item.actual}°F`
      : `8月${item.day}日，市场最高报价区间${leader.label}，Yes价格${pct(leader.price)}，实际气温${item.actual}华氏度`);
    const connector = document.createElementNS(NS, "line"); connector.setAttribute("x1", x); connector.setAttribute("x2", x); connector.setAttribute("y1", midpointY); connector.setAttribute("y2", actualY); connector.setAttribute("class", "simple-link"); group.append(connector);
    const mid = document.createElementNS(NS, "circle"); mid.setAttribute("cx", x); mid.setAttribute("cy", midpointY); mid.setAttribute("r", 6); mid.setAttribute("class", "simple-mid"); group.append(mid);
    const actual = document.createElementNS(NS, "circle"); actual.setAttribute("cx", x); actual.setAttribute("cy", actualY); actual.setAttribute("r", 6); actual.setAttribute("class", "simple-actual"); group.append(actual);
    const hit = (leader.low === null || item.actual >= leader.low) && (leader.high === null || item.actual <= leader.high);
    if (hit) { const ring = document.createElementNS(NS, "circle"); ring.setAttribute("cx", x); ring.setAttribute("cy", actualY); ring.setAttribute("r", 10); ring.setAttribute("class", "simple-hit"); group.append(ring); }
    const activate = () => renderSimpleDetail(index);
    group.addEventListener("pointerenter", activate); group.addEventListener("focus", activate); group.addEventListener("click", activate);
    simpleSvg.append(group);
    if (!mobile || index % 2 === 0 || index === series.length - 1) { const date = document.createElementNS(NS, "text"); date.setAttribute("x", x); date.setAttribute("y", bottom + 28); date.setAttribute("text-anchor", "middle"); date.setAttribute("class", "simple-date"); date.textContent = item.day; simpleSvg.append(date); }
  });
  const hits = series.filter((item, index) => { const leader = simpleLeaders[index]; return (leader.low === null || item.actual >= leader.low) && (leader.high === null || item.actual <= leader.high); }).length;
  document.querySelector("#simple-hit-count").textContent = hits;
  renderSimpleDetail(state.selected);
}
function goToPage(name) {
  const target = document.querySelector(`[data-page="${name}"]`);
  if (!target) return;
  pageDeck.style.scrollBehavior = "auto";
  pageDeck.scrollLeft = target.offsetLeft;
  requestAnimationFrame(() => { pageDeck.style.scrollBehavior = ""; });
}
function render() {
  const width = Math.max(svg.clientWidth, 310), height = Math.max(svg.clientHeight, 430);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.innerHTML = "";
  wrap.classList.toggle("flat-view", state.view === "dumbbell" || state.view === "lines");
  heatmapOptions.hidden = state.view !== "heatmap";
  areaLegend.hidden = state.view !== "area";
  summaryLegend.hidden = state.view === "area";
  svg.setAttribute("aria-label", language === "en"
    ? (state.view === "area" ? "Smooth stacked area chart of normalized historical prices by daily forecast range" : "Daily NOAA observed highs and Polymarket historical temperature forecasts for New York LaGuardia Airport")
    : (state.view === "area" ? "每日预测温度区间历史价格归一化占比的平滑堆叠面积图" : "纽约拉瓜迪亚机场每日 NOAA 实测气温与 Polymarket 历史预测价格对比图"));
  if (state.view === "three-d") renderThreeD(width, height);
  else if (state.view === "heatmap") renderHeatmap(width, height);
  else if (state.view === "area") renderArea(width, height);
  else renderFlat(width, height);
}
function select(index) {
  state.selected = (index + series.length) % series.length;
  const item = series[state.selected];
  const bucket = chosenBucket(state.selected);
  const share = bucket.price;
  const defaultChoice = choiceByDay[state.selected] === item.outcomes.findIndex((outcome) => outcome.price === Math.max(...item.outcomes.map((entry) => entry.price)));
  document.querySelector("#selected-date").textContent = formatDate(item.day);
  document.querySelector("#actual-value").textContent = `${item.actual}°F`;
  document.querySelector("#market-value").textContent = bucket.label;
  const hit = (bucket.low === null || item.actual >= bucket.low) && (bucket.high === null || item.actual <= bucket.high);
  const distance = hit ? 0 : bucket.low !== null && item.actual < bucket.low ? bucket.low - item.actual : item.actual - bucket.high;
  document.querySelector("#difference-value").textContent = language === "en" ? (hit ? "Inside range" : `${distance}°F apart`) : (hit ? "落在区间内" : `相差 ${distance}°F`);
  document.querySelector("#difference-explain").textContent = language === "en"
    ? `NOAA daily high ${item.actual}°F; ${defaultChoice ? "top-priced" : "selected"} range ${bucket.label}, Yes price ${pct(share)}. Market resolution may use a different source.`
    : `NOAA 日最高 ${item.actual}°F；${defaultChoice ? "最高报价" : "所选区间"} ${bucket.label}，Yes 价格 ${pct(share)}。市场结算值可能采用不同来源。`;
  const marketLink = document.querySelector("#market-link");
  marketLink.href = item.marketUrl;
  marketLink.textContent = language === "en" ? `Polymarket NYC Aug ${item.day} market ↗` : `Polymarket 纽约 8/${item.day} 市场 ↗`;
  document.querySelector("#point-counter").textContent = `${String(state.selected + 1).padStart(2, "0")} / ${series.length}`;
  render();
  if (!predictionPanel.hidden) renderPrediction();
}
function showTooltip(event, index) {
  const item = series[index];
  const bucket = chosenBucket(index);
  tooltip.innerHTML = language === "en"
    ? `<strong>${formatDate(item.day)}</strong><span>NOAA observed ${item.actual}°F</span><span>Market forecast ${bucket.label} · ${pct(bucket.price)}</span>`
    : `<strong>${formatDate(item.day)}</strong><span>NOAA 实测 ${item.actual}°F</span><span>市场预测 ${bucket.label} · ${pct(bucket.price)}</span>`;
  tooltip.hidden = false;
  moveTooltip(event);
}
function moveTooltip(event) {
  const bounds = wrap.getBoundingClientRect();
  tooltip.style.left = `${Math.max(2, Math.min(event.clientX - bounds.left + 12, bounds.width - 166))}px`;
  tooltip.style.top = `${Math.max(event.clientY - bounds.top - 80, 4)}px`;
}
function renderPrediction() {
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
  item.append(swatch, document.createTextNode(`${bucket.low}-${bucket.high}°F`));
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
new ResizeObserver(renderSimple).observe(simpleSvg);
pageButtons.forEach((button) => button.addEventListener("click", () => goToPage(button.dataset.pageTarget)));
languageButtons.forEach((button) => button.addEventListener("click", () => applyLanguage(button.dataset.language)));
const pageObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  const name = visible.target.dataset.page;
  document.querySelectorAll(".page-dot").forEach((button) => {
    const active = button.dataset.pageTarget === name;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}, { root: pageDeck, threshold: [.55, .8] });
pagePanels.forEach((panel) => pageObserver.observe(panel));
locationSelects.forEach((select) => select.addEventListener("change", () => {
  locationSelects.forEach((peer) => { peer.value = select.value; });
}));
applyLanguage(language);
requestAnimationFrame(() => goToPage("simple"));

async function refreshObservedHighs() {
  const status = document.querySelector("#observation-status");
  try {
    const response = await fetch(document.querySelector("#noaa-link").href, {
      cache: "no-store", signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error(`NOAA HTTP ${response.status}`);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error("NOAA response is not an array");
    const observations = new Map(rows.filter((row) => row.STATION === "USW00014732")
      .map((row) => [row.DATE, Number(row.TMAX)]));
    const highs = series.map((item) => observations.get(`2026-08-${item.day}`));
    if (highs.some((value) => !Number.isFinite(value) || value < 40 || value > 120)) {
      throw new Error("NOAA data has missing or unexpected daily highs");
    }
    series.forEach((item, index) => { item.actual = highs[index]; });
    observationFresh = true;
    updateObservationStatus();
    renderSimple();
    select(state.selected);
  } catch {
    observationFresh = false;
    updateObservationStatus();
  }
}
refreshObservedHighs();

