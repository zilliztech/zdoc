/**
 * Pinned-Git & baseline-manifest handoff routing adapter for localized zh-CN Guides.
 *
 * - Reads `generated/zh-CN/manifests/localized-pages/guides/active.json` and page
 *   receipts safely from a pinned baseline root (rejecting symlinks & traversal).
 * - Inspects available page directories and source blobs strictly from a pinned
 *   40-char `master_sha` via `git ls-tree` / `git cat-file` — NEVER reads dirty
 *   worktree bytes.
 * - Exposes `createLocalizedFetchRoutingContext` keyed strictly by
 *   `(page, normalized page_url)` so Feishu `record_id` changes (`recA -> recB`)
 *   never affect route lookup, active ownership, or fallback matching.
 * - Computes pinned input digests (`source.md`, `page.yaml`, `Variables.json`,
 *   optional `.baseline.json`, and `fragments/**`) at `master_sha` for cache and
 *   change identity.
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { lstatSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { validatePageId } from '../../core/config.ts'
import {
  localizedActiveStatePath,
  localizedReceiptPath,
  validateLocalizedReceipt,
  type LocalizedReceipt,
  type LocalizedReceiptExpectation,
  type LocalizedReceiptSourceFile,
} from '../../core/handoff/receipt.ts'
import {
  createLocalizedRoutingContext,
  normalizeLocalizedPageUrl,
  validateActiveLocalizedRegistry,
  type ActiveLocalizedRegistry,
  type LocalizedFallbackSnapshotRecord,
  type LocalizedRoutingContext,
  type LocalizedRoutingRecord,
} from '../../core/handoff/routing.ts'
import {
  COMMIT_SHA_RE,
  safeHandoffPath,
} from '../../core/handoff/source-state.ts'
import type { PageId } from '../../core/types.ts'

export const LOCALIZED_GUIDES_ROOT = 'localized-docs/zh-CN/guides'
export const LOCALIZED_GUIDES_MANIFEST_DIR = 'generated/zh-CN/manifests/localized-pages/guides'
export const LOCALIZED_GUIDES_BUNDLE_ROOT = 'tmp/docs-tooling/zh-CN/localized-pages/guides'

const LOCALIZED_ZH_GUIDES_LINK_RE =
  /^https:\/\/github\.com\/zilliztech\/zdoc\/tree\/master\/localized-docs\/zh-CN\/guides\/pages\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/

export interface LocalizedPageSnapshotIdentity {
  locale: 'zh-CN'
  group: 'guides'
  page: PageId
  page_url: string
  inputs_sha256: string
  record: string
}

export interface PinnedLocalizedInputDigests {
  master_commit: string
  page: PageId
  source_files: LocalizedReceiptSourceFile[]
  content_sha256: string
}

export interface LocalizedFetchRoutingContext extends LocalizedRoutingContext {
  localizedInputsByPageUrl: Map<string, LocalizedPageSnapshotIdentity>
}

export interface CreateLocalizedFetchRoutingContextInput {
  site?: string
  records: readonly LocalizedRoutingRecord[]
  availablePages?: readonly string[] | ReadonlySet<string>
  repositoryRoot?: string
  masterCommit?: string
  baselineRoot?: string
  active?: ActiveLocalizedRegistry | null
  localizedInputsByPageUrl?: ReadonlyMap<string, LocalizedPageSnapshotIdentity>
  previousSnapshot?: {
    records?: readonly LocalizedFallbackSnapshotRecord[]
  } | null
}

function sha256Bytes(bytes: Buffer | string): string {
  return createHash('sha256').update(bytes).digest('hex')
}

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(item => canonicalJson(item)).join(',')}]`
  }
  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    return `{${keys.map(key => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

export function assertPinnedCommitSha(commit: unknown, label = 'Pinned master commit'): asserts commit is string {
  if (typeof commit !== 'string' || !COMMIT_SHA_RE.test(commit)) {
    throw new Error(`${label} must be a 40-character lowercase hex Git SHA`)
  }
}

export function assertPinnedCommitExists(repositoryRoot: string, commit: string, label = 'Pinned commit'): void {
  assertPinnedCommitSha(commit, label)
  const resolved = resolve(repositoryRoot)
  const type = execFileSync('git', ['-C', resolved, 'cat-file', '-t', `${commit}^{commit}`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
  if (type !== 'commit') {
    throw new Error(`${label} ${commit} does not resolve to a Git commit`)
  }
}

/**
 * Safely reads a regular non-symlink JSON file below `root`.
 */
