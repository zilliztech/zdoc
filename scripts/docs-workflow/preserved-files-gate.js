#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const { loadTypeScript } = require('../lib/load-typescript');
const { isMasterAuthoritative, loadContract } = require('./master-tooling-sync.js');

// Each publication's `preservedFiles` are relative to its `outputDir` (see
// `publication()` in registry.ts), so the full repository path is the two joined.
// Only English publications are master-authoritative landing pages; zh-CN
// `preservedFiles` are translation landing pages owned by `dev`.
function preservedFilePaths(registry = loadTypeScript('../../packages/docs-tooling/src/manuals/registry.ts')) {
  const paths = [];
  for (const entry of registry.publicationEntries(registry.manualRegistry)) {
    if (entry.site !== 'en') continue;
    const files = entry.publication.preservedFiles;
    if (!files || files.length === 0) continue;
    for (const file of files) {
      paths.push(`${entry.publication.outputDir}/${file}`);
    }
  }
  return [...new Set(paths)].sort();
}

function trackedAtHead(cwd, relativePath) {
  const result = spawnSync('git', ['cat-file', '-e', `HEAD:${relativePath}`], { cwd, encoding: 'utf8' });
  if (result.error) throw result.error;
  return result.status === 0;
}

function checkPreservedFiles({ cwd, registry, contract }) {
  const paths = preservedFilePaths(registry);
  const errors = [];
  for (const relativePath of paths) {
    if (!isMasterAuthoritative(relativePath, contract)) {
      errors.push(`${relativePath} is a preservedFile but is not listed in masterAuthoritativePaths`);
    }
    if (!trackedAtHead(cwd, relativePath)) {
      errors.push(`${relativePath} is a preservedFile but is not tracked on master`);
    }
  }
  return { paths, errors };
}

function run() {
  const cwd = process.cwd();
  const registry = loadTypeScript('../../packages/docs-tooling/src/manuals/registry.ts');
  const { paths, errors } = checkPreservedFiles({ cwd, registry, contract: loadContract({ cwd }) });
  if (errors.length > 0) throw new Error(errors.join('; '));
  process.stdout.write(`Preserved files gate passed: ${paths.length} preserved file(s) declared, tracked, and master-authoritative.\n`);
}

if (require.main === module) {
  try {
    run();
  } catch (error) {
    console.error(`Preserved files gate failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { checkPreservedFiles, preservedFilePaths, trackedAtHead };
