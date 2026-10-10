import './decision-diorama.css';
import {PREPARATIONS,WEATHER,SIGNAL,CONTRACT,drawOutcome,resolveDecision} from './decision-model.js';

const root=document.querySelector('#action');
const $=id=>document.getElementById(id);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const compact=matchMedia('(max-width:1050px)');
const t=(zh,en)=>document.documentElement.lang.startsWith('en')?en:zh;
const number=n=>Number(n.toFixed(1)).toLocaleString(document.documentElement.lang);
const signed=n=>(n>0?'+':n<0?'−':'')+number(Math.abs(n));
const params=new URLSearchParams(location.search);
const initialReplay={rain:'heavy',sun:'dry',dry:'dry',light:'light',heavy:'heavy'}[params.get('replay')];
let stage='signal',preparation=null,hedge=null,seen=false,weather=initialReplay||drawOutcome(),scene=null;
let busy=false,loading=true,paused=false,fallback=false,storageOpen=false,epoch=0,replaying=!!initialReplay,amountFrame=0,resultKey='',receiptKey='';
const buttons=[['signal',['市场信号','Market signal']],['shelter',['左侧雨棚','Left shelter']],['all',['晾晒架','Drying rack']],['cover',['遮盖布','Tarp']],['store',['储物箱','Storage']],['hedge',['查看合约','View contract']]];
const progress=[['signal',['看信息','Signal']],['prepare',['做准备','Prepare']],['hedge',['选合约','Contract']],['result',['看结果','Outcome']]];
const btn=(action,zh,en,primary=false)=>`<button type="button" data-decision="${action}" ${busy||loading?'disabled':''} class="${primary?'decision-primary':''}">${t(zh,en)}</button>`;
function status(){
 if(loading)return t('决策庭院加载中…','Loading the decision courtyard…');
 if(busy)return stage==='weather'?t('看看云层和光线怎样变化，哪些玉米仍在外面。','Watch the clouds and light change, and the maize left outside.'):stage==='hedge'?t('正在支付模拟合约成本；这笔钱不能替玉米挡雨。','Paying the example contract cost. This payment cannot shelter the maize.'):t('Thoko 正在做准备，院子也在变化。','Thoko is preparing. Watch the courtyard change.');
 return {signal:t('玉米还没干透。广播只说区域内可能有雨，村里几点下雨并不清楚。决定不能一直等。','The maize is still damp. The radio mentions possible regional rain, but not when it will reach this village. The decision cannot wait.'),market:t('市场判断更偏向有雨，无雨仍有可能。看见信号，不等于知道结果。','Market judgment leans toward rain. Dry weather is still possible. A signal is not certainty.'),prepare:t('点击院子里的物件，安排玉米。准备减少暴露，也会改变晾晒机会。','Choose an object in the courtyard. Preparation reduces exposure but changes drying opportunity.'),hedge:t('玉米已经安排好。接下来，你可以选择是否对冲一部分财务风险。','The maize is arranged. Now decide whether to hedge part of the financial risk.'),result:t('天气没有因为选择而改变。下面拆开看：晾晒、作物损失、合约收支。','Your choices did not change the weather. Separate the drying benefit, crop loss and contract cash flows.')}[stage]||'';
}
function signalPanel(){return `<section class="market-signal" aria-label="${t('模拟市场信号','Simulated market signal')}"><h3>${t('市场更偏向有雨。','The market leans toward rain.')}</h3><svg class="signal-weather" viewBox="0 0 120 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M30 58a17 17 0 0 1-2-34 26 26 0 0 1 49-2 18 18 0 1 1 8 36Z"/><path d="m40 72-5 11m27-11-5 11m27-11-5 11"/></svg><p class="signal-verdict">${t('但无雨仍有可能。','Dry weather is still possible.')}</p><p class="decision-small">${t('Polymarket 汇集交易者的判断，只作补充参考，不替代官方预报。','Polymarket brings traders’ judgments together. It supplements, not replaces, official forecasts.')}</p><details class="decision-detail signal-detail"><summary>${t('这个判断从哪来？','What is this signal based on?')}</summary><p class="decision-small">${t('有雨两档的示例价格合计高于无雨。这是市场价格，不是降雨概率；以下报价均为模拟。','The two rain outcomes have a higher combined illustrative price than dry. These are simulated market prices, not rain probabilities.')}</p><dl class="signal-quotes">${Object.entries(SIGNAL).map(([w,p])=>`<div><dt>${t({dry:'无雨',light:'小雨',heavy:'暴雨'}[w],{dry:'Dry',light:'Light rain',heavy:'Heavy rain'}[w])}</dt><dd><i style="--quote-width:${p}%" aria-hidden="true"></i><span>${p}¢</span></dd></div>`).join('')}</dl></details></section>`;}
function contractPanel(){
 return `<h3 id="contract-heading" tabindex="-1">${t('买一份天气合约吗？','Buy a weather contract?')}</h3><p>${t('合约不能挡雨，但可能补回一部分钱。','A contract cannot stop rain, but may offset some financial loss.')}</p><section class="contract-terms"><div class="contract-cost"><span>${t('买入成本','Purchase cost')}</span><strong>${signed(-CONTRACT.cost)}</strong></div><dl class="contract-outcomes"><div><dt>${t('暴雨：收到 30','Heavy rain: receive 30')}</dt><dd class="positive">${t('扣除成本，净得 18','Net +18 after cost')}</dd></div><div><dt>${t('无雨 / 小雨：不兑付','Dry / light rain: no payout')}</dt><dd class="negative">${t('损失买入成本 12','Lose the cost of 12')}</dd></div></dl><p class="decision-small">${t('按天气条件兑付，不按玉米损失赔偿。金额均为模拟单位。','Pays on the weather trigger, not crop damage. All amounts are teaching units.')}</p><details class="decision-detail contract-detail"><summary>${t('示例条款与计算','Example terms and calculation')}</summary><table class="contract-preview"><caption>${t('合约收支，不包含作物损失','Contract cash flow, excluding crop loss')}</caption><thead><tr><th scope="col">${t('天气','Weather')}</th><th scope="col">${t('收到','Received')}</th><th scope="col">${t('扣除成本','After cost')}</th></tr></thead><tbody>${Object.entries(WEATHER).map(([w])=>{const payout=w===CONTRACT.trigger?CONTRACT.payout:0;return `<tr><th scope="row">${t({dry:'无雨',light:'小雨',heavy:'暴雨'}[w],{dry:'Dry',light:'Light rain',heavy:'Heavy rain'}[w])}</th><td>${signed(payout)}</td><td>${signed(payout-CONTRACT.cost)}</td></tr>`;}).join('')}</tbody></table><p class="decision-small">${t(`${CONTRACT.quantity} 份 × 每份 ${number(CONTRACT.price)} = ${CONTRACT.cost}。暴雨时每份兑付 1；小雨造成损失也不兑付，玉米已受保护也不影响暴雨兑付。这里不代表马拉维有对应市场，真实合约须核对地点、时段与结算来源。`,`${CONTRACT.quantity} units × ${number(CONTRACT.price)} = ${CONTRACT.cost}. Heavy rain pays 1 per unit, even if maize is protected; light-rain crop losses do not trigger it. No matching Malawi market is implied. Real contracts require location, period and settlement-source checks.`)}</p></details></section><div class="hedge-buttons">${btn('buy','买入示例合约','Buy the example contract')}${btn('no-hedge','不买合约','No contract')}</div>${hedge!==null?btn('reveal','看看天气会怎样 →','Reveal the weather →',true):''}${btn('back','调整玉米的安排','Change the preparation')}`;
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
  const protectedCount=Math.round((1-PREPARATIONS[preparation].outside)*48),exposed=48-protectedCount;
  note.textContent=busy&&stage==='prepare'?t('正在搬运或遮盖，请看玉米的位置变化。','Watch the maize move or receive its cover.'):preparation==='cover'?t('遮布已展开，玉米留在架上，避开直接淋雨。','Tarp unfolded. Maize stays on the rack, away from direct rain.'):preparation==='store'?t('玉米全部收进箱里，也暂时停止了露天晾晒。','All maize is stored; outdoor drying has stopped.'):preparation==='all'?t('玉米全部留在架上：多一段晾晒，也多一份淋雨风险。','All maize remains on the rack: more drying time, more rain exposure.'):t(`场景中 ${protectedCount} 穗已移到${preparation==='shelter'?'左侧雨棚':'储物箱'}，${exposed} 穗仍在露天架上。`,`${protectedCount} model ears are in ${preparation==='shelter'?'the left shelter':'storage'}; ${exposed} remain outside.`);
 }
 const condition=$('decision-condition');condition.hidden=stage!=='result';
 if(stage==='result'){
  const protectedCount=Math.round((1-PREPARATIONS[preparation].outside)*48),exposed=48-protectedCount;
  condition.innerHTML=`${protectedCount?`<span><i class="corn-protected" aria-hidden="true"></i>${t(`收储 / 遮盖 / 雨棚：${protectedCount} 穗`,`${protectedCount} ears stored / covered / sheltered`)}</span>`:''}${exposed?`<span><i class="${weather==='dry'?'corn-protected':'corn-exposed'}" aria-hidden="true"></i>${weather==='dry'?t(`露天继续晾晒：${exposed} 穗`,`${exposed} ears drying outside`):t(`露天被雨淋湿：${exposed} 穗`,`${exposed} exposed ears got wet`)}</span>`:''}<small>${t('对应场景中的模型玉米，不是实测产量或损失。','Model ears in the scene, not measured crop yield or loss.')}</small>`;
 }
 receipt.hidden=hedge!==true||stage==='result';
 if(hedge===null){receiptKey='';return;}
 const settled=stage==='result',payout=settled?resolveDecision(preparation,weather,hedge).payout:0,cost=hedge?CONTRACT.cost:0;
 const key=`${hedge}:${settled}:${weather}:${document.documentElement.lang}`;
 if(key===receiptKey)return;receiptKey=key;
 receipt.dataset.state=settled?(payout?'payout':hedge?'no-payout':'declined'):'awaiting';
 receipt.innerHTML=`<p>${t('示例合约收支 · 模拟单位','Example contract cash flow · teaching units')}</p><dl><div><dt>${t('已付成本','Cost paid')}</dt><dd class="negative">${signed(-cost)}</dd></div><div><dt>${t('合约支付','Payout')}</dt><dd class="positive">${settled||!hedge?signed(payout):t('待揭晓','Pending')}</dd></div><div><dt>${t('合约净收支','Contract net')}</dt><dd class="${payout-cost<0?'negative':'positive'}">${settled||!hedge?signed(payout-cost):'—'}</dd></div></dl>`;
 if(!reduced.matches&&!paused)receipt.animate([{opacity:.4},{opacity:1}],{duration:300});
}
function panel(){
 let html='';
 if(stage==='signal')html=`<h3>${t('天气不确定，玉米等不了。','Uncertain weather. Maize cannot wait.')}</h3><p>${t('广播只说附近可能有雨。玉米还没干透，你得先做安排。','The radio warns of possible rain nearby. The maize is still damp; you need a plan.')}</p>${btn('view','看看 Polymarket 的判断','See Polymarket’s signal',true)}${btn('skip','直接安排玉米','Go straight to preparation')}<p class="decision-small">${t('情景模拟 · 市场信号只作补充，不替代官方预报。不涉及真实交易。','Simulation · market signals supplement official forecasts. No real trading.')}</p>`;
 if(stage==='market')html=signalPanel()+btn('continue','看过了，安排玉米 →','Continue to preparation →',true);
 if(stage==='prepare')html=`<h3>${t('玉米怎么安排？','What is your plan for the maize?')}</h3><p>${t('点击院子里的晾晒架、雨棚、遮布或储物箱，选一种安排。','Choose a plan by tapping the rack, shelter, tarp or storage.')}</p>${preparation?`<div class="preparation-readout"><strong>${PREPARATIONS[preparation].name[t('zh','en')==='en'?1:0]}</strong><span>${t('仍露天','Still exposed')} ${Math.round(PREPARATIONS[preparation].outside*100)}% · ${t('准备成本','Preparation cost')} ${PREPARATIONS[preparation].cost}</span></div>`:''}${storageOpen?`<div class="storage-choices"><h4>${t('收起多少？','How much should be stored?')}</h4>${btn('batch','收起一半，留一半晾晒','Store half, keep half drying')}${btn('store','全部收起','Store everything')}</div>`:''}${preparation?btn('prepared','安排好了，下一步 →','Plan ready. Next →',true):''}`;
 if(stage==='hedge')html=contractPanel();
 if(stage==='weather')html=`<h3>${t('看看天空，也看看玉米。','Watch the sky. Watch the maize.')}</h3>`;
 if(stage==='result')html=`<h3>${WEATHER[weather].name[t('zh','en')==='en'?1:0]}</h3><p>${t(weather==='dry'?'留在架上的玉米继续晾晒。':preparation==='all'?'露天的玉米淋湿了。':'雨棚、遮布和收储让玉米少淋一些雨。',weather==='dry'?'Maize on the rack kept drying.':preparation==='all'?'The exposed maize got wet.':'Shelter, covering or storage reduced rain exposure.')}</p><a class="decision-primary" href="#decision-results">${t('这次赚了还是亏了？ ↓','What did this decision cost? ↓')}</a>`;
 return `<p id="game-status" class="decision-status ${busy||loading?'status-active':''}" tabindex="-1" role="status" aria-live="polite">${status()}</p><div class="decision-panel-content">${html}</div>${replaying?`<p class="replay-note">${t('已知天气复盘 · 不是预报','Known-weather replay · not a forecast')}</p>`:''}`;
}
function sync(){
 root.dataset.decisionStage=stage;root.dataset.busy=String(busy);
 const active=stage==='market'?'signal':stage==='weather'?'result':stage;
 root.querySelector('.game-progress').setAttribute('aria-label',t('决策进度','Decision progress'));
 root.querySelector('.game-progress').innerHTML=progress.map(([id,n])=>`<li data-stage="${id}" ${active===id?'aria-current="step"':''}>${n[t('zh','en')==='en'?1:0]}</li>`).join('');
 $('scene').setAttribute('aria-label',t('交互式决策庭院：房屋、左侧雨棚、晾晒架、遮布、储物箱、信息面板与合约台','Interactive decision courtyard: house, left shelter, drying rack, tarp, storage, information panel and contract desk'));
 $('decision-panel').innerHTML=panel();
 for(const b of root.querySelectorAll('[data-decision=buy],[data-decision=no-hedge]'))b.setAttribute('aria-pressed',String(hedge!==null&&hedge===(b.dataset.decision==='buy')));
 for(const b of root.querySelectorAll('[data-scene-object],[data-fallback-object]')){
  const id=b.dataset.sceneObject||b.dataset.fallbackObject;b.textContent=buttons.find(([key])=>key===id)[1][t('zh','en')==='en'?1:0];
  const enabled=!busy&&!loading&&((id==='signal'&&stage==='signal')||(id==='hedge'&&stage==='hedge')||(['all','shelter','cover','store'].includes(id)&&stage==='prepare'));
  b.disabled=!enabled;b.hidden=!enabled;b.setAttribute('aria-pressed',String(id===preparation||id==='signal'&&seen||id==='hedge'&&hedge===true));
 }
 scene?.refreshHotspots();
 scene?.previewObject(document.activeElement?.dataset.sceneObject||null);
 $('decision-pause').textContent=paused?t('继续动画','Resume animation'):t('暂停动画','Pause animation');
 $('decision-pause').setAttribute('aria-pressed',String(paused));
 $('decision-pause').hidden=fallback||reduced.matches;
 $('decision-text').textContent=fallback?t('重试 3D','Retry 3D'):t('使用文字模式','Use text mode');
 $('decision-restart').textContent=t('重新开始','Restart');
 root.querySelector('.motion-options summary').textContent=t('动画选项','Animation options');
 $('decision-clock').textContent=stage==='result'?t({dry:'傍晚 · 无雨',light:'午后较晚 · 小雨到了',heavy:'午后刚开始 · 暴雨到了'}[weather],{dry:'Evening · stayed dry',light:'Late afternoon · light rain',heavy:'Early afternoon · heavy rain'}[weather]):stage==='weather'?t('时间推移 · 天气揭晓','Time passes · weather unfolds'):t('上午 · 玉米仍在晾晒','Morning · maize is drying');
 $('decision-scene-hint').hidden=!fallback&&(!!preparation||!['signal','prepare'].includes(stage));
 $('decision-scene-hint').textContent=fallback?t('文字模式 · 仍可完成选择和收支比较。','Text mode · decisions and cash comparisons remain available.'):t('点亮的物件可以点击','Tap the highlighted objects');
 sceneFeedback();
 if(stage==='result')renderResults();else{cancelAnimationFrame(amountFrame);$('decision-results').hidden=true;const review=$('inline-review');if(review)review.innerHTML=`<p>${t('完成庭院决策后，这里会在同一场天气下比较五种准备及买 / 不买合约的结果。','Complete the courtyard decisions to compare five preparations, with and without a contract, under the same weather.')}</p>`;}
 const actions=$('decision-world-actions');actions.replaceChildren();
 if(compact.matches&&!fallback&&!busy&&!loading){const next=$('decision-panel').querySelector(stage==='prepare'?'[data-decision=prepared]':stage==='hedge'&&hedge===true?'[data-decision=reveal]':stage==='result'?'a[href="#decision-results"]':'[data-no-scene-action]');if(next)actions.append(next);}
 actions.hidden=!actions.childElementCount;
 $('decision-panel').classList.toggle('compact-outcome',compact.matches&&!fallback&&stage==='result');
}
function focusStatus(){const el=$('game-status');el?.focus({preventScroll:true});}
function watchScene(){if(!compact.matches||reduced.matches||paused||fallback||!scene)return;const el=$('scene'),r=el.getBoundingClientRect();if(r.top<24||r.bottom>innerHeight-30)el.scrollIntoView({block:'start',behavior:'instant'});}
async function prepare(next){if(busy||stage!=='prepare')return;const token=epoch;busy=true;storageOpen=false;preparation=next;sync();watchScene();await scene?.prepare(next);if(token!==epoch)return;busy=false;sync();focusStatus();}
function object(id){if(busy||loading)return;if(id==='signal'&&stage==='signal')act('view');if(id==='hedge'&&stage==='hedge'){$('contract-heading')?.focus();return;}if(stage==='prepare'&&['all','shelter','cover','store'].includes(id)){if(id==='store'){storageOpen=true;sync();scene?.inspectStorage();$('decision-panel').querySelector('[data-decision="batch"]').focus();$('game-status').textContent=t('分批收储，还是全部收起？','Bring in half, or the whole batch?');}else prepare(id);}}
async function act(action){
 if(busy||loading)return;
 if(action==='view'&&stage==='signal'){seen=true;scene?.showSignal();stage='market';}
 else if(action==='skip'&&stage==='signal')stage='prepare';
 else if(action==='continue'&&stage==='market')stage='prepare';
 else if(['all','batch','cover','shelter','store'].includes(action)&&stage==='prepare'){await prepare(action);return;}
 else if(action==='prepared'&&stage==='prepare'&&preparation)stage='hedge';
 else if(['buy','no-hedge'].includes(action)&&stage==='hedge'){const next=action==='buy';if(hedge!==next){const token=epoch;hedge=next;busy=next;sync();if(next)watchScene();await scene?.purchase(hedge);if(token!==epoch)return;busy=false;}}
 else if(action==='back'&&stage==='hedge'){hedge=null;scene?.purchase(false);stage='prepare';}
 else if(action==='reveal'&&stage==='hedge'&&hedge!==null){
  const token=epoch;stage='weather';busy=true;sync();watchScene();focusStatus();await scene?.reveal(weather);if(token!==epoch)return;
  busy=false;stage='result';scene?.settle(resolveDecision(preparation,weather,hedge).payout);sync();focusStatus();return;
 }else if(action==='restart'){restart();return;}
 sync();if(stage==='prepare'&&compact.matches&&!fallback)$('scene').scrollIntoView({block:'start',behavior:'instant'});focusStatus();
}
function animateAmounts(){cancelAnimationFrame(amountFrame);if(reduced.matches||paused)return;
 // Money stays exact. Only the comparison lengths animate.
 root.querySelectorAll('.net-bar i').forEach(el=>el.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:650,easing:'cubic-bezier(.16,1,.3,1)'}));
 root.querySelectorAll('.settlement-track i').forEach((el,i)=>el.animate([{transform:'scaleY(0)'},{transform:'scaleY(1)'}],{duration:420,delay:i*220,fill:'backwards',easing:'cubic-bezier(.16,1,.3,1)'}));
}
function renderResults(){
 const r=resolveDecision(preparation,weather,hedge),yes=resolveDecision(preparation,weather,true);
 const rows=[[t('晾晒收益','Drying benefit'),r.drying],[t('作物损失','Crop loss'),-r.physicalLoss],[t('准备成本','Preparation cost'),-r.preparationCost],[t('合约成本','Contract cost'),-r.premium],[t('合约兑付','Contract payout'),r.payout]];
 const results=$('decision-results');results.hidden=false;
 const scale=Math.max(1,Math.abs(r.unhedged),Math.abs(yes.net));
 const comparison=(value,label,selected)=>`<div class='${selected?'net-selected':''}'><span>${label}${selected?t(' · 你的选择',' · Your choice'):''}</span><strong class='${value<0?'negative':'positive'}'>${signed(value)}</strong><div class='net-bar' aria-hidden='true'><i class='${value<0?'negative':'positive'}' style='width:${Math.abs(value)/scale*100}%'></i></div></div>`;
 results.innerHTML=`<header><h3>${t('准备护住玉米，合约改变收支。','Preparation protects maize. Contracts change cash flow.')}</h3><p class='decision-small'>${t('以下为模拟单位；正数是净增益，负数是净损失。','Teaching units: positive means net gain; negative means net loss.')}</p></header><dl class='outcome-metrics'><div><dt>${t('晾晒收益','Drying benefit')}</dt><dd class='positive'>${signed(r.drying)}</dd></div><div><dt>${t('作物损失','Crop loss')}</dt><dd class='negative'>${signed(-r.physicalLoss)}</dd></div><div><dt>${t('合约净收支','Contract net')}</dt><dd class='${r.hedgeNet<0?'negative':'positive'}'>${signed(r.hedgeNet)}</dd></div></dl><div class='net-comparison'>${comparison(r.unhedged,t('不买合约的净结果','Net without contract'),!hedge)}${comparison(yes.net,hedge?t('买入合约后的净结果','Net with contract'):t('如果买入合约','If a contract were purchased'),hedge)}</div><p class='hedge-explanation'>${hedge?weather==='heavy'?t('合约兑付 30，扣除买入成本后补回 18；淋湿的玉米并没有恢复。','The contract paid 30: an offset of 18 after cost. Wet maize was not repaired.'):t('未触发暴雨兑付，买入成本让净结果减少了 12。','No heavy-rain payout. The cost reduced the net outcome by 12.'):t('你没有支付合约成本。右侧仅作同一天气、同样准备下的对照。','You paid no contract cost. The second outcome is a same-weather, same-plan comparison.')}</p><details class='decision-detail result-detail'><summary>${t('查看收支计算','See the calculation')}</summary><dl class='result-ledger'>${rows.map(([label,value])=>`<div><dt>${label}</dt><dd>${signed(value)}</dd></div>`).join('')}</dl><p class='decision-small'>${t('净结果 = 晾晒收益 − 作物损失 − 准备成本 − 合约成本 + 合约兑付。','Net = drying benefit − crop loss − preparation cost − contract cost + payout.')}</p>${settlementBridge(r)}</details><details class='decision-detail weather-detail'><summary>${t('保持安排，换一种天气看看','Keep the plan; try another weather')}</summary><p class='decision-small'>${t('这是已知天气的复盘，不是预测。','A known-weather replay, not a forecast.')}</p><div class='known-replays'>${Object.entries(WEATHER).map(([w])=>`<button data-weather-replay='${w}' aria-pressed='${weather===w}' type='button'>${t({dry:'无雨',light:'晚到的小雨',heavy:'早到的暴雨'}[w],{dry:'Dry',light:'Late light rain',heavy:'Early heavy rain'}[w])}</button>`).join('')}</div></details>`;
 const review=$('inline-review');if(review)review.innerHTML=`<p>${t('多晒一会儿，还是先保护玉米？没有适用于所有天气的安排。信息、准备和合约各管一层，不能互相替代。','Keep drying, or protect the maize now? No plan fits every weather. Information, preparation and contracts serve different roles.')}</p><details class='decision-detail preparation-detail'><summary>${t('比较同一天气下的其他准备','Compare preparations under the same weather')}</summary><div class='decision-table-wrap'><table class='decision-table'><caption>${t('模拟净结果 · 合约只在暴雨时兑付','Simulated net outcomes · contract pays only on heavy rain')}</caption><thead><tr><th>${t('准备方式','Preparation')}</th><th>${t('晾晒收益','Drying benefit')}</th><th>${t('作物损失','Crop loss')}</th><th>${t('不买合约','No contract')}</th><th>${t('买入合约','With contract')}</th></tr></thead><tbody>${Object.entries(PREPARATIONS).map(([id,p])=>{const no=resolveDecision(id,weather,false),held=resolveDecision(id,weather,true);return `<tr ${id===preparation?"class='chosen'":''}><th scope='row'>${p.name[t('zh','en')==='en'?1:0]}${id===preparation?t(' · 你的准备',' · Your plan'):''}</th><td>${signed(no.drying)}</td><td>${signed(-no.physicalLoss)}</td><td>${signed(no.net)}</td><td>${signed(held.net)}</td></tr>`;}).join('')}</tbody></table></div></details>`;
 const key=`${epoch}:${preparation}:${weather}:${hedge}`;cancelAnimationFrame(amountFrame);if(resultKey!==key){resultKey=key;animateAmounts();}
}
async function loadScene(){
 const token=epoch;loading=true;sync();$('scene').setAttribute('aria-busy','true');
 try{const {createCourtyard}=await import('./decision-scene.js');if(token!==epoch)return;scene=createCourtyard($('scene'),{onObject:object,onBeat:motionCaption});
  // Restore the settled snapshot before unlocking controls, without replaying a debit.
  scene.setPaused(true);if(seen)scene.showSignal();if(preparation)scene.prepare(preparation);scene.purchase(hedge===true,false);if(stage==='result'){scene.reveal(weather);scene.settle(resolveDecision(preparation,weather,hedge).payout,false);}scene.setPaused(paused);scene.setVisible(visible);fallback=false;
 }catch(error){if(token!==epoch)return;fallback=true;showFallback();}
 loading=false;$('scene').setAttribute('aria-busy','false');sync();
}
function motionCaption({step,trip,preparation:plan}){
 if(stage!=='prepare'||!busy)return;
 const destination=plan==='shelter'?t('左侧雨棚','the left shelter'):t('储物箱','storage');
 const copy={pick:t('Thoko 弯下身，把一批玉米装进篮子。','Thoko bends down and loads a basket.'),carry:t(`抱起第 ${trip} 篮，绕过晾晒架，走向${destination}。`,`Carrying basket ${trip} around the rack toward ${destination}.`),place:t(`把这一篮放到${destination}，露天架上的玉米少了一批。`,`Placing this batch in ${destination}; fewer ears remain outside.`),return:t('带着空篮返回，再搬下一批。','Returning with the empty basket for the next batch.'),done:t('最后一篮已放好。','The last basket is in place.'),unfold:t('Thoko 拉开卷起的遮布，盖住架上的玉米。','Thoko pulls open the rolled tarp across the maize.')};
 $('decision-exposure').hidden=false;$('decision-exposure').textContent=copy[step]||'';
}
function showFallback(){loading=false;$('scene').setAttribute('aria-busy','false');scene?.dispose();scene=null;$('scene').querySelectorAll('canvas,.decision-fallback').forEach(el=>el.remove());const el=document.createElement('div');el.className='decision-fallback';el.innerHTML=`<img src="/thoko-family.png" alt="${t('情景模拟：Thoko 一家晒玉米','Simulation: Thoko’s family drying maize')}"><div>${buttons.map(([id,n])=>`<button data-fallback-object="${id}" type="button">${n[t('zh','en')==='en'?1:0]}</button>`).join('')}</div>`;$('scene').prepend(el);}
function restart(){++epoch;cancelAnimationFrame(amountFrame);resultKey='';receiptKey='';scene?.reset();stage='signal';preparation=null;storageOpen=false;hedge=null;seen=false;busy=false;replaying=false;weather=drawOutcome();if(loading&&!scene&&!fallback)loadScene();sync();focusStatus();}
root.querySelector('.diorama').classList.add('decision-diorama');
root.querySelector('.diorama').innerHTML=`<div class="decision-world"><p id="decision-clock"></p><div id="scene" role="group" aria-label="${t('交互式决策庭院','Interactive decision courtyard')}">${buttons.map(([id])=>`<button type="button" class="scene-object" data-scene-object="${id}" hidden></button>`).join('')}</div><p id="decision-scene-hint"></p><p id="decision-exposure" hidden></p><div id="decision-condition" hidden></div><section id="decision-receipt" aria-live="polite" aria-atomic="true" hidden></section><div id="decision-world-actions" hidden></div></div><aside id="decision-panel" class="game-overlay"></aside><section id="decision-results" hidden></section>`;
root.querySelector('.exercise-options').outerHTML=`<div class="decision-tools"><button id="decision-restart" type="button"></button><details class="decision-detail motion-options"><summary></summary><button id="decision-pause" type="button"></button><button id="decision-text" type="button"></button></details></div>`;
root.querySelector('#fallback-note')?.remove();
root.addEventListener('pointerover',event=>{const button=event.target.closest('[data-scene-object]');if(button)scene?.previewObject(button.dataset.sceneObject);});
root.addEventListener('focusin',event=>{const button=event.target.closest('[data-scene-object]');scene?.previewObject(button?.dataset.sceneObject||null);});
root.addEventListener('focusout',event=>{if(event.target.closest('[data-scene-object]'))scene?.previewObject(null);});
root.addEventListener('pointerout',event=>{if(event.target.closest('[data-scene-object]')&&!event.relatedTarget?.closest('[data-scene-object]'))scene?.previewObject(null);});
root.addEventListener('click',async event=>{
 const target=event.target.closest('button');if(!target)return;
 if(target.dataset.decision)act(target.dataset.decision);
 if(target.dataset.sceneObject)object(target.dataset.sceneObject);
 if(target.dataset.fallbackObject)object(target.dataset.fallbackObject);
 if(target.id==='decision-restart')restart();
 if(target.id==='decision-pause'){paused=!paused;scene?.setPaused(paused);sync();}
 if(target.id==='decision-text'){++epoch;if(!fallback){fallback=true;showFallback();if(busy){busy=false;if(stage==='weather')stage='result';}}else{scene?.dispose();scene=null;$('scene').querySelector('.decision-fallback')?.remove();await loadScene();}sync();}
 if(target.dataset.weatherReplay&&!busy&&!loading&&stage==='result'){
  const token=epoch;weather=target.dataset.weatherReplay;replaying=true;busy=true;stage='weather';sync();watchScene();await scene?.reveal(weather);if(token!==epoch)return;busy=false;stage='result';scene?.settle(resolveDecision(preparation,weather,hedge).payout);sync();focusStatus();
 }
});
root.addEventListener('toggle',event=>{if(event.target.matches('.result-detail')&&event.target.open)animateAmounts();},true);
window.addEventListener('wb-language',()=>{if(fallback)showFallback();sync();});
reduced.addEventListener('change',()=>{cancelAnimationFrame(amountFrame);sync();});
compact.addEventListener('change',sync);
$('scene').addEventListener('scene-lost',()=>{fallback=true;++epoch;showFallback();if(busy){busy=false;if(stage==='weather')stage='result';}sync();});
let visible=true;const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;scene?.setVisible(visible);});visibility.observe(root.querySelector('.diorama'));
window.addEventListener('pagehide',event=>{if(!event.persisted){++epoch;cancelAnimationFrame(amountFrame);visibility.disconnect();scene?.dispose();}});
sync();loadScene();
