const {chromium}=require('C:/Users/Nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
const out='.cache/depo-theme-qa';fs.mkdirSync(out,{recursive:true});
const context=await chromium.launchPersistentContext(out+'/profile',{headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',viewport:{width:1440,height:1000},reducedMotion:'reduce',args:['--enable-unsafe-swiftshader']});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
await page.goto('http://127.0.0.1:8017/?lang=zh',{waitUntil:'networkidle'});
await page.waitForSelector('#accuracy-history path.strictRate');
const palette=await page.locator('main>.chapter[id]').evaluateAll(es=>es.map(e=>({id:e.id,bg:getComputedStyle(e).backgroundColor,ink:getComputedStyle(e).color})));
assert.equal(palette.find(e=>e.id==='malawi').bg,'rgb(247, 186, 58)');
assert.equal(palette.find(e=>e.id==='mexico').bg,'rgb(56, 187, 179)');
assert.equal(palette.find(e=>e.id==='polymarket').bg,'rgb(120, 61, 232)');
assert.equal(palette.find(e=>e.id==='reflection').bg,'rgb(217, 92, 92)');
const contrast=await page.locator('main>.chapter[id]').evaluateAll(es=>{
const lum=s=>{const rgb=s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722};
return es.map(e=>{const s=getComputedStyle(e),a=lum(s.color),b=lum(s.backgroundColor);return {id:e.id,contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)}})
});assert.ok(contrast.every(x=>x.contrast>=4.5),JSON.stringify(contrast));
assert.equal(await page.locator('#malawi figcaption').innerText(),'托科 · 非洲马拉维农户');
assert.equal(await page.locator('#mexico figcaption').innerText(),'迭戈 · 帕蒂奥咖啡馆店主');
for(const id of ['malawi','mexico','polymarket']){
await page.locator('#'+id).scrollIntoViewIfNeeded();
await page.locator('#'+id).screenshot({path:out+'/'+id+'-desktop.png'});
}
await page.locator('#evidence .big-values').screenshot({path:out+'/numbers-desktop.png'});
for(const width of [1440,768,390,320]){
await page.setViewportSize({width,height:1000});
for(const lang of ['zh','en']){
await page.locator('[data-language="'+lang+'"]').click();
await page.waitForTimeout(150);
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page overflow '+width+' '+lang);
assert.ok(await page.locator('h1,h2,h3').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+1)),'heading overflow '+width+' '+lang);
if(width===390&&lang==='zh')await page.locator('#malawi').screenshot({path:out+'/malawi-mobile.png'});
}
}
await page.locator('#legacy-evidence-frame').scrollIntoViewIfNeeded();
const frame=page.frameLocator('#legacy-evidence-frame');
await frame.locator('html[lang="en"]').waitFor();
for(const view of ['heatmap','area','three-d','lines','dumbbell']){
await frame.locator('[data-view="'+view+'"]').click();
assert.equal(await frame.locator('[data-view="'+view+'"]').getAttribute('aria-pressed'),'true');
}
await page.locator('#unit').selectOption('F');
await page.waitForFunction(()=>document.querySelector('#evidence-values').textContent.includes('°F'));
assert.ok((await page.locator('#accuracy-summary').innerText()).includes('6/9'));
assert.deepEqual(errors,[]);
fs.writeFileSync(out+'/report.json',JSON.stringify({palette,contrast,widths:[1440,768,390,320],languages:['zh','en'],errors},null,2));
console.log('PASS Depo theme, preserved bilingual captions, 320–1440px layout, five chart interactions and section text contrast');
}finally{await context.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
