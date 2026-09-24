import './fonts.js';
import './styles.css';
import './chapters.css';
import './site-i18n.js';

import { initStatebar } from './views/statebar.js';
import { initHero } from './views/hero.js';
import { initMap } from './views/map.js';
import { initIndustries } from './views/industries.js';
import { initNetwork } from './views/network.js';
import { initSimilar } from './views/similar.js';
import { initHedge } from './views/hedge.js';
import { initPanel } from './views/panel.js';
import { initEvidence } from './views/evidence.js';

initStatebar();
initHero();
initNetwork();
initSimilar();
initMap();
initIndustries();
initHedge();
initPanel();
initEvidence();
