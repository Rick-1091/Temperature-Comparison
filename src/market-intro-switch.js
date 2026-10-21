// Progressive enhancement: both original sections remain readable without JS.
export function initMarketIntroSwitch(language,{rootId='market-definitions',panelIds=['weather-futures-definition','polymarket-definition'],rangeId='market-intro-switch',eventName='wb-market-intro'}={}){
 const root=document.getElementById(rootId);
 if(!root)return;
 const panels=panelIds.map(id=>document.getElementById(id));
 const range=document.getElementById(rangeId),tabs=[...root.querySelectorAll('[data-market-panel]')];
 let active=0,animation;
 const t=(zh,en)=>language.current==='en'?en:zh;
 function labels(){
  range.setAttribute('aria-label',t('左右拖动，切换市场介绍','Drag left or right to switch introductions'));
  range.setAttribute('aria-valuetext',active===0?t('天气期货，CME','Weather futures, CME'):t('事件预测市场，Polymarket','Prediction markets, Polymarket'));
  root.querySelectorAll('[data-label-zh]').forEach(el=>el.setAttribute('aria-label',language.current==='en'?el.dataset.labelEn:el.dataset.labelZh));
 }
 function select(next,{updateURL=true,motion=true}={}){
  const previous=active;active=next===1?1:0;range.value=String(active);
  animation?.cancel();
  panels.forEach((panel,i)=>{panel.hidden=i!==active;panel.inert=i!==active;});
  tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===active));tab.tabIndex=i===active?0:-1;});
  labels();
  if(motion&&previous!==active&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   animation=panels[active].animate([{transform:'translateX('+(active>previous?'10%':'-10%')+')',opacity:.4},{transform:'translateX(0)',opacity:1}],{duration:260,easing:'cubic-bezier(.16,1,.3,1)'});
  }
  if(updateURL){const url=new URL(location.href);url.hash=panels[active].id;history.replaceState(null,'',url);}
  window.dispatchEvent(new CustomEvent(eventName,{detail:active}));
 }
 range.addEventListener('input',()=>select(Number(range.value)));
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>select(i));
  tab.addEventListener('keydown',event=>{
   let next;
   if(event.key==='ArrowRight'||event.key==='End')next=1;
   if(event.key==='ArrowLeft'||event.key==='Home')next=0;
   if(next!==undefined){event.preventDefault();select(next);tabs[next].focus();}
  });
 });
 function fromHash(){
  const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));
  const index=panels.findIndex(panel=>panel===target||panel.contains(target));
  if(index>=0)select(index,{updateURL:false,motion:false});
 }
 window.addEventListener('hashchange',fromHash);
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');if(!link)return;
  const target=document.getElementById(link.hash.slice(1)),index=panels.findIndex(panel=>panel===target||panel.contains(target));
  if(index<0)return;
  event.preventDefault();select(index);
  root.scrollIntoView({block:'start',behavior:'instant'});
  if(root.contains(link))range.focus({preventScroll:true});
 });
 window.addEventListener('wb-language',labels);
 root.classList.add('is-enhanced');select(0,{updateURL:false,motion:false});fromHash();
}
