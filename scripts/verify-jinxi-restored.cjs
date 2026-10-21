const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('.cache/decision-qa/jinxi-restored');fs.mkdirSync(out,{recursive:true});process.env.TEMP=out;process.env.TMP=out;
const base=process.env.WEATHERBRIDGE_PREVIEW_URL||'http://127.0.0.1:8017/';
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER_EXECUTABLE,args:['--enable-unsafe-swiftshader']});const errors=[];
try{for(const width of [1440,390])for(const lang of ['zh','en']){
 const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'?lang='+lang+'#jinxi');await p.locator('#field-title').waitFor();
 assert.equal(new URL(p.url()).pathname,'/');assert.equal(await p.locator('#jinxi').count(),1);
 assert.deepEqual(await p.locator('main>section').evaluateAll(es=>es.slice(0,3).map(e=>e.id)),['hero','jinxi','malawi']);
 assert.equal(await p.locator('#hero a.primary').getAttribute('href'),'#jinxi');
 for(const [key,photo] of [['boats','tour-boats'],['food','smoked-beans'],['making','brick-process'],['cafe','canal-coffee']]){
  const button=p.locator('#jinxi [data-scene='+key+']');await button.focus();await p.keyboard.press('Enter');
  await p.waitForFunction(name=>document.querySelector('#field-photo').src.includes(name),photo);
  await p.locator('#field-photo').evaluate(e=>e.decode());assert.equal(await button.getAttribute('aria-pressed'),'true');
 }
 assert.equal(await p.locator('#jinxi-water').count(),1);
 await p.locator('#jinxi').screenshot({path:path.join(out,`restored-${width}-${lang}.png`),style:'wb-header{visibility:hidden!important}'});
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 if(lang==='en')assert.doesNotMatch(await p.locator('#jinxi').innerText(),/[\u4e00-\u9fff]/);
 await p.reload();await p.locator('#field-title').waitFor();assert.equal(new URL(p.url()).pathname,'/');
 await p.goto(base+'research/?lang='+lang+'#jinxi');await p.waitForURL(url=>url.pathname==='/'&&url.hash==='#jinxi');await p.locator('#field-title').waitFor();
 console.log(`PASS restored homepage order, four photo scenes, keyboard, old links and refresh: ${width} ${lang}`);await p.close();
}assert.deepEqual(errors,[]);}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
