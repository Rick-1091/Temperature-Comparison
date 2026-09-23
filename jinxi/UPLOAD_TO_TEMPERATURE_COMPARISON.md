# Upload to Temperature-Comparison

1. In the GitHub repository, upload the whole `jinxi` folder to the repository root.
2. In the root `index.html`, replace the existing location picker line with:

```html
<div class="topbar-actions">
  <a class="source-link project-origin-link" href="jinxi/index.html">项目缘起：锦溪观察 ↗</a>
  <label class="location-picker"><span>地点</span><select id="location-select" aria-label="选择地点"><option value="laguardia">纽约 · 拉瓜迪亚机场</option></select></label>
</div>
```

3. Near the top of `src/styles.css`, add:

```css
.topbar-actions{display:flex;align-items:center;gap:20px}.project-origin-link{white-space:nowrap}
@media(max-width:640px){.topbar-actions{gap:8px}.project-origin-link{max-width:120px;font-size:.68rem;line-height:1.2}}
```

The `jinxi/assets/dried-aquatic-products.jpg` file is intentionally excluded because it contains a person in the background.
