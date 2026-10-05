// Keep the selected historical comparison when crossing the exercise and review pages.
export function exerciseUrl(path, lang, extra = {}) {
 const current = new URLSearchParams(location.search), params = new URLSearchParams();
 for (const key of ['location', 'day', 'unit']) if (current.has(key)) params.set(key, current.get(key));
 params.set('lang', lang);
 for (const [key, value] of Object.entries(extra)) params.set(key, String(value));
 return path + '?' + params;
}
