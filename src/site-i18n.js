import { translateChapterThree } from './chapter-three-i18n.js';
const STORAGE_KEY = 'temperature-language';

const zh = new Map(Object.entries({
  'Origin': '缘起',
  'Jinxi': '锦溪',
  'Signals vs outcomes': '预测与结果',
  'New York': '纽约',
  'Mexico City': '墨西哥城',
  'Weather & daily life': '天气与日常生活',
  'Forecasts & observations': '预测与实测',
  '· Weather & daily life': '· 天气与日常生活',
  'Website chapters': '网站章节',
  'Weather / Signals': 'Weatherbridge',
  'Information to preparation': '从信息到准备',
  'Weather and': '天气与', 'everyday life': '日常生活',
  'A three-step overview: Jinxi daily life, understanding forecasts, and comparing them with observed weather.': '三步了解本项目：锦溪日常生活、理解天气预测，并与实测天气对照。',
  'In Jinxi, we began to notice how weather touches everyday life. Wind and rain affect boat trips, canal-side shops depend on visitors, and food drying depends on the weather. Weather shapes how people travel, work, and run their businesses.': '在锦溪，我们开始注意到天气和日常生活的关系。游船会受风雨影响，临水商铺依赖游客，食品晾晒也看天气。天气变化，就这样影响着出行、生产和经营。',
  '01 Start with Jinxi': '01 从锦溪出发',
  '02 Compare forecasts and observations': '02 对照预测与实测',
  '03 Explore weather in daily life': '03 探索天气与日常生活',
  'What this project explores': '这个项目关注什么',
  'Starting in Jinxi, we look at how weather connects to travel, production, and local businesses.': '从锦溪出发，我们观察天气如何关联出行、生产与日常经营。',
  'Start with everyday scenes in Jinxi. Then compare forecasts with recorded weather, and explore how changing conditions may shape life in a city.': '先从锦溪的日常场景出发，再对照天气预测与实测结果，最后看看天气变化可能怎样影响城市生活。',
  'Field observations': '田野观察',
  'In Jinxi, weather is part of everyday life.': '在锦溪，天气就在日常生活中。',
  'Boats, canal-side shops, food drying, and traditional crafts connect weather with travel, work, and local business. These scenes are where our questions begin.': '游船、临水商铺、食品晾晒和传统手工业，让天气与出行、劳动和经营联系在一起。这些日常场景，正是我们提出问题的起点。',
  'Field observation': '实地观察',
  'Evidence boundary': '证据边界',
  'The team observed products, tourism settings, and museum displays during one visit. These records do not prove current financial losses, a weather-information gap, Polymarket use, a causal weather relationship, or community demand for a tool.': '团队在一次走访中记录了产品、旅游场景与博物馆展陈。这些记录不能证明现实经济损失、天气信息缺口、Polymarket 使用、天气因果关系，或当地对某种工具的需求。',
  'Service & tourism · Xinyuan': '服务与旅游',
  'Service & tourism': '服务与旅游',
  'Covered tour boats make outdoor visitor movement and water conditions visible as questions for later validation.': '河道游船、户外游览等活动直接暴露于天气变化，提示当地旅游服务可能具有明显的天气敏感性。',
  'Food display · Yizhou': '食品加工',
  'Smoked beans invite questions about drying, storage, transport, and sale conditions; the visit does not establish which stages are weather-sensitive.': '食品的晾晒、储存与运输都可能受到温度、湿度和降雨影响，体现天气与日常生产之间的直接联系。',
  'Traditional production · Shudan': '传统生产',
  'Traditional production': '传统生产',
  'River boats and outdoor sightseeing are directly exposed to weather changes, suggesting that local tourism services may be notably weather-sensitive.': '河道游船、户外游览等活动直接暴露于天气变化，提示当地旅游服务可能具有明显的天气敏感性。',
  'Drying, storage, and transport can all be affected by temperature, humidity, and rainfall, showing a direct link between weather and everyday production.': '食品的晾晒、储存与运输都可能受到温度、湿度和降雨影响，体现天气与日常生产之间的直接联系。',
  'Traditional brick-making involves material preparation, forming, and drying; weather conditions may affect the pace and scheduling of work.': '传统砖瓦制作涉及原料处理、成型与晾晒等环节，天气条件可能影响生产节奏与作业安排。',
  'Tourism services · Water-based sightseeing': '旅游服务 · 水上游览',
  'River boats and outdoor sightseeing are directly exposed to temperature, rainfall, and wind, showing how sensitive tourism services can be to changing weather.': '河道游船和户外游览直接受到温度、降雨和风等天气条件影响，体现旅游服务对天气变化的敏感性。',
  'Food processing · Smoked-bean drying': '食品加工 · 熏青豆晾晒',
  'Drying, storage, and transport can all be affected by temperature, humidity, and rainfall, linking weather directly to food production.': '熏青豆的晾晒、储存与运输都可能受到温度、湿度和降雨影响，体现天气与食品生产之间的联系。',
  'Traditional craft · Brick-making': '传统手工业 · 砖瓦制作',
  'Traditional craft · Wooden-boat making': '传统手工业 · 木船制作',
  'Traditional wooden-boat making connects skilled labour and tool use with the long-term natural setting of a water town.': '传统木船制作体现了手工劳动、工具使用与水乡自然环境之间的长期联系。',
  'Tourism services · Canal-side coffee': '旅游服务 · 临水咖啡',
  'A canal-side coffee shop depends on waterfront space and visitor flow; weather and outdoor comfort may shape how long visitors stay and whether they spend.': '临水咖啡店依托水岸空间与游客流量经营，天气和户外舒适度可能影响游客停留与消费。',
  'The brick-making display links materials, labour, timing, and controlled conditions without documenting an active current industry.': '传统砖瓦制作涉及原料处理、成型与晾晒等环节，天气条件可能影响生产节奏与作业安排。',
  'Select a context to see how weather can affect it': '选择一个场景，看看天气如何与日常活动相连',
  'Tourism services': '旅游服务', 'Boat trips, outdoor visits, and canal-side shops': '游船、户外游览与临水商铺',
  'Food processing': '食品加工', 'Drying, storing, and moving local food': '本地食品的晾晒、储存与运输',
  'Traditional crafts': '传统手工业', 'Materials, skilled work, and weather-sensitive timing': '材料、手工劳动与受天气影响的作业时机',
  '01 / Travel': '01 / 出行', '02 / Food': '02 / 食品', '03 / Craft': '03 / 手艺',
  'Wind, rain, and heat can shape boat trips, outdoor visits, and the comfort of canal-side spaces.': '风雨和高温会影响游船、户外游览，以及临水空间的舒适度。',
  'Drying, storage, and transport depend on conditions such as temperature, humidity, and rainfall.': '晾晒、储存和运输都与温度、湿度、降雨等条件有关。',
  'Brick-making and boat-building connect materials, skilled work, and the timing of outdoor tasks.': '砖瓦制作和木船工艺连接着材料、手工劳动与户外作业时机。',
  'Design handoff': '研究衔接',
  'From field observation to weather-risk information': '从田野观察，走向天气风险信息',
  'Jinxi’s water-town tourism, food processing, and traditional crafts show that weather is part of everyday decisions. This raises a broader question: how can people understand different forecasts and turn uncertain information into a clearer picture?': '锦溪的水乡旅游、食品加工与传统手工业让我们看到：天气并不是抽象的数据，它可能进入游客出行、生产安排、晾晒储存和经营决策。由此，我们开始关注一个更普遍的问题——普通人如何理解不同来源的天气预测，并将不确定的信息转化为更直观的判断？',
  'Where it begins': '从这里开始', 'Weather touches everyday life': '天气影响着日常生活',
  'Boat trips, local shops, and food drying all depend on weather conditions.': '游船、临水商铺和食品晾晒，都与天气条件有关。',
  'The question': '我们关心的问题', 'How should we read a forecast?': '我们该如何理解天气预测？',
  'Different forecasts can tell different stories. What seems likely, and how sure can we be?': '不同预测可能给出不同答案。什么更有可能发生？我们又有多大把握？',
  'What this site explores': '这个网站将带你了解', 'Predictions beside actual weather': '把天气预测与实际天气放在一起',
  'Compare public forecasts with recorded conditions to see what was expected and what happened.': '把公开天气预测与实际记录放在一起，看看预测了什么，实际天气又是怎样。',
  'What we study next': '我们进一步研究', 'Comparing weather signals': '比较不同天气信号',
  'Comparing weather forecasts': '比较天气预测',
  'Bring official observations, weather forecasts, and market-based probability estimates together to compare expectations, uncertainty, and outcomes.': '把官方实测、天气预报与公开的天气预测放在一起，对照预测、天气不确定性与实际结果。',
  'From community scenes to information needs': '从社区场景到信息需求',
  'Category': '类别', 'Field observation': '现场观察', 'Weather connection': '天气联系', 'Information need': '信息需求',
  'Boats and canal-side coffee depend on outdoor space and visitor movement.': '游船、临水咖啡等活动依赖户外空间和游客流动。',
  'Heat, rainfall, and outdoor comfort may change travel and time spent outdoors.': '高温、降雨和体感舒适度可能改变游客出行与停留。',
  'How might the weather change? Do different forecast signals agree?': '未来天气如何变化？不同预测信号是否一致？',
  'Smoked beans involve drying, storage, transport, and sale.': '熏青豆等食品涉及晾晒、储存、运输和销售。',
  'Temperature, humidity, and rainfall may change processing and storage conditions.': '温度、湿度和降雨可能改变加工与储存条件。',
  'When might unfavorable weather occur? How uncertain are the forecasts?': '何时可能出现不利天气？预测存在多大不确定性？',
  'Traditional craft': '传统手工业',
  'Brick-making and wooden-boat craft show links among materials, labour, and nature.': '砖瓦制作、木船工艺展示出材料、劳动与自然环境的联系。',
  'Some production stages may be sensitive to temperature, humidity, rainfall, and timing.': '部分生产环节可能对温度、湿度、降雨和作业时机敏感。',
  'How can simple weather-risk information support production planning and judgment?': '如何用简单的天气风险信息辅助生产安排与判断？',
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
  'Project handoff': '接下来',
  'From a local question to a wider comparison': '从一个地方的问题，走向更广泛的比较',
  'Next, we explore how forecasts describe the future, how they differ, and how they compare with': '接下来，我们将了解天气预测如何描述未来、彼此有何不同，以及它们与',
  'the weather that actually arrived.': '实际天气如何对应。',
  '· Jinxi': '· 锦溪', '· New York': '· 纽约', '· Mexico City': '· 墨西哥城',
  'Forecasts & observations · New York': '预测与实测 · 纽约',
  'Weather & daily life · Mexico City': '天气与日常生活 · 墨西哥城',
  'Real market prices': '真实市场价格', 'NOAA observed': 'NOAA 实测',
  'Prototype · simulated activity': '原型 · 模拟活动数据',
  'Compare the most likely temperature prediction with recorded weather at LaGuardia, Aug 17–28, 2026.': '对照 2026 年 8 月 17–28 日最可能的气温预测与拉瓜迪亚机场记录的实际天气。',
  'Prediction range': '预测区间', 'Recorded weather': '实际天气记录',
  'From “what will the weather be?” to “what could it mean for my day?” using place, daily activities, and patterns from similar weather days.': '从“天气会怎样”走向“天气对我的一天意味着什么”：结合地点、日常活动与相似天气日的模式，理解天气可能带来的影响。',
  'A weather and daily-life project, beginning in Jinxi and continuing through forecast comparisons and city experiences.': '一个关于天气与日常生活的项目：从锦溪出发，继续比较天气预测，并观察它与城市生活的联系。',

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
  'Each column is one day. The shaded band shows the range the market priced highest; the dot shows the maximum temperature the settlement station recorded.': '每一列代表一天。色带表示市场价格最高的温度区间，圆点表示结算站记录的最高温度。',
  'Click any day': '点击任意日期，',
  'to set it as the focus for every view below.': '即可同步更新下方所有视图。',
  'Market’s most likely range · darker = higher probability': '市场最可能的温度区间 · 颜色越深，概率越高',
  'Observed maximum (settlement station)': '结算气象站记录的最高气温',
  'No market / no observation': '无市场数据 / 无实测记录',
  'Tomorrow · not yet observed': '明日 · 尚无实测记录',
  'Market-implied': '市场预测', 'Observed': '实际观测',
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
const renderedText = new WeakMap();
const renderedAttrs = new WeakMap();
// Own complete bilingual case paragraphs so emphasis survives language changes.
const caseParagraphs = [...document.querySelectorAll('#next p[data-copy-zh], .meaning-main p[data-copy-zh], body[data-page-title-zh] p[data-copy-zh], .family-scene figcaption, .o-handoff-portrait figcaption, .cafe-portrait figcaption, .guide-entry-image figcaption')];
const caseSources = new Map(caseParagraphs.map(element=>{
  const source={en:element.textContent,zh:element.getAttribute('data-copy-zh')||element.textContent};
  element.setAttribute('data-case-copy','');return [element,source];
}));
const caseNames=/非洲|马拉维|伦菲|锦溪|张华阳|墨西哥城|洛杉矶|迭戈|托科|帕蒂奥咖啡馆|帕蒂奥|Africa|Malawi|Rumphi|Jinxi|Zhang HuaYang|Mexico City|Los Angeles|Diego|Thoko|Café Patio|Jason Jiang|28wishes/g;
function emphasizeCases(language) {
  caseSources.forEach((source,element)=>{
    const value=source[language];
    const fragment=document.createDocumentFragment();let start=0;
    for(const match of value.matchAll(caseNames)){
      fragment.append(document.createTextNode(value.slice(start,match.index)));
      const name=document.createElement('strong');name.className='case-name';name.textContent=match[0];fragment.append(name);start=match.index+match[0].length;
    }
    fragment.append(document.createTextNode(value.slice(start)));element.replaceChildren(fragment);
  });
}

function translateText(root, language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    if (node.parentElement?.closest('script, style, .site-language, .chart-palette, [data-language-owned], [data-case-copy]')) return;
    if (!originalText.has(node) || (renderedText.has(node) && node.nodeValue !== renderedText.get(node))) originalText.set(node, node.nodeValue);
    const source = originalText.get(node);
    if (language === 'en') {
      if (node.nodeValue !== source) node.nodeValue = source;
      renderedText.set(node, source);
      return;
    }
    const leading = source.match(/^\s*/)?.[0] || '';
    const trailing = source.match(/\s*$/)?.[0] || '';
    const key = source.trim().replace(/\s+/g, ' ');
    const explicitTranslation = node.parentElement?.getAttribute('data-copy-zh');
    const translation = explicitTranslation && node.parentElement.childNodes.length === 1 ? explicitTranslation : zh.get(key) ?? (location.pathname.includes('nomadcast') ? translateChapterThree(key) : null);
    const value = translation != null ? `${leading}${translation}${trailing}` : source;
    if (node.nodeValue !== value) node.nodeValue = value;
    renderedText.set(node, value);
  });
}

function translateAttrs(language) {
  document.querySelectorAll('[aria-label], [title]').forEach((node) => {
    if (node.closest('.chart-palette, [data-language-owned]')) return;
    const live = { aria: node.getAttribute('aria-label'), title: node.getAttribute('title') };
    if (!originalAttrs.has(node)) originalAttrs.set(node, { ...live });
    const source = originalAttrs.get(node);
    const last = renderedAttrs.get(node);
    if (last) ['aria', 'title'].forEach((key) => { if (live[key] !== last[key]) source[key] = live[key]; });
    const translate = (value) => language === 'zh' ? (zh.get(value) ?? (location.pathname.includes('nomadcast') ? translateChapterThree(value) : value)) : value;
    if (source.aria != null) {
      const value = translate(source.aria);
      if (node.getAttribute('aria-label') !== value) node.setAttribute('aria-label', value);
    }
    if (source.title != null) {
      const value = translate(source.title);
      if (node.getAttribute('title') !== value) node.setAttribute('title', value);
    }
    renderedAttrs.set(node, { aria: node.getAttribute('aria-label'), title: node.getAttribute('title') });
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
  document.title = document.body.dataset[language === 'zh' ? 'pageTitleZh' : 'pageTitleEn'] || (language === 'zh'
    ? (path.includes('nomadcast') ? 'Weatherbridge · 03 从信息到行动' : 'Weatherbridge · 01 天气与日常生活')
    : (path.includes('nomadcast') ? 'Weatherbridge · 03 From information to action' : 'Weatherbridge · 01 Weather & daily life'));
  translateText(document.body, language);
  translateAttrs(language);
  emphasizeCases(language);
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
  queueMicrotask(() => { queued = false; if (currentLanguage() !== 'zh') return; translateText(document.body, 'zh'); translateAttrs('zh'); });
}).observe(document.body, { childList: true, characterData: true, attributes: true, attributeFilter: ['title', 'aria-label'], subtree: true });
