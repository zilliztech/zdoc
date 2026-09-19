'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  buildAgenticTaskPrompt,
  buildRepairPrompt,
  createUsageTracker,
  parseCliArgs,
  preflightAgent,
  reuseRestoredTranslation,
  runAgenticFile,
  runAgenticTranslation,
  stylePromptPathFor,
  validatorCommandFor,
} = require('./agenticProvider');
const {isConsistentSuccessfulReview, successfulReview} = require('./reviewEvidence');

const GE = 'content/en/guides';
const GJ = 'i18n/ja-JP/docusaurus-plugin-content-docs/current';

function write(root, relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, content);
}

async function withSite(run) {
  const siteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentic-provider-'));
  try {
    return await run(siteDir);
  } finally {
    fs.rmSync(siteDir, {recursive: true, force: true});
  }
}

function jaFixture() {
  return {
    sourcePath: `${GE}/dev/limits.md`,
    targetPath: `${GJ}/dev/limits.md`,
    sourceHash: 'a'.repeat(64),
    locale: 'ja-JP',
    type: 'guides',
  };
}

const EN_SOURCE = `---\ntitle: Limits\nslug: /limits\n---\n\n# Limits\n\nThe collection limits apply per cluster. See [docs](./other).\n`;
const JA_CLEAN = `---\ntitle: 制限\nslug: /limits\n---\n\n# 制限\n\nコレクションの制限はクラスターごとに適用されます。[docs](./other) を参照してください。\n`;
const JA_TRANSLATED_LINK = `---\ntitle: 制限\nslug: /limits\n---\n\n# 制限\n\nコレクションの制限はクラスターごとに適用されます。[ドキュメント](./その他) を参照してください。\n`;

test('stylePromptPathFor resolves per target without hardcoding ja', () => {
  assert.equal(stylePromptPathFor('ja-JP'), 'codex-style-guide.ja-JP.md');
  assert.equal(stylePromptPathFor('zh-CN-reference'), 'codex-style-guide.zh-CN-reference.md');
});

test('task prompt is locale-agnostic and references the registered style guide only when present', () => {
  const item = jaFixture();
  const withStyle = buildAgenticTaskPrompt({item, target: 'ja-JP', siteDir: '/site', stylePromptPath: stylePromptPathFor('ja-JP'), validatorCommand: 'node validate.js'});
  assert.match(withStyle, /codex-style-guide\.ja-JP\.md/);
  assert.match(withStyle, /<locale_contract>/);
  assert.match(withStyle, /node validate\.js/);
  const zh = buildAgenticTaskPrompt({item, target: 'zh-CN-reference', siteDir: '/site', stylePromptPath: stylePromptPathFor('zh-CN-reference'), validatorCommand: 'node validate.js'});
  assert.match(zh, /codex-style-guide\.zh-CN-reference\.md/);
  assert.match(zh, /zh-CN/);
});

test('repair prompt bounds and quotes violations with the validator command', () => {
  const prompt = buildRepairPrompt({item: jaFixture(), target: 'ja-JP', violations: ['a'.repeat(600), 'second'], validatorCommand: 'node v.js'});
  assert.match(prompt, /failed deterministic validation/);
  assert.match(prompt, /- a{600}/);
  assert.match(prompt, /- second/);
  assert.match(prompt, /node v\.js/);
});

test('runAgenticTranslation isolates a session that never wrote the draft', async () => {
  await withSite(async siteDir => {
    const items = [jaFixture(), {...jaFixture(), sourcePath: `${GE}/dev/second.md`, targetPath: `${GJ}/dev/second.md`}];
    write(siteDir, items[0].sourcePath, EN_SOURCE);
    write(siteDir, items[1].sourcePath, EN_SOURCE);
    const report = await runAgenticTranslation({
      siteDir,
      manifest: {target: 'ja-JP', locale: 'ja-JP', group: 'guides', items},
      callCodex: async ({item, phase}) => {
        if (item.sourcePath.endsWith('limits.md')) {
          // Simulate a session that completes without acting: no draft file.
          return 'I could not complete the task because of a sandbox denial.';
        }
        write(siteDir, item.targetPath, JA_CLEAN);
        return 'DONE';
      },
      concurrency: 2,
    });
    assert.equal(report.checkpoint.processed, 2);
    assert.equal(report.checkpoint.translated, 1);
    assert.equal(report.checkpoint.failed, 1);
    const failed = report.results.find(result => result.status === 'failed');
    assert.match(failed.error, /without writing/);
    assert.match(failed.error, /sandbox denial/);
    assert.equal(failed.failureCategory, 'unknown');
    assert.deepEqual(failed.attempts, []);
    const translated = report.results.find(result => result.status === 'translated');
    assert.ok(translated);
    assert.ok(isConsistentSuccessfulReview(translated.review));
  });
});

test('runAgenticFile fails with the agent reply tail when the turn writes nothing', async () => {
  await withSite(async siteDir => {
    write(siteDir, jaFixture().sourcePath, EN_SOURCE);
    const lines = [];
    const result = await runAgenticFile({
      item: jaFixture(), target: 'ja-JP', siteDir,
      callCodex: async () => 'TURN REPLY TAIL FOR DIAGNOSIS',
      log: {log: message => lines.push(message)},
    }).catch(error => ({error: String(error.message)}));
    assert.match(result.error, /without writing/);
    assert.match(result.error, /TURN REPLY TAIL FOR DIAGNOSIS/);
  });
});

