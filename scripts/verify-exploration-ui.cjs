const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('.cache/decision-qa/original-explorer'),base=process.env.WEATHERBRIDGE_PREVIEW_URL||'http://127.0.0.1:8017/';
fs.mkdirSync(out,{recursive:true});process.env.TEMP=out;process.env.TMP=out;
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER_EXECUTABLE,args:['--no-proxy-server','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 const go=async(query)=>{await p.goto(base+'signals/explore/?'+query);await p.locator('#main-chart .axis-label').first().waitFor();};
 try{
  for(const lang of ['zh','en'])for(const width of [1440,390]){
   await p.setViewportSize({width,height:1000});
   await go('location=mexico&day=2026-09-23&unit=C&lang='+lang);
   assert.equal(await p.locator('.view-tab').count(),5);
   assert.match(await p.locator('#market-value').innerText(),/≥26°C/);
   if(lang==='en')assert.deepEqual(await p.locator('[aria-label]').evaluateAll(es=>es.filter(e=>/[\u4e00-\u9fff]/.test(e.getAttribute('aria-label'))).map(e=>e.getAttribute('aria-label'))),[],'English accessible labels are translated');
   await p.locator('.data-point[data-index="0"][data-type="actual"]').press('Enter');
   await p.waitForFunction(()=>document.activeElement?.matches('.data-point[data-index="0"][data-type="actual"]'));
   assert.match(await p.locator('#selected-date').innerText(),/19/);
   assert.equal(await p.locator('.data-point[data-index="0"][data-type="actual"]').evaluate(e=>e===document.activeElement),true,'chart keyboard focus survives redraw');
   await go('location=mexico&day=2026-09-23&unit=C&lang='+lang);
   for(const view of ['dumbbell','lines','three-d','heatmap','area']){
    await p.locator('[data-view="'+view+'"]').click();
    assert.equal(new URL(p.url()).searchParams.get('view'),view);
    assert.equal(await p.locator('[data-view="'+view+'"]').getAttribute('aria-pressed'),'true');
    assert.match(await p.locator('#market-value').innerText(),/≥26°C/);
    if(['dumbbell','lines','three-d'].includes(view))assert.ok(await p.locator('.interval-mark').count()>=2);
    if(view==='area'){assert.equal(await p.locator('.area-actual-dot').count(),0);assert.ok(await p.locator('.area-band').evaluateAll(es=>es.every(e=>!/[CQ]/.test(e.getAttribute('d')))));}
    if(view==='heatmap'){
     assert.equal(await p.locator('.heat-cell').count(),36);
     assert.match(await p.locator('#angle-note').innerText(),lang==='en'?/change the date/:/切换日期/);
     const range=await p.locator('#market-value').innerText();
     await p.locator('.heat-cell-group[data-day="4"][data-bucket="2"]').press('Space');
     assert.equal(await p.locator('#market-value').innerText(),range,'group click does not invent a selected original contract');
     assert.equal(await p.locator('.heat-cell-group[data-day="4"][data-bucket="2"]').evaluate(e=>e===document.activeElement),true);
    }
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+view+width+lang);
    await p.locator('.workspace').screenshot({path:out+'/'+view+'-'+width+'-'+lang+'.png',style:'wb-header{visibility:hidden!important}'});
    await p.reload();await p.locator('#main-chart .axis-label').first().waitFor();
    assert.equal(await p.locator('[data-view="'+view+'"]').getAttribute('aria-pressed'),'true');
   }
   await p.locator('[data-view=dumbbell]').click();
   await p.locator('#next-point').click();await p.locator('#next-point').click();
   assert.match(await p.locator('#market-value').innerText(),/≥26°C/);
   assert.equal(new URL(p.url()).searchParams.get('day'),'2026-09-25');
   await p.locator('[data-unit=F]').click();await p.locator('#main-chart .axis-label').first().waitFor();
   assert.match(await p.locator('#market-value').innerText(),/≥78.8°F/);
   await p.locator('#open-prediction').click();assert.equal(await p.locator('.prediction-row').count(),11);
   await p.locator('.prediction-row').nth(3).press('Enter');
   assert.equal(await p.locator('.prediction-row').nth(3).evaluate(e=>e===document.activeElement),true,'quote selection retains keyboard focus');
   const selected=await p.locator('#market-value').innerText();
   await p.reload();await p.locator('#main-chart .axis-label').first().waitFor();assert.equal(await p.locator('#market-value').innerText(),selected);
   const outcome=new URL(p.url()).searchParams.get('outcome');
   await p.locator('.back-guided').click();await p.waitForURL(/signals\/explore\//);await p.locator('#main-chart .axis-label').first().waitFor();
   assert.equal(new URL(p.url()).searchParams.get('location'),'mexico');
   assert.equal(new URL(p.url()).searchParams.get('day'),'2026-09-25');
   assert.equal(new URL(p.url()).searchParams.get('unit'),'F');
   assert.equal(new URL(p.url()).searchParams.get('lang'),lang);
   assert.equal(new URL(p.url()).searchParams.get('outcome'),outcome);
   assert.equal(await p.locator('[data-view=dumbbell]').getAttribute('aria-pressed'),'true');
   assert.equal(await p.locator('#market-value').innerText(),selected,'return opens the same native day and contract');
   await p.locator('[data-view=dumbbell]').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('[data-view=lines]').getAttribute('aria-pressed'),'true');
   await p.locator('[data-view=three-d]').click();await p.locator('#reset-view').click();
   await p.locator('#location-select').selectOption('laguardia');await p.waitForURL(/location=laguardia/);await p.locator('#main-chart .axis-label').first().waitFor();
   assert.match(await p.locator('#location-title').innerText(),lang==='zh'?/纽约/:/New York/);
   await p.locator('[data-view=heatmap]').click();assert.equal(await p.locator('.heat-cell').count(),72);
   assert.deepEqual(errors,[]);
   console.log('PASS original UI, five views, quotes panel, reload, keyboard, native units, both cities: '+width+' '+lang);
  }
  await p.route('**/mexico-unified.json',r=>r.fulfill({status:503,body:'unavailable'}));
  await p.goto(base+'signals/explore/?location=mexico&lang=zh');await p.locator('#retry-load').waitFor();
  assert.equal(await p.locator('.workspace').isVisible(),false);
  await p.unroute('**/mexico-unified.json');await p.locator('#retry-load').click();await p.locator('#main-chart .axis-label').first().waitFor();
  assert.deepEqual(errors,[]);console.log('PASS failure / retry; no page errors. Screenshots: '+out);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
