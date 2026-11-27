/**
 * Pinned-Git page build & receipt generation adapter for localized zh-CN Guides Fetch.
 *
 * - Reads `localized-docs/zh-CN/guides/{Variables.json, fragments/, pages/<page>/{page.yaml, source.md, .baseline.json}}`
 *   strictly from the pinned `masterCommit` via Git object commands into an isolated
 *   temporary directory (NEVER reads dirty worktree bytes!).
 * - Optionally applies `promoteLocalizedSource` when a Promote candidate is checked,
 *   failing closed with `PROMOTE_EN_MISMATCH` if EN NEXT shifted.
 * - Calls ZH-WP1 `assembleLocalizedPage` (`@zilliz/mdtomd` + MDX validation), injecting
 *   current Chinese Base navigation front matter and required Docusaurus component imports.
 * - Enforces strict `content/zh-CN/guides/...` path isolation via `validateLocalizedReceipt`
 *   and `isAllowedLocalizedGuidesOutputPath`.
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { assembleLocalizedPage } from '../../core/assemble.ts'
import { parseBaselineJson } from '../../core/baseline.ts'
import { parseLocalizedPageConfig, parseLocalizedVariables, validatePageId } from '../../core/config.ts'
import {
  promoteLocalizedSource,
  type PromoteLocalizedSummary,
} from '../../core/handoff/promote.ts'
import {
  isAllowedLocalizedGuidesOutputPath,
  validateLocalizedReceipt,
  type LocalizedReceipt,
  type LocalizedReceiptImage,
  type LocalizedReceiptSourceFile,
} from '../../core/handoff/receipt.ts'
import { normalizeLocalizedPageUrl } from '../../core/handoff/routing.ts'
import { COMMIT_SHA_RE, safeHandoffPath } from '../../core/handoff/source-state.ts'
import type {
  AssembleMetadata,
  BaselineJson,
  LocalizedDocsError,
  PageConfig,
  PageId,
  ReleaseChannel,
  UiTagMatch,
  Variables,
} from '../../core/types.ts'
import { createLocalizedPreprocessAdapter } from '../md2md.ts'
import { localizedMdxAdapter } from '../mdx.ts'
import {
  assertPinnedCommitSha,
  canonicalJson,
  LOCALIZED_GUIDES_ROOT,
  readPinnedGitBlob,
} from './routing.ts'

export interface LocalizedPromoteOption {
  expectedEnNextSha: string
  /** Optional override; defaults to `.baseline.json` `en_baseline.channels.next_sha256`. */
  baselineEnNextSha?: string
  authoredChannelBlockIds?: readonly string[]
}

export interface BuildLocalizedFetchPageInput {
  repositoryRoot: string
  masterCommit: string
  devCommit: string
  page: PageId
  pageUrl: string
  fetchRunId: string
  channel?: ReleaseChannel
  navigation?: Omit<AssembleMetadata, 'channel'>
  imageBaseUrl?: string
  images?: readonly LocalizedReceiptImage[]
  /** Optional reference-only Feishu Base record ID; never used as primary key. */
  referenceRecordId?: string | null
  outputExtension?: '.md' | '.mdx'
  promote?: LocalizedPromoteOption | null
}

export interface BuildLocalizedFetchPageSuccess {
  ok: true
  page: PageId
  pageUrl: string
  outputPath: string
  mdx: string
  outputSha256: string
  receipt: LocalizedReceipt
  navigationDigest: string
  sourceFiles: LocalizedReceiptSourceFile[]
  components: string[]
  uiTags: UiTagMatch[]
  engine: { name: string; version: string }
  promoted: PromoteLocalizedSummary | null
}

export interface BuildLocalizedFetchPageFailure {
  ok: false
  code: string
  message: string
  page: PageId
  pageUrl: string
  errors: LocalizedDocsError[]
}

export type BuildLocalizedFetchPageResult =
  | BuildLocalizedFetchPageSuccess
  | BuildLocalizedFetchPageFailure

export const DEFAULT_ZH_CN_IMAGE_BASE_URL = 'https://zdoc-images.zilliz.com.cn'

function sha256Bytes(bytes: Buffer | string): string {
  return createHash('sha256').update(bytes).digest('hex')
}

