const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const out=path.resolve('.cache/decision-qa/dual-market');
const base=process.env.WEATHERBRIDGE_PREVIEW_URL||'http://127.0.0.1:8017/';
fs.mkdirSync(out,{recursive:true});
process.env.TEMP=out;process.env.TMP=out;process.env.TMPDIR=out;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER_EXECUTABLE||undefined,args:['--no-proxy-server','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const go=async(query='lang=zh')=>{await p.goto(base+'?'+query+'#evidence',{waitUntil:'domcontentloaded'});await p.locator('#cdd-plot svg').waitFor();await p.locator('#poly-plot svg').waitFor();};
 const fit=async(label)=>assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflow: '+label);
 const shot=async(selector,name)=>{await p.locator(selector).scrollIntoViewIfNeeded();await p.locator(selector).screenshot({path:out+'/'+name+'.png'});};
 try{
  for(const width of [1440,768,390,320])for(const lang of ['zh','en']){
   await p.setViewportSize({width,height:1000});await go('lang='+lang);
   assert.match(await p.locator('#cdd-reading').innerText(),/318/);
   assert.match(await p.locator('#poly-reading').innerText(),/78-79°F.*33.5/);
   assert.match(await p.locator('#poly-reading').innerText(),/82-83°F/);
   assert.equal(await p.locator('#polymarket-archive').isVisible(),false);
   assert.equal(await p.locator('.cdd-point').count(),31);
   assert.equal(await p.locator('.quote-bar').count(),11);
   assert.equal(await p.locator('.market-pair').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),width>850?2:1);
   await p.locator('#mechanism-signal').click();assert.match(await p.locator('#mechanism-panel').innerText(),lang==='zh'?/指数点/:/index points/);
   await p.locator('#mechanism-target').focus();await p.keyboard.press('End');
   assert.equal(await p.locator('#mechanism-settlement').getAttribute('aria-selected'),'true');
   assert.match(await p.locator('#mechanism-panel').innerText(),/Speedwell/);
   await p.locator('#study-day').focus();await p.keyboard.press('Home');assert.equal(await p.locator('#study-day').inputValue(),'1');assert.match(await p.locator('#cdd-reading').innerText(),/20/);
   await p.keyboard.press('End');assert.equal(await p.locator('#study-day').inputValue(),'31');assert.match(await p.locator('#cdd-reading').innerText(),/435/);
   await p.locator('.cdd-point').last().focus();await p.keyboard.press('ArrowLeft');assert.equal(await p.locator('#study-day').inputValue(),'30');assert.equal(await p.evaluate(()=>document.activeElement.classList.contains('cdd-point')),true);
   await p.locator('#study-day').evaluate(e=>{e.value='21';e.dispatchEvent(new Event('input',{bubbles:true}));});
   await p.locator('#study-cme').click();assert.equal(await p.locator('#poly-study').isVisible(),false);assert.ok(await p.locator('#cme-history-status').isVisible());assert.equal(await p.locator('#cme-history-status svg').count(),0);
   await p.locator('#study-polymarket').click();await p.locator('#poly-history-plot svg').waitFor();
   assert.equal(await p.locator('#cme-study').isVisible(),false);assert.equal(await p.locator('#polymarket-archive').isVisible(),true);
   await p.locator('#quote-bin').selectOption('82-83°F');assert.match(await p.locator('#poly-history-plot svg').getAttribute('aria-label'),/82-83/);
   assert.match(await p.locator('#poly-table a').last().getAttribute('href'),/37829487969501389091448427153294797070276785118462486212221216786602029078300/);
   await p.locator('#polymarket-archive>summary').click();await p.waitForFunction(()=>document.querySelector('#evidence-values').textContent.includes('°'));
   await p.locator('#place').selectOption('laguardia');await p.waitForFunction(()=>document.querySelector('#evidence-date').textContent.includes('KLGA'));
   await p.locator('#unit').selectOption('F');await p.waitForFunction(()=>document.querySelector('#evidence-values').textContent.includes('°F'));
   await p.locator('#legacy-evidence-frame').scrollIntoViewIfNeeded();
   const frame=p.frameLocator('#legacy-evidence-frame');await frame.locator('#main-chart').waitFor();
   await frame.locator('[data-unit=F][aria-pressed=true]').waitFor({state:'attached'});
   await frame.locator('#main-chart > *').first().waitFor({state:'attached'});
   for(const view of ['dumbbell','lines','three-d','heatmap','area']){
    await frame.locator('[data-view='+view+']').click();assert.equal(await frame.locator('[data-view='+view+']').getAttribute('aria-pressed'),'true');
    await frame.locator('#main-chart > *').first().waitFor({state:'attached'});
    assert.ok(await frame.locator('#main-chart').evaluate(e=>e.children.length>0),'Empty legacy chart: '+view);
   }
   if(width===1440&&lang==='zh'){
    await p.locator('#unit').selectOption('C');await frame.locator('[data-unit=C][aria-pressed=true]').waitFor({state:'attached'});
    await frame.locator('[data-view=area][aria-pressed=true]').waitFor({state:'attached'});
    await p.locator('[data-language=en]').click();await frame.locator('html[lang=en]').waitFor({state:'attached'});
    await frame.locator('[data-view=area][aria-pressed=true]').waitFor({state:'attached'});
    await p.locator('[data-language=zh]').click();await frame.locator('html[lang=zh-CN]').waitFor({state:'attached'});
   }
   await fit('archive '+width+' '+lang);
   await p.locator('#polymarket-archive>summary').click();await p.locator('#study-overview').click();
   await p.locator('#mechanism-target').click();await fit('overview '+width+' '+lang);
   if([1440,390].includes(width)){await shot('#polymarket','intro-'+width+'-'+lang);await shot('#market-dashboard','dashboard-'+width+'-'+lang);}
   console.log('PASS: dates, linked records, comparison/view tabs, legacy graphs, layout '+width+' '+lang);
  }
  await p.setViewportSize({width:390,height:1000});await go();
  await p.locator('#cdd-method>summary').click();await p.locator('#market-sources>summary').click();
  await p.locator('[data-language=en]').click();await p.waitForFunction(()=>document.querySelector('#cdd-heading').textContent.includes('month'));
  assert.match(await p.locator('#mechanism-panel').innerText(),/Accumulated/);assert.equal(await p.locator('#study-day').inputValue(),'21');
  assert.equal(await p.locator('#cdd-method').evaluate(e=>e.open),true);assert.equal(await p.locator('#market-sources').evaluate(e=>e.open),true);
  assert.equal(new URL(p.url()).searchParams.get('lang'),'en');await p.reload({waitUntil:'domcontentloaded'});await p.locator('#cdd-plot svg').waitFor();assert.equal(await p.locator('html').getAttribute('lang'),'en');
  // Simulate a failed market request; NWS still works, retry restores the second side.
  await p.route('**/laguardia-july-2026-markets.json',route=>route.fulfill({status:503,body:'Unavailable'}));
  await p.reload({waitUntil:'domcontentloaded'});await p.locator('#market-retry').waitFor();await p.locator('#cdd-plot svg').waitFor();assert.equal(await p.locator('#poly-plot svg').count(),0);
  await p.unroute('**/laguardia-july-2026-markets.json');await p.locator('#market-retry').click();await p.locator('#poly-plot svg').waitFor();
  console.log('PASS: language persists across reload; open records survive language changes; market failure/retry.');
  // One delayed request must not block the other chart. Then exercise the timeout.
  let release;
  const gate=new Promise(resolve=>{release=resolve;});
  await p.route('**/laguardia-july-2026-markets.json',async route=>{await gate;await route.continue().catch(()=>{});});
  await p.reload({waitUntil:'domcontentloaded'});await p.locator('#cdd-plot svg').waitFor();assert.equal(await p.locator('#poly-plot svg').count(),0);
  await p.locator('#study-day').focus();await p.keyboard.press('End');assert.match(await p.locator('#cdd-reading').innerText(),/435/);
  await p.locator('#market-retry').waitFor({timeout:16000});assert.equal(await p.locator('#study-day').inputValue(),'31');
  release();await p.unroute('**/laguardia-july-2026-markets.json');await p.locator('#market-retry').click();await p.locator('#poly-plot svg').waitFor();assert.equal(await p.locator('#study-day').inputValue(),'31');
  await p.route('**/laguardia-july-2026-cdd.json',route=>route.fulfill({status:503,body:'Unavailable'}));
  await p.reload({waitUntil:'domcontentloaded'});await p.locator('#poly-plot svg').waitFor();await p.locator('#market-retry').waitFor();assert.equal(await p.locator('#cdd-plot svg').count(),0);
  await p.unroute('**/laguardia-july-2026-cdd.json');await p.locator('#market-retry').click();await p.locator('#cdd-plot svg').waitFor();
  console.log('PASS: independent loading, 12-second timeout, retry preserves date, reverse partial failure.');
  await p.route('**/laguardia-july-2026-*.json',route=>route.fulfill({status:503,body:'Unavailable'}));
  await p.reload({waitUntil:'domcontentloaded'});await p.locator('#market-retry').waitFor();await p.waitForFunction(()=>document.querySelector('#market-dashboard').getAttribute('aria-busy')==='false');
  assert.equal(await p.locator('#cdd-plot svg,#poly-plot svg').count(),0);
  assert.ok(!(await p.locator('.market-error').innerText()).includes('remain available'));
  await p.unroute('**/laguardia-july-2026-*.json');await p.locator('#market-retry').click();await p.locator('#cdd-plot svg').waitFor();await p.locator('#poly-plot svg').waitFor();
  console.log('PASS: both sources unavailable, accurate empty state, successful recovery.');
  // Partial dates and malformed observation units must never produce a made-up curve.
  const marketJSON=JSON.parse(fs.readFileSync('public/signals/data/laguardia-july-2026-markets.json','utf8'));
  const partial={...marketJSON,days:marketJSON.days.filter(d=>d.date!=='2026-07-21')};
  await p.route('**/laguardia-july-2026-markets.json',route=>route.fulfill({json:partial}));
  await p.goto(base+'?lang=en&study-day=21#evidence',{waitUntil:'domcontentloaded'});await p.locator('#cdd-plot svg').waitFor();await p.waitForFunction(()=>document.querySelector('#market-dashboard').getAttribute('aria-busy')==='false');
  assert.equal(await p.locator('#poly-plot svg').count(),0);assert.match(await p.locator('#poly-plot').innerText(),/No verified/);
  await p.unroute('**/laguardia-july-2026-markets.json');
  console.log('PASS: missing study date has an honest empty state.');
  // Independent fixtures: rows are [dry, light rain, heavy rain].
  const expected={all:{none:[24,-7,-82.8],light:[19.5,18.5,-87.3],heavy:[3,-28,-73.8]},shelter:{none:[16,11.5,-86.6],light:[11.5,37,-91.1],heavy:[-5,-9.5,-77.6]},store:{none:[-5,-5,-5],light:[-9.5,20.5,-9.5],heavy:[-26,-26,4]}};
  const signed=n=>(n>0?'+':n<0?'−':'')+Math.abs(n);
  for(const [plan,choices] of Object.entries(expected))for(const [contract,nets] of Object.entries(choices)){
   await p.goto(base+'?lang=zh&scenario=heavy&replay=heavy&qa-case='+plan+'-'+contract+'#action',{waitUntil:'domcontentloaded'});
   await p.locator('[data-decision=skip]').waitFor();await p.waitForFunction(()=>!document.querySelector('[data-decision=skip]').disabled);
   await p.locator('[data-decision=skip]').click();await p.locator('[data-scene-object='+plan+']').click();await p.waitForFunction(()=>document.querySelector('#action').dataset.busy==='false');
   await p.locator('[data-decision=prepared]').click();assert.match(await p.locator('.basis-risk').innerText(),/纽约温度/);
   await p.locator('[data-decision='+({none:'no-hedge',light:'buy-light',heavy:'buy'}[contract])+']').click();await p.waitForFunction(()=>document.querySelector('#action').dataset.busy==='false');await p.locator('[data-decision=reveal]').click();
   await p.waitForFunction(()=>document.querySelector('#action').dataset.decisionStage==='result');assert.equal(await p.locator('.net-selected strong').innerText(),signed(nets[2]));
   await p.locator('.weather-detail>summary').click();
   for(const [i,weather] of ['dry','light'].entries()){
    await p.locator('[data-weather-replay='+weather+']').click();await p.waitForFunction(()=>document.querySelector('#action').dataset.decisionStage==='result');assert.equal(await p.locator('.net-selected strong').innerText(),signed(nets[i]));
   }
   console.log('PASS: 3D '+plan+' / '+contract+' / all three weather outcomes');
  }
  assert.deepEqual(errors,[]);console.log('PASS: all checks, no page errors.');
 }catch(e){console.error('Page errors:',errors);console.error('Frame state:',await p.locator('#legacy-evidence-frame').evaluate(el=>({src:el.src,url:el.contentDocument?.URL,units:[...el.contentDocument?.querySelectorAll('[data-unit]')||[]].map(e=>[e.dataset.unit,e.getAttribute('aria-pressed')])})).catch(()=>null));await p.screenshot({path:out+'/failure.png',fullPage:true});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
