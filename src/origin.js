import './fonts.js';
import './styles.css';
import './chapters.css';
import './origin.css';
import './cover.css';
import './cover.js';
import './storyline.css';
import './site-i18n.js';

const contexts = {
  en: {
    tourism: '<b>Tourism services.</b> Wind, rain, and heat can shape boat trips, outdoor visits, and the comfort of canal-side spaces.',
    food: '<b>Food processing.</b> Drying, storage, and transport depend on conditions such as temperature, humidity, and rainfall.',
    craft: '<b>Traditional crafts.</b> Brick-making and boat-building connect materials, skilled work, and the timing of outdoor tasks.',
  },
  zh: {
    tourism: '<b>旅游服务。</b>风雨和高温会影响游船、户外游览，以及临水空间的舒适度。',
    food: '<b>食品加工。</b>晾晒、储存和运输都与温度、湿度、降雨等条件有关。',
    craft: '<b>传统手工业。</b>砖瓦制作和木船工艺连接着材料、手工劳动与户外作业时机。',
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
