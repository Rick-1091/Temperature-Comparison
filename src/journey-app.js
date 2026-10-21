import './fonts.js';
import './game.css';
import './journey.css';
import './chapter-explorers.css';
import './intro-market.css';
import './remediation.css';
import {setupLanguage} from './page-language.js';
import {initMeaningDialog} from './meaning-dialog.js';
import {renderSimulationReference} from './simulation-reference.js';
import {initMarketComparison} from './market-comparison.js';
import {initResearchExamples} from './research-examples.js';
import {initIntroMarket} from './intro-market.js';
import {initMarketStoryboards} from './market-storyboards.js';
import {initMarketIntroSwitch} from './market-intro-switch.js';

const language=setupLanguage(),params=new URLSearchParams(location.search);
initMarketStoryboards(language);
initMarketComparison(language);
initResearchExamples(language);
initIntroMarket(language,()=>params.get('unit')==='F'?'F':'C');
initMarketIntroSwitch(language);
initMarketIntroSwitch(language,{rootId:'market-stories',panelIds:['futures-storyboard','prediction-storyboard'],rangeId:'market-story-switch',eventName:'wb-market-story'});
initMeaningDialog();
renderSimulationReference(params.get('scenario'));
window.addEventListener('wb-language',()=>renderSimulationReference());
const $=id=>document.getElementById(id),t=(zh,en)=>language.current==='en'?en:zh;
function historyLink(){
 const url=new URL('/signals/explore/',location.href);
 for(const [key,value] of Object.entries({location:params.get('location')==='laguardia'?'laguardia':'mexico',day:params.get('date')||params.get('day')||'2026-09-23',unit:params.get('unit')==='F'?'F':'C',lang:language.current}))url.searchParams.set(key,value);
 $('historical-explore-link').href=url.href;
}
historyLink();window.addEventListener('wb-language',historyLink);
const loadGame=()=>import('./game.js').catch(()=>{$('game-status').textContent=t('练习暂时无法加载，请刷新重试。','The exercise could not load. Please refresh.');});
const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();loadGame();}},{rootMargin:'200px'});
observer.observe($('action'));
if(location.hash==='#action'||(params.has('choice')&&params.has('weather'))){observer.disconnect();loadGame();}
