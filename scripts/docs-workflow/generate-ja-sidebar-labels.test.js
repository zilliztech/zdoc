'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {
  effectiveKey,
  collectCategoriesAndLinks,
  buildPluginTranslations,
  loadDictionary,
  sortEntries,
  generateJaSidebarLabels,
} = require('./generate-ja-sidebar-labels')

function makeFsImpl(files) {
  const written = {}
  return {
    written,
    readFileSync(filePath, encoding) {
      if (!(filePath in files)) {
        const error = new Error(`ENOENT: no such file, open '${filePath}'`)
        error.code = 'ENOENT'
        throw error
      }
      return encoding ? files[filePath] : Buffer.from(files[filePath])
    },
    mkdirSync() {},
    writeFileSync(filePath, content) {
      written[filePath] = content
    },
  }
}

test('effectiveKey prefers the natural key over the label', () => {
  assert.equal(effectiveKey({ key: 'category:tutorials/get-started', label: 'Get Started' }), 'category:tutorials/get-started')
  assert.equal(effectiveKey({ label: 'Release notes' }), 'Release notes')
})

test('collectCategoriesAndLinks recurses through nested categories at any depth, categories before children', () => {
  const items = [
    {
      type: 'category',
      key: 'category:a',
      label: 'A',
      items: [
        { type: 'doc', id: 'a/doc1' },
        {
          type: 'category',
          key: 'category:a/b',
          label: 'B',
          items: [{ type: 'link', key: 'link:a/b/c', label: 'C', href: '/c' }],
        },
      ],
    },
    { type: 'link', key: 'link:top', label: 'Top Link', href: '/top' },
  ]

  const { categories, links } = collectCategoriesAndLinks(items)
  assert.deepEqual(categories.map(c => c.key), ['category:a', 'category:a/b'])
  assert.deepEqual(links.map(l => l.key), ['link:a/b/c', 'link:top'])
})

test('collectCategoriesAndLinks ignores doc items and tolerates categories with no items', () => {
  const items = [
    { type: 'doc', id: 'solo-doc', label: 'Solo Doc' },
    { type: 'category', key: 'category:empty', label: 'Empty' },
  ]
  const { categories, links } = collectCategoriesAndLinks(items)
  assert.deepEqual(categories.map(c => c.key), ['category:empty'])
  assert.deepEqual(links, [])
})

test('buildPluginTranslations emits sidebar.<sidebarName>.<type>.<key> entries per sidebarName, duplicating shared content', () => {
  const sharedItems = [{ type: 'category', key: 'category:a', label: 'A', items: [] }]
  const sidebarsConfig = { default: sharedItems, tutorialSidebar: sharedItems }
  const labels = { 'category:a': 'あ' }

  const { entries, missing } = buildPluginTranslations(sidebarsConfig, labels, 'guides')

  assert.deepEqual(missing, [])
  assert.deepEqual(Object.keys(entries).sort(), [
    'sidebar.default.category.category:a',
    'sidebar.tutorialSidebar.category.category:a',
  ])
  assert.deepEqual(entries['sidebar.default.category.category:a'], {
    message: 'あ',
    description: "The label for category 'A' in sidebar 'default'",
  })
})

test('buildPluginTranslations handles a link that fell back to its literal label (the Release Notes edge case)', () => {
  const sidebarsConfig = { default: [{ type: 'link', label: 'Release notes', href: '/docs/changelogs' }] }
  const labels = { 'Release notes': 'リリースノート' }

  const { entries, missing } = buildPluginTranslations(sidebarsConfig, labels, 'guides')

  assert.deepEqual(missing, [])
  assert.deepEqual(entries['sidebar.default.link.Release notes'], {
    message: 'リリースノート',
    description: "The label for link 'Release notes' in sidebar 'default', linking to '/docs/changelogs'",
  })
})

test('buildPluginTranslations fails loud (reports, does not silently fall back) for a key missing from the dictionary', () => {
  const sidebarsConfig = { default: [{ type: 'category', key: 'category:missing', label: 'Missing', items: [] }] }
  const { entries, missing } = buildPluginTranslations(sidebarsConfig, {}, 'guides')

  assert.deepEqual(entries, {})
  assert.deepEqual(missing, [
    { pluginLabel: 'guides', sidebarName: 'default', type: 'category', key: 'category:missing', englishLabel: 'Missing' },
  ])
})