/**
 * Maps a normalized Chinese Guides `page_url` to its repository-relative output path
 * strictly inside `content/zh-CN/guides/`, rejecting Guides home, `tutorials/tools/`,
 * English, Japanese, Reference, and traversal paths.
 */
export function resolveLocalizedGuidesOutputPath(
  pageUrl: string,
  extension: '.md' | '.mdx' = '.md',
): string {
  if (extension !== '.md' && extension !== '.mdx') {
    throw Object.assign(
      new Error(`Unsupported localized output extension "${String(extension)}"; expected ".md" or ".mdx"`),
      { code: 'OWNERSHIP_PATH_MISMATCH' },
    )
  }
  const normalizedUrl = normalizeLocalizedPageUrl(pageUrl)
  const outputPath = `content/zh-CN/guides/${normalizedUrl}${extension}`
  if (!isAllowedLocalizedGuidesOutputPath(outputPath)) {
    throw Object.assign(
      new Error(`Localized output path "${outputPath}" violates zh-CN Guides path isolation`),
      { code: 'OWNERSHIP_PATH_MISMATCH', path: outputPath },
    )
  }
  // Explicitly guard nested Guides home landing (`content/zh-CN/guides/tutorials/home.md(x)`),
  // which is externally owned by Translation and never written by localized Guides Fetch.
  if (
    outputPath === 'content/zh-CN/guides/tutorials/home.md' ||
    outputPath === 'content/zh-CN/guides/tutorials/home.mdx'
  ) {
    throw Object.assign(
      new Error(`Localized output path "${outputPath}" targets externally owned Chinese Guides home`),
      { code: 'OWNERSHIP_PATH_MISMATCH', path: outputPath },
    )
  }
  return outputPath
}

/**
 * Computes the deterministic navigation digest recorded in `LocalizedReceipt.inputs.navigation_digest`.
 */
export function computeLocalizedNavigationDigest(input: {
  pageUrl: string
  channel: ReleaseChannel
  navigation?: Omit<AssembleMetadata, 'channel'>
}): string {
  const normalizedUrl = normalizeLocalizedPageUrl(input.pageUrl)
  const nav = input.navigation ?? {}
  return sha256Bytes(canonicalJson({
    page_url: normalizedUrl,
    channel: input.channel,
    title: nav.title ?? null,
    description: nav.description ?? null,
    slug: nav.slug ?? null,
    sidebar_label: nav.sidebar_label ?? null,
    sidebar_position: nav.sidebar_position ?? null,
    beta: nav.beta ?? null,
    added_since: nav.added_since ?? null,
    last_modified: nav.last_modified ?? null,
    deprecate_since: nav.deprecate_since ?? null,
    notebook: nav.notebook ?? null,
    custom_edit_url: nav.custom_edit_url ?? null,
    displayed_sidebar: nav.displayed_sidebar ?? null,
    type: nav.type ?? null,
    title_suffix: nav.title_suffix ?? null,
    keywords: nav.keywords ?? null,
    token: nav.token ?? null,
  }))
}

interface ExtractedPinnedTree {
  tempRoot: string
  groupRoot: string
  hasFragmentsDir: boolean
  variables: Variables
  pageConfig: PageConfig
  sourceMdText: string
  baseline: BaselineJson | null
  sourceFiles: LocalizedReceiptSourceFile[]
  cleanup(): void
}

function listPinnedFragmentEntries(
  repositoryRoot: string,
  masterCommit: string,
): { path: string; oid: string; mode: string; type: string }[] {
  const fragmentsPrefix = `${LOCALIZED_GUIDES_ROOT}/fragments`
  let raw: Buffer
  try {
    raw = execFileSync(
      'git',
      ['-C', resolve(repositoryRoot), 'ls-tree', '-r', '-z', masterCommit, '--', fragmentsPrefix],
      { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 },
    )
  } catch {
    return []
  }
  const results: { path: string; oid: string; mode: string; type: string }[] = []
  for (const record of raw.toString('utf8').split('\0')) {
    if (!record) continue
    const tab = record.indexOf('\t')
    if (tab < 0) continue
    const meta = record.slice(0, tab).split(' ')
    const entryPath = record.slice(tab + 1)
    if (meta.length < 3 || !entryPath) continue
    results.push({ mode: meta[0], type: meta[1], oid: meta[2], path: entryPath })
  }
  return results
}

