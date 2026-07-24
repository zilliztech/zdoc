import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {writeBuildProvenance} from './write-provenance.mjs';

function write(root, name, contents, mode) {
  const target = path.join(root, name);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, contents);
  if (mode !== undefined) fs.chmodSync(target, mode);
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'build-provenance-'));
  execFileSync('git', ['init', '-q'], {cwd: root});
  execFileSync('git', ['config', 'user.email', 'test@example.com'], {cwd: root});
  execFileSync('git', ['config', 'user.name', 'Test'], {cwd: root});
  write(root, '.gitignore', 'build/\n');
  write(root, 'pnpm-lock.yaml', 'lockfileVersion: 9\n');
  write(root, 'migration/dependencies.json', '{"dependencies":[]}\n');
  write(root, 'migration/legacy-files.json', '{"files":[]}\n');
  write(root, 'content/en/guides/content-manifest.json', '{"pages":["docs"]}\n');
  write(root, 'tracked.txt', 'tracked\n');
  execFileSync('git', ['add', '.'], {cwd: root});
  execFileSync('git', ['commit', '-qm', 'fixture'], {cwd: root});
  write(root, 'build/en/index.html', '<html>home</html>');
  write(root, 'build/en/docs/index.html', '<html>docs</html>', 0o644);
  return root;
}

const profile = Object.freeze({
  id: 'en', language: 'en', title: 'Docs', url: 'https://docs.example.com', baseUrl: '/', outputDir: 'build/en',
  content: [{id: 'default', sourcePath: 'content/en/guides', routeBasePath: 'docs', sidebarPath: 'config/sidebar.ts'}],
  manuals: [], navigation: {items: []}, features: {chat: false}, markdown: {remarkPlugins: [], rehypePlugins: []},
  integrations: {}, staticRoots: [], redirects: {rules: []}, robots: {index: true},
});

function run(root, overrides = {}) {
  return writeBuildProvenance({
    repositoryRoot: root,
    site: 'en',
    buildDirectory: path.join(root, 'build/en'),
    profile,
    contentManifests: ['content/en/guides/content-manifest.json'],
    environment: {CI: 'true', NODE_ENV: 'production', DATABASE_PASSWORD: 'do-not-record'},
    pnpmVersion: '10.13.1',
    ...overrides,
  });
}

test('writes canonical byte-identical provenance with required components and no secret values', () => {
  const root = fixture();
  const first = run(root);
  const bytes = fs.readFileSync(first.outputPath, 'utf8');
  const second = run(root);
  assert.equal(fs.readFileSync(second.outputPath, 'utf8'), bytes);

  const manifest = JSON.parse(bytes);
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.repository, 'zdoc');
  assert.match(manifest.commit, /^[0-9a-f]{40}$/);
  assert.equal(manifest.site, 'en');
  assert.equal(manifest.workingTree, 'clean');
  assert.deepEqual(Object.keys(manifest.componentHashes).sort(), [
    'contentManifests', 'dependencies', 'environment', 'legacyFiles', 'lockfile', 'profile', 'routes',
  ]);
  assert.deepEqual(manifest.environmentFields, ['CI', 'NODE_ENV']);
  assert.deepEqual(manifest.routes, ['/', '/docs']);
  assert.deepEqual(manifest.toolchain, {node: process.versions.node, pnpm: '10.13.1'});
  assert.match(manifest.artifactHash, /^[0-9a-f]{64}$/);
  assert.equal(bytes.includes('do-not-record'), false);
  assert.equal(bytes.includes('DATABASE_PASSWORD'), false);
});

test('changes the artifact hash when artifact bytes change and self-excludes provenance', () => {
  const root = fixture();
  const original = run(root).manifest.artifactHash;
  assert.equal(run(root).manifest.artifactHash, original);
  fs.appendFileSync(path.join(root, 'build/en/docs/index.html'), 'changed');
  assert.notEqual(run(root).manifest.artifactHash, original);
});

test('truthfully records a dirty working tree without timestamps', () => {
  const root = fixture();
  fs.appendFileSync(path.join(root, 'tracked.txt'), 'dirty\n');
  const {manifest} = run(root);
  assert.equal(manifest.workingTree, 'dirty');
  assert.equal(JSON.stringify(manifest).includes('timestamp'), false);
});

test('rejects wrong sites, escaped paths, symlinks, and missing required inputs', () => {
  const root = fixture();
  assert.throws(() => run(root, {site: 'zh-CN'}), /profile.*site|site.*profile/i);
  assert.throws(() => run(root, {buildDirectory: path.dirname(root)}), /build.*build\/en|confined/i);
  assert.throws(() => run(root, {contentManifests: ['../outside.json']}), /repository|escape|relative/i);
  assert.throws(() => run(root, {contentManifests: ['content/en/missing.json']}), /missing/i);
  fs.symlinkSync(path.join(root, 'tracked.txt'), path.join(root, 'build/en/link'));
  assert.throws(() => run(root), /symbolic link/i);
});
