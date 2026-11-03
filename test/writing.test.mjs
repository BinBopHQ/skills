import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const cli = new URL('../bin/lint-writing.mjs', import.meta.url);
function check(args, input) {
  return spawnSync(process.execPath, [cli.pathname, ...args], { encoding: 'utf8', input });
}

test('checks a plain-text draft from stdin', () => {
  const result = check(['--stdin'], 'Thanks for your help. I will send the details tomorrow.\n');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /writehuman: .* \/ 133\.2/);
});

test('fails on a Vale error and an excessive score', () => {
  const result = check(['--stdin'], 'A revolutionary, game-changing breakthrough.\n');
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /Writing\.Hype/);
  assert.match(result.stdout, /writehuman:/);
});

test('reports a missing file as a tool failure', () => {
  const result = check(['/no-such-writing-file.md']);
  assert.equal(result.status, 2);
});

test('does not apply marketplace terminology to general writing', () => {
  const result = check(['--stdin'], 'The auction lot has a lot number.\n');
  assert.notEqual(result.status, 2, result.stderr);
  assert.doesNotMatch(result.stdout, /Writing\.ListingTerms|inventory reference/);
});

test('checks a repository without project configuration or mise', () => {
  const dir = mkdtempSync(join(tmpdir(), 'lint-writing-test-'));
  try {
    assert.equal(spawnSync('git', ['init', '-q', dir]).status, 0);
    writeFileSync(join(dir, 'README.md'), '# Hello\n\nThanks for your help.\n');
    const result = spawnSync(process.execPath, [cli.pathname, '--repo'], {
      cwd: dir, encoding: 'utf8', env: { ...process.env, PATH: '/usr/bin:/bin' },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /All files meet the writehuman score limit/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('checks Astro page text while ignoring frontmatter and scripts', () => {
  const dir = mkdtempSync(join(tmpdir(), 'lint-writing-astro-'));
  try {
    assert.equal(spawnSync('git', ['init', '-q', dir]).status, 0);
    writeFileSync(join(dir, 'README.md'), '# Hello\n\nThanks for your help.\n');
    const page = join(dir, 'page.astro');
    writeFileSync(page, '---\nconst internal = "revolutionary";\n---\n<p>Thanks for your help.</p>\n<script>const text = "revolutionary";</script>\n');
    const run = () => spawnSync(process.execPath, [cli.pathname, '--repo'], { cwd: dir, encoding: 'utf8' });
    const clean = run();
    assert.equal(clean.status, 0, clean.stderr);
    writeFileSync(page, '---\nconst internal = "revolutionary";\n---\n<p>A revolutionary breakthrough.</p>\n');
    const flagged = run();
    assert.equal(flagged.status, 1, flagged.stderr);
    assert.match(flagged.stdout, /page\.astro/);
    assert.match(flagged.stdout, /Writing\.Hype/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
