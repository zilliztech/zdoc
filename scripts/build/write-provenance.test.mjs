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
  write(root, 'content/en/guides/content-manifest.json', contentManifest('default', 'docs'));
  write(root, 'generated/en/manifests/reference.json', '{"revision":"en-1"}\n');
  write(root, 'generated/zh-CN/manifests/reference-translations.json', '{"revision":"zh-1"}\n');
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
  manuals: [], navigation: {items: [], secondaryItems: []},
  features: {
    chat: false, askAi: false, feedback: false, cloudSelector: false,
    byoc: false, onpremise: false, agents: false, referenceKinds: [],
  },
  markdown: {remarkPlugins: [], rehypePlugins: []},
  integrations: {}, publicationAdapters: [], staticRoots: [], redirects: {rules: []}, robots: {index: true},
});

const zhProfile = Object.freeze({
  ...profile,
  id: 'zh-CN',
  language: 'zh-Hans',
  outputDir: 'build/zh-CN',
  content: [],
});

const fullEnglishProfile = Object.freeze({
  ...profile,
  content: [
    {id: 'default', sourcePath: 'content/en/guides', routeBasePath: 'docs', sidebarPath: 'config/guides.ts'},
    {id: 'byoc', sourcePath: 'content/en/byoc', routeBasePath: 'docs/byoc', sidebarPath: 'config/byoc.ts'},
    {id: 'reference', sourcePath: 'content/en/reference', routeBasePath: 'reference', sidebarPath: 'config/reference.ts'},
  ],
});

function contentManifest(plugin, legacyPath, overrides = {}) {
  return JSON.stringify({
    schemaVersion: 1,
    site: 'en',
    plugin,
    source: {
      repository: 'zdoc',
      legacyPath,
      commit: 'a'.repeat(40),
      treeId: 'b'.repeat(40),
    },
    inventory: {
      trackedFileCount: 1,
      gitLsTreeSha256: 'c'.repeat(64),
    },
    ...overrides,
  });
}

function commitFullManifests(root) {
  write(root, 'content/en/guides/content-manifest.json', contentManifest('default', 'docs'));
  write(root, 'content/en/byoc/content-manifest.json', contentManifest('byoc', 'docs-byoc'));
  write(root, 'content/en/reference/content-manifest.json', contentManifest('reference', 'reference'));
  execFileSync('git', ['add', '.'], {cwd: root});
  execFileSync('git', ['commit', '-qm', 'content manifests'], {cwd: root});
}

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
  assert.equal(manifest.contentManifests.mode, 'explicit');
  assert.deepEqual(manifest.contentManifests.records.map(record => record.path), [
    'content/en/guides/content-manifest.json',
  ]);
  assert.match(manifest.contentManifests.records[0].sha256, /^[0-9a-f]{64}$/);
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

test('discovers only exact content-root manifests while explicit inputs override discovery', () => {
  const root = fixture();
  const discoveredManifest = run(root, {contentManifests: undefined}).manifest;
  const discovered = discoveredManifest.componentHashes.contentManifests;
  const explicitManifest = run(root).manifest;
  const explicit = explicitManifest.componentHashes.contentManifests;
  assert.equal(discoveredManifest.contentManifests.mode, 'discovered');
  assert.deepEqual(discoveredManifest.contentManifests.records.map(record => record.path), [
    'content/en/guides/content-manifest.json',
  ]);
  assert.equal(explicitManifest.contentManifests.mode, 'explicit');

  fs.appendFileSync(path.join(root, 'generated/en/manifests/reference.json'), 'changed');
  const changed = run(root, {contentManifests: undefined}).manifest.componentHashes.contentManifests;
  assert.equal(changed, discovered);
  assert.equal(run(root).manifest.componentHashes.contentManifests, explicit);

  fs.appendFileSync(path.join(root, 'generated/zh-CN/manifests/reference-translations.json'), 'changed');
  assert.equal(run(root, {contentManifests: undefined}).manifest.componentHashes.contentManifests, changed);

  write(root, 'build/zh-CN/index.html', '<html>zh</html>');
  const zhBefore = writeBuildProvenance({
    repositoryRoot: root,
    site: 'zh-CN',
    buildDirectory: path.join(root, 'build/zh-CN'),
    profile: zhProfile,
    environment: {},
    pnpmVersion: '10.13.1',
  }).manifest.componentHashes.contentManifests;
  fs.appendFileSync(path.join(root, 'generated/zh-CN/manifests/reference-translations.json'), 'changed-again');
  const zhAfter = writeBuildProvenance({
    repositoryRoot: root,
    site: 'zh-CN',
    buildDirectory: path.join(root, 'build/zh-CN'),
    profile: zhProfile,
    environment: {},
    pnpmVersion: '10.13.1',
  }).manifest.componentHashes.contentManifests;
  assert.equal(zhAfter, zhBefore);
});

