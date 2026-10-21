import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportedRain,parseWeatherReport,pearson} from '../src/weather-report-model.js';
import {intervalKey,intervalLabel,inInterval} from '../public/signals/src/interval-model.js';
import {settlementDisagrees,cumulativeCDD} from '../src/market-comparison-model.js';
const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const report=code=>'METAR KAAA 021200Z 01005KT 10SM '+code+' BKN020 20/15 A2999 RMK AO2';
for(const code of ['TS','VCTS','SH','BR',''])assert.equal(reportedRain(report(code)).rain,0,code);
for(const code of ['RA','-RA','TSRA','+TSRA','SHRA','DZ','-FZDZ','RASN'])assert.equal(reportedRain(report(code)).rain,1,code);
assert.equal(reportedRain(report('TS')).thunder,1);
assert.equal(reportedRain(report('DZ')).drizzle,1);
assert.equal(reportedRain(report('VCRA')).rain,0);
for(const code of ['UP','//','XX'])assert.equal(reportedRain(report(code)).rain,null,code);
assert.equal(reportedRain(report('').replace('AO2','PWINO')).rain,null);
assert.equal(reportedRain('METAR KAAA NIL').rain,null);
assert.equal(reportedRain(null).rain,null);
assert.equal(parseWeatherReport(report('').replace(' BKN020','')).cloud,null);
assert.equal(pearson([{a:1,b:0},{a:2,b:null},{a:3,b:1}],'a','b').n,2);
assert.equal(pearson([{a:1,b:0},{a:2,b:0}],'a','b').r,null);
const mexico=read('public/signals/data/mexico-unified.json');
for(const date of ['2026-09-23','2026-09-25']){
 const d=mexico.days.find(d=>d.date===date),o=d.outcomes.reduce((a,b)=>b.price>a.price?b:a);
 assert.equal(o.low,26);assert.equal(o.high,null);
 assert.equal(intervalLabel(o,'C','C'),'≥26°C');assert.equal(intervalLabel(o,'C','F'),'≥78.8°F');
 assert.equal(inInterval(o,30),true);assert.equal(inInterval(o,25),false);
 assert.notEqual(intervalKey(date,o,'C'),intervalKey(date,{low:26,high:26},'C'));
}
assert.notEqual(intervalKey('2026-09-23',{low:26,high:null},'C'),intervalKey('2026-09-25',{low:26,high:null},'C'));
const nws=read('public/signals/data/laguardia-july-2026-cdd.json'),market=read('public/signals/data/laguardia-july-2026-markets.json');
const obs=nws.days.find(d=>d.date==='2026-07-02'),day=market.days.find(d=>d.date===obs.date);
assert.equal(obs.maxF,104);assert.equal(day.outcomes.find(o=>o.settlementPrice===1).label,'102-103°F');
assert.equal(settlementDisagrees(obs,day),true);
assert.equal(cumulativeCDD(nws).at(-1).cumulative,435);
const summary={};
for(const place of ['mexico','laguardia']){
 const data=read('public/signals/data/'+place+'-unified.json'),rows=data.observations.map(o=>parseWeatherReport(o.rawOb)).filter(Boolean);
 const oldRain=data.observations.filter(o=>o.rawOb.startsWith('METAR')&&/ [-+]?(?:VC)?(?:TS|SH)?(?:RA|DZ)\b| TS\b/.test(o.rawOb.split(' RMK')[0])).length;
 summary[place]={reports:rows.length,rainReports:rows.filter(r=>r.rain===1).length,unknown:rows.filter(r=>r.rain===null).length,previousRainReports:oldRain,
  rainCorrelations:Object.fromEntries(['temp','rh','wind','pressure','cloud','vis'].map(k=>[k,pearson(rows,'rain',k)]))};
}
console.log(JSON.stringify(summary,null,2));
console.log('PASS: open intervals retain bounds and date identity; native membership; TS / rain / drizzle / unknown; missing-value correlations; July 2 mismatch; 435 CDD unchanged.');
