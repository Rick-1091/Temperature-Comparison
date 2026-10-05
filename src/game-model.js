// Synthetic teaching model. It never consumes the Mexico/NYC temperature snapshots.
export const choices = ['all','batch','cover','store'];
export function resolveChoice(choice, weather) {
 if(!choices.includes(choice)||!['rain','sun'].includes(weather))throw Error('Invalid scenario state');
 return {
 exposed: weather==='rain' && (choice==='all'||choice==='batch'),
 protected: choice==='cover'||choice==='store'||choice==='batch',
 drying: weather==='sun' && choice!=='store',
 outside: choice==='all'?1:choice==='batch'?.5:choice==='cover'?1:0
 };
}
export function drawWeather(random=Math.random) { return random()<.6?'rain':'sun'; }

