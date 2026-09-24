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
  'What weather signals could mean for one person’s day, for a city and its industries, and for a shop owner who hedges weather losses on Polymarket.': '天气信号对一个人的一天、对一座城市及其产业、对在 Polymarket 上对冲天气损失的店主，分别意味着什么。',
  'Jinxi field origin · September 2026 · The field visit motivates a broader public-information study; it does not demonstrate a Jinxi-specific need or Polymarket use. Field photographs are from a course visit; confirm reuse permission before publishing beyond the course.': '锦溪田野缘起 · 2026 年 9 月 · 本次走访启发了更广泛的公共信息研究，但不代表锦溪存在特定需求或使用 Polymarket。照片来自课程走访，课程之外发布前应确认使用许可。',

  'Research prototype.': '研究原型。',
  'Market and weather values are illustrative placeholders in the format of Polymarket daily-temperature markets. Activity data is simulated.': '市场与天气数值是按 Polymarket 每日温度市场格式制作的示例占位数据，活动数据为模拟数据。',
  'Read the limitations →': '查看限制 →',
  'Verified market vs. observation data: Chapter 02 →': '真实市场与实测对照：第 02 章 →',
  'Market': '市场', 'Reality': '实况', 'Place': '地点', 'Network': '关系网络', 'Similar days': '相似天气日', 'Evidence': '证据',
  'Reset filters': '重置筛选',
  'Hedgers': '对冲者',
  'Feature · The hedgers': '特稿 · 对冲者', 'Illustrative scenario': '示例情景',
  'In Jinxi, people could compare different weather signals to plan their days, and the sections above do the same for one person and one city. What if someone wants to go a step further?': '在锦溪，人们可以比较不同的天气信号来安排日常；上面几节也为一个人、一座城市做了同样的事。那么，如果有人想更进一步呢？',
  'A cold day costs the café. A Polymarket contract pays it back.': '冷天让咖啡馆亏钱，Polymarket 合约把钱补回来。',
  'How a small business in Mexico City’s nomad economy could use this tool to price weather risk, buy a prediction on Polymarket, and soften the loss when the weather turns against it.': '墨西哥城数字游民经济中的一家小店，如何借助这个工具为天气风险定价、在 Polymarket 上买入预测，在天气不利时减少损失。',
  'Marisol runs a rooftop café in Roma Norte. Most of her customers are remote workers with laptops, and they follow the sun. When a cool, wet day comes in, the terrace empties and she estimates she loses about $200 in sales.': 'Marisol 在 Roma Norte 经营一家屋顶咖啡馆。她的客人大多是带着笔记本电脑的远程工作者，哪里有阳光就去哪里。一旦遇上阴冷潮湿的天气，露台就空了，她估计当天会少卖约 200 美元。',
  'She can’t change the weather, but she can take the other side of it. Polymarket lists a daily market on Mexico City’s maximum temperature, split into 2°C ranges. Each “Yes” share costs its market price and pays $1 if the day settles in that range. If she owns shares in the cool ranges, the market pays her on exactly the days her terrace is quiet.': '她改变不了天气，但可以站到天气的另一边。Polymarket 每天都有“墨西哥城最高气温”市场，按 2°C 划分区间。每一股 “Yes” 以市场价格买入，如果当天结算落在该区间，就赔付 1 美元。只要她持有偏冷区间的股份，市场恰好会在她露台冷清的那些日子付钱给她。',
  'The idea isn’t hers. In Los Angeles, the owners of the ice cream shop 28 Wishes told reporters they put about $20 a day into weather contracts on Kalshi because sales drop about 20% below 70°F. They said the payouts covered up to 43% of their rent in a good month (': '这个办法并非她首创。在洛杉矶，冰淇淋店 28 Wishes 的店主告诉记者，因为气温低于 70°F（约 21°C）时销量会下降约 20%，他们每天在 Kalshi 上投入约 20 美元购买天气合约；据他们说，好的月份赔付能覆盖多达 43% 的房租（',
  'New York Post, July 16, 2026 ↗': '《纽约邮报》，2026 年 7 月 16 日 ↗',
  ').': '）。',
  '“People don’t come into the shop when it’s cold, and they don’t come in when it’s raining. So we wanted a way to make money on those days.”': '“天冷的时候没人来店里，下雨的时候也没人来。所以我们想找个办法，在那些日子也能赚到钱。”',
  'Jason Jiang, 28 Wishes, Los Angeles · real quote': 'Jason Jiang，28 Wishes，洛杉矶 · 真实引语',
  'What Marisol needs before buying is what this chapter provides: what the market is charging, whether its prices have held up against the real weather, and how much a day like this has actually cost places like hers.': 'Marisol 下单前需要知道的，正是这一章提供的：市场现在要价多少，它的价格过去是否经得起真实天气的检验，以及这样的天气实际会让她这类店铺损失多少。',
  'Her four checks': '她的四项检查',
  'Price the risk': '给风险定价',
  'Tomorrow, the cool 24–25°C range trades at 18%, so one Yes share costs about $0.18.': '明天偏冷的 24–25°C 区间报价 18%，也就是一股 Yes 约 0.18 美元。',
  'Check the price is fair': '检查价格是否公道',
  'How often did the market’s favourite come true? Chapter 02’s accuracy trend tracks it day by day.': '市场最看好的选项有多常猜中？第 02 章的准确率趋势线逐日追踪这一点。',
  'Size the loss': '估算损失',
  'On similar cool, wet days, how far did rooftop and park activity fall?': '在相似的阴冷潮湿日子里，屋顶和公园的活动下降了多少？',
  'Run the numbers': '算一笔账',
  'Try her case in the simulation below before buying anything on Polymarket.': '在 Polymarket 下单之前，先用下方的模拟试算她的情况。',
  'Why a hedger reads this differently': '为什么对冲者的读法不一样',
  'A trader wants to beat the market. A hedger only needs the price to be roughly fair and the market to settle against the real weather. The contract’s losses land on good days, when the business earns them back. That is why the calibration check in': '交易者想赢过市场，对冲者只需要价格大致公道、结算对得上真实天气。合约亏钱的日子正是生意好的日子，店里会把钱赚回来。所以对 Marisol 来说，',
  'Chapter 02': '第 02 章',
  'matters more to Marisol than any single forecast.': '中的校准检验，比任何一次预测都更重要。',
  'Limits of this scenario': '这个情景的局限',
  'Marisol and her café are invented. The market prices are this page’s mock values, and the $200 loss is an assumption.': 'Marisol 和她的咖啡馆是虚构的；市场价格是本页的模拟数值，200 美元的损失是假设。',
  'A temperature contract doesn’t cover rain. A cool day that settles at 22–23°C falls outside the range she bought.': '温度合约不覆盖降雨；如果冷天结算在 22–23°C，就落在她买的区间之外。',
  'Markets settle on one station (MMMX), which may differ from the weather on her street.': '市场只按一个气象站（MMMX）结算，可能与她所在街道的天气不同。',
  'The 28 Wishes figures are self-reported and unaudited, and they come from Kalshi, not Polymarket.': '28 Wishes 的数字来自店主自述，未经审计，而且来自 Kalshi，不是 Polymarket。',
  'This illustrates a mechanism. It is not financial advice, and prediction-market access depends on local law.': '这里只是说明一种机制，并非投资建议；能否使用预测市场取决于当地法律。',
  'Market snapshot · Basic visualization': '市场快照 · 基础可视化',
  'What could tomorrow’s weather mean for your day?': '明天的天气，可能会怎样影响你的一天？',
  'Explore prediction-market expectations, actual weather, and patterns from similar days.': '一起查看预测市场、实际天气和相似天气日的活动模式。',
  'Location': '地点', 'Date': '日期',
  'Lisbon — no data yet': '里斯本 — 暂无数据', 'Medellín — no data yet': '麦德林 — 暂无数据', 'Chiang Mai — no data yet': '清迈 — 暂无数据',
  'Market expectation': '市场预期', 'Actual weather': '实际天气', 'Place + activity context': '地点与活动', 'Historical evidence': '历史证据', 'Your interpretation': '你的判断',
  'Throughout this page': '全页标记', 'Market-implied': '市场隐含', 'Observed': '实测', 'Inferred': '推断', 'Missing': '缺失', 'Simulated': '模拟',
  'a crowd’s priced expectation': '参与者用价格表达的预期', 'recorded after the fact': '事后记录的结果', 'aggregated or matched by us': '由本项目汇总或匹配', 'shown, never filled in': '明确显示，不自行补全', 'prototype data': '原型数据',
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

  // NomadCast · structure
  'Weather / Signals': '天气 / 信号',
  'City': '城市', 'Simulation': '模拟',
  'My day': '我的一天', 'My city': '我的城市', 'Going further: hedging': '更进一步：对冲',
  'Part A · Personal life': '第一部分 · 个人生活',
  'First, what the weather could mean for one person’s day.': '先看天气对一个人的一天可能意味着什么。',
  'Part B · City life': '第二部分 · 城市生活',
  'Then, what the same weather means for a city and the businesses in it.': '再看同样的天气对一座城市和其中的生意意味着什么。',
  'Part C · Going further': '第三部分 · 更进一步',
  'Finally, what if people want more than a better-planned day?': '最后，如果人们想要的不只是把一天安排得更好呢？',
  'From places to industries': '从地点到产业',
  'Behind each kind of place is a business that carries the weather risk.': '每一类地点背后，都有一门承担天气风险的生意。',
  'Each card compares activity on days with one weather condition against all observed days. When activity falls, the business behind it loses revenue.': '每张卡片比较某种天气下的活动水平与全部实测日的平均水平。活动下降时，背后的生意就会损失收入。',
  'Activity levels are simulated. A change in activity is a proxy for demand, not a measured revenue loss.': '活动水平为模拟数据。活动变化只是需求的替代指标，并不是实测的收入损失。',
  'Simulation · Hedging a weather loss': '模拟 · 对冲天气损失',
  'What does a bad-weather day cost a shop owner, with and without a hedge?': '一个坏天气日会让店主损失多少？对冲与不对冲有什么区别？',
  'Pick a business and the weather that hurts it. Set a normal day’s revenue, how much bad weather takes away, the Polymarket price of that weather, and how much to spend on contracts. The simulation compares costs and final results.': '选择一种生意和让它受损的天气，设定正常一天的营业额、坏天气带走的比例、这种天气在 Polymarket 上的价格，以及每天花多少钱买合约。模拟会比较成本和最终结果。',

  // NomadCast · static copy split by inline markup
  'A bipartite network of observed co-occurrence. A link appears when an activity’s average level on days with that condition is at least 5% above its average across all days.': '这是一张基于实测共现关系的二分网络：某项活动在某种天气下的平均水平，比它在全部日期的平均水平高出至少 5% 时，就画出一条连线。',
  'Hover': '悬停', 'to trace connections;': '可追踪连线；', 'click': '点击', 'to filter the other views.': '可筛选其他视图。',
  'Connection strength represents observed association, not causation.': '连线粗细表示实测的关联强度，不代表因果关系。',
  'We match past days whose': '我们找出过去',
  'observed': '实测',
  'weather resembles the selected day’s expected weather, then show what activity looked like on each of them. Click a column to inspect that day.': '天气与所选日期预期天气相近的日子，并展示每一天的活动情况。点击某一列可查看当天详情。',
  'Weather-sensitive places digital nomads use, sized by observed activity for the selected day or weather condition. The map shows': '地图呈现数字游民使用、且可能受天气影响的地点，大小反映所选日期或天气条件下的活动水平。地图展示的是活动发生在',
  'where': '哪里',
  'activity happens — not where you should go.': '，并不推荐你去哪里。',
  'Inferred match': '推断匹配', 'Observed activity': '实测活动',
  'Bars are means over non-missing cells; the thin tick is the mean over all observed days. Differences on 8 days are small-sample and unstable.': '柱长是非缺失格子的平均值；细刻度线是全部实测日的平均值。只有 8 天的差异属于小样本，并不稳定。',
  'Boundaries are simplified and schematic. Café and coworking locations are anonymised IDs. Public parks and museums use their real names and approximate positions.': '边界经过简化，仅作示意。咖啡馆和共享办公地点使用匿名编号；公园和博物馆使用真实名称和大致位置。',
  'Every number on this page traces back to one of three sources and a small set of transformations. Here is what they are, and what they cannot tell you.': '本页每个数字都来自三类数据源之一，并经过少量处理。下面说明它们是什么，以及它们不能告诉你什么。',
  'NomadCast · InfoVis course project, 2026. Built to support interpretation, not to make decisions for you.': 'NomadCast · 信息可视化课程项目，2026。它帮助你解读信息，而不是替你做决定。',
  'Data last updated': '数据更新时间', 'Sep 24, 2026 · 10:32 AM CST': '2026 年 9 月 24 日 · 上午 10:32（墨西哥城时间）',
  'Data transformations (D)': '数据处理（D）',
  '3 days without station observation · 1 day without a listed market · 1 day without activity data · rain probability comes from a forecast model, not a market': '3 天没有气象站实测 · 1 天没有上线市场 · 1 天没有活动数据 · 降雨概率来自预报模型，而非市场',

  // NomadCast · hero and state bar
  'Mexico City ·': '墨西哥城 ·', 'Tomorrow, Sep 25': '明天，9月25日', 'Tomorrow · September 25': '明天 · 9月25日',
  'Tomorrow': '明天', '· September 25 · market open': '· 9月25日 · 市场开放中', '· market settled': '· 市场已结算',
  'Focus': '聚焦', 'Maximum Temperature': '最高气温',
  '← Most likely': '← 最可能', '10:32 AM · Sep 24': '9月24日 上午 10:32', 'Final price at settlement': '结算时的最终价格',
  'Polymarket': 'Polymarket', 'mock values': '模拟数值',
  'Observed maximum:': '实测最高气温：', 'Observed maximum': '实测最高气温',
  'No observation available from the settlement station.': '结算气象站没有可用实测。',

  // NomadCast · network
  'Weather condition · days observed': '天气条件 · 实测天数',
  'Activity · average level, all days': '活动 · 全部日期的平均水平',
  'Observed association (lift over all-day average)': '实测关联（相对全部日期平均水平的提升）',
  'EXPECTED TOMORROW': '明天预期',
  'Indoor coworking': '室内共享办公', 'Museum / indoor leisure': '博物馆 / 室内休闲',
  'above all-day average': '高于全部日期平均水平',
  'Color = weather condition · links below +5% not drawn': '颜色 = 天气条件 · 低于 +5% 的连线不显示',
  'Definition': '定义', 'Days observed': '实测天数', 'Average level': '平均水平', 'Days with data': '有数据的天数', 'Lift': '提升', 'Mean on all days': '全部日期均值',
  'Co-occurrence in the activity log. Not a causal effect.': '这是活动记录中的共现关系，不是因果效应。',
  'No activity is ≥ 5% above its average on these days.': '这些日子里没有哪项活动比平均水平高出 5% 以上。',
  'Click to filter every view to this condition.': '点击可将所有视图筛选到这种天气。',
  'Not ≥ 5% above average under any condition.': '在任何天气下都没有比平均水平高出 5% 以上。',
  'Click to focus this activity across views.': '点击可在所有视图中聚焦这项活动。',
  '< 0.5 mm precipitation and mostly clear sky': '降水 < 0.5 mm 且大部分时间晴朗',
  '≥ 2 mm observed precipitation': '实测降水 ≥ 2 mm',
  'observed max ≥ 27°C': '实测最高气温 ≥ 27°C',
  'observed max ≤ 23°C': '实测最高气温 ≤ 23°C',
  'max sustained wind ≥ 22 km/h': '最大持续风速 ≥ 22 km/h',

  // NomadCast · similar days
  'Forecast': '预报', 'Rain': '降雨', 'Rain probability · forecast model': '降雨概率 · 预报模型',
  'Observed precipitation': '实测降水', 'No temperature': '无气温数据', 'No market or observation': '没有市场也没有实测',
  'Distance on max temperature (per 2°C) and wetness (dry / light / ≥ 2 mm, per 0.5), matched against each past day’s': '按最高气温（每 2°C）和湿润程度（干燥 / 小雨 / ≥ 2 mm，每 0.5）计算距离，与过去每一天的',
  'Cell = normalised observed activity (0–1) on that day': '格子 = 当天归一化的实测活动水平（0–1）',
  'No observation available': '没有可用实测',
  'Columns ordered by similarity →': '按相似度排列 →',
  'Show the 8 closest only': '只显示最接近的 8 天',
  'No similar days found': '没有找到相似天气日', 'try clearing the weather filter': '试试清除天气筛选',
  'No similar days to summarise': '没有可汇总的相似天气日',
  'Observed level': '实测水平', 'All-day average': '全部日期平均', 'Observations that day': '当天观测次数',
  'Click for the full day record.': '点击查看当天完整记录。', 'Click to open the day record.': '点击打开当天记录。',
  'Similarity': '相似度', 'Observed max': '实测最高气温', 'Precipitation': '降水', 'Tags': '标签',

  // NomadCast · map
  'Coworking spaces': '共享办公空间', 'Cafés': '咖啡馆', 'Parks / outdoor work areas': '公园 / 户外办公区', 'Cultural / indoor venues': '文化 / 室内场馆', 'Walkable outdoor corridors': '适合步行的户外路线',
  'Size = relative activity level · hatched = no observation': '大小 = 相对活动水平 · 斜线 = 无实测',
  'Activity by district · indoor vs outdoor': '各街区活动 · 室内与户外',
  'Indoor': '室内', 'Outdoor': '户外', 'Bar length = summed activity of visible places': '柱长 = 可见地点的活动总和',
  'Area': '街区', 'Category': '类别',
  'Madero pedestrian street': 'Madero 步行街', 'Av. Ámsterdam loop': 'Ámsterdam 大道环线', 'Álvaro Obregón median': 'Álvaro Obregón 林荫带', 'Reforma cycle route': 'Reforma 骑行道',

  // NomadCast · day panel
  'Historical day record': '历史日记录', 'Not in the current similar-day set': '不在当前相似天气日集合中',
  'Prediction-market probabilities': '预测市场概率', 'No market was listed for this day.': '这一天没有上线市场。',
  'Max temperature': '最高气温', 'Max wind, km/h': '最大风速（km/h）', 'No condition tags': '没有天气标签',
  'No activity observation available for this day.': '这一天没有活动实测。',
  'Data completeness': '数据完整度', 'Provenance': '数据来源', 'Market probabilities': '市场概率', 'Observed max temp': '实测最高气温',
  'n/a': '无', 'Close': '关闭',
  '· Polymarket (mock)': '· Polymarket（模拟）', 'Station': '气象站', 'Activity log': '活动记录', '· simulated': '· 模拟',

  // NomadCast · evidence cards
  'Crowd-priced probabilities for tomorrow’s maximum temperature, by 2°C range.': '参与者按 2°C 区间为明日最高气温定价的概率。',
  'Market-implied. A price is an expectation held by traders, shaped by liquidity and incentives, not a meteorological model.': '市场隐含。价格是交易者的预期，受流动性和激励影响，不是气象模型。',
  'Polymarket · daily “Highest temperature in Mexico City” markets': 'Polymarket · 每日“墨西哥城最高气温”市场',
  'placeholder': '占位',
  'Sep 24, 2026 · 10:32 AM CST (snapshot); historical days use the final pre-settlement price': '2026 年 9 月 24 日 · 上午 10:32（快照）；历史日期使用结算前的最终价格',
  'Official weather station, as named in the market rules (MMMX, Mexico City Intl. Airport), whole °C': '市场规则指定的官方气象站（MMMX，墨西哥城国际机场），取整到 °C',
  'Chapter 02 · New York': '第 02 章 · 纽约',
  'compares actual Polymarket prices with NOAA observations (Aug 17–28, 2026)': '对照真实 Polymarket 价格与 NOAA 实测（2026 年 8 月 17–28 日）',
  'What actually happened, from the same station the market settles on.': '实际发生了什么——来自市场结算所用的同一个气象站。',
  'Observed. Airport conditions may differ from Roma Norte or Condesa, several kilometres away.': '实测。机场的天气可能与几公里外的 Roma Norte 或 Condesa 不同。',
  'Official daily weather summary for the settlement station': '结算气象站的官方每日天气摘要',
  'Station ID': '气象站编号', '· Benito Juárez International Airport': '· 贝尼托·华雷斯国际机场',
  'Observation dates': '实测日期', 'Aug 1 – Sep 24, 2026': '2026 年 8 月 1 日 – 9 月 24 日',
  'Variables used': '使用的变量', 'Daily max temperature (°C), total precipitation (mm), max sustained wind (km/h)': '每日最高气温（°C）、总降水量（mm）、最大持续风速（km/h）',
  'For tomorrow only: forecast model output. Shown separately and never labelled as a market': '仅用于明天：来自预报模型，单独显示，从不标为市场数据',
  'How often nomads were observed working, moving, and relaxing in different place types.': '数字游民在不同类型地点工作、出行和休闲的实测频率。',
  'This prototype uses simulated data. The structure matches what a real diary study would produce.': '本原型使用模拟数据，结构与真实的日记研究一致。',
  'Survey': '问卷', 'Secondary dataset': '二手数据集', 'Prototype / mock data': '原型 / 模拟数据',
  'Planned collection': '计划的采集方式', 'Diary study with nomads in Roma Norte, Condesa, and Centro: daily check-ins by place type': '在 Roma Norte、Condesa 和 Centro 对数字游民做日记研究：按地点类型每日打卡',
  'Unit': '单位', 'Normalised activity level (0–1) per activity per day; 18–58 simulated check-ins per day': '每项活动每天的归一化活动水平（0–1）；每天 18–58 次模拟打卡',
  'Places': '地点', 'Café and coworking IDs are anonymised. Parks and museums are real public places at approximate positions': '咖啡馆和共享办公使用匿名编号；公园和博物馆是真实的公共场所，位置为近似值',
  'Normalization, similar-day matching, missing values, and aggregation.': '归一化、相似天气日匹配、缺失值与汇总。',
  'Inferred. Everything in this card is a choice we made, and each choice could change what you see.': '推断。这张卡片里的每一项都是我们做出的选择，每个选择都可能改变你看到的结果。',
  'Normalization': '归一化', 'Activity counts are scaled to 0–1 per activity across the study period, so levels are comparable across rows but not across cities': '每项活动在研究期内缩放到 0–1，因此不同活动之间可以比较，但不同城市之间不能比较',
  'Weather tags': '天气标签', 'Rule-based: Rainy ≥ 2 mm · Sunny < 0.5 mm and mostly clear · Hot ≥ 27°C · Cool ≤ 23°C · Windy ≥ 22 km/h. A day can carry several tags': '基于规则：降雨 ≥ 2 mm · 晴朗 < 0.5 mm 且大部分时间晴朗 · 炎热 ≥ 27°C · 凉爽 ≤ 23°C · 大风 ≥ 22 km/h。一天可以有多个标签',
  'Similar-day matching': '相似天气日匹配', 'Euclidean distance on (max temp ÷ 2°C, wetness ÷ 0.5), with wetness 0 / 0.5 / 1 for dry, light, ≥ 2 mm. Similarity = 1 / (1 + distance). Top 8 (or 16) are shown': '按（最高气温 ÷ 2°C，湿润程度 ÷ 0.5）计算欧氏距离，干燥、小雨、≥ 2 mm 的湿润程度分别为 0 / 0.5 / 1。相似度 = 1 / (1 + 距离)。显示最接近的 8 天（或 16 天）',
  'Association (network)': '关联（网络图）', 'Lift = mean activity on days with a tag ÷ mean on all days. Links drawn only when lift ≥ 1.05': '提升 = 带某标签日子的平均活动 ÷ 全部日期平均活动。只有提升 ≥ 1.05 时才画出连线',
  'Missing values': '缺失值', 'Excluded from means and shown as hatched cells. Days without an observed temperature are excluded from matching. Nothing is interpolated': '不计入平均值，并以斜线格子显示。没有实测气温的日子不参与匹配。不做任何插值',
  'Aggregation': '汇总', 'Map and bar chart use unweighted means over the relevant days; the map multiplies by a fixed per-place popularity weight': '地图和柱状图使用相关日期的不加权平均值；地图还会乘以每个地点固定的热度权重',
  'What this tool cannot tell you, and where it could mislead.': '这个工具不能告诉你什么，以及它可能在哪里误导你。',
  'Read these before drawing any conclusion from the views above.': '在根据上面的视图得出结论之前，请先阅读这些内容。',
  'Market ≠ forecast': '市场 ≠ 预报', 'Market probability is not an official weather forecast and can be thin or wrong': '市场概率不是官方天气预报，可能交易稀少，也可能出错',
  'Association ≠ causation': '关联 ≠ 因果', 'Weekday, events, and season all co-vary with weather': '星期、活动和季节都会与天气一同变化',
  'Past ≠ future': '过去 ≠ 未来', 'Historical activity patterns do not guarantee future behavior': '历史活动模式不能保证未来行为',
  'Sample': '样本', 'Observed users may not represent all digital nomads; 8 similar days is a small sample': '被观察的用户不一定代表所有数字游民；8 个相似天气日属于小样本',
  'Spatial mismatch': '空间不匹配', 'A single airport station stands in for the whole city': '用一个机场气象站代表整座城市',
  'Missingness': '缺失情况', 'Missing data is visibly marked rather than silently interpolated': '缺失数据会明确标注，不会被静默插值',
}));

