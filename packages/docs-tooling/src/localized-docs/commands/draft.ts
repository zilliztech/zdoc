import { mkdir, mkdtemp, realpath, rename, rm, rmdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { isCommit } from '../../shared-docs/core/yaml.ts'
import { loadLocalizedContractSupport } from '../adapters/contract.ts'
import { readVerifiedEnSnapshot } from '../adapters/en-reader.ts'
import {
  pathsOverlap,
  readLocalizedGroup,
  validateOutputDirectoryState,
  withinPath,
} from '../adapters/fs-reader.ts'
import { createDraftLlmProvider } from '../adapters/llm.ts'
import { createLocalizedPreprocessAdapter } from '../adapters/md2md.ts'
import { localizedMdxAdapter } from '../adapters/mdx.ts'
import { assembleLocalizedPage } from '../core/assemble.ts'
import { validatePageId } from '../core/config.ts'
import type { ReviewTodo } from '../core/diff.ts'
import {
  executeDraftEngine,
  type DraftLlmProvider,
  type DraftPageResult,
  type VerifiedEnSnapshot,
} from '../core/draft.ts'
import {
  buildPrBodyInputFromDraftResult,
  renderPrBody,
} from '../core/pr-body.ts'
import type {
  LocalizedDocsError,
  PageLifecycleState,
} from '../core/types.ts'
import { formatDiagnostic, localizedError } from '../core/types.ts'

const ISO_TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/

export interface DraftOptions {
  root: string
  page: string
  enNew: string
  out: string
  enBase?: string
  provider?: string
  enNewManifest?: string
  enBaseManifest?: string
  devRoot?: string
  devCommit?: string
  reviewedPr?: string | number
  updatedAt?: string
  styleGuide?: string
  localeContractRoot?: string
  llmProvider?: DraftLlmProvider
}

export interface DraftReportJson {
  schema_version: 1
  page_id: string
  status: 'drafted' | 'manual-notify' | 'skipped' | 'blocked'
  reason?: string
  lifecycle_state: PageLifecycleState
  mode: 'initial' | 'incremental' | 'manual' | 'paused'
  en_base_sha256: string | null
  en_new_sha256: string
  last_notified_en_sha?: string | null
  diff_summary?: {
    unchanged: number
    modified: number
    added: number
    removed: number
    ambiguous: number
  }
  code_blocks?: {
    tier1_verbatim: number
    tier2_mapped: number
    tier3_conflicts: number
    unchanged: number
  }
  ui_tags?: string[]
  locale_contract_warnings?: string[]
  review_todos?: ReviewTodo[]
  manual_notify?: {
    new_en_sha256: string
    en_diff_summary: string
  }
  diagnostics: LocalizedDocsError[]
}

async function writeDraftOutputsAtomic(
  resolvedOut: string,
  files: Readonly<Record<string, string>>,
): Promise<void> {
  await mkdir(dirname(resolvedOut), { recursive: true })
  const stage = await mkdtemp(join(dirname(resolvedOut), '.localized-docs-draft-'))
  try {
    for (const [name, content] of Object.entries(files)) {
      const target = join(stage, name)
      if (!withinPath(stage, target)) {
        throw new Error(`Draft output escapes staging directory: ${target}`)
      }
      await writeFile(target, content, { flag: 'wx' })
    }
    if ((await validateOutputDirectoryState(resolvedOut)) === 'empty') {
      await rmdir(resolvedOut)
    }
    await rename(stage, resolvedOut)
  } finally {
    await rm(stage, { recursive: true, force: true })
  }
}

function parseReviewedPr(value: string | number | undefined): number | undefined {
  if (value === undefined) return undefined
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isSafeInteger(num) || num <= 0 || (typeof value === 'string' && !/^\d+$/.test(value.trim()))) {
    throw new Error(`--reviewed-pr must be a positive integer, got: ${String(value)}`)
  }
  return num
}