export function readLocalizedHandoffJson(root: string, relativePath: string): unknown {
  if (!safeHandoffPath(relativePath)) {
    throw new Error(`Unsafe localized handoff path: ${String(relativePath)}`)
  }
  const resolvedRoot = resolve(root)
  if (lstatSync(resolvedRoot).isSymbolicLink()) {
    throw new Error(`Localized handoff root must not be a symlink: ${resolvedRoot}`)
  }
  const target = resolve(resolvedRoot, relativePath)
  if (!target.startsWith(`${resolvedRoot}/`)) {
    throw new Error(`Localized handoff path escapes root: ${relativePath}`)
  }
  let current = resolvedRoot
  for (const segment of relativePath.split('/')) {
    current = join(current, segment)
    const stat = lstatSync(current)
    if (stat.isSymbolicLink()) {
      throw new Error(`Localized handoff path must not use symlinks: ${relativePath}`)
    }
  }
  if (!lstatSync(target).isFile()) {
    throw new Error(`Localized handoff file must be a regular file: ${relativePath}`)
  }
  return JSON.parse(readFileSync(target, 'utf8'))
}

/**
 * Reads and validates `generated/zh-CN/manifests/localized-pages/guides/active.json`
 * from a pinned baseline root. Returns `null` when absent; throws on symlinks or
 * corrupt/invalid JSON.
 */
export function readLocalizedActiveState(baselineRoot: string): ActiveLocalizedRegistry | null {
  const relativePath = localizedActiveStatePath('zh-CN', 'guides')
  const resolvedRoot = resolve(baselineRoot)
  if (lstatSync(resolvedRoot).isSymbolicLink()) {
    throw new Error(`Localized baseline root must not be a symlink: ${resolvedRoot}`)
  }
  let current = resolvedRoot
  for (const segment of relativePath.split('/')) {
    current = join(current, segment)
    try {
      if (lstatSync(current).isSymbolicLink()) {
        throw new Error(`Localized active state path must not use symlinks: ${relativePath}`)
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null
      }
      throw error
    }
  }
  return validateActiveLocalizedRegistry(readLocalizedHandoffJson(resolvedRoot, relativePath))
}

/**
 * Reads and strictly validates a localized zh-CN Guides page receipt from a
 * pinned baseline or workspace root.
 */
export function readLocalizedReceipt(
  root: string,
  expected: LocalizedReceiptExpectation & { page: PageId },
): LocalizedReceipt {
  const receiptRel = localizedReceiptPath(expected.locale ?? 'zh-CN', expected.group ?? 'guides', expected.page)
  const raw = readLocalizedHandoffJson(root, receiptRel)
  return validateLocalizedReceipt(raw, {
    locale: expected.locale ?? 'zh-CN',
    group: expected.group ?? 'guides',
    page: expected.page,
    ...(expected.page_url !== undefined ? { page_url: expected.page_url } : {}),
  })
}

interface GitTreeEntry {
  mode: string
  type: string
  oid: string
  path: string
}

function listGitTree(repositoryRoot: string, commit: string, treePath: string, recursive = false): GitTreeEntry[] {
  assertPinnedCommitSha(commit)
  const resolvedRoot = resolve(repositoryRoot)
  const args = ['-C', resolvedRoot, 'ls-tree', ...(recursive ? ['-r'] : []), '-z', commit, '--', treePath]
  let raw: Buffer
  try {
    raw = execFileSync('git', args, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 })
  } catch {
    return []
  }
  const entries: GitTreeEntry[] = []
  for (const record of raw.toString('utf8').split('\0')) {
    if (!record) continue
    const tab = record.indexOf('\t')
    if (tab < 0) continue
    const meta = record.slice(0, tab).split(' ')
    const entryPath = record.slice(tab + 1)
    if (meta.length < 3 || !entryPath) continue
    entries.push({ mode: meta[0], type: meta[1], oid: meta[2], path: entryPath })
  }
  return entries
}

export function readPinnedGitBlob(repositoryRoot: string, commit: string, repoRelativePath: string): Buffer {
  assertPinnedCommitSha(commit)
  if (!safeHandoffPath(repoRelativePath)) {
    throw new Error(`Unsafe Git path: ${repoRelativePath}`)
  }
  const entries = listGitTree(repositoryRoot, commit, repoRelativePath, false)
  const match = entries.find(entry => entry.path === repoRelativePath)
  if (!match) {
    throw Object.assign(
      new Error(`Pinned file not found at ${commit}: ${repoRelativePath}`),
      { code: 'OWNERSHIP_CONFIG_MISSING', path: repoRelativePath },
    )
  }
  if (match.mode === '120000' || match.type !== 'blob') {
    throw Object.assign(
      new Error(`Pinned path must be a regular non-symlink file at ${commit}: ${repoRelativePath} (mode=${match.mode}, type=${match.type})`),
      { code: 'OWNERSHIP_CONFIG_MISSING', path: repoRelativePath },
    )
  }
  return execFileSync('git', ['-C', resolve(repositoryRoot), 'cat-file', 'blob', match.oid], {
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 32 * 1024 * 1024,
  })
}

