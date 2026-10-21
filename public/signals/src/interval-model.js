// Bounds, not a stored midpoint, define each event. Never infer a point forecast
// from an open range or merge different dates into one temperature event.
export const convert=(value,from,to)=>!Number.isFinite(value)?null:from===to?value:to==='F'?value*9/5+32:(value-32)*5/9;
const n=value=>Number(value.toFixed(1)).toString();
export const quoteCents=value=>Number.isFinite(value)?Number((value*100).toPrecision(12)).toString():'—';
export const intervalKey=(date,bucket,native)=>[date,native,bucket.low===null?'-inf':bucket.low,bucket.high===null?'+inf':bucket.high].join(':');
export function intervalLabel(bucket,native,unit){
  const lo=convert(bucket.low,native,unit),hi=convert(bucket.high,native,unit);
  return (lo===null?'≤'+n(hi):hi===null?'≥'+n(lo):lo===hi?n(lo):n(lo)+'–'+n(hi))+'°'+unit;
}
export function inInterval(bucket,value){
  if(!bucket||!Number.isFinite(value))return null;
  const rounded=Math.round(value);
  return (bucket.low===null||rounded>=bucket.low)&&(bucket.high===null||rounded<=bucket.high);
}

// A missing quote could be the largest quote. Do not silently select another.
export function highestQuote(day){
  if(!day?.outcomes?.length||day.outcomes.some(o=>!Number.isFinite(o.price)))return null;
  return day.outcomes.reduce((a,b)=>b.price>a.price?b:a);
}

const GROUPS={
 C:[{low:null,high:23},{low:24,high:24},{low:25,high:25},{low:26,high:null}],
 F:[{low:null,high:61},...[62,64,66,68,70,72].map(low=>({low,high:low+1})),{low:74,high:null}]
};
const validBounds=o=>o && (o.low===null||Number.isFinite(o.low)) &&
 (o.high===null||Number.isFinite(o.high)) && !(o.low===null&&o.high===null) &&
 (o.low===null||o.high===null||o.low<=o.high);
const contains=(group,o)=>(group.low===null||(o.low!==null&&o.low>=group.low)) &&
 (group.high===null||(o.high!==null&&o.high<=group.high));

// The source's integer-native outcomes must form a complete, disjoint partition.
// Reject gaps, overlaps and any native event straddling a shared group boundary.
export function groupQuotes(snapshot){
 const native=snapshot?.metadata?.marketUnit,groups=GROUPS[native]?.map(g=>({...g}));
 const unavailable={available:false,groups:groups||[],rows:[]};
 if(!groups||!snapshot.days?.length)return unavailable;
 const rows=[];
 for(const day of snapshot.days){
  if(!day.outcomes?.length||day.outcomes.some(o=>!validBounds(o)))return unavailable;
  const ordered=[...day.outcomes].sort((a,b)=>(a.low??-Infinity)-(b.low??-Infinity));
  if(ordered[0].low!==null||ordered.at(-1).high!==null)return unavailable;
  for(let i=1;i<ordered.length;i++){
   if(ordered[i-1].high===null||ordered[i].low===null||ordered[i-1].high+1!==ordered[i].low)return unavailable;
  }
  const cells=groups.map(group=>({group,members:[]}));
  for(const original of ordered){
   const matches=cells.filter(c=>contains(c.group,original));
   if(matches.length!==1)return unavailable;
   // Spread preserves original label, null boundaries and quotedAt, without
   // converting native bounds or replacing the original price with a weight.
   matches[0].members.push({...original,date:day.date,nativeUnit:native,snapshotAt:day.snapshotAt});
  }
  if(cells.some(c=>!c.members.length))return unavailable;
  for(const c of cells)c.sum=c.members.every(o=>Number.isFinite(o.price)&&o.price>=0&&o.price<=1)
   ?c.members.reduce((sum,o)=>sum+o.price,0):null;
  const total=cells.every(c=>c.sum!==null)?cells.reduce((sum,c)=>sum+c.sum,0):null;
  for(const c of cells)c.weight=total!==null&&total>0?c.sum/total:null;
  rows.push({date:day.date,total,cells});
 }
 return{available:true,groups,rows};
}
