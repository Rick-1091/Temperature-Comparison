import './fonts.js';
import './game.css';
import {drawWeather,resolveChoice} from './game-model.js';
import {setupLanguage} from './page-language.js';
const $=id=>document.getElementById(id);
let stage='start',choice=null,weather=null,seen=false,scene=null,textOnly=false,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,generation=0;
const messages={
 start:['今天的玉米正在晾晒。先看看庭院。','Today’s maize is drying. Take a look around.'],
 loading:['庭院加载中…','Loading the courtyard…'],
 first:['天气还不确定。你想先做什么？','The weather is uncertain. What will you do first?'],
 information:['有了信息，也仍然存在两种可能。','Information is available. Both outcomes remain possible.'],
 prepared:['准备已改变，天气还未揭晓。','Your preparation has changed. The weather is not revealed yet.'],
 rain:['阵雨来了。看看哪些玉米仍暴露在外。','Showers arrived. Look at which maize remains exposed.'],
 sun:['没有下雨。看看晾晒机会与收储的取舍。','It stayed dry. Compare drying opportunity with protected storage.']
};
const choiceNames={all:['全部晾晒','dry all'],batch:['分批晾晒','split the batch'],cover:['准备遮盖','prepare a cover'],store:['提前收储','store early']};
function sync(){
 const lang=language.current;
 $('game-status').textContent=messages[stage][lang==='en'?1:0];
 if(choice)$('game-status').textContent=(lang==='en'?'Chosen: ':'已选择：')+choiceNames[choice][lang==='en'?1:0]+'。 '+$('game-status').textContent;
 $('scene').setAttribute('aria-label',lang==='en'?'3D courtyard: house, drying rack, maize, cover, storage and character':'3D 庭院：房屋、晾晒架、玉米、遮盖、储物箱与人物');
 for(const [id,visible] of Object.entries({'start-game':stage==='start','first-choice':stage==='first','weather-panel':stage==='information','second-choice':stage==='information','weather-choice':stage==='prepared','result-choice':['rain','sun'].includes(stage)}))$(id).hidden=!visible;
 $('start-game').disabled=stage==='loading';
 $('pause-motion').textContent=lang==='en'?(paused?'Resume animation':'Pause animation'):(paused?'继续动画':'暂停动画');
 $('fallback-note').hidden=!textOnly;
 if(choice&&['rain','sun'].includes(stage))$('debrief-link').href='debrief/?'+new URLSearchParams({choice,weather,seen:String(seen),lang});
}
const language=setupLanguage();
window.addEventListener('wb-language',sync);
async function start(){
 const token=++generation;stage='loading';sync();weather=drawWeather();
 if(!textOnly)try{
  const {createCourtyard}=await import('./game-scene.js');
  if(token!==generation)return;
  scene=createCourtyard($('scene'));scene.setPaused(paused);
 }catch(e){if(token!==generation)return;textOnly=true;showPoster();}
 stage='first';sync();$('first-choice').querySelector('button').focus();
}
function showPoster(){
 scene?.dispose();scene=null;
 $('scene').innerHTML='<img class="game-poster" src="../../thoko-family.png" alt="'+(language.current==='en'?'Illustrated fictional household':'虚构家庭插画')+'">';
}
function prepare(next){choice=next;resolveChoice(next,weather);scene?.update(next);stage='prepared';sync();$('reveal-weather').focus();}
$('start-game').addEventListener('click',start);
document.querySelectorAll('[data-first]').forEach(b=>b.addEventListener('click',()=>{
 if(b.dataset.first==='information'){seen=true;stage='information';sync();$('second-choice').querySelector('button').focus();}
 else prepare(b.dataset.first);
}));
document.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>prepare(b.dataset.choice)));
$('reveal-weather').addEventListener('click',()=>{scene?.update(choice,weather);stage=weather;sync();$('debrief-link').focus();});
$('pause-motion').addEventListener('click',()=>{paused=!paused;scene?.setPaused(paused);sync();});
$('text-mode').addEventListener('click',()=>{++generation;textOnly=true;showPoster();if(stage==='loading')stage='first';sync();});
$('scene').addEventListener('scene-lost',()=>{textOnly=true;showPoster();sync();});
$('restart-game').addEventListener('click',()=>{++generation;showPoster();textOnly=false;choice=weather=null;seen=false;stage='start';sync();$('start-game').focus();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{paused=e.matches;scene?.setPaused(paused);sync();});
window.addEventListener('pagehide',()=>scene?.dispose());
sync();
