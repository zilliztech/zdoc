import type { AlignedCodeTriplet, ReviewTodo } from './diff.ts'
import type { CodeBlockMeta } from './sections.ts'
import type { BaselineCodeBlock } from './types.ts'

export interface CodeSyncRule {
  id: string
  description: string
  apply(codeBody: string): { transformed: string; matched: boolean }
}

export type CodeSyncTier = 1 | 2 | 3 | 0

export type CodeSyncActionKind =
  | 'unchanged'
  | 'tier1-synced'
  | 'tier2-mapped'
  | 'tier3-conflict'
  | 'removed'

export interface CodeSyncResult {
  blockId: string
  sectionAnchor: string
  tier: CodeSyncTier
  action: CodeSyncActionKind
  lang: string | null
  customizedForZh: boolean
  outputRaw: string | null
  baselineEntry: BaselineCodeBlock | null
  appliedRuleIds: string[]
  note: string
  todo?: ReviewTodo
}

export const DEFAULT_CODE_SYNC_RULES: readonly CodeSyncRule[] = [
  {
    id: 'zilliz-cloud-console-domain',
    description: 'Map Global Zilliz Cloud console domain cloud.zilliz.com to cloud.zilliz.com.cn',
    apply(codeBody: string) {
      const transformed = codeBody.replace(/cloud\.zilliz\.com(?!\.cn)/g, 'cloud.zilliz.com.cn')
      return { transformed, matched: transformed !== codeBody }
    },
  },
  {
    id: 'zilliz-cloud-api-domain',
    description: 'Map Global Zilliz Cloud API endpoint domain zillizcloud.com to zillizcloud.com.cn',
    apply(codeBody: string) {
      const transformed = codeBody.replace(/zillizcloud\.com(?!\.cn)/g, 'zillizcloud.com.cn')
      return { transformed, matched: transformed !== codeBody }
    },
  },
]

export function applyTier2CodeRules(
  codeBody: string,
  rules: readonly CodeSyncRule[] = DEFAULT_CODE_SYNC_RULES,
): { transformed: string; appliedRuleIds: string[] } {
  let current = codeBody
  const appliedRuleIds: string[] = []
  for (const rule of rules) {
    const res = rule.apply(current)
    if (res.matched && res.transformed !== current) {
      current = res.transformed
      appliedRuleIds.push(rule.id)
    }
  }
  return { transformed: current, appliedRuleIds }
}

function renderFencedCodeBlock(meta: CodeBlockMeta, body: string, indentPrefix: string): string {
  const fence = meta.fenceChar.repeat(meta.fenceLength)
  const openLine = `${indentPrefix}${fence}${meta.infoString ? meta.infoString : ''}`
  const bodyLines = body.length > 0 ? body.split('\n').map(line => `${indentPrefix}${line}`) : []
  const closeLine = `${indentPrefix}${fence}`
  return [openLine, ...bodyLines, closeLine].join('\n')
}

