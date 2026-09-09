'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')

const {
  mergeSeedAndRecoveryReports,
  loadSemanticSeedIndex,
  translateAndReviewUnit,
} = require('./agentRunner')
const {createAdaptiveCallBudget, createProviderRetryBudget} = require('./agentRunner')
const {loadLocaleContract} = require('./localeContract')
const {loadSemanticCheckpoints} = require('./semanticRecovery')
const {collectSemanticUnitsSync} = require('./semanticUnits')
const {
  pairOldSourceWithTarget,
  planSemanticSeeds,
  resolveOldSource,
  validateSeedManifest,
} = require('./semanticSeeds')

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex')
}

function withTempDir(callback) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'semantic-seeds-'))
  const finish = () => fs.rmSync(dir, {recursive: true, force: true})
  try {
    const result = callback(dir)
    if (result && typeof result.then === 'function') return result.finally(finish)
    finish()
    return result
  } catch (error) {
    finish()
    throw error
  }
}

function write(root, relative, content) {
  const target = path.join(root, relative)
  fs.mkdirSync(path.dirname(target), {recursive: true})
  fs.writeFileSync(target, content, 'utf8')
}

const OLD_SOURCE = [
  '---',
  'title: Hello',
  '---',
  '',
  '# Heading One',
  '',
  'First paragraph text.',
  '',
  'Second paragraph text.',
  '',
].join('\n')

const OLD_TARGET = [
  '---',
  'title: こんにちは',
  '---',
  '',
  '# 見出し一',
  '',
  '最初の段落。',
  '',
  '二番目の段落。',
  '',
].join('\n')

function currentSource({secondParagraph = 'Second paragraph text, revised.'} = {}) {
  return OLD_SOURCE.replace('Second paragraph text.', secondParagraph)
}

function manifestFor(items) {
  return {
    target: 'ja-JP',
    locale: 'ja-JP',
    group: 'guides',
    sourceCheckpointSha: 'a'.repeat(40),
    items,
  }
}

function itemFor({sourcePath = 'content/en/guides/t.md', sourceHash, reason = 'current_delta'} = {}) {
  return {
    sourcePath,
    targetPath: `i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/${path.basename(sourcePath)}`,
    sourceHash,
    locale: 'ja-JP',
    type: 'guides',
    reason,
  }
}

function initGitRepository(root, {sourcePath, oldSource}) {
  write(root, sourcePath, oldSource)
  const git = (args) => spawnSync('git', ['-C', root, ...args], {encoding: 'utf8'})
  assert.equal(git(['init', '-q']).status, 0)
  assert.equal(git(['config', 'user.email', 'seed-test@example.com']).status, 0)
  assert.equal(git(['config', 'user.name', 'Seed Test']).status, 0)
  assert.equal(git(['add', sourcePath]).status, 0)
  assert.equal(git(['commit', '-q', '-m', 'old source']).status, 0)
  return git(['rev-parse', 'HEAD']).stdout.trim()
}

function setupSeededRepository(dir, {currentSource: source, targetContent = OLD_TARGET, sourcePath = 'content/en/guides/t.md', recordedSourceHash, oldSource = OLD_SOURCE} = {}) {
  const repository = path.join(dir, 'repository')
  const baseline = path.join(dir, 'baseline')
  fs.mkdirSync(repository, {recursive: true})
  fs.mkdirSync(baseline, {recursive: true})
  const oldSha = initGitRepository(repository, {sourcePath, oldSource})
  write(repository, sourcePath, source)
  const item = itemFor({sourcePath, sourceHash: sha256(source)})
  write(baseline, item.targetPath, targetContent)
  write(repository, '.translation-cache/ja-JP.json', JSON.stringify({
    files: {[sourcePath]: {sourceHash: recordedSourceHash ?? sha256(oldSource), targetPath: item.targetPath, translatedAt: '2026-09-09T00:00:00Z'}},
  }))
  return {repository, baseline, oldSha, item, manifest: manifestFor([item])}
}

