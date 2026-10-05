import './fonts.js';
import './game.css';
import './journey.css';
import './chapter-explorers.css';
import {initJinxi} from './jinxi-explorer.js';
import {initBusinessMap} from './business-map.js';
import {renderEvidencePlots} from './evidence-plots.js';
import {setupLanguage} from './page-language.js';
import {convert,number,range,leading,matches} from './evidence-model.js';
const language=setupLanguage(),params=new URLSearchParams(location.search);
const state={place:params.get('location')==='laguardia'?'laguardia':'mexico',date:params.get('date')||'2026-09-23',unit:params.get('unit')==='F'?'F':'C'};
const cache=new Map(),$=id=>document.getElementById(id),text=(zh,en)=>language.current==='en'?en:zh;
initJinxi(language);initBusinessMap(language);
let request=0;
async function snapshot(place){if(!cache.has(place))cache.set(place,fetch('/signals/data/'+place+'-unified.json').then(r=>{if(!r.ok)throw Error('Snapshot unavailable');return r.json();}));return cache.get(place);}
function pair(day,meta){return '<div><p>'+text('市场最高价区间','Highest-priced market range')+'</p><strong>'+range(leading(day),meta.marketUnit,state.unit)+'</strong></div><div><p>'+text('当天观测最高值','Highest reported temperature')+'</p><strong>'+number(convert(day.actualC,'C',state.unit))+'°'+state.unit+'</strong></div>';}
async function render(){const token=++request;try{const data=await snapshot(state.place);if(token!==request)return;const day=data.days.find(d=>d.date===state.date)||data.days[4],meta=data.metadata;state.date=day.date;
$('place').value=state.place;$('unit').value=state.unit;$('date').innerHTML=data.days.map(d=>'<option value="'+d.date+'">'+d.date+'</option>').join('');$('date').value=state.date;
const sourceLink=document.querySelector('#evidence a[href*="research"]');sourceLink.href='/research/?location='+state.place+'&date='+state.date+'&lang='+language.current;
$('evidence-date').textContent=(state.place==='mexico'?text('墨西哥城','Mexico City'):text('纽约','New York'))+' · '+meta.station+' · '+day.date;
$('evidence-values').innerHTML=pair(day,meta);
$('evidence-verdict').textContent=matches(day,meta.marketUnit)?text('这一天，观测落在最高价区间内。','On this day, the observation fell inside the highest-priced range.'):text('这一天，观测没有落进最高价区间。','On this day, the observation fell outside the highest-priced range.');
const top=leading(day);$('price-distribution').innerHTML=day.outcomes.map(o=>'<div class="price-row" data-top="'+(o===top)+'"><span>'+range(o,meta.marketUnit,state.unit)+'</span><div class="price-track"><div class="price-fill" style="width:'+o.price/top.price*100+'%"></div></div><strong>'+Number((o.price*100).toFixed(2))+'¢</strong></div>').join('');
$('nine-days').innerHTML=data.days.map(d=>'<button data-date="'+d.date+'" aria-pressed="'+(d.date===state.date)+'" aria-label="'+d.date+' '+text('查看对照','View comparison')+'"><span>'+d.date.slice(5)+'</span><small>'+range(leading(d),meta.marketUnit,state.unit)+'</small><b class="'+(matches(d,meta.marketUnit)?'':'miss')+'">'+(matches(d,meta.marketUnit)?'✓':'×')+'</b></button>').join('');
$('sample-summary').textContent=text('✓ 观测落在最高价区间内；× 没有落在区间内。九天中有 ','✓ Inside the highest-priced range; × outside. Inside on ')+data.days.filter(d=>matches(d,meta.marketUnit)).length+text(' 天落在区间内。这里只比较历史记录。',' of nine days. This describes historical records only.');
renderEvidencePlots(data,state,language);
const hero=await snapshot('mexico');if(token!==request)return;const hd=hero.days[4],ht=leading(hd);document.querySelector('.preview-pair').innerHTML=pair(hd,hero.metadata);document.querySelector('.mini-bars').innerHTML=hd.outcomes.map(o=>'<i style="height:'+Math.max(2,o.price/ht.price*100)+'%"></i>').join('');
}catch(e){if(token!==request)return;$('evidence-date').textContent=text('历史数据暂时无法读取。请刷新页面，或进入研究与数据查看原始来源。','Historical data could not be loaded. Reload or check the original sources in Research & Data.');}}
function update(){const url=new URL(location.href);url.searchParams.set('location',state.place);url.searchParams.set('date',state.date);url.searchParams.set('unit',state.unit);history.replaceState(null,'',url);render();}
['place','date','unit'].forEach(id=>$(id).addEventListener('change',()=>{state[id]=$(id).value;update();}));
$('nine-days').addEventListener('click',e=>{const b=e.target.closest('[data-date]');if(!b)return;state.date=b.dataset.date;update();$('evidence-date').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});});
window.addEventListener('wb-language',render);
render();
// Three.js is loaded only when the reader reaches the exercise, not on the cover.
const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();import('./game.js').catch(()=>{$('game-status').textContent=text('练习暂时无法加载，请刷新重试。','The exercise could not load. Please refresh.');});}},{rootMargin:'200px'});
observer.observe($('action'));
// Direct exercise links must not depend on where late-loading images leave the viewport.
if(location.hash==='#action'||(params.has('choice')&&params.has('weather'))){observer.disconnect();import('./game.js');}
