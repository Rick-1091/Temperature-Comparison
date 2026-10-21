// NWS: https://www.weather.gov/lzk/metar.htm
// TS is a descriptor, RA rain, DZ drizzle. A report without RA/DZ is not proof
// of dry weather; missing / unrecognized present-weather fields remain null.
const PHENOMENA=new Set(['DZ','RA','SN','SG','IC','PL','GR','GS','UP','BR','FG','FU','VA','DU','SA','HZ','PY','PO','SQ','FC','SS','DS']);
const DESCRIPTORS=new Set(['MI','PR','BC','DR','BL','SH','TS','FZ']);
export function reportedRain(raw){
  if(typeof raw!=='string'||!/^METAR\s/.test(raw)||/\s(?:NIL|CNL)\b/.test(raw))return {rain:null,drizzle:null,thunder:null};
  const body=raw.split(/\sRMK\b/)[0].split(/\s(?:NOSIG|BECMG|TEMPO)\b/)[0];
  const visibility=/\s(?:(?:\d+\s+)?[PM]?(?:\d+\/\d+|\d+)SM|\d{4}(?:NDV)?|CAVOK)(?=\s|$)/g;
  // Start after the wind group so a time / runway number cannot be visibility.
  const wind=body.match(/\s(?:\d{3}|VRB)\d{2,3}(?:G\d{2,3})?KT\b/);
  if(!wind)return {rain:null,drizzle:null,thunder:null};
  const tail=body.slice(wind.index+wind[0].length),vis=visibility.exec(tail);
  if(!vis)return {rain:null,drizzle:null,thunder:null};
  const weather=tail.slice(vis.index+vis[0].length).split(/\s(?:FEW|SCT|BKN|OVC|VV|CLR|SKC|NSC|NCD|M?\d{2}\/)/)[0].trim();
  let rain=0,drizzle=0,thunder=0,unknown=/\bPWINO\b/.test(raw)||/\/\/|\bUP\b/.test(weather);
  for(const token of weather.split(/\s+/).filter(Boolean)){
    if(/^R\d{2}/.test(token)||/^\d{3}V\d{3}$/.test(token))continue;
    let code=token.replace(/^[-+]/,''),vicinity=code.startsWith('VC');
    if(vicinity)code=code.slice(2);
    const pairs=code.match(/.{2}/g)||[];
    if(!pairs.length||pairs.join('')!==code){unknown=true;continue;}
    for(const pair of pairs){
      if(pair==='TS')thunder=1;
      if(!DESCRIPTORS.has(pair)&&!PHENOMENA.has(pair))unknown=true;
      if(!vicinity&&(pair==='RA'||pair==='DZ'))rain=1;
      if(!vicinity&&pair==='DZ')drizzle=1;
      if(pair==='UP')unknown=true;
    }
  }
  return {rain:rain||!unknown?rain:null,drizzle:drizzle||!unknown?drizzle:null,thunder:unknown&&!thunder?null:thunder};
}
const cover={FEW:.19,SCT:.44,BKN:.75,OVC:1,VV:1};
const fraction=s=>s.split(' ').reduce((sum,p)=>{const [a,b]=p.split('/');return sum+(b?Number(a)/Number(b):Number(a));},0);
export function parseWeatherReport(raw){
  if(typeof raw!=='string'||!raw.startsWith('METAR'))return null;
  const body=raw.split(' RMK')[0],t=body.match(/ (M?\d{2})\/(M?\d{2}) /),w=body.match(/ (?:\d{3}|VRB)(\d{2,3})(?:G\d{2,3})?KT /),a=body.match(/ A(\d{4})/),q=body.match(/ Q(\d{4})/);
  const num=s=>s.startsWith('M')?-Number(s.slice(1)):Number(s),T=t?num(t[1]):null,D=t?num(t[2]):null;
  const clouds=[...body.matchAll(/ (FEW|SCT|BKN|OVC|VV)\d{3}/g)].map(m=>cover[m[1]]);
  const vis=body.match(/ ([PM]?(?:\d+ \d\/\d|\d\/\d|\d+))SM /),metric=body.match(/ (\d{4})(?:NDV)? /);
  return {temp:T,rh:t?100*Math.exp(17.625*D/(243.04+D))/Math.exp(17.625*T/(243.04+T)):null,
    wind:w?Number(w[1]):null,pressure:a?Number(a[1])*0.3386389:q?Number(q[1]):null,
    cloud:clouds.length?Math.max(...clouds):/\b(?:SKC|CLR|NSC|CAVOK)\b/.test(body)?0:null,
    ...reportedRain(raw),vis:vis?fraction(vis[1].replace(/^[PM]/,'')):metric?Number(metric[1])/1609.344:null};
}
export function pearson(rows,a,b){
  const p=rows.filter(r=>Number.isFinite(r[a])&&Number.isFinite(r[b])),n=p.length;
  if(n<2)return {r:null,n};
  const ma=p.reduce((s,r)=>s+r[a],0)/n,mb=p.reduce((s,r)=>s+r[b],0)/n;
  let sab=0,sa=0,sb=0;for(const row of p){sab+=(row[a]-ma)*(row[b]-mb);sa+=(row[a]-ma)**2;sb+=(row[b]-mb)**2;}
  return {r:sa&&sb?sab/Math.sqrt(sa*sb):null,n};
}