test('pairOldSourceWithTarget pairs identical structure and rejects drift', () => {
  const translations = pairOldSourceWithTarget(OLD_SOURCE, OLD_TARGET)
  assert.equal(translations.size, 4)
  assert.equal(translations.get(sha256('Hello')), 'こんにちは')
  const drifted = pairOldSourceWithTarget(OLD_SOURCE, `${OLD_TARGET}\nExtra paragraph.\n`)
  assert.equal(drifted, null)
  const reordered = pairOldSourceWithTarget(OLD_SOURCE, OLD_TARGET.replace('# 見出し一\n\n最初の段落。', '最初の段落。\n\n# 見出し一'))
  assert.equal(reordered, null)
})

test('resolveOldSource prefers the recorded source version', () => {
  withTempDir(dir => {
    const {repository, oldSha, item} = setupSeededRepository(dir, {currentSource: currentSource()})
    const current = currentSource()
    const recorded = sha256(OLD_SOURCE)
    assert.equal(resolveOldSource({repository, sourceBaselineSha: oldSha, sourcePath: item.sourcePath, currentSource: current, recordedSourceHash: recorded}).content, OLD_SOURCE)
    assert.equal(resolveOldSource({repository, sourceBaselineSha: oldSha, sourcePath: item.sourcePath, currentSource: current, recordedSourceHash: sha256(current)}).content, current)
    const unavailable = resolveOldSource({repository, sourceBaselineSha: '0'.repeat(40), sourcePath: item.sourcePath, currentSource: current, recordedSourceHash: recorded})
    assert.equal(unavailable.content, null)
    assert.equal(unavailable.reason, 'old_source_unavailable')
  })
})

test('planSemanticSeeds reuses unchanged units and revalidates the report schema', () => {
  withTempDir(dir => {
    const source = currentSource()
    const {repository, baseline, oldSha, item, manifest} = setupSeededRepository(dir, {currentSource: source})
    const plan = planSemanticSeeds({manifest, repository, baseline, sourceBaselineSha: oldSha, chunkOptions: null})
    assert.equal(plan.summary.counts.candidates, 1)
    assert.equal(plan.summary.counts.seededFiles, 1)
    assert.equal(plan.summary.counts.fallbackFiles, 0)
    assert.equal(plan.summary.counts.seededUnits, 3)
    const record = plan.summary.files[item.sourcePath]
    assert.equal(record.seededUnits, 3)
    assert.match(record.reportFile, /^reports\/000001\.json$/)
    const report = plan.reports[0].report
    assert.deepEqual(report.entries.map(entry => entry.id).sort(), [
      'document.frontmatter.title',
      'document.heading.0001',
      'document.paragraph.0001',
    ])
    assert.equal(report.entries.find(entry => entry.id === 'document.frontmatter.title').translation, 'こんにちは')
    assert.equal(report.entries.find(entry => entry.id === 'document.paragraph.0001').translation, '最初の段落。')
    const checkpoints = loadSemanticCheckpoints(report, {...item, target: manifest.target})
    assert.equal(checkpoints.size, 3)
  })
})

test('planSemanticSeeds falls back when the baseline target is missing', () => {
  withTempDir(dir => {
    const source = currentSource()
    const {repository, baseline, oldSha, item, manifest} = setupSeededRepository(dir, {currentSource: source})
    fs.rmSync(path.join(baseline, item.targetPath))
    const plan = planSemanticSeeds({manifest, repository, baseline, sourceBaselineSha: oldSha, chunkOptions: null})
    assert.equal(plan.summary.counts.seededFiles, 0)
    assert.equal(plan.summary.counts.fallbackFiles, 1)
    assert.equal(plan.summary.files[item.sourcePath].reason, 'missing_baseline_target')
  })
})

test('planSemanticSeeds falls back when the recorded source is unavailable', () => {
  withTempDir(dir => {
    const source = currentSource()
    const {repository, baseline, item, manifest} = setupSeededRepository(dir, {currentSource: source, recordedSourceHash: 'f'.repeat(64)})
    const plan = planSemanticSeeds({manifest, repository, baseline, sourceBaselineSha: 'e'.repeat(40), chunkOptions: null})
    assert.equal(plan.summary.files[item.sourcePath].reason, 'old_source_unavailable')
    assert.equal(plan.summary.counts.seededUnits, 0)
  })
})

