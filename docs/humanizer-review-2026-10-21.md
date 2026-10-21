# Weatherbridge · Humanizer-zh 文案复核

日期：2026-10-21。工作分支保持 `codex/market-definitions-20261021`，保留此前未提交修改。本轮只处理文字、对应检查及审阅记录，未推送、合并或部署。

## 使用的方法

已完整读取 F:/soft/Codex/downloads/skills/humanizer-zh/SKILL.md，按其中“通读 → 编辑具体问题 → 核对事实与限定 → 复读”的流程处理。下载副本可在当前授权任务中直接阅读并使用；C 盘自动发现目录的安装仍待用户确认。

此次检查重点为重复说明、假对比、翻译腔、抽象拔高和同义堆叠。按用户偏好改为直接陈述，同时保留费用、数量、条件、模拟身份、来源与不确定性。标题、章节层级、锚点、链接目标、原始数据和经济模型保持原样。

## 处理范围

- 源文件检查覆盖 70 个 HTML/JS 文件，包括首页、研究、关于、方法、来源、高级探索、模拟、旧入口及公共页面脚本；跳过原始数据目录与图片素材。
- 项目意义说明：压缩重复目的与抽象修辞，解释读者实际可以比较什么。
- 庭院模拟：改写状态提示、合约说明与重复分号；保留每次 30 份、触发与未触发支付、成本不退、作物账目单独核算、完整收储仍有合约风险等事实。
- 历史对照与来源：明确样本时间、原始报价、订单及流动性、市场指定结算来源。
- 经营和关系图：合并同义重复，保持模拟指数与实际经营记录的区别。
- 补查 public/journey.js 与旧入口：上一轮较窄扫描未覆盖的地方同步改写。旧入口目前会跳转，但源码中的文字也一并处理。
- 对读法清楚的标签、金额、必要否定条件保持原样；不以禁词数量或“AI 检测分数”评价质量。

主要内容文件：index.html；src/business-map.js、decision-diorama.js、decision-network.js、hedging-network.js、simulation-reference.js、site-i18n.js、intro-market.js、jinxi-explorer.js；public/journey.js、signals/src/app.js、signals/src/sources.js、signals/methods/index.html；nomadcast 的三个 HTML 与 decide.js；huggingface/index.html。

## 验证与可复核产物

- 词法检查：`scripts/verify-product-copy.cjs`，扫描范围扩大至 70 个源文件。
- 构建：Vite 生产构建通过，保留已有 Three.js 分包体积警告。
- 数据与账目：81 个模拟组合、开放区间、TS/雨/毛毛雨/未知编码、435 CDD、原始档分组及报价和守恒均通过相应脚本验证。
- 新增 `scripts/verify-humanizer-review.cjs`：在 1440px、390px 中英文下访问首页、研究、关于、方法与来源页面，检查渲染文字、横向溢出和展开后的项目说明；强制 WebGL 失败后完成雨棚→暴雨合约→暴雨结果，净结果保持 −77.6。
- 双市场阅读顺序、11 档真实历史报价、C/F、来源表、加载失败与重试通过原有对应检查。
- 截图：`.cache/decision-qa/humanizer-review/` 的 purpose、network、contract-text 图片。
- 渲染文字清单：`.cache/decision-qa/humanizer-review/rendered-copy.json`，覆盖 20 次页面访问及 4 次文字模式结果。

没有把逐文件扫描等同于人工逐页审美认可。源文件全范围检查与实际渲染检查分别记录；未穷举全部日期、每一个悬停提示或全部旧页面交互分支，未在实体手机检查。此次没有新增外部事实核查，也没有声称网站全部语义问题已经消失。
