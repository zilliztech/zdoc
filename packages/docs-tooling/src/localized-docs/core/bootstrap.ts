import { parseYaml } from '../../shared-docs/core/yaml.ts'
import {
  extractFirstH1,
  extractFirstParagraph,
  validateChannelTags,
  validateSourceShell,
} from './assemble.ts'
import { parseBaselineJson, validateBaselineConsistency } from './baseline.ts'
import {
  applyTier2CodeRules,
  DEFAULT_CODE_SYNC_RULES,
  type CodeSyncRule,
} from './code-sync.ts'
import { parseLocalizedPageConfig, validatePageId } from './config.ts'
import type { ReviewTodo } from './diff.ts'
import {
  executeDraftEngine,
  type DraftLlmProvider,
  type LocaleContractSupport,
  type VerifiedEnSnapshot,
} from './draft.ts'
import {
  REVIEW_TODOS_END_MARKER,
  REVIEW_TODOS_START_MARKER,
} from './pr-body.ts'
import {
  computeChannelDigests,
  parseStructuredDocument,
  type BlockUnit,
  type ParsedDocStructure,
  type SectionNode,
} from './sections.ts'
import { matchEsmImportAt } from './strip-en.ts'
import type {
  BaselineCodeBlock,
  BaselineJson,
  BaselineSection,
  DiagnosticContext,
  LocalizedDocsError,
  ManualId,
  PageConfig,
  SyncPolicy,
} from './types.ts'
import { localizedError, sha256Hex } from './types.ts'
import {
  computeLineStarts,
  maskCodeAndComments,
  scanUiTags,
  validateUiTags,
} from './ui-tags.ts'

export type BootstrapPageMode = 'incremental' | 'manual'

export interface StrippedLegacyZhResult {
  title?: string
  rawTitle?: string
  description?: string
  rawDescription?: string
  keywords?: string[]
  strippedFrontMatterKeys: string[]
  strippedImports: string[]
  body: string
  sourceMd: string
  sha256: string
}

export interface BootstrapHeadingInfo {
  level: number
  text: string
  anchor: string
  hasExplicitAnchor: boolean
  line: number
}

export type AnchorComparisonStatus =
  | 'matched'
  | 'anchor-mismatch'
  | 'missing-in-zh'
  | 'zh-only'

export interface BootstrapAnchorComparison {
  status: AnchorComparisonStatus
  en?: BootstrapHeadingInfo
  zh?: BootstrapHeadingInfo
  note: string
}

export interface BootstrapCodeBlockAnalysis {
  sectionAnchor: string
  ordinal: number
  lang: string | null
  tabValue?: string
  customizedForZh: boolean
  matchKind: 'exact' | 'tier2-mapped' | 'customized' | 'zh-only'
  appliedRuleIds: string[]
  enSha256: string
  zhSha256: string
}

export type ResidualAssetCategory =
  | 'feishu-image'
  | 'global-image-bed'
  | 'oss-image'
  | 'local-relative-image'
  | 'feishu-link'
  | 'legacy-site-link'
  | 'global-site-link'
  | 'legacy-relative-link'

export interface ResidualAssetFinding {
  line: number
  kind: 'image' | 'link'
  category: ResidualAssetCategory
  url: string
  label: string
  reason: string
}

export interface SuspectedStaleSection {
  enAnchor: string
  zhAnchor: string
  reasons: string[]
}

export interface BootstrapGapAnalysis {
  missingEnSections: {
    anchor: string
    headingLevel: number
    headingText: string
  }[]
  suspectedStaleSections: SuspectedStaleSection[]
  draftApplied: boolean
  draftedSectionAnchors: string[]
  providerUsed?: { name: string; model?: string; unitCount: number }
  localeWarnings: string[]
  gapTodos: ReviewTodo[]
}

export interface BootstrapPageInput {
  pageId: string
  sharedPage?: string
  manual?: ManualId
  mode?: BootstrapPageMode
  syncPolicy?: SyncPolicy
  enSnapshot: VerifiedEnSnapshot
  zhLegacyRaw: string
  zhLegacyFileLabel?: string
  alignGap?: boolean
  llmProvider?: DraftLlmProvider
  contractSupport?: LocaleContractSupport
  codeSyncRules?: readonly CodeSyncRule[]
  reviewedPr?: number
  nowIso?: string
}

export interface BootstrapPageOutput {
  pageId: string
  sharedPage: string
  pageConfig: PageConfig
  pageYamlText: string
  sourceMd: string
  baseline: BaselineJson
  baselineJsonText: string
  reportMd: string
  strippedLegacyZh: StrippedLegacyZhResult
  anchorComparisons: BootstrapAnchorComparison[]
  codeBlockAnalyses: BootstrapCodeBlockAnalysis[]
  customizedCodeBlockCount: number
  residualImages: ResidualAssetFinding[]
  legacyLinks: ResidualAssetFinding[]
  gapAnalysis: BootstrapGapAnalysis
}

const TITLE_SUFFIX_RE = / \| (?:Cloud|BYOC)$/
const DOCUSAURUS_IMPORT_SPECIFIER_RE = /^@(?:theme|site|docusaurus)\//
const HEADING_RE = /^(#{1,6})[ \t]+(.+?)[ \t]*$/
const EXPLICIT_ANCHOR_RE = /\s*(?:\\)?\{#([A-Za-z0-9][\w.-]*)\}\s*$/

const FEISHU_HOST_RE = /(?:^|\.)(?:feishu\.cn|larksuite\.com|larkoffice\.com|feishucdn\.com|byteimg\.com)$/i
const GLOBAL_IMAGE_HOST_RE = /(?:^|\.)(?:s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com|assets\.zilliz\.com)$/i
const OSS_IMAGE_HOST_RE = /(?:^|\.)aliyuncs\.com$/i
const LEGACY_CN_SITE_HOST_RE = /^docs\.zilliz\.com\.cn$/i
const GLOBAL_SITE_HOST_RE = /^(?:docs|cloud)\.zilliz\.com$/i

function stripSiteSuffix(value: string): { value: string; raw: string } {
  return {
    value: value.replace(TITLE_SUFFIX_RE, '').trim(),
    raw: value,
  }
}

function stripLeadingWsAndInlineBlockComments(text: string): string {
  let i = 0
  while (i < text.length) {
    if (text[i] === ' ' || text[i] === '\t') {
      i += 1
      continue
    }
    if (text[i] === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      if (end < 0) break
      i = end + 2
      continue
    }
    break
  }
  return text.slice(i)
}

function isOnlyWhitespaceOrComments(text: string): boolean {
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
      i += 1
      continue
    }
    if (ch === '/' && text[i + 1] === '/') {
      return true
    }
    if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      if (end < 0) return false
      i = end + 2
      continue
    }
    return false
  }
  return true
}

function buildMinimalSourceFrontMatter(options: {
  title?: string
  description?: string
  keywords?: string[]
}): string {
  const lines: string[] = []
  if (options.title !== undefined && options.title.trim().length > 0) {
    lines.push(`title: ${JSON.stringify(options.title.trim())}`)
  }
  if (options.description !== undefined && options.description.trim().length > 0) {
    lines.push(`description: ${JSON.stringify(options.description.trim())}`)
  }
  if (options.keywords && options.keywords.length > 0) {
    lines.push('keywords:')
    for (const kw of options.keywords) {
      lines.push(`  - ${JSON.stringify(kw)}`)
    }
  }
  if (lines.length === 0) return ''
  return `---\n${lines.join('\n')}\n---\n\n`
}

