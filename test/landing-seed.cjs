const { test } = require('node:test');
const assert = require('node:assert/strict');
const { seedLanding } = require('../scripts/seed-landing');
const { landingTables } = require('../src/landing/landing.tables');

test('seed inserts all sections/items and preserves database edits on repeat runs', async () => {
  const rows = {};
  const tx = {};
  for (const table of landingTables) {
    for (const name of [table.model, table.itemModel].filter(Boolean)) {
      rows[name] = new Map();
      tx[name] = {
        async upsert({ where, create, update }) {
          assert.deepEqual(update, {});
          if (!rows[name].has(where.id))
            rows[name].set(where.id, structuredClone(create));
        },
      };
    }
  }
  const db = { $transaction: async (fn) => fn(tx) };
  await seedLanding(db);
  assert.equal(
    Object.values(rows).reduce((sum, map) => sum + map.size, 0),
    45,
  );
  const row = rows.landingWellnessLounge.get('wellness-lounge');
  row.title = 'Editorial update';
  await seedLanding(db);
  assert.equal(row.title, 'Editorial update');
  assert.equal(
    Object.values(rows).reduce((sum, map) => sum + map.size, 0),
    45,
  );
});
