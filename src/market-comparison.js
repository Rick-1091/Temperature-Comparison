import * as d3 from 'd3';
import './market-comparison.css';
import {CASE,cumulativeCDD,validateMarketData,admittedFuturesHistory,quotedOutcomes,topQuote,cents,settlementDisagrees} from './market-comparison-model.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sourceLink=(url,label)=>`<a href="${escape(url)}" target="_blank" rel="noopener">${escape(label)} ↗</a>`;
const localTime=iso=>new Intl.DateTimeFormat('en-GB',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(iso));

// One tab implementation supplies roving focus and keyboard navigation to both controls.
function bindTabs(root,onSelect){
  const tabs=[...root.querySelectorAll('[role=tab]')];
  const activate=tab=>{
    for(const item of tabs){item.setAttribute('aria-selected',String(item===tab));item.tabIndex=item===tab?0:-1;}
    onSelect(tab.dataset.value);
  };
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>activate(tab));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(i+1)%tabs.length;
      if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=tabs.length-1;
      if(next===undefined)return;
      event.preventDefault();activate(tabs[next]);tabs[next].focus();
    });
  });
}

export function initMarketComparison(language,{futuresHistory}={}){
  const mechanisms=document.getElementById('market-mechanisms');
  const dashboard=document.getElementById('market-dashboard');
  if(!mechanisms||!dashboard)return;
  const t=(zh,en)=>language.current==='en'?en:zh;
  const futures=admittedFuturesHistory(futuresHistory);
  const params=new URLSearchParams(location.search);
  const initialDay=Number(params.get('study-day'));
  const state={dimension:'target',view:['overview','polymarket','cme'].includes(params.get('market-view'))?params.get('market-view'):'overview',day:initialDay>=1&&initialDay<=31?Math.floor(initialDay):21,bin:null};
  let nws=null,observations=[],markets=null,loading=false,failed=[],loadGeneration=0,resizeFrame=0;
  const resourceState={nws:'idle',markets:'idle'},controllers=new Set();
  const currentDate=()=>`${CASE.month}-${String(state.day).padStart(2,'0')}`;
  const observation=()=>observations.find(d=>d.date===currentDate());
  const marketDay=()=>markets?.days.find(d=>d.date===currentDate());
  const activeQuote=()=>quotedOutcomes(marketDay()).find(o=>o.label===state.bin)||topQuote(marketDay());
  const save=()=>{const url=new URL(location.href);url.searchParams.set('market-view',state.view);url.searchParams.set('study-day',state.day);history.replaceState(null,'',url);};
  const tabs=(id,items,selected,label)=>`<div class="market-tabs" role="tablist" aria-label="${label}">${items.map(([key,name])=>`<button type="button" id="${id}-${key}" role="tab" data-value="${key}" aria-controls="${id}-panel" aria-selected="${selected===key}" tabindex="${selected===key?0:-1}">${name}</button>`).join('')}</div>`;

  function renderMechanisms(){
    mechanisms.innerHTML=`${tabs('mechanism',[
      ['target',t('交易对象','Trading target')],['horizon',t('时间范围','Time horizon')],['signal',t('价格含义','Price meaning')],['settlement',t('结算方式','Settlement')]
    ],state.dimension,t('比较市场机制','Compare market mechanisms'))}<div id="mechanism-panel" class="mechanism-pair" role="tabpanel" aria-labelledby="mechanism-${state.dimension}"></div>`;
    bindTabs(mechanisms,key=>{state.dimension=key;renderDimension();});
    renderDimension();
  }
  function renderDimension(){
    const copy={
      target:[
        t('约定城市整月累计的 CDD 指数。','A specified city’s accumulated monthly CDD index.'),
        t('约定城市某天最高温所属的区间。','The range containing a specified city’s high on one day.')
      ],
      horizon:[
        t('一个指定月份，累计每日热量。','One specified month, accumulating daily heat.'),
        t('事件规则约定的一个当地日。','One local day defined by the event’s rules.')
      ],
      signal:[
        t('以指数点报价，反映对最终指数的市场判断。','A quote in index points expressing market expectations of the final index.'),
        t('每份 Yes 结果合约的报价，用美分表示。','A Yes outcome share’s quote, expressed in cents.')
      ],
      settlement:[
        t('按指定最终指数计算现金盈亏。','Cash gains or losses follow the specified final index.'),
        t('按规则确认结果：正确区间每份兑付 $1，其他为 $0。','Resolution follows the rules: winning shares pay $1; others pay $0.')
      ]
    }[state.dimension];
    const panel=document.getElementById('mechanism-panel');
    panel.setAttribute('aria-labelledby','mechanism-'+state.dimension);
    panel.innerHTML=copy.map((sentence,i)=>`<div class="${i?'market-poly':'market-cme'}"><strong>${i?'Polymarket':t('CME 天气期货','CME weather futures')}</strong><p>${sentence}</p></div>`).join('');
  }

  function renderShell(){
    const openDetails=[...dashboard.querySelectorAll('details[id][open]')].map(el=>el.id);
    const active=dashboard.contains(document.activeElement)?document.activeElement:null;
    const focusId=active?.id,focusSummary=active?.matches('summary')?active.parentElement.id:null;
    const focusDay=active?.dataset.date,focusBin=active?.dataset.bin;
    dashboard.setAttribute('aria-busy',String(loading&&!nws&&!markets));
    const failedNames=failed.map(key=>key==='nws'?t('NWS 气象记录','NWS observations'):t('Polymarket 报价','Polymarket quotes')).join(t('、',' and '));
    const availableText=nws||markets?t('已加载的记录仍可查看。','Loaded records remain available. '):'';
    const failedText=failed.length?t(`${failedNames}暂时无法读取。${availableText}请重试。`,`${failedNames} could not load. ${availableText}Please retry.`):'';
    dashboard.innerHTML=`<dl class="research-context"><div><dt>${t('地点','Location')}</dt><dd>New York · LaGuardia / KLGA</dd></div><div><dt>${t('月份','Month')}</dt><dd>${t('2026 年 7 月','July 2026')}</dd></div></dl>
      ${tabs('study',[[ 'overview',t('总览','Overview')],['cme','CME'],['polymarket','Polymarket']],state.view,t('研究视图','Research view'))}
      ${loading?`<p role="status">${t('正在读取记录…','Loading records…')}</p>`:''}
      ${failedText?`<div class="market-error" role="status"><p>${failedText}</p><button type="button" id="market-retry">${t('重新读取','Retry loading')}</button></div>`:''}
      <div id="study-panel" role="tabpanel" tabindex="0" aria-labelledby="study-${state.view}">
      <div class="market-day-control"><label for="study-day">${t('选择一天','Study day')}</label><input id="study-day" type="range" min="1" max="31" step="1" value="${state.day}" aria-describedby="study-day-help"><output id="study-day-label" for="study-day">7/${state.day}</output></div>
      <p id="study-day-help" class="market-link-hint">${t('拖动日期，或点累计曲线上的一天，同时查看当日记录。','Move the date or select a day on the cumulative curve to update both records.')}</p>
      <div class="market-charts">
      <section class="market-chart market-cme" id="cme-study" aria-labelledby="cdd-heading"><h3 id="cdd-heading">${t('NWS 观测 · 7月累计 CDD','NWS observations · July cumulative CDD')}</h3><p class="chart-status">${t('NWS 天气观测，用于解释累计 CDD；CME 行情与结算记录尚待接入核验。','NWS weather observations illustrate accumulated CDD. CME prices and settlement records await verified integration.')}</p>
      <p class="chart-unit">${t('纵轴：累计 CDD（°F·天）','Y: cumulative CDD (°F·day)')}</p><figure><div id="cdd-plot"></div><figcaption id="cdd-reading" class="chart-reading" aria-live="polite"></figcaption></figure>
      <p class="chart-help">${t('横轴：7 月日期。CDD 越高，表示超过 65°F 基准的热量累计越多。','X: July date. Higher CDD means more accumulated heat above a 65°F base.')}</p>

      <div id="cme-history-status" class="market-availability"><span>${t('CME 历史行情暂未接入。','CME trading history is not connected.')}</span></div>
</section>
      <section class="market-chart market-poly" id="poly-study" aria-labelledby="poly-heading"><h3 id="poly-heading">${t('Polymarket · 看一天最高温','Polymarket · one day’s high')}</h3><p class="chart-status">${t('当地零点前的 Yes 报价 · 固定历史快照','Pre-midnight Yes quotes · historical snapshot')}</p><p class="chart-unit">${t('横轴：Yes 报价（美分／份）','X: Yes price (US cents per share)')}</p><figure><div id="poly-plot"></div><figcaption id="poly-reading" class="chart-reading" aria-live="polite"></figcaption></figure><p class="chart-help">${t('纵轴：最高温区间（°F）。深色是最高价，细框是当前选择。在 Polymarket 视图查看所选区间的事前走势。','Y: high-temperature range (°F). Dark fill marks the highest price; an outline marks your selection. The Polymarket view shows its pre-event history.')}</p>
      <div id="poly-history" class="market-chart-details"><h4>${t('所选区间的事前价格','Pre-event prices for the selected range')}</h4><label for="quote-bin">${t('温度区间','Temperature range')}<select id="quote-bin"></select></label><p class="chart-help">${t('纵轴：美分／份；横轴：前一天纽约时间（EDT）。保留原始时刻，抽样连线。','Y: US cents per share. X: previous day in New York time (EDT). Lines connect samples at their original times.')}</p><div id="poly-history-plot"></div></div>

      </section></div>
      <div class="study-resources" aria-label="${t('资料与方法','Records and methods')}">      <details id="cdd-method" class="market-chart-details"><summary>${t('观测记录与 CDD 算法','Observations and CDD method')}</summary><p class="chart-help">${t('先取一天最高温与最低温的平均值，减去 65°F；低于零按零算，再逐日相加。本图累加 NWS 报告直接公布的每日 CDD，保留其取整口径，不冒充 CME 最终结算指数。','Take the mean of the daily maximum and minimum, subtract 65°F, and use zero if negative; then sum daily values. This plot sums the CDD values published by NWS, retaining its rounding. It is not the final CME settlement index.')}</p><div id="cdd-records"><div id="cdd-table"></div></div></details>      <details id="poly-records" class="market-chart-details"><summary>${t('精确报价与结算记录','Exact quotes and settlement records')}</summary><div id="poly-table"></div></details>      <details id="market-sources" class="market-sources"><summary>${t('数据来源与比较口径','Data sources and comparison method')}</summary><div id="market-sources-content"></div></details></div></div>`;
    bindTabs(dashboard,key=>{state.view=key;save();applyView();drawCharts();});
    dashboard.querySelector('#study-day').addEventListener('input',event=>chooseDay(Number(event.target.value)));
    dashboard.querySelector('#quote-bin').addEventListener('change',event=>selectBin(event.target.value));
    dashboard.querySelector('#market-retry')?.addEventListener('click',load);
    applyView();renderRecords();renderSources();renderDay();
    for(const id of openDetails){const el=document.getElementById(id);if(el)el.open=true;}
    const focusTarget=focusSummary?document.getElementById(focusSummary)?.querySelector('summary'):focusId?document.getElementById(focusId):focusDay?[...dashboard.querySelectorAll('.cdd-point')].find(el=>el.dataset.date===focusDay):focusBin?[...dashboard.querySelectorAll('.quote-bar')].find(el=>el.dataset.bin===focusBin):null;
    focusTarget?.focus({preventScroll:true});
  }
  function applyView(){
    dashboard.querySelector('#study-panel').setAttribute('aria-labelledby','study-'+state.view);
    dashboard.querySelector('#cme-study').hidden=state.view==='polymarket';
    dashboard.querySelector('#poly-study').hidden=state.view==='cme';
    dashboard.querySelector('.market-charts').classList.toggle('is-single',state.view!=='overview');
    dashboard.querySelector('#poly-history').hidden=state.view!=='polymarket';
  }
  function chooseDay(day){state.day=day;state.bin=null;save();renderDay();}
  function renderDay(){
    dashboard.querySelector('#study-day').value=state.day;
    dashboard.querySelector('#study-day').setAttribute('aria-valuetext',t(`7 月 ${state.day} 日`,`July ${state.day}`));
    dashboard.querySelector('#study-day-label').textContent='7/'+state.day;
    const day=marketDay(),selected=activeQuote(),select=dashboard.querySelector('#quote-bin');
    select.innerHTML=quotedOutcomes(day).map(o=>`<option value="${escape(o.label)}">${escape(o.label)}</option>`).join('');
    if(selected)select.value=selected.label;
    renderQuoteRecords();drawCharts();
  }
  function chart(id,height,label){
    const host=dashboard.querySelector('#'+id);
    host.replaceChildren();
    if(host.closest('[hidden]'))return null;
    const width=Math.max(260,Math.min(900,Math.round(host.clientWidth||500)));
    const svg=d3.select(host).append('svg').attr('viewBox',`0 0 ${width} ${height}`).attr('role','img').attr('aria-label',label);
    svg.append('title').text(label);
    return {svg,width};
  }
  function drawCDD(){
    const d=observation(),reading=dashboard.querySelector('#cdd-reading');
    if(!observations.length){dashboard.querySelector('#cdd-plot').textContent=resourceState.nws==='loading'?t('正在读取 NWS 气象记录…','Loading NWS observations…'):t('观测记录暂不可用。','Observation records are unavailable.');reading.textContent='';return;}
    reading.innerHTML=t(`7/${state.day}：当天 <strong>${d.cdd}</strong>，累计 <strong>${d.cumulative}</strong> °F·天。全月共 ${observations.at(-1).cumulative} °F·天。`,`July ${state.day}: <strong>${d.cdd}</strong> that day; <strong>${d.cumulative}</strong> °F·day accumulated. Monthly total: ${observations.at(-1).cumulative} °F·day.`);
    const plot=chart('cdd-plot',330,t('7 月官方累计制冷度日，非期货价格','Official July cumulative cooling degree days, not futures prices'));
    if(!plot)return;
    const {svg,width}=plot,left=42,right=width-16,top=18,bottom=282;
    svg.attr('role','group');
    const x=d3.scaleLinear([1,31],[left,right]),y=d3.scaleLinear([0,500],[bottom,top]);
    svg.append('g').attr('transform',`translate(${left},0)`).call(d3.axisLeft(y).tickValues([0,100,200,300,400,500]).tickSize(-(right-left))).call(g=>g.select('.domain').remove());
    svg.append('g').attr('transform',`translate(0,${bottom})`).call(d3.axisBottom(x).tickValues([1,10,20,31]).tickFormat(v=>'7/'+v));
    svg.append('path').datum(observations).attr('class','chart-line').attr('d',d3.line().x((_,i)=>x(i+1)).y(row=>y(row.cumulative)));
    svg.append('line').attr('class','selected-day-line').attr('x1',x(state.day)).attr('x2',x(state.day)).attr('y1',top).attr('y2',bottom);
    const points=svg.selectAll('.cdd-point').data(observations).join('g').attr('class','cdd-point').attr('data-date',row=>row.date).attr('role','button').attr('tabindex',row=>row.date===currentDate()?0:-1).attr('aria-pressed',row=>row.date===currentDate()).attr('aria-label',row=>`${row.date}: ${row.cdd} ${t('当日','daily')}, ${row.cumulative} ${t('累计','cumulative')} °F·day`).on('click',(_,row)=>chooseDay(Number(row.date.slice(-2)))).on('keydown',(event,row)=>{
      const day=Number(row.date.slice(-2));let next;
      if(event.key==='ArrowLeft')next=Math.max(1,day-1);
      if(event.key==='ArrowRight')next=Math.min(31,day+1);
      if(event.key==='Home')next=1;
      if(event.key==='End')next=31;
      if(event.key==='Enter'||event.key===' ')next=day;
      if(next!==undefined){event.preventDefault();chooseDay(next);dashboard.querySelectorAll('.cdd-point')[next-1]?.focus();}
    });
    points.append('rect').attr('x',(_,i)=>x(i+1)-(right-left)/60).attr('y',top).attr('width',(right-left)/30).attr('height',bottom-top).attr('fill','transparent');
    points.append('circle').attr('class','chart-dot').attr('cx',(_,i)=>x(i+1)).attr('cy',row=>y(row.cumulative)).attr('r',row=>row.date===currentDate()?5:2);
    points.append('title').text(row=>`${row.date} · ${row.cdd} / ${row.cumulative} °F·day`);
  }
  function drawPrices(){
    const day=marketDay(),quotes=quotedOutcomes(day),top=topQuote(day),selected=activeQuote(),d=observation();
    const reading=dashboard.querySelector('#poly-reading');
    if(!top){dashboard.querySelector('#poly-plot').textContent=resourceState.markets==='loading'?t('正在读取 Polymarket 报价…','Loading Polymarket quotes…'):t('这一天尚无可核验的事前报价。','No verified pre-event quotes are available for this day.');reading.textContent='';return;}
    const winner=day.outcomes.filter(o=>o.settlementPrice===1);
    reading.innerHTML=`${t('最高价区间','Highest-priced range')}: <strong>${escape(top.label)} · ${cents(top.price)} ${t('美分','cents')}</strong><br>${t('NWS 日最高温','NWS daily high')}: ${d?d.maxF+'°F':'—'} · ${t('市场结算区间','Resolved market range')}: ${winner.length===1?escape(winner[0].label):t('未核验','unverified')}${settlementDisagrees(d,day)?'<br><span class="record-mismatch">'+t('两种记录在这一天不同；市场兑付按事件指定来源确定，不按本图 NWS 数值确定。','The records differ on this day. Market payout follows the event’s specified source, not the NWS value shown here.')+'</span>':''}`;
    const height=Math.max(330,quotes.length*29+48),plot=chart('poly-plot',height,t('温度区间的事前 Yes 报价；美分每份','Pre-event Yes prices by temperature range, US cents per share'));
    if(!plot)return;
    const {svg,width}=plot,left=82,right=width-32,bottom=height-32;
    svg.attr('role','group');
    const max=Math.max(10,Math.ceil(d3.max(quotes,o=>o.price*100)/10)*10),x=d3.scaleLinear([0,max],[left,right]),y=d3.scaleBand(quotes.map(o=>o.label),[4,bottom]).padding(.32);
    const short=label=>label.replace('°F or below','↓').replace('°F or higher','↑').replace('°F','');
    svg.append('g').attr('transform',`translate(0,${bottom})`).call(d3.axisBottom(x).ticks(4).tickSize(-(bottom-4))).call(g=>g.select('.domain').remove());
    svg.append('g').attr('transform',`translate(${left-8},0)`).call(d3.axisLeft(y).tickSize(0).tickFormat(short)).call(g=>g.select('.domain').remove());
    const groups=svg.selectAll('.quote-bar').data(quotes).join('g').attr('class','quote-bar').attr('data-bin',o=>o.label).attr('role','button').attr('tabindex',0).attr('aria-pressed',o=>o.label===selected?.label).attr('aria-label',o=>`${o.label}: ${cents(o.price)} ${t('美分，选择查看事前走势','cents, select for pre-event history')}`).on('click',(_,o)=>selectBin(o.label)).on('keydown',(event,o)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectBin(o.label);dashboard.querySelectorAll('.quote-bar')[quotes.indexOf(o)]?.focus();}});
    groups.append('rect').attr('x',left).attr('y',o=>y(o.label)-4).attr('width',right-left+30).attr('height',y.bandwidth()+8).attr('fill','transparent');
    groups.append('rect').attr('x',left).attr('y',o=>y(o.label)).attr('width',o=>Math.max(1,x(o.price*100)-left)).attr('height',y.bandwidth()).attr('fill','var(--market-quote)').attr('opacity',o=>o===top?1:.45);
    groups.append('text').attr('x',o=>x(o.price*100)+6).attr('y',o=>y(o.label)+y.bandwidth()/2+4).text(o=>cents(o.price));
    groups.append('title').text(o=>`${o.label} · ${cents(o.price)} ${t('美分','cents')} · ${o.quotedAt}`);
  }
  function selectBin(label){state.bin=label;dashboard.querySelector('#quote-bin').value=label;renderQuoteRecords();drawPrices();drawPriceHistory();}
  function drawPriceHistory(){
    const o=activeQuote(),points=o?.history||[];
    if(!points.length){dashboard.querySelector('#poly-history-plot').textContent=t('没有可核验的历史采样。','No verified historical samples.');return;}
    const plot=chart('poly-history-plot',240,`${o.label} · ${t('事前价格采样','pre-event price samples')}`);if(!plot)return;
    const {svg,width}=plot,left=38,right=width-20,bottom=200,top=20;
    const x=d3.scaleUtc(d3.extent(points,p=>new Date(p.t*1000)),[left,right]),y=d3.scaleLinear([0,Math.max(10,Math.ceil(d3.max(points,p=>p.p*100)/10)*10)],[bottom,top]);
    svg.append('g').attr('transform',`translate(${left},0)`).call(d3.axisLeft(y).ticks(4).tickSize(-(right-left))).call(g=>g.select('.domain').remove());
    svg.append('g').attr('transform',`translate(0,${bottom})`).call(d3.axisBottom(x).tickValues([x.domain()[0],new Date((+x.domain()[0]+ +x.domain()[1])/2),x.domain()[1]]).tickFormat(localTime));
    svg.append('path').datum(points).attr('class','chart-line').attr('d',d3.line().x(p=>x(new Date(p.t*1000))).y(p=>y(p.p*100)));
    svg.selectAll('circle').data(points).join('circle').attr('class','chart-dot').attr('cx',p=>x(new Date(p.t*1000))).attr('cy',p=>y(p.p*100)).attr('r',3).append('title').text(p=>`${new Date(p.t*1000).toISOString()} · ${cents(p.p)} ${t('美分','cents')}`);
  }
  function drawFutures(){
    if(!futures||state.view==='polymarket')return;
    const host=dashboard.querySelector('#cme-history-status');
    const quoteLabel={trade:t('成交价','Trade price'),bid:t('买价','Bid'),ask:t('卖价','Ask'),settlement:t('每日结算价','Daily settlement price')}[futures.quoteType];
    host.innerHTML=`<strong>${t('CME 历史行情','CME trading history')} · ${quoteLabel}</strong><p class="chart-unit">${t('纵轴：CDD 指数点；横轴：交易日期','Y: CDD index points; X: trading date')}</p><div id="futures-plot"></div>`;
    const plot=chart('futures-plot',300,`${quoteLabel} · CDD ${t('指数点','index points')}`),{svg,width}=plot;
    const dates=futures.records.map(row=>new Date(row.date+'T12:00:00Z'));
    const x=d3.scaleUtc(d3.extent(dates),[42,width-24]);
    const values=futures.records.map(row=>row.indexPoints);
    if(futures.finalSettlementIndex!==null)values.push(futures.finalSettlementIndex);
    const extent=d3.extent(values),pad=Math.max(1,(extent[1]-extent[0])*.1),y=d3.scaleLinear([extent[0]-pad,extent[1]+pad],[252,18]).nice();
    svg.append('g').attr('transform','translate(42,0)').call(d3.axisLeft(y).ticks(5).tickSize(-(width-66))).call(g=>g.select('.domain').remove());
    svg.append('g').attr('transform','translate(0,252)').call(d3.axisBottom(x).ticks(4).tickFormat(d3.utcFormat('%m/%d')));
    svg.append('path').datum(futures.records).attr('class','chart-line').attr('d',d3.line().x((row,i)=>x(dates[i])).y(row=>y(row.indexPoints)));
    svg.selectAll('circle').data(futures.records).join('circle').attr('class','chart-dot').attr('cx',(row,i)=>x(dates[i])).attr('cy',row=>y(row.indexPoints)).attr('r',3).append('title').text(row=>`${row.date} · ${row.indexPoints} · ${t('成交量','Volume')} ${row.volume??'—'} · ${t('未平仓量','Open interest')} ${row.openInterest??'—'}`);
    if(futures.finalSettlementIndex!==null){svg.append('line').attr('class','selected-day-line').attr('x1',42).attr('x2',width-24).attr('y1',y(futures.finalSettlementIndex)).attr('y2',y(futures.finalSettlementIndex));host.insertAdjacentHTML('beforeend',`<p>${sourceLink(futures.settlementSourceUrl,t('已核验最终结算指数','Verified final settlement index'))}: ${futures.finalSettlementIndex}</p>`);}
    host.insertAdjacentHTML('beforeend',`<p class="chart-help">${t('每天的点显示原始报价。没有记录的日期不补值；这条线不表示每天都有成交。','Dots show recorded quotes. Missing dates are not filled; the line does not imply daily trading.')}</p>${sourceLink(futures.sourceUrl,t('行情来源','Price source'))}`);
  }
  function drawCharts(){drawCDD();drawPrices();drawFutures();if(state.view==='polymarket')drawPriceHistory();}
  const table=(caption,headings,rows)=>`<div class="market-exact-table" role="region" tabindex="0" aria-label="${caption}"><table><caption>${caption}</caption><thead><tr>${headings.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
  function renderRecords(){
    dashboard.querySelector('#cdd-table').innerHTML=table(t('NWS CF6 · 2026 年 7 月','NWS CF6 · July 2026'),[t('日期','Date'),t('最高温 °F','High °F'),t('最低温 °F','Low °F'),t('当日 CDD','Daily CDD'),t('累计 CDD','Cumulative CDD')],observations.map(d=>`<tr><th scope="row">${d.date}</th><td>${d.maxF}</td><td>${d.minF}</td><td>${d.cdd}</td><td>${d.cumulative}</td></tr>`).join(''));
  }
  function renderQuoteRecords(){
    const day=marketDay();
    dashboard.querySelector('#poly-table').innerHTML=table(`${currentDate()} · ${t('事前报价（美元）与最终 Yes 兑付（美元／份）','Pre-event price (USD) and final Yes payout (USD/share)')}`,[t('区间','Range'),t('事前价格','Pre-event price'),t('时刻 UTC','Time UTC'),t('最终兑付','Final payout')],(day?.outcomes||[]).map(o=>`<tr><th scope="row">${escape(o.label)}</th><td>${o.price??'—'}</td><td>${escape(o.quotedAt?new Date(o.quotedAt).toISOString():'—')}</td><td>${o.settlementPrice??'—'}</td></tr>`).join(''))+
      (day?`<div class="market-source-links">${sourceLink(day.marketUrl,t('当日市场与规则','Event and rules'))}${sourceLink(day.eventApiUrl,'Gamma API')}${activeQuote()?.historyUrl?sourceLink(activeQuote().historyUrl,'CLOB API'):''}</div>`:'');
  }
  function renderSources(){
    dashboard.querySelector('#market-sources-content').innerHTML=`<p>${t('本页展示天气观测和 Polymarket 历史报价。CME 期货价格曲线需有可核验的数据与公开展示许可，目前尚未接入。','This page shows weather observations and historical Polymarket quotes. CME futures prices require verified data and permission for public display, and are not connected.')}</p><p>${t('气象站：KLGA · WBAN 14732 · GHCND USW00014732。NWS 的每日 CDD 按原报告累加；7 月合计 435 °F·天。报告版本链接会滚动，本地快照保留已核对的逐日数值。','Station: KLGA · WBAN 14732 · GHCND USW00014732. NWS daily CDD values sum to 435 °F·day for July. The report version URL rolls over; the local snapshot preserves the verified daily values.')}</p>
      <p>${t('Polymarket 取各事件当地零点前 24 小时内最后一条五分钟报价，未归一化。走势保留最多 8 个原始时刻的采样。结算区间来自已结束市场的 Gamma 记录，与 NWS 观测分列。','Polymarket uses the last five-minute quote in the 24 hours strictly before each event’s local midnight, without normalization. Histories retain up to 8 samples at their original times. Resolved ranges come from closed Gamma markets, separately from NWS observations.')}</p>
      <p>${t('不同合约各自指定结算来源。CME 使用 Speedwell 处理的指数；本月 Polymarket 事件指定 Weather Underground。累计 CDD、日最高温和市场价格分别保留各自单位，不合算预测准确率。','Each contract specifies its own settlement source. CME uses a Speedwell-processed index; these Polymarket events specify Weather Underground. Cumulative CDD, daily highs and market prices retain their own units; no joint accuracy score is calculated.')}</p>
      <p>${t('NWS 按 CF6 逐日发布口径记录，CDD 保留报告整数；本地档案不随链接滚动改写。市场报价截止按纽约当地零点（7 月为 EDT，04:00 UTC），结算遵循事件指定的 Weather Underground 来源、日期、温度精度及数据最终确认／修订规则。两者日界线、发布精度和修订时间需分别核对；未逐日查明的差异不归因于取整。','NWS values retain the CF6 daily reporting convention and integer CDD; the saved archive is not overwritten when the report link rotates. Quote cutoffs use New York local midnight (04:00 UTC in July, EDT). Settlement follows each event’s Weather Underground source, date, temperature precision and finalization / revision rules. Day boundaries, precision and revision times must be checked separately; unexplained differences are not attributed to rounding.')}</p>
      <p>${t('历史 price 字段按原样展示；未核实为可执行买入价或具体成交价，不归一化为真实概率。','Historical price fields are shown as recorded, not verified executable buy prices or individual trades, and are not normalized into true probabilities.')}</p>
      <div class="market-source-links">${sourceLink(nws?.metadata.sourceUrl||'https://www.weather.gov/','NWS CF6')}${sourceLink('/signals/data/laguardia-july-2026-cdd.json',t('逐日气象数据','Daily weather data'))}${sourceLink('/signals/data/laguardia-july-2026-markets.json',t('报价与历史采样','Quotes and samples'))}${sourceLink('https://www.cmegroup.com/rulebook/CME/IV/400/403/403.pdf',t('CME 规则','CME rules'))}${sourceLink('https://www.cmegroup.com/datamine.html','CME DataMine')}</div>`;
  }
  async function readJSON(url){
    const controller=new AbortController();controllers.add(controller);
    const timeout=setTimeout(()=>controller.abort(),12000);
    try{const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('Record unavailable');return await response.json();}
    finally{clearTimeout(timeout);controllers.delete(controller);}
  }
  async function load(){
    const generation=++loadGeneration;
    for(const controller of controllers)controller.abort();
    loading=true;failed=[];resourceState.nws='loading';resourceState.markets='loading';renderShell();
    const resources=[
      ['nws','/signals/data/laguardia-july-2026-cdd.json',data=>{const rows=cumulativeCDD(data);nws=data;observations=rows;}],
      ['markets','/signals/data/laguardia-july-2026-markets.json',data=>{markets=validateMarketData(data);}]
    ];
    await Promise.allSettled(resources.map(async([key,url,accept])=>{
      try{const data=await readJSON(url);if(generation!==loadGeneration)return;accept(data);resourceState[key]='ready';}
      catch{if(generation!==loadGeneration)return;resourceState[key]='failed';failed.push(key);if(key==='nws'){nws=null;observations=[];}else markets=null;}
      if(generation!==loadGeneration)return;
      loading=Object.values(resourceState).includes('loading');renderShell();
    }));
  }
  renderMechanisms();load();
  window.addEventListener('wb-language',()=>{renderMechanisms();renderShell();});
  // Resize only the plots; keep focus, disclosures and the active slider intact.
  let previousWidth=0;
  new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(Math.abs(width-previousWidth)<1)return;previousWidth=width;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(drawCharts);}).observe(dashboard);
}
