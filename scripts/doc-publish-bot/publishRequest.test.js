const assert = require('node:assert/strict')
const { test } = require('node:test')

const {
  parsePublishRequest,
  planBranchCommands,
  planDocusaurusCommands,
  planJenkinsTrigger,
} = require('./publishRequest')

test('parsePublishRequest extracts UAT request doc tokens from Chinese mention text', () => {
  const request = parsePublishRequest(`@小涂,请帮我发布以下文档到 UAT:
- https://zilliverse.feishu.cn/wiki/ABC123xyz
- https://zilliverse.feishu.cn/docx/DEF456uvw?from=from_copylink`)

  assert.equal(request.environment, 'uat')
  assert.equal(request.branch, 'dev')
  assert.deepEqual(request.docTokens, ['ABC123xyz', 'DEF456uvw'])
})

test('parsePublishRequest requires a release branch for production requests', () => {
  assert.throws(
    () => parsePublishRequest('发布到 production: https://zilliverse.feishu.cn/wiki/ABC123xyz'),
    /production publish requires a release branch/
  )

  const request = parsePublishRequest('请发布到 production v2.6.0 https://zilliverse.feishu.cn/wiki/ABC123xyz')
  assert.equal(request.environment, 'production')
  assert.equal(request.branch, 'v2.6.0')
})

test('planDocusaurusCommands plans guide SaaS and PaaS target commands from Base record', () => {
  const commands = planDocusaurusCommands({
    manualName: 'guides',
    docToken: 'ABC123xyz',
    record: {
      fields: {
        Targets: 'Zilliz.SaaS, Zilliz.PaaS',
        'Placement Type': 'canonical',
      },
    },
  })

  assert.deepEqual(commands, [
    ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'guides', '-tar', 'zilliz.saas', '-token', 'ABC123xyz', '-s3'],
    ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'guides', '-tar', 'zilliz.saas', '-post', '-skipS'],
    ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'guides', '-tar', 'zilliz.paas', '-token', 'ABC123xyz', '-s3'],
    ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'guides', '-tar', 'zilliz.paas', '-post', '-skipS'],
  ])
})

test('planDocusaurusCommands plans SDK reference commands against zilliz target', () => {
  const commands = planDocusaurusCommands({
    manualName: 'nodejs30',
    docToken: 'SDK789',
    record: { fields: { 'Placement Type': 'canonical' } },
  })

  assert.deepEqual(commands, [
    ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'nodejs30', '-tar', 'zilliz', '-token', 'SDK789', '-s3'],
    ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'nodejs30', '-tar', 'zilliz', '-post'],
  ])
})

test('planJenkinsTrigger uses the real zilliz-docs Jenkins folder', () => {
  assert.deepEqual(planJenkinsTrigger({ environment: 'uat', branch: 'dev' }), {
    url: 'https://jenkins-3.zilliz.cc/job/zilliz-docs/job/zilliz-docs-dev/buildWithParameters',
    params: { BRANCH: 'dev' },
  })

  assert.deepEqual(planJenkinsTrigger({ environment: 'production', branch: 'v2.6.0' }), {
    url: 'https://jenkins-3.zilliz.cc/job/zilliz-docs/job/zilliz-docs-prod/buildWithParameters',
    params: { BRANCH: 'v2.6.0' },
  })
})

test('planBranchCommands checks out dev for UAT and release branch for production', () => {
  assert.deepEqual(planBranchCommands({ environment: 'uat', branch: 'dev' }), [
    ['git', 'fetch', 'origin', 'dev'],
    ['git', 'switch', 'dev'],
  ])

  assert.deepEqual(planBranchCommands({ environment: 'production', branch: 'v2.6.0' }), [
    ['git', 'fetch', 'origin', 'v2.6.0'],
    ['git', 'switch', 'v2.6.0'],
  ])
})
