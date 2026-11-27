import { lstat, mkdir, mkdtemp, readFile, realpath, rename, rm, rmdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import {
  pathsOverlap,
  readLocalizedGroup,
  validateOutputDirectoryState,
  withinPath,
} from '../adapters/fs-reader.ts'
import type { ReadLocalizedGroupResult, ReadPageEntry } from '../adapters/fs-reader.ts'
import { createLocalizedPreprocessAdapter } from '../adapters/md2md.ts'
import { localizedMdxAdapter } from '../adapters/mdx.ts'
import { assembleLocalizedPage } from '../core/assemble.ts'
import { validateBaselineConsistency } from '../core/baseline.ts'
import { validatePageId } from '../core/config.ts'
import { evaluateReviewTodos, projectDualChannelMdx } from '../core/review-gate.ts'
import type { ReviewTodosResult } from '../core/review-gate.ts'
import type { AdaptedLocalizedPage, LocalizedDocsError } from '../core/types.ts'
import { formatDiagnostic, localizedError } from '../core/types.ts'

export interface PrCheckOptions {
  root: string
  pages?: readonly string[]
  prBodyFile?: string
  previewOut?: string
  requireReviewTodos?: boolean
}

export interface PrCheckPageSummary {
  pageId: string
  status: 'ready' | 'pending-initial-translation' | 'paused'
  components?: string[]
  uiTagCount?: number
  currentHeadingCount?: number
  nextHeadingCount?: number
  previewFiles?: {
    current: string
    next: string
  }
}

export interface PrCheckReport {
  schema_version: 1
  ok: boolean
  root: string
  skipped_reason?: 'root-missing' | 'no-pages'
  pages: PrCheckPageSummary[]
  review_todos?: {
    checked: boolean
    has_block: boolean
    total_count: number
    resolved_count: number
    unresolved_count: number
  }
  errors: LocalizedDocsError[]
}

interface PreviewPageOutput {
  pageId: string
  currentMdx: string
  nextMdx: string
}

function readFlagValue(argv: readonly string[], index: number, flag: string): string {
  const value = argv[index + 1]
  if (value === undefined || value.length === 0 || value.startsWith('--')) {
    throw new Error(`${flag} requires a non-empty value`)
  }
  return value
}

export function parsePrCheckArgs(argv: string[]): PrCheckOptions {
  let root: string | undefined
  let prBodyFile: string | undefined
  let previewOut: string | undefined
  let requireReviewTodos = false
  const pages: string[] = []
  const seenPages = new Set<string>()

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`)
    }
    switch (arg) {
      case '--root': {
        if (root !== undefined) throw new Error('Duplicate option: --root')
        root = readFlagValue(argv, i, '--root')
        i += 1
        break
      }
      case '--page': {
        const pageId = readFlagValue(argv, i, '--page')
        if (!seenPages.has(pageId)) {
          seenPages.add(pageId)
          pages.push(pageId)
        }
        i += 1
        break
      }
      case '--pr-body-file': {
        if (prBodyFile !== undefined) throw new Error('Duplicate option: --pr-body-file')
        prBodyFile = readFlagValue(argv, i, '--pr-body-file')
        i += 1
        break
      }
      case '--preview-out': {
        if (previewOut !== undefined) throw new Error('Duplicate option: --preview-out')
        previewOut = readFlagValue(argv, i, '--preview-out')
        i += 1
        break
      }
      case '--require-review-todos': {
        if (requireReviewTodos) throw new Error('Duplicate option: --require-review-todos')
        requireReviewTodos = true
        break
      }
      default:
        throw new Error(`Unknown localized-docs pr-check option: ${arg}`)
    }
  }

  if (!root) {
    throw new Error('--root is required')
  }
  if (requireReviewTodos && !prBodyFile) {
    throw new Error('--require-review-todos requires --pr-body-file')
  }

  return {
    root,
    ...(pages.length > 0 ? { pages } : {}),
    ...(prBodyFile !== undefined ? { prBodyFile } : {}),
    ...(previewOut !== undefined ? { previewOut } : {}),
    ...(requireReviewTodos ? { requireReviewTodos: true } : {}),
  }
}

async function readSafePrBodyFile(prBodyFile: string): Promise<string> {
  const resolved = resolve(prBodyFile)
  let stats
  try {
    stats = await lstat(resolved)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`PR body file does not exist: ${resolved}`)
    }
    throw error
  }
  if (stats.isSymbolicLink()) {
    throw new Error(`PR body file must not be a symbolic link: ${resolved}`)
  }
  if (!stats.isFile()) {
    throw new Error(`PR body file must be a regular file: ${resolved}`)
  }
  return await readFile(resolved, 'utf8')
}

async function checkRootState(resolvedRoot: string): Promise<'exists' | 'missing'> {
  let stats
  try {
    stats = await lstat(resolvedRoot)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return 'missing'
    }
    throw error
  }
  if (stats.isSymbolicLink()) {
    throw new Error(`Localized docs root must not be a symbolic link: ${resolvedRoot}`)
  }
  if (!stats.isDirectory()) {
    throw new Error(`Localized docs root must be a directory: ${resolvedRoot}`)
  }
  return 'exists'
}

function buildSummaryMarkdown(report: PrCheckReport): string {
  const lines: string[] = ['# Localized Docs PR Validation Summary', '']
  lines.push(`- **Status**: ${report.ok ? 'PASS' : 'FAIL'}`)
  lines.push(`- **Root**: \`${report.root}\``)
  if (report.skipped_reason) {
    lines.push(`- **Skipped**: \`${report.skipped_reason}\``)
  }
  if (report.review_todos) {
    lines.push(
      `- **Review Todos**: ${report.review_todos.has_block ? `${report.review_todos.resolved_count}/${report.review_todos.total_count} resolved (${report.review_todos.unresolved_count} unresolved)` : 'no controlled block'}`,
    )
  }
  lines.push('')

  if (report.pages.length > 0) {
    lines.push('## Pages', '')
    lines.push('| Page ID | Status | UI Tags | Current Headings | Next Headings | Previews |')
    lines.push('|---|---|---|---|---|---|')
    for (const page of report.pages) {
      const previews = page.previewFiles
        ? `\`${page.previewFiles.current}\`, \`${page.previewFiles.next}\``
        : '—'
      lines.push(
        `| \`${page.pageId}\` | \`${page.status}\` | ${page.uiTagCount ?? '—'} | ${page.currentHeadingCount ?? '—'} | ${page.nextHeadingCount ?? '—'} | ${previews} |`,
      )
    }
    lines.push('')
  }

  if (report.errors.length > 0) {
    lines.push('## Diagnostics', '')
    for (const error of report.errors) {
      lines.push(`- \`${formatDiagnostic(error)}\``)
    }
    lines.push('')
  }

  return `${lines.join('\n')}`
}

