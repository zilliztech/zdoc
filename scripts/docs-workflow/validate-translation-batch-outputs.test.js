'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { createBatchInput } = require('./translation-batch-input')
const { parseArgs, validateTranslationBatchOutputs } = require('./validate-translation-batch-outputs')
const {createReconciliationOperation, createReconciliationPlan} = require('../translation/reconciliation-plan')

const SOURCE_SHA = 'a'.repeat(40)
const PENDING_HASH = 'c'.repeat(64)
const TARGET = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md'
const SECOND_TARGET = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/b.md'
const SOURCE_CONTENT = '# source\n'
const SECOND_SOURCE_CONTENT = '# second source\n'
const SOURCE_HASH = sha256(SOURCE_CONTENT)
const SECOND_SOURCE_HASH = sha256(SECOND_SOURCE_CONTENT)
const TARGET_CONTENT = '# translated\n'
const BASELINE_TARGET_CONTENT = '# baseline translation\n'

function cleanReview() {
  return {
    pass: true,
    issues: [],
    unsupportedIssues: [],
    contractConflicts: [],
    localeContractIssues: [],
    reviewerPass: true,
    error: null,
  }
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function recoveryReceipt(overrides = {}) {
  return {
    schemaVersion: 1,
    sourcePath: candidate().sourcePath,
    targetPath: candidate().targetPath,
    sourceHash: candidate().sourceHash,
    targetHash: sha256(TARGET_CONTENT),
    locale: 'ja-JP',
    group: 'guides',
    promptContractSha256: 'd'.repeat(64),
    model: 'translation-model',
    toolingSha: 'e'.repeat(40),
    review: cleanReview(),
    validationErrors: [],
    ...overrides,
  }
}

function candidate() {
  return {
    sourcePath: 'content/en/guides/tutorials/a.md',
    targetPath: TARGET,
    sourceHash: SOURCE_HASH,
    locale: 'ja-JP',
    type: 'guides',
    reason: 'current_delta',
  }
}

function secondCandidate() {
  return {
    ...candidate(),
    sourcePath: 'content/en/guides/tutorials/b.md',
    targetPath: SECOND_TARGET,
    sourceHash: SECOND_SOURCE_HASH,
  }
}

function failedResult(item = candidate(), overrides = {}) {
  return {
    ...item,
    status: 'failed',
    failureCategory: 'provider_timeout',
    error: 'translation provider timed out',
    attempts: 1,
    retryFailures: [{attempt: 1, category: 'provider_timeout', error: 'translation provider timed out'}],
    ...overrides,
  }
}

function manifest(overrides = {}) {
  return {
    target: 'ja-JP',
    locale: 'ja-JP',
    group: 'guides',
    sourceCheckpointSha: SOURCE_SHA,
    generatedAt: '2026-07-18T00:00:00.000Z',
    items: [candidate()],
    reconciliation: {
      planArtifact: 'translation-reconciliation-plan-ja-JP-guides-1',
      planSha256: reconciliationPlan().planSha256,
      operationCount: reconciliationPlan().operations.length,
    },
    batch: {
      batchIndex: 0,
      batchNumber: 1,
      batchCount: 1,
      batchSize: 10,
      pendingCount: 1,
      pendingSetSha256: PENDING_HASH,
      reconciliationOwner: false,
    },
    ...overrides,
  }
}

function reconciliationPlan(renames = [], deletions = []) {
  const list = Array.isArray(renames) ? renames : [renames]
  const operations = [
    ...list.map(renamed => createReconciliationOperation({kind: 'replace_path', sourcePath: renamed.oldPath, targetPath: renamed.oldI18nPath, replacementSourcePath: renamed.newPath, replacementTargetPath: renamed.newI18nPath, reason: 'source_replaced', evidence: {sourceExistedAtBaseline: true, sourceMissingAtCheckpoint: true, targetExistsAtBaseline: true, mappingIsCanonical: true, ownedByGroup: true, preserved: false, generatorCompletenessReceipt: null}, authorization: {status: 'approved', method: 'automatic', ruleId: 'test-policy:ja-JP:guides', receiptSha256: null}})),
    ...deletions.map(({sourcePath, targetPath}) => createReconciliationOperation({kind: 'delete_target', sourcePath, targetPath, replacementSourcePath: null, replacementTargetPath: null, reason: 'source_deleted', evidence: {sourceExistedAtBaseline: true, sourceMissingAtCheckpoint: true, targetExistsAtBaseline: true, mappingIsCanonical: true, ownedByGroup: true, preserved: false, generatorCompletenessReceipt: null}, authorization: {status: 'approved', method: 'automatic', ruleId: 'test-policy:ja-JP:guides', receiptSha256: null}})),
  ]
  return createReconciliationPlan({schemaVersion: 1, document: 'translation-reconciliation-plan', target: 'ja-JP', group: 'guides', toolingSha: '4'.repeat(40), sourceBaselineSha: '2'.repeat(40), sourceCheckpointSha: SOURCE_SHA, targetBaselineSha: '3'.repeat(40), policyId: 'test-policy', operations})
}

function report(overrides = {}) {
  return {
    locale: 'ja-JP',
    results: [{ ...candidate(), status: 'translated', review: cleanReview(), validationErrors: [], chunks: { total: 1 } }],
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
  fs.writeFileSync(file, TARGET_CONTENT)
}

function fixture(options = {}) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'translation-batch-outputs-')))
  const baseline = path.join(root, 'baseline')
  fs.mkdirSync(baseline)
  const selectedManifest = options.manifest || manifest()
  const plan = options.reconciliationPlan === undefined ? reconciliationPlan() : options.reconciliationPlan
  writeJson(root, 'tmp/translation-manifest.json', selectedManifest)
  writeJson(root, 'tmp/translation-batch-input.json', options.batchInput || createBatchInput(selectedManifest, plan))
  if (plan !== null) writeJson(root, 'tmp/reconciliation-plan.json', plan)
  if (options.report !== null) writeJson(root, 'tmp/translation-report.json', options.report || report())
  for (const item of selectedManifest.items) {
    const sourceContent = options.sourceContents?.[item.sourcePath]
      || (item.sourcePath === secondCandidate().sourcePath ? SECOND_SOURCE_CONTENT : SOURCE_CONTENT)
    const sourceFile = path.join(root, item.sourcePath)
    fs.mkdirSync(path.dirname(sourceFile), { recursive: true })
    fs.writeFileSync(sourceFile, sourceContent)
  }
  if (options.output !== false && selectedManifest.items.length > 0) {
    if (options.outputs) {
      for (const [relativePath, contents] of Object.entries(options.outputs)) write(root, relativePath, contents)
    } else {
      writeOutput(root)
    }
  }
  for (const [relativePath, contents] of Object.entries(options.baselineOutputs || {})) write(baseline, relativePath, contents)
  writeJson(root, '.translation-cache/ja-JP.json', {files: options.workspaceCache || {}})
  writeJson(baseline, '.translation-cache/ja-JP.json', {files: options.baselineCache || {}})
  return root
}

