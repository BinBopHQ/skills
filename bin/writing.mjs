#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== 'check' || (args[1] !== '--stdin' && !['.md', '.txt'].includes(extname(args[1]).toLowerCase()))) {
  console.error('Usage: writing check <file.md|file.txt|--stdin>');
  process.exit(2);
}

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(dirname(require.resolve('writehuman/package.json')), 'dist/writehuman.js');
const temp = mkdtempSync(join(tmpdir(), 'binbop-writing-'));

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.signal) throw new Error(`${command} interrupted by ${result.signal}`);
  return result;
}

try {
  const isStdin = args[1] === '--stdin';
  const source = isStdin ? join(temp, 'draft.txt') : resolve(args[1]);
  if (isStdin) writeFileSync(source, readFileSync(0), { mode: 0o600 });
  const config = join(temp, '.vale.ini');
  writeFileSync(config, `StylesPath = ${join(root, 'styles')}\nMinAlertLevel = suggestion\n\n[*.{md,txt}]\nBasedOnStyles = BinBop\n`, { mode: 0o600 });

  const vale = run('vale', ['--no-global', '--config', config, '--no-color', source]);
  if (vale.stdout) process.stdout.write(vale.stdout);
  if (vale.stderr) process.stderr.write(vale.stderr);
  if (vale.status !== 0 && vale.status !== 1) throw new Error(`Vale failed (${vale.status}).`);

  const result = run(process.execPath, [cli, 'check', '--lang', 'en', '--format', 'json', '--', source]);
  if (result.status !== 0 && result.status !== 1) throw new Error(`writehuman failed (${result.status}): ${result.stderr}`);
  const reports = JSON.parse(result.stdout);
  if (!Array.isArray(reports) || reports.length !== 1 || !Number.isFinite(reports[0].score) || !Array.isArray(reports[0].findings)) {
    throw new Error('writehuman returned an invalid report.');
  }
  const report = reports[0];
  console.log(`writehuman: ${report.score} / 133.2 (${report.words} words)`);
  const findings = report.findings.filter(finding => finding.severity === 'error' || finding.severity === 'warning');
  for (const finding of findings.slice(0, 20)) {
    console.log(`  ${finding.line}:${finding.col} ${finding.severity} ${finding.message}`);
  }
  if (findings.length > 20) console.log(`  ... and ${findings.length - 20} more findings.`);
  if (vale.status === 1 || report.score > 133.2) process.exitCode = 1;
} catch (error) {
  console.error(`writing: ${error.message}`);
  process.exitCode = 2;
} finally {
  rmSync(temp, { recursive: true, force: true });
}
