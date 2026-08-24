'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {execFileSync} = require('node:child_process');

const {checkPreservedFiles, preservedFilePaths} = require('./preserved-files-gate.js');

function git(cwd, ...args) {
  return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim();
}

function write(root, relative, contents) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, contents);
}

function repo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-preserved-files-gate-'));
  git(root, 'init', '-q');
  git(root, 'config', 'user.name', 'Test');
  git(root, 'config', 'user.email', 'test@example.com');
  return root;
}

function fakeRegistry() {
  return {
    publicationEntries: () => [
      {site: 'en', publication: {outputDir: 'content/en/ref/foo/foo', preservedFiles: ['foo.md']}},
      {site: 'zh-CN', publication: {outputDir: 'content/zh-CN/ref/foo/foo', preservedFiles: ['foo.md']}},
    ],
    manualRegistry: [],
  };
}

test('preservedFilePaths keeps only English publications and joins outputDir', () => {
  assert.deepEqual(preservedFilePaths(fakeRegistry()), ['content/en/ref/foo/foo/foo.md']);
});

test('checkPreservedFiles passes when the file is declared and tracked', () => {
  const root = repo();
  write(root, 'content/en/ref/foo/foo/foo.md', 'landing\n');
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'landing');

  const {paths, errors} = checkPreservedFiles({
    cwd: root,
    registry: fakeRegistry(),
    contract: {masterAuthoritativePaths: ['content/en/ref/foo/foo/foo.md']},
  });
  assert.deepEqual(paths, ['content/en/ref/foo/foo/foo.md']);
  assert.deepEqual(errors, []);
});

test('checkPreservedFiles flags a preserved file missing its masterAuthoritativePaths entry', () => {
  const root = repo();
  write(root, 'content/en/ref/foo/foo/foo.md', 'landing\n');
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'landing');

  const {errors} = checkPreservedFiles({
    cwd: root,
    registry: fakeRegistry(),
    contract: {masterAuthoritativePaths: []},
  });
  assert.deepEqual(errors, [
    'content/en/ref/foo/foo/foo.md is a preservedFile but is not listed in masterAuthoritativePaths',
  ]);
});

test('checkPreservedFiles flags a preserved file not tracked on master', () => {
  const root = repo();
  write(root, 'unrelated.md', 'base\n');
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'base');

  const {errors} = checkPreservedFiles({
    cwd: root,
    registry: fakeRegistry(),
    contract: {masterAuthoritativePaths: ['content/en/ref/foo/foo/foo.md']},
  });
  assert.deepEqual(errors, [
    'content/en/ref/foo/foo/foo.md is a preservedFile but is not tracked on master',
  ]);
});
