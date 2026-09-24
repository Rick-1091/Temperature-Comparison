const STORAGE_KEY = 'temperature-language';

const zh = new Map(Object.entries({
  'Origin': '缘起',
  'Jinxi': '锦溪',
  'Signals vs outcomes': '预测与结果',
  'New York': '纽约',
  'Mexico City': '墨西哥城',
  'Website chapters': '网站章节',
  'Project origin · Jinxi Ancient Town': '项目缘起 · 锦溪古镇',
  'Jinxi raised the question.': '问题从锦溪开始。',
  'Jinxi raised': '问题从锦溪', 'the question.': '开始。',
  'In Jinxi, weather is not simply scenery. It can shape how people move, work, produce, welcome visitors, and make plans.': '在锦溪，天气不只是风景，也会影响人们如何出行、工作、生产、接待游客与安排日常。',
  '01 Where the question came from': '01 问题从哪里来',
  '02 How signals compare with outcomes': '02 预测如何与结果对照',
  '03 What signals could mean for a day': '03 预测对一天意味着什么',
  'Start here': '从这里开始',
  'A water town makes the relationship among climate, mobility, work, and infrastructure visible.': '水乡让气候、出行、工作与基础设施之间的关系变得可见。',
  'This page is an origin story, not a local needs assessment.': '这一页讲述项目缘起，并不是一份本地需求评估。',
  'The field visit generated questions that the later chapters investigate with data.': '实地走访提出问题，后续章节再用数据展开。',
  'Field origin': '实地缘起',
  'One visit made weather uncertainty tangible.': '一次走访，让天气的不确定性变得具体。',
  'Across the team’s field notes, Jinxi brought tourism services, food display and storage, waterside movement, heritage spaces, and material production into close view. These activities may respond to heat, rain, wind, humidity, water conditions, and seasonal change in different ways.': '团队的田野记录涉及旅游服务、食品陈列与储存、临水通行、遗产空间和材料生产。这些活动可能以不同方式受到高温、降雨、风、湿度、水情与季节变化影响。',
  'Field observation': '实地观察',
  'Evidence boundary': '证据边界',
  'The team observed products, tourism settings, and museum displays during one visit. These records do not prove current financial losses, a weather-information gap, Polymarket use, a causal weather relationship, or community demand for a tool.': '团队在一次走访中记录了产品、旅游场景与博物馆展陈。这些记录不能证明现实经济损失、天气信息缺口、Polymarket 使用、天气因果关系，或当地对某种工具的需求。',
  'Service & tourism · Xinyuan': '服务与旅游 · 欣媛',
  'Service & tourism': '服务与旅游',
  'Covered tour boats make outdoor visitor movement and water conditions visible as questions for later validation.': '带篷游船提示我们，游客户外流动与水情值得在后续研究中验证。',
  'Food display · Yizhou': '食品陈列 · 一舟',
  'Smoked beans invite questions about drying, storage, transport, and sale conditions; the visit does not establish which stages are weather-sensitive.': '熏青豆引出晾晒、储存、运输和销售条件等问题；走访本身不能确定哪些环节对天气敏感。',
  'Traditional production · Shudan': '传统生产 · 曙丹',
  'Traditional production': '传统生产',
  'The brick-making display links materials, labour, timing, and controlled conditions without documenting an active current industry.': '砖瓦制作展陈呈现了材料、劳动、时机与环境控制之间的联系，但不代表当地仍有活跃产业。',
  'Select a context to see how weather can affect it': '选择一个场景，查看天气可能如何影响它',
  'Tourism & service': '旅游与服务',
  'Visitor movement, boat operations, street-facing commerce': '游客流动、船只运行与沿街商业',
  'Water-town systems': '水乡系统',
  'Waterways, access, infrastructure, and environment': '水道、通行、基础设施与环境',
  'Production': '生产',
  'Materials, skilled labour, timing, and controlled conditions': '材料、技能劳动、时机与环境控制',
  'Agriculture & fishery': '农业与渔业',
  'Growing conditions, water, harvest, and supply': '生长条件、水情、收获与供应',
  'Design handoff': '研究衔接',
  'From one field visit to a broader public-information problem.': '从一次走访，走向更广泛的公共信息问题。',
  'Jinxi did not give us a Polymarket dataset or demonstrate a local use of prediction markets. It prompted a broader question: how do different public systems represent weather uncertainty, and how can users compare their signals without treating any one of them as fact?': '锦溪没有直接提供 Polymarket 数据，也没有证明当地使用预测市场。它促使我们追问：不同公共系统如何表达天气的不确定性？人们又如何比较这些信号，而不把任何一种信号当成事实？',
  'What we saw': '我们看到的', 'Place-based activity': '发生在具体地点的活动',
  'What we asked': '我们追问的', 'Weather uncertainty': '天气的不确定性',
  'What we study next': '接下来研究的', 'Public prediction signals': '公共预测信号',
  'From field observation to a research question': '从田野观察到研究问题',
  'Outdoor access, food display and storage, water-town movement, material processes': '户外通行、食品陈列与储存、水乡流动、材料工艺',
  'How is it forecast, communicated, compared, and acted on in public information systems?': '公共信息系统如何预测、传达、比较天气，并据此行动？',
  'Official forecasts, Polymarket probabilities, observed outcomes, and AI-enabled forecasting': '官方预报、Polymarket 概率、实测结果与 AI 辅助预测',
  'Evidence cluster': '证据类别', 'Direct observation': '直接观察', 'Question it raised': '由此提出的问题', 'Unknown': '未知', 'What it cannot establish': '无法据此确认',
  'Covered tour boats and a canal-side coffee shop connected to outdoor visitor spaces': '带篷游船与临水咖啡店连接着户外游客空间',
  'How might weather uncertainty shape visitor movement, outdoor access, and service-related choices?': '天气的不确定性可能如何影响游客流动、户外通行与服务选择？',
  'Passenger counts, revenue, operating schedules, workers’ information needs, or a weather effect on demand': '客流、收入、运营安排、从业者的信息需求，或天气对需求的影响',
  'Smoked beans and dried aquatic products displayed near storefronts': '店铺附近陈列的熏青豆与干制水产',
  'How can temperature, humidity, and rainfall become relevant to processing, drying, storage, transport, or sale?': '气温、湿度与降雨如何影响加工、晾晒、储存、运输或销售？',
  'Product origin, current methods, storage conditions, and measurable weather-related effects': '产品来源、现行方法、储存条件，以及可测量的天气影响',
  'Brick-and-tile and water-town boat-making displays, tools, materials, and production sequences': '砖瓦与水乡造船展陈、工具、材料和生产流程',
  'Why do material processes make environmental conditions and timing worth studying?': '为什么材料工艺使环境条件和时机值得研究？',
  'Whether industries are currently active, which stages are exposed, and how producers use weather information': '相关产业是否仍在运行、哪些环节暴露于天气，以及生产者如何使用天气信息',
  'Field photo · Water': '田野照片 · 水乡',
  'Boat-building knowledge connects tools, skilled labour, and a water-town setting. It gives historical context; it does not document a current business.': '造船知识连接了工具、技能劳动与水乡环境。它提供历史背景，但不代表当前仍有相关经营活动。',
  'Field photo · Service': '田野照片 · 服务',
  'A canal-side coffee shop sits directly on the water and the street. It raises questions about outdoor comfort and visitor timing; it does not record customer behaviour.': '临水咖啡店同时连接水道与街道，由此可以追问户外舒适度与游客时间选择，但照片本身没有记录消费行为。',
  'Project handoff': '项目衔接',
  'Jinxi gave us a question, not a dataset.': '锦溪给了我们一个问题，而不是一组数据。',
  'The next chapters investigate how weather uncertainty can be forecast, compared, priced, and acted upon — and what access, trust, and power shape those signals.': '接下来的章节考察天气的不确定性如何被预测、比较、定价并转化为行动，以及获取、信任与权力如何塑造这些信号。',
  'The next chapters investigate how weather uncertainty can be': '接下来的章节考察天气的不确定性如何被',
  'forecast, compared, priced, and acted upon': '预测、比较、定价并转化为行动',
  '— and what access, trust, and power shape those signals.': '——以及获取、信任与权力如何塑造这些信号。',
  '· Jinxi': '· 锦溪', '· New York': '· 纽约', '· Mexico City': '· 墨西哥城',
  'Signals vs outcomes · New York': '预测与结果 · 纽约',
  'NomadCast · Mexico City': 'NomadCast · 墨西哥城',
  'Real market prices': '真实市场价格', 'NOAA observed': 'NOAA 实测',
  'Prototype · simulated activity': '原型 · 模拟活动数据',
  'Polymarket’s highest-priced temperature range against NOAA’s recorded maximum at LaGuardia, Aug 17–28, 2026. Simple and professional views.': '对照 2026 年 8 月 17–28 日 Polymarket 最高价温度区间与 NOAA 拉瓜迪亚机场实测最高温；提供简明版和专业版。',
  'From “what will the weather be?” to “what could it mean for my day?” — market expectations, place, activity patterns, and similar days for digital nomads.': '从“天气会怎样”走向“天气对我的一天意味着什么”：为数字游民连接市场预期、地点、活动模式与相似天气日。',
  'Jinxi field origin · September 2026 · The field visit motivates a broader public-information study; it does not demonstrate a Jinxi-specific need or Polymarket use. Field photographs are from a course visit; confirm reuse permission before publishing beyond the course.': '锦溪田野缘起 · 2026 年 9 月 · 本次走访启发了更广泛的公共信息研究，但不代表锦溪存在特定需求或使用 Polymarket。照片来自课程走访，课程之外发布前应确认使用许可。',

  'Research prototype.': '研究原型。',
  'Market and weather values are illustrative placeholders in the format of Polymarket daily-temperature markets. Activity data is simulated.': '市场与天气数值是按 Polymarket 每日温度市场格式制作的示例占位数据，活动数据为模拟数据。',
  'Read the limitations →': '查看限制 →',
  'Verified market vs. observation data: Chapter 02 →': '真实市场与实测对照：第 02 章 →',
  'Market': '市场', 'Reality': '实况', 'Place': '地点', 'Network': '关系网络', 'Similar days': '相似天气日', 'Evidence': '证据',
  'Reset filters': '重置筛选',
  'Market snapshot · Basic visualization': '市场快照 · 基础可视化',
  'What could tomorrow’s weather mean for your day?': '明天的天气，可能会怎样影响你的一天？',
  'Explore prediction-market expectations, actual weather, and patterns from similar days.': '一起查看预测市场、实际天气和相似天气日的活动模式。',
  'Location': '地点', 'Date': '日期',
  'Lisbon — no data yet': '里斯本 — 暂无数据', 'Medellín — no data yet': '麦德林 — 暂无数据', 'Chiang Mai — no data yet': '清迈 — 暂无数据',
  'Market expectation': '市场预期', 'Actual weather': '实际天气', 'Place + activity context': '地点与活动', 'Historical evidence': '历史证据', 'Your interpretation': '你的判断',
  'Throughout this page': '全页标记', 'Market-implied': '市场隐含', 'Observed': '实测', 'Inferred': '推断', 'Missing': '缺失', 'Simulated': '模拟',
  'a crowd’s priced expectation': '参与者用价格表达的预期', 'recorded after the fact': '事后记录的结果', 'aggregated or matched by us': '由本项目汇总或匹配', 'shown, never filled in': '明确显示，不自行补全', 'prototype data': '原型数据',
  'Prediction vs reality · Interactive visualization': '预测与实况 · 交互可视化',
  'What did the market expect — and what actually happened?': '市场如何预测，后来实际发生了什么？',
  'Each column is one day. The shaded band shows the range the market priced highest; the dot shows the maximum temperature the settlement station recorded. Click any day to set it as the focus for every view below.': '每一列代表一天。色带表示市场价格最高的温度区间，圆点表示结算站记录的最高温度。点击任意日期，可同步更新下方所有视图。',
  'Most likely range': '最可能区间', 'Full probability distribution': '完整概率分布',
  'Tomorrow’s Maximum Temperature': '明日最高气温', 'Rain probability': '降雨概率',
  'Forecast model · not a market': '预测模型 · 非市场数据', 'Measure': '指标', 'Last updated': '最后更新', 'Source': '来源', 'Settlement source': '结算来源',
  'Market-implied probability': '市场隐含概率', 'Official weather station (MMMX)': '官方气象站（MMMX）',
  'Market probabilities represent expectations, not guaranteed forecasts.': '市场概率表达的是预期，并不是保证实现的天气预报。',
  'Place · Spatiotemporal visualization': '地点 · 时空可视化',
  'Where might weather matter in the city?': '在城市里，天气可能在哪里产生影响？',
  'Weather-sensitive places digital nomads use, sized by observed activity for the selected day or weather condition. The map shows where activity happens — not where you should go.': '地图呈现数字游民使用、且可能受天气影响的地点，大小反映所选日期或天气条件下的活动水平。它展示活动发生在哪里，并不推荐你去哪里。',
  'Weather': '天气', 'Activity': '活动', 'Contextual pattern': '情境模式',
  'All': '全部', 'Sunny': '晴朗', 'Rainy': '降雨', 'Hot': '炎热', 'Cool': '凉爽', 'Windy': '大风',
  'Work': '工作', 'Mobility': '出行', 'Leisure': '休闲',
  'Weather × activity · Network visualization': '天气 × 活动 · 关系网络',
  'How are weather conditions and everyday activities connected?': '天气条件与日常活动之间有什么联系？',
  'Similar days · Evidence view': '相似天气日 · 证据视图',
  'What happened on days with similar conditions?': '在天气相似的日子里，发生过什么？',
  'Similar days · Advanced visualization with a simple baseline': '相似天气日 · 进阶可视化与基础对照',
  'What happened on similar days?': '相似天气日里发生过什么？',
  'Selected forecast': '当前预测', 'Forecast rain': '预测降雨', 'Temperature': '气温', 'Matching rule': '匹配规则',
  'View all similar days': '查看全部相似天气日', 'Simple comparison': '简明对照',
  'Average activity across similar days': '相似天气日的平均活动水平',
  'Outdoor café': '户外咖啡店', 'Coworking': '共享办公', 'Walking': '步行', 'Cycling': '骑行', 'Park': '公园', 'Indoor leisure': '室内休闲',
  'Low': '低', 'Med': '中', 'High': '高', 'All days': '全部日期',
  'Evidence & limitations': '证据与限制', 'Sources, missingness, and interpretation boundaries': '数据来源、缺失情况与解释边界',
  'Evidence · Data · Limitations': '证据 · 数据 · 限制', 'How do we know?': '我们如何知道？',
  'Prediction market': '预测市场', 'Weather observation': '天气实测', 'Activity data': '活动数据', 'Data transformations': '数据处理', 'Limitations': '限制',
  'Claim boundaries': '结论边界', 'Repository': '代码仓库', 'Methodology': '方法', 'Known issues': '已知问题', 'Coverage': '覆盖范围', 'Timestamp': '时间戳', 'Market URL': '市场链接', 'Market ID': '市场 ID', 'Real-data counterpart': '真实数据对照',
  'Market probability is not an official weather forecast.': '市场概率不是官方天气预报。',
  'Association does not imply causation.': '相关关系不代表因果关系。',
  'Historical activity patterns do not guarantee future behavior.': '历史活动模式不能保证未来行为。',
  'Observed users may not represent all digital nomads.': '被观察到的用户不能代表所有数字游民。',
  'Missing data is visibly marked rather than silently interpolated.': '缺失数据会明确标注，不会被静默插值。',
  'Previous day': '前一天', 'Next day': '后一天', 'Not yet observed': '尚未实测', 'No comparison': '暂不可对照',
  'From': '从', 'to': '到',
  '“What will the weather be?”': '“天气会怎样？”',
  '“What could this weather mean for my day?”': '“这样的天气对我的一天意味着什么？”',
}));

