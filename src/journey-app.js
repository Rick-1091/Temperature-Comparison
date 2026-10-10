import './fonts.js';
import './game.css';
import './journey.css';
import './chapter-explorers.css';
import './intro-market.css';
import {initIntroMarket} from './intro-market.js';
import {initTypographyReveals} from './typography-reveals.js';
import {initJinxi} from './jinxi-explorer.js';
import {initBusinessMap} from './business-map.js';
import {renderEvidencePlots} from './evidence-plots.js';
import {renderWeatherNetwork} from './weather-network.js';
import {setupLanguage} from './page-language.js';
import {initMeaningDialog} from './meaning-dialog.js';
import {convert,number,range,leading,matches} from './evidence-model.js';
const language=setupLanguage(),params=new URLSearchParams(location.search);
initMeaningDialog();
const state={place:params.get('location')==='laguardia'?'laguardia':'mexico',date:params.get('date')||'2026-09-23',unit:params.get('unit')==='F'?'F':'C'};
const cache=new Map(),$=id=>document.getElementById(id),text=(zh,en)=>language.current==='en'?en:zh;
// Fit the explorer to its content: the page, not a nested scroll area, owns scrolling.
const evidenceFrame=$('legacy-evidence-frame');
let explorerSizeObserver;
function fitExplorer(){
  explorerSizeObserver?.disconnect();
  const doc=evidenceFrame.contentDocument,shell=doc?.querySelector('.shell');
  if(!shell)return;
  const fit=()=>{const height=Math.ceil(shell.getBoundingClientRect().bottom+(doc.defaultView.scrollY||0));if(height>0)evidenceFrame.style.height=height+'px';};
  explorerSizeObserver=new ResizeObserver(fit);explorerSizeObserver.observe(shell);
  fit();doc.fonts?.ready.then(fit);
}
evidenceFrame.addEventListener('load',fitExplorer);
initJinxi(language);initBusinessMap(language);
const renderIntroMarket=initIntroMarket(language,()=>state.unit);
let request=0;
async function snapshot(place){if(!cache.has(place))cache.set(place,fetch('/signals/data/'+place+'-unified.json').then(r=>{if(!r.ok)throw Error('Snapshot unavailable');return r.json();}));return cache.get(place);}
function pair(day,meta){return '<div><p>'+text('市场最高价区间','Highest-priced market range')+'</p><strong>'+range(leading(day),meta.marketUnit,state.unit)+'</strong></div><div><p>'+text('当天观测最高值','Highest reported temperature')+'</p><strong>'+number(convert(day.actualC,'C',state.unit))+'°'+state.unit+'</strong></div>';}
async function render(){const token=++request;try{const data=await snapshot(state.place);if(token!==request)return;const day=data.days.find(d=>d.date===state.date)||data.days[4],meta=data.metadata;state.date=day.date;
$('place').value=state.place;$('unit').value=state.unit;$('date').innerHTML=data.days.map(d=>'<option value="'+d.date+'">'+d.date+'</option>').join('');$('date').value=state.date;
const sourceLink=document.querySelector('#evidence a[href*="research"]');sourceLink.href='/research/?location='+state.place+'&date='+state.date+'&lang='+language.current;
$('evidence-date').textContent=(state.place==='mexico'?text('墨西哥城','Mexico City'):text('纽约','New York'))+' · '+meta.station+' · '+day.date;
// Reuse the original chart renderer and dataset instead of recreating its five views.
const explorer=new URL('/signals/explore/',location.href);
for(const [key,value] of Object.entries({location:state.place,day:state.date,unit:state.unit,lang:language.current}))explorer.searchParams.set(key,value);
explorer.searchParams.set('embed','true');explorer.searchParams.set('view','heatmap');
const frame=$('legacy-evidence-frame');
if(frame.src!==explorer.href)frame.src=explorer.href;
frame.title=text('对比市场判断与实际气温','Compare market expectations with observed temperatures');
$('evidence-values').innerHTML=pair(day,meta);
$('evidence-verdict').textContent=matches(day,meta.marketUnit)?text('这一天，观测落在最高价区间内。','On this day, the observation fell inside the highest-priced range.'):text('这一天，观测没有落进最高价区间。','On this day, the observation fell outside the highest-priced range.');
const top=leading(day);$('price-distribution').innerHTML=day.outcomes.map(o=>'<div class="price-row" data-top="'+(o===top)+'"><span>'+range(o,meta.marketUnit,state.unit)+'</span><div class="price-track"><div class="price-fill" style="width:'+o.price/top.price*100+'%"></div></div><strong>'+Number((o.price*100).toFixed(2))+'¢</strong></div>').join('');
renderEvidencePlots(data,state,language,date=>{state.date=date;update();});
renderWeatherNetwork(data,state,language);
}catch(e){if(token!==request)return;$('evidence-date').textContent=text('历史数据暂时无法读取。请刷新页面，或进入研究与数据查看原始来源。','Historical data could not be loaded. Reload or check the original sources in Research & Data.');}}
function update(){const url=new URL(location.href);url.searchParams.set('location',state.place);url.searchParams.set('date',state.date);url.searchParams.set('unit',state.unit);history.replaceState(null,'',url);renderIntroMarket();render();}
['place','date','unit'].forEach(id=>$(id).addEventListener('change',()=>{state[id]=$(id).value;update();}));
window.addEventListener('wb-language',render);
render();
initTypographyReveals();
// Three.js is loaded only when the reader reaches the exercise, not on the cover.
const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();import('./game.js').catch(()=>{$('game-status').textContent=text('练习暂时无法加载，请刷新重试。','The exercise could not load. Please refresh.');});}},{rootMargin:'200px'});
observer.observe($('action'));
// Direct exercise links must not depend on where late-loading images leave the viewport.
if(location.hash==='#action'||(params.has('choice')&&params.has('weather'))){observer.disconnect();import('./game.js');}