function validate(root, overrides = {}) {
  return validateTranslationBatchOutputs({
    workspace: root,
    baseline: path.join(root, 'baseline'),
    manifestPath: 'tmp/translation-manifest.json',
    reportPath: 'tmp/translation-report.json',
    batchInputPath: 'tmp/translation-batch-input.json',
    reconciliationPlanPath: 'tmp/reconciliation-plan.json',
    agentsOutcome: 'success',
    translatedCount: 1,
    failedCount: 0,
    remainingCount: 0,
    ...overrides,
  })
}

function write(root, relativePath, contents) {
  const file = path.join(root, relativePath)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, contents)
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

test('accepts complete mixed and all-failed terminal batches without synthesizing failed outputs', () => {
  const existingCache = {
    sourceHash: 'f'.repeat(64),
    targetPath: SECOND_TARGET,
    translatedAt: '2026-07-01T00:00:00.000Z',
  }
  const translatedCache = {
    sourceHash: SOURCE_HASH,
    targetPath: TARGET,
    translatedAt: '2026-07-18T00:00:01.000Z',
  }
  const mixedManifest = manifest({
    items: [candidate(), secondCandidate()],
    batch: {...manifest().batch, pendingCount: 2},
  })
  const mixedReport = report({
    results: [report().results[0], failedResult(secondCandidate())],
    checkpoint: {...report().checkpoint, processed: 2, translated: 1, failed: 1},
  })
  const mixedRoot = fixture({
    manifest: mixedManifest,
    report: mixedReport,
    outputs: {[TARGET]: TARGET_CONTENT, [SECOND_TARGET]: BASELINE_TARGET_CONTENT},
    baselineOutputs: {[SECOND_TARGET]: BASELINE_TARGET_CONTENT},
    baselineCache: {[secondCandidate().sourcePath]: existingCache},
    workspaceCache: {[candidate().sourcePath]: translatedCache, [secondCandidate().sourcePath]: existingCache},
  })
  try {
    assert.deepEqual(validate(mixedRoot, {translatedCount: 1, failedCount: 1}), {
      candidateCount: 2,
      reconciliationOnly: false,
    })
  } finally {
    fs.rmSync(mixedRoot, {recursive: true, force: true})
  }

  const failedOnlyReport = report({
    results: [failedResult()],
    checkpoint: {...report().checkpoint, translated: 0, failed: 1},
  })
  const failedOnlyRoot = fixture({report: failedOnlyReport, output: false})
  try {
    assert.deepEqual(validate(failedOnlyRoot, {translatedCount: 0, failedCount: 1}), {
      candidateCount: 1,
      reconciliationOnly: false,
    })
    assert.equal(fs.existsSync(path.join(failedOnlyRoot, TARGET)), false)
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(failedOnlyRoot, '.translation-cache/ja-JP.json'), 'utf8')), {files: {}})
  } finally {
    fs.rmSync(failedOnlyRoot, {recursive: true, force: true})
  }
})


