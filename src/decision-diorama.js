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
 if(busy)return stage==='weather'?t('看看云层和光线怎样变化，哪些玉米仍在外面。','Watch the clouds and light change, and the maize left outside.'):stage==='hedge'?t('正在支付模拟合约成本；这笔钱不能替玉米挡雨。','Paying the example contract cost. This payment cannot shelter the maize.'):t('Thoko 正在做准备，院子也在变化。','Thoko is preparing. Watch the courtyard change.');
 return {signal:t('玉米还没干透。广播只说区域内可能有雨，村里几点下雨并不清楚。决定不能一直等。','The maize is still damp. The radio mentions possible regional rain, but not when it will reach this village. The decision cannot wait.'),market:t(...{heavy:['本局市场判断更偏向暴雨。其他天气仍有可能。','Market judgment favors heavy rain this round. Other weather remains possible.'],dry:['本局市场判断更偏向无雨。仍有小雨或暴雨的可能。','Market judgment favors dry weather this round. Light or heavy rain remains possible.'],light:['本局市场判断更偏向小雨。仍可能放晴或变成暴雨。','Market judgment favors light rain this round. Dry or heavy rain remains possible.']}[scenario]),prepare:t('点击院子里的物件，安排玉米。准备减少暴露，也会改变晾晒机会。','Choose an object in the courtyard. Preparation reduces exposure but changes drying opportunity.'),hedge:t('玉米已经安排好。接下来，你可以选择是否对冲一部分财务风险。','The maize is arranged. Now decide whether to hedge part of the financial risk.'),result:t('天气没有因为选择而改变。下面拆开看：晾晒、作物损失、合约收支。','Your choices did not change the weather. Separate the drying benefit, crop loss and contract cash flows.')}[stage]||'';
}
function marketGraphic(){
 // Authored quote history ends at the shared teaching-scenario weights.
 const traces=[
  {key:'dry',name:t('无雨','Dry'),icon:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>'},
  {key:'light',name:t('小雨','Light rain'),icon:'<path d="M6 15a4 4 0 0 1-1-8 6 6 0 0 1 11-1 4.5 4.5 0 1 1 1 9H6Zm2 3-1 3m7-3-1 3"/>'},
  {key:'heavy',name:t('暴雨','Heavy rain'),icon:'<path d="M6 14a4 4 0 0 1-1-8 6 6 0 0 1 11-1 4.5 4.5 0 0 1 3 8M12 12l-3 5h5l-3 6M4 17l-1 3m17-3-1 3"/>'}
 ];
 const active=traces.find(trace=>trace.key===signalWeather),prices=[...({heavy:{dry:[48,40,30,24,18],light:[24,23,22,20,18],heavy:[28,37,48,56,64]},dry:{dry:[48,56,63,70,75],light:[24,22,20,18,16],heavy:[28,22,17,12,9]},light:{dry:[48,40,32,26,23],light:[24,35,47,59,68],heavy:[28,25,21,15,9]}}[scenario][active.key]),SIGNAL[active.key]],y=price=>160-price*1.5;
 return `<figure class="signal-market" aria-label="${t('Polymarket 模拟报价，每次只查看一种天气','Simulated Polymarket quotes, one weather outcome at a time')}"><figcaption><strong>Polymarket</strong><span>${t('模拟行情 · 非实时','Simulated · not live')}</span></figcaption><p class="signal-choice-hint">${t('先比较当前价格，再点一种天气看走势。','Compare current prices; select a weather to see its trend.')}</p><div class="signal-options" aria-label="${t('查看哪种天气的报价','Choose a quote to inspect')}">${traces.map(({key,name,icon})=>`<button type="button" class="signal-quote signal-${key}" data-signal-weather="${key}" aria-pressed="${key===signalWeather}"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg>${name}</span><strong>${SIGNAL[key]} <span class="signal-price-unit">${t('美分','cents')}</span></strong></button>`).join('')}</div><p class="signal-chart-title">${t(`正在查看：${active.name}合约`,`Viewing: ${active.name} contract`)}</p><p class="signal-axis-title">${t('纵轴：每份价格（美分）','Vertical: price per unit (cents)')}</p><svg class="signal-chart" viewBox="0 0 330 192" fill="none" aria-hidden="true">${[80,60,40,20,0].map(price=>`<path class="signal-grid" d="M38 ${y(price)}H298"/><text x="3" y="${y(price)+5}">${price}</text>`).join('')}<path class="signal-axis" d="M38 30V160H298"/><polyline class="signal-trace signal-${active.key}" points="${prices.map((price,i)=>`${38+i*52},${y(price)}`).join(' ')}"/>${prices.map((price,i)=>`<circle class="signal-end signal-${active.key}" cx="${38+i*52}" cy="${y(price)}" r="${i===5?5:2.5}"/>`).join('')}<text class="signal-label signal-${active.key}" x="298" y="${y(prices[5])-13}" text-anchor="middle">${prices[5]}</text>${prices.map((_,i)=>`<path class="signal-axis" d="M${38+i*52} 160v5"/><text class="signal-tick" x="${38+i*52}" y="186" text-anchor="middle">${i+1}</text>`).join('')}</svg><p class="signal-axis-title">${t('横轴：第 1 → 6 次模拟报价','Horizontal: simulated quotes 1 → 6')}</p><p class="signal-price-help">${t(`${SIGNAL[active.key]} 美分 = 每份 ${quoteMoney(active.key)} 美元。线越高，市场越看好这个结果。`,`${SIGNAL[active.key]} cents = $${quoteMoney(active.key)} per unit. A higher price means stronger market support for this outcome.`)}</p></figure>`;
}
function signalPanel(){
 const heading={heavy:['暴雨风险高，先保住玉米。','Heavy rain risk is high. Protect the maize.'],dry:['更可能无雨，晾晒机会要不要留住？','Dry weather leads. Keep the drying window?'],light:['更可能是小雨，雨棚够用吗？','Light rain leads. Is the shelter enough?']};
 const advice={heavy:['按本局风险计算，全部收储的平均损失最小；但如果放晴，会少赚晾晒的钱。','Storage has the smallest average loss here, but gives up drying income if it stays dry.'],dry:['按本局风险计算，继续晾晒的平均收益最高；不过，小概率的暴雨仍可能带来损失。','Keeping maize out has the highest average return here, but unlikely heavy rain can still cause losses.'],light:['按本局风险计算，雨棚能挡小雨、又保留一些晾晒，平均结果最好；如果变成暴雨，它就挡不住了。','The shelter blocks light rain and keeps some drying opportunity, giving the best average result here. It cannot protect against heavy rain.']};
 const probabilities=t(`无雨 ${SIGNAL.dry}%、小雨 ${SIGNAL.light}%、暴雨 ${SIGNAL.heavy}%`,`${SIGNAL.dry}% dry, ${SIGNAL.light}% light rain, ${SIGNAL.heavy}% heavy rain`);
 return `<section class="market-signal" aria-label="${t('模拟市场信号','Simulated market signal')}"><h3>${t(...heading[scenario])}</h3><p>${t('本局设定：','This scenario: ')}${probabilities}${t('。报价与抽样概率对应；这是模拟规则。','. Quotes match the draw probabilities in this simulation.')}</p>${marketGraphic()}<p class="decision-small">${t(...advice[scenario])}</p><details class="decision-detail signal-detail"><summary>${t('三种安排，哪种更划算？','Which preparation has the better average result?')}</summary><dl class="result-ledger">${Object.entries(PREPARATIONS).map(([key,p])=>`<div><dt>${t(...p.name)}</dt><dd>${signed(expectedNet(key))}</dd></div>`).join('')}</dl><p class="decision-small">${t('按本局概率加权，均不买合约，单位为模拟金额。这是平均结果，不是这一局的保证收益。真实市场报价不能直接当作准确的天气概率，市场信息只作补充。','Weighted by this scenario’s probabilities; no contracts, simulated units. These are averages, not guaranteed round results. Real market quotes are not calibrated weather probabilities; the signal is supplementary.')}</p></details></section>`;
}
function contractPanel(){
 const held=getContract(hedge);
 const heading=held?t(`已买入${held.name[0]}。`,`${held.name[1]} purchased.`):hedge===false?t('这次不买合约。','No contract this round.'):t('要对冲哪一种降雨？','Which rain outcome would you hedge?');
 return `<h3 id="contract-heading" tabindex="-1">${heading}</h3><p>${t('先付成本，只有选中的天气发生才收到钱。','Pay the cost first. Only the weather outcome you select pays.')}</p><p class="decision-small basis-risk">${t('合约按约定的地点、指标和时段支付；纽约温度期货不会因为马拉维下雨而赔付。这里使用模拟降雨合约。','Contracts pay for a defined place, measure and period. New York temperature futures do not pay because it rains in Malawi. This exercise uses simulated rain contracts.')}</p><section class="contract-terms">${Object.entries(CONTRACTS).map(([key,c])=>`<div class="contract-offer"><div class="contract-cost"><span>${t(...c.name)}<small>${t('先付买入成本','Cost paid first')}</small></span><strong>${signed(-c.cost)}</strong></div><dl class="reading-facts contract-facts"><div><dt>${t(`仅${key==='light'?'小雨':'暴雨'}时收到`,`Received only in ${key==='light'?'light':'heavy'} rain`)}</dt><dd>+${number(c.payout)}</dd></div><div><dt>${t('减去成本后，合约净增加','Contract net after cost')}</dt><dd>+${number(c.payout-c.cost)}</dd></div><div><dt>${t(key==='light'?'无雨或暴雨时收到':'无雨或小雨时收到',key==='light'?'Received in dry / heavy rain':'Received in dry / light rain')}</dt><dd>0</dd></div></dl><p class="decision-small"><strong>${t('没触发：成本不退。','No trigger: cost is not refunded.')}</strong></p></div>`).join('')}<p class="decision-small">${t('一次选一种合约。小雨合约不包括暴雨；支付取决于天气，不取决于玉米损失。全部为模拟金额。','Choose one contract. Light rain does not include heavy rain. Payout depends on weather, not maize damage. All amounts are simulated.')}</p><details class="decision-detail contract-detail"><summary>${t('三种天气分别能收到多少？','Cash flow under all three weather outcomes')}</summary><table class="contract-preview"><caption>${t('仅合约净收支：收到 − 买入成本','Contract net only: received − purchase cost')}</caption><thead><tr><th scope="col">${t('天气','Weather')}</th><th scope="col">${t('小雨合约','Light contract')}</th><th scope="col">${t('暴雨合约','Heavy contract')}</th></tr></thead><tbody>${Object.keys(WEATHER).map(w=>`<tr><th scope="row">${weatherName(w)}</th>${Object.values(CONTRACTS).map(c=>`<td>${signed((w===c.trigger?c.payout:0)-c.cost)}</td>`).join('')}</tr>`).join('')}</tbody></table><p class="decision-small">${Object.values(CONTRACTS).map(c=>t(`${c.name[0]}：${c.quantity} 份 × ${SIGNAL[c.trigger]} 美分 = 成本 ${number(c.cost)}。`,`${c.name[1]}: ${c.quantity} units × ${SIGNAL[c.trigger]} cents = cost ${number(c.cost)}.`)).join(' ')}${t('对应天气发生时，每份支付 1。此例不代表马拉维有对应市场；真实合约须核对地点、时段及结算来源。模拟允许揭晓前改选，只计算最终选择，不模拟真实退款。','Each matching unit pays 1. No matching Malawi market is implied; real contracts require location, period and settlement-source checks. This exercise allows a pre-reveal change and counts only the final choice, not a real refund.')}</p></details></section><div class="hedge-buttons">${btn('buy-light',hedge==='light'?`已买小雨合约 · 成本 ${number(CONTRACTS.light.cost)}`:`买小雨合约 · 花费 ${number(CONTRACTS.light.cost)}`,hedge==='light'?`Light purchased · cost ${number(CONTRACTS.light.cost)}`:`Buy light-rain contract · cost ${number(CONTRACTS.light.cost)}`)}${btn('buy',hedge==='heavy'?`已买暴雨合约 · 成本 ${number(CONTRACTS.heavy.cost)}`:`买暴雨合约 · 花费 ${number(CONTRACTS.heavy.cost)}`,hedge==='heavy'?`Heavy purchased · cost ${number(CONTRACTS.heavy.cost)}`:`Buy heavy-rain contract · cost ${number(CONTRACTS.heavy.cost)}`)}${btn('no-hedge',hedge===false?'已选择不买':'不买合约',hedge===false?'Selected: no contract':'No contract')}</div>${hedge!==null?btn('reveal','看看天气会怎样 →','Reveal the weather →',true):''}${btn('back','调整玉米的安排','Change the preparation')}`;
}
function settlementBridge(r){
 if(!hedge)return `<figure class="settlement-bridge"><figcaption>${t('没有买合约，收支没有额外变化。','No contract. No extra change in cash flow.')}</figcaption><p class="decision-small">${t(`没有合约成本或兑付，最终净结果仍是 ${signed(r.net)}（模拟单位）。`,`No contract cost or payout. The final net remains ${signed(r.net)} teaching units.`)}</p></figure>`;
 const afterCost=r.unhedged-r.premium;
 const steps=[{label:t('合约前净结果','Before contract'),from:0,to:r.unhedged,value:r.unhedged},{label:t('买入成本','Cost'),from:r.unhedged,to:afterCost,value:-r.premium},{label:t('合约兑付','Payout'),from:afterCost,to:r.net,value:r.payout},{label:t('最终净结果','Final net'),from:0,to:r.net,value:r.net}];
 const values=[0,r.unhedged,afterCost,r.net],low=Math.min(...values),high=Math.max(...values),span=Math.max(1,high-low),pad=span*.12;
 const y=value=>(high+pad-value)/(span+2*pad)*100;
 return `<figure class="settlement-bridge"><figcaption>${t('合约怎样改变这次收支？','How did the contract change this outcome?')}</figcaption><ol class="settlement-steps" style="--zero-level:${y(0)}%">${steps.map(s=>`<li><div class="settlement-track" style="--step-end:${y(s.to)}%" aria-hidden="true"><i class="${s.value<0?'negative':'positive'}" style="--bar-top:${y(Math.max(s.from,s.to))}%;--bar-height:${Math.abs(s.to-s.from)/(span+2*pad)*100}%;--bar-origin:${s.to>=s.from?'bottom':'top'}"></i></div><span>${s.label}</span><strong data-amount="${s.value}">${signed(s.value)}</strong></li>`).join('')}</ol><p class="settlement-zero-note">${t('浅色虚线是零点；连接线带你从起始收支看到最终结果。','The pale dashed line marks zero; connectors trace the balance through each step.')}</p><p class="decision-small">${t(`作物损失仍是 ${number(r.physicalLoss)}；合约不修复玉米。合约前净结果已计入晾晒收益、作物损失和准备成本。`,`Crop loss remains ${number(r.physicalLoss)}; the contract does not repair maize. The starting net already includes drying benefit, crop loss and preparation cost.`)}</p><p class="settlement-equation">${signed(r.unhedged)} − ${number(r.premium)} + ${number(r.payout)} = <strong>${signed(r.net)}</strong> <small>${t('模拟单位','teaching units')}</small></p></figure>`;
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
 if(stage==='signal')html=`<h3>${t('天气不确定，玉米等不了。','Uncertain weather. Maize cannot wait.')}</h3><p>${t('广播只说附近可能有雨。玉米还没干透，你得先做安排。','The radio warns of possible rain nearby. The maize is still damp; you need a plan.')}</p>${btn('view','看看 Polymarket 的判断','See Polymarket’s signal',true)}${btn('skip','直接安排玉米','Go straight to preparation')}<p class="decision-small">${t('情景模拟 · 市场信号只作补充，不替代官方预报。不涉及真实交易。','Simulation · market signals supplement official forecasts. No real trading.')}</p>`;
 if(stage==='market')html=signalPanel()+btn('continue','看过了，安排玉米 →','Continue to preparation →',true);
 if(stage==='prepare')html=`<div class="preparation-intro"><h3>${t('玉米怎么安排？','What is your plan for the maize?')}</h3><p>${t('点击物件选择安排。雨棚只挡小雨；全部收储也能挡暴雨。每个物件下方标出少晒的价值。','Choose an object. The shelter blocks light rain; storage also blocks heavy rain. Each object shows the drying value forgone.')}</p></div>${preparation?preparationValues():''}${preparation?btn('prepared','安排好了，下一步 →','Plan ready. Next →',true):''}`;
 if(stage==='hedge')html=contractPanel();
 if(stage==='weather')html=`<h3>${t('看看天空，也看看玉米。','Watch the sky. Watch the maize.')}</h3>`;
 if(stage==='result')html=`<h3>${WEATHER[weather].name[t('zh','en')==='en'?1:0]}</h3><a class="decision-primary" href="#decision-results">${t('看看这次结果 ↓','See what happened ↓')}</a>`;
 return `<p id="game-status" class="decision-status ${busy||loading?'status-active':''}" tabindex="-1" role="status" aria-live="polite">${status()}</p><div class="decision-panel-content">${html}</div>${replaying?`<p class="replay-note">${t('已知天气复盘 · 不是预报','Known-weather replay · not a forecast')}</p>`:''}`;
}
function sync(){
 renderSimulationReference(scenario);
 root.dataset.scenario=scenario;root.dataset.decisionStage=stage;root.dataset.busy=String(busy);
 const active=stage==='market'?'signal':stage==='weather'?'result':stage;
 root.querySelector('.game-progress').setAttribute('aria-label',t('决策进度','Decision progress'));
 root.querySelector('.game-progress').innerHTML=progress.map(([id,n])=>`<li data-stage="${id}" ${active===id?'aria-current="step"':''}>${n[t('zh','en')==='en'?1:0]}</li>`).join('');
 $('scene').setAttribute('aria-label',t('交互式决策庭院：房屋、左侧雨棚、晾晒架、储物箱、信息面板与合约台','Interactive decision courtyard: house, left shelter, drying rack, storage, information panel and contract desk'));
 $('decision-panel').innerHTML=panel();
 for(const b of root.querySelectorAll('[data-decision=buy],[data-decision=buy-light],[data-decision=no-hedge]'))b.setAttribute('aria-pressed',String(hedge!==null&&hedge===({buy:'heavy','buy-light':'light','no-hedge':false}[b.dataset.decision])));
 for(const b of root.querySelectorAll('[data-scene-object],[data-fallback-object]')){
  const id=b.dataset.sceneObject||b.dataset.fallbackObject;b.textContent=buttons.find(([key])=>key===id)[1][t('zh','en')==='en'?1:0];if(PREPARATIONS[id]){const p=PREPARATIONS[id],delay=resolveDecision(id,'dry').dryingOpportunityLoss;b.innerHTML=`<span>${t(...p.name)}</span><small>${t(...p.protection)} · ${t(`误工 ${number(delay)}`,`Delay ${number(delay)}`)}</small>`;}
  const enabled=!busy&&!loading&&((id==='signal'&&stage==='signal')||(id==='hedge'&&stage==='hedge')||(Object.hasOwn(PREPARATIONS,id)&&stage==='prepare'));
  b.disabled=!enabled;b.hidden=!enabled;b.setAttribute('aria-pressed',String(id===preparation||id==='signal'&&seen||id==='hedge'&&Boolean(hedge)));
 }
 scene?.refreshHotspots();
 scene?.previewObject(document.activeElement?.dataset.sceneObject||null);
 syncMotionControls();
 $('decision-text').textContent=fallback?t('重试 3D','Retry 3D'):t('使用文字模式','Use text mode');
 $('decision-restart').textContent=t('换个情景，再试一次','Try the next scenario');$('decision-scenario').value=scenario;$('decision-scenario-label').textContent=t('切换模拟情景','Simulation scenario');for(const option of $('decision-scenario').options)option.textContent=t(...SCENARIOS[option.value].name);
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
function resultEquation(r){
 const terms=[
  [t('晴天满晒价值','Full sunny drying value'),number(r.availableDrying)],
  [t('准备少晒损失','Preparation drying delay'),`− ${number(r.dryingOpportunityLoss)}`],
  [t('雨天少晒损失','Rain drying interruption'),`− ${number(r.weatherDryingLoss)}`],
  [t('作物损失','Crop loss'),`− ${number(r.physicalLoss)}`],
  [t('准备成本','Preparation cost'),`− ${number(r.preparationCost)}`],
  [t('合约净收支','Contract net'),`${r.hedgeNet<0?'−':'+'} ${number(Math.abs(r.hedgeNet))}`]
 ];
 return `<p class="result-equation" aria-label="${t('你的选择如何算出净结果','How your net result is calculated')}">${terms.map(([label,value])=>`<span>${value} <small>${label}</small></span>`).join(' ')} <span class="result-equation-total"><strong>= ${signed(r.net)}</strong><small>${t('最终净结果','Final net result')}</small></span></p>`;
}
function dryingDelayNote(r){
 return `<dl class="reading-facts drying-delay-note"><div><dt>${t('实际晾晒收益','Actual drying value')}</dt><dd>${number(r.availableDrying)} − ${number(r.dryingOpportunityLoss)} − ${number(r.weatherDryingLoss)} = <strong>${number(r.drying)}</strong></dd></div><div><dt>${t('晴天满晒 − 本次净结果','Sunny baseline − this net')}</dt><dd>${number(r.availableDrying)} − (${signed(r.net)}) = <strong>${number(r.gapFromFullDrying)}</strong></dd></div></dl><p class="decision-small">${t('少晒已计入实际晾晒收益；与晴天的差额仅作比较，都不另扣一遍。','Drying forgone is already included in the drying value. The sunny baseline gap is a comparison, not another charge.')}</p>`;
}
function weatherDifferenceNote(){
 const dry=resolveDecision(preparation,'dry',false),light=resolveDecision(preparation,'light',false);
 const difference=Number((dry.net-light.net).toFixed(1));
 return `<p class="weather-difference-note decision-small">${preparation==='store'?t('全部收起后，无雨和小雨都不再晾晒，也没有淋雨损失：0 − 0 − 5 = −5。合约另外计算，小雨与暴雨分别触发对应合约；不是把小雨算成无雨。','Once all maize is stored, neither dry nor light rain adds drying or crop damage: 0 − 0 − 5 = −5. Contracts are separate; light and heavy rain trigger their matching contracts. Equal maize totals do not mean rain was ignored.'):t(`同样安排，不买合约：无雨 ${signed(dry.net)}，小雨 ${signed(light.net)}。小雨多损失 ${number(difference)} = 少晒 ${number(light.weatherDryingLoss)} + 淋雨损失 ${number(light.physicalLoss)}。`,`Same plan, no contract: dry ${signed(dry.net)}, light rain ${signed(light.net)}. Light rain costs ${number(difference)} more: ${number(light.weatherDryingLoss)} less drying + ${number(light.physicalLoss)} crop damage.`)}</p>`;
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
 const rows=[[t('晾晒收益','Drying earned'),signed(r.drying)],[t('晴天误工损失','Forgone drying value'),signed(-r.dryingOpportunityLoss)],[t('准备成本','Preparation cost'),signed(-r.preparationCost)],[t('不买合约的净收益','Net without a contract'),signed(r.net)]];
 return `<div class="preparation-readout"><strong>${PREPARATIONS[preparation].name[t('zh','en')==='en'?1:0]}</strong><span>${t(...PREPARATIONS[preparation].protection)}</span><span>${t('若一直晴天 · 模拟单位','If it stays dry · simulated units')}</span><dl class="result-ledger">${rows.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><span>${t(`误工损失已计入晾晒收益：${number(r.availableDrying)} − ${number(r.dryingOpportunityLoss)} = ${number(r.drying)}。`,`Forgone value is already included: ${number(r.availableDrying)} − ${number(r.dryingOpportunityLoss)} = ${number(r.drying)}.`)}</span></div>`;
}
function contractExplanation(r){
 const c=getContract(hedge);
 if(!c)return t('你没有买合约；另外两栏只是同一天气、同样准备下的对照，不是已经收到的钱。','You bought no contract. The other two columns are same-weather, same-plan comparisons, not payments you received.');
 return r.payout?t(`你买的是${c.name[0]}，这次${weatherName(weather)}符合支付条件：收到 ${number(r.payout)} − 成本 ${number(r.premium)} = 合约净增加 ${number(r.hedgeNet)}。玉米损失不会因此消失。`,`Your ${c.name[1]} matches the ${weatherName(weather)} outcome: received ${number(r.payout)} − cost ${number(r.premium)} = contract net ${signed(r.hedgeNet)}. Maize damage is unchanged.`):
 t(`你买的是${c.name[0]}，但这次是${weatherName(weather)}，不符合支付条件。收到 0，成本 ${number(r.premium)} 不退，因此比不买多支出 ${number(r.premium)}。`,`You bought a ${c.name[1]}, but the outcome is ${weatherName(weather)}. The trigger was not met: payout 0 and cost ${number(r.premium)} is not refunded, so buying costs ${number(r.premium)} more than declining.`);
}
function decisionImpact(r){
 const baseline=resolveDecision('all',weather,false),gain=Math.round((r.net-baseline.net)*10)/10;
 const preparationGain=Math.round((r.unhedged-baseline.net)*10)/10;
 const headline=gain>0?t(`比直接晾晒多保住 ${number(gain)}`,`You kept ${number(gain)} more than leaving maize out`):gain<0?t(`比直接晾晒少 ${number(-gain)}`,`You finished ${number(-gain)} below leaving maize out`):t('这次与直接晾晒的结果相同','Same result as leaving maize out');
 return `<section class="decision-impact" aria-label="${t('你的选择带来了什么变化','What your choices changed')}"><h3>${headline}</h3><p class="decision-small">${t('同一场天气 · 模拟金额 · 对照固定为直接晾晒、不买合约','Same weather · simulated units · baseline: keep drying, no contract')}${replaying?t(' · 指定天气复盘',' · Selected-weather replay'):''}</p><dl class="impact-values"><div><dt>${t('直接晾晒、不买合约','Keep drying, no contract')}</dt><dd>${signed(baseline.net)}</dd></div><div><dt>${t('你的最终收支','Your final result')}</dt><dd class="${r.net<0?'negative':'positive'}">${signed(r.net)}</dd></div></dl><p>${t(`准备方式改变了 ${signed(preparationGain)}；合约另计 ${signed(r.hedgeNet)}。合计差额 ${signed(gain)}。`,`Preparation changed the result by ${signed(preparationGain)}; the contract added ${signed(r.hedgeNet)}. Total difference: ${signed(gain)}.`)}</p><p class="decision-small">${seen?t('你查看过市场信号。差额来自实际采取的行动；只查看信息，收支不会改变。','You viewed the signal. The difference comes from your actions; viewing alone does not change the result.'):t('即使没查看信号，同样的准备与合约也会得到同样的结果。','With the same preparation and contract, you get the same result even without viewing the signal.')}</p></section>`;
}
function renderResults(){
 const r=resolveDecision(preparation,weather,hedge),light=resolveDecision(preparation,weather,'light'),heavy=resolveDecision(preparation,weather,'heavy');
 const rows=[[t('晾晒收益','Drying benefit'),r.drying],[t('作物损失','Crop loss'),-r.physicalLoss],[t('准备成本','Preparation cost'),-r.preparationCost],[t('合约成本','Contract cost'),-r.premium],[t('合约兑付','Contract payout'),r.payout]];
 const results=$('decision-results');results.hidden=false;
 const expandedDetails=['result-detail','weather-detail'].filter(key=>results.querySelector(`.${key}`)?.open);
 const scale=Math.max(1,Math.abs(r.unhedged),Math.abs(light.net),Math.abs(heavy.net));
 const comparison=(value,label,selected)=>`<div class='${selected?'net-selected':''}'><span>${label}${selected?t(' · 你的选择',' · Your choice'):''}</span><strong class='${value<0?'negative':'positive'}'>${signed(value)}</strong><div class='net-bar' aria-hidden='true'><i class='${value<0?'negative':'positive'}' style='width:${Math.abs(value)/scale*100}%'></i></div></div>`;
 results.innerHTML=`${decisionImpact(r)}<header><h3>${outcomeStory()}</h3><p class='decision-small'><strong class='result-weather-name'>${WEATHER[weather].name[t('zh','en')==='en'?1:0]}</strong> · ${t('以下为模拟单位；正数是净增益，负数是净损失。','Teaching units: positive means net gain; negative means net loss.')}</p></header><dl class='outcome-metrics'><div><dt>${t('晾晒收益','Drying benefit')}</dt><dd class='positive'>${signed(r.drying)}</dd></div><div><dt>${t('作物损失','Crop loss')}</dt><dd class='negative'>${signed(-r.physicalLoss)}</dd></div><div><dt>${t('合约净收支','Contract net')}</dt><dd class='${r.hedgeNet<0?'negative':'positive'}'>${signed(r.hedgeNet)}</dd></div></dl>${resultEquation(r)}${dryingDelayNote(r)}${weatherDifferenceNote()}<div class='net-comparison'>${comparison(r.unhedged,t('不买合约的净结果','Net without contract'),!hedge)}${comparison(light.net,hedge==='light'?t('买小雨合约的净结果','Net with light contract'):t('如果买小雨合约','If a light contract were purchased'),hedge==='light')}${comparison(heavy.net,hedge==='heavy'?t('买暴雨合约的净结果','Net with heavy contract'):t('如果买暴雨合约','If a heavy contract were purchased'),hedge==='heavy')}</div><p class='hedge-explanation'>${contractExplanation(r)}</p><details class='decision-detail result-detail'><summary>${t('查看收支计算','See the calculation')}</summary><dl class='result-ledger'>${rows.map(([label,value])=>`<div><dt>${label}</dt><dd>${signed(value)}</dd></div>`).join('')}</dl><p class='decision-small'>${t('净结果 = 晾晒收益 − 作物损失 − 准备成本 − 合约成本 + 合约兑付。','Net = drying benefit − crop loss − preparation cost − contract cost + payout.')}</p>${settlementBridge(r)}</details><details class='decision-detail weather-detail'><summary>${t('比较三种天气的收支／切换天气','Compare cash flow / replay weather')}</summary><p class='decision-small'>${t('这是已知天气的复盘，不是预测。','A known-weather replay, not a forecast.')}</p>${weatherAccountingTable()}<div class='known-replays'>${Object.entries(WEATHER).map(([w])=>`<button data-weather-replay='${w}' aria-pressed='${weather===w}' type='button'>${t({dry:'无雨',light:'晚到的小雨',heavy:'早到的暴雨'}[w],{dry:'Dry',light:'Late light rain',heavy:'Early heavy rain'}[w])}</button>`).join('')}</div></details>`;
 const review=$('inline-review');if(review)review.innerHTML=`<p>${t('多晒一会儿，还是先保护玉米？没有适用于所有天气的安排。信息、准备和合约各管一层，不能互相替代。','Keep drying, or protect the maize now? No plan fits every weather. Information, preparation and contracts serve different roles.')}</p><details class='decision-detail preparation-detail'><summary>${t('比较同一天气下的其他准备','Compare preparations under the same weather')}</summary><div class='decision-table-wrap'><table class='decision-table'><caption>${t('模拟单位 · 晾晒收益 = 24 − 准备少晒 − 雨天少晒；少晒损失不重复扣除','Simulated units · drying = 24 − preparation delay − rain interruption; never deduct delay twice')}</caption><thead><tr><th>${t('准备方式','Preparation')}</th><th>${t('晾晒收益','Drying benefit')}</th><th>${t('准备少晒','Preparation delay')}</th><th>${t('雨天少晒','Rain interruption')}</th><th>${t('准备成本','Preparation cost')}</th><th>${t('作物损失','Crop loss')}</th><th>${t('不买合约','No contract')}</th><th>${t('买小雨合约','Light contract')}</th><th>${t('买暴雨合约','Heavy contract')}</th></tr></thead><tbody>${Object.entries(PREPARATIONS).map(([id,p])=>{const no=resolveDecision(id,weather,false),held=resolveDecision(id,weather,'heavy'),light=resolveDecision(id,weather,'light');return `<tr ${id===preparation?"class='chosen'":''}><th scope='row'>${p.name[t('zh','en')==='en'?1:0]}${id===preparation?t(' · 你的准备',' · Your plan'):''}</th><td>${signed(no.drying)}</td><td>${signed(-no.dryingOpportunityLoss)}</td><td>${signed(-no.weatherDryingLoss)}</td><td>${signed(-no.preparationCost)}</td><td>${signed(-no.physicalLoss)}</td><td>${signed(no.net)}</td><td>${signed(light.net)}</td><td>${signed(held.net)}</td></tr>`;}).join('')}</tbody></table></div></details>`;
 for(const key of expandedDetails)results.querySelector(`.${key}`).open=true;
 const key=`${epoch}:${preparation}:${weather}:${hedge}`;cancelAnimationFrame(amountFrame);if(resultKey!==key){resultKey=key;animateAmounts();}
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
function showFallback(){loading=false;$('scene').setAttribute('aria-busy','false');scene?.dispose();scene=null;$('scene').querySelectorAll('canvas,.decision-fallback').forEach(el=>el.remove());const el=document.createElement('div');el.className='decision-fallback';el.innerHTML=`<img src="/thoko-family.png" alt="${t('情景模拟：Thoko 一家晒玉米','Simulation: Thoko’s family drying maize')}"><div>${buttons.map(([id,n])=>`<button data-fallback-object="${id}" type="button">${n[t('zh','en')==='en'?1:0]}</button>`).join('')}</div>`;$('scene').prepend(el);}
function restart(next){const keys=Object.keys(SCENARIOS);scenario=next||keys[(keys.indexOf(scenario)+1)%keys.length];SIGNAL=getScenario(scenario).signal;CONTRACTS=contractsFor(scenario);++epoch;cancelAnimationFrame(amountFrame);resultKey='';receiptKey='';signalWeather=scenario;$('decision-results').replaceChildren();scene?.reset();stage='signal';preparation=null;hedge=null;seen=false;busy=false;replaying=false;weather=drawOutcome();if(loading&&!scene&&!fallback)loadScene();sync();focusStatus();}
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
