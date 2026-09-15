'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  buildAgenticTaskPrompt,
  buildRepairPrompt,
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
    assert.equal(bySource.size, 2);
    const cliRecord = bySource.get(cliSource);
    assert.equal(cliRecord.sourceHash, sha256(cliEnglish));
    assert.equal(cliRecord.targetHash, sha256(cliChinese));
    assert.equal(cliRecord.sourceCommit, sourceCommit);
    assert.equal(cliRecord.status, 'translated');
    const homeRecord = bySource.get(homeSource);
    assert.equal(homeRecord.manual, 'guides');
    assert.equal(homeRecord.sourceHash, sha256(homeEnglish));
    assert.equal(homeRecord.targetHash, sha256(homeChinese));
    assert.equal(homeRecord.status, 'translated');

    const {validateTranslationCoverage} = require('../lib/load-typescript').loadTypeScript('../../packages/docs-tooling/src/translation/validate.ts');
    assert.doesNotThrow(() => validateTranslationCoverage({repositoryRoot: siteDir, targetId: 'zh-CN-reference', group: 'reference-landings'}));
  });
});
