const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const out=path.resolve('.cache/decision-qa/research-links');fs.mkdirSync(out,{recursive:true});process.env.TEMP=out;process.env.TMP=out;
const base=process.env.WEATHERBRIDGE_PREVIEW_URL||'http://127.0.0.1:8017/';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(hash('public/research-documents/weather-risk-hedging-original.html'),hash('C:/Users/Nick/Downloads/weatherbridge_weather_risk_hedging.html'));
assert.equal(hash('public/research-documents/polymarket-research.html'),hash('C:/Users/Nick/Downloads/weatherbridge_polymarket_research.html'));
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER_EXECUTABLE,args:['--enable-unsafe-swiftshader']});const errors=[];
try{for(const width of [1440,390])for(const lang of ['zh','en']){
 const p=await b.newPage({viewport:{width,height:1050},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'?lang='+lang+'#why-polymarket');await p.locator('.intro-bar').first().waitFor({state:'attached'});
 const pair=p.locator('.research-study-pair');
 assert.equal(await pair.locator(':scope > article').count(),2);
 assert.equal(await pair.locator('iframe,details').count(),0);
 assert.equal(await pair.locator('.research-full-link').count(),2);
 assert.equal(await p.locator('.intro-bar').count(),11);
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.locator('#why-polymarket').screenshot({path:path.join(out,`summaries-${width}-${lang}.png`)});
 for(const type of ['weather','prediction']){
  const link=p.locator('#'+type+'-research-full');assert.equal(await link.getAttribute('target'),null);
  await link.focus();assert.notEqual(await link.evaluate(e=>getComputedStyle(e).outlineStyle),'none');
  await Promise.all([p.waitForURL('**/research-documents/*.html'),p.keyboard.press('Enter')]);
  assert.equal(await p.locator('iframe').count(),0);
  if(type==='weather'){
   await p.locator('#after').waitFor();assert.equal(await p.locator('#after').innerText(),'$500');
   await p.locator('#count').focus();await p.keyboard.press('ArrowRight');await p.locator('[data-settle="350"]').click();
   assert.equal(await p.locator('#after').innerText(),'$3,500');
  }else{
   assert.match(await p.locator('h1').innerText(),/集体判断/);
   await p.locator('#price').focus();await p.keyboard.press('ArrowRight');
   assert.equal(await p.locator('#pVal').innerText(),'$0.45');
   assert.equal(await p.locator('#win').innerText(),'+$0.55');
   assert.equal(await p.locator('#lose').innerText(),'−$0.45');
   await p.screenshot({path:path.join(out,`full-prediction-${width}-${lang}.png`)});
  }
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),type+' page contained');
  await p.goBack();await p.locator('#why-polymarket').waitFor();
  assert.equal(await p.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
 }
 console.log(`PASS standalone full-page navigation, browser return, source hashes, both interactive examples: ${width} ${lang}`);await p.close();
}assert.deepEqual(errors,[]);}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
