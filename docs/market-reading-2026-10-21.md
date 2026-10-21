# 双市场介绍区：文字与排版验收

工作分支：`codex/market-definitions-20261021`，基于已合并的 `ccabd92`。本轮没有推送、部署或合并 main。

## 改动范围

- `index.html`：过渡 → 天气期货定义 → Polymarket 定义 → 机制比较 → 历史记录。定义章标题同级、共用阅读样式，每章一个例子和一个“规则与来源”。
- `src/intro-market.js`：保留原 11 档历史报价图，整理图前事件、事前价格、必要提示和结算／净结果示例；精确时间、方法、原市场与官方来源集中到单一入口。保留 C/F 显示与开放档标签。
- `src/intro-market.css`、`src/market-comparison.css`：共用字号与间距，去掉重复预览卡片；手机正文 18px、单列阅读，图表独立横向滚动并初次居中到最高报价档。
- `src/market-comparison.js`：四个比较维度保持不变，每边每格一句话；明确本例月度 CDD 与每日最高温不是相同变量，不比较预测准确率。
- `scripts/verify-market-reading.cjs`：本轮阅读路径／字数／布局／键盘／语言验证与截图；原 transition 验证入口复用它，intro 验证随新的来源入口更新。
- `DESIGN.md`：同步当前阅读层级与定义章标准。

没有修改原始数据、高级探索渲染器、章节配色文件或决策模拟模型。没有新增 CME 价格数据或行情图。

## 实际验证结果

已运行并通过：

1. `node --check src/intro-market.js`、`src/market-comparison.js`、`scripts/verify-market-reading.cjs`。
2. `node scripts/verify-market-data.mjs`：31 天 NWS、月累计 435 CDD、341 条事前报价；结算独立，未获许可的 CME 历史价格不进入展示。
3. `node scripts/verify-exploration.mjs`：开放档、完整分组、报价和守恒、原始来源、缺失值和原生单位归属。
4. `node node_modules/vite/bin/vite.js build`：616 个模块，构建成功。保留既有 Three.js 分包大于 500KB 的告警。
5. `scripts/run-restoration-ui.cjs scripts/verify-market-reading.cjs scripts/verify-intro-market.cjs scripts/verify-exploration-ui.cjs`：中英文、1440px／390px；intro 另含 320px。无页面脚本错误。

具体检查：

- 顺序、同级标题、相同字体／上下留白；标题不超过 18 个中文字、导语不超过 35 字。
- 默认解释：天气期货 154 字、Polymarket 133 字，不含标题、必要数据标签和收起的规则。
- 一章一个例子，一个收起的“规则与来源”；键盘 Enter 展开／收起、焦点可见、来源链接保留。
- CME：三行说明、冷库电费示例；没有新增 SVG 或 canvas；既有官方规则链接保留。
- Polymarket：11 档价格及来源与原始记录逐档一致；最高价 20°C／38.5 美分；假设成交后，$1 兑付减去买入成本为 61.5 美分，再扣费用；未中兑付 $0。
- “报价不保证成交”“市场隐含概率不是气象概率”“兑付不是净利润”在相关内容旁直接可见。
- 日期、地点、显示单位、报价时间、原始来源与结算记录保留；C/F 切换只改变显示。加载失败、刷新恢复和旧 introduction 路径通过。
- 四个机制比较标签均能使用，每格一句话；完整阅读链接能进入历史记录，435 CDD 保持原报告口径。
- 手机单列、正文不小于 18px、图表滚动限定在绘图区、默认显示最高报价附近；页面没有整体横向溢出。
- 五种高级探索仍可进入，覆盖两地、中英文、开放档、刷新状态、键盘和失败重试。
- 桌面及手机截图已人工查看；手机标题断行和初始图表位置已做一次针对性修正。

## 截图

目录：`.cache/decision-qa/market-reading/`

- `before-polymarket-1440-zh.png`、`before-polymarket-definition-390-zh.png`：修改前。
- `after-weather-futures-definition-1440-zh.png`、`after-weather-futures-definition-390-zh.png`：天气期货定义。
- `after-polymarket-definition-1440-zh.png`、`after-polymarket-definition-390-zh.png`：Polymarket 定义。
- 同目录保留英文版本及过渡、机制比较截图。

## 验证边界

- 线上 Render 页面读取超时，本轮以已合并代码的本地生产构建核验，没有验证线上最终显示，也没有部署。
- 手机截图为浏览器视口模拟，未做实体手机触控／GPU 测试。
- 官方来源链接及已保存原始记录沿用并保留；没有重新联网核查 CME 规则的最新修订，也没有接入行情。
- 本轮没有修改或重新走完 3D 庭院流程，未把之前的 3D 验证冒充本轮结果。
