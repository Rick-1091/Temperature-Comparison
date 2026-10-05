import * as d3 from 'd3';
import {convert,leading,range,number,cumulative} from './evidence-model.js';
export function renderEvidencePlots(data,state,language){
const t=(zh,en)=>language.current==='en'?en:zh,W=880,H=300,left=60,right=850,bottom=250,top=28;
const days=data.days,native=data.metadata.marketUnit,x=d3.scalePoint(days.map(d=>d.date),[left+20,right-20]);
function plot(id,label){const root=d3.select('#'+id);root.selectAll('*').remove();return root.append('svg').attr('viewBox','0 0 '+W+' '+H).attr('role','img').attr('aria-label',label);}
function axes(svg,y,formatter,ticks){svg.append('g').attr('transform','translate('+left+',0)').call(d3.axisLeft(y).tickValues(ticks).tickFormat(formatter).tickSize(-(right-left))).call(g=>g.select('.domain').remove());svg.append('g').attr('transform','translate(0,'+bottom+')').call(d3.axisBottom(x).tickFormat(d=>d.slice(5))).call(g=>g.select('.domain').remove());}
const vals=days.flatMap(d=>{const o=leading(d);return[d.actualC,convert(o.low,native,'C'),convert(o.high,native,'C')].filter(v=>v!=null).map(v=>convert(v,'C',state.unit));});
const margin=state.unit==='C'?2:4,extent=d3.extent(vals),y=d3.scaleLinear([extent[0]-margin,extent[1]+margin],[bottom,top]).nice();
const temp=plot('temperature-history',t('九天最高价温度区间与机场观测对照','Nine-day comparison of highest-priced temperature ranges and airport observations'));axes(temp,y,v=>number(v)+'°'+state.unit,y.ticks(5));
days.forEach(d=>{const o=leading(d),a=o.low==null?y.domain()[0]:convert(o.low,native,state.unit),b=o.high==null?y.domain()[1]:convert(o.high,native,state.unit),cx=x(d.date);
const g=temp.append('g');g.append('title').text(d.date+' · '+range(o,native,state.unit)+' · '+number(convert(d.actualC,'C',state.unit))+'°'+state.unit);
g.append('line').attr('x1',cx).attr('x2',cx).attr('y1',y(a)).attr('y2',y(b)).attr('stroke','#167970').attr('stroke-width',7);
for(const edge of [a,b])g.append('line').attr('x1',cx-10).attr('x2',cx+10).attr('y1',y(edge)).attr('y2',y(edge)).attr('stroke','#167970').attr('stroke-width',2);
if(o.low==null||o.high==null)g.append('text').attr('x',cx).attr('y',o.high==null?y(b)+14:y(a)-5).attr('text-anchor','middle').attr('fill','#167970').text(o.high==null?'↑':'↓');
g.append('circle').attr('cx',cx+12).attr('cy',y(convert(d.actualC,'C',state.unit))).attr('r',5).attr('fill','#b34c32');});
const series=cumulative(days,native),rate=d3.scaleLinear([0,1],[bottom,top]),curve=plot('accuracy-history',t('累计严格与宽松命中率','Cumulative strict and tolerant hit rates'));
axes(curve,rate,v=>Math.round(v*100)+'%',[0,.25,.5,.75,1]);
for(const [key,color,dash] of [['strictRate','#167970',null],['tolerantRate','#b34c32','7 5']]){curve.append('path').datum(series).attr('class',key).attr('fill','none').attr('stroke',color).attr('stroke-width',2.5).attr('stroke-dasharray',dash).attr('d',d3.line().x(d=>x(d.day.date)).y(d=>rate(d[key])));curve.selectAll('.'+key+'-point').data(series).join('circle').attr('class',key+'-point').attr('cx',d=>x(d.day.date)).attr('cy',d=>rate(d[key])).attr('r',3.5).attr('fill',color).append('title').text(d=>d.day.date+' · '+Math.round(d[key]*100)+'%');}
curve.append('text').attr('x',left).attr('y',16).attr('fill','#167970').text(t('实线：严格命中','Solid: strict'));
curve.append('text').attr('x',left+240).attr('y',16).attr('fill','#b34c32').text(t('虚线：宽松命中','Dashed: tolerant'));
const last=series.at(-1);document.getElementById('accuracy-summary').textContent=t('九天样本：严格 ','Nine-day sample: strict ')+last.strict+'/'+last.n+' ('+Math.round(last.strictRate*100)+'%) · '+t('宽松 ','tolerant ')+last.tolerant+'/'+last.n+' ('+Math.round(last.tolerantRate*100)+'%)'+t('。不是长期预测准确率。','. Not a measure of long-term forecast accuracy.');
}