const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Sept: 9, Oct: 10, Nov: 11, Dec: 12 };
const WEEKDAYS = { Mon: '周一', Tue: '周二', Wed: '周三', Thu: '周四', Fri: '周五', Sat: '周六', Sun: '周日' };
const month = (m) => MONTHS[m.slice(0, 3)[0].toUpperCase() + m.slice(1, 3).toLowerCase()];
const weekday = (w) => WEEKDAYS[w.slice(0, 3)];
const MON = '(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept?|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)';
const WK = '(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)';
const ZH_WEATHER = { sunny: '晴朗', rainy: '降雨', hot: '炎热', cool: '凉爽', windy: '大风', Sunny: '晴朗', Rainy: '降雨', Hot: '炎热', Cool: '凉爽', Windy: '大风' };
const ZH_ACT = { 'outdoor café': '户外咖啡店', coworking: '共享办公', walking: '步行', cycling: '骑行', park: '公园', 'indoor leisure': '室内休闲' };
const zhAct = (a) => ZH_ACT[a.toLowerCase()] || a;
const zhDate = (m, d) => `${month(m)}月${d}日`;

const zhPatterns = [
  [new RegExp(`^(?:${WK}, )?${MON} (\\d{1,2})$`), (_, w, m, d) => `${zhDate(m, d)}${w ? ` ${weekday(w)}` : ''}`],
  [new RegExp(`^${WK} · (\\d+)°C$`), (_, w, t) => `${weekday(w)} · ${t}°C`],
  [/^(\d+) days?((?: · small sample)?)((?: · no link ≥ 5%)?)$/, (_, n, s, l) => `${n} 天${s ? ' · 样本较小' : ''}${l ? ' · 无 ≥ 5% 的连线' : ''}`],
  [/^(\d+) · small sample$/, (_, n) => `${n} · 样本较小`],
  [/^sim ([\d.]+)$/, (_, v) => `相似度 ${v}`],
  [/^(\d+)% in$/, (_, v) => `室内 ${v}%`],
  [/^(work|mobility|leisure) · avg ([\d.]+) · (indoor|outdoor)$/, (_, g, v, io) => `${{ work: '工作', mobility: '出行', leisure: '休闲' }[g]} · 均值 ${v} · ${io === 'indoor' ? '室内' : '户外'}`],
  [/^fewer than (\d+) days — treat with caution$/, (_, n) => `少于 ${n} 天，请谨慎解读`],
  [/^(\d+) similar days? found$/, (_, n) => `找到 ${n} 个相似天气日`],
  [/^from a pool of (\d+)(?: (sunny|rainy|hot|cool|windy))? days · (\d+) excluded for missing observations$/, (_, n, w, x) => `候选池共 ${n} 个${w ? ZH_WEATHER[w] : ''}日子 · ${x} 天因缺少实测被排除`],
  [/^Mean over (\d+) similar days, compared with all (\d+) observed days$/, (_, n, a) => `${n} 个相似天气日的平均值，与全部 ${a} 个实测日对比`],
  [/^Most likely max · market (\d+)%$/, (_, v) => `最可能的最高气温 · 市场 ${v}%`],
  [/^Selected (forecast|day)$/, (_, k) => (k === 'forecast' ? '当前预测' : '所选日期')],
  [/^weather\. Target uses (observed|market-implied) temperature and (observed|forecast probability) rain\.$/, (_, t, r) => `天气比较。目标日的气温使用${t === 'observed' ? '实测值' : '市场隐含值'}，降雨使用${r === 'observed' ? '实测值' : '预报概率'}。`],
  [/^— inside the range priced at (\d+)%\.$/, (_, v) => `——落在报价 ${v}% 的区间内。`],
  [/^● Observed (\d+)°C$/, (_, v) => `● 实测 ${v}°C`],
  [/^Other ranges: (\d+)% combined$/, (_, v) => `其他区间合计：${v}%`],
  [new RegExp(`^(Sunny|Rainy|Hot|Cool|Windy) → (.+)$`), (_, w, a) => `${ZH_WEATHER[w]} → ${zhAct(a)}`],
  [/^Mean on (sunny|rainy|hot|cool|windy) days$/, (_, w) => `${ZH_WEATHER[w]}日均值`],
  [/^(Outdoor café|Coworking|Walking|Cycling|Park|Indoor leisure) level$/, (_, a) => `${zhAct(a)}水平`],
  [new RegExp(`^([●◌] (?:Inferred · )?)(?:Observed on ${MON} (\\d+)|Mean over (\\d+) (?:days similar to (?:tomorrow|${MON} (\\d+))|historical (sunny|rainy|hot|cool|windy) days))\\. Click to focus (.+) across all views\\.$`),
    (_, mark, om, od, n, sm, sd, w, a) => `${mark.startsWith('●') ? '● ' : '◌ 推断 · '}${om ? `${zhDate(om, od)}实测` : w ? `${n} 个历史${ZH_WEATHER[w]}日的均值` : `与${sm ? zhDate(sm, sd) : '明天'}相似的 ${n} 天的均值`}。点击可在所有视图中聚焦${zhAct(a)}。`],
  [/^Coworking (W\d+)$/, (_, id) => `共享办公 ${id}`],
  [/^Café (C\d+)$/, (_, id) => `咖啡馆 ${id}`],
  [/^Similarity ([\d.]+) · rank (\d+) of (\d+) similar days$/, (_, s, r, n) => `相似度 ${s} · 在 ${n} 个相似天气日中排第 ${r}`],
  [/^(\d+) activity observations logged\. Tick = all-day average\.$/, (_, n) => `共记录 ${n} 次活动观测。刻度线 = 全部日期平均。`],
  [new RegExp(`^Set ${MON} (\\d+) as the selected day$`), (_, m, d) => `将 ${zhDate(m, d)}设为所选日期`],
  [/^· daily summary (\S+)$/, (_, d) => `· 每日摘要 ${d}`],
  [/^(\d+) of (\d+) days · (\d+) days? without a listed market$/, (_, a, b, c) => `${b} 天中有 ${a} 天 · ${c} 天没有上线市场`],
  [/^(\d+) days? without a max-temperature record · shown as “No observation available”$/, (_, n) => `${n} 天没有最高气温记录 · 显示为“没有可用实测”`],
  [/^(\d+) days? with no activity data · (\d+) of (\d+) activity cells missing \((\d+)%\)$/, (_, n, a, b, p) => `${n} 天没有活动数据 · ${b} 个活动格子中缺失 ${a} 个（${p}%）`],
];

function translateKey(key) {
  if (zh.has(key)) return zh.get(key);
  for (const [re, fn] of zhPatterns) if (re.test(key)) return key.replace(re, fn);
  return null;
}

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
    const value = translateKey(key);
    if (value != null) node.nodeValue = `${leading}${value}${trailing}`;
  });
}

function translateAttrs(language) {
  document.querySelectorAll('[aria-label], [title]').forEach((node) => {
    if (!originalAttrs.has(node)) originalAttrs.set(node, { aria: node.getAttribute('aria-label'), title: node.getAttribute('title') });
    const source = originalAttrs.get(node);
    if (source.aria != null) {
      const value = language === 'zh' ? (zh.get(source.aria) || source.aria) : source.aria;
      if (node.getAttribute('aria-label') !== value) node.setAttribute('aria-label', value);
    }
    if (source.title != null) {
      const value = language === 'zh' ? (zh.get(source.title) || source.title) : source.title;
      if (node.getAttribute('title') !== value) node.setAttribute('title', value);
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
