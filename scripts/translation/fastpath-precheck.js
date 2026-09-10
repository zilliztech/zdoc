'use strict'

// Local, fail-closed translation fast-path precheck. Validates a working-tree
// content diff on top of origin/dev against the publication evidence groups
// (packages/docs-tooling/src/publication/evidenceGroups.ts), optionally
// regenerates the Chinese Reference manifest, executes every selector command,
// and writes a report under tmp/translation-fastpath/. Never commits, pushes,
// opens PRs, or acquires the production queue. See
// .claude/specs/2026-09-03-translation-fastpath-design.md for the contract.

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const {spawnSync} = require('node:child_process')

const repositoryRoot = path.resolve(__dirname, '../..')
const INVENTORY_PATH = 'deploy/contracts/localization-inputs.inventory.json'
const REPORT_ROOT = 'tmp/translation-fastpath'
const COMMAND_TIMEOUT_MS = 45 * 60 * 1000
const LOCALES = new Set(['ja-JP', 'zh-CN'])

const STATUS = Object.freeze({
  READY_FOR_PR: 0,
  INVALID_BASELINE: 2,
  INVALID_SCOPE: 3,
  UNMAPPED_PATH: 4,
  UNSUPPORTED_EVIDENCE_PATH: 5,
  BLOCKED_CANDIDATE_DERIVED_CHANGE: 6,
  MANIFEST_GENERATION_FAILED: 7,
  VALIDATION_FAILED: 8,
  REBASE_REQUIRED: 9,
})

const STATUS_NAME = Object.freeze(Object.fromEntries(Object.entries(STATUS).map(([name, code]) => [code, name])))

function createDependencies(overrides = {}) {
  return {
    classifyEvidencePath: file => {
      const {loadTypeScript} = require('../lib/load-typescript')
      const {classifyEvidencePath} = loadTypeScript('../../packages/docs-tooling/src/publication/evidenceGroups.ts')
      return classifyEvidencePath(file)
    },
    fetchOriginDev: root => run(root, 'git', ['fetch', 'origin', 'dev']),
    resolveDevSha: root => run(root, 'git', ['rev-parse', '--verify', 'origin/dev^{commit}']).stdout.trim(),
    resolveHeadSha: root => run(root, 'git', ['rev-parse', '--verify', 'HEAD^{commit}']).stdout.trim(),
    isAncestor: (root, ancestor, descendant) =>
      run(root, 'git', ['merge-base', '--is-ancestor', ancestor, descendant]).status === 0,
    diffNameStatus: root => run(root, 'git', ['diff', '--name-status', '--no-renames', 'origin/dev...HEAD']).stdout,
    stagedAndUnstagedStatus: root =>
      run(root, 'git', ['status', '--porcelain', '--untracked-files=all', '-z']).stdout,
    workingTreeDiffCheck: root => run(root, 'git', ['diff', '--check']).status === 0,
    runSelector: files => run(repositoryRoot, 'node', [
      'scripts/docs-workflow/select-tests-for-changes.js', '--json', ...files,
    ]),
    runInventoryGenerate: () => run(repositoryRoot, 'pnpm', ['run', 'generate:localization-input-inventory']),
    runReferenceManifest: () => run(repositoryRoot, 'pnpm', ['docs-tooling', 'reference-manifest', '--write']),
    runValidateReference: site => run(repositoryRoot, 'pnpm', ['docs-tooling', 'validate-reference', '--site', site]),
    validateRestDerivation: locale => {
      const {validateRestDerivationManifest} = require('../../packages/docs-tooling/src/reference/rest/restDerivationManifest')
      validateRestDerivationManifest({
        fragmentRoot: path.join(repositoryRoot, 'packages/docs-tooling/src/reference/rest/meta/openapi'),
        manifestPath: path.join(repositoryRoot, `generated/${locale}/manifests/rest-derivation.json`),
        locale,
      })
      return true
    },
    runCommand: command => run(repositoryRoot, command, [], {shell: true}),
    reportRoot: REPORT_ROOT,
    now: () => new Date(),
    ...overrides,
  }
}

