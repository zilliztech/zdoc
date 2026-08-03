const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { test } = require('node:test')
const { createCardReport } = require('./docs-workflow/docs-card-report')
const {
  assemblyIdentityNote,
  brokenContentLinksNote,
  cacheGenerationNote,
  collectCardNotes,
  collectNotes,
  isFreshGeneratedAt,
  mediaPrefetchNote,
  publicationReportNote,
} = require('./collect-build-card-notes')
const { VALIDATION_SPECS, writePublicationReport } = require('./docs-workflow/translation-publication-report')

function assemblyDecision(overrides = {}) {
  return {
    schemaVersion: 1,
    generated_at: '2026-07-17T01:05:00.000Z',
    masterSha: 'a'.repeat(40),
    devBaselineSha: 'b'.repeat(40),
    baselineSourceSha: 'b'.repeat(40),
    mode: 'reuse',
    reasons: [],
    tableCount: 0,
    semanticSourceGraphSha256: '1'.repeat(64),
    navigationOwnershipSha256: '2'.repeat(64),
    generatorFingerprintSha256: '3'.repeat(64),
    baselineDescriptorPresent: true,
    baselineDescriptorValid: true,
    baselineDescriptorSha256: '4'.repeat(64),
    baselineSaasSidebarPresent: true,
    baselineSaasSidebarValid: true,
    baselineSaasSidebarSha256: '5'.repeat(64),
    baselineByocSidebarPresent: true,
    baselineByocSidebarValid: true,
    baselineByocSidebarSha256: '6'.repeat(64),
    ...overrides,
  }
}

