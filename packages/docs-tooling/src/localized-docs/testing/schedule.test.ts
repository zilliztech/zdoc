// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { VerifiedEnSnapshot } from '../core/draft.ts'
import {
  appendScheduleMetaToPrBody,
  detectActivePrHumanConflict,
  isTranslationBranch,
  parseDeferredReviewDate,
  parseSchedulePrMeta,
  planPageSchedule,
  renderDailyDigestCardNote,
  renderDeferredDualDiffSection,
  serializeSchedulePrMeta,
  translationBranchName,
  type ActivePrState,
  type ScheduleRunSummary,
} from '../core/schedule.ts'
import { buildBaselineSections, computeChannelDigests, parseStructuredDocument } from '../core/sections.ts'
import { stripEnShell } from '../core/strip-en.ts'
import type { BaselineJson, PageConfig } from '../core/types.ts'
import { sha256Hex } from '../core/types.ts'

const COMMIT_1 = '1'.repeat(40)
const COMMIT_2 = '2'.repeat(40)
const COMMIT_3 = '3'.repeat(40)

function makeEnSnapshot(body: string, devCommit: string, sharedPage = 'delete-entities'): VerifiedEnSnapshot {
  const rawMdx = `---\ntitle: "Delete Entities"\nslug: /delete-entities\n---\n\n${body}`
  const strippedRes = stripEnShell(rawMdx, { file: `content/en/guides/${sharedPage}.md`, page: sharedPage })
  if ('errors' in strippedRes) {
    throw new Error(`Unexpected strip error: ${strippedRes.errors[0].message}`)
  }
  return {
    rawMdx,
    stripped: strippedRes,
    provenance: {
      manual: 'guides',
      sharedPage,
      devCommit,
      enPath: `content/en/guides/${sharedPage}.md`,
      manifestPath: `generated/en/manifests/shared-pages/guides/${sharedPage}.json`,
      fileSha256: sha256Hex(rawMdx),
      channels: computeChannelDigests(strippedRes.body),
      receiptChannel: null,
      provenanceMode: 'shared-receipt',
      verified: true,
      verificationErrors: [],
    },
  }
}

function makeBaseline(en: VerifiedEnSnapshot, zhSourceMd: string, pageId = 'delete-entities'): BaselineJson {
  const parsedEn = parseStructuredDocument({ kind: 'en', text: en.stripped.body, isAlreadyStripped: true })
  const parsedZh = parseStructuredDocument({ kind: 'zh', text: zhSourceMd })
  if ('errors' in parsedEn || 'errors' in parsedZh) {
    throw new Error('Failed to parse fixture docs for baseline')
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
      reviewed_pr: 101,
      updated_at: '2026-11-20T00:00:00Z',
    },
    last_notified_en_sha: null,
    sections: buildBaselineSections(parsedEn.doc, parsedZh.doc),
  }
}

function makeConfig(mode: PageConfig['mode'], extra: Partial<PageConfig> = {}): PageConfig {
  return {
    schema_version: 1,
    mode,
    en_source: { manual: 'guides', shared_page: 'delete-entities' },
    ...extra,
  }
}

