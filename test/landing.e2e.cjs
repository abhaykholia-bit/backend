const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createApp } = require('../src/app');
const { landingSections } = require('../src/landing/landing.data');
const { landingTables } = require('../src/landing/landing.tables');
const routes = [
  'wellness-lounge',
  'upcoming-rituals',
  'holistic-solutions',
  'knowledge-hub',
  'meet-your-master',
  'faithkart',
  'corporate-wellness',
  'wellness-insights',
  'success-stories',
  'video-testimonials',
];

test('all landing routes serve public content over HTTP', async (t) => {
  const records = structuredClone(landingSections);
  const prisma = Object.fromEntries(
    landingTables.map((table) => [
      table.model,
      {
        async findUnique(query) {
          assert.equal(query.where.id, table.slug);
          if (table.itemModel)
            assert.deepEqual(query.include.items.orderBy, [
              { sortOrder: 'asc' },
              { id: 'asc' },
            ]);
          return records[table.slug];
        },
      },
    ]),
  );
  const app = createApp({ prisma });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  function checkAssets(value) {
    if (typeof value === 'string' && value.startsWith('/images/landing/')) {
      assert.ok(
        fs.existsSync(
          path.join(
            __dirname,
            '../../../Frontend/Livewheel_Frontend/public',
            value,
          ),
        ),
        `Missing asset: ${value}`,
      );
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(checkAssets);
    }
  }
  await Promise.all(
    routes.map(async (route) => {
      const response = await fetch(`${base}/api/v1/landing/${route}`);
      assert.equal(response.status, 200, route);
      const { data } = await response.json();
      assert.equal(data.id, route);
      assert.ok(data.title);
      checkAssets(data);
      if (data.items) {
        assert.ok(data.items.length > 0);
        assert.equal(
          new Set(data.items.map((item) => item.id)).size,
          data.items.length,
        );
      }
      if (route === 'knowledge-hub') {
        assert.ok(
          data.items.every(
            (item) => item.currency === 'INR' && item.priceAmount > 0,
          ),
        );
      }
      if (route === 'video-testimonials') {
        assert.ok(data.items.every((item) => item.videoUrl === null));
      }
      if (route === 'upcoming-rituals') {
        assert.equal(data.items[0].date, '2026-09-27');
        assert.equal(data.items[0].benefits.length, 5);
      }
    }),
  );
  // A subsequent API call must reflect database changes, not the seed fixture.
  records['wellness-lounge'].title = 'Updated in database';
  const changed = await fetch(`${base}/api/v1/landing/wellness-lounge`);
  assert.equal((await changed.json()).data.title, 'Updated in database');
  records['wellness-lounge'] = null;
  assert.equal(
    (await fetch(`${base}/api/v1/landing/wellness-lounge`)).status,
    404,
  );
  assert.equal(
    (await fetch(`${base}/api/v1/landing/not-a-section`)).status,
    404,
  );
  assert.equal(
    (await fetch(`${base}/api/v1/landing/wellness-lounge`, { method: 'POST' }))
      .status,
    404,
  );
});
