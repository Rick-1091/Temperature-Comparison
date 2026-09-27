import './decision-network.css';

const root = document.getElementById('decision-network');
const text = (zh, en) => ({ zh, en });
// A qualitative scenario comparison, not a model of measured forecast performance.
const nodes = [
  { id: 'available', level: 0, row: 0, label: text('有可靠天气预报', 'Reliable forecast available'), brief: text('正式信息能及时获得', 'Timely conventional information'),
    detail: text('能够获得当地的官方或常规预报时，先查看这些正式信息。市场判断可以补充阅读，但不是必需步骤。', 'When reliable local official or conventional forecasts are accessible, start with them. Market expectations may be supplementary, but are not a required step.'),
    example: text('迭戈查看当地预报，再安排帕蒂奥咖啡馆的室内外座位。', 'Diego reads the local forecast before arranging indoor and outdoor seating at Café Patio.') },
  { id: 'limited', level: 0, row: 1, label: text('天气消息不足', 'Forecast unavailable or limited'), brief: text('缺少、过时或差异很大', 'Missing, stale, or conflicting'),
    detail: text('偏远地区、更新中断、局部微气候或预报差异，都可能让已有消息难以用于眼前的决定。网络完全中断时，线上市场也无法访问。', 'Remote locations, interrupted updates, local microclimates, or conflicting forecasts can make information difficult to use. A complete internet outage also prevents access to online markets.'),
    example: text('托科听到了广播预报，但仍拿不准自家村庄何时会下雨。温度市场不能替她回答当地降雨问题。', 'Thoko hears a radio forecast but remains unsure when rain will reach her village. A temperature market cannot answer her local rainfall question.') },
  { id: 'official', level: 1, row: 0, label: text('使用官方预报', 'Use official forecasts'), brief: text('温度、降雨、风与预警', 'Temperature, rain, wind, warnings'),
    detail: text('把温度、降雨概率、风和预警放在一起看，并随更新调整安排。遇到危险天气，优先遵循气象与应急机构的指引。', 'Read temperature, rainfall probability, wind, and warnings together, and revise plans as updates arrive. For dangerous weather, prioritize meteorological and emergency guidance.'),
    example: text('锦溪游船经营者根据风雨预警调整出船时间；食品加工者据当地降雨消息安排晾晒与储存。', 'A Jinxi boat operator adjusts departures around wind and rain warnings; a food producer plans drying and storage using local rainfall information.') },
  { id: 'none', level: 1, row: 1, label: text('没有额外消息', 'No extra signal'), brief: text('靠经验，或暂缓决定', 'Rely on experience or wait'),
    detail: text('没有可用的新消息时，人们仍要作决定：按经验继续、暂缓安排，或为多种天气准备。经验有价值，但无法消除不确定性。', 'Without usable new information, people still need to decide: continue based on experience, delay plans, or prepare for several conditions. Experience is useful but cannot remove uncertainty.'),
    example: text('托科看着天色考虑是否收粮；迭戈先少备一批冷饮，等早上的消息再补货。', 'Thoko watches the sky while deciding whether to bring grain inside; Diego stocks fewer cold drinks and waits for morning information before replenishing supplies.') },
  { id: 'market', level: 1, row: 2, label: text('Polymarket 集体判断', 'Polymarket collective expectation'), brief: text('多一个公开参考信号', 'An additional public signal'),
    detail: text('仍能联网、且有对应地点与日期的市场时，可以看哪个温度区间价格最高、价格分布有多集中，以及历史判断与实测差多少。这是参与者基于不同信息形成的集体判断，不是保证准确的预报。', 'With internet access and a market for the relevant location and date, read the highest-priced temperature range, the spread of prices, and past comparisons with observations. These are collective expectations informed by different participants, not a guaranteed forecast.'),
    example: text('迭戈可查看覆盖墨西哥城和目标日期的温度市场，辅助冷热饮备货。本站真实数据案例来自纽约，不是帕蒂奥咖啡馆的预报。', 'Diego could consult a temperature market covering Mexico City and her target date to inform drink supplies. This site’s actual-data example is from New York, not a forecast for Café Patio.') },
  { id: 'plan', level: 2, row: 0, label: text('提前安排生活与生产', 'Plan activities ahead'), brief: text('出行、晾晒、储存与备货', 'Travel, drying, storage, supplies'),
    detail: text('正式信息帮助人们提前安排生产、调整游览、准备储存空间，减少不必要的天气暴露。预报本身仍可能有误差。', 'Conventional information can support production schedules, tourism adjustments, storage preparation, and less unnecessary weather exposure. Forecast errors remain possible.'),
    example: text('迭戈提前留出室内座位；锦溪商户调整户外准备，给出行与晾晒留出余地。', 'Diego reserves indoor seats in advance; a Jinxi business adjusts outdoor preparation and keeps travel and drying plans flexible.') },
  { id: 'disruption', level: 2, row: 1, label: text('安排可能被打乱', 'Possible disruption'), brief: text('天气暴露与潜在损失', 'Weather exposure and potential loss'),
    detail: text('缺少信息可能增加安排失误的风险：粮食晾晒遇雨、游客减少却未调整备货，或生产时间与天气不合。这些是可能情景，不是已测得的经营损失。', 'Limited information may increase the risk of poorly timed decisions: rain during drying, supplies prepared for visitors who do not arrive, or production scheduled for unsuitable weather. These are possible scenarios, not measured business losses.'),
    example: text('托科若来不及收粮，可能要重新晾晒；帕蒂奥若备货过多，可能留下用不完的原料。这里不估算损失金额。', 'If Thoko cannot bring grain in on time, she may need to dry it again; Café Patio could be left with unused supplies. No loss amount is estimated here.') },
  { id: 'adjust', level: 2, row: 2, label: text('带着不确定性调整安排', 'Adjust plans with uncertainty'), brief: text('大致判断，不是确定答案', 'Approximate judgment, not certainty'),
    detail: text('价格分布能显示参与者更倾向哪种温度结果、判断有多分散。它可能增加一个可观察参考，但不会自动填补信息缺口，也不能替代预警。判断分散时，分批准备、保留调整空间。', 'Price distributions show which temperature outcomes participants favor and how spread out expectations are. They may add an observable reference, but do not automatically close information gaps or replace warnings. When expectations are divided, prepare in stages and keep plans flexible.'),
    example: text('锦溪小商户可在有适用信息时重新安排户外准备、食品晾晒或旅游活动；迭戈可以分批补货。降雨安排仍需要当地降雨信息。', 'Where relevant information exists, a Jinxi business could reconsider outdoor preparation, food drying, or tourism plans; Diego could replenish supplies in stages. Rain-sensitive decisions still require local rainfall information.') },
];
const places = {
  jinxi: {name:text('中国 · 锦溪','China · Jinxi'), person:text('锦溪商户','A Jinxi business'),
    actions:text('游船出行、食品晾晒与储存','Boat trips, food drying and storage'),
    official:text('查看本地风雨预警，决定是否出船，提前为晾晒食品留出遮盖与搬运空间。','Read local wind and rain warnings, decide whether to launch boats, and prepare covers and space for drying food.'),
    none:text('靠天色安排出船和晾晒；突然下雨时，可能来不及收回食品或取消行程。','Plan boats and drying from the sky alone; sudden rain may leave too little time to move food or cancel trips.'),
    market:text('本项目尚未接入锦溪本地天气市场。只有出现同地点、同日期、同天气变量的市场，且仍可联网时，集体判断才可补充参考。其他城市的温度市场不能用于判断锦溪的降雨。','This project has no connected Jinxi market. A market can supplement information only with matching place, date and weather variable, and internet access. Another city’s temperature market cannot indicate Jinxi rainfall.'),
    adjust:text('判断分散时，分批晾晒、保留改期空间；安全出船仍以本地预警为准。','Dry food in batches and keep trips flexible when expectations differ; follow local warnings for boat safety.'),
    impacts:[text('减少食品受潮与返工','Less wet food and rework'),text('原料浪费与收入减少','Wasted materials and lower income'),text('周转资金可能收紧','Possible cash-flow pressure'),text('保留改期与补货余地','Keep rescheduling and restocking options')],
    costs:text('食品受潮需要返工，游船取消可能减少收入；若损失持续，后续采购、维护和人员安排的资金可能更紧。','Wet food may require rework and cancelled trips may reduce income. Persistent losses could constrain purchasing, maintenance and staffing.')},
  malawi: {name:text('非洲 · 马拉维伦菲','Africa · Rumphi, Malawi'), person:text('托科一家','Thoko’s family'),
    actions:text('玉米晾晒、收粮与下季播种','Maize drying, storage and next-season planting'),
    official:text('根据当地降雨时间和湿度安排晾晒，先准备袋子、遮盖和室内储存空间。','Use local rain timing and humidity to plan drying, prepare sacks and covers, and clear indoor storage.'),
    none:text('广播消息太笼统，托科只能看天色决定是否收粮；雨来得早，粮食可能受潮。','Broad radio updates leave Thoko judging the sky; early rain could wet the grain.'),
    market:text('本项目没有伦菲当地的降雨市场数据。若未来有适用市场，且家里能联网，可把集体判断作为补充；纽约温度不能回答托科的收粮问题。','This project has no local Rumphi rainfall market data. If a relevant market and internet access become available, collective expectations could supplement information. New York temperatures cannot answer Thoko’s drying decision.'),
    adjust:text('结合当地降雨信息分批晾晒，提前备好搬运和遮盖；温度判断本身不足以决定是否收粮。','Use local rain information to dry in batches and prepare transport and covers; temperature expectations alone cannot decide when to bring grain inside.'),
    impacts:[text('保护存粮与销售收入','Protect stored food and sale income'),text('受潮、返工或售价降低','Wet grain, rework or lower prices'),text('下季种子与投入可能不足','Possible shortage of next-season seed and inputs'),text('分批晾晒，保留应变时间','Dry in batches and leave time to respond')],
    costs:text('若粮食受损、出售收入减少，家庭可能动用原本留给下季种子、肥料或运输的钱；投入不足又可能影响下一季生产。这是一条条件性的风险链，并非托科家的实际记录。','If damaged grain reduces sale income, the family might use money reserved for seeds, fertilizer or transport. Reduced inputs could affect the next growing season. This is a conditional risk chain, not an observed record of Thoko’s household.')},
  mexico: {name:text('墨西哥 · 墨西哥城','Mexico · Mexico City'), person:text('迭戈 · 帕蒂奥咖啡馆','Diego · Café Patio'),
    actions:text('室内外座位、排班与冷热饮备货','Indoor/outdoor seating, shifts and drink supplies'),
    official:text('迭戈查看本地温度与降雨预报，提前安排室内座位、遮阳和员工班次。','Diego reads local temperature and rainfall forecasts to plan indoor seats, shade and shifts.'),
    none:text('迭戈按平日客流备货；若天气突然转冷或下雨，户外座位可能空着，冷饮原料也可能剩下。','Diego stocks for usual foot traffic; unexpected cold or rain could leave outdoor seats empty and drink ingredients unused.'),
    market:text('若能读取墨西哥城目标日期的温度市场，迭戈可看最高报价区间和价格分布，辅助冷热饮安排。降雨和安全信息仍需本地预报；本网站实测对照仍是纽约样本。','If a Mexico City temperature market for the target date can be accessed, Diego could read leading intervals and price distributions to plan drinks. Rain and safety information still need local forecasts; this site’s observed-data comparison remains a New York sample.'),
    adjust:text('判断分散时，迭戈分批采购冷饮原料，暂不摆满户外桌椅，随当地预报更新排班。','When expectations differ, Diego buys ingredients in batches, keeps some outdoor tables unprepared, and revises shifts with local forecast updates.'),
    impacts:[text('减少闲置座位与备货浪费','Less idle seating and wasted stock'),text('客流减少、原料积压','Lower foot traffic and surplus ingredients'),text('租金与下周采购承压','Pressure on rent and next-week purchasing'),text('灵活补货与调整班次','Flexible replenishment and shifts')],
    costs:text('如果客流减少且易腐原料积压，收入可能下降、成本却已支出；持续几天后，租金、工资和下一批采购可能挤占有限现金。活动图表不直接计算营业损失。','Lower foot traffic and surplus perishables could reduce revenue after costs are already incurred. Persistent disruption could tighten cash available for rent, wages and restocking. Activity charts do not calculate business losses.')}
};
nodes.forEach(node=>node.level+=1);
nodes.unshift({id:'source',level:0,row:1,label:text('今天要做的安排','Today’s decisions'),brief:text('从一个地点出发','Start with one place'),detail:text('先选择地点，再沿信息、行动与影响逐层阅读。','Choose a place, then follow information, actions and consequences.'),example:text('','')});
['protect','loss','next-season','flexible'].forEach((id,row)=>nodes.push({id,level:4,row,label:text('',''),brief:text('可能的后续影响','Possible downstream effect'),detail:text('',''),example:text('','')}));
const edges = [['source','available'],['source','limited'],['available','official'],['official','plan'],['limited','none'],['none','disruption'],['limited','market'],['market','adjust'],['plan','protect'],['disruption','loss'],['disruption','next-season'],['adjust','flexible'],['adjust','protect']];