export function stripLegacyZhShell(
  rawMdx: string,
  context: DiagnosticContext = {},
): StrippedLegacyZhResult | { errors: LocalizedDocsError[] } {
  const normalized = rawMdx.replace(/^\uFEFF/, '').replace(/\r\n|\r/g, '\n')
  const lines = normalized.split('\n')

  let bodyStart = 0
  let title: string | undefined
  let rawTitle: string | undefined
  let description: string | undefined
  let rawDescription: string | undefined
  let keywords: string[] | undefined
  const strippedFrontMatterKeys: string[] = []

  if (/^---[ \t]*$/.test(lines[0] ?? '')) {
    const end = lines.findIndex((line, index) => index > 0 && /^(?:---|\.\.\.)[ \t]*$/.test(line))
    if (end < 0) {
      return {
        errors: [
          localizedError(
            'ZH_LEGACY_SHELL_INVALID',
            'Unclosed YAML front matter in legacy ZH Markdown/MDX',
            context,
            1,
          ),
        ],
      }
    }
    bodyStart = end + 1
    const yamlText = lines.slice(1, end).join('\n')
    if (yamlText.trim().length > 0) {
      const parsed = parseYaml(yamlText, 'ZH_LEGACY_SHELL_INVALID', context)
      if ('errors' in parsed) {
        return {
          errors: parsed.errors.map(error => ({
            ...error,
            line: (error.line ?? 1) + 1,
          })),
        }
      }
      const value = parsed.document.value
      if (value !== null && value !== undefined && (typeof value !== 'object' || Array.isArray(value))) {
        return {
          errors: [
            localizedError(
              'ZH_LEGACY_SHELL_INVALID',
              'Legacy ZH front matter must be a YAML mapping',
              context,
              2,
            ),
          ],
        }
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const fm = value as Record<string, unknown>
        if (typeof fm.title === 'string' && fm.title.trim()) {
          const stripped = stripSiteSuffix(fm.title)
          if (stripped.value) {
            title = stripped.value
            rawTitle = stripped.raw
          }
        }
        const rawDesc =
          typeof fm.description === 'string'
            ? fm.description
            : typeof fm.summary === 'string'
              ? fm.summary
              : undefined
        if (rawDesc !== undefined && rawDesc.trim()) {
          const stripped = stripSiteSuffix(rawDesc)
          if (stripped.value) {
            description = stripped.value
            rawDescription = stripped.raw
          }
        }
        if (
          Array.isArray(fm.keywords) &&
          fm.keywords.length > 0 &&
          fm.keywords.every(item => typeof item === 'string' && item.trim().length > 0)
        ) {
          keywords = (fm.keywords as string[]).map(item => item.trim())
        }

        for (const key of Object.keys(fm)) {
          if (key === 'title' && title !== undefined) continue
          if (key === 'description' && description !== undefined && typeof fm.description === 'string') continue
          if (key === 'summary' && description !== undefined && typeof fm.description !== 'string') continue
          if (key === 'keywords' && keywords !== undefined) continue
          strippedFrontMatterKeys.push(key)
        }
      }
    }
  }

  const workingLines = [...lines]
  const strippedImports: string[] = []
  let cursor = bodyStart
  while (cursor < workingLines.length) {
    const line = workingLines[cursor]
    if (!line.trim()) {
      cursor += 1
      continue
    }
    if (/^(?: {0,3}\t| {4})/.test(line)) {
      break
    }
    const importMatch = matchEsmImportAt(workingLines, cursor, {
      specifierPattern: DOCUSAURUS_IMPORT_SPECIFIER_RE,
      stopAtSemicolon: true,
    })
    if (importMatch) {
      const endLine = workingLines[importMatch.endIndex]
      const restOnEndLine = endLine.slice(importMatch.endColumn)
      if (isOnlyWhitespaceOrComments(restOnEndLine)) {
        strippedImports.push(workingLines.slice(cursor, importMatch.endIndex + 1).join('\n').trim())
        cursor = importMatch.endIndex + 1
      } else {
        const headLines = workingLines.slice(cursor, importMatch.endIndex)
        headLines.push(endLine.slice(0, importMatch.endColumn))
        strippedImports.push(headLines.join('\n').trim())
        const afterWs = restOnEndLine.replace(/^[ \t]+/, '')
        const afterComments = stripLeadingWsAndInlineBlockComments(restOnEndLine)
        const nextIsDocusaurusImport =
          afterComments !== afterWs &&
          matchEsmImportAt([afterComments, ...workingLines.slice(importMatch.endIndex + 1)], 0, {
            specifierPattern: DOCUSAURUS_IMPORT_SPECIFIER_RE,
            stopAtSemicolon: true,
          }) !== null
        workingLines[importMatch.endIndex] = nextIsDocusaurusImport ? afterComments : afterWs
        cursor = importMatch.endIndex
      }
      continue
    }
    break
  }

  while (cursor < workingLines.length && !workingLines[cursor].trim()) {
    cursor += 1
  }

  let body = workingLines.slice(cursor).join('\n')
  if (body.length > 0 && !body.endsWith('\n')) {
    body = `${body}\n`
  }

  const frontMatter = buildMinimalSourceFrontMatter({ title, description, keywords })
  const sourceMd = `${frontMatter}${body}`

  const resolvedTitle = title ?? extractFirstH1(body)
  const resolvedDescription = description ?? extractFirstParagraph(body)

  return {
    ...(resolvedTitle !== undefined ? { title: resolvedTitle } : {}),
    ...(rawTitle !== undefined ? { rawTitle } : {}),
    ...(resolvedDescription !== undefined ? { description: resolvedDescription } : {}),
    ...(rawDescription !== undefined ? { rawDescription } : {}),
    ...(keywords !== undefined ? { keywords } : {}),
    strippedFrontMatterKeys,
    strippedImports,
    body,
    sourceMd,
    sha256: sha256Hex(sourceMd),
  }
}

export function renderPageYaml(config: PageConfig): string {
  const lines = [
    `schema_version: ${config.schema_version}`,
    `mode: ${config.mode}`,
    'en_source:',
    `  manual: ${config.en_source.manual}`,
    `  shared_page: ${config.en_source.shared_page}`,
  ]
  if (config.sync_policy !== undefined) {
    lines.push(`sync_policy: ${config.sync_policy}`)
  }
  if (config.notify_on_en_change !== undefined) {
    lines.push(`notify_on_en_change: ${config.notify_on_en_change ? 'true' : 'false'}`)
  }
  return `${lines.join('\n')}\n`
}

function extractHeadingInfos(doc: ParsedDocStructure): Map<string, BootstrapHeadingInfo> {
  const map = new Map<string, BootstrapHeadingInfo>()
  for (const sec of doc.sections) {
    if (sec.headingLevel === 0) continue
    const headingBlock = sec.blocks.find(b => b.kind === 'heading')
    const rawHeadingLine = headingBlock?.raw ?? ''
    const match = HEADING_RE.exec(rawHeadingLine)
    const rawContent = match ? match[2].trim() : sec.headingText
    const hasExplicitAnchor = EXPLICIT_ANCHOR_RE.test(rawContent)
    map.set(sec.anchor, {
      level: sec.headingLevel,
      text: sec.headingText,
      anchor: sec.anchor,
      hasExplicitAnchor,
      line: headingBlock?.startLine ?? 1,
    })
  }
  return map
}