export function syncCodeBlockTriplet(
  triplet: AlignedCodeTriplet,
  rules: readonly CodeSyncRule[] = DEFAULT_CODE_SYNC_RULES,
): CodeSyncResult {
  const { blockId, sectionAnchor, baseEn, newEn, curZh, baselineCodeMeta } = triplet

  let isCustomized = baselineCodeMeta?.customized_for_zh === true
  if (baseEn?.code && curZh?.code) {
    const baseBody = baseEn.code.body
    const zhBody = curZh.code.body
    const baseTier2 = applyTier2CodeRules(baseBody, rules)
    if (zhBody !== baseBody && zhBody !== baseTier2.transformed) {
      isCustomized = true
    }
  } else if (!baseEn && curZh?.code && newEn?.code) {
    const newTier2 = applyTier2CodeRules(newEn.code.body, rules)
    if (curZh.code.body !== newEn.code.body && curZh.code.body !== newTier2.transformed) {
      isCustomized = true
    }
  }

  // Case 1: EN unchanged between baseEn and newEn (and curZh exists)
  if (newEn && baseEn && baseEn.sha256 === newEn.sha256 && curZh) {
    return {
      blockId,
      sectionAnchor,
      tier: 0,
      action: 'unchanged',
      lang: curZh.code?.lang ?? newEn.code?.lang ?? null,
      customizedForZh: isCustomized,
      outputRaw: curZh.raw,
      baselineEntry: {
        lang: newEn.code?.lang ?? null,
        customized_for_zh: isCustomized,
        en_sha256: newEn.sha256,
      },
      appliedRuleIds: [],
      note: '代码块英文未变化，逐字节保留当前中文代码块。',
    }
  }

  // Case 1b: ZH-only code block (neither baseEn nor newEn existed)
  if (!baseEn && !newEn && curZh) {
    const lang = curZh.code?.lang ?? null
    return {
      blockId,
      sectionAnchor,
      tier: 0,
      action: 'unchanged',
      lang,
      customizedForZh: true,
      outputRaw: curZh.raw,
      baselineEntry: {
        lang,
        customized_for_zh: true,
        en_sha256: curZh.sha256,
      },
      appliedRuleIds: [],
      note: '中文独有代码块，已原样保留。',
    }
  }

  // Case 2: EN removed the code block
  if (!newEn) {
    if (isCustomized && curZh) {
      const lang = curZh.code?.lang ?? baseEn?.code?.lang ?? null
      const todo: ReviewTodo = {
        id: `code-conflict:${blockId}`,
        kind: 'code-conflict',
        sectionAnchor,
        blockId,
        title: `核对中国站定制代码块冲突（${lang ?? 'code'}，英文已删除该代码块）`,
        details: '当前中文代码块含中国站定制，而英文已删除对应代码块。工具已保留中文代码并暂停自动删改。',
        enBefore: baseEn?.raw ?? '',
        enAfter: '',
        zhCurrent: curZh.raw,
      }
      return {
        blockId,
        sectionAnchor,
        tier: 3,
        action: 'tier3-conflict',
        lang,
        customizedForZh: true,
        outputRaw: curZh.raw,
        baselineEntry: {
          lang,
          customized_for_zh: true,
          en_sha256: baseEn?.sha256 ?? curZh.sha256,
        },
        appliedRuleIds: [],
        note: '档位 3 冲突：中文代码块存在定制且英文已删除，已暂停同步并保留中文代码块。',
        todo,
      }
    }
    return {
      blockId,
      sectionAnchor,
      tier: 0,
      action: 'removed',
      lang: baseEn?.code?.lang ?? curZh?.code?.lang ?? null,
      customizedForZh: false,
      outputRaw: null,
      baselineEntry: null,
      appliedRuleIds: [],
      note: '英文已删除该无定制代码块，同步移除。',
    }
  }

  // Case 3: newEn added or modified
  const newMeta = newEn.code!
  if (isCustomized && curZh) {
    const lang = curZh.code?.lang ?? newMeta.lang ?? null
    const todo: ReviewTodo = {
      id: `code-conflict:${blockId}`,
      kind: 'code-conflict',
      sectionAnchor,
      blockId,
      title: `核对中国站定制代码块冲突（${lang ?? 'code'}）`,
      details:
        '该代码块存在中国站定制（与上次英文基线不一致），且本次英文代码再次变更。工具未覆盖中文代码，请对照英文 diff 手工合并。',
      enBefore: baseEn?.raw ?? '',
      enAfter: newEn.raw,
      zhCurrent: curZh.raw,
    }
    return {
      blockId,
      sectionAnchor,
      tier: 3,
      action: 'tier3-conflict',
      lang,
      customizedForZh: true,
      outputRaw: curZh.raw,
      baselineEntry: {
        lang,
        customized_for_zh: true,
        en_sha256: baseEn ? baseEn.sha256 : newEn.sha256,
      },
      appliedRuleIds: [],
      note: '档位 3 冲突：保留中国站定制代码，暂停自动同步并生成 ReviewTodo。',
      todo,
    }
  }

  const indentPrefix = curZh?.code?.indentPrefix ?? newMeta.indentPrefix
  const newTier2 = applyTier2CodeRules(newMeta.body, rules)
  if (newTier2.appliedRuleIds.length > 0) {
    const outputRaw = renderFencedCodeBlock(newMeta, newTier2.transformed, indentPrefix)
    return {
      blockId,
      sectionAnchor,
      tier: 2,
      action: 'tier2-mapped',
      lang: newMeta.lang,
      customizedForZh: false,
      outputRaw,
      baselineEntry: {
        lang: newMeta.lang,
        customized_for_zh: false,
        en_sha256: newEn.sha256,
      },
      appliedRuleIds: newTier2.appliedRuleIds,
      note: `档位 2 确定性规则换算（${newTier2.appliedRuleIds.join(', ')}），请在 PR 核对。`,
    }
  }

  const outputRaw =
    indentPrefix === newMeta.indentPrefix
      ? newEn.raw
      : renderFencedCodeBlock(newMeta, newMeta.body, indentPrefix)

  return {
    blockId,
    sectionAnchor,
    tier: 1,
    action: 'tier1-synced',
    lang: newMeta.lang,
    customizedForZh: false,
    outputRaw,
    baselineEntry: {
      lang: newMeta.lang,
      customized_for_zh: false,
      en_sha256: newEn.sha256,
    },
    appliedRuleIds: [],
    note: '档位 1 同步：无中国站定制，已按最新英文代码块原样同步（未送模型）。',
  }
}

export function syncAllCodeBlocks(
  triplets: readonly AlignedCodeTriplet[],
  rules: readonly CodeSyncRule[] = DEFAULT_CODE_SYNC_RULES,
): CodeSyncResult[] {
  return triplets.map(triplet => syncCodeBlockTriplet(triplet, rules))
}
