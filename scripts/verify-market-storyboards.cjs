const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const out=path.resolve('.cache/decision-qa/market-storyboards');fs.mkdirSync(out,{recursive:true});process.env.TEMP=out;process.env.TMP=out;
const base=process.env.WEATHERBRIDGE_PREVIEW_URL||'http://127.0.0.1:8017/';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
for(const [file,original] of [['weather-futures-storyboard.png','codex-clipboard-7db2a36e-fccd-4645-9db6-e6df75982d96.png'],['prediction-market-storyboard.png','codex-clipboard-6eafd859-fa85-4a8d-9f5a-70f332b4e64d.png']])assert.equal(hash('public/'+file),hash('F:/soft/AppData/Nick/Temp/'+original));
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER_EXECUTABLE,args:['--enable-unsafe-swiftshader']});const errors=[];
try{for(const width of [1440,390])for(const lang of ['zh','en']){
 const p=await b.newPage({viewport:{width,height:1050},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'?lang='+lang+'#market-stories');await p.locator('.intro-bar').first().waitFor({state:'attached'});
 assert.equal(await p.locator('.market-story-pair').count(),0);assert.equal(await p.locator('.market-storyboard').count(),2);
 assert.deepEqual(await p.locator('.market-storyboard').evaluateAll(es=>es.map(e=>e.dataset.storyboard)),['futures','prediction']);
 for(const [i,key] of ['futures','prediction'].entries()){
  const slider=p.locator('#market-story-switch');await slider.focus();await p.keyboard.press(i?'End':'Home');
  const figure=p.locator('.market-storyboard').nth(i),img=figure.locator('img');assert.ok(await figure.isVisible());assert.equal(await p.locator('.market-storyboard').nth(1-i).isVisible(),false);
  await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.decode());assert.equal(await img.evaluate(e=>e.naturalWidth),1672);
  await figure.screenshot({path:path.join(out,`${key}-${width}-${lang}.png`)});
  if(width===390){assert.ok(await figure.locator('.storyboard-scroll').evaluate(e=>e.scrollWidth>e.clientWidth));await figure.locator('.storyboard-scroll').focus();await p.keyboard.press('ArrowRight');await p.waitForFunction(key=>document.querySelector('[data-storyboard="'+key+'"] .storyboard-scroll').scrollLeft>0,key);}
  const button=figure.locator('[data-storyboard-open]');await button.focus();await p.keyboard.press('Enter');assert.ok(await p.locator('#market-storyboard-viewer').isVisible());
  assert.equal(await p.locator('#market-storyboard-viewer img').getAttribute('src'),await img.getAttribute('src').then(s=>new URL(s,base).href));
  await p.locator('#market-storyboard-viewer img').evaluate(e=>e.decode());await p.locator('#market-storyboard-viewer').screenshot({path:path.join(out,`enlarged-${key}-${width}-${lang}.png`)});
  await p.keyboard.press('Escape');assert.equal(await p.locator('#market-storyboard-viewer').isVisible(),false);assert.equal(await button.evaluate(e=>e===document.activeElement),true);assert.equal(await p.locator('html').evaluate(e=>e.classList.contains('storyboard-viewer-open')),false);
 }
 assert.equal(await p.locator('.intro-bar').count(),11);assert.equal(await p.locator('.research-study').count(),2);
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.match(await p.locator('#market-stories').textContent(),lang==='zh'?/400 点.*1,000.*0.40/s:/400 points.*1,000.*0.40/s);
 await p.reload();await p.locator('#market-story-switch').waitFor();assert.ok(await p.locator('#prediction-storyboard').isVisible(),'refresh preserves chosen storyboard');
 const slider=p.locator('#market-story-switch');await slider.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));const box=await slider.boundingBox();await p.mouse.move(box.x+box.width-26,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+26,box.y+box.height/2,{steps:8});await p.mouse.up();assert.ok(await p.locator('#futures-storyboard').isVisible(),'drag returns to weather futures');
 await p.locator('#story-tab-prediction').click();assert.ok(await p.locator('#prediction-storyboard').isVisible());
 await p.locator('#market-stories').screenshot({path:path.join(out,`switcher-${width}-${lang}.png`),style:'wb-header{visibility:hidden!important}'});
 if(lang==='en')assert.doesNotMatch(await p.locator('#market-stories').innerText(),/[\u4e00-\u9fff]/);
 console.log(`PASS supplied storyboards, ordering, contained scrolling, keyboard zoom and return focus: ${width} ${lang}`);await p.close();
}assert.deepEqual(errors,[]);}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