function compareHeadingsAndAlignSections(
  enDoc: ParsedDocStructure,
  zhDoc: ParsedDocStructure,
): {
  comparisons: BootstrapAnchorComparison[]
  enToZhAnchor: Map<string, string>
  zhToEnAnchor: Map<string, string>
} {
  const enHeadings = extractHeadingInfos(enDoc)
  const zhHeadings = extractHeadingInfos(zhDoc)

  const enSections = enDoc.sections.filter(s => s.headingLevel > 0)
  const zhSections = zhDoc.sections.filter(s => s.headingLevel > 0)

  const enToZhAnchor = new Map<string, string>()
  const zhToEnAnchor = new Map<string, string>()

  // Pass 1: exact anchor matches
  const zhByAnchor = new Map(zhSections.map(s => [s.anchor, s]))
  for (const enSec of enSections) {
    const exactZh = zhByAnchor.get(enSec.anchor)
    if (exactZh) {
      enToZhAnchor.set(enSec.anchor, exactZh.anchor)
      zhToEnAnchor.set(exactZh.anchor, enSec.anchor)
    }
  }

  // Pass 2: positional/level pairing for unmatched headings (captures legacy ZH auto-slug / pinyin anchor mismatches)
  const unmatchedEn = enSections.filter(s => !enToZhAnchor.has(s.anchor))
  const unmatchedZh = zhSections.filter(s => !zhToEnAnchor.has(s.anchor))

  const zhOrder = new Map(zhSections.map((s, idx) => [s.anchor, idx]))
  const enOrder = new Map(enSections.map((s, idx) => [s.anchor, idx]))

  // Pair unmatched EN/ZH headings of the same level when they fall in the same relative slot between matched anchors
  for (const enSec of unmatchedEn) {
    const enIdx = enOrder.get(enSec.anchor)!
    // Find nearest matched EN anchor before and after
    let minZhIdx = -1
    for (let i = enIdx - 1; i >= 0; i -= 1) {
      const mapped = enToZhAnchor.get(enSections[i].anchor)
      if (mapped !== undefined) {
        minZhIdx = zhOrder.get(mapped)!
        break
      }
    }
    let maxZhIdx = zhSections.length
    for (let i = enIdx + 1; i < enSections.length; i += 1) {
      const mapped = enToZhAnchor.get(enSections[i].anchor)
      if (mapped !== undefined) {
        maxZhIdx = zhOrder.get(mapped)!
        break
      }
    }

    const candidateZh = unmatchedZh.find(z => {
      if (zhToEnAnchor.has(z.anchor)) return false
      if (z.headingLevel !== enSec.headingLevel) return false
      const zIdx = zhOrder.get(z.anchor)!
      return zIdx > minZhIdx && zIdx < maxZhIdx
    })

    if (candidateZh) {
      enToZhAnchor.set(enSec.anchor, candidateZh.anchor)
      zhToEnAnchor.set(candidateZh.anchor, enSec.anchor)
    }
  }

  const comparisons: BootstrapAnchorComparison[] = []
  const reportedZh = new Set<string>()

  for (const enSec of enSections) {
    const enInfo = enHeadings.get(enSec.anchor)!
    const pairedZhAnchor = enToZhAnchor.get(enSec.anchor)
    if (pairedZhAnchor) {
      reportedZh.add(pairedZhAnchor)
      const zhInfo = zhHeadings.get(pairedZhAnchor)!
      if (pairedZhAnchor === enSec.anchor) {
        comparisons.push({
          status: 'matched',
          en: enInfo,
          zh: zhInfo,
          note: '锚点一致',
        })
      } else {
        comparisons.push({
          status: 'anchor-mismatch',
          en: enInfo,
          zh: zhInfo,
          note: `旧中文锚点 (#${zhInfo.anchor}) 与最新英文 (#${enInfo.anchor}) 不一致；已保留旧中文锚点以免破坏外部深链，请主审核对`,
        })
      }
    } else {
      comparisons.push({
        status: 'missing-in-zh',
        en: enInfo,
        note: `旧中文缺失该英文小节 (#${enInfo.anchor})`,
      })
    }
  }

  for (const zhSec of zhSections) {
    if (reportedZh.has(zhSec.anchor)) continue
    const zhInfo = zhHeadings.get(zhSec.anchor)!
    comparisons.push({
      status: 'zh-only',
      zh: zhInfo,
      note: '仅存在于旧中文中（最新英文无对应小节）',
    })
  }

  return { comparisons, enToZhAnchor, zhToEnAnchor }
}

function analyzeSectionCodeBlocks(
  enDoc: ParsedDocStructure,
  zhDoc: ParsedDocStructure,
  zhToEnAnchor: ReadonlyMap<string, string>,
  codeSyncRules: readonly CodeSyncRule[],
): {
  analyses: BootstrapCodeBlockAnalysis[]
  baselineSections: BaselineSection[]
} {
  const enByAnchor = new Map(enDoc.sections.map(s => [s.anchor, s]))
  const emptySha = sha256Hex('')
  const analyses: BootstrapCodeBlockAnalysis[] = []
  const baselineSections: BaselineSection[] = []

  for (const zhSec of zhDoc.sections) {
    const exactEn = enByAnchor.get(zhSec.anchor)
    const pairedEnAnchor = zhToEnAnchor.get(zhSec.anchor)
    const pairedEn = exactEn ?? (pairedEnAnchor ? enByAnchor.get(pairedEnAnchor) : undefined)

    const zhCodes = zhSec.blocks.filter(b => b.kind === 'code')
    const enCodes = pairedEn ? pairedEn.blocks.filter(b => b.kind === 'code') : []
    const usedEnIndices = new Set<number>()
    const baselineCodeBlocks: BaselineCodeBlock[] = []

    const findMatchingEnCode = (zhCode: BlockUnit, zhIdx: number): BlockUnit | null => {
      const zhTab = zhCode.tabValue ?? ''
      const zhLang = zhCode.code?.lang ?? ''

      // 1. Exact tabValue + lang
      for (let i = 0; i < enCodes.length; i += 1) {
        if (usedEnIndices.has(i)) continue
        if ((enCodes[i].tabValue ?? '') === zhTab && (enCodes[i].code?.lang ?? '') === zhLang) {
          usedEnIndices.add(i)
          return enCodes[i]
        }
      }
      // 2. Same tabValue when set
      if (zhTab) {
        for (let i = 0; i < enCodes.length; i += 1) {
          if (usedEnIndices.has(i)) continue
          if ((enCodes[i].tabValue ?? '') === zhTab) {
            usedEnIndices.add(i)
            return enCodes[i]
          }
        }
      }
      // 3. Same lang
      if (zhLang) {
        for (let i = 0; i < enCodes.length; i += 1) {
          if (usedEnIndices.has(i)) continue
          if ((enCodes[i].code?.lang ?? '') === zhLang) {
            usedEnIndices.add(i)
            return enCodes[i]
          }
        }
      }
      // 4. Same ordinal when counts match
      if (enCodes.length === zhCodes.length && !usedEnIndices.has(zhIdx)) {
        usedEnIndices.add(zhIdx)
        return enCodes[zhIdx]
      }
      return null
    }

    for (let idx = 0; idx < zhCodes.length; idx += 1) {
      const zhCode = zhCodes[idx]
      const enCode = findMatchingEnCode(zhCode, idx)
      const lang = zhCode.code?.lang ?? enCode?.code?.lang ?? null

      if (!enCode || !enCode.code || !zhCode.code) {
        analyses.push({
          sectionAnchor: zhSec.anchor,
          ordinal: idx,
          lang,
          ...(zhCode.tabValue !== undefined ? { tabValue: zhCode.tabValue } : {}),
          customizedForZh: true,
          matchKind: 'zh-only',
          appliedRuleIds: [],
          enSha256: zhCode.sha256,
          zhSha256: zhCode.sha256,
        })
        baselineCodeBlocks.push({
          lang,
          customized_for_zh: true,
          en_sha256: zhCode.sha256,
        })
        continue
      }

      const enBody = enCode.code.body
      const zhBody = zhCode.code.body
      const tier2 = applyTier2CodeRules(enBody, codeSyncRules)

      let customizedForZh: boolean
      let matchKind: BootstrapCodeBlockAnalysis['matchKind']
      let appliedRuleIds: string[] = []

      if (zhBody === enBody) {
        customizedForZh = false
        matchKind = 'exact'
      } else if (tier2.appliedRuleIds.length > 0 && zhBody === tier2.transformed) {
        customizedForZh = false
        matchKind = 'tier2-mapped'
        appliedRuleIds = tier2.appliedRuleIds
      } else {
        customizedForZh = true
        matchKind = 'customized'
      }

      analyses.push({
        sectionAnchor: zhSec.anchor,
        ordinal: idx,
        lang,
        ...(zhCode.tabValue !== undefined ? { tabValue: zhCode.tabValue } : {}),
        customizedForZh,
        matchKind,
        appliedRuleIds,
        enSha256: enCode.sha256,
        zhSha256: zhCode.sha256,
      })
      baselineCodeBlocks.push({
        lang,
        customized_for_zh: customizedForZh,
        en_sha256: enCode.sha256,
      })
    }

    baselineSections.push({
      anchor: zhSec.anchor,
      en_sha256: exactEn?.sha256 ?? pairedEn?.sha256 ?? emptySha,
      zh_sha256: zhSec.sha256,
      code_blocks: baselineCodeBlocks,
    })
  }

  return { analyses, baselineSections }
}

