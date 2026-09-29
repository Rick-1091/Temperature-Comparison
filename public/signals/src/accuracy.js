// Accuracy trend: how often the top-priced range came true, measured cumulatively or over a rolling window.
(function () {
  const root = document.querySelector("#accuracy-trend");
  if (!root || typeof climateSnapshot === "undefined") return;

  const NS = "http://www.w3.org/2000/svg";
  const windows = ["all", "7", "14"];
  const copy = {
    zh: {
      eyebrow: "ACCURACY TREND",
      title: "准确率趋势",
      lead: "像股票的 7 / 14 日均线：每结算一天，截至当天的命中率就会更新一次。",
      tabs: { all: "累计", 7: "7 日线", 14: "14 日线" },
      tabsLabel: "选择统计窗口",
      legendHit: "命中率（NOAA 实测）",
      legendConf: "市场自身信心（归一化价格）",
      warmup: "预热期",
      notEnough: (w, n) => `${w} 日线至少需要 ${w} 天数据，目前只有 ${n} 天；数据延长后会自动画出。`,
      hitRate: "命中率",
      hitOf: (h, n) => `${n} 天中 ${h} 天命中`,
      conf: "市场信心",
      confNote: "最高报价区间的平均归一化价格",
      windowAll: (n) => `累计 · 全部 ${n} 天`,
      windowRolling: (w) => `最近 ${w} 天`,
      verdictLabel: "判断",
      calibrated: "大致校准：最看好的区间成真的频率与价格所示相当。",
      cautious: "市场看起来偏保守：最看好的区间成真次数多于价格所示。",
      overconfident: "市场看起来过于自信：最看好的区间成真次数少于价格所示。",
      noVerdict: "数据不足，暂无判断。",
      diff: (d) => `差 ${d > 0 ? "+" : ""}${d} 个百分点`,
      stripLabel: "逐日结果",
      stripKey: "实心 = 命中 · 空心 = 未命中",
      hit: "命中",
      miss: "未命中",
      off: (d) => `偏差 ${d}°F`,
      date: (day) => `8 月 ${day} 日`,
      dayDetail: (d) => `${d.dateText} · 最高报价 ${d.label}（Yes ${d.priceText}）· NOAA ${d.actual}°F · ${d.hit ? "命中" : `未命中，偏差 ${d.off}°F`}`,
      windowDetail: (h, c) => `窗口命中率 ${h} · 市场信心 ${c}`,
      windowNone: "此窗口尚无数据",
      hover: "悬停或点选某一天查看详情。",
      note: "命中以 NOAA 日最高 TMAX 判定，可能与市场官方结算来源不同（例如 8 月 24 日市场结算区间为 80–81°F，而 NOAA 显示 82°F）；目前只有 12 天，结果仅供参考。",
      chartLabel: "准确率趋势图：命中率与市场信心",
      yCaption: "%"
    },
    en: {
      eyebrow: "ACCURACY TREND",
      title: "Accuracy trend",
      lead: "Like 7- and 14-day moving averages on a stock chart: every settled day updates the accuracy measured up to that day.",
      tabs: { all: "Cumulative", 7: "7-day", 14: "14-day" },
      tabsLabel: "Choose window",
      legendHit: "Hit rate (NOAA observed)",
      legendConf: "Market confidence (normalized price)",
      warmup: "Warm-up",
      notEnough: (w, n) => `The ${w}-day line needs at least ${w} days of data; there are only ${n} so far. It will appear automatically once the data grows.`,
      hitRate: "Hit rate",
      hitOf: (h, n) => `${h} of ${n} days`,
      conf: "Market confidence",
      confNote: "mean normalized price of the top range",
      windowAll: (n) => `Cumulative · all ${n} days`,
      windowRolling: (w) => `Last ${w} days`,
      verdictLabel: "Verdict",
      calibrated: "Roughly calibrated: the favourite came true about as often as its price said.",
      cautious: "Market looks too cautious: the favourite came true more often than its price said.",
      overconfident: "Market looks overconfident: the favourite came true less often than its price said.",
      noVerdict: "Not enough data for a verdict yet.",
      diff: (d) => `${d > 0 ? "+" : ""}${d} pts`,
      stripLabel: "Daily results",
      stripKey: "Filled = hit · hollow = miss",
      hit: "hit",
      miss: "miss",
      off: (d) => `${d}°F off`,
      date: (day) => `Aug ${day}`,
      dayDetail: (d) => `${d.dateText} · top range ${d.label} (Yes ${d.priceText}) · NOAA ${d.actual}°F · ${d.hit ? "hit" : `miss, ${d.off}°F off`}`,
      windowDetail: (h, c) => `Window hit rate ${h} · market confidence ${c}`,
      windowNone: "No window value yet",
      hover: "Hover or tap a day for details.",
      note: "Hits are judged against NOAA daily TMAX, which can differ from the market’s official resolution source (e.g. Aug 24 resolved 80–81°F while NOAA shows 82°F). Only 12 days so far — indicative only.",
      chartLabel: "Accuracy trend chart: hit rate and market confidence",
      yCaption: "%"
    }
  };

  const state = { window: "all", focus: null };
  const mobileQuery = window.matchMedia("(max-width: 640px)");
  const lang = () => (document.documentElement.lang || "").toLowerCase().startsWith("en") ? "en" : "zh";
  const pctText = (value) => value === null ? "—" : `${Math.round(value * 100)}%`;
  // app.js keeps its own `series` copy and updates `actual` after an online NOAA refresh.
  const sourceDays = () => typeof series !== "undefined" && Array.isArray(series) ? series : climateSnapshot.days;
  const inside = (outcome, value) => (outcome.low === null || value >= outcome.low) && (outcome.high === null || value <= outcome.high);

  function computeDays() {
    return sourceDays().map((item) => {
      const top = item.outcomes.reduce((leader, outcome) => outcome.price > leader.price ? outcome : leader);
      const total = item.outcomes.reduce((sum, outcome) => sum + outcome.price, 0);
      const hit = inside(top, item.actual);
      const off = hit ? 0 : top.low !== null && item.actual < top.low ? top.low - item.actual : item.actual - top.high;
      return { day: item.day, actual: item.actual, label: top.label, price: top.price, conf: total > 0 ? top.price / total : 0, hit, off };
    });
  }

  function computeWindow(days, key) {
    const size = key === "all" ? null : Number(key);
    return days.map((_, index) => {
      if (size !== null && index < size - 1) return null;
      const slice = days.slice(size === null ? 0 : index - size + 1, index + 1);
      const hits = slice.filter((d) => d.hit).length;
      return { hits, count: slice.length, hitRate: hits / slice.length, conf: slice.reduce((sum, d) => sum + d.conf, 0) / slice.length };
    });
  }

  function el(name, attrs, parent, text) {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    if (parent) parent.append(node);
    return node;
  }

  function verdictFor(point, t) {
    if (!point) return { text: t.noVerdict, tone: "none", diff: null };
    const diff = Math.round((point.hitRate - point.conf) * 100);
    const raw = (point.hitRate - point.conf) * 100;
    if (Math.abs(raw) <= 5) return { text: t.calibrated, tone: "calibrated", diff };
    return raw > 0 ? { text: t.cautious, tone: "cautious", diff } : { text: t.overconfident, tone: "overconfident", diff };
  }

  function renderStatic(t) {
    root.setAttribute("aria-label", t.title);
    root.querySelector(".acc-eyebrow").textContent = t.eyebrow;
    root.querySelector("#acc-title").textContent = t.title;
    root.querySelector(".acc-lead").textContent = t.lead;
    root.querySelector(".acc-legend").innerHTML =
      `<span><i class="acc-key acc-key-hit" aria-hidden="true"></i>${t.legendHit}</span><span><i class="acc-key acc-key-conf" aria-hidden="true"></i>${t.legendConf}</span>`;
    const tabs = root.querySelector(".acc-tabs");
    tabs.setAttribute("aria-label", t.tabsLabel);
    tabs.querySelectorAll("[data-acc-window]").forEach((button) => {
      const active = button.dataset.accWindow === state.window;
      button.textContent = t.tabs[button.dataset.accWindow];
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    root.querySelector(".acc-note").textContent = t.note;
  }

  function renderChart(t, days, points) {
    const svg = root.querySelector("#acc-chart");
    const mobile = mobileQuery.matches;
    const width = mobile ? 420 : 760;
    const height = mobile ? 300 : 290;
    const left = mobile ? 36 : 46, right = width - (mobile ? 10 : 16), top = 18, bottom = 190;
    const stripY = bottom + 30, stripSize = mobile ? 13 : 15;
    const step = (right - left) / days.length;
    const xAt = (index) => left + step * (index + .5);
    const yAt = (value) => bottom - value * (bottom - top);
    svg.replaceChildren();
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("aria-label", t.chartLabel);

    [0, .25, .5, .75, 1].forEach((tick) => {
      el("line", { x1: left, x2: right, y1: yAt(tick), y2: yAt(tick), class: tick === 0 ? "acc-axis" : "grid-line" }, svg);
      el("text", { x: left - 8, y: yAt(tick) + 4, "text-anchor": "end", class: "axis-label" }, svg, `${tick * 100}%`);
    });

    const size = state.window === "all" ? null : Number(state.window);
    if (size !== null) {
      const warmEnd = Math.min(size - 1, days.length);
      if (warmEnd > 0) {
        el("rect", { x: left, y: top, width: step * warmEnd, height: bottom - top, class: "acc-warmup" }, svg);
        if (warmEnd < days.length) el("text", { x: left + step * warmEnd / 2, y: top + 16, "text-anchor": "middle", class: "axis-caption acc-warmup-label" }, svg, t.warmup);
      }
    }

    const valid = points.map((point, index) => point ? index : null).filter((index) => index !== null);
    if (!valid.length) {
      const message = el("text", { x: (left + right) / 2, y: (top + bottom) / 2, "text-anchor": "middle", class: "acc-empty" }, svg);
      const lines = wrapText(t.notEnough(size, days.length), mobile ? 24 : 44, lang());
      lines.forEach((line, i) => el("tspan", { x: (left + right) / 2, dy: i === 0 ? `${-(lines.length - 1) * .65}em` : "1.3em" }, message, line));
    } else {
      const path = (key) => valid.map((index, i) => `${i ? "L" : "M"}${xAt(index).toFixed(1)},${yAt(points[index][key]).toFixed(1)}`).join(" ");
      el("path", { d: path("conf"), class: "acc-line acc-line-conf" }, svg);
      el("path", { d: path("hitRate"), class: "acc-line acc-line-hit" }, svg);
      valid.forEach((index) => {
        el("circle", { cx: xAt(index), cy: yAt(points[index].conf), r: 4, class: "acc-dot acc-dot-conf" }, svg);
        el("circle", { cx: xAt(index), cy: yAt(points[index].hitRate), r: 4.5, class: "acc-dot acc-dot-hit" }, svg);
      });
      const last = valid[valid.length - 1];
      el("text", { x: xAt(last) - 8, y: yAt(points[last].hitRate) + (points[last].hitRate >= points[last].conf ? -10 : 18), "text-anchor": "end", class: "acc-end acc-end-hit" }, svg, pctText(points[last].hitRate));
      el("text", { x: xAt(last) - 8, y: yAt(points[last].conf) + (points[last].hitRate >= points[last].conf ? 18 : -10), "text-anchor": "end", class: "acc-end acc-end-conf" }, svg, pctText(points[last].conf));
    }

    days.forEach((d, index) => {
      const x = xAt(index);
      const point = points[index];
      const group = el("g", { class: `acc-day${state.focus === index ? " focused" : ""}`, tabindex: "0", role: "img" }, svg);
      const dateText = t.date(d.day);
      const detail = t.dayDetail({ ...d, dateText, priceText: `${(d.price * 100).toFixed(1)}%` });
      const windowText = point ? t.windowDetail(pctText(point.hitRate), pctText(point.conf)) : t.windowNone;
      group.setAttribute("aria-label", `${detail}. ${windowText}`);
      el("title", {}, group, `${detail}\n${windowText}`);
      el("rect", { x: x - step / 2, y: top, width: step, height: stripY + stripSize - top + 4, class: "acc-hover" }, group);
      el("line", { x1: x, x2: x, y1: top, y2: bottom, class: "acc-focus-line" }, group);
      el("rect", { x: x - stripSize / 2, y: stripY, width: stripSize, height: stripSize, rx: 2.5, class: d.hit ? "acc-cell hit" : "acc-cell miss" }, group);
      if (!mobile || index % 2 === 0 || index === days.length - 1) {
        el("text", { x, y: stripY + stripSize + 20, "text-anchor": "middle", class: "axis-label" }, group, d.day);
      }
      const activate = () => { state.focus = index; updateDetail(t, days, points); svg.querySelectorAll(".acc-day").forEach((node, i) => node.classList.toggle("focused", i === index)); };
      group.addEventListener("pointerenter", activate);
      group.addEventListener("focus", activate);
      group.addEventListener("click", activate);
    });
    el("text", { x: right, y: height - 6, "text-anchor": "end", class: "axis-caption" }, svg, lang() === "en" ? "Aug 2026" : "2026 年 8 月");
    const empty = svg.querySelector(".acc-empty");
    if (empty) svg.append(empty);
  }

  function wrapText(text, max, language) {
    if (language !== "en") {
      const parts = text.split(/(?<=[，；。])/);
      return parts.reduce((lines, part) => {
        if (lines.length && (lines[lines.length - 1] + part).length <= max) lines[lines.length - 1] += part; else lines.push(part);
        return lines;
      }, []);
    }
    return text.split(" ").reduce((lines, word) => {
      if (lines.length && (lines[lines.length - 1] + " " + word).length <= max) lines[lines.length - 1] += " " + word; else lines.push(word);
      return lines;
    }, []);
  }

  function updateDetail(t, days, points) {
    const node = root.querySelector(".acc-detail");
    if (state.focus === null || !days[state.focus]) { node.textContent = t.hover; node.classList.remove("active"); return; }
    const d = days[state.focus];
    const point = points[state.focus];
    const detail = t.dayDetail({ ...d, dateText: t.date(d.day), priceText: `${(d.price * 100).toFixed(1)}%` });
    node.innerHTML = `<i class="acc-mini ${d.hit ? "hit" : "miss"}" aria-hidden="true"></i><span>${detail}</span><small>${point ? t.windowDetail(pctText(point.hitRate), pctText(point.conf)) : t.windowNone}</small>`;
    node.classList.add("active");
  }

  function renderReadout(t, days, points) {
    const last = points[points.length - 1] || null;
    const verdict = verdictFor(last, t);
    const scope = state.window === "all" ? t.windowAll(days.length) : t.windowRolling(state.window);
    root.querySelector(".acc-readout").innerHTML = `
      <p class="acc-scope">${scope}</p>
      <div class="acc-metric acc-metric-hit"><span>${t.hitRate}</span><strong>${pctText(last ? last.hitRate : null)}</strong><small>${last ? t.hitOf(last.hits, last.count) : "—"}</small></div>
      <div class="acc-metric acc-metric-conf"><span>${t.conf}</span><strong>${pctText(last ? last.conf : null)}</strong><small>${t.confNote}</small></div>
      <div class="acc-verdict acc-${verdict.tone}"><span>${t.verdictLabel}${verdict.diff === null ? "" : ` · ${t.diff(verdict.diff)}`}</span><p>${verdict.text}</p></div>`;
    root.querySelector(".acc-strip-key").innerHTML = `<b>${t.stripLabel}</b> <span><i class="acc-mini hit" aria-hidden="true"></i><i class="acc-mini miss" aria-hidden="true"></i>${t.stripKey}</span>`;
  }

  function render() {
    const t = copy[lang()];
    const days = computeDays();
    const points = computeWindow(days, state.window);
    renderStatic(t);
    renderChart(t, days, points);
    renderReadout(t, days, points);
    updateDetail(t, days, points);
  }

  root.querySelectorAll("[data-acc-window]").forEach((button) => button.addEventListener("click", () => {
    if (!windows.includes(button.dataset.accWindow)) return;
    state.window = button.dataset.accWindow;
    render();
  }));
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  const status = document.querySelector("#observation-status");
  if (status) new MutationObserver(render).observe(status, { childList: true, characterData: true, subtree: true });
  if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", render); else mobileQuery.addListener(render);
  render();
})();
