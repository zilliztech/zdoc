'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {execFileSync} = require('node:child_process')
const {scan, renderMarkdown, watchdogCardStatus, resolveFetchPullState} = require('./shared-docs-pin-drift')

function git(repo, ...args) {
  return execFileSync('git', ['-c', 'commit.gpgsign=false', '-C', repo, ...args], {encoding: 'utf8',
    env: {...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_AUTHOR_NAME: 'Pin Drift Fixture',
      GIT_AUTHOR_EMAIL: 'drift@example.test', GIT_COMMITTER_NAME: 'Pin Drift Fixture', GIT_COMMITTER_EMAIL: 'drift@example.test',
      GIT_AUTHOR_DATE: '2020-01-01T00:00:00Z', GIT_COMMITTER_DATE: '2020-01-01T00:00:00Z'}}).trim()
}
function put(root, name, text) { fs.mkdirSync(path.join(root, name, '..'), {recursive: true}); fs.writeFileSync(path.join(root, name), text) }

const UPSTREAM_TRACK = 'v3.0.x'
async function fixture() {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'pin-drift-')))
  const repo = path.join(root, 'upstream'), group = path.join(root, 'shared-docs/guides')
  for (const [name, text] of [['fresh', 'Fresh page.\n'], ['stale', 'Stale page, base text.\n'], ['adopted', 'Adopted page base text.\n']]) {
    put(repo, `site/en/${name}.md`, text)
  }
  git(repo, 'init', '--quiet', `--initial-branch=${UPSTREAM_TRACK}`, '--template=')
  git(repo, 'add', '--all'); git(repo, 'commit', '--quiet', '-m', 'Base')
  const base = git(repo, 'rev-parse', 'HEAD')
  put(repo, 'site/en/stale.md', 'Stale page, tip text.\n')
  git(repo, 'add', '--all'); git(repo, 'commit', '--quiet', '-m', 'Tip: refresh stale page')
  const tip = git(repo, 'rev-parse', 'HEAD')
  git(repo, 'update-ref', 'refs/pull/7/head', tip)

  put(group, 'source.yaml', `schema_version: 1\nrepository: ${repo}\ntrack: ${UPSTREAM_TRACK}\n`)
  const page = (name, source) => {
    put(group, `pages/${name}/page.yaml`, `schema_version: 1\n\nsource:\n  file: ${source}\n\npublish:\n  - manual: guides\n    path: tutorials/${name}\n  - manual: guides-byoc\n    path: tutorials/${name}\n`)
    const pins = {fresh: tip, stale: base, adopted: tip, offbranch: base, broken: base}
    put(group, `pages/${name}/lock.yaml`, `schema_version: 1\ncurrent: ${pins[name] ?? tip}\nnext: ${pins[name] ?? tip}\n`)
  }
  page('fresh', 'site/en/fresh.md'); page('stale', 'site/en/stale.md'); page('adopted', 'site/en/adopted.md')
  page('offbranch', 'site/en/fresh.md'); page('broken', 'site/en/stale.md')
  put(group, 'pages/broken/page.yaml', 'broken: [')
  const orphanTree = git(repo, 'hash-object', '-t', 'tree', '/dev/null')
  const orphan = git(repo, 'commit-tree', orphanTree, '-m', 'Orphan')
  git(repo, 'update-ref', 'refs/heads/orphan', orphan)
  const orphanCommit = git(repo, 'rev-parse', 'refs/heads/orphan')
  put(group, 'pages/offbranch/lock.yaml', `schema_version: 1\ncurrent: ${orphanCommit}\nnext: ${orphanCommit}\n`)
  put(group, 'pages/adopted/variant-next.md', 'Adopted variant body.\n')
  put(group, 'pages/adopted/variant-next.provenance.json',
    JSON.stringify({pull: 7, head_sha: tip, adopted_at: '2026-11-11T00:00:00Z', adopted_via: 'adopt-variant'}))
  return {root, repo, group, base, tip, orphanCommit}
}

const scanOptions = (setup, fetchPullState) => ({sharedDocsRoot: setup.group, upstreamRepo: setup.repo, headSha: setup.tip, fetchPullState})

