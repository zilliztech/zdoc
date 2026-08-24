'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {execFileSync} = require('node:child_process');

const {devOwnedChanges} = require('./ownership-gate.js');

const contract = {
  devOwnedPaths: ['content', 'generated', 'sidebar-overrides/en'],
  masterAuthoritativePaths: ['content/en/reference/api/cpp/cpp/cpp.md'],
};

function git(cwd, ...args) {
  return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim();
}

function write(root, relative, contents) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, contents);
}

function repo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-ownership-gate-'));
  git(root, 'init', '-q');
  git(root, 'config', 'user.name', 'Test');
  git(root, 'config', 'user.email', 'test@example.com');
  return root;
}

test('devOwnedChanges flags dev-owned changes but not landing pages or tooling', () => {
  const root = repo();
  write(root, 'scripts/tool.js', 'base\n');
  write(root, 'content/en/page.md', 'base\n');
  write(root, 'content/en/reference/api/cpp/cpp/cpp.md', 'landing\n');
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'base');
  const base = git(root, 'rev-parse', 'HEAD');

  write(root, 'scripts/tool.js', 'changed tool\n');
  write(root, 'content/en/page.md', 'changed content\n');
  write(root, 'content/en/reference/api/cpp/cpp/cpp.md', 'changed landing\n');
  write(root, 'sidebar-overrides/en/cpp.json', 'override\n');
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'head');
  const head = git(root, 'rev-parse', 'HEAD');

  assert.deepEqual(devOwnedChanges(root, base, head, contract), [
    'content/en/page.md',
    'sidebar-overrides/en/cpp.json',
  ]);
});
