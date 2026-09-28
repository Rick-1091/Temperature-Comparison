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
  document.querySelectorAll('.unit-switch').forEach(node => {
    node.setAttribute('aria-label',english?'Temperature unit':'温度单位');
    node.querySelectorAll('[data-unit]').forEach(button => {
      button.textContent = button.dataset.unit === 'C' ? (english ? '°C Celsius' : '°C 摄氏度') : (english ? '°F Fahrenheit' : '°F 华氏度');
    });
  });
  simpleSvg.setAttribute('aria-label', `${city} ${first}–${last}: NOAA METAR × Polymarket`);
  set('.simple-copy .eyebrow', `${city} · ${airport} · 2026 年 9 月`, `${city} · ${airport} · SEPTEMBER 2026`);
  set('.simple-summary>small', `共 ${series.length} 天 · 同口径历史快照`, `${series.length} days · standardized historical snapshot`);
  set('#location-title', `${city}${airport} · 观测最高温`, `${city} ${airport} · Reported high`);
  set('.workspace-head>div:first-child>p', `${first} 至 ${last} <span>/</span> °${temperatureUnit} <span>/</span> 当地当日零点前报价`, `${first} to ${last} <span>/</span> °${temperatureUnit} <span>/</span> pre-midnight local quotes`);
  set('.reading>.reading-metric:nth-child(2)>span', '观测最高温 <small>NOAA METAR</small>', 'Reported high <small>NOAA METAR</small>');
  set('.reading-diff>span', '与 NOAA 观测最高温对照', 'Compared with NOAA reported high');
  set('.legend', '<span><i class="legend-key actual-key"></i>观测最高温（NOAA METAR）</span><span><i class="legend-key market-key"></i>市场预测值（历史最高报价区间）</span>', '<span><i class="legend-key actual-key"></i>Reported high (NOAA METAR)</span><span><i class="legend-key market-key"></i>Market forecast (top-priced range)</span>');
  set('.data-note-summary', '<strong>数据说明</strong> 用当天开始前的市场判断，对照当天的机场观测。', '<strong>About the data</strong> Pre-day market expectations compared with that day’s airport observations.');
  set('.data-details-body p:nth-child(1)', `<strong>气温从哪里来</strong> NOAA 航空气象中心提供 ${city}${airport}（${meta.station}）的观测记录。我们取当地当天最高的一次报告温度；每天至少有 20 条记录，覆盖 20 个不同小时。这个数值可能遗漏报告之间的峰值。`, `<strong>Observed temperature</strong> NOAA’s Aviation Weather Center provides observations for ${city} ${airport} (${meta.station}). We take each local day’s highest reported temperature, retaining days with at least 20 reports across 20 distinct hours. Peaks between reports may be missed.`);
  set('.data-details-body p:nth-child(2)', '<strong>市场判断从哪里来</strong> 温度区间和历史价格来自 Polymarket 官方接口。使用当天当地零点前 24 小时内各档最近可得的 Yes 报价，按 5 分钟间隔采样；不使用结果已知后的价格。', '<strong>Market expectations</strong> Ranges and historical prices come from Polymarket’s official APIs. For each range, we use the latest available Yes quote within 24 hours before local midnight, sampled at five-minute intervals—not prices after the result was known.');
  set('.data-details-body p:nth-child(3)', '<strong>怎样计算命中</strong> 先将观测温度换算至市场原始单位并取整，再判断是否落入区间。切换显示单位不会改变命中率。两地市场区间宽度不同，命中率不能直接作为预测能力排名；观测温度也不一定等于市场结算值。完整来源和原始记录见“数据来源”。', '<strong>How hits are calculated</strong> Convert observations to the market’s native unit, round to whole degrees, then check interval membership. Display-unit changes do not affect hits. Different interval widths prevent a direct ranking of forecasting quality; observations may differ from settlement values. Open Data sources for the full records.');
  set('.simple-footer>p', '两地统一使用 METAR 观测最高温；单位切换不改变命中率。观测不一定等于市场结算值。', 'Both cities use maximum reported METAR temperatures; switching units does not change hits. Observations may differ from settlement.');
  set('#noaa-link', 'NOAA 官方观测接口 ↗', 'NOAA official observations ↗');
  document.querySelector('#noaa-link').href = meta.observationUrl;
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