describe('core/schedule branch naming & metadata helpers', () => {
  it('derives and validates controlled translate/zh-guides-* branch names', () => {
    expect(translationBranchName('delete-entities')).toBe('translate/zh-guides-delete-entities')
    expect(isTranslationBranch('translate/zh-guides-delete-entities')).toBe(true)
    expect(isTranslationBranch('master')).toBe(false)
    expect(isTranslationBranch('dev')).toBe(false)
    expect(isTranslationBranch('translate/zh-guides-../master')).toBe(false)
    expect(isTranslationBranch('translate/zh-guides-active')).toBe(false)
    expect(() => translationBranchName('Bad_Page')).toThrow()
  })

  it('round-trips schedule metadata in PR bodies without corrupting review-todos markers', () => {
    const body = [
      '<!-- localized-docs:review-todos:start -->',
      '- [ ] Check term',
      '<!-- localized-docs:review-todos:end -->',
    ].join('\n')
    const meta = {
      schema_version: 1 as const,
      page_id: 'delete-entities',
      target_en_sha: 'a'.repeat(64),
      target_en_commit: COMMIT_2,
      base_en_sha: 'b'.repeat(64),
      base_en_commit: COMMIT_1,
      deferred_at_en_sha: null,
      deferred_at_en_commit: null,
      last_bot_head_sha: COMMIT_3,
    }
    const updated = appendScheduleMetaToPrBody(body, meta)
    expect(updated).toContain('<!-- localized-docs:review-todos:start -->')
    expect(updated).toContain('<!-- localized-docs:review-todos:end -->')
    expect(parseSchedulePrMeta(updated)).toEqual(meta)

    // Re-appending replaces the old marker rather than duplicating it
    const updated2 = appendScheduleMetaToPrBody(updated, { ...meta, target_en_commit: COMMIT_3 })
    expect(updated2.match(/localized-docs:schedule-meta:/g)?.length).toBe(1)
    expect(parseSchedulePrMeta(updated2)?.target_en_commit).toBe(COMMIT_3)
    expect(parseSchedulePrMeta('no meta here')).toBeNull()
    expect(parseSchedulePrMeta(serializeSchedulePrMeta({ ...meta, target_en_sha: 'not-a-sha' }))).toBeNull()
  })

  it('extracts optional deferred review_after dates from PR body or comments', () => {
    expect(parseDeferredReviewDate(['Waiting on product.\n复核日期：2026-12-05'])).toBe('2026-12-05')
    expect(parseDeferredReviewDate(['review_after: 2026-11-30'])).toBe('2026-11-30')
    expect(parseDeferredReviewDate(['no date here'])).toBeNull()
  })
})

