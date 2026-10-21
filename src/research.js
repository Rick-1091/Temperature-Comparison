import './fonts.js';import './journey.css';import './chapter-explorers.css';import './remediation.css';import {initResearchExamples} from './research-examples.js';import {setupLanguage} from './page-language.js';
const language=setupLanguage(),$=id=>document.getElementById(id),t=(zh,en)=>language.current==='en'?en:zh,params=new URLSearchParams(location.search);let place=params.get('location')==='laguardia'?'laguardia':'mexico',date=params.get('date')||'2026-09-23',generation=0;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(url,label)=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">'+label+' ↗</a>';
const fact=(label,value)=>'<div><dt>'+label+'</dt><dd>'+value+'</dd></div>';
async function render(){const token=++generation;try{const r=await fetch('/signals/data/'+place+'-unified.json');if(!r.ok)throw Error('Data unavailable');const data=await r.json();if(token!==generation)return;const d=data.days.find(x=>x.date===date)||data.days[4];date=d.date;$('source-place').value=place;$('source-date').innerHTML=data.days.map(x=>'<option>'+x.date+'</option>').join('');$('source-date').value=date;
$('source-record').innerHTML='<h3>'+esc(data.metadata.station)+' · '+d.date+'</h3><dl class="reading-facts">'+
fact(t('报告数量','Reports'),esc(d.observationCount)+t(' 条',' reports'))+
fact(t('覆盖当地小时','Distinct local hours'),esc(d.hourCoverage)+t(' 小时',' hours'))+
fact(t('当地时区','Local timezone'),esc(data.metadata.timezone))+
fact(t('采样截止（UTC）','Snapshot cutoff (UTC)'),esc(d.snapshotAt))+
fact(t('观测时段（UTC）','Observation span (UTC)'),esc(d.firstObservation)+'<br> → '+esc(d.lastObservation))+
'</dl><p>'+link(d.marketUrl,t('当天的 Polymarket 市场','Polymarket market for this day'))+'</p><details><summary>'+t('原始数据与逐区间报价时间','Raw data and per-range quote times')+'</summary><ul class="reading-list">'+
['<li>'+link(data.metadata.observationUrl,'NOAA / AviationWeather METAR')+'</li>','<li>'+link(d.eventApiUrl,'Polymarket Gamma API')+'</li>','<li>'+link(d.resolutionSource,t('市场指定的结算来源','Market-designated settlement source'))+'</li>','<li>'+link('/signals/data/'+place+'-unified.json',t('已保存的完整历史快照 JSON','Saved full historical snapshot JSON'))+'</li>'].join('')+'</ul><p class="reading-note">'+t('实时 API 可能已无法重取这段历史；请使用保存的快照复现。','Live APIs may no longer return this historical window; use the saved snapshot to reproduce it.')+'</p><div class="reading-table-wrap" tabindex="0" role="region" aria-label="'+t('逐区间报价，窄屏可横向滚动','Per-range quotes; scroll horizontally on narrow screens')+'"><table class="reading-table quotes-table"><caption>'+t('各档历史报价 · 时间均为 UTC','Historical quotes by range · all times UTC')+'</caption><thead><tr><th scope="col">'+t('温度区间','Temperature range')+'</th><th scope="col">'+t('每份价格（美元）','Unit price (USD)')+'</th><th scope="col">'+t('报价时间','Quote time')+'</th><th scope="col">'+t('记录','Record')+'</th></tr></thead><tbody>'+d.outcomes.map(o=>'<tr><th scope="row">'+esc(o.label)+'</th><td class="number">'+Number(o.price).toLocaleString('en',{maximumFractionDigits:4})+'</td><td>'+esc(o.quotedAt)+'</td><td>'+link(o.historyUrl,'CLOB')+'</td></tr>').join('')+'</tbody></table></div></details>';
}catch(e){$('source-record').textContent=t('数据暂时无法读取，请刷新重试。','Data could not load. Please refresh.');}}
$('source-place').addEventListener('change',()=>{place=$('source-place').value;render();});$('source-date').addEventListener('change',()=>{date=$('source-date').value;render();});window.addEventListener('wb-language',render);render();


initResearchExamples(language);
