import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Guard the guided page against accidentally mixing dates, market-native units,
// or post-outcome quotes with the historical comparison.
for (const [place, native, expected] of [
  ['mexico', 'C', [6, 8]],
  ['laguardia', 'F', [2, 6]],
]) {
  const { metadata, days } = JSON.parse(readFileSync(new URL(`../public/signals/data/${place}-unified.json`, import.meta.url), 'utf8'));
  assert.equal(metadata.marketUnit, native);
  assert.equal(days.length, 9);
  const counts = [0, 0];
  for (const day of days) {
    assert.ok(day.marketUrl.includes(`on-september-${Number(day.date.slice(8))}-2026`));
    assert.ok(day.observationCount >= 20 && day.hourCoverage >= 20);
    assert.equal(day.outcomes.length, 11);
    const cutoff = Date.parse(day.snapshotAt);
    for (const outcome of day.outcomes) {
      const quoted = Date.parse(outcome.quotedAt);
      assert.ok(quoted < cutoff && quoted >= cutoff - 86_400_000, `${place} ${day.date}: quote outside pre-day window`);
      assert.ok(outcome.historyUrl.includes(outcome.yesTokenId));
    }
    const leaderIndex = day.outcomes.findIndex(o => o.price === Math.max(...day.outcomes.map(entry => entry.price)));
    const observed = Math.round(native === 'C' ? day.actualC : day.actualC * 9 / 5 + 32);
    const hit = o => (o.low == null || observed >= o.low) && (o.high == null || observed <= o.high);
    counts[0] += Number(hit(day.outcomes[leaderIndex]));
    counts[1] += Number(day.outcomes.some((o, i) => Math.abs(i - leaderIndex) <= 1 && hit(o)));
  }
  assert.deepEqual(counts, expected);
  process.stdout.write(`${place}: ${days.length} days; strict ${counts[0]}/9, broad ${counts[1]}/9\n`);
}
