import {
  extractFirstH1,
  validateChannelTags,
  validateSourceShell,
} from './assemble.ts'
import { parseBaselineJson, validateBaselineConsistency } from './baseline.ts'
import {
  syncAllCodeBlocks,
  type CodeSyncResult,
  type CodeSyncRule,
} from './code-sync.ts'
import {
  computeThreeWayDiff,
  type AlignedCodeTriplet,
  type ReviewTodo,
  type ThreeWayDiffResult,
} from './diff.ts'
import {
  buildBaselineSections,
  parseStructuredDocument,
  type BlockUnitKind,
  type ChannelScope,
  type ParsedDocStructure,
} from './sections.ts'
import { validatePageId } from './config.ts'
import type {
  BaselineCodeBlock,
  BaselineJson,
  DiagnosticContext,
  LocalizedDocsError,
  ManualId,
  PageConfig,
  PageLifecycleState,
  StrippedEnResult,
  UiTagMatch,
} from './types.ts'
import { localizedError, sha256Hex } from './types.ts'
import {
  computeLineStarts,
  maskCodeAndComments,
  scanUiTags,
  validateUiTags,
} from './ui-tags.ts'

export interface EnProvenanceSummary {
  manual: ManualId
  sharedPage: string
  devCommit: string
  enPath: string
  manifestPath: string
  fileSha256: string
  channels: {
    currentSha256: string
    nextSha256: string
  }
  receiptChannel: null | 'next' | 'retire-in-next'
  provenanceMode: 'shared-receipt' | 'file-direct'
  verified: boolean
  verificationErrors: LocalizedDocsError[]
}

export interface VerifiedEnSnapshot {
  rawMdx: string
  stripped: StrippedEnResult
  provenance: EnProvenanceSummary
}

export interface DraftLlmUnitInput {
  blockId: string
  sectionAnchor: string
  blockKind: BlockUnitKind
  channel: ChannelScope
  maskedEnText: string
  baseEnText?: string
  curZhText?: string
  adjacentZhBefore?: string
  adjacentZhAfter?: string
  expectedPlaceholders: readonly string[]
}

export interface DraftLlmRequest {
  pageId: string
  manual: ManualId
  isInitialTranslation: boolean
  units: readonly DraftLlmUnitInput[]
  localeContractFormatted: string
  styleGuideExcerpt: string
}

export interface DraftLlmResponse {
  proposals: Record<string, string>
  providerName: string
  model?: string
}

export interface DraftLlmProvider {
  readonly name: string
  draft(request: DraftLlmRequest): Promise<DraftLlmResponse>
}

export interface LocaleContractIssue {
  severity: string
  type: string
  location: string
  source_quote: string
  draft_quote: string
  comment: string
}

export interface LocaleContractSupport {
  readonly contractId: string
  readonly formattedContract: string
  readonly styleGuideExcerpt: string
  applyDeterministicRepairs(sourceEn: string, draftZh: string): string
  validateDraft(sourceEn: string, draftZh: string): readonly LocaleContractIssue[]
}

export interface DraftEngineInput {
  pageId: string
  pageConfig: PageConfig
  curZh: {
    hasSourceMd: boolean
    sourceMdText?: string
    hasBaselineJson: boolean
    baselineJsonText?: string
    baseline?: BaselineJson
    lifecycleState: PageLifecycleState
  }
  newEn: VerifiedEnSnapshot
  baseEn: VerifiedEnSnapshot | null
  llmProvider: DraftLlmProvider
  contractSupport: LocaleContractSupport
  codeSyncRules?: readonly CodeSyncRule[]
  reviewedPr?: number
  nowIso?: string
}

export interface GateCheckSummary {
  unchangedBytesVerified: boolean
  codeProtectionVerified: boolean
  uiTagsVerified: boolean
  channelBoundariesVerified: boolean
  sourceShellVerified: boolean
  localeContractChecked: boolean
}

export type DraftPageResult =
  | {
      status: 'skipped'
      pageId: string
      reason: 'paused' | 'unchanged' | 'manual-already-notified'
      diagnostics: LocalizedDocsError[]
    }
  | {
      status: 'manual-notify'
      pageId: string
      newEnSha: string
      enDiffSummary: {
        baseCommit: string | null
        newCommit: string
        changedSections: string[]
        currentChanged: boolean
        nextChanged: boolean
      }
      updatedBaseline: BaselineJson
      diagnostics: LocalizedDocsError[]
    }
  | {
      status: 'blocked'
      pageId: string
      reason:
        | 'baseline-missing-error'
        | 'source-missing-error'
        | 'baseline-invalid'
        | 'en-provenance-invalid'
        | 'en-shell-invalid'
        | 'base-en-missing-or-mismatch'
        | 'cur-zh-corrupt-or-conflict'
        | 'llm-gate-rejected'
      diagnostics: LocalizedDocsError[]
      gateViolations?: string[]
    }
  | {
      status: 'drafted'
      pageId: string
      isInitialTranslation: boolean
      candidateSourceMd: string
      updatedBaseline: BaselineJson
      diff: ThreeWayDiffResult
      codeSyncResults: CodeSyncResult[]
      uiTagsExtracted: UiTagMatch[]
      localeWarnings: LocaleContractIssue[]
      todos: ReviewTodo[]
      gateChecks: GateCheckSummary
      providerUsed: { name: string; model?: string; unitCount: number }
      diagnostics: LocalizedDocsError[]
    }

