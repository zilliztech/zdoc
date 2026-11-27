// @vitest-environment node
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadLocalizedContractSupport } from '../adapters/contract.ts'
import { FakeDraftLlmProvider, createDraftLlmProvider } from '../adapters/llm.ts'
import { projectChannelPreview } from '../core/pr-body.ts'
import {
  executeDraftEngine,
  maskProtectedTokensForLlm,
  restoreProtectedTokensFromLlm,
  type DraftLlmRequest,
  type VerifiedEnSnapshot,
} from '../core/draft.ts'
import { buildBaselineSections, computeChannelDigests, parseStructuredDocument } from '../core/sections.ts'
import { stripEnShell } from '../core/strip-en.ts'
import type { BaselineJson, PageConfig } from '../core/types.ts'
import { sha256Hex } from '../core/types.ts'

const repoRoot = path.resolve(import.meta.dirname, '../../../../..')

function makeEnSnapshot(rawMdx: string, sharedPage = 'delete-entities', devCommit = '1'.repeat(40)): VerifiedEnSnapshot {
  const stripped = stripEnShell(rawMdx)
  if ('errors' in stripped) throw new Error(`stripEnShell failed: ${stripped.errors[0].message}`)
  return {
    rawMdx,
    stripped,
    provenance: {
      manual: 'guides',
      sharedPage,
      devCommit,
      enPath: `content/en/guides/${sharedPage}.md`,
      manifestPath: `generated/en/manifests/shared-pages/guides/${sharedPage}.json`,
      fileSha256: sha256Hex(rawMdx),
      channels: computeChannelDigests(stripped.body),
      receiptChannel: null,
      provenanceMode: 'file-direct',
      verified: true,
      verificationErrors: [],
    },
  }
}

function makeBaseline(pageId: string, baseEn: VerifiedEnSnapshot, zhSourceMd: string, lastNotified: string | null = null): BaselineJson {
  const enDoc = parseStructuredDocument({ kind: 'en', text: baseEn.stripped.body, isAlreadyStripped: true })
  const zhDoc = parseStructuredDocument({ kind: 'zh', text: zhSourceMd })
  if (!('doc' in enDoc) || !('doc' in zhDoc)) throw new Error('parse failed')
  return {
    schema_version: 1,
    page_id: pageId,
    en_baseline: {
      manual: 'guides',
      shared_page: pageId,
      dev_commit: baseEn.provenance.devCommit,
      en_path: baseEn.provenance.enPath,
      manifest_path: baseEn.provenance.manifestPath,
      file_sha256: baseEn.provenance.fileSha256,
      channels: {
        current_sha256: baseEn.provenance.channels.currentSha256,
        next_sha256: baseEn.provenance.channels.nextSha256,
      },
    },
    zh_reviewed: {
      source_sha256: sha256Hex(zhSourceMd),
      reviewed_pr: 42,
      updated_at: '2026-11-26T08:00:00Z',
    },
    last_notified_en_sha: lastNotified,
    sections: buildBaselineSections(enDoc.doc, zhDoc.doc),
  }
}

const incrementalConfig: PageConfig = {
  schema_version: 1,
  mode: 'incremental',
  en_source: { manual: 'guides', shared_page: 'delete-entities' },
  sync_policy: 'independent',
}

