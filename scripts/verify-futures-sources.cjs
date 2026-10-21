const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('.cache/decision-qa/futures-sources');fs.mkdirSync(out,{recursive:true});process.env.TEMP=out;process.env.TMP=out;
const base=process.env.WEATHERBRIDGE_PREVIEW_URL||'http://127.0.0.1:8017/';
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER_EXECUTABLE});const errors=[];
try{for(const width of [1440,390])for(const lang of ['zh','en']){
 const p=await b.newPage({viewport:{width,height:1000}});p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'research/?lang='+lang+'#futures-sources');
 const host=p.locator('#futures-observation-source');await host.locator('a').first().waitFor();
 assert.match(await host.innerText(),/435/);assert.match(await host.innerText(),/KLGA.*2026-07.*31/s);
 const section=p.locator('#futures-sources');
 for(const part of ['403.pdf','datamine.html','laguardia-july-2026-cdd.json','forecast.weather.gov','10.1108'])assert.equal(await section.locator('a[href*="'+part+'"]').count(),1);
 assert.match(await section.innerText(),lang==='zh'?/暂未接入/:/not yet connected/);
 if(lang==='en')assert.doesNotMatch(await section.innerText(),/[\u4e00-\u9fff]/);
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await section.screenshot({path:path.join(out,`sources-${width}-${lang}.png`)});
 await p.locator('#source-place').selectOption('laguardia');await p.waitForFunction(()=>document.querySelector('#source-record h3')?.textContent.includes('KLGA'));
 console.log(`PASS CME rules, price availability, NWS provenance, 435 CDD and existing filters: ${width} ${lang}`);await p.close();
}
const p=await b.newPage({viewport:{width:390,height:1000}});let fail=true;
await p.route('**/laguardia-july-2026-cdd.json',r=>fail?r.fulfill({status:503,body:'Unavailable'}):r.continue());
await p.goto(base+'research/?lang=zh');const retry=p.locator('[data-cdd-retry]');await retry.waitFor();
assert.ok(await p.locator('#source-record h3').count(),'weather-source failure leaves Polymarket lookup usable');
fail=false;await retry.focus();await p.keyboard.press('Enter');await p.locator('#futures-observation-source a').first().waitFor();
assert.match(await p.locator('#futures-observation-source').innerText(),/435/);
console.log('PASS independent failure and keyboard retry');await p.close();assert.deepEqual(errors,[]);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
