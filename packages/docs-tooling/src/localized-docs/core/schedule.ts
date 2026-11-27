import { validatePageId } from './config.ts'
import type { VerifiedEnSnapshot } from './draft.ts'
import { parseStructuredDocument } from './sections.ts'
import type {
  BaselineJson,
  LocalizedDocsError,
  PageConfig,
  PageLifecycleState,
} from './types.ts'
import { sha256Hex } from './types.ts'

export const TRANSLATE_BRANCH_PREFIX = 'translate/zh-guides-'
export const DEFERRED_LABEL = 'deferred'
export const TRANSLATION_PR_LABEL = 'zh-cn-guides-translation'
export const SCHEDULE_META_PREFIX = '<!-- localized-docs:schedule-meta:'
export const SCHEDULE_META_SUFFIX = ' -->'

const SHA256_RE = /^[a-f0-9]{64}$/
const COMMIT_RE = /^[a-f0-9]{40}$/
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const REVIEW_AFTER_PATTERNS = [
  /(?:^|\n)[ \t>*-]*review[_-]?after[ \t]*[:：][ \t]*(\d{4}-\d{2}-\d{2})\b/i,
  /(?:^|\n)[ \t>*-]*复核日期[ \t]*[:：][ \t]*(\d{4}-\d{2}-\d{2})\b/,
]

export interface SchedulePrMeta {
  schema_version: 1
  page_id: string
  target_en_sha: string
  target_en_commit: string
  base_en_sha: string | null
  base_en_commit: string | null
  deferred_at_en_sha?: string | null
  deferred_at_en_commit?: string | null
  last_bot_head_sha?: string | null
}

export interface ActivePrCommitInfo {
  sha: string
  isBot: boolean
  authorLogin?: string | null
  touchedFiles?: readonly string[]
}

export interface ActivePrState {
  number: number
  url: string
  title: string
  headRef: string
  headSha: string
  baseRef: string
  body: string
  labels: readonly string[]
  commits: readonly ActivePrCommitInfo[]
  prTargetEnSha?: string | null
  prTargetEnCommit?: string | null
  prSourceMdText?: string | null
  prBaseline?: BaselineJson | null
  deferredReviewAfter?: string | null
  lastDeferredReminderDate?: string | null
}

export interface HumanConflictCheckResult {
  hasHumanCommits: boolean
  hasConflict: boolean
  humanEditedSections: string[]
  enChangedSections: string[]
  overlappingSections: string[]
  reason: string | null
}

export interface EnRangeDiffSummary {
  fromCommit: string | null
  toCommit: string
  fromSha: string | null
  toSha: string
  changedSections: string[]
}

export interface PageSchedulePlanInput {
  pageId: string
  pageConfig: PageConfig
  lifecycleState: PageLifecycleState
  baseline: BaselineJson | null
  hasBaselineErrors?: boolean
  baselineDiagnostics?: readonly LocalizedDocsError[]
  newEn: VerifiedEnSnapshot | null
  enDiagnostics?: readonly LocalizedDocsError[]
  masterBaseEn?: VerifiedEnSnapshot | null
  prBaseEn?: VerifiedEnSnapshot | null
  activePr: ActivePrState | null
  persistedNotifiedEnSha?: string | null
  repo: string
  baseBranch: string
  nowIso: string
}

export type ScheduleBlockedReason =
  | 'conflict-paused'
  | 'baseline-missing-error'
  | 'source-missing-error'
  | 'baseline-invalid'
  | 'en-provenance-invalid'
  | 'base-en-missing-or-mismatch'
  | 'en-shell-invalid'
  | 'cur-zh-corrupt-or-conflict'
  | 'llm-gate-rejected'
  | 'pr-delivery-failed'

