import './decision-diorama.css';
import {renderSimulationReference} from './simulation-reference.js';
import {PREPARATIONS,WEATHER,SCENARIOS,getScenario,contractsFor,getContract as modelContract,drawOutcome as modelDraw,resolveDecision as modelResolve,expectedNet as modelAverage} from './decision-model.js';

const root=document.querySelector('#action');
const $=id=>document.getElementById(id);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const compact=matchMedia('(max-width:1050px)');
const t=(zh,en)=>document.documentElement.lang.startsWith('en')?en:zh;
const number=n=>Number(n.toFixed(1)).toLocaleString(document.documentElement.lang);
const signed=n=>(n>0?'+':n<0?'−':'')+number(Math.abs(n));
const weatherName=key=>WEATHER[key].name[t('zh','en')==='en'?1:0].split(' · ')[0];
const quoteMoney=key=>(SIGNAL[key]/100).toFixed(2);
const params=new URLSearchParams(location.search);
let scenario=Object.hasOwn(SCENARIOS,params.get('scenario'))?params.get('scenario'):'heavy';
let SIGNAL=getScenario(scenario).signal,CONTRACTS=contractsFor(scenario);
const getContract=choice=>modelContract(choice,scenario);
const drawOutcome=()=>modelDraw(Math.random,scenario);
const resolveDecision=(plan,w,choice=false)=>modelResolve(plan,w,choice,scenario);
const expectedNet=(plan,choice=false)=>modelAverage(plan,choice,scenario);
const initialReplay={rain:'heavy',sun:'dry',dry:'dry',light:'light',heavy:'heavy'}[params.get('replay')];
let stage='signal',preparation=null,hedge=null,seen=false,weather=initialReplay||drawOutcome(),scene=null;
let busy=false,loading=true,paused=false,fallback=false,epoch=0,replaying=!!initialReplay,amountFrame=0,resultKey='',receiptKey='';
let signalWeather=scenario;
const buttons=[['signal',['市场信号','Market signal']],...Object.entries(PREPARATIONS).map(([id,p])=>[id,p.name]),['hedge',['查看合约','View contract']]];
const progress=[['signal',['看信息','Signal']],['prepare',['做准备','Prepare']],['hedge',['选合约','Contract']],['result',['看结果','Outcome']]];
const btn=(action,zh,en,primary=false)=>`<button type="button" data-decision="${action}" ${busy||loading?'disabled':''} class="${primary?'decision-primary':''}">${t(zh,en)}</button>`;
function status(){
 if(loading)return t('决策庭院加载中…','Loading the decision courtyard…');
 if(busy)return stage==='weather'?t('看看云层和光线怎样变化，哪些玉米仍在外面。','Watch the clouds and light change, and the maize left outside.'):stage==='hedge'?t('正在支付模拟合约成本，玉米仍按你选的方式安放。','Paying the simulated contract cost. The maize stays where you chose to put it.'):t('Thoko 正在按你的选择安排玉米。','Thoko is arranging the maize as you chose.');
 return {signal:t('玉米还没干透。广播只说区域内可能有雨，村里几点下雨并不清楚。决定不能一直等。','The maize is still damp. The radio mentions possible regional rain, but not when it will reach this village. The decision cannot wait.'),market:t(...{heavy:['本局市场判断更偏向暴雨。其他天气仍有可能。','Market judgment favors heavy rain this round. Other weather remains possible.'],dry:['本局市场判断更偏向无雨。仍有小雨或暴雨的可能。','Market judgment favors dry weather this round. Light or heavy rain remains possible.'],light:['本局市场判断更偏向小雨。仍可能放晴或变成暴雨。','Market judgment favors light rain this round. Dry or heavy rain remains possible.']}[scenario]),prepare:t('点击院子里的物件，安排玉米。准备减少暴露，也会改变晾晒机会。','Choose an object in the courtyard. Preparation reduces exposure but changes drying opportunity.'),hedge:t('玉米已安放好。要不要再购买天气合约？','The maize is arranged. Would you also like to buy weather contracts?'),result:t('本轮天气已揭晓。看看晾晒收益、作物损失与合约收支。','This round’s weather is revealed. Review drying value, crop loss and contract cash flows.')}[stage]||'';
}
function marketGraphic(){
 // Authored quote history ends at the shared teaching-scenario weights.
 const traces=[
  {key:'dry',name:t('无雨','Dry'),icon:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>'},
  {key:'light',name:t('小雨','Light rain'),icon:'<path d="M6 15a4 4 0 0 1-1-8 6 6 0 0 1 11-1 4.5 4.5 0 1 1 1 9H6Zm2 3-1 3m7-3-1 3"/>'},
  {key:'heavy',name:t('暴雨','Heavy rain'),icon:'<path d="M6 14a4 4 0 0 1-1-8 6 6 0 0 1 11-1 4.5 4.5 0 0 1 3 8M12 12l-3 5h5l-3 6M4 17l-1 3m17-3-1 3"/>'}
 ];
 const active=traces.find(trace=>trace.key===signalWeather),prices=[...({heavy:{dry:[48,40,30,24,18],light:[24,23,22,20,18],heavy:[28,37,48,56,64]},dry:{dry:[48,56,63,70,75],light:[24,22,20,18,16],heavy:[28,22,17,12,9]},light:{dry:[48,40,32,26,23],light:[24,35,47,59,68],heavy:[28,25,21,15,9]}}[scenario][active.key]),SIGNAL[active.key]],y=price=>160-price*1.5;
 return `<figure class="signal-market" aria-label="${t('教学降雨市场的虚构报价，每次查看一种天气','Fictional teaching rain-market quotes, one outcome at a time')}"><figcaption><strong>${t('教学降雨市场','Teaching rain market')}</strong><span>${t('模拟行情 · 非实时','Simulated · not live')}</span></figcaption><p class="signal-choice-hint">${t('先比较当前价格，再点一种天气看走势。','Compare current prices; select a weather to see its trend.')}</p><div class="signal-options" aria-label="${t('查看哪种天气的报价','Choose a quote to inspect')}">${traces.map(({key,name,icon})=>`<button type="button" class="signal-quote signal-${key}" data-signal-weather="${key}" aria-pressed="${key===signalWeather}"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg>${name}</span><strong>${SIGNAL[key]} <span class="signal-price-unit">${t('美分','cents')}</span></strong></button>`).join('')}</div><p class="signal-chart-title">${t(`正在查看：${active.name}合约`,`Viewing: ${active.name} contract`)}</p><p class="signal-axis-title">${t('纵轴：每份价格（美分）','Vertical: price per unit (cents)')}</p><svg class="signal-chart" viewBox="0 0 330 192" fill="none" aria-hidden="true">${[80,60,40,20,0].map(price=>`<path class="signal-grid" d="M38 ${y(price)}H298"/><text x="3" y="${y(price)+5}">${price}</text>`).join('')}<path class="signal-axis" d="M38 30V160H298"/><polyline class="signal-trace signal-${active.key}" points="${prices.map((price,i)=>`${38+i*52},${y(price)}`).join(' ')}"/>${prices.map((price,i)=>`<circle class="signal-end signal-${active.key}" cx="${38+i*52}" cy="${y(price)}" r="${i===5?5:2.5}"/>`).join('')}<text class="signal-label signal-${active.key}" x="298" y="${y(prices[5])-13}" text-anchor="middle">${prices[5]}</text>${prices.map((_,i)=>`<path class="signal-axis" d="M${38+i*52} 160v5"/><text class="signal-tick" x="${38+i*52}" y="186" text-anchor="middle">${i+1}</text>`).join('')}</svg><p class="signal-axis-title">${t('横轴：第 1 → 6 次模拟报价','Horizontal: simulated quotes 1 → 6')}</p><p class="signal-price-help">${t(`${SIGNAL[active.key]} 美分 = 每份 ${quoteMoney(active.key)} 美元。线越高，市场越看好这个结果。`,`${SIGNAL[active.key]} cents = $${quoteMoney(active.key)} per unit. A higher price means stronger market support for this outcome.`)}</p></figure>`;
}
function signalPanel(){
 return `<section class="market-signal" aria-label="${t('模拟市场信号','Simulated market signal')}"><h3>${t('看看本局的价格信号。','Read this round’s price signal.')}</h3>${marketGraphic()}<p class="decision-small">${t('报价与走势均为虚构；本例让报价对应天气抽样概率，这是教学设定。','Quotes and trends are fictional. This exercise makes prices match weather-draw probabilities: a teaching assumption.')}</p></section>`;
}
function contractPanel(){
 const held=getContract(hedge);
 return `<h3 id="contract-heading" tabindex="-1">${held?t(`已选${held.name[0]}`,`${held.name[1]} selected`):hedge===false?t('这次不买合约。','No contract this round.'):t('要买哪种合约？','Would you buy a contract?')}</h3><p>${t('先支付成本，约定天气发生时按固定金额支付；作物损失单独核算。','Pay the cost first. The specified weather triggers a fixed payment; crop losses are calculated separately.')}</p>
 <section class="contract-terms"><table class="contract-choice-table"><caption>${t('每次 30 份 · 模拟金额','30 shares · simulated amounts')}</caption><thead><tr><th scope="col">${t('规则','Rule')}</th>${Object.values(CONTRACTS).map(c=>`<th scope="col">${t(...c.name)}</th>`).join('')}</tr></thead><tbody>
 ${[
 [t('买入成本','Cost'),c=>'−'+number(c.cost)],
 [t('触发条件','Trigger'),c=>weatherName(c.trigger)],
 [t('触发时支付','Payout if triggered'),c=>'+'+number(c.payout)],
 [t('触发时净增加','Net if triggered'),c=>'+'+number(c.payout-c.cost)],
 [t('未触发支付','Payout otherwise'),()=> '0'],
 [t('未触发净减少','Net loss otherwise'),c=>'−'+number(c.cost)]
 ].map(([label,value])=>`<tr><th scope="row">${label}</th>${Object.values(CONTRACTS).map(c=>`<td>${value(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
 <p class="decision-small">${t('未触发时，支付为 0，买入成本不退。','Without the trigger, payout is 0 and the cost is not refunded.')}</p>
 <p class="decision-small"><strong>${t('小雨合约不包含暴雨。','Light-rain contracts exclude heavy rain.')}</strong> ${t('每次选一种合约、买入 30 份，金额用模拟单位表示。作物靠准备措施保护；全部收储后仍须承担合约成本与天气触发风险。','Choose one contract and buy 30 shares, using simulated amounts. Preparation protects the maize. After full storage, a contract still adds its cost and exposure to the weather trigger.')}</p>
 <details class="decision-detail contract-detail"><summary>${t('份数、地点与支付规则','Quantity, location and payout rules')}</summary><p>${Object.values(CONTRACTS).map(c=>t(`${c.name[0]}：30 份 × 每份 ${SIGNAL[c.trigger]} 美分 = 成本 ${number(c.cost)}。`,`${c.name[1]}: 30 shares × ${SIGNAL[c.trigger]} cents = cost ${number(c.cost)}.`)).join(' ')}</p><p>${t('本例使用教学行情。真实合约须核对地点、时段、指标与结算来源：纽约温度合约只按约定的纽约记录结算。练习允许揭晓前改选，只计最终选择；真实退款按平台规则处理。','This exercise uses teaching quotes. Check the place, period, measure and resolution source for an actual contract: a New York temperature contract settles against its specified New York records. This exercise counts the final selection before the reveal; actual refunds follow platform rules.')}</p></details></section>
 <div class="hedge-buttons">${btn('buy-light',hedge==='light'?'已选小雨合约':'买小雨合约',hedge==='light'?'Light contract selected':'Buy light-rain contract')}${btn('buy',hedge==='heavy'?'已选暴雨合约':'买暴雨合约',hedge==='heavy'?'Heavy contract selected':'Buy heavy-rain contract')}${btn('no-hedge',hedge===false?'已选择不买':'不买合约',hedge===false?'No contract selected':'No contract')}</div>${hedge!==null?btn('reveal','揭晓本次天气 →','Reveal this round’s weather →',true):''}${btn('back','调整玉米的安排','Change the preparation')}`;
}
function sceneFeedback(){
 const note=$('decision-exposure'),receipt=$('decision-receipt');
 note.hidden=!preparation;
 if(preparation){
  note.textContent=busy&&stage==='prepare'?t('正在搬运，请看玉米的位置变化。','Watch the maize move to its new place.'):preparation==='store'?t('48 穗全部收储，能避开小雨和暴雨，但停止了晾晒。','All 48 ears are stored, safe from light and heavy rain, but drying has stopped.'):preparation==='all'?t('48 穗全部留在露天架上，不耽误晾晒，也不防雨。','All 48 ears remain outside: no preparation delay and no rain protection.'):t('48 穗全部移到雨棚，能挡小雨；暴雨会从敞开的侧面灌入。','All 48 ears moved under the roof. It blocks light rain; heavy rain can enter through the open sides.');
 }
 const condition=$('decision-condition');condition.hidden=stage!=='result';
 if(stage==='result'){
  const r=resolveDecision(preparation,weather,false),wet=weather!=='dry'&&r.exposure>0;
  const description=preparation==='store'?t('已收储：48 穗，避开雨水。','48 ears stored, out of the rain.'):preparation==='shelter'?wet?t('暴雨从雨棚侧面灌入：48 穗被淋湿。','Heavy rain entered the open shelter: all 48 ears got wet.'):t(weather==='light'?'雨棚挡住小雨：48 穗没有淋湿。':'雨棚下：48 穗继续慢慢晾晒。',weather==='light'?'The roof blocked light rain: all 48 ears stayed dry.':'All 48 ears kept drying more slowly under the roof.'):wet?t('露天被雨淋湿：48 穗。','All 48 exposed ears got wet.'):t('露天继续晾晒：48 穗。','All 48 ears kept drying outside.');
  condition.innerHTML=`<span><i class="${wet?'corn-exposed':'corn-protected'}" aria-hidden="true"></i>${description}</span>`;
 }
 receipt.hidden=!hedge||stage==='result';
 if(hedge===null){receiptKey='';return;}
 const contract=getContract(hedge),settled=stage==='result',payout=settled?resolveDecision(preparation,weather,hedge).payout:0,cost=contract?.cost||0;
 const key=`${hedge}:${settled}:${weather}:${document.documentElement.lang}`;
 if(key===receiptKey)return;receiptKey=key;
 receipt.dataset.state=settled?(payout?'payout':hedge?'no-payout':'declined'):'awaiting';
 receipt.innerHTML=`<p>${contract?t(...contract.name):t('未买合约','No contract')} · ${t('模拟单位','Simulated units')}</p><dl><div><dt>${t('已付成本','Cost paid')}</dt><dd class="negative">${signed(-cost)}</dd></div><div><dt>${t('合约支付','Payout')}</dt><dd class="positive">${settled||!hedge?signed(payout):t('待揭晓','Pending')}</dd></div><div><dt>${t('合约净收支','Contract net')}</dt><dd class="${payout-cost<0?'negative':'positive'}">${settled||!hedge?signed(payout-cost):'—'}</dd></div></dl>`;
 if(!reduced.matches&&!paused)receipt.animate([{opacity:.4},{opacity:1}],{duration:300});
}
function outcomeStory(){
 const headings=weather==='dry'?{
  all:['玉米多晒了一下午。','The maize kept drying through the afternoon.'],
  shelter:['雨没来，雨棚下少晒了一些。','No rain came. Drying under the roof was slower.'],
  store:['天一直晴，提前收起却耽误了晾晒。','It stayed dry, but early storage cost drying time.']
 }:{
  all:['雨来了，露天的玉米淋湿了。','Rain arrived. The exposed maize got wet.'],
  shelter:weather==='light'?['雨棚挡住小雨，玉米没有淋湿。','The roof blocked light rain. The maize stayed dry.']:['暴雨从侧面灌入，雨棚挡不住。','Heavy rain entered the open sides. The roof was not enough.'],
  store:['玉米提前收好了，避开了这场雨。','The maize was stored before the rain arrived.']
 };
 return t(...headings[preparation]);
}
function panel(){
 let html='';
 if(stage==='signal')html=`<h3>${t('天气不确定，玉米等不了。','Uncertain weather. Maize cannot wait.')}</h3><p>${t('广播只说附近可能有雨。玉米还没干透，你得先做安排。','The radio warns of possible rain nearby. The maize is still damp; you need a plan.')}</p>${btn('view','查看模拟市场信号','View simulated market signal',true)}${btn('skip','直接安排玉米','Go straight to preparation')}<p class="decision-small">${t('情景模拟 · 市场信号只作补充，不替代官方预报。不涉及真实交易。','Simulation · market signals supplement official forecasts. No real trading.')}</p>`;
 if(stage==='market')html=signalPanel()+btn('continue','看过了，安排玉米 →','Continue to preparation →',true);
 if(stage==='prepare')html=`<div class="preparation-intro"><h3>${t('玉米怎么安排？','What is your plan for the maize?')}</h3><p>${t('点击物件选择安排。雨棚只挡小雨；全部收储也能挡暴雨。每个物件下方标出少晒的价值。','Choose an object. The shelter blocks light rain; storage also blocks heavy rain. Each object shows the drying value forgone.')}</p></div>${preparation?preparationValues():''}${preparation?btn('prepared','安排好了，下一步 →','Plan ready. Next →',true):''}`;
 if(stage==='hedge')html=contractPanel();
 if(stage==='weather')html=`<h3>${t('看看天空，也看看玉米。','Watch the sky. Watch the maize.')}</h3>`;
 if(stage==='result')html=`<h3>${WEATHER[weather].name[t('zh','en')==='en'?1:0]}</h3><a class="decision-primary" href="#decision-results">${t('看看这次结果 ↓','See what happened ↓')}</a>`;
 return `<p id="game-status" class="decision-status ${busy||loading?'status-active':''}" tabindex="-1" role="status" aria-live="polite">${status()}</p><div class="decision-panel-content">${html}</div>${replaying?`<p class="replay-note">${t('已知天气复盘 · 查看指定天气的结果','Known-weather replay · inspect a specified outcome')}</p>`:''}`;
}
function sync(){
 renderSimulationReference(scenario);
 root.dataset.scenario=scenario;root.querySelector('.decision-diorama').classList.toggle('is-text-mode',fallback);root.dataset.decisionStage=stage;root.dataset.busy=String(busy);
 const active=stage==='market'?'signal':stage==='weather'?'result':stage;
 root.querySelector('.game-progress').setAttribute('aria-label',t('决策进度','Decision progress'));
 root.querySelector('.game-progress').innerHTML=progress.map(([id,n])=>`<li data-stage="${id}" ${active===id?'aria-current="step"':''}>${n[t('zh','en')==='en'?1:0]}</li>`).join('');
 $('scene').setAttribute('aria-label',t('交互式决策庭院：房屋、左侧雨棚、晾晒架、储物箱、信息面板与合约台','Interactive decision courtyard: house, left shelter, drying rack, storage, information panel and contract desk'));
 $('decision-panel').innerHTML=panel();
 for(const b of root.querySelectorAll('[data-decision=buy],[data-decision=buy-light],[data-decision=no-hedge]'))b.setAttribute('aria-pressed',String(hedge!==null&&hedge===({buy:'heavy','buy-light':'light','no-hedge':false}[b.dataset.decision])));
 for(const b of root.querySelectorAll('[data-scene-object],[data-fallback-object]')){
  const id=b.dataset.sceneObject||b.dataset.fallbackObject;b.textContent=buttons.find(([key])=>key===id)[1][t('zh','en')==='en'?1:0];if(PREPARATIONS[id]){const p=PREPARATIONS[id],delay=resolveDecision(id,'dry').dryingOpportunityLoss;b.innerHTML=`<span>${t(...p.name)}</span><small>${t(...p.protection)} · ${t(`少晒价值 ${number(delay)}`,`Drying forgone ${number(delay)}`)}</small>`;}
  const enabled=!busy&&!loading&&((id==='signal'&&stage==='signal')||(id==='hedge'&&stage==='hedge')||(Object.hasOwn(PREPARATIONS,id)&&stage==='prepare'));
  b.disabled=!enabled;b.hidden=!enabled;b.setAttribute('aria-pressed',String(id===preparation||id==='signal'&&seen||id==='hedge'&&Boolean(hedge)));
 }
 scene?.refreshHotspots();
 scene?.previewObject(document.activeElement?.dataset.sceneObject||null);
 syncMotionControls();
 $('decision-text').textContent=fallback?t('重试 3D','Retry 3D'):t('使用文字模式','Use text mode');
 $('decision-restart').textContent=t('新随机一轮','New random round');$('decision-scenario').value=scenario;$('decision-scenario-label').textContent=t('切换模拟情景','Simulation scenario');for(const option of $('decision-scenario').options)option.textContent=t(...SCENARIOS[option.value].name);
 root.querySelector('.motion-options summary').textContent=t('动画选项','Animation options');
 $('decision-clock').textContent=stage==='result'?t({dry:'傍晚 · 无雨',light:'午后较晚 · 小雨到了',heavy:'午后刚开始 · 暴雨到了'}[weather],{dry:'Evening · stayed dry',light:'Late afternoon · light rain',heavy:'Early afternoon · heavy rain'}[weather]):stage==='weather'?t('时间推移 · 天气揭晓','Time passes · weather unfolds'):t('上午 · 玉米仍在晾晒','Morning · maize is drying');
 $('decision-scene-hint').hidden=!fallback&&(!!preparation||!['signal','prepare'].includes(stage));
 $('decision-scene-hint').textContent=fallback?t('文字模式 · 仍可完成选择和收支比较。','Text mode · decisions and cash comparisons remain available.'):t('点亮的物件可以点击','Tap the highlighted objects');
 sceneFeedback();
 if(stage==='result')renderResults();else{cancelAnimationFrame(amountFrame);$('decision-results').hidden=true;const review=$('inline-review');if(review)review.innerHTML=`<p>${t('完成庭院决策后，这里会在同一场天气下比较三种准备及买 / 不买合约的结果。','Complete the courtyard decisions to compare three preparations, with and without a contract, under the same weather.')}</p>`;}
 const actions=$('decision-world-actions');actions.replaceChildren();
 if(compact.matches&&!fallback&&!busy&&!loading){const next=$('decision-panel').querySelector(stage==='hedge'&&hedge?'[data-decision=reveal]':stage==='result'?'a[href="#decision-results"]':'[data-no-scene-action]');if(next)actions.append(next);}
 actions.hidden=!actions.childElementCount;
 const task=$('decision-task');task.replaceChildren();
 if(compact.matches&&stage==='prepare')task.append($('decision-panel').querySelector('.preparation-intro'));
 task.hidden=!task.childElementCount;
 $('decision-panel').classList.toggle('compact-preparation',!task.hidden&&!busy&&!loading);
 $('decision-panel').classList.toggle('compact-outcome',compact.matches&&!fallback&&stage==='result');
}
function syncMotionControls(){
 $('decision-pause').textContent=paused?t('继续动画','Resume animation'):t('暂停动画','Pause animation');
 $('decision-pause').setAttribute('aria-pressed',String(paused));
 $('decision-pause').hidden=fallback||reduced.matches;
}
function focusStatus(){
 const ready=!busy&&!loading;
 const selector=ready&&stage==='prepare'?(preparation?'[data-decision=prepared]':'[data-scene-object]:not([hidden]):not(:disabled),[data-fallback-object]:not([hidden]):not(:disabled)'):ready&&stage==='hedge'&&hedge!==null?'[data-decision=reveal]':null;
 const el=(selector&&root.querySelector(selector))||$('game-status');el?.focus({preventScroll:true});
}
function watchScene(){if(!compact.matches||reduced.matches||paused||fallback||!scene)return;const el=$('scene'),r=el.getBoundingClientRect();if(r.top<24||r.bottom>innerHeight-30)el.scrollIntoView({block:'start',behavior:'instant'});}
async function prepare(next){if(busy||stage!=='prepare'||!Object.hasOwn(PREPARATIONS,next))return;const token=epoch;busy=true;preparation=next;sync();watchScene();await scene?.prepare(next);if(token!==epoch)return;busy=false;sync();focusStatus();}
function object(id){if(busy||loading)return;if(id==='signal'&&stage==='signal')act('view');if(id==='hedge'&&stage==='hedge'){$('contract-heading')?.focus();return;}if(stage==='prepare'&&Object.hasOwn(PREPARATIONS,id))prepare(id);}
async function act(action){
 if(busy||loading)return;
 if(action==='view'&&stage==='signal'){seen=true;scene?.showSignal();stage='market';}
 else if(action==='skip'&&stage==='signal')stage='prepare';
 else if(action==='continue'&&stage==='market')stage='prepare';
 else if(Object.hasOwn(PREPARATIONS,action)&&stage==='prepare'){await prepare(action);return;}
 else if(action==='prepared'&&stage==='prepare'&&preparation)stage='hedge';
 else if(['buy','buy-light','no-hedge'].includes(action)&&stage==='hedge'){const next={buy:'heavy','buy-light':'light','no-hedge':false}[action];if(hedge!==next){const token=epoch;hedge=next;busy=Boolean(next);sync();if(next)watchScene();await scene?.purchase(hedge);if(token!==epoch)return;busy=false;}}
 else if(action==='back'&&stage==='hedge'){hedge=null;scene?.purchase(false);stage='prepare';}
 else if(action==='reveal'&&stage==='hedge'&&hedge!==null){
  const token=epoch;stage='weather';busy=true;sync();watchScene();focusStatus();await scene?.reveal(weather);if(token!==epoch)return;
  busy=false;stage='result';scene?.settle(resolveDecision(preparation,weather,hedge).payout);sync();focusStatus();return;
 }else if(action==='restart'){restart();return;}
 sync();if(stage==='prepare'&&compact.matches&&!fallback)$('decision-task').scrollIntoView({block:'start',behavior:'instant'});focusStatus();
}
function animateAmounts(){cancelAnimationFrame(amountFrame);if(reduced.matches||paused)return;
 // Money stays exact. Only the comparison lengths animate.
 root.querySelectorAll('.net-bar i').forEach(el=>el.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:650,easing:'cubic-bezier(.16,1,.3,1)'}));
 root.querySelectorAll('.settlement-track i').forEach((el,i)=>el.animate([{transform:'scaleY(0)'},{transform:'scaleY(1)'}],{duration:420,delay:i*220,fill:'backwards',easing:'cubic-bezier(.16,1,.3,1)'}));
}
function dryingDelayNote(r){
 return `<dl class="reading-facts drying-delay-note"><div><dt>${t('实际晾晒收益','Actual drying value')}</dt><dd>${number(r.availableDrying)} − ${number(r.dryingOpportunityLoss)} − ${number(r.weatherDryingLoss)} = <strong>${number(r.drying)}</strong></dd></div><div><dt>${t('晴天满晒 − 本次净结果','Sunny baseline − this net')}</dt><dd>${number(r.availableDrying)} − (${signed(r.net)}) = <strong>${number(r.gapFromFullDrying)}</strong></dd></div></dl><p class="decision-small">${t('少晒已计入实际晾晒收益；与晴天的差额仅作比较，都不另扣一遍。','Drying forgone is already included in the drying value. The sunny baseline gap is a comparison, not another charge.')}</p>`;
}
function weatherAccountingTable(){
 const rows=[
  [t('晾晒收益','Drying earned'),e=>e.no.drying],
  [t('准备少晒','Held back'),e=>-e.no.dryingOpportunityLoss,'memo'],
  [t('雨天少晒','Rain delay'),e=>-e.no.weatherDryingLoss,'memo'],
  [t('作物损失','Crop loss'),e=>-e.no.physicalLoss],
  [t('准备成本','Plan cost'),e=>-e.no.preparationCost],
  [t('不买合约的净结果','Net without contract'),e=>e.no.net,'total'],
  ...Object.entries(CONTRACTS).flatMap(([key])=>[
   [t(`${key==='light'?'小雨':'暴雨'}合约成本`,`${key==='light'?'Light':'Heavy'} cost`),e=>-e[key].premium],
   [t(`${key==='light'?'小雨':'暴雨'}合约收到`,`${key==='light'?'Light':'Heavy'} payout`),e=>e[key].payout],
   [t(`买${key==='light'?'小雨':'暴雨'}合约的净结果`,`Net with ${key==='light'?'light':'heavy'} contract`),e=>e[key].net,'total']
  ])
 ];
 const outcomes=Object.keys(WEATHER).map(w=>({weather:w,no:resolveDecision(preparation,w,false),light:resolveDecision(preparation,w,'light'),heavy:resolveDecision(preparation,w,'heavy')}));
 return `<section class="weather-accounting" aria-labelledby="weather-accounting-heading"><h4 id="weather-accounting-heading">${t('同样安排，三种天气怎么算？','Same plan: how do the three weather outcomes compare?')}</h4><p class="decision-small">${t(`${PREPARATIONS[preparation].name[0]} · 模拟单位。先算玉米的收支，再减所选合约的成本、加对应天气的支付。`,`${PREPARATIONS[preparation].name[1]} · simulated units. First calculate maize cash flow, then subtract the chosen contract cost and add its matching payout.`)}</p><div class="weather-accounting-wrap"><table class="weather-accounting-table"><thead><tr><th scope="col">${t('收支项目','Item')}</th>${outcomes.map(({weather:w})=>`<th scope="col" ${w===weather?'class="current-weather"':''}>${weatherName(w)}${w===weather?`<small>${t('本次','Now')}</small>`:''}</th>`).join('')}</tr></thead><tbody>${rows.map(([label,value,kind])=>`<tr ${kind?`class="${kind}"`:''}><th scope="row">${label}</th>${outcomes.map(e=>`<td ${e.weather===weather?'class="current-weather"':''}>${signed(value(e))}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="decision-small">${t('准备少晒和雨天少晒，是晾晒收益的分解，不额外扣钱。小雨合约只在小雨支付，暴雨合约只在暴雨支付；两份成本不同，不可把支付条件混用。','Held back and rain delay explain drying already forgone, not extra charges. Light contracts pay only in light rain; heavy contracts only in heavy rain. Their costs and triggers differ.')}</p></section>`;
}
function preparationValues(){
 const r=resolveDecision(preparation,'dry',false);
 const rows=[[t('晾晒收益','Drying earned'),signed(r.drying)],[t('晴天少晒价值','Forgone drying value'),signed(-r.dryingOpportunityLoss)],[t('准备成本','Preparation cost'),signed(-r.preparationCost)],[t('不买合约的净收益','Net without a contract'),signed(r.net)]];
 return `<div class="preparation-readout"><strong>${PREPARATIONS[preparation].name[t('zh','en')==='en'?1:0]}</strong><span>${t(...PREPARATIONS[preparation].protection)}</span><span>${t('若一直晴天 · 模拟单位','If it stays dry · simulated units')}</span><dl class="result-ledger">${rows.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><span>${t(`少晒价值已计入晾晒收益：${number(r.availableDrying)} − ${number(r.dryingOpportunityLoss)} = ${number(r.drying)}。`,`Forgone value is already included: ${number(r.availableDrying)} − ${number(r.dryingOpportunityLoss)} = ${number(r.drying)}.`)}</span></div>`;
}
function contractExplanation(r){
 const c=getContract(hedge|| (SIGNAL.light>=SIGNAL.heavy?'light':'heavy')),comparison=resolveDecision(preparation,weather,c.trigger),delta=comparison.hedgeNet;
 return t(`作物损失都是 ${number(r.physicalLoss)}；${c.name[0]}只让收支${delta>=0?'增加':'减少'} ${number(Math.abs(delta))}。${hedge?'':'你没有购买，右侧是假设对照。'}`,`Crop loss stays ${number(r.physicalLoss)}. The ${c.name[1]} only ${delta>=0?'adds':'subtracts'} ${number(Math.abs(delta))} in cash flow.${hedge?'':' You bought none; the right side is hypothetical.'}`);
}
function renderResults(){
 const r=resolveDecision(preparation,weather,hedge),contractType=hedge||(SIGNAL.light>=SIGNAL.heavy?'light':'heavy'),contract=getContract(contractType),withContract=resolveDecision(preparation,weather,contractType);
 const rows=[[t('实际晾晒收益','Actual drying value'),r.drying],[t('作物损失','Crop loss'),-r.physicalLoss],[t('准备成本','Preparation cost'),-r.preparationCost],[t('合约成本','Contract cost'),-r.premium],[t('合约支付','Contract payout'),r.payout],[t('最终净结果','Final net result'),r.net]];
 const results=$('decision-results');results.hidden=false;
 const open=[...results.querySelectorAll('details[open]')].map(el=>el.className);
 const comparison=(value,label,chosen)=>`<div class="${chosen?'net-selected':''}"><span>${label}${chosen?t(' · 你的选择',' · Your choice'):''}</span><strong class="${value<0?'negative':'positive'}">${signed(value)}</strong></div>`;
 results.innerHTML=`<header><p class="decision-small result-context"><strong class="result-weather-name">${weatherName(weather)}</strong> · ${t(...PREPARATIONS[preparation].name)} · ${replaying?t('已知天气复盘','Known-weather replay'):t('本轮随机天气','This round’s random weather')}</p><h3>${outcomeStory()}</h3></header>
 <div class="net-comparison">${comparison(r.unhedged,t('不买合约的净结果','Net without a contract'),!hedge)}${comparison(withContract.net,t(`${hedge?'买入':'假设买入'}${contract.name[0]}`,`${hedge?'With':'If buying'} ${contract.name[1]}`),Boolean(hedge))}</div>
 <p class="hedge-explanation">${contractExplanation(r)}</p><p class="decision-small">${t('同一天气、同一准备 · 模拟单位，正数为净增加，负数为净减少。','Same weather and preparation · simulated units; positive is a net gain, negative a net loss.')}</p>
 <details class="decision-detail result-detail"><summary>${t('展开计算','Expand calculation')}</summary><dl class="result-ledger">${rows.map(([label,value])=>`<div><dt>${label}</dt><dd>${signed(value)}</dd></div>`).join('')}</dl><p class="decision-small">${t('净结果＝实际晾晒收益－作物损失－准备成本－合约成本＋合约支付。','Net = actual drying value − crop loss − preparation cost − contract cost + payout.')}</p>${dryingDelayNote(r)}<p class="decision-small">${t(`相对晴天继续晾晒、不买合约的 +24，本次差额为 ${number(r.gapFromFullDrying)}；这是对照差额，不再扣除。`,`Compared with +24 for sunny, uninterrupted drying without a contract, the gap is ${number(r.gapFromFullDrying)}. This comparison is not another charge.`)}</p></details>
 <details class="decision-detail weather-detail"><summary>${t('其他天气与已知天气复盘','Other weather and known-weather replays')}</summary>${weatherAccountingTable()}<p class="decision-small">${t('下列按钮指定天气来复盘，不重新随机。要抽取新天气，请选“新随机一轮”。','These buttons set known weather for review; they do not draw again. Use “New random round” for a fresh draw.')}</p><div class="known-replays">${Object.entries(WEATHER).map(([w])=>`<button data-weather-replay="${w}" aria-pressed="${weather===w}" type="button">${weatherName(w)}</button>`).join('')}</div></details>
 <details class="decision-detail preparation-detail"><summary>${t('其他准备方式与本局平均结果','Other preparations and scenario averages')}</summary><div class="decision-table-wrap" role="region" tabindex="0" aria-label="${t('同一天气的准备方式对照，窄屏横向滚动','Same-weather preparation comparisons; scroll horizontally')}"><table class="decision-table"><caption>${t('固定本次天气，模拟单位','Same weather, simulated units')}</caption><thead><tr><th>${t('准备','Plan')}</th><th>${t('不买合约','No contract')}</th><th>${t('买小雨合约','Light contract')}</th><th>${t('买暴雨合约','Heavy contract')}</th></tr></thead><tbody>${Object.entries(PREPARATIONS).map(([id,p])=>`<tr><th scope="row">${t(...p.name)}</th>${[false,'light','heavy'].map(c=>`<td>${signed(resolveDecision(id,weather,c).net)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="decision-small">${t('按本局设定加权、不买合约的平均结果：','Scenario-weighted averages without a contract: ')}${Object.entries(PREPARATIONS).map(([id,p])=>t(...p.name)+' '+signed(expectedNet(id))).join('；')}。</p><p class="decision-small">${t('平均结果按本局概率加权，单轮结果随抽取天气变化。查看信号不会改变天气或收支；报价对应抽样概率是教学设定，不能证明真实市场的预测能力。','Averages are weighted by this scenario; individual results vary with the weather draw. Viewing the signal changes neither weather nor cash flow. Matching prices to draw probabilities is a teaching assumption, not evidence of real market forecasting skill.')}</p></details>`;
 const review=$('inline-review');if(review)review.innerHTML=`<p>${t('准备改变玉米的暴露和晾晒机会；合约只改变财务收支，不修复玉米。','Preparation changes exposure and drying opportunity. Contracts change cash flow, not crop damage.')}</p>`;
 for(const name of open){const el=[...results.querySelectorAll('details')].find(e=>e.className===name);if(el)el.open=true;}
}
async function loadScene(){
 const token=epoch;loading=true;sync();$('scene').setAttribute('aria-busy','true');
 try{const {createCourtyard}=await import('./decision-scene.js');if(token!==epoch)return;scene=createCourtyard($('scene'),{onObject:object,onBeat:motionCaption});
  // Restore the settled snapshot before unlocking controls, without replaying a debit.
  scene.setPaused(true);if(seen)scene.showSignal();if(preparation)scene.prepare(preparation);scene.purchase(hedge||false,false);if(stage==='result'){scene.reveal(weather);scene.settle(resolveDecision(preparation,weather,hedge).payout,false);}scene.setPaused(paused);scene.setVisible(visible);fallback=false;
 }catch(error){if(token!==epoch)return;fallback=true;showFallback();}
 loading=false;$('scene').setAttribute('aria-busy','false');sync();
}
function motionCaption({step,trip,preparation:plan}){
 if(stage!=='prepare'||!busy)return;
 const destination=plan==='shelter'?t('左侧雨棚','the left shelter'):t('储物箱','storage');
 const copy={pick:t('Thoko 弯下身，把一批玉米装进篮子。','Thoko bends down and loads a basket.'),carry:t(`抱起第 ${trip} 篮，绕过晾晒架，走向${destination}。`,`Carrying basket ${trip} around the rack toward ${destination}.`),place:t(`把这一篮放到${destination}，露天架上的玉米少了一批。`,`Placing this batch in ${destination}; fewer ears remain outside.`),return:t('带着空篮返回，再搬下一批。','Returning with the empty basket for the next batch.'),done:t('最后一篮已放好。','The last basket is in place.')};
 $('decision-exposure').hidden=false;$('decision-exposure').textContent=copy[step]||'';
}
function showFallback(){
 loading=false;$('scene').setAttribute('aria-busy','false');scene?.dispose();scene=null;
 $('scene').querySelectorAll('canvas,.decision-fallback').forEach(el=>el.remove());
 const el=document.createElement('div');el.className='decision-fallback';
 el.innerHTML=`<div>${buttons.map(([id,n])=>`<button data-fallback-object="${id}" type="button">${t(...n)}</button>`).join('')}</div>`;
 $('scene').prepend(el);
}
function restart(next){scenario=next||scenario;SIGNAL=getScenario(scenario).signal;CONTRACTS=contractsFor(scenario);++epoch;cancelAnimationFrame(amountFrame);resultKey='';receiptKey='';signalWeather=scenario;$('decision-results').replaceChildren();scene?.reset();stage='signal';preparation=null;hedge=null;seen=false;busy=false;replaying=false;weather=drawOutcome();const url=new URL(location.href);url.searchParams.delete('replay');url.searchParams.set('scenario',scenario);history.replaceState(null,'',url);if(loading&&!scene&&!fallback)loadScene();sync();focusStatus();}
root.querySelector('.diorama').classList.add('decision-diorama');
root.querySelector('.diorama').innerHTML=`<div class="decision-world"><div id="decision-task" hidden></div><div id="scene" role="group" aria-label="${t('交互式决策庭院','Interactive decision courtyard')}"><p id="decision-clock"></p>${buttons.map(([id])=>`<button type="button" class="scene-object" data-scene-object="${id}" hidden></button>`).join('')}</div><p id="decision-scene-hint"></p><p id="decision-exposure" hidden></p><div id="decision-condition" hidden></div><section id="decision-receipt" aria-live="polite" aria-atomic="true" hidden></section><div id="decision-world-actions" hidden></div></div><aside id="decision-panel" class="game-overlay"></aside><section id="decision-results" hidden></section>`;
root.querySelector('.exercise-options').outerHTML=`<div class="decision-tools"><label class="decision-scenario-label"><span id="decision-scenario-label"></span><select id="decision-scenario">${Object.entries(SCENARIOS).map(([key,p])=>`<option value="${key}">${t(...p.name)}</option>`).join('')}</select></label><button id="decision-restart" type="button"></button><details class="decision-detail motion-options"><summary></summary><button id="decision-pause" type="button"></button><button id="decision-text" type="button"></button></details></div>`;
root.querySelector('#fallback-note')?.remove();
root.addEventListener('pointerover',event=>{const button=event.target.closest('[data-scene-object]');if(button)scene?.previewObject(button.dataset.sceneObject);});
root.addEventListener('focusin',event=>{const button=event.target.closest('[data-scene-object]');scene?.previewObject(button?.dataset.sceneObject||null);});
root.addEventListener('focusout',event=>{if(event.target.closest('[data-scene-object]'))scene?.previewObject(null);});
root.addEventListener('pointerout',event=>{if(event.target.closest('[data-scene-object]')&&!event.relatedTarget?.closest('[data-scene-object]'))scene?.previewObject(null);});
root.addEventListener('click',async event=>{
 const target=event.target.closest('button');if(!target)return;
 if(target.dataset.decision)act(target.dataset.decision);
 if(target.dataset.signalWeather&&stage==='market'&&Object.hasOwn(SIGNAL,target.dataset.signalWeather)){signalWeather=target.dataset.signalWeather;sync();root.querySelector(`[data-signal-weather="${signalWeather}"]`).focus({preventScroll:true});}
 if(target.dataset.sceneObject)object(target.dataset.sceneObject);
 if(target.dataset.fallbackObject)object(target.dataset.fallbackObject);
 if(target.id==='decision-restart')restart();
 if(target.id==='decision-pause'){paused=!paused;scene?.setPaused(paused);syncMotionControls();}
 if(target.id==='decision-text'){++epoch;if(!fallback){fallback=true;showFallback();if(busy){busy=false;if(stage==='weather')stage='result';}}else{scene?.dispose();scene=null;$('scene').querySelector('.decision-fallback')?.remove();await loadScene();}sync();}
 if(target.dataset.weatherReplay&&!busy&&!loading&&stage==='result'){
  const token=epoch;weather=target.dataset.weatherReplay;replaying=true;busy=true;stage='weather';sync();watchScene();await scene?.reveal(weather);if(token!==epoch)return;busy=false;stage='result';scene?.settle(resolveDecision(preparation,weather,hedge).payout);sync();focusStatus();
 }
});
root.addEventListener('change',event=>{if(event.target.id==='decision-scenario'&&Object.hasOwn(SCENARIOS,event.target.value))restart(event.target.value);});
root.addEventListener('toggle',event=>{if(event.target.matches('.result-detail')&&event.target.open)animateAmounts();},true);
window.addEventListener('wb-language',()=>{if(fallback)showFallback();sync();});
reduced.addEventListener('change',()=>{cancelAnimationFrame(amountFrame);sync();});
compact.addEventListener('change',sync);
$('scene').addEventListener('scene-lost',()=>{fallback=true;++epoch;showFallback();if(busy){busy=false;if(stage==='weather')stage='result';}sync();});
let visible=true;const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;scene?.setVisible(visible);});visibility.observe(root.querySelector('.diorama'));
window.addEventListener('pagehide',event=>{if(!event.persisted){++epoch;cancelAnimationFrame(amountFrame);visibility.disconnect();scene?.dispose();}});
sync();loadScene();
