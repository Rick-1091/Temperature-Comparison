const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT_MODULE||process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const out='.cache/decision-qa',base=process.env.WEATHERBRIDGE_PREVIEW_URL||'http://127.0.0.1:8017/';
const format=n=>(n>0?'+':n<0?'−':'')+Number(Math.abs(n).toFixed(1)).toLocaleString('en');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const temp=require('node:path').resolve(out);process.env.TEMP=temp;process.env.TMP=temp;process.env.TMPDIR=temp;
 const {resolveDecision,drawOutcome,PREPARATIONS}=await import('../src/decision-model.js');
 await import('./verify-decision-accounting.mjs');
 const {transportBeat,routePoint,TRANSPORT_ROUTES}=await import('../src/decision-motion.js');
 assert.equal(transportBeat(.02).step,'pick');assert.equal(transportBeat(.1).step,'carry');assert.equal(transportBeat(.2).step,'place');assert.equal(transportBeat(.3).step,'return');assert.equal(transportBeat(1).step,'done');
 for(const route of Object.values(TRANSPORT_ROUTES)){assert.deepEqual(routePoint(route,0).point,route[0]);assert.deepEqual(routePoint(route,1).point,route.at(-1));}
 assert.equal(drawOutcome(()=>.1),'dry');assert.equal(drawOutcome(()=>.5),'light');assert.equal(drawOutcome(()=>.9),'heavy');
 for(const weather of ['dry','light','heavy'])for(const prep of Object.keys(PREPARATIONS)){
  const no=resolveDecision(prep,weather,false),yes=resolveDecision(prep,weather,true);
  assert.equal(no.physicalLoss,yes.physicalLoss);assert.equal(no.drying,yes.drying);
  assert.ok(Math.abs(yes.net-no.net-(weather==='heavy'?18:-12))<.001);
  assert.equal(yes.payout,weather==='heavy'?30:0);
  assert.ok(Math.abs(yes.net-(yes.drying-yes.physicalLoss-yes.preparationCost-yes.premium+yes.payout))<.001);
  if(prep==='store'||prep==='shelter'&&weather==='light')assert.equal(yes.physicalLoss,0);
 }
 const browser=await chromium.launch({headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER_EXECUTABLE||process.env.WEATHERBRIDGE_BROWSER||undefined,args:['--enable-unsafe-swiftshader']});
 const errors=[];
 async function open(p,selector){if(!await p.locator(selector).evaluate(e=>e.open))await p.locator(selector+' > summary').click();}
 async function page(width=1440,lang='zh',weather='heavy',reduce=true){
  const p=await browser.newPage({viewport:{width,height:1100},reducedMotion:reduce?'reduce':'no-preference'});p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'?lang='+lang+'&replay='+weather+'#action');await p.locator('#scene canvas').waitFor();await p.locator('[data-decision=view]').waitFor({state:'visible'});await p.waitForFunction(()=>!document.querySelector('[data-decision=view]').disabled);return p;
 }
 try{
  for(const [prep,count] of [['all',0],['shelter',48],['store',48]]){
   const p=await page();await p.locator('[data-decision=skip]').click();
   await p.locator('[data-scene-object='+prep+']').click();
   await p.waitForFunction(()=>document.querySelector('#action').dataset.busy==='false');assert.equal(await p.locator('#scene').getAttribute('data-protected-ears'),String(count));
   await p.locator('[data-decision=prepared]').click();await p.locator('[data-scene-object=hedge]').click();assert.equal(await p.locator('#scene').getAttribute('data-finance'),'none','Viewing terms must not buy');
   assert.equal(await p.evaluate(()=>document.activeElement.id),'contract-heading');assert.equal(await p.locator('#decision-receipt').isVisible(),false);
   assert.deepEqual(await p.locator('.contract-preview tbody td:last-child').allTextContents(),['−12','−12','+18']);
   await p.locator('[data-decision=buy]').click();assert.equal(await p.locator('#scene').getAttribute('data-finance'),'cost');
   await p.locator('[data-decision=reveal]').click();await p.waitForFunction(()=>document.querySelector('#action').dataset.decisionStage==='result');
   assert.deepEqual(await p.locator('#decision-receipt dd').allTextContents(),['−12','+30','+18']);
   for(const w of ['heavy','light','dry']){
    if(w!=='heavy'){await open(p,'.weather-detail');await p.locator('[data-weather-replay='+w+']').click();await p.waitForFunction(()=>document.querySelector('#action').dataset.decisionStage==='result');assert.equal(await p.locator('.weather-detail').evaluate(e=>e.open),true,'Keep the comparison open after a weather replay');}
    assert.equal(await p.locator('#scene').getAttribute('data-weather'),w);
    assert.equal(await p.locator('#scene').getAttribute('data-finance'),w==='heavy'?'payout':'no-payout');
    assert.deepEqual(await p.locator('#decision-receipt dd').allTextContents(),w==='heavy'?['−12','+30','+18']:['−12','0','−12']);
    assert.equal(await p.locator('.net-selected strong').innerText(),format(resolveDecision(prep,w,true).net));
    assert.equal(await p.locator('.result-equation strong').innerText(),'= '+format(resolveDecision(prep,w,true).net));
    assert.ok((await p.locator('.result-equation').innerText()).includes('准备成本'),'Preparation cost remains visible without opening the ledger');
    assert.ok((await p.locator('.result-equation').innerText()).includes('雨天少晒损失'),'Weather interruption must not disappear into a changing baseline');
    assert.ok((await p.locator('.result-weather-name').innerText()).includes({dry:'无雨',light:'小雨',heavy:'暴雨'}[w]),'Name the actual weather beside the result, including on compact screens');
    assert.equal(await p.locator('.weather-accounting-table tbody tr').count(),12);
    assert.deepEqual(await p.locator('.weather-accounting-table tbody tr').nth(5).locator('td').allTextContents(),['dry','light','heavy'].map(weather=>format(resolveDecision(prep,weather,false).net)));
    assert.deepEqual(await p.locator('.weather-accounting-table tbody tr').nth(8).locator('td').allTextContents(),['dry','light','heavy'].map(weather=>format(resolveDecision(prep,weather,'light').net)));
    assert.deepEqual(await p.locator('.weather-accounting-table tbody tr').nth(11).locator('td').allTextContents(),['dry','light','heavy'].map(weather=>format(resolveDecision(prep,weather,'heavy').net)));
    assert.ok((await p.locator('.weather-difference-note').innerText()).includes(prep==='store'?'不是把小雨算成无雨':'小雨多损失'));
    assert.equal(await p.locator('#scene').getAttribute('data-wet-ears'),w!=='dry'&&resolveDecision(prep,w).exposure>0?'48':'0');
    assert.equal(await p.locator('#scene').getAttribute('data-shelter-ingress'),String(prep==='shelter'&&w==='heavy'));
    assert.equal(await p.locator('#scene').getAttribute('data-protected-ears'),String(Math.round(resolveDecision(prep,w).protected*48)));
    await p.locator('#scene').screenshot({path:`${out}/rain-${prep}-${w}.png`});
    assert.deepEqual(await p.locator('.settlement-steps strong').allTextContents(),[format(resolveDecision(prep,w,true).unhedged),'−12',w==='heavy'?'+30':'0',format(resolveDecision(prep,w,true).net)]);
    assert.equal(await p.locator('.decision-table tbody tr').count(),3);
   }await p.close();
  }
  for(const width of [1440,768,390,320])for(const lang of ['zh','en']){
   const p=await page(width,lang);await p.locator('[data-scene-object=signal]').click();
   assert.deepEqual(await p.locator('.signal-quote strong').allTextContents(),[32,28,40].map(price=>price+' '+(lang==='zh'?'美分':'cents')));
   assert.equal(await p.locator('.signal-market').innerText().then(text=>text.includes('¢')),false,'Use readable unit labels instead of the rejected cent glyph');
   assert.equal(await p.locator('.signal-chart polyline').count(),1,'Inspect one trace, not three crossing curves');
   for(const signalWeather of ['light','dry','heavy']){
    await p.locator('[data-signal-weather='+signalWeather+']').click();
    assert.equal(await p.locator('.signal-quote[aria-pressed=true]').getAttribute('data-signal-weather'),signalWeather);
    assert.ok((await p.locator('.signal-chart-title').innerText()).includes(lang==='zh'?{light:'小雨',dry:'无雨',heavy:'暴雨'}[signalWeather]:{light:'Light',dry:'Dry',heavy:'Heavy'}[signalWeather]));
    assert.equal(await p.locator('.signal-chart polyline').count(),1);
    assert.ok((await p.locator('.signal-price-help').innerText()).includes({light:'0.28',dry:'0.32',heavy:'0.40'}[signalWeather]),'Keep the cents-to-dollars explanation exact');
    assert.equal(await p.locator('#scene').getAttribute('data-finance'),'none','Viewing a quote does not buy');
   }
   assert.ok((await p.locator('.signal-market figcaption').innerText()).includes(lang==='zh'?'非实时':'not live'),'The market image must be labelled as simulated');
   assert.equal(await p.locator('.judgment-stream,.signal-column').count(),0,'No decorative stream or duplicate bar chart');
   await p.locator('.decision-diorama').screenshot({path:`${out}/market-${width}-${lang}.png`});
   await open(p,'.signal-detail');const signalCopy=await p.locator('.signal-detail').innerText();assert.ok(signalCopy.includes(lang==='zh'?'对应结果发生时支付':'matching outcome pays'));assert.ok(!/演示编排|authored examples/.test(signalCopy),'Do not repeat the simulation badge as a long disclaimer');await p.locator('.signal-detail summary').click();
   await p.locator('[data-decision=continue]').click();await p.locator('.decision-diorama').screenshot({path:`${out}/prepare-${width}-${lang}.png`});
   assert.equal(await p.locator('.preparation-intro').count(),1,'One task instruction, moved rather than duplicated');
   if(width<=1050)assert.ok(await p.evaluate(()=>document.querySelector('#decision-task').getBoundingClientRect().bottom<=document.querySelector('#scene').getBoundingClientRect().top),'Read the task before encountering scene controls');
   assert.equal(await p.locator('.storage-choices').count(),0,'Storage choices appear only when storage is selected');
   const labels=await p.locator('.scene-object:not([hidden])').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom}}));assert.ok(labels.every(r=>r.left>=0&&r.right<=width),'Hotspot offscreen');
   for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i],b=labels[j];assert.ok(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top,'Overlapping scene controls '+width+' '+lang);}
   await p.locator('[data-scene-object=shelter]').click();await p.waitForFunction(()=>document.querySelector('#action').dataset.busy==='false');
   assert.equal(await p.locator('[data-decision=prepared]').count(),1,'One preparation continuation');
   assert.equal(await p.locator('#decision-world-actions [data-decision=prepared]').count(),0,'Read the numbers before continuing');
   assert.ok(await p.evaluate(()=>Boolean(document.querySelector('.preparation-readout').compareDocumentPosition(document.querySelector('[data-decision=prepared]')) & Node.DOCUMENT_POSITION_FOLLOWING)),'Preparation values precede the next-step button');
   assert.equal(await p.evaluate(()=>document.activeElement.dataset.decision),'prepared','Completion hands keyboard focus to the continuation');
   await p.keyboard.press('Enter');assert.equal(await p.locator('#action').getAttribute('data-decision-stage'),'hedge');
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Contract viewport overflow '+width+' '+lang);
   const choices=await p.locator('.hedge-buttons button').evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e);return [s.backgroundColor,s.border,s.fontWeight,e.getAttribute('aria-pressed')];}));assert.equal(choices.length,3);assert.deepEqual(choices[0],choices[1],'Neutral unselected contract choices');assert.deepEqual(choices[1],choices[2]);
   assert.equal(await p.locator('.hedge-buttons [aria-pressed=true]').count(),0);
   assert.equal(await p.locator('.contract-preview').isVisible(),false,'Full terms are on demand');
   await p.locator('#decision-panel').screenshot({path:`${out}/contract-${width}-${lang}.png`});
   assert.equal(await p.locator('.contract-detail').evaluate(e=>getComputedStyle(e).boxShadow),'none');
   await p.locator('.contract-detail summary').click();assert.ok((await p.locator('.contract-detail').innerText()).includes('30'));await p.locator('.contract-detail summary').click();
   await p.locator('[data-decision=no-hedge]').click();assert.equal(await p.locator('#decision-panel [data-decision=reveal]').count(),1,'Declining keeps the next step beside the choice');await p.locator('[data-decision=reveal]').click();await p.waitForFunction(()=>document.querySelector('#action').dataset.decisionStage==='result');
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Viewport overflow '+width+' '+lang);
   assert.equal(await p.locator('a[href="#decision-results"]').count(),1,'One results continuation');
   assert.equal(await p.locator('#decision-condition').isVisible(),true);
   assert.equal(await p.locator('.settlement-track').count(),0,'No empty contract chart when declined');
   assert.equal(await p.locator('.net-comparison > div').count(),3,'No contract, light and heavy comparisons');
   await p.locator('.decision-diorama').screenshot({path:`${out}/result-${width}-${lang}.png`});
   await open(p,'.weather-detail');
   assert.equal(await p.locator('.weather-accounting-table').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,'Weather table itself must fit '+width+' '+lang);
   assert.equal(await p.locator('.weather-accounting-table td').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+1)),true,'Do not clip numeric values '+width+' '+lang);
   await p.locator('.weather-accounting').screenshot({path:`${out}/accounting-${width}-${lang}.png`});
   await p.locator('[data-weather-replay=light]').click();await p.waitForFunction(()=>document.querySelector('#action').dataset.decisionStage==='result');
   assert.equal(await p.locator('.weather-detail').evaluate(e=>e.open),true);
   assert.equal(await p.locator('.result-weather-name').innerText(),lang==='zh'?'小雨 · 午后较晚到来':'Light rain · arrives late');
   assert.equal(await p.locator('.net-selected strong').innerText(),'+11.5');
   await p.locator('#decision-restart').click();assert.equal(await p.locator('#action').getAttribute('data-decision-stage'),'signal');
   assert.equal(await p.locator('#decision-results details').count(),0,'Restart must clear the previous comparison');await p.close();
  }
  // Each preparation with a light contract: all weather triggers and exact receipts.
  for(const prep of Object.keys(PREPARATIONS)){
   const p=await page(1440,'zh','light');await p.locator('[data-decision=skip]').click();
   await p.locator('[data-scene-object='+prep+']').click();
   await p.waitForFunction(()=>document.querySelector('#action').dataset.busy==='false');await p.locator('[data-decision=prepared]').click();
   if(prep==='all')await p.locator('[data-decision=buy]').click();
   await p.locator('[data-decision=buy-light]').click();assert.equal(await p.locator('#scene').getAttribute('data-contract-type'),'light');
   assert.deepEqual(await p.locator('#decision-receipt dd').allTextContents(),['−8.4','待揭晓','—'],'Changing contract replaces the simulated cost, not a second charge');
   assert.ok((await p.locator('#contract-heading').innerText()).includes('小雨合约'));
   await p.locator('[data-decision=reveal]').click();await p.waitForFunction(()=>document.querySelector('#action').dataset.decisionStage==='result');
   for(const w of ['light','heavy','dry']){
    if(w!=='light'){await open(p,'.weather-detail');await p.locator('[data-weather-replay='+w+']').click();await p.waitForFunction(()=>document.querySelector('#action').dataset.decisionStage==='result');}
    const result=resolveDecision(prep,w,'light');
    assert.equal(await p.locator('.net-selected strong').innerText(),format(result.net));
    assert.deepEqual(await p.locator('#decision-receipt dd').allTextContents(),['−8.4',w==='light'?'+30':'0',w==='light'?'+21.6':'−8.4']);
    assert.equal(await p.locator('#scene').getAttribute('data-finance'),w==='light'?'payout':'no-payout');
    assert.ok((await p.locator('.hedge-explanation').innerText()).includes(w==='light'?'小雨符合支付条件':'不符合支付条件'));
   }await p.close();
  }
  // Real motion: shelter/storage transport, wind-driven rain, cost and payout.
  const p=await page(1440,'zh','heavy',false);await p.locator('[data-decision=skip]').click();
  await p.locator('[data-scene-object=shelter]').click();await p.waitForFunction(()=>document.querySelector('#scene').dataset.actionBeat==='carry');await p.locator('#scene').screenshot({path:out+'/transport-mid.png'});assert.equal(await p.locator('#scene').getAttribute('data-busy'),'true');assert.ok(Number(await p.locator('#scene').getAttribute('data-carried-ears'))>0);assert.equal(await p.locator('#scene').getAttribute('data-protected-ears'),'0');
  await p.waitForFunction(()=>document.querySelector('#action').dataset.busy==='false');await p.locator('#scene').screenshot({path:out+'/shelter-ready.png'});
  await p.locator('[data-scene-object=store]').click();await p.waitForFunction(()=>document.querySelector('#scene').dataset.actionBeat==='carry');await p.locator('#scene').screenshot({path:out+'/storage-mid.png'});await p.waitForFunction(()=>document.querySelector('#action').dataset.busy==='false');assert.equal(await p.locator('#scene').getAttribute('data-protected-ears'),'48');
  await p.locator('[data-scene-object=shelter]').click();await p.waitForFunction(()=>document.querySelector('#action').dataset.busy==='false');
  await p.locator('[data-decision=prepared]').click();await p.locator('[data-decision=buy]').click();await p.waitForTimeout(250);assert.equal(await p.locator('[data-decision=reveal]').isDisabled(),true);await p.locator('#scene').screenshot({path:out+'/cost-transfer.png'});
  await p.locator('[data-decision=reveal]').click();await p.waitForFunction(()=>document.querySelector('#action').dataset.decisionStage==='result');await p.waitForTimeout(400);await p.locator('#scene').screenshot({path:out+'/rain-payout.png'});await p.waitForTimeout(1000);
  assert.equal(await p.locator('.net-selected strong').innerText(),format(resolveDecision('shelter','heavy',true).net));
  assert.equal(await p.locator('.result-detail').evaluate(e=>e.open),false);assert.equal(await p.locator('.cash-flow').count(),0);await open(p,'.result-detail');
  await p.locator('.settlement-bridge').screenshot({path:out+'/contract-settled-desktop.png'});
  await open(p,'.motion-options');await p.locator('#decision-pause').click();
  assert.equal(await p.locator('.result-detail').evaluate(e=>e.open),true,'Pausing preserves the open result calculation');
  assert.equal(await p.evaluate(()=>document.activeElement.id),'decision-pause','Pausing keeps keyboard focus');
  await p.locator('#decision-pause').click();
  assert.equal(await p.locator('#scene').getAttribute('data-transfer-direction'),'to-household');
  // Restoring WebGL must restore an outcome, not debit the contract again.
  await open(p,'.motion-options');await p.locator('#decision-text').click();await p.locator('#decision-text').click();await p.locator('#scene canvas').waitFor();
  await p.waitForFunction(()=>document.querySelector('#scene').getAttribute('aria-busy')==='false');
  assert.equal(await p.locator('#scene').getAttribute('data-protected-ears'),'0');assert.equal(await p.locator('#scene').getAttribute('data-wet-ears'),'48');assert.equal(await p.locator('#scene').getAttribute('data-shelter-ingress'),'true');assert.equal(await p.locator('#scene').getAttribute('data-weather'),'heavy');assert.equal(await p.locator('#scene').getAttribute('data-finance'),'payout');
  assert.deepEqual(await p.locator('#decision-receipt dd').allTextContents(),['−12','+30','+18']);
  // Context loss must not strand the state machine.
  await p.locator('#scene canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await p.locator('.decision-fallback').waitFor();
  await p.locator('#decision-restart').click();await p.locator('[data-decision=skip]').click();await p.locator('[data-fallback-object=store]').click();await p.locator('[data-decision=prepared]').click();await p.locator('[data-decision=no-hedge]').click();await p.locator('[data-decision=reveal]').click();await p.waitForFunction(()=>document.querySelector('#action').dataset.decisionStage==='result');await p.close();
  // Keyboard path, interrupted preparation, live locale/reduced-motion changes.
  const k=await page(390,'en','light',false);
  await k.locator('[data-scene-object=signal]').focus();await k.keyboard.press('Enter');assert.equal(await k.locator('#scene').getAttribute('data-signal-viewed'),'true');
  await k.locator('[data-decision=continue]').focus();await k.keyboard.press('Enter');await k.locator('[data-scene-object=shelter]').focus();await k.keyboard.press('Enter');
  await open(k,'.motion-options');await k.locator('#decision-pause').click();await k.waitForFunction(()=>document.querySelector('#action').dataset.busy==='false');assert.equal(await k.locator('#scene').getAttribute('data-protected-ears'),'48');
  await k.locator('[data-decision=prepared]').click();await k.locator('[data-scene-object=hedge]').focus();await k.keyboard.press('Enter');assert.equal(await k.evaluate(()=>document.activeElement.id),'contract-heading');assert.equal(await k.locator('#scene').getAttribute('data-finance'),'none');
  await open(k,'.contract-detail');await k.locator('#decision-pause').click();
  assert.equal(await k.locator('.contract-detail').evaluate(e=>e.open),true,'Resuming preserves contract terms');
  const readingPosition=await k.evaluate(()=>scrollY);await k.locator('#decision-pause').click();
  assert.equal(await k.locator('.contract-detail').evaluate(e=>e.open),true,'Pausing preserves contract terms');
  assert.ok(Math.abs(await k.evaluate(()=>scrollY)-readingPosition)<=1,'Pause keeps the reading position');
  await k.locator('[data-decision=buy]').focus();await k.keyboard.press('Enter');assert.deepEqual(await k.locator('#decision-receipt dd').allTextContents(),['−12','Pending','—']);
  await k.locator('[data-decision=reveal]').click();await k.waitForFunction(()=>document.querySelector('#action').dataset.decisionStage==='result');assert.deepEqual(await k.locator('#decision-receipt dd').allTextContents(),['−12','0','−12']);
  await k.evaluate(()=>{document.documentElement.lang='zh-CN';window.dispatchEvent(new CustomEvent('wb-language'));});assert.ok((await k.locator('#decision-receipt').innerText()).includes('合约净收支'));
  await k.emulateMedia({reducedMotion:'reduce'});await k.waitForFunction(()=>document.querySelector('#decision-pause').hidden);
  await k.locator('#decision-restart').click();assert.equal(await k.locator('#scene').getAttribute('data-signal-viewed'),'false');assert.equal(await k.locator('#decision-receipt').isVisible(),false);assert.equal(await k.locator('#scene').getAttribute('data-finance'),'none');await k.close();
  // Narrow-screen actions must be visible while playing, not run above the viewport.
  const m=await page(390,'zh','light',false);await m.setViewportSize({width:390,height:780});await m.locator('[data-decision=skip]').click();
  await m.locator('[data-scene-object=shelter]').focus();assert.equal(await m.locator('#scene').getAttribute('data-preview-object'),'shelter');
  const mobileCarry=m.waitForFunction(()=>{const s=document.querySelector('#scene'),r=s.getBoundingClientRect();return s.dataset.actionBeat==='carry'&&r.top>=-1&&r.bottom<=innerHeight+1;});
  await m.locator('[data-scene-object=store]').click();await mobileCarry;await m.locator('.decision-world').screenshot({path:out+'/mobile-visible-carry.png'});
  await m.waitForFunction(()=>document.querySelector('#action').dataset.busy==='false');assert.equal(await m.locator('#scene').getAttribute('data-preview-object'),'');
  await m.locator('[data-decision=prepared]').click();await m.locator('[data-decision=buy-light]').click();await m.waitForFunction(()=>document.querySelector('#action').dataset.busy==='false');
  await m.locator('#decision-world-actions [data-decision=reveal]').click();await m.waitForFunction(()=>document.querySelector('#action').dataset.decisionStage==='result');
  assert.deepEqual(await m.locator('.settlement-steps strong').allTextContents(),['−5','−8.4','+30','+16.6'],'Settlement amounts stay exact during bar animation');
  assert.ok((await m.locator('#decision-condition').innerText()).includes('已收储：48 穗'));assert.equal(await m.locator('#decision-world-actions a[href="#decision-results"]').count(),1);
  await m.locator('.decision-world').screenshot({path:out+'/mobile-visible-outcome.png'});
  await open(m,'.result-detail');await m.locator('.settlement-bridge').screenshot({path:out+'/contract-settled-mobile.png'});
  await open(m,'.weather-detail');await m.locator('[data-weather-replay=dry]').click();await m.waitForFunction(()=>document.querySelector('#action').dataset.decisionStage==='result');assert.ok((await m.locator('#decision-condition').innerText()).includes('已收储：48 穗'));await m.close();
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({modelCases:27,contractChoices:['none','light','heavy'],preparations:3,weather:3,hedge:true,signalOptional:true,viewports:[1440,768,390,320],languages:['zh','en'],reducedMotion:true,contextLoss:true,animations:['shelter-transport','storage-transport','shelter-ingress','cost','rain','payout'],errors},null,2));
  console.log('PASS: decision model, three preparations, three weather outcomes, hedge receipts, 8 responsive/locale paths, real animations, keyboard, interruption, WebGL restoration and context-loss fallback');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