export type PageScheduleDecision =
  | {
      action:
        | 'skip-paused'
        | 'skip-manual-silent'
        | 'skip-unchanged'
        | 'skip-pr-up-to-date'
        | 'skip-deferred-unchanged'
        | 'skip-manual-already-notified'
      pageId: string
      branch: string
      reason: string
    }
  | {
      action: 'deferred-due-reminder'
      pageId: string
      branch: string
      prNumber: number
      prUrl: string
      reviewAfter: string
    }
  | {
      action: 'notify-manual'
      pageId: string
      branch: string
      enPath: string
      enDiffUrl: string
      enBaseCommit: string
      enNewCommit: string
      newEnSha: string
      zhSourcePath: string
      zhSourceUrl: string
      changedSections: string[]
      updatedBaseline: BaselineJson
    }
  | {
      action: 'blocked'
      pageId: string
      branch: string
      reason: ScheduleBlockedReason
      message: string
      prNumber?: number | null
      prUrl?: string | null
      overlappingSections?: string[]
      diagnostics: LocalizedDocsError[]
    }
  | {
      action: 'open-pr'
      pageId: string
      branch: string
      isInitialTranslation: boolean
      newEnSha: string
      newEnCommit: string
      baseEnSha: string | null
      baseEnCommit: string | null
    }
  | {
      action: 'update-pr'
      pageId: string
      branch: string
      prNumber: number
      prUrl: string
      expectedHeadSha: string
      hasNonOverlappingHumanEdits: boolean
      newEnSha: string
      newEnCommit: string
      baseEnSha: string | null
      baseEnCommit: string | null
    }
  | {
      action: 'update-deferred-pr'
      pageId: string
      branch: string
      prNumber: number
      prUrl: string
      expectedHeadSha: string
      hasNonOverlappingHumanEdits: boolean
      newEnSha: string
      newEnCommit: string
      baseEnSha: string | null
      baseEnCommit: string | null
      changesSinceDeferred: EnRangeDiffSummary
      cumulativeChangesSinceMerge: EnRangeDiffSummary
    }

export interface SchedulePrDigestItem {
  pageId: string
  branch: string
  action: 'opened' | 'updated'
  mode: 'initial' | 'incremental'
  prNumber: number | null
  prUrl: string | null
  todoCount: number
  enBaseCommit: string | null
  enNewCommit: string
  dryRun: boolean
}

export interface ScheduleDeferredDigestItem {
  pageId: string
  branch: string
  kind: 'new-en-changes' | 'due-reminder'
  prNumber: number
  prUrl: string
  changesSinceDeferred?: {
    fromCommit: string | null
    toCommit: string
    changedSections: string[]
  }
  cumulativeChangesSinceMerge?: {
    fromCommit: string | null
    toCommit: string
    changedSections: string[]
  }
  reviewAfter?: string | null
  dryRun: boolean
}

export interface ScheduleManualDigestItem {
  pageId: string
  enPath: string
  enDiffUrl: string
  enBaseCommit: string
  enNewCommit: string
  newEnSha: string
  zhSourcePath: string
  zhSourceUrl: string
  changedSections: string[]
}

export interface ScheduleBlockedDigestItem {
  pageId: string
  reason: ScheduleBlockedReason
  message: string
  prNumber?: number | null
  prUrl?: string | null
  overlappingSections?: string[]
}

export interface ScheduleRunSummary {
  schema_version: 1
  generated_at: string
  repo: string
  base_branch: string
  dry_run: boolean
  scanned_pages: number
  skipped_pages: { pageId: string; reason: string }[]
  prs: SchedulePrDigestItem[]
  deferred: ScheduleDeferredDigestItem[]
  manual: ScheduleManualDigestItem[]
  blocked: ScheduleBlockedDigestItem[]
  manual_notified_updates: {
    page_id: string
    last_notified_en_sha: string
    updated_baseline: BaselineJson
  }[]
  validation_dispatches: {
    page_id: string
    pr_number: number
    source_sha: string
    base_sha: string
    request_id: string
    dispatched: boolean
  }[]
}

export interface DailyDigestRenderResult {
  shouldNotify: boolean
  markdown: string
  counts: {
    prs: number
    deferred: number
    manual: number
    blocked: number
    totalActionable: number
  }
}

export function translationBranchName(pageId: string): string {
  const checked = validatePageId(pageId, { page: pageId })
  if ('errors' in checked) {
    throw new Error(checked.errors[0].message)
  }
  return `${TRANSLATE_BRANCH_PREFIX}${checked.pageId}`
}

export function isTranslationBranch(branch: string): boolean {
  if (typeof branch !== 'string' || !branch.startsWith(TRANSLATE_BRANCH_PREFIX)) {
    return false
  }
  const pageId = branch.slice(TRANSLATE_BRANCH_PREFIX.length)
  return !('errors' in validatePageId(pageId))
}

export function serializeSchedulePrMeta(meta: SchedulePrMeta): string {
  return `${SCHEDULE_META_PREFIX}${JSON.stringify(meta)}${SCHEDULE_META_SUFFIX}`
}