describe('core/schedule planPageSchedule & conflict detection', () => {
  const enV1 = makeEnSnapshot(
    '# Delete Entities\n\n## Overview {#overview}\n\nDelete by ID.\n\n## Limits {#limits}\n\nMax 100.\n',
    COMMIT_1,
  )
  const enV2 = makeEnSnapshot(
    '# Delete Entities\n\n## Overview {#overview}\n\nDelete by ID or filter.\n\n## Limits {#limits}\n\nMax 100.\n',
    COMMIT_2,
  )
  const enV3 = makeEnSnapshot(
    '# Delete Entities\n\n## Overview {#overview}\n\nDelete by ID or filter.\n\n## Limits {#limits}\n\nMax 500.\n',
    COMMIT_3,
  )
  const zhV1 =
    '# 删除 Entity\n\n## 概述 {#overview}\n\n按 ID 删除。\n\n## 限制 {#limits}\n\n最多 100 条。\n'
  const zhV2Bot =
    '# 删除 Entity\n\n## 概述 {#overview}\n\n按 ID 或过滤表达式删除。\n\n## 限制 {#limits}\n\n最多 100 条。\n'
  const baselineV1 = makeBaseline(enV1, zhV1)
  const baselineV2Pr = makeBaseline(enV2, zhV2Bot)

  it('silently skips paused pages and manual pages with notifications disabled', () => {
    const paused = planPageSchedule({
      pageId: 'delete-entities',
      pageConfig: makeConfig('paused', { pause_reason: 'Not launched in CN' }),
      lifecycleState: 'paused',
      baseline: null,
      newEn: enV2,
      activePr: null,
      repo: 'zilliztech/zdoc',
      baseBranch: 'master',
      nowIso: '2026-11-27T00:00:00Z',
    })
    expect(paused.action).toBe('skip-paused')

    const silentManual = planPageSchedule({
      pageId: 'delete-entities',
      pageConfig: makeConfig('manual', { notify_on_en_change: false }),
      lifecycleState: 'ready',
      baseline: baselineV1,
      newEn: enV2,
      activePr: null,
      repo: 'zilliztech/zdoc',
      baseBranch: 'master',
      nowIso: '2026-11-27T00:00:00Z',
    })
    expect(silentManual.action).toBe('skip-manual-silent')
  })

  it('blocks baseline-missing-error and unverified EN provenance without opening a PR', () => {
    const missingBaseline = planPageSchedule({
      pageId: 'delete-entities',
      pageConfig: makeConfig('incremental'),
      lifecycleState: 'baseline-missing-error',
      baseline: null,
      newEn: enV2,
      activePr: null,
      repo: 'zilliztech/zdoc',
      baseBranch: 'master',
      nowIso: '2026-11-27T00:00:00Z',
    })
    expect(missingBaseline.action).toBe('blocked')
    if (missingBaseline.action === 'blocked') {
      expect(missingBaseline.reason).toBe('baseline-missing-error')
    }

    const unverifiedEn = planPageSchedule({
      pageId: 'delete-entities',
      pageConfig: makeConfig('incremental'),
      lifecycleState: 'ready',
      baseline: baselineV1,
      newEn: null,
      activePr: null,
      repo: 'zilliztech/zdoc',
      baseBranch: 'master',
      nowIso: '2026-11-27T00:00:00Z',
    })
    expect(unverifiedEn.action).toBe('blocked')
    if (unverifiedEn.action === 'blocked') {
      expect(unverifiedEn.reason).toBe('en-provenance-invalid')
    }
  })

  it('notifies manual pages with EN diff link & master source.md path and deduplicates by last_notified_en_sha', () => {
    const first = planPageSchedule({
      pageId: 'delete-entities',
      pageConfig: makeConfig('manual', { notify_on_en_change: true }),
      lifecycleState: 'ready',
      baseline: baselineV1,
      newEn: enV2,
      masterBaseEn: enV1,
      activePr: null,
      repo: 'zilliztech/zdoc',
      baseBranch: 'master',
      nowIso: '2026-11-27T00:00:00Z',
    })
    expect(first.action).toBe('notify-manual')
    if (first.action === 'notify-manual') {
      expect(first.enDiffUrl).toBe(`https://github.com/zilliztech/zdoc/compare/${COMMIT_1}...${COMMIT_2}`)
      expect(first.zhSourcePath).toBe('localized-docs/zh-CN/guides/pages/delete-entities/source.md')
      expect(first.zhSourceUrl).toBe(
        'https://github.com/zilliztech/zdoc/blob/master/localized-docs/zh-CN/guides/pages/delete-entities/source.md',
      )
      expect(first.changedSections).toEqual(['overview'])
      expect(first.updatedBaseline.last_notified_en_sha).toBe(enV2.provenance.fileSha256)

      // Repeated run with updated baseline skips
      const second = planPageSchedule({
        pageId: 'delete-entities',
        pageConfig: makeConfig('manual', { notify_on_en_change: true }),
        lifecycleState: 'ready',
        baseline: first.updatedBaseline,
        newEn: enV2,
        masterBaseEn: enV1,
        activePr: null,
        repo: 'zilliztech/zdoc',
        baseBranch: 'master',
        nowIso: '2026-11-27T00:00:00Z',
      })
      expect(second.action).toBe('skip-manual-already-notified')
    }
  })

  it('silently skips deferred PR when EN SHA matches, emits due reminder when reviewAfter reached, and produces dual diff on new EN change', () => {
    const deferredPr: ActivePrState = {
      number: 55,
      url: 'https://github.com/zilliztech/zdoc/pull/55',
      title: 'docs(zh-CN): update delete-entities',
      headRef: 'translate/zh-guides-delete-entities',
      headSha: 'c'.repeat(40),
      baseRef: 'master',
      body: '',
      labels: ['zh-cn-guides-translation', 'deferred'],
      commits: [{ sha: 'c'.repeat(40), isBot: true, authorLogin: 'github-actions[bot]' }],
      prTargetEnSha: enV2.provenance.fileSha256,
      prTargetEnCommit: COMMIT_2,
      prSourceMdText: zhV2Bot,
      prBaseline: baselineV2Pr,
      deferredReviewAfter: '2026-12-01',
    }

    // Same EN SHA before due date -> silent skip
    const skip = planPageSchedule({
      pageId: 'delete-entities',
      pageConfig: makeConfig('incremental'),
      lifecycleState: 'ready',
      baseline: baselineV1,
      newEn: enV2,
      masterBaseEn: enV1,
      prBaseEn: enV2,
      activePr: deferredPr,
      repo: 'zilliztech/zdoc',
      baseBranch: 'master',
      nowIso: '2026-11-27T00:00:00Z',
    })
    expect(skip.action).toBe('skip-deferred-unchanged')

    // Same EN SHA on/after due date -> due reminder
    const due = planPageSchedule({
      pageId: 'delete-entities',
      pageConfig: makeConfig('incremental'),
      lifecycleState: 'ready',
      baseline: baselineV1,
      newEn: enV2,
      masterBaseEn: enV1,
      prBaseEn: enV2,
      activePr: deferredPr,
      repo: 'zilliztech/zdoc',
      baseBranch: 'master',
      nowIso: '2026-12-01T00:00:00Z',
    })
    expect(due.action).toBe('deferred-due-reminder')

    // New EN change (enV3 changes #limits) -> update-deferred-pr with BOTH diffs
    const updated = planPageSchedule({
      pageId: 'delete-entities',
      pageConfig: makeConfig('incremental'),
      lifecycleState: 'ready',
      baseline: baselineV1,
      newEn: enV3,
      masterBaseEn: enV1,
      prBaseEn: enV2,
      activePr: deferredPr,
      repo: 'zilliztech/zdoc',
      baseBranch: 'master',
      nowIso: '2026-11-28T00:00:00Z',
    })
    expect(updated.action).toBe('update-deferred-pr')
    if (updated.action === 'update-deferred-pr') {
      expect(updated.changesSinceDeferred.changedSections).toEqual(['limits'])
      expect(updated.cumulativeChangesSinceMerge.changedSections).toEqual(['overview', 'limits'])
      const dualNote = renderDeferredDualDiffSection({
        changesSinceDeferred: updated.changesSinceDeferred,
        cumulativeChangesSinceMerge: updated.cumulativeChangesSinceMerge,
      })
      expect(dualNote).toContain('自暂缓后新变化')
      expect(dualNote).toContain('自上次合入累计变化')
    }
  })

  it('pauses automated writes with conflict-paused when human commits overlap EN changes, and allows disjoint edits', () => {
    const zhHumanEditedLimits =
      '# 删除 Entity\n\n## 概述 {#overview}\n\n按 ID 或过滤表达式删除。\n\n## 限制 {#limits}\n\n人工修订：单次最多 100 条。\n'
    const zhHumanEditedOverview =
      '# 删除 Entity\n\n## 概述 {#overview}\n\n人工润色后的概述。\n\n## 限制 {#limits}\n\n最多 100 条。\n'

    // Human edited #limits, and enV2->enV3 also changed #limits => CONFLICT!
    const overlappingPr: ActivePrState = {
      number: 77,
      url: 'https://github.com/zilliztech/zdoc/pull/77',
      title: 'docs(zh-CN): update delete-entities',
      headRef: 'translate/zh-guides-delete-entities',
      headSha: 'd'.repeat(40),
      baseRef: 'master',
      body: '',
      labels: ['zh-cn-guides-translation'],
      commits: [
        { sha: 'c'.repeat(40), isBot: true, authorLogin: 'github-actions[bot]' },
        { sha: 'd'.repeat(40), isBot: false, authorLogin: 'alice-tw' },
      ],
      prTargetEnSha: enV2.provenance.fileSha256,
      prTargetEnCommit: COMMIT_2,
      prSourceMdText: zhHumanEditedLimits,
      prBaseline: baselineV2Pr,
    }
    const conflictDecision = planPageSchedule({
      pageId: 'delete-entities',
      pageConfig: makeConfig('incremental'),
      lifecycleState: 'ready',
      baseline: baselineV1,
      newEn: enV3,
      masterBaseEn: enV1,
      prBaseEn: enV2,
      activePr: overlappingPr,
      repo: 'zilliztech/zdoc',
      baseBranch: 'master',
      nowIso: '2026-11-27T00:00:00Z',
    })
    expect(conflictDecision.action).toBe('blocked')
    if (conflictDecision.action === 'blocked') {
      expect(conflictDecision.reason).toBe('conflict-paused')
      expect(conflictDecision.overlappingSections).toEqual(['limits'])
    }

    // Human edited #overview, while enV2->enV3 only changed #limits => disjoint, safe to update!
    const disjointCheck = detectActivePrHumanConflict({
      pageId: 'delete-entities',
      activePr: { ...overlappingPr, prSourceMdText: zhHumanEditedOverview },
      baseEn: enV2,
      newEn: enV3,
    })
    expect(disjointCheck.hasHumanCommits).toBe(true)
    expect(disjointCheck.hasConflict).toBe(false)
    expect(disjointCheck.humanEditedSections).toEqual(['overview'])
    expect(disjointCheck.enChangedSections).toEqual(['limits'])

    // Human commit present but branch source.md unavailable => fail closed conflict-paused
    const unprovableCheck = detectActivePrHumanConflict({
      pageId: 'delete-entities',
      activePr: { ...overlappingPr, prSourceMdText: null },
      baseEn: enV2,
      newEn: enV3,
    })
    expect(unprovableCheck.hasConflict).toBe(true)
  })
})

