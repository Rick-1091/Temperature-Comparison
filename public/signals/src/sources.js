function updateSourceDialog(force = false) {
  const dialog = document.querySelector('#source-dialog');
  if (!force && !dialog.open) return;
  const english = language === 'en';
  const meta = activeSnapshot.metadata;
  const item = series[sourceDayIndex];
  const archivedItem = activeSnapshot.days[sourceDayIndex];
  document.querySelector('#sources-title').textContent = english ? 'Where the data comes from' : '这些数据从哪里来';
  document.querySelector('#sources-close').textContent = english ? 'Close' : '关闭';
  const body = document.querySelector('#sources-body');
  body.replaceChildren();
  const dateLabel = document.createElement('label');
  dateLabel.textContent = english ? 'Date: ' : '查看日期：';
  const dateSelect = document.createElement('select');
  dateSelect.setAttribute('aria-label', english ? 'Source date' : '来源日期');
  series.forEach((day, index) => {
    const option = document.createElement('option');
    option.value = index; option.textContent = day.date;
    dateSelect.append(option);
  });
  dateSelect.value = sourceDayIndex;
  dateSelect.addEventListener('change', () => { select(Number(dateSelect.value)); updateSourceDialog(true); });
  dateLabel.append(dateSelect); body.append(dateLabel);
  let container = body;
  const paragraph = text => {const p=document.createElement('p');p.textContent=text;container.append(p);};
  const heading = text => {const h=document.createElement('h3');h.textContent=text;container.append(h);};
  const link = (label,url) => {const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';container.append(a);};
  const airport = isMexico ? (english?'Mexico City International Airport':'墨西哥城国际机场') : (english?'New York LaGuardia Airport':'纽约拉瓜迪亚机场');
  paragraph(`${airport} · ${item.date}`);
  heading(english?'01 · Observed temperature':'一、实际气温');
  paragraph(english
    ? `Airport observations are provided through NOAA’s Aviation Weather Center. We take the highest reported temperature within each local day. On this date, it was ${temperature(item.actual)}.`
    : `气温来自 NOAA 航空气象中心提供的机场观测记录。我们从当地当天的记录中，取最高的一次报告温度。这一天是 ${temperature(item.actual)}。`);
  paragraph(english
    ? 'The rolling NOAA link changes with time and is not a permanent record of this day. The project archive contains derived daily values and quote metadata, not complete raw METAR reports.'
    : 'NOAA 的滚动链接会随时间变化，不能永久指向这一天。下方项目归档保存的是逐日派生值与报价元数据，不包含完整原始 METAR 报文。');
  heading(english?'02 · Market expectations':'二、市场判断');
  paragraph(english
    ? 'Temperature ranges and their prices come from Polymarket. We use quotes recorded before the day began, so the comparison does not rely on prices after the result was known.'
    : '温度区间与价格来自 Polymarket。图表使用当天开始前的历史报价，再与当天观测对照，避免用结果已知后的价格回看预测。');
  paragraph(english ? 'The ended market page shows post-event prices; use the individual historical quote links below to check pre-day prices.' : '结束的市场页面显示的是事后价格；要核对当天开始前的报价，请看下方逐档历史接口。');
  link(english?'View this day’s Polymarket market ↗':'查看当天的 Polymarket 市场 ↗',item.marketUrl);
  heading(english?'03 · How we compare them':'三、如何对照');
  paragraph(english
    ? 'A strict hit means the observed temperature falls within the top-priced range. A broad-range hit also includes its neighboring ranges. We calculate these rates; neither NOAA nor Polymarket publishes them.'
    : '严格命中：观测温度落在市场最看好的区间内。宽松命中：再计入相邻的上下各一档。两种命中率均由本项目计算，并非 NOAA 或 Polymarket 发布的指标。');
  paragraph(english
    ? 'Both cities use the same local-day observation rule. Switching °C/°F changes the labels, not the results. Their market ranges have different widths, so hit rates are not a direct ranking of forecasting quality. The highest reported temperature may miss peaks between reports and may differ from the market’s settlement value.'
    : '两地采用相同的当地日统计方法；切换摄氏度或华氏度，只改变显示。市场区间宽度不同，不能仅凭命中率比较两地预测能力。观测记录可能遗漏两次报告之间的峰值，也不一定等于市场最终结算温度。');
  link(english?'View this date’s evidence page ↗':'查看这一天的数据来源页 ↗',`sources.html?location=${isMexico?'mexico':'laguardia'}&day=${item.date}&unit=${temperatureUnit}&lang=${language}`);
  link(english?'View the derived archive used in these charts ↗':'查看图表使用的派生数据归档 ↗',`data/${isMexico?'mexico':'laguardia'}-unified.json`);
  const details=document.createElement('details');details.className='source-technical';
  const summary=document.createElement('summary');summary.textContent=english?'Collection details & individual quotes':'采集细节与各档报价';details.append(summary);body.append(details);container=details;
  paragraph(english
    ? `Station ${meta.station} · Time zone ${meta.timezone}. ${item.observationCount} reports across ${item.hourCoverage} hours; raw maximum ${item.actualC}°C. Collected ${meta.collectedAt}.`
    : `观测站 ${meta.station} · 时区 ${meta.timezone}。当天 ${item.observationCount} 条记录，覆盖 ${item.hourCoverage} 个小时；原始最高温 ${item.actualC}°C。采集于 ${meta.collectedAt}。`);
  paragraph(english
    ? 'We retain days with at least 20 reports covering 20 distinct hours. The archive stores the resulting daily summary, not the underlying complete reports.'
    : '仅保留至少 20 条记录、覆盖 20 个不同小时的日期。归档保存每日汇总结果，并非完整原始报文。');
  paragraph(english
    ? `Gamma provides market definitions; CLOB provides historical Yes prices. For each range we take its latest available quote within the 24 hours before local midnight (${item.snapshotAt}), with five-minute sampling. For hit calculations, observations are converted and rounded in the market’s original unit; original boundaries are preserved.`
    : `市场信息通过 Gamma 接口获取，Yes 历史价格通过 CLOB 接口获取。取当地零点（${item.snapshotAt}）前 24 小时内各档最近可得报价，按 5 分钟间隔采样。命中判定将观测值换算至市场原始单位后取整，保留市场原有区间。`);
  link(english?'NOAA API documentation ↗':'NOAA 接口说明 ↗','https://aviationweather.gov/data/api/');
  link(english?'Polymarket market metadata ↗':'Polymarket 市场原始信息 ↗',item.eventApiUrl);
  link(english?'Market settlement source ↗':'市场指定的结算来源 ↗',item.resolutionSource);
  const list = document.createElement('ul');list.className='source-quotes';
  archivedItem.outcomes.forEach(outcome => {
    const li=document.createElement('li');
    const a=document.createElement('a');a.href=outcome.historyUrl;a.target='_blank';a.rel='noopener noreferrer';
    a.textContent=`${outcome.label} → ${intervalLabel(outcome)} · ${pct(outcome.price)} · ${outcome.quotedAt} ↗`;
    li.append(a);list.append(li);
  });
  details.append(list);
}
