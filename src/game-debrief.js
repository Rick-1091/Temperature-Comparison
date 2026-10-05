import './game.css';
import {choices,resolveChoice} from './game-model.js';
import {setupLanguage} from './page-language.js';
import {exerciseUrl} from './game-context.js';
const params=new URLSearchParams(location.search),choice=params.get('choice'),weather=params.get('weather'),seen=params.get('seen')==='true';
const names={all:['全部晾晒','Dry all'],batch:['分批晾晒','Split the batch'],cover:['准备遮盖','Prepare a cover'],store:['提前收储','Store early']};
const language=setupLanguage();
function render(){
 const en=language.current==='en',idx=en?1:0,valid=choices.includes(choice)&&['rain','sun'].includes(weather);
 document.getElementById('same-weather-link').href=exerciseUrl('../',language.current,valid?{replay:weather}:{});
 document.getElementById('new-day-link').href=exerciseUrl('../',language.current);
 document.getElementById('history-link').href=exerciseUrl('../../../signals/guide/',language.current);
 document.getElementById('same-weather-link').textContent=valid?(en?'Same weather, another choice →':'同样天气，换个选择 →'):(en?'Enter the courtyard →':'进入庭院 →');
 document.getElementById('decision-comparison').setAttribute('aria-label',en?'Choices under the same weather':'同一场天气下的选择');
 const summary=document.getElementById('result-summary'),reflection=document.getElementById('seen-reflection'),comparison=document.getElementById('decision-comparison');
 if(!valid){summary.textContent=en?'Start a courtyard experience to compare your choice.':'先完成一次庭院体验，再比较你的选择。';reflection.textContent='';comparison.replaceChildren();return;}
 summary.textContent=(en?'Your choice: ':'你的选择：')+names[choice][idx]+' · '+(weather==='rain'?(en?'showers arrived':'阵雨到来'):(en?'it stayed dry':'没有下雨'));
 reflection.textContent=seen?(en?'You checked the information before choosing. Would you prepare differently without it?':'你在选择前查看了信息。没有这些信息，你会不会做不同准备？'):(en?'You chose without checking the panel. What information would you want next time?':'你没有查看信息就做了选择。下次你会想先知道什么？');
 comparison.replaceChildren(...[choice,...choices.filter(c=>c!==choice)].map(c=>{
  const result=resolveChoice(c,weather),article=document.createElement('article'),title=document.createElement('strong'),text=document.createElement('p');
  article.dataset.chosen=String(c===choice);title.textContent=names[c][idx]+(c===choice?(en?' · Your choice':' · 你的选择'):'');
  text.textContent=weather==='rain'?(result.exposed?(c==='batch'?(en?'The outside half remains exposed; the stored half is protected.':'外面的一半仍暴露在雨中；收起的一半受到保护。'):(en?'The maize outside is exposed to rain.':'外面的玉米暴露在雨中。')):(c==='cover'?(en?'The cover reduces direct rain exposure; drying conditions may also change.':'遮盖减少直接淋雨；干燥条件也可能改变。'):(en?'Storage avoids direct rain exposure, while pausing outdoor drying.':'收储避免直接淋雨，同时暂停户外晾晒。'))):(c==='store'?(en?'The maize is protected, but the outdoor drying window is not used.':'玉米受到保护，但没有利用这段户外干燥时间。'):c==='batch'?(en?'Half uses the drying window; half remains stored.':'一半利用干燥时间；一半继续收储。'):c==='cover'?(en?'The maize stays outside under cover; shade and ventilation change drying conditions.':'玉米留在遮盖下；阴影和通风会改变干燥条件。'):(en?'The whole batch uses the outdoor drying window.':'全部玉米利用户外干燥时间。'));
  article.append(title,text);return article;
 }));
}
window.addEventListener('wb-language',render);render();
