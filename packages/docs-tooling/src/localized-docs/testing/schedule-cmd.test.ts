// @vitest-environment node
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { sharedReceiptPath } from '../../shared-docs/core/handoff/source-state.ts'
import type {
  GitHubPrAdapter,
  GitHubPrCommit,
  GitHubPullRequestSummary,
} from '../adapters/github-pr.ts'
import { FakeDraftLlmProvider } from '../adapters/llm.ts'
import {
  parseScheduleArgs,
  runSchedule,
  type HistoricalEnReadRequest,
  type ScheduleSummaryFile,
} from '../commands/schedule.ts'
import type { VerifiedEnSnapshot } from '../core/draft.ts'
import { buildBaselineSections, computeChannelDigests, parseStructuredDocument } from '../core/sections.ts'
import { stripEnShell } from '../core/strip-en.ts'
import type { BaselineJson } from '../core/types.ts'
import { sha256Hex } from '../core/types.ts'

const REPO_ROOT = resolve(fileURLToPath(new URL('../../../../..', import.meta.url)))
const COMMIT_1 = '1'.repeat(40)
const COMMIT_2 = '2'.repeat(40)
const COMMIT_3 = '3'.repeat(40)
const MASTER_SHA = '9'.repeat(40)
const ZERO_LOCK = 'a'.repeat(40)

const tempDirs: string[] = []

afterEach(async () => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop()!
    await rm(dir, { recursive: true, force: true })
  }
})

async function makeTempDir(prefix = 'localized-schedule-test-'): Promise<string> {
  const dir = await realpath(await mkdtemp(join(tmpdir(), prefix)))
  tempDirs.push(dir)
  return dir
}

function makeEnMdx(title: string, body: string): string {
  return `---\ntitle: "${title}"\nslug: /${title.toLowerCase().replace(/\s+/g, '-')}\n---\n\n${body}`
}

