import {
  projectChannelText,
  type BlockUnit,
  type BlockUnitKind,
  type ChannelScope,
  type ParsedDocStructure,
  type SectionNode,
} from './sections.ts'
import type { BaselineCodeBlock, BaselineJson, BaselineSection } from './types.ts'
import { sha256Hex } from './types.ts'

export type DiffUnitStatus =
  | 'unchanged'
  | 'modified'
  | 'added'
  | 'removed'
  | 'ambiguous'
  | 'zh-only-preserved'
  | 'manual-zh-conflict'

export type ReviewTodoKind =
  | 'ambiguous-merge'
  | 'ambiguous-split'
  | 'interstitial-zh'
  | 'heading-rename'
  | 'manual-zh-conflict'
  | 'code-conflict'
  | 'ui-term'
  | 'locale-warning'
  | 'baseline-blocked'

export interface ReviewTodo {
  id: string
  kind: ReviewTodoKind
  sectionAnchor?: string
  blockId?: string
  title: string
  details: string
  enBefore?: string
  enAfter?: string
  zhCurrent?: string
  zhCandidate?: string
}

export interface AlignedCodeTriplet {
  sectionAnchor: string
  blockId: string
  channel: ChannelScope
  tabValue?: string
  baseEn: BlockUnit | null
  newEn: BlockUnit | null
  curZh: BlockUnit | null
  baselineCodeMeta?: BaselineCodeBlock | null
}

export interface DiffBlockItem {
  id: string
  sectionAnchor: string
  status: DiffUnitStatus
  kind: BlockUnitKind
  channel: ChannelScope
  baseEn: BlockUnit | null
  newEn: BlockUnit | null
  curZh: BlockUnit | null
  codeTriplet?: AlignedCodeTriplet
  leadingRaw: string
  adjacentZhBefore?: string
  adjacentZhAfter?: string
  ambiguousReason?: string
}

export interface DiffSectionPlan {
  anchor: string
  status:
    | 'unchanged'
    | 'modified'
    | 'added'
    | 'removed'
    | 'ambiguous'
    | 'zh-only-preserved'
    | 'manual-zh-conflict'
  baseEnSection: SectionNode | null
  newEnSection: SectionNode | null
  curZhSection: SectionNode | null
  lockedRawSpan?: { start: number; end: number; raw: string }
  blocks: DiffBlockItem[]
}

export interface ThreeWayDiffResult {
  isInitialTranslation: boolean
  hasSubstantiveChanges: boolean
  manualZhDriftDetected: boolean
  channelImpact: { currentChanged: boolean; nextChanged: boolean }
  sections: DiffSectionPlan[]
  todos: ReviewTodo[]
  lockedSpans: { sectionAnchor: string; start: number; end: number; raw: string }[]
}

interface AlignmentHunk {
  kind: 'common' | 'change'
  baseIdx?: number
  newIdx?: number
  baseIndices: number[]
  newIndices: number[]
}

function alignByPredicate<T>(
  base: readonly T[],
  next: readonly T[],
  equal: (a: T, b: T) => boolean,
): AlignmentHunk[] {
  const lengths = Array.from({ length: base.length + 1 }, () => new Uint32Array(next.length + 1))
  for (let i = base.length - 1; i >= 0; i -= 1) {
    for (let j = next.length - 1; j >= 0; j -= 1) {
      lengths[i][j] = equal(base[i], next[j])
        ? lengths[i + 1][j + 1] + 1
        : Math.max(lengths[i + 1][j], lengths[i][j + 1])
    }
  }

  const result: AlignmentHunk[] = []
  let basePending: number[] = []
  let newPending: number[] = []
  const flush = () => {
    if (basePending.length || newPending.length) {
      result.push({
        kind: 'change',
        baseIndices: basePending,
        newIndices: newPending,
      })
      basePending = []
      newPending = []
    }
  }

  let i = 0
  let j = 0
  while (i < base.length || j < next.length) {
    if (i < base.length && j < next.length && equal(base[i], next[j])) {
      flush()
      result.push({
        kind: 'common',
        baseIdx: i,
        newIdx: j,
        baseIndices: [i],
        newIndices: [j],
      })
      i += 1
      j += 1
    } else if (i < base.length && (j === next.length || lengths[i + 1][j] >= lengths[i][j + 1])) {
      basePending.push(i)
      i += 1
    } else {
      newPending.push(j)
      j += 1
    }
  }
  flush()
  return result
}

function isStructuralAnchorKind(kind: BlockUnitKind): boolean {
  return (
    kind === 'heading' ||
    kind === 'channel-open' ||
    kind === 'channel-close' ||
    kind === 'jsx-tag' ||
    kind === 'code'
  )
}

function anchorKey(block: BlockUnit): string {
  if (block.kind === 'code') {
    return `code:${block.tabValue ?? ''}:${block.code?.lang ?? ''}`
  }
  if (block.kind === 'channel-open') {
    return `channel-open:${block.channelAction ?? ''}`
  }
  if (block.kind === 'jsx-tag') {
    const tagMatch = /^<\/?([A-Za-z][A-Za-z0-9]*)/.exec(block.raw.trim())
    return `jsx-tag:${tagMatch?.[1] ?? ''}:${block.tabValue ?? ''}`
  }
  return block.kind
}

function clipContext(text: string | undefined, maxChars = 400): string | undefined {
  if (!text) return undefined
  const trimmed = text.trim()
  if (!trimmed) return undefined
  return trimmed.length <= maxChars ? trimmed : `${trimmed.slice(0, maxChars)}…`
}

function detectManualZhDrift(
  curZh: ParsedDocStructure | null,
  baseline: BaselineJson | null,
): boolean {
  if (!curZh || !baseline) return false
  if (curZh.sections.length !== baseline.sections.length) return true
  for (let i = 0; i < curZh.sections.length; i += 1) {
    const zhSec = curZh.sections[i]
    const baseSec = baseline.sections[i]
    if (!baseSec || zhSec.anchor !== baseSec.anchor || zhSec.sha256 !== baseSec.zh_sha256) {
      return true
    }
  }
  return false
}