test('collectCardNotes preserves workflow summary notes before report notes', () => {
  withTempCwd(() => {
    process.env.CARD_BASE_NOTES_JSON = '["# Workflow summary"]'
    fs.mkdirSync('packages/docs-tooling/src/links/meta/reports', { recursive: true })
    fs.writeFileSync('packages/docs-tooling/src/links/meta/reports/latest.md', '# Link checks\n\n- Broken links: 0')

    const notes = collectCardNotes()

    assert.equal(notes[0], '# Workflow summary')
    assert.match(notes[1], /# Link checks/)
  })
})

function withTempCwd(callback) {
  const originalCwd = process.cwd()
  const originalEnv = {
    CARD_REPORT_STARTED_AT: process.env.CARD_REPORT_STARTED_AT,
    GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY,
    GITHUB_SERVER_URL: process.env.GITHUB_SERVER_URL,
    GITHUB_SHA: process.env.GITHUB_SHA,
    CARD_REPORT_REF: process.env.CARD_REPORT_REF,
    CARD_REPORT_ARTIFACT_URL: process.env.CARD_REPORT_ARTIFACT_URL,
    CARD_EXPECT_GUIDES_REPORTS: process.env.CARD_EXPECT_GUIDES_REPORTS,
    CARD_GUIDES_REPORTS_ROOT: process.env.CARD_GUIDES_REPORTS_ROOT,
    CARD_EXPECT_EN_GUIDES_REPORTS: process.env.CARD_EXPECT_EN_GUIDES_REPORTS,
    CARD_EXPECT_ZH_GUIDES_REPORTS: process.env.CARD_EXPECT_ZH_GUIDES_REPORTS,
    CARD_BASE_NOTES_JSON: process.env.CARD_BASE_NOTES_JSON,
    CARD_EXPECT_GUIDES_PUBLICATION_REPORT: process.env.CARD_EXPECT_GUIDES_PUBLICATION_REPORT,
    CARD_GUIDES_PUBLICATION_REPORT: process.env.CARD_GUIDES_PUBLICATION_REPORT,
    CARD_GUIDES_RUN_ID: process.env.CARD_GUIDES_RUN_ID,
    CARD_GUIDES_RUN_ATTEMPT: process.env.CARD_GUIDES_RUN_ATTEMPT,
    CARD_GUIDES_MASTER_SHA: process.env.CARD_GUIDES_MASTER_SHA,
    CARD_GUIDES_SOURCE_SHA: process.env.CARD_GUIDES_SOURCE_SHA,
    CARD_GUIDES_TARGET_SHA: process.env.CARD_GUIDES_TARGET_SHA,
    CARD_GUIDES_STAGING_SHA: process.env.CARD_GUIDES_STAGING_SHA,
    CARD_GUIDES_PUBLISHER_RESULT: process.env.CARD_GUIDES_PUBLISHER_RESULT,
    CARD_GUIDES_PENDING_SET_SHA256: process.env.CARD_GUIDES_PENDING_SET_SHA256,
    CARD_GUIDES_FINAL_TRANSLATOR_STATUS: process.env.CARD_GUIDES_FINAL_TRANSLATOR_STATUS,
    CARD_GUIDES_FINAL_PUBLISHER_STATUS: process.env.CARD_GUIDES_FINAL_PUBLISHER_STATUS,
    CARD_GUIDES_FINAL_COMMIT_SHA: process.env.CARD_GUIDES_FINAL_COMMIT_SHA,
  }
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'card-notes-')))
  try {
    process.chdir(dir)
    return callback(dir)
  } finally {
    process.chdir(originalCwd)
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

function publicationReport(status, overrides = {}) {
  const staged = 'd'.repeat(40)
  const stagingRef = 'refs/heads/docs-translation-staging/guides/123-2-eeeeeeeeeeee'
  const receipts = VALIDATION_SPECS.map(spec => ({ id: spec.id, command: spec.command, result: 'success' }))
  const base = {
    schemaVersion: 1, runId: 123, runAttempt: 2, group: 'guides', masterSha: 'a'.repeat(40),
    sourceCheckpointSha: 'b'.repeat(40), expectedTargetSha: 'c'.repeat(40), stagingRef: null, stagingSha: null,
    status, validation: null, resultSha: null, cleanup: { status: 'not_required', detail: null },
    failure: { gate: null, detail: null, recovery: null },
  }
  if (status === 'published') Object.assign(base, { stagingRef, stagingSha: staged, validation: receipts, resultSha: staged, cleanup: { status: 'deleted', detail: null } })
  if (status === 'no_changes') base.resultSha = base.expectedTargetSha
  if (status === 'validation_failed') Object.assign(base, { stagingRef, stagingSha: staged, validation: [{ ...receipts[0], result: 'failure' }], cleanup: { status: 'pending', detail: null }, failure: { gate: 'validation', detail: 'build failed', recovery: `Inspect ${stagingRef}.` } })
  if (status === 'promotion_conflict') Object.assign(base, { stagingRef, stagingSha: staged, validation: receipts, cleanup: { status: 'pending', detail: null }, failure: { gate: 'promotion', detail: 'target moved', recovery: `Inspect ${stagingRef}.` } })
  return { ...base, ...overrides }
}

function configurePublicationEnv(file, stagingSha = '') {
  Object.assign(process.env, {
    CARD_EXPECT_GUIDES_PUBLICATION_REPORT: 'true', CARD_GUIDES_PUBLICATION_REPORT: file,
    CARD_GUIDES_RUN_ID: '123', CARD_GUIDES_RUN_ATTEMPT: '2', CARD_GUIDES_MASTER_SHA: 'a'.repeat(40),
    CARD_GUIDES_SOURCE_SHA: 'b'.repeat(40), CARD_GUIDES_TARGET_SHA: 'c'.repeat(40),
    CARD_GUIDES_STAGING_SHA: stagingSha, CARD_GUIDES_PUBLISHER_RESULT: 'success',
    CARD_GUIDES_PENDING_SET_SHA256: 'e'.repeat(64), CARD_GUIDES_FINAL_TRANSLATOR_STATUS: 'translation_ready',
    CARD_GUIDES_FINAL_PUBLISHER_STATUS: 'published', CARD_GUIDES_FINAL_COMMIT_SHA: stagingSha,
  })
}

for (const [status, expected] of [
  ['published', /Status: Published/],
  ['no_changes', /Status: No translation changes/],
  ['validation_failed', /Status: Validation Failed[\s\S]*Staging ref:[\s\S]*Staging SHA:[\s\S]*Recovery:/],
  ['promotion_conflict', /Status: Promotion Conflict[\s\S]*target moved/],
]) test(`collects a strict ${status} Guides publication note`, () => withTempCwd(dir => {
  fs.chmodSync(dir, 0o700)
  const file = path.join(dir, 'publication-report.json')
  const report = publicationReport(status)
  writePublicationReport(file, report, { trustedRoot: dir })
  configurePublicationEnv(file, report.stagingSha || '')
  const note = publicationReportNote()
  assert.match(note, expected)
  if (status !== 'published') assert.doesNotMatch(note, /Status: Published/)
}))

test('published cleanup debt remains Published and is called out', () => withTempCwd(dir => {
  fs.chmodSync(dir, 0o700)
  const file = path.join(dir, 'publication-report.json')
  const report = publicationReport('published', { cleanup: { status: 'debt', detail: 'lease mismatch' } })
  writePublicationReport(file, report, { trustedRoot: dir })
  configurePublicationEnv(file, report.stagingSha)
  assert.match(publicationReportNote(), /Status: Published[\s\S]*Cleanup debt: lease mismatch/)
}))

test('missing, stale, or cancelled publication evidence never invents staging identity', () => withTempCwd(dir => {
  configurePublicationEnv(path.join(dir, 'missing.json'))
  let note = publicationReportNote()
  assert.match(note, /Evidence unavailable/)
  assert.doesNotMatch(note, /refs\/heads|[0-9a-f]{40}/)
  process.env.CARD_GUIDES_PUBLISHER_RESULT = 'cancelled'
  note = publicationReportNote()
  assert.match(note, /Status: Cancelled[\s\S]*Unconfirmed recovery candidate: refs\/heads\/docs-translation-staging\/guides\/123-2-eeeeeeeeeeee/)
  assert.doesNotMatch(note, /Published|Staging SHA/)
  process.env.CARD_GUIDES_PENDING_SET_SHA256 = 'invalid'
  assert.doesNotMatch(publicationReportNote(), /recovery candidate/)
}))

test('zero-batch no_changes does not expect a publication artifact', () => withTempCwd(() => {
  process.env.CARD_EXPECT_GUIDES_PUBLICATION_REPORT = 'false'
  process.env.CARD_GUIDES_FINAL_PUBLISHER_STATUS = 'no_changes'
  process.env.CARD_GUIDES_FINAL_COMMIT_SHA = ''
  const note = publicationReportNote()
  assert.match(note, /Status: No translation changes/)
  assert.doesNotMatch(note, /SHA|refs\/heads|Published/)
}))

test('wrong-run publication report is rejected without leaking validated-looking identity', () => withTempCwd(dir => {
  fs.chmodSync(dir, 0o700)
  const file = path.join(dir, 'publication-report.json')
  writePublicationReport(file, publicationReport('published'), { trustedRoot: dir })
  configurePublicationEnv(file, 'd'.repeat(40))
  process.env.CARD_GUIDES_RUN_ID = '124'
  const note = publicationReportNote()
  assert.match(note, /unavailable or invalid/)
  assert.doesNotMatch(note, /Status: Published|refs\/heads|d{40}/)
}))

test('publication note is inserted immediately after base notes before the 12-note cap', () => withTempCwd(dir => {
  fs.chmodSync(dir, 0o700)
  const file = path.join(dir, 'publication-report.json')
  writePublicationReport(file, publicationReport('no_changes'), { trustedRoot: dir })
  configurePublicationEnv(file)
  process.env.CARD_BASE_NOTES_JSON = JSON.stringify(Array.from({ length: 12 }, (_, index) => `# Base ${index + 1}`))
  const notes = collectCardNotes()
  assert.equal(notes.length, 12)
  assert.equal(notes[11].startsWith('# Guides translation publication'), true)
}))

test('publication diagnostics are bounded and Markdown escaped', () => withTempCwd(dir => {
  fs.chmodSync(dir, 0o700)
  const file = path.join(dir, 'publication-report.json')
  const staged = publicationReport('validation_failed')
  staged.failure = { gate: 'validation', detail: '[click](https://evil.example) *bold* <tag> | # heading', recovery: `Inspect ${staged.stagingRef}; \`code\` & retry` }
  writePublicationReport(file, staged, { trustedRoot: dir })
  configurePublicationEnv(file, staged.stagingSha)
  const note = publicationReportNote()
  assert.doesNotMatch(note, /\[click\]\(https:\/\/evil\.example\)|<tag>|\*bold\*|\| # heading|`code`/)
  assert.match(note, /\\\[click\\\]\\\(https:\/\/evil\\\.example\\\)/)
  assert.match(note, /&lt;tag&gt;|&amp;/)
}))

test('publication note attention is exact without changing overall workflow status', () => withTempCwd(dir => {
  fs.chmodSync(dir, 0o700)
  const file = path.join(dir, 'publication-report.json')
  const render = (report, expectedAttention) => {
    writePublicationReport(file, report, { trustedRoot: dir })
    configurePublicationEnv(file, report.stagingSha || '')
    const card = createCardReport({ runId: 123, overallStatus: 'success', summary: 'Documentation workflow succeeded.', reports: [publicationReportNote()] })
    assert.equal(card.overallStatus, 'success')
    assert.equal(card.reports[0].attention, expectedAttention)
  }
  render(publicationReport('published'), false)
  render(publicationReport('no_changes'), false)
  render(publicationReport('validation_failed'), true)
  render(publicationReport('promotion_conflict'), true)
  render(publicationReport('published', { cleanup: { status: 'debt', detail: 'lease mismatch' } }), true)

  configurePublicationEnv(path.join(dir, 'missing.json'))
  let card = createCardReport({ runId: 123, overallStatus: 'success', summary: 'ok', reports: [publicationReportNote()] })
  assert.equal(card.reports[0].attention, true)
  process.env.CARD_GUIDES_PUBLISHER_RESULT = 'cancelled'
  card = createCardReport({ runId: 123, overallStatus: 'success', summary: 'ok', reports: [publicationReportNote()] })
  assert.equal(card.reports[0].attention, true)

  process.env.CARD_EXPECT_GUIDES_PUBLICATION_REPORT = 'false'
  process.env.CARD_GUIDES_FINAL_PUBLISHER_STATUS = 'no_changes'
  process.env.CARD_GUIDES_FINAL_COMMIT_SHA = ''
  card = createCardReport({ runId: 123, overallStatus: 'success', summary: 'ok', reports: [publicationReportNote()] })
  assert.equal(card.reports[0].attention, false)
}))

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(value, null, 2))
}

