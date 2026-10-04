const { chromium } = require(process.env.WEATHERBRIDGE_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
async function run() {
 const browser = await chromium.launchPersistentContext('dist/architecture-qa-profile',{headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER,viewport:{width:1440,height:1000},hasTouch:true});
 const page=await browser.newPage(),errors=[],base='http://127.0.0.1:8017/';
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'networkidle'});
 assert.equal(await page.locator('.case-entry').count(),3);
 assert.equal(await page.locator('main > section, main canvas, main table').count(),0);
 assert.equal(await page.locator('#project-about').evaluate(el=>el.open),false);
 await page.screenshot({path:'dist/cover-desktop-zh.png',fullPage:true});
 await page.locator('[data-language="en"]').click();
 assert.match(await page.locator('h1').innerText(),/Decisions cannot wait/);
 await page.screenshot({path:'dist/cover-desktop-en.png',fullPage:true});
 await page.locator('[data-open-about]').click();
 assert.equal(await page.locator('#project-about').evaluate(el=>el.open),true);
 for(const slug of ['jinxi','malawi','mexico-city']){
  await page.goto(base);
  await page.locator('.case-entry[href*="'+slug+'"]').click();
  assert.ok(page.url().includes('/cases/'+slug+'/'));
  await page.locator('.story-steps button').first().waitFor();
  await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('.story-steps button').count(),5);
  assert.equal(await page.locator('.why').evaluate(el=>el.open),false);
  assert.equal(await page.locator('.story-sources').evaluate(el=>el.open),false);
  assert.ok(await page.locator('#story-image').evaluate(el=>el.complete&&el.naturalWidth>0));
  await page.locator('[data-language="en"]').click();
  for(let i=0;i<4;i++)await page.locator('.next').click();
  assert.equal(await page.locator('.story-steps button[aria-current]').innerText(),'5 · What we learn');
  assert.ok(await page.locator('.finish').isVisible());
  await page.locator('.why summary').click();
  assert.equal(await page.locator('.why').evaluate(el=>el.open),true);
  await page.locator('.story-steps button').first().click();
  await page.locator('[data-language="zh"]').click();
  await page.screenshot({path:'dist/case-'+slug+'-desktop.png',fullPage:true});
  await page.locator('footer a').click();
  assert.equal(await page.locator('.case-entry').count(),3);
 }
 for(const width of [768,390,320]){
  await page.setViewportSize({width,height:844});
  for(const route of ['', 'cases/jinxi/', 'cases/malawi/', 'cases/mexico-city/']){
   await page.goto(base+route,{waitUntil:'networkidle'});
   for(const lang of ['zh','en']){
    await page.locator('[data-language="'+lang+'"]').click();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow: '+route+' '+width+' '+lang);
   }
   if(width===390){await page.locator('[data-language="zh"]').click();await page.screenshot({path:'dist/'+(route?route.split('/')[1]:'cover')+'-mobile.png',fullPage:true});}
  }
 }
 for(const route of ['signals/guide.html','signals/sources.html','nomadcast/decide.html'])await page.goto(base+route,{waitUntil:'networkidle'});
 await page.goto(base+'signals/guide.html',{waitUntil:'networkidle'});
 for(const place of ['mexico','laguardia']){
  await page.locator('#place').selectOption(place);
  await page.waitForFunction(()=>document.querySelector('#day').options.length===9);
  await page.locator('[data-unit="C"]').click();
  await page.waitForFunction(()=>document.querySelector('#observed-value').textContent.includes('°C'));
  await page.locator('[data-unit="F"]').click();
  await page.waitForFunction(()=>document.querySelector('#observed-value').textContent.includes('°F'));
  assert.equal(await page.locator('#history-body tr').count(),9);
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: independent cover; 3 real story routes; 5 steps; bilingual disclosure; 320/390/768 layouts; existing tools; no JS errors.');
 await browser.close();
}
run().catch(e=>{console.error(e);process.exit(1)});