test('accepts failed review evidence when only the bounded review error is present', () => {
  const failed = failedResult(candidate(), {
    failureCategory: 'review_failed',
    error: null,
    review: {
      ...cleanReview(),
      pass: false,
      reviewerPass: false,
      error: "Expected ',' or '}' after property value in JSON at position 252",
    },
    retryFailures: [],
    validationErrors: [],
  })
  const root = fixture({
    report: report({results: [failed], checkpoint: {...report().checkpoint, translated: 0, failed: 1}}),
    output: false,
  })
  try {
    assert.deepEqual(validate(root, {translatedCount: 0, failedCount: 1}), {
      candidateCount: 1,
      reconciliationOnly: false,
    })
  } finally {
    fs.rmSync(root, {recursive: true, force: true})
  }
})

test('accepts failed review evidence with a null top-level error and bounded structured retry evidence', () => {

  const failed = failedResult(candidate(), {
    failureCategory: 'locale_contract_failed',
    error: null,
    review: {
      ...cleanReview(),
      pass: false,
      reviewerPass: false,
      localeContractIssues: [{type: 'mandatory_term', message: 'Required locale term was not used'}],
    },
    retryFailures: [{attempt: 1, category: 'locale_contract_failed', error: 'Required locale term was not used'}],
  })
  const root = fixture({
    report: report({results: [failed], checkpoint: {...report().checkpoint, translated: 0, failed: 1}}),
    output: false,
  })
  try {
    assert.deepEqual(validate(root, {translatedCount: 0, failedCount: 1}), {
      candidateCount: 1,
      reconciliationOnly: false,
    })
  } finally {
    fs.rmSync(root, {recursive: true, force: true})
  }
})

