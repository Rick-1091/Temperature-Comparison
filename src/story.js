import './fonts.js';
import './story.css';
import { stories } from './story-data.js';
import { observations } from './field-observations.js';
import { setupLanguage } from './page-language.js';
const story=stories[document.body.dataset.case],slug=document.body.dataset.case;
const $=s=>document.querySelector(s),bind=(el,pair)=>{el.dataset.zh=pair[0];el.dataset.en=pair[1];};
bind($('#case-title'),story.title);bind($('.story-note'),story.note);
document.body.dataset.titleZh='Weatherbridge · '+story.title[0];document.body.dataset.titleEn='Weatherbridge · '+story.title[1];
$('.story-role').textContent=story.role;
const photo=$('#story-image');photo.src='../../'+story.image;
photo.alt=story.note[0];
story.steps.forEach((step,i)=>{const b=document.createElement('button');bind(b,step[0]);b.onclick=()=>render(i,true);$('.story-steps').append(b);});
bind($('.source-note'),story.source);
if(story.url){const a=document.createElement('a');a.href=story.url;a.textContent='UNDP M-CLIMES ↗';$('.story-sources').append(a);}
$('.finish').href=story.next;bind($('.finish'),story.cta);
if(slug==='jinxi'){
 observations.forEach(o=>{
  const d=document.createElement('details');d.className='field-object';
  const s=document.createElement('summary');bind(s,[o.title[0]+' +',o.title[1]+' +']);d.append(s);
  const f=document.createElement('figure'),img=document.createElement('img');img.src='../../jinxi/assets/'+o.image;img.alt=o.alt[0];img.loading='lazy';f.append(img);
  if(o.extra){const extra=document.createElement('img');extra.src='../../jinxi/assets/'+o.extra;extra.alt='Boat-building museum display / 造船展陈';extra.loading='lazy';f.append(extra);}
  const c=document.createElement('figcaption');bind(c,['团队实地照片 / '+o.who,'Team field photograph / '+o.who]);f.append(c);d.append(f);
  for(const pair of [o.observation,o.context,o.variables]){const p=document.createElement('p');bind(p,pair);d.append(p);}
  $('#field-observations').append(d);
 });
}
let current=0;const language=setupLanguage();
let historicalDay;
if(slug==='mexico-city')fetch('../../signals/data/mexico-unified.json').then(r=>{if(!r.ok)throw Error('Snapshot unavailable');return r.json();}).then(data=>{historicalDay=data.days.find(d=>d.date==='2026-09-23')||data.days[0];if(current===3)render(3);}).catch(()=>{});
const stages=[
[['人物与活动','People and activity'],['雨与时间窗口','Rain and timing'],['活动 → 变量 → 时间地点','Activity → variable → place and time'],['改期 / 遮盖 / 调整工序','Reschedule / cover / change process'],['看见生活 → 问对问题','See everyday life → ask the right question']],
[['玉米在院子里','Maize in the courtyard'],['天空变暗，雨可能到来','Darkening sky: rain may arrive'],['本地降雨 / 湿度 / 预警','Local rainfall / humidity / warnings'],['继续 / 分批 / 遮盖 / 收储','Continue / split / cover / store'],['需求 → 信息 → 准备','Need → information → preparation']],
[['明天的营业安排','Tomorrow’s opening'],['座位 / 人员 / 备货','Seating / staffing / supplies'],['市场价格分布：示意','Market price distribution: illustrative'],['历史报价 ↔ 机场观测','Historical quotes ↔ airport observations'],['信号 → 经营准备 → 匹配的合约','Signal → preparation → matching contract']]
];
function visual(index){
 const wrap=$('#visual-event');wrap.replaceChildren();
 // Keep photographs unobstructed; supporting data belongs below the image.
 $('#visual-caption').after(wrap);
 const caption=stages[['jinxi','malawi','mexico-city'].indexOf(slug)][index];bind($('#visual-caption'),caption);
 if(index===3&&slug==='mexico-city'){
  wrap.replaceChildren();const panel=document.createElement('div');panel.className='visual-summary';
  if(historicalDay){
   const d=historicalDay,leader=d.outcomes.reduce((a,b)=>a.price>b.price?a:b);
   const range=leader.low==null?'≤'+leader.high:leader.high==null?'≥'+leader.low:leader.low===leader.high?leader.low:leader.low+'–'+leader.high;
   const title=document.createElement('small');title.textContent=d.date+' · NOAA METAR × Polymarket';
   const value=document.createElement('p');bind(value,['最高报价 '+range+'°C → 观测 '+d.actualC+'°C','Top-priced '+range+'°C → observed '+d.actualC+'°C']);
   const a=document.createElement('a');a.href='../../signals/introduction/?location=mexico&day='+d.date;a.dataset.preserveLanguage='';bind(a,['先看怎样读这个报价 →','First, how to read this quote →']);panel.append(title,value,a);
  }else bind(panel,['历史报价 ↔ 机场观测：在下一页核对原始记录','Historical quotes ↔ airport reports: review the records on the next page']);
  wrap.append(panel);
 }
 photo.src='../../'+(slug==='jinxi' ? ['jinxi-river-wide.png','jinxi/assets/tour-boats.jpg','jinxi/assets/smoked-beans.jpg','jinxi/assets/brick-process.jpg','jinxi/assets/canal-coffee.jpg'][index] : story.image);
}
function render(index,focus=false){
 current=index;const step=story.steps[index];bind($('#step-title'),step[1]);bind($('.step-intro'),step[2]);bind($('.step-explanation'),step[3]);
 $('.why').open=false;$('.story-sources').open=false;$('.previous').hidden=index===0;$('.next').hidden=index===4;$('.finish').hidden=index!==4;
 $('.hedging').hidden=slug!=='mexico-city'||index!==4;$('#field-observations').hidden=slug!=='jinxi'||index!==0;
 $('.story-steps').querySelectorAll('button').forEach((b,i)=>{if(i===index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
 visual(index);language.apply();photo.alt=story.note[language.current==='zh'?0:1];
 if(focus)$('#step-title').focus({preventScroll:true});
}
$('.previous').onclick=()=>render(Math.max(0,current-1),true);$('.next').onclick=()=>render(Math.min(4,current+1),true);render(0);
