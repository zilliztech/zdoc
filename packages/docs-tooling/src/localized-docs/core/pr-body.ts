import { validateSourceShell } from './assemble.ts'
import type { ReviewTodo, ReviewTodoKind } from './diff.ts'
import type { DraftPageResult } from './draft.ts'
import { projectChannelText } from './sections.ts'

export type { ReviewTodo, ReviewTodoKind }

export const REVIEW_TODOS_START_MARKER = '<!-- localized-docs:review-todos:start -->'
export const REVIEW_TODOS_END_MARKER = '<!-- localized-docs:review-todos:end -->'

export interface PrBodyDualChannelEvidence {
  sectionAnchor?: string
  baseSummary: string
  currentSummary: string
  nextSummary: string
}

export interface PrBodyInput {
  pageId: string
  manualLabel?: string
  mode: 'initial' | 'incremental'
  enBaseVersion?: { devCommit: string; summary: string } | null
  enNewVersion: { devCommit: string; summary: string }
  factChanges: {
    numbersAndLimits: string[]
    codeBlocks: string[]
    links: string[]
    steps: string[]
  }
  autoChecks: {
    untouchedBytePreserved: boolean
    codeProtectionPassed: boolean
    localeContractPassed: boolean
    mdxAndChannelPassed: boolean
    linksAndImagesChecked?: boolean
  }
  reliableChanges: string[]
  reviewTodos: ReviewTodo[]
  localeContractWarnings?: string[]
  dualChannelEvidence: PrBodyDualChannelEvidence[]
  previewExcerpts: {
    anchor?: string
    currentNote: string
    nextNote: string
    currentMarkdown: string
    nextMarkdown: string
  }
}

export function projectChannelPreview(markdown: string, channel: 'current' | 'next'): string {
  const normalized = markdown.replace(/^\uFEFF/, '').replace(/\r\n|\r/g, '\n')
  const shell = validateSourceShell(normalized)
  const body = 'errors' in shell ? normalized : shell.bodyText
  return projectChannelText(body, channel)
}

function sanitizeControlledMarkerText(text: string): string {
  return text
    .replace(/<!--\s*localized-docs:review-todos:(?:start|end)\s*-->/gi, '[marker-sanitized]')
    .replace(/^([ \t]*[-*+]\s*\[)[ xX](\])/gm, '$1sanitized$2')
}

function sanitizeInline(text: string): string {
  return sanitizeControlledMarkerText(text).replace(/\r?\n+/g, ' ').trim()
}

function formatIndentedEvidence(label: string, value: string): string {
  const sanitized = sanitizeControlledMarkerText(value).trim()
  const lines = sanitized.split(/\r?\n/)
  if (lines.length === 1) {
    return `  - ${label}：\`${lines[0].replace(/`/g, "'")}\``
  }
  return [`  - ${label}：`, ...lines.map(line => `    ${line}`)].join('\n')
}

function formatBlockquoteExcerpt(markdown: string): string {
  const trimmed = markdown.trim()
  if (!trimmed) return '> _（该通道在此区间无可见内容）_'
  return trimmed
    .split('\n')
    .map(line => (line.length > 0 ? `> ${line}` : '>'))
    .join('\n')
}

function shortCommit(commit: string): string {
  return commit.slice(0, 7)
}