test('allows empty manifest selection only for a profile without content roots', () => {
  const root = fixture();
  assert.throws(() => run(root, {contentManifests: []}), /content manifest.*required|requires.*manifest/i);
  write(root, 'build/zh-CN/index.html', '<html>zh</html>');
  const result = writeBuildProvenance({
    repositoryRoot: root,
    site: 'zh-CN',
    buildDirectory: path.join(root, 'build/zh-CN'),
    profile: zhProfile,
    contentManifests: [],
    environment: {},
    pnpmVersion: '10.13.1',
  });
  assert.deepEqual(result.manifest.contentManifests, {mode: 'explicit', records: []});
});

test('requires one tracked root manifest for every declared Guides, BYOC, and Reference plugin', () => {
  for (const missing of fullEnglishProfile.content) {
    const root = fixture();
    commitFullManifests(root);
    fs.rmSync(path.join(root, missing.sourcePath, 'content-manifest.json'));
    execFileSync('git', ['add', '-A'], {cwd: root});
    execFileSync('git', ['commit', '-qm', `remove ${missing.id}`], {cwd: root});
    const selected = fullEnglishProfile.content
      .filter(content => content.id !== missing.id)
      .map(content => `${content.sourcePath}/content-manifest.json`);
    assert.throws(() => run(root, {
      profile: fullEnglishProfile,
      contentManifests: selected,
    }), new RegExp(`${missing.id}|${missing.sourcePath}`, 'i'));
  }
});

test('validates manifest site, plugin, legacyPath, and inventory schema against its content root', () => {
  const cases = [
    ['site', {site: 'zh-CN'}],
    ['plugin', {plugin: 'reference'}],
    ['legacyPath', {source: {repository: 'zdoc', legacyPath: '../docs', commit: 'a'.repeat(40), treeId: 'b'.repeat(40)}}],
    ['inventory', {inventory: {trackedFileCount: -1, gitLsTreeSha256: 'bad'}}],
  ];
  for (const [label, overrides] of cases) {
    const root = fixture();
    commitFullManifests(root);
    write(root, 'content/en/guides/content-manifest.json', contentManifest('default', 'docs', overrides));
    assert.throws(() => run(root, {
      profile: fullEnglishProfile,
      contentManifests: fullEnglishProfile.content.map(
        content => `${content.sourcePath}/content-manifest.json`,
      ),
    }), new RegExp(label, 'i'));
  }
});

test('strictly validates a JSON-safe complete site profile before hashing it', () => {
  const root = fixture();
  assert.throws(() => run(root, {profile: {id: 'en'}}), /required|invalid/i);
  assert.throws(() => run(root, {profile: {...profile, unknown: true}}), /unrecognized|unknown/i);
  assert.throws(() => run(root, {profile: {...profile, title: undefined}}), /undefined|JSON-safe/i);
  assert.throws(() => run(root, {profile: {...profile, title() { return 'Docs'; }}}), /function|JSON-safe/i);
  assert.throws(() => run(root, {profile: {...profile, title: Symbol('Docs')}}), /symbol|JSON-safe/i);
  assert.throws(() => run(root, {profile: {...profile, title: 1n}}), /bigint|JSON-safe/i);
  assert.throws(() => run(root, {profile: {...profile, title: new Date()}}), /non-plain|JSON-safe/i);
  const cyclic = {...profile};
  cyclic.self = cyclic;
  assert.throws(() => run(root, {profile: cyclic}), /cycle|JSON-safe/i);
});

test('rejects artifact paths that collide after route normalization', () => {
  const root = fixture();
  write(root, 'build/en/foo.html', '<html>flat</html>');
  write(root, 'build/en/foo/index.html', '<html>index</html>');
  assert.throws(() => run(root), /route collision.*foo\.html.*foo\/index\.html|route collision.*foo\/index\.html.*foo\.html/i);
});

test('truthfully records a dirty working tree without timestamps', () => {
  const root = fixture();
  fs.appendFileSync(path.join(root, 'tracked.txt'), 'dirty\n');
  const {manifest} = run(root);
  assert.equal(manifest.workingTree, 'dirty');
  assert.equal(JSON.stringify(manifest).includes('timestamp'), false);
});

