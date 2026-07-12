'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const { aggregateResults, escapeMarkdownCell } = require('./aggregate-results');

const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);

function payload(overrides = {}) {
  return {
    requestedGroups: ['guides', 'python'],
    groups: {
      guides: { source: 'source_published', translation: 'translation_published', translationRequested: true, sourceCommitSha: SHA_A, translationCommitSha: SHA_B },
      python: { source: 'no_changes', translation: 'skipped', translationRequested: false },
    },
    finalVerification: 'passed',
    ...overrides,
  };
}

test('aggregates final terminal results and ignores earlier failed attempts', () => {
  const result = aggregateResults(payload());
  assert.equal(result.overallStatus, 'success');
  assert.match(result.markdown, /\| guides \| source_published \| translation_published \| a{40} \| b{40} \|/);
  assert.match(result.markdown, /Final verification: passed/);
  assert.match(result.markdown, /Overall status: success/);
});

test('fails for any unsuccessful requested source or requested translation', () => {
  for (const [group, entry] of [
    ['guides', { source: 'publish_failed', translation: 'skipped', translationRequested: false }],
    ['guides', { source: 'source_published', translation: 'translation_failed', translationRequested: true }],
  ]) {
    const result = aggregateResults({ requestedGroups: [group], groups: { [group]: entry }, finalVerification: 'passed' });
    assert.equal(result.overallStatus, 'failure');
  }
});

test('fails an explicitly skipped requested translation', () => {
  const result = aggregateResults({ requestedGroups: ['guides'], groups: { guides: { source: 'no_changes', translation: 'skipped', translationRequested: true } }, finalVerification: 'passed' });
  assert.equal(result.overallStatus, 'failure');
});

test('requires groups to exactly match the authoritative requestedGroups list', () => {
  assert.throws(() => aggregateResults({ requestedGroups: ['guides'], groups: {}, finalVerification: 'passed' }), /exactly match requestedGroups/);
  assert.throws(() => aggregateResults({ requestedGroups: ['guides'], groups: { guides: { source: 'no_changes', translation: 'skipped', translationRequested: false }, python: { source: 'skipped', translation: 'skipped', translationRequested: false } }, finalVerification: 'passed' }), /exactly match requestedGroups/);
});

test('treats final verification failure or skip as a separate overall failure', () => {
  for (const finalVerification of ['failed', 'skipped']) {
    assert.equal(aggregateResults(payload({ finalVerification })).overallStatus, 'failure');
  }
});

test('rejects invalid schema, states, groups, extras, duplicates, and SHAs', () => {
  const invalid = [
    {},
    payload({ requestedGroups: [] }),
    payload({ requestedGroups: ['guides', 'guides'] }),
    payload({ requestedGroups: ['ruby'], groups: { ruby: { source: 'no_changes', translation: 'skipped', translationRequested: false } } }),
    payload({ groups: { ...payload().groups, java: { source: 'skipped', translation: 'skipped', translationRequested: false } } }),
    payload({ groups: { guides: payload().groups.guides } }),
    payload({ groups: { ...payload().groups, guides: { ...payload().groups.guides, source: 'later_success' } } }),
    payload({ groups: { ...payload().groups, guides: { ...payload().groups.guides, translationRequested: 'yes' } } }),
    payload({ groups: { ...payload().groups, guides: { ...payload().groups.guides, sourceCommitSha: 'abc' } } }),
    { ...payload(), surprise: true },
  ];
  for (const value of invalid) assert.throws(() => aggregateResults(value), /invalid|must|unknown|requested|sha|schema/i);
});

test('renders deterministic ordered markdown and escapes table cells', () => {
  const result = aggregateResults({
    requestedGroups: ['python', 'guides'],
    groups: {
      python: { source: 'no_changes', translation: 'skipped', translationRequested: false },
      guides: { source: 'source_published', translation: 'translation_published', translationRequested: true },
    },
    finalVerification: 'passed',
  });
  assert.ok(result.markdown.indexOf('| guides |') < result.markdown.indexOf('| python |'));
  assert.equal(escapeMarkdownCell('abc|def\nnext'), 'abc\\|def next');
});

test('CLI writes markdown and GitHub outputs', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aggregate-results-'));
  const input = path.join(dir, 'input.json');
  const output = path.join(dir, 'summary.md');
  const githubOutput = path.join(dir, 'github-output');
  fs.writeFileSync(input, JSON.stringify(payload()));
  const result = spawnSync(process.execPath, [path.join(__dirname, 'aggregate-results.js'), '--input', input, '--output', output], {
    encoding: 'utf8', env: { ...process.env, GITHUB_OUTPUT: githubOutput },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(output, 'utf8'), aggregateResults(payload()).markdown);
  assert.match(fs.readFileSync(githubOutput, 'utf8'), /^overall_status=success\nsummary_path=.*summary\.md\n$/);
});
