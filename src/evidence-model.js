// Display conversions never change membership: evaluate in the market's native unit.
export const convert=(v,from,to)=>v==null?null:from===to?v:to==='F'?v*9/5+32:(v-32)*5/9;
export const number=v=>Number(v.toFixed(1)).toString();
export function range(o,native,unit){const lo=convert(o.low,native,unit),hi=convert(o.high,native,unit);return(lo==null?'≤'+number(hi):hi==null?'≥'+number(lo):lo===hi?number(lo):number(lo)+'–'+number(hi))+'°'+unit;}
export const leading=day=>day.outcomes.reduce((a,b)=>b.price>a.price?b:a);
export function matches(day,native){const value=Math.round(convert(day.actualC,'C',native)),o=leading(day);return(o.low==null||value>=o.low)&&(o.high==null||value<=o.high);}
export function tolerantMatches(day,native){
 const v=Math.round(convert(day.actualC,'C',native)),o=leading(day),margin=native==='F'?2:1;
 return(o.low==null||v>=o.low-margin)&&(o.high==null||v<=o.high+margin);
}
export function cumulative(days,native){let strict=0,tolerant=0;return days.map((day,i)=>{strict+=Number(matches(day,native));tolerant+=Number(tolerantMatches(day,native));return{day,n:i+1,strict,tolerant,strictRate:strict/(i+1),tolerantRate:tolerant/(i+1)};});}