test('external container snapshots are explicit, fail closed, and do not require Git metadata', () => {
  const root = fixture();
  fs.rmSync(path.join(root, '.git'), {recursive: true});

  assert.throws(() => run(root), /git|snapshot|provenance commit/i);
  assert.throws(() => run(root, {
    environment: {ZDOC_PROVENANCE_WORKTREE: 'external-snapshot'},
  }), /commit|40|sha/i);
  assert.throws(() => run(root, {
    environment: {
      ZDOC_PROVENANCE_COMMIT: 'not-a-sha',
      ZDOC_PROVENANCE_WORKTREE: 'external-snapshot',
    },
  }), /commit|40|sha/i);
  assert.throws(() => run(root, {
    environment: {
      ZDOC_PROVENANCE_COMMIT: 'd'.repeat(40),
      ZDOC_PROVENANCE_WORKTREE: 'clean',
    },
  }), /external-snapshot|worktree|mode/i);

  const result = run(root, {
    contentManifests: undefined,
    environment: {
      CI: 'true',
      ZDOC_PROVENANCE_COMMIT: 'd'.repeat(40),
      ZDOC_PROVENANCE_WORKTREE: 'external-snapshot',
    },
  });
  assert.equal(result.manifest.commit, 'd'.repeat(40));
  assert.equal(result.manifest.workingTree, 'external-snapshot');
  assert.equal(result.manifest.contentManifests.mode, 'profile-declared');
  assert.deepEqual(result.manifest.contentManifests.records.map(record => record.path), [
    'content/en/guides/content-manifest.json',
  ]);
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

test('rejects a symlinked build parent without writing outside the repository', () => {
  const root = fixture();
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'outside-build-'));
  fs.rmSync(path.join(root, 'build'), {recursive: true});
  fs.symlinkSync(outside, path.join(root, 'build'));
  fs.mkdirSync(path.join(outside, 'en'));
  assert.throws(() => run(root), /symbolic link/i);
  assert.equal(fs.existsSync(path.join(outside, 'en/build-provenance.json')), false);
});

test('rejects a tracked manifest whose parent directory is replaced by a symlink', () => {
  const root = fixture();
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'outside-manifest-'));
  write(outside, 'content-manifest.json', '{"outside":true}\n');
  fs.rmSync(path.join(root, 'content/en/guides'), {recursive: true});
  fs.symlinkSync(outside, path.join(root, 'content/en/guides'));
  assert.throws(() => run(root), /symbolic link/i);
});

test('atomically replaces an existing hardlink without mutating its victim', () => {
  const root = fixture();
  const victim = path.join(root, 'victim.txt');
  const output = path.join(root, 'build/en/build-provenance.json');
  fs.writeFileSync(victim, 'victim-bytes');
  fs.linkSync(victim, output);
  const victimBefore = fs.statSync(victim);

  run(root);

  const victimAfter = fs.statSync(victim);
  const outputAfter = fs.statSync(output);
  assert.equal(fs.readFileSync(victim, 'utf8'), 'victim-bytes');
  assert.equal(victimAfter.ino, victimBefore.ino);
  assert.notEqual(outputAfter.ino, victimAfter.ino);
  assert.equal(outputAfter.mode & 0o777, 0o644);
  assert.equal(fs.lstatSync(output).isFile(), true);
});

test('atomically replaces existing symlink and FIFO outputs without opening their targets', () => {
  for (const outputKind of ['symlink', 'fifo']) {
    const root = fixture();
    const victim = path.join(root, 'victim.txt');
    const output = path.join(root, 'build/en/build-provenance.json');
    fs.writeFileSync(victim, 'victim-bytes');
    if (outputKind === 'symlink') fs.symlinkSync(victim, output);
    else execFileSync('mkfifo', [output]);

    run(root);

    assert.equal(fs.readFileSync(victim, 'utf8'), 'victim-bytes');
    assert.equal(fs.lstatSync(output).isFile(), true);
  }
});

test('does not replace a provenance directory and cleans its temporary file', () => {
  const root = fixture();
  const output = path.join(root, 'build/en/build-provenance.json');
  fs.mkdirSync(output);
  assert.throws(() => run(root), /directory|rename|EISDIR|ENOTDIR/i);
  assert.equal(fs.lstatSync(output).isDirectory(), true);
  assert.deepEqual(
    fs.readdirSync(path.join(root, 'build/en')).filter(name => name.includes('build-provenance') && name.endsWith('.tmp')),
    [],
  );
});
