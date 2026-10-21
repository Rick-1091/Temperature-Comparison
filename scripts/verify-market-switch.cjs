const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('.cache/decision-qa/market-switch');fs.mkdirSync(out,{recursive:true});process.env.TEMP=out;process.env.TMP=out;
const base=process.env.WEATHERBRIDGE_PREVIEW_URL||'http://127.0.0.1:8017/';
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER_EXECUTABLE});const errors=[];
try{for(const width of [1440,390])for(const lang of ['zh','en']){
 const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'?lang='+lang+'#market-definitions');
 const range=p.locator('#market-intro-switch'),f=p.locator('#weather-futures-definition'),poly=p.locator('#polymarket-definition');
 await range.waitFor();assert.equal(await f.isVisible(),true);assert.equal(await poly.isVisible(),false);
 await p.locator('#market-definitions').screenshot({path:path.join(out,`futures-${width}-${lang}.png`)});
 await range.focus();await p.keyboard.press('ArrowRight');assert.equal(await poly.isVisible(),true);assert.equal(await f.isVisible(),false);
 assert.equal(await p.locator('#market-tab-polymarket').getAttribute('aria-selected'),'true');
 await p.locator('.intro-bar').first().waitFor();assert.equal(await p.locator('.intro-bar').count(),11);
 await p.locator('#market-definitions').screenshot({path:path.join(out,`polymarket-${width}-${lang}.png`)});
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.reload();await range.waitFor();assert.equal(await poly.isVisible(),true,'hash restores selected panel');
 await p.locator('#market-tab-futures').click();assert.equal(await f.isVisible(),true);
 const box=await range.boundingBox();await p.mouse.move(box.x+16,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+box.width-16,box.y+box.height/2,{steps:8});await p.mouse.up();
 assert.equal(await poly.isVisible(),true,'native thumb drag changes the panel');
 await p.locator('#market-tab-polymarket').focus();await p.keyboard.press('ArrowLeft');assert.equal(await f.isVisible(),true);
 await p.locator('#weather-futures-definition>.market-next').click();assert.equal(await poly.isVisible(),true,'existing next link switches in place');
 await p.locator('#market-tab-futures').click();await p.locator('#weather-futures-definition .event-outcomes-illustration img').evaluate(e=>e.decode());
 assert.equal(await p.locator('#market-stories .market-storyboard').count(),2);assert.equal(await p.locator('.research-study-pair>article').count(),2);
 console.log(`PASS slider drag, click, keyboard, preserved content and refresh: ${width} ${lang}`);await p.close();
}
const p=await b.newPage({javaScriptEnabled:false});await p.goto(base);assert.equal(await p.locator('#weather-futures-definition').isVisible(),true);assert.equal(await p.locator('#polymarket-definition').isVisible(),true);await p.close();console.log('PASS no-JavaScript readable fallback');assert.deepEqual(errors,[]);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
