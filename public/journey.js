// The guided pages use the same immutable historical snapshots as the professional chart.
// Unit changes affect labels only; all interval membership is evaluated in market-native units.
const page = document.body.dataset.page;
const params = new URLSearchParams(location.search);
const state = {
  place: params.get('location') === 'laguardia' ? 'laguardia' : 'mexico',
  day: params.get('day') || '2026-09-23',
  unit: ['C', 'F'].includes(params.get('unit')) ? params.get('unit') : (localStorage.getItem('temperature-unit') === 'F' ? 'F' : 'C'),
  lang: params.get('lang') === 'en' || params.get('lang') === 'zh' ? params.get('lang') : (localStorage.getItem('temperature-language') === 'en' ? 'en' : 'zh'),
};
const copy = {
  priceMeaning:['报价表示什么？ +','What does a quote mean? +'], navOrigin:['首页','Home'], navHistory:['历史对照','Historical comparison'], navDecide:['准备练习','Preparation exercise'], navAdvanced:['专业图表','Advanced charts'], backHome:['← 回到首页','← Back to home'], crumbHistory:['历史对照','Historical comparison'], historicalFlag:['真实数据 · 历史回看，不是实时预报','Real data · Historical review, not a live forecast'], historyTitle:['市场判断，后来怎样？','Market expectations vs. reality'], historyLead:['先选一天，看市场在当天开始前最支持的最高温区间，再与当天机场记录的最高温对照。读完这一天，再看完整九天。','Choose a day. Compare the top-priced high-temperature range before that day began with the airport high recorded later. Then explore all nine days.'], boundary:['仅有 2026 年 9 月 19–27 日的历史样本。本页不预测未来，不代表官方预报或市场结算结果。','Only September 19–27, 2026 historical samples are shown. This is not a future forecast, an official weather bulletin, or the market settlement result.'], place:['地点','Place'],date:['日期','Date'],unit:['单位','Unit'],oneDay:['先看这一天','Start with one day'],dayEvidence:['查看这一天的数据来源 →','See this day’s sources →'], marketRange:['市场最支持的区间','Top-priced market range'],observed:['当天机场观测最高温','Airport-observed high'],priceCaveat:['这里的百分比是历史 Yes 合约报价，不是参与者人数占比，也不是经验证准确的气象概率。','The percentage is a historical Yes-contract price—not a share of traders or a validated meteorological probability.'], marketSpread:['市场意见有多分散？','How spread out were the prices?'],distributionTitle:['同一天，各温度区间的报价','Prices across ranges on this day'],spreadCaveat:['横条表示各区间相对报价；不是把所有价格相加成 100%。点击一档，查看它的原始报价记录。','Bars compare relative quotes; prices are not forced to sum to 100%. Open a range to inspect its quote history.'],nineDays:['再看九天','Then review nine days'],advancedLink:['打开专业图表 →','Open advanced charts →'],historySummary:['一个结果不能说明整体可靠性','One day cannot establish reliability'],historyTable:['逐日记录；选择一行回到单日对照','Daily records; select a row to review a day'],topRange:['最高报价区间','Top-priced range'],observedShort:['实测','Observed'],strictShort:['严格','Strict'],broadShort:['宽松','Broad'],methodTitle:['两种命中是什么意思？为什么不能比较预测能力？','What do strict and broad mean? Why is this not forecasting skill?'],methodCopy:['严格命中：当天实测按市场原始单位取整后，落在最高报价区间。宽松命中：也允许落在紧邻的一档。纽约和墨西哥城的市场区间宽度不同；九天样本很小，机场报告最高温也可能与市场结算温度不同。这些比率只是本项目的描述性对照，不是预测准确率证明。','Strict: the observed high, rounded in the market’s native unit, falls inside the leading range. Broad also allows its immediately neighboring ranges. The cities have different market-bin widths, the sample is only nine days, and the reported airport high can differ from settlement. These are descriptive comparisons, not proof of forecast accuracy.'],practiceLink:['进入 3D 晾晒体验 →','Enter the 3D drying experience →'],allSources:['查看完整数据来源与口径 →','See complete sources and methods →'],researchLink:['进阶：预测市场为何可能提供信号 →','Advanced: why market prices may be informative →'],backDay:['← 回到这一天','← Back to this day'],sourcesCrumb:['数据来源','Data sources'],auditKicker:['核对路径 · 逐日对应','Audit trail · Date-specific'],sourcesTitle:['这一天的数据<br>从哪里来？','Where did this day’s<br>data come from?'],sourcesLead:['市场原始页面、各区间历史报价和本项目保留的观测摘要分开列出。不要把项目计算值误认为 NOAA 或 Polymarket 官方发布的命中率。','The market page, individual historical quotes, and our archived observation summary are listed separately. Project-calculated hit rates are not NOAA or Polymarket metrics.'],backComparison:['← 回到单日对照','← Back to the comparison']
};
const t = (zh,en) => state.lang === 'en' ? en : zh;
const tr = key => copy[key]?.[state.lang === 'en' ? 1 : 0] || key;
const display = (value, native='C') => native === state.unit ? value : native === 'C' ? value*9/5+32 : (value-32)*5/9;
const num = value => Number(value.toFixed(1)).toString();
const temp = (value,native='C') => `${num(display(value,native))}°${state.unit}`;
const range = (bucket,native) => bucket.low == null ? `≤${temp(bucket.high,native)}` : bucket.high == null ? `≥${temp(bucket.low,native)}` : bucket.low === bucket.high ? temp(bucket.low,native) : `${num(display(bucket.low,native))}–${temp(bucket.high,native)}`;
const quote = value => `${(value*100).toFixed(1)}%`;
const placeLabel = () => state.place === 'mexico' ? t('墨西哥城国际机场','Mexico City International Airport') : t('纽约拉瓜迪亚机场','New York LaGuardia Airport');
const localDay = date => state.lang === 'en' ? new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}) : `${date.slice(0,4)} 年 ${Number(date.slice(5,7))} 月 ${Number(date.slice(8))} 日`;
const linkTo = (name, extra={}) => `${name}?${new URLSearchParams({location:state.place,day:state.day,unit:state.unit,lang:state.lang,...extra})}`;
const $ = selector => document.querySelector(selector);
let snapshot;

