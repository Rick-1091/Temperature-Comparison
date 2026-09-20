# 温度对照 / Temperature Comparison

纽约拉瓜迪亚机场 2026 年 8 月 17–28 日每日最高气温：比较 NOAA 实测与 Polymarket 同日最高报价预测区间。包含逐日对照、双线趋势、3D 双轨、热力图与堆叠面积图。

## 数据

- NOAA NCEI Daily Summaries，站点 `USW00014732`（LaGuardia Airport），`TMAX`，华氏度。内置核验快照；页面加载时尝试从[官方接口](https://www.ncei.noaa.gov/access/services/data/v1?dataset=daily-summaries&stations=USW00014732&startDate=2026-08-17&endDate=2026-08-28&dataTypes=TMAX&units=standard&format=json)刷新。
- Polymarket 每日 NYC 最高温事件，每天 11 个 Yes-token 温度区间。使用官方 `polymarket-client` Python SDK 的 `get_event` 与 `list_price_history(as_of)`，查询纽约当地日期 00:00 前最近可得报价。原始区间、价格、报价 UTC 时间、market ID 与 token ID 见 [`data/nyc-aug-2026.json`](data/nyc-aug-2026.json)。每个日期的市场链接随页面选择更新。
- 主图默认显示最高报价区间；用户可在分布面板换选任何区间。热力图和面积图按固定 2°F 格网显示，并将当日 11 档价格之和归一化为 100%。极端的开放区间（“及以下”“及以上”）仅在这些图中映射至边缘格，准确范围见分布面板和数据文件。
- Yes 价格不是下注人数。报价时间在区间之间可能不同，价格总和也不必等于 100%。NOAA 每日 TMAX 与市场规则指定的逐小时结算来源可能不同，不能单凭页面差值评价市场结算准确率。

## 运行与复现

静态托管直接发布仓库根目录（Render 的 Publish Directory 填 `.`）。也可直接打开 `index.html`。

重新采集数据：在项目的 Python 环境安装 `polymarket-client` 和 `httpx`，运行 `python scripts/fetch-nyc-history.py`。脚本只在 12 天 × 11 档全部成功且站点、日期、报价时间通过检查后，写入 JSON 和 `src/data.js`。静态单文件版本由 `node scripts/build-huggingface.mjs` 生成。

Hugging Face Static Space：将 [`huggingface/index.html`](huggingface/index.html) 与 [`huggingface/README.md`](huggingface/README.md) 放在 Space 根目录；HTML 已内嵌 CSS、JS 和历史数据。