test('planSemanticSeeds falls back when target structure cannot be aligned', () => {
  withTempDir(dir => {
    const source = currentSource()
    const {repository, baseline, oldSha, item, manifest} = setupSeededRepository(dir, {
      currentSource: source,
      targetContent: `${OLD_TARGET}## Extra heading\n\nExtra paragraph.\n`,
    })
    const plan = planSemanticSeeds({manifest, repository, baseline, sourceBaselineSha: oldSha, chunkOptions: null})
    assert.equal(plan.summary.files[item.sourcePath].reason, 'alignment_failed')
  })
})

test('planSemanticSeeds falls back when every current unit changed', () => {
  withTempDir(dir => {
    const source = currentSource({secondParagraph: 'Revised.', })
      .replace('First paragraph text.', 'First paragraph rewritten.')
      .replace('# Heading One', '# Heading Renamed')
      .replace('title: Hello', 'title: Greetings')
    const {repository, baseline, oldSha, item, manifest} = setupSeededRepository(dir, {currentSource: source})
    const plan = planSemanticSeeds({manifest, repository, baseline, sourceBaselineSha: oldSha, chunkOptions: null})
    assert.equal(plan.summary.files[item.sourcePath].reason, 'no_matching_units')
  })
})

test('planSemanticSeeds drops seeds that break protected content', () => {
  withTempDir(dir => {
    const oldSource = OLD_SOURCE.replace('First paragraph text.', 'First paragraph with `inline_code` token.')
    const target = OLD_TARGET.replace('最初の段落。', '最初の段落。トークン無し。')
    const source = oldSource.replace('Second paragraph text.', 'Second paragraph text, revised.')
    const {repository, baseline, oldSha, item, manifest} = setupSeededRepository(dir, {currentSource: source, targetContent: target, oldSource})
    const plan = planSemanticSeeds({manifest, repository, baseline, sourceBaselineSha: oldSha, chunkOptions: null})
    assert.equal(plan.summary.counts.seededUnits, 2)
    assert.equal(plan.summary.counts.seededFiles, 1)
    const ids = plan.reports[0].report.entries.map(entry => entry.id)
    assert.ok(!ids.includes('document.paragraph.0001'))
  })
})

test('planSemanticSeeds falls back when retention bounds are exceeded', () => {
  withTempDir(dir => {
    const paragraphs = Array.from({length: 520}, (_, index) => `Paragraph number ${index} text.`)
    const oldSource = `# Heading\n\n${paragraphs.join('\n\n')}\n`
    const target = `# 見出し\n\n${paragraphs.map((_, index) => `段落番号 ${index}。`).join('\n\n')}\n`
    const source = oldSource.replace('Paragraph number 519 text.', 'Paragraph number 519 revised.')
    const repository = path.join(dir, 'repository')
    const baseline = path.join(dir, 'baseline')
    fs.mkdirSync(repository, {recursive: true})
    fs.mkdirSync(baseline, {recursive: true})
    const sourcePath = 'content/en/guides/big.md'
    const oldSha = initGitRepository(repository, {sourcePath, oldSource})
    write(repository, sourcePath, source)
    const item = itemFor({sourcePath, sourceHash: sha256(source)})
    write(baseline, item.targetPath, target)
    write(repository, '.translation-cache/ja-JP.json', JSON.stringify({
      files: {[sourcePath]: {sourceHash: sha256(oldSource), targetPath: item.targetPath}},
    }))
    const plan = planSemanticSeeds({manifest: manifestFor([item]), repository, baseline, sourceBaselineSha: oldSha, chunkOptions: null})
    assert.equal(plan.summary.files[sourcePath].reason, 'seed_too_large')
  })
})

