// @vitest-environment node
import { spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadLocalizedContractSupport } from '../adapters/contract.ts'
import { FakeDraftLlmProvider } from '../adapters/llm.ts'
import { parseBootstrapArgs, runBootstrap } from '../commands/bootstrap.ts'
import { runCheck } from '../commands/check.ts'
import { bootstrapPageCore, scanResidualFeishuAssetsAndLinks, stripLegacyZhShell } from '../core/bootstrap.ts'
import { parseBaselineJson, validateBaselineConsistency } from '../core/baseline.ts'
import { parseLocalizedPageConfig } from '../core/config.ts'
import { executeDraftEngine, type DraftLlmProvider, type VerifiedEnSnapshot } from '../core/draft.ts'
import { REVIEW_TODOS_END_MARKER, REVIEW_TODOS_START_MARKER } from '../core/pr-body.ts'
import { evaluateReviewTodos } from '../core/review-gate.ts'
import { computeChannelDigests } from '../core/sections.ts'
import { stripEnShell } from '../core/strip-en.ts'
import { sha256Hex, type BaselineJson } from '../core/types.ts'
import { VALID_GROUP_VARIABLES_JSON } from './fixtures/en-samples.ts'

const repositoryRoot = path.resolve(import.meta.dirname, '../../../../..')
const cliLauncher = path.join(repositoryRoot, 'scripts/docs-tooling.js')

function tempDir(prefix = 'localized-docs-bootstrap-'): string {
  return realpathSync(mkdtempSync(path.join(tmpdir(), prefix)))
}

function runDocsToolingCli(args: string[]) {
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !/^(NODE_PATH$|NODE_OPTIONS$|npm_|pnpm_|GIT_|LD_|DYLD_|JITI_)/i.test(key),
    ),
  )
  return spawnSync(process.execPath, [cliLauncher, 'localized-docs', ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env,
    timeout: 30_000,
  })
}

function makeEnSnapshot(pageId: string, rawMdx: string, devCommit = 'a'.repeat(40)): VerifiedEnSnapshot {
  const stripped = stripEnShell(rawMdx)
  if ('errors' in stripped) {
    throw new Error(`Failed to strip EN fixture: ${stripped.errors.map(e => e.message).join('; ')}`)
  }
  return {
    rawMdx,
    stripped,
    provenance: {
      manual: 'guides',
      sharedPage: pageId,
      devCommit,
      enPath: `content/en/guides/${pageId}.md`,
      manifestPath: `generated/en/manifests/shared-pages/guides/${pageId}.json`,
      fileSha256: sha256Hex(rawMdx),
      channels: computeChannelDigests(stripped.body),
      receiptChannel: null,
      provenanceMode: 'shared-receipt',
      verified: true,
      verificationErrors: [],
    },
  }
}

function makeSharedReceipt(pageId: string, enPath: string, enText: string, commit: string) {
  return {
    schema_version: 1,
    page: pageId,
    token: `shared-${pageId}`,
    inputs: {
      milvus_docs: { repository: 'milvus-io/milvus-docs', current: commit, next: commit, files: [] },
      zdoc: { repository: 'zilliztech/zdoc', commit, files: [] },
      dev: { commit, files: [] },
      fetch: {
        navigation: sha256Hex('nav'),
        image_base_url: 'https://images.example.com',
      },
      tools: { zdoc: commit, md2md: '1.3.0' },
      images: [],
    },
    outputs: [{ manual: 'guides', path: enPath, sha256: sha256Hex(enText) }],
    channel: null,
    notes: [],
  }
}

