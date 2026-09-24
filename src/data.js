// NomadCast prototype dataset.
// All values are deterministic mock data (seeded) shaped like the real sources:
// Polymarket daily max-temperature markets, a settlement weather station, and
// an activity-observation log. Nothing here is real observation.

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(301);
const randn = () => {
  let u = 0;
  while (!u) u = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const round2 = (v) => Math.round(v * 100) / 100;

// Settlement is in whole °C, so the "26–27°C" range covers readings of 26 and 27.
export const BINS = [
  { id: 'b21', label: '≤21°C', lo: 19.5, hi: 21.5, mid: 21 },
  { id: 'b22', label: '22–23°C', lo: 21.5, hi: 23.5, mid: 22.5 },
  { id: 'b24', label: '24–25°C', lo: 23.5, hi: 25.5, mid: 24.5 },
  { id: 'b26', label: '26–27°C', lo: 25.5, hi: 27.5, mid: 26.5 },
  { id: 'b28', label: '28–29°C', lo: 27.5, hi: 29.5, mid: 28.5 },
  { id: 'b30', label: '30°C+', lo: 29.5, hi: 31.5, mid: 30.5 },
];

export const WEATHER = [
  { id: 'sunny', label: 'Sunny', color: '#C99A3A', rule: '< 0.5 mm precipitation and mostly clear sky' },
  { id: 'rainy', label: 'Rainy', color: '#4F7A9A', rule: '≥ 2 mm observed precipitation' },
  { id: 'hot', label: 'Hot', color: '#C9713F', rule: 'observed max ≥ 27°C' },
  { id: 'cool', label: 'Cool', color: '#7FA3BF', rule: 'observed max ≤ 23°C' },
  { id: 'windy', label: 'Windy', color: '#8A9486', rule: 'max sustained wind ≥ 22 km/h' },
];
export const weatherById = Object.fromEntries(WEATHER.map((w) => [w.id, w]));

export const ACTIVITIES = [
  { id: 'cafe', label: 'Outdoor café', short: 'Outdoor café', group: 'work', indoor: false, category: 'cafe' },
  { id: 'cowork', label: 'Indoor coworking', short: 'Coworking', group: 'work', indoor: true, category: 'cowork' },
  { id: 'walk', label: 'Walking', short: 'Walking', group: 'mobility', indoor: false, category: 'corridor' },
  { id: 'cycle', label: 'Cycling', short: 'Cycling', group: 'mobility', indoor: false, category: 'corridor' },
  { id: 'park', label: 'Park', short: 'Park', group: 'leisure', indoor: false, category: 'park' },
  { id: 'museum', label: 'Museum / indoor leisure', short: 'Indoor leisure', group: 'leisure', indoor: true, category: 'cultural' },
];
export const activityById = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]));

export const GROUPS = [
  { id: 'work', label: 'Work' },
  { id: 'mobility', label: 'Mobility' },
  { id: 'leisure', label: 'Leisure' },
];

// ---------- helpers ----------
function erf(x) {
  const s = Math.sign(x); x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
}
const ncdf = (x, mu, sd) => 0.5 * (1 + erf((x - mu) / (sd * Math.SQRT2)));

