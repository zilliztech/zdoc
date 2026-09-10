'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {STATUS, parseArguments, parseLocaleScope, runFastpath} = require('./fastpath-precheck')

function temporaryRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fastpath-precheck-'))
  fs.mkdirSync(path.join(root, 'deploy/contracts'), {recursive: true})
  fs.writeFileSync(path.join(root, 'deploy/contracts/localization-inputs.inventory.json'), '{"schemaVersion":1,"paths":[]}\n')
  fs.mkdirSync(path.join(root, 'reports'), {recursive: true})
  return root
}

const JA_GUIDES = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md'
const JA_REFERENCE = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/foo/bar.md'
const JA_REST = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v2/collections-list.md'
const ZH_REFERENCE = 'content/zh-CN/reference/api/python/python/foo.md'
const ZH_GUIDES = 'content/zh-CN/guides/tutorials/a.md'
const ZH_REST = 'content/zh-CN/reference/api/restful/restful/v2/collections-list.md'

function defaultClassification(file) {
  if (file === JA_REST || file === ZH_REST) return ['spec-derived', 'translation']
  if (file.startsWith('i18n/ja-JP/') || file.startsWith('content/zh-CN/reference/')) return ['translation']
  if (file === ZH_GUIDES) return ['fetch', 'translation']
  if (file.startsWith('content/en/')) return ['fetch']
  return []
}

function createHarness(overrides = {}) {
  const root = temporaryRoot()
  const executed = []
  const calls = {fetches: 0, manifest: 0, rest: [], inventoryRuns: 0, commands: []}
  const devShas = {current: 'b'.repeat(40)}
  const harness = {
    root,
    executed,
    calls,
    devShas,
    changed: [{status: 'M', file: JA_GUIDES}],
    untracked: [],
    selectorCommands: ['node --test scripts/translation/fastpath-precheck.test.js', 'git diff --check'],
    selectorOwner: 'dev-published-state',
    selectorFails: null,
    ancestryOk: true,
    fetchOk: true,
    inventoryMutates: false,
    inventoryFails: false,
    manifestFails: false,
    restFails: false,
    commandFailures: [],
    finalExtraPath: null,
    ...overrides,
  }
  const dependencies = {
    repositoryRoot: root,
    reportRoot: path.join(root, 'reports'),
    now: () => new Date('2026-09-09T12:00:00.000Z'),
    classifyEvidencePath: file => defaultClassification(file),
    fetchOriginDev: () => {
      calls.fetches += 1
      return {status: harness.fetchOk ? 0 : 1, stdout: '', stderr: harness.fetchOk ? '' : 'fetch failed'}
    },
    resolveDevSha: () => devShas.current,
    resolveHeadSha: () => 'c'.repeat(40),
    isAncestor: () => harness.ancestryOk,
    diffNameStatus: () => {
      calls.diffs = (calls.diffs ?? 0) + 1
      const changes = [...harness.changed]
      if (harness.finalExtraPath && calls.diffs > 1) changes.push({status: 'M', file: harness.finalExtraPath})
      return {status: 0, stdout: changes.map(change => `${change.status}\t${change.file}`).join('\n')}
    },
    stagedAndUnstagedStatus: () => ({
      status: 0,
      stdout: harness.untracked.map(file => `?? ${file}`).join('\0') + '\0',
    }),
    workingTreeDiffCheck: () => true,
    runSelector: files => {
      if (harness.selectorFails) return harness.selectorFails
      return {
        status: 0,
        stdout: JSON.stringify({
          files,
          branchPolicies: files.map(file => ({file, owner: harness.selectorOwner, targetBranch: 'dev', rule: ''})),
          areas: [],
          focusedTests: [],
          harnesses: [],
          gates: [],
          commands: harness.selectorCommands,
        }),
        stderr: '',
      }
    },
    runInventoryGenerate: () => {
      calls.inventoryRuns += 1
      if (harness.inventoryFails) return {status: 1, stdout: '', stderr: 'generation failed'}
      if (harness.inventoryMutates) {
        fs.writeFileSync(path.join(root, 'deploy/contracts/localization-inputs.inventory.json'), '{"schemaVersion":1,"paths":["mutated"]}\n')
      }
      return {status: 0, stdout: '', stderr: ''}
    },
    runReferenceManifest: () => {
      calls.manifest += 1
      return harness.manifestFails ? {status: 1, stdout: '', stderr: 'manifest failed'} : {status: 0, stdout: '', stderr: ''}
    },
    runValidateReference: site => ({status: 0, stdout: `validated ${site}`, stderr: ''}),
    validateRestDerivation: locale => {
      calls.rest.push(locale)
      if (harness.restFails) throw new Error('REST_DERIVATION_FRAGMENT_DRIFT')
      return true
    },
    runCommand: command => {
      calls.commands.push(command)
      if (harness.commandFailures.includes(command)) return {status: 1, stdout: '', stderr: 'boom', signal: null}
      return {status: 0, stdout: 'ok', stderr: '', signal: null}
    },
  }
  harness.dependencies = dependencies
  return harness
}

