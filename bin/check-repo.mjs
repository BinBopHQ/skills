import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { valeBinary } from './vale.mjs';

const require = createRequire(import.meta.url);
const cli = join(dirname(require.resolve('writehuman/package.json')), 'dist/writehuman.js');
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = '.cache/writehuman';
const policy = existsSync('.writehuman.json') ? JSON.parse(readFileSync('.writehuman.json', 'utf8')) : { maxScore: 133.2 };
if (!Number.isFinite(policy.maxScore) || policy.maxScore < 0 || Object.keys(policy).some(key => key !== 'maxScore')) {
  throw new Error('Invalid writehuman threshold policy.');
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  if (result.signal) throw new Error(`${command} was interrupted by ${result.signal}`);
  return result;
}

const git = run('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', '*.md']);
if (git.status !== 0) throw new Error(`Cannot list Markdown files: ${git.stderr}`);
const files = git.stdout.split('\0').filter(file => file && existsSync(file));
if (files.length === 0) throw new Error('No Markdown files found for writehuman.');

const temporaryDir = mkdtempSync(join(tmpdir(), 'writing-check-'));
try {
  const styles = join(temporaryDir, 'styles');
  cpSync(join(packageRoot, 'styles'), styles, { recursive: true });
  if (existsSync('.vale/styles')) cpSync('.vale/styles', styles, { recursive: true, force: true });
  const config = join(temporaryDir, '.vale.ini');
  const localStyles = readdirSync(styles, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name !== 'Writing')
    .map(entry => `, ${entry.name}`).join('');
  writeFileSync(config, `StylesPath = ${styles}\nMinAlertLevel = suggestion\n\n[*.{md,html}]\nBasedOnStyles = Writing${localStyles}\n`);
  function checked(command, args) {
    const result = spawnSync(command, args, { stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`${command} failed (${result.status ?? result.signal}).`);
  }
  checked(process.execPath, [join(dirname(require.resolve('markdownlint-cli2')), 'markdownlint-cli2-bin.mjs'), ...files]);
  const html = run('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', '*.html']);
  if (html.status !== 0) throw new Error(`Cannot list HTML files: ${html.stderr}`);
  checked(valeBinary(), [ '--no-global', '--config', config, ...files, ...html.stdout.split('\0').filter(file => file && existsSync(file))]);
  checked(valeBinary(), [ 'test', '--no-global', '--config', config, '--coverage', styles]);
  for (const format of ['json', 'html']) {
    const output = join(temporaryDir, `report.${format}`);
    const result = run(process.execPath, [cli, 'check', '--lang', 'en', '--format', format, '--out', output, '--', ...files]);
    // writehuman uses 1 for findings and 2 for a failure to analyze.
    if (result.status !== 0 && result.status !== 1) {
      throw new Error(`writehuman ${format} report failed (${result.status}): ${result.stderr}`);
    }
  }

  const reports = JSON.parse(readFileSync(join(temporaryDir, 'report.json'), 'utf8'));
  if (!Array.isArray(reports) || reports.length !== files.length) {
    throw new Error('writehuman returned an incomplete report.');
  }
  if (new Set(reports.map(report => report.file)).size !== files.length) {
    throw new Error('writehuman returned duplicate file reports.');
  }
  const totals = reports.reduce((sum, report) => {
    if (typeof report.file !== 'string' || !files.includes(report.file) || !Number.isFinite(report.score)) {
      throw new Error('writehuman returned an invalid file or score.');
    }
    for (const level of ['error', 'warning', 'info']) {
      if (!Number.isInteger(report.counts?.[level])) throw new Error('writehuman returned an invalid report.');
      sum[level] += report.counts[level];
    }
    return sum;
  }, { error: 0, warning: 0, info: 0 });
  mkdirSync(reportDir, { recursive: true });
  for (const format of ['json', 'html']) {
    // The system temp directory may be on another filesystem.
    const contents = readFileSync(join(temporaryDir, `report.${format}`));
    const target = join(reportDir, `report.${format}`);
    const pending = `${target}.tmp`;
    writeFileSync(pending, contents);
    renameSync(pending, target);
  }
  console.log(`writehuman reviewed ${reports.length} Markdown files: ${totals.error} error-level, ${totals.warning} warning, ${totals.info} info findings.`);
  const overLimit = reports.filter(report => report.score > policy.maxScore);
  for (const report of overLimit) {
    console.error(`${report.file}: score ${report.score} exceeds ${policy.maxScore}.`);
  }
  console.log(`Review ${reportDir}/report.html or ${reportDir}/report.json for context.`);
  if (overLimit.length) process.exitCode = 1;
  else console.log(`All files meet the writehuman score limit (${policy.maxScore}).`);
} finally {
  rmSync(temporaryDir, { recursive: true, force: true });
}