test('parseCliArgs accepts --codex-home', () => {
  const options = parseCliArgs(['run', '--site-dir', '/tmp/site', '--manifest', 'tmp/m.json', '--report', 'tmp/r.json', '--model', 'm', '--base-url', 'https://x/v1', '--api-key-env', 'KEY', '--codex-home', '/tmp/codex-home']);
  assert.equal(options.codexHome, '/tmp/codex-home');
});

test('preflightAgent passes when the agent writes, the validator runs, and OK is reported', async () => {
  await withSite(async siteDir => {
    const calls = [];
    const result = await preflightAgent({
      siteDir, target: 'ja-JP',
      callCodex: async ({phase, prompt}) => {
        calls.push({phase, prompt});
        const match = prompt.match(/Create the file (\S+) with exactly this content:/);
        assert.ok(match, 'prompt must name the draft file');
        write(siteDir, match[1], '---\ntitle: Preflight output\n---\n\n# Preflight output\n\nThe sentinel word is still zebra.\n');
        return 'OK';
      },
      log: {log: () => {}},
    });
    assert.equal(result.ok, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].phase, 'preflight');
    assert.ok(fs.existsSync(path.join(siteDir, 'tmp', 'agentic-preflight')) === false, 'preflight files must be cleaned up');
  });
});

test('preflightAgent refuses to pass when the agent cannot execute the validator', async () => {
  await withSite(async siteDir => {
    const result = await preflightAgent({
      siteDir, target: 'ja-JP',
      callCodex: async ({prompt}) => {
        const match = prompt.match(/Create the file (\S+) with exactly this content:/);
        write(siteDir, match[1], '---\ntitle: Preflight output\n---\n\n# Preflight output\n\nThe sentinel word is still zebra.\n');
        return 'I could not run the validator command because bwrap could not set up its network namespace.';
      },
      log: {log: () => {}},
    });
    assert.equal(result.ok, false);
    assert.match(result.error, /could not execute the validator command/);
    assert.match(result.error, /bwrap/);
  });
});

test('preflightAgent fails closed when the draft is never written', async () => {
  await withSite(async siteDir => {
    const result = await preflightAgent({
      siteDir, target: 'ja-JP',
      callCodex: async () => 'I declined to act.',
      log: {log: () => {}},
    });
    assert.equal(result.ok, false);
    assert.match(result.error, /did not write the draft/);
    assert.match(result.error, /declined to act/);
  });
});

test('parseCliArgs accepts --sandbox-mode and --skip-preflight', () => {
  const options = parseCliArgs(['run', '--site-dir', '/tmp/site', '--manifest', 'tmp/m.json', '--report', 'tmp/r.json', '--model', 'm', '--base-url', 'https://x/v1', '--api-key-env', 'KEY', '--sandbox-mode', 'danger-full-access', '--skip-preflight', 'true']);
  assert.equal(options.sandboxMode, 'danger-full-access');
  assert.equal(options.skipPreflight, true);
});

test('parseCliArgs validates the run subcommand and required absolute paths', () => {
  assert.throws(() => parseCliArgs(['translate', '--site-dir', '/x']), /Usage:/);
  assert.throws(() => parseCliArgs(['run', '--site-dir', 'relative', '--manifest', 'm.json', '--report', 'r.json', '--model', 'm', '--base-url', 'https://x/v1', '--api-key-env', 'KEY']), /absolute normalized/);
  const options = parseCliArgs(['run', '--site-dir', '/tmp/site', '--manifest', 'tmp/m.json', '--report', 'tmp/r.json', '--model', 'm', '--base-url', 'https://x/v1', '--api-key-env', 'KEY']);
  assert.equal(options.siteDir, '/tmp/site');
  assert.equal(options.concurrency, 2);
  assert.equal(options.recoveryAnalysis, '');
  assert.equal(parseCliArgs(['run', '--site-dir', '/tmp/site', '--manifest', 'tmp/m.json', '--report', 'tmp/r.json', '--model', 'm', '--base-url', 'https://x/v1', '--api-key-env', 'KEY', '--recovery-analysis', 'tmp/recovery-analysis.json']).recoveryAnalysis, 'tmp/recovery-analysis.json');
});

test('runAgenticFile passes a clean draft through the report contract', async () => {
  await withSite(async siteDir => {
    write(siteDir, jaFixture().sourcePath, EN_SOURCE);
    const calls = [];
    const callCodex = async ({phase, prompt}) => {
      calls.push({phase, prompt});
      write(siteDir, jaFixture().targetPath, JA_CLEAN);
      return 'DONE';
    };
    const result = await runAgenticFile({item: jaFixture(), target: 'ja-JP', siteDir, callCodex});
    assert.equal(result.status, 'translated');
    assert.deepEqual(result.attempts, ['translate']);
    assert.ok(isConsistentSuccessfulReview(result.review));
    assert.deepEqual(result.validationErrors, []);
    assert.equal(result.target, 'ja-JP');
    assert.equal(calls.length, 1);
  });
});

