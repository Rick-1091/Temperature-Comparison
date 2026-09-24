import { dayByDate, fmtDate, weatherById, activityById, GROUPS } from '../data.js';
import { subscribe, setState, resetFilters, isFiltered } from '../state.js';

export function initStatebar() {
  const chips = document.getElementById('state-chips');
  const reset = document.getElementById('btn-reset');
  reset.addEventListener('click', resetFilters);

  subscribe((s) => {
    const d = dayByDate[s.date];
    const parts = [
      `<span class="schip plain"><span class="k">Mexico City ·</span> <b>${d.isForecast ? 'Tomorrow, Sep 25' : fmtDate(d.date, { weekday: 'short', month: 'short', day: 'numeric' })}</b></span>`,
    ];
    if (s.weather !== 'all') parts.push(chip('Weather', weatherById[s.weather].label, 'weather'));
    if (s.group !== 'all') parts.push(chip('Activity', GROUPS.find((g) => g.id === s.group).label, 'group'));
    if (s.activity) parts.push(chip('Focus', activityById[s.activity].short, 'activity'));
    chips.innerHTML = parts.join('');
    reset.classList.toggle('idle', !isFiltered(s));
  });

  chips.addEventListener('click', (e) => {
    const k = e.target.closest('button')?.dataset.clear;
    if (!k) return;
    setState({ [k]: k === 'activity' ? null : 'all' });
  });

  // section highlight in nav
  const links = [...document.querySelectorAll('.secnav a')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main > section').forEach((s) => io.observe(s));
}

const chip = (k, v, key) => `<span class="schip"><span class="k">${k}</span><b>${v}</b><button type="button" data-clear="${key}" aria-label="Clear ${k}">×</button></span>`;
