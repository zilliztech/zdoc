const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const {
  CANDIDATE_REASON_ORDER,
  buildManifest,
  cachePathForLocale,
  candidateReason,
  hashContent,
  localeForTarget,
  sourceMappingsForLocale,
  sourceMappingsForTarget,
  writeCache,
} = require('./manifest')

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

    const manifest = buildManifest({ siteDir, locale: 'ja-JP', includeReference: false })

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

function testSourceMappingsCanIncludeReference() {
  const mappings = sourceMappingsForLocale('ja-JP', { includeReference: true })
  assert.ok(mappings.some(mapping => mapping.sourceRoot === 'content/en/reference'))
  assert.ok(mappings.some(mapping => mapping.targetRoot === 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current'))
}

function testExplicitTargetsUseUnifiedContentRoots() {
  assert.equal(localeForTarget('ja-JP'), 'ja-JP')
  assert.equal(localeForTarget('zh-CN-reference'), 'zh-CN')
  assert.equal(localeForTarget('zh-CN-tools'), 'zh-CN')
  assert.deepEqual(sourceMappingsForTarget('ja-JP'), [
    {
      type: 'guides',
      sourceRoot: 'content/en/guides/tutorials',
      targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
    },
    {
      type: 'byoc',
      sourceRoot: 'content/en/byoc/tutorials',
      targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials',
    },
    {
      type: 'reference',
      sourceRoot: 'content/en/reference',
      targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current',
    },
  ])
  assert.deepEqual(sourceMappingsForTarget('zh-CN-reference'), [{
    type: 'reference',
    sourceRoot: 'content/en/reference',
    targetRoot: 'content/zh-CN/reference',
  }])
  assert.deepEqual(sourceMappingsForTarget('zh-CN-tools'), [{
    type: 'tools',
    sourceRoot: 'content/en/guides/tutorials/tools',
    targetRoot: 'content/zh-CN/guides/tutorials/tools',
  }])
}

function testChineseTargetsUseCommittedManifestStateInsteadOfLocaleCache() {
  withTempDir(siteDir => {
    const sourcePath = 'content/en/guides/tutorials/tools/tool.md'
    const targetPath = 'content/zh-CN/guides/tutorials/tools/tool.md'
    write(path.join(siteDir, sourcePath), '# changed\n')
    write(path.join(siteDir, targetPath), '# 已翻译\n')
    write(path.join(siteDir, '.translation-cache/zh-CN.json'), JSON.stringify({files: {
      [sourcePath]: {sourceHash: hashContent('# changed\n')},
    }}))
    write(path.join(siteDir, 'generated/zh-CN/manifests/tools-translations.json'), JSON.stringify({
      schemaVersion: 1,
      records: [{sourcePath, targetPath, sourceHash: 'old'}],
    }))

    const manifest = buildManifest({siteDir, target: 'zh-CN-tools'})
    assert.deepEqual(manifest.items.map(item => [item.sourcePath, item.reason]), [[sourcePath, 'stale_source']])
  })
}

function testToolsSidebarLabelChangeBecomesCandidate() {
  withTempDir(siteDir => {
    const sourcePath = 'generated/en/sidebars/guides.sidebar.js#category:tutorials/tools'
    const targetPath = 'generated/zh-CN/sidebars/tools.sidebar.js'
    const previous = {type: 'category', label: 'Old Tools', key: 'category:tutorials/tools', items: []}
    write(path.join(siteDir, 'generated/en/sidebars/guides.sidebar.js'), `module.exports = ${JSON.stringify([
      {...previous, label: 'Tools'},
    ])}\n`)
    write(path.join(siteDir, targetPath), 'module.exports = []\n')
    write(path.join(siteDir, 'generated/zh-CN/manifests/tools-translations.json'), JSON.stringify({
      schemaVersion: 1,
      records: [{sourcePath, targetPath, sourceHash: hashContent(JSON.stringify(previous)), kind: 'sidebar'}],
    }))

    const manifest = buildManifest({siteDir, target: 'zh-CN-tools'})
    assert.deepEqual(manifest.items.map(item => [item.sourcePath, item.targetPath, item.reason, item.type]), [[
      sourcePath,
      targetPath,
      'stale_source',
      'sidebar',
    ]])
  })
}

function testToolsSidebarRemovalRequiresExactRetirementApproval() {
  withTempDir(siteDir => {
    const sourcePath = 'generated/en/sidebars/guides.sidebar.js#category:tutorials/tools'
    const targetPath = 'generated/zh-CN/sidebars/tools.sidebar.js'
    write(path.join(siteDir, 'generated/en/sidebars/guides.sidebar.js'), 'module.exports = []\n')
    write(path.join(siteDir, targetPath), 'module.exports = []\n')
    write(path.join(siteDir, 'generated/zh-CN/manifests/tools-translations.json'), JSON.stringify({
      schemaVersion: 1,
      records: [{sourcePath, targetPath, sourceHash: 'a'.repeat(64), kind: 'sidebar'}],
    }))

    assert.throws(() => buildManifest({siteDir, target: 'zh-CN-tools'}), /retirement.*approval|required/i)
    write(path.join(siteDir, 'config/tools-retirements.json'), JSON.stringify({schemaVersion: 1, retirements: [{
      sourcePath,
      targetPath,
      reason: 'sidebar_removed',
    }]}))
    const approved = buildManifest({siteDir, target: 'zh-CN-tools'})
    assert.deepEqual(approved.source_delta.retirement_candidates, [{sourcePath, targetPath, reason: 'sidebar_removed'}])
    assert.deepEqual(approved.source_delta.deleted_i18n, [])
  })
}

function testChineseDeletionAndRenameRequireTargetSpecificRetirementRegistries() {
  for (const fixture of [
    {
      target: 'zh-CN-tools',
      registry: 'config/tools-retirements.json',
      candidate: {
        sourcePath: 'content/en/guides/tutorials/tools/old.md',
        targetPath: 'content/zh-CN/guides/tutorials/tools/old.md',
        reason: 'source_deleted',
      },
    },
    {
      target: 'zh-CN-reference',
      registry: 'config/reference-retirements.json',
      candidate: {
        sourcePath: 'content/en/reference/old.md',
        targetPath: 'content/zh-CN/reference/old.md',
        reason: 'source_renamed',
      },
    },
  ]) withTempDir(siteDir => {
    const sourceDelta = {changedEnglish: [], deletedI18n: [], renamed: [], retirementCandidates: [fixture.candidate]}
    assert.throws(() => buildManifest({siteDir, target: fixture.target, sourceDelta}), /retirement.*approval|required/i)
    write(path.join(siteDir, fixture.registry), JSON.stringify({schemaVersion: 1, retirements: [{
      ...fixture.candidate,
      reason: 'wrong_reason',
    }]}))
    assert.throws(() => buildManifest({siteDir, target: fixture.target, sourceDelta}), /retirement.*approval|required/i)
    write(path.join(siteDir, fixture.registry), JSON.stringify({schemaVersion: 1, retirements: [fixture.candidate]}))
    const approved = buildManifest({siteDir, target: fixture.target, sourceDelta})
    assert.deepEqual(approved.source_delta.retirement_candidates, [fixture.candidate])
    assert.deepEqual(approved.source_delta.deleted_i18n, [])
  })
}

function testExplicitlyRetiredReferenceTargetsAreExcludedFromWorkflowManifest() {
  withTempDir(siteDir => {
    const sourcePath = 'content/en/reference/api/python/python/DataImport/DataImport-VolumeBulkWriter/DataImport-VolumeBulkWriter.md'
    const targetPath = 'content/zh-CN/reference/api/python/python/DataImport/DataImport-VolumeBulkWriter/DataImport-VolumeBulkWriter.md'
    write(path.join(siteDir, sourcePath), '# VolumeBulkWriter\n')
    write(path.join(siteDir, 'config/reference-retirements.json'), JSON.stringify({schemaVersion: 1, retirements: [{
      manual: 'python',
      sourcePath,
      targetPath,
      reason: 'Imported baseline retirement from the clean-room Reference migration',
    }]}))

    const manifest = buildManifest({
      siteDir,
      target: 'zh-CN-reference',
      group: 'python',
      sourceCheckpointSha: 'e'.repeat(40),
    })

    assert.deepEqual(manifest.items, [])
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
      records.push({sourcePath, targetPath, sourceHash: hashContent(source), status: 'translated'})
    }
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

    assert.deepEqual(buildManifest({siteDir, target: 'ja-JP'}).items, [])
  })
}

function testRepositoryLegacyJapaneseCacheDoesNotMassRetranslate() {
  const repositoryRoot = path.resolve(__dirname, '../..')
  const cache = JSON.parse(fs.readFileSync(path.join(repositoryRoot, '.translation-cache/ja-JP.json'), 'utf8'))
  const legacyCount = Object.keys(cache.files).filter(file => /^(docs|docs-byoc|reference)\//.test(file)).length
  const manifest = buildManifest({siteDir: repositoryRoot, target: 'ja-JP', includeReference: true})
  const staleCount = manifest.items.filter(item => item.reason === 'stale_source').length

  assert.ok(legacyCount > 1000, `expected the real cache fixture to exercise legacy keys, got ${legacyCount}`)
  assert.ok(staleCount < legacyCount / 3, `legacy cache migration still classified too many entries as stale: ${staleCount}/${legacyCount}`)
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

    const manifest = buildManifest({ siteDir, locale: 'ja-JP' })
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

function testGroupValidationAndLegacyCompatibility() {
  withTempDir(siteDir => {
    write(path.join(siteDir, 'content/en/guides/tutorials/guide.md'), '# guide\n')
    write(path.join(siteDir, 'content/en/reference/api/python/python/v2/a.md'), '# python\n')
    assert.throws(() => buildManifest({ siteDir, group: 'wat', sourceCheckpointSha: 'a'.repeat(40) }), /Unknown .*group/)
    assert.throws(() => buildManifest({ siteDir, group: 'python' }), /source checkpoint SHA/i)
    assert.throws(() => buildManifest({ siteDir, group: 'python', sourceCheckpointSha: 'abc' }), /source checkpoint SHA/i)
    const legacy = buildManifest({ siteDir, includeReference: false })
    assert.equal(legacy.group, null)
    assert.equal(legacy.sourceCheckpointSha, null)
    assert.deepEqual(legacy.items.map(item => item.sourcePath), ['content/en/guides/tutorials/guide.md'])
    assert.deepEqual(buildManifest({ siteDir, includeReference: true }).items.map(item => item.sourcePath).sort(), [
      'content/en/guides/tutorials/guide.md', 'content/en/reference/api/python/python/v2/a.md',
    ])
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
  assert.deepEqual(CANDIDATE_REASON_ORDER, {
    current_delta: 0,
    missing_target: 1,
    stale_source: 2,
  })
  const sourcePath = 'content/en/guides/tutorials/current.md'
  assert.equal(candidateReason({
    changedEnglish: new Set([sourcePath]),
    sourcePath,
    targetExists: false,
  }), 'current_delta')

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
  testBuildManifestIncludesChangedAndMissingDocs()
  testSourceMappingsCanIncludeReference()
  testExplicitTargetsUseUnifiedContentRoots()
  testChineseTargetsUseCommittedManifestStateInsteadOfLocaleCache()
  testToolsSidebarLabelChangeBecomesCandidate()
  testToolsSidebarRemovalRequiresExactRetirementApproval()
  testChineseDeletionAndRenameRequireTargetSpecificRetirementRegistries()
  testExplicitlyRetiredReferenceTargetsAreExcludedFromWorkflowManifest()
  testReferenceLandingGroupForcesExactlyFiveCurrentTargets()
  testLegacyJapaneseCacheKeysMapToCanonicalSources()
  testRepositoryLegacyJapaneseCacheDoesNotMassRetranslate()
  testCheckpointedCacheRemovesCompletedFilesFromNextManifest()
  testContentGroupsFilterBeforeMaxFilesAndRecordCheckpoint()
  testGroupValidationAndLegacyCompatibility()
  testSourceDeltaPrioritizesCurrentChangesAndPreservesPendingBacklog()
  testManifestClassifiesAndOrdersTranslationCandidates()
  testCurrentDeltaReasonTakesPrecedenceOverMissingTarget()
  console.log('translation manifest tests passed')
}

run()
