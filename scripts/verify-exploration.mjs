import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as model from '../public/signals/src/interval-model.js';

assert.equal(model.convert(undefined, 'C', 'C'), null, 'missing temperatures must not become values');
assert.equal(model.inInterval({low:null,high:26}, null), null, 'missing observation has unknown membership');
assert.equal(typeof model.groupQuotes, 'function', 'whole-bin aggregation is available');
assert.equal(model.quoteCents?.(0.0005),'0.05','raw small quotes retain precision in cents');
for (const place of ['mexico','laguardia']) {
  const snapshot=JSON.parse(fs.readFileSync(`public/signals/data/${place}-unified.json`));
  const grouped=model.groupQuotes(snapshot);
  assert.equal(grouped.available,true,place);
  assert.equal(grouped.groups.length,place==='mexico'?4:8);
  for (const [i,row] of grouped.rows.entries()) {
    const original=snapshot.days[i].outcomes;
    assert.equal(row.cells.flatMap(c=>c.members).length,original.length);
    assert.ok(Math.abs(row.total-original.reduce((s,o)=>s+o.price,0))<1e-10);
    assert.ok(Math.abs(row.cells.reduce((s,c)=>s+c.weight,0)-1)<1e-10);
    for (const cell of row.cells) for (const o of cell.members) {
      assert.ok(cell.group.low===null || (o.low!==null && o.low>=cell.group.low));
      assert.ok(cell.group.high===null || (o.high!==null && o.high<=cell.group.high));
      assert.equal(o.nativeUnit,snapshot.metadata.marketUnit);
      assert.equal(o.date,snapshot.days[i].date);
      assert.ok(o.label && o.quotedAt);
    }
  }
  const missing=structuredClone(snapshot);
  missing.days[0].outcomes[0].price=null;
  const row=model.groupQuotes(missing).rows[0];
  assert.equal(row.total,null);
  assert.equal(row.cells[0].sum,null);
  assert.ok(row.cells.every(c=>c.weight===null));
  assert.equal(model.highestQuote(missing.days[0]),null,'cannot identify a leader with missing quotes');
  const broken=structuredClone(snapshot);
  broken.days[0].outcomes.shift();
  assert.equal(model.groupQuotes(broken).available,false,'missing original bins do not imply zero support');
}
const mex=JSON.parse(fs.readFileSync('public/signals/data/mexico-unified.json'));
for (const date of ['2026-09-23','2026-09-25']) {
  const d=mex.days.find(d=>d.date===date),top=model.highestQuote(d);
  assert.equal(top.low,26);assert.equal(top.high,null);
  assert.equal(model.intervalLabel(top,'C','C'),'≥26°C');
  assert.equal(model.intervalLabel(top,'C','F'),'≥78.8°F');
  const group=model.groupQuotes(mex).rows.find(r=>r.date===date).cells.at(-1);
  assert.equal(group.members.length,1);
  assert.equal(group.members[0].label,'26°C or higher');
  for (const c of [25,26,27,35]) {
    const identity=model.inInterval(top,c);
    model.intervalLabel(top,'C','F');
    assert.equal(model.inInterval(top,c),identity);
  }
}
const straddle=structuredClone(mex);
straddle.days[0].outcomes.find(o=>o.low===24).high=25;
assert.equal(model.groupQuotes(straddle).available,false,'never split or double-count a straddling bin');
console.log('PASS: native open intervals; complete original-bin partitions; conserved quote sums; raw provenance; missing values; unit-invariant membership.');
