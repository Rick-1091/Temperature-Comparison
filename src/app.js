// NOAA NCEI daily-summaries, station USW00094728, TMAX, standard (°F).
// Verified against the official API on 2026-09-20; used when browser CORS/offline blocks refresh.
const observedTmaxByDate = Object.freeze({
  "2026-08-17": 81, "2026-08-18": 86, "2026-08-19": 85, "2026-08-20": 84,
  "2026-08-21": 79, "2026-08-22": 77, "2026-08-23": 80, "2026-08-24": 79,
  "2026-08-25": 78, "2026-08-26": 81, "2026-08-27": 77, "2026-08-28": 84
});
// The market buckets below remain illustrative until dated pre-settlement snapshots are sourced.
const marketExample = [
  { day: 17, low: 80, high: 81 }, { day: 18, low: 80, high: 81 },
  { day: 19, low: 84, high: 85 }, { day: 20, low: 82, high: 83 },
  { day: 21, low: 80, high: 81 }, { day: 22, low: 78, high: 79 },
  { day: 23, low: 76, high: 77 }, { day: 24, low: 80, high: 81 },
  { day: 25, low: 82, high: 83 }, { day: 26, low: 84, high: 85 },
  { day: 27, low: 78, high: 79 }, { day: 28, low: 76, high: 77 }
];
const series = marketExample.map((item) => ({ ...item, actual: observedTmaxByDate[`2026-08-${item.day}`] }));
const buckets = [74, 76, 78, 80, 82, 84, 86].map((low) => ({ low, high: low + 1 }));
const marketShares = series.map((item) => {
  const center = buckets.findIndex((bucket) => bucket.low === item.low);
  const raw = buckets.map((_, index) => Math.exp(-Math.pow(index - center, 2) / 2.3));
  const total = raw.reduce((sum, value) => sum + value, 0);
  const scaled = raw.map((value) => value / total * 100);
  const shares = scaled.map(Math.floor);
  const order = scaled.map((value, index) => ({ index, remainder: value - shares[index] })).sort((a, b) => b.remainder - a.remainder);
  const deficit = 100 - shares.reduce((sum, value) => sum + value, 0);
  for (let i = 0; i < deficit; i++) shares[order[i].index]++;
  return shares;
});
const choiceByDay = series.map((item) => buckets.findIndex((bucket) => bucket.low === item.low));
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
const areaColors = ["#3b69bb", "#498fc9", "#41aaad", "#c3aa62", "#dd8f63", "#d66b71", "#a85d96"];
const NS = "http://www.w3.org/2000/svg";
const yMin = 72;
const yMax = 88;
let dragStart = null;
let flatMetrics = null;
let suppressPointClick = false;