function run(cwd, command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: options.timeout ?? COMMAND_TIMEOUT_MS,
    maxBuffer: 64 * 1024 * 1024,
    shell: options.shell === true,
  })
  if (result.error && result.error.code === 'ENOENT') {
    return {status: 127, stdout: '', stderr: `command not found: ${command}`, error: result.error.message}
  }
  return {
    status: result.status,
    signal: result.signal,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    error: result.error ? result.error.message : undefined,
  }
}

function parseLocaleScope(locale, changedPath, groups) {
  if (locale === 'ja-JP') {
    if (!changedPath.startsWith('i18n/ja-JP/')) return 'locale'
    if (!groups.includes('translation')) return 'evidence'
    return 'ok'
  }
  if (!changedPath.startsWith('content/zh-CN/')) return 'locale'
  if (groups.includes('spec-derived') && !groups.includes('translation')) return 'evidence'
  if (!groups.includes('translation') && !groups.includes('fetch')) return 'evidence'
  // Chinese REST output is owned by the zh REST publication lane.
  if (changedPath.startsWith('content/zh-CN/reference/api/restful/')) return 'evidence'
  return 'ok'
}

function parseArguments(argv) {
  const locale = argv.find((value, index) => argv[index - 1] === '--locale')
  const paths = argv.filter((value, index) => argv[index - 1] === '--path')
  const unknown = argv.filter((value, index) => value !== '--locale' && value !== '--path' && argv[index - 1] !== '--locale' && argv[index - 1] !== '--path')
  if (!locale || !LOCALES.has(locale) || unknown.length > 0) return {error: 'arguments'}
  for (const value of paths) {
    if (!value || value.startsWith('/') || value.includes('..') || /[\0\r\n]/u.test(value)) return {error: 'arguments'}
  }
  return {locale, paths}
}

