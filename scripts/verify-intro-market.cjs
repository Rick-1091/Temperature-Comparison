const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const data=JSON.parse(fs.readFileSync('public/signals/data/mexico-oct4-intro.json','utf8'));
const event=JSON.parse(fs.readFileSync('public/signals/data/mexico-oct4-event-raw.json','utf8'));
assert.equal(data.outcomes.length,event.markets.length);
assert.equal(data.outcomes.length,11);
assert.equal(data.metadata.eventId,event.id);
for(const o of data.outcomes){
 const raw=event.markets.find(m=>m.id===o.marketId),yes=JSON.parse(raw.outcomes).indexOf('Yes');
 assert.equal(o.yesTokenId,JSON.parse(raw.clobTokenIds)[yes]);
 assert.equal(o.settlementPrice,Number(JSON.parse(raw.outcomePrices)[yes]));
 const last=o.history.at(-1);assert.equal(last.p,o.price);assert.equal(last.t*1000,Date.parse(o.quotedAt));
 assert.ok(o.history.every(p=>p.t*1000<Date.parse(data.metadata.cutoffAt)));
 assert.ok(o.price>=0&&o.price<=1);
}
assert.equal(data.outcomes.find(o=>o.temperature===20).price,.385);
assert.equal(data.outcomes.filter(o=>o.settlementPrice===1)[0].temperature,20);
(async()=>{
 const out='.cache/intro-market-qa';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launchPersistentContext(out+'/profile',{headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER,viewport:{width:1440,height:1000}});
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:8017/?lang=zh#polymarket',{waitUntil:'networkidle'});
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:1000});
   for(const lang of ['zh','en']){
    await page.locator('[data-language='+lang+']').click();
    await page.waitForSelector('.intro-bar');
    assert.equal(await page.locator('.intro-bar').count(),11);
    assert.ok((await page.locator('.intro-bar[data-top=true]').textContent()).includes('38.5¢'));
    assert.ok((await page.locator('#intro-market').textContent()).includes(lang==='zh'?'未归一化':'not normalized'));
    assert.ok((await page.locator('#intro-market').textContent()).includes('23:55'));
    assert.equal(await page.locator('.illustration-quotes').count(),0);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No page-level overflow');
    if(width!==320)await page.locator('#intro-market').screenshot({path:out+'/'+lang+'-'+width+'.png'});
   }
  }
  await page.locator('#unit').selectOption('F');
  assert.ok((await page.locator('.intro-bar[data-top=true]').textContent()).includes('68°F'));
  assert.ok((await page.locator('.intro-bar[data-top=true]').textContent()).includes('38.5¢'));
  await page.locator('#intro-market summary').click();
  assert.equal(await page.locator('.intro-market-table tbody tr').count(),11);
  await page.route('**/signals/data/mexico-oct4-intro.json',r=>r.fulfill({status:503,body:'unavailable'}));
  await page.goto('http://127.0.0.1:8017/?lang=en#polymarket',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.intro-bar').count(),0);
  assert.ok((await page.locator('#intro-market').textContent()).includes('could not be loaded'));
  assert.deepEqual(errors,[]);
  console.log('PASS: 11 genuine pre-day quotes, provenance, C/F, bilingual responsive chart, table, missing-data fallback.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