export function parseSchedulePrMeta(prBody: string): SchedulePrMeta | null {
  const start = prBody.lastIndexOf(SCHEDULE_META_PREFIX)
  if (start < 0) return null
  const jsonStart = start + SCHEDULE_META_PREFIX.length
  const end = prBody.indexOf(SCHEDULE_META_SUFFIX, jsonStart)
  if (end < 0) return null
  try {
    const parsed = JSON.parse(prBody.slice(jsonStart, end)) as Partial<SchedulePrMeta>
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      parsed.schema_version !== 1 ||
      typeof parsed.page_id !== 'string' ||
      'errors' in validatePageId(parsed.page_id) ||
      typeof parsed.target_en_sha !== 'string' ||
      !SHA256_RE.test(parsed.target_en_sha) ||
      typeof parsed.target_en_commit !== 'string' ||
      !COMMIT_RE.test(parsed.target_en_commit)
    ) {
      return null
    }
    return {
      schema_version: 1,
      page_id: parsed.page_id,
      target_en_sha: parsed.target_en_sha,
      target_en_commit: parsed.target_en_commit,
      base_en_sha:
        typeof parsed.base_en_sha === 'string' && SHA256_RE.test(parsed.base_en_sha)
          ? parsed.base_en_sha
          : null,
      base_en_commit:
        typeof parsed.base_en_commit === 'string' && COMMIT_RE.test(parsed.base_en_commit)
          ? parsed.base_en_commit
          : null,
      ...(typeof parsed.deferred_at_en_sha === 'string' && SHA256_RE.test(parsed.deferred_at_en_sha)
        ? { deferred_at_en_sha: parsed.deferred_at_en_sha }
        : { deferred_at_en_sha: null }),
      ...(typeof parsed.deferred_at_en_commit === 'string' && COMMIT_RE.test(parsed.deferred_at_en_commit)
        ? { deferred_at_en_commit: parsed.deferred_at_en_commit }
        : { deferred_at_en_commit: null }),
      ...(typeof parsed.last_bot_head_sha === 'string' && COMMIT_RE.test(parsed.last_bot_head_sha)
        ? { last_bot_head_sha: parsed.last_bot_head_sha }
        : { last_bot_head_sha: null }),
    }
  } catch {
    return null
  }
}

export function appendScheduleMetaToPrBody(prBody: string, meta: SchedulePrMeta): string {
  const markerLine = serializeSchedulePrMeta(meta)
  const stripped = prBody
    .replace(/\n?<!-- localized-docs:schedule-meta:[\s\S]*? -->\s*$/g, '')
    .trimEnd()
  return `${stripped}\n\n${markerLine}\n`
}

export function parseDeferredReviewDate(texts: readonly string[]): string | null {
  let latest: string | null = null
  for (const text of texts) {
    const normalized = text.replace(/\r\n|\r/g, '\n')
    for (const pattern of REVIEW_AFTER_PATTERNS) {
      const match = pattern.exec(normalized)
      if (match && ISO_DATE_RE.test(match[1])) {
        latest = match[1]
      }
    }
  }
  return latest
}

function shortCommit(commit: string | null | undefined): string {
  return commit ? commit.slice(0, 7) : 'unknown'
}

function utcDateFromIso(iso: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(iso)
  return match ? match[1] : '1970-01-01'
}

export function buildGitHubEnDiffUrl(repo: string, baseCommit: string, newCommit: string, enPath: string): string {
  const cleanRepo = repo.replace(/^\/+|\/+$/g, '')
  if (baseCommit && newCommit && baseCommit !== newCommit) {
    return `https://github.com/${cleanRepo}/compare/${baseCommit}...${newCommit}`
  }
  return `https://github.com/${cleanRepo}/blob/${newCommit}/${enPath}`
}

export function buildGitHubZhSourceUrl(repo: string, baseBranch: string, pageId: string): string {
  const cleanRepo = repo.replace(/^\/+|\/+$/g, '')
  return `https://github.com/${cleanRepo}/blob/${baseBranch}/localized-docs/zh-CN/guides/pages/${pageId}/source.md`
}

export function computeChangedEnSections(
  fromEn: VerifiedEnSnapshot | null | undefined,
  toEn: VerifiedEnSnapshot,
  pageId: string,
): string[] {
  const parsedTo = parseStructuredDocument(
    { kind: 'en', text: toEn.stripped.body, isAlreadyStripped: true },
    { file: toEn.provenance.enPath, page: pageId },
  )
  if ('errors' in parsedTo) {
    return []
  }
  if (!fromEn || !fromEn.provenance.verified) {
    return parsedTo.doc.sections.map(s => s.anchor)
  }
  const parsedFrom = parseStructuredDocument(
    { kind: 'en', text: fromEn.stripped.body, isAlreadyStripped: true },
    { file: fromEn.provenance.enPath, page: pageId },
  )
  if ('errors' in parsedFrom) {
    return parsedTo.doc.sections.map(s => s.anchor)
  }

  const fromByAnchor = new Map(parsedFrom.doc.sections.map(s => [s.anchor, s]))
  const toByAnchor = new Map(parsedTo.doc.sections.map(s => [s.anchor, s]))
  const changed = new Set<string>()
  for (const sec of parsedTo.doc.sections) {
    const prev = fromByAnchor.get(sec.anchor)
    if (!prev || prev.sha256 !== sec.sha256) {
      changed.add(sec.anchor)
    }
  }
  for (const sec of parsedFrom.doc.sections) {
    if (!toByAnchor.has(sec.anchor)) {
      changed.add(sec.anchor)
    }
  }
  return [...changed]
}

