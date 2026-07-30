#!/usr/bin/env node
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {scanIntegrity, validateScanConfig} from '../../packages/docs-tooling/src/validation/integrity.mjs';

export {scanIntegrity, validateScanConfig};

function loadScanConfig(file) {
  if (!existsSync(file)) throw new Error(`Integrity scan config not found: ${file}`);
  let config;
  try { config = JSON.parse(readFileSync(file, 'utf8')); }
  catch (error) { throw new Error(`Integrity scan config is not valid JSON: ${file}: ${error.message}`); }
  return validateScanConfig(config);
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (['--root', '--repository', '--report', '--allowlist', '--scan-config', '--max-file-size'].includes(arg)) result[arg.slice(2)] = argv[++index];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!result.root || !result.repository || !result.report) throw new Error('Usage: integrity.mjs --root <path> --repository <zdoc|zdoc_cn> --report <path> [--allowlist <json>] [--scan-config <json>] [--max-file-size <bytes>]');
  return result;
}

async function main(argv) {
  const args = parseArgs(argv);
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const defaultAllowlist = path.join(repositoryRoot, 'migration/integrity-allowlist.json');
  const allowlistPath = args.allowlist ? path.resolve(args.allowlist) : existsSync(defaultAllowlist) ? defaultAllowlist : null;
  const allowlist = allowlistPath ? JSON.parse(readFileSync(allowlistPath, 'utf8')).exceptions : [];
  const scanConfigPath = args['scan-config'] ? path.resolve(args['scan-config']) : path.join(repositoryRoot, 'migration/integrity-scan-config.json');
  const scanConfig = loadScanConfig(scanConfigPath);
  const scanPolicy = scanConfig.repositories.find(item => item.id === args.repository);
  if (!scanPolicy) throw new Error(`Integrity scan config has no policy for repository: ${args.repository}`);
  const report = await scanIntegrity(args.root, {...scanPolicy, repository: args.repository, allowlist, ...(args['max-file-size'] ? {maxFileSize: Number(args['max-file-size'])} : {})});
  const reportPath = path.resolve(args.report);
  mkdirSync(path.dirname(reportPath), {recursive: true});
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(report.counts)}\n`);
  if (report.findings.some(item => item.severity === 'critical' && item.status === 'unreviewed')) process.exitCode = 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
