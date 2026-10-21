# 图片与并列研究说明

## 后续修订：全文独立阅读

按用户最新反馈，下面记录的折叠与 iframe 实现已被替换。首页只保留两个并列研究摘要和“阅读全文”链接，点击在当前标签进入独立页面，浏览器返回可回到原来的语言与研究章节。相关 iframe 样式、加载模块和初始化已移除。

新增用户原稿 public/research-documents/polymarket-research.html，与 C:/Users/Nick/Downloads/weatherbridge_polymarket_research.html 逐字节一致；原天气对冲 HTML 也保持一致。原稿中的论文主张和表格未在本轮重新核查。文案检查仅对两个明确的用户原稿路径作例外，首页摘要仍受检查。

scripts/verify-research-pair.cjs 已更新并通过 1440px/390px × 中英文四组验证：无 iframe 或全文折叠；键盘直接跳转、浏览器返回、焦点可见、页面无横向溢出、原有 11 条历史报价保留。天气演示两份多头、350 点结算后显示 $3,500；Polymarket 示例买入价调至 $0.45 后显示 +$0.55 / −$0.45。原稿哈希校验、文案检查与生产构建通过。截图：.cache/decision-qa/research-links/。实体手机与论文原文未验证；未上传或部署。

2026-10-21。基于现有工作分支实现，保留其他本地修改；未上传、合并或部署。

## 交付

- Polymarket 的假设 Yes 合约例子加入用户提供的勾叉手机插图。桌面左右布局，手机图片在前，保留原始历史报价图。
- 原研究区改成两个平行栏目：天气指数衍生品的风险对冲与 Polymarket 的信息汇集。默认提供出处、研究范围和摘要，各有独立的原生 details 展开入口。
- 用户 HTML 逐字节保存为 public/research-documents/weather-risk-hedging-original.html。原文件 SHA256 与项目副本一致：4FC3A4CBA4E51DD9732FA941EDAEC842A7A7CEA0048A60982C4AE7D474CAB504。
- 展开天气研究后才加载原页面；iframe 使用隔离来源 sandbox，保留教学演示和单独阅读全文入口。英文界面明确标识原稿为中文。
- 原 Polymarket 完整说明保留在右侧展开内容中，包括论文链接、469 个样本的原有归因，以及财报样本与天气样本各自的用途。

## 证据边界

新研究摘要按用户提供的材料整理。尝试读取 DOI 10.1108/15265940911001411 的期刊页面未能取得全文，因此未独立核验附录 Table AI 的数值与页码。默认摘要不展示 92% 等数值，展开的中文原稿保留原文并在入口注明待原文复核。没有把模型对冲效率转写成企业利润或真实交易收益。

原稿作为用户提供的完整材料保留，文案检查只对这个明确路径作原稿例外；新写的网页摘要继续执行写作记忆与 Humanizer-zh 规则。

## 文件与验证

内容和样式：index.html、src/market-comparison.css、src/research-support.js、src/journey-app.js。

素材：public/polymarket-outcomes-illustration.png、public/research-documents/weather-risk-hedging-original.html。

检查：scripts/verify-research-pair.cjs；scripts/verify-product-copy.cjs 的原稿例外。

已通过中英文 1440px/390px 的图片加载、两栏/单列布局、默认收起、键盘展开、焦点可见、独立收起与原演示交互。原演示初值为额外支出 $500，改为两份多头、350 点结算后为 $3,500。原图与 HTML 的文件哈希均一致；生产构建通过。截图位于 .cache/decision-qa/research-pair/。

未完成：期刊全文数值复核、实体手机测试。原有 Three.js 大分包提示仍保留。