export interface MaskedBlockResult {
  maskedText: string
  placeholders: Map<string, string>
  uiTags: UiTagMatch[]
  orderedTokens: string[]
}

const ANY_ZDOC_MARKER_RE = /\[\[ZDOC-(?:UI|PROTECTED):[^\]]*\]\]/g
const FENCE_LINE_RE = /^ {0,3}(?:`{3,}|~{3,})/m
const NEXT_CHANNEL_TAG_RE = /<\/?NextChannel(?=$|[\s/>])/i
const UI_TAG_RE = /<\/?UI(?=$|[\s/>])/

function findUiTagSpanRanges(text: string): [number, number][] {
  const masked = maskCodeAndComments(text)
  const ranges: [number, number][] = []
  const stack: number[] = []
  const tagStartRe = /<\/?UI(?=$|[\s/>])/g

  for (const match of masked.matchAll(tagStartRe)) {
    const idx = match.index!
    const isClosing = match[0].startsWith('</')
    let gtIdx = -1
    for (let cursor = idx + match[0].length; cursor < masked.length; cursor += 1) {
      if (masked[cursor] === '>') {
        gtIdx = cursor
        break
      }
      if (masked[cursor] === '<') break
    }
    if (gtIdx < 0) continue
    const rawTag = masked.slice(idx, gtIdx + 1)
    if (isClosing) {
      const openStart = stack.pop()
      if (openStart !== undefined && rawTag === '</UI>') {
        ranges.push([openStart, gtIdx + 1])
      }
    } else if (rawTag === '<UI>') {
      stack.push(idx)
    }
  }
  return ranges
}

function findInlineCodeSpanRanges(text: string, occupied: readonly [number, number][]): [number, number][] {
  const ranges: [number, number][] = []
  const overlapsOccupied = (s: number, e: number) =>
    occupied.some(([os, oe]) => s < oe && e > os)

  let i = 0
  while (i < text.length) {
    if (text[i] !== '`') {
      i += 1
      continue
    }
    if (i > 0 && text[i - 1] === '\\') {
      i += 1
      continue
    }
    let tickLen = 0
    while (i + tickLen < text.length && text[i + tickLen] === '`') tickLen += 1
    let closeStart = -1
    let cursor = i + tickLen
    while (cursor < text.length) {
      if (text[cursor] === '`') {
        let len = 0
        while (cursor + len < text.length && text[cursor + len] === '`') len += 1
        if (len === tickLen) {
          closeStart = cursor
          break
        }
        cursor += len
        continue
      }
      cursor += 1
    }
    if (closeStart >= 0) {
      const end = closeStart + tickLen
      if (!overlapsOccupied(i, end)) {
        ranges.push([i, end])
      }
      i = end
    } else {
      i += tickLen
    }
  }
  return ranges
}

export function maskProtectedTokensForLlm(
  text: string,
  context: DiagnosticContext = {},
): { result: MaskedBlockResult } | { errors: LocalizedDocsError[] } {
  const normalized = text.replace(/\r\n|\r/g, '\n')
  if (ANY_ZDOC_MARKER_RE.test(normalized)) {
    ANY_ZDOC_MARKER_RE.lastIndex = 0
    return {
      errors: [
        localizedError(
          'PROTECTED_MARKER_COLLISION',
          'Source text already contains reserved ZDOC placeholder markers',
          context,
          1,
        ),
      ],
    }
  }
  ANY_ZDOC_MARKER_RE.lastIndex = 0

  const uiScan = scanUiTags(normalized, context)
  if ('errors' in uiScan) {
    return { errors: uiScan.errors }
  }

  interface SpanEntry {
    start: number
    end: number
    kind: 'UI' | 'PROTECTED'
  }

  const spans: SpanEntry[] = []
  const addNonOverlapping = (start: number, end: number, kind: 'UI' | 'PROTECTED') => {
    if (start >= end) return
    if (spans.some(s => start < s.end && end > s.start)) return
    spans.push({ start, end, kind })
  }

  // 1. <UI>...</UI> nodes
  for (const [s, e] of findUiTagSpanRanges(normalized)) {
    addNonOverlapping(s, e, 'UI')
  }

  // 2. Inline code spans (must precede regex scans inside code)
  const codeSpans = findInlineCodeSpanRanges(
    normalized,
    spans.map(s => [s.start, s.end] as [number, number]),
  )
  for (const [s, e] of codeSpans) {
    addNonOverlapping(s, e, 'PROTECTED')
  }

  // 3. Variables, fragment includes, template vars, heading anchors, link destinations, inline HTML/JSX
  const patterns: RegExp[] = [
    /\{\{(?:var\.[^}\n]+|fragments\/[^}\n]+)\}\}/g,
    /\$\{[^}\n]+\}/g,
    /%[A-Z0-9_]+%/g,
    /(?:\\)?\{#[A-Za-z0-9][\w.-]*\}/g,
    /\]\(([^)\n]+)\)/g,
    /<\/?(?!UI\b|NextChannel\b)[A-Za-z][A-Za-z0-9.-]*(?:\s+[^>\n]*)?\/?>/g,
  ]

  for (let pIdx = 0; pIdx < patterns.length; pIdx += 1) {
    const pattern = patterns[pIdx]
    for (const match of normalized.matchAll(pattern)) {
      if (pIdx === 4) {
        // Mask ONLY `(url)` after `]` so `[Link Text](url)` becomes `[Link Text][[ZDOC-PROTECTED:...]]`
        const fullIdx = match.index!
        addNonOverlapping(fullIdx + 1, fullIdx + match[0].length, 'PROTECTED')
      } else {
        addNonOverlapping(match.index!, match.index! + match[0].length, 'PROTECTED')
      }
    }
  }

  spans.sort((a, b) => a.start - b.start)

  const placeholders = new Map<string, string>()
  const orderedTokens: string[] = []
  let out = ''
  let cursor = 0

  for (let i = 0; i < spans.length; i += 1) {
    const span = spans[i]
    out += normalized.slice(cursor, span.start)
    const original = normalized.slice(span.start, span.end)
    const idxStr = String(i).padStart(6, '0')
    const h8 = sha256Hex(original).slice(0, 8)
    const token = `[[ZDOC-${span.kind}:${idxStr}:${h8}]]`
    placeholders.set(token, original)
    orderedTokens.push(token)
    out += token
    cursor = span.end
  }
  out += normalized.slice(cursor)

  return {
    result: {
      maskedText: out,
      placeholders,
      uiTags: uiScan.tags,
      orderedTokens,
    },
  }
}