function runFastpath(argv, dependencies = createDependencies()) {
  const root = dependencies.repositoryRoot ?? repositoryRoot
  const startedAt = dependencies.now()
  const checks = []
  const unexecutedChecks = []
  const state = {
    mode: 'manual-fastpath',
    locale: null,
    baseDevSha: null,
    latestDevSha: null,
    headSha: null,
    changedPaths: [],
    evidenceGroups: {},
    ownership: [],
    referenceManifestGenerated: false,
    restDerivationValidated: null,
    candidateDerivedChanged: false,
    untrackedUserFiles: [],
    status: null,
    readyForPr: false,
  }
  let reportDirectory = null

  const finish = status => {
    state.status = STATUS_NAME[status]
    state.readyForPr = status === STATUS.READY_FOR_PR
    const suffix = `${startedAt.toISOString().replaceAll(/[:.]/gu, '-')}-${crypto.randomBytes(3).toString('hex')}`
    const reportBase = path.isAbsolute(dependencies.reportRoot)
      ? dependencies.reportRoot
      : path.join(root, dependencies.reportRoot)
    reportDirectory = path.join(reportBase, suffix)
    fs.mkdirSync(reportDirectory, {recursive: true})
    const report = {...state, startedAt: startedAt.toISOString(), completedAt: dependencies.now().toISOString(), checks, unexecutedChecks}
    fs.writeFileSync(path.join(reportDirectory, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
    fs.writeFileSync(path.join(reportDirectory, 'report.md'), renderMarkdownReport(report))
    return {status: STATUS_NAME[status], exitCode: status, reportDirectory, report}
  }

  const record = (name, passed, detail = {}) => {
    checks.push({name, passed, ...detail})
    return passed
  }

  const parsed = parseArguments(argv)
  if (parsed.error) return finish(STATUS.INVALID_SCOPE)
  state.locale = parsed.locale

  // Step 2: baseline.
  const fetch = dependencies.fetchOriginDev(root)
  if (!record('fetch-origin-dev', fetch.status === 0, {exitCode: fetch.status, stderr: fetch.stderr.slice(0, 2000)})) {
    return finish(STATUS.INVALID_BASELINE)
  }
  try {
    state.baseDevSha = dependencies.resolveDevSha(root)
    state.headSha = dependencies.resolveHeadSha(root)
  } catch {
    return finish(STATUS.INVALID_BASELINE)
  }
  if (!record('head-based-on-dev', dependencies.isAncestor(root, state.baseDevSha, state.headSha), {baseDevSha: state.baseDevSha, headSha: state.headSha})) {
    return finish(STATUS.INVALID_BASELINE)
  }

  // Step 3: discover changes.
  const nameStatus = dependencies.diffNameStatus(root)
  if (nameStatus.status !== 0) return finish(STATUS.INVALID_BASELINE)
  const trackedChanges = []
  for (const line of nameStatus.stdout.split('\n')) {
    if (!line) continue
    const status = line.slice(0, 1)
    const file = line.slice(1).trim()
    trackedChanges.push({status, file})
  }
  // Include unstaged/staged modifications that origin/dev...HEAD does not cover.
  const porcelain = dependencies.stagedAndUnstagedStatus(root)
  if (porcelain.status !== 0) return finish(STATUS.INVALID_BASELINE)
  for (const entry of porcelain.stdout.split('\0').filter(Boolean)) {
    const status = entry.slice(0, 2)
    const file = entry.slice(3)
    if (status.includes('?')) {
      state.untrackedUserFiles.push(file)
      continue
    }
    if (status.includes('A') || status.includes('D') || status.includes('R')) {
      trackedChanges.push({status: status.trim().slice(0, 1), file})
      continue
    }
    if (!trackedChanges.some(change => change.file === file)) trackedChanges.push({status: 'M', file})
  }
  const disallowedLifecycle = trackedChanges.filter(change => change.status !== 'M')
  if (!record('changes-are-modifications', disallowedLifecycle.length === 0,
    {disallowed: disallowedLifecycle.map(change => `${change.status} ${change.file}`)})) {
    state.changedPaths = trackedChanges.map(change => change.file)
    return finish(STATUS.INVALID_SCOPE)
  }
  state.changedPaths = trackedChanges.map(change => change.file)
  if (state.changedPaths.length === 0) return finish(STATUS.INVALID_SCOPE)

  // Step 4: evidence-group classification per locale scope.
  for (const file of state.changedPaths) {
    const groups = dependencies.classifyEvidencePath(file)
    state.evidenceGroups[file] = groups
    if (groups.length === 0) {
      return finish(STATUS.UNSUPPORTED_EVIDENCE_PATH)
    }
    const scope = parseLocaleScope(state.locale, file, groups)
    if (scope === 'locale') return finish(STATUS.INVALID_SCOPE)
    if (scope === 'evidence') return finish(STATUS.UNSUPPORTED_EVIDENCE_PATH)
  }
  record('evidence-group-scope', true, {evidenceGroups: state.evidenceGroups})

  // Step 5: selector ownership.
  const selector = dependencies.runSelector(state.changedPaths)
  let selection = null
  if (selector.status !== 0) {
    if (/has no entry for/u.test(selector.stderr + selector.stdout)) return finish(STATUS.UNMAPPED_PATH)
    return finish(STATUS.VALIDATION_FAILED)
  }
  try {
    selection = JSON.parse(selector.stdout)
  } catch {
    return finish(STATUS.VALIDATION_FAILED)
  }
  state.ownership = selection.branchPolicies ?? []
  const ownershipFailure = state.ownership.find(policy => policy.owner !== 'dev-published-state')
  if (ownershipFailure) {
    record('selector-ownership', false, {owner: ownershipFailure.owner, file: ownershipFailure.file})
    return finish(STATUS.INVALID_SCOPE)
  }
  record('selector-ownership', true)

  // Step 6: inventory precheck (save bytes, regenerate, compare, restore).
  const inventoryAbsolute = path.join(root, INVENTORY_PATH)
  const inventoryBefore = fs.existsSync(inventoryAbsolute)
    ? fs.readFileSync(inventoryAbsolute)
    : null
  const inventory = dependencies.runInventoryGenerate()
  if (!record('localization-input-inventory', inventory.status === 0, {exitCode: inventory.status, stderr: inventory.stderr.slice(0, 2000)})) {
    if (inventoryBefore !== null) fs.writeFileSync(inventoryAbsolute, inventoryBefore)
    return finish(STATUS.VALIDATION_FAILED)
  }
  const inventoryAfter = fs.existsSync(inventoryAbsolute)
    ? fs.readFileSync(inventoryAbsolute)
    : null
  if (!inventoryBefore?.equals(inventoryAfter)) {
    state.candidateDerivedChanged = true
    if (inventoryBefore !== null) fs.writeFileSync(inventoryAbsolute, inventoryBefore)
    return finish(STATUS.BLOCKED_CANDIDATE_DERIVED_CHANGE)
  }
  record('candidate-derived-unchanged', true)

  // Step 7: Chinese Reference manifest regeneration for zh candidates.
  const zhReferencePaths = state.locale === 'zh-CN'
    ? state.changedPaths.filter(file => file.startsWith('content/zh-CN/reference/') && !file.startsWith('content/zh-CN/reference/api/restful/'))
    : []
  if (zhReferencePaths.length > 0) {
    const manifest = dependencies.runReferenceManifest()
    if (!record('reference-manifest-write', manifest.status === 0, {exitCode: manifest.status, stderr: manifest.stderr.slice(0, 4000)})) {
      return finish(STATUS.MANIFEST_GENERATION_FAILED)
    }
    state.referenceManifestGenerated = true
  }

  // Step 8: export-group validation for REST-classified paths.
  const restLocales = new Set()
  for (const file of state.changedPaths) {
    if ((state.evidenceGroups[file] ?? []).includes('spec-derived')) {
      restLocales.add(file.startsWith('i18n/ja-JP/') ? 'ja-JP' : 'zh-CN')
    }
  }
  for (const locale of restLocales) {
    try {
      dependencies.validateRestDerivation(locale)
      record(`rest-derivation-${locale}`, true)
      state.restDerivationValidated = locale
    } catch (error) {
      record(`rest-derivation-${locale}`, false, {error: String(error.message).slice(0, 2000)})
      return finish(STATUS.VALIDATION_FAILED)
    }
  }

  // Step 9: execute every selector command in order, then site validations.
  const commands = [...(selection.commands ?? [])]
  if (state.locale === 'zh-CN') {
    commands.push('pnpm docs-tooling validate-reference --site en', 'pnpm docs-tooling validate-reference --site zh-CN')
  } else {
    commands.push('pnpm docs-tooling validate-reference --site en', 'pnpm docs-tooling validate-reference --site ja-JP')
  }
  for (const [index, command] of commands.entries()) {
    const started = dependencies.now()
    const result = dependencies.runCommand(command)
    const entry = {
      command,
      startedAt: started.toISOString(),
      completedAt: dependencies.now().toISOString(),
      exitCode: result.status,
      signal: result.signal ?? null,
      timedOut: result.signal === 'SIGTERM',
      stdout: result.stdout.slice(0, 8000),
      stderr: result.stderr.slice(0, 8000),
      passed: result.status === 0,
    }
    checks.push(entry)
    if (result.status !== 0) {
      for (const remaining of commands.slice(index + 1)) unexecutedChecks.push({command: remaining})
      return finish(STATUS.VALIDATION_FAILED)
    }
  }

  // Step 10: final diff check and allowed-path re-verification.
  if (!record('git-diff-check', dependencies.workingTreeDiffCheck(root))) {
    return finish(STATUS.VALIDATION_FAILED)
  }
  const finalNameStatus = dependencies.diffNameStatus(root)
  const finalPorcelain = dependencies.stagedAndUnstagedStatus(root)
  const finalChanged = new Set([...state.changedPaths])
  if (state.referenceManifestGenerated) {
    // The manifest pair and derived sidebars are the expected generated outputs.
    finalChanged.add('generated/en/manifests/reference.json')
    finalChanged.add('generated/zh-CN/manifests/reference-translations.json')
    finalChanged.add('generated/zh-CN/sidebars/python.sidebar.js')
    finalChanged.add('generated/zh-CN/sidebars/java.sidebar.js')
    finalChanged.add('generated/zh-CN/sidebars/node.sidebar.js')
    finalChanged.add('generated/zh-CN/sidebars/go.sidebar.js')
    finalChanged.add('generated/zh-CN/sidebars/cli.sidebar.js')
    finalChanged.add('generated/zh-CN/sidebars/cpp.sidebar.js')
    finalChanged.add('generated/zh-CN/sidebars/restful.sidebar.js')
  }
  for (const line of finalNameStatus.stdout.split('\n')) {
    if (!line) continue
    const file = line.slice(1).trim()
    if (!finalChanged.has(file)) {
      record('final-diff-paths', false, {unexpected: file})
      return finish(STATUS.VALIDATION_FAILED)
    }
  }
  for (const entry of finalPorcelain.stdout.split('\0').filter(Boolean)) {
    if (entry.slice(0, 2).includes('?')) continue
    const file = entry.slice(3)
    if (!finalChanged.has(file)) {
      record('final-diff-paths', false, {unexpected: file})
      return finish(STATUS.VALIDATION_FAILED)
    }
  }
  record('final-diff-paths', true)

  // Step 11: dev drift re-check.
  const refetch = dependencies.fetchOriginDev(root)
  if (refetch.status !== 0) return finish(STATUS.INVALID_BASELINE)
  try {
    state.latestDevSha = dependencies.resolveDevSha(root)
  } catch {
    return finish(STATUS.INVALID_BASELINE)
  }
  if (!record('dev-baseline-stable', state.latestDevSha === state.baseDevSha, {baseDevSha: state.baseDevSha, latestDevSha: state.latestDevSha})) {
    return finish(STATUS.REBASE_REQUIRED)
  }

  return finish(STATUS.READY_FOR_PR)
}

function renderMarkdownReport(report) {
  const lines = [
    '# Translation fast-path precheck report',
    '',
    `- mode: ${report.mode}`,
    `- locale: ${report.locale}`,
    `- status: ${report.status}`,
    `- readyForPr: ${report.readyForPr}`,
    `- head: ${report.headSha}`,
    `- base dev: ${report.baseDevSha} -> latest dev: ${report.latestDevSha}`,
    `- reference manifest generated: ${report.referenceManifestGenerated}`,
    `- rest derivation validated: ${report.restDerivationValidated ?? 'n/a'}`,
    `- candidate-derived changed: ${report.candidateDerivedChanged}`,
    '',
    '## Changed paths',
    '',
    ...report.changedPaths.map(file => `- ${file} [${(report.evidenceGroups[file] ?? []).join(', ')}]`),
    '',
    '## Ownership',
    '',
    ...report.ownership.map(policy => `- ${policy.file}: ${policy.owner} -> ${policy.targetBranch}`),
    '',
    '## Untracked user files (tolerated, not cleaned)',
    '',
    ...(report.untrackedUserFiles.length ? report.untrackedUserFiles.map(file => `- ${file}`) : ['- none']),
    '',
    '## Checks',
    '',
    ...report.checks.map(check => `- ${check.passed ? 'PASS' : 'FAIL'} ${check.name}${check.command ? `: \`${check.command}\`` : ''}`),
    '',
    '## Unexecuted checks',
    '',
    ...(report.unexecutedChecks.length ? report.unexecutedChecks.map(check => `- ${check.command}`) : ['- none']),
    '',
  ]
  return `${lines.join('\n')}\n`
}

function main(argv = process.argv.slice(2)) {
  const result = runFastpath(argv)
  process.stdout.write(`STATUS=${result.status}\nREPORT=${path.relative(repositoryRoot, result.reportDirectory)}\nREADY_FOR_PR=${result.report.readyForPr}\n`)
  process.exitCode = result.exitCode
}

module.exports = {
  STATUS,
  STATUS_NAME,
  createDependencies,
  parseArguments,
  parseLocaleScope,
  runFastpath,
  main,
}

if (require.main === module) main()
