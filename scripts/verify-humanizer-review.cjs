const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('.cache/decision-qa/humanizer-review');
fs.mkdirSync(out,{recursive:true});process.env.TEMP=out;process.env.TMP=out;
const base=process.env.WEATHERBRIDGE_PREVIEW_URL||'http://127.0.0.1:8017/';
const banned=/不代表|不能代表|不等于|不是|并非|不只是|而是|并不意味着|不仅是/;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER_EXECUTABLE,args:['--enable-unsafe-swiftshader']});
 const inventory=[],errors=[];
 try{
  for(const width of [1440,390])for(const lang of ['zh','en']){
   const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
   page.on('pageerror',e=>errors.push(e.message));
   for(const route of ['','research/','about/','signals/methods/','signals/sources/']){
    const response=await page.goto(base+route+'?lang='+lang+'&location=mexico&day=2026-09-23');
    assert.ok(response.ok(),route+' loads');
    if(route==='')await page.locator('.intro-bar').first().waitFor({state:'attached'});
    if(route==='research/')await page.locator('#source-record h3').waitFor();
    if(route==='signals/sources/')await page.waitForFunction(()=>document.querySelector('#source-content').textContent.length>80);
    const text=await page.locator('body').textContent();
    // Scripts contain dictionary source strings; inspect rendered content separately.
    const copy=await page.locator('body').evaluate(e=>{const clone=e.cloneNode(true);clone.querySelectorAll('script,style').forEach(n=>n.remove());return clone.textContent;});
    assert.doesNotMatch(copy,banned,route+' rendered copy');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' page overflow');
    inventory.push({route,lang,width,copy});
    if(route===''){
     await page.locator('#meaning-open').click();
     assert.ok(await page.locator('#meaning-dialog').isVisible());
     await page.locator('#meaning-dialog').evaluate(e=>e.querySelectorAll('details').forEach(d=>d.open=true));
     await page.locator('#meaning-dialog').screenshot({path:path.join(out,`purpose-${width}-${lang}.png`)});
     await page.keyboard.press('Escape');
    }
    if(route==='research/')await page.locator('#source-record').screenshot({path:path.join(out,`sources-${width}-${lang}.png`)});
   }
   // Force WebGL failure: revised choices and terms must remain readable and operable.
   await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:original.call(this,type,...args);};});
   await page.goto(base+'?lang='+lang+'&replay=heavy#action');
   await page.locator('[data-decision=skip]:not(:disabled)').waitFor();
   await page.locator('[data-decision=skip]').click();
   await page.locator('[data-fallback-object=shelter]').click();
   await page.locator('[data-decision=prepared]:not(:disabled)').click();
   assert.match(await page.locator('.contract-terms').innerText(),/30/);
   assert.doesNotMatch(await page.locator('.contract-terms').innerText(),banned);
   await page.locator('#decision-panel').screenshot({path:path.join(out,`contract-text-${width}-${lang}.png`)});
   await page.locator('[data-decision=buy]').click();
   await page.locator('[data-decision=reveal]').click();
   await page.locator('#decision-results:not([hidden])').waitFor();
   assert.match(await page.locator('.net-selected strong').innerText(),/77.6/);
   inventory.push({route:'text-mode-heavy-shelter-heavy-contract',width,lang,copy:await page.locator('#decision-results').textContent()});
   console.log(`PASS Humanizer review routes, expanded purpose, text-mode contract and result: ${width} ${lang}`);
   await page.close();
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'rendered-copy.json'),JSON.stringify(inventory,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
