const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const out=path.resolve('.cache/decision-qa/market-transition');
fs.mkdirSync(out,{recursive:true});process.env.TEMP=out;process.env.TMP=out;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER_EXECUTABLE,args:['--no-proxy-server','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const width of [1440,390])for(const lang of ['zh','en']){
   await page.setViewportSize({width,height:1000});
   await page.goto((process.env.WEATHERBRIDGE_PREVIEW_URL||'http://127.0.0.1:8017/')+'?lang='+lang+'#polymarket');
   await page.locator('#market-mechanisms .market-tabs').waitFor();
   const transition=page.locator('#market-perspectives');
   assert.equal(await transition.locator('.market-overview').count(),2);
   assert.match(await transition.locator('.market-cme .market-question').innerText(),/CME/);
   assert.match(await transition.locator('.market-poly .market-question').innerText(),/Polymarket/);
   assert.match(await transition.locator('.market-poly .market-category').innerText(),lang==='zh'?/事件预测市场/:/Event prediction market/);
   if(lang==='en')assert.doesNotMatch(await transition.innerText(),/[\u4e00-\u9fff]/);
   await page.locator('.market-opening>a').focus();await page.keyboard.press('Enter');
   assert.equal(new URL(page.url()).hash,'#market-perspectives');
   assert.ok(await transition.evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('wb-header').getBoundingClientRect().bottom),'anchor clears sticky header');
   const columns=await transition.locator('.market-overview').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));
   assert.ok(width===1440?Math.abs(columns[0].top-columns[1].top)<1:columns[1].top>columns[0].bottom,'responsive column order');
   for(const provider of ['cme','poly']){
    const details=transition.locator('.market-'+provider+' details');await details.locator('summary').click();
    assert.equal(await details.getAttribute('open'),'');await details.locator('summary').click();
   }
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal page overflow');
   await transition.screenshot({path:path.join(out,'transition-'+width+'-'+lang+'.png'),style:'wb-header{visibility:hidden!important}'});
   await page.locator('.market-definition-path a[href="#polymarket-definition"]').click();
   assert.equal(new URL(page.url()).hash,'#polymarket-definition');
   await page.locator('#polymarket-definition .intro-bar').first().waitFor();
   await page.locator('#polymarket-definition>a.market-next').click();
   assert.equal(new URL(page.url()).hash,'#market-comparison');
   await page.locator('#market-comparison>a.market-next').click();assert.equal(new URL(page.url()).hash,'#evidence');
   await page.locator('#cdd-plot svg').waitFor();await page.locator('#poly-plot svg').waitFor();
   console.log('PASS transition, keyboard anchors, disclosures, study continuity: '+width+' '+lang);
  }
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
