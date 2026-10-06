import * as d3 from 'd3';
import {convert,leading,range,number,cumulative,matches} from './evidence-model.js';
export function renderEvidencePlots(data,state,language){
const t=(zh,en)=>language.current==='en'?en:zh,W=880,H=300,left=60,right=850,bottom=250,top=28;
const days=data.days,native=data.metadata.marketUnit,x=d3.scalePoint(days.map(d=>d.date),[left+20,right-20]);
function plot(id,label){const root=d3.select('#'+id);root.selectAll('*').remove();return root.append('svg').attr('viewBox','0 0 '+W+' '+H).attr('role','img').attr('aria-label',label);}
function axes(svg,y,formatter,ticks){svg.append('g').attr('transform','translate('+left+',0)').call(d3.axisLeft(y).tickValues(ticks).tickFormat(formatter).tickSize(-(right-left))).call(g=>g.select('.domain').remove());svg.append('g').attr('transform','translate(0,'+bottom+')').call(d3.axisBottom(x).tickFormat(d=>d.slice(5))).call(g=>g.select('.domain').remove());}
const vals=days.flatMap(d=>{const o=leading(d);return[d.actualC,convert(o.low,native,'C'),convert(o.high,native,'C')].filter(v=>v!=null).map(v=>convert(v,'C',state.unit));});
const margin=state.unit==='C'?1.5:3,extent=d3.extent(vals),y=d3.scaleLinear([extent[0]-margin,extent[1]+margin],[bottom,top+24]).nice();
const temp=plot('temperature-history',t('九天最高价温度区间与机场观测对照','Nine-day comparison of highest-priced temperature ranges and airport observations')).attr('role','group');axes(temp,y,v=>number(v)+'°'+state.unit,y.ticks(5));
const scale=native===state.unit?1:state.unit==='F'?9/5:5/9,fade=temp.append('defs');
for(const [id,y1,y2] of [['range-fade-up','100%','0%'],['range-fade-down','0%','100%']]){const g=fade.append('linearGradient').attr('id',id).attr('x1',0).attr('x2',0).attr('y1',y1).attr('y2',y2);g.append('stop').attr('offset','0%').attr('stop-color','var(--evidence-market)').attr('stop-opacity',.28);g.append('stop').attr('offset','100%').attr('stop-color','var(--evidence-market)').attr('stop-opacity',0);}
const detail=d3.select('#temperature-history').append('div').attr('class','temperature-detail').attr('aria-live','polite');
function showDay(d){
  temp.selectAll('.temperature-day').classed('is-selected',item=>item.date===d.date);
  const o=leading(d);
  detail.selectAll('*').remove();
  detail.append('strong').text(d.date);
  detail.append('span').attr('class','market-reading').text(t('市场最高价区间：','Highest-priced range: ')+range(o,native,state.unit));
  detail.append('span').attr('class','actual-reading').text(t('观测最高温：','Observed high: ')+number(convert(d.actualC,'C',state.unit))+'°'+state.unit);
}
days.forEach(d=>{const o=leading(d),cx=x(d.date),[floor,ceiling]=y.domain();
// Bins are settled on rounded native values, so a "26°C" bin covers 25.5–26.5.
const a=o.low==null?floor:convert(o.low-.5,native,state.unit),b=o.high==null?ceiling:convert(o.high+.5,native,state.unit);
const actual=convert(d.actualC,'C',state.unit),hit=matches(d,native),v=Math.round(convert(d.actualC,'C',native));
const off=o.low!=null&&v<o.low?v-o.low:o.high!=null&&v>o.high?v-o.high:0;
const label=d.date+' · '+t('市场区间 ','Market range ')+range(o,native,state.unit)+' · '+t('观测 ','Observed ')+number(actual)+'°'+state.unit+' · '+(hit?t('落在区间内','inside the range'):t('不在区间内','outside the range'));
const g=temp.append('g').datum(d).attr('class','temperature-day '+(hit?'is-hit':'is-miss')).attr('tabindex',0).attr('role','button').attr('aria-label',label)
  .on('pointerenter',()=>showDay(d)).on('focus',()=>showDay(d)).on('click',()=>showDay(d))
  .on('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();showDay(d);}});
g.append('title').text(label);
g.append('rect').attr('class','temperature-selection').attr('x',cx-30).attr('y',top-12).attr('width',60).attr('height',bottom-top+24).attr('rx',10);
g.append('rect').attr('class','temperature-range').attr('x',cx-20).attr('y',y(b)).attr('width',40).attr('height',y(a)-y(b)).attr('rx',o.low!=null&&o.high!=null?6:0)
  .attr('style',o.high==null?'fill:url(#range-fade-up);fill-opacity:1':o.low==null?'fill:url(#range-fade-down);fill-opacity:1':null);
if(o.high==null||o.low==null)g.append('text').attr('class','temperature-open-label').attr('x',cx).attr('y',o.high==null?y(a)-10:y(b)+20).attr('text-anchor','middle').text(range(o,native,state.unit).replace('°'+state.unit,''));
if(!hit){const edge=off<0?a:b;g.append('line').attr('class','temperature-connector').attr('x1',cx).attr('x2',cx).attr('y1',y(edge)).attr('y2',y(actual));
  g.append('text').attr('class','temperature-miss-label').attr('x',cx+12).attr('y',y(actual)+5).text((off>0?'+':'−')+number(Math.abs(off)*scale)+'°');}
g.append('circle').attr('class','temperature-observed-point').attr('cx',cx).attr('cy',y(actual)).attr('r',7);
g.append('text').attr('class','temperature-verdict').attr('x',cx).attr('y',top+2).attr('text-anchor','middle').text(hit?'✓':'✕');
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