function roundTo100(ps) {
  const raw = ps.map((p) => p * 100);
  const fl = raw.map(Math.floor);
  let rem = 100 - fl.reduce((a, b) => a + b, 0);
  raw.map((v, i) => [v - fl[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (rem > 0) { fl[i]++; rem--; } });
  return fl;
}

function marketDist(mu, sd) {
  const ps = BINS.map((b, i) => {
    const lo = i === 0 ? -Infinity : b.lo;
    const hi = i === BINS.length - 1 ? Infinity : b.hi;
    return ncdf(hi, mu, sd) - ncdf(lo, mu, sd);
  });
  return roundTo100(ps);
}

export const fmtDate = (iso, opts = { month: 'short', day: 'numeric' }) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC', ...opts });

// ---------- generate days ----------
const MISSING_ACTUAL = new Set([9, 33, 47]);
const MISSING_MARKET = new Set([26]);
const MISSING_ACTIVITY_DAY = new Set([40]);

const days = [];
const start = Date.UTC(2026, 7, 1);
for (let i = 0; i < 55; i++) {
  const d = new Date(start + i * 864e5);
  const iso = d.toISOString().slice(0, 10);
  const dow = d.getUTCDay();
  const weekend = dow === 0 || dow === 6;

  const rainProb = round2(clamp(0.55 + 0.24 * randn(), 0.08, 0.95));
  let precip = 0;
  if (rng() < rainProb * 0.95) precip = Math.round(Math.max(0.2, -Math.log(rng()) * 7) * 10) / 10;
  const wind = Math.round(clamp(12 + 5 * randn() + (rng() < 0.18 ? 10 : 0), 4, 38));
  const r = Math.min(precip / 6, 1);
  const trueT = Math.round(clamp(25.4 + 1.3 * Math.sin(i / 8) - 2.4 * r + 1.4 * randn(), 20, 31));
  const clear = rng() < 0.75;

  const mu = trueT + 1.05 * randn();
  const sd = 0.8 + 0.7 * rng();
  const market = MISSING_MARKET.has(i) ? null : marketDist(mu, sd);

  const actual = MISSING_ACTUAL.has(i) ? null : trueT;
  const tags = [];
  if (precip < 0.5 && clear) tags.push('sunny');
  if (precip >= 2) tags.push('rainy');
  if (actual != null && actual >= 27) tags.push('hot');
  if (actual != null && actual <= 23) tags.push('cool');
  if (wind >= 22) tags.push('windy');

  const s = tags.includes('sunny') ? 1 : 0;
  const h = trueT >= 27 ? 1 : 0;
  const c = trueT <= 23 ? 1 : 0;
  const w = wind >= 22 ? 1 : 0;
  const we = weekend ? 1 : 0;
  const base = {
    cafe: 0.48 + 0.22 * s - 0.26 * r - 0.2 * h + 0.06 * we,
    cowork: 0.46 + 0.24 * r + 0.16 * h - 0.08 * s + 0.08 * (1 - we) - 0.14 * we,
    walk: 0.48 + 0.18 * s - 0.26 * r - 0.22 * h + 0.1 * c + 0.06 * we,
    cycle: 0.46 + 0.16 * s - 0.28 * r - 0.18 * w - 0.2 * h + 0.08 * we,
    park: 0.4 + 0.26 * s - 0.28 * r - 0.24 * h + 0.12 * we,
    museum: 0.34 + 0.24 * r + 0.14 * h - 0.08 * s + 0.12 * we,
  };
  let activity = null;
  if (!MISSING_ACTIVITY_DAY.has(i)) {
    activity = {};
    for (const a of ACTIVITIES) {
      activity[a.id] = rng() < 0.05 ? null : round2(clamp(base[a.id] + 0.06 * randn(), 0.03, 0.97));
    }
  }

  days.push({
    i, date: iso, dow, weekend, isForecast: false,
    rainProb, precip, wind, actual, tags, market,
    marketId: market ? `PM-MEXC-TMAX-${iso.replaceAll('-', '')}` : null,
    activity,
    obsCount: activity ? 18 + Math.round(rng() * 40) : 0,
  });
}

// Tomorrow: market is open, nothing observed yet.
export const TOMORROW_ISO = '2026-09-25';
days.push({
  i: 55, date: TOMORROW_ISO, dow: 5, weekend: false, isForecast: true,
  rainProb: 0.72, precip: null, wind: null, actual: null,
  tags: [], expectedTags: ['rainy'],
  market: [0, 0, 18, 52, 23, 7],
  marketId: 'PM-MEXC-TMAX-20260925',
  activity: null, obsCount: 0,
});

export const DAYS = days;
export const HISTORICAL = days.filter((d) => !d.isForecast);
export const dayByDate = Object.fromEntries(days.map((d) => [d.date, d]));

// ---------- derived ----------
export const modeBin = (d) => (d.market ? d.market.indexOf(Math.max(...d.market)) : -1);
export const expectedTemp = (d) => (d.market ? d.market.reduce((s, p, i) => s + (p / 100) * BINS[i].mid, 0) : null);
export const binOfTemp = (t) => (t == null ? -1 : BINS.findIndex((b) => t >= b.lo && t < b.hi));
export const wetness = (p) => (p == null ? null : p >= 2 ? 1 : p >= 0.5 ? 0.5 : 0);

export function matchesWeather(d, w) {
  if (!w || w === 'all') return true;
  return d.tags.includes(w) || (d.expectedTags || []).includes(w);
}

export function activityMeans(dayList) {
  const out = {};
  for (const a of ACTIVITIES) {
    const vals = dayList.map((d) => d.activity?.[a.id]).filter((v) => v != null);
    out[a.id] = { mean: vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : null, n: vals.length, of: dayList.length };
  }
  return out;
}
export const BASELINE = activityMeans(HISTORICAL);

// Observed association: mean activity on days tagged w, relative to all days.
export function associations() {
  const edges = [];
  const counts = {};
  for (const w of WEATHER) {
    const sub = HISTORICAL.filter((d) => d.tags.includes(w.id));
    counts[w.id] = sub.length;
    const m = activityMeans(sub);
    for (const a of ACTIVITIES) {
      const b = BASELINE[a.id].mean;
      if (m[a.id].mean == null || !b) continue;
      edges.push({ source: w.id, target: a.id, mean: m[a.id].mean, base: b, lift: m[a.id].mean / b, n: m[a.id].n });
    }
  }
  return { edges, counts };
}

export function similarityTarget(d) {
  return {
    T: d.actual != null ? d.actual : expectedTemp(d),
    R: d.isForecast || d.precip == null ? d.rainProb : wetness(d.precip),
    tempSource: d.actual != null ? 'observed' : 'market-implied',
    rainSource: d.isForecast || d.precip == null ? 'forecast probability' : 'observed',
  };
}

export function findSimilar(target, k, weather) {
  const t = similarityTarget(target);
  const excluded = [];
  const pool = HISTORICAL.filter((d) => {
    if (d.date === target.date) return false;
    if (d.actual == null) { excluded.push(d); return false; }
    return matchesWeather(d, weather);
  });
  const scored = pool.map((d) => {
    const dist = Math.sqrt(((d.actual - t.T) / 2) ** 2 + ((wetness(d.precip) - t.R) / 0.5) ** 2);
    return { day: d, dist, sim: 1 / (1 + dist) };
  }).sort((a, b) => a.dist - b.dist);
  return { target: t, results: scored.slice(0, k), poolSize: pool.length, excluded };
}

export function completeness(d) {
  const fields = [
    { key: 'Market probabilities', ok: !!d.market },
    { key: 'Observed max temp', ok: d.actual != null },
    { key: 'Precipitation', ok: d.precip != null },
    ...ACTIVITIES.map((a) => ({ key: a.short, ok: d.activity?.[a.id] != null })),
  ];
  return { fields, pct: fields.filter((f) => f.ok).length / fields.length };
}

// ---------- places (schematic Mexico City) ----------
export const DISTRICTS = [
  { name: 'Centro Histórico', label: [-99.1375, 19.4372], poly: [[-99.148, 19.439], [-99.127, 19.439], [-99.127, 19.427], [-99.148, 19.4285]] },
  { name: 'Juárez', label: [-99.1605, 19.4298], poly: [[-99.170, 19.430], [-99.148, 19.437], [-99.148, 19.4285], [-99.156, 19.424], [-99.169, 19.4235]] },
  { name: 'Roma Norte', label: [-99.1545, 19.4128], poly: [[-99.169, 19.4235], [-99.156, 19.424], [-99.150, 19.420], [-99.152, 19.4115], [-99.165, 19.411], [-99.170, 19.416]] },
  { name: 'Condesa', label: [-99.1765, 19.4075], poly: [[-99.183, 19.419], [-99.170, 19.420], [-99.170, 19.416], [-99.165, 19.411], [-99.170, 19.404], [-99.180, 19.405]] },
  { name: 'Polanco', label: [-99.1975, 19.4368], poly: [[-99.208, 19.440], [-99.188, 19.440], [-99.183, 19.430], [-99.205, 19.429]] },
];
export const GREEN_AREAS = [
  { name: 'Bosque de Chapultepec', poly: [[-99.205, 19.428], [-99.1785, 19.427], [-99.1765, 19.419], [-99.186, 19.411], [-99.203, 19.409]] },
  { name: 'Alameda', poly: [[-99.1465, 19.4368], [-99.1418, 19.4365], [-99.1418, 19.4348], [-99.1465, 19.4350]] },
];
export const STREETS = [
  { name: 'Paseo de la Reforma', pts: [[-99.200, 19.4265], [-99.186, 19.4245], [-99.176, 19.4238], [-99.170, 19.4255], [-99.165, 19.429], [-99.156, 19.433], [-99.148, 19.4368], [-99.140, 19.442]] },
  { name: 'Av. Insurgentes', pts: [[-99.1625, 19.445], [-99.1638, 19.430], [-99.166, 19.420], [-99.1705, 19.400]] },
  { name: 'Av. Chapultepec', pts: [[-99.177, 19.4225], [-99.160, 19.4238], [-99.148, 19.4272]] },
];

const pop = () => round2(0.55 + rng() * 0.45);
export const CATEGORIES = [
  { id: 'cowork', label: 'Coworking spaces', color: '#3F5F86', activity: 'cowork', indoor: true },
  { id: 'cafe', label: 'Cafés', color: '#B9774A', activity: 'cafe', indoor: false },
  { id: 'park', label: 'Parks / outdoor work areas', color: '#6F8F5E', activity: 'park', indoor: false },
  { id: 'cultural', label: 'Cultural / indoor venues', color: '#86687F', activity: 'museum', indoor: true },
  { id: 'corridor', label: 'Walkable outdoor corridors', color: '#C9A24A', activity: 'walk', indoor: false },
];
export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const PLACES = [
  { id: 'W01', cat: 'cowork', name: 'Coworking W01', area: 'Roma Norte', ll: [-99.1620, 19.4195] },
  { id: 'W02', cat: 'cowork', name: 'Coworking W02', area: 'Roma Norte', ll: [-99.1575, 19.4148] },
  { id: 'W03', cat: 'cowork', name: 'Coworking W03', area: 'Condesa', ll: [-99.1768, 19.4135] },
  { id: 'W04', cat: 'cowork', name: 'Coworking W04', area: 'Juárez', ll: [-99.1622, 19.4268] },
  { id: 'W05', cat: 'cowork', name: 'Coworking W05', area: 'Polanco', ll: [-99.1960, 19.4338] },
  { id: 'W06', cat: 'cowork', name: 'Coworking W06', area: 'Centro Histórico', ll: [-99.1380, 19.4342] },
  { id: 'C01', cat: 'cafe', name: 'Café C01', area: 'Roma Norte', ll: [-99.1642, 19.4168] },
  { id: 'C02', cat: 'cafe', name: 'Café C02', area: 'Roma Norte', ll: [-99.1568, 19.4212] },
  { id: 'C03', cat: 'cafe', name: 'Café C03', area: 'Roma Norte', ll: [-99.1608, 19.4135] },
  { id: 'C04', cat: 'cafe', name: 'Café C04', area: 'Condesa', ll: [-99.1722, 19.4098] },
  { id: 'C05', cat: 'cafe', name: 'Café C05', area: 'Condesa', ll: [-99.1748, 19.4165] },
  { id: 'C06', cat: 'cafe', name: 'Café C06', area: 'Condesa', ll: [-99.1676, 19.4122] },
  { id: 'C07', cat: 'cafe', name: 'Café C07', area: 'Juárez', ll: [-99.1578, 19.4255] },
  { id: 'C08', cat: 'cafe', name: 'Café C08', area: 'Centro Histórico', ll: [-99.1422, 19.4330] },
  { id: 'P01', cat: 'park', name: 'Parque México', area: 'Condesa', ll: [-99.1690, 19.4118] },
  { id: 'P02', cat: 'park', name: 'Parque España', area: 'Condesa', ll: [-99.1715, 19.4158] },
  { id: 'P03', cat: 'park', name: 'Bosque de Chapultepec', area: 'Chapultepec', ll: [-99.1900, 19.4190] },
  { id: 'P04', cat: 'park', name: 'Alameda Central', area: 'Centro Histórico', ll: [-99.1442, 19.4358] },
  { id: 'P05', cat: 'park', name: 'Plaza Río de Janeiro', area: 'Roma Norte', ll: [-99.1592, 19.4186] },
  { id: 'M01', cat: 'cultural', name: 'Museo Nacional de Antropología', area: 'Chapultepec', ll: [-99.1863, 19.4260] },
  { id: 'M02', cat: 'cultural', name: 'Museo Tamayo', area: 'Chapultepec', ll: [-99.1818, 19.4264] },
  { id: 'M03', cat: 'cultural', name: 'Palacio de Bellas Artes', area: 'Centro Histórico', ll: [-99.1412, 19.4352] },
  { id: 'M04', cat: 'cultural', name: 'Casa Lamm', area: 'Roma Norte', ll: [-99.1628, 19.4176] },
  { id: 'M05', cat: 'cultural', name: 'Museo Soumaya', area: 'Polanco', ll: [-99.2045, 19.4402] },
  { id: 'M06', cat: 'cultural', name: 'Museo Franz Mayer', area: 'Centro Histórico', ll: [-99.1437, 19.4378] },
].map((p) => ({ ...p, pop: pop() }));

function ring(cx, cy, r, n = 28) {
  return Array.from({ length: n + 1 }, (_, k) => {
    const a = (k / n) * Math.PI * 2;
    return [cx + (r * Math.cos(a)) / Math.cos((19.41 * Math.PI) / 180), cy + r * Math.sin(a)];
  });
}
export const CORRIDORS = [
  { id: 'K01', name: 'Madero pedestrian street', area: 'Centro Histórico', activity: 'walk', pts: [[-99.1405, 19.4344], [-99.1335, 19.4329]] },
  { id: 'K02', name: 'Av. Ámsterdam loop', area: 'Condesa', activity: 'walk', pts: ring(-99.1690, 19.4118, 0.0034) },
  { id: 'K03', name: 'Álvaro Obregón median', area: 'Roma Norte', activity: 'walk', pts: [[-99.1665, 19.4190], [-99.1555, 19.4172]] },
  { id: 'K04', name: 'Reforma cycle route', area: 'Juárez', activity: 'cycle', pts: [[-99.186, 19.4245], [-99.176, 19.4238], [-99.170, 19.4255], [-99.165, 19.429], [-99.156, 19.433], [-99.148, 19.4368]] },
].map((c) => ({ ...c, pop: pop() }));

export const MAP_EXTENT = { lon: [-99.212, -99.124], lat: [19.399, 19.446] };