export function renderPrBody(input: PrBodyInput): string {
  const manualLabel = input.manualLabel ?? 'Cloud Guides'
  const baseVer = input.enBaseVersion
    ? `上次已审 \`dev@${shortCommit(input.enBaseVersion.devCommit)}\`（取自 \`.baseline.json\`，${sanitizeInline(input.enBaseVersion.summary)}）`
    : '无上次基线（新页首译）'
  const newVer = `本次采用 \`dev@${shortCommit(input.enNewVersion.devCommit)}\`（${sanitizeInline(input.enNewVersion.summary)}）`

  const fmtList = (items: string[], fallback: string) =>
    items.length > 0 ? items.map(sanitizeInline).join('；') : fallback

  const todoCount = input.reviewTodos.length
  const todoStatusBadge =
    todoCount > 0
      ? `⏳ 待确认项（${todoCount} 项未清零，合入已拦截）`
      : '✅ 待确认项（0 项）'

  const previewAnchorText = input.previewExcerpts.anchor
    ? `（锚点 \`#${sanitizeInline(input.previewExcerpts.anchor)}\`）`
    : ''

  const lines: string[] = [
    '#### ① PR 页首信息与变更摘要（只给主审）',
    '',
    `- **页面与目标手册**：\`${input.pageId}\`（${manualLabel}）`,
    `- **英文版本对比**：${baseVer} ➔ ${newVer}`,
    `- **关键事实变化**：数字/限制（${fmtList(input.factChanges.numbersAndLimits, '无')}） · 代码块（${fmtList(input.factChanges.codeBlocks, '无变化；若有变化且无中国站定制则程序原样同步，不走 LLM')}） · 链接（${fmtList(input.factChanges.links, '无')}） · 操作步骤（${fmtList(input.factChanges.steps, '无')}）`,
    `- **自动检查状态**（当前 PR head）：${input.autoChecks.untouchedBytePreserved ? '✅' : '❌'} 未涉及段落逐字保留 · ${input.autoChecks.codeProtectionPassed ? '✅' : '❌'} 术语契约与代码块保护${input.autoChecks.localeContractPassed ? '通过' : '含告警'} · ${input.autoChecks.mdxAndChannelPassed ? '✅' : '❌'} MDX 与双通道边界校验 · ${input.autoChecks.linksAndImagesChecked ? '✅' : 'ℹ️'} 链接与图片校验 · ${todoStatusBadge}`,
    `- **候选预览入口**${previewAnchorText}：`,
    `  - **Prod 候选预览** — ${sanitizeInline(input.previewExcerpts.currentNote)}`,
    `  - **UAT 候选预览** — ${sanitizeInline(input.previewExcerpts.nextNote)}`,
    '',
    '#### ② 改稿说明与待主审决定（只留在 PR）',
    '',
  ]

  if (input.reliableChanges.length > 0) {
    lines.push('- **可靠改动**：')
    for (const change of input.reliableChanges) {
      lines.push(`  - ${sanitizeInline(change)}`)
    }
  } else {
    lines.push('- **可靠改动**：无自动改稿（仅含待确认项或无需改稿）')
  }

  if (input.localeContractWarnings && input.localeContractWarnings.length > 0) {
    lines.push('- **术语契约告警**：')
    for (const warning of input.localeContractWarnings) {
      lines.push(`  - ${sanitizeInline(warning)}`)
    }
  }

  lines.push(
    `- **待您决定（${todoCount} 项${todoCount > 0 ? '，清零前拦住合入' : ''}）**：`,
  )
  lines.push(REVIEW_TODOS_START_MARKER)
  if (todoCount === 0) {
    lines.push('_当前无待主审确认项。_')
  } else {
    for (const todo of input.reviewTodos) {
      const anchorTag = todo.sectionAnchor ? ` · \`#${sanitizeInline(todo.sectionAnchor)}\`` : ''
      lines.push(
        `- [ ] **${sanitizeInline(todo.title)}**（\`${todo.kind}\`${anchorTag}）：${sanitizeInline(todo.details)}`,
      )
      if (todo.enBefore !== undefined && todo.enBefore.trim()) {
        lines.push(formatIndentedEvidence('英文改前', todo.enBefore))
      }
      if (todo.enAfter !== undefined && todo.enAfter.trim()) {
        lines.push(formatIndentedEvidence('英文改后', todo.enAfter))
      }
      if (todo.zhCurrent !== undefined && todo.zhCurrent.trim()) {
        lines.push(formatIndentedEvidence('当前中文', todo.zhCurrent))
      }
      if (todo.zhCandidate !== undefined && todo.zhCandidate.trim()) {
        lines.push(formatIndentedEvidence('候选建议', todo.zhCandidate))
      }
    }
  }
  lines.push(REVIEW_TODOS_END_MARKER)
  lines.push('')
  lines.push('**英文改前 / 改后双通道依据：**')
  if (input.dualChannelEvidence.length === 0) {
    lines.push('- 暂无双通道分段摘要。')
  } else {
    for (const ev of input.dualChannelEvidence) {
      const prefix = ev.sectionAnchor ? `\`#${sanitizeInline(ev.sectionAnchor)}\` ` : ''
      lines.push(`- ${prefix}上次已审（Prod & UAT）：${sanitizeInline(ev.baseSummary)}`)
      lines.push(`- ${prefix}本次采用 · Prod / 当前版：${sanitizeInline(ev.currentSummary)}`)
      lines.push(`- ${prefix}本次采用 · UAT / 下一版：${sanitizeInline(ev.nextSummary)}`)
    }
  }

  lines.push('')
  lines.push('#### ③ 对照中文页面：网站读者会看到什么？（候选预览摘录）')
  lines.push('')
  lines.push('**Prod 候选预览 · 当前版**')
  lines.push('')
  lines.push(formatBlockquoteExcerpt(input.previewExcerpts.currentMarkdown))
  lines.push('')
  lines.push('**UAT 候选预览 · 下一版**')
  lines.push('')
  lines.push(formatBlockquoteExcerpt(input.previewExcerpts.nextMarkdown))
  lines.push('')

  return lines.join('\n')
}