test('planSemanticSeeds uses chunk-prefixed unit ids when the document chunks', () => {
  withTempDir(dir => {
    const paragraphs = Array.from({length: 120}, (_, index) => `Paragraph number ${index} with enough prose to fill several chunks of translated text.`)
    const oldSource = `# Heading\n\n${paragraphs.join('\n\n')}\n`
    const target = `# 見出し\n\n${paragraphs.map((_, index) => `チャンク分割を確保するための十分な長さのある段落 ${index} のテキスト。`).join('\n\n')}\n`
    const source = oldSource.replace('Paragraph number 119 with', 'Paragraph 119 changed with')
    const repository = path.join(dir, 'repository')
    const baseline = path.join(dir, 'baseline')
    fs.mkdirSync(repository, {recursive: true})
    fs.mkdirSync(baseline, {recursive: true})
    const sourcePath = 'content/en/guides/chunked.md'
    const oldSha = initGitRepository(repository, {sourcePath, oldSource})
    write(repository, sourcePath, source)
    const item = itemFor({sourcePath, sourceHash: sha256(source)})
    write(baseline, item.targetPath, target)
    write(repository, '.translation-cache/ja-JP.json', JSON.stringify({
      files: {[sourcePath]: {sourceHash: sha256(oldSource), targetPath: item.targetPath}},
    }))
    const chunkOptions = {targetChars: 1000, maxChars: 2000}
    const plan = planSemanticSeeds({manifest: manifestFor([item]), repository, baseline, sourceBaselineSha: oldSha, chunkOptions})
    assert.equal(plan.summary.counts.seededFiles, 1)
    assert.ok(plan.summary.counts.seededUnits > 0)
    const chunkUnits = chunkOptions ? collectSemanticUnitsSync(source, {idPrefix: 'document'}) : []
    assert.ok(chunkUnits.length > 0)
    for (const entry of plan.reports[0].report.entries) {
      assert.match(entry.id, /^(document|chunk\.\d{4})\./)
    }
  })
})

test('validateSeedManifest rejects unsafe paths and invalid hashes', () => {
  assert.throws(() => validateSeedManifest({target: 'ja-JP', locale: 'ja-JP', group: 'guides', sourceCheckpointSha: 'a'.repeat(40), items: [{sourcePath: '../escape.md', targetPath: 'i18n/x.md', sourceHash: 'a'.repeat(64)}]}), /safe repository-relative/)
  assert.throws(() => validateSeedManifest({target: 'ja-JP', locale: 'ja-JP', group: 'guides', sourceCheckpointSha: 'a'.repeat(40), items: [{sourcePath: 'a.md', targetPath: 'i18n/x.md', sourceHash: 'xyz'}]}), /64 lowercase hex/)
  assert.throws(() => validateSeedManifest({target: 'ja-JP', locale: 'ja-JP', group: 'guides', items: []}), /sourceCheckpointSha/)
})

test('mergeSeedAndRecoveryReports prefers recovery entries per unit id', () => {
  const seed = {
    schemaVersion: 1, sourcePath: 'a.md', targetPath: 'i18n/a.md', sourceHash: 'a'.repeat(64),
    target: 'ja-JP', locale: 'ja-JP', contractId: 'ja-1',
    entries: [
      {id: 'document.paragraph.0001', sourceHash: 'b'.repeat(64), translation: 'seed'},
      {id: 'document.paragraph.0002', sourceHash: 'c'.repeat(64), translation: 'seed-only'},
    ],
  }
  const recovery = {
    schemaVersion: 1, sourcePath: 'a.md', targetPath: 'i18n/a.md', sourceHash: 'a'.repeat(64),
    target: 'ja-JP', locale: 'ja-JP', contractId: 'ja-1',
    entries: [
      {id: 'document.paragraph.0001', sourceHash: 'b'.repeat(64), translation: 'recovery'},
    ],
  }
  assert.equal(mergeSeedAndRecoveryReports(null, recovery), recovery)
  assert.equal(mergeSeedAndRecoveryReports(seed, null), seed)
  const merged = mergeSeedAndRecoveryReports(seed, recovery)
  assert.equal(merged.entries.length, 2)
  assert.equal(merged.entries.find(entry => entry.id === 'document.paragraph.0001').translation, 'recovery')
  assert.equal(merged.entries.find(entry => entry.id === 'document.paragraph.0002').translation, 'seed-only')
})

