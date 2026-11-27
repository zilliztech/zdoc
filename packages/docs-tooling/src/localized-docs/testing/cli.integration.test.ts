// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { runBuild } from '../commands/build.ts'
import { runCheck } from '../commands/check.ts'
import { sha256Hex } from '../core/types.ts'
import { VALID_GROUP_VARIABLES_JSON } from './fixtures/en-samples.ts'

const repositoryRoot = path.resolve(import.meta.dirname, '../../../../..')
const cliLauncher = path.join(repositoryRoot, 'scripts/docs-tooling.js')

function tempDir(prefix = 'localized-docs-cli-'): string {
  return realpathSync(mkdtempSync(path.join(tmpdir(), prefix)))
}

function makeBaseline(pageId: string, sourceMd: string) {
  const sourceSha = sha256Hex(sourceMd)
  const sha = 'a'.repeat(64)
  return JSON.stringify(
    {
      schema_version: 1,
      page_id: pageId,
      en_baseline: {
        manual: 'guides',
        shared_page: pageId,
        dev_commit: '1'.repeat(40),
        en_path: `content/en/guides/${pageId}.md`,
        manifest_path: `generated/en/manifests/shared-pages/guides/${pageId}.json`,
        file_sha256: sha,
        channels: {
          current_sha256: sha,
          next_sha256: sha,
        },
      },
      zh_reviewed: {
        source_sha256: sourceSha,
        reviewed_pr: 42,
        updated_at: '2026-11-26T08:00:00Z',
      },
      last_notified_en_sha: null,
      sections: [
        {
          anchor: 'overview',
          en_sha256: sha,
          zh_sha256: sha,
          code_blocks: [],
        },
      ],
    },
    null,
    2,
  )
}

function createSampleGroup(baseDir: string) {
  const root = path.join(baseDir, 'localized-docs/zh-CN/guides')
  mkdirSync(path.join(root, 'fragments'), { recursive: true })
  mkdirSync(path.join(root, 'pages/delete-entities'), { recursive: true })
  mkdirSync(path.join(root, 'pages/new-shared-page'), { recursive: true })
  mkdirSync(path.join(root, 'pages/global-only'), { recursive: true })

  writeFileSync(joinPath(root, 'Variables.json'), VALID_GROUP_VARIABLES_JSON)
  writeFileSync(
    joinPath(root, 'fragments/warning.md'),
    '<Admonition type="warning" title="注意">\n\n此操作将影响 {{var.connection_target}}。\n\n</Admonition>\n',
  )

  const deleteSource = `# 删除 Entity

您可以在 {{var.product_name}} 中按条件删除 Entity。

{{fragments/warning.md}}

点击 <UI>删除</UI> 完成操作。
`
  writeFileSync(
    joinPath(root, 'pages/delete-entities/page.yaml'),
    `schema_version: 1
mode: incremental
en_source:
  manual: guides
  shared_page: delete-entities
sync_policy: independent
`,
  )
  writeFileSync(joinPath(root, 'pages/delete-entities/source.md'), deleteSource)
  writeFileSync(
    joinPath(root, 'pages/delete-entities/.baseline.json'),
    makeBaseline('delete-entities', deleteSource),
  )

  // pending-initial-translation page: incremental with page.yaml only
  writeFileSync(
    joinPath(root, 'pages/new-shared-page/page.yaml'),
    `schema_version: 1
mode: incremental
en_source:
  manual: guides
  shared_page: new-shared-page
`,
  )

  // paused page
  writeFileSync(
    joinPath(root, 'pages/global-only/page.yaml'),
    `schema_version: 1
mode: paused
en_source:
  manual: guides
  shared_page: global-only
pause_reason: "暂未上线"
`,
  )

  return root
}