const originalText = new WeakMap();
const originalAttrs = new WeakMap();

function translateText(root, language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    if (node.parentElement?.closest('script, style, .site-language')) return;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const source = originalText.get(node);
    if (language === 'en') { node.nodeValue = source; return; }
    const leading = source.match(/^\s*/)?.[0] || '';
    const trailing = source.match(/\s*$/)?.[0] || '';
    const key = source.trim().replace(/\s+/g, ' ');
    if (zh.has(key)) node.nodeValue = `${leading}${zh.get(key)}${trailing}`;
  });
}

function translateAttrs(language) {
  document.querySelectorAll('[aria-label], [title], option').forEach((node) => {
    if (!originalAttrs.has(node)) originalAttrs.set(node, { aria: node.getAttribute('aria-label'), title: node.getAttribute('title'), text: node.tagName === 'OPTION' ? node.textContent : null });
    const source = originalAttrs.get(node);
    if (source.aria != null) {
      const value = language === 'zh' ? (zh.get(source.aria) || source.aria) : source.aria;
      if (node.getAttribute('aria-label') !== value) node.setAttribute('aria-label', value);
    }
    if (source.title != null) {
      const value = language === 'zh' ? (zh.get(source.title) || source.title) : source.title;
      if (node.getAttribute('title') !== value) node.setAttribute('title', value);
    }
    if (source.text != null) {
      const value = language === 'zh' ? (zh.get(source.text.trim()) || source.text) : source.text;
      if (node.textContent !== value) node.textContent = value;
    }
  });
}