/**
 * Materializes ONLY the exact pinned `masterCommit` blobs for a single page into a
 * fresh isolated temp directory so `@zilliz/mdtomd` never sees dirty worktree bytes.
 */
function extractPinnedLocalizedPageTree(
  repositoryRoot: string,
  masterCommit: string,
  page: PageId,
): ExtractedPinnedTree {
  assertPinnedCommitSha(masterCommit)
  const idCheck = validatePageId(page)
  if ('errors' in idCheck) {
    throw Object.assign(new Error(idCheck.errors[0].message), {
      code: 'OWNERSHIP_CONFIG_MISSING',
      errors: idCheck.errors,
    })
  }

  const variablesRel = `${LOCALIZED_GUIDES_ROOT}/Variables.json`
  const pageYamlRel = `${LOCALIZED_GUIDES_ROOT}/pages/${page}/page.yaml`
  const sourceMdRel = `${LOCALIZED_GUIDES_ROOT}/pages/${page}/source.md`
  const baselineRel = `${LOCALIZED_GUIDES_ROOT}/pages/${page}/.baseline.json`

  const variablesBytes = readPinnedGitBlob(repositoryRoot, masterCommit, variablesRel)
  const pageYamlBytes = readPinnedGitBlob(repositoryRoot, masterCommit, pageYamlRel)
  const sourceMdBytes = readPinnedGitBlob(repositoryRoot, masterCommit, sourceMdRel)

  const parsedVars = parseLocalizedVariables(variablesBytes.toString('utf8'), { file: variablesRel, page })
  if ('errors' in parsedVars) {
    throw Object.assign(
      new Error(`Invalid pinned Variables.json: ${parsedVars.errors[0].message}`),
      { code: 'LOCALIZED_BUILD_FAILED', errors: parsedVars.errors },
    )
  }

  const parsedConfig = parseLocalizedPageConfig(page, pageYamlBytes.toString('utf8'), {
    file: pageYamlRel,
    page,
  })
  if ('errors' in parsedConfig) {
    throw Object.assign(
      new Error(`Invalid pinned page.yaml for "${page}": ${parsedConfig.errors[0].message}`),
      { code: 'OWNERSHIP_CONFIG_MISSING', errors: parsedConfig.errors },
    )
  }

  const sourceFiles: LocalizedReceiptSourceFile[] = [
    { path: variablesRel, sha256: sha256Bytes(variablesBytes) },
    { path: pageYamlRel, sha256: sha256Bytes(pageYamlBytes) },
    { path: sourceMdRel, sha256: sha256Bytes(sourceMdBytes) },
  ]

  let baseline: BaselineJson | null = null
  try {
    const baselineBytes = readPinnedGitBlob(repositoryRoot, masterCommit, baselineRel)
    const parsedBaseline = parseBaselineJson(baselineBytes.toString('utf8'), { file: baselineRel, page })
    if ('errors' in parsedBaseline) {
      throw Object.assign(
        new Error(`Invalid pinned .baseline.json for "${page}": ${parsedBaseline.errors[0].message}`),
        { code: 'LOCALIZED_BUILD_FAILED', errors: parsedBaseline.errors },
      )
    }
    baseline = parsedBaseline.baseline
    sourceFiles.push({ path: baselineRel, sha256: sha256Bytes(baselineBytes) })
  } catch (error) {
    const err = error as { code?: string; path?: string }
    if (err.code !== 'OWNERSHIP_CONFIG_MISSING' || err.path !== baselineRel) {
      throw error
    }
  }

  const tempRoot = mkdtempSync(join(tmpdir(), `localized-fetch-${page}-`))
  const groupRoot = join(tempRoot, 'group')
  mkdirSync(join(groupRoot, 'pages', page), { recursive: true })

  let hasFragmentsDir = false
  try {
    writeFileSync(join(groupRoot, 'Variables.json'), variablesBytes)
    writeFileSync(join(groupRoot, 'pages', page, 'page.yaml'), pageYamlBytes)
    writeFileSync(join(groupRoot, 'pages', page, 'source.md'), sourceMdBytes)

    const fragmentEntries = listPinnedFragmentEntries(repositoryRoot, masterCommit)
    const fragmentsPrefix = `${LOCALIZED_GUIDES_ROOT}/fragments/`
    for (const entry of fragmentEntries) {
      if (entry.mode === '120000') {
        throw Object.assign(
          new Error(`Symbolic link is forbidden inside pinned fragments/: ${entry.path}`),
          { code: 'OWNERSHIP_CONFIG_MISSING' },
        )
      }
      if (entry.type !== 'blob') continue
      if (!safeHandoffPath(entry.path) || !entry.path.startsWith(fragmentsPrefix)) {
        throw Object.assign(
          new Error(`Unsafe pinned fragment path: ${entry.path}`),
          { code: 'OWNERSHIP_CONFIG_MISSING' },
        )
      }
      const fragBytes = execFileSync(
        'git',
        ['-C', resolve(repositoryRoot), 'cat-file', 'blob', entry.oid],
        { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 32 * 1024 * 1024 },
      )
      const relInsideGroup = entry.path.slice(`${LOCALIZED_GUIDES_ROOT}/`.length)
      const targetFile = join(groupRoot, relInsideGroup)
      mkdirSync(dirname(targetFile), { recursive: true })
      writeFileSync(targetFile, fragBytes)
      sourceFiles.push({ path: entry.path, sha256: sha256Bytes(fragBytes) })
      hasFragmentsDir = true
    }

    sourceFiles.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))

    return {
      tempRoot,
      groupRoot,
      hasFragmentsDir,
      variables: parsedVars.variables,
      pageConfig: parsedConfig.config,
      sourceMdText: sourceMdBytes.toString('utf8'),
      baseline,
      sourceFiles,
      cleanup() {
        rmSync(tempRoot, { recursive: true, force: true })
      },
    }
  } catch (error) {
    rmSync(tempRoot, { recursive: true, force: true })
    throw error
  }
}

