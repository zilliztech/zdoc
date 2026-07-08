const assert = require('node:assert/strict')
const { test } = require('node:test')

const { buildPublishJobPlan } = require('./publishJob')

test('buildPublishJobPlan creates a dry-run plan from resolved Base records', async () => {
  const calls = []
  const plan = await buildPublishJobPlan({
    text: '@小涂 请发布到 UAT https://zilliverse.feishu.cn/wiki/ABC123xyz',
    resolveDoc: async (docToken) => {
      calls.push(docToken)
      return {
        manualName: 'guides',
        title: 'Create a cluster',
        record: { fields: { Targets: 'Zilliz.SaaS', 'Placement Type': 'canonical' } },
      }
    },
  })

  assert.deepEqual(calls, ['ABC123xyz'])
  assert.equal(plan.environment, 'uat')
  assert.equal(plan.branch, 'dev')
  assert.equal(plan.docs[0].manualName, 'guides')
  assert.deepEqual(plan.docusaurusCommands, [
    ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'guides', '-tar', 'zilliz.saas', '-token', 'ABC123xyz', '-s3'],
    ['npx', 'docusaurus', 'fetch-lark-docs', '-man', 'guides', '-tar', 'zilliz.saas', '-post', '-skipS'],
  ])
  assert.deepEqual(plan.jenkins, {
    url: 'https://jenkins-3.zilliz.cc/job/zilliz-docs/job/zilliz-docs-dev/buildWithParameters',
    params: { BRANCH: 'dev' },
  })
})

test('buildPublishJobPlan rejects missing Base records', async () => {
  await assert.rejects(
    () => buildPublishJobPlan({
      text: 'UAT https://zilliverse.feishu.cn/wiki/MISSING',
      resolveDoc: async () => null,
    }),
    /doc token MISSING was not found/
  )
})