function chosenBucket(index) { return buckets[choiceByDay[index]]; }
function marketMid(index) { const bucket = chosenBucket(index); return (bucket.low + bucket.high) / 2; }
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
  const group = el("g", { class: `data-point${isSelected ? " is-selected" : ""}`, tabindex: "0", role: "button", "aria-label": `8月${item.day}日，实际气温值${item.actual}华氏度，市场预测值${bucket.low}至${bucket.high}华氏度${type === "market" ? "，点击查看全部预测" : ""}`, "data-index": index, "data-type": type });
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
  [72, 76, 80, 84, 88].forEach((tick) => {
    const y = temperatureY(tick, top, bottom);
    line(left, y, right, y, "grid-line");
    label(`${tick}°`, left - 13, y + 4, "axis-label", "end");
  });
  series.forEach((item, index) => {
    const step = right - left < 500 ? 3 : 2;
    if (index === state.selected || (index % step === 0 && Math.abs(index - state.selected) > 1)) label(`${item.day}`, xAt(index), bottom + 29, index === state.selected ? "axis-label selected" : "axis-label");
  });
  label("8 月日期", right, bottom + 52, "axis-caption", "end");
  label("气温 °F", left, top - 18, "axis-caption", "start");
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
  [72, 76, 80, 84, 88].forEach((tick) => {
    const a = project(0, tick, 0), b = project(11, tick, 0), c = project(11, tick, 1), d = project(0, tick, 1);
    path([a, b, c, d], tick === 72 ? "plane-edge" : "plane-grid");
    label(`${tick}°`, a[0] - 13, a[1] + 4, "axis-label", "end");
  });
  const base = project(0, 72, 0), top = project(0, 88, 0);
  line(base[0], base[1], top[0], top[1], "axis-strong");
  series.forEach((item, i) => {
    const a = project(i, item.actual, 0), b = project(i, marketMid(i), 1);
    line(a[0], a[1], b[0], b[1], i === state.selected ? "depth-link active" : "depth-link");
    const step = mobile ? 3 : 2;
    if (i === state.selected || (i % step === 0 && Math.abs(i - state.selected) > 1)) { const date = project(i, 72, 0); label(`${item.day}`, date[0], date[1] + 29, i === state.selected ? "axis-label selected" : "axis-label"); }
  });
  path(series.map((item, i) => project(i, item.actual, 0)), "series-line actual-line");
  path(series.map((item, i) => project(i, marketMid(i), 1)), "series-line market-line");
  series.forEach((item, i) => {
    const a = project(i, item.actual, 0), b = project(i, marketMid(i), 1);
    point(a[0], a[1], i, "actual", mobile ? 4.5 : 6);
    point(b[0], b[1], i, "market", mobile ? 4.5 : 6);
  });
  const xLabel = project(11, 72, 0);
  label("时间 →", xLabel[0], xLabel[1] + 55, "axis-caption", "end");
  label("气温 °F", top[0], top[1] - 17, "axis-caption", "start");
  const laneA = project(10, 76, 0), laneB = project(10, 76, 1);
  label("实际气温值", laneA[0], laneA[1] + 21, "lane-label actual-label");
  label("市场预测值", laneB[0], laneB[1] - 14, "lane-label market-label");
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
  label("预测温度 °F", left, top - 18, "axis-caption", "start");
  buckets.forEach((bucket, bucketIndex) => {
    const y = top + (buckets.length - 1 - bucketIndex) * cellHeight;
    label(`${bucket.low}-${bucket.high}°`, left - 10, y + cellHeight / 2 + 4, "axis-label", "end");
    series.forEach((item, dayIndex) => {
      const share = marketShares[dayIndex][bucketIndex];
      const x = left + dayIndex * cellWidth;
      const actualInBucket = item.actual >= bucket.low && item.actual <= bucket.high;
      const group = el("g", { class: "heat-cell-group", role: "button", tabindex: "0", "data-day": dayIndex, "data-bucket": bucketIndex,
        "aria-label": `8月${item.day}日，${bucket.low}至${bucket.high}华氏度，市场占比${share}%${state.showActual && actualInBucket ? "，实测气温落在此区间" : ""}` });
      el("rect", { x: x + 1.5, y: y + 1.5, width: cellWidth - 3, height: cellHeight - 3, rx: 4, class: "heat-cell", style: `--cell-alpha:${(.12 + .88 * share / maxShare).toFixed(3)}` }, group);
      if (state.showActual && actualInBucket) {
        el("rect", { x: x + 2.5, y: y + 2.5, width: cellWidth - 5, height: cellHeight - 5, rx: 4, class: "heat-actual-frame" }, group);
        const actualPosition = (item.actual - bucket.low + .5) / (bucket.high - bucket.low + 1);
        el("circle", { cx: x + cellWidth / 2, cy: y + cellHeight * (1 - actualPosition), r: mobile ? 4 : 5, class: "heat-actual-dot" }, group);
      }
      const activate = () => { choiceByDay[dayIndex] = bucketIndex; select(dayIndex); };
      group.addEventListener("click", activate);
      group.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
      group.addEventListener("pointerenter", (event) => {
        tooltip.innerHTML = `<strong>8 月 ${item.day} 日</strong><span>${bucket.low}-${bucket.high}°F · 市场占比 ${share}%</span>${state.showActual && actualInBucket ? `<span>实际气温值 ${item.actual}°F</span>` : ""}`;
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
  label("8 月日期", right, bottom + 48, "axis-caption", "end");
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
  label("预测区间占比 · 示例", left, top - 41, "axis-caption", "start");
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
        role: "button", tabindex: "0", "aria-label": `8月${item.day}日 NOAA 实际气温 ${item.actual} 华氏度，点击选择日期` });
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
  label("8 月日期", right, bottom + 48, "axis-caption", "end");
  const bandAt = (event, dayIndex) => {
    const { y } = svgCoordinates(event);
    const shareFromBottom = Math.max(0, Math.min(99.999, (bottom - y) / (bottom - top) * 100));
    return buckets.findIndex((_, bucketIndex) => shareFromBottom < cumulative(dayIndex, bucketIndex));
  };
  series.forEach((item, dayIndex) => {
    const target = el("rect", { x: left + dayIndex * step, y: top, width: step, height: bottom - top,
      class: "area-hit-target", role: "button", tabindex: "0", "aria-label": `8月${item.day}日，查看市场预测温度区间分布` });
    target.addEventListener("pointermove", (event) => {
      const bucketIndex = bandAt(event, dayIndex);
      if (bucketIndex < 0) return;
      const bucket = buckets[bucketIndex];
      tooltip.innerHTML = `<strong>8 月 ${item.day} 日</strong><span>${bucket.low}-${bucket.high}°F · 市场占比 ${marketShares[dayIndex][bucketIndex]}%（示例）</span>`;
      tooltip.hidden = false;
      moveTooltip(event);
    });
    target.addEventListener("pointerleave", () => { tooltip.hidden = true; });
    target.addEventListener("click", (event) => {
      const bucketIndex = bandAt(event, dayIndex);
      if (bucketIndex >= 0) choiceByDay[dayIndex] = bucketIndex;
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
function render() {
  const width = Math.max(svg.clientWidth, 310), height = Math.max(svg.clientHeight, 430);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.innerHTML = "";
  wrap.classList.toggle("flat-view", state.view === "dumbbell" || state.view === "lines");
  heatmapOptions.hidden = state.view !== "heatmap";
  areaLegend.hidden = state.view !== "area";
  summaryLegend.hidden = state.view === "area";
  svg.setAttribute("aria-label", state.view === "area" ? "每日预测温度区间占比的平滑堆叠面积图，市场数据为示例" : "纽约中央公园每日实际气温值与市场预测值对比图");
  if (state.view === "three-d") renderThreeD(width, height);
  else if (state.view === "heatmap") renderHeatmap(width, height);
  else if (state.view === "area") renderArea(width, height);
  else renderFlat(width, height);
}
function select(index) {
  state.selected = (index + series.length) % series.length;
  const item = series[state.selected];
  const bucket = chosenBucket(state.selected);
  const share = marketShares[state.selected][choiceByDay[state.selected]];
  const defaultChoice = choiceByDay[state.selected] === marketShares[state.selected].indexOf(Math.max(...marketShares[state.selected]));
  document.querySelector("#selected-date").textContent = `8 月 ${item.day} 日`;
  document.querySelector("#actual-value").textContent = `${item.actual}°F`;
  document.querySelector("#market-value").textContent = `${bucket.low}-${bucket.high}°F`;
  const hit = item.actual >= bucket.low && item.actual <= bucket.high;
  document.querySelector("#difference-value").textContent = hit ? "命中区间" : `偏离 ${Math.min(Math.abs(item.actual - bucket.low), Math.abs(item.actual - bucket.high))}°F`;
  document.querySelector("#difference-explain").textContent = hit ? `实际气温落在所选预测区间内（占比 ${share}%）。` : `实际为 ${item.actual}°F，${defaultChoice ? "最高占比预测" : "所选预测"}为 ${bucket.low}-${bucket.high}°F（${share}%）。`;
  document.querySelector("#point-counter").textContent = `${String(state.selected + 1).padStart(2, "0")} / ${series.length}`;
  render();
  if (!predictionPanel.hidden) renderPrediction();
}
function showTooltip(event, index) {
  const item = series[index];
  const bucket = chosenBucket(index);
  tooltip.innerHTML = `<strong>8 月 ${item.day} 日</strong><span>实际气温值 ${item.actual}°F</span><span>市场预测值 ${bucket.low}-${bucket.high}°F</span>`;
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
  const shares = marketShares[state.selected];
  const max = Math.max(...shares);
  document.querySelector("#prediction-title").textContent = `8 月 ${item.day} 日`;
  predictionBars.replaceChildren();
  buckets.forEach((bucket, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `prediction-row${choiceByDay[state.selected] === index ? " chosen" : ""}`;
    button.setAttribute("aria-pressed", String(choiceByDay[state.selected] === index));
    button.setAttribute("aria-label", `${bucket.low}至${bucket.high}华氏度，占比${shares[index]}%，${index === shares.indexOf(max) ? "最高占比" : ""}`);
    const label = document.createElement("span");
    label.className = "prediction-bucket";
    label.textContent = `${bucket.low}-${bucket.high}°F`;
    const track = document.createElement("span");
    track.className = "prediction-track";
    const fill = document.createElement("span");
    fill.className = "prediction-fill";
    fill.style.width = `${shares[index] / max * 100}%`;
    track.append(fill);
    const percent = document.createElement("span");
    percent.className = "prediction-percent";
    percent.textContent = `${shares[index]}%`;
    button.append(label, track, percent);
    if (index === shares.indexOf(max)) {
      const peak = document.createElement("span");
      peak.className = "peak-tag";
      peak.textContent = "最高";
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
  document.querySelector("#view-hint").textContent = { dumbbell: "两点间的距离，就是当天预测与实际的偏差。", lines: "观察市场预测值与实际气温值如何随日期一起变化。", "three-d": "前轨为实际气温值，后轨为市场预测值；拖动图表可调整视角。", heatmap: "色块深浅代表市场预测区间的占比。", area: "每条彩色带表示一个预测温度区间的占比。" }[state.view];
  document.querySelector("#angle-note").textContent = state.view === "three-d" ? "拖动图表调整 3D 视角；点击橙色点查看预测分布。" : state.view === "heatmap" ? "点击色块选择日期与预测区间；可显示最终实际温度。" : state.view === "area" ? "点击彩色带选择日期与温度区间；纵轴为市场占比（示例）。" : "拖动亚克力板选择日期；点击橙色点查看预测分布。";
  tooltip.hidden = true;
  render();
}));
document.querySelector("#prev-point").addEventListener("click", () => select(state.selected - 1));
document.querySelector("#next-point").addEventListener("click", () => select(state.selected + 1));
document.querySelector("#open-prediction").addEventListener("click", openPrediction);
document.querySelector("#close-prediction").addEventListener("click", closePrediction);
document.querySelector("#reset-prediction").addEventListener("click", () => { choiceByDay[state.selected] = marketShares[state.selected].indexOf(Math.max(...marketShares[state.selected])); select(state.selected); });
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
select(0);

async function refreshObservedHighs() {
  const status = document.querySelector("#observation-status");
  try {
    const response = await fetch(document.querySelector("#noaa-link").href, {
      cache: "no-store", signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error(`NOAA HTTP ${response.status}`);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error("NOAA response is not an array");
    const observations = new Map(rows.filter((row) => row.STATION === "USW00094728")
      .map((row) => [row.DATE, Number(row.TMAX)]));
    const highs = series.map((item) => observations.get(`2026-08-${item.day}`));
    if (highs.some((value) => !Number.isFinite(value) || value < 40 || value > 120)) {
      throw new Error("NOAA data has missing or unexpected daily highs");
    }
    series.forEach((item, index) => { item.actual = highs[index]; });
    status.textContent = "NOAA 已更新 · 市场示例";
    select(state.selected);
  } catch {
    status.textContent = "NOAA 快照 · 市场示例";
  }
}
refreshObservedHighs();

