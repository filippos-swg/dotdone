const assert = require('node:assert/strict');
const test = require('node:test');
const { hasRecentDot } = require('../src/utils/recentDot.ts');

const now = Date.parse('2026-10-07T10:55:00.000Z');
const entry = (overrides = {}) => ({
  id: 'one',
  date: '2026-10-07',
  timestamp: new Date(now - 1000).toISOString(),
  actionName: 'Default',
  color: '#000000',
  ...overrides,
});

test('asks before another dot for the same task and day within five seconds', () => {
  assert.equal(hasRecentDot([entry()], '2026-10-07', undefined, now, 5000), true);
  assert.equal(hasRecentDot([entry({ taskId: 'medicine' })], '2026-10-07', 'medicine', now, 5000), true);
});

test('allows a different task, day, or intentional later dot', () => {
  assert.equal(hasRecentDot([entry()], '2026-10-07', 'medicine', now, 5000), false);
  assert.equal(hasRecentDot([entry()], '2026-10-06', undefined, now, 5000), false);
  assert.equal(hasRecentDot([entry({ timestamp: new Date(now - 5000).toISOString() })], '2026-10-07', undefined, now, 5000), false);
});
