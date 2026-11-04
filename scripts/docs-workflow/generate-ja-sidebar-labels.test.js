'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {
  effectiveKey,
  collectCategoriesAndLinks,
  buildPluginTranslations,
  loadDictionary,
  sortEntries,
  assertOutputsUntracked,
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

test('loadDictionary rejects a label that glues Latin text to Japanese text (style guide R7.7)', () => {
  const fsImpl = makeFsImpl({
    '/repo/config/translation/ja-JP-sidebar-labels.json': JSON.stringify({ labels: { 'category:deploy': 'AWSでデプロイ' } }),
  })
  assert.throws(() => loadDictionary('/repo', fsImpl), /violates style guide R7\.7/)
})

test('loadDictionary accepts R7.7-compliant labels, including unspaced digits per the corpus', () => {
  const labels = { 'category:a': 'AWS でデプロイ', 'category:b': 'これら3つのレベル', 'category:c': 'リリースノート' }
  const fsImpl = makeFsImpl({
    '/repo/config/translation/ja-JP-sidebar-labels.json': JSON.stringify({ labels }),
  })
  assert.deepEqual(loadDictionary('/repo', fsImpl), labels)
})

test('the committed dictionary satisfies style guide R7.7', () => {
  const nodePath = require('node:path')
  const workspace = nodePath.resolve(__dirname, '../..')
  // Uses the real repository file: if loadDictionary returns, every curated
  // label keeps R7.7 spacing between Latin words and Japanese text.
  loadDictionary(workspace)
})