/**
 * Lists every valid regular page directory directly under
 * `localized-docs/zh-CN/guides/pages/` in the exact pinned `masterCommit` tree.
 * Never reads the working tree and rejects symlink entries (`120000`).
 */
export function listPinnedLocalizedPages(repositoryRoot: string, masterCommit: string): string[] {
  assertPinnedCommitSha(masterCommit)
  const prefix = `${LOCALIZED_GUIDES_ROOT}/pages/`
  const entries = listGitTree(repositoryRoot, masterCommit, `${LOCALIZED_GUIDES_ROOT}/pages/`, false)
  const pages: string[] = []
  for (const entry of entries) {
    if (entry.type !== 'tree' || entry.mode !== '040000') continue
    if (!entry.path.startsWith(prefix)) continue
    const page = entry.path.slice(prefix.length)
    if (page.includes('/')) continue
    const idCheck = validatePageId(page)
    if ('errors' in idCheck) continue
    pages.push(page)
  }
  return pages.sort((a, b) => a.localeCompare(b, 'en'))
}

/**
 * Only the exact pinned `masterCommit` Git tree proves a localized page directory
 * exists; dirty working-tree directories and symlinked entries are never accepted.
 */
export function pinnedLocalizedPages(
  repositoryRoot: string,
  masterCommit: string,
  links?: readonly string[],
): string[] {
  assertPinnedCommitSha(masterCommit)
  if (!links) {
    return listPinnedLocalizedPages(repositoryRoot, masterCommit)
  }
  const available = new Set<string>()
  for (const link of links) {
    if (typeof link !== 'string') continue
    const match = LOCALIZED_ZH_GUIDES_LINK_RE.exec(link)
    if (!match) continue
    const page = match[1]
    const idCheck = validatePageId(page)
    if ('errors' in idCheck) continue
    const pageTreePath = `${LOCALIZED_GUIDES_ROOT}/pages/${page}`
    const entries = listGitTree(repositoryRoot, masterCommit, pageTreePath, false)
    if (entries.some(entry => entry.path === pageTreePath && entry.type === 'tree' && entry.mode === '040000')) {
      available.add(page)
    }
  }
  return [...available].sort((a, b) => a.localeCompare(b, 'en'))
}

/**
 * Computes exact SHA-256 digests of all pinned Git inputs for a localized Chinese
 * Guides page (`Variables.json`, `pages/<page>/page.yaml`, `pages/<page>/source.md`,
 * optional `pages/<page>/.baseline.json`, and all regular files under `fragments/**`)
 * strictly from `masterCommit`.
 */
export function computePinnedLocalizedInputDigests(
  repositoryRoot: string,
  masterCommit: string,
  page: PageId,
): PinnedLocalizedInputDigests {
  assertPinnedCommitSha(masterCommit)
  const idCheck = validatePageId(page)
  if ('errors' in idCheck) {
    throw Object.assign(new Error(idCheck.errors[0].message), { code: 'OWNERSHIP_CONFIG_MISSING' })
  }

  const requiredPaths = [
    `${LOCALIZED_GUIDES_ROOT}/Variables.json`,
    `${LOCALIZED_GUIDES_ROOT}/pages/${page}/page.yaml`,
    `${LOCALIZED_GUIDES_ROOT}/pages/${page}/source.md`,
  ]

  const fileMap = new Map<string, string>()

  for (const relPath of requiredPaths) {
    const bytes = readPinnedGitBlob(repositoryRoot, masterCommit, relPath)
    fileMap.set(relPath, sha256Bytes(bytes))
  }

  const baselineRelPath = `${LOCALIZED_GUIDES_ROOT}/pages/${page}/.baseline.json`
  const baselineEntries = listGitTree(repositoryRoot, masterCommit, baselineRelPath, false)
  if (baselineEntries.some(entry => entry.path === baselineRelPath)) {
    const bytes = readPinnedGitBlob(repositoryRoot, masterCommit, baselineRelPath)
    fileMap.set(baselineRelPath, sha256Bytes(bytes))
  }

  const fragmentsPrefix = `${LOCALIZED_GUIDES_ROOT}/fragments`
  const fragmentEntries = listGitTree(repositoryRoot, masterCommit, fragmentsPrefix, true)
  for (const entry of fragmentEntries) {
    if (entry.mode === '120000') {
      throw Object.assign(
        new Error(`Symbolic link is forbidden inside pinned fragments/: ${entry.path}`),
        { code: 'OWNERSHIP_CONFIG_MISSING', path: entry.path },
      )
    }
    if (entry.type !== 'blob') continue
    if (!safeHandoffPath(entry.path)) {
      throw Object.assign(new Error(`Unsafe pinned fragment path: ${entry.path}`), { code: 'OWNERSHIP_CONFIG_MISSING' })
    }
    const bytes = execFileSync('git', ['-C', resolve(repositoryRoot), 'cat-file', 'blob', entry.oid], {
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 32 * 1024 * 1024,
    })
    fileMap.set(entry.path, sha256Bytes(bytes))
  }

  const sourceFiles: LocalizedReceiptSourceFile[] = [...fileMap.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([filePath, sha256]) => ({ path: filePath, sha256 }))

  const contentSha256 = sha256Bytes(canonicalJson({
    locale: 'zh-CN',
    group: 'guides',
    page,
    source_files: sourceFiles,
  }))

  return {
    master_commit: masterCommit,
    page,
    source_files: sourceFiles,
    content_sha256: contentSha256,
  }
}

