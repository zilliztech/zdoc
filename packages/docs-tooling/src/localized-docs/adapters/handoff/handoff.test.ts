import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { sha256Hex } from '../../core/types.ts'
import { buildLocalizedFetchPage, resolveLocalizedGuidesOutputPath } from './fetch-build.ts'
import {
  computeLocalizedCacheIdentity,
  computePinnedLocalizedInputDigests,
  createLocalizedFetchRoutingContext,
  listPinnedLocalizedPages,
  pinnedLocalizedPages,
  readLocalizedActiveState,
  readLocalizedReceipt,
} from './routing.ts'

const tempDirs: string[] = []

function makeTempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

function writeRel(root: string, rel: string, content: string): void {
  const full = join(root, rel)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, content, 'utf8')
}

function git(cwd: string, ...args: string[]): string {
  return execFileSync('git', ['-C', cwd, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function initGitRepo(root: string, branch = 'master'): void {
  git(root, 'init', '--quiet', `--initial-branch=${branch}`)
  git(root, 'config', 'user.name', 'Test Bot')
  git(root, 'config', 'user.email', 'test@example.com')
}

function commitAll(root: string, message: string): string {
  git(root, 'add', '.')
  git(root, 'commit', '--quiet', '-m', message)
  return git(root, 'rev-parse', 'HEAD')
}

const VALID_PAGE_YAML = `schema_version: 1
mode: incremental
en_source:
  manual: guides
  shared_page: delete-entities
sync_policy: independent
`

const VALID_SOURCE_MD = `# 删除实体

使用 {{var.endpoint}} 连接到 <UI>创建集群</UI> 页面。

<NextChannel action="exclude">
旧版本说明。
</NextChannel>

<NextChannel action="include">
新版本说明。
</NextChannel>
`

const NEXT_SHA = 'a'.repeat(64)
const CURRENT_SHA = 'b'.repeat(64)

function makeBaselineJson(pageId: string, sourceMd: string, devCommit: string): string {
  return JSON.stringify(
    {
      schema_version: 1,
      page_id: pageId,
      en_baseline: {
        manual: 'guides',
        shared_page: pageId,
        dev_commit: devCommit,
        en_path: `content/en/guides/tutorials/manage-data/${pageId}.md`,
        manifest_path: `generated/en/manifests/shared-pages/guides/${pageId}.json`,
        file_sha256: CURRENT_SHA,
        channels: {
          current_sha256: CURRENT_SHA,
          next_sha256: NEXT_SHA,
        },
      },
      zh_reviewed: {
        source_sha256: sha256Hex(sourceMd),
        reviewed_pr: 42,
        updated_at: '2026-11-26T00:00:00Z',
      },
      last_notified_en_sha: null,
      sections: [],
    },
    null,
    2,
  )
}

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true })
  }
})

