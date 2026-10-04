// Use a locally installed Playwright, or an explicitly supplied runtime module.
const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT || 'playwright');
const assert=require('node:assert/strict');
async function run(){
 const browser=await chromium.launchPersistentContext('dist/cover-qa-profile',{headless:true,...(process.env.WEATHERBRIDGE_BROWSER ? {executablePath:process.env.WEATHERBRIDGE_BROWSER} : {}),viewport:{width:1440,height:1000},hasTouch:true});
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8017/',{waitUntil:'networkidle'});
 await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('.crowd-person').count(),8);
 assert.match(await page.locator('#cover-title').innerText(),/天气难以确定/);
 await page.locator('[data-person="7"]').click();
 assert.equal(await page.locator('[data-person="7"]').getAttribute('aria-pressed'),'true');
 await page.keyboard.press('Home');
 assert.equal(await page.locator('[data-person="0"]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-language="en"]').click();
 assert.match(await page.locator('#cover-title').innerText(),/Weather is uncertain/);
 assert.match(await page.locator('[data-person="0"]').getAttribute('aria-label'),/Boat operator/);
 await page.screenshot({path:'dist/cover-desktop-en.png'});
 await page.locator('[data-language="zh"]').click();
 await page.screenshot({path:'dist/cover-desktop-zh.png'});
 const metrics=[];
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:900});
  for(const language of ['zh','en']){
   await page.locator(`[data-language="${language}"]`).click();
   const metric=await page.evaluate(()=>({width:innerWidth,body:document.documentElement.scrollWidth,titleWidth:document.querySelector('#cover-title').getBoundingClientRect().width,spans:[...document.querySelectorAll('#cover-title>span')].map(s=>({width:s.getBoundingClientRect().width,text:s.textContent})),coverBottom:document.querySelector('.cover').getBoundingClientRect().bottom}));
   assert.ok(metric.body<=width,JSON.stringify(metric));
   assert.ok(metric.spans.every(s=>s.width<=width-24),JSON.stringify(metric));
   metrics.push({language,...metric});
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('[data-language="zh"]').click();
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 await page.screenshot({path:'dist/cover-mobile-zh.png',fullPage:false});
 await page.locator('[data-person="6"]').tap();
 assert.equal(await page.locator('[data-person="6"]').getAttribute('aria-pressed'),'true');
 await page.screenshot({path:'dist/cover-mobile-interaction.png',fullPage:false});
 for(const path of ['signals/guide.html','signals/sources.html','nomadcast/decide.html']){
  const response=await page.request.get('http://127.0.0.1:8017/'+path);assert.equal(response.status(),200);
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({errors,metrics},null,2));
 await browser.close();
}
run().catch(e=>{console.error(e);process.exit(1)});