function findBaselineCodeMeta(
  baselineSec: BaselineSection | undefined,
  baseEnCode: BlockUnit | null,
  codeOrdinal: number,
): BaselineCodeBlock | null {
  if (!baselineSec) return null
  if (baseEnCode) {
    const bySha = baselineSec.code_blocks.find(cb => cb.en_sha256 === baseEnCode.sha256)
    if (bySha) return bySha
  }
  return baselineSec.code_blocks[codeOrdinal] ?? null
}

function pairThreeWayAnchors(
  baseBlocks: readonly BlockUnit[],
  newBlocks: readonly BlockUnit[],
  zhBlocks: readonly BlockUnit[],
): { baseIdx: number; newIdx: number; zhIdx: number }[] {
  const baseAnchors = baseBlocks
    .map((b, idx) => ({ b, idx }))
    .filter(item => isStructuralAnchorKind(item.b.kind))
  const newAnchors = newBlocks
    .map((b, idx) => ({ b, idx }))
    .filter(item => isStructuralAnchorKind(item.b.kind))
  const zhAnchors = zhBlocks
    .map((b, idx) => ({ b, idx }))
    .filter(item => isStructuralAnchorKind(item.b.kind))

  const baseNewHunks = alignByPredicate(
    baseAnchors,
    newAnchors,
    (a, b) => anchorKey(a.b) === anchorKey(b.b),
  )
  const baseToNew = new Map<number, number>()
  for (const hunk of baseNewHunks) {
    if (hunk.kind === 'common' && hunk.baseIdx !== undefined && hunk.newIdx !== undefined) {
      baseToNew.set(baseAnchors[hunk.baseIdx].idx, newAnchors[hunk.newIdx].idx)
    }
  }

  const baseZhHunks = alignByPredicate(
    baseAnchors,
    zhAnchors,
    (a, b) => anchorKey(a.b) === anchorKey(b.b),
  )
  const pairs: { baseIdx: number; newIdx: number; zhIdx: number }[] = []
  for (const hunk of baseZhHunks) {
    if (hunk.kind === 'common' && hunk.baseIdx !== undefined && hunk.newIdx !== undefined) {
      const baseIdx = baseAnchors[hunk.baseIdx].idx
      const zhIdx = zhAnchors[hunk.newIdx].idx
      const newIdx = baseToNew.get(baseIdx)
      if (newIdx !== undefined) {
        pairs.push({ baseIdx, newIdx, zhIdx })
      }
    }
  }
  return pairs
}

