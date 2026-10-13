import assert from 'node:assert/strict';
import {resolveDecision,PREPARATIONS,WEATHER,CONTRACTS,getContract,SIGNAL,drawOutcome,expectedNet} from '../src/decision-model.js';

// Independent, hand-calculated fixtures, not expectations derived by calling
// resolveDecision again. Columns: earned, preparation delay, rain interruption,
// crop damage, preparation cost, net without / with light / with heavy contract.
const expected={
 all:{dry:[24,0,0,0,0,24,19.5,3],light:[18,0,6,25,0,-7,18.5,-28],heavy:[7.2,0,16.8,90,0,-82.8,-87.3,-73.8]},
 shelter:{dry:[18,6,0,0,2,16,11.5,-5],light:[13.5,6,4.5,0,2,11.5,37,-9.5],heavy:[5.4,6,12.6,90,2,-86.6,-91.1,-77.6]},
 store:{dry:[0,24,0,0,5,-5,-9.5,-26],light:[0,24,0,0,5,-5,20.5,-26],heavy:[0,24,0,0,5,-5,-9.5,4]}
};
const tenths=n=>Math.round(n*10);
assert.deepEqual(Object.keys(PREPARATIONS),['all','shelter','store'],'Exactly three distinct preparations');
let cases=0;
for(const [plan,weatherRows] of Object.entries(expected)){
 const p=PREPARATIONS[plan];
 assert.equal(p.outside+p.storage+p.shelter,1,`${plan}: allocations sum to one`);
 for(const [weather,row] of Object.entries(weatherRows)){
  const no=resolveDecision(plan,weather,false),lightContract=resolveDecision(plan,weather,'light'),heavyContract=resolveDecision(plan,weather,'heavy');
  assert.deepEqual([no.drying,no.dryingOpportunityLoss,no.weatherDryingLoss,no.physicalLoss,no.preparationCost,no.net,lightContract.net,heavyContract.net],row,`${plan}/${weather}`);
  assert.deepEqual(resolveDecision(plan,weather,true),heavyContract,'Legacy true means heavy contract');
  for(const r of [no,lightContract,heavyContract]){
   assert.equal(r.availableDrying,24);
   assert.equal(tenths(r.drying)+tenths(r.dryingOpportunityLoss)+tenths(r.weatherDryingLoss),240,'No missing/double-counted drying value');
   assert.equal(tenths(r.net),tenths(r.drying)-tenths(r.physicalLoss)-tenths(r.preparationCost)-tenths(r.premium)+tenths(r.payout));
   assert.equal(tenths(r.gapFromFullDrying),240-tenths(r.net));
   assert.equal(tenths(r.totalDryingLoss),tenths(r.dryingOpportunityLoss)+tenths(r.weatherDryingLoss));
   assert.equal(tenths(r.weatherImpact),tenths(r.weatherDryingLoss)+tenths(r.physicalLoss));
   assert.equal(tenths(r.gapFromFullDrying),tenths(r.totalDryingLoss)+tenths(r.physicalLoss)+tenths(r.preparationCost)+tenths(r.premium)-tenths(r.payout));
   assert.ok(r.drying>=0&&r.weatherDryingLoss>=0&&r.physicalLoss>=0);
   assert.equal(r.payout,r.contractType===weather?30:0);
   assert.equal(r.premium,r.contractType?CONTRACTS[r.contractType].cost:0);
   cases++;
  }
  for(const held of [lightContract,heavyContract]){
   assert.equal(no.physicalLoss,held.physicalLoss,'A contract cannot shelter maize');
   assert.equal(no.drying,held.drying,'A contract cannot change drying');
   assert.equal(tenths(held.net)-tenths(no.net),tenths(held.hedgeNet));
  }
  assert.equal(tenths(lightContract.net)-tenths(no.net),weather==='light'?255:-45);
  assert.equal(tenths(heavyContract.net)-tenths(no.net),weather==='heavy'?90:-210);
 }
 const dry=resolveDecision(plan,'dry'),light=resolveDecision(plan,'light'),heavy=resolveDecision(plan,'heavy');
 assert.equal(dry.dryingOpportunityLoss,light.dryingOpportunityLoss,'Preparation delay does not change retrospectively with weather');
 assert.equal(light.dryingOpportunityLoss,heavy.dryingOpportunityLoss);
 if(plan!=='store')assert.ok(dry.net>light.net&&light.net>heavy.net,`${plan}: three distinct unhedged outcomes`);
 else assert.equal(dry.net,light.net,'Fully stored corn has no weather exposure or drying in this model');
}
assert.throws(()=>resolveDecision('missing','dry'));
assert.throws(()=>resolveDecision('batch','dry'));
assert.throws(()=>resolveDecision('cover','dry'));
assert.equal(resolveDecision('shelter','light').physicalLoss,0,'Shelter blocks light rain');
assert.equal(resolveDecision('shelter','heavy').physicalLoss,90,'Open sides do not block heavy rain');
assert.deepEqual(['all','shelter','store'].map(plan=>resolveDecision(plan,'dry').dryingOpportunityLoss),[0,6,24]);
assert.equal(resolveDecision('store','heavy').physicalLoss,0,'Storage protects against heavy rain');
for(const [weather,best] of [['dry','all'],['light','shelter'],['heavy','store']]){
 for(const plan of Object.keys(PREPARATIONS))if(plan!==best)assert.ok(resolveDecision(best,weather).net>resolveDecision(plan,weather).net,`${weather}: a distinct best preparation before hedging`);
}
assert.throws(()=>resolveDecision('all','missing'));
for(const contract of Object.values(CONTRACTS)){
 assert.equal(tenths(contract.quantity*contract.price),tenths(contract.cost),'Quote and quantity match the cost');
 assert.equal(contract.payout,contract.quantity,'Winning units pay one per unit');
}
assert.throws(()=>getContract('dry'));
assert.throws(()=>getContract('toString'));
console.table(Object.keys(PREPARATIONS).map(plan=>({plan,...Object.fromEntries(Object.keys(WEATHER).map(weather=>[weather,expected[plan][weather].slice(5).join(' / ')]))})));
console.log(`PASS: ${cases} independent accounting fixtures (none / light / heavy), common baseline, exact ledgers and matching weather triggers.`);
assert.deepEqual(SIGNAL,{dry:15,light:15,heavy:70});
assert.deepEqual([0,.149999,.15,.299999,.3,.999999].map(r=>drawOutcome(()=>r)),['dry','dry','light','light','heavy','heavy']);
const counts={dry:0,light:0,heavy:0};
for(let i=0;i<10000;i++)counts[drawOutcome(()=>(i+.5)/10000)]++;
assert.deepEqual(counts,{dry:1500,light:1500,heavy:7000});
assert.equal(expectedNet('all'),-55.4);
assert.equal(expectedNet('shelter'),-56.5);
assert.equal(expectedNet('store'),-5);
for(const plan of Object.keys(PREPARATIONS)){
 for(const hedge of ['light','heavy'])assert.equal(expectedNet(plan,hedge),expectedNet(plan),'Fairly priced contracts have no artificial expected-profit bonus');
}
console.log('PASS: aligned quotes/sampling, exact outcome frequencies, preparation advantage, no hedge bonus');
