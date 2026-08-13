'use strict';

const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  assessLegacyBootstrap,
  markBootstrapComplete,
  resolveBootstrapDecision,
  resolveTranslationMode,
} = require('./bootstrap-state');

test('auto selects full until the group bootstrap is complete', () => {
  assert.equal(resolveTranslationMode({requestedMode: 'auto', bootstrapCompletedGroups: [], group: 'python'}), 'full');
  assert.equal(resolveTranslationMode({requestedMode: 'auto', bootstrapCompletedGroups: ['python'], group: 'python'}), 'incremental');
  assert.equal(resolveTranslationMode({requestedMode: 'full', bootstrapCompletedGroups: ['python'], group: 'python'}), 'full');
  assert.throws(
    () => resolveTranslationMode({requestedMode: 'incremental', bootstrapCompletedGroups: [], group: 'python'}),
    /bootstrap/i,
  );
});

function sha256(value) {
  return require('node:crypto').createHash('sha256').update(value).digest('hex');
}

function referenceFixture(overrides = {}) {
  const sourcePath = 'content/en/reference/api/python/python/page.md';
  const targetPath = 'content/zh-CN/reference/api/python/python/page.md';
  const source = '# source\n';
  const targetContents = '# translated\n';
  return {
    target: 'zh-CN-reference',
    group: 'python',
    repositoryRoot: overrides.repositoryRoot,
    sourceManifest: {
      schemaVersion: 1,
      sourceCommit: 'a'.repeat(40),
      records: [{manual: 'python', sourcePath, sourceHash: sha256(source)}],
    },
    state: {
      schemaVersion: 1,
      records: [{
        manual: 'python', sourcePath, targetPath, sourceCommit: 'a'.repeat(40),
        sourceHash: sha256(source), targetHash: sha256(targetContents), status: 'translated',
      }],
    },
    sourcePath,
    targetPath,
    source,
    targetContents,
    ...overrides,
  };
}

const REFERENCE_LANDING_SOURCES = [
  'content/en/reference/api/python/python/python.md',
  'content/en/reference/api/java/java/java.md',
  'content/en/reference/api/nodejs/nodejs/nodejs.md',
  'content/en/reference/api/go/go/go.md',
  'content/en/reference/cli/cli/Overview.md',
];

