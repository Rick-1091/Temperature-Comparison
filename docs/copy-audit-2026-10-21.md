# Weatherbridge 文案审计 · 2026-10-21

范围：首页、研究页、cases、src 与 public/signals 的 HTML/JS。排除原始数据及素材。首轮扫描发现 96 个候选片段，包含 HTML 属性与正文重复；初轮改写涉及 18 个内容文件。随后补查“不能代表”“并不意味着”“不仅是”等近似表达，最终涉及 19 个内容文件。该数量为片段数，独立句子需去重后另计。

## 本轮实际验证

- 文案检查遍历 56 个 HTML/JS 文件，中文模板匹配为零。
- 通过内存注入的失败用例，确认重新出现模板时检查会失败；测试未写入项目文件。
- 标准 `npm run build` 已接入文案检查。本轮分别实际运行检查脚本与 Vite 构建，均通过。
- 市场数据检查通过；决策账目检查覆盖三情景的 81 个组合，通过。
- 双市场阅读与历史报价测试通过：中英文、1440px/390px，历史报价另覆盖 320px、单位切换、失败备用与重试。
- 气象说明在中英文、1440px/390px 实际渲染检查通过；236 份报告、4 份含雨、0 份未知保持原值，无页面横向溢出。
- 本次没有逐页逐状态人工阅读全站英文；英文全文质量仍需按页面持续人工复核，词法检查覆盖中文模板，不能代替语义评审。没有上传、合并或部署。

截图：`.cache/decision-qa/market-reading/copy-review-network-{1440,390}-{zh,en}.png`；双市场截图位于同目录 `after-*`。

## 特征与改写方式

- 否定式定义：先排除错误理解，延后关键信息。改为全称、类别、作用。
- 连续边界声明：重复“不代表”“不等于”。改为单位、采样规则、来源及核查步骤。
- 抽象拔高：“真正重要的”“不是……而是……”。改为人物行为、眼前问题和计算结果。
- 重复免责声明：同一限制在图前图后反复出现。基础定义就近保留一次，详细依据放在统计方法与规则中。

写作方法使用 Impeccable clarify。没有调用名为 writing 的 skill；当前可用清单及本机文件名检索未找到它。完整长期规范在 F:/soft/Codex/workspace/_meta/WRITING_MEMORY.md。

必要语义保留：模拟身份、实际成交依赖订单与流动性、报价与气象概率需要分别验证、结算来源、费用、缺失值与因果解释条件。经济模型、原始报价和观测数据未修改。

## 修改前候选片段（供追溯）

1. `index.html:5` — pter"&gt;&lt;div class="spread"&gt;&lt;div&gt;&lt;h2&gt;&lt;span data-zh="不是每个地方，都有够精细的天气预报。" data-en="Not every community has the forecast it needs."&gt;不是每个地方，都有够精细的天气预报。&lt;/

2. `index.html:17` — aption" data-zh="经营模型示范 · 天气与活动数值均为模拟。地点边界为示意，小店位置不代表真实商户。" data-en="Model demonstration · Weather and activity values are simulated. Boundaries are

3. `index.html:17` — real merchants."&gt;经营模型示范 · 天气与活动数值均为模拟。地点边界为示意，小店位置不代表真实商户。&lt;/p&gt;

4. `index.html:21` — &lt;p class="caption" data-zh="活动指数越高，表示模型中的活动越活跃；它不是客流人数，也不是营业额。" data-en="A higher index means more activity in the model—not more measured visito

5. `index.html:21` — rs or revenue."&gt;活动指数越高，表示模型中的活动越活跃；它不是客流人数，也不是营业额。&lt;/p&gt;

6. `index.html:63` — lass="definition-copy" data-zh="按指数点报价，受天气预期和供需影响，不是事件概率。" data-en="Quoted in index points, influenced by weather expectations and trading supply a

7. `index.html:63` —  demand—not event probability."&gt;按指数点报价，受天气预期和供需影响，不是事件概率。&lt;/dd&gt;&lt;/div&gt;

