// One language preference is shared by the cover and all case pages.
export function setupLanguage() {
  let saved;
  try { saved = localStorage.getItem('temperature-language'); } catch {}
  let language = new URLSearchParams(location.search).get('lang') || saved || 'zh';
  function apply(next = language) {
    language = next === 'en' ? 'en' : 'zh';
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-zh][data-en]').forEach(el => { el.textContent = el.dataset[language]; });
    document.querySelectorAll('[data-language]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.language === language)));
    if (document.body.dataset['title' + (language === 'zh' ? 'Zh' : 'En')]) document.title = document.body.dataset['title' + (language === 'zh' ? 'Zh' : 'En')];
    document.querySelectorAll('[data-preserve-language]').forEach(el => {
      const url = new URL(el.getAttribute('href'), location.href);
      url.searchParams.set('lang', language);
      el.href = url.href;
    });
    try { localStorage.setItem('temperature-language', language); } catch {}
  }
  document.querySelectorAll('[data-language]').forEach(el => el.addEventListener('click', () => apply(el.dataset.language)));
  apply();
  return { apply, get current() { return language; } };
}