test('accepts evidenced unknown failures as reportable partial-success candidates', () => {
  const retained = failedResult(candidate(), {
    failureCategory: 'unknown',
    error: 'Semantic unit response entry count mismatch',
    retryFailures: [{attempt: 1, category: 'unknown', error: 'Semantic unit response entry count mismatch'}],
  })
  const retainedRoot = fixture({
    report: report({results: [retained], checkpoint: {...report().checkpoint, translated: 0, failed: 1}}),
    output: false,
  })
  try {
    assert.deepEqual(validate(retainedRoot, {translatedCount: 0, failedCount: 1}), {
      candidateCount: 1,
      reconciliationOnly: false,
    })
  } finally {
    fs.rmSync(retainedRoot, {recursive: true, force: true})
  }

  const structured = failedResult(candidate(), {
    failureCategory: 'unknown',
    error: 'opaque semantic response failure',
    code: 'SEMANTIC_RESPONSE_COUNT_MISMATCH',
    retryFailures: [{attempt: 1, category: 'unknown', error: 'opaque semantic response failure', code: 'SEMANTIC_RESPONSE_COUNT_MISMATCH'}],
  })
  const structuredRoot = fixture({
    report: report({results: [structured], checkpoint: {...report().checkpoint, translated: 0, failed: 1}}),
    output: false,
  })
  try {
    assert.deepEqual(validate(structuredRoot, {translatedCount: 0, failedCount: 1}), {
      candidateCount: 1,
      reconciliationOnly: false,
    })
  } finally {
    fs.rmSync(structuredRoot, {recursive: true, force: true})
  }

  for (const error of [
    'prefix: Semantic unit response entry count mismatch',
    'Semantic unit response entry count mismatch: suffix',
  ]) {
    const decoratedRoot = fixture({
      report: report({
        results: [failedResult(candidate(), {
          failureCategory: 'unknown',
          error,
          retryFailures: [{attempt: 1, category: 'unknown', error}],
        })],
        checkpoint: {...report().checkpoint, translated: 0, failed: 1},
      }),
      output: false,
    })
    try {
      assert.deepEqual(validate(decoratedRoot, {translatedCount: 0, failedCount: 1}), {
        candidateCount: 1,
        reconciliationOnly: false,
      })
    } finally {
      fs.rmSync(decoratedRoot, {recursive: true, force: true})
    }
  }

  const unknownRoot = fixture({
    report: report({
      results: [failedResult(candidate(), {
        failureCategory: 'unknown',
        error: 'opaque retained failure',
        retryFailures: [{attempt: 1, category: 'unknown', error: 'opaque retained failure'}],
      })],
      checkpoint: {...report().checkpoint, translated: 0, failed: 1},
    }),
    output: false,
  })
  try {
    assert.deepEqual(validate(unknownRoot, {translatedCount: 0, failedCount: 1}), {
      candidateCount: 1,
      reconciliationOnly: false,
    })
  } finally {
    fs.rmSync(unknownRoot, {recursive: true, force: true})
  }

  const inferredTimeoutRoot = fixture({
    report: report({
      results: [failedResult(candidate(), {
        failureCategory: 'unknown',
        error: 'request timed out',
        retryFailures: [{attempt: 1, category: 'unknown', error: 'request timed out'}],
      })],
      checkpoint: {...report().checkpoint, translated: 0, failed: 1},
    }),
    output: false,
  })
  try {
    assert.deepEqual(validate(inferredTimeoutRoot, {translatedCount: 0, failedCount: 1}), {
      candidateCount: 1,
      reconciliationOnly: false,
    })
  } finally {
    fs.rmSync(inferredTimeoutRoot, {recursive: true, force: true})
  }
})