function parseUpdatedAt(value: string | undefined): string | undefined {
  if (value === undefined) return undefined
  if (!ISO_TIMESTAMP_RE.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error(`--updated-at must be a valid ISO-8601 timestamp, got: ${value}`)
  }
  return value
}

export async function runDraft(
  options: DraftOptions,
  write: (text: string) => void = text => process.stdout.write(text),
  writeError: (text: string) => void = text => process.stderr.write(text),
  repositoryRoot?: string,
): Promise<number> {
  // 1. Validate scalar option syntax (exit 2 on invalid CLI arguments)
  let reviewedPr: number | undefined
  let updatedAt: string | undefined
  let llmProvider: DraftLlmProvider
  try {
    const idCheck = validatePageId(options.page, { page: options.page })
    if ('errors' in idCheck) {
      throw new Error(idCheck.errors[0].message)
    }
    if (options.devCommit !== undefined && !isCommit(options.devCommit)) {
      throw new Error(`--dev-commit must be a 40-char lowercase hex SHA, got: ${options.devCommit}`)
    }
    reviewedPr = parseReviewedPr(options.reviewedPr)
    updatedAt = parseUpdatedAt(options.updatedAt)
    llmProvider =
      options.llmProvider ??
      createDraftLlmProvider({ provider: options.provider ?? 'fake' })
  } catch (error) {
    writeError(`Invalid draft argument: ${error instanceof Error ? error.message : String(error)}\n`)
    return 2
  }

  try {
    const resolvedOut = resolve(options.out)
    const resolvedRoot = resolve(options.root)

    // 2. Output directory safety checks (no overlaps, no symlinks, empty or absent)
    const inputPathsToCheck = [
      resolvedRoot,
      resolve(options.enNew),
      ...(options.enBase ? [resolve(options.enBase)] : []),
      ...(options.enNewManifest ? [resolve(options.enNewManifest)] : []),
      ...(options.enBaseManifest ? [resolve(options.enBaseManifest)] : []),
      ...(options.devRoot ? [resolve(options.devRoot)] : []),
      ...(options.styleGuide ? [resolve(options.styleGuide)] : []),
    ]
    for (const inputPath of inputPathsToCheck) {
      if (pathsOverlap(resolvedOut, inputPath)) {
        throw new Error(`Output directory must not overlap input path: ${resolvedOut} <-> ${inputPath}`)
      }
    }

    const outState = await validateOutputDirectoryState(resolvedOut)
    if (outState === 'empty') {
      const realOut = await realpath(resolvedOut)
      if (pathsOverlap(realOut, resolvedRoot)) {
        throw new Error(`Output directory must not overlap localized-docs root: ${resolvedOut}`)
      }
    }

    // 3. Read localized group for the target page
    const group = await readLocalizedGroup({ root: options.root, page: options.page })
    if (pathsOverlap(resolvedOut, group.realRoot)) {
      throw new Error(`Output directory must not overlap localized-docs root: ${resolvedOut}`)
    }

    // Reject symlink/traversal/missing-group errors without writing output
    const fatalFsErrors = group.errors.filter(
      e => e.code === 'SYMLINK_FORBIDDEN' || e.code === 'PATH_TRAVERSAL',
    )
    if (fatalFsErrors.length > 0) {
      for (const err of fatalFsErrors) {
        writeError(`${formatDiagnostic(err)}\n`)
      }
      return 1
    }

    const page = group.pages.find(p => p.pageId === options.page)
    if (!page) {
      for (const err of group.errors) {
        writeError(`${formatDiagnostic(err)}\n`)
      }
      if (group.errors.length === 0) {
        writeError(`Page "${options.page}" not found under ${options.root}\n`)
      }
      return 1
    }

    const writeBlockedReport = async (
      reason: string,
      diagnostics: LocalizedDocsError[],
      enNewSha = '',
      enBaseSha: string | null = page.baseline?.en_baseline.file_sha256 ?? null,
    ): Promise<number> => {
      for (const err of diagnostics) {
        writeError(`${formatDiagnostic(err)}\n`)
      }
      const report: DraftReportJson = {
        schema_version: 1,
        page_id: page.pageId,
        status: 'blocked',
        reason,
        lifecycle_state: page.lifecycleState,
        mode: page.config.mode,
        en_base_sha256: enBaseSha,
        en_new_sha256: enNewSha,
        diagnostics,
      }
      await writeDraftOutputsAtomic(resolvedOut, {
        'draft-report.json': `${JSON.stringify(report, null, 2)}\n`,
      })
      return 1
    }

    // Handle readLocalizedGroup errors (such as malformed .baseline.json or broken Variables.json)
    if (group.errors.length > 0) {
      const baselineErrs = group.errors.filter(e => e.code.startsWith('BASELINE_'))
      const otherErrs = group.errors.filter(e => !e.code.startsWith('BASELINE_'))
      if (otherErrs.length > 0) {
        return await writeBlockedReport('baseline-invalid', group.errors)
      }
      if (baselineErrs.length > 0) {
        return await writeBlockedReport('baseline-invalid', baselineErrs)
      }
    }

    // Handle paused immediately without even needing EN network/manifest if desired,
    // though reading newEn is fine; still check lifecycle errors first!
    if (page.lifecycleState === 'baseline-missing-error') {
      return await writeBlockedReport('baseline-missing-error', [
        localizedError(
          'BASELINE_MISSING',
          `Page "${page.pageId}" has source.md without .baseline.json (baseline-missing-error; must not be treated as initial translation)`,
          { file: `pages/${page.pageId}/.baseline.json`, page: page.pageId },
          1,
        ),
      ])
    }

    if (page.lifecycleState === 'source-missing-error') {
      return await writeBlockedReport('source-missing-error', [
        localizedError(
          'SOURCE_MISSING',
          `Page "${page.pageId}" (mode=${page.config.mode}) is missing source.md`,
          { file: `pages/${page.pageId}/source.md`, page: page.pageId },
          1,
        ),
      ])
    }

    // 4. Read and verify newEn snapshot
    const newEnRes = await readVerifiedEnSnapshot({
      filePath: options.enNew,
      manifestPath: options.enNewManifest,
      devRoot: options.devRoot,
      manual: page.config.en_source.manual,
      sharedPage: page.config.en_source.shared_page,
      devCommit: options.devCommit,
    })
    if ('errors' in newEnRes) {
      return await writeBlockedReport('en-provenance-invalid', newEnRes.errors)
    }
    const newEn = newEnRes.snapshot

    // 5. Read baseEn snapshot when needed
    let baseEn: VerifiedEnSnapshot | null = null
    if (page.lifecycleState === 'pending-initial-translation') {
      if (options.enBase || options.enBaseManifest) {
        return await writeBlockedReport(
          'base-en-missing-or-mismatch',
          [
            localizedError(
              'EN_BASE_FORBIDDEN_FOR_INITIAL',
              `Page "${page.pageId}" is pending-initial-translation and must not receive --en-base`,
              { file: `pages/${page.pageId}/page.yaml`, page: page.pageId },
              1,
            ),
          ],
          newEn.provenance.fileSha256,
          null,
        )
      }
    } else if (page.config.mode === 'incremental') {
      if (!options.enBase && !options.enBaseManifest) {
        return await writeBlockedReport(
          'base-en-missing-or-mismatch',
          [
            localizedError(
              'EN_BASE_MISSING',
              `Incremental page "${page.pageId}" requires --en-base (or --en-base-manifest) matching .baseline.json`,
              { file: `pages/${page.pageId}/.baseline.json`, page: page.pageId },
              1,
            ),
          ],
          newEn.provenance.fileSha256,
        )
      }
      const baseEnRes = await readVerifiedEnSnapshot({
        filePath: options.enBase,
        manifestPath: options.enBaseManifest,
        manual: page.config.en_source.manual,
        sharedPage: page.config.en_source.shared_page,
        devCommit: page.baseline?.en_baseline.dev_commit ?? options.devCommit,
      })
      if ('errors' in baseEnRes) {
        return await writeBlockedReport(
          'base-en-missing-or-mismatch',
          baseEnRes.errors,
          newEn.provenance.fileSha256,
        )
      }
      baseEn = baseEnRes.snapshot
    } else if (page.config.mode === 'manual' && (options.enBase || options.enBaseManifest)) {
      const baseEnRes = await readVerifiedEnSnapshot({
        filePath: options.enBase,
        manifestPath: options.enBaseManifest,
        manual: page.config.en_source.manual,
        sharedPage: page.config.en_source.shared_page,
        devCommit: page.baseline?.en_baseline.dev_commit ?? options.devCommit,
      })
      if ('snapshot' in baseEnRes) {
        baseEn = baseEnRes.snapshot
      }
    }

    // 6. Load Locale Contract & Style Guide
    const contractSupport = loadLocalizedContractSupport({
      repositoryRoot: options.localeContractRoot ?? repositoryRoot,
      styleGuidePath: options.styleGuide,
      target: 'zh-CN-guides',
    })

    // 7. Execute pure drafting engine
    const result: DraftPageResult = await executeDraftEngine({
      pageId: page.pageId,
      pageConfig: page.config,
      curZh: {
        hasSourceMd: page.hasSourceMd,
        sourceMdText: page.sourceMdText,
        hasBaselineJson: page.hasBaselineJson,
        baselineJsonText: page.baselineJsonText,
        baseline: page.baseline,
        lifecycleState: page.lifecycleState,
      },
      newEn,
      baseEn,
      llmProvider,
      contractSupport,
      reviewedPr,
      nowIso: updatedAt ?? new Date().toISOString(),
    })

    // 8. Route outcomes & write staged outputs atomically
    if (result.status === 'blocked') {
      return await writeBlockedReport(
        result.reason,
        result.diagnostics,
        newEn.provenance.fileSha256,
      )
    }

    if (result.status === 'skipped') {
      const report: DraftReportJson = {
        schema_version: 1,
        page_id: page.pageId,
        status: 'skipped',
        reason: result.reason,
        lifecycle_state: page.lifecycleState,
        mode: page.config.mode,
        en_base_sha256: baseEn?.provenance.fileSha256 ?? page.baseline?.en_baseline.file_sha256 ?? null,
        en_new_sha256: newEn.provenance.fileSha256,
        last_notified_en_sha: page.baseline?.last_notified_en_sha ?? null,
        diagnostics: result.diagnostics,
      }
      await writeDraftOutputsAtomic(resolvedOut, {
        'draft-report.json': `${JSON.stringify(report, null, 2)}\n`,
      })
      write(`[${page.pageId}] draft skipped (${result.reason})\n`)
      return 0
    }

    if (result.status === 'manual-notify') {
      const report: DraftReportJson = {
        schema_version: 1,
        page_id: page.pageId,
        status: 'manual-notify',
        lifecycle_state: page.lifecycleState,
        mode: 'manual',
        en_base_sha256: page.baseline?.en_baseline.file_sha256 ?? null,
        en_new_sha256: result.newEnSha,
        last_notified_en_sha: result.updatedBaseline.last_notified_en_sha,
        manual_notify: {
          new_en_sha256: result.newEnSha,
          en_diff_summary: `Changed sections: ${result.enDiffSummary.changedSections.join(', ') || 'none'} (current=${result.enDiffSummary.currentChanged}, next=${result.enDiffSummary.nextChanged})`,
        },
        diagnostics: result.diagnostics,
      }
      await writeDraftOutputsAtomic(resolvedOut, {
        '.baseline.json': `${JSON.stringify(result.updatedBaseline, null, 2)}\n`,
        'draft-report.json': `${JSON.stringify(report, null, 2)}\n`,
      })
      write(`[${page.pageId}] manual-notify (${result.newEnSha.slice(0, 12)})\n`)
      return 0
    }

    // 9. Validate candidate source.md via assembleLocalizedPage before staging
    const preprocessAdapter = createLocalizedPreprocessAdapter({
      groupRoot: group.realRoot,
      hasFragmentsDir: group.hasFragmentsDir,
    })
    const assembled = await assembleLocalizedPage({
      pageId: page.pageId,
      sourceMd: result.candidateSourceMd,
      groupVariables: group.variables,
      pageConfig: page.config,
      context: { file: `pages/${page.pageId}/source.md`, page: page.pageId },
      preprocessAdapter,
      mdxAdapter: localizedMdxAdapter,
    })

    if ('errors' in assembled) {
      return await writeBlockedReport(
        'cur-zh-corrupt-or-conflict',
        assembled.errors,
        newEn.provenance.fileSha256,
      )
    }

    // 10. Render PR body & build draft-report.json
    const prBodyInput = buildPrBodyInputFromDraftResult(result, {
      baseCommit: baseEn?.provenance.devCommit,
      newCommit: newEn.provenance.devCommit,
    })
    const prBodyMd = renderPrBody(prBodyInput)

    let unchangedCount = 0
    let modifiedCount = 0
    let addedCount = 0
    let removedCount = 0
    let ambiguousCount = 0
    for (const sec of result.diff.sections) {
      for (const b of sec.blocks) {
        if (b.status === 'unchanged' || b.status === 'zh-only-preserved') unchangedCount += 1
        else if (b.status === 'modified') modifiedCount += 1
        else if (b.status === 'added') addedCount += 1
        else if (b.status === 'removed') removedCount += 1
        else if (b.status === 'ambiguous' || b.status === 'manual-zh-conflict') ambiguousCount += 1
      }
    }

    const report: DraftReportJson = {
      schema_version: 1,
      page_id: page.pageId,
      status: 'drafted',
      lifecycle_state: page.lifecycleState,
      mode: result.isInitialTranslation ? 'initial' : 'incremental',
      en_base_sha256: baseEn?.provenance.fileSha256 ?? null,
      en_new_sha256: newEn.provenance.fileSha256,
      last_notified_en_sha: result.updatedBaseline.last_notified_en_sha,
      diff_summary: {
        unchanged: unchangedCount,
        modified: modifiedCount,
        added: addedCount,
        removed: removedCount,
        ambiguous: ambiguousCount,
      },
      code_blocks: {
        tier1_verbatim: result.codeSyncResults.filter(c => c.action === 'tier1-synced').length,
        tier2_mapped: result.codeSyncResults.filter(c => c.action === 'tier2-mapped').length,
        tier3_conflicts: result.codeSyncResults.filter(c => c.action === 'tier3-conflict').length,
        unchanged: result.codeSyncResults.filter(c => c.action === 'unchanged').length,
      },
      ui_tags: result.uiTagsExtracted.map(t => t.text),
      locale_contract_warnings: result.localeWarnings.map(
        w => `[${w.severity}/${w.type}] ${w.location}: ${w.comment}`,
      ),
      review_todos: result.todos,
      diagnostics: result.diagnostics,
    }

    await writeDraftOutputsAtomic(resolvedOut, {
      'source.md': result.candidateSourceMd,
      '.baseline.json': `${JSON.stringify(result.updatedBaseline, null, 2)}\n`,
      'draft-report.json': `${JSON.stringify(report, null, 2)}\n`,
      'pr-body.md': prBodyMd,
    })

    write(
      `[${page.pageId}] drafted (${report.mode}, units=${result.providerUsed.unitCount}, todos=${result.todos.length})\n`,
    )
    return 0
  } catch (error) {
    writeError(`Draft failed: ${error instanceof Error ? error.message : String(error)}\n`)
    return 1
  }
}
