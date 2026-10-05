// One header, used by every current route. Legacy page headers are not mounted.
class WeatherbridgeHeader extends HTMLElement {
  connectedCallback() {
    const root = new URL('./', document.currentScript?.src || window.weatherbridgeRoot || location.href);
    window.weatherbridgeRoot = root.href;
    if(!document.querySelector('link[rel="icon"]')){const icon=document.createElement('link');icon.rel='icon';icon.href=new URL('weatherbridge-logo.png',root);document.head.append(icon);}
    const link = (path) => new URL(path, root).href;
    this.innerHTML = `<header class="wb-header"><a class="wb-brand" href="${link('')}" data-preserve-language><img src="${link('weatherbridge-logo.png')}" alt="" width="30" height="30">Weatherbridge</a><nav aria-label="Site navigation"><a href="${link('about/')}" data-preserve-language data-zh="关于" data-en="About">关于</a><a href="${link('signals/sources/')}" data-preserve-language data-zh="来源" data-en="Sources">来源</a></nav><div class="wb-language" aria-label="Language"><button data-language="zh" data-lang="zh">中</button><button data-language="en" data-lang="en">EN</button></div></header>`;
    const sync = (lang) => {
      this.querySelectorAll('[data-zh]').forEach(el=>el.textContent=el.dataset[lang]);
      this.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.language===lang)));
      this.querySelectorAll('a').forEach(el=>{const url=new URL(el.href);url.searchParams.set('lang',lang);el.href=url.href;});
    };
    let lang = new URLSearchParams(location.search).get('lang');
    try { lang ||= localStorage.getItem('temperature-language'); } catch {}
    sync(lang==='en'?'en':'zh');
    this.addEventListener('click',event=>{const button=event.target.closest('button');if(button)sync(button.dataset.language);});
    window.addEventListener('wb-language',event=>sync(event.detail));
  }
}
window.weatherbridgeRoot = new URL('./', document.currentScript.src).href;
customElements.define('wb-header', WeatherbridgeHeader);