async function writePreviewArtifacts(options: {
  resolvedOut: string
  resolvedRoot: string
  realRoot?: string
  pages: readonly PreviewPageOutput[]
  report: PrCheckReport
}): Promise<void> {
  const { resolvedOut, resolvedRoot, realRoot, pages, report } = options
  if (pathsOverlap(resolvedOut, resolvedRoot) || (realRoot && pathsOverlap(resolvedOut, realRoot))) {
    throw new Error(`Preview output directory must not overlap localized-docs root: ${resolvedOut}`)
  }

  const outState = await validateOutputDirectoryState(resolvedOut)
  if (outState === 'empty') {
    const realOut = await realpath(resolvedOut)
    if (pathsOverlap(realOut, resolvedRoot) || (realRoot && pathsOverlap(realOut, realRoot))) {
      throw new Error(`Preview output directory must not overlap localized-docs root: ${resolvedOut}`)
    }
  }

  await mkdir(dirname(resolvedOut), { recursive: true })
  const stage = await mkdtemp(join(dirname(resolvedOut), '.localized-docs-pr-check-'))
  try {
    if (pages.length > 0) {
      await mkdir(join(stage, 'current'), { recursive: true })
      await mkdir(join(stage, 'next'), { recursive: true })
      for (const page of pages) {
        const currentTarget = join(stage, 'current', `${page.pageId}.mdx`)
        const nextTarget = join(stage, 'next', `${page.pageId}.mdx`)
        if (!withinPath(stage, currentTarget) || !withinPath(stage, nextTarget)) {
          throw new Error(`Preview output escapes staging directory: ${page.pageId}`)
        }
        await writeFile(currentTarget, page.currentMdx, { flag: 'wx' })
        await writeFile(nextTarget, page.nextMdx, { flag: 'wx' })
      }
    }

    const reportTarget = join(stage, 'report.json')
    const summaryTarget = join(stage, 'summary.md')
    if (!withinPath(stage, reportTarget) || !withinPath(stage, summaryTarget)) {
      throw new Error('Preview report output escapes staging directory')
    }
    await writeFile(reportTarget, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' })
    await writeFile(summaryTarget, buildSummaryMarkdown(report), { flag: 'wx' })

    if ((await validateOutputDirectoryState(resolvedOut)) === 'empty') {
      await rmdir(resolvedOut)
    }
    await rename(stage, resolvedOut)
  } finally {
    await rm(stage, { recursive: true, force: true })
  }
}

function formatReviewTodosReport(todoResult: ReviewTodosResult): PrCheckReport['review_todos'] {
  return {
    checked: true,
    has_block: todoResult.hasBlock,
    total_count: todoResult.totalCount,
    resolved_count: todoResult.resolvedCount,
    unresolved_count: todoResult.unresolvedItems.length,
  }
}

export async function runPrCheck(
  options: PrCheckOptions,
  write: (text: string) => void = text => process.stdout.write(text),
  writeError: (text: string) => void = text => process.stderr.write(text),
): Promise<number> {
  try {
    const resolvedRoot = resolve(options.root)
    const resolvedOut = options.previewOut !== undefined ? resolve(options.previewOut) : undefined

    if (options.requireReviewTodos && !options.prBodyFile) {
      throw new Error('--require-review-todos requires --pr-body-file')
    }

    if (resolvedOut) {
      if (pathsOverlap(resolvedOut, resolvedRoot)) {
        throw new Error(`Preview output directory must not overlap localized-docs root: ${resolvedOut}`)
      }
      const outState = await validateOutputDirectoryState(resolvedOut)
      if (outState === 'empty') {
        const realOut = await realpath(resolvedOut)
        if (pathsOverlap(realOut, resolvedRoot)) {
          throw new Error(`Preview output directory must not overlap localized-docs root: ${resolvedOut}`)
        }
      }
    }

    const prBodyText = options.prBodyFile !== undefined ? await readSafePrBodyFile(options.prBodyFile) : undefined

    const rootState = await checkRootState(resolvedRoot)
    if (rootState === 'missing') {
      const todoResult =
        prBodyText !== undefined
          ? evaluateReviewTodos(prBodyText, {
              requireBlock: options.requireReviewTodos === true,
              file: options.prBodyFile,
            })
          : undefined
      const todoErrors = todoResult?.errors ?? []
      const report: PrCheckReport = {
        schema_version: 1,
        ok: todoErrors.length === 0,
        root: resolvedRoot,
        skipped_reason: 'root-missing',
        pages: [],
        ...(todoResult ? { review_todos: formatReviewTodosReport(todoResult) } : {}),
        errors: todoErrors,
      }
      write(`Localized docs root does not exist (${resolvedRoot}); skipping pr-check.\n`)
      if (resolvedOut) {
        await writePreviewArtifacts({
          resolvedOut,
          resolvedRoot,
          pages: [],
          report,
        })
      }
      if (todoErrors.length > 0) {
        for (const err of todoErrors) {
          writeError(`${formatDiagnostic(err)}\n`)
        }
        return 1
      }
      return 0
    }

    let group: ReadLocalizedGroupResult
    let selectedPages: ReadPageEntry[] = []
    const contentErrors: LocalizedDocsError[] = []

    if (options.pages && options.pages.length > 0) {
      let firstGroup: ReadLocalizedGroupResult | undefined
      const seenGroupErrorKeys = new Set<string>()
      for (const pageId of options.pages) {
        const idCheck = validatePageId(pageId, { file: `pages/${pageId}`, page: pageId })
        if ('errors' in idCheck) {
          contentErrors.push(...idCheck.errors)
          continue
        }
        const single = await readLocalizedGroup({ root: options.root, page: pageId })
        if (!firstGroup) firstGroup = single
        for (const err of single.errors) {
          if (!err.page) {
            const key = `${err.code}\0${err.file ?? ''}\0${err.line ?? ''}\0${err.message}`
            if (seenGroupErrorKeys.has(key)) continue
            seenGroupErrorKeys.add(key)
          }
          contentErrors.push(err)
        }
        selectedPages.push(...single.pages)
      }
      if (!firstGroup) {
        firstGroup = await readLocalizedGroup({ root: options.root })
      }
      group = {
        ...firstGroup,
        pages: selectedPages,
      }
    } else {
      group = await readLocalizedGroup({ root: options.root })
      selectedPages = group.pages
      contentErrors.push(...group.errors)
    }

    if (resolvedOut) {
      if (pathsOverlap(resolvedOut, group.realRoot)) {
        throw new Error(`Preview output directory must not overlap localized-docs root: ${resolvedOut}`)
      }
      const outState = await validateOutputDirectoryState(resolvedOut)
      if (outState === 'empty') {
        const realOut = await realpath(resolvedOut)
        if (pathsOverlap(realOut, group.realRoot)) {
          throw new Error(`Preview output directory must not overlap localized-docs root: ${resolvedOut}`)
        }
      }
    }

    if (selectedPages.length === 0 && contentErrors.length === 0) {
      const todoResult =
        prBodyText !== undefined
          ? evaluateReviewTodos(prBodyText, {
              requireBlock: options.requireReviewTodos === true,
              file: options.prBodyFile,
            })
          : undefined
      const todoErrors = todoResult?.errors ?? []
      const report: PrCheckReport = {
        schema_version: 1,
        ok: todoErrors.length === 0,
        root: group.realRoot,
        skipped_reason: 'no-pages',
        pages: [],
        ...(todoResult ? { review_todos: formatReviewTodosReport(todoResult) } : {}),
        errors: todoErrors,
      }
      write(`No localized pages found under ${resolvedRoot}; skipping pr-check.\n`)
      if (resolvedOut) {
        await writePreviewArtifacts({
          resolvedOut,
          resolvedRoot,
          realRoot: group.realRoot,
          pages: [],
          report,
        })
      }
      if (todoErrors.length > 0) {
        for (const err of todoErrors) {
          writeError(`${formatDiagnostic(err)}\n`)
        }
        return 1
      }
      return 0
    }

    const preprocessAdapter = createLocalizedPreprocessAdapter({
      groupRoot: group.realRoot,
      hasFragmentsDir: group.hasFragmentsDir,
    })

    const pageSummaries: PrCheckPageSummary[] = []
    const previewPages: PreviewPageOutput[] = []

    for (const page of selectedPages) {
      if (page.lifecycleState === 'pending-initial-translation') {
        write(`[${page.pageId}] status: pending-initial-translation\n`)
        pageSummaries.push({ pageId: page.pageId, status: 'pending-initial-translation' })
        continue
      }
      if (page.lifecycleState === 'paused') {
        write(`[${page.pageId}] status: paused\n`)
        pageSummaries.push({ pageId: page.pageId, status: 'paused' })
        continue
      }
      if (page.lifecycleState === 'baseline-missing-error') {
        contentErrors.push(
          localizedError(
            'BASELINE_MISSING',
            `Page "${page.pageId}" has source.md without .baseline.json (baseline-missing-error; must not be treated as initial translation)`,
            { file: `pages/${page.pageId}/.baseline.json`, page: page.pageId },
            1,
          ),
        )
        continue
      }
      if (page.lifecycleState === 'source-missing-error') {
        contentErrors.push(
          localizedError(
            'SOURCE_MISSING',
            `Page "${page.pageId}" (mode=${page.config.mode}) is missing source.md`,
            { file: `pages/${page.pageId}/source.md`, page: page.pageId },
            1,
          ),
        )
        continue
      }

      const pageErrors: LocalizedDocsError[] = []
      if (page.baseline) {
        pageErrors.push(
          ...validateBaselineConsistency({
            baseline: page.baseline,
            dirPageId: page.pageId,
            pageConfig: page.config,
            sourceMdText: page.sourceMdText,
            context: { file: `pages/${page.pageId}/.baseline.json`, page: page.pageId },
          }),
        )
      }

      const assembled = await assembleLocalizedPage({
        pageId: page.pageId,
        sourceMd: page.sourceMdText!,
        groupVariables: group.variables,
        pageConfig: page.config,
        context: { file: `pages/${page.pageId}/source.md`, page: page.pageId },
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })

      if ('errors' in assembled) {
        pageErrors.push(...assembled.errors)
        contentErrors.push(...pageErrors)
        continue
      }

      const pageContext = { file: `pages/${page.pageId}/source.md`, page: page.pageId }
      const projection = projectDualChannelMdx(assembled.mdx, pageContext)
      pageErrors.push(...projection.errors)

      for (const view of ['current', 'next'] as const) {
        const viewMdx = projection[view].mdx
        const viewLines = viewMdx.split('\n')
        const adaptedView: AdaptedLocalizedPage = {
          markdown: viewMdx,
          components: assembled.components,
          provenance: {
            inputLines: viewLines,
            outputLines: viewLines.map((_, idx) => idx + 1),
          },
        }
        const viewResult = await localizedMdxAdapter.toMdx(adaptedView, pageContext)
        if ('errors' in viewResult) {
          for (const err of viewResult.errors) {
            pageErrors.push({
              ...err,
              message: `[${view} channel] ${err.message}`,
            })
          }
        }
      }

      if (pageErrors.length > 0) {
        contentErrors.push(...pageErrors)
        continue
      }

      previewPages.push({
        pageId: page.pageId,
        currentMdx: projection.current.mdx,
        nextMdx: projection.next.mdx,
      })
      pageSummaries.push({
        pageId: page.pageId,
        status: 'ready',
        components: assembled.components,
        uiTagCount: assembled.uiTags.length,
        currentHeadingCount: projection.current.headings.length,
        nextHeadingCount: projection.next.headings.length,
        ...(resolvedOut
          ? {
              previewFiles: {
                current: `current/${page.pageId}.mdx`,
                next: `next/${page.pageId}.mdx`,
              },
            }
          : {}),
      })
      write(
        `[${page.pageId}] status: ready (uiTags=${assembled.uiTags.length}, components=${assembled.components.join(',') || 'none'}, currentHeadings=${projection.current.headings.length}, nextHeadings=${projection.next.headings.length})\n`,
      )
    }

    const todoResult =
      prBodyText !== undefined
        ? evaluateReviewTodos(prBodyText, {
            requireBlock: options.requireReviewTodos === true,
            file: options.prBodyFile,
          })
        : undefined
    const todoErrors = todoResult?.errors ?? []
    const allErrors = [...contentErrors, ...todoErrors]

    const report: PrCheckReport = {
      schema_version: 1,
      ok: allErrors.length === 0,
      root: group.realRoot,
      pages: pageSummaries,
      ...(todoResult ? { review_todos: formatReviewTodosReport(todoResult) } : {}),
      errors: allErrors,
    }

    if (resolvedOut && contentErrors.length === 0) {
      await writePreviewArtifacts({
        resolvedOut,
        resolvedRoot,
        realRoot: group.realRoot,
        pages: previewPages,
        report,
      })
    }

    if (allErrors.length > 0) {
      for (const error of allErrors) {
        writeError(`${formatDiagnostic(error)}\n`)
      }
      return 1
    }

    write(`Localized docs pr-check passed for ${selectedPages.length} page(s).\n`)
    return 0
  } catch (error) {
    writeError(`PR check failed: ${error instanceof Error ? error.message : String(error)}\n`)
    return 1
  }
}
