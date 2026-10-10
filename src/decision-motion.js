// Small, deterministic choreography helpers. No renderer, timers or randomness.
export const smooth=x=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
export const TRANSPORT_ROUTES={
 shelter:[[1.1,0,2.6],[-1.3,0,2.6],[-1.3,0,1.6],[-3.5,0,1.6]],
 batch:[[1.1,0,2.6],[-1.2,0,3.8],[-2.5,0,3.8]],
 store:[[1.1,0,2.6],[-1.2,0,3.8],[-2.5,0,3.8]]
};
export function transportBeat(progress){
 const time=Math.max(0,Math.min(1,progress))*3,trip=Math.min(2,Math.floor(time)),local=time-trip;
 const step=local<.14?'pick':local<.52?'carry':local<.67?'place':trip===2?'done':'return';
 const route=step==='pick'?0:step==='carry'?smooth((local-.14)/.38):step==='return'?1-smooth((local-.67)/.33):1;
 return {trip,local,step,route,pickup:smooth(local/.14),deposit:smooth((local-.52)/.15),walking:step==='carry'||step==='return'};
}
export function routePoint(route,progress){
 const lengths=route.slice(1).map((p,i)=>Math.hypot(p[0]-route[i][0],p[2]-route[i][2]));
 let remaining=Math.max(0,Math.min(1,progress))*lengths.reduce((a,b)=>a+b,0);
 for(let i=0;i<lengths.length;i++){
  if(remaining<=lengths[i]||i===lengths.length-1){const f=remaining/lengths[i],from=route[i],to=route[i+1];return {point:from.map((v,k)=>v+(to[k]-v)*f),heading:Math.atan2(to[0]-from[0],to[2]-from[2])};}
  remaining-=lengths[i];
 }
}