/**
 * Computes a deterministic cache/change identity hash combining pinned Git inputs,
 * navigation metadata, channel, image base URL, and optional Promote target SHA.
 */
export function computeLocalizedCacheIdentity(input: {
  page: PageId
  pageUrl: string
  sourceFiles: readonly LocalizedReceiptSourceFile[]
  navigationDigest: string
  channel: null | 'next' | 'retire-in-next'
  imageBaseUrl: string
  promoteExpectedEnNextSha?: string | null
}): LocalizedPageSnapshotIdentity {
  const normalizedUrl = normalizeLocalizedPageUrl(input.pageUrl)
  const sortedSourceFiles = [...input.sourceFiles].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
  const inputsSha256 = sha256Bytes(canonicalJson({
    schema_version: 1,
    locale: 'zh-CN',
    group: 'guides',
    page: input.page,
    page_url: normalizedUrl,
    source_files: sortedSourceFiles,
    navigation_digest: input.navigationDigest,
    channel: input.channel,
    image_base_url: input.imageBaseUrl,
    promote_expected_en_next_sha: input.promoteExpectedEnNextSha ?? null,
  }))
  return {
    locale: 'zh-CN',
    group: 'guides',
    page: input.page,
    page_url: normalizedUrl,
    inputs_sha256: inputsSha256,
    record: localizedReceiptPath('zh-CN', 'guides', input.page),
  }
}

/**
 * Builds the localized Fetch routing context keyed strictly by `(page, normalized page_url)`.
 * Completely immune to Feishu Base `record_id` changes (`recA -> recB`).
 */
export function createLocalizedFetchRoutingContext(
  input: CreateLocalizedFetchRoutingContextInput,
): LocalizedFetchRoutingContext {
  const site = input.site ?? 'zh-CN'
  let availablePages: readonly string[] | ReadonlySet<string> | undefined = input.availablePages
  if (availablePages === undefined && input.repositoryRoot && input.masterCommit) {
    const links = input.records.map(record => record.doc_link).filter(Boolean)
    availablePages = pinnedLocalizedPages(input.repositoryRoot, input.masterCommit, links)
  }

  const active =
    input.active !== undefined
      ? input.active
      : input.baselineRoot
        ? readLocalizedActiveState(input.baselineRoot)
        : null

  const base = createLocalizedRoutingContext({
    site,
    records: input.records,
    availablePages,
    active,
    previousSnapshot: input.previousSnapshot,
  })

  const localizedInputsByPageUrl = new Map<string, LocalizedPageSnapshotIdentity>()
  if (input.localizedInputsByPageUrl) {
    for (const [rawUrl, identity] of input.localizedInputsByPageUrl) {
      const normalizedUrl = normalizeLocalizedPageUrl(rawUrl)
      const route = base.routesByPageUrl.get(normalizedUrl)
      if (route?.kind === 'localized-page') {
        if (identity.page !== route.page || normalizeLocalizedPageUrl(identity.page_url) !== normalizedUrl) {
          throw new Error(`Localized input route mismatch for page_url "${normalizedUrl}"`)
        }
        localizedInputsByPageUrl.set(normalizedUrl, { ...identity, page_url: normalizedUrl })
      }
    }
  }

  return {
    ...base,
    localizedInputsByPageUrl,
  }
}