describe('localized-docs handoff adapters (routing & fetch-build)', () => {
  it('inspects available pages strictly from pinned master_sha, ignoring dirty worktree and symlinks', () => {
    const repo = makeTempDir('localized-routing-repo-')
    initGitRepo(repo)
    writeRel(repo, 'localized-docs/zh-CN/guides/Variables.json', JSON.stringify({ endpoint: 'https://cloud.zilliz.com.cn' }))
    writeRel(repo, 'localized-docs/zh-CN/guides/pages/delete-entities/page.yaml', VALID_PAGE_YAML)
    writeRel(repo, 'localized-docs/zh-CN/guides/pages/delete-entities/source.md', VALID_SOURCE_MD)
    const sha1 = commitAll(repo, 'initial pinned localized page')

    // Dirty worktree directory not committed at sha1 must be invisible
    writeRel(repo, 'localized-docs/zh-CN/guides/pages/uncommitted-page/page.yaml', VALID_PAGE_YAML)
    writeRel(repo, 'localized-docs/zh-CN/guides/pages/uncommitted-page/source.md', VALID_SOURCE_MD)

    const linkCommitted = 'https://github.com/zilliztech/zdoc/tree/master/localized-docs/zh-CN/guides/pages/delete-entities'
    const linkDirty = 'https://github.com/zilliztech/zdoc/tree/master/localized-docs/zh-CN/guides/pages/uncommitted-page'

    expect(listPinnedLocalizedPages(repo, sha1)).toEqual(['delete-entities'])
    expect(pinnedLocalizedPages(repo, sha1, [linkCommitted, linkDirty])).toEqual(['delete-entities'])

    // Symlink page directory committed at sha2 must be rejected
    rmSync(join(repo, 'localized-docs/zh-CN/guides/pages/uncommitted-page'), { recursive: true, force: true })
    symlinkSync('../../../..', join(repo, 'localized-docs/zh-CN/guides/pages/evil-link'))
    const sha2 = commitAll(repo, 'symlink page')
    const linkEvil = 'https://github.com/zilliztech/zdoc/tree/master/localized-docs/zh-CN/guides/pages/evil-link'
    expect(pinnedLocalizedPages(repo, sha2, [linkCommitted, linkEvil])).toEqual(['delete-entities'])
  })

  it('builds strictly from pinned master_sha (ignoring dirty worktree edits) and validates receipt', async () => {
    const repo = makeTempDir('localized-build-repo-')
    initGitRepo(repo)
    const devCommit = 'c'.repeat(40)
    writeRel(repo, 'localized-docs/zh-CN/guides/Variables.json', JSON.stringify({ endpoint: 'https://cloud.zilliz.com.cn' }))
    writeRel(repo, 'localized-docs/zh-CN/guides/pages/delete-entities/page.yaml', VALID_PAGE_YAML)
    writeRel(repo, 'localized-docs/zh-CN/guides/pages/delete-entities/source.md', VALID_SOURCE_MD)
    writeRel(repo, 'localized-docs/zh-CN/guides/pages/delete-entities/.baseline.json', makeBaselineJson('delete-entities', VALID_SOURCE_MD, devCommit))
    const masterSha = commitAll(repo, 'pin localized page')

    // Mutate dirty worktree — pinned build MUST NOT see dirty bytes
    writeRel(repo, 'localized-docs/zh-CN/guides/pages/delete-entities/source.md', '# DIRTY WORKTREE SHOULD NEVER APPEAR\n')
    writeRel(repo, 'localized-docs/zh-CN/guides/Variables.json', JSON.stringify({ endpoint: 'https://dirty.invalid' }))

    const result = await buildLocalizedFetchPage({
      repositoryRoot: repo,
      masterCommit: masterSha,
      devCommit,
      page: 'delete-entities',
      pageUrl: 'tutorials/manage-data/delete-entities',
      fetchRunId: 'run-101',
      channel: 'current',
      navigation: {
        sidebar_label: '删除实体',
        sidebar_position: 3,
      },
      referenceRecordId: 'recNEW',
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.outputPath).toBe('content/zh-CN/guides/tutorials/manage-data/delete-entities.md')
    expect(result.mdx).toContain('https://cloud.zilliz.com.cn')
    expect(result.mdx).toContain('<UI>创建集群</UI>')
    expect(result.mdx).not.toContain('DIRTY WORKTREE')
    expect(result.mdx).not.toContain('dirty.invalid')
    expect(result.mdx).toContain('sidebar_label: "删除实体"')
    expect(result.mdx).toContain('sidebar_position: 3')
    expect(result.receipt.page).toBe('delete-entities')
    expect(result.receipt.page_url).toBe('tutorials/manage-data/delete-entities')
    expect(result.receipt.inputs.master_commit).toBe(masterSha)
    expect(result.receipt.inputs.dev_commit).toBe(devCommit)
    expect(result.receipt.reference_record_id).toBe('recNEW')
  })

  it('changes cache identity when Git Chinese source changes while Feishu record stays unchanged', () => {
    const repo = makeTempDir('localized-digest-repo-')
    initGitRepo(repo)
    writeRel(repo, 'localized-docs/zh-CN/guides/Variables.json', JSON.stringify({ endpoint: 'https://cloud.zilliz.com.cn' }))
    writeRel(repo, 'localized-docs/zh-CN/guides/fragments/tip.md', '提示内容 v1\n')
    writeRel(repo, 'localized-docs/zh-CN/guides/pages/delete-entities/page.yaml', VALID_PAGE_YAML)
    writeRel(repo, 'localized-docs/zh-CN/guides/pages/delete-entities/source.md', VALID_SOURCE_MD)
    const sha1 = commitAll(repo, 'v1')

    const d1 = computePinnedLocalizedInputDigests(repo, sha1, 'delete-entities')
    const id1 = computeLocalizedCacheIdentity({
      page: 'delete-entities',
      pageUrl: 'tutorials/manage-data/delete-entities',
      sourceFiles: d1.source_files,
      navigationDigest: 'd'.repeat(64),
      channel: null,
      imageBaseUrl: 'https://zdoc-images.zilliz.com.cn',
    })

    // Edit fragment only (Feishu record unchanged)
    writeRel(repo, 'localized-docs/zh-CN/guides/fragments/tip.md', '提示内容 v2\n')
    const sha2 = commitAll(repo, 'v2 fragment')
    const d2 = computePinnedLocalizedInputDigests(repo, sha2, 'delete-entities')
    const id2 = computeLocalizedCacheIdentity({
      page: 'delete-entities',
      pageUrl: 'tutorials/manage-data/delete-entities',
      sourceFiles: d2.source_files,
      navigationDigest: 'd'.repeat(64),
      channel: null,
      imageBaseUrl: 'https://zdoc-images.zilliz.com.cn',
    })

    expect(id2.inputs_sha256).not.toBe(id1.inputs_sha256)
  })

  it('applies promoteLocalizedSource on matching EN NEXT SHA and fails closed on PROMOTE_EN_MISMATCH', async () => {
    const repo = makeTempDir('localized-promote-repo-')
    initGitRepo(repo)
    const devCommit = 'e'.repeat(40)
    writeRel(repo, 'localized-docs/zh-CN/guides/Variables.json', JSON.stringify({ endpoint: 'https://cloud.zilliz.com.cn' }))
    writeRel(repo, 'localized-docs/zh-CN/guides/pages/delete-entities/page.yaml', VALID_PAGE_YAML)
    writeRel(repo, 'localized-docs/zh-CN/guides/pages/delete-entities/source.md', VALID_SOURCE_MD)
    writeRel(repo, 'localized-docs/zh-CN/guides/pages/delete-entities/.baseline.json', makeBaselineJson('delete-entities', VALID_SOURCE_MD, devCommit))
    const masterSha = commitAll(repo, 'pin promote page')

    const okResult = await buildLocalizedFetchPage({
      repositoryRoot: repo,
      masterCommit: masterSha,
      devCommit,
      page: 'delete-entities',
      pageUrl: 'tutorials/manage-data/delete-entities',
      fetchRunId: 'run-200',
      promote: { expectedEnNextSha: NEXT_SHA },
    })
    expect(okResult.ok).toBe(true)
    if (okResult.ok) {
      expect(okResult.mdx).toContain('新版本说明。')
      expect(okResult.mdx).not.toContain('旧版本说明。')
      expect(okResult.mdx).not.toContain('<NextChannel')
      expect(okResult.promoted?.unwrappedIncludeCount).toBe(1)
      expect(okResult.promoted?.removedExcludeCount).toBe(1)
    }

    const mismatchResult = await buildLocalizedFetchPage({
      repositoryRoot: repo,
      masterCommit: masterSha,
      devCommit,
      page: 'delete-entities',
      pageUrl: 'tutorials/manage-data/delete-entities',
      fetchRunId: 'run-201',
      promote: { expectedEnNextSha: 'f'.repeat(64) },
    })
    expect(mismatchResult.ok).toBe(false)
    if (!mismatchResult.ok && 'code' in mismatchResult) {
      expect(mismatchResult.code).toBe('PROMOTE_EN_MISMATCH')
    }
  })

  it('enforces strict zh-CN Guides output path isolation and record_id-decoupled routing context', () => {
    expect(() => resolveLocalizedGuidesOutputPath('tutorials/tools/cli')).toThrow(/isolation/)
    expect(() => resolveLocalizedGuidesOutputPath('home')).toThrow(/isolation/)
    expect(() => resolveLocalizedGuidesOutputPath('tutorials/home')).toThrow(/externally owned/)

    const baseline = makeTempDir('localized-baseline-')
    writeRel(
      baseline,
      'generated/zh-CN/manifests/localized-pages/guides/active.json',
      JSON.stringify({
        schema_version: 1,
        locale: 'zh-CN',
        group: 'guides',
        pages: [
          {
            page: 'delete-entities',
            page_url: 'tutorials/manage-data/delete-entities',
            feishu_token: 'oldtok',
            anchors: {},
            activated_in: 'run-1',
            last_seen_record_id: 'recOLD',
          },
        ],
      }),
    )

    const active = readLocalizedActiveState(baseline)
    expect(active?.pages[0].last_seen_record_id).toBe('recOLD')

    // Routing succeeds with changed record_id recNEW while page_url matches!
    const ctx = createLocalizedFetchRoutingContext({
      site: 'zh-CN',
      baselineRoot: baseline,
      availablePages: ['delete-entities'],
      records: [
        {
          record_id: 'recNEW',
          placement_type: 'canonical',
          page_url: 'tutorials/manage-data/delete-entities',
          doc_link: 'https://github.com/zilliztech/zdoc/tree/master/localized-docs/zh-CN/guides/pages/delete-entities',
        },
      ],
    })
    expect(ctx.resolveRoute('tutorials/manage-data/delete-entities')?.kind).toBe('localized-page')
    const nextActive = ctx.computeNextActiveRegistry({ activatedIn: 'run-2' })
    expect(nextActive.pages[0].last_seen_record_id).toBe('recNEW')
    expect(nextActive.pages[0].activated_in).toBe('run-1')

    // Receipt reader rejects symlinks
    symlinkSync('/etc/passwd', join(baseline, 'generated/zh-CN/manifests/localized-pages/guides/delete-entities.json'))
    expect(() => readLocalizedReceipt(baseline, { page: 'delete-entities' })).toThrow(/symlink/)
  })
})
