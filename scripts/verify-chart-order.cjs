const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const out='.cache/decision-qa/chart-order';
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launchPersistentContext(out+'/profile',{
    headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER,
    args:['--enable-unsafe-swiftshader','--no-proxy-server'],viewport:{width:1440,height:1000}
  });
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto('http://127.0.0.1:8017/?lang=zh',{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForSelector('#weather-network .wn-node');
    await page.waitForSelector('#temperature-history svg');
    assert.deepEqual(await page.locator('main>section[id]').evaluateAll(es=>es.map(e=>e.id)),
      ['hero','jinxi','malawi','polymarket','evidence','why-polymarket','mexico','action','reflection']);
    const ids=['intro-market','evidence-values','price-distribution','temperature-history','accuracy-history','legacy-evidence-frame','business-map','business-timeline','weather-network'];
    assert.equal(await page.evaluate(ids=>ids.every((id,i)=>!i||Boolean(document.getElementById(ids[i-1]).compareDocumentPosition(document.getElementById(id))&Node.DOCUMENT_POSITION_FOLLOWING)),ids),true);
    assert.equal(await page.locator('#evidence #weather-network').count(),0);
    assert.equal(await page.locator('#mexico #weather-network').count(),1);
    assert.equal(await page.evaluate(()=>Boolean(document.querySelector('.evidence-controls').compareDocumentPosition(document.getElementById('evidence-values'))&Node.DOCUMENT_POSITION_FOLLOWING)),true);
    assert.deepEqual(await page.locator('main>section.chapter>.eyebrow:first-child').allTextContents().then(a=>a.slice(0,6).map(t=>t.trim().slice(0,2))),['01','02','03','04','05','06']);
    // The application network owns its location; the evidence city must not affect it.
    await page.locator('#place').selectOption('laguardia');
    await page.waitForFunction(()=>document.querySelector('#evidence-date').textContent.includes('KLGA'));
    assert.match(await page.locator('#weather-network-summary').textContent(),/MMMX/);
    await page.locator('#weather-network-place').selectOption('laguardia');
    await page.waitForFunction(()=>document.querySelector('#weather-network-summary').textContent.includes('KLGA'));
    await page.locator('#place').selectOption('mexico');
    await page.waitForFunction(()=>document.querySelector('#evidence-date').textContent.includes('MMMX'));
    assert.match(await page.locator('#weather-network-summary').textContent(),/KLGA/);
    await page.locator('#weather-network-place').selectOption('mexico');
    await page.waitForFunction(()=>document.querySelector('#weather-network-summary').textContent.includes('MMMX'));
    await page.locator('#date').selectOption('2026-09-27');
    await page.locator('#unit').selectOption('F');
    await page.waitForFunction(()=>document.querySelector('#evidence-values').textContent.includes('°F'));
    await page.locator('#unit').selectOption('C');
    await page.waitForFunction(()=>document.querySelector('#evidence-values').textContent.includes('°C'));
    await page.locator('#business-weather').selectOption('rainy');
    assert.ok(await page.locator('#business-map svg').count());
    assert.ok(await page.locator('#business-timeline svg').count());
    for(const width of [1440,768,390,320]){
      await page.setViewportSize({width,height:1000});
      for(const lang of ['zh','en']){
        await page.locator('[data-language='+lang+']').click();
        await page.waitForFunction(()=>document.querySelector('#weather-network').getAttribute('aria-busy')==='false');
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflow '+width+' '+lang);
        assert.match(await page.locator('#weather-network-summary').textContent(),/MMMX/);
        const node=page.locator('#weather-network .wn-node').first();
        await node.focus();await node.press('Enter');
        assert.ok(await page.locator('#weather-network .wn-detail h4').textContent());
        const edge=page.locator('#weather-network .wn-link').first();
        await edge.focus();await edge.press('Enter');
        assert.match(await page.locator('#weather-network .wn-detail').textContent(),/r =/);
        if(width===1440||width===390){
          await page.locator('.weather-context').screenshot({path:out+'/network-'+width+'-'+lang+'.png'});
          await page.locator('.evidence-controls').scrollIntoViewIfNeeded();
          await page.screenshot({path:out+'/evidence-'+width+'-'+lang+'.png'});
        }
        console.log('PASS chart order and controls '+width+' '+lang);
      }
    }
    await page.locator('#legacy-evidence-frame').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('#legacy-evidence-frame').contentDocument?.querySelector('.shell'));
    assert.ok(await page.locator('#legacy-evidence-frame').evaluate(e=>e.getBoundingClientRect().height>400));
    await page.locator('#action').scrollIntoViewIfNeeded();
    await page.waitForSelector('#decision-scenario');
    assert.deepEqual(errors,[]);
    console.log('PASS independent city filters, bilingual network keyboard interaction, map, evidence, inline explorer and 3D entry; no page errors');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
