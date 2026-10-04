import './fonts.js';
import './story.css';
import './story-image.css';
import { stories } from './story-data.js';
import { setupLanguage } from './page-language.js';
const story = stories[document.body.dataset.case];
const bind = (element, pair) => {
  element.dataset.zh = pair[0];
  element.dataset.en = pair[1];
};
document.body.dataset.titleZh = 'Weatherbridge · ' + story.title[0];
document.body.dataset.titleEn = 'Weatherbridge · ' + story.title[1];
bind(document.querySelector('#case-title'), story.title);
const photo = document.querySelector('#story-image');
photo.src = '../../' + story.image;
const stepNav = document.querySelector('.story-steps');
story.steps.forEach((step, i) => {
  const button = document.createElement('button');
  bind(button, [String(i + 1) + ' · ' + step[0][0], String(i + 1) + ' · ' + step[0][1]]);
  button.addEventListener('click', () => render(i));
  stepNav.append(button);
});
bind(document.querySelector('.source-note'), story.source);
if (story.url) {
  const link = document.createElement('a');
  link.href = story.url;
  link.textContent = 'UNDP · M-CLIMES ↗';
  document.querySelector('.story-sources').append(link);
}
const finish = document.querySelector('.finish');
finish.href = story.next;
bind(finish, story.cta);
let current = 0;
const language = setupLanguage();
// Only one narrative step is visible. Data tools remain separate destinations.
function render(index) {
  current = index;
  const step = story.steps[index];
  bind(document.querySelector('.step-label'), step[0]);
  bind(document.querySelector('#step-title'), step[1]);
  bind(document.querySelector('.step-intro'), step[2]);
  bind(document.querySelector('.step-explanation'), step[3]);
  document.querySelector('.why').open = false;
  document.querySelector('.story-sources').open = false;
  document.querySelector('.previous').hidden = index === 0;
  document.querySelector('.next').hidden = index === 4;
  finish.hidden = index !== 4;
  stepNav.querySelectorAll('button').forEach((button, i) => {
    if (i === index) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  language.apply();
  photo.alt = story.alt[language.current === 'zh' ? 0 : 1];
}
document.querySelector('.previous').addEventListener('click', () => render(Math.max(0, current - 1)));
document.querySelector('.next').addEventListener('click', () => render(Math.min(4, current + 1)));
document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => { photo.alt = story.alt[language.current === 'zh' ? 0 : 1]; }));
render(0);