function alignSectionBlocks(options: {
  anchor: string
  baseEnSec: SectionNode
  newEnSec: SectionNode
  curZhSec: SectionNode
  baselineSec: BaselineSection | undefined
  curZhBodyText: string
}): {
  plan: DiffSectionPlan
  todos: ReviewTodo[]
  lockedSpans: { sectionAnchor: string; start: number; end: number; raw: string }[]
} {
  const { anchor, baseEnSec, newEnSec, curZhSec, baselineSec, curZhBodyText } = options
  const todos: ReviewTodo[] = []
  const lockedSpans: { sectionAnchor: string; start: number; end: number; raw: string }[] = []

  const zhEdited = baselineSec ? curZhSec.sha256 !== baselineSec.zh_sha256 : false
  const baseBlocks = baseEnSec.blocks
  const newBlocks = newEnSec.blocks
  const zhBlocks = curZhSec.blocks

  const anchorTriples = pairThreeWayAnchors(baseBlocks, newBlocks, zhBlocks)
  const sentinels = [
    ...anchorTriples,
    { baseIdx: baseBlocks.length, newIdx: newBlocks.length, zhIdx: zhBlocks.length },
  ]

  const emittedItems: DiffBlockItem[] = []
  let blockCounter = 0
  let codeCounter = 0
  let lastZhBlockEmitted: BlockUnit | null = null

  const nextBlockId = () => `sec:${anchor}:b${blockCounter++}`

  const computeLeadingRaw = (zhBlock: BlockUnit | null): string => {
    if (zhBlock && lastZhBlockEmitted && zhBlock.start >= lastZhBlockEmitted.end) {
      return curZhBodyText.slice(lastZhBlockEmitted.end, zhBlock.start)
    }
    if (emittedItems.length === 0) {
      return ''
    }
    return '\n\n'
  }

  const pushEmitted = (item: DiffBlockItem) => {
    emittedItems.push(item)
    if (
      item.curZh &&
      (item.status === 'unchanged' ||
        item.status === 'ambiguous' ||
        item.status === 'zh-only-preserved' ||
        item.status === 'manual-zh-conflict')
    ) {
      lastZhBlockEmitted = item.curZh
      lockedSpans.push({
        sectionAnchor: anchor,
        start: item.curZh.start,
        end: item.curZh.end,
        raw: item.curZh.raw,
      })
    } else {
      lastZhBlockEmitted = null
    }
  }

  const emitAddedNewBlock = (nb: BlockUnit) => {
    const blockId = nextBlockId()
    if (nb.kind === 'code') {
      pushEmitted({
        id: blockId,
        sectionAnchor: anchor,
        status: 'added',
        kind: nb.kind,
        channel: nb.channel,
        baseEn: null,
        newEn: nb,
        curZh: null,
        codeTriplet: {
          sectionAnchor: anchor,
          blockId,
          channel: nb.channel,
          ...(nb.tabValue !== undefined ? { tabValue: nb.tabValue } : {}),
          baseEn: null,
          newEn: nb,
          curZh: null,
          baselineCodeMeta: null,
        },
        leadingRaw: computeLeadingRaw(null),
      })
    } else {
      pushEmitted({
        id: blockId,
        sectionAnchor: anchor,
        status: 'added',
        kind: nb.kind,
        channel: nb.channel,
        baseEn: null,
        newEn: nb,
        curZh: null,
        leadingRaw: computeLeadingRaw(null),
      })
    }
  }

  let basePos = 0
  let newPos = 0
  let zhPos = 0

  for (const sentinel of sentinels) {
    const gapBaseProseIndices: number[] = []
    const gapBaseCodeIndices: number[] = []
    for (let bi = basePos; bi < sentinel.baseIdx; bi += 1) {
      if (baseBlocks[bi].kind === 'code') gapBaseCodeIndices.push(bi)
      else if (!isStructuralAnchorKind(baseBlocks[bi].kind)) gapBaseProseIndices.push(bi)
    }

    const gapZhProseIndices: number[] = []
    const gapZhCodeIndices: number[] = []
    for (let zi = zhPos; zi < sentinel.zhIdx; zi += 1) {
      const zb = zhBlocks[zi]
      if (zb.kind === 'fragment-include') {
        pushEmitted({
          id: nextBlockId(),
          sectionAnchor: anchor,
          status: 'zh-only-preserved',
          kind: zb.kind,
          channel: zb.channel,
          baseEn: null,
          newEn: null,
          curZh: zb,
          leadingRaw: computeLeadingRaw(zb),
        })
      } else if (zb.kind === 'code') {
        gapZhCodeIndices.push(zi)
      } else if (!isStructuralAnchorKind(zb.kind)) {
        gapZhProseIndices.push(zi)
      }
    }

    const emitGapCodePair = (bi: number | undefined, zi: number | undefined) => {
      const bb = bi !== undefined ? baseBlocks[bi] : null
      const zb = zi !== undefined ? zhBlocks[zi] : null
      const blockId = nextBlockId()

      if (!bb && zb) {
        pushEmitted({
          id: blockId,
          sectionAnchor: anchor,
          status: 'zh-only-preserved',
          kind: 'code',
          channel: zb.channel,
          baseEn: null,
          newEn: null,
          curZh: zb,
          codeTriplet: {
            sectionAnchor: anchor,
            blockId,
            channel: zb.channel,
            ...(zb.tabValue !== undefined ? { tabValue: zb.tabValue } : {}),
            baseEn: null,
            newEn: null,
            curZh: zb,
            baselineCodeMeta: null,
          },
          leadingRaw: computeLeadingRaw(zb),
        })
        return
      }

      const baselineCodeMeta = findBaselineCodeMeta(baselineSec, bb, codeCounter++)
      pushEmitted({
        id: blockId,
        sectionAnchor: anchor,
        status: 'removed',
        kind: 'code',
        channel: bb?.channel ?? zb?.channel ?? 'shared',
        baseEn: bb,
        newEn: null,
        curZh: zb,
        codeTriplet: {
          sectionAnchor: anchor,
          blockId,
          channel: bb?.channel ?? zb?.channel ?? 'shared',
          ...(bb?.tabValue !== undefined ? { tabValue: bb.tabValue } : {}),
          baseEn: bb,
          newEn: null,
          curZh: zb,
          baselineCodeMeta,
        },
        leadingRaw: zb ? computeLeadingRaw(zb) : computeLeadingRaw(null),
      })
    }

    const gapCodeHunks = alignByPredicate(
      gapBaseCodeIndices,
      gapZhCodeIndices,
      (bi, zi) => anchorKey(baseBlocks[bi]) === anchorKey(zhBlocks[zi]),
    )
    for (const codeHunk of gapCodeHunks) {
      if (codeHunk.kind === 'common' && codeHunk.baseIdx !== undefined && codeHunk.newIdx !== undefined) {
        emitGapCodePair(gapBaseCodeIndices[codeHunk.baseIdx], gapZhCodeIndices[codeHunk.newIdx])
      } else {
        for (let k = 0; k < Math.max(codeHunk.baseIndices.length, codeHunk.newIndices.length); k += 1) {
          const bi = codeHunk.baseIndices[k] !== undefined ? gapBaseCodeIndices[codeHunk.baseIndices[k]] : undefined
          const zi = codeHunk.newIndices[k] !== undefined ? gapZhCodeIndices[codeHunk.newIndices[k]] : undefined
          emitGapCodePair(bi, zi)
        }
      }
    }

    const gapNewIndices: number[] = []
    for (let ni = newPos; ni < sentinel.newIdx; ni += 1) {
      gapNewIndices.push(ni)
    }

    const gapNewProseIndices = gapNewIndices.filter(ni => !isStructuralAnchorKind(newBlocks[ni].kind))

    if (gapBaseProseIndices.length === 0 && gapZhProseIndices.length === 0) {
      for (const ni of gapNewIndices) {
        emitAddedNewBlock(newBlocks[ni])
      }
    } else {
      const gapBaseProse = gapBaseProseIndices.map(bi => baseBlocks[bi])
      const gapNewAll = gapNewIndices.map(ni => newBlocks[ni])

      const proseHunks = alignByPredicate(
        gapBaseProse,
        gapNewAll,
        (a, b) => a.kind === b.kind && a.sha256 === b.sha256,
      )

      const allBaseCommon = proseHunks.every(
        h => h.kind === 'common' || (h.baseIndices.length === 0 && h.newIndices.length > 0),
      )
      const hasAddedChannelWrappers = gapNewAll.some(nb => nb.kind === 'channel-open')

      if (allBaseCommon && gapBaseProseIndices.length === gapZhProseIndices.length) {
        let firstCommonNewOffset = gapNewAll.length
        for (const h of proseHunks) {
          if (h.kind === 'common' && h.newIdx !== undefined) {
            firstCommonNewOffset = h.newIdx
            break
          }
        }
        for (let offset = 0; offset < firstCommonNewOffset; offset += 1) {
          emitAddedNewBlock(gapNewAll[offset])
        }

        const matchedNewOffsets = new Set<number>()
        for (const h of proseHunks) {
          if (h.kind === 'common' && h.newIdx !== undefined) matchedNewOffsets.add(h.newIdx)
        }
        for (let k = 0; k < gapBaseProseIndices.length; k += 1) {
          const bi = gapBaseProseIndices[k]
          const zi = gapZhProseIndices[k]
          const zb = zhBlocks[zi]
          const commonHunk = proseHunks.find(h => h.kind === 'common' && h.baseIdx === k)
          const nb = commonHunk?.newIdx !== undefined ? gapNewAll[commonHunk.newIdx] : null
          pushEmitted({
            id: nextBlockId(),
            sectionAnchor: anchor,
            status: 'unchanged',
            kind: zb.kind,
            channel: nb?.channel ?? zb.channel,
            baseEn: baseBlocks[bi],
            newEn: nb,
            curZh: zb,
            leadingRaw: computeLeadingRaw(zb),
          })
        }

        for (let offset = firstCommonNewOffset; offset < gapNewAll.length; offset += 1) {
          if (!matchedNewOffsets.has(offset)) {
            emitAddedNewBlock(gapNewAll[offset])
          }
        }
      } else if (allBaseCommon && gapZhProseIndices.length !== gapBaseProseIndices.length) {
        let firstCommonNewOffset = gapNewAll.length
        for (const h of proseHunks) {
          if (h.kind === 'common' && h.newIdx !== undefined) {
            firstCommonNewOffset = h.newIdx
            break
          }
        }
        for (let offset = 0; offset < firstCommonNewOffset; offset += 1) {
          emitAddedNewBlock(gapNewAll[offset])
        }
        const matchedNewOffsets = new Set<number>()
        for (const h of proseHunks) {
          if (h.kind === 'common' && h.newIdx !== undefined) matchedNewOffsets.add(h.newIdx)
        }
        for (const zi of gapZhProseIndices) {
          const zb = zhBlocks[zi]
          pushEmitted({
            id: nextBlockId(),
            sectionAnchor: anchor,
            status: 'unchanged',
            kind: zb.kind,
            channel: zb.channel,
            baseEn: null,
            newEn: null,
            curZh: zb,
            leadingRaw: computeLeadingRaw(zb),
          })
        }
        for (let offset = firstCommonNewOffset; offset < gapNewAll.length; offset += 1) {
          if (!matchedNewOffsets.has(offset)) {
            emitAddedNewBlock(gapNewAll[offset])
          }
        }
        if (hasAddedChannelWrappers && gapZhProseIndices.length > gapBaseProseIndices.length) {
          todos.push({
            id: `interstitial-zh:${anchor}:${todos.length}`,
            kind: 'interstitial-zh',
            sectionAnchor: anchor,
            title: '确认中文独有提示在新通道（UAT/NEXT）中的摆放位置',
            details:
              '中文在原段落之间包含独有提示，而英文新增了 NEXT 通道改写。工具已在当前版（Prod）逐字保留原中文及提示，请确认该提示在 NEXT 候选稿中的位置。',
            enBefore: gapBaseProse.map(b => b.raw).join('\n\n'),
            enAfter: gapNewAll
              .filter(nb => nb.channel === 'next' && !isStructuralAnchorKind(nb.kind))
              .map(nb => nb.raw)
              .join('\n\n'),
            zhCurrent: gapZhProseIndices.map(zi => zhBlocks[zi].raw).join('\n\n'),
          })
        }
      } else {
        const isInterstitialMismatch = gapZhProseIndices.length !== gapBaseProseIndices.length
        const is1To1Prose =
          !isInterstitialMismatch &&
          gapBaseProseIndices.length === gapNewProseIndices.length &&
          gapBaseProseIndices.every((bi, idx) => {
            const ni = gapNewProseIndices[idx]
            const zi = gapZhProseIndices[idx]
            return (
              baseBlocks[bi].kind === newBlocks[ni].kind &&
              baseBlocks[bi].kind === zhBlocks[zi].kind
            )
          })

        if (is1To1Prose) {
          let newCursor = 0
          for (let k = 0; k < gapBaseProseIndices.length; k += 1) {
            const bi = gapBaseProseIndices[k]
            const ni = gapNewProseIndices[k]
            const zi = gapZhProseIndices[k]
            while (newCursor < gapNewIndices.length && gapNewIndices[newCursor] < ni) {
              emitAddedNewBlock(newBlocks[gapNewIndices[newCursor]])
              newCursor += 1
            }
            newCursor += 1

            const bb = baseBlocks[bi]
            const nb = newBlocks[ni]
            const zb = zhBlocks[zi]

            if (bb.sha256 === nb.sha256) {
              pushEmitted({
                id: nextBlockId(),
                sectionAnchor: anchor,
                status: 'unchanged',
                kind: zb.kind,
                channel: nb.channel,
                baseEn: bb,
                newEn: nb,
                curZh: zb,
                leadingRaw: computeLeadingRaw(zb),
              })
            } else if (zhEdited) {
              const blockId = nextBlockId()
              pushEmitted({
                id: blockId,
                sectionAnchor: anchor,
                status: 'manual-zh-conflict',
                kind: zb.kind,
                channel: nb.channel,
                baseEn: bb,
                newEn: nb,
                curZh: zb,
                leadingRaw: computeLeadingRaw(zb),
                ambiguousReason: 'Section contains human ZH edits overlapping an EN change',
              })
              todos.push({
                id: `manual-zh-conflict:${blockId}`,
                kind: 'manual-zh-conflict',
                sectionAnchor: anchor,
                blockId,
                title: '人工修订与英文更新重叠，已保留中文原文待合并',
                details:
                  '该小节存在人工修订，且对应英文段落同时发生变化。为避免覆盖人工稿，已保留当前中文原文，请主审确认合并。',
                enBefore: bb.raw,
                enAfter: nb.raw,
                zhCurrent: zb.raw,
              })
            } else {
              pushEmitted({
                id: nextBlockId(),
                sectionAnchor: anchor,
                status: 'modified',
                kind: nb.kind,
                channel: nb.channel,
                baseEn: bb,
                newEn: nb,
                curZh: zb,
                leadingRaw: computeLeadingRaw(null),
              })
            }
          }
          while (newCursor < gapNewIndices.length) {
            emitAddedNewBlock(newBlocks[gapNewIndices[newCursor]])
            newCursor += 1
          }
        } else {
          const reasonKind: ReviewTodoKind = isInterstitialMismatch
            ? 'interstitial-zh'
            : gapNewProseIndices.length < gapBaseProseIndices.length
              ? 'ambiguous-merge'
              : 'ambiguous-split'

          const firstBlockId = `sec:${anchor}:b${blockCounter}`
          for (const zi of gapZhProseIndices) {
            const zb = zhBlocks[zi]
            pushEmitted({
              id: nextBlockId(),
              sectionAnchor: anchor,
              status: 'ambiguous',
              kind: zb.kind,
              channel: zb.channel,
              baseEn: gapBaseProseIndices[0] !== undefined ? baseBlocks[gapBaseProseIndices[0]] : null,
              newEn: gapNewProseIndices[0] !== undefined ? newBlocks[gapNewProseIndices[0]] : null,
              curZh: zb,
              leadingRaw: computeLeadingRaw(zb),
              ambiguousReason: reasonKind,
            })
          }

          todos.push({
            id: `${reasonKind}:${firstBlockId}`,
            kind: reasonKind,
            sectionAnchor: anchor,
            blockId: firstBlockId,
            title:
              reasonKind === 'interstitial-zh'
                ? '确认中文独有提示或夹层段落的摆放位置'
                : reasonKind === 'ambiguous-merge'
                  ? '英文合并段落，请确认中文合并方式'
                  : '英文拆分或重组段落，请确认中文对应关系',
            details:
              '由于英文存在拆并段或当前区间含中文独有段落，工具已逐字保留原中文正文未改写，请结合改前/改后英文确认调整。',
            enBefore: gapBaseProseIndices.map(bi => baseBlocks[bi].raw).join('\n\n'),
            enAfter: gapNewIndices.map(ni => newBlocks[ni].raw).join('\n\n'),
            zhCurrent: gapZhProseIndices.map(zi => zhBlocks[zi].raw).join('\n\n'),
          })
        }
      }
    }

    if (sentinel.baseIdx < baseBlocks.length) {
      const bb = baseBlocks[sentinel.baseIdx]
      const nb = newBlocks[sentinel.newIdx]
      const zb = zhBlocks[sentinel.zhIdx]

      if (bb.kind === 'code') {
        const blockId = nextBlockId()
        const baselineCodeMeta = findBaselineCodeMeta(baselineSec, bb, codeCounter++)
        const triplet: AlignedCodeTriplet = {
          sectionAnchor: anchor,
          blockId,
          channel: nb.channel,
          ...(nb.tabValue !== undefined
            ? { tabValue: nb.tabValue }
            : zb.tabValue !== undefined
              ? { tabValue: zb.tabValue }
              : {}),
          baseEn: bb,
          newEn: nb,
          curZh: zb,
          baselineCodeMeta,
        }
        const status: DiffUnitStatus = bb.sha256 === nb.sha256 ? 'unchanged' : 'modified'
        pushEmitted({
          id: blockId,
          sectionAnchor: anchor,
          status,
          kind: 'code',
          channel: nb.channel,
          baseEn: bb,
          newEn: nb,
          curZh: zb,
          codeTriplet: triplet,
          leadingRaw: status === 'unchanged' ? computeLeadingRaw(zb) : computeLeadingRaw(null),
        })
      } else if (bb.kind === 'heading') {
        if (bb.sha256 === nb.sha256) {
          pushEmitted({
            id: nextBlockId(),
            sectionAnchor: anchor,
            status: 'unchanged',
            kind: 'heading',
            channel: nb.channel,
            baseEn: bb,
            newEn: nb,
            curZh: zb,
            leadingRaw: computeLeadingRaw(zb),
          })
        } else if (zhEdited) {
          const blockId = nextBlockId()
          pushEmitted({
            id: blockId,
            sectionAnchor: anchor,
            status: 'manual-zh-conflict',
            kind: 'heading',
            channel: nb.channel,
            baseEn: bb,
            newEn: nb,
            curZh: zb,
            leadingRaw: computeLeadingRaw(zb),
          })
          todos.push({
            id: `manual-zh-conflict:${blockId}`,
            kind: 'manual-zh-conflict',
            sectionAnchor: anchor,
            blockId,
            title: '小节标题存在人工修订与英文变更冲突',
            details: '标题对应的英文有变化且该小节含人工修订，已保留原中文标题。',
            enBefore: bb.raw,
            enAfter: nb.raw,
            zhCurrent: zb.raw,
          })
        } else {
          pushEmitted({
            id: nextBlockId(),
            sectionAnchor: anchor,
            status: 'modified',
            kind: 'heading',
            channel: nb.channel,
            baseEn: bb,
            newEn: nb,
            curZh: zb,
            leadingRaw: computeLeadingRaw(null),
          })
        }
      } else {
        pushEmitted({
          id: nextBlockId(),
          sectionAnchor: anchor,
          status: 'unchanged',
          kind: zb.kind,
          channel: nb.channel,
          baseEn: bb,
          newEn: nb,
          curZh: zb,
          leadingRaw: computeLeadingRaw(zb),
        })
      }
    }

    basePos = sentinel.baseIdx + 1
    newPos = sentinel.newIdx + 1
    zhPos = sentinel.zhIdx + 1
  }

  // Populate adjacentZhBefore / adjacentZhAfter for modified & added prose blocks
  for (let idx = 0; idx < emittedItems.length; idx += 1) {
    const item = emittedItems[idx]
    if (item.status !== 'modified' && item.status !== 'added') continue
    if (item.kind === 'code' || item.kind === 'channel-open' || item.kind === 'channel-close' || item.kind === 'jsx-tag') {
      continue
    }
    for (let p = idx - 1; p >= 0; p -= 1) {
      if (emittedItems[p].curZh && emittedItems[p].kind !== 'code') {
        item.adjacentZhBefore = clipContext(emittedItems[p].curZh!.raw)
        break
      }
    }
    for (let n = idx + 1; n < emittedItems.length; n += 1) {
      if (emittedItems[n].curZh && emittedItems[n].kind !== 'code') {
        item.adjacentZhAfter = clipContext(emittedItems[n].curZh!.raw)
        break
      }
    }
  }

  const hasConflict = emittedItems.some(it => it.status === 'manual-zh-conflict')
  const hasAnyNonUnchanged = emittedItems.some(
    it => it.status !== 'unchanged' && it.status !== 'zh-only-preserved',
  )
  const sectionStatus: DiffSectionPlan['status'] = !hasAnyNonUnchanged
    ? 'unchanged'
    : emittedItems.every(it => it.status === 'ambiguous' || it.status === 'unchanged' || it.status === 'zh-only-preserved') &&
        emittedItems.some(it => it.status === 'ambiguous')
      ? 'ambiguous'
      : hasConflict && !emittedItems.some(it => it.status === 'modified' || it.status === 'added')
        ? 'manual-zh-conflict'
        : 'modified'

  return {
    plan: {
      anchor,
      status: sectionStatus,
      baseEnSection: baseEnSec,
      newEnSection: newEnSec,
      curZhSection: curZhSec,
      ...(sectionStatus === 'unchanged' || sectionStatus === 'ambiguous' || sectionStatus === 'manual-zh-conflict'
        ? {
            lockedRawSpan: {
              start: curZhSec.start,
              end: curZhSec.end,
              raw: curZhSec.raw,
            },
          }
        : {}),
      blocks: emittedItems,
    },
    todos,
    lockedSpans:
      sectionStatus === 'unchanged' || sectionStatus === 'ambiguous' || sectionStatus === 'manual-zh-conflict'
        ? [{ sectionAnchor: anchor, start: curZhSec.start, end: curZhSec.end, raw: curZhSec.raw }]
        : lockedSpans,
  }
}