function writeFreshGuidesReports(generatedAt = '2026-07-17T01:05:00.000Z') {
  writeJson('packages/docs-tooling/src/lark/meta/reports/guides-incremental-fetch-plan.json', {
    generated_at: generatedAt,
    mode: 'incremental',
    build_env: 'uat',
    changed_tokens: ['doc-a'],
    expanded_tokens: ['doc-a'],
    removed_tokens: [],
    warnings: [],
  })
  writeJson('packages/docs-tooling/src/lark/meta/reports/guides-broken-content-links.json', {
    generated_at: generatedAt,
    source_dir: './packages/docs-tooling/src/lark/meta/sources/guides',
    summary: { canonical_tokens: 1, scanned_sources: 1, content_links: 1, broken_content_links: 0 },
    broken_content_links: [],
  })
  writeJson('packages/docs-tooling/src/lark/meta/reports/guides-canonical-link-audit.json', {
    generated_at: generatedAt,
    target: 'zilliz.saas',
    summary: { canonical_records: 1, scanned_sources: 1, internal_references: 1, valid_references: 1, broken_references: 0 },
  })
  writeMediaReports({ generatedAt })
  const decision = assemblyDecision({ generated_at: generatedAt })
  writeJson('packages/docs-tooling/src/lark/meta/reports/guides-assembly-decision.json', decision)
  writeJson('packages/docs-tooling/src/lark/meta/reports/guides-assembly-result.json', {
    schemaVersion: 1,
    generated_at: generatedAt,
    mode: 'reuse_observed',
    decisionSha256: require('./docs-workflow/guides-assembly-identity').assemblyDecisionSha256(decision),
    reasons: [],
    elapsedMilliseconds: 12,
    byteComparison: { required: true, saasEqual: true, byocEqual: true, descriptorVerified: true },
  })
}

