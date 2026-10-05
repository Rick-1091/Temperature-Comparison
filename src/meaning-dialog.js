import './meaning-dialog.css';

export function initMeaningDialog(){
  const dialog=document.getElementById('meaning-dialog');
  const trigger=document.getElementById('meaning-open');
  trigger.addEventListener('click',()=>{
    dialog.showModal();
    document.body.classList.add('meaning-reading');
    dialog.scrollTop=0;
    document.getElementById('meaning-title').focus({preventScroll:true});
  });
  dialog.querySelectorAll('[data-meaning-close]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('close',()=>{
    document.body.classList.remove('meaning-reading');
    trigger.focus({preventScroll:true});
  });
  // Native dialog provides keyboard focus containment and Escape dismissal.
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
  });
}
