const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const {
  buildManifest,
  cachePathForLocale,
  hashContent,
  sourceMappingsForLocale,
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

function run() {
  testBuildManifestIncludesChangedAndMissingDocs()
  testSourceMappingsCanIncludeReference()
  console.log('translation manifest tests passed')
}

run()
