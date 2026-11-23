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

/** Manual-layout fixture: the group directory name must be a supported group for
 *  the build's own reader (group-context), so this fixture is `node`. */
async function manualFixture() {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'pin-drift-manual-')))
  const repo = path.join(root, 'upstream'), group = path.join(root, 'shared-docs/node')
  const sourceDir = 'site/en/sdk-node/v3.0.x'
  put(repo, `${sourceDir}/Overview.md`, '# Overview\n\nUpstream overview.\n')
  put(repo, `${sourceDir}/Client/createClient.md`, '# createClient\n\nUpstream client.\n')
  git(repo, 'init', '--quiet', `--initial-branch=${UPSTREAM_TRACK}`, '--template=')
  git(repo, 'add', '--all'); git(repo, 'commit', '--quiet', '-m', 'Base')
  const base = git(repo, 'rev-parse', 'HEAD')
  put(repo, `${sourceDir}/Overview.md`, '# Overview\n\nUpstream overview, tip text.\n')
  git(repo, 'add', '--all'); git(repo, 'commit', '--quiet', '-m', 'Tip: refresh overview')
  const tip = git(repo, 'rev-parse', 'HEAD')

  put(group, 'source.yaml', `schema_version: 1\nrepository: ${repo}\ntrack: ${UPSTREAM_TRACK}\n`)
  put(group, 'Variables.json', JSON.stringify({endpoint: "'localhost:19530'"}))
  put(group, 'product-names.yaml', 'check:\n  - localhost\nallow: []\n')
  put(group, 'manual.yaml', [
    'schema_version: 1',
    'source:',
    `  dir: ${sourceDir}`,
    'publish:',
    '  manual: node',
    'metadata:',
    '  Authentication/addUser.md:',
    '    beta: false',
    '    sidebar_position: 2',
    '    type: docx',
    '    token: T123',
    'milvus_values:',
    '  endpoint: "\'localhost:19530\'"',
    'cloud_pages:',
    '  Overview.md:',
    '    file: Overview.md',
    '',
  ].join('\n'))
  put(group, 'content/Overview.md', '# Overview\n\nCloud overview.\n')
  put(group, 'lock.yaml', `schema_version: 1\ncurrent: ${base}\nnext: ${base}\n`)
  return {root, repo, group, base, tip, sourceDir}
}

const manualOptions = setup => ({sharedDocsRoot: setup.group, upstreamRepo: setup.repo, headSha: setup.tip})

test('manual layout audits declared transform targets against the upstream head', async () => {
  const setup = await manualFixture()
  put(setup.group, 'manual.yaml', fs.readFileSync(path.join(setup.group, 'manual.yaml'), 'utf8')
    .replace('milvus_values:', [
      'transforms:',
      '  Client/createClient.md:',
      '    - operation: add',
      '      position: after',
      '      target:',
      '        block: client-anchor',
      '      content:',
      '        file: client-note.md',
      'milvus_values:',
    ].join('\n')))
  put(setup.group, 'content/client-note.md', 'On Zilliz Cloud, the client anchors.\n')
  put(setup.repo, `${setup.sourceDir}/Client/createClient.md`, '# createClient\n\n<!-- doc:block:start id="client-anchor" -->\nUpstream client.\n<!-- doc:block:end id="client-anchor" -->\n')
  git(setup.repo, 'add', '--all'); git(setup.repo, 'commit', '--quiet', '-m', 'Add marker')
  const marked = git(setup.repo, 'rev-parse', 'HEAD')
  put(setup.group, 'lock.yaml', `schema_version: 1\ncurrent: ${setup.base}\nnext: ${marked}\n`)

  // Marker present at the head: the audit stays healthy.
  const healthy = await scan({...manualOptions(setup), headSha: marked})
  assert.equal(healthy.summary.unhealthyCount, 0)
  assert.ok(!healthy.issues.some(issue => issue.code.startsWith('TRANSFORM_TARGET')))

  // Marker deleted at the head: the audit turns unhealthy.
  put(setup.repo, `${setup.sourceDir}/Client/createClient.md`, '# createClient\n\nMarker removed by an upstream cleanup.\n')
  git(setup.repo, 'add', '--all'); git(setup.repo, 'commit', '--quiet', '-m', 'Delete marker')
  const stripped = git(setup.repo, 'rev-parse', 'HEAD')
  const missing = await scan({...manualOptions(setup), headSha: stripped})
  assert.equal(missing.summary.unhealthyCount, 1)
  assert.ok(missing.issues.some(issue => issue.code === 'TRANSFORM_TARGET_MISSING' && issue.message.includes('client-anchor')))
  assert.equal(watchdogCardStatus(missing), 'fail')
})

