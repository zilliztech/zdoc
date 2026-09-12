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
  runAgenticFile,
  runAgenticTranslation,
  stylePromptPathFor,
  validatorCommandFor,
} = require('./agenticProvider');
const {isConsistentSuccessfulReview} = require('./reviewEvidence');

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

test('parseCliArgs validates the run subcommand and required absolute paths', () => {
  assert.throws(() => parseCliArgs(['translate', '--site-dir', '/x']), /Usage:/);
  assert.throws(() => parseCliArgs(['run', '--site-dir', 'relative', '--manifest', 'm.json', '--report', 'r.json', '--model', 'm', '--base-url', 'https://x/v1', '--api-key-env', 'KEY']), /absolute normalized/);
  const options = parseCliArgs(['run', '--site-dir', '/tmp/site', '--manifest', 'tmp/m.json', '--report', 'tmp/r.json', '--model', 'm', '--base-url', 'https://x/v1', '--api-key-env', 'KEY']);
  assert.equal(options.siteDir, '/tmp/site');
  assert.equal(options.concurrency, 2);
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

test('validatorCommandFor renders the repository validator invocation', () => {
  const command = validatorCommandFor('/site', 'ja-JP', jaFixture());
  assert.match(command, /validate-translation-file\.js/);
  assert.match(command, /--site-dir \/site/);
  assert.match(command, /--target ja-JP/);
  assert.match(command, /--write-back false/);
});
