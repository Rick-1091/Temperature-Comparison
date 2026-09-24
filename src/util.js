const tt = () => document.getElementById('tooltip');

export function showTip(evt, html) {
  const el = tt();
  el.innerHTML = html;
  el.classList.add('on');
  moveTip(evt);
}
export function moveTip(evt) {
  const el = tt();
  const pad = 14;
  const w = el.offsetWidth, h = el.offsetHeight;
  let x = evt.clientX + pad, y = evt.clientY + pad;
  if (x + w > window.innerWidth - 8) x = evt.clientX - w - pad;
  if (y + h > window.innerHeight - 8) y = evt.clientY - h - pad;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
}
export function hideTip() { tt().classList.remove('on'); }

export const row = (k, v) => `<div class="tt-r"><span>${k}</span><span>${v}</span></div>`;
export const pct = (v) => `${Math.round(v * 100)}%`;
export const level = (v) => (v == null ? '—' : v < 0.35 ? 'Low' : v < 0.6 ? 'Med' : 'High');

export function el(tag, attrs = {}, html = '') {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => (k === 'class' ? (e.className = v) : e.setAttribute(k, v)));
  e.innerHTML = html;
  return e;
}