function currentLanguage() {
  try { return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'zh'; } catch { return 'zh'; }
}

function applyLanguage(language) {
  language = language === 'en' ? 'en' : 'zh';
  try { localStorage.setItem(STORAGE_KEY, language); } catch {}
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  const path = location.pathname;
  document.title = language === 'zh'
    ? (path.includes('nomadcast') ? 'NomadCast — 天气对我的一天意味着什么？' : '天气 / 信号 — 问题从锦溪开始')
    : (path.includes('nomadcast') ? 'NomadCast — What could this weather mean for my day?' : 'Weather / Signals — Jinxi raised the question');
  translateText(document.body, language);
  translateAttrs(language);
  document.querySelectorAll('.site-language button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
  window.dispatchEvent(new CustomEvent('site-language-change', { detail: { language } }));
}

function mountControl() {
  const bar = document.querySelector('.chapterbar-inner');
  if (!bar || bar.querySelector('.site-language')) return;
  const control = document.createElement('div');
  control.className = 'site-language';
  control.setAttribute('role', 'group');
  control.setAttribute('aria-label', 'Language / 语言');
  control.innerHTML = '<button type="button" data-language="zh">中</button><button type="button" data-language="en">EN</button>';
  control.addEventListener('click', (event) => {
    const button = event.target.closest('[data-language]');
    if (button) applyLanguage(button.dataset.language);
  });
  bar.append(control);
}

mountControl();
applyLanguage(currentLanguage());

// NomadCast renders many labels after startup; translate newly inserted static labels too.
let queued = false;
new MutationObserver(() => {
  if (queued || currentLanguage() !== 'zh') return;
  queued = true;
  queueMicrotask(() => { queued = false; translateText(document.body, 'zh'); translateAttrs('zh'); });
}).observe(document.body, { childList: true, subtree: true });
