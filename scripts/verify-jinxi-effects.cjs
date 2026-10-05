const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const out='.cache/jinxi-effects-qa';fs.mkdirSync(out,{recursive:true});
 const context=await chromium.launchPersistentContext(out+'/profile',{headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER,viewport:{width:1440,height:1000},args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await context.newPage(),errors=[],shaderErrors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/.test(m.text()))shaderErrors.push(m.text());});
 try{
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'no-preference'});
   await page.goto('http://127.0.0.1:8017/?lang=zh#jinxi',{waitUntil:'networkidle'});
   await page.locator('.river-circle').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('#jinxi-water').dataset.motionState==='playing');
   assert.equal(await page.locator('#boat-motion').count(),0);
   const movingFrame=await page.locator('#jinxi-water').screenshot();await page.waitForTimeout(180);
   assert.ok(!movingFrame.equals(await page.locator('#jinxi-water').screenshot()),'Boat keeps rowing');
   await page.waitForFunction(()=>document.querySelector('.viewfinder').dataset.cameraState==='idle');
   await page.locator('.jinxi-explorer').screenshot({path:out+'/scene-'+width+'.png'});
   await page.waitForFunction(()=>document.querySelector('#jinxi-water').dataset.motionState==='playing');
   for(const [key,file] of [['food','smoked-beans'],['making','brick-process'],['cafe','canal-coffee'],['boats','tour-boats']]){
    await page.locator('[data-scene='+key+']').click();
    await page.waitForFunction(file=>document.querySelector('#field-photo').src.includes(file),file);
    await page.waitForFunction(()=>document.querySelector('.viewfinder').dataset.cameraState==='idle');
    assert.equal(await page.locator('.capture-previous').count(),0);
    assert.equal(await page.locator('[data-scene='+key+']').getAttribute('aria-pressed'),'true');
   }
   // Rapid changes must finish with the latest requested photograph.
   await page.evaluate(()=>{for(const key of ['food','making','cafe'])document.querySelector('[data-scene='+key+']').dispatchEvent(new MouseEvent('mouseenter'));});
   await page.waitForFunction(()=>document.querySelector('#field-photo').src.includes('canal-coffee'));
   await page.waitForFunction(()=>document.querySelector('.viewfinder').dataset.cameraState==='idle');
   await page.locator('[data-language=en]').click();
   await page.locator('.river-circle').scrollIntoViewIfNeeded();
   assert.equal(await page.locator('#boat-motion').count(),0);
   assert.ok((await page.locator('#field-title').textContent()).includes('Waterside'));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForFunction(()=>document.querySelector('#jinxi-water').dataset.motionState==='reduced');
   assert.equal(await page.locator('#jinxi-water').getAttribute('data-motion-state'),'reduced');
   await page.locator('[data-scene=food]').click();
   await page.waitForFunction(()=>document.querySelector('#field-photo').src.includes('smoked-beans'));
   assert.equal(await page.locator('.capture-previous').count(),0);
   assert.equal(await page.locator('.viewfinder').evaluate(el=>el.getAnimations({subtree:true}).length),0);
   await page.locator('.viewfinder').screenshot({path:out+'/photo-'+width+'.png'});
  }
  assert.deepEqual(errors,[]);assert.deepEqual(shaderErrors,[]);
  console.log('PASS: continuous rowing without pause control, four photos, bilingual, desktop/mobile and reduced motion.');
 }finally{await context.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
