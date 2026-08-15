const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const {
  buildManifest,
  buildRetirementReview,
  cachePathForLocale,
  ReconciliationReviewRequiredError,
  localeForTarget,
  writeCache,
} = require('./manifest')

function hashContent(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex')
}

function referenceRecord({ manual, sourcePath, targetPath, sourceHash, sourceCommit = 'a'.repeat(40), status = 'translated' }) {
  return {
    manual,
    sourcePath,
    targetPath,
    sourceCommit,
    sourceHash,
    targetHash: 'b'.repeat(64),
    status,
  }
}

function git(repository, args) {
  const result = spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'})
  assert.equal(result.status, 0, result.stderr)
  return result.stdout.trim()
}

function withTempDir(callback) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-manifest-'))
  try {
    callback(dir)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, 'utf8')
}

function testBuildManifestIncludesChangedAndMissingDocs() {
  withTempDir(siteDir => {
    const source = '# Hello\n\nUpdated content.\n'
    const unchanged = '# Stable\n\nNo changes.\n'
    write(path.join(siteDir, 'content/en/guides/tutorials/hello.md'), source)
    write(path.join(siteDir, 'content/en/guides/tutorials/stable.md'), unchanged)
    write(path.join(siteDir, 'content/en/byoc/tutorials/byoc.md'), '# BYOC\n')
    write(
      path.join(siteDir, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/stable.md'),
      '# 安定\n\n変更なし。\n',
    )

    const cachePath = cachePathForLocale(siteDir, 'ja-JP')
    write(cachePath, JSON.stringify({
      files: {
        'content/en/guides/tutorials/hello.md': { sourceHash: 'old-hash' },
        'content/en/guides/tutorials/stable.md': { sourceHash: hashContent(unchanged) },
      },
    }, null, 2))

    const manifest = buildManifest({
      siteDir,
      locale: 'ja-JP',
      group: 'guides',
      sourceCheckpointSha: 'a'.repeat(40),
    })

    assert.equal(manifest.target, 'ja-JP')
    assert.deepEqual(
      manifest.items.map(item => item.sourcePath).sort(),
      ['content/en/byoc/tutorials/byoc.md', 'content/en/guides/tutorials/hello.md'],
    )
    assert.equal(
      manifest.items.find(item => item.sourcePath === 'content/en/guides/tutorials/hello.md').targetPath,
      'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/hello.md',
    )
    assert.equal(
      manifest.items.find(item => item.sourcePath === 'content/en/byoc/tutorials/byoc.md').targetPath,
      'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/byoc.md',
    )
  })
}

function testPendingReferenceStateSelectsOnlyPendingAndChangedWork() {
  withTempDir(siteDir => {
    const completePath = 'content/en/reference/api/python/python/complete.md'
    const pendingPath = 'content/en/reference/api/python/python/pending.md'
    const changedPath = 'content/en/reference/api/python/python/changed.md'
    const completeTarget = completePath.replace('content/en/', 'content/zh-CN/')
    const pendingTarget = pendingPath.replace('content/en/', 'content/zh-CN/')
    const changedTarget = changedPath.replace('content/en/', 'content/zh-CN/')
    for (const [sourcePath, contents] of [
      [completePath, '# complete\n'], [pendingPath, '# pending\n'], [changedPath, '# changed v2\n'],
    ]) write(path.join(siteDir, sourcePath), contents)
    write(path.join(siteDir, completeTarget), '# 完成\n')
    write(path.join(siteDir, changedTarget), '# 旧版本\n')
    write(path.join(siteDir, 'generated/zh-CN/manifests/reference-translations.json'), JSON.stringify({
      schemaVersion: 1,
      bootstrapCompletedGroups: ['python'],
      records: [
        referenceRecord({manual: 'python', sourcePath: changedPath, targetPath: changedTarget, sourceHash: hashContent('# changed v1\n')}),
        referenceRecord({manual: 'python', sourcePath: completePath, targetPath: completeTarget, sourceHash: hashContent('# complete\n')}),
      ].sort((left, right) => left.sourcePath.localeCompare(right.sourcePath)),
      pendingRecords: [{
        manual: 'python', sourcePath: pendingPath, targetPath: pendingTarget,
        sourceCommit: 'a'.repeat(40), sourceHash: hashContent('# pending\n'),
      }],
    }))

    const manifest = buildManifest({
      siteDir,
      target: 'zh-CN-reference',
      locale: 'zh-CN',
      group: 'python',
      sourceCheckpointSha: 'c'.repeat(40),
      mode: 'incremental',
    })

    assert.deepEqual(manifest.items.map(item => item.sourcePath).sort(), [changedPath, pendingPath].sort())
  })
}

function testExplicitTargetLocales() {
  assert.equal(localeForTarget('ja-JP'), 'ja-JP')
  assert.equal(localeForTarget('zh-CN-reference'), 'zh-CN')
  assert.throws(() => localeForTarget('zh-CN-tools'), /unknown translation target/i)
}

function testReconciliationReviewStopsManifestBeforeCandidateScanning() {
  withTempDir(siteDir => {
    const policy = fs.readFileSync(path.join(__dirname, '../../config/translation/reconciliation-policy.json'), 'utf8')
    write(path.join(siteDir, 'config/translation/reconciliation-policy.json'), policy)
    const sourcePath = 'content/en/reference/api/python/python/old.md'
    const targetPath = 'content/zh-CN/reference/api/python/python/old.md'
    const discovery = {
      sourceBaselineSha: '2'.repeat(40),
      sourceCheckpointSha: '3'.repeat(40),
      targetBaselineSha: '4'.repeat(40),
      sourceCheckpointInventory: [],
      candidates: [{
        kind: 'delete_target', sourcePath, targetPath, replacementSourcePath: null, replacementTargetPath: null, reason: 'source_deleted',
        evidence: {sourceExistedAtBaseline: true, sourceMissingAtCheckpoint: true, targetExistsAtBaseline: true, mappingIsCanonical: true, ownedByGroup: true, preserved: false, generatorCompletenessReceipt: null},
      }],
    }
    assert.throws(() => buildManifest({
      siteDir,
      target: 'zh-CN-reference',
      group: 'python',
      sourceCheckpointSha: discovery.sourceCheckpointSha,
      reconciliation: {toolingSha: '1'.repeat(40), discovery, planArtifact: 'translation-reconciliation-plan-zh-CN-reference-python-123'},
    }), error => {
      assert.equal(error instanceof ReconciliationReviewRequiredError, true)
      assert.equal(error.reviewArtifact.document, 'translation-reconciliation-review')
      return true
    })
  })
}

function testApprovedJapaneseReconciliationUsesPlanTransport() {
  withTempDir(siteDir => {
    const policy = fs.readFileSync(path.join(__dirname, '../../config/translation/reconciliation-policy.json'), 'utf8')
    write(path.join(siteDir, 'config/translation/reconciliation-policy.json'), policy)
    const sourcePath = 'content/en/guides/tutorials/removed.md'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/removed.md'
    const discovery = {
      sourceBaselineSha: '2'.repeat(40),
      sourceCheckpointSha: '3'.repeat(40),
      targetBaselineSha: '4'.repeat(40),
      sourceCheckpointInventory: Array.from({length: 20}, (_, index) => `content/en/guides/tutorials/current-${index}.md`),
      candidates: [{
        kind: 'delete_target', sourcePath, targetPath, replacementSourcePath: null, replacementTargetPath: null, reason: 'source_deleted',
        evidence: {sourceExistedAtBaseline: true, sourceMissingAtCheckpoint: true, targetExistsAtBaseline: true, mappingIsCanonical: true, ownedByGroup: true, preserved: false, generatorCompletenessReceipt: null},
      }],
    }
    const manifest = buildManifest({
      siteDir,
      target: 'ja-JP',
      group: 'guides',
      sourceCheckpointSha: discovery.sourceCheckpointSha,
      reconciliation: {
        toolingSha: '1'.repeat(40),
        discovery,
        planArtifact: 'translation-reconciliation-plan-ja-JP-guides-123',
      },
    })
    assert.equal(manifest.source_delta, undefined)
    assert.deepEqual(manifest.reconciliation, {
      planArtifact: 'translation-reconciliation-plan-ja-JP-guides-123',
      planSha256: manifest.reconciliation.planSha256,
      operationCount: 1,
    })
    assert.match(manifest.reconciliation.planSha256, /^sha256:[0-9a-f]{64}$/)
  })
}

function testActiveReferenceSourceIsNotHiddenByStaleRetirement() {
  withTempDir(siteDir => {
    const sourcePath = 'content/en/reference/api/python/python/DataImport/DataImport-VolumeBulkWriter/DataImport-VolumeBulkWriter.md'
    const targetPath = 'content/zh-CN/reference/api/python/python/DataImport/DataImport-VolumeBulkWriter/DataImport-VolumeBulkWriter.md'
    write(path.join(siteDir, sourcePath), '# VolumeBulkWriter\n')
    write(path.join(siteDir, 'config/reference-retirements.json'), JSON.stringify({schemaVersion: 2, retirements: [{
      manual: 'python',
      sourcePath,
      targetPath,
      changeKind: 'source_deleted',
      rationale: 'Imported baseline retirement from the clean-room Reference migration',
    }]}))

    const manifest = buildManifest({
      siteDir,
      target: 'zh-CN-reference',
      group: 'python',
      sourceCheckpointSha: 'e'.repeat(40),
    })

    assert.deepEqual(manifest.items.map(item => item.sourcePath), [sourcePath])
  })
}

function testAuthorizedHistoricalReferenceOrphanIsSerializedUnchanged() {
  withTempDir(siteDir => {
    const sourcePath = 'content/en/reference/api/python/python/removed.md'
    const targetPath = 'content/zh-CN/reference/api/python/python/removed.md'
    const retirement = {manual: 'python', sourcePath, targetPath, changeKind: 'source_deleted'}
    write(path.join(siteDir, targetPath), '# 已翻译\n')
    write(path.join(siteDir, 'generated/zh-CN/manifests/reference-translations.json'), JSON.stringify({
      schemaVersion: 1,
      records: [referenceRecord({manual: 'python', sourcePath, targetPath, sourceHash: 'a'.repeat(64)})],
    }))
    write(path.join(siteDir, 'config/reference-retirements.json'), JSON.stringify({
      schemaVersion: 2,
      retirements: [{manual: 'python', sourcePath, targetPath, changeKind: 'source_deleted', rationale: 'Reviewed source deletion'}],
    }))

    const manifest = buildManifest({
      siteDir,
      target: 'zh-CN-reference',
      group: 'python',
      sourceCheckpointSha: 'e'.repeat(40),
    })

    assert.deepEqual(manifest.items, [])
    assert.deepEqual(manifest.source_delta, {
      deleted_i18n: [],
      renamed: [],
      retirement_candidates: [retirement],
    })
  })
}

function testRetirementReviewSeparatesPolicyRetirementReplacementAndTargetExclusion() {
  withTempDir(siteDir => {
    git(siteDir, ['init', '-b', 'main'])
    git(siteDir, ['config', 'user.email', 'retirement-review@example.com'])
    git(siteDir, ['config', 'user.name', 'Retirement Review Test'])

    const declaredSource = 'content/en/reference/api/java/java/v1/v1-About.md'
    const renamedSource = 'content/en/reference/api/java/java/v2/v2-Volume/v2-VolumeFileManager-shutdownGracefully.md'
    const renamedCurrent = 'content/en/reference/api/java/java/v2/v2-Volume/v2-Volume-VolumeFileManager/v2-VolumeFileManager-shutdownGracefully.md'
    const missingOutputSource = 'content/en/reference/api/java/java/v2/v2-Partitions/v2-Partitions-getPartitionStats.md'
    const snapshotPath = 'packages/docs-tooling/src/lark/meta/snapshots/javaV230-uat-last-success.json'
    const targetFor = sourcePath => sourcePath.replace('content/en/', 'content/zh-CN/')

    write(path.join(siteDir, declaredSource), '# Java v1\n')
    write(path.join(siteDir, renamedSource), '# shutdownGracefully\n\nSame API content.\n')
    write(path.join(siteDir, missingOutputSource), '# getPartitionStats\n')
    write(path.join(siteDir, 'generated/en/manifests/lark-revisions/java.json'), JSON.stringify({
      schemaVersion: 1,
      group: 'java',
      generatedAt: '2026-08-01T00:00:00.000Z',
      sourceRunId: '1',
      records: [
        {canonicalToken: 'declared-old', title: 'About', contentPath: declaredSource, objectToken: null, parentToken: null, revisionId: null, objectEditTime: null},
        {canonicalToken: 'partition-old', title: 'getPartitionStats()', contentPath: missingOutputSource, objectToken: null, parentToken: null, revisionId: null, objectEditTime: null},
        {canonicalToken: 'shutdown-old', title: 'shutdownGracefully()', contentPath: renamedSource, objectToken: null, parentToken: null, revisionId: null, objectEditTime: null},
      ],
    }))
    write(path.join(siteDir, snapshotPath), JSON.stringify({
      schema_version: 2,
      manual: 'javaV230',
      targets_built: ['zilliz'],
      records: [
        {record_id: 'rec-declared', title: 'About', doc_token: 'declared-old', output_paths: [declaredSource], publish_targets: ['zilliz'], publish_status: 'Draft'},
        {record_id: 'rec-partition', title: 'getPartitionStats()', doc_token: 'partition-old', output_paths: [missingOutputSource], publish_targets: ['zilliz'], publish_status: 'Draft'},
        {record_id: 'rec-shutdown', title: 'shutdownGracefully()', doc_token: 'shutdown-old', output_paths: [renamedSource], publish_targets: ['zilliz'], publish_status: 'Draft'},
      ],
    }))
    git(siteDir, ['add', '.'])
    git(siteDir, ['commit', '-m', 'historical source state'])
    const sourceCommit = git(siteDir, ['rev-parse', 'HEAD'])

    fs.rmSync(path.join(siteDir, declaredSource))
    fs.rmSync(path.join(siteDir, missingOutputSource))
    fs.mkdirSync(path.dirname(path.join(siteDir, renamedCurrent)), {recursive: true})
    fs.renameSync(path.join(siteDir, renamedSource), path.join(siteDir, renamedCurrent))
    const candidates = [declaredSource, renamedSource, missingOutputSource].map(sourcePath => ({
      manual: 'java',
      sourcePath,
      targetPath: targetFor(sourcePath),
      changeKind: 'source_deleted',
    }))
    for (const candidate of candidates) write(path.join(siteDir, candidate.targetPath), '# translated\n')
    write(path.join(siteDir, 'generated/zh-CN/manifests/reference-translations.json'), JSON.stringify({
      schemaVersion: 1,
      records: candidates.map(candidate => referenceRecord({
        manual: candidate.manual,
        sourcePath: candidate.sourcePath,
        targetPath: candidate.targetPath,
        sourceCommit,
        sourceHash: 'a'.repeat(64),
      })).sort((left, right) => left.sourcePath.localeCompare(right.sourcePath)),
    }))
    write(path.join(siteDir, 'generated/en/manifests/lark-revisions/java.json'), JSON.stringify({
      schemaVersion: 1,
      group: 'java',
      generatedAt: '2026-08-02T00:00:00.000Z',
      sourceRunId: '2',
      records: [
        {canonicalToken: 'partition-new', title: 'getPartitionStats()', contentPath: null, objectToken: null, parentToken: null, revisionId: null, objectEditTime: null},
        {canonicalToken: 'shutdown-new', title: 'shutdownGracefully()', contentPath: renamedCurrent, objectToken: null, parentToken: null, revisionId: null, objectEditTime: null},
      ],
    }))
    write(path.join(siteDir, snapshotPath), JSON.stringify({
      schema_version: 2,
      manual: 'javaV230',
      targets_built: ['zilliz'],
      records: [
        {record_id: 'rec-partition', title: 'getPartitionStats()', doc_token: 'partition-new', output_paths: [], publish_targets: [], publish_status: 'Draft'},
        {record_id: 'rec-shutdown', title: 'shutdownGracefully()', doc_token: 'shutdown-new', output_paths: [renamedCurrent], publish_targets: ['zilliz'], publish_status: 'Draft'},
      ],
    }))
    write(path.join(siteDir, 'config/reference-retirements.json'), JSON.stringify({schemaVersion: 2, retirements: []}))
    git(siteDir, ['add', '-A'])
    git(siteDir, ['commit', '-m', 'current source checkpoint'])
    const sourceCheckpointSha = git(siteDir, ['rev-parse', 'HEAD'])

    const review = buildRetirementReview({
      siteDir,
      target: 'zh-CN-reference',
      locale: 'zh-CN',
      group: 'java',
      sourceCheckpointSha,
      sourceDelta: {group: 'java', changedEnglish: [], deletedI18n: [], renamed: [], retirementCandidates: []},
      candidates,
    })

    assert.equal(review.schemaVersion, 1)
    assert.equal(review.status, 'retirement_review_required')
    assert.deepEqual(review.summary, {
      total: 3,
      currentRunRetirements: 0,
      historicalReconciliations: 3,
      classifications: {
        declared_retired_path: 1,
        source_replacement_with_path_move: 1,
        source_target_excluded: 1,
      },
    })
    assert.deepEqual(review.candidates.map(candidate => ({
      sourcePath: candidate.sourcePath,
      classification: candidate.classification,
      recommendedDisposition: candidate.recommendedDisposition,
      currentRun: candidate.evidence.currentRun,
      declaredRetiredRoot: candidate.evidence.declaredRetiredRoot,
      probableReplacementPath: candidate.evidence.probableReplacementPath,
      baseRecordId: candidate.evidence.baseRecordId,
      previousCanonicalToken: candidate.evidence.previousCanonicalToken,
      replacementCanonicalToken: candidate.evidence.replacementCanonicalToken,
      publishTargets: candidate.evidence.publishTargets,
      targetsBuilt: candidate.evidence.targetsBuilt,
    })), [
      {
        sourcePath: declaredSource,
        classification: 'declared_retired_path',
        recommendedDisposition: 'approve_declared_retirement',
        currentRun: false,
        declaredRetiredRoot: 'content/en/reference/api/java/java/v1',
        probableReplacementPath: null,
        baseRecordId: 'rec-declared',
        previousCanonicalToken: 'declared-old',
        replacementCanonicalToken: null,
        publishTargets: null,
        targetsBuilt: ['zilliz'],
      },
      {
        sourcePath: missingOutputSource,
        classification: 'source_target_excluded',
        recommendedDisposition: 'review_source_target_configuration',
        currentRun: false,
        declaredRetiredRoot: null,
        probableReplacementPath: null,
        baseRecordId: 'rec-partition',
        previousCanonicalToken: 'partition-old',
        replacementCanonicalToken: 'partition-new',
        publishTargets: [],
        targetsBuilt: ['zilliz'],
      },
      {
        sourcePath: renamedSource,
        classification: 'source_replacement_with_path_move',
        recommendedDisposition: 'retranslate_and_move',
        currentRun: false,
        declaredRetiredRoot: null,
        probableReplacementPath: renamedCurrent,
        baseRecordId: 'rec-shutdown',
        previousCanonicalToken: 'shutdown-old',
        replacementCanonicalToken: 'shutdown-new',
        publishTargets: ['zilliz'],
        targetsBuilt: ['zilliz'],
      },
    ])
  })
}

function testCliWritesRetirementReviewBeforeFailingWithoutMutatingRegistry() {
  withTempDir(siteDir => {
    git(siteDir, ['init', '-b', 'main'])
    git(siteDir, ['config', 'user.email', 'retirement-cli@example.com'])
    git(siteDir, ['config', 'user.name', 'Retirement CLI Test'])

    const sourcePath = 'content/en/reference/api/java/java/v2/removed.md'
    const targetPath = 'content/zh-CN/reference/api/java/java/v2/removed.md'
    write(path.join(siteDir, sourcePath), '# Removed source\n')
    write(path.join(siteDir, 'generated/en/manifests/lark-revisions/java.json'), JSON.stringify({
      schemaVersion: 1,
      group: 'java',
      complete: true,
      generatedAt: '2026-08-01T00:00:00.000Z',
      sourceRunId: '1',
      records: [{canonicalToken: 'removed-token', title: 'Removed', contentPath: sourcePath, objectToken: null, parentToken: null, revisionId: null, objectEditTime: null}],
    }))
    git(siteDir, ['add', '.'])
    git(siteDir, ['commit', '-m', 'historical source'])
    const sourceCommit = git(siteDir, ['rev-parse', 'HEAD'])

    fs.rmSync(path.join(siteDir, sourcePath))
    write(path.join(siteDir, targetPath), '# 已翻译\n')
    write(path.join(siteDir, 'generated/zh-CN/manifests/reference-translations.json'), JSON.stringify({
      schemaVersion: 1,
      records: [referenceRecord({manual: 'java', sourcePath, targetPath, sourceCommit, sourceHash: 'a'.repeat(64)})],
    }))
    const registryPath = path.join(siteDir, 'config/reference-retirements.json')
    write(registryPath, JSON.stringify({schemaVersion: 2, retirements: []}, null, 2) + '\n')
    git(siteDir, ['add', '-A'])
    git(siteDir, ['commit', '-m', 'current source'])
    const sourceCheckpointSha = git(siteDir, ['rev-parse', 'HEAD'])
    const registryBefore = fs.readFileSync(registryPath, 'utf8')

    const result = spawnSync(process.execPath, [
      path.join(__dirname, 'manifest.js'),
      '--target', 'zh-CN-reference',
      '--output', 'tmp/translation-manifest.json',
      '--retirement-report', 'tmp/translation-retirement-review.json',
      '--group', 'java',
      '--source-checkpoint-sha', sourceCheckpointSha,
    ], {cwd: siteDir, encoding: 'utf8'})

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /retirement review written/i)
    assert.equal(fs.existsSync(path.join(siteDir, 'tmp/translation-manifest.json')), false)
    assert.equal(fs.readFileSync(registryPath, 'utf8'), registryBefore)
    const review = JSON.parse(fs.readFileSync(path.join(siteDir, 'tmp/translation-retirement-review.json'), 'utf8'))
    assert.equal(review.status, 'retirement_review_required')
    assert.equal(review.candidates.length, 1)
    assert.equal(review.candidates[0].sourcePath, sourcePath)
  })
}