describe('localized-docs core/draft & adapters/contract & adapters/llm', () => {
  it('loads zh-CN-guides locale contract + style guide Ch 0-1 and detects terminology warnings', () => {
    const support = loadLocalizedContractSupport({ repositoryRoot: repoRoot })
    expect(support.contractId).toMatch(/^zh-CN-guides/)
    expect(support.styleGuideExcerpt).toContain('## 0. 总则')
    expect(support.styleGuideExcerpt).toContain('## 1. 人称、敬体与操作句式')
    expect(support.styleGuideExcerpt).not.toContain('## 2. 参数 / 返回值')

    // Verify validateDraft surfaces missing mandatory term when 'Entity' is improperly translated instead of preserved
    const issues = support.validateDraft(
      'Delete an Entity from the Collection.',
      '从集合中删除实体。',
    )
    expect(issues.length).toBeGreaterThan(0)
  })

  it('skips paused pages with zero LLM calls', async () => {
    let calls = 0
    const provider = new FakeDraftLlmProvider({
      responder: () => {
        calls += 1
        return 'unused'
      },
    })
    const contractSupport = loadLocalizedContractSupport({ repositoryRoot: repoRoot })
    const newEn = makeEnSnapshot('---\ntitle: "Global Only"\n---\n\n# Global Only\n\nText.\n', 'global-only')

    const res = await executeDraftEngine({
      pageId: 'global-only',
      pageConfig: {
        schema_version: 1,
        mode: 'paused',
        en_source: { manual: 'guides', shared_page: 'global-only' },
        pause_reason: '中国站暂未上线',
      },
      curZh: {
        hasSourceMd: false,
        hasBaselineJson: false,
        lifecycleState: 'paused',
      },
      newEn,
      baseEn: null,
      llmProvider: provider,
      contractSupport,
    })

    expect(res.status).toBe('skipped')
    if (res.status === 'skipped') expect(res.reason).toBe('paused')
    expect(calls).toBe(0)
  })

  it('handles manual mode with manual-notify, unchanged skip, and last_notified_en_sha deduplication (never drafts source.md)', async () => {
    let llmCalls = 0
    const provider = new FakeDraftLlmProvider({
      responder: () => {
        llmCalls += 1
        return 'never'
      },
    })
    const contractSupport = loadLocalizedContractSupport({ repositoryRoot: repoRoot })
    const baseEn = makeEnSnapshot('---\ntitle: "Region"\n---\n\n# Region\n\n## China\\{#china}\n\nOld text.\n', 'region', '1'.repeat(40))
    const newEn = makeEnSnapshot('---\ntitle: "Region"\n---\n\n# Region\n\n## China\\{#china}\n\nNew text.\n', 'region', '2'.repeat(40))
    const zhMd = '# 地域\n\n## 中国区\\{#china}\n\n手工维护中文。\n'
    const baseline = makeBaseline('region', baseEn, zhMd)
    const manualConfig: PageConfig = {
      schema_version: 1,
      mode: 'manual',
      en_source: { manual: 'guides', shared_page: 'region' },
      notify_on_en_change: true,
    }

    // 1. New EN SHA -> manual-notify
    const notifyRes = await executeDraftEngine({
      pageId: 'region',
      pageConfig: manualConfig,
      curZh: {
        hasSourceMd: true,
        sourceMdText: zhMd,
        hasBaselineJson: true,
        baseline,
        lifecycleState: 'ready',
      },
      newEn,
      baseEn,
      llmProvider: provider,
      contractSupport,
    })
    expect(notifyRes.status).toBe('manual-notify')
    if (notifyRes.status !== 'manual-notify') return
    expect(notifyRes.newEnSha).toBe(newEn.provenance.fileSha256)
    expect(notifyRes.enDiffSummary.changedSections).toContain('china')
    expect(notifyRes.updatedBaseline.last_notified_en_sha).toBe(newEn.provenance.fileSha256)
    expect(llmCalls).toBe(0)

    // 2. Repeat same EN SHA -> skipped (manual-already-notified)
    const dedupRes = await executeDraftEngine({
      pageId: 'region',
      pageConfig: manualConfig,
      curZh: {
        hasSourceMd: true,
        sourceMdText: zhMd,
        hasBaselineJson: true,
        baseline: notifyRes.updatedBaseline,
        lifecycleState: 'ready',
      },
      newEn,
      baseEn,
      llmProvider: provider,
      contractSupport,
    })
    expect(dedupRes.status).toBe('skipped')
    if (dedupRes.status === 'skipped') expect(dedupRes.reason).toBe('manual-already-notified')
    expect(llmCalls).toBe(0)

    // 3. Unchanged EN SHA -> skipped (unchanged)
    const unchangedRes = await executeDraftEngine({
      pageId: 'region',
      pageConfig: manualConfig,
      curZh: {
        hasSourceMd: true,
        sourceMdText: zhMd,
        hasBaselineJson: true,
        baseline,
        lifecycleState: 'ready',
      },
      newEn: baseEn,
      baseEn,
      llmProvider: provider,
      contractSupport,
    })
    expect(unchangedRes.status).toBe('skipped')
    if (unchangedRes.status === 'skipped') expect(unchangedRes.reason).toBe('unchanged')
  })

  it('strictly distinguishes pending-initial-translation from baseline-missing-error', async () => {
    const contractSupport = loadLocalizedContractSupport({ repositoryRoot: repoRoot })
    const provider = new FakeDraftLlmProvider()
    const newEn = makeEnSnapshot(`---
title: "New Shared Page"
---

# New Shared Page

Click <UI>Create Cluster</UI> to start.

\`\`\`python
print("hello")
\`\`\`
`, 'new-shared-page')

    // 1. Legitimate initial translation (no source.md, no .baseline.json)
    const initRes = await executeDraftEngine({
      pageId: 'new-shared-page',
      pageConfig: {
        schema_version: 1,
        mode: 'incremental',
        en_source: { manual: 'guides', shared_page: 'new-shared-page' },
      },
      curZh: {
        hasSourceMd: false,
        hasBaselineJson: false,
        lifecycleState: 'pending-initial-translation',
      },
      newEn,
      baseEn: null,
      llmProvider: provider,
      contractSupport,
      reviewedPr: 101,
      nowIso: '2026-11-27T01:00:00Z',
    })
    expect(initRes.status).toBe('drafted')
    if (initRes.status !== 'drafted') return
    expect(initRes.isInitialTranslation).toBe(true)
    expect(initRes.candidateSourceMd).toContain('<UI>Create Cluster</UI>')
    expect(initRes.candidateSourceMd).toContain('print("hello")')
    expect(initRes.todos.some(t => t.kind === 'ui-term' && t.enAfter === '<UI>Create Cluster</UI>')).toBe(true)
    expect(initRes.updatedBaseline.zh_reviewed.reviewed_pr).toBe(101)

    // 2. baseline-missing-error (source.md exists without .baseline.json) -> MUST block, never initial translate!
    const blockedRes = await executeDraftEngine({
      pageId: 'new-shared-page',
      pageConfig: {
        schema_version: 1,
        mode: 'incremental',
        en_source: { manual: 'guides', shared_page: 'new-shared-page' },
      },
      curZh: {
        hasSourceMd: true,
        sourceMdText: '# 已有中文\n\n正文。\n',
        hasBaselineJson: false,
        lifecycleState: 'baseline-missing-error',
      },
      newEn,
      baseEn: null,
      llmProvider: provider,
      contractSupport,
    })
    expect(blockedRes.status).toBe('blocked')
    if (blockedRes.status === 'blocked') {
      expect(blockedRes.reason).toBe('baseline-missing-error')
    }
  })

  it('masks <UI> and protected tokens, excludes code blocks from LLM, preserves untouched bytes & human edits, and flags overlapping human edits', async () => {
    const contractSupport = loadLocalizedContractSupport({ repositoryRoot: repoRoot })
    let capturedRequest: DraftLlmRequest | undefined
    const provider = new FakeDraftLlmProvider({
      responder: (unit, req) => {
        capturedRequest = req
        return unit.maskedEnText.replace('Click', '点击').replace('updated', '已更新')
      },
    })

    const baseEn = makeEnSnapshot(`---
title: "Delete Entities"
---

# Delete Entities

## Intro\\{#intro}

Intro unchanged paragraph.

## Action\\{#action}

Click <UI>Create Cluster</UI> with \`{{var.cluster_id}}\` and see [Guide](./guide).

\`\`\`python
# EN comment kept in English
print("https://cloud.zilliz.com/v1")
\`\`\`
`)

    const newEn = makeEnSnapshot(`---
title: "Delete Entities"
---

# Delete Entities

## Intro\\{#intro}

Intro unchanged paragraph.

## Action\\{#action}

Click <UI>Create Cluster</UI> updated with \`{{var.cluster_id}}\` and see [Guide](./guide).

\`\`\`python
# EN comment kept in English
print("https://cloud.zilliz.com/v2")
\`\`\`
`, 'delete-entities', '2'.repeat(40))

    // Human edited the Intro section (untouched in EN), while Action matches baseline
    const reviewedZh = `# 删除 Entity

## 简介\\{#intro}

原始简介段落。

## 操作\\{#action}

点击 <UI>Create Cluster</UI> 使用 \`{{var.cluster_id}}\`，参见 [指南](./guide)。

\`\`\`python
# EN comment kept in English
print("https://cloud.zilliz.com.cn/v1")
\`\`\`
`
    const baseline = makeBaseline('delete-entities', baseEn, reviewedZh)
    const humanEditedZh = reviewedZh.replace('原始简介段落。', '人工润色后的简介段落   保留排版。')

    const res = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: {
        hasSourceMd: true,
        sourceMdText: humanEditedZh,
        hasBaselineJson: true,
        baseline,
        lifecycleState: 'ready',
      },
      newEn,
      baseEn,
      llmProvider: provider,
      contractSupport,
    })

    expect(res.status).toBe('drafted')
    if (res.status !== 'drafted') return

    // Code block was NEVER sent to LLM
    expect(capturedRequest).toBeDefined()
    expect(capturedRequest!.units.every(u => u.blockKind !== 'code')).toBe(true)
    expect(capturedRequest!.units).toHaveLength(1)
    expect(capturedRequest!.units[0].maskedEnText).toContain('[[ZDOC-UI:')
    expect(capturedRequest!.units[0].maskedEnText).not.toContain('<UI>')

    // Human edit in untouched Intro section preserved byte-for-byte
    expect(res.candidateSourceMd).toContain('人工润色后的简介段落   保留排版。')
    // Tier 2 deterministic code transform applied
    expect(res.candidateSourceMd).toContain('https://cloud.zilliz.com.cn/v2')
    // <UI> restored verbatim + ui-term ReviewTodo emitted
    expect(res.candidateSourceMd).toContain('<UI>Create Cluster</UI>')
    expect(res.todos.some(t => t.kind === 'ui-term' && t.enAfter === '<UI>Create Cluster</UI>')).toBe(true)
  })

  it('adversarial gate rejects out-of-bounds keys, <NextChannel> fabrication, code fences, and dropped <UI>/protected placeholders', async () => {
    const contractSupport = loadLocalizedContractSupport({ repositoryRoot: repoRoot })
    const baseEn = makeEnSnapshot(`---
title: "T"
---

# T

## S1\\{#s1}

Untouched prose.

## S2\\{#s2}

Click <UI>Save</UI> and \`{{var.token}}\`.
`)
    const newEn = makeEnSnapshot(`---
title: "T"
---

# T

## S1\\{#s1}

Untouched prose.

## S2\\{#s2}

Click <UI>Save</UI> now and \`{{var.token}}\`.
`, 'delete-entities', '2'.repeat(40))
    const curZh = `# 标题

## 第一节\\{#s1}

未改动段落。

## 第二节\\{#s2}

点击 <UI>Save</UI> 和 \`{{var.token}}\`。
`
    const baseline = makeBaseline('delete-entities', baseEn, curZh)

    // 1. Out-of-bounds extra key
    const extraKeyRes = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: { hasSourceMd: true, sourceMdText: curZh, hasBaselineJson: true, baseline, lifecycleState: 'ready' },
      newEn,
      baseEn,
      llmProvider: {
        name: 'bad-extra-key',
        async draft(req) {
          return {
            providerName: 'bad',
            proposals: {
              [req.units[0].blockId]: req.units[0].maskedEnText,
              'sec:s1:b1': '恶意越界修改',
            },
          }
        },
      },
      contractSupport,
    })
    expect(extraKeyRes.status).toBe('blocked')
    if (extraKeyRes.status === 'blocked') {
      expect(extraKeyRes.reason).toBe('llm-gate-rejected')
      expect(extraKeyRes.gateViolations?.some(v => v.includes('out-of-bounds'))).toBe(true)
    }

    // 2. Fabricated <NextChannel>
    const badChannelRes = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: { hasSourceMd: true, sourceMdText: curZh, hasBaselineJson: true, baseline, lifecycleState: 'ready' },
      newEn,
      baseEn,
      llmProvider: new FakeDraftLlmProvider({
        responder: unit => `<NextChannel action="include">${unit.maskedEnText}</NextChannel>`,
      }),
      contractSupport,
    })
    expect(badChannelRes.status).toBe('blocked')
    if (badChannelRes.status === 'blocked') {
      expect(badChannelRes.reason).toBe('llm-gate-rejected')
      expect(badChannelRes.gateViolations?.some(v => v.includes('NextChannel'))).toBe(true)
    }

    // 3. Dropped <UI> placeholder
    const droppedUiRes = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: { hasSourceMd: true, sourceMdText: curZh, hasBaselineJson: true, baseline, lifecycleState: 'ready' },
      newEn,
      baseEn,
      llmProvider: new FakeDraftLlmProvider({
        responder: () => '点击保存按钮。',
      }),
      contractSupport,
    })
    expect(droppedUiRes.status).toBe('blocked')
    if (droppedUiRes.status === 'blocked') {
      expect(droppedUiRes.reason).toBe('llm-gate-rejected')
    }

    // 4. Direct helper check for fenced code injection
    const masked = maskProtectedTokensForLlm('Hello `world`')
    expect('result' in masked).toBe(true)
    if ('result' in masked) {
      const restored = restoreProtectedTokensFromLlm(
        `\`\`\`bash\necho hi\n\`\`\`\n${masked.result.orderedTokens[0]}`,
        masked.result,
        'b0',
      )
      expect('violations' in restored).toBe(true)
    }
  })

  it('blocks when baseEn digest mismatches .baseline.json or EN provenance is unverified', async () => {
    const contractSupport = loadLocalizedContractSupport({ repositoryRoot: repoRoot })
    const provider = new FakeDraftLlmProvider()
    const baseEn = makeEnSnapshot('# T\n\nBody.\n')
    const wrongBase = makeEnSnapshot('# T\n\nDifferent body.\n')
    const newEn = makeEnSnapshot('# T\n\nUpdated body.\n', 'delete-entities', '2'.repeat(40))
    const curZh = '# 标题\n\n正文。\n'
    const baseline = makeBaseline('delete-entities', baseEn, curZh)

    const mismatchRes = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: { hasSourceMd: true, sourceMdText: curZh, hasBaselineJson: true, baseline, lifecycleState: 'ready' },
      newEn,
      baseEn: wrongBase,
      llmProvider: provider,
      contractSupport,
    })
    expect(mismatchRes.status).toBe('blocked')
    if (mismatchRes.status === 'blocked') {
      expect(mismatchRes.reason).toBe('base-en-missing-or-mismatch')
    }

    const unverifiedNew: VerifiedEnSnapshot = {
      ...newEn,
      provenance: { ...newEn.provenance, verified: false },
    }
    const unverifiedRes = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: { hasSourceMd: true, sourceMdText: curZh, hasBaselineJson: true, baseline, lifecycleState: 'ready' },
      newEn: unverifiedNew,
      baseEn,
      llmProvider: provider,
      contractSupport,
    })
    expect(unverifiedRes.status).toBe('blocked')
    if (unverifiedRes.status === 'blocked') {
      expect(unverifiedRes.reason).toBe('en-provenance-invalid')
    }
  })

  it('pauses overlapping human ZH edits with manual-zh-conflict ReviewTodo and preserves human text verbatim', async () => {
    const contractSupport = loadLocalizedContractSupport({ repositoryRoot: repoRoot })
    let llmCalls = 0
    const provider = new FakeDraftLlmProvider({
      responder: unit => {
        llmCalls += 1
        return unit.maskedEnText
      },
    })
    const baseEn = makeEnSnapshot('# Title\n\n## Guide\\{#guide}\n\nOriginal sentence.\n')
    const newEn = makeEnSnapshot('# Title\n\n## Guide\\{#guide}\n\nUpdated EN sentence.\n', 'delete-entities', '2'.repeat(40))
    const reviewedZh = '# 标题\n\n## 指南\\{#guide}\n\n已审中文句子。\n'
    const baseline = makeBaseline('delete-entities', baseEn, reviewedZh)
    const humanEditedOverlapZh = '# 标题\n\n## 指南\\{#guide}\n\n文档工程师在同一段手工重写的内容。\n'

    const res = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: {
        hasSourceMd: true,
        sourceMdText: humanEditedOverlapZh,
        hasBaselineJson: true,
        baseline,
        lifecycleState: 'ready',
      },
      newEn,
      baseEn,
      llmProvider: provider,
      contractSupport,
    })

    expect(res.status).toBe('drafted')
    if (res.status !== 'drafted') return
    expect(llmCalls).toBe(0)
    expect(res.candidateSourceMd).toContain('文档工程师在同一段手工重写的内容。')
    expect(res.todos.some(t => t.kind === 'manual-zh-conflict')).toBe(true)
  })

  it('fails closed when openai provider env variables are missing', () => {
    expect(() =>
      createDraftLlmProvider({ provider: 'openai', env: {} }),
    ).toThrow(/ZDOC_DRAFT_LLM_BASE_URL/)
  })

  it('preserves Tier-3 customized ZH code block verbatim and retains customized_for_zh in baseline when EN deletes the code block', async () => {
    const contractSupport = loadLocalizedContractSupport({ repositoryRoot: repoRoot })
    const provider = new FakeDraftLlmProvider({
      responder: unit => unit.maskedEnText.replace('Updated intro.', '更新后的简介。'),
    })

    const baseEn = makeEnSnapshot(`---
title: "Tier3Remove"
---

# Tier3Remove

## Connect\\{#connect}

Intro.

\`\`\`python
print("en-original")
\`\`\`

\`\`\`bash
echo "kept-en-code"
\`\`\`

Outro.
`)
    const newEn = makeEnSnapshot(`---
title: "Tier3Remove"
---

# Tier3Remove

## Connect\\{#connect}

Updated intro.

\`\`\`bash
echo "kept-en-code-v2"
\`\`\`

Outro.
`, 'delete-entities', '2'.repeat(40))

    const curZh = `# Tier3Remove

## 连接\\{#connect}

简介。

\`\`\`python
# 中国站定制代码不能被静默删除
uri = "https://in01-cn.zillizcloud.com.cn"
\`\`\`

\`\`\`bash
echo "kept-en-code"
\`\`\`

结尾。
`
    const baseline = makeBaseline('delete-entities', baseEn, curZh)
    baseline.sections[1].code_blocks[0].customized_for_zh = true

    const res = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: {
        hasSourceMd: true,
        sourceMdText: curZh,
        hasBaselineJson: true,
        baseline,
        lifecycleState: 'ready',
      },
      newEn,
      baseEn,
      llmProvider: provider,
      contractSupport,
    })

    expect(res.status).toBe('drafted')
    if (res.status !== 'drafted') return

    expect(res.candidateSourceMd).toContain('# 中国站定制代码不能被静默删除')
    expect(res.candidateSourceMd).toContain('uri = "https://in01-cn.zillizcloud.com.cn"')
    expect(res.candidateSourceMd).toContain('echo "kept-en-code-v2"')
    expect(res.todos.some(t => t.kind === 'code-conflict' && t.zhCurrent?.includes('中国站定制代码不能被静默删除'))).toBe(true)

    const connectSec = res.updatedBaseline.sections.find(s => s.anchor === 'connect')!
    expect(connectSec.code_blocks).toHaveLength(2)
    expect(connectSec.code_blocks[0].customized_for_zh).toBe(true)
    expect(connectSec.code_blocks[0].lang).toBe('python')
    expect(connectSec.code_blocks[1].customized_for_zh).toBe(false)
    expect(connectSec.code_blocks[1].lang).toBe('bash')

    // Verify single-code-block section when EN deletes the only code block
    const singleBaseEn = makeEnSnapshot(`---
title: "SingleRemove"
---

# SingleRemove

## Code\\{#code}

Intro.

\`\`\`python
print("en")
\`\`\`
`)
    const singleNewEn = makeEnSnapshot(`---
title: "SingleRemove"
---

# SingleRemove

## Code\\{#code}

Updated intro.
`, 'delete-entities', '3'.repeat(40))
    const singleCurZh = `# SingleRemove

## 代码\\{#code}

简介。

\`\`\`python
print("zh-custom")
\`\`\`
`
    const singleBaseline = makeBaseline('delete-entities', singleBaseEn, singleCurZh)
    singleBaseline.sections[1].code_blocks[0].customized_for_zh = true

    const singleRes = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: {
        hasSourceMd: true,
        sourceMdText: singleCurZh,
        hasBaselineJson: true,
        baseline: singleBaseline,
        lifecycleState: 'ready',
      },
      newEn: singleNewEn,
      baseEn: singleBaseEn,
      llmProvider: provider,
      contractSupport,
    })
    expect(singleRes.status).toBe('drafted')
    if (singleRes.status !== 'drafted') return
    expect(singleRes.candidateSourceMd).toContain('print("zh-custom")')
    const singleCodeSec = singleRes.updatedBaseline.sections.find(s => s.anchor === 'code')!
    expect(singleCodeSec.code_blocks).toHaveLength(1)
    expect(singleCodeSec.code_blocks[0].customized_for_zh).toBe(true)
  })

  it('preserves ZH-only code block alongside an EN code block in the same section', async () => {
    const contractSupport = loadLocalizedContractSupport({ repositoryRoot: repoRoot })
    const provider = new FakeDraftLlmProvider({
      responder: unit => unit.maskedEnText.replace('Intro updated.', '更新后的简介。'),
    })

    const baseEn = makeEnSnapshot(`---
title: "ZhOnlyCode"
---

# ZhOnlyCode

## Setup\\{#setup}

Intro.

\`\`\`python
print("en-v1")
\`\`\`
`)
    const newEn = makeEnSnapshot(`---
title: "ZhOnlyCode"
---

# ZhOnlyCode

## Setup\\{#setup}

Intro updated.

\`\`\`python
print("en-v2")
\`\`\`
`, 'delete-entities', '2'.repeat(40))

    const curZh = `# ZhOnlyCode

## 安装\\{#setup}

简介。

\`\`\`bash
# 中国站独有镜像源配置
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
\`\`\`

\`\`\`python
print("en-v1")
\`\`\`
`
    const baseline = makeBaseline('delete-entities', baseEn, curZh)

    const res = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: {
        hasSourceMd: true,
        sourceMdText: curZh,
        hasBaselineJson: true,
        baseline,
        lifecycleState: 'ready',
      },
      newEn,
      baseEn,
      llmProvider: provider,
      contractSupport,
    })

    expect(res.status).toBe('drafted')
    if (res.status !== 'drafted') return
    expect(res.candidateSourceMd).toContain('# 中国站独有镜像源配置')
    expect(res.candidateSourceMd).toContain('https://pypi.tuna.tsinghua.edu.cn/simple')
    expect(res.candidateSourceMd).toContain('print("en-v2")')
    expect(res.todos.some(t => t.kind === 'code-conflict')).toBe(false)

    const setupSec = res.updatedBaseline.sections.find(s => s.anchor === 'setup')!
    expect(setupSec.code_blocks).toHaveLength(2)
    expect(setupSec.code_blocks[0]).toMatchObject({ lang: 'bash', customized_for_zh: true })
    expect(setupSec.code_blocks[1]).toMatchObject({ lang: 'python', customized_for_zh: false })
  })

  it('does not emit empty <NextChannel action="include"> wrapper on ambiguous merge with added NEXT wrapper', async () => {
    const contractSupport = loadLocalizedContractSupport({ repositoryRoot: repoRoot })
    let llmCalls = 0
    const provider = new FakeDraftLlmProvider({
      responder: () => {
        llmCalls += 1
        return 'unused'
      },
    })

    const baseEn = makeEnSnapshot(`---
title: "MergeNext"
---

# MergeNext

## Steps\\{#steps}

Step 1 original.

Step 2 original.
`)
    const curZh = `# MergeNext

## 步骤\\{#steps}

第一步原文。

**提示：** 中文独有夹层提示。

第二步原文。
`
    const newEn = makeEnSnapshot(`---
title: "MergeNext"
---

# MergeNext

## Steps\\{#steps}

<NextChannel action="include">

Step 1 and Step 2 merged into one step.

</NextChannel>
`, 'delete-entities', '2'.repeat(40))
    const baseline = makeBaseline('delete-entities', baseEn, curZh)

    const res = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: {
        hasSourceMd: true,
        sourceMdText: curZh,
        hasBaselineJson: true,
        baseline,
        lifecycleState: 'ready',
      },
      newEn,
      baseEn,
      llmProvider: provider,
      contractSupport,
    })

    expect(res.status).toBe('drafted')
    if (res.status !== 'drafted') return
    expect(llmCalls).toBe(0)
    expect(res.candidateSourceMd).not.toContain('<NextChannel')
    expect(res.candidateSourceMd).not.toContain('</NextChannel>')
    expect(res.candidateSourceMd).toContain('第一步原文。')
    expect(res.candidateSourceMd).toContain('**提示：** 中文独有夹层提示。')
    expect(res.candidateSourceMd).toContain('第二步原文。')
    const todo = res.todos.find(t => t.sectionAnchor === 'steps')
    expect(todo).toBeDefined()
    expect(todo?.enAfter).toContain('<NextChannel action="include">')
    expect(todo?.enAfter).toContain('Step 1 and Step 2 merged into one step.')
  })

  it('handles same-language multi-code-block deletion (1D & 1E) and ZH-only python before EN python (1F & 1H) end-to-end', async () => {
    const contractSupport = loadLocalizedContractSupport({ repositoryRoot: repoRoot })
    const provider = new FakeDraftLlmProvider({
      responder: unit => unit.maskedEnText,
    })

    // 1D: 2 python blocks; B1 customized deleted by EN, B2 uncustomized kept by EN
    const baseEn1D = makeEnSnapshot(`---
title: "CodeAlign1D"
---

# CodeAlign1D

## Connect\\{#connect}

Intro.

\`\`\`python
print("block-1-en")
\`\`\`

\`\`\`python
client = 1
\`\`\`
`)
    const newEn1D = makeEnSnapshot(`---
title: "CodeAlign1D"
---

# CodeAlign1D

## Connect\\{#connect}

Intro.

\`\`\`python
client = 1
\`\`\`
`, 'delete-entities', '2'.repeat(40))
    const curZh1D = `# CodeAlign1D

## 连接\\{#connect}

简介。

\`\`\`python
# 中国站定制 block 1
uri = "https://in01-cn.zillizcloud.com.cn"
\`\`\`

\`\`\`python
client = 1
\`\`\`
`
    const baseline1D = makeBaseline('delete-entities', baseEn1D, curZh1D)
    baseline1D.sections[1].code_blocks[0].customized_for_zh = true

    const res1D = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: { hasSourceMd: true, sourceMdText: curZh1D, hasBaselineJson: true, baseline: baseline1D, lifecycleState: 'ready' },
      newEn: newEn1D,
      baseEn: baseEn1D,
      llmProvider: provider,
      contractSupport,
    })
    expect(res1D.status).toBe('drafted')
    if (res1D.status !== 'drafted') return
    expect(res1D.candidateSourceMd).toContain('# 中国站定制 block 1')
    expect(res1D.candidateSourceMd).toContain('client = 1')
    expect(res1D.todos.some(t => t.kind === 'code-conflict')).toBe(true)
    expect(res1D.todos.some(t => t.kind === 'ambiguous-merge')).toBe(false)
    expect(res1D.updatedBaseline.sections[1].code_blocks).toHaveLength(2)

    // 1E: 2 python blocks; B1 uncustomized deleted by EN, B2 customized kept by EN (with EN modification or kept unchanged)
    const baseEn1E = makeEnSnapshot(`---
title: "CodeAlign1E"
---

# CodeAlign1E

## Connect\\{#connect}

Intro.

\`\`\`python
print("block-1-en")
\`\`\`

\`\`\`python
# block 2 keep unchanged
uri = "https://cloud.zilliz.com"
\`\`\`
`)
    const newEn1E = makeEnSnapshot(`---
title: "CodeAlign1E"
---

# CodeAlign1E

## Connect\\{#connect}

Intro.

\`\`\`python
# block 2 keep unchanged
uri = "https://cloud.zilliz.com"
\`\`\`
`, 'delete-entities', '3'.repeat(40))
    const curZh1E = `# CodeAlign1E

## 连接\\{#connect}

简介。

\`\`\`python
print("block-1-en")
\`\`\`

\`\`\`python
# 中国站定制 block 2 (kept by EN)
uri = "https://in01-cn.zillizcloud.com.cn"
\`\`\`
`
    const baseline1E = makeBaseline('delete-entities', baseEn1E, curZh1E)
    baseline1E.sections[1].code_blocks[1].customized_for_zh = true

    const res1E = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: { hasSourceMd: true, sourceMdText: curZh1E, hasBaselineJson: true, baseline: baseline1E, lifecycleState: 'ready' },
      newEn: newEn1E,
      baseEn: baseEn1E,
      llmProvider: provider,
      contractSupport,
    })
    expect(res1E.status).toBe('drafted')
    if (res1E.status !== 'drafted') return
    expect(res1E.candidateSourceMd).not.toContain('print("block-1-en")')
    expect(res1E.candidateSourceMd).toContain('# 中国站定制 block 2 (kept by EN)')
    expect(res1E.candidateSourceMd.match(/```python/g)?.length).toBe(1)
    expect(res1E.todos.some(t => t.kind === 'code-conflict')).toBe(false)
    expect(res1E.updatedBaseline.sections[1].code_blocks).toHaveLength(1)
    expect(res1E.updatedBaseline.sections[1].code_blocks[0].customized_for_zh).toBe(true)

    // 1E variant where EN also modifies kept block B2 slightly (e.g. cloud.zilliz.com -> in01.zillizcloud.com)
    const newEn1EMod = makeEnSnapshot(`---
title: "CodeAlign1E"
---

# CodeAlign1E

## Connect\\{#connect}

Intro.

\`\`\`python
# block 2 keep unchanged
uri = "https://in01.zillizcloud.com"
\`\`\`
`, 'delete-entities', '4'.repeat(40))
    const res1EMod = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: { hasSourceMd: true, sourceMdText: curZh1E, hasBaselineJson: true, baseline: baseline1E, lifecycleState: 'ready' },
      newEn: newEn1EMod,
      baseEn: baseEn1E,
      llmProvider: provider,
      contractSupport,
    })
    expect(res1EMod.status).toBe('drafted')
    if (res1EMod.status !== 'drafted') return
    expect(res1EMod.candidateSourceMd).not.toContain('print("block-1-en")')
    expect(res1EMod.candidateSourceMd).toContain('# 中国站定制 block 2 (kept by EN)')
    expect(res1EMod.candidateSourceMd.match(/```python/g)?.length).toBe(1)
    expect(res1EMod.todos.filter(t => t.kind === 'code-conflict')).toHaveLength(1)

    // 1F & 1H: ZH-only python block BEFORE EN python block
    const baseEn1FH = makeEnSnapshot(`---
title: "CodeAlign1FH"
---

# CodeAlign1FH

## Connect\\{#connect}

Intro.

\`\`\`python
val = 1
\`\`\`
`)
    const curZh1FH = `# CodeAlign1FH

## 连接\\{#connect}

简介。

\`\`\`python
zh_extra = "cn-only"
\`\`\`

\`\`\`python
val = 1
\`\`\`
`
    const baseline1FH = makeBaseline('delete-entities', baseEn1FH, curZh1FH)

    // 1F: EN deletes val = 1
    const newEn1F = makeEnSnapshot(`---
title: "CodeAlign1FH"
---

# CodeAlign1FH

## Connect\\{#connect}

Intro.
`, 'delete-entities', '5'.repeat(40))
    const res1F = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: { hasSourceMd: true, sourceMdText: curZh1FH, hasBaselineJson: true, baseline: baseline1FH, lifecycleState: 'ready' },
      newEn: newEn1F,
      baseEn: baseEn1FH,
      llmProvider: provider,
      contractSupport,
    })
    expect(res1F.status).toBe('drafted')
    if (res1F.status !== 'drafted') return
    expect(res1F.candidateSourceMd).toContain('zh_extra = "cn-only"')
    expect(res1F.candidateSourceMd).not.toContain('val = 1')
    expect(res1F.todos.some(t => t.kind === 'code-conflict')).toBe(false)

    // 1H: EN modifies val = 1 -> val = 2
    const newEn1H = makeEnSnapshot(`---
title: "CodeAlign1FH"
---

# CodeAlign1FH

## Connect\\{#connect}

Intro.

\`\`\`python
val = 2
\`\`\`
`, 'delete-entities', '6'.repeat(40))
    const res1H = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: { hasSourceMd: true, sourceMdText: curZh1FH, hasBaselineJson: true, baseline: baseline1FH, lifecycleState: 'ready' },
      newEn: newEn1H,
      baseEn: baseEn1FH,
      llmProvider: provider,
      contractSupport,
    })
    expect(res1H.status).toBe('drafted')
    if (res1H.status !== 'drafted') return
    expect(res1H.candidateSourceMd).toContain('zh_extra = "cn-only"')
    expect(res1H.candidateSourceMd).toContain('val = 2')
    expect(res1H.candidateSourceMd).not.toContain('val = 1')
    expect(res1H.todos.some(t => t.kind === 'code-conflict')).toBe(false)
  })

  it('preserves human-edited Prod prose in CURRENT view when 1:1 paragraph is wrapped in <NextChannel action="include"> (2D)', async () => {
    const contractSupport = loadLocalizedContractSupport({ repositoryRoot: repoRoot })
    let llmCalls = 0
    const provider = new FakeDraftLlmProvider({
      responder: () => {
        llmCalls += 1
        return 'unused'
      },
    })

    const baseEn = makeEnSnapshot(`---
title: "ZhEdited2D"
---

# ZhEdited2D

## Steps\\{#steps}

Step 1 original.
`)
    const reviewedZh = `# ZhEdited2D

## 步骤\\{#steps}

第一步原译文。
`
    const humanEditedZh = `# ZhEdited2D

## 步骤\\{#steps}

第一步人工精修（现网可见）。
`
    const newEn = makeEnSnapshot(`---
title: "ZhEdited2D"
---

# ZhEdited2D

## Steps\\{#steps}

<NextChannel action="include">

Step 1 updated in NEXT.

</NextChannel>
`, 'delete-entities', '2'.repeat(40))
    const baseline = makeBaseline('delete-entities', baseEn, reviewedZh)

    const res = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: incrementalConfig,
      curZh: {
        hasSourceMd: true,
        sourceMdText: humanEditedZh,
        hasBaselineJson: true,
        baseline,
        lifecycleState: 'ready',
      },
      newEn,
      baseEn,
      llmProvider: provider,
      contractSupport,
    })

    expect(res.status).toBe('drafted')
    if (res.status !== 'drafted') return
    expect(llmCalls).toBe(0)
    expect(res.candidateSourceMd).not.toContain('<NextChannel')
    expect(res.candidateSourceMd).not.toContain('</NextChannel>')
    expect(projectChannelPreview(res.candidateSourceMd, 'current')).toContain('第一步人工精修（现网可见）。')
    const todo = res.todos.find(t => t.kind === 'manual-zh-conflict')
    expect(todo).toBeDefined()
    expect(todo?.enAfter).toContain('<NextChannel action="include">')
    expect(todo?.enAfter).toContain('Step 1 updated in NEXT.')
    expect(todo?.zhCurrent).toBe('第一步人工精修（现网可见）。')
  })
})
