/**
 * Pure dual-channel Promote candidate unwrapping for localized zh-CN Guides.
 *
 * - Verifies `expectedEnNextSha === baselineEnNextSha` (fail-closed with `PROMOTE_EN_MISMATCH`)
 * - Unwraps generator-managed `<NextChannel action="include">...</NextChannel>` blocks
 * - Removes paired legacy `<NextChannel action="exclude">...</NextChannel>` blocks
 * - Preserves author-marked independent hand-written channel blocks verbatim
 * - Preserves `<NextChannel>` text inside code blocks and comments verbatim
 * - Validates the promoted output via `validateChannelTags` and `validateUiTags`
 */
import { validateChannelTags } from '../assemble.ts'
import type { DiagnosticContext, LocalizedDocsError } from '../types.ts'
import { localizedError, sha256Hex } from '../types.ts'
import { maskCodeAndCommentsWithRanges, validateUiTags } from '../ui-tags.ts'
import { SHA256_HEX_RE } from './source-state.ts'

export interface PromoteLocalizedSourceInput {
  sourceMarkdown: string
  expectedEnNextSha: string
  baselineEnNextSha: string
  /**
   * Optional allowlist of author-marked channel block IDs to preserve verbatim.
   * When omitted (`undefined`), all blocks marked with
   * `<!-- localized-docs:authored-channel:<id> -->` are preserved verbatim.
   */
  authoredChannelBlockIds?: readonly string[]
  context?: DiagnosticContext
}

export interface PromoteLocalizedSummary {
  unwrappedIncludeCount: number
  removedExcludeCount: number
  preservedAuthoredBlockIds: string[]
  changed: boolean
}

export type PromoteLocalizedResult =
  | {
      ok: true
      promotedMarkdown: string
      sourceSha256: string
      promotedSha256: string
      summary: PromoteLocalizedSummary
    }
  | {
      ok: false
      code: 'PROMOTE_EN_MISMATCH' | 'PROMOTE_SOURCE_INVALID' | 'PROMOTE_RESULT_INVALID'
      errors: LocalizedDocsError[]
      preservedMarkdown: string
      sourceSha256: string
    }

export const AUTHORED_CHANNEL_MARKER_RE =
  /<!--\s*localized-docs:authored-channel:([A-Za-z0-9][A-Za-z0-9._-]*)\s*-->/

const OPEN_TAG_RE = /^<NextChannel\s+action="(include|exclude)"\s*>$/

interface ParsedChannelBlock {
  action: 'include' | 'exclude'
  openStart: number
  openEnd: number
  closeStart: number
  closeEnd: number
  isBlockLevel: boolean
  authoredMarkerId: string | null
  /** Start offset of a preceding marker comment when marker appears immediately before `<NextChannel>`. */
  precedingMarkerStart: number | null
  /** End offset of an inner leading marker comment when marker appears right after `<NextChannel ...>`. */
  innerMarkerEnd: number | null
}

function findLineStart(text: string, offset: number): number {
  const prevNl = text.lastIndexOf('\n', offset - 1)
  return prevNl < 0 ? 0 : prevNl + 1
}

function findLineEnd(text: string, offset: number): number {
  const nextNl = text.indexOf('\n', offset)
  return nextNl < 0 ? text.length : nextNl
}

function detectPrecedingAuthoredMarker(
  source: string,
  openStart: number,
  minOffset: number,
): { id: string; markerStart: number } | null {
  const prefix = source.slice(minOffset, openStart)
  const match = /(<!--\s*localized-docs:authored-channel:([A-Za-z0-9][A-Za-z0-9._-]*)\s*-->)[ \t]*(?:\n[ \t]*)*$/.exec(
    prefix,
  )
  if (!match) return null
  return {
    id: match[2],
    markerStart: minOffset + match.index,
  }
}

function detectInnerAuthoredMarker(
  source: string,
  openEnd: number,
  closeStart: number,
): { id: string; markerEnd: number } | null {
  const inner = source.slice(openEnd, closeStart)
  const match =
    /^[ \t]*(?:\n[ \t]*)?(<!--\s*localized-docs:authored-channel:([A-Za-z0-9][A-Za-z0-9._-]*)\s*-->)[ \t]*(?:\n)?/.exec(
      inner,
    )
  if (!match) return null
  return {
    id: match[2],
    markerEnd: openEnd + match[0].length,
  }
}

