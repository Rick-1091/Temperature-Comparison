import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cumulativeCDD,validateMarketData,admittedFuturesHistory,topQuote} from '../src/market-comparison-model.js';
const nws=JSON.parse(readFileSync(new URL('../public/signals/data/laguardia-july-2026-cdd.json',import.meta.url)));
const market=JSON.parse(readFileSync(new URL('../public/signals/data/laguardia-july-2026-markets.json',import.meta.url)));
const rows=cumulativeCDD(nws);
// Independent anchors from the published CF6 report and the verified July 21 API sample.
assert.equal(rows[0].cumulative,20);
assert.equal(rows[1].cumulative,49);
assert.equal(rows[20].cumulative,318);
assert.equal(rows[20].maxF,83);
assert.equal(rows[20].cdd,13);
assert.equal(rows.at(-1).cumulative,435);
validateMarketData(market);
assert.equal(market.days.length,31);
assert.equal(market.days.reduce((sum,d)=>sum+d.outcomes.length,0),341);
for(const day of market.days){
 assert.equal(day.outcomes.filter(o=>o.settlementPrice===1).length,1);
 for(const o of day.outcomes){
  assert.ok(o.sampleCount>=o.history.length);
  assert.equal(o.history.at(-1).p,o.price);
  assert.equal(o.history.at(-1).t*1000,Date.parse(o.quotedAt));
  assert.ok(o.history.every((p,i)=>!i||p.t>o.history[i-1].t));
 }
}
const july21=market.days[20];
assert.equal(topQuote(july21).label,'78-79°F');
assert.equal(topQuote(july21).price,.335);
assert.equal(july21.outcomes.find(o=>o.settlementPrice===1).label,'82-83°F');
const wrongTotal=structuredClone(nws);wrongTotal.metadata.reportedTotal=436;
assert.throws(()=>cumulativeCDD(wrongTotal));
const afterCutoff=structuredClone(market);afterCutoff.days[0].outcomes[0].quotedAt=afterCutoff.days[0].cutoffAt;
assert.throws(()=>validateMarketData(afterCutoff));
const wrongUnit=structuredClone(nws);wrongUnit.metadata.unit='°C';
assert.throws(()=>cumulativeCDD(wrongUnit));
const wrongSnapshot=structuredClone(market);wrongSnapshot.days[0].outcomes[0].price=.99;
assert.throws(()=>validateMarketData(wrongSnapshot));
const wrongSettlement=structuredClone(market);wrongSettlement.days[0].outcomes[0].settlementPrice='1';
assert.throws(()=>validateMarketData(wrongSettlement));
assert.throws(()=>validateMarketData({metadata:market.metadata,days:[{date:'2026-07-01',cutoffAt:'2026-07-01T04:00:00Z',outcomes:null}]}));
assert.equal(admittedFuturesHistory(),null);
assert.equal(admittedFuturesHistory({status:'available',redistributionApproved:false}),null);
assert.throws(()=>admittedFuturesHistory({status:'available',redistributionApproved:true}));
console.log('PASS: 31 NWS days, 435 CDD, 341 pre-midnight quotes; settlements separate; unlicensed CME history excluded.');
