// Weather observations, pre-event quotes and final settlement records stay separate.
export const CASE = Object.freeze({month:'2026-07', station:'KLGA', wban:'14732', ghcnd:'USW00014732'});
export const CME_HISTORY = Object.freeze({status:'not-connected', records:[], redistributionApproved:false, finalSettlementIndex:null});

export function cumulativeCDD(data) {
  if(data?.metadata?.kind!=='official-weather-observation' || data.metadata.station!==CASE.station || data.metadata.month!==CASE.month || data.metadata.unit!=='°F·day' || data.metadata.baseF!==65 || !Array.isArray(data.days) || data.days.length!==31) throw Error('Invalid observation coverage');
  let total=0;
  const rows=data.days.map((d,i)=>{
    if(!d || d.date!==`${CASE.month}-${String(i+1).padStart(2,'0')}` || ![d.maxF,d.minF,d.meanF,d.cdd].every(Number.isFinite) || d.maxF<d.minF || d.cdd<0) throw Error('Invalid daily observation');
    total+=d.cdd;
    return {...d,cumulative:total};
  });
  if(total!==data.metadata.reportedTotal) throw Error('Monthly CDD total does not match report');
  return rows;
}

export function validateMarketData(data) {
  if(data?.metadata?.kind!=='historical-market-snapshot'||data.metadata.station!==CASE.station||data.metadata.month!==CASE.month||data.metadata.marketUnit!=='F'||!Array.isArray(data.days)) throw Error('Wrong market case');
  const seen=new Set();
  for(const day of data.days){
    if(!day||!/^2026-07-(0[1-9]|[12]\d|3[01])$/.test(day.date)||seen.has(day.date)||day.cutoffAt!==day.date+'T04:00:00Z'||!Array.isArray(day.outcomes)) throw Error('Invalid market date');
    seen.add(day.date);
    const cutoff=Date.parse(day.cutoffAt);
    const labels=new Set();
    for(const o of day.outcomes){
      if(!o||typeof o.label!=='string'||!o.label||labels.has(o.label)||![null,0,1].includes(o.settlementPrice)) throw Error('Invalid outcome record');
      labels.add(o.label);
      if(o.price==null) continue;
      if(!Number.isFinite(o.price)||o.price<0||o.price>1||!o.label||!/^\d+$/.test(o.yesTokenId)||!(Date.parse(o.quotedAt)<cutoff&&Date.parse(o.quotedAt)>=cutoff-86400000)) throw Error('Invalid pre-event price');
      if(o.history!==undefined&&!Array.isArray(o.history)) throw Error('Invalid price history');
      for(const [i,p] of (o.history||[]).entries()) if(!p||!Number.isFinite(p.p)||p.p<0||p.p>1||!Number.isFinite(p.t)||p.t*1000>=cutoff||p.t*1000<cutoff-86400000||i>0&&p.t<=o.history[i-1].t) throw Error('Invalid pre-event history');
      const last=o.history?.at(-1);
      if(last&&(last.p!==o.price||last.t*1000!==Date.parse(o.quotedAt))) throw Error('Snapshot does not match last history point');
    }
  }
  return data;
}

// Future adapter: call only with a licensed, verified data package. Never fetch CME
// automatically or substitute weather observations for this series.
export function admittedFuturesHistory(data=CME_HISTORY) {
  if(data?.status!=='available'||data.redistributionApproved!==true) return null;
  if(!data.sourceUrl||data.station!==CASE.station||data.contractMonth!==CASE.month||!['trade','bid','ask','settlement'].includes(data.quoteType)||!data.records?.length) throw Error('Incomplete futures provenance');
  let previous='';
  for(const row of data.records){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(row.date)||row.date<=previous||!Number.isFinite(row.indexPoints)||![row.volume,row.openInterest].every(v=>v===null||Number.isFinite(v)&&v>=0)) throw Error('Invalid futures record');
    previous=row.date;
  }
  if(data.finalSettlementIndex!==null&&(!Number.isFinite(data.finalSettlementIndex)||!data.settlementSourceUrl)) throw Error('Unverified final settlement');
  return data;
}

export const quotedOutcomes=day=>(day?.outcomes||[]).filter(o=>Number.isFinite(o.price));
export const topQuote=day=>quotedOutcomes(day).reduce((best,o)=>!best||o.price>best.price?o:best,null);
export const cents=price=>Number((price*100).toFixed(2)).toString();