function run(harness, argv) {
  return runFastpath(argv, harness.dependencies)
}

test('argument parsing accepts locale with repeatable paths and rejects unsafe values', () => {
  assert.deepEqual(parseArguments(['--locale', 'ja-JP', '--path', 'a.md', '--path', 'b.md']), {locale: 'ja-JP', paths: ['a.md', 'b.md']})
  assert.equal(parseArguments(['--locale', 'fr']).error, 'arguments')
  assert.equal(parseArguments(['--locale', 'ja-JP', '--extra']).error, 'arguments')
  assert.equal(parseArguments([]).error, 'arguments')
  assert.equal(parseArguments(['--locale', 'ja-JP', '--path', '/abs.md']).error, 'arguments')
  assert.equal(parseArguments(['--locale', 'ja-JP', '--path', '../escape.md']).error, 'arguments')
})

test('locale scope follows the evidence groups: zh REST output is rejected, ja REST is export-validated', () => {
  assert.equal(parseLocaleScope('zh-CN', ZH_REST, ['spec-derived', 'translation']), 'evidence')
  assert.equal(parseLocaleScope('zh-CN', ZH_REFERENCE, ['translation']), 'ok')
  assert.equal(parseLocaleScope('zh-CN', ZH_GUIDES, ['fetch', 'translation']), 'ok')
  assert.equal(parseLocaleScope('ja-JP', JA_REST, ['spec-derived', 'translation']), 'ok')
  assert.equal(parseLocaleScope('ja-JP', JA_GUIDES, ['translation']), 'ok')
  assert.equal(parseLocaleScope('ja-JP', 'content/zh-CN/reference/a.md', ['translation']), 'locale')
  assert.equal(parseLocaleScope('zh-CN', 'content/en/guides/tutorials/a.md', ['fetch']), 'locale')
})

test('happy path for a Japanese Guides diff is READY_FOR_PR with a complete report', () => {
  const harness = createHarness()
  const result = run(harness, ['--locale', 'ja-JP', '--path', JA_GUIDES])
  assert.equal(result.status, 'READY_FOR_PR')
  assert.equal(result.exitCode, STATUS.READY_FOR_PR)
  const report = JSON.parse(fs.readFileSync(path.join(result.reportDirectory, 'report.json'), 'utf8'))
  assert.equal(report.mode, 'manual-fastpath')
  assert.equal(report.locale, 'ja-JP')
  assert.equal(report.readyForPr, true)
  assert.deepEqual(report.changedPaths, [JA_GUIDES])
  assert.equal(report.baseDevSha, 'b'.repeat(40))
  assert.equal(report.untrackedUserFiles.length, 0)
  assert.ok(fs.existsSync(path.join(result.reportDirectory, 'report.md')))
  // Selector commands run in order, followed by the site validations.
  assert.deepEqual(harness.calls.commands, [
    'node --test scripts/translation/fastpath-precheck.test.js',
    'git diff --check',
    'pnpm docs-tooling validate-reference --site en',
    'pnpm docs-tooling validate-reference --site ja-JP',
  ])
})

test('Japanese Reference diffs are now in scope and validate against the Japanese manifest', () => {
  const harness = createHarness({changed: [{status: 'M', file: JA_REFERENCE}]})
  const result = run(harness, ['--locale', 'ja-JP', '--path', JA_REFERENCE])
  assert.equal(result.status, 'READY_FOR_PR')
  assert.ok(harness.calls.commands.includes('pnpm docs-tooling validate-reference --site ja-JP'))
})

