'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {validateRecoveryCandidate} = require('./recoveryValidation')

const source = [
  '---',
  'displayed_sidebar: restfulSidebar',
  'title: "List Collections"',
  '---',
  '',
  '# List Collections',
  '',
  "import RestSpecs from '@site/src/components/RestSpecs';",
  '',
  '<RestSpecs specs={specs} endpoint={endpoint} method={method} target="zilliz" lang="en-US" />',
  '',
  'export const specs = {"summary":"List Collections","description":"List all collections.","parameters":[{"name":"Authorization","in":"header","description":"Use an API key."}]}',
  'export const endpoint = "/v2/vectordb/collections/list"',
  'export const method = "post"',
].join('\n')

const target = [
  '---',
  'displayed_sidebar: restfulSidebar',
  'title: "コレクション一覧"',
  '---',
  '',
  '# コレクション一覧',
  '',
  "import RestSpecs from '@site/src/components/RestSpecs';",
  '',
  '<RestSpecs specs={specs} endpoint={endpoint} method={method} target="zilliz" lang="ja-JP" />',
  '',
  'export const specs = {"summary":"List Collections","description":"List all collections.","x-i18n":{"ja-JP":{"summary":"コレクション一覧","description":"すべてのコレクションを一覧表示します。"}},"parameters":[{"name":"Authorization","in":"header","description":"Use an API key.","x-i18n":{"ja-JP":{"description":"APIキーを使用します。"}}}]}',
  'export const endpoint = "/v2/vectordb/collections/list"',
  'export const method = "post"',
].join('\n')

const sourcePath = 'content/en/reference/api/restful/restful/v2/data-plane/collection-operations-v2/list-collections-v2.mdx'
const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v2/data-plane/collection-operations-v2/list-collections-v2.mdx'

function validate(overrides = {}) {
  return validateRecoveryCandidate({
    sourceContent: overrides.sourceContent ?? source,
    targetContent: overrides.targetContent ?? target,
    sourcePath,
    targetPath,
    target: 'ja-JP',
    locale: 'ja-JP',
  })
}

test('accepts localized REST specs and RestSpecs locale without treating them as protected changes', () => {
  assert.deepEqual(validate(), [])
})

test('rejects changed non-locale REST specification data', () => {
  const changed = target.replace('"name":"Authorization"', '"name":"AuthorizationChanged"')
  const errors = validate({targetContent: changed})
  assert.ok(errors.some(error => /REST revalidation found changed non-locale specification data/.test(error)))
})

test('rejects a forged RestSpecs lang attribute in retained REST output', () => {
  const forged = target.replace('lang="ja-JP"', 'lang="zh-CN"')
  const errors = validate({targetContent: forged})
  assert.ok(errors.some(error => /protected: Protected content mismatch for jsx_tag/.test(error)))
})

