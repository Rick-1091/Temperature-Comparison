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