export function detectActivePrHumanConflict(options: {
  pageId: string
  activePr: ActivePrState
  baseEn: VerifiedEnSnapshot | null | undefined
  newEn: VerifiedEnSnapshot
}): HumanConflictCheckResult {
  const { pageId, activePr, baseEn, newEn } = options
  const humanCommits = activePr.commits.filter(c => !c.isBot)
  if (humanCommits.length === 0) {
    return {
      hasHumanCommits: false,
      hasConflict: false,
      humanEditedSections: [],
      enChangedSections: [],
      overlappingSections: [],
      reason: null,
    }
  }

  const parsedNewEn = parseStructuredDocument(
    { kind: 'en', text: newEn.stripped.body, isAlreadyStripped: true },
    { file: newEn.provenance.enPath, page: pageId },
  )
  const parsedBaseEn =
    baseEn && baseEn.provenance.verified
      ? parseStructuredDocument(
          { kind: 'en', text: baseEn.stripped.body, isAlreadyStripped: true },
          { file: baseEn.provenance.enPath, page: pageId },
        )
      : null

  if ('errors' in parsedNewEn || !parsedBaseEn || 'errors' in parsedBaseEn) {
    return {
      hasHumanCommits: true,
      hasConflict: true,
      humanEditedSections: [],
      enChangedSections: [],
      overlappingSections: [],
      reason: 'Active PR has human commits and EN diff cannot be proven non-overlapping; pausing automated writes',
    }
  }

  const enChangedSections = computeChangedEnSections(baseEn, newEn, pageId)

  if (activePr.prSourceMdText == null || !activePr.prBaseline) {
    return {
      hasHumanCommits: true,
      hasConflict: true,
      humanEditedSections: [],
      enChangedSections,
      overlappingSections: [],
      reason: 'Active PR has human commits without verifiable branch source.md/.baseline.json; pausing automated writes to avoid overwriting human edits',
    }
  }

  const parsedPrZh = parseStructuredDocument(
    { kind: 'zh', text: activePr.prSourceMdText },
    { file: `pages/${pageId}/source.md`, page: pageId },
  )
  if ('errors' in parsedPrZh) {
    return {
      hasHumanCommits: true,
      hasConflict: true,
      humanEditedSections: [],
      enChangedSections,
      overlappingSections: [],
      reason: 'Active PR source.md with human edits could not be parsed cleanly; pausing automated writes',
    }
  }

  const prSourceSha = sha256Hex(activePr.prSourceMdText)
  if (prSourceSha === activePr.prBaseline.zh_reviewed.source_sha256) {
    return {
      hasHumanCommits: true,
      hasConflict: false,
      humanEditedSections: [],
      enChangedSections,
      overlappingSections: [],
      reason: null,
    }
  }

  const baselineByAnchor = new Map(activePr.prBaseline.sections.map(s => [s.anchor, s]))
  const currentByAnchor = new Map(parsedPrZh.doc.sections.map(s => [s.anchor, s]))
  const humanEdited = new Set<string>()
  for (const sec of parsedPrZh.doc.sections) {
    const baseSec = baselineByAnchor.get(sec.anchor)
    if (!baseSec || baseSec.zh_sha256 !== sec.sha256) {
      humanEdited.add(sec.anchor)
    }
  }
  for (const baseSec of activePr.prBaseline.sections) {
    if (!currentByAnchor.has(baseSec.anchor)) {
      humanEdited.add(baseSec.anchor)
    }
  }

  const humanEditedSections = [...humanEdited]
  if (humanEditedSections.length === 0) {
    // source.md changed outside section bodies (e.g. frontmatter or preamble)
    return {
      hasHumanCommits: true,
      hasConflict: enChangedSections.length > 0,
      humanEditedSections: ['__preamble__'],
      enChangedSections,
      overlappingSections: enChangedSections.length > 0 ? ['__preamble__'] : [],
      reason:
        enChangedSections.length > 0
          ? 'Human edits modified PR preamble/frontmatter while EN also changed; pausing automated writes'
          : null,
    }
  }

  const enChangedSet = new Set(enChangedSections)
  const overlappingSections = humanEditedSections.filter(anchor => enChangedSet.has(anchor))
  if (overlappingSections.length > 0) {
    return {
      hasHumanCommits: true,
      hasConflict: true,
      humanEditedSections,
      enChangedSections,
      overlappingSections,
      reason: `Human commits on PR #${activePr.number} overlap newly changed EN section(s): ${overlappingSections.map(a => `#${a}`).join(', ')}`,
    }
  }

  return {
    hasHumanCommits: true,
    hasConflict: false,
    humanEditedSections,
    enChangedSections,
    overlappingSections: [],
    reason: null,
  }
}

