const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const out='.cache/typography-reveal-qa';fs.mkdirSync(out,{recursive:true});
 const context=await chromium.launchPersistentContext(out+'/profile',{headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER,viewport:{width:1440,height:1000}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Capture every typography entrance, including finished ones, without modifying its effect.
 await page.addInitScript(()=>{
  window.typeEntrances=[];
  const animate=Element.prototype.animate;
  Element.prototype.animate=function(frames,options){
   if(Array.isArray(frames)&&frames[0]?.transform==='translateY(10px)'){
    window.typeEntrances.push({tag:this.tagName,group:this.closest('[data-reveal-state]')?.id||this.closest('[data-reveal-state]')?.className,frames,options});
   }
   return animate.call(this,frames,options);
  };
 });
 try{
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   await page.emulateMedia({reducedMotion:'no-preference'});
   await page.goto('http://127.0.0.1:8017/?lang=zh',{waitUntil:'networkidle'});
   await page.waitForFunction(()=>document.querySelector('.cover h1').dataset.revealState==='revealed');
   await page.locator('#malawi h2').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('#malawi h2').dataset.revealState==='revealed');
   await page.locator('#evidence-values').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('#evidence-values').dataset.revealState==='revealed');
   const count=await page.evaluate(()=>window.typeEntrances.length);
   await page.locator('#unit').selectOption('F');
   await page.locator('[data-language=en]').click();
   await page.locator('#evidence-values').scrollIntoViewIfNeeded();
   await page.waitForTimeout(600);
   assert.equal(await page.evaluate(()=>window.typeEntrances.filter(e=>e.group==='evidence-values').length),2,'Number updates do not replay the pair');
   const entries=await page.evaluate(()=>window.typeEntrances);
   assert.ok(entries.length>=count);
   assert.ok(entries.every(e=>e.options.duration===420&&e.options.delay<=120));
   assert.ok(entries.some(e=>e.options.delay===60),'Restrained sibling stagger');
   assert.ok(entries.every(e=>!['BUTTON','SELECT','SVG'].includes(e.tag)));
   assert.equal(await page.locator('p.lead[data-reveal-state],p.caption[data-reveal-state]').count(),0);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.locator('#evidence-values').screenshot({path:out+'/numbers-'+width+'.png'});
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForTimeout(50);
   assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.effect?.getKeyframes().some(k=>k.transform==='translateY(10px)')).length),0);
   await page.goto('http://127.0.0.1:8017/?lang=en',{waitUntil:'networkidle'});
   await page.locator('#malawi h2').scrollIntoViewIfNeeded();
   assert.equal(await page.evaluate(()=>window.typeEntrances.length),0,'Reduced motion disables entrances entirely');
   assert.equal(await page.locator('#malawi h2').evaluate(el=>getComputedStyle(el).opacity),'1');
   await page.locator('#malawi h2').screenshot({path:out+'/reduced-'+width+'.png'});
  }
  const noScript=await context.browser().newContext({javaScriptEnabled:false});
  const staticPage=await noScript.newPage();await staticPage.goto('http://127.0.0.1:8017/');
  assert.equal(await staticPage.locator('.cover h1').evaluate(el=>getComputedStyle(el).opacity),'1');
  await noScript.close();
  assert.deepEqual(errors,[]);
  console.log('PASS: desktop/mobile one-shot reveals, 10px/420ms/120ms cap, numbers, static body copy, bilingual updates, reduced motion and no-JS visibility.');
 }finally{await context.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