test('buildPluginTranslations is stable under reordering: same keys regardless of item order', () => {
  const labels = { 'category:a': 'あ', 'category:b': 'い' }
  const original = { default: [{ type: 'category', key: 'category:a', label: 'A', items: [] }, { type: 'category', key: 'category:b', label: 'B', items: [] }] }
  const reordered = { default: [{ type: 'category', key: 'category:b', label: 'B', items: [] }, { type: 'category', key: 'category:a', label: 'A', items: [] }] }

  const result1 = buildPluginTranslations(original, labels, 'guides')
  const result2 = buildPluginTranslations(reordered, labels, 'guides')

  assert.deepEqual(sortEntries(result1.entries), sortEntries(result2.entries))
})

test('loadDictionary requires a "labels" object', () => {
  const fsImpl = makeFsImpl({
    '/repo/config/translation/ja-JP-sidebar-labels.json': JSON.stringify({ locale: 'ja-JP' }),
  })
  assert.throws(() => loadDictionary('/repo', fsImpl), /must define a "labels" object/)
})

test('loadDictionary returns the labels map', () => {
  const fsImpl = makeFsImpl({
    '/repo/config/translation/ja-JP-sidebar-labels.json': JSON.stringify({ labels: { 'category:a': 'あ' } }),
  })
  assert.deepEqual(loadDictionary('/repo', fsImpl), { 'category:a': 'あ' })
})

test('generateJaSidebarLabels writes sorted current.json files for every configured target', () => {
  const dictionary = { labels: { 'category:a': 'あ', 'link:b': 'い' } }
  const fsImpl = makeFsImpl({
    '/repo/config/translation/ja-JP-sidebar-labels.json': JSON.stringify(dictionary),
  })
  const sidebarsBySource = {
    '/repo/guides.legacy.ts': {
      default: [
        { type: 'link', key: 'link:b', label: 'B', href: '/b' },
        { type: 'category', key: 'category:a', label: 'A', items: [] },
      ],
    },
  }

  const result = generateJaSidebarLabels({
    workspace: '/repo',
    fsImpl,
    loadSidebars: sourcePath => sidebarsBySource[sourcePath],
    targets: [{ pluginLabel: 'guides', legacySidebarPath: 'guides.legacy.ts', outputPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current.json' }],
  })

  assert.deepEqual(result.written, [
    { pluginLabel: 'guides', outputPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current.json', entryCount: 2 },
  ])
  const written = JSON.parse(fsImpl.written['/repo/i18n/ja-JP/docusaurus-plugin-content-docs/current.json'])
  assert.deepEqual(Object.keys(written), ['sidebar.default.category.category:a', 'sidebar.default.link.link:b'])
})

test('generateJaSidebarLabels throws with an actionable message and writes nothing when any target has a missing key', () => {
  const dictionary = { labels: { 'category:a': 'あ' } }
  const fsImpl = makeFsImpl({
    '/repo/config/translation/ja-JP-sidebar-labels.json': JSON.stringify(dictionary),
  })
  const sidebarsBySource = {
    '/repo/guides.legacy.ts': { default: [{ type: 'category', key: 'category:a', label: 'A', items: [] }] },
    '/repo/byoc.legacy.ts': { default: [{ type: 'category', key: 'category:missing', label: 'Missing', items: [] }] },
  }

  assert.throws(
    () =>
      generateJaSidebarLabels({
        workspace: '/repo',
        fsImpl,
        loadSidebars: sourcePath => sidebarsBySource[sourcePath],
        targets: [
          { pluginLabel: 'guides', legacySidebarPath: 'guides.legacy.ts', outputPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current.json' },
          { pluginLabel: 'guides-byoc', legacySidebarPath: 'byoc.legacy.ts', outputPath: 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current.json' },
        ],
      }),
    /category:missing/,
  )
  assert.deepEqual(fsImpl.written, {})
})

test('generateJaSidebarLabels requires a loadSidebars function', () => {
  assert.throws(() => generateJaSidebarLabels({ workspace: '/repo' }), /loadSidebars loader function is required/)
})
