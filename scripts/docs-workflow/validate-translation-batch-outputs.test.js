'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { createBatchInput } = require('./translation-batch-input')
const { parseArgs, validateTranslationBatchOutputs } = require('./validate-translation-batch-outputs')

const SOURCE_SHA = 'a'.repeat(40)
const SOURCE_HASH = 'b'.repeat(64)
const PENDING_HASH = 'c'.repeat(64)
const TARGET = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md'

function candidate() {
  return {
    sourcePath: 'docs/tutorials/a.md',
    targetPath: TARGET,
    sourceHash: SOURCE_HASH,
    locale: 'ja-JP',
    type: 'docs',
    reason: 'current_delta',
  }
}

function manifest(overrides = {}) {
  return {
    locale: 'ja-JP',
    group: 'guides',
    sourceCheckpointSha: SOURCE_SHA,
    generatedAt: '2026-07-18T00:00:00.000Z',
    items: [candidate()],
    source_delta: { deleted_i18n: [], renamed: [] },
    batch: {
      batchIndex: 0,
      batchNumber: 1,
      batchCount: 1,
      batchSize: 10,
      pendingCount: 1,
      pendingSetSha256: PENDING_HASH,
    },
    ...overrides,
  }
}

function report(overrides = {}) {
  return {
    locale: 'ja-JP',
    results: [{ ...candidate(), status: 'translated', review: { pass: true, issues: [] }, validationErrors: [], chunks: { total: 1 } }],
    checkpoint: {
      processed: 1,
      remaining: 0,
      translated: 1,
      failed: 0,
      generatedAt: '2026-07-18T00:00:01.000Z',
    },
    ...overrides,
  }
}