const SAMPLE_EN_MDX = `---
title: "Delete Entities | Cloud"
slug: /delete-entities
sidebar_label: "Delete"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Delete entities by filtering conditions or primary keys. | Cloud"
type: origin
token: RhKcwNACpi3WihkTzo8cr4BCnee
sidebar_position: 4
displayed_sidebar: default
custom_edit_url: null
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Delete Entities

You can delete entities by filtering conditions or primary keys.

## Prerequisites\\{#prerequisites}

Make sure you have connected to your cluster.

## Delete Entities by Filtering Conditions\\{#delete-entities-by-filtering-conditions}

Click <UI>Delete</UI> in the console to remove entities.

<NextChannel action="include">

Verify the filter expression before submitting the delete request.

</NextChannel>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Curl","value":"curl"}]}>
<TabItem value='python'>

\`\`\`python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="https://in01-demo.api.gcp-us-west1.zillizcloud.com",
    token="YOUR_CLUSTER_TOKEN"
)
client.delete(collection_name="quick_setup", filter="id > 0")
\`\`\`

</TabItem>
<TabItem value='java'>

\`\`\`java
import io.milvus.v2.client.MilvusClientV2;

client.delete(DeleteReq.builder()
    .collectionName("quick_setup")
    .filter("id > 0")
    .build());
\`\`\`

</TabItem>
<TabItem value='curl'>

\`\`\`bash
curl --request POST "https://cloud.zilliz.com/v2/vectordb/entities/delete"
\`\`\`

</TabItem>
</Tabs>
`

const REALISTIC_DEV_ZH_MDX = `---
title: "删除 Entity | Cloud"
slug: /delete-entities
sidebar_label: "删除"
beta: FALSE
added_since: 2.4.x
last_modified: 2.5.x
deprecate_since: FALSE
notebook: FALSE
description: "您可以按过滤条件或主键删除不再需要的 Entity。 | Cloud"
type: origin
token: FgDZw6JJuiICETkqrqHckN4pneb
sidebar_position: 4
displayed_sidebar: default
custom_edit_url: null
channel: next
sidebar_custom_props:
  channel: next
owner: "@legacy-person"
feishu_record_id: "recLegacy12345"
---

import Admonition from '@theme/Admonition';


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Procedures from '@site/src/components/Procedures';

# 删除 Entity

您可以按过滤条件或主键删除不再需要的 Entity。

## 前提条件\\{#prerequisites}

请确保已连接到您的集群。

## 按过滤条件删除 Entity\\{#delete-entities-by-filtering-conditions}

在控制台中点击 <UI>删除</UI> 以删除 Entity。

<NextChannel action="include">

提交删除请求前请核对过滤表达式。

</NextChannel>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Curl","value":"curl"}]}>
<TabItem value='python'>

\`\`\`python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="https://in01-demo.api.gcp-us-west1.zillizcloud.com.cn",
    token="YOUR_CLUSTER_TOKEN"
)
client.delete(collection_name="quick_setup", filter="id > 0")
\`\`\`

</TabItem>
<TabItem value='java'>

\`\`\`java
import io.milvus.v2.client.MilvusClientV2;

// 中国站专属自定义 endpoint 与额外租户参数
client.delete(DeleteReq.builder()
    .collectionName("cn_custom_collection")
    .region("ali-cn-hangzhou")
    .filter("id > 0")
    .build());
\`\`\`

</TabItem>
<TabItem value='curl'>

\`\`\`bash
curl --request POST "https://cloud.zilliz.com/v2/vectordb/entities/delete"
\`\`\`

</TabItem>
</Tabs>
`