function writeMediaReports({ generatedAt = '2026-07-17T01:05:00.000Z', persistence = 'saved', media = {}, generation = {} } = {}) {
  writeJson('packages/docs-tooling/src/lark/meta/reports/guides-media-prefetch.json', {
    schemaVersion: 1,
    generated_at: generatedAt,
    mode: 'incremental',
    cacheState: 'valid',
    metrics: {
      canonicalReferencesRequired: 472,
      selectedReferences: 22,
      validatedManifestReuse: 450,
      committedDocsReconstruction: 12,
      resolvedByNetwork: 10,
      staleEntriesDropped: 3,
      finalManifestEntries: 472,
    },
    ...media,
  })
  const skipped = persistence === 'skipped-valid-v4'
  writeJson('packages/docs-tooling/src/lark/meta/reports/guides-cache-generation.json', {
    schemaVersion: 1,
    generated_at: generatedAt,
    sourceCacheVersion: skipped ? 'v4' : 'v3',
    saveRequired: !skipped,
    persistence,
    saveKey: skipped ? null : `guides-source-v4-${'a'.repeat(64)}-100-1`,
    ...generation,
  })
}

function writeCurrentLocaleReports(site, { generatedAt = '2026-07-17T01:05:00.000Z' } = {}) {
  const root = path.join('tmp/card-guides-reports', site)
  const report = file => path.join(root, file)
  writeJson(report('guides-media-prefetch.json'), {
    schemaVersion: 1,
    generated_at: generatedAt,
    mode: 'incremental',
    cacheState: 'valid',
    metrics: {
      canonicalReferencesRequired: site === 'en' ? 477 : 334,
      selectedReferences: 0,
      validatedManifestReuse: site === 'en' ? 477 : 334,
      committedDocsReconstruction: 0,
      resolvedByNetwork: 0,
      staleEntriesDropped: 0,
      finalManifestEntries: site === 'en' ? 477 : 334,
    },
  })
  writeJson(report('guides-cache-generation.json'), {
    schemaVersion: 1,
    generated_at: generatedAt,
    sourceCacheVersion: 'v5',
    saveRequired: false,
    persistence: 'skipped-valid-v5',
    saveKey: null,
  })
  writeJson(report(`guides-${site}-canonical-link-audit.json`), {
    generated_at: generatedAt,
    manual: 'guides',
    target: null,
    source_dir: `./packages/docs-tooling/src/lark/meta/sources/guides${site === 'en' ? '' : '-zh-CN'}`,
    summary: {
      canonical_records: site === 'en' ? 376 : 313,
      scanned_sources: site === 'en' ? 376 : 313,
      skipped_noncanonical_sources: site === 'en' ? 93 : 125,
      internal_references: site === 'en' ? 2163 : 1581,
      valid_references: site === 'en' ? 2152 : 1409,
      broken_references: site === 'en' ? 11 : 172,
    },
    files: [],
  })
  writeJson(report('guides-incremental-fetch-plan.json'), {
    generated_at: generatedAt,
    mode: 'incremental',
    build_env: 'uat',
    changed_tokens: [],
    expanded_tokens: [],
    removed_tokens: [],
    warnings: [],
  })
  const decision = assemblyDecision({ generated_at: generatedAt })
  writeJson(report('guides-assembly-decision.json'), decision)
  writeJson(report('guides-assembly-result.json'), {
    schemaVersion: 1,
    generated_at: generatedAt,
    mode: 'reuse_observed',
    decisionSha256: require('./docs-workflow/guides-assembly-identity').assemblyDecisionSha256(decision),
    reasons: [],
    elapsedMilliseconds: 12,
    byteComparison: { required: true, saasEqual: true, byocEqual: true, descriptorVerified: true },
  })
}

test('current v5 Guides cache persistence report is accepted', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
    writeMediaReports({
      persistence: 'skipped-valid-v5',
      generation: { sourceCacheVersion: 'v5', saveRequired: false, saveKey: null },
    })

    assert.equal(cacheGenerationNote(), '- Cache persistence: skipped-valid-v5')
  })
})

