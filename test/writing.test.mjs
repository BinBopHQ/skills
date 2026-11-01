import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const cli = new URL('../bin/writing.mjs', import.meta.url);
function check(args, input) {
  return spawnSync(process.execPath, [cli.pathname, ...args], { encoding: 'utf8', input });
}

test('checks a plain-text draft from stdin', () => {
  const result = check(['check', '--stdin'], 'Thanks for your help. I will send the details tomorrow.\n');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /writehuman: .* \/ 133\.2/);
});

test('fails on a Vale error and an excessive score', () => {
  const result = check(['check', '--stdin'], 'A revolutionary, game-changing breakthrough.\n');
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /BinBop\.Hype/);
  assert.match(result.stdout, /writehuman:/);
});

test('reports a missing file as a tool failure', () => {
  const result = check(['check', '/no-such-binbop-file.md']);
  assert.equal(result.status, 2);
});
