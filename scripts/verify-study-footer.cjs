const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const out=path.resolve('.cache/decision-qa/study-footer');fs.mkdirSync(out,{recursive:true});process.env.TEMP=out;process.env.TMP=out;
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER_EXECUTABLE,args:['--no-proxy-server','--enable-unsafe-swiftshader']});
 try{
  const p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  for(const width of [1440,390])for(const lang of ['zh','en']){
   await p.setViewportSize({width,height:1000});await p.goto(process.env.WEATHERBRIDGE_PREVIEW_URL+'?lang='+lang+'#evidence');await p.locator('#cdd-plot svg').waitFor();await p.locator('#poly-plot svg').waitFor();
   assert.equal(await p.locator('.study-resources>details').count(),3);
   assert.ok(await p.locator('.study-resources').evaluate(e=>e.clientHeight<190),'closed footer stays compact');
   assert.equal(await p.locator('.market-charts details').count(),0,'resource rows share one full-width footer');
   for(const id of ['cdd-method','poly-records','market-sources']){
    await p.locator('#'+id+'>summary').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('#'+id).getAttribute('open'),'');
    assert.ok((await p.locator('#'+id).innerText()).length>80);
    assert.notEqual(await p.locator('#'+id+'>summary').evaluate(e=>getComputedStyle(e).outlineStyle),'none');
    await p.keyboard.press('Enter');
   }
   assert.equal(await p.locator('#cdd-table tbody tr').count(),31);
   await p.locator('#study-polymarket').click();await p.locator('#poly-history-plot svg').waitFor();await p.locator('#study-overview').click();
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no page overflow');
   await p.locator('.study-resources').scrollIntoViewIfNeeded();
   const clip=await p.evaluate(()=>{const r=document.querySelector('.study-resources').getBoundingClientRect(),e=document.querySelector('.historical-entry').getBoundingClientRect();return{x:r.left,y:r.top+scrollY-16,width:r.width,height:e.bottom-r.top+32};});
   await p.screenshot({path:out+'/footer-'+width+'-'+lang+'.png',clip,fullPage:true,style:'wb-header{visibility:hidden!important}'});
   console.log('PASS compact resources, disclosures, keyboard, study switching and layout: '+width+' '+lang);
  }
  assert.deepEqual(errors,[]);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