function resolvePrTargetEnSha(pr: ActivePrState): { sha: string | null; commit: string | null } {
  const meta = parseSchedulePrMeta(pr.body)
  const sha = pr.prTargetEnSha ?? pr.prBaseline?.en_baseline.file_sha256 ?? meta?.target_en_sha ?? null
  const commit = pr.prTargetEnCommit ?? pr.prBaseline?.en_baseline.dev_commit ?? meta?.target_en_commit ?? null
  return { sha, commit }
}

export function planPageSchedule(input: PageSchedulePlanInput): PageScheduleDecision {
  const { pageId, pageConfig, lifecycleState, baseline, newEn, activePr, repo, baseBranch, nowIso } = input
  const branch = translationBranchName(pageId)

  // 1. Paused mode always silently skips
  if (pageConfig.mode === 'paused') {
    return {
      action: 'skip-paused',
      pageId,
      branch,
      reason: 'paused',
    }
  }

  // 2. Lifecycle & baseline blocking checks (never open a broken PR)
  if (lifecycleState === 'baseline-missing-error') {
    return {
      action: 'blocked',
      pageId,
      branch,
      reason: 'baseline-missing-error',
      message: `页面 "${pageId}" 存在 source.md 但缺少 .baseline.json（严禁误作新页首译）`,
      diagnostics: [...(input.baselineDiagnostics ?? [])],
    }
  }

  if (lifecycleState === 'source-missing-error') {
    return {
      action: 'blocked',
      pageId,
      branch,
      reason: 'source-missing-error',
      message: `页面 "${pageId}"（mode=${pageConfig.mode}）缺少 source.md`,
      diagnostics: [...(input.baselineDiagnostics ?? [])],
    }
  }

  if (input.hasBaselineErrors) {
    return {
      action: 'blocked',
      pageId,
      branch,
      reason: 'baseline-invalid',
      message:
        input.baselineDiagnostics?.[0]?.message ??
        `页面 "${pageId}" 的 .baseline.json 无效或与配置不一致`,
      diagnostics: [...(input.baselineDiagnostics ?? [])],
    }
  }

  // 3. Manual mode silently skips when notify_on_en_change is not enabled
  if (pageConfig.mode === 'manual' && pageConfig.notify_on_en_change !== true) {
    return {
      action: 'skip-manual-silent',
      pageId,
      branch,
      reason: 'manual-notify-disabled',
    }
  }

  // 4. Verify EN provenance
  if (
    !newEn ||
    !newEn.provenance.verified ||
    newEn.provenance.verificationErrors.length > 0 ||
    newEn.provenance.manual !== pageConfig.en_source.manual ||
    newEn.provenance.sharedPage !== pageConfig.en_source.shared_page ||
    sha256Hex(newEn.rawMdx) !== newEn.provenance.fileSha256
  ) {
    const diagnostics = [
      ...(input.enDiagnostics ?? []),
      ...(newEn?.provenance.verificationErrors ?? []),
    ]
    return {
      action: 'blocked',
      pageId,
      branch,
      reason: 'en-provenance-invalid',
      message:
        diagnostics[0]?.message ??
        `页面 "${pageId}" 的英文来源凭据（SharedReceipt）缺失或核验失败`,
      diagnostics,
    }
  }

  const newEnSha = newEn.provenance.fileSha256
  const newEnCommit = newEn.provenance.devCommit

  // 5. Manual mode with notify_on_en_change: true
  if (pageConfig.mode === 'manual') {
    if (!baseline) {
      return {
        action: 'blocked',
        pageId,
        branch,
        reason: 'baseline-missing-error',
        message: `手工维护页 "${pageId}" 缺少有效的 .baseline.json`,
        diagnostics: [...(input.baselineDiagnostics ?? [])],
      }
    }

    if (newEnSha === baseline.en_baseline.file_sha256) {
      return {
        action: 'skip-unchanged',
        pageId,
        branch,
        reason: 'manual-en-unchanged',
      }
    }

    const effectiveLastNotified = input.persistedNotifiedEnSha ?? baseline.last_notified_en_sha
    if (
      newEnSha === baseline.last_notified_en_sha ||
      (effectiveLastNotified !== null && newEnSha === effectiveLastNotified)
    ) {
      return {
        action: 'skip-manual-already-notified',
        pageId,
        branch,
        reason: 'manual-already-notified',
      }
    }

    const changedSections = computeChangedEnSections(input.masterBaseEn, newEn, pageId)
    const zhSourcePath = `localized-docs/zh-CN/guides/pages/${pageId}/source.md`
    return {
      action: 'notify-manual',
      pageId,
      branch,
      enPath: newEn.provenance.enPath,
      enDiffUrl: buildGitHubEnDiffUrl(
        repo,
        baseline.en_baseline.dev_commit,
        newEnCommit,
        newEn.provenance.enPath,
      ),
      enBaseCommit: baseline.en_baseline.dev_commit,
      enNewCommit: newEnCommit,
      newEnSha,
      zhSourcePath,
      zhSourceUrl: buildGitHubZhSourceUrl(repo, baseBranch, pageId),
      changedSections,
      updatedBaseline: {
        ...baseline,
        last_notified_en_sha: newEnSha,
      },
    }
  }

  // 6. Incremental mode
  const isInitial = lifecycleState === 'pending-initial-translation'
  const masterBaseEnSha = baseline?.en_baseline.file_sha256 ?? null
  const masterBaseEnCommit = baseline?.en_baseline.dev_commit ?? null

  if (!isInitial && !baseline) {
    return {
      action: 'blocked',
      pageId,
      branch,
      reason: 'baseline-missing-error',
      message: `增量页 "${pageId}" 缺少有效的 .baseline.json`,
      diagnostics: [...(input.baselineDiagnostics ?? [])],
    }
  }

  // If master already matches newEnSha and there is no active PR, nothing to do
  if (!isInitial && masterBaseEnSha === newEnSha && !activePr) {
    return {
      action: 'skip-unchanged',
      pageId,
      branch,
      reason: 'en-unchanged',
    }
  }

  // 7. No active PR -> open new rolling PR
  if (!activePr) {
    return {
      action: 'open-pr',
      pageId,
      branch,
      isInitialTranslation: isInitial,
      newEnSha,
      newEnCommit,
      baseEnSha: masterBaseEnSha,
      baseEnCommit: masterBaseEnCommit,
    }
  }

  // 8. Existing active rolling PR
  const isDeferred = activePr.labels.some(label => label.toLowerCase() === DEFERRED_LABEL)
  const { sha: prTargetEnSha, commit: prTargetEnCommit } = resolvePrTargetEnSha(activePr)

  if (isDeferred) {
    if (prTargetEnSha !== null && prTargetEnSha === newEnSha) {
      const today = utcDateFromIso(nowIso)
      if (
        activePr.deferredReviewAfter &&
        ISO_DATE_RE.test(activePr.deferredReviewAfter) &&
        today >= activePr.deferredReviewAfter &&
        activePr.lastDeferredReminderDate !== today
      ) {
        return {
          action: 'deferred-due-reminder',
          pageId,
          branch,
          prNumber: activePr.number,
          prUrl: activePr.url,
          reviewAfter: activePr.deferredReviewAfter,
        }
      }
      return {
        action: 'skip-deferred-unchanged',
        pageId,
        branch,
        reason: 'deferred-no-new-en-change',
      }
    }

    // New substantive EN change arrived while PR is deferred -> check human conflict first!
    const conflict = detectActivePrHumanConflict({
      pageId,
      activePr,
      baseEn: input.prBaseEn ?? input.masterBaseEn,
      newEn,
    })
    if (conflict.hasConflict) {
      return {
        action: 'blocked',
        pageId,
        branch,
        reason: 'conflict-paused',
        message: conflict.reason ?? `PR #${activePr.number} 存在人工提交与新英文变更冲突，已暂停自动写入`,
        prNumber: activePr.number,
        prUrl: activePr.url,
        overlappingSections: conflict.overlappingSections,
        diagnostics: [],
      }
    }

    const changesSinceDeferred: EnRangeDiffSummary = {
      fromCommit: prTargetEnCommit,
      toCommit: newEnCommit,
      fromSha: prTargetEnSha,
      toSha: newEnSha,
      changedSections: computeChangedEnSections(input.prBaseEn, newEn, pageId),
    }
    const cumulativeChangesSinceMerge: EnRangeDiffSummary = {
      fromCommit: masterBaseEnCommit,
      toCommit: newEnCommit,
      fromSha: masterBaseEnSha,
      toSha: newEnSha,
      changedSections: computeChangedEnSections(input.masterBaseEn, newEn, pageId),
    }

    return {
      action: 'update-deferred-pr',
      pageId,
      branch,
      prNumber: activePr.number,
      prUrl: activePr.url,
      expectedHeadSha: activePr.headSha,
      hasNonOverlappingHumanEdits: conflict.hasHumanCommits,
      newEnSha,
      newEnCommit,
      baseEnSha: masterBaseEnSha,
      baseEnCommit: masterBaseEnCommit,
      changesSinceDeferred,
      cumulativeChangesSinceMerge,
    }
  }

  // Non-deferred active PR
  if (prTargetEnSha !== null && prTargetEnSha === newEnSha) {
    return {
      action: 'skip-pr-up-to-date',
      pageId,
      branch,
      reason: 'active-pr-already-targets-en-sha',
    }
  }

  const conflict = detectActivePrHumanConflict({
    pageId,
    activePr,
    baseEn: input.prBaseEn ?? input.masterBaseEn,
    newEn,
  })
  if (conflict.hasConflict) {
    return {
      action: 'blocked',
      pageId,
      branch,
      reason: 'conflict-paused',
      message: conflict.reason ?? `PR #${activePr.number} 存在人工提交与新英文变更冲突，已暂停自动写入`,
      prNumber: activePr.number,
      prUrl: activePr.url,
      overlappingSections: conflict.overlappingSections,
      diagnostics: [],
    }
  }

  return {
    action: 'update-pr',
    pageId,
    branch,
    prNumber: activePr.number,
    prUrl: activePr.url,
    expectedHeadSha: activePr.headSha,
    hasNonOverlappingHumanEdits: conflict.hasHumanCommits,
    newEnSha,
    newEnCommit,
    baseEnSha: masterBaseEnSha,
    baseEnCommit: masterBaseEnCommit,
  }
}