function scanTopLevelChannelBlocks(normalized: string): ParsedChannelBlock[] {
  const { masked } = maskCodeAndCommentsWithRanges(normalized)
  const blocks: ParsedChannelBlock[] = []

  let openFrame: {
    action: 'include' | 'exclude'
    openStart: number
    openEnd: number
  } | null = null
  let prevBlockEnd = 0

  for (const match of masked.matchAll(/<\/?NextChannel(?=$|[\s/>])/g)) {
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
    if (!isClosing) {
      const openMatch = OPEN_TAG_RE.exec(rawTag)
      if (!openMatch) continue
      openFrame = {
        action: openMatch[1] as 'include' | 'exclude',
        openStart: idx,
        openEnd: gtIdx + 1,
      }
    } else if (rawTag === '</NextChannel>' && openFrame) {
      const closeStart = idx
      const closeEnd = gtIdx + 1

      const openLineStart = findLineStart(normalized, openFrame.openStart)
      const openLineEnd = findLineEnd(normalized, openFrame.openEnd)
      const closeLineStart = findLineStart(normalized, closeStart)
      const closeLineEnd = findLineEnd(normalized, closeEnd)

      const openAloneOnLine =
        normalized.slice(openLineStart, openFrame.openStart).trim().length === 0 &&
        normalized.slice(openFrame.openEnd, openLineEnd).trim().length === 0
      const closeAloneOnLine =
        normalized.slice(closeLineStart, closeStart).trim().length === 0 &&
        normalized.slice(closeEnd, closeLineEnd).trim().length === 0

      const preceding = detectPrecedingAuthoredMarker(normalized, openFrame.openStart, prevBlockEnd)
      const inner = preceding ? null : detectInnerAuthoredMarker(normalized, openFrame.openEnd, closeStart)

      blocks.push({
        action: openFrame.action,
        openStart: openFrame.openStart,
        openEnd: openFrame.openEnd,
        closeStart,
        closeEnd,
        isBlockLevel: openAloneOnLine && closeAloneOnLine,
        authoredMarkerId: preceding?.id ?? inner?.id ?? null,
        precedingMarkerStart: preceding?.markerStart ?? null,
        innerMarkerEnd: inner?.markerEnd ?? null,
      })

      prevBlockEnd = closeEnd
      openFrame = null
    }
  }

  return blocks
}

function shouldPreserveAuthoredBlock(
  markerId: string | null,
  authoredChannelBlockIds?: readonly string[],
): boolean {
  if (!markerId) return false
  if (authoredChannelBlockIds === undefined) return true
  return authoredChannelBlockIds.includes(markerId)
}

function appendNormalizedSegment(prefix: string, next: string, collapseBoundary: boolean): string {
  if (!collapseBoundary) return prefix + next
  if (!prefix) return next.replace(/^\n+/, '')
  if (!next) return prefix

  const trailingNewlines = /\n+$/.exec(prefix)?.[0].length ?? 0
  const leadingNewlines = /^\n+/.exec(next)?.[0].length ?? 0
  if (trailingNewlines + leadingNewlines >= 3) {
    return `${prefix.replace(/\n+$/, '')}\n\n${next.replace(/^\n+/, '')}`
  }
  return prefix + next
}

/**
 * Computes a promoted Chinese Guides `source.md` candidate by unwrapping
 * generator-managed `<NextChannel action="include">` blocks and removing paired
 * `<NextChannel action="exclude">` blocks once the English NEXT digest matches.
 */
