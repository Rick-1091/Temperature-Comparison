import * as d3 from 'd3';
import {convert,leading,range,number,cumulative} from './evidence-model.js';
export function renderEvidencePlots(data,state,language){
const t=(zh,en)=>language.current==='en'?en:zh,W=880,H=300,left=60,right=850,bottom=250,top=28;
const days=data.days,native=data.metadata.marketUnit,x=d3.scalePoint(days.map(d=>d.date),[left+20,right-20]);
function plot(id,label){const root=d3.select('#'+id);root.selectAll('*').remove();return root.append('svg').attr('viewBox','0 0 '+W+' '+H).attr('role','img').attr('aria-label',label);}
function axes(svg,y,formatter,ticks){svg.append('g').attr('transform','translate('+left+',0)').call(d3.axisLeft(y).tickValues(ticks).tickFormat(formatter).tickSize(-(right-left))).call(g=>g.select('.domain').remove());svg.append('g').attr('transform','translate(0,'+bottom+')').call(d3.axisBottom(x).tickFormat(d=>d.slice(5))).call(g=>g.select('.domain').remove());}
const vals=days.flatMap(d=>{const o=leading(d);return[d.actualC,convert(o.low,native,'C'),convert(o.high,native,'C')].filter(v=>v!=null).map(v=>convert(v,'C',state.unit));});
const margin=state.unit==='C'?2:4,extent=d3.extent(vals),y=d3.scaleLinear([extent[0]-margin,extent[1]+margin],[bottom,top]).nice();
const temp=plot('temperature-history',t('九天最高价温度区间与机场观测对照','Nine-day comparison of highest-priced temperature ranges and airport observations')).attr('role','group');axes(temp,y,v=>number(v)+'°'+state.unit,y.ticks(5));
const detail=d3.select('#temperature-history').append('div').attr('class','temperature-detail').attr('aria-live','polite');
function showDay(d){
  temp.selectAll('.temperature-day').classed('is-selected',item=>item.date===d.date);
  const o=leading(d);
  detail.selectAll('*').remove();
  detail.append('strong').text(d.date);
  detail.append('span').attr('class','market-reading').text(t('市场最高价区间：','Highest-priced range: ')+range(o,native,state.unit));
  detail.append('span').attr('class','actual-reading').text(t('观测最高温：','Observed high: ')+number(convert(d.actualC,'C',state.unit))+'°'+state.unit);
}
days.forEach(d=>{const o=leading(d),a=o.low==null?y.domain()[0]:convert(o.low,native,state.unit),b=o.high==null?y.domain()[1]:convert(o.high,native,state.unit),cx=x(d.date);
const actual=convert(d.actualC,'C',state.unit),closed=o.low!=null&&o.high!=null;
// Closed ranges use a midpoint as a visual anchor, never as a new forecast value.
const anchor=closed?(a+b)/2:o.low==null?b:a;
const label=d.date+' · '+t('市场区间 ','Market range ')+range(o,native,state.unit)+' · '+t('观测 ','Observed ')+number(actual)+'°'+state.unit;
const g=temp.append('g').datum(d).attr('class','temperature-day').attr('tabindex',0).attr('role','button').attr('aria-label',label)
  .on('pointerenter',()=>showDay(d)).on('focus',()=>showDay(d)).on('click',()=>showDay(d))
  .on('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();showDay(d);}});
g.append('title').text(label);
g.append('rect').attr('class','temperature-selection').attr('x',cx-26).attr('y',top-10).attr('width',52).attr('height',bottom-top+20).attr('rx',12);
g.append('rect').attr('class','temperature-range').attr('x',cx-16).attr('y',y(b)-3).attr('width',18).attr('height',Math.max(6,y(a)-y(b)+6)).attr('rx',9);
g.append('line').attr('class','temperature-connector').attr('x1',cx-7).attr('x2',cx+7).attr('y1',y(anchor)).attr('y2',y(actual));
if(closed)g.append('circle').attr('class','temperature-market-point').attr('cx',cx-7).attr('cy',y(anchor)).attr('r',6);
else{
  const edgeY=o.high==null?y(b):y(a),direction=o.high==null?1:-1;
  g.append('path').attr('class','temperature-open-arrow').attr('d',`M${cx-12},${edgeY+direction*6} L${cx-7},${edgeY} L${cx-2},${edgeY+direction*6}`);
}
g.append('circle').attr('class','temperature-observed-point').attr('cx',cx+7).attr('cy',y(actual)).attr('r',6);
});
showDay(days.find(d=>d.date===state.date)||days[0]);
const series=cumulative(days,native),rate=d3.scaleLinear([0,1],[bottom,top]),curve=plot('accuracy-history',t('累计比例：观测落在最高价区间内，或距区间不超过允许偏差','Cumulative share of days inside the highest-priced range, or within the allowed margin'));
axes(curve,rate,v=>Math.round(v*100)+'%',[0,.25,.5,.75,1]);
for(const [key,color,dash] of [['strictRate','var(--evidence-market)',null],['tolerantRate','var(--evidence-observed)','7 5']]){curve.append('path').datum(series).attr('class',key).attr('fill','none').attr('stroke',color).attr('stroke-width',2.5).attr('stroke-dasharray',dash).attr('d',d3.line().x(d=>x(d.day.date)).y(d=>rate(d[key])));curve.selectAll('.'+key+'-point').data(series).join('circle').attr('class',key+'-point').attr('cx',d=>x(d.day.date)).attr('cy',d=>rate(d[key])).attr('r',3.5).attr('fill',color).append('title').text(d=>d.day.date+' · '+Math.round(d[key]*100)+'%');}
const marginLabel=native==='F'?'2°F':'1°C';
document.getElementById('accuracy-legend-tolerant').textContent=t('允许偏离区间 '+marginLabel+' 以内','Within '+marginLabel+' of the range');
const last=series.at(-1),summary=document.getElementById('accuracy-summary');
summary.textContent=t(`这 ${last.n} 天里，有 ${last.strict} 天的观测最高温落在市场最高价区间内（${Math.round(last.strictRate*100)}%）。允许偏离区间 ${marginLabel} 以内后，有 ${last.tolerant} 天符合（${Math.round(last.tolerantRate*100)}%）。`,`On ${last.strict} of these ${last.n} days, the observed high fell inside the highest-priced market range (${Math.round(last.strictRate*100)}%). Allowing up to ${marginLabel} outside that range includes ${last.tolerant} days (${Math.round(last.tolerantRate*100)}%).`);
const note=document.createElement('span');note.className='accuracy-summary-note';note.textContent=t('这只是这九天的对照结果，不能代表长期表现。','These results describe only these nine days, not long-term performance.');summary.append(note);
}
