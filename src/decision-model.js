// Synthetic teaching model. No live prices or estimates of real farm losses.
export const PREPARATIONS={
 all:{name:['继续全部晾晒','Keep all outside'],outside:1,shelter:0,storage:0,covered:0,cost:0},
 batch:{name:['分批收储','Store half'],outside:.5,shelter:0,storage:.5,covered:0,cost:2},
 cover:{name:['展开遮盖布','Unfold the tarp'],outside:0,shelter:0,storage:0,covered:1,cost:4},
 shelter:{name:['移到左侧雨棚','Move to the left shelter'],outside:.4,shelter:.6,storage:0,covered:0,cost:3},
 store:{name:['全部提前收储','Store everything'],outside:0,shelter:0,storage:1,covered:0,cost:5}
};
export const WEATHER={
 dry:{name:['无雨 · 完整晾晒窗口','Dry · full drying window'],weight:.35,drying:1,damage:0},
 light:{name:['小雨 · 午后较晚到来','Light rain · arrives late'],weight:.4,drying:.75,damage:25},
 heavy:{name:['暴雨 · 提前到来','Heavy rain · arrives early'],weight:.25,drying:.3,damage:90}
};
export const SIGNAL={dry:32,light:28,heavy:40}; // Illustrative normalized prices, not calibrated probabilities.
export const CONTRACT={quantity:30,price:.4,cost:12,payout:30,trigger:'heavy'};
export function drawOutcome(random=Math.random){const r=random();return r<.35?'dry':r<.75?'light':'heavy';}
export function resolveDecision(preparation,weather,hedge=false){
 const p=PREPARATIONS[preparation],w=WEATHER[weather];if(!p||!w)throw Error('Invalid diorama state');
 const round=x=>Math.round(x*10)/10;
 const drying=round(24*w.drying*(p.outside+p.shelter*.55+p.covered*.35));
 const physicalLoss=round(w.damage*(p.outside+p.shelter*.04+p.covered*.1));
 const premium=hedge?CONTRACT.cost:0,payout=hedge&&weather===CONTRACT.trigger?CONTRACT.payout:0;
 const unhedged=round(drying-physicalLoss-p.cost),net=round(unhedged-premium+payout);
 return {drying,physicalLoss,preparationCost:p.cost,premium,payout,hedgeNet:payout-premium,unhedged,net,
 weatherLossWithoutHedge:physicalLoss,weatherLossAfterHedge:round(physicalLoss+premium-payout),exposure:p.outside,protected:p.storage+p.shelter+p.covered};
}
