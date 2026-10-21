const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('.cache/decision-qa/restoration'),base=process.env.WEATHERBRIDGE_PREVIEW_URL||'http://127.0.0.1:8017/';
fs.mkdirSync(out,{recursive:true});process.env.TEMP=out;process.env.TMP=out;process.env.TMPDIR=out;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER_EXECUTABLE||undefined,args:['--no-proxy-server','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 const go=async(query='lang=zh')=>{await p.goto(base+'?'+query+'#evidence',{waitUntil:'domcontentloaded'});await p.locator('#cdd-plot svg').waitFor();await p.locator('#poly-plot svg').waitFor();};
 const fit=async(label)=>assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow: '+label);
 const shot=async(selector,name)=>{await p.locator(selector).scrollIntoViewIfNeeded();await p.locator(selector).screenshot({path:out+'/'+name+'.png',style:'wb-header{visibility:hidden!important}'});};
 const chooseDay=async(day)=>p.locator('#study-day').evaluate((e,v)=>{e.value=String(v);e.dispatchEvent(new Event('input',{bubbles:true}));},day);
 try{
  for(const width of [1440,390,360])for(const lang of ['zh','en']){
   await p.setViewportSize({width,height:1000});await go('lang='+lang+'&location=mexico&date=2026-09-25&unit=F');
   assert.equal(await p.locator('#legacy-evidence-frame,#accuracy-history,#price-distribution').count(),0);
   assert.match(await p.locator('#hero h1').innerText(),lang==='zh'?/天气不确定/:/Weather is uncertain/);
   assert.match(await p.locator('#cdd-heading').innerText(),/NWS/);
   assert.match(await p.locator('#cdd-reading').innerText(),/435/);
   assert.ok(await p.locator('wb-header [data-advanced-explore]').isVisible());
   assert.equal(await p.locator('#mexico #business-map svg,#mexico #business-map canvas').count()>0,true);
   await chooseDay(2);assert.match(await p.locator('#poly-reading').innerText(),/104°F/);assert.match(await p.locator('.record-mismatch').innerText(),lang==='zh'?/按事件指定来源/:/event’s specified source/);
   await p.locator('#mechanism-target').focus();await p.keyboard.press('End');assert.equal(await p.locator('#mechanism-settlement').getAttribute('aria-selected'),'true');
   assert.notEqual(await p.locator('#mechanism-settlement').evaluate(e=>getComputedStyle(e).outlineStyle),'none');
   await p.locator('#study-polymarket').click();await p.locator('#poly-history-plot svg').waitFor();
   await p.locator('#study-overview').click();await fit(width+lang);
   const link=new URL(await p.locator('#historical-explore-link').getAttribute('href'));assert.equal(link.searchParams.get('location'),'mexico');assert.equal(link.searchParams.get('day'),'2026-09-25');assert.equal(link.searchParams.get('unit'),'F');assert.equal(link.searchParams.get('lang'),lang);
   if(width!==390){await shot('#hero','hero-'+width+'-'+lang);await shot('#evidence','study-'+width+'-'+lang);}
   await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:out+'/navigation-'+width+'-'+lang+'.png'});
   console.log('PASS homepage '+width+' '+lang);
  }
  await p.setViewportSize({width:1440,height:1000});await go('lang=zh');
  for(const [selector,name]of [['#malawi','malawi-1440-zh'],['#mexico','mexico-1440-zh'],['#polymarket','mechanisms-1440-zh']])await shot(selector,name);
  console.log('Chapter backgrounds: '+JSON.stringify(await p.locator('#hero,#malawi,#mexico,#polymarket,#action').evaluateAll(es=>es.map(e=>[e.id,getComputedStyle(e).backgroundColor]))));
  // Independent five-view explorer is checked by verify-exploration-ui.cjs.
  await p.goto(base+'research/?lang=zh#examples');await p.locator('#weather-network svg').waitFor();assert.match(await p.locator('#weather-network-summary').innerText(),/236.*4.*报告/);await fit('research');
  await p.locator('#weather-network-place').selectOption('laguardia');await p.waitForFunction(()=>document.getElementById('weather-network-summary').textContent.includes('240'));assert.match(await p.locator('#weather-network-summary').innerText(),/64/);
  console.log('PASS relocated examples and recalculated network');

  await p.setViewportSize({width:1440,height:1000});await go('lang=zh');
  await p.route('**/laguardia-july-2026-markets.json',r=>r.fulfill({status:503,body:'unavailable'}));
  await p.reload();await p.locator('#market-retry').waitFor();await p.locator('#cdd-plot svg').waitFor();assert.equal(await p.locator('#poly-plot svg').count(),0);
  await p.unroute('**/laguardia-july-2026-markets.json');await p.locator('#market-retry').click();await p.locator('#poly-plot svg').waitFor();
  await p.route('**/laguardia-july-2026-cdd.json',r=>r.fulfill({status:503,body:'unavailable'}));await p.reload();await p.locator('#market-retry').waitFor();await p.locator('#poly-plot svg').waitFor();assert.equal(await p.locator('#cdd-plot svg').count(),0);
  await p.unroute('**/laguardia-july-2026-cdd.json');await p.locator('#market-retry').click();await p.locator('#cdd-plot svg').waitFor();
  await p.route('**/laguardia-july-2026-markets.json',async r=>{const response=await r.fetch(),data=await response.json();data.days=data.days.filter(d=>d.date!=='2026-07-21');await r.fulfill({response,json:data});});await p.reload();await p.locator('#cdd-plot svg').waitFor();await p.waitForFunction(()=>!document.getElementById('market-dashboard').getAttribute('aria-busy')||document.getElementById('market-dashboard').getAttribute('aria-busy')==='false');assert.equal(await p.locator('#poly-plot svg').count(),0);
  await p.unroute('**/laguardia-july-2026-markets.json');
  console.log('PASS independent failure / retry and missing market day');

  let gameIndex=0;
  const startGame=async({lang='zh',scenario='heavy',replay='dry',fallback=false}={})=>{
   await p.goto(base+'?lang='+lang+'&scenario='+scenario+'&replay='+replay+'&qa-case='+(++gameIndex)+'#action',{waitUntil:'domcontentloaded'});
   await p.locator('[data-decision=skip]:not(:disabled)').waitFor();
   if(fallback){await p.locator('.motion-options summary').click();await p.locator('#decision-text').click();await p.locator('.is-text-mode').waitFor();}
  };
  const play=async(plan,contract)=>{
   await p.locator('[data-decision=skip]').click();const objects=p.locator('[data-fallback-object="'+plan+'"]:visible,[data-scene-object="'+plan+'"]:visible');await objects.first().click();await p.locator('[data-decision=prepared]:not(:disabled)').click();
   assert.match(await p.locator('.contract-terms').innerText(),/0/);
   await p.locator('[data-decision="'+(contract==='light'?'buy-light':contract==='heavy'?'buy':'no-hedge')+'"]:not(:disabled)').click();await p.locator('[data-decision=reveal]:not(:disabled)').click();await p.locator('#decision-results:not([hidden])').waitFor();
  };
  const fixtures=[['dry','store',false,'−5'],['light','shelter',false,'+11.5'],['light','shelter','light','+37'],['heavy','shelter',false,'−86.6'],['heavy','shelter','light','−91.1'],['heavy','shelter','heavy','−77.6']];
  for(const lang of ['zh','en'])for(const [weather,plan,contract,expected]of fixtures){
   await startGame({lang,replay:weather,fallback:true});await play(plan,contract);
   assert.equal((await p.locator('.net-comparison .net-selected strong').innerText()).trim(),expected);assert.equal(await p.locator('.net-comparison>div').count(),2);assert.equal(await p.locator('.net-bar,.decision-impact,.result-equation').count(),0);
   await p.locator('.result-detail summary').click();if(weather==='dry')assert.match(await p.locator('.result-detail').innerText(),/29/);
  }
  console.log('PASS bilingual known-weather reference results and compact text mode');

  await p.setViewportSize({width:1440,height:1000});await p.emulateMedia({reducedMotion:'no-preference'});await startGame({replay:'heavy'});assert.ok(await p.locator('#scene canvas').isVisible());await p.locator('[data-decision=view]').click();assert.match(await p.locator('.signal-market').innerText(),/教学降雨市场/);assert.doesNotMatch(await p.locator('#decision-panel').innerText(),/平均损失最小|全部收储的平均/);await shot('#action','signal-1440-zh');
  await p.locator('[data-decision=continue]').click();await p.locator('[data-scene-object=shelter]').click();await p.locator('[data-decision=prepared]:not(:disabled)').click();await shot('#action','contract-1440-zh');await p.locator('[data-decision=buy]:not(:disabled)').click();await p.locator('[data-decision=reveal]:not(:disabled)').click();await p.locator('#decision-results:not([hidden])').waitFor();assert.match(await p.locator('.net-selected strong').innerText(),/77.6/);await shot('#decision-results','result-1440-zh');
  await p.locator('#decision-restart').click();assert.equal(new URL(p.url()).searchParams.has('replay'),false);assert.equal(await p.locator('#action').getAttribute('data-scenario'),'heavy');
  console.log('PASS WebGL preparation, purchase, reveal and new random round');
  await p.emulateMedia({reducedMotion:'reduce'});
  for(const width of [390,360])for(const lang of ['zh','en']){
   await p.setViewportSize({width,height:900});await startGame({lang,replay:'light',fallback:true});await play('shelter','light');await fit('game'+width+lang);
   const tops=await p.locator('.net-comparison strong').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().top));assert.ok(Math.abs(tops[0]-tops[1])<1,'Net amounts must align');
   await shot('#decision-results','result-'+width+'-'+lang);
  }
  const failContext=await browser.newContext({viewport:{width:360,height:900},reducedMotion:'reduce'});
  await failContext.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:original.call(this,type,...args);};});
  const f=await failContext.newPage();f.on('pageerror',e=>errors.push(e.message));await f.goto(base+'?lang=en&replay=light#action');await f.locator('.is-text-mode').waitFor();assert.ok(await f.locator('#scene').evaluate(e=>e.clientHeight<180));
  await f.locator('[data-decision=skip]').click();await f.locator('[data-fallback-object=shelter]:visible').click();await f.locator('[data-decision=prepared]').click();await f.locator('[data-decision=buy-light]').click();await f.locator('[data-decision=reveal]').click();await f.locator('#decision-results:not([hidden])').waitFor();assert.match(await f.locator('.net-selected strong').innerText(),/37/);await f.locator('#decision-results').screenshot({path:out+'/webgl-fallback-360-en.png'});await failContext.close();
  assert.deepEqual(errors,[]);console.log('PASS WebGL-failure complete flow; no page errors. Screenshots: '+out);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
