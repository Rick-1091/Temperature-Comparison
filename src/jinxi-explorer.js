const scenes={
boats:{photo:'tour-boats',title:['游船更关心风和雨。','Boat tours depend on wind and rain.'],explain:['什么时候适合出船？风雨和水面状况，影响行程安排与游客体验。','When is it suitable to set out? Wind, rain and water conditions affect schedules and visitors’ experience.'],note:['实拍：停泊的游船。照片不证明天气导致停航。','Field photograph: moored boats. The photograph does not establish weather-related cancellations.']},
food:{photo:'smoked-beans',title:['食品晾晒更关心雨和湿度。','Food drying depends on rain and humidity.'],explain:['还有多少干燥的时间？提前了解降雨和湿度，才能安排晾晒、遮盖与收储。','How many dry hours remain? Rain and humidity information helps people plan drying, covering and storage.'],note:['实拍：熏豆与干制食品陈列；不是一次晾晒损失调查。','Field photograph: smoked beans and dried foods on display—not a drying-loss survey.']},
making:{photo:'brick-process',title:['材料制作需要合适的干燥窗口。','Making materials needs a suitable drying window.'],explain:['砖材制作展示让我们注意到干燥工序：什么时候能晒、什么时候需要防雨？','The brick-making display draws attention to drying: when is there time to dry, and when is rain protection needed?'],note:['实拍：博物馆制作工序展示；不是当前工厂生产记录。','Field photograph: a museum process display—not a record of current factory production.']},
cafe:{photo:'canal-coffee',title:['临水小店更关心户外活动条件。','Waterside businesses depend on outdoor conditions.'],explain:['下雨或太热，露天座位还适合使用吗？提前准备遮阳、避雨和座位安排。','Will outdoor seats still be usable in rain or heat? Plan shade, shelter and seating ahead of time.'],note:['实拍：临水咖啡空间；照片不代表客流或营业额数据。','Field photograph: a waterside café—not visitor or revenue data.']}
};
export function initJinxi(language){
let selected='boats',displayed='boats',request=0;
const frame=document.querySelector('.viewfinder'),img=document.getElementById('field-photo');
frame.dataset.cameraState='idle';
const reduced=matchMedia('(prefers-reduced-motion:reduce)'),photos=new Map(),animations=new Set();
const reticle=document.createElement('span');reticle.className='focus-reticle';reticle.setAttribute('aria-hidden','true');frame.append(reticle);
function stopCapture(){
  for(const animation of animations)animation.cancel();animations.clear();
  frame.querySelector('.capture-previous')?.remove();frame.classList.remove('capture');
  frame.dataset.cameraState='idle';
}
function copy(){
  const s=scenes[displayed],i=language.current==='en'?1:0;img.alt=s.note[i];
  document.getElementById('jinxi-water').setAttribute('aria-label',['游船在水面划行的示意动画','Schematic animation of a boat on the water'][i]);
  document.getElementById('field-title').textContent=s.title[i];document.getElementById('field-explanation').textContent=s.explain[i];document.getElementById('field-note').textContent=s.note[i];
}
function animate(target,frames,options){
  const animation=target.animate(frames,options);animations.add(animation);
  animation.finished.then(()=>animations.delete(animation)).catch(()=>animations.delete(animation));
  return animation;
}
async function show(key){
  document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scene===key)));
  // Hover, focus and click can target the same scene: one photograph change, not three flashes.
  if(key===selected&&displayed===key){copy();return;}
  selected=key;const ticket=++request,url='/jinxi/assets/'+scenes[key].photo+'.jpg';
  stopCapture();frame.dataset.cameraState='loading';
  if(!photos.has(key)){
    const photo=new Image();photo.src=url;
    photos.set(key,photo.decode().catch(error=>{photos.delete(key);throw error;}));
  }
  try{await photos.get(key);}catch{
    if(ticket!==request)return;
    selected=displayed;frame.dataset.cameraState='idle';
    document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scene===displayed)));
    return;
  }
  if(ticket!==request)return;
  let previous;
  if(!reduced.matches&&img.animate){
    previous=img.cloneNode();previous.removeAttribute('id');previous.alt='';previous.setAttribute('aria-hidden','true');previous.className='capture-previous';frame.append(previous);
  }
  img.src=url;displayed=key;copy();frame.dataset.cameraState='idle';
  if(previous){
    frame.classList.add('capture');frame.dataset.cameraState='focusing';
    const timing={duration:380,easing:'cubic-bezier(0.16, 1, 0.3, 1)'};
    animate(img,[{transform:'scale(1.018)',filter:'blur(1px)'},{transform:'scale(1)',filter:'blur(0)'}],timing);
    animate(previous,[{opacity:1},{opacity:0}],{duration:220,easing:'ease-out'}).finished.then(()=>previous.remove()).catch(()=>previous.remove());
    animate(reticle,[{opacity:0,transform:'translate(-50%, -50%) scale(1.18)'},{opacity:.85,offset:.3,transform:'translate(-50%, -50%) scale(1)'},{opacity:0,transform:'translate(-50%, -50%) scale(1)'}],{duration:520,easing:timing.easing}).finished.then(()=>{if(ticket===request){frame.classList.remove('capture');frame.dataset.cameraState='idle';}}).catch(()=>{});
  }
}
document.querySelectorAll('[data-scene]').forEach(b=>['mouseenter','focus','click'].forEach(event=>b.addEventListener(event,()=>show(b.dataset.scene))));
window.addEventListener('wb-language',copy);reduced.addEventListener('change',stopCapture);show(selected);
// The boat is a schematic animation, separate from the unmodified field photographs.
const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){document.querySelector('.river-orbit').classList.add('revealed');observer.disconnect();import('./jinxi-water.js').then(m=>m.initWater()).catch(()=>{document.querySelector('.river-circle').classList.add('water-fallback');});}},{threshold:.15});
observer.observe(document.querySelector('.river-orbit'));
}