function joinPath(...parts: string[]): string {
  return path.join(...parts)
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

describe('localized-docs CLI & commands integration', () => {
  it('runs check and build end-to-end through scripts/docs-tooling.js', () => {
    const dir = tempDir()
    try {
      const root = createSampleGroup(dir)
      const out = path.join(dir, 'dist-out')

      const checkRes = runDocsToolingCli(['check', '--root', root])
      expect(checkRes.status, checkRes.stderr + checkRes.stdout).toBe(0)
      expect(checkRes.stdout).toContain('[delete-entities] status: ready')
      expect(checkRes.stdout).toContain('[new-shared-page] status: pending-initial-translation')
      expect(checkRes.stdout).toContain('[global-only] status: paused')

      const buildRes = runDocsToolingCli(['build', '--root', root, '--out', out])
      expect(buildRes.status, buildRes.stderr + buildRes.stdout).toBe(0)

      const builtMdx = readFileSync(path.join(out, 'delete-entities.mdx'), 'utf8')
      expect(builtMdx).toContain('title: "删除 Entity | Cloud"')
      expect(builtMdx).toContain("import Admonition from '@theme/Admonition';")
      expect(builtMdx).not.toContain('import UI')
      expect(builtMdx).toContain('此操作将影响 您的集群。')
      expect(builtMdx).toContain('<UI>删除</UI>')

      const manifest = JSON.parse(readFileSync(path.join(out, 'manifest.json'), 'utf8'))
      expect(manifest.built_pages).toHaveLength(1)
      expect(manifest.built_pages[0].page_id).toBe('delete-entities')
      expect(manifest.skipped_pages).toEqual([
        { page_id: 'global-only', state: 'paused' },
        { page_id: 'new-shared-page', state: 'pending-initial-translation' },
      ])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('rejects unknown actions and invalid CLI options with exit code 2', () => {
    const badAction = runDocsToolingCli(['unknown-action'])
    expect(badAction.status).toBe(2)

    const badOption = runDocsToolingCli(['check', '--root', '/tmp/nope', '--bogus', '1'])
    expect(badOption.status).toBe(2)

    const missingOut = runDocsToolingCli(['build', '--root', '/tmp/nope'])
    expect(missingOut.status).toBe(2)
  })

  it('fails check and build on baseline-missing-error without writing partial output', async () => {
    const dir = tempDir()
    try {
      const root = createSampleGroup(dir)
      rmSync(path.join(root, 'pages/delete-entities/.baseline.json'))
      const out = path.join(dir, 'out-fail')

      let errOut = ''
      const checkCode = await runCheck({ root }, () => {}, text => {
        errOut += text
      })
      expect(checkCode).toBe(1)
      expect(errOut).toContain('BASELINE_MISSING')

      let buildErr = ''
      const buildCode = await runBuild({ root, out }, () => {}, text => {
        buildErr += text
      })
      expect(buildCode).toBe(1)
      expect(buildErr).toContain('BASELINE_MISSING')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('rejects non-empty --out, symlinked --out, symlinked ancestors, overlapping --out/--root, and symlinked inputs', async () => {
    const dir = tempDir()
    try {
      const root = createSampleGroup(dir)

      // 1. Non-empty --out
      const nonEmpty = path.join(dir, 'non-empty')
      mkdirSync(nonEmpty)
      writeFileSync(path.join(nonEmpty, 'keep.txt'), 'existing')
      let err1 = ''
      expect(
        await runBuild({ root, out: nonEmpty }, () => {}, text => {
          err1 += text
        }),
      ).toBe(1)
      expect(err1).toContain('empty or absent')
      expect(readFileSync(path.join(nonEmpty, 'keep.txt'), 'utf8')).toBe('existing')

      // 2. Overlapping --out inside --root
      let err2 = ''
      expect(
        await runBuild({ root, out: path.join(root, 'out-inside') }, () => {}, text => {
          err2 += text
        }),
      ).toBe(1)
      expect(err2).toContain('overlap')

      // 3. Symlinked --out and symlinked ancestor
      const realTarget = path.join(dir, 'real-target')
      mkdirSync(realTarget)
      const symlinkOut = path.join(dir, 'symlink-out')
      symlinkSync(realTarget, symlinkOut)
      let err3 = ''
      expect(
        await runBuild({ root, out: symlinkOut }, () => {}, text => {
          err3 += text
        }),
      ).toBe(1)
      expect(err3).toContain('symlinks')

      let err4 = ''
      expect(
        await runBuild({ root, out: path.join(symlinkOut, 'nested') }, () => {}, text => {
          err4 += text
        }),
      ).toBe(1)
      expect(err4).toContain('symlinks')

      // 4. Symlinked page inside pages/
      symlinkSync(path.join(root, 'pages/new-shared-page'), path.join(root, 'pages/symlink-page'))
      let err5 = ''
      expect(
        await runCheck({ root, page: 'symlink-page' }, () => {}, text => {
          err5 += text
        }),
      ).toBe(1)
      expect(err5).toContain('SYMLINK_FORBIDDEN')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('supports single-page --page filtering and rejects unknown --page', async () => {
    const dir = tempDir()
    try {
      const root = createSampleGroup(dir)
      let out = ''
      expect(
        await runCheck({ root, page: 'delete-entities' }, text => {
          out += text
        }, () => {}),
      ).toBe(0)
      expect(out).toContain('[delete-entities] status: ready')
      expect(out).not.toContain('new-shared-page')

      let err = ''
      expect(
        await runCheck({ root, page: 'does-not-exist' }, () => {}, text => {
          err += text
        }),
      ).toBe(1)
      expect(err).toContain('CONFIG_FIELD_MISSING')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