test('runAgenticFile repairs bounded rounds and fails closed with bounded evidence', async () => {
  await withSite(async siteDir => {
    write(siteDir, jaFixture().sourcePath, EN_SOURCE);
    let turns = 0;
    const callCodex = async () => {
      turns += 1;
      write(siteDir, jaFixture().targetPath, JA_TRANSLATED_LINK);
      return 'DONE';
    };
    const result = await runAgenticFile({item: jaFixture(), target: 'ja-JP', siteDir, callCodex, maxRepairTurns: 2});
    assert.equal(result.status, 'failed');
    assert.equal(turns, 3);
    assert.ok(result.attempts.length <= 3);
    assert.ok(result.error.length <= 2000);
    assert.ok(['protected_content_failed', 'unknown'].includes(result.failureCategory));
    assert.ok(result.validationErrors.length >= 1);
    assert.ok(result.validationErrors.every(error => String(error).length <= 400));
  });
});

test('runAgenticFile converges when a repair round fixes the violations', async () => {
  await withSite(async siteDir => {
    write(siteDir, jaFixture().sourcePath, EN_SOURCE);
    let turns = 0;
    const callCodex = async () => {
      turns += 1;
      write(siteDir, jaFixture().targetPath, turns === 1 ? JA_TRANSLATED_LINK : JA_CLEAN);
      return 'DONE';
    };
    const result = await runAgenticFile({item: jaFixture(), target: 'ja-JP', siteDir, callCodex, maxRepairTurns: 2});
    assert.equal(result.status, 'translated');
    assert.equal(turns, 2);
    assert.deepEqual(result.attempts, ['translate', 'repair1']);
  });
});

test('runAgenticTranslation emits the agentRunner-compatible report envelope', async () => {
  await withSite(async siteDir => {
    const items = [jaFixture(), {...jaFixture(), sourcePath: `${GE}/dev/second.md`, targetPath: `${GJ}/dev/second.md`}];
    write(siteDir, items[0].sourcePath, EN_SOURCE);
    write(siteDir, items[1].sourcePath, EN_SOURCE);
    const report = await runAgenticTranslation({
      siteDir,
      manifest: {target: 'ja-JP', locale: 'ja-JP', group: 'guides', items},
      callCodex: async ({item}) => {
        write(siteDir, item.targetPath, JA_CLEAN);
        return 'DONE';
      },
      concurrency: 2,
      now: () => Date.parse('2026-09-11T00:00:00.000Z'),
    });
    assert.equal(report.target, 'ja-JP');
    assert.equal(report.locale, 'ja-JP');
    assert.equal(report.results.length, 2);
    assert.ok(report.results.every(result => result.status === 'translated'));
    assert.deepEqual(report.checkpoint, {
      target: 'ja-JP', processed: 2, remaining: 0, translated: 2, failed: 0,
      generatedAt: '2026-09-11T00:00:00.000Z',
    });
    assert.ok(!('semanticCheckpoints' in report.results[0]));
    assert.ok(!('chunkCheckpoints' in report.results[0]));
  });
});

test('runAgenticTranslation reuses restored recovery files without model calls', async () => {
  await withSite(async siteDir => {
    const items = [jaFixture(), {...jaFixture(), sourcePath: `${GE}/dev/second.md`, targetPath: `${GJ}/dev/second.md`}];
    write(siteDir, items[0].sourcePath, EN_SOURCE);
    write(siteDir, items[1].sourcePath, EN_SOURCE);
    write(siteDir, items[0].targetPath, JA_CLEAN);
    const modelCalls = [];
    const report = await runAgenticTranslation({
      siteDir,
      manifest: {target: 'ja-JP', locale: 'ja-JP', group: 'guides', items},
      callCodex: async ({item}) => {
        modelCalls.push(item.sourcePath);
        write(siteDir, item.targetPath, JA_CLEAN);
        return 'DONE';
      },
      recovery: {
        restored: [{
          ...items[0],
          status: 'translated',
          recovered: true,
          recoveryCompatibility: 'strict',
          recoveryReviewReceipt: {schemaVersion: 1},
          review: successfulReview(),
          validationErrors: [],
        }],
        pending: [items[1]],
      },
      concurrency: 2,
    });
    assert.deepEqual(modelCalls, [items[1].sourcePath]);
    assert.equal(report.results[0].status, 'translated');
    assert.equal(report.results[0].recovered, true);
    assert.equal(report.results[0].recoveryCompatibility, 'strict');
    assert.deepEqual(report.results[0].validationErrors, []);
    assert.ok(isConsistentSuccessfulReview(report.results[0].review));
    assert.equal(report.results[0].recoveryReviewReceipt.schemaVersion, 1);
    assert.equal(report.results[1].status, 'translated');
    assert.ok(!('recovered' in report.results[1]));
    assert.equal(report.checkpoint.translated, 2);
    assert.equal(report.checkpoint.failed, 0);
  });
});

test('runAgenticTranslation retranslates a restored file whose recovered draft fails the current gate', async () => {
  await withSite(async siteDir => {
    const items = [jaFixture()];
    write(siteDir, items[0].sourcePath, EN_SOURCE);
    write(siteDir, items[0].targetPath, JA_TRANSLATED_LINK);
    const modelCalls = [];
    const report = await runAgenticTranslation({
      siteDir,
      manifest: {target: 'ja-JP', locale: 'ja-JP', group: 'guides', items},
      callCodex: async ({item}) => {
        modelCalls.push(item.sourcePath);
        write(siteDir, item.targetPath, JA_CLEAN);
        return 'DONE';
      },
      recovery: {
        restored: [{...items[0], status: 'translated', recovered: true, review: successfulReview(), validationErrors: []}],
        pending: [],
      },
      concurrency: 1,
    });
    assert.deepEqual(modelCalls, [items[0].sourcePath]);
    assert.equal(report.results[0].status, 'translated');
    assert.ok(!('recovered' in report.results[0]));
    assert.deepEqual(report.results[0].attempts, ['translate']);
  });
});