function updateAddress(){history.replaceState(null,'',`${location.pathname}?${new URLSearchParams({location:state.place,day:state.day,unit:state.unit,lang:state.lang})}${location.hash}`)}
function setupLanguage(){
  document.documentElement.lang = state.lang === 'en' ? 'en' : 'zh-CN';
  localStorage.setItem('temperature-language',state.lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {el.innerHTML=tr(el.dataset.i18n)});
  document.querySelectorAll('[data-zh][data-en]').forEach(el=>el.textContent=el.dataset[state.lang]);
  document.querySelectorAll('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===state.lang)));
  window.dispatchEvent(new CustomEvent('wb-language',{detail:state.lang}));
  document.title=page==='sources'?t('Weatherbridge · 数据来源','Weatherbridge · Data sources'):t('Weatherbridge · 回看一次天气判断','Weatherbridge · Review a weather judgment');
  document.querySelectorAll('[data-lang]').forEach(el=>el.onclick=()=>{state.lang=el.dataset.lang;localStorage.setItem('temperature-language',state.lang);render()});
}
function setupControls(){
  localStorage.setItem('temperature-unit',state.unit);
  $('#place').options[0].textContent=t('墨西哥城 · MMMX','Mexico City · MMMX');
  $('#place').options[1].textContent=t('纽约 · KLGA','New York · KLGA');
  $('#place').value=state.place;
  const days=snapshot.days;
  if(!days.some(day=>day.date===state.day))state.day=days[0].date;
  $('#day').replaceChildren(...days.map(item=>{const option=document.createElement('option');option.value=item.date;option.textContent=localDay(item.date);return option}));
  $('#day').value=state.day;
  document.querySelectorAll('[data-unit]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.unit===state.unit)));
  $('#place').onchange=async event=>{state.place=event.target.value;await load();render()};
  $('#day').onchange=event=>{state.day=event.target.value;render()};
  document.querySelectorAll('[data-unit]').forEach(button=>button.onclick=()=>{state.unit=button.dataset.unit;localStorage.setItem('temperature-unit',state.unit);render()});
}
async function load(){
  const response=await fetch(new URL(`signals/data/${state.place}-unified.json`, import.meta.url));
  if(!response.ok)throw Error(`Historical data unavailable (${response.status})`);
  snapshot=await response.json();
}
function selected(){return snapshot.days.find(item=>item.date===state.day)}
function outcomeDetails(item){
  const native=snapshot.metadata.marketUnit;
  const actual=native==='C'?item.actualC:item.actualC*9/5+32;
  const leadingIndex=item.outcomes.findIndex(o=>o.price===Math.max(...item.outcomes.map(b=>b.price)));
  const strict=b=>{const rounded=Math.round(actual);return (b.low==null||rounded>=b.low)&&(b.high==null||rounded<=b.high)};
  return {native,actual,leadingIndex,leading:item.outcomes[leadingIndex],strict:strict(item.outcomes[leadingIndex]),broad:item.outcomes.some((b,i)=>Math.abs(i-leadingIndex)<=1&&strict(b))};
}
function anchor(href,label){const a=document.createElement('a');a.href=href;a.textContent=label;if(/^https:/.test(href)){a.target='_blank';a.rel='noopener noreferrer'}return a}
function renderGuide(){
  const item=selected(),d=outcomeDetails(item);
  $('#day-title').textContent=`${placeLabel()} · ${localDay(item.date)}`;
  $('#leading-range').textContent=range(d.leading,d.native);
  $('#leading-price').textContent=t(`当天开始前的 Yes 报价 ${quote(d.leading.price)}`,`Yes quote before the day began: ${quote(d.leading.price)}`);
  $('#observed-value').textContent=temp(item.actualC);
  $('#observation-detail').textContent=t(`当地日内 ${item.observationCount} 条报告，覆盖 ${item.hourCoverage} 个小时`,`Local-day reports: ${item.observationCount}, covering ${item.hourCoverage} hours`);
  $('#verdict').textContent=d.strict?t('这一天：实测落在最高报价区间内。','This day: the observed high was inside the top-priced range.'):d.broad?t('这一天：未落在最高报价区间，但落在相邻一档。','This day: outside the top-priced range, but inside an adjacent range.'):t('这一天：实测未落在最高报价区间或相邻一档。','This day: outside the top-priced range and its adjacent ranges.');
  $('#source-link').href=linkTo('../sources/');
  const max=Math.max(...item.outcomes.map(o=>o.price));
  $('#range-list').replaceChildren(...item.outcomes.map((o,i)=>{
    const a=anchor(o.historyUrl,'');a.className=`range-row${i===d.leadingIndex?' leader':''}`;
    const label=document.createElement('span');label.textContent=range(o,d.native);
    const bar=document.createElement('span');bar.className='bar';const fill=document.createElement('i');fill.style.width=`${Math.max(1,o.price/max*100)}%`;bar.append(fill);
    const price=document.createElement('span');price.textContent=quote(o.price);
    const mark=document.createElement('span');mark.className='outcome-mark';mark.textContent=i===d.leadingIndex?t('最高','Top'):'';
    a.append(label,bar,price,mark);a.setAttribute('aria-label',`${range(o,d.native)} · ${quote(o.price)} · ${t('查看原始报价','View quote history')}`);return a;
  }));
  const counts=snapshot.days.reduce((a,x)=>{const result=outcomeDetails(x);a.strict+=Number(result.strict);a.broad+=Number(result.broad);return a},{strict:0,broad:0});
  $('#hit-summary').textContent=t(`这 ${snapshot.days.length} 天中，严格命中 ${counts.strict}/${snapshot.days.length}，宽松命中 ${counts.broad}/${snapshot.days.length}。宽松标准加入相邻区间，所以数值更高；两者都不是“未来预测准确率”。`,`Across ${snapshot.days.length} days: strict ${counts.strict}/${snapshot.days.length}, broad ${counts.broad}/${snapshot.days.length}. Broad is higher because it includes neighboring ranges. Neither is a future-forecast accuracy rate.`);
  $('#history-body').replaceChildren(...snapshot.days.map(x=>{
    const r=outcomeDetails(x),row=document.createElement('tr');row.dataset.active=String(x.date===state.day);
    const dateCell=document.createElement('td');dateCell.append(anchor(linkTo('../guide/',{day:x.date}),localDay(x.date)));
    [range(r.leading,r.native),temp(x.actualC),r.strict?'✓':'—',r.broad?'✓':'—'].forEach(value=>{const cell=document.createElement('td');cell.textContent=value;row.append(cell)});
    row.prepend(dateCell);return row;
  }));
  $('#advanced-link').href=linkTo('../explore/');
  $('#method-link').href=linkTo('../sources/');
  $('#practice-link').href=`../../experience/food-drying/?${new URLSearchParams({location:state.place,day:state.day,unit:state.unit,lang:state.lang})}`;
}
function section(title){const el=document.createElement('section');el.className='source-section';const h=document.createElement('h2');h.textContent=title;el.append(h);return el}
function para(parent,text,className=''){const p=document.createElement('p');p.textContent=text;if(className)p.className=className;parent.append(p)}
function renderSources(){
  const item=selected(),d=outcomeDetails(item),meta=snapshot.metadata,body=$('#source-content');body.replaceChildren();
  const back=linkTo('../guide/');['#back-guide','#back-guide-nav','#back-guide-bottom'].forEach(id=>{if($(id))$(id).href=back});
  const intro=section(`${placeLabel()} · ${localDay(item.date)}`);
  para(intro,t(`本项目在 ${new Date(meta.collectedAt).toLocaleDateString('zh-CN',{timeZone:'UTC'})} 保存了这组派生快照。最高报价区间 ${range(d.leading,d.native)}（${quote(d.leading.price)}），机场日最高 ${temp(item.actualC)}。`,`This derived snapshot was collected on ${meta.collectedAt.slice(0,10)}. The top-priced range was ${range(d.leading,d.native)} (${quote(d.leading.price)}); the airport-reported high was ${temp(item.actualC)}.`));body.append(intro);
  const market=section(t('一、市场页面与历史价格','1. Market page and historical quotes'));
  para(market,t(`对每个区间，取当地这一天开始前 24 小时内最后可得的 Yes 报价，历史接口以 5 分钟采样。截点为 ${item.snapshotAt}；各区间的实际报价时间可能不同。`,`For each range we use the last available Yes quote in the 24 hours before the local day began, with five-minute sampling. Cutoff: ${item.snapshotAt}; individual quote times can differ.`));
  para(market,t('市场页面如今显示的是结束后的状态；不要拿页面当前百分比核对当时的报价。下方逐档历史接口才对应采集前的价格。','The market page now shows its post-event state. Its current percentages are not the pre-day quotes; use the individual historical endpoints below for those prices.'),'note-box');
  market.append(anchor(item.marketUrl,t('打开这一天的 Polymarket 市场 ↗','Open this day’s Polymarket market ↗')),anchor(item.eventApiUrl,t('查看市场定义（Gamma API）↗','Market definition (Gamma API) ↗')));
  const detail=document.createElement('details');detail.className='method';const summary=document.createElement('summary');summary.textContent=t('展开每一档的报价时间与历史接口','Show each range’s quote time and historical endpoint');detail.append(summary);
  const list=document.createElement('ul');list.className='source-quotes';item.outcomes.forEach(o=>{const li=document.createElement('li');li.append(anchor(o.historyUrl,`${range(o,d.native)} · ${quote(o.price)} · ${o.quotedAt} ↗`));list.append(li)});detail.append(list);market.append(detail);body.append(market);
  const observed=section(t('二、机场观测与项目归档','2. Airport reports and project archive'));
  para(observed,t(`观测站 ${meta.station}，时区 ${meta.timezone}。以当地日内 METAR 报告温度的最高值作为当天实测（${temp(item.actualC)}）；${item.observationCount} 条报告，覆盖 ${item.hourCoverage} 个不同小时。`,`Station ${meta.station}, time zone ${meta.timezone}. We take the maximum reported METAR temperature on that local day (${temp(item.actualC)}); ${item.observationCount} reports span ${item.hourCoverage} distinct hours.`));
  para(observed,t('下方 JSON 是本项目保存的逐日派生摘要和报价，不含完整原始 METAR 报文。采集时使用的 NOAA“近 240 小时”链接会随时间移动，不能作为永久指向这一天的原始记录。','The JSON below is our archived derived daily summary and quotes; it does not contain full raw METAR reports. The NOAA “past 240 hours” URL used during collection moves with time and is not a permanent record of this day.'),'note-box');
  observed.append(anchor(new URL(`signals/data/${state.place}-unified.json`,import.meta.url).href,t('查看本项目保留的派生快照 ↗','View the project’s derived snapshot ↗')),anchor('https://aviationweather.gov/data/api/',t('NOAA Aviation Weather API 文档 ↗','NOAA Aviation Weather API documentation ↗')));body.append(observed);
  const method=section(t('三、比较规则与边界','3. Comparison rules and limits'));
  para(method,t('两地均按机场当地日统计报告中的最高温；至少 20 条记录、覆盖至少 20 个小时才纳入。命中判断先换算回市场原始单位并取整，°C / °F 仅改变显示。','Both cities use the maximum reported temperature within the airport’s local day, retaining days with at least 20 reports spanning 20 distinct hours. Hit membership uses the rounded market-native unit; the °C / °F control only changes display.'));
  para(method,t('严格命中只计最高报价区间；宽松命中计入上下各一档。两个市场原始区间宽度不同，不宜直接以命中数评判哪座城市预测更好。机场观测峰值也可能漏掉报告间的峰值，与市场结算口径不必相同。','Strict includes only the top-priced range; broad includes one adjacent range on either side. Native market bins differ in width, so these counts do not rank cities by forecasting skill. Reported airport highs can miss peaks between reports and need not match market settlement.'));
  method.append(anchor(item.resolutionSource,t('查看市场指定的结算来源 ↗','View the market’s settlement source ↗')));body.append(method);
  document.querySelectorAll('#source-content a[href^="https:"]').forEach(a=>{a.target='_blank';a.rel='noopener noreferrer'});
}
function render(){setupLanguage();setupControls();updateAddress();if(page==='guide')renderGuide();else renderSources()}
try{await load();render()}catch(error){const main=$('#main');const p=document.createElement('p');p.className='note-box';p.textContent=t('历史数据暂时无法加载，请刷新页面。','Historical data could not load. Please refresh.');main.append(p);console.error(error)}