function lineNumberAt(lineStarts: readonly number[], offset: number): number {
  let low = 0
  let high = lineStarts.length
  while (low + 1 < high) {
    const mid = (low + high) >>> 1
    if (lineStarts[mid] <= offset) low = mid
    else high = mid
  }
  return low + 1
}

function tryParseHostname(url: string): string | null {
  try {
    const parsed = new URL(url)
    return parsed.hostname.toLowerCase()
  } catch {
    return null
  }
}

function cleanMarkdownUrl(rawTarget: string): string {
  const trimmed = rawTarget.trim()
  if (trimmed.startsWith('<')) {
    const closeIdx = trimmed.indexOf('>')
    if (closeIdx > 1) return trimmed.slice(1, closeIdx).trim()
  }
  const spaceIdx = trimmed.search(/\s/)
  return spaceIdx > 0 ? trimmed.slice(0, spaceIdx) : trimmed
}

function classifyImageUrl(url: string): { category: ResidualAssetCategory; reason: string } | null {
  if (!url || url.startsWith('data:')) return null
  if (/^https?:\/\//i.test(url)) {
    const host = tryParseHostname(url)
    if (!host) return null
    if (FEISHU_HOST_RE.test(host)) {
      return { category: 'feishu-image', reason: '残留飞书/Lark 图片外链，切流前须迁移至中国站图床' }
    }
    if (GLOBAL_IMAGE_HOST_RE.test(host)) {
      return { category: 'global-image-bed', reason: '指向海外 S3 / Global 图床，请核对中国站访问可达性' }
    }
    if (OSS_IMAGE_HOST_RE.test(host)) {
      return { category: 'oss-image', reason: '存量阿里云 OSS 图片链接，切流前请核对图片可正常访问' }
    }
    return null
  }
  return { category: 'local-relative-image', reason: '本地或相对路径图片，建仓后需确认媒体资源路径有效' }
}