if (root) {
  let selected = null;
  let place = 'jinxi';
  const lang = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  const t = value => value[lang()];
  function applyPlace() {
    const context=places[place];
    const examples={source:context.actions,available:context.official,limited:context.none,official:context.official,none:context.none,market:context.market,plan:context.official,disruption:context.costs,adjust:context.adjust,protect:context.official,loss:context.costs,'next-season':context.costs,flexible:context.adjust};
    nodes.forEach(node=>node.example=examples[node.id]);
    nodes.find(n=>n.id==='source').label=context.person;
    nodes.find(n=>n.id==='source').brief=context.actions;
    nodes.find(n=>n.id==='plan').brief=context.actions;
    nodes.find(n=>n.id==='plan').detail=context.official;
    nodes.find(n=>n.id==='adjust').detail=context.adjust;
    nodes.find(n=>n.id==='disruption').detail=context.costs;
    nodes.find(n=>n.id==='market').detail=context.market;
    ['protect','loss','next-season','flexible'].forEach((id,index)=>{const node=nodes.find(n=>n.id===id);node.label=context.impacts[index];node.detail=index===1||index===2?context.costs:context.adjust;});
  }
  const family = id => {
    const found = new Set([id]);
    // Downstream first; then ancestors only, without pulling sibling branches in.
    const down = key => edges.filter(([a])=>a===key).forEach(([,b])=>{found.add(b);down(b);});
    const up = key => edges.filter(([,b])=>b===key).forEach(([a])=>{found.add(a);up(a);});
    down(id); up(id); return found;
  };
  function drawEdges() {
    const graph = root.querySelector('.decision-graph');
    const svg = graph.querySelector('svg');
    const rect = graph.getBoundingClientRect();
    const vertical = matchMedia('(max-width: 700px)').matches;
    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    const active = selected ? family(selected) : new Set(nodes.map(n=>n.id));
    svg.replaceChildren();
    for (const [a,b] of edges) {
      const from = root.querySelector(`[data-node="${a}"]`).getBoundingClientRect();
      const to = root.querySelector(`[data-node="${b}"]`).getBoundingClientRect();
      const x1 = (vertical ? from.left+from.width/2 : from.right)-rect.left;
      const y1 = (vertical ? from.bottom : from.top+from.height/2)-rect.top;
      const x2 = (vertical ? to.left+to.width/2 : to.left)-rect.left;
      const y2 = (vertical ? to.top : to.top+to.height/2)-rect.top;
      const mid = vertical ? (y1+y2)/2 : (x1+x2)/2;
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',vertical ? `M${x1},${y1} C${x1},${mid} ${x2},${mid} ${x2},${y2}` : `M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`);
      path.setAttribute('class',active.has(a)&&active.has(b) ? 'decision-edge active' : 'decision-edge dim');
      svg.append(path);
    }
  }
  function update() {
    const active = selected ? family(selected) : new Set(nodes.map(n=>n.id));
    root.querySelectorAll('[data-node]').forEach(button=>{
      button.classList.toggle('dim',!active.has(button.dataset.node));
      button.classList.toggle('selected',button.dataset.node===selected);
      button.setAttribute('aria-pressed',String(button.dataset.node===selected));
    });
    const node = nodes.find(n=>n.id===selected);
    const panel = root.querySelector('.decision-detail');
    panel.replaceChildren();
    const add = (tag, value, className) => {
      const el=document.createElement(tag);let start=0;
      for(const match of value.matchAll(/非洲|马拉维|伦菲|锦溪|墨西哥城|迭戈|托科|帕蒂奥咖啡馆|帕蒂奥|Africa|Malawi|Rumphi|Jinxi|Mexico City|Diego|Thoko|Café Patio/g)){
        el.append(document.createTextNode(value.slice(start,match.index)));const strong=document.createElement('strong');strong.textContent=match[0];strong.className='case-name';el.append(strong);start=match.index+match[0].length;
      }
      el.append(document.createTextNode(value.slice(start)));if(className)el.className=className;panel.append(el);return el;
    };
    add('h3',node ? t(node.label) : t(text('先选一条信息路径','Choose an information path')));
    add('p',node ? t(node.detail) : t(text('从左侧人物出发：一、天气消息；二、信息来源；三、眼前安排；四、后续影响。选择节点后，只高亮与它相连的路径。','Start with the person on the left: 1. weather information; 2. information sources; 3. immediate plans; 4. downstream effects. Select a node to highlight its connected paths.')));
    if(node&&t(node.example)!==t(node.detail)){add('h4',t(places[place].name));add('p',t(node.example));}
    if(selected&&active.has('market')){const link=add('a',t(text('查看真实市场案例 →','View the actual market example →')));link.href='../signals/index.html#professional';}
    drawEdges();
  }
  function render() {
    applyPlace();
    const focused = root.querySelector('[data-node]:focus')?.dataset.node;
    root.replaceChildren();
    const toolbar=document.createElement('div');toolbar.className='decision-toolbar';
    const picker=document.createElement('label');picker.className='decision-place';picker.textContent=t(text('选择地点与人物','Choose a place and person'));
    const select=document.createElement('select');select.id='decision-place';Object.entries(places).forEach(([key,value])=>{const option=document.createElement('option');option.value=key;option.textContent=t(value.name);option.selected=key===place;select.append(option);});select.addEventListener('change',()=>{place=select.value;selected=null;render();});picker.append(select);toolbar.append(picker);
    const reset=document.createElement('button');reset.type='button';reset.className='btn-reset';reset.textContent=t(text('显示全部路径','Show all paths'));reset.addEventListener('click',()=>{selected=null;update();});toolbar.append(reset);root.append(toolbar);
    const layout=document.createElement('div');layout.className='decision-layout';root.append(layout);
    const graph=document.createElement('div');graph.className='decision-graph';layout.append(graph);
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('aria-hidden','true');graph.append(svg);
    const headings=[text('源头 · 今日安排','Source · Today’s plans'),text('一、天气消息','1. Weather information'),text('二、信息来源','2. Sources'),text('三、眼前安排','3. Immediate plans'),text('四、后续影响','4. Downstream effects')];
    headings.forEach((heading,level)=>{
      const column=document.createElement('section');column.className=`decision-column level-${level}`;graph.append(column);
      const title=document.createElement('h3');title.textContent=t(heading);column.append(title);
      const list=document.createElement('div');list.className='decision-nodes';column.append(list);
      nodes.filter(n=>n.level===level).forEach(node=>{
        const button=document.createElement('button');button.type='button';button.dataset.node=node.id;button.className='decision-node';button.style.setProperty('--node-row',node.row+1);
        const dot=document.createElement('span');dot.className='decision-dot';dot.setAttribute('aria-hidden','true');button.append(dot);
        const copy=document.createElement('span');copy.className='decision-copy';const label=document.createElement('strong');label.textContent=t(node.label);const brief=document.createElement('small');brief.textContent=t(node.brief);copy.append(label,brief);button.append(copy);
        button.addEventListener('click',()=>{selected=node.id;update();});list.append(button);
      });
    });
    const panel=document.createElement('aside');panel.className='decision-detail';panel.setAttribute('aria-live','polite');panel.setAttribute('aria-atomic','true');layout.append(panel);
    const foot=document.createElement('p');foot.className='decision-footnote';foot.textContent=t(text('情景路径展示可能影响，不是实测损失或确定因果。市场信号需要联网，并匹配地点、日期与天气变量；它只作补充，不替代官方预报和预警。锦溪与伦菲尚未接入适用市场。','Scenario paths illustrate possible consequences, not measured losses or established causality. Markets require internet access and matching place, date and weather variable. They supplement forecasts and warnings. No relevant Jinxi or Rumphi markets are connected.'));root.append(foot);
    update();if(focused)root.querySelector(`[data-node="${focused}"]`)?.focus();
  }
  render();
  new ResizeObserver(()=>drawEdges()).observe(root);
  window.addEventListener('site-language-change',render);
}
