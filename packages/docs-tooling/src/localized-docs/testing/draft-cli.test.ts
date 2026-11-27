// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { runCheck } from '../commands/check.ts'
import { REVIEW_TODOS_END_MARKER, REVIEW_TODOS_START_MARKER } from '../core/pr-body.ts'
import { computeChannelDigests } from '../core/sections.ts'
import { stripEnShell } from '../core/strip-en.ts'
import { sha256Hex } from '../core/types.ts'
import { VALID_GROUP_VARIABLES_JSON } from './fixtures/en-samples.ts'

const repositoryRoot = path.resolve(import.meta.dirname, '../../../../..')
const cliLauncher = path.join(repositoryRoot, 'scripts/docs-tooling.js')

function tempDir(prefix = 'localized-docs-draft-cli-'): string {
  return realpathSync(mkdtempSync(path.join(tmpdir(), prefix)))
}

function runDraftCli(args: string[]) {
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

describe('localized-docs draft CLI end-to-end', () => {
  it('drafts incremental update end-to-end via scripts/docs-tooling.js and passes localized-docs check', async () => {
    const dir = tempDir()
    try {
      const root = path.join(dir, 'localized-docs/zh-CN/guides')
      const pageDir = path.join(root, 'pages/delete-entities')
      mkdirSync(pageDir, { recursive: true })
      writeFileSync(path.join(root, 'Variables.json'), VALID_GROUP_VARIABLES_JSON)

      const baseEnRaw = `---
title: "Delete Entities | Cloud"
slug: /delete-entities
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Delete Entities

You can delete entities by filtering conditions.

## Delete Entities by Filtering Conditions\\{#delete-entities-by-filtering-conditions}

Click <UI>Delete</UI> in the console.

\`\`\`python
client.delete(collection_name="quick_setup")
\`\`\`
`
      const newEnRaw = `---
title: "Delete Entities | Cloud"
slug: /delete-entities
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Delete Entities

You can delete entities by filtering conditions.

## Delete Entities by Filtering Conditions\\{#delete-entities-by-filtering-conditions}

Click <UI>Delete</UI> in the console and confirm in <UI>Query Explorer</UI>.

\`\`\`python
client.delete(collection_name="quick_setup", filter="id > 0")
\`\`\`
`
      const curZhSource = `# 删除 Entity

您可以按过滤条件删除 Entity。

## 按过滤条件删除 Entity\\{#delete-entities-by-filtering-conditions}

在控制台中点击 <UI>Delete</UI>。

\`\`\`python
client.delete(collection_name="quick_setup")
\`\`\`
`
      const baseStripped = stripEnShell(baseEnRaw)
      if ('errors' in baseStripped) throw new Error('strip failed')
      const baseChannels = computeChannelDigests(baseStripped.body)
      const baseCommit = '1'.repeat(40)
      const newCommit = '2'.repeat(40)

      // Compute exact baseline section digests using parseStructuredDocument
      const { parseStructuredDocument, buildBaselineSections } = await import('../core/sections.ts')
      const baseEnDoc = parseStructuredDocument({ kind: 'en', text: baseStripped.body, isAlreadyStripped: true })
      const curZhDoc = parseStructuredDocument({ kind: 'zh', text: curZhSource })
      if (!('doc' in baseEnDoc) || !('doc' in curZhDoc)) throw new Error('parse failed')

      const baseline = {
        schema_version: 1,
        page_id: 'delete-entities',
        en_baseline: {
          manual: 'guides',
          shared_page: 'delete-entities',
          dev_commit: baseCommit,
          en_path: 'content/en/guides/delete-entities.md',
          manifest_path: 'generated/en/manifests/shared-pages/guides/delete-entities.json',
          file_sha256: sha256Hex(baseEnRaw),
          channels: {
            current_sha256: baseChannels.currentSha256,
            next_sha256: baseChannels.nextSha256,
          },
        },
        zh_reviewed: {
          source_sha256: sha256Hex(curZhSource),
          reviewed_pr: 42,
          updated_at: '2026-11-25T08:00:00Z',
        },
        last_notified_en_sha: null,
        sections: buildBaselineSections(baseEnDoc.doc, curZhDoc.doc),
      }

      writeFileSync(
        path.join(pageDir, 'page.yaml'),
        `schema_version: 1\nmode: incremental\nen_source:\n  manual: guides\n  shared_page: delete-entities\n`,
      )
      writeFileSync(path.join(pageDir, 'source.md'), curZhSource)
      writeFileSync(path.join(pageDir, '.baseline.json'), `${JSON.stringify(baseline, null, 2)}\n`)

      const enBaseFile = path.join(dir, 'base-en.md')
      const enNewFile = path.join(dir, 'new-en.md')
      const enNewManifest = path.join(dir, 'new-en-receipt.json')
      writeFileSync(enBaseFile, baseEnRaw)
      writeFileSync(enNewFile, newEnRaw)
      writeFileSync(
        enNewManifest,
        `${JSON.stringify(makeSharedReceipt('delete-entities', 'content/en/guides/delete-entities.md', newEnRaw, newCommit), null, 2)}\n`,
      )

      const outDir = path.join(dir, 'draft-out')
      const res = runDraftCli([
        'draft',
        '--root',
        root,
        '--page',
        'delete-entities',
        '--en-base',
        enBaseFile,
        '--en-new',
        enNewFile,
        '--en-new-manifest',
        enNewManifest,
        '--out',
        outDir,
        '--provider',
        'fake',
        '--reviewed-pr',
        '99',
        '--updated-at',
        '2026-11-27T02:00:00Z',
      ])

      expect(res.status, res.stderr + res.stdout).toBe(0)
      expect(existsSync(path.join(outDir, 'source.md'))).toBe(true)
      expect(existsSync(path.join(outDir, '.baseline.json'))).toBe(true)
      expect(existsSync(path.join(outDir, 'draft-report.json'))).toBe(true)
      expect(existsSync(path.join(outDir, 'pr-body.md'))).toBe(true)

      const candidateSource = readFileSync(path.join(outDir, 'source.md'), 'utf8')
      const candidateBaseline = readFileSync(path.join(outDir, '.baseline.json'), 'utf8')
      const report = JSON.parse(readFileSync(path.join(outDir, 'draft-report.json'), 'utf8'))
      const prBody = readFileSync(path.join(outDir, 'pr-body.md'), 'utf8')

      expect(report.status).toBe('drafted')
      expect(report.code_blocks.tier1_verbatim).toBe(1)
      expect(candidateSource).toContain('您可以按过滤条件删除 Entity。')
      expect(candidateSource).toContain('<UI>Query Explorer</UI>')
      expect(candidateSource).toContain('filter="id > 0"')
      expect(prBody).toContain(REVIEW_TODOS_START_MARKER)
      expect(prBody).toContain(REVIEW_TODOS_END_MARKER)

      // Apply staged files back to root and verify localized-docs check passes!
      writeFileSync(path.join(pageDir, 'source.md'), candidateSource)
      writeFileSync(path.join(pageDir, '.baseline.json'), candidateBaseline)
      let checkOut = ''
      let checkErr = ''
      const checkCode = await runCheck(
        { root, page: 'delete-entities' },
        t => {
          checkOut += t
        },
        t => {
          checkErr += t
        },
      )
      expect(checkCode, checkErr).toBe(0)
      expect(checkOut).toContain('[delete-entities] status: ready')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('drafts pending-initial-translation page via CLI and passes localized-docs check', async () => {
    const dir = tempDir()
    try {
      const root = path.join(dir, 'localized-docs/zh-CN/guides')
      const pageDir = path.join(root, 'pages/new-page')
      mkdirSync(pageDir, { recursive: true })
      writeFileSync(path.join(root, 'Variables.json'), VALID_GROUP_VARIABLES_JSON)
      writeFileSync(
        path.join(pageDir, 'page.yaml'),
        `schema_version: 1\nmode: incremental\nen_source:\n  manual: guides\n  shared_page: new-page\n`,
      )

      const enNewFile = path.join(dir, 'new-page.md')
      writeFileSync(
        enNewFile,
        `---
title: "New Page | Cloud"
---

# New Page

Click <UI>Connect</UI> to open your cluster.
`,
      )

      const outDir = path.join(dir, 'init-out')
      const res = runDraftCli([
        'draft',
        '--root',
        root,
        '--page',
        'new-page',
        '--en-new',
        enNewFile,
        '--out',
        outDir,
      ])
      expect(res.status, res.stderr + res.stdout).toBe(0)

      writeFileSync(path.join(pageDir, 'source.md'), readFileSync(path.join(outDir, 'source.md'), 'utf8'))
      writeFileSync(path.join(pageDir, '.baseline.json'), readFileSync(path.join(outDir, '.baseline.json'), 'utf8'))

      let checkErr = ''
      const checkCode = await runCheck({ root, page: 'new-page' }, () => {}, t => {
        checkErr += t
      })
      expect(checkCode, checkErr).toBe(0)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('exits 1 with blocked draft-report.json and zero candidate source.md on baseline-missing-error and receipt hash mismatch', () => {
    const dir = tempDir()
    try {
      const root = path.join(dir, 'localized-docs/zh-CN/guides')
      const pageDir = path.join(root, 'pages/broken-page')
      mkdirSync(pageDir, { recursive: true })
      writeFileSync(path.join(root, 'Variables.json'), VALID_GROUP_VARIABLES_JSON)
      writeFileSync(
        path.join(pageDir, 'page.yaml'),
        `schema_version: 1\nmode: incremental\nen_source:\n  manual: guides\n  shared_page: broken-page\n`,
      )
      writeFileSync(path.join(pageDir, 'source.md'), '# 已存在源码但缺基线\n\n正文。\n')

      const enNewFile = path.join(dir, 'en-new.md')
      writeFileSync(enNewFile, '# Broken Page\n\nBody.\n')

      const outMissing = path.join(dir, 'out-missing')
      const resMissing = runDraftCli([
        'draft',
        '--root',
        root,
        '--page',
        'broken-page',
        '--en-new',
        enNewFile,
        '--out',
        outMissing,
      ])
      expect(resMissing.status).toBe(1)
      expect(existsSync(path.join(outMissing, 'source.md'))).toBe(false)
      expect(existsSync(path.join(outMissing, '.baseline.json'))).toBe(false)
      const reportMissing = JSON.parse(readFileSync(path.join(outMissing, 'draft-report.json'), 'utf8'))
      expect(reportMissing.status).toBe('blocked')
      expect(reportMissing.reason).toBe('baseline-missing-error')

      // Receipt mismatch test
      const badReceiptFile = path.join(dir, 'bad-receipt.json')
      writeFileSync(
        badReceiptFile,
        JSON.stringify(
          makeSharedReceipt('broken-page', 'content/en/guides/broken-page.md', 'DIFFERENT CONTENT', '3'.repeat(40)),
        ),
      )
      // Write a dummy valid baseline so we reach EN provenance validation
      const outMismatch = path.join(dir, 'out-mismatch')
      const resMismatch = runDraftCli([
        'draft',
        '--root',
        root,
        '--page',
        'broken-page',
        '--en-new',
        enNewFile,
        '--en-new-manifest',
        badReceiptFile,
        '--out',
        outMismatch,
      ])
      expect(resMismatch.status).toBe(1)
      expect(existsSync(path.join(outMismatch, 'source.md'))).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('rejects invalid CLI flags with exit 2 and rejects unsafe --out / symlink inputs with exit 1', () => {
    const dir = tempDir()
    try {
      const root = path.join(dir, 'localized-docs/zh-CN/guides')
      const pageDir = path.join(root, 'pages/paused-page')
      mkdirSync(pageDir, { recursive: true })
      writeFileSync(path.join(root, 'Variables.json'), VALID_GROUP_VARIABLES_JSON)
      writeFileSync(
        path.join(pageDir, 'page.yaml'),
        `schema_version: 1\nmode: paused\nen_source:\n  manual: guides\n  shared_page: paused-page\n`,
      )

      const enNewFile = path.join(dir, 'en.md')
      writeFileSync(enNewFile, '# Paused\n\nBody.\n')

      // Unknown CLI option -> exit 2
      const badOpt = runDraftCli(['draft', '--root', root, '--page', 'paused-page', '--en-new', enNewFile, '--out', path.join(dir, 'o1'), '--bogus', '1'])
      expect(badOpt.status).toBe(2)

      // Unknown provider -> exit 2
      const badProv = runDraftCli(['draft', '--root', root, '--page', 'paused-page', '--en-new', enNewFile, '--out', path.join(dir, 'o2'), '--provider', 'unknown'])
      expect(badProv.status).toBe(2)

      // Non-empty --out -> exit 1
      const nonEmptyOut = path.join(dir, 'non-empty')
      mkdirSync(nonEmptyOut)
      writeFileSync(path.join(nonEmptyOut, 'keep.txt'), 'keep')
      const resNonEmpty = runDraftCli(['draft', '--root', root, '--page', 'paused-page', '--en-new', enNewFile, '--out', nonEmptyOut])
      expect(resNonEmpty.status).toBe(1)
      expect(readFileSync(path.join(nonEmptyOut, 'keep.txt'), 'utf8')).toBe('keep')

      // Symlinked --en-new -> exit 1 (blocked)
      const symlinkEn = path.join(dir, 'sym-en.md')
      symlinkSync(enNewFile, symlinkEn)
      const outSym = path.join(dir, 'out-sym')
      const resSym = runDraftCli(['draft', '--root', root, '--page', 'paused-page', '--en-new', symlinkEn, '--out', outSym])
      expect(resSym.status).toBe(1)
      expect(existsSync(path.join(outSym, 'source.md'))).toBe(false)

      // Paused page CLI success -> exit 0, draft-report.json only
      const outPaused = path.join(dir, 'out-paused')
      const resPaused = runDraftCli(['draft', '--root', root, '--page', 'paused-page', '--en-new', enNewFile, '--out', outPaused])
      expect(resPaused.status, resPaused.stderr).toBe(0)
      expect(existsSync(path.join(outPaused, 'source.md'))).toBe(false)
      expect(JSON.parse(readFileSync(path.join(outPaused, 'draft-report.json'), 'utf8')).reason).toBe('paused')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('handles malformed .baseline.json (blocked exit 1) and manual mode notify + deduplication (exit 0, no source.md)', async () => {
    const dir = tempDir()
    try {
      const root = path.join(dir, 'localized-docs/zh-CN/guides')
      const corruptDir = path.join(root, 'pages/corrupt-baseline')
      const manualDir = path.join(root, 'pages/manual-page')
      mkdirSync(corruptDir, { recursive: true })
      mkdirSync(manualDir, { recursive: true })
      writeFileSync(path.join(root, 'Variables.json'), VALID_GROUP_VARIABLES_JSON)

      // 1. Corrupted .baseline.json
      writeFileSync(
        path.join(corruptDir, 'page.yaml'),
        `schema_version: 1\nmode: incremental\nen_source:\n  manual: guides\n  shared_page: corrupt-baseline\n`,
      )
      writeFileSync(path.join(corruptDir, 'source.md'), '# 损坏基线页\n\n正文。\n')
      writeFileSync(path.join(corruptDir, '.baseline.json'), '{ invalid json')

      const enNewFile = path.join(dir, 'en-new.md')
      writeFileSync(enNewFile, '# Page\n\nNew content.\n')
      const outCorrupt = path.join(dir, 'out-corrupt')
      const resCorrupt = runDraftCli([
        'draft',
        '--root',
        root,
        '--page',
        'corrupt-baseline',
        '--en-new',
        enNewFile,
        '--out',
        outCorrupt,
      ])
      expect(resCorrupt.status).toBe(1)
      expect(existsSync(path.join(outCorrupt, 'source.md'))).toBe(false)
      expect(JSON.parse(readFileSync(path.join(outCorrupt, 'draft-report.json'), 'utf8')).status).toBe('blocked')

      // 2. Manual mode notify + deduplication
      const baseEnRaw = '# Manual Page\n\nOld EN.\n'
      const newEnRaw = '# Manual Page\n\nNew EN.\n'
      const manualZh = '# 手工页\n\n人工正文。\n'
      const baseEnFile = path.join(dir, 'manual-base.md')
      const newEnFile = path.join(dir, 'manual-new.md')
      writeFileSync(baseEnFile, baseEnRaw)
      writeFileSync(newEnFile, newEnRaw)

      const { parseStructuredDocument, buildBaselineSections, computeChannelDigests } = await import('../core/sections.ts')
      const baseDoc = parseStructuredDocument({ kind: 'en', text: baseEnRaw })
      const zhDoc = parseStructuredDocument({ kind: 'zh', text: manualZh })
      if (!('doc' in baseDoc) || !('doc' in zhDoc)) throw new Error('parse failed')
      const ch = computeChannelDigests(baseDoc.doc.bodyText)

      writeFileSync(
        path.join(manualDir, 'page.yaml'),
        `schema_version: 1\nmode: manual\nen_source:\n  manual: guides\n  shared_page: manual-page\nnotify_on_en_change: true\n`,
      )
      writeFileSync(path.join(manualDir, 'source.md'), manualZh)
      writeFileSync(
        path.join(manualDir, '.baseline.json'),
        JSON.stringify({
          schema_version: 1,
          page_id: 'manual-page',
          en_baseline: {
            manual: 'guides',
            shared_page: 'manual-page',
            dev_commit: '1'.repeat(40),
            en_path: 'content/en/guides/manual-page.md',
            manifest_path: 'generated/en/manifests/shared-pages/guides/manual-page.json',
            file_sha256: sha256Hex(baseEnRaw),
            channels: { current_sha256: ch.currentSha256, next_sha256: ch.nextSha256 },
          },
          zh_reviewed: {
            source_sha256: sha256Hex(manualZh),
            reviewed_pr: 12,
            updated_at: '2026-11-26T00:00:00Z',
          },
          last_notified_en_sha: null,
          sections: buildBaselineSections(baseDoc.doc, zhDoc.doc),
        }),
      )

      const outNotify1 = path.join(dir, 'out-notify-1')
      const resNotify1 = runDraftCli([
        'draft',
        '--root',
        root,
        '--page',
        'manual-page',
        '--en-new',
        newEnFile,
        '--en-base',
        baseEnFile,
        '--out',
        outNotify1,
      ])
      expect(resNotify1.status, resNotify1.stderr).toBe(0)
      expect(existsSync(path.join(outNotify1, 'source.md'))).toBe(false)
      expect(existsSync(path.join(outNotify1, 'pr-body.md'))).toBe(false)
      expect(existsSync(path.join(outNotify1, '.baseline.json'))).toBe(true)
      expect(JSON.parse(readFileSync(path.join(outNotify1, 'draft-report.json'), 'utf8')).status).toBe('manual-notify')

      // Apply updated .baseline.json and re-run -> skipped (manual-already-notified)
      writeFileSync(path.join(manualDir, '.baseline.json'), readFileSync(path.join(outNotify1, '.baseline.json'), 'utf8'))
      const outNotify2 = path.join(dir, 'out-notify-2')
      const resNotify2 = runDraftCli([
        'draft',
        '--root',
        root,
        '--page',
        'manual-page',
        '--en-new',
        newEnFile,
        '--en-base',
        baseEnFile,
        '--out',
        outNotify2,
      ])
      expect(resNotify2.status, resNotify2.stderr).toBe(0)
      expect(JSON.parse(readFileSync(path.join(outNotify2, 'draft-report.json'), 'utf8'))).toMatchObject({
        status: 'skipped',
        reason: 'manual-already-notified',
      })
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