test('reuse does not rewrite restored bytes that pass the current gate', async () => {
  await withSite(async siteDir => {
    const item = jaFixture();
    write(siteDir, item.sourcePath, EN_SOURCE);
    write(siteDir, item.targetPath, JA_CLEAN);
    const before = fs.readFileSync(path.join(siteDir, item.targetPath), 'utf8');
    const result = await reuseRestoredTranslation({item, restored: {review: successfulReview(), validationErrors: []}, target: 'ja-JP', siteDir});
    assert.equal(result.status, 'translated');
    assert.equal(result.recovered, true);
    assert.equal(fs.readFileSync(path.join(siteDir, item.targetPath), 'utf8'), before);
  });
});

test('validatorCommandFor renders the repository validator invocation', () => {
  const command = validatorCommandFor('/site', 'ja-JP', jaFixture());
  assert.match(command, /validate-translation-file\.js/);
  assert.match(command, /--site-dir \/site/);
  assert.match(command, /--target ja-JP/);
  assert.match(command, /--write-back false/);
});

test('mergeTranslatedResultsIntoProgressState writes translated results into the cache candidate state', async () => {
  const {mergeTranslatedResultsIntoProgressState} = require('./agenticProvider');
  await withSite(siteDir => {
    const sourcePath = `${GE}/tutorials/home.md`;
    const targetPath = `${GJ}/tutorials/home.md`;
    const manifest = {target: 'ja-JP', locale: 'ja-JP', items: [{sourcePath, targetPath, sourceHash: 'a'.repeat(64)}]};
    const report = {target: 'ja-JP', results: [
      {sourcePath, targetPath, sourceHash: 'b'.repeat(64), status: 'translated'},
      {sourcePath: `${GE}/tutorials/failed.md`, targetPath: `${GJ}/tutorials/failed.md`, sourceHash: 'c'.repeat(64), status: 'failed'},
    ], checkpoint: {generatedAt: '2026-09-14T12:46:16.000Z'}};
    mergeTranslatedResultsIntoProgressState(siteDir, manifest, report);
    const cache = JSON.parse(fs.readFileSync(path.join(siteDir, '.translation-cache/ja-JP.json'), 'utf8'));
    assert.deepEqual(cache.files[sourcePath], {
      sourceHash: 'b'.repeat(64),
      targetPath,
      translatedAt: '2026-09-14T12:46:16.000Z',
    });
    assert.equal(cache.files[`${GE}/tutorials/failed.md`], undefined);
  });
});

test('mergeTranslatedResultsIntoProgressState updates the Chinese Reference manifest for landing translations', async () => {
  const crypto = require('node:crypto');
  const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
  const {mergeTranslatedResultsIntoProgressState} = require('./agenticProvider');
  await withSite(siteDir => {
    const sourceCommit = 'a'.repeat(40);
    const homeSource = 'content/en/guides/tutorials/home.md';
    const homeTarget = 'content/zh-CN/guides/tutorials/home.md';
    const cliSource = 'content/en/reference/cli/cli/Overview.md';
    const cliTarget = 'content/zh-CN/reference/cli/cli/Overview.md';
    const homeEnglish = '# Home (refreshed)\n';
    const cliEnglish = '# Zilliz CLI (refreshed)\n';
    const homeChinese = '# \u4e3b\u9875\n';
    const cliChinese = '# Zilliz CLI \u4e2d\u6587\n';

    write(siteDir, homeSource, homeEnglish);
    write(siteDir, cliSource, cliEnglish);
    write(siteDir, homeTarget, homeChinese);
    write(siteDir, cliTarget, cliChinese);
    write(siteDir, 'generated/en/manifests/reference.json', `${JSON.stringify({
      schemaVersion: 1,
      sourceCommit,
      records: [
        {manual: 'cli', sourcePath: cliSource, sourceHash: sha256(cliEnglish)},
      ],
    })}\n`);
    write(siteDir, 'generated/zh-CN/manifests/reference-translations.json', `${JSON.stringify({
      schemaVersion: 1,
      records: [
        {manual: 'cli', sourcePath: cliSource, targetPath: cliTarget, sourceCommit: 'b'.repeat(40), sourceHash: sha256('# old CLI\n'), targetHash: sha256('# 9a65a7 CLI\n'), status: 'translated'},
      ],
    })}\n`);

    const manifest = {target: 'zh-CN-reference', locale: 'zh-CN-reference', group: 'reference-landings', sourceCheckpointSha: sourceCommit, items: [
      {sourcePath: cliSource, targetPath: cliTarget, sourceHash: sha256(cliEnglish)},
      {sourcePath: homeSource, targetPath: homeTarget, sourceHash: sha256(homeEnglish)},
    ]};
    const report = {target: 'zh-CN-reference', results: [
      {sourcePath: cliSource, targetPath: cliTarget, sourceHash: sha256(cliEnglish), status: 'translated'},
      {sourcePath: homeSource, targetPath: homeTarget, sourceHash: sha256(homeEnglish), status: 'translated'},
    ], checkpoint: {generatedAt: '2026-09-15T01:02:03.000Z'}};

    mergeTranslatedResultsIntoProgressState(siteDir, manifest, report);

    const {parseReferenceTranslationManifest} = require('../lib/load-typescript').loadTypeScript('../../packages/docs-tooling/src/reference/translationManifest.ts');
    const state = parseReferenceTranslationManifest(JSON.parse(fs.readFileSync(path.join(siteDir, 'generated/zh-CN/manifests/reference-translations.json'), 'utf8')));
    const bySource = new Map(state.records.map(record => [record.sourcePath, record]));
    // The reference-tree landing refreshes its record; the Guides home keeps
    // Guides state ownership and is deliberately absent from the manifest.
    assert.equal(bySource.size, 1);
    const cliRecord = bySource.get(cliSource);
    assert.equal(cliRecord.sourceHash, sha256(cliEnglish));
    assert.equal(cliRecord.targetHash, sha256(cliChinese));
    assert.equal(cliRecord.sourceCommit, sourceCommit);
    assert.equal(cliRecord.status, 'translated');
    assert.equal(bySource.has(homeSource), false);
  });
});

