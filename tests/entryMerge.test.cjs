const assert = require('node:assert/strict');
const test = require('node:test');
const { mergeEntryHistories } = require('../src/storage/entryMerge.ts');

test('upgrade preserves legacy history and widget dots created before first launch', () => {
  const legacy = [{ id: 'old-1' }, { id: 'old-2' }];
  const widget = [{ id: 'new-1' }];
  assert.deepEqual(mergeEntryHistories(legacy, widget), [...legacy, ...widget]);
});

test('the same entry is never duplicated during migration', () => {
  assert.deepEqual(
    mergeEntryHistories([{ id: 'one', value: 'old' }], [{ id: 'one', value: 'shared' }]),
    [{ id: 'one', value: 'shared' }]
  );
});
