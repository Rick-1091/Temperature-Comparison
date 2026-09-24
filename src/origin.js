import './fonts.js';
import './styles.css';
import './chapters.css';
import './origin.css';

const contexts = {
  tourism: '<b>Tourism &amp; service.</b> Rain, heat, and wind can change outdoor access, visitor comfort, boat movement, and the timing of street-facing services.',
  water: '<b>Water-town systems.</b> Rainfall and water conditions can affect waterways, access, environmental conditions, and the maintenance demands of a water-oriented place.',
  production: '<b>Production.</b> Field observations of brick and boat-making displays point to a longer history in which materials, labour, timing, and controlled conditions were tightly linked.',
  agri: '<b>Agriculture &amp; fishery.</b> Temperature, rainfall, water conditions, and seasonal timing can affect growing, aquatic environments, harvesting, and movement through supply chains.',
};

const buttons = document.querySelectorAll('[data-context]');
const detail = document.getElementById('context-detail');
const select = (btn) => {
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  detail.innerHTML = contexts[btn.dataset.context];
};
buttons.forEach((b) => b.addEventListener('click', () => select(b)));
select(buttons[0]);
