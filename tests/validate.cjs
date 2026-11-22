const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const root = path.resolve('game');
const html = fs.readFileSync('game/index.html','utf8');
assert.ok(!html.includes('type="module"'));
assert.ok(!/https?:/.test(html.replace(/data:[^"]+/g,'')));
const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match=>match[1]);
for (const reference of references) {
  if (reference.startsWith('data:')) continue;
  const file = path.resolve(root,reference);
  assert.ok(file.startsWith(root+path.sep) && fs.statSync(file).isFile(),reference);
  if (file.endsWith('.js')) execFileSync(process.execPath,['--check',file]);
}
for (const name of fs.readdirSync('game/js')) {
  const source = fs.readFileSync('game/js/'+name,'utf8');
  assert.ok(!/[ \t]+$/m.test(source),'trailing whitespace: '+name);
  assert.ok(!/\b(?:fetch|XMLHttpRequest|WebSocket|import)\s*\(/.test(source),'runtime networking: '+name);
}
const screenshots = fs.readdirSync('screenshots').sort();
assert.equal(screenshots.length,4);
for (const name of screenshots) {
  const bytes = fs.readFileSync('screenshots/'+name);
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(bytes.readUInt32BE(16),960);
  assert.equal(bytes.readUInt32BE(20),540);
  assert.ok(bytes.length<=262144);
  console.log(name+': 960x540 / '+bytes.length+' bytes');
}
assert.equal(
  fs.readFileSync('vendor/makefun-game.ts','utf8'),
  fs.readFileSync('best-heist-game-20261122-0559-kit/starter/vendor/makefun-game.ts','utf8'),
);
console.log('PASS: classic scripts, local references, syntax/style, no runtime networking, screenshots, unchanged vendor.');
