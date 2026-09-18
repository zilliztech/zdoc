'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {validateProtectedContent} = require('./protectedContent')
const {validateTranslationFile, validateWithRuntimeChecks} = require('./validate-translation-file')

const SOURCE = [
  '---',
  'title: "Environment Isolation | BYOC"',
  'slug: /environment-isolation',
  '---',
  '',
  '## Cluster-level isolation\\{#cluster-level-isolation}',
  '',
  'Each cluster is isolated.',
  '',
  'See the [cluster](./manage-cluster) page.',
  '',
].join('\n')

const FULLY_TRANSLATED = [
  '---',
  'title: "Environment Isolation | BYOC"',
  'slug: /environment-isolation',
  '---',
  '',
  '## クラスターレベルの分離\\{#cluster-level-isolation}',
  '',
  '各クラスターは分離されています。',
  '',
  '詳細は [クラスター](./manage-cluster) を参照してください。',
  '',
].join('\n')

function validate(draftContent) {
  return validateTranslationFile({sourceContent: SOURCE, draftContent, relPath: 'content/en/x.md', target: 'ja-JP'})
}

test('math-bearing pages with brace subscripts pass the MDX gate', async () => {
  const source = '---\ntitle: T\n---\n\n# T\n\nBody.\n\n$$\nS(doc) = \\exp\\left( \\lambda \\cdot fieldvalue_{doc} - origin \\right)\n$$\n'
  const draft = '---\ntitle: 制限\n---\n\n# T\n\n本文。\n\n$$\nS(doc) = \\exp\\left( \\lambda \\cdot fieldvalue_{doc} - origin \\right)\n$$\n'
  const {errors} = await validateWithRuntimeChecks({sourceContent: source, draftContent: draft, relPath: 'content/en/x.md', target: 'ja-JP'})
  assert.deepEqual(errors, [])
})

test('does not require a mandatory term that only appears inside protected bytes', () => {
  const {errors, repaired} = validate(FULLY_TRANSLATED)

  assert.deepEqual(errors, [])
  assert.equal(repaired, FULLY_TRANSLATED)
  assert.deepEqual([...validateProtectedContent(SOURCE, repaired)], [])
})

test('still requires a mandatory term that the draft dropped from prose', () => {
  const draft = FULLY_TRANSLATED.replace('各クラスターは分離されています。', '分離されています。')
  const {errors} = validate(draft)

  assert.equal(errors.length, 1)
  assert.match(errors[0], /requires cluster to use クラスター/)
})

test('keeps protected anchors and destinations out of the deterministic repair sites', () => {
  const draft = FULLY_TRANSLATED.replace('## クラスターレベルの分離', '## cluster-level separation')
  const {errors, repaired} = validate(draft)

  assert.deepEqual(errors, [])
  assert.notEqual(repaired, draft)
  assert.match(repaired, /\\\{#cluster-level-isolation\}/)
  assert.match(repaired, /\]\(\.\/manage-cluster\)/)
})

const CHANNEL_SOURCE = [
  '---',
  'title: "Staged Feature"',
  '---',
  '',
  '## Staged Feature',
  '',
  'Always visible.',
  '',
  '<NextChannel action="exclude">old pricing</NextChannel><NextChannel action="include">new pricing</NextChannel>',
  '',
].join('\n')

function validateChannelDraft(draftContent) {
  return validateTranslationFile({sourceContent: CHANNEL_SOURCE, draftContent, relPath: 'content/en/staged.md', target: 'ja-JP'})
}

test('accepts a draft that keeps <NextChannel> tags with translated inner text', () => {
  const draft = CHANNEL_SOURCE
    .replace('Always visible.', '常に表示されます。')
    .replace('>old pricing<', '>旧料金<')
    .replace('>new pricing<', '>新料金<')

  const {errors} = validateChannelDraft(draft)

  assert.deepEqual(errors.filter(error => /NextChannel/.test(error)), [])
})

test('flags a draft that dropped a <NextChannel> gate', () => {
  const draft = CHANNEL_SOURCE
    .replace('Always visible.', '常に表示されます。')
    .replace('<NextChannel action="include">new pricing</NextChannel>', '新料金')

  const {errors} = validateChannelDraft(draft)

  assert.ok(errors.some(error => /<NextChannel> parity mismatch: source include=1 exclude=1 close=2, draft include=0/.test(error)))
})

test('flags a draft that flipped a <NextChannel> action polarity', () => {
  const draft = CHANNEL_SOURCE
    .replace('Always visible.', '常に表示されます。')
    .replace('action="include"', 'action="exclude"')

  const {errors} = validateChannelDraft(draft)

  assert.ok(errors.some(error => /<NextChannel> parity mismatch: source include=1/.test(error)))
})
