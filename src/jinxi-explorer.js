const scenes={
boats:{photo:'tour-boats',title:['游船更关心风和雨。','Boat tours depend on wind and rain.'],explain:['什么时候适合出船？风雨和水面状况，影响行程安排与游客体验。','When is it suitable to set out? Wind, rain and water conditions affect schedules and visitors’ experience.'],note:['实拍：停泊的游船。照片不证明天气导致停航。','Field photograph: moored boats. The photograph does not establish weather-related cancellations.']},
food:{photo:'smoked-beans',title:['食品晾晒更关心雨和湿度。','Food drying depends on rain and humidity.'],explain:['还有多少干燥的时间？提前了解降雨和湿度，才能安排晾晒、遮盖与收储。','How many dry hours remain? Rain and humidity information helps people plan drying, covering and storage.'],note:['实拍：熏豆与干制食品陈列；不是一次晾晒损失调查。','Field photograph: smoked beans and dried foods on display—not a drying-loss survey.']},
making:{photo:'brick-process',title:['材料制作需要合适的干燥窗口。','Making materials needs a suitable drying window.'],explain:['砖材制作展示让我们注意到干燥工序：什么时候能晒、什么时候需要防雨？','The brick-making display draws attention to drying: when is there time to dry, and when is rain protection needed?'],note:['实拍：博物馆制作工序展示；不是当前工厂生产记录。','Field photograph: a museum process display—not a record of current factory production.']},
cafe:{photo:'canal-coffee',title:['临水小店更关心户外活动条件。','Waterside businesses depend on outdoor conditions.'],explain:['下雨或太热，露天座位还适合使用吗？提前准备遮阳、避雨和座位安排。','Will outdoor seats still be usable in rain or heat? Plan shade, shelter and seating ahead of time.'],note:['实拍：临水咖啡空间；照片不代表客流或营业额数据。','Field photograph: a waterside café—not visitor or revenue data.']}
};
export function initJinxi(language){
let selected='boats';const frame=document.querySelector('.viewfinder');
function show(key){selected=key;const s=scenes[key],i=language.current==='en'?1:0;
const img=document.getElementById('field-photo');img.src='/jinxi/assets/'+s.photo+'.jpg';img.alt=s.note[i];
document.getElementById('field-title').textContent=s.title[i];document.getElementById('field-explanation').textContent=s.explain[i];document.getElementById('field-note').textContent=s.note[i];
document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scene===key)));
frame.classList.remove('capture');requestAnimationFrame(()=>frame.classList.add('capture'));}
document.querySelectorAll('[data-scene]').forEach(b=>['mouseenter','focus','click'].forEach(event=>b.addEventListener(event,()=>show(b.dataset.scene))));
window.addEventListener('wb-language',()=>show(selected));show(selected);
// The boat is a schematic animation, separate from the unmodified field photographs.
const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){document.querySelector('.river-orbit').classList.add('revealed');observer.disconnect();import('./jinxi-water.js').then(m=>m.initWater()).catch(()=>document.querySelector('.river-circle').classList.add('water-fallback'));}},{threshold:.15});
observer.observe(document.querySelector('.river-orbit'));
}