test('collects complete site-qualified English and Chinese Guides report sets', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
    process.env.CARD_REPORT_ARTIFACT_URL = 'https://github.com/zilliztech/zdoc/actions/runs/123#artifacts'
    process.env.CARD_GUIDES_REPORTS_ROOT = 'tmp/card-guides-reports'
    process.env.CARD_EXPECT_EN_GUIDES_REPORTS = 'true'
    process.env.CARD_EXPECT_ZH_GUIDES_REPORTS = 'true'
    writeCurrentLocaleReports('en')
    writeCurrentLocaleReports('zh-CN')

    const notes = collectNotes()
    const markdown = notes.join('\n')

    assert.equal(notes.length, 8)
    assert.match(markdown, /# English Guides media/)
    assert.match(markdown, /# Chinese Guides media/)
    assert.match(markdown, /# English Guides canonical link audit/)
    assert.match(markdown, /# Chinese Guides canonical link audit/)
    assert.match(markdown, /Broken references: 11/)
    assert.match(markdown, /Broken references: 172/)
    assert.doesNotMatch(markdown, /Guides reports unavailable/)
    assert.doesNotMatch(markdown, /Canonical content links audit/)
  })
})

test('combines strict media provenance and cache persistence into one Guides media note', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
    process.env.CARD_EXPECT_GUIDES_REPORTS = 'true'
    writeMediaReports()

    const notes = collectNotes()

    assert.equal(notes.length, 2)
    assert.equal(notes[0], [
      '# Guides media',
      '',
      '- Required: 472',
      '- Reused from validated manifest: 450',
      '- Reconstructed from committed docs: 12',
      '- Freshly resolved over network: 10',
      '- Stale entries dropped: 3',
      '- Final manifest entries: 472',
      '- Cache persistence: saved',
    ].join('\n'))
    assert.doesNotMatch(notes[0], /# Guides media[\s\S]*# Guides media/)
    assert.match(notes[1], /Canonical content links audit/)
    assert.doesNotMatch(notes[1], /Guides media prefetch|Guides cache persistence/)
  })
})

test('assembly reporting uses observe-only reuse wording and never claims sidebar reuse', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
    process.env.CARD_REPORT_REF = 'c'.repeat(40)
    process.env.CARD_REPORT_ARTIFACT_URL = 'https://github.com/zilliztech/zdoc/actions/runs/123#artifacts'
    const decision = assemblyDecision()
    const { assemblyDecisionSha256 } = require('./docs-workflow/guides-assembly-identity')
    writeJson('packages/docs-tooling/src/lark/meta/reports/guides-assembly-decision.json', decision)
    writeJson('packages/docs-tooling/src/lark/meta/reports/guides-assembly-result.json', {
      schemaVersion: 1,
      generated_at: '2026-07-17T01:06:00.000Z',
      mode: 'reuse_observed',
      decisionSha256: assemblyDecisionSha256(decision),
      reasons: [],
      elapsedMilliseconds: 12,
      byteComparison: { required: true, saasEqual: true, byocEqual: true, descriptorVerified: true },
    })
    const note = assemblyIdentityNote()
    assert.match(note, /Reuse eligible \(observe-only\)/)
    assert.match(note, /Sidebar reuse eligible; regenerated bytes matched baseline/)
    assert.doesNotMatch(note, /Sidebar reused/)
    assert.match(note, /actions\/runs\/123#artifacts/)
    assert.doesNotMatch(note, /blob\//)
  })
})

test('assembly reporting distinguishes regeneration decisions from completed results', async (t) => {
  const prospective = /Regeneration required \(observe-only\): source-delta/
  const pastTense = /(?:^|\s)Regenerated: source-delta/
  const prepare = () => {
    const decision = assemblyDecision({ mode: 'regenerate', reasons: ['source-delta'], baselineSourceSha: 'b'.repeat(40) })
    writeJson('packages/docs-tooling/src/lark/meta/reports/guides-assembly-decision.json', decision)
    return decision
  }

  await t.test('decision only', () => withTempCwd(() => {
    prepare()
    const note = assemblyIdentityNote()
    assert.match(note, prospective)
    assert.doesNotMatch(note, pastTense)
  }))

  await t.test('missing result', () => withTempCwd(() => {
    prepare()
    fs.mkdirSync('packages/docs-tooling/src/lark/meta/reports', { recursive: true })
    assert.equal(fs.existsSync('packages/docs-tooling/src/lark/meta/reports/guides-assembly-result.json'), false)
    const note = assemblyIdentityNote()
    assert.match(note, prospective)
    assert.doesNotMatch(note, pastTense)
  }))

  await t.test('invalid result', () => withTempCwd(() => {
    prepare()
    writeJson('packages/docs-tooling/src/lark/meta/reports/guides-assembly-result.json', {
      schemaVersion: 1,
      generated_at: '2026-07-17T01:06:00.000Z',
      mode: 'reuse_observed',
      decisionSha256: 'f'.repeat(64),
      reasons: [],
      elapsedMilliseconds: 8,
      byteComparison: { required: true, saasEqual: false, byocEqual: true, descriptorVerified: true },
    })
    const note = assemblyIdentityNote()
    assert.match(note, prospective)
    assert.doesNotMatch(note, pastTense)
  }))

  await t.test('valid result', () => withTempCwd(() => {
    const decision = prepare()
    writeJson('packages/docs-tooling/src/lark/meta/reports/guides-assembly-result.json', {
      schemaVersion: 1,
      generated_at: '2026-07-17T01:06:00.000Z',
      mode: 'regenerated',
      decisionSha256: require('./docs-workflow/guides-assembly-identity').assemblyDecisionSha256(decision),
      reasons: ['source-delta'],
      elapsedMilliseconds: 8,
      byteComparison: { required: false, saasEqual: null, byocEqual: null, descriptorVerified: true },
    })
    const note = assemblyIdentityNote()
    assert.match(note, prospective)
    assert.match(note, pastTense)
  }))
})

test('save-failed remains a terminal Guides media fact', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
    writeMediaReports({ persistence: 'save-failed' })
    assert.match(collectNotes()[0], /- Cache persistence: save-failed/)
  })
})

