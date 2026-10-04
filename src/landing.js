import './fonts.js';
import './cover.css';
import { setupLanguage } from './page-language.js';
setupLanguage();
document.querySelector('[data-open-about]').addEventListener('click', () => {
  const about = document.querySelector('#project-about');
  about.open = !about.open;
  if (about.open) about.querySelector('summary').focus();
});
