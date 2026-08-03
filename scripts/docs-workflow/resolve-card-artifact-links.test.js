'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')
const yaml = require('js-yaml')

const {resolveArtifactLinks} = require('./resolve-card-artifact-links')

const artifacts = [
  {id: 100, name: 'docs-checkpoint-guides-en-42-reports', expired: false},
  {id: 101, name: 'docs-checkpoint-guides-zh-CN-42-reports', expired: false},
]

test('resolves locale-qualified report artifacts to exact artifact-ID URLs', () => {
  assert.deepEqual(resolveArtifactLinks({repository: 'zilliztech/zdoc', runId: 42, artifacts}), {
    en: 'https://github.com/zilliztech/zdoc/actions/runs/42/artifacts/100',
    'zh-CN': 'https://github.com/zilliztech/zdoc/actions/runs/42/artifacts/101',
  })
})

test('rejects duplicate, expired, or malformed matching artifacts', () => {
  assert.throws(() => resolveArtifactLinks({repository: 'zilliztech/zdoc', runId: 42, artifacts: [...artifacts, {...artifacts[0], id: 102}]}), /duplicate/i)
  assert.throws(() => resolveArtifactLinks({repository: 'zilliztech/zdoc', runId: 42, artifacts: [{...artifacts[0], expired: true}, artifacts[1]]}), /expired/i)
  assert.throws(() => resolveArtifactLinks({repository: 'bad', runId: 42, artifacts}), /repository/i)
  assert.throws(() => resolveArtifactLinks({repository: 'zilliztech/zdoc', runId: 0, artifacts}), /runId/i)
  assert.throws(() => resolveArtifactLinks({repository: 'zilliztech/zdoc', runId: 42, artifacts: [{...artifacts[0], id: '100'}, artifacts[1]]}), /artifact id/i)
})

test('returns null only when a locale artifact is absent', () => {
  assert.deepEqual(resolveArtifactLinks({repository: 'zilliztech/zdoc', runId: 42, artifacts: [artifacts[0]]}), {
    en: 'https://github.com/zilliztech/zdoc/actions/runs/42/artifacts/100',
    'zh-CN': null,
  })
})

test('CLI writes bounded exact URLs to GitHub outputs', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'card-artifact-links-'))
  try {
    const input = path.join(directory, 'artifacts.json')
    const output = path.join(directory, 'github-output')
    fs.writeFileSync(input, JSON.stringify(artifacts))
    const result = spawnSync(process.execPath, [path.join(__dirname, 'resolve-card-artifact-links.js'), '--repository', 'zilliztech/zdoc', '--run-id', '42', '--artifacts-json', input], {
      encoding: 'utf8', env: {...process.env, GITHUB_OUTPUT: output},
    })
    assert.equal(result.status, 0, result.stderr)
    const text = fs.readFileSync(output, 'utf8')
    assert.match(text, /^en_url=https:\/\/github\.com\/zilliztech\/zdoc\/actions\/runs\/42\/artifacts\/100$/m)
    assert.match(text, /^zh_cn_url=https:\/\/github\.com\/zilliztech\/zdoc\/actions\/runs\/42\/artifacts\/101$/m)
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
})

test('aggregate resolves exact artifact IDs before collecting Build notes', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  const steps = workflow.jobs.aggregate.steps
  const resolver = steps.find(step => step.id === 'report_artifact_links')
  const collector = steps.find(step => step.id === 'reports')
  assert.ok(steps.indexOf(resolver) < steps.indexOf(collector))
  assert.equal(resolver['continue-on-error'], true)
  assert.match(resolver.run, /resolve-card-artifact-links\.js/)
  assert.equal(collector.env.CARD_REPORT_ARTIFACT_URL_EN, '${{ steps.report_artifact_links.outputs.en_url }}')
  assert.equal(collector.env.CARD_REPORT_ARTIFACT_URL_ZH_CN, '${{ steps.report_artifact_links.outputs.zh_cn_url }}')
  assert.equal(collector.env.CARD_REPORT_ARTIFACT_URL, undefined)
  assert.doesNotMatch(JSON.stringify(collector), /#artifacts|GUIDES_PUBLICATION/)
})
