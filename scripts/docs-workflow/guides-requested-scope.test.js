'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { evaluateRequestedScope, normalizeRenderedPath } = require('./guides-requested-scope')

function writeFile(root, relative, contents = 'content') {
  const target = path.join(root, relative)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, contents)
}

function writeManifest(directory, { site = 'en', ownedPath, files, cleanup = false }) {
  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify({
    schemaVersion: 1,
    manual: 'guides',
    artifactType: 'table',
    site,
    id: `zilliz.saas:${path.basename(ownedPath)}`,
    table_id: 'tbl-1',
    table_name: 'Tutorials',
    table_slug: path.basename(ownedPath),
    target: 'zilliz.saas',
    target_name: 'saas',
    cleanup,
    ownedPath,
    files: files.map(file => ({ path: file, size: 1, sha256: '0'.repeat(64) })),
  }, null, 2))
  return directory
}

const STAGING_ROOT = 'tmp/docs-tooling/en/guides'
const PLAN = { selection_mode: 'requested', plan_sha256: 'p'.repeat(64), affected_tables: ['tbl-1'] }
const RECEIPT = { plan_sha256: 'p'.repeat(64), receipt_sha256: 'r'.repeat(64) }

test('normalizeRenderedPath maps staging render paths onto final content paths', () => {
  assert.equal(
    normalizeRenderedPath(`${STAGING_ROOT}/content/en/guides/tutorials/a.mdx`, 'en'),
    'content/en/guides/tutorials/a.mdx',
  )
  assert.equal(
    normalizeRenderedPath('tmp/docs-tooling/en/guides-byoc/content/en/byoc/tutorials/b.mdx', 'en'),
    'content/en/byoc/tutorials/b.mdx',
  )
  assert.equal(normalizeRenderedPath('tmp/other/place/a.mdx', 'en'), null)
})

test('evaluateRequestedScope accepts renders, owned deletions, and sidebars within the allowlist', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-scope-'))
  try {
    const baseline = path.join(directory, 'baseline')
    const candidate = path.join(directory, 'candidate')
    writeFile(baseline, 'content/en/guides/tutorials/a.mdx', 'old-a')
    writeFile(baseline, 'content/en/guides/tutorials/retired.mdx', 'retired')
    writeFile(baseline, 'generated/en/sidebars/guides.sidebar.js', 'old-sidebar')
    writeFile(baseline, 'content/en/guides/tutorials/untouched.mdx', 'stable')

    writeFile(candidate, 'content/en/guides/tutorials/a.mdx', 'new-a')
    writeFile(candidate, 'content/en/guides/tutorials/added.mdx', 'added')
    writeFile(candidate, 'content/en/guides/tutorials/untouched.mdx', 'stable')
    writeFile(candidate, 'generated/en/sidebars/guides.sidebar.js', 'new-sidebar')

    const artifact = writeManifest(path.join(directory, 'artifact'), {
      ownedPath: `${STAGING_ROOT}/content/en/guides/tutorials`,
      files: [
        `${STAGING_ROOT}/content/en/guides/tutorials/a.mdx`,
        `${STAGING_ROOT}/content/en/guides/tutorials/added.mdx`,
      ],
    })

    const receipt = evaluateRequestedScope({
      site: 'en',
      baselineRoot: baseline,
      candidateRoot: candidate,
      tableArtifactDirectories: [artifact],
      plan: PLAN,
      stateMergeReceipt: RECEIPT,
      generatedAt: '2026-09-09T00:00:00.000Z',
    })
    assert.equal(receipt.conclusion, 'within_scope')
    assert.deepEqual(receipt.changed.rendered.sort(), ['content/en/guides/tutorials/a.mdx', 'content/en/guides/tutorials/added.mdx'])
    assert.deepEqual(receipt.changed.deletions, ['content/en/guides/tutorials/retired.mdx'])
    assert.deepEqual(receipt.changed.sidebars, ['generated/en/sidebars/guides.sidebar.js'])
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('evaluateRequestedScope fails closed on out-of-allowlist content and undeclared deletions', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-scope-'))
  try {
    const baseline = path.join(directory, 'baseline')
    const candidate = path.join(directory, 'candidate')
    writeFile(baseline, 'content/en/guides/tutorials/a.mdx', 'old-a')
    writeFile(baseline, 'content/en/guides/independent/orphan.mdx', 'orphan')
    writeFile(candidate, 'content/en/guides/tutorials/a.mdx', 'new-a')
    writeFile(candidate, 'content/en/guides/hijack/smuggled.mdx', 'smuggled')

    const artifact = writeManifest(path.join(directory, 'artifact'), {
      ownedPath: `${STAGING_ROOT}/content/en/guides/tutorials`,
      files: [`${STAGING_ROOT}/content/en/guides/tutorials/a.mdx`],
    })

    assert.throws(
      () => evaluateRequestedScope({
        site: 'en',
        baselineRoot: baseline,
        candidateRoot: candidate,
        tableArtifactDirectories: [artifact],
        plan: PLAN,
        stateMergeReceipt: RECEIPT,
      }),
      error => error.name === 'RequestedScopeViolation'
        && error.code === 'CHECKPOINT_SCOPE_VIOLATION'
        && error.details.violations.some(violation => violation.kind === 'content_change_outside_table_renders' && violation.path === 'content/en/guides/hijack/smuggled.mdx')
        && error.details.violations.some(violation => violation.kind === 'undeclared_deletion' && violation.path === 'content/en/guides/independent/orphan.mdx'),
    )
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('evaluateRequestedScope rejects unbound receipts and site-mismatched artifacts', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-scope-'))
  try {
    const baseline = path.join(directory, 'baseline')
    const candidate = path.join(directory, 'candidate')
    fs.mkdirSync(path.join(baseline, 'content/en/guides'), { recursive: true })
    fs.mkdirSync(path.join(candidate, 'content/en/guides'), { recursive: true })

    assert.throws(
      () => evaluateRequestedScope({
        site: 'en',
        baselineRoot: baseline,
        candidateRoot: candidate,
        tableArtifactDirectories: [],
        plan: PLAN,
        stateMergeReceipt: { ...RECEIPT, plan_sha256: 'x'.repeat(64) },
      }),
      error => error.name === 'RequestedScopeViolation' && /not bound to the requested plan/.test(error.message),
    )

    const foreignArtifact = writeManifest(path.join(directory, 'artifact'), {
      site: 'zh-CN',
      ownedPath: 'tmp/docs-tooling/zh-CN/guides/content/zh-CN/guides/tutorials',
      files: [],
    })
    assert.throws(
      () => evaluateRequestedScope({
        site: 'en',
        baselineRoot: baseline,
        candidateRoot: candidate,
        tableArtifactDirectories: [foreignArtifact],
        plan: PLAN,
        stateMergeReceipt: RECEIPT,
      }),
      error => error.name === 'RequestedScopeViolation' && /does not match the requested scope site/.test(error.message),
    )
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})