const {createHash} = require('node:crypto');
const {loadLocaleContract} = require('./localeContract');
const {collectCurrentUnits, pairOldSourceWithTarget} = require('./semanticSeeds');
const {resolveSeededDraft} = require('./agenticProvider');

function unitHash(text) {
  return createHash('sha256').update(text).digest('hex');
}

// Build a seed report the way semanticSeeds.js does: align the published
// target with the old source, then reuse translations for the current units
// whose English is unchanged. `keep` filters which units stay seeded.
function buildSeedReport({item, target, source = EN_SOURCE, published = JA_CLEAN, keep = () => true}) {
  const translationsByHash = pairOldSourceWithTarget(source, published);
  assert.ok(translationsByHash, 'fixture source and published target must align unit by unit');
  const entries = collectCurrentUnits(source, null)
    .filter(unit => translationsByHash.has(unitHash(unit.source)) && keep(unit))
    .map(unit => ({id: unit.id, sourceHash: unitHash(unit.source), translation: translationsByHash.get(unitHash(unit.source))}));
  assert.ok(entries.length, 'fixture must produce at least one seed entry');
  return {
    schemaVersion: 1,
    sourcePath: item.sourcePath,
    targetPath: item.targetPath,
    sourceHash: item.sourceHash,
    target,
    locale: item.locale,
    contractId: loadLocaleContract(target).contractId,
    entries,
  };
}

