import './decision-network.css';

const root = document.getElementById('hedging-network');
const copy = (zh, en) => ({zh, en});
// Qualitative scenario paths; no trading actions or inferred loss amounts.
const nodes = [
  ['shop',0,1,copy('Jason Jiang · 28wishes','Jason Jiang · 28wishes'),copy('洛杉矶冰淇淋店','Los Angeles ice-cream shop'),copy('报道中的店主希望把冷天的经营风险与冷天合约联系起来。下方比较为机制示意，不是店铺的实测收支。','The reported owner seeks to connect cold-weather business risk with cold-weather contracts. This comparison illustrates the mechanism, not observed shop accounts.')],
  ['cold',1,0,copy('天气偏冷','Colder weather'),copy('冰淇淋需求可能下降','Demand may fall'),copy('偏冷天气可能减少冰淇淋需求，但客流也受节假日、地点等因素影响，天气与销售并非一一对应。','Colder weather may reduce ice-cream demand, but holidays, location and other factors also affect traffic. Weather and sales do not map one-to-one.')],
  ['warm',1,2,copy('天气偏暖','Warmer weather'),copy('需求可能较稳定','Demand may be steadier'),copy('天气偏暖时需求可能较好，但不能保证客流或营业收入。','Warmer weather may support demand, but does not guarantee foot traffic or revenue.')],
  ['slow',2,0,copy('客流减少','Lower foot traffic'),copy('收入可能下降','Revenue may fall'),copy('销售收入减少，但租金、部分工资和已采购原料的成本不会同步消失。持续低客流可能压缩可用现金。','Lower sales do not eliminate rent, some wages or the cost of purchased supplies. Persistent low traffic can reduce available cash.')],
  ['steady',2,2,copy('经营较平稳','Steadier business'),copy('仍有日常经营成本','Regular costs remain'),copy('即使生意较平稳，也需要支付日常经营成本；天气合约的购买成本应另行计入。','Even with steadier business, regular operating costs remain. Contract purchase costs must be counted separately.')],
  ['cold-none',3,0,copy('不购买合约','No contract'),copy('冷天 · 自行承担风险','Cold path · retain the risk'),copy('不购买合约就没有合约成本，也没有冷天兑付。经营损失需要由店铺储备或其他安排承担。','No contract means no contract cost and no cold-weather payout. Reserves or other arrangements must absorb business losses.')],
  ['cold-hedge',3,1,copy('持有冷天合约','Hold a cold-weather contract'),copy('冷天 · 核对是否满足规则','Cold path · check settlement rules'),copy('只有实际结果满足合约指定的温度、日期、站点等条件，合约才按规则兑付。净合约收益需要扣除购买成本与费用，可能只抵消部分损失。','A payout requires the outcome to meet the contract’s temperature, date, station and other conditions. Net contract proceeds must subtract purchase costs and fees and may offset only part of the business loss.')],
  ['warm-none',3,2,copy('不购买合约','No contract'),copy('暖天 · 没有额外购买成本','Warm path · no purchase cost'),copy('店铺按正常方式经营，不支付合约购买成本，也没有合约兑付。收入仍取决于实际销售。','The shop operates without contract purchase costs or payouts. Revenue still depends on actual sales.')],
  ['warm-hedge',3,3,copy('持有冷天合约','Hold a cold-weather contract'),copy('暖天 · 可能不兑付','Warm path · may not pay out'),copy('若冷天条件未发生，合约可能结算为零，购买成本与费用成为额外支出。生意较好并不意味着对冲交易盈利。','If the cold condition does not occur, the contract may settle at zero, adding purchase costs and fees. Stronger business does not mean the hedge itself is profitable.')],
  ['pressure',4,0,copy('周转资金承压','Cash-flow pressure'),copy('租金、工资与补货可能受限','Rent, wages and restocking'),copy('若损失持续且储备不足，店主可能缩减下一批采购、推迟设备维护，或更难支付租金与工资。这是条件性影响，不是报道确认的后果。','If losses persist and reserves are insufficient, the owner may cut restocking, postpone maintenance or struggle with rent and wages. These are conditional consequences, not outcomes confirmed by the report.')],
  ['offset',4,1,copy('可能抵消部分损失','Possible partial offset'),copy('兑付不是经营收入','Payout is not sales revenue'),copy('实际总结果取决于经营收入、经营成本、合约兑付、购买成本与费用。兑付金额未必覆盖经营损失，对冲也不能让客人回来。','The total result depends on business revenue and costs, contract payouts, purchase costs and fees. Payouts may not cover the loss and cannot bring customers back.')],
  ['reserve',4,2,copy('保留日常经营余地','Keep operating flexibility'),copy('备货仍需随客流调整','Adjust stock with traffic'),copy('经营较平稳时，可以保留正常补货与排班空间，但仍要根据实际销售调整，不预设收益。','Steadier business may leave room for normal restocking and staffing, but decisions should follow actual sales rather than assumed gains.')],
  ['cost',4,3,copy('额外成本或对冲失效','Extra cost or ineffective hedge'),copy('条件不符、金额不足或不兑付','Mismatch, insufficient size or no payout'),copy('店铺觉得冷，不代表合约指定天气站满足冷天阈值；规模不足、费用、流动性或天气与销售关系不稳定，都可能让对冲无法充分覆盖风险。','A cold-feeling shop does not imply the specified station meets the contract threshold. Insufficient size, fees, liquidity and an unstable weather-sales relationship can all limit the hedge.')],
].map(([id,level,row,label,brief,detail])=>({id,level,row,label,brief,detail}));
const edges=[['shop','cold'],['shop','warm'],['cold','slow'],['warm','steady'],['slow','cold-none'],['slow','cold-hedge'],['steady','warm-none'],['steady','warm-hedge'],['cold-none','pressure'],['cold-hedge','offset'],['cold-hedge','cost'],['warm-none','reserve'],['warm-hedge','cost']];

