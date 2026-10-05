import * as d3 from 'd3';
import {HISTORICAL,PLACES,DISTRICTS,GREEN_AREAS,STREETS,CORRIDORS,MAP_EXTENT,categoryById,activityMeans} from './data.js';
// Reuse the previous deterministic teaching dataset; never mix it with real evidence snapshots.
export function initBusinessMap(language){
const $=id=>document.getElementById(id),t=(zh,en)=>language.current==='en'?en:zh;
let dateIndex=54,weather='all',place=PLACES.find(p=>p.id==='C01');
const labels={cafe:['户外小店','Outdoor business'],cowork:['室内办公','Indoor work'],park:['公园活动','Park activity'],cultural:['室内休闲','Indoor leisure']};
const weatherLabels={all:['所选日期','Selected date'],sunny:['晴天','Sunny'],rainy:['雨天','Rainy'],hot:['高温','Hot'],cool:['凉爽','Cool'],windy:['有风','Windy']};
const W=880,H=498,px=([lon,lat])=>[(lon-MAP_EXTENT.lon[0])/(MAP_EXTENT.lon[1]-MAP_EXTENT.lon[0])*W,(MAP_EXTENT.lat[1]-lat)/(MAP_EXTENT.lat[1]-MAP_EXTENT.lat[0])*H],path=(pts,close=false)=>'M'+pts.map(p=>px(p).join(',')).join('L')+(close?'Z':'');
const svg=d3.select('#business-map').append('svg').attr('viewBox','0 0 '+W+' '+H).attr('role','group');
svg.selectAll('.map-green').data(GREEN_AREAS).join('path').attr('class','map-green').attr('d',d=>path(d.poly,true));
svg.selectAll('.map-district').data(DISTRICTS).join('path').attr('class','map-district').attr('d',d=>path(d.poly,true));
svg.selectAll('.map-street').data(STREETS).join('path').attr('class','map-street').attr('d',d=>path(d.pts));
svg.selectAll('.map-label').data(DISTRICTS).join('text').attr('class','map-label').attr('x',d=>px(d.label)[0]).attr('y',d=>px(d.label)[1]).attr('text-anchor','middle').text(d=>d.name);
svg.selectAll('.map-corridor').data(CORRIDORS).join('path').attr('class','map-corridor').attr('d',d=>path(d.pts));
const points=svg.selectAll('.business-point').data(PLACES).join('g').attr('class','business-point').attr('transform',d=>'translate('+px(d.ll)+')').attr('tabindex',0).attr('role','button');
points.append('circle').attr('class','point-touch').attr('r',20).attr('fill','transparent');
points.append('circle').attr('class','point-value').attr('fill',d=>categoryById[d.cat].color);
points.append('circle').attr('r',3).attr('fill','#fff');
points.on('click',(_,p)=>{place=p;render();}).on('keydown',(e,p)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();place=p;render();}});
const km=1/(111.32*Math.cos(19.42*Math.PI/180))/(MAP_EXTENT.lon[1]-MAP_EXTENT.lon[0])*W;
svg.append('path').attr('d','M'+(W-30-km)+','+(H-25)+'h'+km).attr('stroke','#163e38');
svg.append('text').attr('x',W-30-km/2).attr('y',H-32).attr('text-anchor','middle').text('1 km');
svg.append('text').attr('x',W-25).attr('y',25).text('N ↑');
function render(){
const day=HISTORICAL[dateIndex],days=weather==='all'?[day]:HISTORICAL.filter(d=>d.tags.includes(weather)),means=activityMeans(days),activity=categoryById[place.cat].activity;
$('business-weather').innerHTML=Object.entries(weatherLabels).map(([id,p])=>'<option value="'+id+'">'+t(...p)+'</option>').join('');$('business-weather').value=weather;
$('business-date').textContent=day.date;$('business-day').disabled=weather!=='all';
points.attr('aria-label',d=>t(...labels[d.cat])+' '+d.id+' · '+d.area).attr('aria-pressed',d=>String(d.id===place.id));
points.select('.point-value').attr('r',d=>means[categoryById[d.cat].activity]?.mean==null?4:5+Math.sqrt(means[categoryById[d.cat].activity].mean)*17).attr('stroke',d=>d.id===place.id?'#163e38':'none').attr('stroke-width',3);
$('business-selection').textContent=t(...labels[place.cat])+' · '+place.id;
$('business-context').textContent=place.area+' · '+(weather==='all'?day.date+' · '+t('模拟天气：','Simulated weather: ')+(day.actual==null?t('温度缺失','temperature missing'):day.actual+'°C')+' · '+day.precip+t(' mm 降雨',' mm rain'): t(...weatherLabels[weather])+' · '+days.length+t(' 个模拟日期',' simulated dates'));
const v=means[activity]?.mean;
$('business-reading').textContent=v==null?t('该样本缺少活动数值，不能据此判断。','Activity data is missing in this sample; no inference is shown.'):t('模拟活动指数：','Simulated activity index: ')+v.toFixed(2)+' / 1';
$('business-advice').textContent=v==null?t('换一个日期或天气类型继续比较。','Try another date or weather type.'):categoryById[place.cat].indoor?t('模型提示：关注室内需求变化，再调整人手与备货。','Model implication: consider changes in indoor demand when planning staffing and stock.'):v<.4?t('模型提示：户外活动较弱，可考虑缩减露天安排，保留室内或遮雨方案。','Model implication: weaker outdoor activity suggests considering fewer outdoor arrangements and keeping indoor or sheltered options.'):t('模型提示：户外活动较活跃，可考虑座位、人手与备货需求；不要只凭这一指标扩大投入。','Model implication: stronger outdoor activity suggests checking seating, staffing and stock needs—not expanding spending based on this index alone.');
$('business-legend').textContent=t('圆越大，模拟活动指数越高。棕：户外小店 · 蓝：室内办公 · 绿：公园 · 紫：室内休闲。','Larger circles mean a higher simulated activity index. Brown: outdoor business · blue: indoor work · green: park · purple: indoor leisure.');
const plot=d3.select('#business-timeline');plot.selectAll('*').remove();const p=plot.append('svg').attr('viewBox','0 0 880 190').attr('role','img').attr('aria-label',t('模拟活动指数时间曲线','Simulated activity index over time'));
const x=d3.scaleLinear([0,54],[48,856]),y=d3.scaleLinear([0,1],[148,15]);
p.append('g').attr('transform','translate(48,0)').call(d3.axisLeft(y).tickValues([0,.5,1]).tickSize(-808)).call(g=>g.select('.domain').remove());
p.append('g').attr('transform','translate(0,148)').call(d3.axisBottom(x).tickValues([0,14,28,42,54]).tickFormat(i=>HISTORICAL[i].date.slice(5))).call(g=>g.select('.domain').remove());
p.append('path').datum(HISTORICAL).attr('class','activity-line').attr('fill','none').attr('stroke','#167970').attr('stroke-width',2.5).attr('d',d3.line().defined(d=>d.activity?.[activity]!=null).x((d,i)=>x(i)).y(d=>y(d.activity[activity])));
if(day.activity?.[activity]!=null)p.append('circle').attr('cx',x(dateIndex)).attr('cy',y(day.activity[activity])).attr('r',5).attr('fill','#b34c32');
}
$('business-day').addEventListener('input',e=>{dateIndex=+e.target.value;render();});$('business-weather').addEventListener('change',e=>{weather=e.target.value;render();});
window.addEventListener('wb-language',render);render();
}
