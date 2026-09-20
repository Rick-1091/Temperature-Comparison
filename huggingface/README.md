---
title: 温度对照
emoji: 🌡️
colorFrom: green
colorTo: red
sdk: static
app_file: index.html
short_description: NOAA 拉瓜迪亚实测气温与 Polymarket 真实历史价格对照
---

# 温度对照

纽约拉瓜迪亚机场 2026 年 8 月 17–28 日逐日最高气温可视化。NOAA NCEI 站点 `USW00014732` 的 `TMAX` 对照 Polymarket 同日最高气温市场 11 档 Yes-token 历史价格。价格取纽约当地日期 00:00 前最近可得报价，不代表下注人数。

NOAA 日最高与市场结算规则指定的逐小时来源可能不同；图中差值不能直接判断市场结算预测是否正确。热力图和面积图使用归一化价格占比。

本目录的 `index.html` 为自包含静态页面。将它与此 `README.md` 上传至 Hugging Face Static Space 根目录即可，无需构建命令。源数据和采集脚本见 [GitHub 仓库](https://github.com/Rick-1091/Temperature-Comparison)。