test('manual layout audits pins, drift and cloud content as one healthy entry', async () => {
  const setup = await manualFixture()
  const report = await scan(manualOptions(setup))
  assert.equal(report.layout, 'manual')
  assert.equal(report.manual, 'node')
  assert.equal(report.summary.scannedPages, 1)
  assert.equal(report.summary.driftedCount, 1)
  assert.equal(report.summary.unhealthyCount, 0)
  assert.equal(report.summary.errorCount, 0)
  assert.equal(report.summary.pendingReconciliationCount, 0)
  assert.equal(watchdogCardStatus(report), 'success')
  assert.ok(report.drifted[0].includes('Tip: refresh overview'))
  const markdown = renderMarkdown(report)
  assert.ok(markdown.includes('node manual node'))
  assert.ok(markdown.includes('drift: ') && markdown.includes('Tip: refresh overview'))
  const stable = await scan(manualOptions(setup))
  assert.equal(stable.summary.diffDigest, report.summary.diffDigest)
})

test('manual layout reports off-branch pins as unhealthy and skips the drift range', async () => {
  const setup = await manualFixture()
  const orphanTree = git(setup.repo, 'hash-object', '-t', 'tree', '/dev/null')
  const orphan = git(setup.repo, 'commit-tree', orphanTree, '-m', 'Orphan')
  git(setup.repo, 'update-ref', 'refs/heads/orphan', orphan)
  const orphanCommit = git(setup.repo, 'rev-parse', 'refs/heads/orphan')
  put(setup.group, 'lock.yaml', `schema_version: 1\ncurrent: ${orphanCommit}\nnext: ${orphanCommit}\n`)
  const report = await scan(manualOptions(setup))
  assert.equal(report.summary.driftedCount, 0)
  assert.equal(report.summary.unhealthyCount, 1)
  assert.ok(report.issues[0].message.includes('is missing from or off the tracking branch'))
  assert.equal(watchdogCardStatus(report), 'fail')
})

test('manual layout configuration errors include missing cloud_pages content', async () => {
  const setup = await manualFixture()
  put(setup.group, 'manual.yaml', [
    'schema_version: 1',
    'source:',
    `  dir: ${setup.sourceDir}`,
    'publish:',
    '  manual: node',
    'cloud_pages:',
    '  Overview.md:',
    '    file: Absent.md',
    '',
  ].join('\n'))
  const report = await scan(manualOptions(setup))
  assert.ok(report.errors.some(line => line.startsWith('TRANSFORM_CONTENT_NOT_FOUND')), report.errors.join('\n'))
  assert.equal(report.summary.errorCount, 1)
  assert.equal(report.summary.unhealthyCount, 0)
  assert.equal(watchdogCardStatus(report), 'fail')
  assert.ok(renderMarkdown(report).includes('TRANSFORM_CONTENT_NOT_FOUND'))
})

/** Page-layout fixture dedicated to the WP-3b third layer: transform targets must
 *  still be named blocks at the upstream head. */
async function transformFixture() {
  const setup = await fixture()
  put(setup.repo, 'site/en/targeted.md', 'Intro.\n\n<!-- doc:block:start id="live-target" -->\nMarker body.\n<!-- doc:block:end id="live-target" -->\n')
  git(setup.repo, 'add', '--all'); git(setup.repo, 'commit', '--quiet', '-m', 'Tip: add named marker page')
  const tip = git(setup.repo, 'rev-parse', 'HEAD')
  const page = (name, block) => {
    const transforms = block === undefined ? '' : `\ntransforms:\n  - operation: replace\n    target:\n      block: ${block}\n    content:\n      file: cloud-${block}.md\n`
    put(setup.group, `pages/${name}/page.yaml`, `schema_version: 1\n\nsource:\n  file: site/en/targeted.md\n\npublish:\n  - manual: guides\n    path: tutorials/${name}\n  - manual: guides-byoc\n    path: tutorials/${name}\n${transforms}`)
    put(setup.group, `pages/${name}/lock.yaml`, `schema_version: 1\ncurrent: ${tip}\nnext: ${tip}\n`)
  }
  page('target-live', 'live-target'); page('target-gone', 'missing-target')
  return {...setup, tip}
}

test('declared transform targets must exist as named blocks at the upstream head', async () => {
  const setup = await transformFixture()
  const report = await scan(scanOptions(setup, () => ({state: 'open', merged: false, head: setup.tip})))
  const live = report.pages.find(page => page.page === 'target-live')
  const gone = report.pages.find(page => page.page === 'target-gone')
  assert.equal(live.transformIssue, undefined)
  assert.equal(gone.transformIssue, 'TRANSFORM_TARGET_MISSING')
  // The base fixture contributes one off-branch page and one broken page.
  assert.equal(report.summary.unhealthyCount, 2)
  assert.equal(report.summary.errorCount, 1)
  assert.equal(watchdogCardStatus(report), 'fail')
  assert.ok(renderMarkdown(report).includes('TRANSFORM_TARGET_MISSING'))
  // Digest stability: an unchanged group must produce the same digest again.
  const again = await scan(scanOptions(setup, () => ({state: 'open', merged: false, head: setup.tip})))
  assert.equal(again.summary.diffDigest, report.summary.diffDigest)
})
