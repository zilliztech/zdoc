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
  sourceMappingsForLocale,
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
    write(path.join(siteDir, 'docs/tutorials/hello.md'), source)
    write(path.join(siteDir, 'docs/tutorials/stable.md'), unchanged)
    write(path.join(siteDir, 'docs-byoc/tutorials/byoc.md'), '# BYOC\n')
    write(
      path.join(siteDir, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/stable.md'),
      '# 安定\n\n変更なし。\n',
    )

    const cachePath = cachePathForLocale(siteDir, 'ja-JP')
    write(cachePath, JSON.stringify({
      files: {
        'docs/tutorials/hello.md': { sourceHash: 'old-hash' },
        'docs/tutorials/stable.md': { sourceHash: hashContent(unchanged) },
      },
    }, null, 2))

    const manifest = buildManifest({ siteDir, locale: 'ja-JP', includeReference: false })

    assert.deepEqual(
      manifest.items.map(item => item.sourcePath).sort(),
      ['docs-byoc/tutorials/byoc.md', 'docs/tutorials/hello.md'],
    )
    assert.equal(
      manifest.items.find(item => item.sourcePath === 'docs/tutorials/hello.md').targetPath,
      'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/hello.md',
    )
    assert.equal(
      manifest.items.find(item => item.sourcePath === 'docs-byoc/tutorials/byoc.md').targetPath,
      'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/byoc.md',
    )
  })
}

function testSourceMappingsCanIncludeReference() {
  const mappings = sourceMappingsForLocale('ja-JP', { includeReference: true })
  assert.ok(mappings.some(mapping => mapping.sourceRoot === 'reference'))
  assert.ok(mappings.some(mapping => mapping.targetRoot === 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current'))
}

function testCheckpointedCacheRemovesCompletedFilesFromNextManifest() {
  withTempDir(siteDir => {
    const completed = '# Complete\n'
    const pending = '# Pending\n'
    write(path.join(siteDir, 'docs/tutorials/complete.md'), completed)
    write(path.join(siteDir, 'docs/tutorials/pending.md'), pending)
    write(path.join(siteDir, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/complete.md'), '# 完了\n')
    writeCache(siteDir, 'ja-JP', {
      files: {
        'docs/tutorials/complete.md': {
          sourceHash: hashContent(completed),
          targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/complete.md',
        },
      },
    })

    const manifest = buildManifest({ siteDir, locale: 'ja-JP' })
    assert.deepEqual(manifest.items.map(item => item.sourcePath), ['docs/tutorials/pending.md'])
  })
}

function testContentGroupsFilterBeforeMaxFilesAndRecordCheckpoint() {
  withTempDir(siteDir => {
    const files = [
      'docs/tutorials/guide.md',
      'docs-byoc/tutorials/byoc.md',
      'reference/api/python/python/v2/a.md',
      'reference/api/python/python/v2/b.md',
      'reference/api/java/java/v2/a.md',
      'reference/api/nodejs/nodejs/v2/a.md',
      'reference/api/go/go/v2/a.md',
      'reference/cli/cli/v14/a.md',
      'reference/api/restful/restful/v2/a.md',
    ]
    files.forEach(file => write(path.join(siteDir, file), `# ${file}\n`))
    const sha = 'a'.repeat(40)

    const expected = {
      guides: ['docs-byoc/tutorials/byoc.md', 'docs/tutorials/guide.md'],
      python: ['reference/api/python/python/v2/a.md', 'reference/api/python/python/v2/b.md'],
      java: ['reference/api/java/java/v2/a.md'],
      node: ['reference/api/nodejs/nodejs/v2/a.md'],
      go: ['reference/api/go/go/v2/a.md'],
      cli: ['reference/cli/cli/v14/a.md'],
      rest: ['reference/api/restful/restful/v2/a.md'],
    }
    for (const [group, sources] of Object.entries(expected)) {
      const manifest = buildManifest({ siteDir, group, sourceCheckpointSha: sha })
      assert.deepEqual(manifest.items.map(item => item.sourcePath).sort(), sources)
      assert.equal(manifest.group, group)
      assert.equal(manifest.sourceCheckpointSha, sha)
    }
    const limited = buildManifest({ siteDir, group: 'python', sourceCheckpointSha: sha, maxFiles: 1 })
    assert.deepEqual(limited.items.map(item => item.sourcePath), ['reference/api/python/python/v2/a.md'])
  })
}

function testGroupValidationAndLegacyCompatibility() {
  withTempDir(siteDir => {
    write(path.join(siteDir, 'docs/tutorials/guide.md'), '# guide\n')
    write(path.join(siteDir, 'reference/api/python/python/v2/a.md'), '# python\n')
    assert.throws(() => buildManifest({ siteDir, group: 'wat', sourceCheckpointSha: 'a'.repeat(40) }), /Unknown content group/)
    assert.throws(() => buildManifest({ siteDir, group: 'python' }), /source checkpoint SHA/i)
    assert.throws(() => buildManifest({ siteDir, group: 'python', sourceCheckpointSha: 'abc' }), /source checkpoint SHA/i)
    const legacy = buildManifest({ siteDir, includeReference: false })
    assert.equal(legacy.group, null)
    assert.equal(legacy.sourceCheckpointSha, null)
    assert.deepEqual(legacy.items.map(item => item.sourcePath), ['docs/tutorials/guide.md'])
    assert.deepEqual(buildManifest({ siteDir, includeReference: true }).items.map(item => item.sourcePath).sort(), [
      'docs/tutorials/guide.md', 'reference/api/python/python/v2/a.md',
    ])
  })
}

function testSourceDeltaPrioritizesCurrentChangesAndPreservesPendingBacklog() {
  withTempDir(siteDir => {
    const sha = 'b'.repeat(40)
    const changed = 'reference/api/restful/restful/new.mdx'
    const deletedI18n = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/old.mdx'
    write(path.join(siteDir, changed), '# new\n')
    const backlog = 'reference/api/restful/restful/a-backlog.mdx'
    write(path.join(siteDir, backlog), '# backlog\n')

    const manifest = buildManifest({
      siteDir,
      group: 'rest',
      sourceCheckpointSha: sha,
      sourceDelta: {
        changedEnglish: [changed, 'reference/api/restful/restful/missing.mdx'],
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
      current: 'docs/tutorials/z-current.md',
      missing: 'docs/tutorials/a-missing.md',
      stale: 'docs/tutorials/b-stale.md',
      complete: 'docs/tutorials/complete.md',
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
  const sourcePath = 'docs/tutorials/current.md'
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
  testCheckpointedCacheRemovesCompletedFilesFromNextManifest()
  testContentGroupsFilterBeforeMaxFilesAndRecordCheckpoint()
  testGroupValidationAndLegacyCompatibility()
  testSourceDeltaPrioritizesCurrentChangesAndPreservesPendingBacklog()
  testManifestClassifiesAndOrdersTranslationCandidates()
  testCurrentDeltaReasonTakesPrecedenceOverMissingTarget()
  console.log('translation manifest tests passed')
}

run()