describe('localized-docs core/bootstrap', () => {
  it('strips published dev ZH MDX shell while preserving title, description, JSX, <NextChannel>, <UI>, and code imports', () => {
    const stripped = stripLegacyZhShell(REALISTIC_DEV_ZH_MDX)
    expect('errors' in stripped).toBe(false)
    if ('errors' in stripped) return

    expect(stripped.title).toBe('删除 Entity')
    expect(stripped.description).toBe('您可以按过滤条件或主键删除不再需要的 Entity。')
    expect(stripped.strippedFrontMatterKeys).toEqual(
      expect.arrayContaining([
        'slug',
        'sidebar_label',
        'sidebar_position',
        'token',
        'custom_edit_url',
        'type',
        'displayed_sidebar',
        'beta',
        'added_since',
        'last_modified',
        'deprecate_since',
        'notebook',
        'channel',
        'sidebar_custom_props',
        'owner',
        'feishu_record_id',
      ]),
    )
    expect(stripped.strippedImports).toHaveLength(4)

    expect(stripped.sourceMd).toContain('title: "删除 Entity"')
    expect(stripped.sourceMd).toContain('description: "您可以按过滤条件或主键删除不再需要的 Entity。"')
    expect(stripped.sourceMd).not.toContain('slug:')
    expect(stripped.sourceMd).not.toContain('sidebar_label:')
    expect(stripped.sourceMd).not.toContain('owner:')
    expect(stripped.sourceMd).not.toContain('feishu_record_id:')
    expect(stripped.sourceMd).not.toContain("import Admonition from '@theme/Admonition'")
    expect(stripped.sourceMd).not.toContain("import Procedures from '@site/src/components/Procedures'")

    // Preserves <NextChannel>, <UI>, and imports inside fenced code blocks
    expect(stripped.sourceMd).toContain('<NextChannel action="include">')
    expect(stripped.sourceMd).toContain('<UI>删除</UI>')
    expect(stripped.sourceMd).toContain('import io.milvus.v2.client.MilvusClientV2;')
  })

  it('detects customized_for_zh vs Tier-2 domain mapping vs exact match, and protects customized code in subsequent incremental draft', async () => {
    const enSnapshot = makeEnSnapshot('delete-entities', SAMPLE_EN_MDX)
    const throwingLlm: DraftLlmProvider = {
      name: 'should-not-be-called',
      async draft() {
        throw new Error('Default bootstrap without --align-gap must NEVER call LLM')
      },
    }

    const res = await bootstrapPageCore({
      pageId: 'delete-entities',
      enSnapshot,
      zhLegacyRaw: REALISTIC_DEV_ZH_MDX,
      llmProvider: throwingLlm,
      nowIso: '2026-11-27T08:00:00Z',
    })
    expect('errors' in res).toBe(false)
    if ('errors' in res) return

    const { output } = res
    // Never emits owner or feishu_record_id in page.yaml
    expect(output.pageYamlText).not.toContain('owner')
    expect(output.pageYamlText).not.toContain('feishu_record_id')
    expect('errors' in parseLocalizedPageConfig('delete-entities', output.pageYamlText)).toBe(false)

    // Code block classification:
    // 0: python (zillizcloud.com -> zillizcloud.com.cn) => Tier-2 mapped => customized_for_zh: false
    // 1: java (China custom collection & region) => customized => customized_for_zh: true
    // 2: curl (exact match with EN) => exact => customized_for_zh: false
    expect(output.codeBlockAnalyses).toHaveLength(3)
    expect(output.codeBlockAnalyses[0]).toMatchObject({
      lang: 'python',
      matchKind: 'tier2-mapped',
      customizedForZh: false,
      appliedRuleIds: ['zilliz-cloud-api-domain'],
    })
    expect(output.codeBlockAnalyses[1]).toMatchObject({
      lang: 'java',
      matchKind: 'customized',
      customizedForZh: true,
    })
    expect(output.codeBlockAnalyses[2]).toMatchObject({
      lang: 'bash',
      matchKind: 'exact',
      customizedForZh: false,
    })
    expect(output.customizedCodeBlockCount).toBe(1)

    const filterSection = output.baseline.sections.find(
      s => s.anchor === 'delete-entities-by-filtering-conditions',
    )
    expect(filterSection).toBeDefined()
    expect(filterSection!.code_blocks.map(b => b.customized_for_zh)).toEqual([false, true, false])

    // Verify subsequent incremental ZH-WP2 draft does NOT clobber the customized Java code block!
    const updatedEnMdx = SAMPLE_EN_MDX.replace(
      '.filter("id > 0")',
      '.filter("id > 100")',
    )
    const updatedEnSnapshot = makeEnSnapshot('delete-entities', updatedEnMdx, 'b'.repeat(40))
    const draftRes = await executeDraftEngine({
      pageId: 'delete-entities',
      pageConfig: output.pageConfig,
      curZh: {
        hasSourceMd: true,
        sourceMdText: output.sourceMd,
        hasBaselineJson: true,
        baselineJsonText: output.baselineJsonText,
        baseline: output.baseline,
        lifecycleState: 'ready',
      },
      newEn: updatedEnSnapshot,
      baseEn: enSnapshot,
      llmProvider: new FakeDraftLlmProvider(),
      contractSupport: loadLocalizedContractSupport({ repositoryRoot }),
      nowIso: '2026-11-27T09:00:00Z',
    })
    expect(draftRes.status).toBe('drafted')
    if (draftRes.status !== 'drafted') return

    // Customized Java block preserved verbatim and flagged as tier3-conflict!
    expect(draftRes.candidateSourceMd).toContain('cn_custom_collection')
    expect(draftRes.candidateSourceMd).toContain('.region("ali-cn-hangzhou")')
    expect(draftRes.candidateSourceMd).not.toContain('.filter("id > 100")')
    expect(draftRes.codeSyncResults.some(r => r.lang === 'java' && r.action === 'tier3-conflict')).toBe(true)
    expect(draftRes.todos.some(t => t.kind === 'code-conflict')).toBe(true)
  })

  it('reports legacy ZH anchor mismatches without silently rewriting legacy anchors', async () => {
    const enMdx = `---
title: "Recycle Bin | Cloud"
slug: /use-recycle-bin
---

# Recycle Bin

Overview text.

## Prerequisites\\{#prerequisites}

Add a payment method first.

## Restore Cluster\\{#restore-cluster}

Follow the steps.
`
    const legacyZhMdx = `---
title: "回收站 | Cloud"
slug: /use-recycle-bin
token: FgDZw6JJuiICETkqrqHckN4pneb
---

# 回收站

概览说明。

## 前提条件\\{#qian-ti-tiao-jian}

请先添加支付方式。

## 恢复集群

按步骤操作。
`
    const res = await bootstrapPageCore({
      pageId: 'use-recycle-bin',
      enSnapshot: makeEnSnapshot('use-recycle-bin', enMdx),
      zhLegacyRaw: legacyZhMdx,
      nowIso: '2026-11-27T08:00:00Z',
    })
    expect('errors' in res).toBe(false)
    if ('errors' in res) return

    const { output } = res
    // Legacy ZH anchors MUST NOT be rewritten
    expect(output.sourceMd).toContain('## 前提条件\\{#qian-ti-tiao-jian}')
    expect(output.sourceMd).toContain('## 恢复集群\n')
    expect(output.sourceMd).not.toContain('{#prerequisites}')
    expect(output.sourceMd).not.toContain('{#restore-cluster}')

    // Report must list both mismatches clearly
    const mismatches = output.anchorComparisons.filter(c => c.status === 'anchor-mismatch')
    expect(mismatches).toHaveLength(2)
    expect(output.reportMd).toContain('#qian-ti-tiao-jian')
    expect(output.reportMd).toContain('#prerequisites')
    expect(output.reportMd).toContain('#恢复集群')
    expect(output.reportMd).toContain('#restore-cluster')
    expect(output.reportMd).toContain('未静默重写')
  })

  it('scans residual Feishu images and legacy site links while ignoring URLs inside fenced code blocks', () => {
    const markdown = `# 回收站

请先添加[支付方式](https://docs.zilliz.com.cn/docs/payment-billing)，或查看[飞书旧文档](https://zilliz.feishu.cn/docx/AbCdEf12345)。

也请参考[海外文档](https://docs.zilliz.com/docs/connect)与[相对文档](./other-doc.md)。

![feishu-shot](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/all/boxcn123)
![oss-shot](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/recycle-bin-cn.png "recycle-bin-cn")
<img src="https://assets.zilliz.com/global-img.png" alt="global" />

\`\`\`markdown
![ignored](https://internal-api-drive-stream.feishu.cn/ignored)
[ignored](https://docs.zilliz.com.cn/docs/ignored)
\`\`\`
`
    const { residualImages, legacyLinks } = scanResidualFeishuAssetsAndLinks(markdown)

    expect(residualImages.map(i => i.category)).toEqual([
      'feishu-image',
      'oss-image',
      'global-image-bed',
    ])
    expect(residualImages.some(i => i.url.includes('ignored'))).toBe(false)

    expect(legacyLinks.map(l => l.category)).toEqual([
      'legacy-site-link',
      'feishu-link',
      'global-site-link',
      'legacy-relative-link',
    ])
    expect(legacyLinks.some(l => l.url.includes('ignored'))).toBe(false)
  })

  it('supports --align-gap with fake LLM to draft missing sections, flag stale sections, and emit ZH-WP4 compatible review-todos', async () => {
    const enWithGap = `${SAMPLE_EN_MDX}
## Advanced Filtering\\{#advanced-filtering}

Open <UI>Query Explorer</UI> to inspect advanced filter expressions in Zilliz Cloud.

\`\`\`python
client = MilvusClient(uri="https://in01-new.api.gcp-us-west1.zillizcloud.com")
\`\`\`
`
    // Legacy ZH is missing ## Advanced Filtering and has fewer prose blocks in ## Prerequisites
    const enWithExtraPrereq = enWithGap.replace(
      'Make sure you have connected to your cluster.',
      'Make sure you have connected to your cluster.\n\nEnsure you have cluster write permissions.',
    )

    const enSnapshot = makeEnSnapshot('delete-entities', enWithExtraPrereq)
    const fakeLlm = new FakeDraftLlmProvider()
    const contractSupport = loadLocalizedContractSupport({ repositoryRoot })

    const res = await bootstrapPageCore({
      pageId: 'delete-entities',
      enSnapshot,
      zhLegacyRaw: REALISTIC_DEV_ZH_MDX,
      alignGap: true,
      llmProvider: fakeLlm,
      contractSupport,
      nowIso: '2026-11-27T08:00:00Z',
    })
    expect('errors' in res).toBe(false)
    if ('errors' in res) return

    const { output } = res
    expect(output.gapAnalysis.missingEnSections.map(s => s.anchor)).toEqual(['advanced-filtering'])
    expect(output.gapAnalysis.draftApplied).toBe(true)
    expect(output.gapAnalysis.draftedSectionAnchors).toEqual(['advanced-filtering'])
    expect(output.gapAnalysis.suspectedStaleSections.some(s => s.enAnchor === 'prerequisites')).toBe(true)

    // Existing legacy Chinese content + customized Java block remain intact
    expect(output.sourceMd).toContain('在控制台中点击 <UI>删除</UI> 以删除 Entity。')
    expect(output.sourceMd).toContain('cn_custom_collection')

    // Drafted missing section is appended with preserved <UI> tag and Tier-2 domain mapped code block
    expect(output.sourceMd).toContain('#advanced-filtering')
    expect(output.sourceMd).toContain('<UI>Query Explorer</UI>')
    expect(output.sourceMd).toContain('zillizcloud.com.cn')

    // Newly drafted code block is marked customized_for_zh: false, while legacy Java remains true
    const advancedSec = output.baseline.sections.find(s => s.anchor === 'advanced-filtering')
    expect(advancedSec?.code_blocks).toHaveLength(1)
    expect(advancedSec?.code_blocks[0].customized_for_zh).toBe(false)
    const filterSec = output.baseline.sections.find(s => s.anchor === 'delete-entities-by-filtering-conditions')
    expect(filterSec?.code_blocks.map(b => b.customized_for_zh)).toEqual([false, true, false])

    // Verify bootstrap-report.md works with ZH-WP4 evaluateReviewTodos gate!
    expect(output.reportMd).toContain(REVIEW_TODOS_START_MARKER)
    expect(output.reportMd).toContain(REVIEW_TODOS_END_MARKER)
    expect(output.reportMd).toContain('已核对历史欠译与最近一次飞书修订')

    const unresolvedGate = evaluateReviewTodos(output.reportMd, { requireBlock: true })
    expect(unresolvedGate.hasBlock).toBe(true)
    expect(unresolvedGate.ok).toBe(false)
    expect(unresolvedGate.errors[0]?.code).toBe('REVIEW_TODOS_UNRESOLVED')
    expect(unresolvedGate.unresolvedItems.length).toBeGreaterThanOrEqual(3)

    // Checking all items clears the ZH-WP4 gate
    const checkedReport = output.reportMd.replace(/- \[ \]/g, '- [x]')
    const resolvedGate = evaluateReviewTodos(checkedReport, { requireBlock: true })
    expect(resolvedGate.hasBlock).toBe(true)
    expect(resolvedGate.ok).toBe(true)
    expect(resolvedGate.unresolvedItems).toHaveLength(0)
    expect(resolvedGate.errors).toEqual([])
  })
})

