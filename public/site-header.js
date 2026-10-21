// One header, used by every current route. Legacy page headers are not mounted.
class WeatherbridgeHeader extends HTMLElement {
  connectedCallback() {
    const root = new URL('./', document.currentScript?.src || window.weatherbridgeRoot || location.href);
    window.weatherbridgeRoot = root.href;
    if(!document.querySelector('link[rel="icon"]')){const icon=document.createElement('link');icon.rel='icon';icon.href=new URL('weatherbridge-logo.png',root);document.head.append(icon);}
    const link = (path) => new URL(path, root).href;
    this.innerHTML = `<header class="wb-header"><a class="wb-brand" href="${link('')}" data-preserve-language><img src="${link('weatherbridge-logo.png')}" alt="" width="30" height="30">Weatherbridge</a><nav aria-label="Site navigation"><a href="${link('signals/explore/')}" data-advanced-explore data-zh="高级探索" data-en="Advanced exploration">高级探索</a><a href="${link('research/')}" data-preserve-language data-zh="数据来源" data-en="Data sources">数据来源</a></nav><div class="wb-language" aria-label="Language"><button data-language="zh" data-lang="zh">中</button><button data-language="en" data-lang="en">EN</button></div></header>`;
    const syncExplorer = () => {
      const params=new URLSearchParams(location.search),url=new URL(link('signals/explore/'));
      for(const [key,value]of Object.entries({location:params.get('location')==='laguardia'?'laguardia':'mexico',day:params.get('day')||params.get('date')||'2026-09-23',unit:params.get('unit')==='F'?'F':'C',lang:params.get('lang')==='en'?'en':'zh',view:params.get('view')||'daily'}))url.searchParams.set(key,value);
      this.querySelector('[data-advanced-explore]').href=url.href;
    };
    syncExplorer();
    this.addEventListener('click',event=>{if(event.target.closest('[data-advanced-explore]'))syncExplorer();},true);
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
