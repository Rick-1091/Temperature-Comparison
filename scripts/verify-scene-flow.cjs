const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const out=path.resolve('.cache/decision-qa/restoration');fs.mkdirSync(out,{recursive:true});process.env.TEMP=out;process.env.TMP=out;
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER_EXECUTABLE,args:['--no-proxy-server','--enable-unsafe-swiftshader']});
 try{
  const p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  await p.goto((process.env.WEATHERBRIDGE_PREVIEW_URL||'http://127.0.0.1:8031/')+'?lang=zh&scenario=heavy&replay=heavy#action');
  await p.locator('[data-decision=skip]:not(:disabled)').waitFor();
  await p.locator('[data-decision=skip]').click();await p.locator('[data-scene-object=shelter]').click();
  await p.evaluate(()=>scrollTo(0,0));
  try{await p.waitForFunction(()=>document.querySelector('#action').dataset.busy==='false',{},{timeout:12000});}
  catch(e){console.log('Scene stall:',await p.evaluate(()=>({stage:document.getElementById('action').dataset,scene:document.getElementById('scene').dataset,rect:document.querySelector('.diorama').getBoundingClientRect().toJSON(),hidden:document.hidden,status:document.getElementById('game-status').textContent})));throw e;}
  await p.locator('[data-decision=prepared]:not(:disabled)').click();
  await p.locator('[data-decision=buy]:not(:disabled)').click();await p.locator('[data-decision=reveal]:not(:disabled)').click();
  await p.locator('#decision-results:not([hidden])').waitFor();assert.match(await p.locator('.net-selected strong').innerText(),/77.6/);
  console.log('PASS active preparation completes after scrolling away; cost, weather and outcome remain operable');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
