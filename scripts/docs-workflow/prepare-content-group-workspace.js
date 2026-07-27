#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

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

function prepareContentGroupWorkspace({ site = 'en', group, cwd = process.cwd(), restSidebarContent = null, preservedContentByPath = null }) {
  const root = path.resolve(cwd);
  const removed = [];
  const groupPaths = getGroupPaths(group, site);
  const restored = restorePreservedFiles({
    root,
    relativePaths: groupPaths.preservedEnglish,
    contentByPath: preservedContentByPath,
  });
  if (group !== 'rest') {
    return { site, group, removed, restored };
  }
  if (typeof restSidebarContent !== 'string') throw new Error('REST preparation requires current master sidebar content');

  const restOutputRoot = groupPaths.englishOutputs.find(relativePath => relativePath.startsWith(`content/${site}/reference/`));
  const restSidebar = groupPaths.sidebars[0];
  if (!restOutputRoot || !restSidebar) throw new Error(`REST publication paths are missing for site ${site}`);
  const restGeneratedTrees = [
    `${restOutputRoot}/v1/control-plane`,
    `${restOutputRoot}/v1/data-plane`,
    `${restOutputRoot}/v2/control-plane`,
    `${restOutputRoot}/v2/data-plane`,
  ];

  let removedGeneratedDocs = false;
  for (const relativePath of restGeneratedTrees) {
    const target = resolveOwnedPath(root, relativePath);
    if (!fs.existsSync(target)) continue;
    fs.rmSync(target, { recursive: true, force: true });
    removedGeneratedDocs = true;
  }
  if (removedGeneratedDocs) removed.push(restOutputRoot);
  fs.mkdirSync(resolveOwnedPath(root, restOutputRoot), { recursive: true });

  const sidebarPath = resolveOwnedPath(root, restSidebar);
  if (fs.existsSync(sidebarPath)) {
    fs.rmSync(sidebarPath, { force: true });
    removed.push(restSidebar);
  }
  fs.mkdirSync(path.dirname(sidebarPath), { recursive: true });
  fs.writeFileSync(sidebarPath, restSidebarContent, 'utf8');
  restored.push(restSidebar);

  return { site, group, removed, restored };
}

function main() {
  const [site, group] = process.argv.slice(2);
  if (!site || !group || process.argv.length !== 4) {
    throw new Error('Usage: prepare-content-group-workspace.js <site> <group>');
  }
  const groupPaths = getGroupPaths(group, site);
  const restSidebar = groupPaths.sidebars[0];
  const restSidebarContent = group === 'rest'
    ? readGitFileAtRef({ cwd: process.cwd(), ref: process.env.MASTER_SHA || 'HEAD', relativePath: restSidebar })
    : null;
  const preservedContentByPath = new Map(groupPaths.preservedEnglish.map((relativePath) => [
    relativePath,
    readGitFileAtRef({ cwd: process.cwd(), ref: process.env.MASTER_SHA || 'HEAD', relativePath }),
  ]));
  const result = prepareContentGroupWorkspace({ site, group, restSidebarContent, preservedContentByPath });
  console.log(`[prepare-content-group] ${site}/${group}: removed ${result.removed.length} restored path(s)`);
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