if(root){
  let selected=null;
  const t=value=>value[document.documentElement.lang.startsWith('zh')?'zh':'en'];
  function connected(id){
    const found=new Set([id]);
    function walk(key,direction){edges.filter(e=>e[direction]===key).forEach(e=>{const next=e[1-direction];found.add(next);walk(next,direction);});}
    walk(id,0);walk(id,1);return found;
  }
  function draw(){
    const graph=root.querySelector('.decision-graph'),svg=graph.querySelector('svg'),rect=graph.getBoundingClientRect();
    const vertical=matchMedia('(max-width:700px)').matches;
    const active=selected?connected(selected):new Set(nodes.map(n=>n.id));
    svg.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);svg.replaceChildren();
    edges.forEach(([a,b])=>{
      const from=root.querySelector(`[data-node="${a}"]`).getBoundingClientRect(),to=root.querySelector(`[data-node="${b}"]`).getBoundingClientRect();
      const x1=(vertical?from.left+from.width/2:from.right)-rect.left,y1=(vertical?from.bottom:from.top+from.height/2)-rect.top;
      const x2=(vertical?to.left+to.width/2:to.left)-rect.left,y2=(vertical?to.top:to.top+to.height/2)-rect.top;
      const mid=vertical?(y1+y2)/2:(x1+x2)/2,path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',vertical?`M${x1},${y1} C${x1},${mid} ${x2},${mid} ${x2},${y2}`:`M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`);
      path.setAttribute('class',`decision-edge ${active.has(a)&&active.has(b)?'active':'dim'}`);svg.append(path);
    });
  }
  function update(){
    const active=selected?connected(selected):new Set(nodes.map(n=>n.id));
    root.querySelectorAll('[data-node]').forEach(button=>{button.classList.toggle('dim',!active.has(button.dataset.node));button.classList.toggle('selected',selected===button.dataset.node);button.setAttribute('aria-pressed',String(selected===button.dataset.node));});
    const node=nodes.find(n=>n.id===selected),panel=root.querySelector('.decision-detail');panel.replaceChildren();
    const title=document.createElement('h3');title.textContent=node?t(node.label):t(copy('选择节点，比较风险路径','Select a node to compare risk paths'));
    const detail=document.createElement('p');detail.textContent=node?t(node.detail):t(copy('先看天气怎样影响生意，再比较是否购买冷天合约，最后看兑付、成本与现金周转。','Follow weather into business conditions, compare contract choices, then examine payouts, costs and cash flow.'));
    panel.append(title,detail);draw();
  }
  function render(){
    const focused=root.querySelector('[data-node]:focus')?.dataset.node;root.replaceChildren();
    const toolbar=document.createElement('div');toolbar.className='decision-toolbar';
    const name=document.createElement('strong');name.textContent=t(copy('洛杉矶 · Jason Jiang 的 28wishes','Los Angeles · Jason Jiang’s 28wishes'));
    const reset=document.createElement('button');reset.type='button';reset.className='btn-reset';reset.textContent=t(copy('显示全部路径','Show all paths'));reset.addEventListener('click',()=>{selected=null;update();});toolbar.append(name,reset);root.append(toolbar);
    const layout=document.createElement('div');layout.className='decision-layout';const graph=document.createElement('div');graph.className='decision-graph';
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('aria-hidden','true');graph.append(svg);layout.append(graph);root.append(layout);
    [copy('源头 · 店铺','Source · Shop'),copy('一、天气变化','1. Weather'),copy('二、经营变化','2. Business'),copy('三、风险安排','3. Risk choices'),copy('四、后续影响','4. Consequences')].forEach((heading,level)=>{
      const column=document.createElement('section');column.className=`decision-column level-${level}`;
      const title=document.createElement('h3');title.textContent=t(heading);const list=document.createElement('div');list.className='decision-nodes';column.append(title,list);graph.append(column);
      nodes.filter(n=>n.level===level).forEach(node=>{const button=document.createElement('button');button.type='button';button.className='decision-node';button.dataset.node=node.id;button.style.setProperty('--node-row',node.row+1);
        const dot=document.createElement('span');dot.className='decision-dot';dot.setAttribute('aria-hidden','true');const text=document.createElement('span');text.className='decision-copy';const label=document.createElement('strong');label.textContent=t(node.label);const brief=document.createElement('small');brief.textContent=t(node.brief);text.append(label,brief);button.append(dot,text);button.addEventListener('click',()=>{selected=node.id;update();});list.append(button);});
    });
    const panel=document.createElement('aside');panel.className='decision-detail';panel.setAttribute('aria-live','polite');layout.append(panel);
    const note=document.createElement('p');note.className='decision-footnote';note.textContent=t(copy('机制示意，不是投资建议或实测收益。','Mechanism illustration, not investment advice or observed returns.'));root.append(note);
    update();if(focused)root.querySelector(`[data-node="${focused}"]`)?.focus();
  }
  render();new ResizeObserver(draw).observe(root);window.addEventListener('site-language-change',render);
}