test('rejects incomplete counts and malformed terminal result coverage', () => {
  const cases = [
    ['remaining work', {remainingCount: 1}, report(), /remaining|complete batch/i],
    ['count mismatch', {translatedCount: 0, failedCount: 0}, report(), /counts do not cover the complete batch/i],
    ['unknown status', {translatedCount: 0, failedCount: 1}, report({
      results: [{...failedResult(), status: 'deferred'}],
      checkpoint: {...report().checkpoint, translated: 0, failed: 1},
    }), /unknown.*status|terminal status/i],
    ['missing failure category', {translatedCount: 0, failedCount: 1}, report({
      results: [failedResult(candidate(), {failureCategory: undefined})],
      checkpoint: {...report().checkpoint, translated: 0, failed: 1},
    }), /failure category/i],
    ['unbounded failure error', {translatedCount: 0, failedCount: 1}, report({
      results: [failedResult(candidate(), {error: 'x'.repeat(2001)})],
      checkpoint: {...report().checkpoint, translated: 0, failed: 1},
    }), /bounded.*error|error evidence/i],
    ['absent failure evidence', {translatedCount: 0, failedCount: 1}, report({
      results: [failedResult(candidate(), {error: null, retryFailures: [], review: undefined, validationErrors: []})],
      checkpoint: {...report().checkpoint, translated: 0, failed: 1},
    }), /failure evidence/i],
  ]

  for (const [name, counts, selectedReport, expected] of cases) {
    const root = fixture({report: selectedReport, output: counts.failedCount ? false : undefined})
    try {
      assert.throws(() => validate(root, counts), expected, name)
    } finally {
      fs.rmSync(root, {recursive: true, force: true})
    }
  }
})

test('rejects output or cache mutation attributed to a failed candidate', () => {
  const oldCache = {
    sourceHash: 'f'.repeat(64),
    targetPath: TARGET,
    translatedAt: '2026-07-01T00:00:00.000Z',
  }
  const failedReport = report({
    results: [failedResult()],
    checkpoint: {...report().checkpoint, translated: 0, failed: 1},
  })
  const cases = [
    ['existing target bytes', {
      outputs: {[TARGET]: '# unauthorized failed output\n'},
      baselineOutputs: {[TARGET]: BASELINE_TARGET_CONTENT},
      baselineCache: {[candidate().sourcePath]: oldCache},
      workspaceCache: {[candidate().sourcePath]: oldCache},
    }, /failed candidate target.*baseline|unauthorized.*failed.*output/i],
    ['new target creation', {
      outputs: {[TARGET]: '# fake translation\n'},
    }, /failed candidate target.*absent|unauthorized.*failed.*output/i],
    ['cache provenance', {
      outputs: {[TARGET]: BASELINE_TARGET_CONTENT},
      baselineOutputs: {[TARGET]: BASELINE_TARGET_CONTENT},
      baselineCache: {[candidate().sourcePath]: oldCache},
      workspaceCache: {[candidate().sourcePath]: {...oldCache, sourceHash: SOURCE_HASH}},
    }, /failed candidate.*cache.*baseline|unauthorized.*failed.*cache/i],
  ]

  for (const [name, options, expected] of cases) {
    const root = fixture({report: failedReport, ...options})
    try {
      assert.throws(() => validate(root, {translatedCount: 0, failedCount: 1}), expected, name)
    } finally {
      fs.rmSync(root, {recursive: true, force: true})
    }
  }
})

test('rejects current source bytes that do not match the authenticated candidate hash', () => {
  const root = fixture()
  try {
    fs.writeFileSync(path.join(root, candidate().sourcePath), '# tampered source\n')
    assert.throws(() => validate(root), /candidate source hash mismatch/)
  } finally {
    fs.rmSync(root, {recursive: true, force: true})
  }
})

