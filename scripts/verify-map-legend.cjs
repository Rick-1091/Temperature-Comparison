const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='.cache/map-legend-qa';
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launchPersistentContext(out+'/profile',{headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER,viewport:{width:1440,height:1000}});
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:8017/?lang=zh#mexico',{waitUntil:'networkidle'});
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:1000});
   for(const lang of ['zh','en']){
    await page.locator('[data-language='+lang+']').click();
    await page.waitForSelector('.business-legend-item');
    const bridge=await page.locator('.bridge-separated').evaluate(el=>{
     const paragraphs=[...el.querySelectorAll('p')],range=document.createRange();range.selectNodeContents(paragraphs[1]);
     return {count:paragraphs.length,lines:range.getClientRects().length,separate:paragraphs[1].getBoundingClientRect().top>paragraphs[0].getBoundingClientRect().bottom};
    });
    assert.equal(bridge.count,2);assert.equal(bridge.lines,1);assert.ok(bridge.separate);
    if(width===1440)await page.locator('.bridge-separated').screenshot({path:out+'/bridge-'+lang+'.png'});
    await page.locator('#business-weather').selectOption('all');
    await page.locator('#business-day').fill('44');
    await page.locator('#business-day').dispatchEvent('input');
    const context=await page.locator('#business-context').evaluate(el=>{
     const range=document.createRange();range.selectNodeContents(el);
     return {lines:range.getClientRects().length,whiteSpace:getComputedStyle(el).whiteSpace,text:el.textContent};
    });
    assert.equal(context.lines,1,'Place/date/weather must stay in one row');assert.equal(context.whiteSpace,'nowrap');
    assert.ok(context.text.includes('2026-09-14'));
    assert.ok((await page.locator('[data-axis=y]').textContent()).includes(lang==='zh'?'模拟活动指数':'Simulated activity index'));
    assert.ok((await page.locator('[data-axis=x]').textContent()).includes(lang==='zh'?'日期':'Date'));
    assert.ok((await page.locator('.business-chart-note').textContent()).includes(lang==='zh'?'数据缺失':'missing data'));
    if(width!==320)await page.locator('#business-timeline').screenshot({path:out+'/timeline-'+lang+'-'+width+'.png'});
    const result=await page.locator('#business-legend').evaluate(el=>{
     const items=[...el.querySelectorAll('.business-legend-item')];
     return {count:items.length,tops:items.map(e=>e.getBoundingClientRect().top),labels:items.map(e=>e.textContent),colors:items.map(e=>{
      const category=e.dataset.category;
      const point=[...document.querySelectorAll('.business-point')].find(p=>p.__data__.cat===category);
      return [getComputedStyle(e.querySelector('.business-legend-swatch')).backgroundColor,getComputedStyle(point.querySelector('.point-value')).fill];
     })};
    });
    assert.equal(result.count,4);assert.ok(result.tops.every(v=>Math.abs(v-result.tops[0])<1),'Legend must stay in one row');
    result.colors.forEach(([swatch,point])=>assert.equal(swatch,point));
    assert.equal(result.labels[0],lang==='zh'?'户外小店':'Outdoor business');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflow');
    await page.locator('#business-weather').selectOption('rainy');
    assert.equal(await page.locator('.business-legend-swatch').count(),4);
    if(width!==320)await page.locator('#business-legend').screenshot({path:out+'/'+lang+'-'+width+'.png'});
    if(width===1440)await page.locator('#business-context').screenshot({path:out+'/context-'+lang+'.png'});
   }
  }
  assert.deepEqual(errors,[]);console.log('PASS bilingual legend: four matching swatches, single row, 1440/390/320px and filter redraw');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
