#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { getGroupPaths } = require('./group-paths');

function resolveOwnedPath(root, relativePath) {
  if (
    typeof relativePath !== 'string'
    || relativePath === ''
    || path.isAbsolute(relativePath)
    || relativePath.split('/').some((part) => part === '' || part === '.' || part === '..')
  ) {
    throw new Error(`Unsafe group path: ${relativePath}`);
  }
  const resolved = path.resolve(root, ...relativePath.split('/'));
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Group path escapes workspace: ${relativePath}`);
  }
  return resolved;
}

function prepareContentGroupWorkspace({ group, cwd = process.cwd() }) {
  const root = path.resolve(cwd);
  const removed = [];
  if (group !== 'rest') {
    getGroupPaths(group);
    return { group, removed };
  }

  for (const relativePath of getGroupPaths(group).englishOutputs) {
    const target = resolveOwnedPath(root, relativePath);
    if (!fs.existsSync(target)) continue;
    fs.rmSync(target, { recursive: true, force: true });
    removed.push(relativePath);
  }

  return { group, removed };
}

function main() {
  const group = process.argv[2];
  if (!group || process.argv.length !== 3) {
    throw new Error('Usage: prepare-content-group-workspace.js <group>');
  }
  const result = prepareContentGroupWorkspace({ group });
  console.log(`[prepare-content-group] ${group}: removed ${result.removed.length} restored path(s)`);
  for (const relativePath of result.removed) console.log(`- ${relativePath}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { prepareContentGroupWorkspace, resolveOwnedPath };
