// @vitest-environment node
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadLocalizedContractSupport } from '../adapters/contract.ts'
import { FakeDraftLlmProvider, createDraftLlmProvider } from '../adapters/llm.ts'
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
})