test('Japanese REST paths ride the export-group derivation check', () => {
  const harness = createHarness({changed: [{status: 'M', file: JA_REST}]})
  const result = run(harness, ['--locale', 'ja-JP', '--path', JA_REST])
  assert.equal(result.status, 'READY_FOR_PR')
  assert.deepEqual(harness.calls.rest, ['ja-JP'])
  const report = JSON.parse(fs.readFileSync(path.join(result.reportDirectory, 'report.json'), 'utf8'))
  assert.equal(report.restDerivationValidated, 'ja-JP')
})

test('Chinese REST output is rejected as an unsupported evidence path for the zh locale', () => {
  const harness = createHarness({changed: [{status: 'M', file: ZH_REST}]})
  const result = run(harness, ['--locale', 'zh-CN', '--path', ZH_REST])
  assert.equal(result.status, 'UNSUPPORTED_EVIDENCE_PATH')
  assert.equal(result.exitCode, STATUS.UNSUPPORTED_EVIDENCE_PATH)
})

test('Chinese Guides diffs are now in scope through the fetch-group publication manifest', () => {
  const harness = createHarness({changed: [{status: 'M', file: ZH_GUIDES}]})
  const result = run(harness, ['--locale', 'zh-CN', '--path', ZH_GUIDES])
  assert.equal(result.status, 'READY_FOR_PR')
  // No Reference manifest regeneration for Guides-only candidates.
  assert.equal(harness.calls.manifest, 0)
  assert.ok(harness.calls.commands.includes('pnpm docs-tooling validate-reference --site zh-CN'))
})

test('Chinese Reference candidates regenerate the manifest and allow its generated outputs', () => {
  const harness = createHarness({changed: [{status: 'M', file: ZH_REFERENCE}]})
  const result = run(harness, ['--locale', 'zh-CN', '--path', ZH_REFERENCE])
  assert.equal(result.status, 'READY_FOR_PR')
  assert.equal(harness.calls.manifest, 1)
  const report = JSON.parse(fs.readFileSync(path.join(result.reportDirectory, 'report.json'), 'utf8'))
  assert.equal(report.referenceManifestGenerated, true)
})

test('unclassified and master-tooling paths fail closed', () => {
  const unclassified = createHarness({changed: [{status: 'M', file: 'scripts/build/write-provenance.mjs'}]})
  assert.equal(run(unclassified, ['--locale', 'ja-JP', '--path', 'scripts/build/write-provenance.mjs']).status, 'UNSUPPORTED_EVIDENCE_PATH')

  const wrongOwner = createHarness({changed: [{status: 'M', file: JA_GUIDES}], selectorOwner: 'master-tooling'})
  assert.equal(run(wrongOwner, ['--locale', 'ja-JP', '--path', JA_GUIDES]).status, 'INVALID_SCOPE')
})

test('unmapped selector paths and disallowed lifecycle changes map to their statuses', () => {
  // A selector with no matrix match for an otherwise in-scope path fails closed.
  const unmapped = createHarness({
    selectorFails: {status: 1, stdout: '', stderr: 'Workflow test matrix has no entry for: i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md'},
  })
  assert.equal(run(unmapped, ['--locale', 'ja-JP', '--path', JA_GUIDES]).status, 'UNMAPPED_PATH')

  const deleted = createHarness({changed: [{status: 'D', file: JA_GUIDES}]})
  const result = run(deleted, ['--locale', 'ja-JP', '--path', JA_GUIDES])
  assert.equal(result.status, 'INVALID_SCOPE')
  assert.equal(result.exitCode, STATUS.INVALID_SCOPE)
})

test('untracked user files are tolerated, reported, and never cleaned', () => {
  const harness = createHarness({untracked: ['notes.txt', 'scratch/main.md.junk']})
  const result = run(harness, ['--locale', 'ja-JP', '--path', JA_GUIDES])
  assert.equal(result.status, 'READY_FOR_PR')
  const report = JSON.parse(fs.readFileSync(path.join(result.reportDirectory, 'report.json'), 'utf8'))
  assert.deepEqual(report.untrackedUserFiles, ['notes.txt', 'scratch/main.md.junk'])
})