test('the committed dictionary covers every link-shaped key the publication lane emits', () => {
  const nodePath = require('node:path')
  const workspace = nodePath.resolve(__dirname, '../..')
  const labels = loadDictionary(workspace)
  // The publication lane (generated/en/sidebars/guides[-byoc].sidebar.js on
  // dev) shapes cross-references as `type: 'link'` items keyed `ref:<path>`
  // pointing at their canonical docs. Master's own generated sidebar still
  // carries these as doc items, so the en build on master never walks them and
  // a missing dictionary key only surfaces as a console warning on dev builds.
  // This fixture pins the lane's link keys: when the lane adds one, extend it
  // here and add the dictionary entry in the same change. The guides-byoc tree
  // reuses a subset of these keys, so covering guides covers both plugins.
  const linkItems = [
    { type: 'link', key: 'link:tutorials/client-libraries/cpp', label: 'C++', href: '/reference/cpp' },
    { type: 'link', key: 'link:tutorials/client-libraries/go', label: 'Go', href: '/reference/go' },
    { type: 'link', key: 'link:tutorials/client-libraries/java', label: 'Java', href: '/reference/java' },
    { type: 'link', key: 'link:tutorials/client-libraries/nodejs', label: 'Node.js', href: '/reference/nodejs' },
    { type: 'link', key: 'link:tutorials/client-libraries/python', label: 'Python', href: '/reference/python' },
    { type: 'link', key: 'link:tutorials/client-libraries/restful-api', label: 'RESTful API', href: '/reference/restful' },
    { type: 'link', key: 'link:tutorials/tools/zilliz-cli', label: 'Zilliz CLI', href: '/reference/cli/cli/overview' },
    { type: 'link', key: 'ref:tutorials/ai-models/reranking-models/cohere-model-ranker', label: 'Cohere Ranker', href: '/docs/cohere-model-ranker' },
    { type: 'link', key: 'ref:tutorials/ai-models/reranking-models/hugging-face-ranker', label: 'Hugging Face Ranker', href: '/docs/hugging-face-ranker' },
    { type: 'link', key: 'ref:tutorials/ai-models/reranking-models/voyage-ai-model-ranker', label: 'Voyage AI Ranker', href: '/docs/voyage-ai-model-ranker' },
    { type: 'link', key: 'ref:tutorials/ai-models/text-embedding-models/cohere', label: 'Cohere', href: '/docs/cohere' },
    { type: 'link', key: 'ref:tutorials/ai-models/text-embedding-models/hugging-face', label: 'Hugging Face', href: '/docs/hugging-face' },
    { type: 'link', key: 'ref:tutorials/ai-models/text-embedding-models/openai', label: 'OpenAI', href: '/docs/openai' },
    { type: 'link', key: 'ref:tutorials/ai-models/text-embedding-models/voyage-ai', label: 'Voyage AI', href: '/docs/voyage-ai' },
    { type: 'link', key: 'ref:tutorials/management/clusters/dedicated-cluster/database', label: 'Database in Serving Clusters', href: '/docs/database' },
    { type: 'link', key: 'ref:tutorials/management/clusters/on-demand-compute/connect-for-on-demand-search', label: 'Connect for On-Demand Search', href: '/docs/connect-for-on-demand-search' },
    { type: 'link', key: 'ref:tutorials/management/clusters/on-demand-compute/on-demand-database', label: 'Database for On-Demand Search', href: '/docs/on-demand-database' },
    { type: 'link', key: 'ref:tutorials/management/volume/external-volume', label: 'External Volumes', href: '/docs/external-volume' },
    { type: 'link', key: 'ref:tutorials/management/volume/managed-volume', label: 'Managed Volumes', href: '/docs/managed-volume' },
    { type: 'link', key: 'ref:tutorials/management/volume/storage-integrations/integrate-with-aws-s3', label: 'Integrate with AWS S3', href: '/docs/integrate-with-aws-s3' },
    { type: 'link', key: 'ref:tutorials/management/volume/storage-integrations/integrate-with-azure-blob-storage', label: 'Integrate with Azure Blob Storage', href: '/docs/integrate-with-azure-blob-storage' },
    { type: 'link', key: 'ref:tutorials/management/volume/storage-integrations/integrate-with-gcp', label: 'Integrate with Google Cloud Storage', href: '/docs/integrate-with-gcp' },
  ]
  const sidebarsConfig = { default: linkItems, tutorialSidebar: linkItems }

  const { missing } = buildPluginTranslations(sidebarsConfig, labels, 'guides')

  assert.deepEqual(missing, [])
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

test('generateJaSidebarLabels allow policy writes found entries and reports missing keys without throwing', () => {
  const dictionary = { labels: { 'category:a': 'あ' } }
  const fsImpl = makeFsImpl({
    '/repo/config/translation/ja-JP-sidebar-labels.json': JSON.stringify(dictionary),
  })
  const sidebarsBySource = {
    '/repo/guides.legacy.ts': { default: [{ type: 'category', key: 'category:a', label: 'A', items: [] }] },
    '/repo/byoc.legacy.ts': { default: [{ type: 'category', key: 'category:missing', label: 'Missing', items: [] }] },
  }

  const result = generateJaSidebarLabels({
    workspace: '/repo',
    fsImpl,
    loadSidebars: sourcePath => sidebarsBySource[sourcePath],
    targets: [
      { pluginLabel: 'guides', legacySidebarPath: 'guides.legacy.ts', outputPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current.json' },
      { pluginLabel: 'guides-byoc', legacySidebarPath: 'byoc.legacy.ts', outputPath: 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current.json' },
    ],
    missingPolicy: 'allow',
  })

  assert.deepEqual(result.missing, [
    { pluginLabel: 'guides-byoc', sidebarName: 'default', type: 'category', key: 'category:missing', englishLabel: 'Missing' },
  ])
  const written = JSON.parse(fsImpl.written['/repo/i18n/ja-JP/docusaurus-plugin-content-docs/current.json'])
  assert.deepEqual(Object.keys(written), ['sidebar.default.category.category:a'])
  assert.equal(fsImpl.written['/repo/i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current.json'], '{}\n')
})

test('generateJaSidebarLabels rejects unknown missingPolicy values', () => {
  const fsImpl = makeFsImpl({
    '/repo/config/translation/ja-JP-sidebar-labels.json': JSON.stringify({ labels: {} }),
  })
  assert.throws(
    () => generateJaSidebarLabels({
      workspace: '/repo',
      fsImpl,
      loadSidebars: () => ({}),
      missingPolicy: 'silent',
    }),
    /missingPolicy must be 'fail' or 'allow'/,
  )
})

test('the en site build regenerates ja sidebar translations before docusaurus build', () => {
  const nodeFs = require('node:fs')
  const nodePath = require('node:path')
  const pkg = JSON.parse(nodeFs.readFileSync(nodePath.join(__dirname, '../../apps/docs/package.json'), 'utf8'))
  assert.match(
    pkg.scripts['build:en'],
    /node \.\.\/\.\.\/scripts\/docs-workflow\/generate-ja-sidebar-labels\.js --allow-missing && /,
  )
})

test('assertOutputsUntracked probes every output and passes when none is tracked', () => {
  const probed = []
  assert.doesNotThrow(() => assertOutputsUntracked('/repo', (command, args) => {
    probed.push(args[3])
    throw new Error('untracked')
  }))
  assert.deepEqual(probed, [
    'i18n/ja-JP/docusaurus-plugin-content-docs/current.json',
    'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current.json',
  ])
})

test('assertOutputsUntracked fails loud when a publication lane already owns an output as tracked', () => {
  assert.throws(
    () => assertOutputsUntracked('/repo', (command, args) => {
      if (args[3] === 'i18n/ja-JP/docusaurus-plugin-content-docs/current.json') return Buffer.alloc(0)
      throw new Error('untracked')
    }),
    /is git-tracked/,
  )
})
