'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {execFileSync} = require('node:child_process');

const {
  DOCS_REF_PATHS,
  assertDisjointOwnership,
  assertSafeGitRef,
  resolveCommit,
  restoreOwnedPaths,
} = require('./resolve-docs-refs');

function git(cwd, args) {
  return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim();
}

function write(root, relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, content);
}

function repositoryFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-docs-refs-'));
  git(root, ['init', '-q']);
  git(root, ['config', 'user.name', 'Test']);
  git(root, ['config', 'user.email', 'test@example.com']);
  write(root, 'scripts/tool.js', 'module.exports = "old";\n');
  write(root, 'content/en/page.md', '# old\n');
  write(root, 'generated/en/sidebar.js', 'module.exports=[];\n');
  write(root, 'sidebar-overrides/en/guides.json', '{}\n');
  git(root, ['add', '.']);
  git(root, ['commit', '-qm', 'old']);
  const oldSha = git(root, ['rev-parse', 'HEAD']);
  git(root, ['tag', 'source-v1']);
  write(root, 'scripts/tool.js', 'module.exports = "new";\n');
  write(root, 'content/en/page.md', '# new\n');
  git(root, ['add', '.']);
  git(root, ['commit', '-qm', 'new']);
  git(root, ['branch', 'tooling']);
  return {root, oldSha, newSha: git(root, ['rev-parse', 'HEAD'])};
}

test('declares disjoint tooling and English source ownership', () => {
  assert.deepEqual(DOCS_REF_PATHS.source, ['content/en', 'generated/en', 'sidebar-overrides/en']);
  assert.equal(DOCS_REF_PATHS.tooling.includes('.github/workflows'), true);
  assert.equal(DOCS_REF_PATHS.tooling.includes('packages/docs-tooling'), true);
  assert.doesNotThrow(() => assertDisjointOwnership(DOCS_REF_PATHS));
  assert.throws(
    () => assertDisjointOwnership({tooling: ['content'], source: ['content/en']}),
    /overlap/i,
  );
});

test('accepts a branch, tag, or exact SHA and rejects unsafe refs', () => {
  const {root, oldSha, newSha} = repositoryFixture();
  for (const ref of ['tooling', 'source-v1', oldSha]) assert.doesNotThrow(() => assertSafeGitRef(ref));
  for (const ref of ['-bad', 'bad:ref', 'bad\nref', 'bad..ref', 'bad@{ref', 'refs/heads/x.lock']) {
    assert.throws(() => assertSafeGitRef(ref), /unsafe/i);
  }
  assert.equal(resolveCommit({cwd: root, ref: 'tooling'}), newSha);
  assert.equal(resolveCommit({cwd: root, ref: 'source-v1'}), oldSha);
  assert.equal(resolveCommit({cwd: root, ref: oldSha}), oldSha);
});

test('restores only source-owned paths into a tooling checkout', () => {
  const {root, oldSha} = repositoryFixture();
  restoreOwnedPaths({cwd: root, sourceSha: oldSha});
  assert.equal(fs.readFileSync(path.join(root, 'content/en/page.md'), 'utf8'), '# old\n');
  assert.equal(fs.readFileSync(path.join(root, 'scripts/tool.js'), 'utf8'), 'module.exports = "new";\n');
});