describe('localized-docs bootstrap CLI & command safety', () => {
  it('bootstraps realistic dev ZH MDX end-to-end via scripts/docs-tooling.js and passes localized-docs check', async () => {
    const dir = tempDir()
    try {
      const inputsDir = path.join(dir, 'inputs')
      const fragsDir = path.join(inputsDir, 'fragments')
      mkdirSync(fragsDir, { recursive: true })

      const commit = '5a62906a45a4e3250c619a5efcfa4de3f83a8eb6'
      const enPathRel = 'content/en/guides/tutorials/development/insert-and-delete/delete-entities.md'
      const enFile = path.join(inputsDir, 'en-delete-entities.md')
      const enManifest = path.join(inputsDir, 'delete-entities.receipt.json')
      const zhLegacyFile = path.join(inputsDir, 'zh-legacy-delete-entities.md')
      const varsFile = path.join(inputsDir, 'Variables.json')
      const outDir = path.join(dir, 'bootstrap-out')

      writeFileSync(enFile, SAMPLE_EN_MDX)
      writeFileSync(
        enManifest,
        `${JSON.stringify(makeSharedReceipt('delete-entities', enPathRel, SAMPLE_EN_MDX, commit), null, 2)}\n`,
      )
      writeFileSync(zhLegacyFile, REALISTIC_DEV_ZH_MDX)
      writeFileSync(varsFile, VALID_GROUP_VARIABLES_JSON)
      writeFileSync(path.join(fragsDir, 'note.md'), '片段提示：{{var.product_name}}。\n')

      const cliRes = runDocsToolingCli([
        'bootstrap',
        '--page', 'delete-entities',
        '--en-file', enFile,
        '--en-manifest', enManifest,
        '--zh-legacy-file', zhLegacyFile,
        '--variables-file', varsFile,
        '--fragments-dir', fragsDir,
        '--updated-at', '2026-11-27T08:00:00Z',
        '--out', outDir,
      ])
      expect(cliRes.status, cliRes.stderr + cliRes.stdout).toBe(0)
      expect(cliRes.stdout).toContain('[delete-entities] bootstrapped')
      expect(cliRes.stdout).toContain('customizedCodeBlocks=1')

      const pageYamlPath = path.join(outDir, 'pages/delete-entities/page.yaml')
      const sourceMdPath = path.join(outDir, 'pages/delete-entities/source.md')
      const baselinePath = path.join(outDir, 'pages/delete-entities/.baseline.json')
      const reportPath = path.join(outDir, 'bootstrap-report.md')

      expect(existsSync(pageYamlPath)).toBe(true)
      expect(existsSync(sourceMdPath)).toBe(true)
      expect(existsSync(baselinePath)).toBe(true)
      expect(existsSync(reportPath)).toBe(true)

      const pageYaml = readFileSync(pageYamlPath, 'utf8')
      const sourceMd = readFileSync(sourceMdPath, 'utf8')
      const baselineRaw = readFileSync(baselinePath, 'utf8')
      const reportMd = readFileSync(reportPath, 'utf8')

      expect(pageYaml).not.toContain('owner')
      expect(pageYaml).not.toContain('feishu_record_id')
      expect(sourceMd).not.toContain('slug:')
      expect(sourceMd).not.toContain("import Tabs from '@theme/Tabs'")

      const parsedBaseline = parseBaselineJson(baselineRaw)
      expect('errors' in parsedBaseline).toBe(false)
      if ('baseline' in parsedBaseline) {
        const baseline: BaselineJson = parsedBaseline.baseline
        expect(baseline.en_baseline.dev_commit).toBe(commit)
        expect(baseline.en_baseline.en_path).toBe(enPathRel)
        const parsedCfg = parseLocalizedPageConfig('delete-entities', pageYaml)
        expect('config' in parsedCfg).toBe(true)
        if ('config' in parsedCfg) {
          expect(
            validateBaselineConsistency({
              baseline,
              dirPageId: 'delete-entities',
              pageConfig: parsedCfg.config,
              sourceMdText: sourceMd,
            }),
          ).toEqual([])
        }
      }

      // Report passes ZH-WP4 parser structure (blocks until checked, passes when checked)
      expect(evaluateReviewTodos(reportMd, { requireBlock: true }).errors[0]?.code).toBe(
        'REVIEW_TODOS_UNRESOLVED',
      )

      // Copy group Variables.json + fragments into outDir and verify `localized-docs check` passes!
      writeFileSync(path.join(outDir, 'Variables.json'), VALID_GROUP_VARIABLES_JSON)
      cpSync(fragsDir, path.join(outDir, 'fragments'), { recursive: true })

      const checkCli = runDocsToolingCli(['check', '--root', outDir])
      expect(checkCli.status, checkCli.stderr + checkCli.stdout).toBe(0)
      expect(checkCli.stdout).toContain('[delete-entities] status: ready')
      expect(checkCli.stdout).toContain('Localized docs check passed for 1 page(s).')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('runs --align-gap end-to-end through scripts/docs-tooling.js with --provider fake', async () => {
    const dir = tempDir()
    try {
      const enFile = path.join(dir, 'en.md')
      const zhFile = path.join(dir, 'zh.md')
      const varsFile = path.join(dir, 'Variables.json')
      const outDir = path.join(dir, 'out-align')

      const enWithMissing = `${SAMPLE_EN_MDX}
## Next Steps\\{#next-steps}

Explore <UI>Cluster Overview</UI> after deleting entities.
`
      writeFileSync(enFile, enWithMissing)
      writeFileSync(zhFile, REALISTIC_DEV_ZH_MDX)
      writeFileSync(varsFile, VALID_GROUP_VARIABLES_JSON)

      const res = runDocsToolingCli([
        'bootstrap',
        '--page', 'delete-entities',
        '--en-file', enFile,
        '--en-dev-commit', '1'.repeat(40),
        '--zh-legacy-file', zhFile,
        '--align-gap',
        '--provider', 'fake',
        '--variables-file', varsFile,
        '--out', outDir,
      ])
      expect(res.status, res.stderr + res.stdout).toBe(0)
      expect(res.stdout).toContain('alignGap=on')

      const sourceMd = readFileSync(path.join(outDir, 'pages/delete-entities/source.md'), 'utf8')
      const reportMd = readFileSync(path.join(outDir, 'bootstrap-report.md'), 'utf8')
      expect(sourceMd).toContain('#next-steps')
      expect(sourceMd).toContain('<UI>Cluster Overview</UI>')
      expect(reportMd).toContain(REVIEW_TODOS_START_MARKER)
      expect(reportMd).toContain('Cluster Overview')

      // Passes localized-docs check directly
      writeFileSync(path.join(outDir, 'Variables.json'), VALID_GROUP_VARIABLES_JSON)
      let checkOut = ''
      let checkErr = ''
      const code = await runCheck(
        { root: outDir },
        t => {
          checkOut += t
        },
        t => {
          checkErr += t
        },
      )
      expect(code, checkErr + checkOut).toBe(0)
      expect(checkOut).toContain('[delete-entities] status: ready')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('rejects non-empty --out, symlinked inputs/outputs, overlapping paths, and forbidden legacy options', async () => {
    const dir = tempDir()
    try {
      const enFile = path.join(dir, 'en.md')
      const zhFile = path.join(dir, 'zh.md')
      writeFileSync(enFile, SAMPLE_EN_MDX)
      writeFileSync(zhFile, REALISTIC_DEV_ZH_MDX)

      // 1. Forbidden legacy flags --owner and --feishu-record-id
      expect(() =>
        parseBootstrapArgs([
          '--page', 'delete-entities',
          '--en-file', enFile,
          '--en-dev-commit', '1'.repeat(40),
          '--zh-legacy-file', zhFile,
          '--owner', '@alice',
          '--out', path.join(dir, 'out-owner'),
        ]),
      ).toThrow(/Forbidden legacy option --owner/)

      expect(() =>
        parseBootstrapArgs([
          '--page', 'delete-entities',
          '--en-file', enFile,
          '--en-dev-commit', '1'.repeat(40),
          '--zh-legacy-file', zhFile,
          '--feishu-record-id', 'rec123',
          '--out', path.join(dir, 'out-rec'),
        ]),
      ).toThrow(/Forbidden legacy option --feishu-record-id/)

      const ownerCli = runDocsToolingCli([
        'bootstrap',
        '--page', 'delete-entities',
        '--en-file', enFile,
        '--en-dev-commit', '1'.repeat(40),
        '--zh-legacy-file', zhFile,
        '--owner', '@alice',
        '--out', path.join(dir, 'out-owner-cli'),
      ])
      expect(ownerCli.status).toBe(2)

      // 2. Non-empty --out rejected without touching existing files
      const nonEmpty = path.join(dir, 'non-empty')
      mkdirSync(nonEmpty)
      writeFileSync(path.join(nonEmpty, 'keep.txt'), 'preserve-me')
      let errNonEmpty = ''
      expect(
        await runBootstrap(
          {
            page: 'delete-entities',
            enFile,
            enDevCommit: '1'.repeat(40),
            zhLegacyFile: zhFile,
            out: nonEmpty,
          },
          () => {},
          t => {
            errNonEmpty += t
          },
        ),
      ).toBe(1)
      expect(errNonEmpty).toContain('empty or absent')
      expect(readFileSync(path.join(nonEmpty, 'keep.txt'), 'utf8')).toBe('preserve-me')

      // 3. Symlinked --out rejected
      const realTarget = path.join(dir, 'real-target')
      mkdirSync(realTarget)
      const symlinkOut = path.join(dir, 'symlink-out')
      symlinkSync(realTarget, symlinkOut)
      let errSymOut = ''
      expect(
        await runBootstrap(
          {
            page: 'delete-entities',
            enFile,
            enDevCommit: '1'.repeat(40),
            zhLegacyFile: zhFile,
            out: symlinkOut,
          },
          () => {},
          t => {
            errSymOut += t
          },
        ),
      ).toBe(1)
      expect(errSymOut).toContain('symlinks')

      // 4. Symlinked --zh-legacy-file rejected
      const symZh = path.join(dir, 'sym-zh.md')
      symlinkSync(zhFile, symZh)
      let errSymZh = ''
      expect(
        await runBootstrap(
          {
            page: 'delete-entities',
            enFile,
            enDevCommit: '1'.repeat(40),
            zhLegacyFile: symZh,
            out: path.join(dir, 'out-sym-zh'),
          },
          () => {},
          t => {
            errSymZh += t
          },
        ),
      ).toBe(1)
      expect(errSymZh).toContain('symbolic links')
      expect(existsSync(path.join(dir, 'out-sym-zh'))).toBe(false)

      // 5. Symlinked --en-file rejected
      const symEn = path.join(dir, 'sym-en.md')
      symlinkSync(enFile, symEn)
      let errSymEn = ''
      expect(
        await runBootstrap(
          {
            page: 'delete-entities',
            enFile: symEn,
            enDevCommit: '1'.repeat(40),
            zhLegacyFile: zhFile,
            out: path.join(dir, 'out-sym-en'),
          },
          () => {},
          t => {
            errSymEn += t
          },
        ),
      ).toBe(1)
      expect(errSymEn).toContain('symbolic links')
      expect(existsSync(path.join(dir, 'out-sym-en'))).toBe(false)

      // 6. Invalid / reserved page ID rejected with exit 2
      let errReserved = ''
      expect(
        await runBootstrap(
          {
            page: 'active',
            enFile,
            enDevCommit: '1'.repeat(40),
            zhLegacyFile: zhFile,
            out: path.join(dir, 'out-active'),
          },
          () => {},
          t => {
            errReserved += t
          },
        ),
      ).toBe(2)
      expect(errReserved).toContain('reserved')

      // 7. Missing provenance (--en-manifest / --en-dev-commit) rejected with exit 2
      expect(() =>
        parseBootstrapArgs([
          '--page', 'delete-entities',
          '--en-file', enFile,
          '--zh-legacy-file', zhFile,
          '--out', path.join(dir, 'out-no-prov'),
        ]),
      ).toThrow(/--en-manifest or --en-dev-commit/)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('fails without writing partial output when --variables-file precheck detects an undefined variable', async () => {
    const dir = tempDir()
    try {
      const enFile = path.join(dir, 'en.md')
      const zhFile = path.join(dir, 'zh.md')
      const varsFile = path.join(dir, 'Variables.json')
      const outDir = path.join(dir, 'out-var-fail')

      writeFileSync(enFile, SAMPLE_EN_MDX)
      writeFileSync(zhFile, `${REALISTIC_DEV_ZH_MDX}\n未定义变量：{{var.does_not_exist}}。\n`)
      writeFileSync(varsFile, VALID_GROUP_VARIABLES_JSON)

      let errText = ''
      const code = await runBootstrap(
        {
          page: 'delete-entities',
          enFile,
          enDevCommit: '1'.repeat(40),
          zhLegacyFile: zhFile,
          variablesFile: varsFile,
          out: outDir,
        },
        () => {},
        t => {
          errText += t
        },
      )
      expect(code).toBe(1)
      expect(errText).toContain('does_not_exist')
      expect(existsSync(outDir)).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
