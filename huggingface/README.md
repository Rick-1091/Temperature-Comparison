---
title: 温度对照
emoji: 🌡️
colorFrom: green
colorTo: orange
sdk: static
app_file: index.html
short_description: 对照纽约中央公园的 NOAA 实测气温与示例市场预测
---

# 温度对照

纽约中央公园 2026 年 8 月 17–28 日逐日最高气温可视化。实际气温来自 NOAA NCEI Central Park 站 `USW00094728` 的 `TMAX`；市场温度区间与占比**仍为示例数据**，不是 Polymarket 历史价格或押注人数，不可据此评价真实预测准确率。

## 部署

将本目录中的 `README.md` 和 `index.html` 放在 Hugging Face Space 仓库根目录。Space 类型选择 **Static**；无需构建命令、Python 或额外依赖。`index.html` 已内嵌网站的 CSS 与 JavaScript。

页面内置已核验的 NOAA 实测快照，加载时尝试从 NOAA 接口刷新；若请求不可用，仍会显示快照。市场链接仅对应 2026 年 8 月 24 日，不覆盖图中全部日期。

若修改原项目中的 `index.html`、`src/styles.css` 或 `src/app.js`，在项目根目录运行 `node scripts/build-huggingface.mjs`，然后重新上传生成的 `huggingface/index.html`。

