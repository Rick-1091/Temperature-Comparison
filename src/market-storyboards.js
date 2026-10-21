export function initMarketStoryboards(language){
 const dialog=document.getElementById('market-storyboard-viewer');
 if(!dialog)return;
 const image=dialog.querySelector('img'),title=dialog.querySelector('h3'),scroll=dialog.querySelector('.storyboard-viewer-scroll');
 let origin=null,selected=null;
 const sync=()=>{
  document.querySelectorAll('[data-storyboard-open]').forEach(button=>{
   const heading=button.closest('figure').querySelector('h3').textContent;
   button.setAttribute('aria-label',(language.current==='en'?'Enlarge: ':'放大查看：')+heading);
  });
  if(selected){title.textContent=selected.querySelector('h3').textContent;image.alt=selected.querySelector('img').alt;}
 };
 document.querySelectorAll('[data-storyboard-open]').forEach(button=>button.addEventListener('click',()=>{
  origin=button;selected=button.closest('figure');image.src=selected.querySelector('img').src;sync();
  dialog.showModal();document.documentElement.classList.add('storyboard-viewer-open');scroll.scrollTo(0,0);
 }));
 dialog.querySelector('[data-storyboard-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{document.documentElement.classList.remove('storyboard-viewer-open');origin?.focus();});
 window.addEventListener('wb-language',sync);sync();
}
