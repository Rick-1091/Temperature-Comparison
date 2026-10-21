import * as d3 from 'd3';
import './weather-network.css';
import {parseWeatherReport as parse,pearson} from './weather-report-model.js';

const vars=[
 {id:'temp',label:['气温','Temperature']},{id:'rh',label:['相对湿度','Humidity']},{id:'cloud',label:['云量','Cloud cover']},
 {id:'rain',label:['报告含降雨','Rain in report']},{id:'vis',label:['能见度','Visibility']},{id:'pressure',label:['气压','Pressure']},{id:'wind',label:['风速','Wind speed']}
];
const why={
 'temp|rh':['气温升高时，空气能容纳更多水汽，相对湿度随之下降：白天热而干，夜里凉而湿。','Warmer air holds more water vapour, so relative humidity falls as temperature rises: warm, dry days and cool, damp nights.'],
 'temp|wind':['午后地面受热，空气翻动更强，风常在最热时变大；冷空气到来时，也可能风大而气温低。','Afternoon heating stirs the air, so wind often peaks when it is warmest; an incoming cold air mass can instead bring strong wind and low temperatures.'],
 'temp|pressure':['气压每天有规律地起伏，与气温的日变化错开；冷空气到来时也常带来高气压。','Pressure rises and falls on a daily rhythm offset from temperature; incoming cold air also tends to bring higher pressure.'],
 'temp|cloud':['云多时阳光被挡住，升温变慢；但午后对流云也可能正好在最热时生成。','Clouds block sunshine and slow warming, though afternoon convective clouds can form at the warmest time of day.'],
 'temp|rain':['下雨时阳光少，雨水蒸发还会吸热，气温通常偏低。','Rain comes with less sunshine and evaporative cooling, so temperatures tend to be lower.'],
 'temp|vis':['白天升温后，雾和霾逐渐散去，能见度提高。','As the day warms, fog and haze lift and visibility improves.'],
 'rh|wind':['风大时空气混合更充分，潮湿空气被吹散；白天风大、湿度低也是日变化的一部分。','Stronger wind mixes the air and disperses moisture; windy, drier afternoons are also part of the daily cycle.'],
 'rh|pressure':['两者都随一天中的时间起伏；天气系统经过时，低气压常带来潮湿空气。','Both follow the time of day; passing weather systems often bring humid air with low pressure.'],
 'rh|cloud':['空气越潮湿，水汽越容易凝结成云。','The more humid the air, the more readily water vapour condenses into cloud.'],
 'rh|rain':['下雨时空气接近饱和，相对湿度很高。','During rain the air is close to saturation, so humidity is high.'],
 'rh|vis':['湿度高时容易起雾、霾或下雨，能见度下降。','High humidity favours fog, haze or rain, reducing visibility.'],
 'wind|pressure':['气压越低、变化越快，风往往越大。','Lower and faster-changing pressure usually means stronger wind.'],
 'wind|cloud':['风大的时段云也较多，常见于午后对流或天气系统经过时。','Windier hours also tend to be cloudier, as in afternoon convection or passing systems.'],
 'wind|rain':['雷阵雨前后常有阵风，对流性降雨往往伴随大风。','Gusts often come with showers and thunderstorms, so convective rain tends to be windy.'],
 'wind|vis':['风能吹散霾和污染物，能见度随之提高。','Wind disperses haze and pollutants, improving visibility.'],
 'pressure|cloud':['低气压区空气上升，更容易成云。','Air rises in low pressure, which favours cloud.'],
 'pressure|rain':['锋面、气旋等低气压系统经过时，更容易下雨。','Rain is more likely when low-pressure systems such as fronts pass through.'],
 'pressure|vis':['高气压时天气稳定、晴朗，能见度通常更好。','High pressure brings settled, clear weather and usually better visibility.'],
 'cloud|rain':['先有云才会下雨，云越厚越可能下雨。','Rain needs cloud; thicker cloud makes rain more likely.'],
 'cloud|vis':['低云和伴随的降水会降低能见度。','Low cloud and the precipitation that comes with it reduce visibility.'],
 'rain|vis':['雨水和伴随的雾会遮挡视线。','Rain and accompanying mist obscure the view.']
};
const THRESHOLD=.3,W=880,H=440,cx=W/2,cy=H/2;
export function renderWeatherNetwork(data,state,language){
 const root=d3.select('#weather-network');if(root.empty())return;
 const t=pair=>pair[language.current==='en'?1:0],rows=data.observations.map(o=>parse(o.rawOb)).filter(Boolean);
 const pos=Object.fromEntries(vars.map((v,i)=>{const angle=-Math.PI/2+i*2*Math.PI/vars.length;return[v.id,[cx+300*Math.cos(angle),cy+165*Math.sin(angle)]];}));
 const links=[];for(let i=0;i<vars.length;i++)for(let j=i+1;j<vars.length;j++){const a=vars[i].id,b=vars[j].id,res=pearson(rows,a,b);if(Math.abs(res.r)>=THRESHOLD)links.push({a,b,...res,key:why[a+'|'+b]?a+'|'+b:b+'|'+a});}
 links.sort((x,y)=>Math.abs(x.r)-Math.abs(y.r));
 const rainReports=rows.filter(r=>r.rain===1).length,unknownRain=rows.filter(r=>r.rain===null).length,name=id=>t(vars.find(v=>v.id===id).label);
 root.selectAll('*').remove();
 const svg=root.append('svg').attr('viewBox','0 0 '+W+' '+H).attr('role','group').attr('aria-label',t(['天气要素之间的相关关系','Correlations between weather elements']));
 const width=d3.scaleLinear([THRESHOLD,1],[2,14]);
 const edge=svg.append('g').selectAll('g').data(links).join('g').attr('class',l=>'wn-link '+(l.r>0?'is-same':'is-opposite')).attr('tabindex',0).attr('role','button')
  .attr('aria-label',l=>name(l.a)+' · '+name(l.b)+' · r = '+l.r.toFixed(2));
 edge.append('line').attr('class','wn-hit').attr('x1',l=>pos[l.a][0]).attr('y1',l=>pos[l.a][1]).attr('x2',l=>pos[l.b][0]).attr('y2',l=>pos[l.b][1]);
 edge.append('line').attr('class','wn-line').attr('x1',l=>pos[l.a][0]).attr('y1',l=>pos[l.a][1]).attr('x2',l=>pos[l.b][0]).attr('y2',l=>pos[l.b][1]).attr('stroke-width',l=>width(Math.abs(l.r)));
 const node=svg.append('g').selectAll('g').data(vars).join('g').attr('class','wn-node').attr('transform',v=>'translate('+pos[v.id]+')').attr('tabindex',0).attr('role','button')
  .attr('aria-label',v=>t(v.label));
 node.append('circle').attr('r',44);
 node.append('text').attr('text-anchor','middle').attr('dy','.35em').text(v=>t(v.label));
 const detail=root.append('div').attr('class','wn-detail').attr('aria-live','polite');
 let selected=null;
 function focusOn(item){
  const isNode=item&&!item.a,touches=l=>!item||(isNode?l.a===item.id||l.b===item.id:l===item);
  edge.classed('is-dim',l=>!touches(l)).classed('is-active',l=>!!item&&touches(l));
  node.classed('is-dim',v=>!!item&&(isNode?v.id!==item.id&&!links.some(l=>touches(l)&&(l.a===v.id||l.b===v.id)):v.id!==item.a&&v.id!==item.b)).classed('is-active',v=>!!item&&(isNode?v.id===item.id:v.id===item.a||v.id===item.b));
  detail.selectAll('*').remove();
  if(!item){detail.append('p').text(t(['点一个要素，看它和哪些要素一起变化；点一条连线，看具体数值和可能原因。','Select an element to see what moves with it, or a line for its value and a likely explanation.']));return;}
  if(isNode){
   const mine=links.filter(touches).sort((x,y)=>Math.abs(y.r)-Math.abs(x.r));
   detail.append('h4').text(t(item.label));
   if(!mine.length)detail.append('p').text(t(['在这段时间里，它和其他要素都没有明显的一起变化（|r| < 0.3）。','Over this period it showed no clear co-movement with other elements (|r| < 0.3).']));
   const list=detail.append('ul');
   for(const l of mine){const other=l.a===item.id?l.b:l.a;list.append('li').html('<b>'+name(other)+'</b> '+(l.r>0?t(['同向','moves together']):t(['反向','moves opposite']))+' · r = '+l.r.toFixed(2));}
  }else{
   detail.append('h4').text(name(item.a)+(item.r>0?t([' ↑ 时，',' ↑ → ']):t([' ↑ 时，',' ↑ → ']))+name(item.b)+(item.r>0?' ↑':' ↓'));
   detail.append('p').html(t(['相关系数','Correlation'])+' <b>r = '+item.r.toFixed(2)+'</b>（'+(item.r>0?t(['同向变化','same direction']):t(['反向变化','opposite directions']))+t(['，基于 ',', based on '])+item.n+t([' 份有效报告）',' valid reports)']));
   detail.append('p').text(t(why[item.key]||['','']));
  }
 }
 const pick=item=>{selected=selected===item?null:item;focusOn(selected);};
 for(const sel of [node,edge])sel.on('pointerenter',(e,d)=>focusOn(d)).on('pointerleave',()=>focusOn(selected)).on('focus',(e,d)=>focusOn(d)).on('blur',()=>focusOn(selected))
  .on('click',(e,d)=>pick(d)).on('keydown',(e,d)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(d);}});
 focusOn(null);
 const first=new Date(d3.min(data.observations,o=>o.obsTime)*1000).toISOString().slice(0,10),last=new Date(d3.max(data.observations,o=>o.obsTime)*1000).toISOString().slice(0,10);
 const summary=document.getElementById('weather-network-summary');
 summary.replaceChildren();
 const facts=document.createElement('dl');facts.className='wn-sample-facts';
 for(const [label,value] of [
  [t(['观测样本','Observation sample']),`${data.metadata.station} · ${first} — ${last}`],
  [t(['报告统计','Report counts']),t([`${rows.length} 份常规 METAR 报告；${rainReports} 份含雨／毛毛雨，${unknownRain} 份无法判定。`,`${rows.length} routine METAR reports; ${rainReports} contain rain / drizzle, ${unknownRain} are unknown.`])]
 ]){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);facts.append(row);}
 const note=document.createElement('p');note.textContent=t(['每份 METAR 报告计为一个样本。“含雨”表示报文出现雨或毛毛雨编码；未出现这类编码时，只记录为“未报告降雨”。','Each METAR report counts as one sample. Rain or drizzle codes mark a report as containing rain; their absence is recorded as rain not reported.']);
 const method=document.createElement('details'),heading=document.createElement('summary'),body=document.createElement('p');
 heading.textContent=t(['统计方法','Statistical method']);
 body.textContent=t(['每份报告作为一个样本，不按小时去重。计算每一对要素的相关系数时，只使用两项都有数值的报告；仅显示 |r| ≥ 0.3 的连线。这些相关性描述短期样本中的共同变化；解释原因还需要检验昼夜变化等共同因素。','Each report is one sample; reports are not deduplicated by hour. Each correlation uses only reports with values for both elements. Links are shown only when |r| ≥ 0.3. These correlations describe co-variation in a short sample. Explaining causes requires testing shared influences such as the day–night cycle.']);
 method.append(heading,body);summary.append(facts,note,method);
}