function classifyLinkUrl(url: string): { category: ResidualAssetCategory; reason: string } | null {
  if (!url || url.startsWith('#') || url.startsWith('mailto:')) return null
  if (/^https?:\/\//i.test(url)) {
    const host = tryParseHostname(url)
    if (!host) return null
    if (FEISHU_HOST_RE.test(host)) {
      return { category: 'feishu-link', reason: '残留飞书文档/知识库链接，请替换为目标站点文档路径' }
    }
    if (LEGACY_CN_SITE_HOST_RE.test(host)) {
      return { category: 'legacy-site-link', reason: '硬编码旧中文站绝对链接 (docs.zilliz.com.cn)，请核对是否改为站内相对路由' }
    }
    if (GLOBAL_SITE_HOST_RE.test(host)) {
      return { category: 'global-site-link', reason: '指向海外站 (docs.zilliz.com / cloud.zilliz.com)，请核对是否应切换中国站域名' }
    }
    return null
  }
  if (/^(?:\/docs\/|\.\.?\/.*\.mdx?(?:[#?]|$))/i.test(url)) {
    return { category: 'legacy-relative-link', reason: '存量站内相对链接或 /docs/ 路径，切流前请核对目标路由与锚点' }
  }
  return null
}

export function scanResidualFeishuAssetsAndLinks(markdown: string): {
  residualImages: ResidualAssetFinding[]
  legacyLinks: ResidualAssetFinding[]
} {
  const normalized = markdown.replace(/^\uFEFF/, '').replace(/\r\n|\r/g, '\n')
  const masked = maskCodeAndComments(normalized)
  const lineStarts = computeLineStarts(normalized)

  const residualImagesWithOffset: { offset: number; finding: ResidualAssetFinding }[] = []
  const legacyLinksWithOffset: { offset: number; finding: ResidualAssetFinding }[] = []
  const seen = new Set<string>()

  const pushFinding = (offset: number, finding: ResidualAssetFinding) => {
    const key = `${finding.kind}:${finding.line}:${finding.url}`
    if (seen.has(key)) return
    seen.add(key)
    if (finding.kind === 'image') residualImagesWithOffset.push({ offset, finding })
    else legacyLinksWithOffset.push({ offset, finding })
  }

  // 1. Markdown images ![alt](target) and links [label](target)
  const mdLinkOrImageRe = /(!)?\[([^\]\n]*)\]\(([^)\n]+)\)/g
  for (const match of masked.matchAll(mdLinkOrImageRe)) {
    const idx = match.index!
    const isImage = Boolean(match[1])
    // Extract exact text from normalized at same offsets (maskCodeAndComments preserves length)
    const rawSlice = normalized.slice(idx, idx + match[0].length)
    const exactMatch = /^(!)?\[([^\]\n]*)\]\(([^)\n]+)\)$/.exec(rawSlice)
    if (!exactMatch) continue
    const label = exactMatch[2].trim()
    const url = cleanMarkdownUrl(exactMatch[3])
    const line = lineNumberAt(lineStarts, idx)

    if (isImage) {
      const classified = classifyImageUrl(url)
      if (classified) {
        pushFinding(idx, {
          line,
          kind: 'image',
          category: classified.category,
          url,
          label: label || '(no alt)',
          reason: classified.reason,
        })
      }
    } else {
      const classified = classifyLinkUrl(url)
      if (classified) {
        pushFinding(idx, {
          line,
          kind: 'link',
          category: classified.category,
          url,
          label: label || url,
          reason: classified.reason,
        })
      }
    }
  }

  // 2. HTML <img src="...">
  const htmlImgRe = /<img\b[^>]*\bsrc=(['"])([^'"]+)\1[^>]*>/gi
  for (const match of masked.matchAll(htmlImgRe)) {
    const idx = match.index!
    const rawSlice = normalized.slice(idx, idx + match[0].length)
    const srcMatch = /\bsrc=(['"])([^'"]+)\1/i.exec(rawSlice)
    if (!srcMatch) continue
    const url = srcMatch[2].trim()
    const altMatch = /\balt=(['"])([^'"]*)\1/i.exec(rawSlice)
    const line = lineNumberAt(lineStarts, idx)
    const classified = classifyImageUrl(url)
    if (classified) {
      pushFinding(idx, {
        line,
        kind: 'image',
        category: classified.category,
        url,
        label: altMatch?.[2]?.trim() || '<img>',
        reason: classified.reason,
      })
    }
  }

  // 3. HTML <a href="...">
  const htmlAnchorRe = /<a\b[^>]*\bhref=(['"])([^'"]+)\1[^>]*>/gi
  for (const match of masked.matchAll(htmlAnchorRe)) {
    const idx = match.index!
    const rawSlice = normalized.slice(idx, idx + match[0].length)
    const hrefMatch = /\bhref=(['"])([^'"]+)\1/i.exec(rawSlice)
    if (!hrefMatch) continue
    const url = hrefMatch[2].trim()
    const line = lineNumberAt(lineStarts, idx)
    const classified = classifyLinkUrl(url)
    if (classified) {
      pushFinding(idx, {
        line,
        kind: 'link',
        category: classified.category,
        url,
        label: '<a>',
        reason: classified.reason,
      })
    }
  }

  residualImagesWithOffset.sort((a, b) => a.offset - b.offset)
  legacyLinksWithOffset.sort((a, b) => a.offset - b.offset)

  return {
    residualImages: residualImagesWithOffset.map(item => item.finding),
    legacyLinks: legacyLinksWithOffset.map(item => item.finding),
  }
}

function detectSuspectedStaleSections(
  enDoc: ParsedDocStructure,
  zhDoc: ParsedDocStructure,
  enToZhAnchor: ReadonlyMap<string, string>,
): SuspectedStaleSection[] {
  const zhByAnchor = new Map(zhDoc.sections.map(s => [s.anchor, s]))
  const stale: SuspectedStaleSection[] = []

  const proseKinds = new Set(['paragraph', 'list', 'table', 'blockquote'])

  for (const enSec of enDoc.sections) {
    if (enSec.headingLevel === 0) continue
    const zhAnchor = enToZhAnchor.get(enSec.anchor)
    if (!zhAnchor) continue
    const zhSec = zhByAnchor.get(zhAnchor)
    if (!zhSec) continue

    const reasons: string[] = []
    const enProseCount = enSec.blocks.filter(b => proseKinds.has(b.kind)).length
    const zhProseCount = zhSec.blocks.filter(b => proseKinds.has(b.kind)).length
    if (enProseCount > zhProseCount) {
      reasons.push(`英文包含 ${enProseCount} 个正文块，旧中文仅 ${zhProseCount} 个正文块，疑似缺失增量段落`)
    }

    const enCodeCount = enSec.blocks.filter(b => b.kind === 'code').length
    const zhCodeCount = zhSec.blocks.filter(b => b.kind === 'code').length
    if (enCodeCount > zhCodeCount) {
      reasons.push(`英文包含 ${enCodeCount} 个代码块，旧中文仅 ${zhCodeCount} 个代码块`)
    }

    const enHasChannel = enSec.blocks.some(b => b.kind === 'channel-open')
    const zhHasChannel = zhSec.blocks.some(b => b.kind === 'channel-open')
    if (enHasChannel && !zhHasChannel) {
      reasons.push('英文包含 <NextChannel> 双通道内容，旧中文尚未包含对应通道块')
    }

    const enUi = scanUiTags(enSec.raw)
    const zhUi = scanUiTags(zhSec.raw)
    const enUiCount = 'tags' in enUi ? enUi.tags.length : 0
    const zhUiCount = 'tags' in zhUi ? zhUi.tags.length : 0
    if (enUiCount > 0 && zhUiCount === 0) {
      reasons.push(`英文包含 ${enUiCount} 处 <UI> 界面词标签，旧中文未包含 <UI> 标签`)
    }

    if (reasons.length > 0) {
      stale.push({
        enAnchor: enSec.anchor,
        zhAnchor: zhSec.anchor,
        reasons,
      })
    }
  }

  return stale
}

function sanitizeControlledText(text: string): string {
  return text
    .replace(/<!--\s*localized-docs:review-todos:(?:start|end)\s*-->/gi, '[marker-sanitized]')
    .replace(/^([ \t]*[-*+]\s*\[)[ xX](\])/gm, '$1sanitized$2')
    .replace(/\r?\n+/g, ' ')
    .trim()
}

function escapeTableCell(text: string): string {
  return sanitizeControlledText(text).replace(/\|/g, '\\|')
}

export function renderBootstrapReport(options: {
  pageId: string
  sharedPage: string
  mode: BootstrapPageMode
  syncPolicy: SyncPolicy
  enSnapshot: VerifiedEnSnapshot
  zhLegacyFileLabel: string
  strippedLegacyZh: StrippedLegacyZhResult
  finalSourceMd: string
  anchorComparisons: readonly BootstrapAnchorComparison[]
  codeBlockAnalyses: readonly BootstrapCodeBlockAnalysis[]
  residualImages: readonly ResidualAssetFinding[]
  legacyLinks: readonly ResidualAssetFinding[]
  gapAnalysis: BootstrapGapAnalysis
  alignGapEnabled: boolean
}): string {
  const {
    pageId,
    sharedPage,
    mode,
    syncPolicy,
    enSnapshot,
    zhLegacyFileLabel,
    strippedLegacyZh,
    finalSourceMd,
    anchorComparisons,
    codeBlockAnalyses,
    residualImages,
    legacyLinks,
    gapAnalysis,
    alignGapEnabled,
  } = options

  const customizedBlocks = codeBlockAnalyses.filter(b => b.customizedForZh)
  const tier2Blocks = codeBlockAnalyses.filter(b => b.matchKind === 'tier2-mapped')
  const exactBlocks = codeBlockAnalyses.filter(b => b.matchKind === 'exact')
  const anchorMismatches = anchorComparisons.filter(c => c.status === 'anchor-mismatch')
  const missingSections = anchorComparisons.filter(c => c.status === 'missing-in-zh')

  const lines: string[] = [
    `# 中文 Guides 存量底稿建仓核对报告：\`${pageId}\``,
    '',
    '## 1. 建仓元信息与来源凭据',
    '',
    `- **Page ID**：\`${pageId}\``,
    `- **绑定英文源**：\`guides/${sharedPage}\``,
    `- **维护模式 / 发布策略**：\`mode: ${mode}\` · \`sync_policy: ${syncPolicy}\``,
    `- **英文基线提交**：\`${enSnapshot.provenance.devCommit}\``,
    `- **英文路径 / 凭据路径**：\`${enSnapshot.provenance.enPath}\` · \`${enSnapshot.provenance.manifestPath}\``,
    `- **英文原文 SHA-256**：\`${enSnapshot.provenance.fileSha256}\``,
    `- **英文双通道摘要**：CURRENT \`${enSnapshot.provenance.channels.currentSha256.slice(0, 12)}\` · NEXT \`${enSnapshot.provenance.channels.nextSha256.slice(0, 12)}\``,
    `- **旧中文底稿来源**：\`${sanitizeControlledText(zhLegacyFileLabel)}\``,
    `- **产出 \`source.md\` SHA-256**：\`${sha256Hex(finalSourceMd)}\``,
    `- **剥离的机器 Front Matter 字段**：${strippedLegacyZh.strippedFrontMatterKeys.length > 0 ? strippedLegacyZh.strippedFrontMatterKeys.map(k => `\`${sanitizeControlledText(k)}\``).join('、') : '无'}`,
    `- **剥离的顶部 Docusaurus \`import\` 行数**：${strippedLegacyZh.strippedImports.length}`,
    `- **历史欠译对齐（\`--align-gap\`）**：${alignGapEnabled ? (gapAnalysis.draftApplied ? `已启用（已调用受限起草引擎 \`${gapAnalysis.providerUsed?.name ?? 'llm'}\` 补齐 ${gapAnalysis.draftedSectionAnchors.length} 个缺失小节）` : '已启用（仅完成差异扫描，未调用 LLM 或无缺失小节需起草）') : '未启用（纯剥壳建仓模式，未调用 LLM）'}`,
    '',
    '## 2. 标题与小节锚点对照（旧中文 vs 最新英文）',
    '',
  ]

  if (anchorMismatches.length > 0) {
    lines.push(
      `> **注意**：检测到 **${anchorMismatches.length}** 处旧中文标题锚点与最新英文不一致。为避免破坏外部深链，工具**未静默重写**历史旧锚点，请主审核对是否保持旧锚点或配置锚点别名。`,
      '',
    )
  }

  if (anchorComparisons.length === 0) {
    lines.push('_未检测到标题小节。_', '')
  } else {
    lines.push('| 最新英文标题与锚点 | 旧中文标题与锚点 | 状态 | 说明 |')
    lines.push('|---|---|---|---|')
    for (const cmp of anchorComparisons) {
      const enCol = cmp.en
        ? `${'#'.repeat(cmp.en.level)} ${escapeTableCell(cmp.en.text)} (\`#${escapeTableCell(cmp.en.anchor)}\`${cmp.en.hasExplicitAnchor ? '' : ', auto'})`
        : '—'
      const zhCol = cmp.zh
        ? `${'#'.repeat(cmp.zh.level)} ${escapeTableCell(cmp.zh.text)} (\`#${escapeTableCell(cmp.zh.anchor)}\`${cmp.zh.hasExplicitAnchor ? '' : ', auto'})`
        : '—'
      lines.push(`| ${enCol} | ${zhCol} | \`${cmp.status}\` | ${escapeTableCell(cmp.note)} |`)
    }
    lines.push('')
  }

  lines.push(
    '## 3. 代码块中国站定制识别（`customized_for_zh`）',
    '',
    `- **检测代码块总数**：${codeBlockAnalyses.length}`,
    `- **标记为 \`customized_for_zh: true\`（中国站定制，后续增量不自动覆盖）**：**${customizedBlocks.length}**`,
    `- **Tier-2 固定域名映射命中（\`customized_for_zh: false\`）**：${tier2Blocks.length}`,
    `- **与最新英文逐字节一致（\`customized_for_zh: false\`）**：${exactBlocks.length}`,
    '',
  )

  if (customizedBlocks.length > 0) {
    lines.push('| 小节锚点 | 序号 | 语言 | Tab | 判定类型 | 英文/中文代码摘要 |')
    lines.push('|---|---|---|---|---|---|')
    for (const blk of customizedBlocks) {
      lines.push(
        `| \`#${escapeTableCell(blk.sectionAnchor)}\` | ${blk.ordinal} | \`${escapeTableCell(blk.lang ?? 'plain')}\` | ${blk.tabValue ? `\`${escapeTableCell(blk.tabValue)}\`` : '—'} | \`${blk.matchKind}\` | EN \`${blk.enSha256.slice(0, 10)}\` / ZH \`${blk.zhSha256.slice(0, 10)}\` |`,
      )
    }
    lines.push('')
  }

  lines.push('## 4. 正文残留飞书图片与站内旧链接清单', '')
  lines.push(`### 4.1 残留/需核对图片（${residualImages.length} 处）`, '')
  if (residualImages.length === 0) {
    lines.push('_未检测到残留飞书图片或需核对图片链接。_', '')
  } else {
    lines.push('| 行号 | 分类 | Alt/标签 | 图片 URL | 说明 |')
    lines.push('|---|---|---|---|---|')
    for (const img of residualImages) {
      lines.push(
        `| L${img.line} | \`${img.category}\` | ${escapeTableCell(img.label)} | \`${escapeTableCell(img.url)}\` | ${escapeTableCell(img.reason)} |`,
      )
    }
    lines.push('')
  }

  lines.push(`### 4.2 残留飞书链接与站内旧链接（${legacyLinks.length} 处）`, '')
  if (legacyLinks.length === 0) {
    lines.push('_未检测到残留飞书链接或站内旧链接。_', '')
  } else {
    lines.push('| 行号 | 分类 | 链接文本 | URL | 说明 |')
    lines.push('|---|---|---|---|---|')
    for (const link of legacyLinks) {
      lines.push(
        `| L${link.line} | \`${link.category}\` | ${escapeTableCell(link.label)} | \`${escapeTableCell(link.url)}\` | ${escapeTableCell(link.reason)} |`,
      )
    }
    lines.push('')
  }

  if (alignGapEnabled || missingSections.length > 0 || gapAnalysis.suspectedStaleSections.length > 0) {
    lines.push('## 5. 历史欠译与疑似过时段落核对', '')
    if (gapAnalysis.missingEnSections.length > 0) {
      lines.push(`- **旧中文缺失的英文小节（${gapAnalysis.missingEnSections.length} 个）**：`)
      for (const sec of gapAnalysis.missingEnSections) {
        const draftedTag = gapAnalysis.draftedSectionAnchors.includes(sec.anchor)
          ? '（已生成候选补齐草稿，请主审审校）'
          : '（尚未补齐，请主审决定是否补充翻译）'
        lines.push(`  - \`#${sanitizeControlledText(sec.anchor)}\` — ${sanitizeControlledText(sec.headingText)} ${draftedTag}`)
      }
    } else {
      lines.push('- **旧中文缺失的英文小节**：无')
    }

    if (gapAnalysis.suspectedStaleSections.length > 0) {
      lines.push(`- **疑似过时段落（${gapAnalysis.suspectedStaleSections.length} 个小节）**：`)
      for (const stale of gapAnalysis.suspectedStaleSections) {
        lines.push(
          `  - \`#${sanitizeControlledText(stale.enAnchor)}\`（旧中文 \`#${sanitizeControlledText(stale.zhAnchor)}\`）：${stale.reasons.map(sanitizeControlledText).join('；')}`,
        )
      }
    } else if (alignGapEnabled) {
      lines.push('- **疑似过时段落**：未检测到显著块数/通道/<UI> 缺口')
    }

    if (gapAnalysis.localeWarnings.length > 0) {
      lines.push(`- **术语契约告警（${gapAnalysis.localeWarnings.length} 条）**：`)
      for (const warning of gapAnalysis.localeWarnings) {
        lines.push(`  - ${sanitizeControlledText(warning)}`)
      }
    }
    lines.push('')
  }

  // Review Todos section compatible with ZH-WP4 review-gate.ts
  const todoLines: string[] = [
    '- [ ] **已核对历史欠译与最近一次飞书修订**：主审已比对最新 `dev` 英文与飞书文档最近一次修订，确认建仓底稿无遗漏修订且内容可公开提交至 `master`。',
  ]

  if (anchorMismatches.length > 0) {
    const mismatchSummary = anchorMismatches
      .map(c => `\`#${sanitizeControlledText(c.zh!.anchor)}\` vs \`#${sanitizeControlledText(c.en!.anchor)}\``)
      .join('、')
    todoLines.push(
      `- [ ] **核对旧中文标题锚点差异（${anchorMismatches.length} 处）**：已保留旧锚点未静默改写，请确认外链兼容性（${mismatchSummary}）。`,
    )
  }

  if (customizedBlocks.length > 0) {
    todoLines.push(
      `- [ ] **确认中国站定制代码块标记（${customizedBlocks.length} 处）**：工具已在 \`.baseline.json\` 中将与英文不同的代码块标为 \`customized_for_zh: true\`，请核对是否确属中国站定制。`,
    )
  }

  const feishuImages = residualImages.filter(i => i.category === 'feishu-image')
  if (feishuImages.length > 0 || legacyLinks.length > 0) {
    todoLines.push(
      `- [ ] **处理残留飞书图片与站内旧链接**：正文含 ${feishuImages.length} 处飞书图片与 ${legacyLinks.length} 处旧链接，请核对或按切流规范替换。`,
    )
  }

  if (gapAnalysis.missingEnSections.length > 0 && !gapAnalysis.draftApplied) {
    const missingList = gapAnalysis.missingEnSections
      .map(s => `\`#${sanitizeControlledText(s.anchor)}\``)
      .join('、')
    todoLines.push(
      `- [ ] **确认历史缺失小节（${gapAnalysis.missingEnSections.length} 个）**：旧中文缺失 ${missingList}，请确认在建仓 PR 补齐或在后续增量处理。`,
    )
  }

  if (gapAnalysis.draftApplied && gapAnalysis.draftedSectionAnchors.length > 0) {
    const draftedList = gapAnalysis.draftedSectionAnchors
      .map(a => `\`#${sanitizeControlledText(a)}\``)
      .join('、')
    todoLines.push(
      `- [ ] **审校 \`--align-gap\` 候选补齐小节（${gapAnalysis.draftedSectionAnchors.length} 个）**：工具已通过受限起草引擎为缺失小节（${draftedList}）生成候选中文，请逐段审校译文与术语。`,
    )
  }

  if (gapAnalysis.suspectedStaleSections.length > 0) {
    const staleList = gapAnalysis.suspectedStaleSections
      .map(s => `\`#${sanitizeControlledText(s.enAnchor)}\``)
      .join('、')
    todoLines.push(
      `- [ ] **核对疑似过时小节（${gapAnalysis.suspectedStaleSections.length} 个）**：${staleList} 在段落数/代码块/通道或 \`<UI>\` 标签上与最新英文存在差异，请对照英文核查历史欠译。`,
    )
  }

  for (const todo of gapAnalysis.gapTodos) {
    const anchorPart = todo.sectionAnchor ? ` · \`#${sanitizeControlledText(todo.sectionAnchor)}\`` : ''
    todoLines.push(
      `- [ ] **${sanitizeControlledText(todo.title)}**（\`${todo.kind}\`${anchorPart}）：${sanitizeControlledText(todo.details)}`,
    )
  }

  lines.push(
    '## 6. 导入 PR 主审核对清单（ZH-WP4 门禁）',
    '',
    '主审逐项核对并勾选后方可合入 `master`（本导入 PR 仅建仓不发布，正文在飞书切链前仍在飞书维护）：',
    '',
    REVIEW_TODOS_START_MARKER,
    ...todoLines,
    REVIEW_TODOS_END_MARKER,
    '',
  )

  return lines.join('\n')
}

export async function bootstrapPageCore(
  input: BootstrapPageInput,
): Promise<{ output: BootstrapPageOutput } | { errors: LocalizedDocsError[] }> {
  const pageId = input.pageId
  const sharedPage = input.sharedPage ?? pageId
  const manual: ManualId = input.manual ?? 'guides'
  const mode: BootstrapPageMode = input.mode ?? 'incremental'
  const syncPolicy: SyncPolicy = input.syncPolicy ?? 'independent'
  const codeSyncRules = input.codeSyncRules ?? DEFAULT_CODE_SYNC_RULES
  const reviewedPr = input.reviewedPr ?? 1
  const nowIso = input.nowIso ?? new Date().toISOString()
  const zhLegacyFileLabel = input.zhLegacyFileLabel ?? `${pageId}.md`

  // 1. Validate IDs & EN provenance
  const idCheck = validatePageId(pageId, { file: 'page.yaml', page: pageId })
  if ('errors' in idCheck) return { errors: idCheck.errors }

  const sharedCheck = validatePageId(sharedPage, { file: 'page.yaml', page: pageId })
  if ('errors' in sharedCheck) return { errors: sharedCheck.errors }

  if (
    !input.enSnapshot.provenance.verified ||
    sha256Hex(input.enSnapshot.rawMdx) !== input.enSnapshot.provenance.fileSha256
  ) {
    return {
      errors: [
        localizedError(
          'EN_PROVENANCE_INVALID',
          `Verified EN snapshot digest mismatch for "${sharedPage}"`,
          { file: input.enSnapshot.provenance.enPath, page: pageId },
          1,
        ),
      ],
    }
  }

  // 2. Construct & strictly validate page.yaml (NEVER emits owner or feishu_record_id)
  const pageConfigObj: PageConfig = {
    schema_version: 1,
    mode,
    en_source: {
      manual,
      shared_page: sharedPage,
    },
    sync_policy: syncPolicy,
    ...(mode === 'manual' ? { notify_on_en_change: true } : {}),
  }
  const pageYamlText = renderPageYaml(pageConfigObj)
  const parsedConfig = parseLocalizedPageConfig(pageId, pageYamlText, {
    file: `pages/${pageId}/page.yaml`,
    page: pageId,
  })
  if ('errors' in parsedConfig) {
    return { errors: parsedConfig.errors }
  }

  // 3. Strip legacy ZH shell (front matter + top-level Docusaurus imports)
  const strippedLegacyZh = stripLegacyZhShell(input.zhLegacyRaw, {
    file: zhLegacyFileLabel,
    page: pageId,
  })
  if ('errors' in strippedLegacyZh) {
    return { errors: strippedLegacyZh.errors }
  }

  // Validate stripped legacy ZH source.md shell, channel tags, and UI tags
  const sourceContext: DiagnosticContext = { file: `pages/${pageId}/source.md`, page: pageId }
  const initialShellCheck = validateSourceShell(strippedLegacyZh.sourceMd, sourceContext)
  const initialChannelErrors = validateChannelTags(strippedLegacyZh.sourceMd, undefined, sourceContext)
  const initialUiErrors = validateUiTags(strippedLegacyZh.sourceMd, sourceContext)
  const initialValidationErrors: LocalizedDocsError[] = [
    ...('errors' in initialShellCheck ? initialShellCheck.errors : []),
    ...initialChannelErrors,
    ...initialUiErrors,
  ]
  if (initialValidationErrors.length > 0) {
    return { errors: initialValidationErrors }
  }

  // 4. Parse EN and stripped legacy ZH structures
  const parsedEnRes = parseStructuredDocument(
    { kind: 'en', text: input.enSnapshot.stripped.body, isAlreadyStripped: true },
    { file: input.enSnapshot.provenance.enPath, page: pageId },
  )
  if ('errors' in parsedEnRes) {
    return { errors: parsedEnRes.errors }
  }

  const parsedZhRes = parseStructuredDocument(
    { kind: 'zh', text: strippedLegacyZh.sourceMd },
    sourceContext,
  )
  if ('errors' in parsedZhRes) {
    return { errors: parsedZhRes.errors }
  }

  const enDoc = parsedEnRes.doc
  const zhDoc = parsedZhRes.doc

  // 5. Compare headings/anchors (NEVER rewrites legacy ZH anchors)
  const { comparisons: anchorComparisons, enToZhAnchor, zhToEnAnchor } =
    compareHeadingsAndAlignSections(enDoc, zhDoc)

  // 6. Analyze code blocks & detect customized_for_zh vs Tier-2 domain mapping
  let { analyses: codeBlockAnalyses, baselineSections } = analyzeSectionCodeBlocks(
    enDoc,
    zhDoc,
    zhToEnAnchor,
    codeSyncRules,
  )

  // 7. Scan residual Feishu images and legacy site links in stripped legacy ZH
  let { residualImages, legacyLinks } = scanResidualFeishuAssetsAndLinks(strippedLegacyZh.sourceMd)

  // 8. Gap analysis (and optional --align-gap bounded drafting via ZH-WP2)
  const missingEnSections = anchorComparisons
    .filter((c): c is BootstrapAnchorComparison & { en: BootstrapHeadingInfo } => c.status === 'missing-in-zh' && Boolean(c.en))
    .map(c => ({
      anchor: c.en.anchor,
      headingLevel: c.en.level,
      headingText: c.en.text,
    }))
  const suspectedStaleSections = input.alignGap
    ? detectSuspectedStaleSections(enDoc, zhDoc, enToZhAnchor)
    : []

  let finalSourceMd = strippedLegacyZh.sourceMd
  let draftApplied = false
  let draftedSectionAnchors: string[] = []
  let providerUsed: { name: string; model?: string; unitCount: number } | undefined
  let localeWarnings: string[] = []
  let gapTodos: ReviewTodo[] = []

  if (input.alignGap && mode === 'incremental' && missingEnSections.length > 0 && input.llmProvider && input.contractSupport) {
    const missingAnchorSet = new Set(missingEnSections.map(s => s.anchor))
    const exactMatchedEnAnchors = new Set(
      enDoc.sections
        .filter(enSec => zhDoc.sections.some(zhSec => zhSec.anchor === enSec.anchor))
        .map(s => s.anchor),
    )

    // Build synthetic baseEn (only exact-anchor-matched EN sections) and synthetic newEn
    // (exact-anchor-matched + missing EN sections) so ZH-WP2 executeDraftEngine locks 100%
    // of existing legacy ZH sections (including anchor-mismatched ones) byte-for-byte and
    // drafts ONLY the truly missing EN sections through its full deterministic gate!
    const syntheticBaseSections = enDoc.sections.filter(s => exactMatchedEnAnchors.has(s.anchor))
    const syntheticNewSections = enDoc.sections.filter(
      s => exactMatchedEnAnchors.has(s.anchor) || missingAnchorSet.has(s.anchor),
    )

    const renderSectionsBody = (secs: readonly SectionNode[]): string => {
      if (secs.length === 0) return ''
      return `${secs.map(s => s.raw.trimEnd()).join('\n\n')}\n`
    }

    const syntheticBaseBody = renderSectionsBody(syntheticBaseSections)
    const syntheticNewBody = renderSectionsBody(syntheticNewSections)

    const syntheticBaseSha = sha256Hex(syntheticBaseBody)
    const syntheticNewSha = sha256Hex(syntheticNewBody)

    const syntheticBaseEn: VerifiedEnSnapshot = {
      rawMdx: syntheticBaseBody,
      stripped: {
        ...(input.enSnapshot.stripped.title !== undefined ? { title: input.enSnapshot.stripped.title } : {}),
        ...(input.enSnapshot.stripped.description !== undefined
          ? { description: input.enSnapshot.stripped.description }
          : {}),
        strippedFrontMatterKeys: [],
        strippedImports: [],
        body: syntheticBaseBody,
        sha256: syntheticBaseSha,
      },
      provenance: {
        ...input.enSnapshot.provenance,
        fileSha256: syntheticBaseSha,
        channels: computeChannelDigests(syntheticBaseBody),
      },
    }

    const syntheticNewEn: VerifiedEnSnapshot = {
      rawMdx: syntheticNewBody,
      stripped: {
        ...(input.enSnapshot.stripped.title !== undefined ? { title: input.enSnapshot.stripped.title } : {}),
        ...(input.enSnapshot.stripped.description !== undefined
          ? { description: input.enSnapshot.stripped.description }
          : {}),
        strippedFrontMatterKeys: [],
        strippedImports: [],
        body: syntheticNewBody,
        sha256: syntheticNewSha,
      },
      provenance: {
        ...input.enSnapshot.provenance,
        fileSha256: syntheticNewSha,
        channels: computeChannelDigests(syntheticNewBody),
      },
    }

    const syntheticBaseline: BaselineJson = {
      schema_version: 1,
      page_id: pageId,
      en_baseline: {
        manual,
        shared_page: sharedPage,
        dev_commit: input.enSnapshot.provenance.devCommit,
        en_path: input.enSnapshot.provenance.enPath,
        manifest_path: input.enSnapshot.provenance.manifestPath,
        file_sha256: syntheticBaseSha,
        channels: {
          current_sha256: syntheticBaseEn.provenance.channels.currentSha256,
          next_sha256: syntheticBaseEn.provenance.channels.nextSha256,
        },
      },
      zh_reviewed: {
        source_sha256: sha256Hex(strippedLegacyZh.sourceMd),
        reviewed_pr: reviewedPr,
        updated_at: nowIso,
      },
      last_notified_en_sha: null,
      sections: baselineSections,
    }

    const draftResult = await executeDraftEngine({
      pageId,
      pageConfig: parsedConfig.config,
      curZh: {
        hasSourceMd: true,
        sourceMdText: strippedLegacyZh.sourceMd,
        hasBaselineJson: true,
        baselineJsonText: JSON.stringify(syntheticBaseline),
        baseline: syntheticBaseline,
        lifecycleState: 'ready',
      },
      newEn: syntheticNewEn,
      baseEn: syntheticBaseEn,
      llmProvider: input.llmProvider,
      contractSupport: input.contractSupport,
      codeSyncRules,
      reviewedPr,
      nowIso,
    })

    if (draftResult.status === 'blocked') {
      return {
        errors:
          draftResult.diagnostics.length > 0
            ? draftResult.diagnostics
            : [
                localizedError(
                  'BOOTSTRAP_ALIGN_GAP_BLOCKED',
                  `--align-gap bounded draft failed (${draftResult.reason})`,
                  sourceContext,
                  1,
                ),
              ],
      }
    }

    if (draftResult.status === 'drafted') {
      finalSourceMd = draftResult.candidateSourceMd
      draftApplied = true
      draftedSectionAnchors = missingEnSections.map(s => s.anchor)
      providerUsed = draftResult.providerUsed
      localeWarnings = draftResult.localeWarnings.map(
        w => `[${w.severity}/${w.type}] ${w.location}: ${w.comment}`,
      )
      gapTodos = draftResult.todos

      // Re-validate final source.md and recompute code block analysis & baseline sections on finalSourceMd
      const finalShellCheck = validateSourceShell(finalSourceMd, sourceContext)
      const finalChannelErrors = validateChannelTags(finalSourceMd, undefined, sourceContext)
      const finalUiErrors = validateUiTags(finalSourceMd, sourceContext)
      const finalValidationErrors: LocalizedDocsError[] = [
        ...('errors' in finalShellCheck ? finalShellCheck.errors : []),
        ...finalChannelErrors,
        ...finalUiErrors,
      ]
      if (finalValidationErrors.length > 0) {
        return { errors: finalValidationErrors }
      }

      const parsedFinalZh = parseStructuredDocument({ kind: 'zh', text: finalSourceMd }, sourceContext)
      if ('errors' in parsedFinalZh) {
        return { errors: parsedFinalZh.errors }
      }

      const finalAligned = compareHeadingsAndAlignSections(enDoc, parsedFinalZh.doc)
      const finalCodeAnalysis = analyzeSectionCodeBlocks(
        enDoc,
        parsedFinalZh.doc,
        finalAligned.zhToEnAnchor,
        codeSyncRules,
      )
      codeBlockAnalyses = finalCodeAnalysis.analyses
      baselineSections = finalCodeAnalysis.baselineSections

      const finalAssets = scanResidualFeishuAssetsAndLinks(finalSourceMd)
      residualImages = finalAssets.residualImages
      legacyLinks = finalAssets.legacyLinks
    }
  }

  // 9. Build and validate initial .baseline.json against real EN provenance
  const baseline: BaselineJson = {
    schema_version: 1,
    page_id: pageId,
    en_baseline: {
      manual,
      shared_page: sharedPage,
      dev_commit: input.enSnapshot.provenance.devCommit,
      en_path: input.enSnapshot.provenance.enPath,
      manifest_path: input.enSnapshot.provenance.manifestPath,
      file_sha256: input.enSnapshot.provenance.fileSha256,
      channels: {
        current_sha256: input.enSnapshot.provenance.channels.currentSha256,
        next_sha256: input.enSnapshot.provenance.channels.nextSha256,
      },
    },
    zh_reviewed: {
      source_sha256: sha256Hex(finalSourceMd),
      reviewed_pr: reviewedPr,
      updated_at: nowIso,
    },
    last_notified_en_sha: null,
    sections: baselineSections,
  }

  const baselineJsonText = `${JSON.stringify(baseline, null, 2)}\n`
  const parsedBaseline = parseBaselineJson(baselineJsonText, {
    file: `pages/${pageId}/.baseline.json`,
    page: pageId,
  })
  if ('errors' in parsedBaseline) {
    return { errors: parsedBaseline.errors }
  }

  const consistencyErrors = validateBaselineConsistency({
    baseline: parsedBaseline.baseline,
    dirPageId: pageId,
    pageConfig: parsedConfig.config,
    sourceMdText: finalSourceMd,
    context: { file: `pages/${pageId}/.baseline.json`, page: pageId },
  })
  if (consistencyErrors.length > 0) {
    return { errors: consistencyErrors }
  }

  const gapAnalysis: BootstrapGapAnalysis = {
    missingEnSections,
    suspectedStaleSections,
    draftApplied,
    draftedSectionAnchors,
    ...(providerUsed ? { providerUsed } : {}),
    localeWarnings,
    gapTodos,
  }

  // 10. Render bootstrap-report.md (with ZH-WP4 review-todos checklist)
  const reportMd = renderBootstrapReport({
    pageId,
    sharedPage,
    mode,
    syncPolicy,
    enSnapshot: input.enSnapshot,
    zhLegacyFileLabel,
    strippedLegacyZh,
    finalSourceMd,
    anchorComparisons,
    codeBlockAnalyses,
    residualImages,
    legacyLinks,
    gapAnalysis,
    alignGapEnabled: Boolean(input.alignGap),
  })

  return {
    output: {
      pageId,
      sharedPage,
      pageConfig: parsedConfig.config,
      pageYamlText,
      sourceMd: finalSourceMd,
      baseline: parsedBaseline.baseline,
      baselineJsonText,
      reportMd,
      strippedLegacyZh,
      anchorComparisons,
      codeBlockAnalyses,
      customizedCodeBlockCount: codeBlockAnalyses.filter(b => b.customizedForZh).length,
      residualImages,
      legacyLinks,
      gapAnalysis,
    },
  }
}