export function computeThreeWayDiff(input: {
  baseEn: ParsedDocStructure | null
  newEn: ParsedDocStructure
  curZh: ParsedDocStructure | null
  baseline: BaselineJson | null
}): ThreeWayDiffResult {
  const { baseEn, newEn, curZh, baseline } = input

  // 1. Initial translation
  if (baseEn === null && curZh === null) {
    const sections: DiffSectionPlan[] = newEn.sections.map(sec => {
      const blocks: DiffBlockItem[] = sec.blocks.map((b, idx) => {
        const blockId = `sec:${sec.anchor}:b${idx}`
        const triplet: AlignedCodeTriplet | undefined =
          b.kind === 'code'
            ? {
                sectionAnchor: sec.anchor,
                blockId,
                channel: b.channel,
                ...(b.tabValue !== undefined ? { tabValue: b.tabValue } : {}),
                baseEn: null,
                newEn: b,
                curZh: null,
                baselineCodeMeta: null,
              }
            : undefined
        return {
          id: blockId,
          sectionAnchor: sec.anchor,
          status: 'added',
          kind: b.kind,
          channel: b.channel,
          baseEn: null,
          newEn: b,
          curZh: null,
          ...(triplet ? { codeTriplet: triplet } : {}),
          leadingRaw: idx === 0 ? '' : '\n\n',
        }
      })
      return {
        anchor: sec.anchor,
        status: 'added',
        baseEnSection: null,
        newEnSection: sec,
        curZhSection: null,
        blocks,
      }
    })

    return {
      isInitialTranslation: true,
      hasSubstantiveChanges: true,
      manualZhDriftDetected: false,
      channelImpact: { currentChanged: true, nextChanged: true },
      sections,
      todos: [],
      lockedSpans: [],
    }
  }

  if (!baseEn || !curZh) {
    throw new Error('computeThreeWayDiff requires both baseEn and curZh for non-initial diffs')
  }

  const baseCurrSha = sha256Hex(projectChannelText(baseEn.bodyText, 'current'))
  const newCurrSha = sha256Hex(projectChannelText(newEn.bodyText, 'current'))
  const baseNextSha = sha256Hex(projectChannelText(baseEn.bodyText, 'next'))
  const newNextSha = sha256Hex(projectChannelText(newEn.bodyText, 'next'))
  const channelImpact = {
    currentChanged: baseCurrSha !== newCurrSha,
    nextChanged: baseNextSha !== newNextSha,
  }

  const manualZhDriftDetected = detectManualZhDrift(curZh, baseline)

  // 2. Whole-doc fast check when EN body is byte-identical
  if (baseEn.bodySha256 === newEn.bodySha256) {
    const lockedSpans: ThreeWayDiffResult['lockedSpans'] = []
    const sections: DiffSectionPlan[] = curZh.sections.map(zhSec => {
      lockedSpans.push({
        sectionAnchor: zhSec.anchor,
        start: zhSec.start,
        end: zhSec.end,
        raw: zhSec.raw,
      })
      return {
        anchor: zhSec.anchor,
        status: 'unchanged',
        baseEnSection: baseEn.sections.find(s => s.anchor === zhSec.anchor) ?? null,
        newEnSection: newEn.sections.find(s => s.anchor === zhSec.anchor) ?? null,
        curZhSection: zhSec,
        lockedRawSpan: { start: zhSec.start, end: zhSec.end, raw: zhSec.raw },
        blocks: zhSec.blocks.map((zb, idx) => ({
          id: `sec:${zhSec.anchor}:b${idx}`,
          sectionAnchor: zhSec.anchor,
          status: 'unchanged',
          kind: zb.kind,
          channel: zb.channel,
          baseEn: null,
          newEn: null,
          curZh: zb,
          leadingRaw: idx === 0 ? '' : curZh.bodyText.slice(zhSec.blocks[idx - 1].end, zb.start),
        })),
      }
    })
    return {
      isInitialTranslation: false,
      hasSubstantiveChanges: false,
      manualZhDriftDetected,
      channelImpact,
      sections,
      todos: [],
      lockedSpans,
    }
  }

  // 3. Section-level alignment baseEn <-> newEn by anchor
  const sectionHunks = alignByPredicate(
    baseEn.sections,
    newEn.sections,
    (a, b) => a.anchor === b.anchor,
  )

  const curZhByAnchor = new Map(curZh.sections.map(s => [s.anchor, s]))
  const baselineByAnchor = new Map(baseline?.sections.map(s => [s.anchor, s]) ?? [])
  const baseAnchorsSet = new Set(baseEn.sections.map(s => s.anchor))
  const newAnchorsSet = new Set(newEn.sections.map(s => s.anchor))

  const plans: DiffSectionPlan[] = []
  const todos: ReviewTodo[] = []
  const lockedSpans: ThreeWayDiffResult['lockedSpans'] = []
  const emittedZhAnchors = new Set<string>()

  const emitZhOnlyPreservedBefore = (anchor: string) => {
    // Preserve any ZH-only sections appearing up to `anchor` in curZh order
    for (const zhSec of curZh.sections) {
      if (zhSec.anchor === anchor) break
      if (emittedZhAnchors.has(zhSec.anchor)) continue
      if (!baseAnchorsSet.has(zhSec.anchor) && !newAnchorsSet.has(zhSec.anchor)) {
        emittedZhAnchors.add(zhSec.anchor)
        lockedSpans.push({
          sectionAnchor: zhSec.anchor,
          start: zhSec.start,
          end: zhSec.end,
          raw: zhSec.raw,
        })
        plans.push({
          anchor: zhSec.anchor,
          status: 'zh-only-preserved',
          baseEnSection: null,
          newEnSection: null,
          curZhSection: zhSec,
          lockedRawSpan: { start: zhSec.start, end: zhSec.end, raw: zhSec.raw },
          blocks: zhSec.blocks.map((zb, idx) => ({
            id: `sec:${zhSec.anchor}:b${idx}`,
            sectionAnchor: zhSec.anchor,
            status: 'zh-only-preserved',
            kind: zb.kind,
            channel: zb.channel,
            baseEn: null,
            newEn: null,
            curZh: zb,
            leadingRaw: idx === 0 ? '' : curZh.bodyText.slice(zhSec.blocks[idx - 1].end, zb.start),
          })),
        })
      }
    }
  }

  for (const hunk of sectionHunks) {
    if (hunk.kind === 'common' && hunk.baseIdx !== undefined && hunk.newIdx !== undefined) {
      const baseSec = baseEn.sections[hunk.baseIdx]
      const newSec = newEn.sections[hunk.newIdx]
      const zhSec = curZhByAnchor.get(baseSec.anchor) ?? null
      const baselineSec = baselineByAnchor.get(baseSec.anchor)

      if (zhSec) {
        emitZhOnlyPreservedBefore(baseSec.anchor)
        emittedZhAnchors.add(zhSec.anchor)
      }

      if (!zhSec) {
        // Section was missing in curZh: treat as added
        const blocks: DiffBlockItem[] = newSec.blocks.map((b, idx) => {
          const blockId = `sec:${newSec.anchor}:b${idx}`
          return {
            id: blockId,
            sectionAnchor: newSec.anchor,
            status: 'added',
            kind: b.kind,
            channel: b.channel,
            baseEn: null,
            newEn: b,
            curZh: null,
            ...(b.kind === 'code'
              ? {
                  codeTriplet: {
                    sectionAnchor: newSec.anchor,
                    blockId,
                    channel: b.channel,
                    ...(b.tabValue !== undefined ? { tabValue: b.tabValue } : {}),
                    baseEn: null,
                    newEn: b,
                    curZh: null,
                    baselineCodeMeta: null,
                  },
                }
              : {}),
            leadingRaw: idx === 0 ? '' : '\n\n',
          }
        })
        plans.push({
          anchor: newSec.anchor,
          status: 'added',
          baseEnSection: baseSec,
          newEnSection: newSec,
          curZhSection: null,
          blocks,
        })
        continue
      }

      if (baseSec.sha256 === newSec.sha256) {
        lockedSpans.push({
          sectionAnchor: zhSec.anchor,
          start: zhSec.start,
          end: zhSec.end,
          raw: zhSec.raw,
        })
        plans.push({
          anchor: zhSec.anchor,
          status: 'unchanged',
          baseEnSection: baseSec,
          newEnSection: newSec,
          curZhSection: zhSec,
          lockedRawSpan: { start: zhSec.start, end: zhSec.end, raw: zhSec.raw },
          blocks: zhSec.blocks.map((zb, idx) => ({
            id: `sec:${zhSec.anchor}:b${idx}`,
            sectionAnchor: zhSec.anchor,
            status: 'unchanged',
            kind: zb.kind,
            channel: zb.channel,
            baseEn: baseSec.blocks[idx] ?? null,
            newEn: newSec.blocks[idx] ?? null,
            curZh: zb,
            leadingRaw: idx === 0 ? '' : curZh.bodyText.slice(zhSec.blocks[idx - 1].end, zb.start),
          })),
        })
      } else {
        const aligned = alignSectionBlocks({
          anchor: newSec.anchor,
          baseEnSec: baseSec,
          newEnSec: newSec,
          curZhSec: zhSec,
          baselineSec,
          curZhBodyText: curZh.bodyText,
        })
        plans.push(aligned.plan)
        todos.push(...aligned.todos)
        lockedSpans.push(...aligned.lockedSpans)
      }
      continue
    }

    // Section change hunk (unmatched baseEn / newEn sections between matched anchors)
    const unmatchedBase = hunk.baseIndices.map(i => baseEn.sections[i])
    const unmatchedNew = hunk.newIndices.map(i => newEn.sections[i])

    if (unmatchedBase.length > 0 && unmatchedNew.length > 0) {
      // Heading rename (1 -> 1) or section split/merge -> preserve curZh verbatim + ReviewTodo!
      let todoKind: ReviewTodoKind = 'ambiguous-split'
      if (unmatchedBase.length === 1 && unmatchedNew.length === 1) {
        todoKind = 'heading-rename'
      } else if (unmatchedBase.length > unmatchedNew.length) {
        todoKind = 'ambiguous-merge'
      }

      const zhSectionsInHunk = unmatchedBase
        .map(bs => curZhByAnchor.get(bs.anchor))
        .filter((s): s is SectionNode => Boolean(s))

      if (zhSectionsInHunk.length > 0) {
        emitZhOnlyPreservedBefore(zhSectionsInHunk[0].anchor)
      }

      for (const zhSec of zhSectionsInHunk) {
        emittedZhAnchors.add(zhSec.anchor)
        lockedSpans.push({
          sectionAnchor: zhSec.anchor,
          start: zhSec.start,
          end: zhSec.end,
          raw: zhSec.raw,
        })
        plans.push({
          anchor: zhSec.anchor,
          status: 'ambiguous',
          baseEnSection: unmatchedBase.find(b => b.anchor === zhSec.anchor) ?? null,
          newEnSection: unmatchedNew[0] ?? null,
          curZhSection: zhSec,
          lockedRawSpan: { start: zhSec.start, end: zhSec.end, raw: zhSec.raw },
          blocks: zhSec.blocks.map((zb, idx) => ({
            id: `sec:${zhSec.anchor}:b${idx}`,
            sectionAnchor: zhSec.anchor,
            status: 'ambiguous',
            kind: zb.kind,
            channel: zb.channel,
            baseEn: null,
            newEn: null,
            curZh: zb,
            leadingRaw: idx === 0 ? '' : curZh.bodyText.slice(zhSec.blocks[idx - 1].end, zb.start),
            ambiguousReason: todoKind,
          })),
        })
      }

      const primaryAnchor = unmatchedNew[0]?.anchor ?? unmatchedBase[0]?.anchor ?? '__h1__'
      todos.push({
        id: `${todoKind}:${primaryAnchor}:${todos.length}`,
        kind: todoKind,
        sectionAnchor: primaryAnchor,
        title:
          todoKind === 'heading-rename'
            ? `英文小节标题或锚点变更（${unmatchedBase[0]?.anchor} -> ${unmatchedNew[0]?.anchor}）`
            : todoKind === 'ambiguous-merge'
              ? '英文合并多个小节，请确认中文小节结构'
              : '英文拆分小节，请确认中文小节结构',
        details:
          '检测到小节级别的重命名或拆并，为保护现有锚点与人工修订，已逐字保留当前中文小节，请主审确认合并方案。',
        enBefore: unmatchedBase.map(s => s.raw).join('\n\n'),
        enAfter: unmatchedNew.map(s => s.raw).join('\n\n'),
        zhCurrent: zhSectionsInHunk.map(s => s.raw).join('\n\n'),
      })
    } else if (unmatchedBase.length > 0 && unmatchedNew.length === 0) {
      // Removed EN sections
      for (const baseSec of unmatchedBase) {
        const zhSec = curZhByAnchor.get(baseSec.anchor) ?? null
        const baselineSec = baselineByAnchor.get(baseSec.anchor)
        if (zhSec) emittedZhAnchors.add(zhSec.anchor)
        const zhEdited = zhSec && baselineSec ? zhSec.sha256 !== baselineSec.zh_sha256 : false
        if (zhSec && zhEdited) {
          emitZhOnlyPreservedBefore(zhSec.anchor)
          lockedSpans.push({
            sectionAnchor: zhSec.anchor,
            start: zhSec.start,
            end: zhSec.end,
            raw: zhSec.raw,
          })
          plans.push({
            anchor: zhSec.anchor,
            status: 'manual-zh-conflict',
            baseEnSection: baseSec,
            newEnSection: null,
            curZhSection: zhSec,
            lockedRawSpan: { start: zhSec.start, end: zhSec.end, raw: zhSec.raw },
            blocks: [],
          })
          todos.push({
            id: `manual-zh-conflict:${zhSec.anchor}`,
            kind: 'manual-zh-conflict',
            sectionAnchor: zhSec.anchor,
            title: `英文删除小节 ${zhSec.anchor}，但中文存在人工修订`,
            details: '已保留该小节中文原文，请主审确认是否删除或保留。',
            enBefore: baseSec.raw,
            enAfter: '',
            zhCurrent: zhSec.raw,
          })
        } else {
          plans.push({
            anchor: baseSec.anchor,
            status: 'removed',
            baseEnSection: baseSec,
            newEnSection: null,
            curZhSection: zhSec,
            blocks: [],
          })
        }
      }
    } else if (unmatchedNew.length > 0 && unmatchedBase.length === 0) {
      // Added EN sections
      for (const newSec of unmatchedNew) {
        const blocks: DiffBlockItem[] = newSec.blocks.map((b, idx) => {
          const blockId = `sec:${newSec.anchor}:b${idx}`
          return {
            id: blockId,
            sectionAnchor: newSec.anchor,
            status: 'added',
            kind: b.kind,
            channel: b.channel,
            baseEn: null,
            newEn: b,
            curZh: null,
            ...(b.kind === 'code'
              ? {
                  codeTriplet: {
                    sectionAnchor: newSec.anchor,
                    blockId,
                    channel: b.channel,
                    ...(b.tabValue !== undefined ? { tabValue: b.tabValue } : {}),
                    baseEn: null,
                    newEn: b,
                    curZh: null,
                    baselineCodeMeta: null,
                  },
                }
              : {}),
            leadingRaw: idx === 0 ? '' : '\n\n',
          }
        })
        plans.push({
          anchor: newSec.anchor,
          status: 'added',
          baseEnSection: null,
          newEnSection: newSec,
          curZhSection: null,
          blocks,
        })
      }
    }
  }

  // Any trailing ZH-only sections in curZh
  for (const zhSec of curZh.sections) {
    if (emittedZhAnchors.has(zhSec.anchor)) continue
    if (!baseAnchorsSet.has(zhSec.anchor) && !newAnchorsSet.has(zhSec.anchor)) {
      emittedZhAnchors.add(zhSec.anchor)
      lockedSpans.push({
        sectionAnchor: zhSec.anchor,
        start: zhSec.start,
        end: zhSec.end,
        raw: zhSec.raw,
      })
      plans.push({
        anchor: zhSec.anchor,
        status: 'zh-only-preserved',
        baseEnSection: null,
        newEnSection: null,
        curZhSection: zhSec,
        lockedRawSpan: { start: zhSec.start, end: zhSec.end, raw: zhSec.raw },
        blocks: zhSec.blocks.map((zb, idx) => ({
          id: `sec:${zhSec.anchor}:b${idx}`,
          sectionAnchor: zhSec.anchor,
          status: 'zh-only-preserved',
          kind: zb.kind,
          channel: zb.channel,
          baseEn: null,
          newEn: null,
          curZh: zb,
          leadingRaw: idx === 0 ? '' : curZh.bodyText.slice(zhSec.blocks[idx - 1].end, zb.start),
        })),
      })
    }
  }

  const hasSubstantiveChanges = plans.some(
    p => p.status !== 'unchanged' && p.status !== 'zh-only-preserved',
  )

  return {
    isInitialTranslation: false,
    hasSubstantiveChanges,
    manualZhDriftDetected,
    channelImpact,
    sections: plans,
    todos,
    lockedSpans,
  }
}
