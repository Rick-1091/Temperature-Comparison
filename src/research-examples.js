import {initJinxi} from './jinxi-explorer.js';
import {initBusinessMap} from './business-map.js';
import {renderWeatherNetwork} from './weather-network.js';

export function initResearchExamples(language){
  if(document.querySelector('.viewfinder'))initJinxi(language);
  if(document.getElementById('business-map'))initBusinessMap(language);
  const select=document.getElementById('weather-network-place'),host=document.getElementById('weather-network'),summary=document.getElementById('weather-network-summary');
  if(!select||!host||!summary)return;
  const cache=new Map();let generation=0;
  async function render(){
    const token=++generation,place=select.value;host.setAttribute('aria-busy','true');
    try{
      if(!cache.has(place)){
        const response=await fetch('/signals/data/'+place+'-unified.json');
        if(!response.ok)throw Error('Unavailable');
        cache.set(place,await response.json());
      }
      if(token===generation)renderWeatherNetwork(cache.get(place),{place},language);
    }catch{
      if(token===generation){host.replaceChildren();summary.textContent=language.current==='en'?'Observations could not load. Reload to retry.':'观测记录暂时无法加载，请刷新重试。';}
    }finally{if(token===generation)host.setAttribute('aria-busy','false');}
  }
  select.addEventListener('change',render);window.addEventListener('wb-language',render);render();
}
