'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {validateRecoveryCandidate, validateRecoveryFileCandidate} = require('./recoveryValidation');

// Mirrors the production page that exposed the gate divergence: a code-fenced
// schema table keeps locale-contract column names (vector) in English, which
// the publication gate exempts as protected bytes while per-unit semantic
// enforcement treats it as an untranslated mandatory term.
const SOURCE = [
  '---',
  'title: Dedup',
  '---',
  '',
  '# Dedup',
  '',
  'The job stores the vector data of the vector field in the vector index.',
  '',
  '```plaintext',
  '| primary key | timestamp | content | vector |',
  '|---|---|---|---|',
  '| doc-1 | 1710000000 | Earlier version | [0.12, 0.35] |',
  '```',
  '',
].join('\n');

const TARGET = [
  '---',
  'title: 重複排除',
  '---',
  '',
  '# 重複排除',
  '',
  'このジョブはベクトルインデックスのベクトルフィールドにベクトルデータを保存します。',
  '',
  '```plaintext',
  '| primary key | timestamp | content | vector |',
  '|---|---|---|---|',
  '| doc-1 | 1710000000 | Earlier version | [0.12, 0.35] |',
  '```',
  '',
].join('\n');

test('file-level recovery revalidation matches the publication gate for protected terminology contexts', () => {
  const input = {sourceContent: SOURCE, targetContent: TARGET, sourcePath: 'content/en/guides/dedup.md', targetPath: 'i18n/ja-JP/dedup.md', target: 'ja-JP', locale: 'ja-JP'};
  const fileErrors = validateRecoveryFileCandidate(input);
  assert.deepEqual(fileErrors, []);
  // The unit-level gate deliberately stays stricter for chunk/semantic resume
  // payloads; pin the divergence so it cannot silently disappear either.
  const unitErrors = validateRecoveryCandidate(input);
  assert.ok(unitErrors.some(error => /vector to use ベクトル/u.test(error)));
});

test('file-level recovery revalidation still fails genuine terminology violations', () => {
  const untranslated = TARGET.replace('このジョブはベクトルインデックスのベクトルフィールドにベクトルデータを保存します。', 'このジョブは vector データを保存します。');
  const errors = validateRecoveryFileCandidate({sourceContent: SOURCE, targetContent: untranslated, sourcePath: 'content/en/guides/dedup.md', targetPath: 'i18n/ja-JP/dedup.md', target: 'ja-JP', locale: 'ja-JP'});
  assert.ok(errors.some(error => /publication: .*vector/u.test(error)));
});

test('file-level recovery revalidation still catches structural corruption', () => {
  const droppedHeading = TARGET.replace('# 重複排除\n\n', '');
  const errors = validateRecoveryFileCandidate({sourceContent: SOURCE, targetContent: droppedHeading, sourcePath: 'content/en/guides/dedup.md', targetPath: 'i18n/ja-JP/dedup.md', target: 'ja-JP', locale: 'ja-JP'});
  assert.ok(errors.length > 0);
});