/**
 * Builds one localized Chinese Guides page strictly from pinned `masterCommit`,
 * validates its assembled MDX, constructs and strictly validates `LocalizedReceipt`.
 */
export async function buildLocalizedFetchPage(
  input: BuildLocalizedFetchPageInput,
): Promise<BuildLocalizedFetchPageResult> {
  const channel: ReleaseChannel = input.channel ?? 'current'
  const imageBaseUrl = input.imageBaseUrl ?? DEFAULT_ZH_CN_IMAGE_BASE_URL
  let normalizedUrl: string
  let outputPath: string
  try {
    normalizedUrl = normalizeLocalizedPageUrl(input.pageUrl)
    outputPath = resolveLocalizedGuidesOutputPath(normalizedUrl, input.outputExtension ?? '.md')
  } catch (error) {
    const err = error as Error & { code?: string }
    return {
      ok: false,
      code: err.code ?? 'OWNERSHIP_PATH_MISMATCH',
      message: err.message,
      page: input.page,
      pageUrl: String(input.pageUrl ?? ''),
      errors: [{ code: err.code ?? 'OWNERSHIP_PATH_MISMATCH', message: err.message, page: input.page }],
    }
  }

  if (typeof input.devCommit !== 'string' || !COMMIT_SHA_RE.test(input.devCommit)) {
    const message = 'devCommit must be a 40-character lowercase hex Git SHA'
    return {
      ok: false,
      code: 'LOCALIZED_BUILD_FAILED',
      message,
      page: input.page,
      pageUrl: normalizedUrl,
      errors: [{ code: 'LOCALIZED_BUILD_FAILED', message, page: input.page }],
    }
  }

  let extracted: ExtractedPinnedTree | null = null
  try {
    extracted = extractPinnedLocalizedPageTree(input.repositoryRoot, input.masterCommit, input.page)

    let effectiveSourceMd = extracted.sourceMdText
    let promotedSummary: PromoteLocalizedSummary | null = null

    if (input.promote) {
      const baselineEnNextSha =
        input.promote.baselineEnNextSha ?? extracted.baseline?.en_baseline.channels.next_sha256 ?? ''
      const promoteResult = promoteLocalizedSource({
        sourceMarkdown: extracted.sourceMdText,
        expectedEnNextSha: input.promote.expectedEnNextSha,
        baselineEnNextSha,
        authoredChannelBlockIds: input.promote.authoredChannelBlockIds,
        context: {
          file: `${LOCALIZED_GUIDES_ROOT}/pages/${input.page}/source.md`,
          page: input.page,
        },
      })
      if (!promoteResult.ok && 'code' in promoteResult) {
        return {
          ok: false,
          code: promoteResult.code,
          message: promoteResult.errors[0]?.message ?? `Promote failed with ${promoteResult.code}`,
          page: input.page,
          pageUrl: normalizedUrl,
          errors: promoteResult.errors,
        }
      }
      if ('promotedMarkdown' in promoteResult) {
        effectiveSourceMd = promoteResult.promotedMarkdown
        promotedSummary = promoteResult.summary
      }
    }

    const navigation = input.navigation ?? {}
    const slugSegment = normalizedUrl.split('/').at(-1) ?? input.page
    const metadata: AssembleMetadata = {
      ...navigation,
      slug: navigation.slug ?? `/${slugSegment}`,
      token: navigation.token ?? `zh-${input.page}`,
      custom_edit_url:
        navigation.custom_edit_url ??
        `https://github.com/zilliztech/zdoc/edit/master/${LOCALIZED_GUIDES_ROOT}/pages/${input.page}/source.md`,
      channel,
    }

    const preprocessAdapter = createLocalizedPreprocessAdapter({
      groupRoot: extracted.groupRoot,
      hasFragmentsDir: extracted.hasFragmentsDir,
    })

    const assembled = await assembleLocalizedPage({
      pageId: input.page,
      sourceMd: effectiveSourceMd,
      groupVariables: extracted.variables,
      pageConfig: extracted.pageConfig,
      metadata,
      context: {
        file: `${LOCALIZED_GUIDES_ROOT}/pages/${input.page}/source.md`,
        page: input.page,
      },
      preprocessAdapter,
      mdxAdapter: localizedMdxAdapter,
    })

    if ('errors' in assembled) {
      return {
        ok: false,
        code: assembled.errors[0]?.code ?? 'LOCALIZED_BUILD_FAILED',
        message: assembled.errors.map(e => `${e.code}: ${e.message}`).join('; '),
        page: input.page,
        pageUrl: normalizedUrl,
        errors: assembled.errors,
      }
    }

    const navigationDigest = computeLocalizedNavigationDigest({
      pageUrl: normalizedUrl,
      channel,
      navigation,
    })
    const outputSha256 = sha256Bytes(assembled.mdx)
    const images = [...(input.images ?? [])].sort((a, b) => a.source.localeCompare(b.source))

    const receiptDraft: LocalizedReceipt = {
      schema_version: 1,
      locale: 'zh-CN',
      group: 'guides',
      page: input.page,
      page_url: normalizedUrl,
      inputs: {
        master_commit: input.masterCommit,
        dev_commit: input.devCommit,
        source_files: extracted.sourceFiles,
        md2md_version: assembled.engine.version,
        navigation_digest: navigationDigest,
        image_base_url: imageBaseUrl,
        images,
      },
      output: {
        path: outputPath,
        sha256: outputSha256,
      },
      channel: channel === 'current' ? null : channel,
      fetch_run_id: input.fetchRunId,
      ...(input.referenceRecordId !== undefined && input.referenceRecordId !== null
        ? { reference_record_id: input.referenceRecordId }
        : {}),
    }

    const validatedReceipt = validateLocalizedReceipt(receiptDraft, {
      locale: 'zh-CN',
      group: 'guides',
      page: input.page,
      page_url: normalizedUrl,
    })

    return {
      ok: true,
      page: input.page,
      pageUrl: normalizedUrl,
      outputPath,
      mdx: assembled.mdx,
      outputSha256,
      receipt: validatedReceipt,
      navigationDigest,
      sourceFiles: extracted.sourceFiles,
      components: assembled.components,
      uiTags: assembled.uiTags,
      engine: assembled.engine,
      promoted: promotedSummary,
    }
  } catch (error) {
    const err = error as Error & { code?: string; errors?: LocalizedDocsError[] }
    const code = err.code ?? 'LOCALIZED_BUILD_FAILED'
    return {
      ok: false,
      code,
      message: err.message,
      page: input.page,
      pageUrl: normalizedUrl,
      errors: err.errors ?? [{ code, message: err.message, page: input.page }],
    }
  } finally {
    extracted?.cleanup()
  }
}
