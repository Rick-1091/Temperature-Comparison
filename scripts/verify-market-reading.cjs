const {chromium}=require(process.env.WEATHERBRIDGE_PLAYWRIGHT||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('.cache/decision-qa/market-reading');
fs.mkdirSync(out,{recursive:true});process.env.TEMP=out;process.env.TMP=out;
const baseline=process.env.WEATHERBRIDGE_CAPTURE_BASELINE==='1';
const crypto=require('node:crypto');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
if(!baseline){
 assert.equal(hash('public/weather-futures-interface.png'),hash('F:/soft/AppData/Nick/Temp/codex-clipboard-733180af-1a97-4b97-8f3e-8e8c8bc97809.png'));
 assert.equal(hash('public/polymarket-weather-interface.png'),hash('F:/soft/AppData/Nick/Temp/codex-clipboard-996c2f64-cb52-498a-a842-6b05521e96c0.png'));
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.WEATHERBRIDGE_BROWSER_EXECUTABLE,args:['--no-proxy-server','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const width of [1440,390])for(const lang of ['zh','en']){
   await page.setViewportSize({width,height:1000});
   await page.goto((process.env.WEATHERBRIDGE_PREVIEW_URL||'http://127.0.0.1:8017/')+'?lang='+lang+'#polymarket');
   await page.locator('.intro-bar').first().waitFor({state:'attached'});
   await page.evaluate(()=>document.fonts.ready);
   if(!baseline){
    const sequence=await page.locator('main section[id]').evaluateAll(es=>es.map(e=>e.id));
    const steps=['polymarket','market-stories','weather-futures-definition','polymarket-definition','market-comparison','evidence'];
    assert.ok(steps.every((id,i)=>i===0||sequence.indexOf(id)>sequence.indexOf(steps[i-1])),'definitions precede comparison and data');
    assert.equal(await page.locator('.market-overview,.market-definition-path').count(),0,'no repeated preview cards or competing paths');
    const metrics=[];
    for(const id of ['weather-futures-definition','polymarket-definition']){
     await page.locator(id==='weather-futures-definition'?'#market-tab-futures':'#market-tab-polymarket').click();
     const root=page.locator('#'+id);
     const illustration=root.locator('.event-outcomes-illustration img');
     await illustration.scrollIntoViewIfNeeded();
     await illustration.evaluate(e=>e.decode());
     assert.match(await illustration.getAttribute('src'),id==='weather-futures-definition'?/weather-futures-interface/:/polymarket-weather-interface/);
     const shape=await illustration.evaluate(e=>({native:e.naturalWidth/e.naturalHeight,rendered:e.width/e.height,alt:e.alt}));
     assert.ok(Math.abs(shape.native-shape.rendered)<0.01,'illustration keeps its full aspect ratio');
     assert.ok(shape.alt.length>12,'localized descriptive alternative text');
     assert.deepEqual(await illustration.evaluate(e=>({border:getComputedStyle(e).borderTopWidth,shadow:getComputedStyle(e).boxShadow})),{border:'0px',shadow:'none'},'use supplied frames without a second CSS border or shadow');
     assert.equal(await root.locator('.event-illustration-layout').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),width===390?1:2);
     assert.equal(await root.locator('details').count(),1,'one rules/source entry');
     assert.equal(await root.locator('details').getAttribute('open'),null,'advanced rules closed by default');
     assert.equal(await root.locator('.definition-example').count(),id==='polymarket-definition'?2:1,'hypothetical calculation and preserved historical example');
     const metric=await root.evaluate(e=>{const h=e.querySelector('h2'),s=getComputedStyle(e);return{heading:h.tagName,size:getComputedStyle(h).fontSize,top:s.paddingTop,bottom:s.paddingBottom,bg:s.backgroundColor};});
     metrics.push(metric);
     if(lang==='zh'){
      const han=text=>(text.match(/[\u4e00-\u9fff]/g)||[]).length;
      assert.ok(han(await root.locator('h2').innerText())<=18,'short scan heading');
      assert.ok(han(await root.locator('.lead').innerText())<=35,'short definition');
      const copy=(await root.locator('.definition-copy').allInnerTexts()).join('');
      const count=han(copy);console.log(id+' visible Chinese explanation: '+count);
      assert.ok(count>=120&&count<=350,id+' explanation including worked calculations: '+count);
     }else assert.doesNotMatch(await root.innerText(),/[\u4e00-\u9fff]/,'English default view does not stack Chinese');
    }
    assert.deepEqual(metrics[0],metrics[1],'parallel heading, spacing and chapter palette');
    assert.equal(await page.locator('#market-stories .market-storyboard').count(),2,'two illustrated stories before definitions');
    const payoffs=await page.locator('.market-payoffs').allTextContents();
    assert.match(payoffs[0],/450.*400.*1,000.*350.*400.*1,000/s);
    assert.match(payoffs[1],/0\.40.*0\.60.*0\.40.*0\.40/s);
    assert.equal(await page.locator('#weather-futures-definition svg,#weather-futures-definition canvas').count(),0,'no invented futures chart');
    assert.equal(await page.locator('.intro-bar').count(),11);
    assert.match(await page.locator('.intro-bar[data-top=true]').textContent(),/38.5/);
    assert.match(await page.locator('.intro-price-meaning').innerText(),lang==='zh'?/成交取决于订单与流动性.*观测检验与校准/:/Execution depends on orders and liquidity.*validation and calibration/);
    assert.match(await page.locator('#intro-settlement').innerText(),/\$1.*\$0/s);
    assert.match(await page.locator('#intro-settlement').innerText(),lang==='zh'?/净利润＝兑付金额－实际买入成本－费用/:/Net profit = redemption − actual purchase cost − fees/);
    assert.match(await page.locator('#intro-example-copy').innerText(),/38.5.*61.5/s);
    if(width===390){
     assert.equal(await page.locator('.definition-explanations').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),1);
     const sizes=await page.locator('.definition-copy').evaluateAll(es=>es.map(e=>parseFloat(getComputedStyle(e).fontSize)));
     assert.ok(sizes.every(size=>size>=18),'mobile prose stays readable');
     assert.ok(await page.locator('#intro-market .intro-chart-scroll').evaluate(e=>e.scrollWidth>e.clientWidth),'chart scroll is contained instead of shrinking labels');
     assert.ok(await page.locator('#intro-market .intro-chart-scroll').evaluate(e=>e.scrollLeft>0),'mobile initially shows the favored range');
    }
    for(const tab of ['target','horizon','signal','settlement']){
     await page.locator('#mechanism-'+tab).click();
     assert.equal(await page.locator('#mechanism-panel>div').count(),2);
     assert.equal(await page.locator('#mechanism-panel small').count(),0);
     assert.ok((await page.locator('#mechanism-panel p').allInnerTexts()).every(t=>t.length<(lang==='zh'?50:140)));
    }
    await page.locator('#mechanism-target').click();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal page overflow');
   }
   for(const selector of baseline?['#polymarket','#polymarket-definition','#market-comparison']:['#polymarket','#weather-futures-definition','#polymarket-definition','#market-comparison']){
    if(selector==='#weather-futures-definition'||selector==='#polymarket-definition')await page.locator(selector==='#weather-futures-definition'?'#market-tab-futures':'#market-tab-polymarket').click();
    await page.locator(selector).screenshot({path:path.join(out,(baseline?'before-':'after-')+selector.slice(1)+'-'+width+'-'+lang+'.png'),style:'wb-header{visibility:hidden!important}'});
   }
   if(!baseline){
    for(const id of ['futures-rules','polymarket-rules']){
     await page.locator(id==='futures-rules'?'#market-tab-futures':'#market-tab-polymarket').click();
     const summary=page.locator('#'+id+'>summary');await summary.focus();await page.keyboard.press('Enter');
     assert.equal(await page.locator('#'+id).getAttribute('open'),'');
     assert.notEqual(await summary.evaluate(e=>getComputedStyle(e).outlineStyle),'none');
     assert.ok(await page.locator('#'+id+' a').count()>=1);
     await page.keyboard.press('Enter');
    }
    await page.locator('#polymarket .market-next').click();assert.equal(new URL(page.url()).hash,'#market-stories');
    await page.locator('#market-stories>.market-next').click();assert.equal(new URL(page.url()).hash,'#weather-futures-definition');
    assert.ok(await page.locator('#weather-futures-definition').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('wb-header').getBoundingClientRect().bottom));
    await page.locator('#weather-futures-definition>.market-next').click();assert.equal(new URL(page.url()).hash,'#polymarket-definition');
    await page.locator('#polymarket-definition>.market-next').click();assert.equal(new URL(page.url()).hash,'#why-polymarket');
    await page.locator('#market-comparison').scrollIntoViewIfNeeded();
    await page.locator('#market-comparison>.market-next').click();assert.equal(new URL(page.url()).hash,'#evidence');
    await page.locator('#cdd-plot svg').waitFor();assert.match(await page.locator('#cdd-reading').innerText(),/435/);
   }
   console.log('CAPTURE '+(baseline?'before ':'after ')+width+' '+lang);
  }
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