test('rejects report identity, reviewer, validation, count, and cardinality defects', () => {
  const cases = [
    ['identity mismatch', value => { value.results[0].targetPath = `${TARGET}.wrong` }, /targetPath mismatch/],
    ['review failure', value => { value.results[0].review.pass = false }, /review evidence is not internally consistent/],
    ['revalidated recovered marker without receipt', value => {
      value.results[0].recovered = true
      value.results[0].recoveryCompatibility = 'revalidated'
    }, /recovery reviewer receipt/i],
    ['validation errors', value => { value.results[0].validationErrors = ['bad MDX'] }, /validation evidence is not clean/],
    ['extra result', value => { value.results.push({ ...value.results[0], sourcePath: 'docs/tutorials/extra.md' }) }, /result count/],
    ['duplicate result', value => { value.results.push({ ...value.results[0] }) }, /result count|identities must be unique/],
    ['missing result', value => { value.results = [] }, /result count/],
    ['checkpoint mismatch', value => { value.checkpoint.failed = 1 }, /checkpoint does not attest complete terminal coverage/],
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
    sourcePath: 'content/en/guides/tutorials/b.md',
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
      reconciliationOwner: false,
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

test('rejects contradictory review evidence and recovered-result receipt bypasses', () => {
  const cases = [
    ['fresh contradictory review', value => {
      value.results[0].review.unsupportedIssues = [{reason: 'unsupported'}]
    }, /review evidence is not internally consistent/i],
    ['fresh contradictory REST review', value => {
      value.results[0].restSpecReview = cleanReview()
      value.results[0].restSpecReview.error = 'hidden failure'
    }, /REST review evidence is not internally consistent/i],
    ['recovered receipt target hash mismatch', value => {
      Object.assign(value.results[0], {
        recovered: true,
        recoveryCompatibility: 'revalidated',
        recoveryReviewReceipt: recoveryReceipt({targetHash: 'f'.repeat(64)}),
      })
    }, /targetHash does not match/i],
    ['recovered copied review mismatch', value => {
      Object.assign(value.results[0], {
        recovered: true,
        recoveryCompatibility: 'revalidated',
        recoveryReviewReceipt: recoveryReceipt(),
      })
      value.results[0].review.copiedEvidence = 'forged'
    }, /copied review evidence does not match/i],
    ['recovered copied REST review mismatch', value => {
      Object.assign(value.results[0], {
        recovered: true,
        recoveryCompatibility: 'revalidated',
        recoveryReviewReceipt: recoveryReceipt(),
        restSpecReview: cleanReview(),
      })
    }, /copied REST review evidence does not match/i],
  ]

  for (const [name, mutate, expected] of cases) {
    const badReport = report()
    mutate(badReport)
    const root = fixture({report: badReport})
    try {
      assert.throws(() => validate(root), expected, name)
    } finally {
      fs.rmSync(root, {recursive: true, force: true})
    }
  }

  const validReport = report()
  Object.assign(validReport.results[0], {
    recovered: true,
    recoveryCompatibility: 'revalidated',
    recoveryReviewReceipt: recoveryReceipt(),
  })
  const validRoot = fixture({report: validReport})
  try {
    assert.deepEqual(validate(validRoot), {candidateCount: 1, reconciliationOnly: false})
  } finally {
    fs.rmSync(validRoot, {recursive: true, force: true})
  }
})

test('derives REST review requirements from authenticated current source content', () => {
  const shellSourcePath = candidate().sourcePath
  const shellTargetPath = candidate().targetPath
  const shellSource = '# Control Plane\n\nControl-plane APIs.\n'
  const shellCandidate = {...candidate(), sourcePath: shellSourcePath, targetPath: shellTargetPath, sourceHash: sha256(shellSource)}
  const shellManifest = manifest({items: [shellCandidate]})
  const shellReport = report({
    results: [{...shellCandidate, status: 'translated', review: cleanReview(), validationErrors: [], chunks: {total: 1}}],
  })
  const shellRoot = fixture({manifest: shellManifest, report: shellReport, sourceContents: {[shellSourcePath]: shellSource}, output: false})
  try {
    const output = path.join(shellRoot, shellTargetPath)
    fs.mkdirSync(path.dirname(output), {recursive: true})
    fs.writeFileSync(output, TARGET_CONTENT)
    assert.deepEqual(validate(shellRoot), {candidateCount: 1, reconciliationOnly: false})

    Object.assign(shellReport.results[0], {
      recovered: true,
      recoveryCompatibility: 'revalidated',
      recoveryReviewReceipt: recoveryReceipt({
        sourcePath: shellSourcePath,
        targetPath: shellTargetPath,
        sourceHash: sha256(shellSource),
        locale: 'ja-JP',
        group: 'guides',
      }),
    })
    writeJson(shellRoot, 'tmp/translation-report.json', shellReport)
    assert.deepEqual(validate(shellRoot), {candidateCount: 1, reconciliationOnly: false})
  } finally {
    fs.rmSync(shellRoot, {recursive: true, force: true})
  }

  const specsSourcePath = candidate().sourcePath
  const specsTargetPath = candidate().targetPath
  const specsSource = '# Search\n\nexport const specs = {"summary":"Search"}\nexport const endpoint = "/v1/search"\n'
  const specsCandidate = {...candidate(), sourcePath: specsSourcePath, targetPath: specsTargetPath, sourceHash: sha256(specsSource)}
  const specsManifest = manifest({items: [specsCandidate]})
  const specsReport = report({
    results: [{...specsCandidate, status: 'translated', review: cleanReview(), validationErrors: [], chunks: {total: 1}}],
  })
  const specsRoot = fixture({manifest: specsManifest, report: specsReport, sourceContents: {[specsSourcePath]: specsSource}, output: false})
  try {
    const output = path.join(specsRoot, specsTargetPath)
    fs.mkdirSync(path.dirname(output), {recursive: true})
    fs.writeFileSync(output, TARGET_CONTENT)
    assert.throws(() => validate(specsRoot), /REST review evidence is not internally consistent/i)

    specsReport.results[0].restSpecReview = cleanReview()
    Object.assign(specsReport.results[0], {
      recovered: true,
      recoveryCompatibility: 'revalidated',
      recoveryReviewReceipt: recoveryReceipt({
        sourcePath: specsSourcePath,
        targetPath: specsTargetPath,
        sourceHash: sha256(specsSource),
        locale: 'ja-JP',
        group: 'guides',
      }),
    })
    writeJson(specsRoot, 'tmp/translation-report.json', specsReport)
    assert.throws(() => validate(specsRoot), /recovery reviewer receipt is invalid.*REST reviewer success/i)
  } finally {
    fs.rmSync(specsRoot, {recursive: true, force: true})
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
  const deleted = {sourcePath: 'content/en/guides/tutorials/old.md', targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/old.md'}
  const plan = reconciliationPlan([], [deleted])
  const reconciliationManifest = manifest({
    items: [],
    reconciliation: {
      planArtifact: 'translation-reconciliation-plan-ja-JP-guides-1',
      planSha256: plan.planSha256,
      operationCount: plan.operations.length,
    },
    batch: {
      batchIndex: 0,
      batchNumber: 1,
      batchCount: 1,
      batchSize: 10,
      pendingCount: 0,
      pendingSetSha256: PENDING_HASH,
      reconciliationOwner: true,
    },
  })
  const root = fixture({ manifest: reconciliationManifest, report: null, reconciliationPlan: plan })
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
    reconciliationPlan: plan,
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
    '--baseline', '/tmp/baseline',
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
    baseline: '/tmp/baseline',
    reconciliationPlanPath: undefined,
    agentsOutcome: 'success',
    translatedCount: 2,
    failedCount: 0,
    remainingCount: 0,
  })
  const withPlan = parseArgs([...args.slice(0, 6), '--reconciliation-plan', 'tmp/reconciliation-plan.json', ...args.slice(6)])
  assert.equal(withPlan.reconciliationPlanPath, 'tmp/reconciliation-plan.json')
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
      '--baseline', path.join(root, 'baseline'),
      '--reconciliation-plan', 'tmp/reconciliation-plan.json',
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
    baseline: path.join(root, 'baseline'),
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
