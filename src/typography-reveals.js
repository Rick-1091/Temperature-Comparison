// Progressive enhancement: content is visible without JavaScript or observer support.
const motion={rise:10,duration:420,stagger:60,maxDelay:120,easing:'cubic-bezier(0.16, 1, 0.3, 1)'};
const groups='.cover h1, main > .chapter > h2, main > .chapter > .spread > div > h2, main > .chapter > .bridge, .preview-pair, #evidence-values';

export function initTypographyReveals(root=document) {
  if(!window.IntersectionObserver||!Element.prototype.animate)return;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const completed=new WeakSet(),active=new Set();
  let observer;
  function members(group) {
    if(group.matches('.preview-pair, #evidence-values'))return [...group.querySelectorAll('strong')];
    if(group.matches('p.bridge'))return [group];
    const children=[...group.children].filter(el=>el.matches('span, p'));
    return children.length?children:[group];
  }
  function reveal(group) {
    const targets=members(group);
    if(!targets.length)return; // The asynchronous evidence pair is not ready yet.
    completed.add(group);observer.unobserve(group);
    group.dataset.revealState='revealed';
    targets.forEach((target,index)=>{
      const animation=target.animate(
        [{opacity:0,transform:'translateY('+motion.rise+'px)'},{opacity:1,transform:'translateY(0)'}],
        {duration:motion.duration,delay:Math.min(index*motion.stagger,motion.maxDelay),easing:motion.easing,fill:'backwards'}
      );
      active.add(animation);
      const finish=()=>active.delete(animation);
      animation.addEventListener('finish',finish,{once:true});
      animation.addEventListener('cancel',finish,{once:true});
    });
  }
  function watch() {
    observer?.disconnect();
    if(preference.matches)return;
    observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting&&!completed.has(entry.target))reveal(entry.target);
    },{threshold:0,rootMargin:'0px 0px -24px 0px'});
    root.querySelectorAll(groups).forEach(group=>{
      if(!completed.has(group))observer.observe(group);
    });
  }
  // Re-check only the two asynchronously populated number pairs; chart/game mutations are excluded.
  const changes=new MutationObserver(records=>{
    if(preference.matches)return;
    for(const {target:group} of records){
      if(completed.has(group))continue;
      observer.unobserve(group);observer.observe(group);
    }
  });
  root.querySelectorAll('.preview-pair, #evidence-values').forEach(group=>changes.observe(group,{childList:true}));
  const onPreference=()=>{
    for(const animation of active)animation.cancel();
    active.clear();watch();
  };
  preference.addEventListener('change',onPreference);
  watch();
  return ()=>{
    observer?.disconnect();changes.disconnect();
    preference.removeEventListener('change',onPreference);
    for(const animation of active)animation.cancel();
    active.clear();
  };
}