function testFullChineseBootstrapIncludesEveryActiveSource() {
  withTempDir(siteDir => {
    const sources = [
      'content/en/reference/api/python/python/a.md',
      'content/en/reference/api/python/python/b.md',
    ]
    const records = []
    for (const sourcePath of sources) {
      const source = `# ${sourcePath}\n`
      const targetPath = sourcePath.replace('content/en/', 'content/zh-CN/')
      write(path.join(siteDir, sourcePath), source)
      write(path.join(siteDir, targetPath), '# English placeholder\n')
      records.push(referenceRecord({manual: 'python', sourcePath, targetPath, sourceHash: hashContent(source)}))
    }
    write(path.join(siteDir, 'generated/zh-CN/manifests/reference-translations.json'), JSON.stringify({
      schemaVersion: 1,
      bootstrapCompletedGroups: [],
      records,
    }))

    const manifest = buildManifest({
      siteDir,
      target: 'zh-CN-reference',
      group: 'python',
      mode: 'full',
      sourceCheckpointSha: 'e'.repeat(40),
    })

    assert.deepEqual(manifest.items.map(item => item.sourcePath), sources)
  })
}

function testReferenceLandingGroupForcesExactlyFiveCurrentTargets() {
  withTempDir(siteDir => {
    const landings = [
      'content/en/reference/api/python/python/python.md',
      'content/en/reference/api/java/java/java.md',
      'content/en/reference/api/nodejs/nodejs/nodejs.md',
      'content/en/reference/api/go/go/go.md',
      'content/en/reference/cli/cli/Overview.md',
    ]
    const records = []
    for (const sourcePath of landings) {
      const targetPath = sourcePath.replace('content/en/', 'content/zh-CN/')
      const source = `# ${sourcePath}\n`
      write(path.join(siteDir, sourcePath), source)
      write(path.join(siteDir, targetPath), `# translated ${sourcePath}\n`)
      const manual = sourcePath.includes('/api/python/') ? 'python'
        : sourcePath.includes('/api/java/') ? 'java'
          : sourcePath.includes('/api/nodejs/') ? 'node'
            : sourcePath.includes('/api/go/') ? 'go'
              : 'cli'
      records.push(referenceRecord({manual, sourcePath, targetPath, sourceHash: hashContent(source)}))
    }
    records.sort((left, right) => left.manual.localeCompare(right.manual) || left.sourcePath.localeCompare(right.sourcePath) || left.targetPath.localeCompare(right.targetPath))
    write(path.join(siteDir, 'generated/zh-CN/manifests/reference-translations.json'), JSON.stringify({schemaVersion: 1, records}))

    const manifest = buildManifest({
      siteDir,
      target: 'zh-CN-reference',
      group: 'reference-landings',
      sourceCheckpointSha: 'f'.repeat(40),
    })

    assert.deepEqual(manifest.items.map(item => item.sourcePath), [...landings].sort())
    assert.ok(manifest.items.every(item => item.reason === 'stale_source'))
    assert.throws(() => buildManifest({
      siteDir,
      target: 'ja-JP',
      group: 'reference-landings',
      sourceCheckpointSha: 'f'.repeat(40),
    }), /requires target zh-CN-reference/i)
  })
}