8. `index.html:75` — DD = max(0,（日最高温 + 日最低温）÷ 2 − 65°F)，再累加整月。它衡量累计热度，不是一天的最高温；HDD 则累计低于基准的冷量。" data-en="For U.S. monthly CDD: daily CDD = max(0, (daily high + daily l

9. `index.html:75` — DD = max(0,（日最高温 + 日最低温）÷ 2 − 65°F)，再累加整月。它衡量累计热度，不是一天的最高温；HDD 则累计低于基准的冷量。&lt;/p&gt;

10. `index.html:77` — &lt;p data-zh="后面的 NWS 累计 CDD 是天气观测，不是 CME 期货行情或已核验的最终结算值。保留报告公布的每日取整口径；本站未接入经过核实并获公开展示许可的 CME 历史价格。" data-en="The NWS accumulated CD

11. `index.html:77` — rmission are not connected."&gt;后面的 NWS 累计 CDD 是天气观测，不是 CME 期货行情或已核验的最终结算值。保留报告公布的每日取整口径；本站未接入经过核实并获公开展示许可的 CME 历史价格。&lt;/p&gt;

12. `index.html:101` — &lt;p class="definition-copy" data-zh="按市场规则确认结果。兑付不是净利润，还须扣除实际买入成本与费用。" data-en="Resolve the outcome under the market's rules. Redemption is not ne

13. `index.html:101` — sts and fees must still be deducted."&gt;按市场规则确认结果。兑付不是净利润，还须扣除实际买入成本与费用。&lt;/p&gt;

14. `index.html:131` — &lt;p class="caption" data-zh="这里的晾晒收益、损失与合约支付均为模拟单位，不代表真实经营回报。现实中，优先参考当地正式预报与预警。" data-en="Drying benefits, losses and contract payouts are teaching u

15. `index.html:131` — al forecasts and warnings."&gt;这里的晾晒收益、损失与合约支付均为模拟单位，不代表真实经营回报。现实中，优先参考当地正式预报与预警。&lt;/p&gt;&lt;/section&gt;

16. `index.html:134` —           &lt;p data-zh="我们的目标不是让每个人都成为气象或预测市场专家，而是让更多人都能看懂这些信息，并把它用于自己的生活与决策。" data-en="Our goal is not to make everyone a meteorology or predict

17. `index.html:134` — nd use it in their own lives and decisions."&gt;我们的目标不是让每个人都成为气象或预测市场专家，而是让更多人都能看懂这些信息，并把它用于自己的生活与决策。&lt;/p&gt;

18. `index.html:155` —               &lt;p data-zh="这种设计并不是为了让用户学习复杂的气象学或金融知识，而是降低理解天气不确定性的门槛，让风险信息从专业数据转化为普通人能够阅读、比较和讨论的公共信息。" data-en="The design is not

19. `index.html:155` — inary people can read, compare and discuss."&gt;这种设计并不是为了让用户学习复杂的气象学或金融知识，而是降低理解天气不确定性的门槛，让风险信息从专业数据转化为普通人能够阅读、比较和讨论的公共信息。&lt;/p&gt;

20. `index.html:166` —               &lt;p data-zh="对依赖天气条件的活动来说，真正重要的并不只是知道一个“明天多少度”的数字，而是提前了解可能出现的天气范围以及判断本身有多大不确定性。例如，户外出行、食品晾晒、临水旅游和小型经营活动都可能根据天气变化调整时间、规模或准备方式。" dat

21. `index.html:166` — as weather conditions change."&gt;对依赖天气条件的活动来说，真正重要的并不只是知道一个“明天多少度”的数字，而是提前了解可能出现的天气范围以及判断本身有多大不确定性。例如，户外出行、食品晾晒、临水旅游和小型经营活动都可能根据天气变化调整时间、规模或准备方式。&lt;/p&gt;

22. `index.html:167` — ta-zh="通过将预测信号、分布和历史结果进行直观比较，本项目希望给用户留下更多提前调整的空间，而不是在天气发生后再被动应对。系统本身不替用户作决定，也不把 prediction market 当作官方预报的替代，而是提供一个额外的信息层，帮助用户更有依据地理解风险并安排下一步行动。" da

23. `index.html:167` — asis."&gt;通过将预测信号、分布和历史结果进行直观比较，本项目希望给用户留下更多提前调整的空间，而不是在天气发生后再被动应对。系统本身不替用户作决定，也不把 prediction market 当作官方预报的替代，而是提供一个额外的信息层，帮助用户更有依据地理解风险并安排下一步行动。&lt;/p&gt;

24. `src/business-map.js:59` — left).attr('y',chart.height-10).text(t('断线 = 数据缺失；不是客流或营业额。','Gaps = missing data; not visitor counts or revenue.'));

25. `src/chapter-three-i18n.js:72` — t a meteorological model.': '价格表达交易者的判断，受流动性与激励影响，并非气象模型。',

26. `src/chapter-three-i18n.js:106` —  weather forecast and can be thin or wrong': '市场概率不是官方天气预报，可能交易不足或判断错误。',

27. `src/chapter-three-i18n.js:110` —  market': '3天缺少站点记录、1天缺少市场记录、1天缺少活动数据；降雨概率为预报模型格式，不是市场概率。',

28. `src/decision-diorama.js:104` — ${replaying?`&lt;p class="replay-note"&gt;${t('已知天气复盘 · 不是预报','Known-weather replay · not a forecast')}&lt;/p&gt;`:''}`;

29. `src/decision-diorama.js:213` — join('；')}。&lt;/p&gt;&lt;p class="decision-small"&gt;${t('平均结果不是单次保证。查看信号不会改变天气或收支；报价对应抽样概率是教学设定，不能证明真实市场的预测能力。','Averages are not guarantees for a single roun

30. `src/decision-network.js:7` — tail: text('能够获得当地的官方或常规预报时，先查看这些正式信息。市场判断可以补充阅读，但不是必需步骤。', 'When reliable local official or conventional forecasts are accessible, start with them

31. `src/decision-network.js:19` — 温度区间价格最高、价格分布有多集中，以及历史判断与实测差多少。这是参与者基于不同信息形成的集体判断，不是保证准确的预报。', 'With internet access and a market for the relevant location and date, read the high

32. `src/decision-network.js:20` —  text('迭戈可查看覆盖墨西哥城和目标日期的温度市场，辅助冷热饮备货。本站真实数据案例来自纽约，不是帕蒂奥咖啡馆的预报。', 'Diego could consult a temperature market covering Mexico City and her target date

33. `src/decision-network.js:25` — 息可能增加安排失误的风险：粮食晾晒遇雨、游客减少却未调整备货，或生产时间与天气不合。这些是可能情景，不是已测得的经营损失。', 'Limited information may increase the risk of poorly timed decisions: rain during d

34. `src/decision-network.js:27` — djust plans with uncertainty'), brief: text('大致判断，不是确定答案', 'Approximate judgment, not certainty'),

35. `src/decision-network.js:47` — 家庭可能动用原本留给下季种子、肥料或运输的钱；投入不足又可能影响下一季生产。这是一条条件性的风险链，并非托科家的实际记录。','If damaged grain reduces sale income, the family might use money reserved for seeds

36. `src/decision-network.js:159` — ion-footnote';foot.textContent=t(text('情景路径展示可能影响，不是实测损失或确定因果。','Scenario paths illustrate possible consequences, not measured losses or establishe

37. `src/hedging-network.js:7` —  shop'),copy('报道中的店主希望把冷天的经营风险与冷天合约联系起来。下方比较为机制示意，不是店铺的实测收支。','The reported owner seeks to connect cold-weather business risk with cold-weather con

38. `src/hedging-network.js:8` —  fall'),copy('偏冷天气可能减少冰淇淋需求，但客流也受节假日、地点等因素影响，天气与销售并非一一对应。','Colder weather may reduce ice-cream demand, but holidays, location and other factors al

39. `src/hedging-network.js:16` — '若损失持续且储备不足，店主可能缩减下一批采购、推迟设备维护，或更难支付租金与工资。这是条件性影响，不是报道确认的后果。','If losses persist and reserves are insufficient, the owner may cut restocking, postp

40. `src/hedging-network.js:17` — opy('可能抵消部分损失','Possible partial offset'),copy('兑付不是经营收入','Payout is not sales revenue'),copy('实际总结果取决于经营收入、经营成本、合约兑付、购买成本与费用。兑付金额未必覆盖经营损失，对冲也不能让客人

41. `src/hedging-network.js:19` — tch, insufficient size or no payout'),copy('店铺觉得冷，不代表合约指定天气站满足冷天阈值；规模不足、费用、流动性或天气与销售关系不稳定，都可能让对冲无法充分覆盖风险。','A cold-feeling shop does not imply the s

42. `src/hedging-network.js:68` — 'decision-footnote';note.textContent=t(copy('机制示意，不是投资建议或实测收益。','Mechanism illustration, not investment advice or observed returns.'));root.append(

43. `src/intro-market.js:39` — o-price-meaning definition-copy"&gt;'+text('价格反映市场判断，不是投票人数。显示报价不保证成交；市场隐含概率不等于经校准的气象概率。','Prices express market beliefs, not vote counts. A displayed

44. `src/intro-market.js:58` — MX 温度记录结算，缺失时按规则使用 Weather Underground。结算区间与独立气象观测不是同一条记录。完整规则及其他情况见原市场。','This event specifies NOAA MMMX temperatures for resolution, with Weather

45. `src/jinxi-explorer.js:3` — ying, covering and storage.'],note:['实拍：熏豆与干制食品陈列；不是一次晾晒损失调查。','Field photograph: smoked beans and dried foods on display—not a drying-loss survey.

46. `src/jinxi-explorer.js:4` —  is rain protection needed?'],note:['实拍：博物馆制作工序展示；不是当前工厂生产记录。','Field photograph: a museum process display—not a record of current factory producti

47. `src/jinxi-explorer.js:5` — r and seating ahead of time.'],note:['实拍：临水咖啡空间；照片不代表客流或营业额数据。','Field photograph: a waterside café—not visitor or revenue data.']}

48. `src/market-comparison.js:66` —         t('指数点报价，不是事件发生概率。','A quote in index points, not an event probability.'),

49. `src/market-comparison.js:96` —  CDD')}&lt;/h3&gt;&lt;p class="chart-status"&gt;${t('用于解释天气指数；不是 CME 行情或最终结算值。','Explains the weather index; not CME prices or a final settlement value.')}&lt;/p&gt;

50. `src/market-comparison.js:231` —       &lt;p&gt;${t('同一机场不代表同一结算数据。CME 使用 Speedwell 处理的指数；本月 Polymarket 事件指定 Weather Underground。累计 CDD、日最高温和市场价格分别保留各自单位，不

51. `src/simulation-reference.js:21` — ,'Preparing the maize')}&lt;/h3&gt;&lt;p&gt;${t('少晒价值指放弃的晾晒机会，不是小时数或另付的现金。表中金额均为模拟单位。','Drying forgone is lost value, not hours of work. All amounts below are

52. `src/simulation-reference.js:23` — p&gt;&lt;p&gt;${t('买入成本 = 30 × 每份报价。揭晓前可改选，最终只计所选合约；这是模拟操作，不代表真实交易可退款。','Cost = 30 × unit price. Before the reveal you may change the selection; only the fin

53. `src/site-i18n.js:61` —  a clearer picture?': '锦溪的水乡旅游、食品加工与传统手工业让我们看到：天气并不是抽象的数据，它可能进入游客出行、生产安排、晾晒储存和经营决策。由此，我们开始关注一个更普遍的问题——普通人如何理解不同来源的天气预测，并将不确定的信息转化为更直观的判断？',

54. `src/site-i18n.js:93` — current business.': '造船知识连接了工具、技能劳动与水乡环境。它提供历史背景，但不代表当前仍有相关经营活动。',

55. `src/site-i18n.js:139` — tations, not guaranteed forecasts.': '市场概率表达的是预期，并不是保证实现的天气预报。',

56. `src/site-i18n.js:161` — ility is not an official weather forecast.': '市场概率不是官方天气预报。',

57. `src/site-i18n.js:162` —   'Association does not imply causation.': '相关关系不代表因果关系。',

58. `src/views/map.js:240` —     '&lt;span class="caveat"&gt;这只是对（模拟）活动记录的描述，不代表哪个地点更好，也不解释原因。&lt;/span&gt;';

59. `src/weather-network.js:83` — reateElement('p');note.textContent=t(['这里统计的是报告份数，不是降雨小时数或降水量；报告未出现降雨编码，不代表当时一定无雨。','These are report counts, not rainy hours or rainfall amounts.

60. `src/weather-network.js:86` — 一对要素的相关系数时，只使用两项都有数值的报告；仅显示 |r| ≥ 0.3 的连线。短期样本中的相关不代表因果，部分关系可能来自共同的昼夜变化。','Each report is one sample; reports are not deduplicated by hour. Each cor

61. `research/index.html:1` — 要求&lt;/h3&gt;&lt;p data-zh="每天至少 20 条报告，并覆盖至少 20 个不同的本地小时。它不是官方日最高温产品，也不是自动认定的市场结算值。" data-en="At least 20 reports spanning 20 distinct local hours per day.

62. `research/index.html:1` — settlement value."&gt;每天至少 20 条报告，并覆盖至少 20 个不同的本地小时。它不是官方日最高温产品，也不是自动认定的市场结算值。&lt;/p&gt;&lt;/div&gt;&lt;/div&gt;&lt;h2&gt;&lt;span data-zh="逐日核对" data-en="Check a specific day"&gt;

63. `research/index.html:1` — ry&gt;&lt;p data-zh="锦溪照片来自团队实地观察。Thoko 与 Diego 为虚构角色；插画不是纪实照片。庭院练习采用独立的简化随机天气，不调用实时马拉维天气，也不计算食品安全、产量或经济损失。" data-en="Jinxi photographs document team fie

64. `research/index.html:1` — ncial losses."&gt;锦溪照片来自团队实地观察。Thoko 与 Diego 为虚构角色；插画不是纪实照片。庭院练习采用独立的简化随机天气，不调用实时马拉维天气，也不计算食品安全、产量或经济损失。&lt;/p&gt;&lt;/details&gt;&lt;details&gt;&lt;summary&gt;&lt;span data-zh=

65. `research/index.html:1` — ging risk"&gt;关于风险对冲&lt;/span&gt;&lt;/summary&gt;&lt;p data-zh="市场合约不等于对生活损失的保险。地点、日期、天气变量与结算规则必须匹配，还需考虑可参与性、流动性、费用和基差风险。本项目不提供投资建议或获利保证。" data-en="Market contracts a

66. `research/index.html:1` — er investment advice nor a profit guarantee."&gt;市场合约不等于对生活损失的保险。地点、日期、天气变量与结算规则必须匹配，还需考虑可参与性、流动性、费用和基差风险。本项目不提供投资建议或获利保证。&lt;/p&gt;&lt;/details&gt;&lt;a href="/#evid

67. `research/index.html:5` — "&gt;&lt;span data-zh="经营模型示范 · 天气与活动数值均为模拟。地点边界为示意，小店位置不代表真实商户。" data-en="Model demonstration · Weather and activity values are simulated. Boundaries are

68. `research/index.html:5` — real merchants."&gt;经营模型示范 · 天气与活动数值均为模拟。地点边界为示意，小店位置不代表真实商户。&lt;/span&gt;&lt;/p&gt;&lt;div class="business-controls"&gt;&lt;label&gt;&lt;span data-zh="查看日期" data-en="Explore a d

69. `research/index.html:5` — lass="caption"&gt;&lt;span data-zh="活动指数越高，表示模型中的活动越活跃；它不是客流人数，也不是营业额。" data-en="A higher index means more activity in the model—not more measured visito

70. `research/index.html:5` — rs or revenue."&gt;活动指数越高，表示模型中的活动越活跃；它不是客流人数，也不是营业额。&lt;/span&gt;&lt;/p&gt;&lt;/div&gt;&lt;div class="weather-context"&gt;&lt;h3&gt;&lt;span data-zh="天气要素之间，有什么关系？" data-en="Ho

71. `research/index.html:5` — zh="线越粗，两者一起变化得越明显。数值直接从机场逐时报告计算，用这里的地点选项比较两座城市。相关不等于因果：很多关系同时受昼夜变化影响，样本也只有约十天。" data-en="Thicker lines mean the two change together more strongly.

72. `research/index.html:5` — s."&gt;线越粗，两者一起变化得越明显。数值直接从机场逐时报告计算，用这里的地点选项比较两座城市。相关不等于因果：很多关系同时受昼夜变化影响，样本也只有约十天。&lt;/p&gt;&lt;/div&gt;&lt;/section&gt;

73. `research/index.html:6` — 闻和自己掌握的信息买卖合约。交易涉及真实盈亏，让他们有动力认真判断；不同人的信息也有机会汇进价格，而不是简单按人数投票。" data-en="Participants buy and sell contracts using forecasts, news and information th

74. `research/index.html:6` — 闻和自己掌握的信息买卖合约。交易涉及真实盈亏，让他们有动力认真判断；不同人的信息也有机会汇进价格，而不是简单按人数投票。&lt;/span&gt;&lt;/p&gt;&lt;p&gt;&lt;span data-zh="新消息出现后，交易和价格可以随之变化。我们因此能看到：市场更看好哪个温度区间、不同判断有多分散，以及这些判断怎样随时

75. `research/index.html:6` — &gt;&lt;/a&gt;&lt;p class="caption"&gt;&lt;span data-zh="这是财报领域的预印本，不是天气研究；不能据此证明天气预测可靠。" data-en="This is an earnings preprint, not a weather study; it does not est

76. `research/index.html:6` — ablish weather-forecast reliability."&gt;这是财报领域的预印本，不是天气研究；不能据此证明天气预测可靠。&lt;/span&gt;&lt;/p&gt;&lt;/div&gt;&lt;/div&gt;&lt;/section&gt;

77. `public/signals/methods/index.html:4` — n&gt;&lt;/li&gt;&lt;li&gt;&lt;span data-zh="区间归属：取整后的观测是否落在最高报价区间内；这不是合约结算判定。" data-en="Interval membership checks whether the rounded observation lies inside the hi

78. `public/signals/methods/index.html:4` — ine contract settlement."&gt;区间归属：取整后的观测是否落在最高报价区间内；这不是合约结算判定。&lt;/span&gt;&lt;/li&gt;&lt;li&gt;&lt;span data-zh="“≥26°C”保留没有上限的含义。五种视图均保留区间含义，不将开放区间转换成中点或精确预测温度。热力图合并完整原始

79. `public/signals/methods/index.html:4` — 档，显示组内 Yes 报价和；面积图显示组内报价和除以当日报价总和的相对权重，按日阶梯呈现，不代表真实概率。" data-en="“≥26°C” has no upper bound. All five views retain interval meaning, without mid

80. `public/signals/methods/index.html:4` — 完整原始档，显示组内 Yes 报价和；面积图显示组内报价和除以当日报价总和的相对权重，按日阶梯呈现，不代表真实概率。&lt;/span&gt;&lt;/li&gt;&lt;li&gt;&lt;span data-zh="切换显示单位不改变命中结果。两地原始区间宽度不同，不能直接按命中率排名。" data-en="Changing dis

81. `public/signals/src/app.js:16` — reUnit}&lang=zh"&gt;← 先从一天下手：历史对照与逐日来源&lt;/a&gt; · 这里是扩展视图，不是实时天气预报。`, `&lt;a href="guide.html?location=${isMexico?'mexico':'laguardia'}&day=${series[state.sel

82. `public/signals/src/app.js:43` — 采用当地日 METAR 统计；命中判定按市场原始单位的整数度精度进行，与显示单位无关。短期样本覆盖率不是结算胜率或整体预测能力；两地原始区间宽度不同，不宜直接比较命中率高低。';

83. `public/signals/src/app.js:126` — 在哪个区间？”参与者根据预报、新闻和自己的判断买卖合约，价格随供需变化，形成一个可观察的集体预期。它不是气象机构。",

84. `public/signals/src/app.js:128` — 付 1 美元，错误结果为 0。因此，0.60 美元通常读作约 60% 的市场隐含概率。这是价格信号，不是六成人投票赞成；它也会受流动性和交易行为影响。",

85. `public/signals/src/app.js:129` — 温度结果，展示其价格判断随时间怎样变化。截图中的 28°C · 75% 表示该结果当时更受市场看好，不代表最后一定出现。右侧选中的是“22°C 或以下”，2¢ 属于这个选项。各选项报价可能不同时更新、合计也未必恰好为 100%，不能直接当作人数比例。",

86. `public/signals/src/app.js:130` — tle: "三、Weatherbridge 帮你读什么？", useCopy: "我们不要求你交易，而是把价格整理为温度范围、判断分散程度和历史实测对照。先看市场倾向什么，再看分歧有多大，最后看过去接近实际吗。每个市场须核对地点、日期、最高温或最低温、观测站与结算规则；价格集中也不等于一定准确

87. `public/signals/src/app.js:132` — ding: "读图顺序：看预测的温度范围 → 看判断是否分散 → 看过去接近实际吗。百分比来自价格，不是人数占比。",

88. `public/signals/src/app.js:133` —     basicsCase: "当前展示纽约 2026 年 8 月的历史案例，不是锦溪或非洲地区明天的天气预报。查看信息无需交易。",

89. `public/signals/src/app.js:139` —     flowNote: "&lt;strong&gt;价格不是简单投票。&lt;/strong&gt; 不同交易者带来不同的信息、信心和资金。",

90. `public/signals/src/app.js:148` —  bridgeTitle: "从企业收益到天气", bridgeOne: "论文研究的是企业收益，而不是天气；它并不能证明 Polymarket 的天气预测准确。",

91. `public/signals/src/app.js:155` —     simpleFooter: "Yes 价格代表市场价格，不代表人数。NOAA 日最高与市场结算来源可能存在口径差异。", professionalCta: "向右查看专业版 &lt;span aria-hidden=\"true\"&gt;→&lt;/span&gt;",

92. `public/signals/src/app.js:253` — total; not weather probability.":"组内报价和 ÷ 当日全部报价和，不是天气概率。"):interactionHints[language][state.view];

93. `public/signals/src/mexico-observations.js:14` — reUnit}&lang=zh"&gt;← 先从一天下手：历史对照与逐日来源&lt;/a&gt; · 这里是扩展视图，不是实时天气预报。`, `&lt;a href="guide.html?location=${isMexico?'mexico':'laguardia'}&day=${series[state.sel

94. `public/signals/src/mexico-observations.js:41` — 采用当地日 METAR 统计；命中判定按市场原始单位的整数度精度进行，与显示单位无关。短期样本覆盖率不是结算胜率或整体预测能力；两地原始区间宽度不同，不宜直接比较命中率高低。';

95. `public/signals/src/sources.js:46` — 格命中：观测温度落在市场最看好的区间内。宽松命中：再计入相邻的上下各一档。两种命中率均由本项目计算，并非 NOAA 或 Polymarket 发布的指标。');

96. `public/signals/src/sources.js:59` —     : '仅保留至少 20 条记录、覆盖 20 个不同小时的日期。归档保存每日汇总结果，并非完整原始报文。');
