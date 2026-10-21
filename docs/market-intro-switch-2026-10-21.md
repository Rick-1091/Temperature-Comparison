# 市场介绍同页切换

按用户要求，将天气期货与 Polymarket 定义放入同一紫色章节，原来的两个 section、图片、算例、来源折叠和历史报价图完整保留。顶部提供两档原生滑块和可点击标签，默认展示天气期货。横向过渡 260ms；系统减少动态效果时直接切换。

支持拖动、点击、左右方向键、Home/End、原有下一步链接和旧锚点。当前选择写入 URL hash，刷新复现；非活动内容 hidden/inert，键盘不会误入另一页。没有 JavaScript 时，两份原始介绍仍可连续阅读。切换只影响介绍区域，不改变研究区、历史探索或模拟。

涉及 index.html、src/market-intro-switch.js、src/journey-app.js、src/market-comparison.css。src/intro-market.js 在显示 Polymarket 后将窄屏报价图定位到最高价区间，保留历史报价。

实际验证：scripts/verify-market-switch.cjs 和 scripts/verify-market-reading.cjs 通过 1440px/390px × 中英文；覆盖鼠标拖动、标签点击、键盘切换、刷新恢复、旧下一步链接、11 个原始报价、图片比例、规则与来源、机制比较以及无横向溢出。无 JavaScript 备用通过。构建通过，已有 Three.js 大分包警告保留。未验证实体触屏设备；没有上传、合并或部署。

截图：.cache/decision-qa/market-switch/。
