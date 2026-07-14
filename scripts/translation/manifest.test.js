const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const {
  buildManifest,
  cachePathForLocale,
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

function run() {
  testBuildManifestIncludesChangedAndMissingDocs()
  testSourceMappingsCanIncludeReference()
  testCheckpointedCacheRemovesCompletedFilesFromNextManifest()
  testContentGroupsFilterBeforeMaxFilesAndRecordCheckpoint()
  testGroupValidationAndLegacyCompatibility()
  console.log('translation manifest tests passed')
}

run()
