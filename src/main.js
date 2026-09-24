import './fonts.js';
import './styles.css';
import './chapters.css';
import './site-i18n.js';

import { initStatebar } from './views/statebar.js';
import { initHero } from './views/hero.js';
import { initTimeline } from './views/timeline.js';
import { initAccuracy } from './views/accuracy.js';
import { initMap } from './views/map.js';
import { initNetwork } from './views/network.js';
import { initSimilar } from './views/similar.js';
import { initPanel } from './views/panel.js';
import { initEvidence } from './views/evidence.js';

initStatebar();
initHero();
initTimeline();
initAccuracy();
initMap();
initNetwork();
initSimilar();
initPanel();
initEvidence();
