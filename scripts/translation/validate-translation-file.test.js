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