describe('core/schedule renderDailyDigestCardNote', () => {
  const emptySummary: ScheduleRunSummary = {
    schema_version: 1,
    generated_at: '2026-11-27T00:00:00Z',
    repo: 'zilliztech/zdoc',
    base_branch: 'master',
    dry_run: false,
    scanned_pages: 3,
    skipped_pages: [],
    prs: [],
    deferred: [],
    manual: [],
    blocked: [],
    manual_notified_updates: [],
    validation_dispatches: [],
  }

  it('skips notification when all 4 sections are empty unless alwaysNotify is true', () => {
    const empty = renderDailyDigestCardNote(emptySummary)
    expect(empty.shouldNotify).toBe(false)
    expect(empty.markdown).toBe('')

    const forced = renderDailyDigestCardNote(emptySummary, { alwaysNotify: true })
    expect(forced.shouldNotify).toBe(true)
    expect(forced.markdown).toContain('中文 Guides 每日翻译汇总')
  })

  it('renders ONE combined daily digest card note with all 4 sections', () => {
    const populated: ScheduleRunSummary = {
      ...emptySummary,
      prs: [
        {
          pageId: 'delete-entities',
          branch: 'translate/zh-guides-delete-entities',
          action: 'opened',
          mode: 'incremental',
          prNumber: 201,
          prUrl: 'https://github.com/zilliztech/zdoc/pull/201',
          todoCount: 1,
          enBaseCommit: COMMIT_1,
          enNewCommit: COMMIT_2,
          dryRun: false,
        },
      ],
      deferred: [
        {
          pageId: 'search-vectors',
          branch: 'translate/zh-guides-search-vectors',
          kind: 'new-en-changes',
          prNumber: 198,
          prUrl: 'https://github.com/zilliztech/zdoc/pull/198',
          changesSinceDeferred: {
            fromCommit: COMMIT_2,
            toCommit: COMMIT_3,
            changedSections: ['limits'],
          },
          cumulativeChangesSinceMerge: {
            fromCommit: COMMIT_1,
            toCommit: COMMIT_3,
            changedSections: ['overview', 'limits'],
          },
          dryRun: false,
        },
      ],
      manual: [
        {
          pageId: 'region-and-network',
          enPath: 'content/en/guides/region-and-network.md',
          enDiffUrl: `https://github.com/zilliztech/zdoc/compare/${COMMIT_1}...${COMMIT_2}`,
          enBaseCommit: COMMIT_1,
          enNewCommit: COMMIT_2,
          newEnSha: 'e'.repeat(64),
          zhSourcePath: 'localized-docs/zh-CN/guides/pages/region-and-network/source.md',
          zhSourceUrl:
            'https://github.com/zilliztech/zdoc/blob/master/localized-docs/zh-CN/guides/pages/region-and-network/source.md',
          changedSections: ['regions'],
        },
      ],
      blocked: [
        {
          pageId: 'broken-page',
          reason: 'baseline-missing-error',
          message: '缺少 .baseline.json',
        },
        {
          pageId: 'conflict-page',
          reason: 'conflict-paused',
          message: '人工提交冲突',
          prNumber: 205,
          prUrl: 'https://github.com/zilliztech/zdoc/pull/205',
          overlappingSections: ['limits'],
        },
      ],
    }

    const digest = renderDailyDigestCardNote(populated)
    expect(digest.shouldNotify).toBe(true)
    expect(digest.counts).toEqual({ prs: 1, deferred: 1, manual: 1, blocked: 2, totalActionable: 5 })
    expect(digest.markdown).toContain('### 1. 新开 / 更新的中文翻译 PR')
    expect(digest.markdown).toContain('### 2. `deferred` 页新增变化 / 到期提醒')
    expect(digest.markdown).toContain('自暂缓后新变化')
    expect(digest.markdown).toContain('自上次合入累计变化')
    expect(digest.markdown).toContain('### 3. `manual` 模式英文变更')
    expect(digest.markdown).toContain('localized-docs/zh-CN/guides/pages/region-and-network/source.md')
    expect(digest.markdown).toContain('### 4. 阻塞待办')
    expect(digest.markdown).toContain('baseline-missing-error')
    expect(digest.markdown).toContain('conflict-paused')
  })
})
