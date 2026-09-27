const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:net');
const { execFile } = require('node:child_process');
const path = require('node:path');

test('startup fails clearly when the configured port is already occupied', async (t) => {
  const occupied = createServer();
  await new Promise((resolve, reject) => {
    occupied.once('error', reject);
    occupied.listen(0, resolve);
  });
  t.after(() => new Promise((resolve) => occupied.close(resolve)));
  const port = occupied.address().port;
  const result = await new Promise((resolve) => {
    execFile(
      process.execPath,
      [path.resolve(__dirname, '../src/server.js')],
      { env: { ...process.env, PORT: String(port) }, timeout: 10000 },
      (error, stdout, stderr) => resolve({ error, stdout, stderr }),
    );
  });
  assert.equal(result.error?.code, 1);
  assert.match(result.stderr, new RegExp(`port ${port} is already in use`));
  assert.doesNotMatch(result.stdout, /API running/);
});
