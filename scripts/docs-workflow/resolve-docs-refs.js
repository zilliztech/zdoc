#!/usr/bin/env node
'use strict';

const {spawnSync} = require('node:child_process');

const COMMIT_SHA = /^[0-9a-f]{40}$/;

const DOCS_REF_PATHS = Object.freeze({
  tooling: Object.freeze([
    '.github/workflows',
    'scripts',
    'packages/docs-tooling',
    'packages/site-config',
    'packages/docs-ui',
    'apps/docs',
    'deploy/contracts',
    'config',
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'tsconfig.json',
  ]),
  source: Object.freeze(['content/en', 'generated/en', 'sidebar-overrides/en']),
});

function normalizedPath(value) {
  return String(value).replace(/^\.\//, '').replace(/\/+$/, '');
}

function pathsOverlap(left, right) {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function assertDisjointOwnership(ownership = DOCS_REF_PATHS) {
  for (const toolingPath of ownership.tooling || []) {
    for (const sourcePath of ownership.source || []) {
      if (pathsOverlap(normalizedPath(toolingPath), normalizedPath(sourcePath))) {
        throw new Error(`Tooling and source ownership overlap: ${toolingPath} <-> ${sourcePath}`);
      }
    }
  }
  return ownership;
}

function assertSafeGitRef(ref) {
  if (typeof ref !== 'string' || ref === '' || ref !== ref.trim()) throw new Error('Unsafe Git ref');
  if (
    ref.startsWith('-')
    || /[\x00-\x20\x7f~^:?*\\\[]/.test(ref)
    || ref.includes('..')
    || ref.includes('@{')
    || ref.includes('//')
    || ref.endsWith('/')
    || ref.endsWith('.')
    || ref.split('/').some(part => part === '' || part === '.' || part === '..' || part.endsWith('.lock'))
  ) {
    throw new Error(`Unsafe Git ref: ${ref}`);
  }
  return ref;
}

function git(cwd, args) {
  const result = spawnSync('git', args, {cwd, encoding: 'utf8'});
  if (result.error) throw new Error(`Git command failed: ${result.error.message}`);
  if (result.status !== 0) throw new Error(result.stderr.trim() || `git ${args[0]} exited ${result.status}`);
  return result.stdout.trim();
}

function resolveCommit({cwd = process.cwd(), ref}) {
  assertSafeGitRef(ref);
  const commit = git(cwd, ['rev-parse', '--verify', `${ref}^{commit}`]);
  if (!COMMIT_SHA.test(commit)) throw new Error(`Resolved ref is not a lowercase 40-character commit SHA: ${commit}`);
  return commit;
}

function restoreOwnedPaths({cwd = process.cwd(), sourceSha, paths = DOCS_REF_PATHS.source}) {
  if (!COMMIT_SHA.test(sourceSha || '')) throw new Error('sourceSha must be a lowercase 40-character commit SHA');
  assertDisjointOwnership(DOCS_REF_PATHS);
  git(cwd, ['cat-file', '-e', `${sourceSha}^{commit}`]);
  git(cwd, ['restore', '--source', sourceSha, '--staged', '--worktree', '--', ...paths]);
  return [...paths];
}

module.exports = {
  DOCS_REF_PATHS,
  assertDisjointOwnership,
  assertSafeGitRef,
  resolveCommit,
  restoreOwnedPaths,
};