function sanitizeDigestInline(text: string): string {
  return text.replace(/\r?\n+/g, ' ').replace(/`/g, "'").trim()
}

function formatSections(sections: readonly string[]): string {
  if (sections.length === 0) return '（正文细节变动）'
  return sections.map(s => `\`#${sanitizeDigestInline(s)}\``).join('、')
}

export function renderDeferredDualDiffSection(options: {
  changesSinceDeferred: EnRangeDiffSummary
  cumulativeChangesSinceMerge: EnRangeDiffSummary
}): string {
  const { changesSinceDeferred, cumulativeChangesSinceMerge } = options
  const lines = [
    '### 暂缓期间新增英文变化（`deferred` 双档差异）',
    '',
    `- **自暂缓后新变化**：\`dev@${shortCommit(changesSinceDeferred.fromCommit)}\` ➔ \`dev@${shortCommit(changesSinceDeferred.toCommit)}\`（变更小节：${formatSections(changesSinceDeferred.changedSections)}）`,
    `- **自上次合入累计变化**：\`dev@${shortCommit(cumulativeChangesSinceMerge.fromCommit)}\` ➔ \`dev@${shortCommit(cumulativeChangesSinceMerge.toCommit)}\`（累计变更小节：${formatSections(cumulativeChangesSinceMerge.changedSections)}）`,
    '- 请主审决定：恢复审校并移除 `deferred` 标签、更新暂缓点继续暂缓，或改标 `mode: paused` 转入长期挂起。',
  ]
  return lines.join('\n')
}

