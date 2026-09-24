# Weather / Signals

三章节的完整网站，每页顶部有统一的章节导航：

| 章节 | 路径 | 内容 |
|---|---|---|
| 01 Origin · Jinxi | `index.html` | 锦溪田野观察：项目缘起与证据边界 |
| 02 Signals vs outcomes · New York | `public/signals/` | 温度对照：NOAA 实测 × Polymarket 真实历史价格（下文） |
| 03 NomadCast · Mexico City | `nomadcast/index.html` | 面向数字游民的天气信号探索原型（活动数据为模拟数据） |

`jinxi/` 保留原始的独立锦溪页面及照片；第 01 章直接引用 `jinxi/assets/` 中的图片。

## 运行与部署

```bash
npm install
npm run dev      # http://localhost:5173/
npm run build    # 输出到 dist/
```

静态托管需要构建步骤：Render 的 Build Command 填 `npm ci && npm run build`，Publish Directory 填 `dist`。页面之间均为相对链接，可部署在子路径下。

第 02 章（`public/signals/`）是原生 HTML/JS，Vite 原样复制、不打包，也可单独直接打开 `public/signals/index.html`。

---

# 温度对照 / Temperature Comparison（第 02 章）

纽约拉瓜迪亚机场 2026 年 8 月 17–28 日每日最高气温：比较 NOAA 实测与 Polymarket 同日最高报价预测区间。网站采用可左右滑动的三页结构：研究原理页解释预测市场的信息聚合机制，简明版呈现每日最高报价区间与实际气温，专业版保留逐日对照、双线趋势、3D 双轨、热力图与堆叠面积图。

三个页面均可在中文与英文之间即时切换；语言选择会保存在浏览器中，图表提示、日期详情和预测分布面板也会同步切换。

第 02 章的全站章节导航也会跟随语言切换，确保从锦溪缘起、纽约数据对照到 NomadCast 的入口保持一致。

简明版借鉴论文图表常见的克制网格、直接标注与高对比数据编码，使用项目自身的原生 SVG 实现；未复制第三方仓库的图片素材。

## 数据

- NOAA NCEI Daily Summaries，站点 `USW00014732`（LaGuardia Airport），`TMAX`，华氏度。内置核验快照；页面加载时尝试从[官方接口](https://www.ncei.noaa.gov/access/services/data/v1?dataset=daily-summaries&stations=USW00014732&startDate=2026-08-17&endDate=2026-08-28&dataTypes=TMAX&units=standard&format=json)刷新。
- Polymarket 每日 NYC 最高温事件，每天 11 个 Yes-token 温度区间。使用官方 `polymarket-client` Python SDK 的 `get_event` 与 `list_price_history(as_of)`，查询纽约当地日期 00:00 前最近可得报价。原始区间、价格、报价 UTC 时间、market ID 与 token ID 见 [`public/signals/data/nyc-aug-2026.json`](public/signals/data/nyc-aug-2026.json)。每个日期的市场链接随页面选择更新。
- 主图默认显示最高报价区间；用户可在分布面板换选任何区间。热力图和面积图按固定 2°F 格网显示，并将当日 11 档价格之和归一化为 100%。极端的开放区间（“及以下”“及以上”）仅在这些图中映射至边缘格，准确范围见分布面板和数据文件。
- Yes 价格不是下注人数。报价时间在区间之间可能不同，价格总和也不必等于 100%。NOAA 每日 TMAX 与市场规则指定的逐小时结算来源可能不同，不能单凭页面差值评价市场结算准确率。

## 复现

重新采集数据：在项目的 Python 环境安装 `polymarket-client` 和 `httpx`，运行 `python scripts/fetch-nyc-history.py`。脚本只在 12 天 × 11 档全部成功且站点、日期、报价时间通过检查后，写入 `public/signals/data/nyc-aug-2026.json` 和 `public/signals/src/data.js`。静态单文件版本由 `node scripts/build-huggingface.mjs` 生成（会去掉仅在完整网站内有效的章节导航）。

Hugging Face Static Space：将 [`huggingface/index.html`](huggingface/index.html) 与 [`huggingface/README.md`](huggingface/README.md) 放在 Space 根目录；HTML 已内嵌 CSS、JS 和历史数据。
