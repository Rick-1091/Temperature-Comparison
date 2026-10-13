// Synthetic teaching model. No live prices or estimates of real farm losses.
export const PREPARATIONS={
 all:{name:['直接晾晒','Keep drying'],protection:['不防雨','Unprotected'],outside:1,shelter:0,storage:0,cost:0},
 shelter:{name:['移到雨棚','Use rain shelter'],protection:['只防小雨','Light rain only'],outside:0,shelter:1,storage:0,cost:2},
 store:{name:['全部收储','Store everything'],protection:['也防暴雨','Heavy rain too'],outside:0,shelter:0,storage:1,cost:5}
};
// One authored, high-rain-risk scenario drives quotes AND sampling.
// This price/probability correspondence is a teaching assumption, not calibration of live markets.
export const SIGNAL={dry:15,light:15,heavy:70};
export const WEATHER={
 dry:{name:['无雨 · 完整晾晒窗口','Dry · full drying window'],weight:SIGNAL.dry/100,drying:1,damage:0,shelterDamageFactor:0},
 light:{name:['小雨 · 午后较晚到来','Light rain · arrives late'],weight:SIGNAL.light/100,drying:.75,damage:25,shelterDamageFactor:0},
 heavy:{name:['暴雨 · 提前到来','Heavy rain · arrives early'],weight:SIGNAL.heavy/100,drying:.3,damage:90,shelterDamageFactor:1}
};
export const CONTRACTS={
 light:{name:['小雨合约','Light-rain contract'],quantity:30,price:SIGNAL.light/100,cost:30*SIGNAL.light/100,payout:30,trigger:'light'},
 heavy:{name:['暴雨合约','Heavy-rain contract'],quantity:30,price:SIGNAL.heavy/100,cost:30*SIGNAL.heavy/100,payout:30,trigger:'heavy'}
};
export const CONTRACT=CONTRACTS.heavy; // Preserve true/heavy callers from the original exercise.
export function getContract(choice){
 if(choice===false||choice===null||choice===undefined)return null;
 const key=choice===true?'heavy':choice;
 if(!Object.hasOwn(CONTRACTS,key))throw Error('Invalid contract choice');
 return CONTRACTS[key];
}
export const ECONOMICS={fullDryingValue:24,shelterDryingFactor:.75};
export function drawOutcome(random=Math.random){
 const r=random();
 if(!Number.isFinite(r)||r<0||r>=1)throw Error('Random draw must be in [0, 1)');
 let cumulative=0;
 for(const key of Object.keys(WEATHER)){cumulative+=SIGNAL[key]/100;if(r<cumulative)return key;}
 return 'heavy';
}
export function expectedNet(preparation,hedge=false){
 return Math.round(Object.keys(WEATHER).reduce((sum,w)=>sum+SIGNAL[w]/100*resolveDecision(preparation,w,hedge).net,0)*10)/10;
}
export function resolveDecision(preparation,weather,hedge=false){
 const p=PREPARATIONS[preparation],w=WEATHER[weather];if(!p||!w)throw Error('Invalid diorama state');
 const round=x=>Math.round(x*10)/10;
 const availableDrying=ECONOMICS.fullDryingValue;
 const dryingFactor=p.outside+p.shelter*ECONOMICS.shelterDryingFactor;
 const sunnyDrying=round(availableDrying*dryingFactor),drying=round(availableDrying*w.drying*dryingFactor);
 // One common sunny/full-rack baseline for every weather. Preparation removes
 // drying opportunity first; rain only interrupts the maize still drying.
 // Derive displayed losses from rounded balances so every equation reconciles.
 const dryingOpportunityLoss=round(availableDrying-sunnyDrying),weatherDryingLoss=round(sunnyDrying-drying);
 const totalDryingLoss=round(dryingOpportunityLoss+weatherDryingLoss);
 // The open-sided shelter blocks light rain, not wind-driven heavy rain.
 // Fully stored maize has zero drying and zero rain exposure in this exercise.
 const exposure=p.outside+p.shelter*w.shelterDamageFactor;
 const physicalLoss=round(w.damage*exposure);
 const contract=getContract(hedge),premium=contract?.cost||0,payout=contract&&weather===contract.trigger?contract.payout:0;
 const unhedged=round(drying-physicalLoss-p.cost),net=round(unhedged-premium+payout);
 const weatherImpact=round(weatherDryingLoss+physicalLoss),gapFromFullDrying=round(availableDrying-net);
 return {contractType:contract?.trigger||null,drying,availableDrying,sunnyDrying,dryingOpportunityLoss,weatherDryingLoss,totalDryingLoss,weatherImpact,gapFromFullDrying,physicalLoss,preparationCost:p.cost,premium,payout,hedgeNet:round(payout-premium),unhedged,net,
 weatherLossWithoutHedge:physicalLoss,weatherLossAfterHedge:round(physicalLoss+premium-payout),exposure,protected:1-exposure};
}
