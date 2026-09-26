const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
function check(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) check(file);
    else if (/\.(js|cjs)$/.test(file))
      execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  }
}
for (const directory of ['src', 'scripts', 'test']) check(directory);
execFileSync(process.execPath, ['--check', 'prisma.config.js'], {
  stdio: 'inherit',
});
console.log('JavaScript syntax checks passed.');