export function buildPrBodyInputFromDraftResult(
  result: Extract<DraftPageResult, { status: 'drafted' }>,
  options: {
    baseCommit?: string
    newCommit?: string
    manualLabel?: string
  } = {},
): PrBodyInput {
  const newCommit = options.newCommit ?? result.updatedBaseline.en_baseline.dev_commit
  const baseCommit = options.baseCommit ?? null

  const codeSummaries = result.codeSyncResults
    .filter(c => c.action !== 'unchanged')
    .map(c => `${c.lang ?? 'code'}: ${c.note}`)

  const reliableChanges: string[] = []
  const stepChanges: string[] = []

  for (const sec of result.diff.sections) {
    if (sec.status === 'added' || sec.status === 'modified') {
      const changedProse = sec.blocks.filter(
        b => (b.status === 'modified' || b.status === 'added') && b.kind !== 'code',
      )
      if (changedProse.length > 0) {
        reliableChanges.push(
          `小节 \`#${sec.anchor}\` 起草 ${changedProse.length} 处正文更新（其余未涉及段落逐字保留）。`,
        )
        stepChanges.push(`#${sec.anchor} 变更 ${changedProse.length} 块`)
      }
    }
  }
  for (const codeRes of result.codeSyncResults) {
    if (codeRes.action === 'tier1-synced' || codeRes.action === 'tier2-mapped') {
      reliableChanges.push(`代码块 \`${codeRes.blockId}\`：${codeRes.note}`)
    }
  }

  const channelSummaryText = result.isInitialTranslation
    ? '新页首译（按最新英文生成双通道初稿）'
    : !result.diff.channelImpact.currentChanged && result.diff.channelImpact.nextChanged
      ? 'Prod 无变化；仅 UAT 通道更新'
      : result.diff.channelImpact.currentChanged && !result.diff.channelImpact.nextChanged
        ? '仅 Prod 通道更新；UAT 无变化'
        : 'Prod 与 UAT 通道均有更新'

  const firstInterestingSection =
    result.diff.sections.find(s => s.status === 'modified' || s.status === 'ambiguous' || s.status === 'added')
      ?.anchor ?? result.diff.sections[0]?.anchor

  const currentMarkdown = projectChannelPreview(result.candidateSourceMd, 'current')
  const nextMarkdown = projectChannelPreview(result.candidateSourceMd, 'next')

  return {
    pageId: result.pageId,
    manualLabel: options.manualLabel ?? 'Cloud Guides',
    mode: result.isInitialTranslation ? 'initial' : 'incremental',
    enBaseVersion: baseCommit
      ? {
          devCommit: baseCommit,
          summary: 'Prod 与 UAT 基线快照',
        }
      : null,
    enNewVersion: {
      devCommit: newCommit,
      summary: channelSummaryText,
    },
    factChanges: {
      numbersAndLimits: [],
      codeBlocks: codeSummaries,
      links: [],
      steps: stepChanges,
    },
    autoChecks: {
      untouchedBytePreserved: result.gateChecks.unchangedBytesVerified,
      codeProtectionPassed: result.gateChecks.codeProtectionVerified,
      localeContractPassed: result.localeWarnings.length === 0,
      mdxAndChannelPassed: result.gateChecks.channelBoundariesVerified && result.gateChecks.sourceShellVerified,
      linksAndImagesChecked: false,
    },
    reliableChanges,
    reviewTodos: result.todos,
    localeContractWarnings: result.localeWarnings.map(
      w => `[${w.severity}/${w.type}] ${w.location}: ${w.comment}`,
    ),
    dualChannelEvidence: [
      {
        sectionAnchor: firstInterestingSection,
        baseSummary: result.isInitialTranslation ? '无上次基线' : '已审英文基线',
        currentSummary: result.diff.channelImpact.currentChanged ? 'Prod 通道存在更新' : 'Prod 通道与基线一致',
        nextSummary: result.diff.channelImpact.nextChanged ? 'UAT 通道存在更新' : 'UAT 通道与基线一致',
      },
    ],
    previewExcerpts: {
      anchor: firstInterestingSection,
      currentNote: result.diff.channelImpact.currentChanged
        ? '包含本次 CURRENT 通道更新内容，未涉及段落逐字保留。'
        : '与现网 Prod 基线保持一致。',
      nextNote: result.diff.channelImpact.nextChanged
        ? '包含本次 NEXT / UAT 通道起草内容，请对照待确认项核对。'
        : '与现网 UAT 基线一致。',
      currentMarkdown: currentMarkdown.slice(0, 1200),
      nextMarkdown: nextMarkdown.slice(0, 1200),
    },
  }
}
