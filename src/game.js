import './fonts.js';
import './game.css';
import {drawWeather,resolveChoice} from './game-model.js';
import {setupLanguage} from './page-language.js';
import {exerciseUrl} from './game-context.js';
const inline=document.body.classList.contains('journey');
const params=new URLSearchParams(location.search);
let replay=['rain','sun'].includes(params.get('replay'))?params.get('replay'):null;
const $=id=>document.getElementById(id);
let stage='start',choice=null,weather=null,seen=false,scene=null,textOnly=false,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,generation=0;
const messages={
 start:['今天的玉米正在晾晒。先看看庭院。','Today’s maize is drying. Take a look around.'],
 loading:['庭院加载中…','Loading the courtyard…'],
 first:['天气还不确定。你想先做什么？','The weather is uncertain. What will you do first?'],
 information:['看完天气信息，再选择怎样处理玉米。','Review the weather information, then choose what to do with the maize.'],
 prepared:['接下来看看是否下雨。','Now see whether it rains.'],
 rain:['阵雨来了。看看哪些玉米仍暴露在外。','Showers arrived. Look at which maize remains exposed.'],
 sun:['没有下雨。看看晾晒机会与收储的取舍。','It stayed dry. Compare drying opportunity with protected storage.']
};
const choiceNames={all:['全部晾晒','dry all'],batch:['分批晾晒','split the batch'],cover:['准备遮盖','prepare a cover'],store:['提前收储','store early']};
function sync(){
 const lang=language.current;
 if(inline&&!['rain','sun'].includes(stage))$('inline-review').textContent=lang==='en'?'Complete the exercise above to compare your choice with three alternatives.':'完成上面的练习，这里会对照你的选择与另外三种准备。';
 const en=lang==='en',result=['rain','sun'].includes(stage);
 $('scene').setAttribute('aria-busy',String(stage==='loading'));
 $('game-handoff').hidden=!params.has('location');
 if(!inline)document.querySelector('.wb-breadcrumb a').href=exerciseUrl('../../signals/guide/',lang);
 document.querySelector('.game-progress').setAttribute('aria-label',en?'Exercise progress':'练习进度');
 $('weather-panel').setAttribute('aria-label',en?'Weatherbridge teaching information':'Weatherbridge 教学信息');
 const active=result?'review':stage==='prepared'?'weather':'prepare';
 document.querySelectorAll('[data-stage]').forEach(el=>{if(el.dataset.stage===active)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
 $('choice-consequence').textContent=result?consequence(choice,weather,en):'';
 $('game-status').textContent=messages[stage][lang==='en'?1:0];
 if(replay&&!result)$('game-status').textContent=(en?'Replay: the weather is already known — ':'再次比较：已知这一天')+(replay==='rain'?(en?'showers. ':'会下雨。 '):(en?'stayed dry. ':'没有下雨。 '))+$('game-status').textContent;
 if(choice)$('game-status').textContent=(lang==='en'?'Chosen: ':'已选择：')+choiceNames[choice][lang==='en'?1:0]+'。 '+$('game-status').textContent;
 $('scene').setAttribute('aria-label',lang==='en'?'3D courtyard: house, drying rack, maize, cover, storage and character':'3D 庭院：房屋、晾晒架、玉米、遮盖、储物箱与人物');
 for(const [id,visible] of Object.entries({'start-game':stage==='start'||stage==='loading','first-choice':stage==='first','weather-panel':stage==='information','second-choice':stage==='information','weather-choice':stage==='prepared','result-choice':['rain','sun'].includes(stage)}))$(id).hidden=!visible;
 $('start-game').disabled=stage==='loading';
 if(stage==='loading')$('start-game').textContent=en?'Loading the courtyard…':'庭院加载中…';
 else $('start-game').textContent=en?'Enter the courtyard →':'进入庭院 →';
 $('text-mode').disabled=textOnly;
 $('pause-motion').hidden=textOnly;
 $('pause-motion').textContent=lang==='en'?(paused?'Resume animation':'Pause animation'):(paused?'继续动画':'暂停动画');
 $('fallback-note').hidden=!textOnly;
 if(choice&&result){if(inline){$('debrief-link').href='#reflection';renderReview();}else $('debrief-link').href=exerciseUrl('debrief/',lang,{choice,weather,seen});}
}
const language=setupLanguage();
window.addEventListener('wb-language',sync);
async function start(){
 const token=++generation;stage='loading';sync();weather=replay||drawWeather();
 if(!textOnly)try{
  const {createCourtyard}=await import('./game-scene.js');
  if(token!==generation)return;
  scene=createCourtyard($('scene'));scene.setPaused(paused);
 }catch(e){if(token!==generation)return;textOnly=true;showPoster();}
 stage='first';sync();focusStatus();
}
function showPoster(){
 scene?.dispose();scene=null;
 $('scene').innerHTML='<img class="game-poster" src="/thoko-family.png" data-alt-zh="Thoko 一家在庭院晾晒玉米的情景插画" data-alt-en="Illustration of Thoko’s household drying maize in the courtyard" alt="'+(language.current==='en'?'Illustrated fictional household':'虚构家庭插画')+'">';
}
function prepare(next){choice=next;resolveChoice(next,weather);scene?.update(next);stage='prepared';sync();focusStatus();}
$('start-game').addEventListener('click',start);
document.querySelectorAll('[data-first]').forEach(b=>b.addEventListener('click',()=>{
 if(b.dataset.first==='information'){seen=true;stage='information';sync();focusStatus();}
 else prepare(b.dataset.first);
}));
document.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>prepare(b.dataset.choice)));
$('reveal-weather').addEventListener('click',()=>{scene?.update(choice,weather);stage=weather;sync();focusStatus();});
$('pause-motion').addEventListener('click',()=>{paused=!paused;scene?.setPaused(paused);sync();});
$('text-mode').addEventListener('click',()=>{++generation;textOnly=true;showPoster();if(stage==='loading')stage='first';sync();});
$('scene').addEventListener('scene-lost',()=>{textOnly=true;showPoster();sync();});
$('restart-game').addEventListener('click',()=>{++generation;showPoster();textOnly=false;replay=null;const url=new URL(location.href);url.searchParams.delete('replay');history.replaceState(null,'',url);choice=weather=null;seen=false;stage='start';sync();$('start-game').focus();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{paused=e.matches;scene?.setPaused(paused);sync();});
window.addEventListener('pagehide',e=>{if(!e.persisted)scene?.dispose();});
$('change-choice').addEventListener('click',()=>{seen=true;choice=null;scene?.update('all');stage='information';sync();focusStatus();});
function focusStatus(){
 const status=$('game-status');status.focus({preventScroll:true});
 const rect=status.getBoundingClientRect();
 if(rect.top<0||rect.bottom>innerHeight)status.scrollIntoView({block:'nearest',behavior:paused?'auto':'smooth'});
}
function renderReview(){
 const en=language.current==='en',names={all:['全部晾晒','Dry all'],batch:['分批晾晒','Split the batch'],cover:['准备遮盖','Prepare a cover'],store:['提前收储','Store early']};
 const ordered=[choice,...Object.keys(names).filter(c=>c!==choice)];
 $('inline-review').innerHTML='<p class="review-weather">'+(weather==='rain'?(en?'Showers arrived.':'阵雨来了。'):(en?'It stayed dry.':'没有下雨。'))+'</p>'+ordered.map(c=>'<div class="review-row '+(c===choice?'selected':'')+'"><strong>'+names[c][en?1:0]+(c===choice?(en?' · Your choice':' · 你的选择'):'')+'</strong><p>'+consequence(c,weather,en)+'</p></div>').join('');
}
function consequence(c,w,en){
 const rain={all:['外面的玉米暴露在雨中。','The maize outside is exposed to rain.'],batch:['外面的一半淋雨，收起的一半受到保护。','The outside half is exposed; the stored half is protected.'],cover:['遮盖减少直接淋雨，也改变了干燥条件。','The cover reduces direct rain exposure and changes drying conditions.'],store:['玉米避免直接淋雨，户外晾晒也暂停了。','Storage avoids direct rain exposure while pausing outdoor drying.']};
 const dry={all:['全部玉米可以继续在外面晾晒。','The whole batch can keep drying outside.'],batch:['一半继续晾晒，一半留在储物处。','Half keeps drying; half remains stored.'],cover:['玉米留在遮盖下，遮阴和通风改变了干燥条件。','The maize stays under cover; shade and ventilation change drying conditions.'],store:['玉米留在储物处，没有利用这段户外晾晒时间。','The maize stays stored, so this outdoor drying window is not used.']};
 return (w==='rain'?rain:dry)[c][en?1:0];
}
if(inline&&['all','batch','cover','store'].includes(params.get('choice'))&&['rain','sun'].includes(params.get('weather'))){choice=params.get('choice');weather=params.get('weather');seen=params.get('seen')==='true';stage=weather;}
sync();
if(inline){
 const startObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){startObserver.disconnect();if(stage==='start')start();}},{threshold:0});startObserver.observe($('action'));
 const visibility=new IntersectionObserver(entries=>{scene?.setPaused(paused||!entries[0].isIntersecting);});visibility.observe($('action'));
}
