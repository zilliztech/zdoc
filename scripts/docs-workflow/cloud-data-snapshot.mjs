#!/usr/bin/env node
// Generate or verify the committed cloud-data snapshots (normalized models of
// the Zilliz Cloud CMS region/feature data) used for HTML SSR first frames and
// the baked SSI stub blocks inside `.md` artifacts.
//
//   node scripts/docs-workflow/cloud-data-snapshot.mjs \
//     --site en --from-base https://cms.zilliz.cc \
//     --out packages/docs-ui/src/shared/cloud-data/snapshots/en.json
//
//   node scripts/docs-workflow/cloud-data-snapshot.mjs \
//     --site zh-CN --from-dir <dir-with-cn.cloud-{regions,features}.json> \
//     --out .../snapshots/zh-CN.json
//
// Verification (freshness gate for a future refresh workflow, spec §9-3):
//
//   node scripts/docs-workflow/cloud-data-snapshot.mjs \
//     --site en --from-base https://cms.zilliz.cc \
//     --check packages/docs-ui/src/shared/cloud-data/snapshots/en.json
//
// `--check` rebuilds the model from the live CMS and compares it with the
// committed snapshot (ignoring generation metadata). Exit 0 = identical,
// exit 1 = drift with a per-table diff summary. It never writes files.

import fs from 'node:fs';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const repositoryRoot = new URL('../../', import.meta.url).pathname;

function parseArguments(argv) {
  const options = {site: null, fromBase: null, fromDir: null, out: null, check: null};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index + 1];
    switch (argv[index]) {
      case '--site': options.site = value; break;
      case '--from-base': options.fromBase = value; break;
      case '--from-dir': options.fromDir = value; break;
      case '--out': options.out = value; break;
      case '--check': options.check = value; break;
      default: throw new Error(`Unknown argument: ${argv[index]}`);
    }
    index += 1;
  }
  if (options.site !== 'en' && options.site !== 'zh-CN') {
    throw new Error('--site must be en or zh-CN');
  }
  if (!options.fromBase === !options.fromDir) {
    throw new Error('pass exactly one of --from-base <url> or --from-dir <dir>');
  }
  if (!options.check === !options.out) {
    throw new Error('pass exactly one of --out <path> or --check <path>');
  }
  return options;
}

function readJsonFiles(site, fromDir) {
  const prefix = site === 'zh-CN' ? 'cn.' : '';
  const regions = JSON.parse(fs.readFileSync(`${fromDir}/${prefix}cloud-regions.json`, 'utf8'));
  const features = JSON.parse(fs.readFileSync(`${fromDir}/${prefix}cloud-features.json`, 'utf8'));
  return {regions, features};
}

async function fetchJson(base, pathname, site) {
  const url = `${base.replace(/\/$/, '')}${pathname}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GET ${url} -> ${response.status}`);
  return {url, body: await response.json()};
}

async function fetchJsonFiles(site, fromBase) {
  const regions = await fetchJson(fromBase, '/api/cloud-regions', site);
  const features = await fetchJson(fromBase, '/api/cloud-features', site);
  return {
    regions: regions.body,
    features: features.body,
    source: `${regions.url} + ${features.url}`,
  };
}

function describeModel(model) {
  // Compact, human-diffable identity of a model: one line per table cell.
  // `updatedAt` is CMS write metadata, not content — any Strapi touch bumps
  // it — so it is surfaced in the command messages but never compared here.
  const lines = [];
  for (const provider of model.providers) {
    lines.push(`regions/${provider.key}=${provider.regions.map((region) => region.name).join(',')}`);
    lines.push(`region-ips/${provider.key}=${provider.ipRows.map((row) => `${row.region}:${row.cidrs.length}`).join(',')}`);
  }
  lines.push(`service-ips=${model.serviceIps.map((row) => `${row.region}:${row.cidrs.length}`).join(',')}`);
  for (const [key, matrix] of Object.entries(model.matrices)) {
    for (const row of matrix.rows) {
      const cells = Object.entries(row.cells).map(([provider, cell]) => {
        if (cell.kind === 'partial') return `${provider}=partial[${cell.regions.join('|')}]`;
        if (cell.kind === 'text') return `${provider}=text`;
        return `${provider}=${cell.kind}${cell.extra ? `+${cell.extra}` : ''}`;
      });
      lines.push(`${key}/${row.label}  ${cells.join('  ')}`);
    }
  }
  return lines;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  let input;
  if (options.fromDir) {
    const files = readJsonFiles(options.site, options.fromDir);
    input = {regions: files.regions, features: files.features, source: options.fromDir};
  } else {
    input = await fetchJsonFiles(options.site, options.fromBase);
  }

  const adapter = await import('../../packages/docs-ui/src/shared/cloud-data/adapter.js');
  const model = adapter.default.buildModel(options.site, input.regions, input.features);

  if (options.out) {
    const snapshot = {
      schemaVersion: 1,
      site: options.site,
      generatedAt: new Date().toISOString(),
      source: input.source,
      model,
    };
    fs.mkdirSync(new URL('.', `file://${repositoryRoot}${options.out}`).pathname, {recursive: true});
    fs.writeFileSync(`${repositoryRoot}${options.out}`, JSON.stringify(snapshot, null, 2) + '\n');
    console.log(`cloud-data-snapshot: wrote ${options.out} (updatedAt=${model.updatedAt}, providers=${model.providers.length}, features=${model.matrices.features.rows.length})`);
    return;
  }

  const committed = JSON.parse(fs.readFileSync(options.check, 'utf8'));
  if (committed.site !== options.site) {
    throw new Error(`snapshot site mismatch: ${committed.site} != ${options.site}`);
  }
  const before = describeModel(committed.model);
  const after = describeModel(model);
  const drift = [];
  const seen = new Set(before);
  for (const line of after) {
    if (!seen.has(line)) drift.push(`+ ${line}`);
  }
  const beforeSet = new Set(after);
  for (const line of before) {
    if (!beforeSet.has(line)) drift.push(`- ${line}`);
  }
  if (drift.length > 0) {
    console.error(`cloud-data-snapshot: DRIFT in ${options.check} vs ${input.source}`);
    console.error(drift.sort().join('\n'));
    process.exit(1);
  }
  console.log(`cloud-data-snapshot: ${options.check} is up to date (updatedAt=${model.updatedAt})`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
