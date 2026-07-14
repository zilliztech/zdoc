#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { getGroupPaths } = require('./group-paths');

const REST_OUTPUT_ROOT = 'reference/api/restful/restful';
const REST_GENERATED_TREES = Object.freeze([
  `${REST_OUTPUT_ROOT}/v1/control-plane`,
  `${REST_OUTPUT_ROOT}/v1/data-plane`,
  `${REST_OUTPUT_ROOT}/v2/control-plane`,
  `${REST_OUTPUT_ROOT}/v2/data-plane`,
]);
const REST_SIDEBAR = 'config/generated/restful.sidebar.js';

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

function readGitFileAtRef({ cwd, ref = 'HEAD', relativePath }) {
  if (ref !== 'HEAD' && !/^[0-9a-f]{40}$/.test(ref)) throw new Error(`Invalid Git ref: ${ref}`);
  const result = spawnSync('git', ['show', `${ref}:${relativePath}`], { cwd, encoding: 'utf8' });
  if (result.error) throw new Error(`Unable to read ${relativePath} from ${ref}: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`Unable to read ${relativePath} from ${ref}: ${result.stderr.trim() || `git exited ${result.status}`}`);
  return result.stdout;
}

function restorePreservedFiles({ root, relativePaths, contentByPath }) {
  const restored = [];
  for (const relativePath of relativePaths) {
    const content = contentByPath?.get(relativePath);
    if (typeof content !== 'string') throw new Error(`Missing current master content for preserved file: ${relativePath}`);
    const target = resolveOwnedPath(root, relativePath);
    if (fs.existsSync(target)) fs.rmSync(target, { force: true });
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, 'utf8');
    restored.push(relativePath);
  }
  return restored;
}

function prepareContentGroupWorkspace({ group, cwd = process.cwd(), restSidebarContent = null, preservedContentByPath = null }) {
  const root = path.resolve(cwd);
  const removed = [];
  const groupPaths = getGroupPaths(group);
  const restored = restorePreservedFiles({
    root,
    relativePaths: groupPaths.preservedEnglish,
    contentByPath: preservedContentByPath,
  });
  if (group !== 'rest') {
    return { group, removed, restored };
  }
  if (typeof restSidebarContent !== 'string') throw new Error('REST preparation requires current master sidebar content');

  let removedGeneratedDocs = false;
  for (const relativePath of REST_GENERATED_TREES) {
    const target = resolveOwnedPath(root, relativePath);
    if (!fs.existsSync(target)) continue;
    fs.rmSync(target, { recursive: true, force: true });
    removedGeneratedDocs = true;
  }
  if (removedGeneratedDocs) removed.push(REST_OUTPUT_ROOT);
  fs.mkdirSync(resolveOwnedPath(root, REST_OUTPUT_ROOT), { recursive: true });

  const sidebarPath = resolveOwnedPath(root, REST_SIDEBAR);
  if (fs.existsSync(sidebarPath)) {
    fs.rmSync(sidebarPath, { force: true });
    removed.push(REST_SIDEBAR);
  }
  fs.mkdirSync(path.dirname(sidebarPath), { recursive: true });
  fs.writeFileSync(sidebarPath, restSidebarContent, 'utf8');
  restored.push(REST_SIDEBAR);

  return { group, removed, restored };
}

function main() {
  const group = process.argv[2];
  if (!group || process.argv.length !== 3) {
    throw new Error('Usage: prepare-content-group-workspace.js <group>');
  }
  const restSidebarContent = group === 'rest'
    ? readGitFileAtRef({ cwd: process.cwd(), ref: process.env.MASTER_SHA || 'HEAD', relativePath: REST_SIDEBAR })
    : null;
  const preservedContentByPath = new Map(getGroupPaths(group).preservedEnglish.map((relativePath) => [
    relativePath,
    readGitFileAtRef({ cwd: process.cwd(), ref: process.env.MASTER_SHA || 'HEAD', relativePath }),
  ]));
  const result = prepareContentGroupWorkspace({ group, restSidebarContent, preservedContentByPath });
  console.log(`[prepare-content-group] ${group}: removed ${result.removed.length} restored path(s)`);
  for (const relativePath of result.removed) console.log(`- ${relativePath}`);
  for (const relativePath of result.restored) console.log(`+ ${relativePath} (master)`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { prepareContentGroupWorkspace, readGitFileAtRef, resolveOwnedPath, restorePreservedFiles };
