import './fonts.js';
import './styles.css';
import './chapters.css';
import './storyline.css';
import './site-i18n.js';
import './decision-network.js';
import './hedging-network.js';

import { initHero } from './views/hero.js';
import { initMap } from './views/map.js';
import { initNetwork } from './views/network.js';
import { initPanel } from './views/panel.js';
import { setState, resetFilters } from './state.js';
import { WEATHER, CATEGORIES, categoryById, weatherById } from './data.js';
import * as d3 from 'd3';

// Keep one instance of every linked chart and its controls; expose the activity
// views in chapter 03's main story without replacing their data or identifiers.
const impactCharts = document.getElementById('impact-charts');
if (impactCharts) {
  ['s03', 's04'].forEach((id,index) => {
    const fold=document.createElement('details');fold.className='activity-fold';fold.id=`activity-fold-${index+1}`;
    const entry=document.querySelector(`.activity-steps a[href="#${fold.id}"]`);
    const summary=document.createElement('summary');summary.append(entry.querySelector('b'),entry.querySelector('span'));
    fold.append(summary,document.getElementById(id));entry.replaceWith(fold);
  });
  impactCharts.nextElementSibling.after(document.getElementById('business-report'));
  document.querySelectorAll('a[href="#activity-fold-1"],a[href="#activity-fold-2"],a[href="#s03"],a[href="#s04"]').forEach(link=>link.addEventListener('click',()=>{
    const target=document.querySelector(link.getAttribute('href'));
    const fold=target?.matches('details')?target:target?.closest('details');if(fold)fold.open=true;
  }));
  const controls = document.querySelector('.hero-controls');
  document.getElementById('impact-controls').append(controls);
  controls.append(document.getElementById('btn-reset'));
  // Shared overlays must remain available when the methods appendix is closed.
  ['panel', 'scrim', 'tooltip'].forEach((id) => document.body.append(document.getElementById(id)));
}

document.getElementById('btn-reset')?.addEventListener('click', resetFilters);
initHero();
initMap();
initNetwork();
initPanel();
document.getElementById('network-reset')?.addEventListener('click', () => {
  setState({ date: '2026-09-24', weather: 'all', group: 'all', activity: null, panelDate: null, hover: null, showAllSimilar: false });
});
// Open on a completed example day, not a dated mock labelled "tomorrow".
if (impactCharts) setState({ date: '2026-09-24' });

function applyChartPalette({primary,secondary,colors}) {
  WEATHER.forEach((weather,i)=>weather.color=colors[i%colors.length]);
  CATEGORIES.forEach((category,i)=>category.color=colors[i%colors.length]);
  setState({});
  d3.selectAll('#network .n-edge').attr('stroke',edge=>weatherById[edge.source].color);
  d3.selectAll('#network .n-node .mark').filter(d=>d.color).attr('fill',d=>d.color);
  d3.selectAll('#map .core').attr('fill',place=>categoryById[place.cat].color);
  d3.selectAll('#map .halo').attr('stroke',place=>categoryById[place.cat].color);
  d3.selectAll('#map .m-corridor').attr('stroke',categoryById.corridor.color);
  document.querySelectorAll('#f-weather [data-w]').forEach(button=>{const swatch=button.querySelector('.sw');if(swatch)swatch.style.background=weatherById[button.dataset.w].color;});
  document.querySelectorAll('#district-bars .track').forEach(track=>{track.children[0].style.background=primary;track.children[1].style.background=secondary;});
  document.querySelectorAll('#district-bars .dbar-key i').forEach((key,i)=>key.style.background=i?secondary:primary);
  document.documentElement.style.setProperty('--green',primary);
  document.documentElement.style.setProperty('--green-dark',d3.color(primary).darker(1.2).formatHex());
}
window.addEventListener('chart-palette-change',event=>applyChartPalette(event.detail));
if(window.weatherChartPalette)applyChartPalette(window.weatherChartPalette);
