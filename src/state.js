import { TOMORROW_ISO } from './data.js';

const DEFAULTS = {
  date: TOMORROW_ISO,
  weather: 'all',
  group: 'all',
  activity: null,
  showAllSimilar: false,
  panelDate: null,
  hover: null, // { type: 'weather'|'activity'|'date', id }
};

let state = { ...DEFAULTS };
const subs = new Set();

export const getState = () => state;
export function setState(patch) {
  state = { ...state, ...patch };
  subs.forEach((fn) => fn(state));
}
export function subscribe(fn) {
  subs.add(fn);
  fn(state);
}
export function resetFilters() {
  setState({ date: DEFAULTS.date, weather: 'all', group: 'all', activity: null, panelDate: null });
}
export const isFiltered = (s) => s.date !== DEFAULTS.date || s.weather !== 'all' || s.group !== 'all' || s.activity;
