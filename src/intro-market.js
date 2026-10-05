import {convert,number} from './evidence-model.js';

export function initIntroMarket(language, getUnit) {
  const host=document.getElementById('intro-market');
  let data, failed=false;
  const text=(zh,en)=>language.current==='en'?en:zh;
  const label=o=>(o.boundary==='below'?'≤':o.boundary==='above'?'≥':'')+number(convert(o.temperature,'C',getUnit()))+'°'+getUnit();
  const cents=o=>Number((o.price*100).toFixed(2))+'¢';
  const clock=iso=>new Intl.DateTimeFormat('en-GB',{timeZone:'America/Mexico_City',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date(iso));
  const render=()=>{
    if(!data){host.textContent=failed?text('真实报价暂时无法读取，请刷新或打开原市场。','Real quotes could not be loaded. Reload or open the original market.'):text('正在读取真实历史报价…','Loading real historical quotes…');return;}
    const top=data.outcomes.reduce((a,b)=>b.price>a.price?b:a);
    const winners=data.outcomes.filter(o=>o.resolutionStatus==='resolved'&&o.settlementPrice===1);
    // A fixed cents scale represents original quotes, not a re-normalized probability distribution.
    const plot={width:1000,height:310,left:50,right:980,top:44,bottom:240,maxCents:50};
    const step=(plot.right-plot.left)/data.outcomes.length;
    const y=p=>plot.bottom-p/plot.maxCents*(plot.bottom-plot.top);
    const axis=[0,10,20,30,40,50].map(v=>'<line x1="'+plot.left+'" x2="'+plot.right+'" y1="'+y(v)+'" y2="'+y(v)+'" class="intro-grid"/><text x="38" y="'+(y(v)+5)+'" text-anchor="end">'+v+'</text>').join('');
    const bars=data.outcomes.map((o,i)=>{
      const x=plot.left+step*(i+.5),topY=y(o.price*100);
      return '<g class="intro-bar" data-top="'+(o===top)+'"><title>'+label(o)+' · '+cents(o)+' · 2026-10-03 '+clock(o.quotedAt)+' UTC−06:00</title><rect x="'+(x-step*.29)+'" y="'+topY+'" width="'+step*.58+'" height="'+(plot.bottom-topY)+'"/><text x="'+x+'" y="'+(topY-10)+'" text-anchor="middle">'+cents(o)+'</text><text x="'+x+'" y="267" text-anchor="middle">'+label(o)+'</text></g>';
    }).join('');
    host.innerHTML='<p class="intro-market-date">'+text('墨西哥城 · 2026-10-04 · 当日最高温市场','Mexico City · 2026-10-04 · Daily highest-temperature market')+'</p>'+
      '<p class="caption">'+text('事前报价：10月3日 23:55（墨西哥城时间，UTC−06:00）。浅绿色标出当时最高价区间。','Pre-day quotes: October 3, 23:55 (Mexico City, UTC−06:00). Light green marks the highest-priced range at that time.')+'</p>'+
      '<div class="intro-chart-scroll" tabindex="0" role="region" aria-label="'+text('温度区间报价图；窄屏可左右滑动','Temperature-range price chart; scroll horizontally on narrow screens')+'"><svg class="intro-market-chart" viewBox="0 0 '+plot.width+' '+plot.height+'" role="img" aria-labelledby="intro-chart-title intro-chart-desc"><title id="intro-chart-title">'+text('各温度区间的事前 Yes 合约报价','Pre-day Yes contract prices by temperature range')+'</title><desc id="intro-chart-desc">'+text('横轴为当日最高温结算区间，纵轴为 Yes 合约报价，单位美分。完整数值与时间见下方表格。','X: daily maximum temperature settlement bins. Y: Yes contract price in US cents. Exact values and timestamps are in the table below.')+'</desc><text x="50" y="20">'+text('Yes 合约报价（美分）','Yes contract price (US cents)')+'</text>'+axis+bars+'<text x="50" y="300">'+text('当日最高温区间（原市场按整数 °C 结算）','Daily maximum bins (original market settles in whole °C)')+'</text></svg></div>'+
      '<p class="intro-market-reading">'+text('当时最高价：','Highest-priced then: ')+label(top)+' · '+cents(top)+(winners.length===1?'　'+text('市场结算区间：','Market settlement bin: ')+label(winners[0]):'')+'</p>'+
      '<p class="caption">'+text('这是固定历史快照，不是实时价格。保留原始报价，未归一化；各价格之和不必等于 100¢，不能直接当作天气概率。','This is a fixed historical snapshot, not live prices. Raw quotes are not normalized; their sum need not equal 100¢ and they are not calibrated weather probabilities.')+'</p>'+
      '<div class="intro-market-sources"><a href="'+data.metadata.marketUrl+'" target="_blank" rel="noopener">'+text('查看原市场 ↗','Original market ↗')+'</a><a href="/signals/data/mexico-oct4-intro.json" target="_blank" rel="noopener">'+text('下载报价与历史记录 ↗','Quotes and history ↗')+'</a></div>'+
      '<details><summary>'+text('精确报价时间与数据口径','Exact quote times and method')+'</summary><p class="caption">'+text('每个区间取 10月4日当地 00:00（06:00 UTC）前24小时内，CLOB 五分钟采样中的最后一条报价。各区间时间略有差异。','For each bin, use the last available CLOB five-minute sample in the 24 hours strictly before October 4 local 00:00 (06:00 UTC). Quote times differ slightly.')+'</p>'+
      '<div class="intro-chart-scroll"><table class="intro-market-table"><thead><tr><th>'+text('温度区间','Temperature bin')+'</th><th>'+text('Yes 报价','Yes price')+'</th><th>'+text('报价时间（10月3日，UTC−06:00）','Quote time (October 3, UTC−06:00)')+'</th></tr></thead><tbody>'+
      data.outcomes.map(o=>'<tr><td>'+label(o)+'</td><td>'+cents(o)+'</td><td>'+clock(o.quotedAt)+'</td></tr>').join('')+'</tbody></table></div>'+
      '<p class="caption">'+text('价格来源：Polymarket CLOB；区间、规则和结算状态：Gamma API。该市场以 NOAA 的 MMMX 站温度读数为主要结算来源，缺失时按规则使用 Weather Underground。结算区间不等于独立气象实测验证，也不代表普遍预测准确率。','Prices: Polymarket CLOB. Bins, rules and settlement status: Gamma API. This market primarily settles from NOAA MMMX readings, with Weather Underground as the specified fallback. The settlement bin is not independent observational validation or evidence of general forecast accuracy.')+'</p>'+
      '<div class="intro-market-sources"><a href="'+data.metadata.eventApiUrl+'" target="_blank" rel="noopener">Gamma API ↗</a><a href="'+data.metadata.resolutionSource+'" target="_blank" rel="noopener">NOAA · MMMX ↗</a><a href="/signals/data/mexico-oct4-event-raw.json" target="_blank" rel="noopener">'+text('市场原始记录 ↗','Raw event record ↗')+'</a></div><p class="caption">'+text('采集时间：','Collected: ')+new Date(data.metadata.collectedAt).toISOString()+'</p></details>';
  };
  fetch('/signals/data/mexico-oct4-intro.json').then(r=>{if(!r.ok)throw Error('Missing snapshot');return r.json();}).then(value=>{
    if(value.metadata.date!=='2026-10-04'||!value.outcomes.length||value.outcomes.some(o=>!Number.isFinite(o.price)||o.price<0||o.price>1||!Number.isFinite(o.temperature)||!(Date.parse(o.quotedAt)<Date.parse(value.metadata.cutoffAt))))throw Error('Invalid snapshot');
    data=value;render();
  }).catch(()=>{failed=true;render();});
  window.addEventListener('wb-language',render);
  render();
  return render;
}