function testMissingForcedReferenceLandingIsPreservedFromRetirement() {
  withTempDir(siteDir => {
    const activeSourcePath = 'content/en/reference/api/python/python/python.md'
    const activeTargetPath = activeSourcePath.replace('content/en/', 'content/zh-CN/')
    const missingSourcePath = 'content/en/reference/api/java/java/java.md'
    const missingTargetPath = missingSourcePath.replace('content/en/', 'content/zh-CN/')
    const activeSource = '# Python landing\n'
    write(path.join(siteDir, activeSourcePath), activeSource)
    write(path.join(siteDir, activeTargetPath), '# Python landing translated\n')
    write(path.join(siteDir, missingTargetPath), '# Java landing translated\n')
    write(path.join(siteDir, 'generated/zh-CN/manifests/reference-translations.json'), JSON.stringify({
      schemaVersion: 1,
      records: [
        {
          manual: 'java',
          sourcePath: missingSourcePath,
          targetPath: missingTargetPath,
          sourceCommit: 'a'.repeat(40),
          sourceHash: 'b'.repeat(64),
          targetHash: 'c'.repeat(64),
          status: 'translated',
        },
        {
          manual: 'python',
          sourcePath: activeSourcePath,
          targetPath: activeTargetPath,
          sourceCommit: 'a'.repeat(40),
          sourceHash: hashContent(activeSource),
          targetHash: 'd'.repeat(64),
          status: 'translated',
        },
      ],
    }))

    const manifest = buildManifest({
      siteDir,
      target: 'zh-CN-reference',
      group: 'reference-landings',
      sourceCheckpointSha: 'f'.repeat(40),
    })

    assert.deepEqual(manifest.items.map(item => item.sourcePath), [activeSourcePath])
    assert.equal(manifest.items[0].reason, 'stale_source')
    assert.equal(manifest.source_delta, undefined)
  })
}