function writeJson(root, relativePath, value) {
  const file = path.join(root, relativePath)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value)}\n`)
}

function writeOutput(root) {
  const file = path.join(root, TARGET)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, '# translated\n')
}

function fixture(options = {}) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'translation-batch-outputs-')))
  const selectedManifest = options.manifest || manifest()
  writeJson(root, 'tmp/translation-manifest.json', selectedManifest)
  writeJson(root, 'tmp/translation-batch-input.json', options.batchInput || createBatchInput(selectedManifest))
  if (options.report !== null) writeJson(root, 'tmp/translation-report.json', options.report || report())
  if (options.output !== false && selectedManifest.items.length > 0) writeOutput(root)
  return root
}

function validate(root, overrides = {}) {
  return validateTranslationBatchOutputs({
    workspace: root,
    manifestPath: 'tmp/translation-manifest.json',
    reportPath: 'tmp/translation-report.json',
    batchInputPath: 'tmp/translation-batch-input.json',
    agentsOutcome: 'success',
    translatedCount: 1,
    failedCount: 0,
    remainingCount: 0,
    ...overrides,
  })
}

test('validates one complete numbered candidate batch', () => {
  const root = fixture()
  try {
    const result = validate(root)
    assert.deepEqual(result, { candidateCount: 1, reconciliationOnly: false })
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('rejects report identity, reviewer, validation, count, and cardinality defects', () => {
  const cases = [
    ['identity mismatch', value => { value.results[0].targetPath = `${TARGET}.wrong` }, /targetPath mismatch/],
    ['review failure', value => { value.results[0].review.pass = false }, /reviewer did not pass/],
    ['validation errors', value => { value.results[0].validationErrors = ['bad MDX'] }, /validation evidence is not clean/],
    ['extra result', value => { value.results.push({ ...value.results[0], sourcePath: 'docs/tutorials/extra.md' }) }, /result count/],
    ['duplicate result', value => { value.results.push({ ...value.results[0] }) }, /result count|identities must be unique/],
    ['missing result', value => { value.results = [] }, /result count/],
    ['checkpoint mismatch', value => { value.checkpoint.failed = 1 }, /checkpoint does not attest complete success/],
  ]

  for (const [name, mutate, expected] of cases) {
    const badReport = report()
    mutate(badReport)
    const root = fixture({ report: badReport })
    try {
      assert.throws(() => validate(root), expected, name)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  }

  const root = fixture()
  try {
    assert.throws(() => validate(root, { translatedCount: 0 }), /output counts do not cover the complete batch/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }

  const second = {
    ...candidate(),
    sourcePath: 'docs/tutorials/b.md',
    targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/b.md',
    sourceHash: 'd'.repeat(64),
  }
  const duplicateManifest = manifest({
    items: [candidate(), second],
    batch: {
      batchIndex: 0,
      batchNumber: 1,
      batchCount: 1,
      batchSize: 10,
      pendingCount: 2,
      pendingSetSha256: PENDING_HASH,
    },
  })
  const duplicateResult = report({
    results: [report().results[0], report().results[0]],
    checkpoint: { ...report().checkpoint, processed: 2, translated: 2 },
  })
  const duplicateRoot = fixture({ manifest: duplicateManifest, report: duplicateResult })
  try {
    assert.throws(() => validate(duplicateRoot, { translatedCount: 2 }), /result identities must be unique/)
  } finally {
    fs.rmSync(duplicateRoot, { recursive: true, force: true })
  }
})

test('rejects missing, symlinked, and unsafe-ancestor candidate outputs', () => {
  const missing = fixture({ output: false })
  try {
    assert.throws(() => validate(missing), /candidate output .* is missing/)
  } finally {
    fs.rmSync(missing, { recursive: true, force: true })
  }

  const symlink = fixture({ output: false })
  try {
    const output = path.join(symlink, TARGET)
    const outside = path.join(symlink, 'outside.md')
    fs.mkdirSync(path.dirname(output), { recursive: true })
    fs.writeFileSync(outside, '# outside\n')
    fs.symlinkSync(outside, output)
    assert.throws(() => validate(symlink), /symbolic-link path component/)
  } finally {
    fs.rmSync(symlink, { recursive: true, force: true })
  }

  const unsafeAncestor = fixture({ output: false })
  try {
    const real = path.join(unsafeAncestor, 'real-i18n')
    fs.mkdirSync(real)
    fs.symlinkSync(real, path.join(unsafeAncestor, 'i18n'))
    assert.throws(() => validate(unsafeAncestor), /symbolic-link path component/)
  } finally {
    fs.rmSync(unsafeAncestor, { recursive: true, force: true })
  }
})

test('reads JSON inputs through pinned regular descriptors without following symlinks', () => {
  const linkedWorkspaceParent = fixture()
  const alias = `${linkedWorkspaceParent}-alias`
  try {
    fs.symlinkSync(path.dirname(linkedWorkspaceParent), alias)
    const workspaceThroughSymlink = path.join(alias, path.basename(linkedWorkspaceParent))
    assert.throws(() => validate(workspaceThroughSymlink), /workspace path contains a symbolic-link component/)
  } finally {
    fs.rmSync(alias, { recursive: true, force: true })
    fs.rmSync(linkedWorkspaceParent, { recursive: true, force: true })
  }

  const linkedFile = fixture()
  try {
    const manifestPath = path.join(linkedFile, 'tmp/translation-manifest.json')
    const realPath = path.join(linkedFile, 'tmp/real-manifest.json')
    fs.renameSync(manifestPath, realPath)
    fs.symlinkSync(realPath, manifestPath)
    assert.throws(() => validate(linkedFile), /manifest.*symbolic link|symbolic-link/i)
  } finally {
    fs.rmSync(linkedFile, { recursive: true, force: true })
  }

  const linkedParent = fixture()
  try {
    fs.renameSync(path.join(linkedParent, 'tmp'), path.join(linkedParent, 'real-tmp'))
    fs.symlinkSync(path.join(linkedParent, 'real-tmp'), path.join(linkedParent, 'tmp'))
    assert.throws(() => validate(linkedParent), /symbolic-link path component/)
  } finally {
    fs.rmSync(linkedParent, { recursive: true, force: true })
  }

  const changedDuringRead = fixture()
  try {
    assert.throws(() => validate(changedDuringRead, {
      testHooks: {
        afterJsonOpen({ label, filePath }) {
          if (label === 'manifest') fs.appendFileSync(filePath, ' ')
        },
      },
    }), /manifest changed while it was being read/)
  } finally {
    fs.rmSync(changedDuringRead, { recursive: true, force: true })
  }

  const replacedBeforeOpen = fixture()
  try {
    assert.throws(() => validate(replacedBeforeOpen, {
      testHooks: {
        afterJsonLstat({ label, filePath }) {
          if (label !== 'manifest') return
          const replacement = `${filePath}.replacement`
          fs.copyFileSync(filePath, replacement)
          fs.renameSync(replacement, filePath)
        },
      },
    }), /manifest identity changed before it was read/)
  } finally {
    fs.rmSync(replacedBeforeOpen, { recursive: true, force: true })
  }
})

test('rejects oversized JSON evidence before allocation', () => {
  const root = fixture()
  try {
    fs.truncateSync(path.join(root, 'tmp/translation-manifest.json'), 8 * 1024 * 1024 + 1)
    assert.throws(() => validate(root), /manifest exceeds the maximum evidence size/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('accepts reconciliation-only batches only with skipped agents, zero counts, and no report requirement', () => {
  const reconciliationManifest = manifest({
    items: [],
    source_delta: {
      deleted_i18n: ['i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/old.md'],
      renamed: [],
    },
    batch: {
      batchIndex: 0,
      batchNumber: 1,
      batchCount: 1,
      batchSize: 10,
      pendingCount: 0,
      pendingSetSha256: PENDING_HASH,
    },
  })
  const root = fixture({ manifest: reconciliationManifest, report: null })
  try {
    assert.deepEqual(validate(root, {
      agentsOutcome: 'skipped',
      translatedCount: 0,
      failedCount: 0,
      remainingCount: 0,
    }), { candidateCount: 0, reconciliationOnly: true })
    assert.throws(() => validate(root, {
      agentsOutcome: 'success',
      translatedCount: 1,
      failedCount: 0,
      remainingCount: 0,
    }), /reconciliation-only batches must skip agents with zero result counts/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }

  const contradictoryReport = fixture({
    manifest: reconciliationManifest,
    report: { locale: 'ja-JP', results: [], checkpoint: { processed: 0, translated: 0, failed: 0, remaining: 0 } },
  })
  try {
    assert.throws(() => validate(contradictoryReport, {
      agentsOutcome: 'skipped',
      translatedCount: 0,
      failedCount: 0,
      remainingCount: 0,
    }), /must not produce a translation report/)
  } finally {
    fs.rmSync(contradictoryReport, { recursive: true, force: true })
  }
})

test('CLI parsing is strict and converts result counts', () => {
  const args = [
    '--manifest', 'tmp/translation-manifest.json',
    '--report', 'tmp/translation-report.json',
    '--batch-input', 'tmp/translation-batch-input.json',
    '--workspace', '/tmp/workspace',
    '--agents-outcome', 'success',
    '--translated-count', '2',
    '--failed-count', '0',
    '--remaining-count', '0',
  ]
  assert.deepEqual(parseArgs(args), {
    manifestPath: 'tmp/translation-manifest.json',
    reportPath: 'tmp/translation-report.json',
    batchInputPath: 'tmp/translation-batch-input.json',
    workspace: '/tmp/workspace',
    agentsOutcome: 'success',
    translatedCount: 2,
    failedCount: 0,
    remainingCount: 0,
  })
  assert.throws(() => parseArgs([...args, '--unknown', 'x']), /Unknown argument/)
  assert.throws(() => parseArgs(args.slice(0, -2)), /Usage:/)
  assert.throws(() => parseArgs(args.with(args.indexOf('2'), '-1')), /non-negative integer/)

  const root = fixture()
  try {
    const cli = spawnSync(process.execPath, [path.join(__dirname, 'validate-translation-batch-outputs.js'),
      '--manifest', 'tmp/translation-manifest.json',
      '--report', 'tmp/translation-report.json',
      '--batch-input', 'tmp/translation-batch-input.json',
      '--workspace', root,
      '--agents-outcome', 'success',
      '--translated-count', '1',
      '--failed-count', '0',
      '--remaining-count', '0',
    ], { encoding: 'utf8' })
    assert.equal(cli.status, 0, cli.stderr)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('module API rejects non-object, missing, unknown, and mistyped options', () => {
  assert.throws(() => validateTranslationBatchOutputs(null), /options must be an object with an exact schema/)
  const root = fixture()
  const valid = {
    workspace: root,
    manifestPath: 'tmp/translation-manifest.json',
    reportPath: 'tmp/translation-report.json',
    batchInputPath: 'tmp/translation-batch-input.json',
    agentsOutcome: 'success',
    translatedCount: 1,
    failedCount: 0,
    remainingCount: 0,
  }
  try {
    assert.throws(() => validateTranslationBatchOutputs({ ...valid, unexpected: true }), /options has invalid keys/)
    const { reportPath, ...missing } = valid
    assert.equal(reportPath, 'tmp/translation-report.json')
    assert.throws(() => validateTranslationBatchOutputs(missing), /options has invalid keys/)
    assert.throws(() => validateTranslationBatchOutputs({ ...valid, agentsOutcome: 'completed' }), /agents outcome must be success or skipped/)
    assert.throws(() => validateTranslationBatchOutputs({ ...valid, translatedCount: '1' }), /translated count must be a non-negative safe integer/)
    assert.throws(() => validateTranslationBatchOutputs({ ...valid, testHooks: { unexpected() {} } }), /testHooks has invalid keys/)
    assert.throws(() => validateTranslationBatchOutputs({ ...valid, testHooks: { afterJsonOpen: true } }), /testHooks\.afterJsonOpen must be a function/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
