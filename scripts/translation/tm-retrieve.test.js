'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {spawnSync} = require('node:child_process');

const {parseArgs, renderFewshot, retrieve, splitSections} = require('./tm-retrieve');

const GUIDES_EN = 'content/en/guides';
const GUIDES_JA = 'i18n/ja-JP/docusaurus-plugin-content-docs/current';
const BYOC_EN = 'content/en/byoc';
const BYOC_JA = 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current';

function write(root, relativePath, content) {
  const target = path.join(root, relativePath)
  fs.mkdirSync(path.dirname(target), {recursive: true})
  fs.writeFileSync(target, content)
}

function initGitRepository(root, files) {
  for (const [relativePath, content] of Object.entries(files)) write(root, relativePath, content)
  for (const step of [
    ['init', '-q'],
    ['config', 'user.email', 'tm-retrieve@test'],
    ['config', 'user.name', 'tm-retrieve test'],
    ['add', '-A'],
    ['commit', '-q', '-m', 'fixture'],
  ]) {
    const result = spawnSync('git', ['-C', root, ...step], {encoding: 'utf8'})
    if (result.status !== 0) throw new Error(`git ${step[0]} failed: ${result.stderr}`)
  }
  const head = spawnSync('git', ['-C', root, 'rev-parse', 'HEAD'], {encoding: 'utf8'})
  if (head.status !== 0) throw new Error('git rev-parse failed')
  return head.stdout.trim()
}

function withTempTree(files, run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tm-retrieve-'))
  try {
    const checkpoint = initGitRepository(root, files)
    return run(root, checkpoint)
  } finally {
    fs.rmSync(root, {recursive: true, force: true})
  }
}

function parallelPage(name, enHeading, jaHeading = enHeading) {
  return {
    [`${GUIDES_EN}/dev/${name}.md`]: `---\ntitle: ${name}\nslug: /${name}\n---\n\n# ${name}\n\n## ${enHeading} {#${name}-${enHeading}}\n\nEnglish body about clusters and collections for ${name}.\n`,
    [`${GUIDES_JA}/dev/${name}.md`]: `---\ntitle: ${name}（JA）\nslug: /${name}\n---\n\n# ${name}\n\n## ${jaHeading} {#${name}-${enHeading}}\n\nクラスターとコレクションについての日本語本文（${name}）。\n`,
  }
}

test('parseArgs validates flags and repository path safety', () => {
  assert.throws(() => parseArgs(['--k', '2']), /--repository is required/)
  assert.throws(() => parseArgs(['--unknown', 'x']), /Unknown argument/)
  assert.throws(() => parseArgs(['--k']), /Usage:/)
  const opts = parseArgs(['--repository', '/tmp/x', '--checkpoint', 'a'.repeat(40), '--page', 'guides/a.md'])
  assert.equal(opts.repository, path.resolve('/tmp/x'))
})

test('retrieve finds same-directory parallel pairs and aligns sections by anchor', () => {
  withTempTree({
    ...parallelPage('neighbor-a', 'Setup'),
    ...parallelPage('neighbor-b', 'Setup'),
    [`${GUIDES_EN}/dev/target.md`]: '---\ntitle: target\n---\n\n# target\n',
  }, (root, checkpoint) => {
    const result = retrieve(root, checkpoint, 'content/en/guides/dev/target.md', 2, 3500)
    assert.equal(result.matches.length, 2)
    assert.ok(result.matches.every(match => match.tier === 'same-dir'))
    assert.deepEqual(result.matches.map(match => path.basename(match.enPath)).sort(), ['neighbor-a.md', 'neighbor-b.md'])
    const first = result.matches[0]
    assert.ok(first.jaPath.startsWith(GUIDES_JA))
    assert.ok(first.excerpts.length >= 1)
    assert.equal(first.excerpts[0].align, 'anchor')
    assert.match(first.excerpts[0].en, /English body about clusters/)
    assert.match(first.excerpts[0].ja, /クラスターとコレクション/)
  })
})

test('retrieve falls back to the parent directory tier when the page directory is empty', () => {
  withTempTree({
    ...parallelPage('parent-only', 'Setup'),
    [`${GUIDES_EN}/dev/nested/deep/target.md`]: '---\ntitle: target\n---\n\n# target\n',
  }, (root, checkpoint) => {
    const result = retrieve(root, checkpoint, 'guides/dev/nested/deep/target.md', 2, 3500)
    assert.equal(result.matches.length, 1)
    assert.notEqual(result.matches[0].tier, 'same-dir')
    assert.equal(path.basename(result.matches[0].enPath), 'parent-only.md')
  })
})

test('retrieve gates the domain-root tier on filename similarity', () => {
  withTempTree({
    ...parallelPage('cluster-backfill-guide', 'Setup'),
    ...parallelPage('completely-unrelated-thing', 'Setup'),
    [`${GUIDES_EN}/deep/island/cluster-backfill-similar.md`]: '---\ntitle: target\n---\n\n# target\n',
  }, (root, checkpoint) => {
    const result = retrieve(root, checkpoint, 'guides/deep/island/cluster-backfill-similar.md', 2, 3500)
    assert.equal(result.matches.length, 1)
    assert.equal(path.basename(result.matches[0].enPath), 'cluster-backfill-guide.md')
  })
})