async function writeVerifiedDevPage(
  devRoot: string,
  sharedPage: string,
  devCommit: string,
  rawMdx: string,
): Promise<VerifiedEnSnapshot> {
  const enRel = `content/en/guides/${sharedPage}.md`
  const manifestRel = sharedReceiptPath('guides', sharedPage)
  const fileSha = sha256Hex(rawMdx)
  const receipt = {
    schema_version: 1,
    page: sharedPage,
    token: `shared-${sharedPage}`,
    inputs: {
      milvus_docs: { repository: 'milvus-io/milvus-docs', current: ZERO_LOCK, next: ZERO_LOCK, files: [] },
      zdoc: { repository: 'zilliztech/zdoc', commit: MASTER_SHA, files: [] },
      dev: { commit: devCommit, files: [] },
      fetch: {
        navigation: sha256Hex('nav'),
        image_base_url: 'https://images.example.com',
      },
      tools: { zdoc: MASTER_SHA, md2md: '1.3.0' },
      images: [],
    },
    outputs: [
      {
        manual: 'guides',
        path: enRel,
        sha256: fileSha,
      },
    ],
    channel: null,
    notes: [],
  }
  await mkdir(dirname(join(devRoot, enRel)), { recursive: true })
  await writeFile(join(devRoot, enRel), rawMdx, 'utf8')
  await mkdir(dirname(join(devRoot, manifestRel)), { recursive: true })
  await writeFile(join(devRoot, manifestRel), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8')

  const stripped = stripEnShell(rawMdx, { file: enRel, page: sharedPage })
  if ('errors' in stripped) {
    throw new Error(`Invalid test EN mdx: ${stripped.errors[0].message}`)
  }
  return {
    rawMdx,
    stripped,
    provenance: {
      manual: 'guides',
      sharedPage,
      devCommit,
      enPath: enRel,
      manifestPath: manifestRel,
      fileSha256: fileSha,
      channels: computeChannelDigests(stripped.body),
      receiptChannel: null,
      provenanceMode: 'shared-receipt',
      verified: true,
      verificationErrors: [],
    },
  }
}

function createBaselineFromSnapshots(pageId: string, en: VerifiedEnSnapshot, zhSourceMd: string): BaselineJson {
  const parsedEn = parseStructuredDocument({ kind: 'en', text: en.stripped.body, isAlreadyStripped: true })
  const parsedZh = parseStructuredDocument({ kind: 'zh', text: zhSourceMd })
  if ('errors' in parsedEn || 'errors' in parsedZh) {
    throw new Error('Failed to parse baseline fixtures')
  }
  return {
    schema_version: 1,
    page_id: pageId,
    en_baseline: {
      manual: 'guides',
      shared_page: pageId,
      dev_commit: en.provenance.devCommit,
      en_path: en.provenance.enPath,
      manifest_path: en.provenance.manifestPath,
      file_sha256: en.provenance.fileSha256,
      channels: {
        current_sha256: en.provenance.channels.currentSha256,
        next_sha256: en.provenance.channels.nextSha256,
      },
    },
    zh_reviewed: {
      source_sha256: sha256Hex(zhSourceMd),
      reviewed_pr: 12,
      updated_at: '2026-11-20T00:00:00Z',
    },
    last_notified_en_sha: null,
    sections: buildBaselineSections(parsedEn.doc, parsedZh.doc),
  }
}

class FakeGitHubPrAdapter implements GitHubPrAdapter {
  nextPrNumber = 100
  commitSeq = 1
  prsByBranch = new Map<string, GitHubPullRequestSummary>()
  commitsByPr = new Map<number, GitHubPrCommit[]>()
  branchFiles = new Map<string, Map<string, string>>()
  branchHeads = new Map<string, string>()
  pushCalls: { headBranch: string; files: Record<string, string>; expectedHeadSha?: string | null }[] = []
  createCalls: { headBranch: string; title: string; body: string }[] = []
  updateCalls: { prNumber: number; title?: string; body: string }[] = []
  dispatchCalls: { workflowFile: string; ref: string; prNumber: number; sourceSha: string; baseSha: string; requestId: string }[] = []

  private nextSha(): string {
    const hex = String(this.commitSeq++).padStart(40, 'f')
    return hex.slice(-40)
  }

  async findOpenPrByBranch({ headBranch }: { repo: string; headBranch: string; baseBranch: string }) {
    return this.prsByBranch.get(headBranch) ?? null
  }

  async listPrCommits({ prNumber }: { repo: string; prNumber: number }) {
    return this.commitsByPr.get(prNumber) ?? []
  }

  async listPrComments() {
    return []
  }

  async readBranchFile({ ref, filePath }: { repo: string; ref: string; filePath: string }) {
    for (const [branch, pr] of this.prsByBranch.entries()) {
      if (pr.headSha === ref || branch === ref) {
        return this.branchFiles.get(branch)?.get(filePath) ?? null
      }
    }
    return null
  }

  async pushBranchFiles(input: {
    repo: string
    baseBranch: string
    headBranch: string
    expectedHeadSha?: string | null
    commitMessage: string
    files: Readonly<Record<string, string>>
  }) {
    const headSha = this.nextSha()
    this.branchHeads.set(input.headBranch, headSha)
    this.pushCalls.push({
      headBranch: input.headBranch,
      files: { ...input.files },
      expectedHeadSha: input.expectedHeadSha,
    })
    const fileMap = this.branchFiles.get(input.headBranch) ?? new Map<string, string>()
    for (const [k, v] of Object.entries(input.files)) {
      fileMap.set(k, v)
    }
    this.branchFiles.set(input.headBranch, fileMap)
    const existing = this.prsByBranch.get(input.headBranch)
    if (existing) {
      existing.headSha = headSha
      const commits = this.commitsByPr.get(existing.number) ?? []
      commits.push({ sha: headSha, authorLogin: 'github-actions[bot]', authorName: 'github-actions[bot]', isBot: true })
      this.commitsByPr.set(existing.number, commits)
    }
    return { headSha, baseSha: MASTER_SHA }
  }

  async createPr(input: {
    repo: string
    baseBranch: string
    headBranch: string
    title: string
    body: string
    labels?: readonly string[]
    draft?: boolean
  }) {
    const number = this.nextPrNumber++
    const headSha = this.branchHeads.get(input.headBranch) ?? this.nextSha()
    const pr: GitHubPullRequestSummary = {
      number,
      url: `https://github.com/${input.repo}/pull/${number}`,
      title: input.title,
      headRef: input.headBranch,
      headSha,
      baseRef: input.baseBranch,
      body: input.body,
      labels: [...(input.labels ?? [])],
      isDraft: Boolean(input.draft),
    }
    this.prsByBranch.set(input.headBranch, pr)
    this.commitsByPr.set(number, [
      { sha: headSha, authorLogin: 'github-actions[bot]', authorName: 'github-actions[bot]', isBot: true },
    ])
    this.createCalls.push({ headBranch: input.headBranch, title: input.title, body: input.body })
    return pr
  }

  async updatePr(input: { repo: string; prNumber: number; title?: string; body: string; addLabels?: readonly string[] }) {
    for (const pr of this.prsByBranch.values()) {
      if (pr.number === input.prNumber) {
        if (input.title) pr.title = input.title
        pr.body = input.body
        if (input.addLabels) pr.labels = [...new Set([...pr.labels, ...input.addLabels])]
        this.updateCalls.push({ prNumber: input.prNumber, title: input.title, body: input.body })
        return pr
      }
    }
    throw new Error(`PR #${input.prNumber} not found`)
  }

  async dispatchValidationWorkflow(input: {
    repo: string
    workflowFile: string
    ref: string
    prNumber: number
    sourceSha: string
    baseSha: string
    requestId: string
  }) {
    this.dispatchCalls.push(input)
    return { dispatched: true, requestId: input.requestId }
  }
}

async function seedGroupRoot(root: string): Promise<void> {
  await mkdir(join(root, 'pages'), { recursive: true })
  await writeFile(join(root, 'Variables.json'), `${JSON.stringify({ product_name: 'Zilliz Cloud' }, null, 2)}\n`, 'utf8')
}

describe('commands/schedule CLI argument parsing & empty-root handling', () => {
  it('parses valid flags and rejects unknown or missing required options', () => {
    const parsed = parseScheduleArgs([
      '--root',
      'localized-docs/zh-CN/guides',
      '--dev-root',
      '.zh-guides-dev',
      '--page',
      'delete-entities',
      '--dry-run',
      '--always-notify',
      '--out',
      'tmp/out',
    ])
    expect(parsed).toMatchObject({
      root: 'localized-docs/zh-CN/guides',
      devRoot: '.zh-guides-dev',
      page: 'delete-entities',
      dryRun: true,
      alwaysNotify: true,
      out: 'tmp/out',
      dispatchValidate: true,
    })

    expect(() => parseScheduleArgs([])).toThrow('--root is required')
    expect(() => parseScheduleArgs(['--root', 'r', '--bogus'])).toThrow('Unknown localized-docs schedule option')
  })

  it('exits 0 with empty summary and should_notify=false when root or pages/ does not exist or is empty', async () => {
    const work = await makeTempDir()
    const missingRoot = join(work, 'does-not-exist')
    const out1 = join(work, 'out1')
    const code1 = await runSchedule(
      { root: missingRoot, out: out1, now: '2026-11-27T00:00:00Z' },
      { write: () => {}, writeError: () => {}, repositoryRoot: REPO_ROOT },
    )
    expect(code1).toBe(0)
    const sum1 = JSON.parse(await readFile(join(out1, 'schedule-summary.json'), 'utf8')) as ScheduleSummaryFile
    expect(sum1.scanned_pages).toBe(0)
    expect(sum1.should_notify).toBe(false)

    // Existing root with empty pages/
    const emptyRoot = join(work, 'empty-group')
    await seedGroupRoot(emptyRoot)
    const out2 = join(work, 'out2')
    const code2 = await runSchedule(
      { root: emptyRoot, out: out2, now: '2026-11-27T00:00:00Z' },
      { write: () => {}, writeError: () => {}, repositoryRoot: REPO_ROOT },
    )
    expect(code2).toBe(0)
    const sum2 = JSON.parse(await readFile(join(out2, 'schedule-summary.json'), 'utf8')) as ScheduleSummaryFile
    expect(sum2.scanned_pages).toBe(0)
    expect(sum2.should_notify).toBe(false)
  })
})

describe('commands/schedule end-to-end orchestration (offline fake GitHub + fake LLM)', () => {
  it('opens a rolling PR, updates it on subsequent EN change, handles deferred silent skip & dual-diff notify once, and dispatches validation', async () => {
    const work = await makeTempDir()
    const root = join(work, 'localized-docs/zh-CN/guides')
    const devRoot = join(work, 'dev')
    await seedGroupRoot(root)

    const enV1Mdx = makeEnMdx('Delete Entities', '# Delete Entities\n\n## Overview {#overview}\n\nDelete by ID.\n\n## Limits {#limits}\n\nMax 100.\n')
    const enV2Mdx = makeEnMdx('Delete Entities', '# Delete Entities\n\n## Overview {#overview}\n\nDelete by ID or filter.\n\n## Limits {#limits}\n\nMax 100.\n')
    const enV3Mdx = makeEnMdx('Delete Entities', '# Delete Entities\n\n## Overview {#overview}\n\nDelete by ID or filter.\n\n## Limits {#limits}\n\nMax 500.\n')
    const zhV1 = '# 删除 Entity\n\n## 概述 {#overview}\n\n按 ID 删除。\n\n## 限制 {#limits}\n\n最多 100 条。\n'

    const snapV1 = await writeVerifiedDevPage(devRoot, 'delete-entities', COMMIT_1, enV1Mdx)
    const baselineV1 = createBaselineFromSnapshots('delete-entities', snapV1, zhV1)

    const pageDir = join(root, 'pages/delete-entities')
    await mkdir(pageDir, { recursive: true })
    await writeFile(
      join(pageDir, 'page.yaml'),
      'schema_version: 1\nmode: incremental\nen_source:\n  manual: guides\n  shared_page: delete-entities\n',
      'utf8',
    )
    await writeFile(join(pageDir, 'source.md'), zhV1, 'utf8')
    await writeFile(join(pageDir, '.baseline.json'), `${JSON.stringify(baselineV1, null, 2)}\n`, 'utf8')

    // Move dev to V2
    const snapV2 = await writeVerifiedDevPage(devRoot, 'delete-entities', COMMIT_2, enV2Mdx)
    const history = new Map<string, VerifiedEnSnapshot>([
      [COMMIT_1, snapV1],
      [COMMIT_2, snapV2],
    ])
    const enSnapshotReader = async (req: HistoricalEnReadRequest) => {
      const hit = history.get(req.devCommit)
      return hit ? { snapshot: hit } : { errors: [] }
    }

    const fakeGh = new FakeGitHubPrAdapter()
    const llm = new FakeDraftLlmProvider()

    // 1) First run: opens rolling PR + dispatches localized-docs-validate.yml
    const out1 = join(work, 'out1')
    const code1 = await runSchedule(
      { root, devRoot, out: out1, localeContractRoot: REPO_ROOT, now: '2026-11-27T00:00:00Z' },
      { write: () => {}, writeError: () => {}, repositoryRoot: work, githubAdapter: fakeGh, llmProvider: llm, enSnapshotReader },
    )
    expect(code1).toBe(0)
    expect(fakeGh.createCalls).toHaveLength(1)
    expect(fakeGh.createCalls[0].headBranch).toBe('translate/zh-guides-delete-entities')
    expect(fakeGh.dispatchCalls).toHaveLength(1)
    expect(fakeGh.dispatchCalls[0].workflowFile).toBe('localized-docs-validate.yml')
    const sum1 = JSON.parse(await readFile(join(out1, 'schedule-summary.json'), 'utf8')) as ScheduleSummaryFile
    expect(sum1.prs).toHaveLength(1)
    expect(sum1.prs[0].action).toBe('opened')
    expect(sum1.should_notify).toBe(true)

    // 2) Add `deferred` label to PR, re-run with SAME EN V2 -> silent skip, ZERO writes, should_notify=false!
    const pr = fakeGh.prsByBranch.get('translate/zh-guides-delete-entities')!
    pr.labels.push('deferred')
    const out2 = join(work, 'out2')
    const code2 = await runSchedule(
      { root, devRoot, out: out2, localeContractRoot: REPO_ROOT, now: '2026-11-27T01:00:00Z' },
      { write: () => {}, writeError: () => {}, repositoryRoot: work, githubAdapter: fakeGh, llmProvider: llm, enSnapshotReader },
    )
    expect(code2).toBe(0)
    expect(fakeGh.pushCalls).toHaveLength(1)
    expect(fakeGh.updateCalls).toHaveLength(0)
    const sum2 = JSON.parse(await readFile(join(out2, 'schedule-summary.json'), 'utf8')) as ScheduleSummaryFile
    expect(sum2.should_notify).toBe(false)
    expect(sum2.skipped_pages).toEqual([{ pageId: 'delete-entities', reason: 'deferred-no-new-en-change' }])

    // 3) Advance dev to V3 -> updates deferred PR with dual diff and notifies ONCE
    const snapV3 = await writeVerifiedDevPage(devRoot, 'delete-entities', COMMIT_3, enV3Mdx)
    history.set(COMMIT_3, snapV3)
    const out3 = join(work, 'out3')
    const code3 = await runSchedule(
      { root, devRoot, out: out3, localeContractRoot: REPO_ROOT, now: '2026-11-28T00:00:00Z' },
      { write: () => {}, writeError: () => {}, repositoryRoot: work, githubAdapter: fakeGh, llmProvider: llm, enSnapshotReader },
    )
    expect(code3).toBe(0)
    expect(fakeGh.createCalls).toHaveLength(1) // Still at most 1 rolling PR!
    expect(fakeGh.updateCalls).toHaveLength(1)
    expect(fakeGh.updateCalls[0].body).toContain('自暂缓后新变化')
    expect(fakeGh.updateCalls[0].body).toContain('自上次合入累计变化')
    expect(fakeGh.dispatchCalls).toHaveLength(2)
    const sum3 = JSON.parse(await readFile(join(out3, 'schedule-summary.json'), 'utf8')) as ScheduleSummaryFile
    expect(sum3.deferred).toHaveLength(1)
    expect(sum3.deferred[0].kind).toBe('new-en-changes')
    expect(sum3.deferred[0].changesSinceDeferred?.changedSections).toEqual(['limits'])
    expect(sum3.deferred[0].cumulativeChangesSinceMerge?.changedSections).toEqual(['overview', 'limits'])
    const note3 = await readFile(join(out3, 'digest-note.md'), 'utf8')
    expect(note3).toContain('自暂缓后新变化')
    expect(note3).toContain('自上次合入累计变化')

    // 4) Run AGAIN on V3 -> silently skips (notified once!)
    const out4 = join(work, 'out4')
    const code4 = await runSchedule(
      { root, devRoot, out: out4, localeContractRoot: REPO_ROOT, now: '2026-11-29T00:00:00Z' },
      { write: () => {}, writeError: () => {}, repositoryRoot: work, githubAdapter: fakeGh, llmProvider: llm, enSnapshotReader },
    )
    expect(code4).toBe(0)
    expect(fakeGh.updateCalls).toHaveLength(1)
    const sum4 = JSON.parse(await readFile(join(out4, 'schedule-summary.json'), 'utf8')) as ScheduleSummaryFile
    expect(sum4.should_notify).toBe(false)
  })

  it('pauses automated write on overlapping human edit without overwriting, and handles manual dedup, paused, baseline-missing-error, and --dry-run', async () => {
    const work = await makeTempDir()
    const root = join(work, 'localized-docs/zh-CN/guides')
    const devRoot = join(work, 'dev')
    await seedGroupRoot(root)

    // Page 1: incremental with active PR + overlapping human edit
    const enConflictV1 = makeEnMdx('Conflict Page', '# Conflict Page\n\n## Limits {#limits}\n\nMax 10.\n')
    const enConflictV2 = makeEnMdx('Conflict Page', '# Conflict Page\n\n## Limits {#limits}\n\nMax 20.\n')
    const enConflictV3 = makeEnMdx('Conflict Page', '# Conflict Page\n\n## Limits {#limits}\n\nMax 30.\n')
    const zhConflictV1 = '# 冲突页\n\n## 限制 {#limits}\n\n最多 10。\n'
    const zhConflictBotV2 = '# 冲突页\n\n## 限制 {#limits}\n\n最多 20。\n'
    const zhConflictHumanV2 = '# 冲突页\n\n## 限制 {#limits}\n\n人工精修：单集群最多 20。\n'

    const cSnapV1 = await writeVerifiedDevPage(devRoot, 'conflict-page', COMMIT_1, enConflictV1)
    const cSnapV2 = await writeVerifiedDevPage(devRoot, 'conflict-page', COMMIT_2, enConflictV2)
    const cSnapV3 = await writeVerifiedDevPage(devRoot, 'conflict-page', COMMIT_3, enConflictV3)
    const cBaseV1 = createBaselineFromSnapshots('conflict-page', cSnapV1, zhConflictV1)
    const cBaseV2Pr = createBaselineFromSnapshots('conflict-page', cSnapV2, zhConflictBotV2)

    await mkdir(join(root, 'pages/conflict-page'), { recursive: true })
    await writeFile(
      join(root, 'pages/conflict-page/page.yaml'),
      'schema_version: 1\nmode: incremental\nen_source:\n  manual: guides\n  shared_page: conflict-page\n',
      'utf8',
    )
    await writeFile(join(root, 'pages/conflict-page/source.md'), zhConflictV1, 'utf8')
    await writeFile(join(root, 'pages/conflict-page/.baseline.json'), `${JSON.stringify(cBaseV1, null, 2)}\n`, 'utf8')

    // Page 2: manual with notify_on_en_change: true
    const enManualV1 = makeEnMdx('Region Guide', '# Region Guide\n\n## Regions {#regions}\n\nUS East.\n')
    const enManualV2 = makeEnMdx('Region Guide', '# Region Guide\n\n## Regions {#regions}\n\nUS East and EU.\n')
    const zhManual = '# 地域指南\n\n## 地域 {#regions}\n\n中国大陆地域。\n'
    const mSnapV1 = await writeVerifiedDevPage(devRoot, 'region-guide', COMMIT_1, enManualV1)
    const mSnapV2 = await writeVerifiedDevPage(devRoot, 'region-guide', COMMIT_2, enManualV2)
    const mBaseV1 = createBaselineFromSnapshots('region-guide', mSnapV1, zhManual)

    await mkdir(join(root, 'pages/region-guide'), { recursive: true })
    await writeFile(
      join(root, 'pages/region-guide/page.yaml'),
      'schema_version: 1\nmode: manual\nnotify_on_en_change: true\nen_source:\n  manual: guides\n  shared_page: region-guide\n',
      'utf8',
    )
    await writeFile(join(root, 'pages/region-guide/source.md'), zhManual, 'utf8')
    await writeFile(join(root, 'pages/region-guide/.baseline.json'), `${JSON.stringify(mBaseV1, null, 2)}\n`, 'utf8')

    // Page 3: paused
    await mkdir(join(root, 'pages/paused-page'), { recursive: true })
    await writeFile(
      join(root, 'pages/paused-page/page.yaml'),
      'schema_version: 1\nmode: paused\npause_reason: "Later"\nen_source:\n  manual: guides\n  shared_page: paused-page\n',
      'utf8',
    )

    // Page 4: baseline-missing-error (has source.md, NO .baseline.json)
    await mkdir(join(root, 'pages/missing-baseline'), { recursive: true })
    await writeFile(
      join(root, 'pages/missing-baseline/page.yaml'),
      'schema_version: 1\nmode: incremental\nen_source:\n  manual: guides\n  shared_page: missing-baseline\n',
      'utf8',
    )
    await writeFile(join(root, 'pages/missing-baseline/source.md'), '# 缺少基线\n\n正文。\n', 'utf8')

    // Seed fake GitHub with an active PR for conflict-page containing a human commit
    const fakeGh = new FakeGitHubPrAdapter()
    const conflictBranch = 'translate/zh-guides-conflict-page'
    const humanHeadSha = 'e'.repeat(40)
    fakeGh.prsByBranch.set(conflictBranch, {
      number: 88,
      url: 'https://github.com/zilliztech/zdoc/pull/88',
      title: 'docs(zh-CN): update conflict-page',
      headRef: conflictBranch,
      headSha: humanHeadSha,
      baseRef: 'master',
      body: '',
      labels: ['zh-cn-guides-translation'],
      isDraft: false,
    })
    fakeGh.commitsByPr.set(88, [
      { sha: 'd'.repeat(40), authorLogin: 'github-actions[bot]', authorName: 'github-actions[bot]', isBot: true },
      { sha: humanHeadSha, authorLogin: 'human-writer', authorName: 'Human Writer', isBot: false },
    ])
    fakeGh.branchFiles.set(
      conflictBranch,
      new Map([
        ['localized-docs/zh-CN/guides/pages/conflict-page/source.md', zhConflictHumanV2],
        ['localized-docs/zh-CN/guides/pages/conflict-page/.baseline.json', JSON.stringify(cBaseV2Pr)],
      ]),
    )

    const enSnapshotReader = async (req: HistoricalEnReadRequest) => {
      if (req.sharedPage === 'conflict-page') {
        if (req.devCommit === COMMIT_1) return { snapshot: cSnapV1 }
        if (req.devCommit === COMMIT_2) return { snapshot: cSnapV2 }
        if (req.devCommit === COMMIT_3) return { snapshot: cSnapV3 }
      }
      if (req.sharedPage === 'region-guide') {
        if (req.devCommit === COMMIT_1) return { snapshot: mSnapV1 }
        if (req.devCommit === COMMIT_2) return { snapshot: mSnapV2 }
      }
      return { errors: [] }
    }

    const stateFile = join(work, 'manual-state.json')
    const llm = new FakeDraftLlmProvider()

    // First: --dry-run must perform ZERO writes (no push, no PR mutation, no stateFile write)
    const outDry = join(work, 'out-dry')
    const dryCode = await runSchedule(
      { root, devRoot, out: outDry, dryRun: true, manualStateFile: stateFile, localeContractRoot: REPO_ROOT, now: '2026-11-27T00:00:00Z' },
      { write: () => {}, writeError: () => {}, repositoryRoot: work, githubAdapter: fakeGh, llmProvider: llm, enSnapshotReader },
    )
    expect(dryCode).toBe(0)
    expect(fakeGh.pushCalls).toHaveLength(0)
    expect(fakeGh.createCalls).toHaveLength(0)
    expect(fakeGh.updateCalls).toHaveLength(0)
    expect(fakeGh.dispatchCalls).toHaveLength(0)
    await expect(readFile(stateFile, 'utf8')).rejects.toThrow()

    // Second: live run (conflict-page paused without overwrite, region-guide notified & dedup recorded, paused skipped, missing-baseline blocked)
    const outLive1 = join(work, 'out-live-1')
    const liveCode1 = await runSchedule(
      {
        root,
        devRoot,
        out: outLive1,
        dryRun: false,
        manualStateFile: stateFile,
        updateManualBaselines: true,
        localeContractRoot: REPO_ROOT,
        now: '2026-11-27T00:00:00Z',
      },
      { write: () => {}, writeError: () => {}, repositoryRoot: work, githubAdapter: fakeGh, llmProvider: llm, enSnapshotReader },
    )
    expect(liveCode1).toBe(0)
    expect(fakeGh.pushCalls).toHaveLength(0) // Human conflict NOT overwritten, missing-baseline NOT opened!
    expect(fakeGh.createCalls).toHaveLength(0)
    expect(fakeGh.updateCalls).toHaveLength(0)
    // Verify human-edited content on PR branch is completely untouched
    expect(
      fakeGh.branchFiles.get(conflictBranch)?.get('localized-docs/zh-CN/guides/pages/conflict-page/source.md'),
    ).toBe(zhConflictHumanV2)

    const sumLive1 = JSON.parse(await readFile(join(outLive1, 'schedule-summary.json'), 'utf8')) as ScheduleSummaryFile
    expect(sumLive1.scanned_pages).toBe(4)
    expect(sumLive1.skipped_pages).toEqual([{ pageId: 'paused-page', reason: 'paused' }])
    expect(sumLive1.manual.map(m => m.pageId)).toEqual(['region-guide'])
    expect(sumLive1.blocked.map(b => `${b.pageId}:${b.reason}`).sort()).toEqual([
      'conflict-page:conflict-paused',
      'missing-baseline:baseline-missing-error',
    ])

    // Verify last_notified_en_sha persisted in .baseline.json AND state file
    const updatedManualBaseline = JSON.parse(
      await readFile(join(root, 'pages/region-guide/.baseline.json'), 'utf8'),
    ) as BaselineJson
    expect(updatedManualBaseline.last_notified_en_sha).toBe(mSnapV2.provenance.fileSha256)

    // Third: run again filtered to region-guide -> deduplicated, skipped, should_notify=false!
    const outLive2 = join(work, 'out-live-2')
    const liveCode2 = await runSchedule(
      {
        root,
        devRoot,
        page: 'region-guide',
        out: outLive2,
        dryRun: false,
        manualStateFile: stateFile,
        localeContractRoot: REPO_ROOT,
        now: '2026-11-28T00:00:00Z',
      },
      { write: () => {}, writeError: () => {}, repositoryRoot: work, githubAdapter: fakeGh, llmProvider: llm, enSnapshotReader },
    )
    expect(liveCode2).toBe(0)
    const sumLive2 = JSON.parse(await readFile(join(outLive2, 'schedule-summary.json'), 'utf8')) as ScheduleSummaryFile
    expect(sumLive2.manual).toHaveLength(0)
    expect(sumLive2.skipped_pages).toEqual([{ pageId: 'region-guide', reason: 'manual-already-notified' }])
    expect(sumLive2.should_notify).toBe(false)
  })

  it('preserves disjoint human edits on an active PR and blocks pages with missing EN SharedReceipt provenance', async () => {
    const work = await makeTempDir()
    const root = join(work, 'localized-docs/zh-CN/guides')
    const devRoot = join(work, 'dev')
    await seedGroupRoot(root)

    // Page A: active PR has human edit in #overview while EN only changed #limits -> preserves human #overview verbatim!
    const enV1 = makeEnMdx('Disjoint Page', '# Disjoint Page\n\n## Overview {#overview}\n\nIntro v1.\n\n## Limits {#limits}\n\nMax 10.\n')
    const enV2 = makeEnMdx('Disjoint Page', '# Disjoint Page\n\n## Overview {#overview}\n\nIntro v2.\n\n## Limits {#limits}\n\nMax 10.\n')
    const enV3 = makeEnMdx('Disjoint Page', '# Disjoint Page\n\n## Overview {#overview}\n\nIntro v2.\n\n## Limits {#limits}\n\nMax 99.\n')
    const zhV1 = '# 分离页\n\n## 概述 {#overview}\n\n简介 v1。\n\n## 限制 {#limits}\n\n最多 10。\n'
    const zhBotV2 = '# 分离页\n\n## 概述 {#overview}\n\n简介 v2。\n\n## 限制 {#limits}\n\n最多 10。\n'
    const zhHumanOverview = '# 分离页\n\n## 概述 {#overview}\n\n人工精修的独特中文概述。\n\n## 限制 {#limits}\n\n最多 10。\n'

    const snapV1 = await writeVerifiedDevPage(devRoot, 'disjoint-page', COMMIT_1, enV1)
    const snapV2 = await writeVerifiedDevPage(devRoot, 'disjoint-page', COMMIT_2, enV2)
    const snapV3 = await writeVerifiedDevPage(devRoot, 'disjoint-page', COMMIT_3, enV3)
    const baseV1 = createBaselineFromSnapshots('disjoint-page', snapV1, zhV1)
    const baseV2Pr = createBaselineFromSnapshots('disjoint-page', snapV2, zhBotV2)

    await mkdir(join(root, 'pages/disjoint-page'), { recursive: true })
    await writeFile(
      join(root, 'pages/disjoint-page/page.yaml'),
      'schema_version: 1\nmode: incremental\nen_source:\n  manual: guides\n  shared_page: disjoint-page\n',
      'utf8',
    )
    await writeFile(join(root, 'pages/disjoint-page/source.md'), zhV1, 'utf8')
    await writeFile(join(root, 'pages/disjoint-page/.baseline.json'), `${JSON.stringify(baseV1, null, 2)}\n`, 'utf8')

    // Page B: pending-initial-translation with NO EN SharedReceipt in devRoot -> blocked as en-provenance-invalid!
    await mkdir(join(root, 'pages/unverified-page'), { recursive: true })
    await writeFile(
      join(root, 'pages/unverified-page/page.yaml'),
      'schema_version: 1\nmode: incremental\nen_source:\n  manual: guides\n  shared_page: unverified-page\n',
      'utf8',
    )

    const fakeGh = new FakeGitHubPrAdapter()
    const branch = 'translate/zh-guides-disjoint-page'
    const humanHead = '7'.repeat(40)
    fakeGh.prsByBranch.set(branch, {
      number: 91,
      url: 'https://github.com/zilliztech/zdoc/pull/91',
      title: 'docs(zh-CN): update disjoint-page',
      headRef: branch,
      headSha: humanHead,
      baseRef: 'master',
      body: '',
      labels: ['zh-cn-guides-translation'],
      isDraft: false,
    })
    fakeGh.commitsByPr.set(91, [
      { sha: '6'.repeat(40), authorLogin: 'github-actions[bot]', authorName: 'github-actions[bot]', isBot: true },
      { sha: humanHead, authorLogin: 'alice-tw', authorName: 'Alice', isBot: false },
    ])
    fakeGh.branchFiles.set(
      branch,
      new Map([
        ['localized-docs/zh-CN/guides/pages/disjoint-page/source.md', zhHumanOverview],
        ['localized-docs/zh-CN/guides/pages/disjoint-page/.baseline.json', JSON.stringify(baseV2Pr)],
      ]),
    )

    const enSnapshotReader = async (req: HistoricalEnReadRequest) => {
      if (req.sharedPage === 'disjoint-page') {
        if (req.devCommit === COMMIT_1) return { snapshot: snapV1 }
        if (req.devCommit === COMMIT_2) return { snapshot: snapV2 }
        if (req.devCommit === COMMIT_3) return { snapshot: snapV3 }
      }
      return { errors: [] }
    }

    const out = join(work, 'out')
    const code = await runSchedule(
      { root, devRoot, out, localeContractRoot: REPO_ROOT, now: '2026-11-27T00:00:00Z' },
      {
        write: () => {},
        writeError: () => {},
        repositoryRoot: work,
        githubAdapter: fakeGh,
        llmProvider: new FakeDraftLlmProvider(),
        enSnapshotReader,
      },
    )
    expect(code).toBe(0)
    expect(fakeGh.pushCalls).toHaveLength(1)
    const pushedSource = fakeGh.pushCalls[0].files['localized-docs/zh-CN/guides/pages/disjoint-page/source.md']
    expect(pushedSource).toContain('人工精修的独特中文概述。')
    const summary = JSON.parse(await readFile(join(out, 'schedule-summary.json'), 'utf8')) as ScheduleSummaryFile
    expect(summary.prs).toHaveLength(1)
    expect(summary.prs[0]).toMatchObject({ pageId: 'disjoint-page', action: 'updated', prNumber: 91 })
    expect(summary.blocked).toEqual([
      expect.objectContaining({ pageId: 'unverified-page', reason: 'en-provenance-invalid' }),
    ])
  })
})
