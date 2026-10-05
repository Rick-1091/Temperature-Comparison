const {chromium}=require('C:/Users/Nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
const out='.cache/evidence-restoration-qa';fs.mkdirSync(out,{recursive:true});
const context=await chromium.launchPersistentContext(out+'/profile',{headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',viewport:{width:1440,height:1000},args:['--enable-unsafe-swiftshader'],reducedMotion:'reduce'});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
await page.goto('http://127.0.0.1:8017/?lang=zh',{waitUntil:'networkidle'});
await page.waitForSelector('#accuracy-history path.strictRate');
assert.equal(await page.locator('#polymarket h2').innerText(),'Polymarket 是一个预测市场。');
assert.ok((await page.locator('#polymarket').innerText()).includes('例如气温、降雨、飓风或选举结果'));
assert.equal(await page.locator('#malawi figcaption').innerText(),'托科 · 非洲马拉维农户');
assert.equal(await page.locator('#mexico figcaption').innerText(),'迭戈 · 帕蒂奥咖啡馆店主');
assert.deepEqual(await page.locator('main > section[id]').evaluateAll(es=>es.map(e=>e.id).filter(id=>['polymarket','evidence','why-polymarket'].includes(id))),['polymarket','evidence','why-polymarket']);
await page.locator('#legacy-evidence-frame').scrollIntoViewIfNeeded();
const frame=page.frameLocator('#legacy-evidence-frame');
await frame.locator('#main-chart path, #main-chart rect').first().waitFor();
assert.equal(await frame.locator('[data-view]').count(),5);
for(const view of ['dumbbell','lines','three-d','heatmap','area']){
await frame.locator('[data-view="'+view+'"]').click();
assert.equal(await frame.locator('[data-view="'+view+'"]').getAttribute('aria-pressed'),'true');
assert.ok(await frame.locator('#main-chart').evaluate(e=>e.children.length>0));
}
await page.locator('.legacy-evidence').screenshot({path:out+'/restored-desktop.png'});
for(const width of [1440,768,390,320]){
await page.setViewportSize({width,height:1000});
for(const lang of ['zh','en']){
await page.locator('[data-language="'+lang+'"]').click();
await page.waitForTimeout(200);
await page.evaluate(()=>document.fonts.ready);
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page overflow '+width+' '+lang);
const type=await page.locator('#hero h1').evaluate(e=>{const s=getComputedStyle(e);return {font:s.fontFamily,weight:s.fontWeight,tracking:s.letterSpacing,line:s.lineHeight,size:s.fontSize}});
assert.equal(type.weight,'600');
assert.ok(type.font.includes(lang==='en'?'Inter Tight':'PingFang SC'));
if(lang==='en')assert.ok(Math.abs(parseFloat(type.line)/parseFloat(type.size)-.98)<.01);
assert.ok((await page.locator('#malawi p').first().evaluate(e=>getComputedStyle(e).fontFamily)).includes('IBM Plex Sans'));
assert.ok(await page.locator('h1,h2,h3').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+1)),'heading overflow '+width+' '+lang);
}
}
await page.locator('#legacy-evidence-frame').scrollIntoViewIfNeeded();
await frame.locator('[data-view="heatmap"]').waitFor();
await frame.locator('html[lang="en"]').waitFor();
assert.ok((await frame.locator('html').getAttribute('lang')).startsWith('en'));
await frame.locator('[data-view="heatmap"]').click();
assert.ok(await frame.locator('.workspace-head').evaluate(e=>e.scrollWidth<=e.clientWidth),'embedded header overflow');
await page.locator('.legacy-evidence').screenshot({path:out+'/restored-mobile-en.png'});
assert.equal(await page.locator('#malawi figcaption').innerText(),'Thoko · Farmer in Malawi, Africa');
assert.equal(await page.locator('#mexico figcaption').innerText(),'Diego · Owner of Café Patio');
assert.ok(await page.evaluate(()=>[...document.fonts].some(f=>f.family.includes('Inter Tight')&&f.status==='loaded')));
assert.ok((await page.locator('#accuracy-summary').innerText()).includes('6/9'));
await page.route('**/*inter-tight*.woff2',r=>r.abort());
await page.reload({waitUntil:'networkidle'});
assert.ok(await page.locator('h1').isVisible());
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
assert.deepEqual(errors,[]);
console.log('PASS bilingual copy/captions, section order, five restored chart views, responsive display typography, body preservation and font fallback');
}finally{await context.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
