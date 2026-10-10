// Verify teammate evidence/network updates alongside the decision diorama.
const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT_MODULE||process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.WEATHERBRIDGE_PREVIEW_URL||'http://127.0.0.1:8017/';
const out=path.resolve('.cache/integration-qa');
(async()=>{
 fs.mkdirSync(out,{recursive:true});process.env.TEMP=out;process.env.TMP=out;process.env.TMPDIR=out;
 const browser=await chromium.launch({headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER_EXECUTABLE||process.env.WEATHERBRIDGE_BROWSER||undefined,args:['--enable-unsafe-swiftshader']});
 const errors=[];
 try{
  for(const width of [1440,390])for(const lang of ['zh','en']){
   const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'?lang='+lang+'#evidence');
   await page.locator('#temperature-history .temperature-day').first().waitFor();
   assert.equal(await page.locator('#temperature-history .temperature-day').count(),9);
   assert.equal(await page.locator('#weather-network .wn-node').count(),7);
   assert.ok(await page.locator('#weather-network .wn-link').count()>0);
   assert.equal(await page.locator('#nine-days,#sample-summary').count(),0,'Do not restore retired duplicate views');
   await page.locator('#temperature-history .temperature-day').first().focus();
   await page.keyboard.press('Enter');
   await page.waitForFunction(()=>document.querySelector('#date').value==='2026-09-19');
   const node=page.locator('#weather-network .wn-node').first();await node.focus();await page.keyboard.press('Enter');
   assert.ok((await page.locator('#weather-network .wn-detail h4').innerText()).includes(lang==='en'?'Temperature':'气温'));
   const edge=page.locator('#weather-network .wn-link').first();await edge.focus();await page.keyboard.press('Enter');
   assert.ok((await page.locator('#weather-network .wn-detail').innerText()).includes('r ='));
   await page.locator('#unit').selectOption('F');
   await page.waitForFunction(()=>document.querySelector('#evidence-values').textContent.includes('°F'));
   assert.equal(await page.locator('#weather-network .wn-node').count(),7);
   await page.locator('#place').selectOption('laguardia');
   await page.waitForFunction(()=>document.querySelector('#weather-network-summary').textContent.includes('KLGA'));
   assert.equal(await page.locator('#weather-network .wn-node').count(),7);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Viewport overflow');
   await page.locator('#weather-network').screenshot({path:path.join(out,`network-${width}-${lang}.png`)});
   await page.locator('#temperature-history').screenshot({path:path.join(out,`evidence-${width}-${lang}.png`)});
   await page.locator('#action').scrollIntoViewIfNeeded();await page.locator('#scene canvas').waitFor();
   await page.waitForFunction(()=>!document.querySelector('[data-decision=skip]').disabled);
   await page.locator('[data-decision=skip]').click();await page.locator('[data-scene-object=shelter]').click();
   await page.waitForFunction(()=>document.querySelector('#action').dataset.busy==='false');
   assert.equal(await page.locator('#scene').getAttribute('data-protected-ears'),'29');
   await page.locator('[data-decision=prepared]').click();await page.locator('[data-decision=no-hedge]').click();
   await page.locator('[data-decision=reveal]').click();await page.waitForFunction(()=>document.querySelector('#action').dataset.decisionStage==='result');
   assert.equal(await page.locator('.net-selected').count(),1);
   assert.equal(await page.locator('#weather-network .wn-node').count(),7,'Scene must not replace the evidence network');
   await page.close();
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({viewports:[1440,390],languages:['zh','en'],temperatureTimeline:true,weatherNetwork:true,keyboard:true,unitSwitch:true,stationSwitch:true,diorama:true,errors},null,2));
  console.log('PASS: teammate timeline/network, keyboard selection, unit/station changes and 3D courtyard coexist on desktop/mobile in both languages');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