export function restoreProtectedTokensFromLlm(
  proposal: string,
  masked: MaskedBlockResult,
  blockId: string,
): { restored: string } | { violations: string[] } {
  const violations: string[] = []
  const normalizedProposal = proposal.replace(/\r\n|\r/g, '\n')

  if (FENCE_LINE_RE.test(normalizedProposal)) {
    violations.push(`[${blockId}] Proposal introduced fenced code block marker`)
  }
  if (NEXT_CHANNEL_TAG_RE.test(normalizedProposal)) {
    violations.push(`[${blockId}] Proposal attempted to emit or alter <NextChannel> tag`)
  }
  if (UI_TAG_RE.test(normalizedProposal)) {
    violations.push(`[${blockId}] Proposal introduced unmasked or forged <UI> tag`)
  }

  for (const token of masked.orderedTokens) {
    let count = 0
    let pos = 0
    while (true) {
      const idx = normalizedProposal.indexOf(token, pos)
      if (idx < 0) break
      count += 1
      pos = idx + token.length
    }
    if (count !== 1) {
      violations.push(
        `[${blockId}] Protected placeholder ${token} expected exactly 1 occurrence, found ${count}`,
      )
    }
  }

  ANY_ZDOC_MARKER_RE.lastIndex = 0
  for (const match of normalizedProposal.matchAll(ANY_ZDOC_MARKER_RE)) {
    if (!masked.placeholders.has(match[0])) {
      violations.push(`[${blockId}] Proposal introduced unknown placeholder ${match[0]}`)
    }
  }
  ANY_ZDOC_MARKER_RE.lastIndex = 0

  if (violations.length > 0) {
    return { violations }
  }

  let restored = normalizedProposal
  for (const [token, original] of masked.placeholders.entries()) {
    restored = restored.split(token).join(original)
  }
  return { restored }
}

