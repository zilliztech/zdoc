// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { parsePrCheckArgs, runPrCheck } from '../commands/pr-check.ts'
import { REVIEW_TODOS_END_MARKER, REVIEW_TODOS_START_MARKER } from '../core/review-gate.ts'
import { sha256Hex } from '../core/types.ts'
import { VALID_GROUP_VARIABLES_JSON } from './fixtures/en-samples.ts'

const repositoryRoot = path.resolve(import.meta.dirname, '../../../../..')
const cliLauncher = path.join(repositoryRoot, 'scripts/docs-tooling.js')

function tempDir(prefix = 'localized-docs-pr-check-'): string {
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

  writeFileSync(path.join(root, 'Variables.json'), VALID_GROUP_VARIABLES_JSON)
  writeFileSync(
    path.join(root, 'fragments/warning.md'),
    '<Admonition type="warning" title="注意">\n\n此操作将影响 {{var.connection_target}}。\n\n</Admonition>\n',
  )

  const deleteSource = `# 删除 Entity

您可以在 {{var.product_name}} 中按条件删除 Entity。

{{fragments/warning.md}}

点击 <UI>删除</UI> 完成操作。

<NextChannel action="exclude">

## 当前版本说明

仅当前版本展示此段。

</NextChannel>

<NextChannel action="include">

## 下一版本说明

NEXT_PROSE_SENTINEL: 提交删除请求前，请核对过滤表达式。

</NextChannel>

\`\`\`python
# current-channel-next-line
mode = "current"
# next-channel-next-line
mode = "NEXT_CODE_SENTINEL"
common = True
\`\`\`
`

  writeFileSync(
    path.join(root, 'pages/delete-entities/page.yaml'),
    `schema_version: 1
mode: incremental
en_source:
  manual: guides
  shared_page: delete-entities
sync_policy: independent
`,
  )
  writeFileSync(path.join(root, 'pages/delete-entities/source.md'), deleteSource)
  writeFileSync(
    path.join(root, 'pages/delete-entities/.baseline.json'),
    makeBaseline('delete-entities', deleteSource),
  )

  writeFileSync(
    path.join(root, 'pages/new-shared-page/page.yaml'),
    `schema_version: 1
mode: incremental
en_source:
  manual: guides
  shared_page: new-shared-page
`,
  )

  writeFileSync(
    path.join(root, 'pages/global-only/page.yaml'),
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

describe('localized-docs pr-check CLI & command', () => {
  it('runs end-to-end through scripts/docs-tooling.js and emits CURRENT/NEXT previews, report.json, and summary.md', () => {
    const dir = tempDir()
    try {
      const root = createSampleGroup(dir)
      const previewOut = path.join(dir, 'preview-out')
      const prBodyFile = path.join(dir, 'pr-body.md')
      writeFileSync(
        prBodyFile,
        `## Review\n${REVIEW_TODOS_START_MARKER}\n- [x] Verified UI terms\n- [X] Verified dual-channel diff\n${REVIEW_TODOS_END_MARKER}\n`,
      )

      const res = runDocsToolingCli([
        'pr-check',
        '--root',
        root,
        '--pr-body-file',
        prBodyFile,
        '--preview-out',
        previewOut,
      ])
      expect(res.status, res.stderr + res.stdout).toBe(0)
      expect(res.stdout).toContain('[delete-entities] status: ready')
      expect(res.stdout).toContain('[new-shared-page] status: pending-initial-translation')
      expect(res.stdout).toContain('[global-only] status: paused')

      const currentMdx = readFileSync(path.join(previewOut, 'current/delete-entities.mdx'), 'utf8')
      const nextMdx = readFileSync(path.join(previewOut, 'next/delete-entities.mdx'), 'utf8')

      expect(currentMdx).toContain('仅当前版本展示此段。')
      expect(currentMdx).toContain('mode = "current"')
      expect(currentMdx).not.toContain('NEXT_PROSE_SENTINEL')
      expect(currentMdx).not.toContain('NEXT_CODE_SENTINEL')
      expect(currentMdx).not.toContain('<NextChannel')

      expect(nextMdx).toContain('NEXT_PROSE_SENTINEL')
      expect(nextMdx).toContain('mode = "NEXT_CODE_SENTINEL"')
      expect(nextMdx).not.toContain('仅当前版本展示此段。')
      expect(nextMdx).not.toContain('mode = "current"')
      expect(nextMdx).not.toContain('<NextChannel')

      const report = JSON.parse(readFileSync(path.join(previewOut, 'report.json'), 'utf8'))
      expect(report.schema_version).toBe(1)
      expect(report.ok).toBe(true)
      expect(report.review_todos).toEqual({
        checked: true,
        has_block: true,
        total_count: 2,
        resolved_count: 2,
        unresolved_count: 0,
      })
      expect(report.pages).toHaveLength(3)

      const summaryMd = readFileSync(path.join(previewOut, 'summary.md'), 'utf8')
      expect(summaryMd).toContain('# Localized Docs PR Validation Summary')
      expect(summaryMd).toContain('delete-entities')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('enforces todo-zero gate on --pr-body-file while preserving preview artifacts when content is valid', async () => {
    const dir = tempDir()
    try {
      const root = createSampleGroup(dir)
      const previewUnresolved = path.join(dir, 'preview-unresolved')
      const unresolvedBody = path.join(dir, 'unresolved.md')
      writeFileSync(
        unresolvedBody,
        `${REVIEW_TODOS_START_MARKER}\n- [ ] Confirm note placement\n${REVIEW_TODOS_END_MARKER}\n`,
      )

      let errUnresolved = ''
      const codeUnresolved = await runPrCheck(
        { root, prBodyFile: unresolvedBody, previewOut: previewUnresolved },
        () => {},
        text => {
          errUnresolved += text
        },
      )
      expect(codeUnresolved).toBe(1)
      expect(errUnresolved).toContain('REVIEW_TODOS_UNRESOLVED')
      // Reviewers still get CURRENT/NEXT preview files when content checks pass
      expect(existsSync(path.join(previewUnresolved, 'current/delete-entities.mdx'))).toBe(true)
      expect(existsSync(path.join(previewUnresolved, 'next/delete-entities.mdx'))).toBe(true)
      const report = JSON.parse(readFileSync(path.join(previewUnresolved, 'report.json'), 'utf8'))
      expect(report.ok).toBe(false)

      // Malformed half-marker fails closed
      const malformedBody = path.join(dir, 'malformed.md')
      writeFileSync(malformedBody, '<!-- localized-docs:review-todos:start\n- [x] broken\n')
      let errMalformed = ''
      expect(
        await runPrCheck({ root, prBodyFile: malformedBody }, () => {}, text => {
          errMalformed += text
        }),
      ).toBe(1)
      expect(errMalformed).toContain('REVIEW_TODOS_MARKER_MALFORMED')

      // Absent markers pass by default and fail with --require-review-todos
      const plainBody = path.join(dir, 'plain.md')
      writeFileSync(plainBody, 'Manual PR without review-todos markers.\n')
      expect(await runPrCheck({ root, prBodyFile: plainBody }, () => {}, () => {})).toBe(0)

      let errMissing = ''
      expect(
        await runPrCheck({ root, prBodyFile: plainBody, requireReviewTodos: true }, () => {}, text => {
          errMissing += text
        }),
      ).toBe(1)
      expect(errMissing).toContain('REVIEW_TODOS_MARKER_MISSING')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('exits 0 on missing --root or empty pages/ while still checking --pr-body-file, and fails without previews on content/projection errors', async () => {
    const dir = tempDir()
    try {
      const missingRoot = path.join(dir, 'does-not-exist/guides')
      const skipPreview = path.join(dir, 'skip-preview')
      let skipOut = ''
      expect(
        await runPrCheck({ root: missingRoot, previewOut: skipPreview }, text => {
          skipOut += text
        }, () => {}),
      ).toBe(0)
      expect(skipOut).toContain('does not exist')
      const skipReport = JSON.parse(readFileSync(path.join(skipPreview, 'report.json'), 'utf8'))
      expect(skipReport.ok).toBe(true)
      expect(skipReport.skipped_reason).toBe('root-missing')

      // Missing root + unresolved PR body still fails closed
      const badBody = path.join(dir, 'bad-body.md')
      writeFileSync(badBody, `${REVIEW_TODOS_START_MARKER}\n- [ ] pending\n${REVIEW_TODOS_END_MARKER}\n`)
      let missingRootTodoErr = ''
      expect(
        await runPrCheck({ root: missingRoot, prBodyFile: badBody }, () => {}, text => {
          missingRootTodoErr += text
        }),
      ).toBe(1)
      expect(missingRootTodoErr).toContain('REVIEW_TODOS_UNRESOLVED')

      // Existing root with empty pages/
      const emptyRoot = path.join(dir, 'empty-guides')
      mkdirSync(path.join(emptyRoot, 'pages'), { recursive: true })
      writeFileSync(path.join(emptyRoot, 'Variables.json'), VALID_GROUP_VARIABLES_JSON)
      let emptyOut = ''
      expect(
        await runPrCheck({ root: emptyRoot }, text => {
          emptyOut += text
        }, () => {}),
      ).toBe(0)
      expect(emptyOut).toContain('No localized pages found')

      // baseline-missing-error fails without writing --preview-out
      const sampleRoot = createSampleGroup(dir)
      rmSync(path.join(sampleRoot, 'pages/delete-entities/.baseline.json'))
      const noPreviewOnBaselineFail = path.join(dir, 'no-preview-baseline')
      let baselineErr = ''
      expect(
        await runPrCheck(
          { root: sampleRoot, previewOut: noPreviewOnBaselineFail },
          () => {},
          text => {
            baselineErr += text
          },
        ),
      ).toBe(1)
      expect(baselineErr).toContain('BASELINE_MISSING')
      expect(existsSync(noPreviewOnBaselineFail)).toBe(false)

      // Duplicate heading conflict fails with DUPLICATE_HEADING_ANCHOR without writing --preview-out
      const dupSource = `# 标题\n\n## 概览\n\n<NextChannel action="include">\n\n## 概览\n\n</NextChannel>\n`
      writeFileSync(path.join(sampleRoot, 'pages/delete-entities/source.md'), dupSource)
      writeFileSync(
        path.join(sampleRoot, 'pages/delete-entities/.baseline.json'),
        makeBaseline('delete-entities', dupSource),
      )
      const noPreviewOnDup = path.join(dir, 'no-preview-dup')
      let dupErr = ''
      expect(
        await runPrCheck(
          { root: sampleRoot, previewOut: noPreviewOnDup },
          () => {},
          text => {
            dupErr += text
          },
        ),
      ).toBe(1)
      expect(dupErr).toContain('DUPLICATE_HEADING_ANCHOR')
      expect(existsSync(noPreviewOnDup)).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('supports repeatable --page filtering through CLI without overwriting earlier flags and exits 2 on invalid args', () => {
    const dir = tempDir()
    try {
      const root = createSampleGroup(dir)
      // Add a broken third page that is NOT selected via --page
      mkdirSync(path.join(root, 'pages/broken-page'), { recursive: true })
      writeFileSync(
        path.join(root, 'pages/broken-page/page.yaml'),
        `schema_version: 1\nmode: incremental\nen_source:\n  manual: guides\n  shared_page: broken-page\n`,
      )
      writeFileSync(path.join(root, 'pages/broken-page/source.md'), '# Broken\n')

      const res = runDocsToolingCli([
        'pr-check',
        '--root',
        root,
        '--page',
        'delete-entities',
        '--page',
        'new-shared-page',
      ])
      expect(res.status, res.stderr + res.stdout).toBe(0)
      expect(res.stdout).toContain('[delete-entities] status: ready')
      expect(res.stdout).toContain('[new-shared-page] status: pending-initial-translation')
      expect(res.stdout).not.toContain('broken-page')

      const missingPage = runDocsToolingCli(['pr-check', '--root', root, '--page', 'does-not-exist'])
      expect(missingPage.status).toBe(1)
      expect(missingPage.stderr).toContain('CONFIG_FIELD_MISSING')

      // Invalid CLI args exit 2
      expect(runDocsToolingCli(['pr-check']).status).toBe(2)
      expect(runDocsToolingCli(['pr-check', '--root', root, '--bogus', '1']).status).toBe(2)
      expect(runDocsToolingCli(['pr-check', '--root', root, '--require-review-todos']).status).toBe(2)
      expect(runDocsToolingCli(['pr-check', '--root', root, '--root', root]).status).toBe(2)
      expect(() => parsePrCheckArgs(['--root', root, 'positional'])).toThrow()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('rejects non-empty, overlapping, and symlinked --preview-out / --root / --pr-body-file paths', async () => {
    const dir = tempDir()
    try {
      const root = createSampleGroup(dir)

      // Non-empty --preview-out
      const nonEmpty = path.join(dir, 'non-empty')
      mkdirSync(nonEmpty)
      writeFileSync(path.join(nonEmpty, 'keep.txt'), 'existing')
      let err1 = ''
      expect(
        await runPrCheck({ root, previewOut: nonEmpty }, () => {}, text => {
          err1 += text
        }),
      ).toBe(1)
      expect(err1).toContain('empty or absent')
      expect(readFileSync(path.join(nonEmpty, 'keep.txt'), 'utf8')).toBe('existing')

      // Overlapping --preview-out inside --root
      let err2 = ''
      expect(
        await runPrCheck({ root, previewOut: path.join(root, 'preview-inside') }, () => {}, text => {
          err2 += text
        }),
      ).toBe(1)
      expect(err2).toContain('overlap')

      // Symlinked --preview-out and symlinked ancestor
      const realTarget = path.join(dir, 'real-target')
      mkdirSync(realTarget)
      const symlinkOut = path.join(dir, 'symlink-out')
      symlinkSync(realTarget, symlinkOut)
      let err3 = ''
      expect(
        await runPrCheck({ root, previewOut: symlinkOut }, () => {}, text => {
          err3 += text
        }),
      ).toBe(1)
      expect(err3).toContain('symlinks')

      let err4 = ''
      expect(
        await runPrCheck({ root, previewOut: path.join(symlinkOut, 'nested') }, () => {}, text => {
          err4 += text
        }),
      ).toBe(1)
      expect(err4).toContain('symlinks')

      // Symlinked --root
      const symlinkRoot = path.join(dir, 'symlink-root')
      symlinkSync(root, symlinkRoot)
      let err5 = ''
      expect(
        await runPrCheck({ root: symlinkRoot }, () => {}, text => {
          err5 += text
        }),
      ).toBe(1)
      expect(err5).toContain('symbolic link')

      // Symlinked --pr-body-file
      const realBody = path.join(dir, 'real-body.md')
      writeFileSync(realBody, 'ok\n')
      const symlinkBody = path.join(dir, 'symlink-body.md')
      symlinkSync(realBody, symlinkBody)
      let err6 = ''
      expect(
        await runPrCheck({ root, prBodyFile: symlinkBody }, () => {}, text => {
          err6 += text
        }),
      ).toBe(1)
      expect(err6).toContain('symbolic link')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
