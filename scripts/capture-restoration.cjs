const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const path=require('node:path'),fs=require('node:fs');
const out=path.resolve('.cache/decision-qa/restoration');fs.mkdirSync(out,{recursive:true});process.env.TEMP=out;process.env.TMP=out;
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER_EXECUTABLE,args:['--no-proxy-server','--enable-unsafe-swiftshader']});
 try{
  const p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),base=process.env.WEATHERBRIDGE_PREVIEW_URL;
  const shot=async(selector,name)=>{await p.locator(selector).scrollIntoViewIfNeeded();await p.locator(selector).screenshot({path:out+'/'+name+'.png',style:'wb-header{visibility:hidden!important}'});};
  await p.goto(base+'?lang=zh');await p.locator('#cdd-plot svg').waitFor();await p.locator('#weather-network svg').waitFor();
  for(const [selector,name]of [['#hero','hero-1440-zh'],['#malawi','malawi-1440-zh'],['#mexico','mexico-1440-zh'],['#polymarket','mechanisms-1440-zh']])await shot(selector,name);
  await p.setViewportSize({width:390,height:1000});await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:out+'/navigation-390-zh.png'});
  await p.setViewportSize({width:1440,height:1000});await p.goto(base+'?lang=zh&scenario=heavy&replay=heavy#action');await p.locator('[data-decision=skip]:not(:disabled)').waitFor();
  await p.locator('[data-decision=skip]').click();await p.locator('[data-scene-object=shelter]').click();await p.locator('[data-decision=prepared]:not(:disabled)').click();await shot('#action','contract-1440-zh');
  console.log('Saved final chapter, navigation and courtyard screenshots without sticky-header stitching artifacts.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
