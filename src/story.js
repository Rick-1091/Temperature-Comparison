import './fonts.js';
import './story.css';
import { stories } from './story-data.js';
import { observations } from './field-observations.js';
import { setupLanguage } from './page-language.js';
const story=stories[document.body.dataset.case],slug=document.body.dataset.case;
const $=s=>document.querySelector(s),bind=(el,pair)=>{el.dataset.zh=pair[0];el.dataset.en=pair[1];};
bind($('#case-title'),story.title);bind($('.story-note'),story.note);
document.body.dataset.titleZh='Weatherbridge · '+story.title[0];document.body.dataset.titleEn='Weatherbridge · '+story.title[1];
bind($('.story-role'),story.role);
const photo=$('#story-image');photo.src='../../'+story.image;
photo.alt=story.alt?.[0]||'锦溪水乡风貌插画。';
story.steps.forEach((step,i)=>{const b=document.createElement('button');bind(b,step[0]);b.onclick=()=>render(i,true);$('.story-steps').append(b);});
bind($('.source-note'),story.source);
if(story.url){const a=document.createElement('a');a.href=story.url;a.textContent='UNDP M-CLIMES ↗';$('.story-sources').append(a);}
$('.finish').href=story.next;bind($('.finish'),story.cta);
if(slug==='jinxi'){
 observations.forEach(o=>{
  const d=document.createElement('details');d.className='field-object';
  const s=document.createElement('summary');bind(s,[o.title[0]+' +',o.title[1]+' +']);d.append(s);
  const f=document.createElement('figure'),img=document.createElement('img');img.src='../../jinxi/assets/'+o.image;img.alt=o.alt[0];img.dataset.altZh=o.alt[0];img.dataset.altEn=o.alt[1];img.loading='lazy';f.append(img);
  if(o.extra){const extra=document.createElement('img');extra.src='../../jinxi/assets/'+o.extra;extra.alt='博物馆中的造船工具与材料展陈';extra.dataset.altZh=extra.alt;extra.dataset.altEn='Museum display of boat-building tools and materials';extra.loading='lazy';f.append(extra);}
  const c=document.createElement('figcaption');bind(c,['团队实地照片 / '+o.who,'Team field photograph / '+o.who]);f.append(c);d.append(f);
  for(const pair of [o.observation,o.context,o.variables]){const p=document.createElement('p');bind(p,pair);d.append(p);}
  $('#field-observations').append(d);
 });
}
let current=0;const language=setupLanguage();
let historicalDay;
if(slug==='mexico-city')fetch('../../signals/data/mexico-unified.json').then(r=>{if(!r.ok)throw Error('Snapshot unavailable');return r.json();}).then(data=>{historicalDay=data.days.find(d=>d.date==='2026-09-23')||data.days[0];if(current===3)render(3);}).catch(()=>{});
// Each caption and alternative text describes the actual displayed asset.
const jinxiImages=[
 ['jinxi-river-wide.png',['锦溪水乡风貌插画。','Illustration of Jinxi’s canals and waterside setting.']],
 ['jinxi/assets/tour-boats.jpg',['实地照片：河道边停泊的有篷游船。','Field photograph: covered tour boats moored by the canal.']],
 ['jinxi/assets/smoked-beans.jpg',['实地照片：店铺门口木盘中的熏豆。','Field photograph: smoked beans displayed in wooden trays outside a shop.']],
 ['jinxi/assets/brick-process.jpg',['实地照片：博物馆展示的传统砖瓦制作工序。','Field photograph: a museum display of traditional brick and tile production.']],
 ['jinxi/assets/canal-coffee.jpg',['实地照片：河道旁的咖啡店与临水空间。','Field photograph: a canal-side café and waterside space.']]
];
function visual(index){
 const wrap=$('#visual-event');wrap.replaceChildren();
 // Keep photographs unobstructed; supporting data belongs below the image.
 $('#visual-caption').after(wrap);
 const [image,caption]=slug==='jinxi'?jinxiImages[index]:[story.image,story.caption];
 bind($('#visual-caption'),caption);photo.dataset.altZh=(story.alt||caption)[0];photo.dataset.altEn=(story.alt||caption)[1];
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
 photo.src='../../'+image;
}
function render(index,focus=false){
 current=index;const step=story.steps[index];bind($('#step-title'),step[1]);bind($('.step-intro'),step[2]);bind($('.step-explanation'),step[3]);
 $('.why').open=false;$('.story-sources').open=false;$('.previous').hidden=index===0;$('.next').hidden=index===4;$('.finish').hidden=index!==4;
 $('.hedging').hidden=slug!=='mexico-city'||index!==4;$('#field-observations').hidden=slug!=='jinxi'||index!==0;
 $('.story-steps').querySelectorAll('button').forEach((b,i)=>{if(i===index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
 visual(index);language.apply();photo.alt=photo.dataset[language.current==='zh'?'altZh':'altEn'];
 if(focus)$('#step-title').focus({preventScroll:true});
}
$('.previous').onclick=()=>render(Math.max(0,current-1),true);$('.next').onclick=()=>render(Math.min(4,current+1),true);render(0);