test('skipped-valid-v4 is accepted only with no save requirement and a null key', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
    writeMediaReports({ persistence: 'skipped-valid-v4' })
    assert.match(collectNotes()[0], /- Cache persistence: skipped-valid-v4/)
  })
})

for (const [persistence, expectedAttention] of [
  ['saved', false],
  ['skipped-valid-v4', false],
  ['save-failed', true],
]) {
  test(`collected ${persistence} persistence produces the correct final card attention without changing success`, () => {
    withTempCwd(() => {
      process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
      writeMediaReports({ persistence })
      const notes = collectNotes()
      const report = createCardReport({
        runId: 123,
        overallStatus: 'success',
        summary: 'Documentation workflow succeeded.',
        generatedAt: '2026-07-17T02:00:00.000Z',
        reports: notes,
      })
      const media = report.reports.find(item => item.title === 'Guides media')
      assert.equal(report.overallStatus, 'success')
      assert.equal(media.attention, expectedAttention)
    })
  })
}

test('cache failure wording outside the exact Guides persistence fact is not attention-worthy', () => {
  const report = createCardReport({
    runId: 123,
    overallStatus: 'success',
    summary: 'Documentation workflow succeeded.',
    generatedAt: '2026-07-17T02:00:00.000Z',
    reports: ['# Unrelated cache note\n\n- Cache persistence: save-failed'],
  })
  assert.equal(report.reports[0].attention, false)
})

test('malformed persistence remains best-effort through final card creation', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
    process.env.CARD_EXPECT_GUIDES_REPORTS = 'true'
    writeMediaReports({ generation: { persistence: 'save-failed', saveKey: null } })
    const report = createCardReport({
      runId: 123,
      overallStatus: 'success',
      summary: 'Documentation workflow succeeded.',
      generatedAt: '2026-07-17T02:00:00.000Z',
      reports: collectNotes(),
    })
    assert.equal(report.overallStatus, 'success')
    assert.equal(report.reports.some(item => /Guides cache persistence report/.test(item.markdown)), true)
    assert.equal(report.reports.some(item => item.attention), false)
  })
})

for (const [label, generation] of [
  ['saved without a required save', { persistence: 'saved', saveRequired: false }],
  ['skipped legacy cache', { persistence: 'skipped-valid-v4', sourceCacheVersion: 'v3', saveRequired: false, saveKey: null }],
  ['skipped cache with a save key', { persistence: 'skipped-valid-v4', sourceCacheVersion: 'v4', saveRequired: false }],
  ['failed save without its attempted key', { persistence: 'save-failed', saveRequired: true, saveKey: null }],
]) {
  test(`cache persistence collector rejects ${label}`, () => {
    withTempCwd(() => {
      process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
      writeMediaReports({ generation })
      assert.equal(cacheGenerationNote(), null)
    })
  })
}

test('invalid media reconciliation is best-effort and reported unavailable', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
    process.env.CARD_EXPECT_GUIDES_REPORTS = 'true'
    writeMediaReports({ media: { metrics: {
      canonicalReferencesRequired: 472,
      selectedReferences: 22,
      validatedManifestReuse: 450,
      committedDocsReconstruction: 12,
      resolvedByNetwork: 9,
      staleEntriesDropped: 3,
      finalManifestEntries: 472,
    } } })

    assert.equal(mediaPrefetchNote(), null)
    const notes = collectNotes()
    assert.match(notes[0], /# Guides media\n\n- Cache persistence: saved/)
    assert.match(notes.at(-1), /Guides media prefetch report/)
  })
})

test('missing persistence report leaves media facts available and names only persistence as missing', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
    process.env.CARD_EXPECT_GUIDES_REPORTS = 'true'
    writeMediaReports()
    fs.rmSync('packages/docs-tooling/src/lark/meta/reports/guides-cache-generation.json')

    assert.equal(cacheGenerationNote(), null)
    const notes = collectNotes()
    assert.match(notes[0], /# Guides media/)
    assert.doesNotMatch(notes[0], /Cache persistence/)
    assert.match(notes.at(-1), /Guides cache persistence report/)
    assert.doesNotMatch(notes.at(-1), /Guides media prefetch report/)
  })
})

test('stale media and persistence reports are omitted at the current-run boundary', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
    process.env.CARD_EXPECT_GUIDES_REPORTS = 'true'
    writeMediaReports({ generatedAt: '2026-07-17T00:59:59.999Z' })
    assert.equal(mediaPrefetchNote(), null)
    assert.equal(cacheGenerationNote(), null)
    assert.match(collectNotes()[0], /Guides media prefetch report/)
    assert.match(collectNotes()[0], /Guides cache persistence report/)
  })
})

for (const [label, mutateMedia, mutateGeneration] of [
  ['extra keys', report => { report.extra = true }, report => { report.extra = true }],
  ['missing keys', report => { delete report.mode }, report => { delete report.saveKey }],
  ['malformed values', report => { report.metrics.selectedReferences = -1 }, report => { report.persistence = 'unknown' }],
]) {
  test(`strict Guides media collectors reject ${label}`, () => {
    withTempCwd(() => {
      process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
      writeMediaReports()
      const mediaFile = 'packages/docs-tooling/src/lark/meta/reports/guides-media-prefetch.json'
      const generationFile = 'packages/docs-tooling/src/lark/meta/reports/guides-cache-generation.json'
      const media = JSON.parse(fs.readFileSync(mediaFile, 'utf8'))
      const generation = JSON.parse(fs.readFileSync(generationFile, 'utf8'))
      mutateMedia(media)
      mutateGeneration(generation)
      writeJson(mediaFile, media)
      writeJson(generationFile, generation)
      assert.equal(mediaPrefetchNote(), null)
      assert.equal(cacheGenerationNote(), null)
    })
  })
}