test('loadSemanticSeedIndex validates summary identity against the manifest', () => {
  withTempDir(dir => {
    const manifest = manifestFor([])
    const seedDir = path.join(dir, 'seeds')
    fs.mkdirSync(seedDir, {recursive: true})
    fs.writeFileSync(path.join(seedDir, 'summary.json'), JSON.stringify({
      schemaVersion: 1, kind: 'semantic-translation-seeds', target: 'ja-JP', locale: 'ja-JP',
      group: 'guides', sourceCheckpointSha: manifest.sourceCheckpointSha, counts: {}, files: {
        'content/en/guides/t.md': {reportFile: 'reports/000001.json', seededUnits: 3},
      },
    }))
    const index = loadSemanticSeedIndex(seedDir, manifest)
    assert.equal(index.reportsBySourcePath.get('content/en/guides/t.md'), 'reports/000001.json')
    fs.writeFileSync(path.join(seedDir, 'summary.json'), JSON.stringify({
      schemaVersion: 1, kind: 'semantic-translation-seeds', target: 'zh-CN-reference', locale: 'zh-CN',
      group: 'guides', sourceCheckpointSha: manifest.sourceCheckpointSha, counts: {}, files: {},
    }))
    assert.throws(() => loadSemanticSeedIndex(seedDir, manifest), /does not match the current manifest/)
    fs.writeFileSync(path.join(seedDir, 'summary.json'), JSON.stringify({
      schemaVersion: 1, kind: 'other', target: 'ja-JP', locale: 'ja-JP',
      group: 'guides', sourceCheckpointSha: manifest.sourceCheckpointSha, counts: {}, files: {
        'x.md': {reportFile: '../../etc/passwd.json'},
      },
    }))
    assert.throws(() => loadSemanticSeedIndex(seedDir, manifest), /header is invalid|unsafe/)
  })
})

test('seeded semantic checkpoints skip model calls and land verbatim', async () => {
  const sourceContent = '# Heading\n\nFirst paragraph.\n\nSecond paragraph.\n'
  const units = collectSemanticUnitsSync(sourceContent, {idPrefix: 'document'})
  const seeded = units.find(unit => unit.id === 'document.paragraph.0001')
  const semanticCheckpoint = new Map([
    [seeded.id, {id: seeded.id, sourceHash: sha256(seeded.source), translation: '最初の段落。'}],
  ])
  const previousSkip = process.env.TRANSLATION_SKIP_BLIND_REVIEW
  process.env.TRANSLATION_SKIP_BLIND_REVIEW = 'true'
  const modelAgents = []
  try {
    const result = await translateAndReviewUnit({
      target: 'ja-JP',
      sourcePath: 'content/en/guides/unit.md',
      sourceContent,
      locale: 'ja-JP',
      callModel: async ({agent, messages}) => {
        modelAgents.push(agent)
        assert.equal(agent, 'translation')
        const match = messages.at(-1).content.match(/<semantic_units>\n([\s\S]*?)<\/semantic_units>/)
        const pending = JSON.parse(match[1])
        assert.equal(pending.length, units.length - 1)
        assert.deepEqual(pending.map(unit => unit.id), ['document.heading.0001', 'document.paragraph.0002'])
        return JSON.stringify({translations: pending.map(unit => ({id: unit.id, text: unit.id === 'document.heading.0002' ? '見出し' : unit.id.endsWith('paragraph.0002') ? '二番目の段落。' : unit.id}))})
      },
      maxReviewRounds: 0,
      chunkContext: null,
      providerRetryBudget: createProviderRetryBudget(0),
      adaptiveCallBudget: createAdaptiveCallBudget(4),
      semanticCheckpoint,
      adaptiveTargetChars: 16000,
      adaptiveMaxChars: 24000,
    })
    assert.equal(modelAgents.length, 1)
    assert.ok(result.translatedContent.includes('最初の段落。'))
    assert.ok(result.translatedContent.includes('二番目の段落。'))
    assert.ok(!result.translatedContent.includes('First paragraph.'))
    assert.equal(result.semanticUnits, units.length)
  } finally {
    if (previousSkip === undefined) delete process.env.TRANSLATION_SKIP_BLIND_REVIEW
    else process.env.TRANSLATION_SKIP_BLIND_REVIEW = previousSkip
  }
})