test('runAgenticFile seeds a fully covered file without a model call', async () => {
  await withSite(async siteDir => {
    const item = jaFixture();
    write(siteDir, item.sourcePath, EN_SOURCE);
    const result = await runAgenticFile({
      item, target: 'ja-JP', siteDir,
      callCodex: async () => { throw new Error('model must not be called for a fully seeded file') },
      seedReport: buildSeedReport({item, target: 'ja-JP'}),
    });
    assert.equal(result.status, 'translated');
    assert.deepEqual(result.attempts, []);
    assert.ok(result.semanticSeedUnits >= 1);
    assert.ok(isConsistentSuccessfulReview(result.review));
    assert.deepEqual(result.validationErrors, []);
    const draft = fs.readFileSync(path.join(siteDir, item.targetPath), 'utf8');
    assert.match(draft, /# 制限/);
    assert.match(draft, /title: 制限/);
  });
});

test('runAgenticFile hands a partially seeded draft to the agent with the pending units', async () => {
  await withSite(async siteDir => {
    const item = jaFixture();
    write(siteDir, item.sourcePath, EN_SOURCE);
    const prompts = [];
    let draftAtTurn = null;
    const result = await runAgenticFile({
      item, target: 'ja-JP', siteDir,
      callCodex: async ({prompt}) => {
        prompts.push(prompt);
        draftAtTurn = fs.readFileSync(path.join(siteDir, item.targetPath), 'utf8');
        write(siteDir, item.targetPath, JA_CLEAN);
        return 'DONE';
      },
      // Leave the frontmatter title untranslated: the agent must finish it.
      seedReport: buildSeedReport({item, target: 'ja-JP', keep: unit => unit.kind !== 'frontmatter-scalar'}),
    });
    assert.equal(result.status, 'translated');
    assert.deepEqual(result.attempts, ['translate']);
    assert.ok(result.semanticSeedUnits >= 1);
    assert.equal(prompts.length, 1);
    assert.match(prompts[0], /pre-seeded draft/);
    assert.match(prompts[0], /Units still to translate/);
    assert.match(prompts[0], /frontmatter-scalar/);
    assert.doesNotMatch(prompts[0], /# 制限/);
    // The draft handed to the agent already carried the reused translation
    // for every seeded unit, and English only for the pending one.
    assert.match(draftAtTurn, /# 制限/);
    assert.match(draftAtTurn, /title: Limits/);
  });
});

test('runAgenticFile rejects a turn that leaves the seeded draft unchanged', async () => {
  await withSite(async siteDir => {
    const item = jaFixture();
    write(siteDir, item.sourcePath, EN_SOURCE);
    const lines = [];
    const result = await runAgenticFile({
      item, target: 'ja-JP', siteDir,
      callCodex: async () => 'DONE',
      log: {log: message => lines.push(message)},
      seedReport: buildSeedReport({item, target: 'ja-JP', keep: unit => unit.kind !== 'frontmatter-scalar'}),
    }).catch(error => ({error: String(error.message)}));
    assert.match(result.error, /left the seeded draft .* unchanged/);
  });
});

test('runAgenticFile falls back to a fresh translation when the seed report identity mismatches', async () => {
  await withSite(async siteDir => {
    const item = jaFixture();
    write(siteDir, item.sourcePath, EN_SOURCE);
    const lines = [];
    const prompts = [];
    const result = await runAgenticFile({
      item, target: 'ja-JP', siteDir,
      callCodex: async ({prompt}) => {
        prompts.push(prompt);
        write(siteDir, item.targetPath, JA_CLEAN);
        return 'DONE';
      },
      log: {log: message => lines.push(message)},
      seedReport: {...buildSeedReport({item, target: 'ja-JP'}), sourceHash: 'b'.repeat(64)},
    });
    assert.equal(result.status, 'translated');
    assert.deepEqual(result.attempts, ['translate']);
    assert.ok(!('semanticSeedUnits' in result));
    assert.equal(prompts.length, 1);
    assert.doesNotMatch(prompts[0], /pre-seeded draft/);
    assert.ok(lines.some(line => /seeds unusable/.test(line)));
  });
});

test('runAgenticTranslation consumes a semantic seed directory end to end', async () => {
  await withSite(async siteDir => {
    const item = jaFixture();
    write(siteDir, item.sourcePath, EN_SOURCE);
    const seedDir = path.join(siteDir, 'tmp', 'semantic-seeds');
    fs.mkdirSync(seedDir, {recursive: true});
    const report = buildSeedReport({item, target: 'ja-JP'});
    fs.writeFileSync(path.join(seedDir, 'seed-0.json'), `${JSON.stringify(report)}\n`);
    fs.writeFileSync(path.join(seedDir, 'summary.json'), `${JSON.stringify({
      schemaVersion: 1,
      kind: 'semantic-translation-seeds',
      target: 'ja-JP',
      locale: 'ja-JP',
      group: 'guides',
      sourceCheckpointSha: 'c'.repeat(40),
      files: {[item.sourcePath]: {reportFile: 'seed-0.json', reason: null, seededUnits: report.entries.length}},
    })}\n`);
    const translated = await runAgenticTranslation({
      siteDir,
      manifest: {target: 'ja-JP', locale: 'ja-JP', group: 'guides', sourceCheckpointSha: 'c'.repeat(40), items: [item]},
      callCodex: async () => { throw new Error('model must not be called for a fully seeded run') },
      concurrency: 1,
      semanticSeedsDir: seedDir,
    });
    assert.equal(translated.checkpoint.translated, 1);
    assert.equal(translated.checkpoint.failed, 0);
    assert.equal(translated.results[0].status, 'translated');
    assert.ok(translated.results[0].semanticSeedUnits >= 1);
  });
});

test('parseCliArgs accepts --semantic-seeds', () => {
  const options = parseCliArgs(['run', '--site-dir', '/tmp/site', '--manifest', 'tmp/m.json', '--report', 'tmp/r.json', '--model', 'm', '--base-url', 'https://x/v1', '--api-key-env', 'KEY', '--semantic-seeds', 'tmp/semantic-seeds']);
  assert.equal(options.semanticSeeds, 'tmp/semantic-seeds');
  assert.equal(parseCliArgs(['run', '--site-dir', '/tmp/site', '--manifest', 'tmp/m.json', '--report', 'tmp/r.json', '--model', 'm', '--base-url', 'https://x/v1', '--api-key-env', 'KEY']).semanticSeeds, '');
});

test('resolveSeededDraft returns null when no seed entry survives validation', async () => {
  await withSite(async siteDir => {
    const item = jaFixture();
    write(siteDir, item.sourcePath, EN_SOURCE);
    const stale = buildSeedReport({item, target: 'ja-JP'});
    stale.entries = stale.entries.map(entry => ({...entry, sourceHash: 'd'.repeat(64)}));
    assert.equal(resolveSeededDraft({item, target: 'ja-JP', siteDir, chunkOptions: null, seedReport: stale}), null);
  });
});

test('createUsageTracker accumulates turn usage, ignores missing payloads, and logs per turn', () => {
  const lines = [];
  const tracker = createUsageTracker({log: {log: message => lines.push(message)}});
  tracker.record({phase: 'translate', sourcePath: 'a.md', usage: {input_tokens: 100, cached_input_tokens: 40, cache_write_input_tokens: 5, output_tokens: 20, reasoning_output_tokens: 2}});
  tracker.record({phase: 'repair1', sourcePath: 'a.md', usage: {input_tokens: '150', cached_input_tokens: 0, cache_write_input_tokens: 0, output_tokens: 30}});
  tracker.record({phase: 'translate', sourcePath: 'b.md', usage: null});
  const snapshot = tracker.snapshot();
  assert.equal(snapshot.turns, 2);
  assert.equal(snapshot.inputTokens, 250);
  assert.equal(snapshot.cachedInputTokens, 40);
  assert.equal(snapshot.cacheWriteInputTokens, 5);
  assert.equal(snapshot.outputTokens, 50);
  assert.equal(snapshot.reasoningOutputTokens, 2);
  // Snapshots are copies: mutating them must not corrupt the accumulator.
  snapshot.turns = 999;
  assert.equal(tracker.snapshot().turns, 2);
  assert.equal(lines.length, 2);
  assert.match(lines[0], /\[agentic-provider\] usage phase=translate file=a\.md input=100 cached=40 cache-write=5 output=20 reasoning=2/);
  assert.match(lines[1], /phase=repair1/);
});

test('runAgenticTranslation logs a batch overview and a cost summary with token totals', async () => {
  await withSite(async siteDir => {
    const items = [jaFixture(), {...jaFixture(), sourcePath: `${GE}/dev/second.md`, targetPath: `${GJ}/dev/second.md`}];
    write(siteDir, items[0].sourcePath, EN_SOURCE);
    write(siteDir, items[1].sourcePath, EN_SOURCE);
    const lines = [];
    const report = await runAgenticTranslation({
      siteDir,
      manifest: {target: 'ja-JP', locale: 'ja-JP', group: 'guides', items},
      callCodex: async ({item}) => {
        write(siteDir, item.targetPath, JA_CLEAN);
        return 'DONE';
      },
      concurrency: 1,
      log: {log: message => lines.push(message)},
      usageTracker: {
        snapshot: () => ({turns: 2, inputTokens: 9000, cachedInputTokens: 1000, cacheWriteInputTokens: 0, outputTokens: 800, reasoningOutputTokens: 0}),
      },
    });
    assert.equal(report.checkpoint.translated, 2);
    const batchLine = lines.find(line => line.includes('[agentic-provider] batch '));
    assert.ok(batchLine, 'batch overview must be logged before any file work');
    assert.match(batchLine, /target=ja-JP/);
    assert.match(batchLine, /files=2 /);
    assert.match(batchLine, /restored=0 /);
    assert.match(batchLine, /model-files=2 /);
    assert.match(batchLine, /english=\d+KB/);
    assert.ok(lines.findIndex(line => line.includes('[agentic-provider] batch ')) < lines.findIndex(line => line.includes('turn translate')));
    const summaryLine = lines.find(line => line.includes('[agentic-provider] summary '));
    assert.match(summaryLine, /translated=2 failed=0 seeded-full=0 verified-current=0 agent-files=2 repair-turns=0/);
    const tokenLine = lines.find(line => line.includes('[agentic-provider] tokens '));
    assert.match(tokenLine, /turns=2 input=9000 cached=1000 cache-write=0 output=800 reasoning=0/);
  });
});

test('runAgenticTranslation counts fully seeded files and recovery reuse in the cost summary', async () => {
  await withSite(async siteDir => {
    const seededItem = jaFixture();
    const restoredItem = {...jaFixture(), sourcePath: `${GE}/dev/second.md`, targetPath: `${GJ}/dev/second.md`};
    write(siteDir, seededItem.sourcePath, EN_SOURCE);
    write(siteDir, restoredItem.sourcePath, EN_SOURCE);
    write(siteDir, restoredItem.targetPath, JA_CLEAN);
    const lines = [];
    const seedDir = path.join(siteDir, 'tmp', 'semantic-seeds');
    fs.mkdirSync(seedDir, {recursive: true});
    const seedReport = buildSeedReport({item: seededItem, target: 'ja-JP'});
    fs.writeFileSync(path.join(seedDir, 'seed-0.json'), `${JSON.stringify(seedReport)}\n`);
    fs.writeFileSync(path.join(seedDir, 'summary.json'), `${JSON.stringify({
      schemaVersion: 1,
      kind: 'semantic-translation-seeds',
      target: 'ja-JP',
      locale: 'ja-JP',
      group: 'guides',
      sourceCheckpointSha: 'e'.repeat(40),
      files: {[seededItem.sourcePath]: {reportFile: 'seed-0.json', reason: null, seededUnits: seedReport.entries.length}},
    })}\n`);
    const report = await runAgenticTranslation({
      siteDir,
      manifest: {target: 'ja-JP', locale: 'ja-JP', group: 'guides', sourceCheckpointSha: 'e'.repeat(40), items: [seededItem, restoredItem]},
      callCodex: async () => { throw new Error('neither file should reach the model') },
      concurrency: 1,
      log: {log: message => lines.push(message)},
      recovery: {
        restored: [{...restoredItem, status: 'translated', recovered: true, review: successfulReview(), validationErrors: []}],
        pending: [],
      },
      semanticSeedsDir: seedDir,
    });
    // restoredItem is reused recovery work and seededItem is fully seeded:
    // both are translated without a single agent turn.
    assert.equal(report.checkpoint.translated, 2);
    assert.equal(report.checkpoint.failed, 0);
    const summaryLine = lines.find(line => line.includes('[agentic-provider] summary '));
    assert.match(summaryLine, /translated=2 failed=0 seeded-full=1 verified-current=0 agent-files=0 repair-turns=0/);
    const batchLine = lines.find(line => line.includes('[agentic-provider] batch '));
    assert.match(batchLine, /restored=1 /);
    assert.match(batchLine, /model-files=1 /);
  });
});

// Fenced-plaintext-table fixture mirroring the real spark-batch-jobs pages:
// the ```plaintext pseudo-table is protected content for the whole-file
// validator (its `vector` column name may stay English), while the stricter
// per-unit seed gate rejects that cell because the ja-JP locale contract
// mandates vector -> ベクトル. The two gates disagree exactly there.
const FENCED_EN = `---
title: Primary key deduplication
---

# Primary key deduplication

The job identifies duplicates by comparing the chosen scalar field values.

\`\`\`plaintext
| primary key | vector       |
|-------------|--------------|
| doc-1       | [0.12, 0.35] |
\`\`\`

Records sharing the same field value are placed into one duplicate group.
`;
const FENCED_JA = `---
title: 主キーの重複排除
---

# 主キーの重複排除

ジョブは、選択されたスカラーフィールドの値を比較して重複を識別します。

\`\`\`plaintext
| primary key | vector       |
|-------------|--------------|
| doc-1       | [0.12, 0.35] |
\`\`\`

同じフィールド値を持つレコードは、同一の重複グループに配置されます。
`;

// Build a seed plan for the fenced fixture the way the real planner does:
// pair the published translation with the source, keep every unit the per-unit
// gate accepts, and classify the rest as filtered/new.
function fencedSeedPlan() {
  const {pairOldSourceWithTarget: pair, collectCurrentUnits: collect} = require('./semanticSeeds');
  const {filterUsableSemanticCheckpoints} = require('./semanticRecovery');
  const {protectSemanticUnits} = require('./semanticUnits');
  const contract = loadLocaleContract('ja-JP');
  const translationsByHash = pair(FENCED_EN, FENCED_JA);
  assert.ok(translationsByHash, 'fenced fixture must align');
  const units = collect(FENCED_EN, null);
  const digest = text => createHash('sha256').update(text).digest('hex');
  const protectedUnits = protectSemanticUnits(units, unit => unit.source, {literalTokens: contract.doNotTranslate});
  const candidates = new Map();
  for (const unit of units) {
    const translation = translationsByHash.get(digest(unit.source));
    if (translation !== undefined) candidates.set(unit.id, {id: unit.id, sourceHash: digest(unit.source), translation});
  }
  const usable = filterUsableSemanticCheckpoints(candidates, protectedUnits, contract);
  const filtered = [...candidates.keys()].filter(id => !usable.has(id));
  const fresh = units.filter(unit => !candidates.has(unit.id)).map(unit => unit.id);
  assert.ok(filtered.length === 1, 'exactly the vector cell must be filtered');
  const entries = [...usable.values()].sort((left, right) => left.id.localeCompare(right.id));
  return {
    units,
    filtered,
    fresh,
    entries,
    report: {
      schemaVersion: 1,
      sourcePath: 'x/y.md',
      targetPath: 'x/ja.md',
      sourceHash: 'a'.repeat(64),
      target: 'ja-JP',
      locale: 'ja-JP',
      contractId: contract.contractId,
      entries,
    },
  };
}

test('runAgenticFile returns verified-current without a model call when every pending unit is filtered but the draft passes the gate', async () => {
  await withSite(async siteDir => {
    const item = {...jaFixture(), sourcePath: 'x/y.md', targetPath: 'x/ja.md'};
    write(siteDir, item.sourcePath, FENCED_EN);
    const plan = fencedSeedPlan();
    const lines = [];
    const result = await runAgenticFile({
      item, target: 'ja-JP', siteDir,
      callCodex: async () => { throw new Error('model must not be called when the draft passes the gate') },
      log: {log: message => lines.push(message)},
      seedReport: {...plan.report, sourcePath: item.sourcePath, targetPath: item.targetPath, sourceHash: item.sourceHash},
      pendingInfo: {filtered: new Set(plan.filtered), fresh: new Set(plan.fresh)},
    });
    assert.equal(result.status, 'translated');
    assert.deepEqual(result.attempts, ['verified-current']);
    assert.equal(result.semanticSeedUnits, plan.entries.length);
    assert.ok(isConsistentSuccessfulReview(result.review));
    const draft = fs.readFileSync(path.join(siteDir, item.targetPath), 'utf8');
    assert.match(draft, /主キーの重複排除/);
    // The fenced-table column name keeps its protected English bytes.
    assert.match(draft, /\| primary key \| vector/);
    assert.ok(lines.some(line => /verified-current .* without a model call/.test(line)));
  });
});

test('runAgenticFile hands a draft with new pending units to the agent even when the gate would pass', async () => {
  await withSite(async siteDir => {
    const item = {...jaFixture(), sourcePath: 'x/y.md', targetPath: 'x/ja.md'};
    write(siteDir, item.sourcePath, FENCED_EN);
    const plan = fencedSeedPlan();
    const calls = [];
    const result = await runAgenticFile({
      item, target: 'ja-JP', siteDir,
      callCodex: async ({prompt}) => {
        calls.push(prompt);
        // The agent resolves the pending unit: write the translation with the
        // pending unit rendered in Japanese (a wording variation, so the
        // bytes differ from the seeded draft and the no-op guard passes).
        write(siteDir, item.targetPath, FENCED_JA.replace('同一の重複グループに配置されます。', '同一の重複グループにまとめられます。'));
        return 'DONE';
      },
      seedReport: {...plan.report, sourcePath: item.sourcePath, targetPath: item.targetPath, sourceHash: item.sourceHash},
      // Classification claims the pending unit is new English: only the agent
      // may resolve it, whatever the deterministic gate says about the draft.
      pendingInfo: {filtered: new Set(), fresh: new Set(plan.filtered)},
    });
    assert.equal(result.status, 'translated');
    assert.deepEqual(result.attempts, ['translate']);
    assert.equal(calls.length, 1);
    assert.match(calls[0], /pre-seeded draft/);
  });
});