test('artifact-only Guides reports link to workflow artifacts rather than the tooling commit', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
    process.env.CARD_REPORT_REF = ''
    process.env.GITHUB_SHA = 'a'.repeat(40)
    process.env.GITHUB_REPOSITORY = 'zilliztech/zdoc'
    process.env.CARD_REPORT_ARTIFACT_URL = 'https://github.com/zilliztech/zdoc/actions/runs/123#artifacts'
    process.env.CARD_EXPECT_GUIDES_REPORTS = 'true'
    writeFreshGuidesReports()

    const notes = collectNotes()

    assert.equal(notes.length, 5)
    assert.match(notes.join('\n'), /actions\/runs\/123#artifacts/)
    assert.doesNotMatch(notes.join('\n'), new RegExp(`/blob/${'a'.repeat(40)}/`))
    assert.doesNotMatch(notes.join('\n'), /Guides reports unavailable/)
  })
})

test('published Guides reports use immutable links except runtime assembly reports', () => {
  withTempCwd(() => {
    const finalSha = 'b'.repeat(40)
    process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
    process.env.CARD_REPORT_REF = finalSha
    process.env.GITHUB_REPOSITORY = 'zilliztech/zdoc'
    process.env.GITHUB_SERVER_URL = 'https://github.com'
    process.env.CARD_REPORT_ARTIFACT_URL = 'https://github.com/zilliztech/zdoc/actions/runs/123#artifacts'
    process.env.CARD_EXPECT_GUIDES_REPORTS = 'true'
    writeFreshGuidesReports()

    const notes = collectNotes()

    assert.match(notes.join('\n'), new RegExp(`/blob/${finalSha}/packages/docs-tooling/src/lark/meta/reports/`))
    assert.match(notes.join('\n'), /Current-run report: \[packages\/docs-tooling\/src\/lark\/meta\/reports\/guides-assembly-decision\.json\]\(https:\/\/github\.com\/zilliztech\/zdoc\/actions\/runs\/123#artifacts\)/)
  })
})

test('expected Guides reports produce a bounded missing-report note', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
    process.env.CARD_EXPECT_GUIDES_REPORTS = 'true'

    const notes = collectNotes()

    assert.equal(notes.length, 1)
    assert.match(notes[0], /# Guides reports unavailable/)
    assert.match(notes[0], /Canonical content links audit/)
    assert.match(notes[0], /Canonical link audit/)
    assert.match(notes[0], /Incremental fetch plan/)
  })
})

test('partial Guides reports preserve available notes and name only missing categories', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
    process.env.CARD_EXPECT_GUIDES_REPORTS = 'true'
    writeJson('packages/docs-tooling/src/lark/meta/reports/guides-incremental-fetch-plan.json', {
      generated_at: '2026-07-17T01:05:00.000Z',
      mode: 'incremental',
      build_env: 'uat',
      changed_tokens: [],
      expanded_tokens: [],
      removed_tokens: [],
      warnings: [],
    })

    const notes = collectNotes()

    assert.equal(notes.length, 2)
    assert.match(notes[0], /# Incremental Fetch Plan/)
    assert.match(notes[1], /Canonical content links audit/)
    assert.match(notes[1], /Canonical link audit/)
    assert.doesNotMatch(notes[1], /- Incremental fetch plan/)
  })
})

