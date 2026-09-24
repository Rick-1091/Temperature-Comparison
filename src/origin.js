import './fonts.js';
import './styles.css';
import './chapters.css';
import './origin.css';
import './site-i18n.js';

const contexts = {
  en: {
    tourism: '<b>Tourism &amp; service.</b> Rain, heat, and wind can change outdoor access, visitor comfort, boat movement, and the timing of street-facing services.',
    water: '<b>Water-town systems.</b> Rainfall and water conditions can affect waterways, access, environmental conditions, and the maintenance demands of a water-oriented place.',
    production: '<b>Production.</b> Field observations of brick and boat-making displays point to a longer history in which materials, labour, timing, and controlled conditions were tightly linked.',
    agri: '<b>Agriculture &amp; fishery.</b> Temperature, rainfall, water conditions, and seasonal timing can affect growing, aquatic environments, harvesting, and movement through supply chains.',
  },
  zh: {
    tourism: '<b>旅游与服务。</b>降雨、高温与风会影响户外通行、游客舒适度、船只运行和沿街服务的时间安排。',
    water: '<b>水乡系统。</b>降雨与水情会影响航道、通行、环境状况，以及水乡基础设施的维护需求。',
    production: '<b>生产。</b>砖瓦和造船展陈提示我们：材料、劳动、时机与环境控制之间长期紧密相连。',
    agri: '<b>农业与渔业。</b>气温、降雨、水情与季节节律会影响种植、水生环境、收获及供应链流转。',
  },
};

const buttons = document.querySelectorAll('[data-context]');
const detail = document.getElementById('context-detail');
const select = (btn) => {
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  const language = document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  detail.innerHTML = contexts[language][btn.dataset.context];
};
buttons.forEach((b) => b.addEventListener('click', () => select(b)));
window.addEventListener('site-language-change', () => select(document.querySelector('[data-context][aria-pressed="true"]') || buttons[0]));
select(buttons[0]);
