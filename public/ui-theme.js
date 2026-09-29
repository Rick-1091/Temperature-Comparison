const presets = {
  teal: { zh:'青橙 · 默认', en:'Teal & terracotta', primary:'#167c77', secondary:'#d85b3b', colors:['#346d86','#b65e35','#63834c','#866780','#bb9232'] },
  blue: { zh:'蓝金 · 清晰对照', en:'Blue & gold', primary:'#245a9d', secondary:'#aa6b0d', colors:['#245a9d','#aa6b0d','#4c8a85','#8b628e','#788a35'] },
  purple: { zh:'紫绿 · 柔和', en:'Purple & green', primary:'#74609d', secondary:'#397c56', colors:['#74609d','#397c56','#ae714c','#427c98','#b58b27'] },
  accessible: { zh:'蓝橙 · 色觉友好', en:'Blue & orange · accessible', primary:'#0072b2', secondary:'#d55e00', colors:['#0072b2','#d55e00','#009e73','#cc79a7','#9b7800'] },
};
const key='weather-chart-palette';
let preference={preset:'teal',primary:presets.teal.primary,secondary:presets.teal.secondary};
try {const saved=JSON.parse(localStorage.getItem(key));if(saved && (presets[saved.preset] || saved.preset==='custom') && /^#[\da-f]{6}$/i.test(saved.primary) && /^#[\da-f]{6}$/i.test(saved.secondary)) preference=saved;} catch {}
document.documentElement.classList.add('site-unified');
// The same brand mark is used on every chapter and the standalone guide.
document.querySelectorAll('.cb-brand, .statebar .brand').forEach(link=>{
  link.setAttribute('data-language-owned','');
  link.replaceChildren();
  const image=document.createElement('img');image.src='/weatherbridge-logo.png';image.alt='';image.width=40;image.height=40;
  const name=document.createElement('span');name.textContent='Weatherbridge';link.append(image,name);
});
const favicon=document.querySelector('link[rel="icon"]')||document.createElement('link');
favicon.rel='icon';favicon.type='image/png';favicon.href='/weatherbridge-logo.png';document.head.append(favicon);
const controls=[];
const english=()=>document.documentElement.lang==='en';
function label(zh,en){return english()?en:zh;}
function mount(target) {
  if(!target)return;
  const details=document.createElement('details');details.className='chart-palette';
  details.innerHTML='<summary></summary><div class="palette-fields"><label><span></span><select data-palette="preset"></select></label><label><span></span><input type="color" data-palette="primary"></label><label><span></span><input type="color" data-palette="secondary"></label><button type="button"></button><p></p></div>';
  if(target.id==='impact-controls') target.querySelector('.hero-controls').append(details);
  else target.prepend(details);
  controls.push(details);
  details.addEventListener('input',event=>{
    const field=event.target.dataset.palette;if(!field)return;
    if(field==='preset'){preference.preset=event.target.value;if(presets[preference.preset])Object.assign(preference,{primary:presets[preference.preset].primary,secondary:presets[preference.preset].secondary});}
    else{preference[field]=event.target.value;preference.preset='custom';}
    apply();
  });
  details.querySelector('button').addEventListener('click',()=>{preference={preset:'teal',primary:presets.teal.primary,secondary:presets.teal.secondary};apply();});
}
function sync() {
  const comparison=location.pathname.includes('signals');
  controls.forEach(details=>{
    details.querySelector('summary').textContent=label('图表配色','Chart colors');
    const labels=details.querySelectorAll('label>span');
    labels[0].textContent=label('配色方案','Palette');
    labels[1].textContent=comparison?label('实际气温','Observed temperature'):label('主色 / 活动强度','Primary / activity level');
    labels[2].textContent=comparison?label('市场预测','Market forecast'):label('对照色','Comparison color');
    const select=details.querySelector('select');
    select.replaceChildren(...Object.entries({...presets,custom:{zh:'自定义',en:'Custom'}}).map(([value,preset])=>{const option=document.createElement('option');option.value=value;option.textContent=english()?preset.en:preset.zh;return option;}));
    select.value=preference.preset;
    details.querySelectorAll('input').forEach(input=>{input.value=preference[input.dataset.palette];input.setAttribute('aria-label',input.previousElementSibling.textContent);});
    select.setAttribute('aria-label',label('配色方案','Palette'));
    details.querySelector('button').textContent=label('恢复默认','Reset colors');
    details.querySelector('p').textContent=label('仅改变图表颜色，不改变数据。请保持两种颜色可区分；选择会在本机保存。','Colors only; data stays unchanged. Keep the two colors distinguishable. Your choice is saved on this device.');
  });
}
function apply() {
  const root=document.documentElement;
  root.style.setProperty('--actual',preference.primary);root.style.setProperty('--market',preference.secondary);
  root.style.setProperty('--chart-primary',preference.primary);root.style.setProperty('--chart-secondary',preference.secondary);
  root.style.setProperty('--rain',preference.primary);root.style.setProperty('--warm',preference.secondary);
  try{localStorage.setItem(key,JSON.stringify(preference));}catch{}
  const palette={...preference,colors:presets[preference.preset]?.colors || [preference.primary,preference.secondary,'#63834c','#866780','#bb9232']};
  window.weatherChartPalette=palette;sync();
  window.dispatchEvent(new CustomEvent('chart-palette-change',{detail:palette}));
}
mount(document.querySelector('.simple-figure'));
const tabs=document.querySelector('.view-tabs');if(tabs){const slot=document.createElement('div');tabs.before(slot);mount(slot);}
mount(document.querySelector('#impact-controls'));
new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
apply();