test('clean pins and open PR variants report drift and configuration errors only', async () => {
  const setup = await fixture()
  const report = await scan(scanOptions(setup, () => ({state: 'open', merged: false, head: setup.tip})))
  assert.equal(report.summary.scannedPages, 5)
  assert.deepEqual(report.pages.find(page => page.page === 'fresh').drifted, [])
  assert.equal(report.pages.find(page => page.page === 'stale').drifted.length, 1)
  assert.ok(report.pages.find(page => page.page === 'stale').drifted[0].includes('Tip: refresh stale page'))
  // The off-branch pin cannot define a sensible range, so orphan..tip counts as
  // drift for that page on top of the genuinely drifted stale page.
  assert.equal(report.summary.driftedCount, 2)
  assert.equal(report.summary.unhealthyCount, 1)
  assert.equal(report.summary.errorCount, 1)
  assert.equal(report.pages.find(page => page.page === 'adopted').variant.issues.length, 0)
  assert.equal(watchdogCardStatus(report), 'fail')
  const stable = await scan(scanOptions(setup, () => ({state: 'open', merged: false, head: setup.tip})))
  assert.equal(stable.summary.diffDigest, report.summary.diffDigest)
  assert.ok(renderMarkdown(report).includes('diffDigest'))
  assert.ok(renderMarkdown(report).includes('**stale**'))
})

test('variant lifecycle issues classify as informational unless the upstream state is unavailable', async () => {
  const setup = await fixture()
  const moved = await scan(scanOptions(setup, () => ({state: 'open', merged: false, head: setup.base})))
  const movedIssues = moved.pages.find(page => page.page === 'adopted').variant.issues
  assert.deepEqual(movedIssues.map(issue => issue.code), ['PR_HEAD_MOVED'])
  assert.equal(moved.summary.unhealthyCount, 1)
  const merged = await scan(scanOptions(setup, () => ({state: 'closed', merged: true, head: setup.tip})))
  const reconciliation = merged.pages.find(page => page.page === 'adopted').variant.issues
  assert.deepEqual(reconciliation.map(issue => issue.code), ['RECONCILIATION_PENDING'])
  assert.ok(reconciliation[0].message.includes('delete the variants and re-pin'))
  const closed = await scan(scanOptions(setup, () => ({state: 'closed', merged: false, head: setup.tip})))
  const closedIssues = closed.pages.find(page => page.page === 'adopted').variant.issues
  assert.deepEqual(closedIssues.map(issue => issue.code), ['PR_CLOSED'])
  assert.equal(closedIssues[0].severity, 'info')
  assert.equal(closed.summary.unhealthyCount, 1)
  const unavailable = await scan(scanOptions(setup, () => { throw new Error('GitHub API outage') }))
  const unavailableIssues = unavailable.pages.find(page => page.page === 'adopted').variant.issues
  assert.deepEqual(unavailableIssues.map(issue => issue.code), ['VARIANT_STATE_UNAVAILABLE'])
  assert.equal(unavailableIssues[0].severity, 'unhealthy')
  // The off-branch pin and the unavailable upstream state are both unhealthy.
  assert.equal(unavailable.summary.unhealthyCount, 2)
  assert.equal(watchdogCardStatus(unavailable), 'fail')
})

test('pull-request state wiring follows the source repository and refuses non-GitHub sources', async () => {
  const setup = await fixture()
  put(setup.group, 'source.yaml', 'schema_version: 1\nrepository: https://github.com/milvus-io/milvus-docs\ntrack: v3.0.x\n')
  const wired = resolveFetchPullState(setup.group)
  assert.equal(typeof wired, 'function')
  put(setup.group, 'source.yaml', `schema_version: 1\nrepository: /local/only\ntrack: ${UPSTREAM_TRACK}\n`)
  assert.equal(resolveFetchPullState(setup.group), undefined)
})

test('off-branch pins and broken configuration report unhealthy and errors', async () => {
  const setup = await fixture()
  const report = await scan(scanOptions(setup, () => ({state: 'open', merged: false, head: setup.tip})))
  assert.equal(report.pages.find(page => page.page === 'offbranch').pinIssue, 'PIN_OFF_BRANCH')
  assert.equal(report.summary.unhealthyCount, 1)
  assert.ok(report.pages.find(page => page.page === 'broken').errors[0].startsWith('CONFIG_SYNTAX_INVALID'))
})