function testLegacyJapaneseCacheKeysMapToCanonicalSources() {
  withTempDir(siteDir => {
    const source = '# Stable\n'
    const sourcePath = 'content/en/guides/tutorials/stable.md'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/stable.md'
    write(path.join(siteDir, sourcePath), source)
    write(path.join(siteDir, targetPath), '# 安定\n')
    write(path.join(siteDir, '.translation-cache/ja-JP.json'), JSON.stringify({files: {
      'docs/tutorials/stable.md': {sourceHash: hashContent(source), targetPath},
    }}))

    assert.deepEqual(buildManifest({
      siteDir,
      target: 'ja-JP',
      group: 'guides',
      sourceCheckpointSha: 'a'.repeat(40),
    }).items, [])
  })
}

function testCheckpointedCacheRemovesCompletedFilesFromNextManifest() {
  withTempDir(siteDir => {
    const completed = '# Complete\n'
    const pending = '# Pending\n'
    write(path.join(siteDir, 'content/en/guides/tutorials/complete.md'), completed)
    write(path.join(siteDir, 'content/en/guides/tutorials/pending.md'), pending)
    write(path.join(siteDir, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/complete.md'), '# 完了\n')
    writeCache(siteDir, 'ja-JP', {
      files: {
        'content/en/guides/tutorials/complete.md': {
          sourceHash: hashContent(completed),
          targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/complete.md',
        },
      },
    })

    const manifest = buildManifest({
      siteDir,
      locale: 'ja-JP',
      group: 'guides',
      sourceCheckpointSha: 'a'.repeat(40),
    })
    assert.deepEqual(manifest.items.map(item => item.sourcePath), ['content/en/guides/tutorials/pending.md'])
  })
}

function testContentGroupsFilterBeforeMaxFilesAndRecordCheckpoint() {
  withTempDir(siteDir => {
    const files = [
      'content/en/guides/tutorials/guide.md',
      'content/en/byoc/tutorials/byoc.md',
      'content/en/reference/api/python/python/v2/a.md',
      'content/en/reference/api/python/python/v2/b.md',
      'content/en/reference/api/java/java/v2/a.md',
      'content/en/reference/api/nodejs/nodejs/v2/a.md',
      'content/en/reference/api/go/go/v2/a.md',
      'content/en/reference/cli/cli/v14/a.md',
      'content/en/reference/api/restful/restful/v2/a.md',
    ]
    files.forEach(file => write(path.join(siteDir, file), `# ${file}\n`))
    const sha = 'a'.repeat(40)

    const expected = {
      guides: ['content/en/byoc/tutorials/byoc.md', 'content/en/guides/tutorials/guide.md'],
      python: ['content/en/reference/api/python/python/v2/a.md', 'content/en/reference/api/python/python/v2/b.md'],
      java: ['content/en/reference/api/java/java/v2/a.md'],
      node: ['content/en/reference/api/nodejs/nodejs/v2/a.md'],
      go: ['content/en/reference/api/go/go/v2/a.md'],
      cli: ['content/en/reference/cli/cli/v14/a.md'],
      rest: ['content/en/reference/api/restful/restful/v2/a.md'],
    }
    for (const [group, sources] of Object.entries(expected)) {
      const manifest = buildManifest({ siteDir, group, sourceCheckpointSha: sha })
      assert.deepEqual(manifest.items.map(item => item.sourcePath).sort(), sources)
      assert.equal(manifest.group, group)
      assert.equal(manifest.sourceCheckpointSha, sha)
    }
    const limited = buildManifest({ siteDir, group: 'python', sourceCheckpointSha: sha, maxFiles: 1 })
    assert.deepEqual(limited.items.map(item => item.sourcePath), ['content/en/reference/api/python/python/v2/a.md'])
  })
}

function testGroupAndCheckpointAreRequired() {
  withTempDir(siteDir => {
    write(path.join(siteDir, 'content/en/guides/tutorials/guide.md'), '# guide\n')
    assert.throws(() => buildManifest({ siteDir, sourceCheckpointSha: 'a'.repeat(40) }), /group/i)
    assert.throws(() => buildManifest({ siteDir, group: 'wat', sourceCheckpointSha: 'a'.repeat(40) }), /Unknown .*group/)
    assert.throws(() => buildManifest({ siteDir, group: 'python' }), /source checkpoint SHA/i)
    assert.throws(() => buildManifest({ siteDir, group: 'python', sourceCheckpointSha: 'abc' }), /source checkpoint SHA/i)
  })
}

function testSourceDeltaPrioritizesCurrentChangesAndPreservesPendingBacklog() {
  withTempDir(siteDir => {
    const sha = 'b'.repeat(40)
    const changed = 'content/en/reference/api/restful/restful/new.mdx'
    const deletedI18n = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/old.mdx'
    write(path.join(siteDir, changed), '# new\n')
    const backlog = 'content/en/reference/api/restful/restful/a-backlog.mdx'
    write(path.join(siteDir, backlog), '# backlog\n')

    const manifest = buildManifest({
      siteDir,
      group: 'rest',
      sourceCheckpointSha: sha,
      sourceDelta: {
        changedEnglish: [changed, 'content/en/reference/api/restful/restful/missing.mdx'],
        deletedI18n: [deletedI18n],
        renamed: [],
      },
    })

    assert.deepEqual(manifest.items.map(item => item.sourcePath), [changed, backlog])
    assert.deepEqual(manifest.source_delta, {
      deleted_i18n: [deletedI18n],
      renamed: [],
      retirement_candidates: [],
    })

    const limited = buildManifest({
      siteDir,
      group: 'rest',
      sourceCheckpointSha: sha,
      sourceDelta: {
        changedEnglish: [changed],
        deletedI18n: [],
        renamed: [],
      },
      maxFiles: 1,
    })
    assert.deepEqual(limited.items.map(item => item.sourcePath), [changed])
  })
}

function testManifestClassifiesAndOrdersTranslationCandidates() {
  withTempDir(siteDir => {
    const sha = 'c'.repeat(40)
    const sources = {
      current: 'content/en/guides/tutorials/z-current.md',
      missing: 'content/en/guides/tutorials/a-missing.md',
      stale: 'content/en/guides/tutorials/b-stale.md',
      complete: 'content/en/guides/tutorials/complete.md',
    }
    const contents = {
      current: '# Current\n',
      missing: '# Missing\n',
      stale: '# Stale\n',
      complete: '# Complete\n',
    }

    for (const [name, sourcePath] of Object.entries(sources)) {
      write(path.join(siteDir, sourcePath), contents[name])
    }
    for (const name of ['current', 'stale', 'complete']) {
      write(
        path.join(siteDir, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials', path.basename(sources[name])),
        `# ${name} in Japanese\n`,
      )
    }
    writeCache(siteDir, 'ja-JP', {
      files: {
        [sources.current]: { sourceHash: 'old-current-hash' },
        [sources.stale]: { sourceHash: 'old-stale-hash' },
        [sources.complete]: { sourceHash: hashContent(contents.complete) },
      },
    })

    const manifest = buildManifest({
      siteDir,
      group: 'guides',
      sourceCheckpointSha: sha,
      sourceDelta: {
        changedEnglish: [sources.current],
        deletedI18n: [],
        renamed: [],
      },
    })

    assert.deepEqual(
      manifest.items.map(item => [item.sourcePath, item.reason]),
      [
        [sources.current, 'current_delta'],
        [sources.missing, 'missing_target'],
        [sources.stale, 'stale_source'],
      ],
    )
  })
}

function testCurrentDeltaReasonTakesPrecedenceOverMissingTarget() {
  const sourcePath = 'content/en/guides/tutorials/current.md'
  withTempDir(siteDir => {
    write(path.join(siteDir, sourcePath), '# Current without target\n')
    const manifest = buildManifest({
      siteDir,
      group: 'guides',
      sourceCheckpointSha: 'd'.repeat(40),
      sourceDelta: {
        changedEnglish: [sourcePath],
        deletedI18n: [],
        renamed: [],
      },
    })
    assert.equal(manifest.items[0].reason, 'current_delta')
  })
}

function run() {
  testMissingForcedReferenceLandingIsPreservedFromRetirement()
  testBuildManifestIncludesChangedAndMissingDocs()
  testPendingReferenceStateSelectsOnlyPendingAndChangedWork()
  testExplicitTargetLocales()
  testReconciliationReviewStopsManifestBeforeCandidateScanning()
  testApprovedJapaneseReconciliationUsesPlanTransport()
  testActiveReferenceSourceIsNotHiddenByStaleRetirement()
  testAuthorizedHistoricalReferenceOrphanIsSerializedUnchanged()
  testRetirementReviewSeparatesPolicyRetirementReplacementAndTargetExclusion()
  testCliWritesRetirementReviewBeforeFailingWithoutMutatingRegistry()
  testFullChineseBootstrapIncludesEveryActiveSource()
  testReferenceLandingGroupForcesExactlyFiveCurrentTargets()
  testLegacyJapaneseCacheKeysMapToCanonicalSources()
  testCheckpointedCacheRemovesCompletedFilesFromNextManifest()
  testContentGroupsFilterBeforeMaxFilesAndRecordCheckpoint()
  testGroupAndCheckpointAreRequired()
  testSourceDeltaPrioritizesCurrentChangesAndPreservesPendingBacklog()
  testManifestClassifiesAndOrdersTranslationCandidates()
  testCurrentDeltaReasonTakesPrecedenceOverMissingTarget()
  console.log('translation manifest tests passed')
}

run()