test('inventory precheck blocks candidate-derived changes and restores the original bytes', () => {
  const harness = createHarness({inventoryMutates: true})
  const result = run(harness, ['--locale', 'ja-JP', '--path', JA_GUIDES])
  assert.equal(result.status, 'BLOCKED_CANDIDATE_DERIVED_CHANGE')
  assert.equal(
    fs.readFileSync(path.join(harness.root, 'deploy/contracts/localization-inputs.inventory.json'), 'utf8'),
    '{"schemaVersion":1,"paths":[]}\n',
  )

  const failed = createHarness({inventoryFails: true})
  assert.equal(run(failed, ['--locale', 'ja-JP', '--path', JA_GUIDES]).status, 'VALIDATION_FAILED')
})

test('manifest, export-group, and selector command failures map to their statuses', () => {
  const manifest = createHarness({changed: [{status: 'M', file: ZH_REFERENCE}], manifestFails: true})
  assert.equal(run(manifest, ['--locale', 'zh-CN', '--path', ZH_REFERENCE]).status, 'MANIFEST_GENERATION_FAILED')

  const rest = createHarness({changed: [{status: 'M', file: JA_REST}], restFails: true})
  assert.equal(run(rest, ['--locale', 'ja-JP', '--path', JA_REST]).status, 'VALIDATION_FAILED')

  const commands = createHarness({commandFailures: ['git diff --check']})
  const result = run(commands, ['--locale', 'ja-JP', '--path', JA_GUIDES])
  assert.equal(result.status, 'VALIDATION_FAILED')
  const report = JSON.parse(fs.readFileSync(path.join(result.reportDirectory, 'report.json'), 'utf8'))
  // The two site validations never executed after the failing command.
  assert.ok(report.unexecutedChecks.some(check => check.command === 'pnpm docs-tooling validate-reference --site en'))
})

test('baseline and drift failures map to INVALID_BASELINE and REBASE_REQUIRED', () => {
  const fetchFail = createHarness({fetchOk: false})
  assert.equal(run(fetchFail, ['--locale', 'ja-JP', '--path', JA_GUIDES]).status, 'INVALID_BASELINE')

  const ancestry = createHarness({ancestryOk: false})
  assert.equal(run(ancestry, ['--locale', 'ja-JP', '--path', JA_GUIDES]).status, 'INVALID_BASELINE')

  const drift = createHarness()
  drift.dependencies.fetchOriginDev = () => {
    drift.calls.fetches += 1
    if (drift.calls.fetches > 1) drift.devShas.current = 'd'.repeat(40)
    return {status: 0, stdout: '', stderr: ''}
  }
  assert.equal(run(drift, ['--locale', 'ja-JP', '--path', JA_GUIDES]).status, 'REBASE_REQUIRED')
})

test('unexpected final diff paths fail the run', () => {
  const harness = createHarness({finalExtraPath: 'content/en/guides/tutorials/rogue.md'})
  const result = run(harness, ['--locale', 'ja-JP', '--path', JA_GUIDES])
  assert.equal(result.status, 'VALIDATION_FAILED')
  const report = JSON.parse(fs.readFileSync(path.join(result.reportDirectory, 'report.json'), 'utf8'))
  assert.ok(report.checks.some(check => check.name === 'final-diff-paths' && check.passed === false))
})

test('locale scope integrates with the real evidenceGroups authority', () => {
  const {loadTypeScript} = require('../lib/load-typescript')
  const {classifyEvidencePath} = loadTypeScript('../../packages/docs-tooling/src/publication/evidenceGroups.ts')
  assert.deepEqual(classifyEvidencePath(ZH_REST), ['spec-derived', 'translation'])
  assert.deepEqual(classifyEvidencePath(JA_REST), ['spec-derived', 'translation'])
  assert.equal(parseLocaleScope('zh-CN', ZH_REST, [...classifyEvidencePath(ZH_REST)]), 'evidence')
  assert.equal(parseLocaleScope('ja-JP', JA_REST, [...classifyEvidencePath(JA_REST)]), 'ok')
  assert.deepEqual(classifyEvidencePath('generated/zh-CN/manifests/import.json'), [])
})