export function promoteLocalizedSource(
  input: PromoteLocalizedSourceInput,
): PromoteLocalizedResult {
  const { sourceMarkdown, expectedEnNextSha, baselineEnNextSha, authoredChannelBlockIds } = input
  const context: DiagnosticContext = input.context ?? {}
  const sourceSha256 = sha256Hex(sourceMarkdown)

  if (
    typeof expectedEnNextSha !== 'string' ||
    !SHA256_HEX_RE.test(expectedEnNextSha) ||
    typeof baselineEnNextSha !== 'string' ||
    !SHA256_HEX_RE.test(baselineEnNextSha) ||
    expectedEnNextSha !== baselineEnNextSha
  ) {
    return {
      ok: false,
      code: 'PROMOTE_EN_MISMATCH',
      errors: [
        localizedError(
          'PROMOTE_EN_MISMATCH',
          `English NEXT digest mismatch during Promote: expected "${String(expectedEnNextSha)}", baseline has "${String(baselineEnNextSha)}"; preserving live Chinese unchanged`,
          context,
          1,
        ),
      ],
      preservedMarkdown: sourceMarkdown,
      sourceSha256,
    }
  }

  const normalized = sourceMarkdown.replace(/\r\n|\r/g, '\n')
  const sourceErrors: LocalizedDocsError[] = [
    ...validateChannelTags(normalized, undefined, context),
    ...validateUiTags(normalized, context),
  ]
  if (sourceErrors.length > 0) {
    return {
      ok: false,
      code: 'PROMOTE_SOURCE_INVALID',
      errors: sourceErrors,
      preservedMarkdown: sourceMarkdown,
      sourceSha256,
    }
  }

  const blocks = scanTopLevelChannelBlocks(normalized)
  const hadTrailingNewline = normalized.endsWith('\n')

  let unwrappedIncludeCount = 0
  let removedExcludeCount = 0
  const preservedAuthoredBlockIds: string[] = []
  let output = ''
  let cursor = 0
  let collapseNextBoundary = false

  for (const block of blocks) {
    if (shouldPreserveAuthoredBlock(block.authoredMarkerId, authoredChannelBlockIds)) {
      const preservedSegment = normalized.slice(cursor, block.closeEnd)
      output = appendNormalizedSegment(output, preservedSegment, collapseNextBoundary)
      preservedAuthoredBlockIds.push(block.authoredMarkerId!)
      cursor = block.closeEnd
      collapseNextBoundary = false
      continue
    }

    const effectiveStart =
      block.precedingMarkerStart !== null ? block.precedingMarkerStart : block.openStart

    if (block.isBlockLevel) {
      const markerAloneOnLine =
        block.precedingMarkerStart !== null &&
        normalized.slice(findLineStart(normalized, block.precedingMarkerStart), block.precedingMarkerStart).trim()
          .length === 0
      const cutStart = markerAloneOnLine
        ? findLineStart(normalized, block.precedingMarkerStart!)
        : block.precedingMarkerStart !== null
          ? block.precedingMarkerStart
          : findLineStart(normalized, block.openStart)
      const closeLineEnd = findLineEnd(normalized, block.closeEnd)
      const cutEnd =
        closeLineEnd < normalized.length && normalized[closeLineEnd] === '\n'
          ? closeLineEnd + 1
          : closeLineEnd

      const before = normalized.slice(cursor, cutStart)
      output = appendNormalizedSegment(output, before, collapseNextBoundary)

      if (block.action === 'include') {
        unwrappedIncludeCount += 1
        const openLineEnd = findLineEnd(normalized, block.openEnd)
        const contentStart =
          block.innerMarkerEnd !== null
            ? block.innerMarkerEnd
            : openLineEnd < normalized.length && normalized[openLineEnd] === '\n'
              ? openLineEnd + 1
              : openLineEnd
        const closeLineStart = findLineStart(normalized, block.closeStart)
        const rawInner = normalized.slice(contentStart, closeLineStart)
        const cleanedInner = rawInner.replace(/^\n+/, '').replace(/\n+$/, '')
        if (cleanedInner.length > 0) {
          const piece = cutEnd < normalized.length || hadTrailingNewline ? `${cleanedInner}\n` : cleanedInner
          output = appendNormalizedSegment(output, piece, true)
        }
      } else {
        removedExcludeCount += 1
      }

      cursor = cutEnd
      collapseNextBoundary = true
    } else {
      const before = normalized.slice(cursor, effectiveStart)
      output = appendNormalizedSegment(output, before, collapseNextBoundary)

      if (block.action === 'include') {
        unwrappedIncludeCount += 1
        const innerStart = block.innerMarkerEnd !== null ? block.innerMarkerEnd : block.openEnd
        output += normalized.slice(innerStart, block.closeStart)
      } else {
        removedExcludeCount += 1
      }

      cursor = block.closeEnd
      collapseNextBoundary = false
    }
  }

  const tail = normalized.slice(cursor)
  output = appendNormalizedSegment(output, tail, collapseNextBoundary)

  let promotedMarkdown: string
  if (unwrappedIncludeCount === 0 && removedExcludeCount === 0) {
    promotedMarkdown = sourceMarkdown
  } else {
    promotedMarkdown = output.replace(/\n+$/, hadTrailingNewline ? '\n' : '')
    if (!promotedMarkdown.trim()) {
      promotedMarkdown = ''
    }
  }

  const postErrors: LocalizedDocsError[] = [
    ...validateChannelTags(promotedMarkdown, undefined, context),
    ...validateUiTags(promotedMarkdown, context),
  ]

  // Verify zero generator-managed <NextChannel> tags remain after promotion.
  const remainingBlocks = scanTopLevelChannelBlocks(promotedMarkdown.replace(/\r\n|\r/g, '\n'))
  for (const remaining of remainingBlocks) {
    if (!shouldPreserveAuthoredBlock(remaining.authoredMarkerId, authoredChannelBlockIds)) {
      postErrors.push(
        localizedError(
          'PROMOTE_RESULT_INVALID',
          `Generator-managed <NextChannel action="${remaining.action}"> tag remained after promotion`,
          context,
          1,
        ),
      )
    }
  }

  if (postErrors.length > 0) {
    return {
      ok: false,
      code: 'PROMOTE_RESULT_INVALID',
      errors: postErrors,
      preservedMarkdown: sourceMarkdown,
      sourceSha256,
    }
  }

  return {
    ok: true,
    promotedMarkdown,
    sourceSha256,
    promotedSha256: sha256Hex(promotedMarkdown),
    summary: {
      unwrappedIncludeCount,
      removedExcludeCount,
      preservedAuthoredBlockIds,
      changed: promotedMarkdown !== sourceMarkdown,
    },
  }
}