for (const [label, generatedAt] of [['missing', undefined], ['malformed', 'not-a-timestamp']]) {
  test(`expected Guides reports reject a ${label} generated_at after the current run boundary`, () => {
    withTempCwd(() => {
      process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
      process.env.CARD_EXPECT_GUIDES_REPORTS = 'true'
      writeJson('packages/docs-tooling/src/lark/meta/reports/guides-incremental-fetch-plan.json', {
        generated_at: generatedAt,
        mode: 'incremental',
        build_env: 'uat',
        changed_tokens: [],
        expanded_tokens: [],
        removed_tokens: [],
        warnings: [],
      })

      const notes = collectNotes()

      assert.equal(notes.length, 1)
      assert.doesNotMatch(notes[0], /# Incremental Fetch Plan/)
      assert.match(notes[0], /# Guides reports unavailable/)
      assert.match(notes[0], /- Incremental fetch plan/)
    })
  })
}

for (const [label, generatedAt] of [
  ['array', ['2026-07-17T01:05:00.000Z']],
  ['object', { timestamp: '2026-07-17T01:05:00.000Z' }],
  ['number', 20260717],
]) {
  test(`expected Guides reports reject a non-string ${label} generated_at`, () => {
    withTempCwd(() => {
      process.env.CARD_REPORT_STARTED_AT = '2026-07-17T01:00:00.000Z'
      process.env.CARD_EXPECT_GUIDES_REPORTS = 'true'
      writeJson('packages/docs-tooling/src/lark/meta/reports/guides-incremental-fetch-plan.json', {
        generated_at: generatedAt,
        mode: 'incremental',
        build_env: 'uat',
        changed_tokens: [],
        expanded_tokens: [],
        removed_tokens: [],
        warnings: [],
      })

      const notes = collectNotes()

      assert.equal(notes.length, 1)
      assert.doesNotMatch(notes[0], /# Incremental Fetch Plan/)
      assert.match(notes[0], /# Guides reports unavailable/)
      assert.match(notes[0], /- Incremental fetch plan/)
    })
  })
}

test('generated_at remains optional when no valid run boundary is supplied', () => {
  withTempCwd(() => {
    delete process.env.CARD_REPORT_STARTED_AT
    assert.equal(isFreshGeneratedAt(undefined), true)
    process.env.CARD_REPORT_STARTED_AT = 'not-a-timestamp'
    assert.equal(isFreshGeneratedAt('not-a-timestamp'), true)
  })
})

test('collectNotes omits generated reports older than the current card run', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-09T11:05:28.000Z'
    writeJson('packages/docs-tooling/src/lark/meta/reports/guides-broken-content-links.json', {
      generated_at: '2026-07-08T14:24:27.205Z',
      source_dir: './packages/docs-tooling/src/lark/meta/sources/guides',
      summary: { broken_content_links: 137 },
      broken_content_links: [],
    })
    writeJson('packages/docs-tooling/src/lark/meta/reports/guides-canonical-link-audit.json', {
      generated_at: '2026-07-08T14:24:28.441Z',
      target: 'zilliz.saas',
      summary: { broken_references: 137 },
    })
    writeJson('packages/docs-tooling/src/lark/meta/reports/guides-incremental-fetch-plan.json', {
      generated_at: '2026-07-09T11:14:01.219Z',
      mode: 'incremental',
      build_env: 'uat',
      changed_tokens: ['changed'],
      expanded_tokens: ['changed'],
      removed_tokens: [],
      warnings: [],
    })

    const notes = collectNotes()

    assert.equal(notes.length, 1)
    assert.match(notes[0], /# Incremental Fetch Plan/)
    assert.doesNotMatch(notes.join('\n'), /Canonical Content Links Audit/)
    assert.doesNotMatch(notes.join('\n'), /Canonical Link Audit/)
  })
})

test('broken content link report is attached as canonical content links note', () => {
  withTempCwd(() => {
    process.env.CARD_REPORT_STARTED_AT = '2026-07-09T11:05:28.000Z'
    process.env.GITHUB_REPOSITORY = 'zilliztech/zdoc'
    process.env.GITHUB_SERVER_URL = 'https://github.com'
    process.env.CARD_REPORT_REF = 'c'.repeat(40)
    writeJson('packages/docs-tooling/src/lark/meta/reports/guides-broken-content-links.json', {
      generated_at: '2026-07-09T11:14:01.219Z',
      source_dir: './packages/docs-tooling/src/lark/meta/sources/guides',
      summary: {
        canonical_tokens: 370,
        scanned_sources: 369,
        skipped_noncanonical_sources: 98,
        content_links: 2089,
        broken_content_links: 1,
      },
      broken_content_links: [{
        source_title: 'Managed Volumes',
        link_text: 'Storage Cost',
        url: 'https://zilliverse.feishu.cn/wiki/Uj3wwkysGiBhfqk8jsMckyiTnBb',
      }],
    })

    const note = brokenContentLinksNote()

    assert.match(note, /# Canonical Content Links Audit/)
    assert.match(note, /- Content links: 2089/)
    assert.match(note, /- Broken content links: 1/)
    assert.match(note, /Managed Volumes: "Storage Cost"/)
    assert.match(note, /guides-canonical-link-audit\.md/)
    assert.match(note, /guides-canonical-link-audit\.csv/)
    assert.match(note, /guides-broken-content-links\.json/)
    assert.match(note, new RegExp(`github\\.com/zilliztech/zdoc/blob/${'c'.repeat(40)}/packages/docs-tooling/src/lark/meta/reports/guides-canonical-link-audit\\.md`))
  })
})

test('CLI writes bounded notes to a JSON file and exposes its absolute path', () => {
  withTempCwd((dir) => {
    const githubOutput = path.join(dir, 'github-output')
    const notesFile = path.join(dir, 'out', 'card-notes.json')
    const cli = path.join(__dirname, 'collect-build-card-notes.js')
    const result = spawnSync(process.execPath, [cli], {
      encoding: 'utf8',
      env: {
        ...process.env,
        GITHUB_OUTPUT: githubOutput,
        CARD_NOTES_FILE: notesFile,
        CARD_BASE_NOTES_JSON: JSON.stringify(['# Workflow summary', 'x'.repeat(13000)]),
      },
    })

    assert.equal(result.status, 0, result.stderr)
    const notes = JSON.parse(fs.readFileSync(notesFile, 'utf8'))
    assert.equal(notes.length, 2)
    assert.equal(notes[1].length, 12000)
    const output = fs.readFileSync(githubOutput, 'utf8')
    assert.match(output, new RegExp(`card_notes_file=${notesFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
    assert.match(output, /card_notes_json<<CARD_NOTES_JSON/)
    assert.match(output, /^guides_reports_found=$/m)
    assert.match(output, /^guides_reports_missing=$/m)
  })
})
