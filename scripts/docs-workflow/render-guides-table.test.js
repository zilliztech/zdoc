'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { renderGuidesTable, tableOutputPath } = require('./render-guides-table')

test('Client Libraries and Tools always own their target table directories', () => {
  assert.equal(tableOutputPath({ site: 'en', table_slug: 'client-libraries', target: 'zilliz.saas' }), 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/client-libraries')
  assert.equal(tableOutputPath({ site: 'zh-CN', table_slug: 'tools', target: 'zilliz.paas' }), 'tmp/docs-tooling/zh-CN/guides-byoc/content/zh-CN/byoc/tutorials/tools')
  assert.throws(() => tableOutputPath({ site: 'zh-CN', table_slug: 'tools', target: 'zilliz.saas' }), /Agent-owned Tools/)
})

test('table render clears only its directory and renders the Base table subtree', () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'render-guides-table-'))
  const owned = path.join(workspace, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/tools')
  fs.mkdirSync(owned, { recursive: true })
  fs.writeFileSync(path.join(owned, 'stale.md'), 'stale')
  fs.mkdirSync(path.join(workspace, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/management'), { recursive: true })
  fs.writeFileSync(path.join(workspace, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/management/keep.md'), 'keep')
  let command
  const spawnSync = (bin, args) => {
    command = [bin, ...args]
    fs.mkdirSync(path.join(owned, 'agents'), { recursive: true })
    fs.writeFileSync(path.join(owned, 'agents/_category_.json'), '{}')
    fs.writeFileSync(path.join(owned, 'agents/agent.md'), 'canonical')
    return { status: 0 }
  }

  const result = renderGuidesTable({
    workspace, site: 'en', table_id: 'tbl-tools', table_name: 'Tools', table_slug: 'tools', target: 'zilliz.saas', cleanup: false, spawnSync,
  })

  assert.equal(result.outputPath, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/tools')
  assert.equal(fs.existsSync(path.join(owned, 'stale.md')), false)
  assert.equal(fs.existsSync(path.join(owned, 'agents/_category_.json')), true)
  assert.equal(fs.existsSync(path.join(owned, 'agents/agent.md')), true)
  assert.equal(fs.existsSync(path.join(owned, 'agents/link.md')), false)
  assert.equal(fs.existsSync(path.join(workspace, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/management/keep.md')), true)
  assert.deepEqual(command.slice(0, 7), [
    process.execPath,
    path.join(workspace, 'packages/docs-tooling/src/lark/standalone-cli.js'),
    'fetch-lark-docs', '-man', 'guides', '-tar', 'zilliz.saas',
  ])
  assert.equal(command.includes('base:tbl-tools'), true)
  assert.equal(command.includes('--offline'), true)
  assert.equal(command.includes('--mediaManifest'), true)
})

test('cleanup render removes the owned directory without invoking Docusaurus', () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'render-guides-table-'))
  const owned = path.join(workspace, 'tmp/docs-tooling/en/guides-byoc/content/en/byoc/tutorials/tools')
  fs.mkdirSync(owned, { recursive: true })
  fs.writeFileSync(path.join(owned, 'old.md'), 'old')
  let called = false
  renderGuidesTable({ workspace, site: 'en', table_id: 'tbl-tools', table_name: 'Tools', table_slug: 'tools', target: 'zilliz.paas', cleanup: true, spawnSync() { called = true } })
  assert.equal(fs.existsSync(owned), false)
  assert.equal(called, false)
})