function extractChannelTagSequence(markdown: string): string[] {
  const masked = maskCodeAndComments(markdown.replace(/\r\n|\r/g, '\n'))
  const seq: string[] = []
  for (const match of masked.matchAll(/<\/?NextChannel(?:\s+action=(?:"(?:include|exclude)"|'(?:include|exclude)'))?\s*>/g)) {
    seq.push(match[0].replace(/'/g, '"'))
  }
  return seq
}

function verifyLockedSpansPreserved(
  candidateBody: string,
  lockedSpans: readonly { sectionAnchor: string; start: number; end: number; raw: string }[],
): string[] {
  const violations: string[] = []
  let searchFrom = 0
  for (const span of lockedSpans) {
    if (!span.raw) continue
    const foundAt = candidateBody.indexOf(span.raw, searchFrom)
    if (foundAt < 0) {
      violations.push(
        `Locked span in section "${span.sectionAnchor}" (offset ${span.start}..${span.end}) was modified or missing from candidate output`,
      )
    } else {
      searchFrom = foundAt + span.raw.length
    }
  }
  return violations
}

function checkSetEquals(actual: readonly string[], expected: readonly string[]): string[] {
  const violations: string[] = []
  const expectedSet = new Set(expected)
  const actualSet = new Set(actual)
  for (const id of expected) {
    if (!actualSet.has(id)) {
      violations.push(`Missing LLM proposal for requested blockId "${id}"`)
    }
  }
  for (const id of actual) {
    if (!expectedSet.has(id)) {
      violations.push(`LLM returned out-of-bounds proposal for unrequested blockId "${id}"`)
    }
  }
  return violations
}

function isPurelyWhitespaceBetween(text: string, from: number, to: number): boolean {
  return text.slice(from, to).trim().length === 0
}

export async function executeDraftEngine(input: DraftEngineInput): Promise<DraftPageResult> {
  const { pageId, pageConfig, curZh, newEn, baseEn, llmProvider, contractSupport } = input
  const nowIso = input.nowIso ?? '1970-01-01T00:00:00Z'

  // 1. Validate pageId and newEn provenance
  const idCheck = validatePageId(pageId, { page: pageId })
  if ('errors' in idCheck) {
    return {
      status: 'blocked',
      pageId,
      reason: 'baseline-invalid',
      diagnostics: idCheck.errors,
    }
  }

  if (
    !newEn.provenance.verified ||
    newEn.provenance.verificationErrors.length > 0 ||
    newEn.provenance.manual !== pageConfig.en_source.manual ||
    newEn.provenance.sharedPage !== pageConfig.en_source.shared_page ||
    sha256Hex(newEn.rawMdx) !== newEn.provenance.fileSha256
  ) {
    return {
      status: 'blocked',
      pageId,
      reason: 'en-provenance-invalid',
      diagnostics:
        newEn.provenance.verificationErrors.length > 0
          ? newEn.provenance.verificationErrors
          : [
              localizedError(
                'EN_PROVENANCE_INVALID',
                `EN snapshot provenance failed verification for page "${pageId}"`,
                { page: pageId },
                1,
              ),
            ],
    }
  }

  const parsedNewEnRes = parseStructuredDocument(
    { kind: 'en', text: newEn.stripped.body, isAlreadyStripped: true },
    { file: newEn.provenance.enPath, page: pageId },
  )
  if ('errors' in parsedNewEnRes) {
    return {
      status: 'blocked',
      pageId,
      reason: 'en-shell-invalid',
      diagnostics: parsedNewEnRes.errors,
    }
  }
  const parsedNewEn = parsedNewEnRes.doc

  // 2. Mode & Lifecycle Routing
  if (pageConfig.mode === 'paused') {
    return {
      status: 'skipped',
      pageId,
      reason: 'paused',
      diagnostics: [],
    }
  }

  if (curZh.lifecycleState === 'baseline-missing-error') {
    return {
      status: 'blocked',
      pageId,
      reason: 'baseline-missing-error',
      diagnostics: [
        localizedError(
          'BASELINE_MISSING',
          `Page "${pageId}" has source.md without .baseline.json (baseline-missing-error; must not be treated as initial translation)`,
          { file: `pages/${pageId}/.baseline.json`, page: pageId },
          1,
        ),
      ],
    }
  }

  if (curZh.lifecycleState === 'source-missing-error') {
    return {
      status: 'blocked',
      pageId,
      reason: 'source-missing-error',
      diagnostics: [
        localizedError(
          'SOURCE_MISSING',
          `Page "${pageId}" (mode=${pageConfig.mode}) is missing source.md`,
          { file: `pages/${pageId}/source.md`, page: pageId },
          1,
        ),
      ],
    }
  }

  let resolvedBaseline: BaselineJson | null = null
  if (curZh.hasBaselineJson) {
    if (curZh.baseline) {
      resolvedBaseline = curZh.baseline
    } else if (curZh.baselineJsonText !== undefined) {
      const parsedB = parseBaselineJson(curZh.baselineJsonText, {
        file: `pages/${pageId}/.baseline.json`,
        page: pageId,
      })
      if ('errors' in parsedB) {
        return {
          status: 'blocked',
          pageId,
          reason: 'baseline-invalid',
          diagnostics: parsedB.errors,
        }
      }
      resolvedBaseline = parsedB.baseline
    } else {
      return {
        status: 'blocked',
        pageId,
        reason: 'baseline-invalid',
        diagnostics: [
          localizedError(
            'BASELINE_INVALID',
            `Page "${pageId}" has malformed or unreadable .baseline.json`,
            { file: `pages/${pageId}/.baseline.json`, page: pageId },
            1,
          ),
        ],
      }
    }
  }

  if (pageConfig.mode === 'manual') {
    if (!resolvedBaseline) {
      return {
        status: 'blocked',
        pageId,
        reason: 'baseline-missing-error',
        diagnostics: [
          localizedError(
            'BASELINE_MISSING',
            `Manual page "${pageId}" requires a valid .baseline.json`,
            { file: `pages/${pageId}/.baseline.json`, page: pageId },
            1,
          ),
        ],
      }
    }
    const consistencyErrors = validateBaselineConsistency({
      baseline: resolvedBaseline,
      dirPageId: pageId,
      pageConfig,
      context: { file: `pages/${pageId}/.baseline.json`, page: pageId },
    })
    if (consistencyErrors.length > 0) {
      return {
        status: 'blocked',
        pageId,
        reason: 'baseline-invalid',
        diagnostics: consistencyErrors,
      }
    }

    const newSha = newEn.provenance.fileSha256
    if (newSha === resolvedBaseline.en_baseline.file_sha256) {
      return {
        status: 'skipped',
        pageId,
        reason: 'unchanged',
        diagnostics: [],
      }
    }
    if (newSha === resolvedBaseline.last_notified_en_sha) {
      return {
        status: 'skipped',
        pageId,
        reason: 'manual-already-notified',
        diagnostics: [],
      }
    }

    let changedSections = parsedNewEn.sections.map(s => s.anchor)
    let currentChanged = newEn.provenance.channels.currentSha256 !== resolvedBaseline.en_baseline.channels.current_sha256
    let nextChanged = newEn.provenance.channels.nextSha256 !== resolvedBaseline.en_baseline.channels.next_sha256

    if (baseEn && baseEn.provenance.verified) {
      const parsedBase = parseStructuredDocument(
        { kind: 'en', text: baseEn.stripped.body, isAlreadyStripped: true },
        { file: baseEn.provenance.enPath, page: pageId },
      )
      if ('doc' in parsedBase) {
        const baseByAnchor = new Map(parsedBase.doc.sections.map(s => [s.anchor, s]))
        const newByAnchor = new Map(parsedNewEn.sections.map(s => [s.anchor, s]))
        const changed = new Set<string>()
        for (const s of parsedNewEn.sections) {
          const prev = baseByAnchor.get(s.anchor)
          if (!prev || prev.sha256 !== s.sha256) changed.add(s.anchor)
        }
        for (const s of parsedBase.doc.sections) {
          if (!newByAnchor.has(s.anchor)) changed.add(s.anchor)
        }
        changedSections = [...changed]
      }
    }

    return {
      status: 'manual-notify',
      pageId,
      newEnSha: newSha,
      enDiffSummary: {
        baseCommit: resolvedBaseline.en_baseline.dev_commit,
        newCommit: newEn.provenance.devCommit,
        changedSections,
        currentChanged,
        nextChanged,
      },
      updatedBaseline: {
        ...resolvedBaseline,
        last_notified_en_sha: newSha,
      },
      diagnostics: [],
    }
  }

  // 3. Incremental mode: ready vs pending-initial-translation
  const isInitial = curZh.lifecycleState === 'pending-initial-translation'
  let parsedBaseEn: ParsedDocStructure | null = null
  let parsedCurZh: ParsedDocStructure | null = null

  if (!isInitial) {
    if (!resolvedBaseline) {
      return {
        status: 'blocked',
        pageId,
        reason: 'baseline-missing-error',
        diagnostics: [
          localizedError(
            'BASELINE_MISSING',
            `Page "${pageId}" is missing a valid .baseline.json`,
            { file: `pages/${pageId}/.baseline.json`, page: pageId },
            1,
          ),
        ],
      }
    }

    const consistencyErrors = validateBaselineConsistency({
      baseline: resolvedBaseline,
      dirPageId: pageId,
      pageConfig,
      context: { file: `pages/${pageId}/.baseline.json`, page: pageId },
    })
    if (consistencyErrors.length > 0) {
      return {
        status: 'blocked',
        pageId,
        reason: 'baseline-invalid',
        diagnostics: consistencyErrors,
      }
    }

    if (
      !baseEn ||
      !baseEn.provenance.verified ||
      sha256Hex(baseEn.rawMdx) !== baseEn.provenance.fileSha256 ||
      baseEn.provenance.fileSha256 !== resolvedBaseline.en_baseline.file_sha256
    ) {
      return {
        status: 'blocked',
        pageId,
        reason: 'base-en-missing-or-mismatch',
        diagnostics: [
          localizedError(
            'BASE_EN_MISMATCH',
            `Base EN snapshot is missing or does not match .baseline.json file_sha256 (${resolvedBaseline.en_baseline.file_sha256})`,
            { file: resolvedBaseline.en_baseline.en_path, page: pageId },
            1,
          ),
        ],
      }
    }

    const parsedBaseRes = parseStructuredDocument(
      { kind: 'en', text: baseEn.stripped.body, isAlreadyStripped: true },
      { file: baseEn.provenance.enPath, page: pageId },
    )
    if ('errors' in parsedBaseRes) {
      return {
        status: 'blocked',
        pageId,
        reason: 'base-en-missing-or-mismatch',
        diagnostics: parsedBaseRes.errors,
      }
    }
    parsedBaseEn = parsedBaseRes.doc

    if (curZh.sourceMdText === undefined) {
      return {
        status: 'blocked',
        pageId,
        reason: 'source-missing-error',
        diagnostics: [
          localizedError(
            'SOURCE_MISSING',
            `Page "${pageId}" source.md is missing`,
            { file: `pages/${pageId}/source.md`, page: pageId },
            1,
          ),
        ],
      }
    }

    const curZhErrors = [
      ...validateChannelTags(curZh.sourceMdText, undefined, {
        file: `pages/${pageId}/source.md`,
        page: pageId,
      }),
      ...validateUiTags(curZh.sourceMdText, {
        file: `pages/${pageId}/source.md`,
        page: pageId,
      }),
    ]
    const parsedZhRes = parseStructuredDocument(
      { kind: 'zh', text: curZh.sourceMdText },
      { file: `pages/${pageId}/source.md`, page: pageId },
    )
    if ('errors' in parsedZhRes || curZhErrors.length > 0) {
      return {
        status: 'blocked',
        pageId,
        reason: 'cur-zh-corrupt-or-conflict',
        diagnostics: [
          ...('errors' in parsedZhRes ? parsedZhRes.errors : []),
          ...curZhErrors,
        ],
      }
    }
    parsedCurZh = parsedZhRes.doc
  }

  // 4. Compute 3-way diff
  const diff = computeThreeWayDiff({
    baseEn: parsedBaseEn,
    newEn: parsedNewEn,
    curZh: parsedCurZh,
    baseline: resolvedBaseline,
  })

  if (!diff.isInitialTranslation && !diff.hasSubstantiveChanges) {
    return {
      status: 'skipped',
      pageId,
      reason: 'unchanged',
      diagnostics: [],
    }
  }

  // 5. 3-tier Code Sync (NEVER passes code to LLM)
  const codeTriplets: AlignedCodeTriplet[] = []
  for (const sec of diff.sections) {
    for (const block of sec.blocks) {
      if (block.codeTriplet) {
        codeTriplets.push(block.codeTriplet)
      }
    }
  }
  const codeSyncResults = syncAllCodeBlocks(codeTriplets, input.codeSyncRules)
  const codeSyncByBlockId = new Map(codeSyncResults.map(r => [r.blockId, r]))

  // 6. Prepare bounded LLM units (ONLY modified/added prose blocks)
  const llmUnits: DraftLlmUnitInput[] = []
  const maskedByBlockId = new Map<string, MaskedBlockResult>()
  const rawEnByBlockId = new Map<string, string>()

  const ELIGIBLE_PROSE_KINDS = new Set<BlockUnitKind>([
    'heading',
    'paragraph',
    'list',
    'table',
    'blockquote',
  ])

  for (const sec of diff.sections) {
    if (sec.status === 'unchanged' || sec.status === 'zh-only-preserved' || sec.status === 'ambiguous' || sec.status === 'manual-zh-conflict') {
      continue
    }
    for (const block of sec.blocks) {
      if (block.status !== 'modified' && block.status !== 'added') continue
      if (!ELIGIBLE_PROSE_KINDS.has(block.kind)) continue
      const newEnBlock = block.newEn
      if (!newEnBlock) continue

      const masked = maskProtectedTokensForLlm(newEnBlock.raw, {
        file: newEn.provenance.enPath,
        page: pageId,
      })
      if ('errors' in masked) {
        return {
          status: 'blocked',
          pageId,
          reason: 'en-shell-invalid',
          diagnostics: masked.errors,
        }
      }
      maskedByBlockId.set(block.id, masked.result)
      rawEnByBlockId.set(block.id, newEnBlock.raw)

      llmUnits.push({
        blockId: block.id,
        sectionAnchor: sec.anchor,
        blockKind: block.kind,
        channel: block.channel,
        maskedEnText: masked.result.maskedText,
        ...(block.baseEn ? { baseEnText: block.baseEn.raw } : {}),
        ...(block.curZh ? { curZhText: block.curZh.raw } : {}),
        ...(block.adjacentZhBefore ? { adjacentZhBefore: block.adjacentZhBefore } : {}),
        ...(block.adjacentZhAfter ? { adjacentZhAfter: block.adjacentZhAfter } : {}),
        expectedPlaceholders: masked.result.orderedTokens,
      })
    }
  }

  // 7. Call LLM provider only if prose units need drafting
  let proposals: Record<string, string> = {}
  let modelUsed: string | undefined
  if (llmUnits.length > 0) {
    const llmResponse = await llmProvider.draft({
      pageId,
      manual: pageConfig.en_source.manual,
      isInitialTranslation: diff.isInitialTranslation,
      units: llmUnits,
      localeContractFormatted: contractSupport.formattedContract,
      styleGuideExcerpt: contractSupport.styleGuideExcerpt,
    })
    proposals = llmResponse.proposals
    modelUsed = llmResponse.model
  }

  // 8. Deterministic Gate Validation
  const gateViolations = checkSetEquals(
    Object.keys(proposals),
    llmUnits.map(u => u.blockId),
  )

  const restoredByBlockId = new Map<string, string>()
  const localeWarnings: LocaleContractIssue[] = []
  const uiTagsExtracted: UiTagMatch[] = []
  const extraTodos: ReviewTodo[] = []

  if (gateViolations.length === 0) {
    for (const unit of llmUnits) {
      const rawProposal = proposals[unit.blockId]
      if (typeof rawProposal !== 'string' || !rawProposal.trim()) {
        gateViolations.push(`[${unit.blockId}] Proposal must be a non-empty string`)
        continue
      }
      if (FENCE_LINE_RE.test(rawProposal.replace(/\r\n|\r/g, '\n'))) {
        gateViolations.push(`[${unit.blockId}] Proposal introduced fenced code block marker`)
        continue
      }
      if (NEXT_CHANNEL_TAG_RE.test(rawProposal)) {
        gateViolations.push(`[${unit.blockId}] Proposal attempted to emit or alter <NextChannel>`)
        continue
      }

      const masked = maskedByBlockId.get(unit.blockId)!
      const repairedProposal = contractSupport.applyDeterministicRepairs(
        unit.maskedEnText,
        rawProposal,
      )
      const restoreRes = restoreProtectedTokensFromLlm(repairedProposal, masked, unit.blockId)
      if ('violations' in restoreRes) {
        gateViolations.push(...restoreRes.violations)
        continue
      }

      restoredByBlockId.set(unit.blockId, restoreRes.restored)

      const rawEnText = rawEnByBlockId.get(unit.blockId)!
      const issues = contractSupport.validateDraft(rawEnText, restoreRes.restored)
      localeWarnings.push(...issues)

      for (const uiTag of masked.uiTags) {
        uiTagsExtracted.push(uiTag)
        extraTodos.push({
          id: `ui-term:${unit.blockId}:${uiTagsExtracted.length}`,
          kind: 'ui-term',
          sectionAnchor: unit.sectionAnchor,
          blockId: unit.blockId,
          title: `核对控制台界面词 <UI>${uiTag.text}</UI> 的中文界面文案`,
          details: `工具已保留英文界面词 <UI>${uiTag.text}</UI> 未交给模型翻译，请对照中国站控制台实际文案确认是否替换为对应中文（如 <UI>...</UI>）。`,
          enAfter: `<UI>${uiTag.text}</UI>`,
          zhCurrent: `<UI>${uiTag.text}</UI>`,
        })
      }
    }
  }

  // Also collect <UI> tags inside locked/preserved ZH blocks for reporting
  if (parsedCurZh) {
    const curZhUi = scanUiTags(parsedCurZh.bodyText)
    if ('tags' in curZhUi) {
      for (const tag of curZhUi.tags) {
        // Avoid duplicating tags already added from drafted units if same text/line
        if (!uiTagsExtracted.some(u => u.text === tag.text && u.line === tag.line)) {
          uiTagsExtracted.push(tag)
        }
      }
    }
  }

  if (gateViolations.length > 0) {
    return {
      status: 'blocked',
      pageId,
      reason: 'llm-gate-rejected',
      gateViolations,
      diagnostics: gateViolations.map(v =>
        localizedError('LLM_GATE_REJECTED', v, { file: `pages/${pageId}/source.md`, page: pageId }, 1),
      ),
    }
  }

  // 9. Reconstruct Candidate source.md
  const sectionOutputs: string[] = []
  for (let sIdx = 0; sIdx < diff.sections.length; sIdx += 1) {
    const sec = diff.sections[sIdx]
    if (sec.status === 'removed') continue

    if (sec.lockedRawSpan) {
      sectionOutputs.push(sec.lockedRawSpan.raw)
      continue
    }

    const blockParts: string[] = []
    for (const block of sec.blocks) {
      if (block.status === 'removed') continue

      let content: string | null = null
      if (block.kind === 'code') {
        const codeRes = codeSyncByBlockId.get(block.id)
        if (!codeRes || codeRes.outputRaw === null) continue
        content = codeRes.outputRaw
      } else if (
        block.status === 'unchanged' ||
        block.status === 'zh-only-preserved' ||
        block.status === 'ambiguous' ||
        block.status === 'manual-zh-conflict'
      ) {
        content = block.curZh!.raw
      } else if (block.status === 'modified' || block.status === 'added') {
        if (ELIGIBLE_PROSE_KINDS.has(block.kind)) {
          content = restoredByBlockId.get(block.id)!
        } else {
          content = block.newEn!.raw
        }
      }

      if (content === null) continue
      if (blockParts.length > 0) {
        blockParts.push(block.leadingRaw || '\n\n')
      }
      blockParts.push(content)
    }

    if (blockParts.length === 0) continue
    let secText = blockParts.join('')
    const isLast = sIdx === diff.sections.length - 1
    if (!isLast) {
      if (!secText.endsWith('\n\n')) {
        secText = secText.endsWith('\n') ? `${secText}\n` : `${secText}\n\n`
      }
    } else if (!secText.endsWith('\n')) {
      secText = `${secText}\n`
    }
    sectionOutputs.push(secText)
  }

  // Join sections ensuring lockedRawSpan sections that lacked trailing newlines (e.g. previously last section)
  // still have at least '\n\n' before a newly appended section.
  let candidateBodyText = parsedCurZh?.leadingRaw ?? ''
  for (let i = 0; i < sectionOutputs.length; i += 1) {
    const chunk = sectionOutputs[i]
    if (i > 0 && candidateBodyText.length > 0) {
      const endsWithTwoNl = candidateBodyText.endsWith('\n\n')
      const endsWithOneNl = candidateBodyText.endsWith('\n')
      if (!endsWithTwoNl) {
        candidateBodyText += endsWithOneNl ? '\n' : '\n\n'
      }
    }
    candidateBodyText += chunk
  }
  if (!candidateBodyText.endsWith('\n')) {
    candidateBodyText += '\n'
  }

  let candidateFrontMatter = parsedCurZh?.frontMatterRaw ?? ''
  if (!candidateFrontMatter && !extractFirstH1(candidateBodyText) && newEn.stripped.title) {
    const titleLine = `title: ${JSON.stringify(newEn.stripped.title)}`
    const descLine = newEn.stripped.description
      ? `\ndescription: ${JSON.stringify(newEn.stripped.description)}`
      : ''
    candidateFrontMatter = `---\n${titleLine}${descLine}\n---\n\n`
  }

  const candidateSourceMd = `${candidateFrontMatter}${candidateBodyText}`

  // 10. Post-Assembly Gate Checks
  const postViolations: string[] = []
  postViolations.push(...verifyLockedSpansPreserved(candidateBodyText, diff.lockedSpans))

  const shellCheck = validateSourceShell(candidateSourceMd, {
    file: `pages/${pageId}/source.md`,
    page: pageId,
  })
  const shellErrors = 'errors' in shellCheck ? shellCheck.errors : []
  const channelErrors = validateChannelTags(candidateSourceMd, undefined, {
    file: `pages/${pageId}/source.md`,
    page: pageId,
  })
  const uiErrors = validateUiTags(candidateSourceMd, {
    file: `pages/${pageId}/source.md`,
    page: pageId,
  })

  for (const err of [...shellErrors, ...channelErrors, ...uiErrors]) {
    postViolations.push(`${err.code}: ${err.message}`)
  }

  // Verify deterministic <NextChannel> boundary sequence
  const expectedChannelSeq: string[] = []
  if (!diff.isInitialTranslation && parsedCurZh) {
    for (const sec of diff.sections) {
      if (sec.status === 'removed') continue
      if (sec.lockedRawSpan) {
        expectedChannelSeq.push(...extractChannelTagSequence(sec.lockedRawSpan.raw))
      } else {
        for (const block of sec.blocks) {
          if (block.status === 'removed') continue
          if (block.kind === 'channel-open' || block.kind === 'channel-close') {
            const raw = block.curZh && (block.status === 'unchanged' || block.status === 'ambiguous' || block.status === 'zh-only-preserved' || block.status === 'manual-zh-conflict')
              ? block.curZh.raw
              : block.newEn!.raw
            expectedChannelSeq.push(...extractChannelTagSequence(raw))
          }
        }
      }
    }
  } else {
    expectedChannelSeq.push(...extractChannelTagSequence(newEn.stripped.body))
  }

  const actualChannelSeq = extractChannelTagSequence(candidateBodyText)
  if (
    actualChannelSeq.length !== expectedChannelSeq.length ||
    actualChannelSeq.some((tag, idx) => tag !== expectedChannelSeq[idx])
  ) {
    postViolations.push(
      `Channel boundary sequence mismatch: expected [${expectedChannelSeq.join(', ')}], got [${actualChannelSeq.join(', ')}]`,
    )
  }

  if (postViolations.length > 0) {
    return {
      status: 'blocked',
      pageId,
      reason: 'llm-gate-rejected',
      gateViolations: postViolations,
      diagnostics: postViolations.map(v =>
        localizedError('DRAFT_GATE_FAILED', v, { file: `pages/${pageId}/source.md`, page: pageId }, 1),
      ),
    }
  }

  // 11. Parse candidate ZH to build updated .baseline.json
  const parsedCandidateZh = parseStructuredDocument(
    { kind: 'zh', text: candidateSourceMd },
    { file: `pages/${pageId}/source.md`, page: pageId },
  )
  if ('errors' in parsedCandidateZh) {
    return {
      status: 'blocked',
      pageId,
      reason: 'cur-zh-corrupt-or-conflict',
      diagnostics: parsedCandidateZh.errors,
    }
  }

  const customizedFlagsByEnCodeSha = new Map<string, boolean>()
  const customizedOverrideByBlock = new Map<string, BaselineCodeBlock>()
  const codeCountPerSection = new Map<string, number>()

  for (const res of codeSyncResults) {
    if (!res.baselineEntry) continue
    const ordinal = codeCountPerSection.get(res.sectionAnchor) ?? 0
    codeCountPerSection.set(res.sectionAnchor, ordinal + 1)
    customizedFlagsByEnCodeSha.set(res.baselineEntry.en_sha256, res.customizedForZh)
    customizedOverrideByBlock.set(`${res.sectionAnchor}:code:${ordinal}`, res.baselineEntry)
  }

  const sections = buildBaselineSections(
    parsedNewEn,
    parsedCandidateZh.doc,
    customizedFlagsByEnCodeSha,
    customizedOverrideByBlock,
  )

  const reviewedPr = input.reviewedPr ?? resolvedBaseline?.zh_reviewed.reviewed_pr ?? 1
  const updatedBaseline: BaselineJson = {
    schema_version: 1,
    page_id: pageId,
    en_baseline: {
      manual: newEn.provenance.manual,
      shared_page: newEn.provenance.sharedPage,
      dev_commit: newEn.provenance.devCommit,
      en_path: newEn.provenance.enPath,
      manifest_path: newEn.provenance.manifestPath,
      file_sha256: newEn.provenance.fileSha256,
      channels: {
        current_sha256: newEn.provenance.channels.currentSha256,
        next_sha256: newEn.provenance.channels.nextSha256,
      },
    },
    zh_reviewed: {
      source_sha256: sha256Hex(candidateSourceMd),
      reviewed_pr: reviewedPr,
      updated_at: nowIso,
    },
    last_notified_en_sha: resolvedBaseline?.last_notified_en_sha ?? null,
    sections,
  }

  const baselineParseCheck = parseBaselineJson(JSON.stringify(updatedBaseline), {
    file: `pages/${pageId}/.baseline.json`,
    page: pageId,
  })
  if ('errors' in baselineParseCheck) {
    return {
      status: 'blocked',
      pageId,
      reason: 'baseline-invalid',
      diagnostics: baselineParseCheck.errors,
    }
  }
  const baselineConsistencyErrors = validateBaselineConsistency({
    baseline: baselineParseCheck.baseline,
    dirPageId: pageId,
    pageConfig,
    sourceMdText: candidateSourceMd,
    context: { file: `pages/${pageId}/.baseline.json`, page: pageId },
  })
  if (baselineConsistencyErrors.length > 0) {
    return {
      status: 'blocked',
      pageId,
      reason: 'baseline-invalid',
      diagnostics: baselineConsistencyErrors,
    }
  }

  const allTodos: ReviewTodo[] = [
    ...diff.todos,
    ...codeSyncResults.flatMap(r => (r.todo ? [r.todo] : [])),
    ...extraTodos,
  ]

  return {
    status: 'drafted',
    pageId,
    isInitialTranslation: diff.isInitialTranslation,
    candidateSourceMd,
    updatedBaseline,
    diff,
    codeSyncResults,
    uiTagsExtracted,
    localeWarnings,
    todos: allTodos,
    gateChecks: {
      unchangedBytesVerified: true,
      codeProtectionVerified: true,
      uiTagsVerified: true,
      channelBoundariesVerified: true,
      sourceShellVerified: true,
      localeContractChecked: true,
    },
    providerUsed: {
      name: llmProvider.name,
      ...(modelUsed ? { model: modelUsed } : {}),
      unitCount: llmUnits.length,
    },
    diagnostics: [],
  }
}

export { computeLineStarts }
