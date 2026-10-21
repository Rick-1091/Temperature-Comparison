import {convert,number} from './evidence-model.js';

export function initIntroMarket(language, getUnit) {
  const host=document.getElementById('intro-market');
  if(!host)return ()=>{};
  const resources=document.getElementById('intro-market-resources');
  const example=document.getElementById('intro-example-copy');
  let data,failed=false;
  const text=(zh,en)=>language.current==='en'?en:zh;
  const label=o=>(o.boundary==='below'?'≤':o.boundary==='above'?'≥':'')+number(convert(o.temperature,'C',getUnit()))+'°'+getUnit();
  const amount=value=>Number(value.toFixed(2))+' '+text('美分','cents');
  const cents=o=>amount(o.price*100);
  const clock=iso=>new Intl.DateTimeFormat('en-GB',{timeZone:'America/Mexico_City',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date(iso));
  const render=()=>{
    const rulesOpen=resources?.querySelector('details')?.open||false;
    const previousScroll=host.querySelector('.intro-chart-scroll')?.scrollLeft;
    if(!data){
      host.textContent=failed?text('历史报价暂时无法读取，请刷新重试。','Historical quotes could not be loaded. Please reload.'):text('正在读取历史报价…','Loading historical quotes…');
      if(example)example.textContent=text('买一份合约先付成本；兑付后还要扣除成本与费用，才是净结果。','Buying a share costs money up front. Deduct purchase costs and fees from redemption to find the net result.');
      if(resources)resources.innerHTML='<details id="polymarket-rules" class="definition-rules"><summary>'+text('规则与来源','Rules and sources')+'</summary><a href="/signals/data/mexico-oct4-event-raw.json" target="_blank" rel="noopener">'+text('查看保存的原始市场规则 ↗','Saved original market rules ↗')+'</a></details>';
      return;
    }
    const top=data.outcomes.reduce((a,b)=>b.price>a.price?b:a);
    const winners=data.outcomes.filter(o=>o.resolutionStatus==='resolved'&&o.settlementPrice===1);
    // Keep the original 11-bin, fixed-cent-scale historical plot.
    const plot={width:1000,height:310,left:50,right:980,top:44,bottom:240,maxCents:50};
    const step=(plot.right-plot.left)/data.outcomes.length;
    const y=p=>plot.bottom-p/plot.maxCents*(plot.bottom-plot.top);
    const axis=[0,10,20,30,40,50].map(v=>'<line x1="'+plot.left+'" x2="'+plot.right+'" y1="'+y(v)+'" y2="'+y(v)+'" class="intro-grid"/><text x="38" y="'+(y(v)+5)+'" text-anchor="end">'+v+'</text>').join('');
    const bars=data.outcomes.map((o,i)=>{
      const x=plot.left+step*(i+.5),topY=y(o.price*100);
      return '<g class="intro-bar" data-top="'+(o===top)+'"><title>'+label(o)+' · '+cents(o)+' · 2026-10-03 '+clock(o.quotedAt)+' UTC−06:00</title><rect x="'+(x-step*.29)+'" y="'+topY+'" width="'+step*.58+'" height="'+(plot.bottom-topY)+'"/><text x="'+x+'" y="'+(topY-10)+'" text-anchor="middle">'+cents(o)+'</text><text x="'+x+'" y="267" text-anchor="middle">'+label(o)+'</text></g>';
    }).join('');
    host.innerHTML='<p class="intro-market-date">'+text('墨西哥城 · 2026-10-04 · 最高温事件','Mexico City · 2026-10-04 · Daily high event')+'</p>'+
      '<p class="intro-quote-time">'+text('事前报价 · 10月3日 23:55，当地时间 UTC−06:00','Pre-event quotes · October 3, 23:55, local time UTC−06:00')+'</p>'+
      '<p class="intro-market-reading">'+text('事前最高价：','Highest pre-event quote: ')+label(top)+' · '+cents(top)+'</p>'+
      '<p class="intro-scroll-note">'+text('左右滑动，查看全部温度区间。','Scroll horizontally to see every temperature range.')+'</p>'+
      '<div class="intro-chart-scroll" tabindex="0" role="region" aria-label="'+text('温度区间报价图；窄屏可左右滑动','Temperature-range price chart; scroll horizontally on narrow screens')+'"><svg class="intro-market-chart" viewBox="0 0 '+plot.width+' '+plot.height+'" role="img" aria-labelledby="intro-chart-title intro-chart-desc"><title id="intro-chart-title">'+text('各温度区间的事前 Yes 合约报价','Pre-event Yes contract prices by temperature range')+'</title><desc id="intro-chart-desc">'+text('横轴为最高温结算区间，纵轴为 Yes 报价，单位美分每份。精确时间与原始来源在规则与来源中。','X: daily maximum temperature settlement bins. Y: Yes quote in cents per share. Exact times and original sources are under Rules and sources.')+'</desc><text x="50" y="20">'+text('事前 Yes 报价（美分／份）','Pre-event Yes quote (cents per share)')+'</text>'+axis+bars+'<text x="50" y="300">'+text('最高温区间（显示单位 °','Daily high ranges (display unit: °')+getUnit()+(language.current==='en'?')':'）')+'</text></svg></div>'+
      '<p class="intro-price-meaning definition-copy">'+text('报价由合约交易形成，可读作市场隐含概率。实际成交取决于订单与流动性；气象概率的准确性还需观测检验与校准。','Quotes emerge from contract trading and can be read as market-implied probabilities. Execution depends on orders and liquidity; weather probabilities require validation and calibration against observations.')+'</p>'+
      (winners.length===1?'<p class="intro-result-label">'+text('市场结算区间：','Resolved market range: ')+label(winners[0])+'</p>':'')+
      '<p class="intro-source-label">'+text('来源：Polymarket CLOB · 固定历史快照','Source: Polymarket CLOB · fixed historical snapshot')+'</p>';
    const scroller=host.querySelector('.intro-chart-scroll');
    if(previousScroll!==undefined)scroller.scrollLeft=previousScroll;
    else if(scroller.scrollWidth>scroller.clientWidth){
      const topX=plot.left+step*(data.outcomes.indexOf(top)+.5);
      scroller.scrollLeft=topX*host.querySelector('svg').getBoundingClientRect().width/plot.width-scroller.clientWidth/2;
    }
    if(example)example.textContent=text(
      '若以 '+cents(top)+' 买到图中 '+label(top)+' 档的一份，兑付 $1 后扣买入成本剩 '+amount(100-top.price*100)+'，再扣费用；未中则兑付 $0。',
      'If one '+label(top)+' share could be bought at '+cents(top)+', a $1 redemption leaves '+amount(100-top.price*100)+' after purchase cost, before fees. A losing share pays $0.'
    );
    if(resources){
      resources.innerHTML='<details id="polymarket-rules" class="definition-rules"><summary>'+text('规则与来源','Rules and sources')+'</summary>'+
        '<p>'+text('各档保留原始报价，合计可能高于或低于 100 美分。价格受流动性、买卖价差和交易行为影响；解读天气概率还需结合观测校准。','Each quote retains its original value, so totals can differ from 100 cents. Liquidity, bid–ask spreads and trading behavior affect prices; interpreting weather probabilities requires calibration against observations.')+'</p>'+
        '<p>'+text('每档取 10月4日当地 00:00（06:00 UTC）前24小时内，CLOB 五分钟采样中最后可得的报价。各档精确时间可能不同。原市场按整数 °C 结算；单位切换只改变显示，不改变原始区间。','Each range uses the last available five-minute CLOB sample in the 24 hours strictly before October 4 local midnight (06:00 UTC). Exact times may differ. The original market settles in whole °C; switching display units preserves the native ranges.')+'</p>'+
        '<div class="intro-chart-scroll"><table class="intro-market-table"><caption>'+text('逐档原始报价与时间','Original quotes and timestamps by range')+'</caption><thead><tr><th>'+text('温度区间','Temperature range')+'</th><th>'+text('Yes 报价','Yes quote')+'</th><th>'+text('10月3日当地时间（UTC−06:00）','October 3 local time (UTC−06:00)')+'</th></tr></thead><tbody>'+
        data.outcomes.map(o=>'<tr><td>'+label(o)+'</td><td>'+cents(o)+'</td><td>'+clock(o.quotedAt)+'</td></tr>').join('')+'</tbody></table></div>'+
        '<p>'+text('本事件按规则指定的 NOAA MMMX 温度记录结算，缺失时按规则使用 Weather Underground。结算区间与独立气象观测分别保存，核对时各自追溯来源。完整规则及其他情况见原市场。','This event specifies NOAA MMMX temperatures for resolution, with Weather Underground as the stated fallback. Market resolution and independent weather observations are separate records. See the original market for complete rules and other cases.')+'</p>'+
        '<div class="intro-market-sources"><a href="'+data.metadata.marketUrl+'" target="_blank" rel="noopener">'+text('原市场与完整合约规则 ↗','Original market and full contract rules ↗')+'</a><a href="'+data.metadata.eventApiUrl+'" target="_blank" rel="noopener">Polymarket Gamma API ↗</a><a href="'+data.metadata.resolutionSource+'" target="_blank" rel="noopener">NOAA · MMMX ↗</a><a href="/signals/data/mexico-oct4-intro.json" target="_blank" rel="noopener">'+text('原始报价与历史记录 ↗','Original quotes and history ↗')+'</a><a href="/signals/data/mexico-oct4-event-raw.json" target="_blank" rel="noopener">'+text('保存的市场规则与结算记录 ↗','Saved rules and resolution record ↗')+'</a></div>'+
        '<p class="intro-collected">'+text('采集时间：','Collected: ')+new Date(data.metadata.collectedAt).toISOString()+'</p></details>';
      resources.querySelector('details').open=rulesOpen;
    }
  };
  fetch('/signals/data/mexico-oct4-intro.json').then(r=>{if(!r.ok)throw Error('Missing snapshot');return r.json();}).then(value=>{
    if(value.metadata.date!=='2026-10-04'||!value.outcomes.length||value.outcomes.some(o=>!Number.isFinite(o.price)||o.price<0||o.price>1||!Number.isFinite(o.temperature)||!(Date.parse(o.quotedAt)<Date.parse(value.metadata.cutoffAt))))throw Error('Invalid snapshot');
    data=value;render();
  }).catch(()=>{failed=true;render();});
  window.addEventListener('wb-language',render);
  window.addEventListener('wb-market-intro',event=>{
    if(event.detail!==1)return;
    const scroller=host.querySelector('.intro-chart-scroll'),top=host.querySelector('.intro-bar[data-top=true]');
    if(scroller&&top&&scroller.scrollWidth>scroller.clientWidth&&scroller.scrollLeft===0){
      const mark=top.getBoundingClientRect(),frame=scroller.getBoundingClientRect();
      scroller.scrollLeft=mark.left-frame.left+mark.width/2-scroller.clientWidth/2;
    }
  });
  render();
  return render;
}
