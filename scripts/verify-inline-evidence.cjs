const {chromium}=require('C:/Users/Nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
const context=await chromium.launchPersistentContext('.cache/inline-evidence-profile',{headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',viewport:{width:1440,height:1000},reducedMotion:'reduce',args:['--enable-unsafe-swiftshader']});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
for(const width of [1440,768,390,320])for(const lang of ['zh','en']){
 await page.setViewportSize({width,height:1000});
 await page.goto('http://127.0.0.1:8017/?lang='+lang);
 await page.locator('#legacy-evidence-frame').scrollIntoViewIfNeeded();
 const f=page.frameLocator('#legacy-evidence-frame');
 await f.locator('#main-chart rect, #main-chart path').first().waitFor();
 assert.equal(await page.locator('#legacy-evidence-link').count(),0);
 assert.equal(await page.locator('.legacy-evidence').getByText('旧版可视化',{exact:false}).count(),0);
 assert.equal(await page.locator('#legacy-evidence-frame').evaluate(e=>getComputedStyle(e).borderTopWidth),'0px');
 assert.equal(await f.locator('.workspace').evaluate(e=>getComputedStyle(e).borderTopWidth),'0px');
 await page.waitForFunction(()=>{const e=document.querySelector('#legacy-evidence-frame'),d=e.contentDocument;return d?.querySelector('.shell')&&Math.abs(e.clientHeight-Math.ceil(d.querySelector('.shell').getBoundingClientRect().bottom+d.defaultView.scrollY))<=2;});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'outer overflow '+width+lang);
 assert.ok(await f.locator('html').evaluate(e=>e.scrollWidth<=innerWidth+1),'inner overflow '+width+lang);
 for(const view of ['dumbbell','lines','three-d','heatmap','area']){
  await f.locator('[data-view="'+view+'"]').click();
  assert.equal(await f.locator('[data-view="'+view+'"]').getAttribute('aria-pressed'),'true');
  await page.waitForFunction(()=>{const e=document.querySelector('#legacy-evidence-frame'),d=e.contentDocument;return d.documentElement.scrollHeight<=e.clientHeight+2;});
 }
 await f.locator('.data-details').first().locator('summary').click();
 await page.waitForFunction(()=>{const e=document.querySelector('#legacy-evidence-frame'),d=e.contentDocument;return d.documentElement.scrollHeight<=e.clientHeight+2;});
 if(lang==='zh'&&(width===1440||width===390))await page.locator('.legacy-evidence').screenshot({path:'.cache/inline-evidence-'+width+'.png'});
 console.log('PASS inline charts, no frame/inner scrolling: '+width+' '+lang);
}
assert.deepEqual(errors,[]);console.log('PASS all checks');
}finally{await context.close();}
})().catch(e=>{console.error(e);process.exit(1)});
