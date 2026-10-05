const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base='http://127.0.0.1:8017/',out='.cache/qa-final';
const routes=['','cases/jinxi/','cases/malawi/','cases/mexico-city/','signals/introduction/','signals/guide/','signals/explore/','signals/methods/','signals/sources/','experience/food-drying/','experience/food-drying/debrief/?choice=cover&weather=rain&seen=true','about/'];
let activeBrowser;
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=activeBrowser=await chromium.launchPersistentContext(out+'/chrome',{headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER,args:['--enable-unsafe-swiftshader'],viewport:{width:1440,height:1000}});
 const page=await browser.newPage(),errors=[],bad=[];
 page.on('pageerror',e=>errors.push(page.url()+': '+e.message));
 page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('WebGL'))errors.push(page.url()+': '+m.text())});
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)bad.push(r.url())});
 if(!process.env.WEATHERBRIDGE_SKIP_LAYOUT)for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1000});
  for(let i=0;i<routes.length;i++){
   await page.goto(base+routes[i],{waitUntil:'networkidle'});
   assert.equal(await page.locator('wb-header .wb-header').count(),1);
   assert.equal(await page.locator('.chapterbar,.page-switcher').count(),0);
   for(const lang of ['zh','en']){
    await page.locator('[data-language='+lang+']').click();
    assert.equal(await page.locator('html').getAttribute('lang'),lang==='en'?'en':'zh-CN');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow '+routes[i]+' '+width+' '+lang);
   }
   if(width===1440||width===390){await page.locator('[data-language=zh]').click();await page.screenshot({path:out+'/'+i+'-'+width+'.png',fullPage:true});}
  }
  console.log('PASS: 12 routes, bilingual, header and width '+width);
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(base);
 assert.equal(await page.locator('.case-entry').count(),3);
 assert.equal(await page.locator('.landing-principles,.landing-actions').count(),0);
 for(const slug of ['jinxi','malawi','mexico-city']){
  await page.goto(base+'cases/'+slug+'/',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.story-steps button').count(),5);
  if(slug==='jinxi'){
   assert.equal(await page.locator('.field-object').count(),4);
   await page.locator('.field-object summary').first().click();
   await page.waitForFunction(()=>{const i=document.querySelector('.field-object img');return i.complete&&i.naturalWidth>0});
   assert.ok(await page.locator('.field-object img').first().evaluate(i=>i.complete&&i.naturalWidth>0));
   await page.screenshot({path:out+'/field-photo.png',fullPage:true});
  }
  for(let step=1;step<5;step++){
   await page.locator('.next').click();
   assert.equal(await page.locator('.story-visual').getAttribute('data-stage'),String(step));
   assert.ok(await page.locator('#visual-event > *').count()>0);
  }
  const next=await page.locator('.finish').getAttribute('href');
  assert.ok(next.includes(slug==='jinxi'?'malawi':slug==='malawi'?'mexico-city':'signals/introduction'));
  if(slug==='mexico-city'){
   await page.locator('.story-steps button').nth(3).click();
   await page.locator('#visual-event a').click();await page.waitForLoadState('networkidle');
   assert.ok(page.url().includes('/signals/introduction/'));
   await page.locator('main .wb-primary').click();await page.waitForLoadState('networkidle');
   assert.equal(await page.locator('#place').inputValue(),'mexico');
   assert.equal(await page.locator('#day').inputValue(),'2026-09-23');
  }
 }
 console.log('PASS: three stories, 15 states, field photograph, sequential CTAs');
 await page.goto(base+'signals/guide/',{waitUntil:'networkidle'});
 for(const city of ['mexico','laguardia']){
  await page.locator('#place').selectOption(city);
  await page.waitForFunction(()=>document.querySelector('#day').options.length===9);
  await page.locator('#day').selectOption('2026-09-27');
  const verdict=await page.locator('#verdict').innerText();
  for(const unit of ['C','F']){
   await page.locator('[data-unit='+unit+']').click();
   assert.ok((await page.locator('#observed-value').innerText()).includes('°'+unit));
   assert.equal(await page.locator('#verdict').innerText(),verdict);
  }
  assert.equal(await page.locator('#history-body tr').count(),9);
  await page.locator('#source-link').click();await page.waitForLoadState('networkidle');
  assert.ok((await page.locator('#source-content').innerText()).includes('2026-09-27')||page.url().includes('2026-09-27'));
  const links=await page.locator('#source-content a').evaluateAll(a=>a.map(x=>x.href));
  assert.ok(links.some(x=>x.includes('on-september-27-2026')));
  await page.locator('#back-guide').click();await page.waitForLoadState('networkidle');
 }
 console.log('PASS: both airports, unit-invariant verdict, date-specific sources');
 for(const city of ['mexico','laguardia']){
  await page.goto(base+'signals/explore/?location='+city+'&day=2026-09-23&unit=C&lang=en',{waitUntil:'networkidle'});
  assert.equal(await page.locator('h1').innerText(),'Advanced exploration');
  for(const view of ['dumbbell','lines','three-d','heatmap','area']){
   await page.locator('[data-view='+view+']').click();
   assert.ok(await page.locator('#main-chart > *').count()>0);
   assert.equal(await page.locator('[data-view='+view+']').getAttribute('aria-pressed'),'true');
  }
  await page.locator('#next-point').click();
  assert.ok((await page.locator('#selected-date').innerText()).includes('24'));
  await page.locator('[data-unit=F]').click();await page.waitForLoadState('networkidle');
  assert.ok((await page.locator('#actual-value').innerText()).includes('°F'));
  await page.locator('[data-sources-open]').click();await page.waitForLoadState('networkidle');
  assert.ok(page.url().includes('/signals/sources/')&&page.url().includes('day=2026-09-24'));
 }
 console.log('PASS: both airports, five advanced charts, day/unit/source handoff');
 for(const [old,target] of [['signals/index.html#professional','signals/explore/'],['signals/guide.html','signals/guide/'],['signals/sources.html','signals/sources/'],['jinxi/index.html','cases/jinxi/'],['nomadcast/index.html','experience/food-drying/'],['nomadcast/decide.html','experience/food-drying/'],['nomadcast/weather-guide.html','signals/introduction/']]){
  await page.goto(base+old,{waitUntil:'networkidle'});assert.ok(page.url().includes(target),old);
 }
 console.log('PASS: seven legacy redirects');
 const {resolveChoice,drawWeather}=await import('../src/game-model.js');
 assert.equal(drawWeather(()=>.59),'rain');assert.equal(drawWeather(()=>.6),'sun');
 for(const weather of ['rain','sun'])for(const choice of ['all','batch','cover','store']){
  const result=resolveChoice(choice,weather);
  assert.equal(result.exposed,weather==='rain'&&['all','batch'].includes(choice));
  await page.goto(base+'experience/food-drying/?lang=en',{waitUntil:'networkidle'});
  await page.evaluate(w=>{Math.random=()=>w==='rain'?.1:.9},weather);
  await page.locator('#start-game').click();await page.locator('#first-choice').waitFor();
  assert.equal(await page.locator('#scene canvas').count(),1);
  await page.locator('[data-first=information]').click();
  await page.locator('[data-choice='+choice+']').click();
  await page.locator('#reveal-weather').click();
  if(weather==='rain'&&choice==='cover'){
   await page.screenshot({path:out+'/game-result-desktop.png',fullPage:true});
   await page.setViewportSize({width:390,height:1000});await page.screenshot({path:out+'/game-result-mobile.png',fullPage:true});await page.setViewportSize({width:1440,height:1000});
  }
  await page.locator('#debrief-link').click();await page.waitForLoadState('networkidle');
  assert.ok(page.url().includes('choice='+choice)&&page.url().includes('weather='+weather));
  assert.equal(await page.locator('.decision-comparison article').count(),4);
 }
 console.log('PASS: real WebGL, eight decision/outcome states and shared-weather debrief');
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'experience/food-drying/?lang=en',{waitUntil:'networkidle'});
 assert.equal(await page.locator('#pause-motion').innerText(),'Resume animation');
 await page.locator('#text-mode').click();await page.locator('#start-game').click();
 assert.equal(await page.locator('#scene canvas').count(),0);
 await page.locator('[data-first=store]').click();await page.locator('#reveal-weather').click();await page.locator('#debrief-link').click();await page.waitForLoadState('networkidle');
 assert.ok(page.url().includes('choice=store')&&page.url().includes('seen=false'));
 console.log('PASS: reduced motion and text alternative complete the same journey');
 fs.writeFileSync(out+'/report.json',JSON.stringify({errors,bad,routes,widths:[1440,768,390,320],gameStates:8},null,2));
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
 await browser.close();console.log('PASS: no JS/console errors or missing local assets');
})().catch(async e=>{console.error(e);await activeBrowser?.close();process.exitCode=1});