test('retrieve returns empty matches fail-closed when no parallel pair exists', () => {
  withTempTree({
    [`${GUIDES_EN}/dev/only-english.md`]: '# only english\n',
  }, (root, checkpoint) => {
    const result = retrieve(root, checkpoint, 'guides/dev/only-english.md', 2, 3500)
    assert.deepEqual(result.matches, [])
    assert.ok(result.note)
  })
})

test('retrieve rejects pages outside the supported product domains', () => {
  withTempTree({...parallelPage('somewhere', 'Setup')}, (root, checkpoint) => {
    const result = retrieve(root, checkpoint, 'content/en/unsupported/x.md', 2, 3500)
    assert.deepEqual(result.matches, [])
    assert.match(result.note, /supported product domain/)
  })
})

test('retrieve aligns rewritten Japanese heading anchors via fuzzy matching', () => {
  withTempTree({
    [`${GUIDES_EN}/dev/n.md`]: `---\ntitle: n\n---\n\n# n\n\n## Step 1: Start the integration in Zilliz Cloud {#step-1-start-the-integration-in-zilliz-cloud}\n\nEN step one body.\n\n## Step 2: Configure the settings {#step-2-configure-the-settings}\n\nEN step two body.\n`,
    [`${GUIDES_JA}/dev/n.md`]: `---\ntitle: n\nslug: /n\n---\n\n# n\n\n## Step 1: Start the integration in Zilliz Cloud Console {#step-1-start-integration-in-zilliz-cloud-console}\n\nJA step one body.\n\n## Step 2: Configure the settings {#step-2-configure-the-settings}\n\nJA step two body.\n`,
    [`${GUIDES_EN}/dev/t.md`]: '---\ntitle: t\n---\n\n# t\n',
  }, (root, checkpoint) => {
    const result = retrieve(root, checkpoint, 'guides/dev/t.md', 1, 3500)
    const excerpts = result.matches[0].excerpts
    assert.equal(excerpts.length, 2)
    assert.equal(excerpts[0].align, 'anchor-fuzzy')
    assert.match(excerpts[0].en, /EN step one body/)
    assert.match(excerpts[0].ja, /JA step one body/)
    assert.equal(excerpts[1].align, 'anchor')
    assert.match(excerpts[1].en, /EN step two body/)
    assert.match(excerpts[1].ja, /JA step two body/)
  })
})

test('retrieve is deterministic across repeated invocations', () => {
  withTempTree({
    ...parallelPage('a', 'Setup'),
    ...parallelPage('b', 'Setup'),
    ...parallelPage('c', 'Setup'),
    [`${GUIDES_EN}/dev/target.md`]: '---\ntitle: target\n---\n\n# target\n',
  }, (root, checkpoint) => {
    const first = JSON.stringify(retrieve(root, checkpoint, 'guides/dev/target.md', 2, 3500))
    const second = JSON.stringify(retrieve(root, checkpoint, 'guides/dev/target.md', 2, 3500))
    assert.equal(first, second)
  })
})

test('renderFewshot wraps matches in a tm_examples block', () => {
  const rendered = renderFewshot({
    checkpoint: 'c'.repeat(40),
    page: 'guides/dev/target.md',
    matches: [{
      enPath: `${GUIDES_EN}/dev/n.md`,
      jaPath: `${GUIDES_JA}/dev/n.md`,
      score: 100,
      tier: 'same-dir',
      excerpts: [{heading: 'Setup', align: 'anchor', en: 'English body.', ja: '日本語本文。'}],
    }],
  })
  assert.match(rendered, /^<tm_examples>/)
  assert.match(rendered, /<\/tm_examples>\n?$/)
  assert.match(rendered, /style\/terminology reference only/i)
  assert.match(rendered, /English body\./)
  assert.match(rendered, /日本語本文。/)
  assert.match(rendered, /c{40}/)
})

test('splitSections splits on markdown headings and keeps level and anchor fields', () => {
  const sections = splitSections('---\ntitle: x\n---\n\n# Title\n\nIntro.\n\n## Alpha\n\nA.\n\n### Beta {#beta}\n\nB.\n')
  assert.deepEqual(sections.map(section => ({level: section.level, text: section.text})), [
    {level: 2, text: 'Alpha'},
    {level: 3, text: 'Beta'},
  ])
  assert.equal(sections[0].anchor, null)
  assert.equal(sections[1].anchor, 'beta')
})

test('byoc domain maps to the byoc plugin i18n root', () => {
  withTempTree({
    ...parallelPage('n', 'Setup'),
    [`${BYOC_EN}/deploy/b.md`]: '---\ntitle: b\n---\n\n# b\n',
    [`${BYOC_JA}/deploy/a.md`]: '# a\n',
    [`${BYOC_EN}/deploy/a.md`]: '---\ntitle: a\n---\n\n# a\n',
  }, (root, checkpoint) => {
    const result = retrieve(root, checkpoint, 'byoc/deploy/b.md', 1, 3500)
    assert.equal(result.matches.length, 1)
    assert.equal(result.matches[0].jaPath, `${BYOC_JA}/deploy/a.md`)
  })
})