export function renderDailyDigestCardNote(
  summary: ScheduleRunSummary,
  options: { alwaysNotify?: boolean } = {},
): DailyDigestRenderResult {
  const counts = {
    prs: summary.prs.length,
    deferred: summary.deferred.length,
    manual: summary.manual.length,
    blocked: summary.blocked.length,
    totalActionable:
      summary.prs.length + summary.deferred.length + summary.manual.length + summary.blocked.length,
  }

  const shouldNotify = counts.totalActionable > 0 || options.alwaysNotify === true
  if (!shouldNotify) {
    return {
      shouldNotify: false,
      markdown: '',
      counts,
    }
  }

  const dateLabel = utcDateFromIso(summary.generated_at)
  const dryRunBadge = summary.dry_run ? ' [DRY-RUN]' : ''
  const lines: string[] = [
    `# 中文 Guides 每日翻译汇总（${dateLabel}）${dryRunBadge}`,
    '',
    `扫描页面：${summary.scanned_pages} · 翻译 PR：${counts.prs} · 暂缓提醒：${counts.deferred} · 手工页变更：${counts.manual} · 阻塞待办：${counts.blocked}`,
    '',
  ]

  // Section 1: Opened / updated translation PRs
  lines.push('### 1. 新开 / 更新的中文翻译 PR')
  if (summary.prs.length === 0) {
    lines.push('- 无')
  } else {
    for (const item of summary.prs) {
      const actionLabel = item.action === 'opened' ? '新开 PR' : '更新 PR'
      const modeLabel = item.mode === 'initial' ? '新页首译' : '增量更新'
      const prRef =
        item.prNumber && item.prUrl
          ? `[#${item.prNumber}](${item.prUrl})`
          : `（预演分支 \`${item.branch}\`）`
      const range = item.enBaseCommit
        ? `\`dev@${shortCommit(item.enBaseCommit)}\` ➔ \`dev@${shortCommit(item.enNewCommit)}\``
        : `\`dev@${shortCommit(item.enNewCommit)}\``
      lines.push(
        `- **\`${item.pageId}\`**（${actionLabel} · ${modeLabel}）：${prRef} · ${range} · 待确认项 ${item.todoCount} 项`,
      )
    }
  }
  lines.push('')

  // Section 2: Deferred pages with new EN changes / due reminders
  lines.push('### 2. `deferred` 页新增变化 / 到期提醒')
  if (summary.deferred.length === 0) {
    lines.push('- 无')
  } else {
    for (const item of summary.deferred) {
      const prRef = `[#${item.prNumber}](${item.prUrl})`
      if (item.kind === 'due-reminder') {
        lines.push(
          `- **\`${item.pageId}\`**（到期提醒）：${prRef} · 复核日期 \`${item.reviewAfter ?? ''}\` 已到，请确认恢复、续期或转 \`paused\``,
        )
      } else {
        const sinceDef = item.changesSinceDeferred
          ? `自暂缓后新变化（\`dev@${shortCommit(item.changesSinceDeferred.fromCommit)}\` ➔ \`dev@${shortCommit(item.changesSinceDeferred.toCommit)}\`：${formatSections(item.changesSinceDeferred.changedSections)}）`
          : '自暂缓后有新英文变化'
        const cum = item.cumulativeChangesSinceMerge
          ? `自上次合入累计变化（\`dev@${shortCommit(item.cumulativeChangesSinceMerge.fromCommit)}\` ➔ \`dev@${shortCommit(item.cumulativeChangesSinceMerge.toCommit)}\`：${formatSections(item.cumulativeChangesSinceMerge.changedSections)}）`
          : ''
        const suffix = cum ? `；${cum}` : ''
        lines.push(
          `- **\`${item.pageId}\`**（暂缓页新增英文变化${item.dryRun ? ' · DRY-RUN' : ''}）：${prRef} · ${sinceDef}${suffix}`,
        )
      }
    }
  }
  lines.push('')

  // Section 3: Manual pages with EN changes
  lines.push('### 3. `manual` 模式英文变更')
  if (summary.manual.length === 0) {
    lines.push('- 无')
  } else {
    for (const item of summary.manual) {
      const range = `\`dev@${shortCommit(item.enBaseCommit)}\` ➔ \`dev@${shortCommit(item.enNewCommit)}\``
      lines.push(
        `- **\`${item.pageId}\`**（${range}）：[查看英文 Diff](${item.enDiffUrl}) · 中文源稿 [\`${item.zhSourcePath}\`](${item.zhSourceUrl}) · 涉及小节：${formatSections(item.changedSections)}`,
      )
    }
  }
  lines.push('')

  // Section 4: Blocked items
  lines.push('### 4. 阻塞待办')
  if (summary.blocked.length === 0) {
    lines.push('- 无')
  } else {
    for (const item of summary.blocked) {
      const prRef = item.prNumber && item.prUrl ? ` · PR [#${item.prNumber}](${item.prUrl})` : ''
      const overlap =
        item.overlappingSections && item.overlappingSections.length > 0
          ? ` · 冲突小节：${formatSections(item.overlappingSections)}`
          : ''
      lines.push(
        `- **\`${item.pageId}\`**（\`${item.reason}\`${prRef}${overlap}）：${sanitizeDigestInline(item.message)}`,
      )
    }
  }
  lines.push('')

  return {
    shouldNotify: true,
    markdown: lines.join('\n'),
    counts,
  }
}