function referenceLandingsFixture({state = {}, targetFiles = true} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-landings-'));
  const sourceCommit = 'c'.repeat(40);
  const sourceManifest = {
    schemaVersion: 1,
    sourceCommit,
    records: REFERENCE_LANDING_SOURCES.map(sourcePath => ({
      manual: sourcePath.includes('/api/python/') ? 'python'
        : sourcePath.includes('/api/java/') ? 'java'
          : sourcePath.includes('/api/nodejs/') ? 'node'
            : sourcePath.includes('/api/go/') ? 'go' : 'cli',
      sourcePath,
      sourceHash: sha256(`# ${sourcePath}\n`),
    })).sort((left, right) => left.manual.localeCompare(right.manual) || left.sourcePath.localeCompare(right.sourcePath)),
  };
  const records = sourceManifest.records.map(source => {
    const targetPath = source.sourcePath.replace('content/en/', 'content/zh-CN/');
    return {
      manual: source.manual,
      sourcePath: source.sourcePath,
      targetPath,
      sourceCommit,
      sourceHash: source.sourceHash,
      targetHash: sha256(`# translated ${source.sourcePath}\n`),
      status: 'translated',
    };
  });
  for (const source of sourceManifest.records) {
    fs.mkdirSync(path.dirname(path.join(root, source.sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, source.sourcePath), `# ${source.sourcePath}\n`);
  }
  if (targetFiles) {
    for (const record of records) {
      fs.mkdirSync(path.dirname(path.join(root, record.targetPath)), {recursive: true});
      fs.writeFileSync(path.join(root, record.targetPath), `# translated ${record.sourcePath}\n`);
    }
  }
  return {
    root,
    sourceManifest,
    state: {schemaVersion: 1, records, ...state},
    sourceCommit,
    records,
  };
}

test('auto repairs a complete legacy Reference group and resolves incremental', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-repair-'));
  try {
    const fixture = referenceFixture({repositoryRoot: root});
    fs.mkdirSync(path.dirname(path.join(root, fixture.sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.sourcePath), fixture.source);
    fs.mkdirSync(path.dirname(path.join(root, fixture.targetPath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.targetPath), fixture.targetContents);
    const decision = resolveBootstrapDecision(fixture);
    assert.equal(decision.mode, 'incremental');
    assert.equal(decision.status, 'safe_repair');
    assert.equal(decision.state, undefined);
    assert.match(decision.summary, /repaired/i);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('auto keeps genuine empty Reference state as explicit full bootstrap', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-empty-'));
  try {
    const fixture = referenceFixture({repositoryRoot: root});
    fs.mkdirSync(path.dirname(path.join(root, fixture.sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.sourcePath), fixture.source);
    const decision = resolveBootstrapDecision({...fixture, state: {schemaVersion: 1, records: []}});
    assert.equal(decision.mode, 'full');
    assert.equal(decision.status, 'empty');
    assert.equal(decision.state, undefined);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('empty manifest with an existing canonical Chinese target fails closed', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-seeded-target-'));
  try {
    const fixture = referenceFixture({repositoryRoot: root});
    fs.mkdirSync(path.dirname(path.join(root, fixture.sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.sourcePath), fixture.source);
    fs.mkdirSync(path.dirname(path.join(root, fixture.targetPath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.targetPath), fixture.targetContents);
    assert.throws(() => resolveBootstrapDecision({...fixture, state: {schemaVersion: 1, records: []}}), /existing|target|empty|inconsistent/i);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('empty manifest with a stale target-only group file also fails closed', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-stale-target-'));
  try {
    const fixture = referenceFixture({repositoryRoot: root});
    fs.mkdirSync(path.dirname(path.join(root, fixture.sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.sourcePath), fixture.source);
    const staleTarget = 'content/zh-CN/reference/api/python/python/retired.md';
    fs.mkdirSync(path.dirname(path.join(root, staleTarget)), {recursive: true});
    fs.writeFileSync(path.join(root, staleTarget), '# stale\n');
    assert.throws(() => resolveBootstrapDecision({...fixture, state: {schemaVersion: 1, records: []}}), /existing|target|empty|inconsistent/i);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('empty manifest allows an existing canonical target directory without Markdown files', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-empty-directory-'));
  try {
    const fixture = referenceFixture({repositoryRoot: root});
    fs.mkdirSync(path.dirname(path.join(root, fixture.sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.sourcePath), fixture.source);
    fs.mkdirSync(path.join(root, 'content/zh-CN/reference/api/python'), {recursive: true});
    fs.writeFileSync(path.join(root, 'content/zh-CN/reference/api/python/README.txt'), 'bootstrap placeholder\n');
    const decision = resolveBootstrapDecision({...fixture, state: {schemaVersion: 1, records: []}});
    assert.equal(decision.status, 'empty');
    assert.equal(decision.mode, 'full');
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('empty manifest fails closed when the canonical target root is a symlink', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-symlink-directory-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-symlink-directory-outside-'));
  try {
    const fixture = referenceFixture({repositoryRoot: root});
    fs.mkdirSync(path.dirname(path.join(root, fixture.sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.sourcePath), fixture.source);
    fs.mkdirSync(path.join(outside, 'python'), {recursive: true});
    fs.mkdirSync(path.join(root, 'content/zh-CN/reference/api'), {recursive: true});
    fs.symlinkSync(path.join(outside, 'python'), path.join(root, 'content/zh-CN/reference/api/python'));
    assert.throws(() => resolveBootstrapDecision({...fixture, state: {schemaVersion: 1, records: []}}), /symlink|target group|regular/i);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
    fs.rmSync(outside, {recursive: true, force: true});
  }
});

test('Reference landing state without a marker repairs incrementally by canonical landing paths', () => {
  const fixture = referenceLandingsFixture();
  try {
    const decision = resolveBootstrapDecision({
      target: 'zh-CN-reference', group: 'reference-landings',
      state: fixture.state, sourceManifest: fixture.sourceManifest, repositoryRoot: fixture.root,
    });
    assert.equal(decision.status, 'safe_repair');
    assert.equal(decision.mode, 'incremental');
    assert.equal(decision.pendingCount, 0);
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true});
  }
});

test('Reference landing empty state permits full bootstrap only when landing targets are absent', () => {
  const empty = referenceLandingsFixture({targetFiles: false});
  try {
    fs.mkdirSync(path.join(empty.root, 'content/zh-CN/reference/api/python/python'), {recursive: true});
    fs.writeFileSync(path.join(empty.root, 'content/zh-CN/reference/api/python/python/non-landing.md'), '# Existing SDK page\n');
    const decision = resolveBootstrapDecision({
      target: 'zh-CN-reference', group: 'reference-landings',
      state: {schemaVersion: 1, records: []}, sourceManifest: empty.sourceManifest, repositoryRoot: empty.root,
    });
    assert.equal(decision.status, 'empty');
    assert.equal(decision.mode, 'full');
  } finally {
    fs.rmSync(empty.root, {recursive: true, force: true});
  }

  const seeded = referenceLandingsFixture({targetFiles: true});
  try {
    assert.throws(() => resolveBootstrapDecision({
      target: 'zh-CN-reference', group: 'reference-landings',
      state: {schemaVersion: 1, records: []}, sourceManifest: seeded.sourceManifest, repositoryRoot: seeded.root,
    }), /existing|target|inconsistent/i);
  } finally {
    fs.rmSync(seeded.root, {recursive: true, force: true});
  }
});

test('Reference landing pending and changed records remain fail-closed and checkpoint-bound', () => {
  const fixture = referenceLandingsFixture();
  try {
    const pendingSource = fixture.sourceManifest.records[0];
    const pendingTarget = pendingSource.sourcePath.replace('content/en/', 'content/zh-CN/');
    fixture.state.records = fixture.state.records.slice(1);
    fixture.state.pendingRecords = [{
      manual: pendingSource.manual, sourcePath: pendingSource.sourcePath, targetPath: pendingTarget,
      sourceCommit: fixture.sourceCommit, sourceHash: pendingSource.sourceHash,
    }];
    fs.rmSync(path.join(fixture.root, pendingTarget));
    const repaired = resolveBootstrapDecision({
      target: 'zh-CN-reference', group: 'reference-landings',
      state: fixture.state, sourceManifest: fixture.sourceManifest, repositoryRoot: fixture.root,
    });
    assert.equal(repaired.status, 'safe_repair');
    assert.equal(repaired.pendingCount, 1);

    fixture.state.pendingRecords[0].sourceHash = 'd'.repeat(64);
    assert.throws(() => resolveBootstrapDecision({
      target: 'zh-CN-reference', group: 'reference-landings',
      state: fixture.state, sourceManifest: fixture.sourceManifest, repositoryRoot: fixture.root,
    }), /source hash|inconsistent/i);
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true});
  }
});

test('auto fails closed when legacy Reference state cannot prove complete coverage', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-blocked-'));
  try {
    const fixture = referenceFixture({repositoryRoot: root});
    fixture.state.records[0].sourceHash = 'f'.repeat(64);
    fs.mkdirSync(path.dirname(path.join(root, fixture.sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.sourcePath), fixture.source);
    fs.mkdirSync(path.dirname(path.join(root, fixture.targetPath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.targetPath), fixture.targetContents);
    assert.throws(() => resolveBootstrapDecision(fixture), /inconsistent|source hash|blocked/i);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('auto fails closed on noncanonical target ownership or an unauthenticated target hash', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-target-'));
  try {
    const fixture = referenceFixture({repositoryRoot: root});
    fs.mkdirSync(path.dirname(path.join(root, fixture.sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.sourcePath), fixture.source);
    fs.mkdirSync(path.dirname(path.join(root, fixture.targetPath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.targetPath), '# tampered\n');
    assert.throws(() => resolveBootstrapDecision(fixture), /target hash|inconsistent/i);
    fixture.state.records[0].targetPath = 'content/zh-CN/reference/api/java/page.md';
    assert.throws(() => resolveBootstrapDecision(fixture), /ownership|canonical|inconsistent/i);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('partial-success state with explicit pending record is incrementally maintainable', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-pending-'));
  try {
    const fixture = referenceFixture({repositoryRoot: root});
    const pendingPath = 'content/en/reference/api/python/python/pending.md';
    const pendingTargetPath = 'content/zh-CN/reference/api/python/python/pending.md';
    const pendingSource = '# pending\n';
    fixture.sourceManifest.records.push({manual: 'python', sourcePath: pendingPath, sourceHash: sha256(pendingSource)});
    fixture.state.pendingRecords = [{
      manual: 'python', sourcePath: pendingPath, targetPath: pendingTargetPath,
      sourceCommit: 'a'.repeat(40), sourceHash: sha256(pendingSource),
    }];
    fs.mkdirSync(path.dirname(path.join(root, fixture.sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.sourcePath), fixture.source);
    fs.writeFileSync(path.join(root, pendingPath), pendingSource);
    fs.mkdirSync(path.dirname(path.join(root, fixture.targetPath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.targetPath), fixture.targetContents);
    const decision = resolveBootstrapDecision(fixture);
    assert.equal(decision.mode, 'incremental');
    assert.equal(decision.status, 'safe_repair');
    assert.equal(decision.pendingCount, 1);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('pending provenance must match the current source checkpoint', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-pending-provenance-'));
  try {
    const fixture = referenceFixture({repositoryRoot: root});
    fixture.state.records = [];
    fixture.state.pendingRecords = [{
      manual: 'python', sourcePath: fixture.sourcePath, targetPath: fixture.targetPath,
      sourceCommit: 'b'.repeat(40), sourceHash: sha256(fixture.source),
    }];
    fs.mkdirSync(path.dirname(path.join(root, fixture.sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.sourcePath), fixture.source);
    assert.throws(() => resolveBootstrapDecision(fixture), /pending|source commit|checkpoint|inconsistent/i);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('legacy repair fails closed on malformed source manifest schema', () => {
  const fixture = referenceFixture();
  assert.throws(() => resolveBootstrapDecision({...fixture, sourceManifest: {...fixture.sourceManifest, schemaVersion: 999}}), /schema|invalid|source manifest/i);
  assert.throws(() => resolveBootstrapDecision({...fixture, state: {...fixture.state, schemaVersion: 999}}), /schema|invalid|translation manifest/i);
});

test('legacy repair fails closed on invalid source commit or forbidden manifest fields', () => {
  const fixture = referenceFixture();
  assert.throws(() => resolveBootstrapDecision({...fixture, sourceManifest: {...fixture.sourceManifest, sourceCommit: 'not-a-sha'}}), /schema|invalid|source commit/i);
  assert.throws(() => resolveBootstrapDecision({...fixture, sourceManifest: {...fixture.sourceManifest, unexpected: true}}), /schema|unrecognized|unknown|source manifest/i);
  assert.throws(() => resolveBootstrapDecision({...fixture, state: {...fixture.state, unexpected: true}}), /schema|unrecognized|unknown|translation manifest/i);
});

test('legacy repair rejects extra stale group records outside the current source manifest', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-extra-record-'));
  try {
    const fixture = referenceFixture({repositoryRoot: root});
    const extraSourcePath = 'content/en/reference/api/python/python/stale.md';
    const extraTargetPath = extraSourcePath.replace('content/en/', 'content/zh-CN/');
    fixture.state.pendingRecords = [{
      manual: 'python', sourcePath: extraSourcePath, targetPath: extraTargetPath,
      sourceCommit: 'a'.repeat(40), sourceHash: sha256('# stale\n'),
    }];
    fs.mkdirSync(path.dirname(path.join(root, fixture.sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.sourcePath), fixture.source);
    fs.mkdirSync(path.dirname(path.join(root, fixture.targetPath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.targetPath), fixture.targetContents);
    assert.throws(() => resolveBootstrapDecision(fixture), /extra|stale|current source|inconsistent/i);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('legacy coverage audit accepts valid current language-excluded records', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-excluded-'));
  try {
    const sourcePath = 'content/en/reference/api/restful/restful/page.mdx';
    const targetPath = 'content/zh-CN/reference/api/restful/restful/page.mdx';
    const source = '# REST\n\nexport const specs = {"x-include-langs":["en-US"]}\nexport const endpoint = "/v2/test"\n';
    fs.mkdirSync(path.dirname(path.join(root, sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, sourcePath), source);
    const decision = assessLegacyBootstrap({
      target: 'zh-CN-reference', group: 'rest', repositoryRoot: root,
      sourceManifest: {schemaVersion: 1, sourceCommit: 'a'.repeat(40), records: [{manual: 'rest', sourcePath, sourceHash: sha256(source)}]},
      state: {schemaVersion: 1, records: [], languageExcludedRecords: [{
        manual: 'rest', sourcePath, targetPath, sourceCommit: 'a'.repeat(40), sourceHash: sha256(source),
        locale: 'zh-CN', reason: 'x-include-langs',
      }]},
    });
    assert.equal(decision.mode, 'incremental');
    assert.equal(decision.status, 'safe_repair');
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('language-excluded legacy coverage must preserve current source checkpoint provenance', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-excluded-provenance-'));
  try {
    const sourcePath = 'content/en/reference/api/restful/restful/page.mdx';
    const targetPath = 'content/zh-CN/reference/api/restful/restful/page.mdx';
    const source = '# REST\n\nexport const specs = {"x-include-langs":["en-US"]}\nexport const endpoint = "/v2/test"\n';
    fs.mkdirSync(path.dirname(path.join(root, sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, sourcePath), source);
    assert.throws(() => assessLegacyBootstrap({
      target: 'zh-CN-reference', group: 'rest', repositoryRoot: root,
      sourceManifest: {schemaVersion: 1, sourceCommit: 'a'.repeat(40), records: [{manual: 'rest', sourcePath, sourceHash: sha256(source)}]},
      state: {schemaVersion: 1, records: [], languageExcludedRecords: [{
        manual: 'rest', sourcePath, targetPath, sourceCommit: 'b'.repeat(40), sourceHash: sha256(source),
        locale: 'zh-CN', reason: 'x-include-langs',
      }]},
    }), /source commit|provenance|inconsistent/i);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('generic Chinese Translation cannot resolve OpenAPI-owned REST bootstrap', () => {
  assert.throws(() => resolveBootstrapDecision({
    target: 'zh-CN-reference', group: 'rest',
    state: {schemaVersion: 1, records: []},
    sourceManifest: {schemaVersion: 1, sourceCommit: 'a'.repeat(40), records: []},
  }), /REST|OpenAPI|generic/i);
});

test('explicit full cannot bypass the Chinese REST Translation exclusion', () => {
  assert.throws(() => resolveBootstrapDecision({
    requestedMode: 'full', target: 'zh-CN-reference', group: 'rest',
    state: {schemaVersion: 1, records: []},
  }), /REST|OpenAPI|excluded/i);
});

test('CLI safe repair is ephemeral and does not persist the marker before provider validation', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-cli-repair-'));
  try {
    const fixture = referenceFixture({repositoryRoot: root});
    for (const [relativePath, value] of [
      ['generated/en/manifests/reference.json', fixture.sourceManifest],
      ['generated/zh-CN/manifests/reference-translations.json', fixture.state],
    ]) {
      fs.mkdirSync(path.dirname(path.join(root, relativePath)), {recursive: true});
      fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value)}\n`);
    }
    fs.mkdirSync(path.dirname(path.join(root, fixture.sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.sourcePath), fixture.source);
    fs.mkdirSync(path.dirname(path.join(root, fixture.targetPath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.targetPath), fixture.targetContents);
    const before = fs.readFileSync(path.join(root, 'generated/zh-CN/manifests/reference-translations.json'));
    const result = spawnSync(process.execPath, [
      path.join(__dirname, 'bootstrap-state.js'), 'resolve', '--target', 'zh-CN-reference',
      '--group', 'python', '--mode', 'auto', '--summary-file', 'tmp/decision.json',
    ], {cwd: root, encoding: 'utf8'});
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'incremental');
    assert.deepEqual(fs.readFileSync(path.join(root, 'generated/zh-CN/manifests/reference-translations.json')), before);
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'tmp/decision.json'))).status, 'safe_repair');
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('CLI summary rejects a symlink final path and preserves the outside file', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-summary-final-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-summary-final-outside-'));
  try {
    const fixture = referenceFixture({repositoryRoot: root});
    for (const [relativePath, value] of [
      ['generated/en/manifests/reference.json', fixture.sourceManifest],
      ['generated/zh-CN/manifests/reference-translations.json', fixture.state],
    ]) {
      fs.mkdirSync(path.dirname(path.join(root, relativePath)), {recursive: true});
      fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value)}\n`);
    }
    fs.mkdirSync(path.dirname(path.join(root, fixture.sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.sourcePath), fixture.source);
    fs.mkdirSync(path.dirname(path.join(root, fixture.targetPath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.targetPath), fixture.targetContents);
    const sentinel = path.join(outside, 'summary.json');
    fs.writeFileSync(sentinel, 'outside\n');
    fs.mkdirSync(path.join(root, 'tmp'), {recursive: true});
    fs.symlinkSync(sentinel, path.join(root, 'tmp/decision.json'));
    const result = spawnSync(process.execPath, [
      path.join(__dirname, 'bootstrap-state.js'), 'resolve', '--target', 'zh-CN-reference',
      '--group', 'python', '--mode', 'auto', '--summary-file', 'tmp/decision.json',
    ], {cwd: root, encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.equal(fs.readFileSync(sentinel, 'utf8'), 'outside\n');
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
    fs.rmSync(outside, {recursive: true, force: true});
  }
});

test('CLI summary rejects a symlink ancestor', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-summary-ancestor-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-summary-ancestor-outside-'));
  try {
    const fixture = referenceFixture({repositoryRoot: root});
    for (const [relativePath, value] of [
      ['generated/en/manifests/reference.json', fixture.sourceManifest],
      ['generated/zh-CN/manifests/reference-translations.json', fixture.state],
    ]) {
      fs.mkdirSync(path.dirname(path.join(root, relativePath)), {recursive: true});
      fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value)}\n`);
    }
    fs.mkdirSync(path.dirname(path.join(root, fixture.sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.sourcePath), fixture.source);
    fs.mkdirSync(path.dirname(path.join(root, fixture.targetPath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.targetPath), fixture.targetContents);
    fs.symlinkSync(outside, path.join(root, 'tmp'));
    const result = spawnSync(process.execPath, [
      path.join(__dirname, 'bootstrap-state.js'), 'resolve', '--target', 'zh-CN-reference',
      '--group', 'python', '--mode', 'auto', '--summary-file', 'tmp/decision.json',
    ], {cwd: root, encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.equal(fs.readdirSync(outside).length, 0);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
    fs.rmSync(outside, {recursive: true, force: true});
  }
});

test('CLI summary rejects absolute and escaping paths', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-summary-root-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-summary-root-outside-'));
  try {
    const fixture = referenceFixture({repositoryRoot: root});
    for (const [relativePath, value] of [
      ['generated/en/manifests/reference.json', fixture.sourceManifest],
      ['generated/zh-CN/manifests/reference-translations.json', fixture.state],
    ]) {
      fs.mkdirSync(path.dirname(path.join(root, relativePath)), {recursive: true});
      fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value)}\n`);
    }
    fs.mkdirSync(path.dirname(path.join(root, fixture.sourcePath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.sourcePath), fixture.source);
    fs.mkdirSync(path.dirname(path.join(root, fixture.targetPath)), {recursive: true});
    fs.writeFileSync(path.join(root, fixture.targetPath), fixture.targetContents);
    for (const summaryPath of [path.join(outside, 'absolute.json'), '../escaping.json']) {
      const result = spawnSync(process.execPath, [
        path.join(__dirname, 'bootstrap-state.js'), 'resolve', '--target', 'zh-CN-reference',
        '--group', 'python', '--mode', 'auto', '--summary-file', summaryPath,
      ], {cwd: root, encoding: 'utf8'});
      assert.notEqual(result.status, 0, `${summaryPath} unexpectedly succeeded`);
    }
    assert.equal(fs.readdirSync(outside).length, 0);
    assert.equal(fs.existsSync(path.join(path.dirname(root), 'escaping.json')), false);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
    fs.rmSync(outside, {recursive: true, force: true});
  }
});

test('explicit full remains explicit and never claims a legacy repair', () => {
  const decision = resolveBootstrapDecision({
    requestedMode: 'full', target: 'zh-CN-reference', group: 'python',
    state: {schemaVersion: 1, records: [{legacy: true}]},
  });
  assert.equal(decision.mode, 'full');
  assert.equal(decision.status, 'explicit_full');
  assert.equal(decision.state, undefined);
});

test('marks a completed group once and preserves canonical order', () => {
  const manifest = {schemaVersion: 1, bootstrapCompletedGroups: ['python'], records: []};
  assert.deepEqual(markBootstrapComplete({manifest, group: 'java'}).bootstrapCompletedGroups, ['java', 'python']);
  assert.deepEqual(markBootstrapComplete({manifest, group: 'python'}).bootstrapCompletedGroups, ['python']);
});

test('mark command preserves the master-owned retirement registry byte-for-byte', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-state-'));
  try {
    const statePath = 'generated/zh-CN/manifests/reference-translations.json';
    const registryPath = 'config/reference-retirements.json';
    const revived = {
      manual: 'python',
      sourcePath: 'content/en/reference/api/python/revived.md',
      targetPath: 'content/zh-CN/reference/api/python/revived.md',
      changeKind: null,
      rationale: 'Imported baseline retirement from the clean-room Reference migration',
    };
    const retained = {
      manual: 'java',
      sourcePath: 'content/en/reference/api/java/retired.md',
      targetPath: 'content/zh-CN/reference/api/java/retired.md',
      changeKind: null,
      rationale: 'Imported baseline retirement from the clean-room Reference migration',
    };
    const registryBytes = Buffer.from(`${JSON.stringify({schemaVersion: 2, retirements: [retained, revived]}, null, 4)}\n`);
    for (const [relativePath, value] of [
      [statePath, {schemaVersion: 1, records: []}],
    ]) {
      fs.mkdirSync(path.dirname(path.join(root, relativePath)), {recursive: true});
      fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value)}\n`);
    }
    fs.mkdirSync(path.dirname(path.join(root, registryPath)), {recursive: true});
    fs.writeFileSync(path.join(root, registryPath), registryBytes);
    for (const relativePath of [revived.sourcePath, revived.targetPath, retained.targetPath]) {
      fs.mkdirSync(path.dirname(path.join(root, relativePath)), {recursive: true});
      fs.writeFileSync(path.join(root, relativePath), 'content\n');
    }
    const result = spawnSync(process.execPath, [path.join(__dirname, 'bootstrap-state.js'), 'mark', '--target', 'zh-CN-reference', '--group', 'python'], {cwd: root, encoding: 'utf8'});
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(fs.readFileSync(path.join(root, registryPath)), registryBytes);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, statePath), 'utf8')).bootstrapCompletedGroups, ['python']);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test('mark fails closed on malicious temporary, final, and ancestor symlinks', () => {
  const statePath = 'generated/zh-CN/manifests/reference-translations.json';
  const registryPath = 'config/reference-retirements.json';
  for (const attack of ['temporary', 'final', 'ancestor']) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), `bootstrap-state-${attack}-`));
    try {
      const outside = fs.mkdtempSync(path.join(os.tmpdir(), `bootstrap-state-${attack}-outside-`));
      const policyBytes = Buffer.from('{"schemaVersion":2,"retirements":[]}\n');
      const stateBytes = Buffer.from('{"schemaVersion":1,"records":[]}\n');
      const sentinelPath = path.join(outside, 'sentinel.json');
      const sentinelBytes = Buffer.from('{"sentinel":true}\n');
      fs.mkdirSync(path.dirname(path.join(root, registryPath)), {recursive: true});
      fs.mkdirSync(path.dirname(path.join(root, statePath)), {recursive: true});
      fs.writeFileSync(path.join(root, registryPath), policyBytes);
      fs.writeFileSync(sentinelPath, sentinelBytes);

      if (attack === 'temporary') {
        fs.writeFileSync(path.join(root, statePath), stateBytes);
        fs.symlinkSync(path.join(root, registryPath), path.join(root, `${statePath}.tmp`));
      } else if (attack === 'final') {
        fs.writeFileSync(path.join(outside, 'state.json'), stateBytes);
        fs.symlinkSync(path.join(outside, 'state.json'), path.join(root, statePath));
      } else {
        fs.rmSync(path.dirname(path.join(root, statePath)), {recursive: true});
        fs.mkdirSync(path.join(outside, 'manifests'), {recursive: true});
        fs.writeFileSync(path.join(outside, 'manifests/reference-translations.json'), stateBytes);
        fs.symlinkSync(path.join(outside, 'manifests'), path.dirname(path.join(root, statePath)));
      }

      const beforeState = fs.lstatSync(path.join(root, statePath));
      const result = spawnSync(process.execPath, [path.join(__dirname, 'bootstrap-state.js'), 'mark', '--target', 'zh-CN-reference', '--group', 'python'], {cwd: root, encoding: 'utf8'});

      assert.notEqual(result.status, 0, `${attack} attack unexpectedly succeeded`);
      assert.deepEqual(fs.readFileSync(path.join(root, registryPath)), policyBytes);
      assert.deepEqual(fs.readFileSync(sentinelPath), sentinelBytes);
      const afterState = fs.lstatSync(path.join(root, statePath));
      assert.equal(afterState.isSymbolicLink(), beforeState.isSymbolicLink());
      assert.deepEqual(fs.readFileSync(path.join(root, statePath)), stateBytes);
    } finally {
      fs.rmSync(root, {recursive: true, force: true});
    }
  }
});
