// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  applyTier2CodeRules,
  syncAllCodeBlocks,
  syncCodeBlockTriplet,
} from '../core/code-sync.ts'
import type { AlignedCodeTriplet } from '../core/diff.ts'
import { parseStructuredDocument, type BlockUnit } from '../core/sections.ts'

function extractFirstCodeBlock(md: string): BlockUnit {
  const res = parseStructuredDocument({ kind: 'en', text: md, isAlreadyStripped: true })
  if (!('doc' in res)) throw new Error('parse failed')
  for (const sec of res.doc.sections) {
    const found = sec.blocks.find(b => b.kind === 'code')
    if (found) return found
  }
  throw new Error('no code block found')
}

describe('localized-docs core/code-sync (3-tier fenced code protection)', () => {
  it('Tier 1: syncs verbatim from newEn when curZh matched baseEn and is not customized (preserving channel directives)', () => {
    const baseCode = extractFirstCodeBlock(`# T

\`\`\`python
# 1. Connect
client = MilvusClient(uri="YOUR_ENDPOINT")
\`\`\`
`)
    const newCode = extractFirstCodeBlock(`# T

\`\`\`python
# 1. Connect
client = MilvusClient(
    uri="YOUR_ENDPOINT",
    # next-channel-next-line
    timeout=30
)
\`\`\`
`)
    const curZhCode = extractFirstCodeBlock(`# T

\`\`\`python
# 1. Connect
client = MilvusClient(uri="YOUR_ENDPOINT")
\`\`\`
`)

    const triplet: AlignedCodeTriplet = {
      sectionAnchor: '__h1__',
      blockId: 'sec:__h1__:b1',
      channel: 'shared',
      baseEn: baseCode,
      newEn: newCode,
      curZh: curZhCode,
      baselineCodeMeta: {
        lang: 'python',
        customized_for_zh: false,
        en_sha256: baseCode.sha256,
      },
    }

    const res = syncCodeBlockTriplet(triplet)
    expect(res.tier).toBe(1)
    expect(res.action).toBe('tier1-synced')
    expect(res.customizedForZh).toBe(false)
    expect(res.outputRaw).toBe(newCode.raw)
    expect(res.outputRaw).toContain('# next-channel-next-line')
    expect(res.outputRaw).toContain('# 1. Connect')
    expect(res.todo).toBeUndefined()
    expect(res.baselineEntry).toEqual({
      lang: 'python',
      customized_for_zh: false,
      en_sha256: newCode.sha256,
    })
  })

  it('Tier 2: deterministically maps Global domains to .cn domains without calling any LLM', () => {
    const baseCode = extractFirstCodeBlock(`# T

\`\`\`bash
curl https://cloud.zilliz.com/v1/clusters -H "Host: in01.api.gcp.zillizcloud.com"
\`\`\`
`)
    const newCode = extractFirstCodeBlock(`# T

\`\`\`bash
curl https://cloud.zilliz.com/v2/clusters -H "Host: in01.api.gcp.zillizcloud.com"
\`\`\`
`)
    const curZhCode = extractFirstCodeBlock(`# T

\`\`\`bash
curl https://cloud.zilliz.com.cn/v1/clusters -H "Host: in01.api.gcp.zillizcloud.com.cn"
\`\`\`
`)

    const res = syncCodeBlockTriplet({
      sectionAnchor: '__h1__',
      blockId: 'sec:__h1__:b1',
      channel: 'shared',
      baseEn: baseCode,
      newEn: newCode,
      curZh: curZhCode,
      baselineCodeMeta: {
        lang: 'bash',
        customized_for_zh: false,
        en_sha256: baseCode.sha256,
      },
    })

    expect(res.tier).toBe(2)
    expect(res.action).toBe('tier2-mapped')
    expect(res.customizedForZh).toBe(false)
    expect(res.appliedRuleIds).toEqual([
      'zilliz-cloud-console-domain',
      'zilliz-cloud-api-domain',
    ])
    expect(res.outputRaw).toContain('https://cloud.zilliz.com.cn/v2/clusters')
    expect(res.outputRaw).toContain('in01.api.gcp.zillizcloud.com.cn')
    expect(res.outputRaw).not.toContain('.cn.cn')
    expect(res.todo).toBeUndefined()

    // Idempotency check
    const second = applyTier2CodeRules(res.outputRaw!)
    expect(second.appliedRuleIds).toEqual([])
  })

  it('Tier 3: pauses auto-sync, preserves customized ZH code verbatim, and emits code-conflict ReviewTodo', () => {
    const baseCode = extractFirstCodeBlock(`# T

\`\`\`python
client = MilvusClient(uri="https://in01-demo.api.gcp-us-west1.zillizcloud.com")
\`\`\`
`)
    const newCode = extractFirstCodeBlock(`# T

\`\`\`python
client = MilvusClient(uri="https://in01-demo.api.gcp-us-west1.zillizcloud.com", timeout=10)
\`\`\`
`)
    const curZhCode = extractFirstCodeBlock(`# T

\`\`\`python
# 中国站自定义内网 Endpoint 示例
client = MilvusClient(uri="https://in01-custom-cn.api.ali-cn-hangzhou.zillizcloud.com.cn")
\`\`\`
`)

    const results = syncAllCodeBlocks([
      {
        sectionAnchor: '__h1__',
        blockId: 'sec:__h1__:b1',
        channel: 'shared',
        baseEn: baseCode,
        newEn: newCode,
        curZh: curZhCode,
        baselineCodeMeta: {
          lang: 'python',
          customized_for_zh: true,
          en_sha256: baseCode.sha256,
        },
      },
    ])

    expect(results).toHaveLength(1)
    const res = results[0]
    expect(res.tier).toBe(3)
    expect(res.action).toBe('tier3-conflict')
    expect(res.customizedForZh).toBe(true)
    expect(res.outputRaw).toBe(curZhCode.raw)
    expect(res.baselineEntry).toEqual({
      lang: 'python',
      customized_for_zh: true,
      en_sha256: baseCode.sha256,
    })
    expect(res.todo).toBeDefined()
    expect(res.todo?.kind).toBe('code-conflict')
    expect(res.todo?.enBefore).toContain('YOUR_ENDPOINT'.replace('YOUR_ENDPOINT', 'zillizcloud.com'))
    expect(res.todo?.enAfter).toContain('timeout=10')
    expect(res.todo?.zhCurrent).toContain('ali-cn-hangzhou')
  })

  it('Tier 3 also triggers when curZh differs from baseEn even if baseline customized_for_zh flag was false', () => {
    const baseCode = extractFirstCodeBlock(`# T\n\n\`\`\`js\nconst a = 1;\n\`\`\`\n`)
    const newCode = extractFirstCodeBlock(`# T\n\n\`\`\`js\nconst a = 2;\n\`\`\`\n`)
    const curZhCode = extractFirstCodeBlock(`# T\n\n\`\`\`js\nconst a = 99; // custom\n\`\`\`\n`)

    const res = syncCodeBlockTriplet({
      sectionAnchor: '__h1__',
      blockId: 'sec:__h1__:b1',
      channel: 'shared',
      baseEn: baseCode,
      newEn: newCode,
      curZh: curZhCode,
      baselineCodeMeta: {
        lang: 'js',
        customized_for_zh: false,
        en_sha256: baseCode.sha256,
      },
    })

    expect(res.tier).toBe(3)
    expect(res.action).toBe('tier3-conflict')
    expect(res.outputRaw).toBe(curZhCode.raw)
    expect(res.todo?.kind).toBe('code-conflict')
  })

  it('preserves customized ZH code as Tier 3 conflict when EN deletes the code block', () => {
    const baseCode = extractFirstCodeBlock(`# T\n\n\`\`\`bash\necho "old"\n\`\`\`\n`)
    const curZhCode = extractFirstCodeBlock(`# T\n\n\`\`\`bash\necho "zh-custom"\n\`\`\`\n`)

    const res = syncCodeBlockTriplet({
      sectionAnchor: '__h1__',
      blockId: 'sec:__h1__:b1',
      channel: 'shared',
      baseEn: baseCode,
      newEn: null,
      curZh: curZhCode,
    })

    expect(res.tier).toBe(3)
    expect(res.action).toBe('tier3-conflict')
    expect(res.outputRaw).toBe(curZhCode.raw)
    expect(res.todo?.kind).toBe('code-conflict')
  })
})
