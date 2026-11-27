import { execFile } from 'node:child_process'
import { lstat, mkdir, mkdtemp, readFile, realpath, rename, rm, rmdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { promisify } from 'node:util'
import { sharedReceiptPath, validateSharedReceipt } from '../../shared-docs/core/handoff/source-state.ts'
import { isCommit } from '../../shared-docs/core/yaml.ts'
import { loadLocalizedContractSupport } from '../adapters/contract.ts'
import { readVerifiedEnSnapshot } from '../adapters/en-reader.ts'
import {
  pathsOverlap,
  readLocalizedGroup,
  validateOutputDirectoryState,
  withinPath,
} from '../adapters/fs-reader.ts'
import {
  createGitHubCliPrAdapter,
  type GitHubPrAdapter,
} from '../adapters/github-pr.ts'
import { createDraftLlmProvider } from '../adapters/llm.ts'
import { createLocalizedPreprocessAdapter } from '../adapters/md2md.ts'
import { localizedMdxAdapter } from '../adapters/mdx.ts'
import { assembleLocalizedPage } from '../core/assemble.ts'
import { parseBaselineJson, validateBaselineConsistency } from '../core/baseline.ts'
import { validatePageId } from '../core/config.ts'
import {
  executeDraftEngine,
  type DraftLlmProvider,
  type VerifiedEnSnapshot,
} from '../core/draft.ts'
import {
  buildPrBodyInputFromDraftResult,
  renderPrBody,
} from '../core/pr-body.ts'
import {
  appendScheduleMetaToPrBody,
  parseDeferredReviewDate,
  parseSchedulePrMeta,
  planPageSchedule,
  renderDailyDigestCardNote,
  renderDeferredDualDiffSection,
  TRANSLATION_PR_LABEL,
  translationBranchName,
  type ActivePrState,
  type ScheduleRunSummary,
} from '../core/schedule.ts'
import { computeChannelDigests } from '../core/sections.ts'
import { stripEnShell } from '../core/strip-en.ts'
import type {
  BaselineJson,
  LocalizedDocsError,
  ManualId,
} from '../core/types.ts'
import { formatDiagnostic, localizedError, sha256Hex } from '../core/types.ts'

const execFileAsync = promisify(execFile)

const ISO_TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
const DEFAULT_VALIDATION_WORKFLOW = 'localized-docs-validate.yml'

export interface ScheduleOptions {
  root: string
  devRoot?: string
  enBaseRoot?: string
  devGitDir?: string
  page?: string
  dryRun?: boolean
  alwaysNotify?: boolean
  provider?: string
  out?: string
  repo?: string
  baseBranch?: string
  devCommit?: string
  manualStateFile?: string
  updateManualBaselines?: boolean
  styleGuide?: string
  localeContractRoot?: string
  now?: string
  validationWorkflow?: string
  dispatchValidate?: boolean
}

export interface HistoricalEnReadRequest {
  manual: ManualId
  sharedPage: string
  devCommit: string
  enPath: string
  manifestPath: string
}

export interface ScheduleCommandDeps {
  write?: (text: string) => void
  writeError?: (text: string) => void
  repositoryRoot?: string
  llmProvider?: DraftLlmProvider
  githubAdapter?: GitHubPrAdapter
  enSnapshotReader?: (
    request: HistoricalEnReadRequest,
  ) => Promise<{ snapshot: VerifiedEnSnapshot } | { errors: LocalizedDocsError[] }>
  now?: () => Date
}

export interface ScheduleSummaryFile extends ScheduleRunSummary {
  should_notify: boolean
  digest_counts: {
    prs: number
    deferred: number
    manual: number
    blocked: number
    totalActionable: number
  }
}

interface ManualNotificationStateFile {
  schema_version: 1
  notified: Record<string, string>
}

function readFlagValue(argv: readonly string[], index: number, flag: string): string {
  const value = argv[index + 1]
  if (value === undefined || value.length === 0 || value.startsWith('--')) {
    throw new Error(`${flag} requires a non-empty value`)
  }
  return value
}

export function parseScheduleArgs(argv: string[]): ScheduleOptions {
  let root: string | undefined
  let devRoot: string | undefined
  let enBaseRoot: string | undefined
  let devGitDir: string | undefined
  let page: string | undefined
  let dryRun = false
  let alwaysNotify = false
  let provider: string | undefined
  let out: string | undefined
  let repo: string | undefined
  let baseBranch: string | undefined
  let devCommit: string | undefined
  let manualStateFile: string | undefined
  let updateManualBaselines = false
  let styleGuide: string | undefined
  let localeContractRoot: string | undefined
  let now: string | undefined
  let validationWorkflow: string | undefined
  let dispatchValidate = true

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`)
    }
    switch (arg) {
      case '--root':
        if (root !== undefined) throw new Error('Duplicate option: --root')
        root = readFlagValue(argv, i, '--root')
        i += 1
        break
      case '--dev-root':
      case '--en-root':
        if (devRoot !== undefined) throw new Error(`Duplicate option: ${arg}`)
        devRoot = readFlagValue(argv, i, arg)
        i += 1
        break
      case '--en-base-root':
        if (enBaseRoot !== undefined) throw new Error('Duplicate option: --en-base-root')
        enBaseRoot = readFlagValue(argv, i, '--en-base-root')
        i += 1
        break
      case '--dev-git-dir':
        if (devGitDir !== undefined) throw new Error('Duplicate option: --dev-git-dir')
        devGitDir = readFlagValue(argv, i, '--dev-git-dir')
        i += 1
        break
      case '--page':
        if (page !== undefined) throw new Error('Duplicate option: --page')
        page = readFlagValue(argv, i, '--page')
        i += 1
        break
      case '--dry-run':
        if (dryRun) throw new Error('Duplicate option: --dry-run')
        dryRun = true
        break
      case '--always-notify':
        if (alwaysNotify) throw new Error('Duplicate option: --always-notify')
        alwaysNotify = true
        break
      case '--provider':
        if (provider !== undefined) throw new Error('Duplicate option: --provider')
        provider = readFlagValue(argv, i, '--provider')
        i += 1
        break
      case '--out':
        if (out !== undefined) throw new Error('Duplicate option: --out')
        out = readFlagValue(argv, i, '--out')
        i += 1
        break
      case '--repo':
        if (repo !== undefined) throw new Error('Duplicate option: --repo')
        repo = readFlagValue(argv, i, '--repo')
        i += 1
        break
      case '--base-branch':
        if (baseBranch !== undefined) throw new Error('Duplicate option: --base-branch')
        baseBranch = readFlagValue(argv, i, '--base-branch')
        i += 1
        break
      case '--dev-commit':
        if (devCommit !== undefined) throw new Error('Duplicate option: --dev-commit')
        devCommit = readFlagValue(argv, i, '--dev-commit')
        i += 1
        break
      case '--manual-state-file':
        if (manualStateFile !== undefined) throw new Error('Duplicate option: --manual-state-file')
        manualStateFile = readFlagValue(argv, i, '--manual-state-file')
        i += 1
        break
      case '--update-manual-baselines':
        if (updateManualBaselines) throw new Error('Duplicate option: --update-manual-baselines')
        updateManualBaselines = true
        break
      case '--style-guide':
        if (styleGuide !== undefined) throw new Error('Duplicate option: --style-guide')
        styleGuide = readFlagValue(argv, i, '--style-guide')
        i += 1
        break
      case '--locale-contract-root':
        if (localeContractRoot !== undefined) throw new Error('Duplicate option: --locale-contract-root')
        localeContractRoot = readFlagValue(argv, i, '--locale-contract-root')
        i += 1
        break
      case '--now':
        if (now !== undefined) throw new Error('Duplicate option: --now')
        now = readFlagValue(argv, i, '--now')
        i += 1
        break
      case '--validation-workflow':
        if (validationWorkflow !== undefined) throw new Error('Duplicate option: --validation-workflow')
        validationWorkflow = readFlagValue(argv, i, '--validation-workflow')
        i += 1
        break
      case '--no-dispatch-validate':
        dispatchValidate = false
        break
      default:
        throw new Error(`Unknown localized-docs schedule option: ${arg}`)
    }
  }

  if (!root) {
    throw new Error('--root is required')
  }

  return {
    root,
    ...(devRoot !== undefined ? { devRoot } : {}),
    ...(enBaseRoot !== undefined ? { enBaseRoot } : {}),
    ...(devGitDir !== undefined ? { devGitDir } : {}),
    ...(page !== undefined ? { page } : {}),
    dryRun,
    alwaysNotify,
    ...(provider !== undefined ? { provider } : {}),
    ...(out !== undefined ? { out } : {}),
    ...(repo !== undefined ? { repo } : {}),
    ...(baseBranch !== undefined ? { baseBranch } : {}),
    ...(devCommit !== undefined ? { devCommit } : {}),
    ...(manualStateFile !== undefined ? { manualStateFile } : {}),
    updateManualBaselines,
    ...(styleGuide !== undefined ? { styleGuide } : {}),
    ...(localeContractRoot !== undefined ? { localeContractRoot } : {}),
    ...(now !== undefined ? { now } : {}),
    ...(validationWorkflow !== undefined ? { validationWorkflow } : {}),
    dispatchValidate,
  }
}

async function checkDirState(targetPath: string, label: string): Promise<'exists' | 'missing'> {
  try {
    const stat = await lstat(targetPath)
    if (stat.isSymbolicLink()) {
      throw new Error(`${label} must not be a symbolic link: ${targetPath}`)
    }
    if (!stat.isDirectory()) {
      throw new Error(`${label} must be a directory: ${targetPath}`)
    }
    return 'exists'
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return 'missing'
    }
    throw error
  }
}

async function writeScheduleOutputsAtomic(
  resolvedOut: string,
  files: Readonly<Record<string, string>>,
): Promise<void> {
  await mkdir(dirname(resolvedOut), { recursive: true })
  const stage = await mkdtemp(join(dirname(resolvedOut), '.localized-docs-schedule-'))
  try {
    for (const [name, content] of Object.entries(files)) {
      const target = join(stage, name)
      if (!withinPath(stage, target)) {
        throw new Error(`Schedule output escapes staging directory: ${target}`)
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

async function writeRegularFileAtomic(targetPath: string, content: string): Promise<void> {
  const resolvedTarget = resolve(targetPath)
  await mkdir(dirname(resolvedTarget), { recursive: true })
  const tempPath = join(
    dirname(resolvedTarget),
    `.tmp-${Date.now()}-${Math.random().toString(16).slice(2, 10)}.json`,
  )
  await writeFile(tempPath, content, { flag: 'wx' })
  try {
    await rename(tempPath, resolvedTarget)
  } catch (error) {
    await rm(tempPath, { force: true }).catch(() => {})
    throw error
  }
}

async function readManualStateFile(filePath: string): Promise<Record<string, string>> {
  const resolved = resolve(filePath)
  try {
    const stat = await lstat(resolved)
    if (stat.isSymbolicLink() || !stat.isFile()) {
      throw new Error(`Manual state file must be a regular non-symlink file: ${resolved}`)
    }
    const raw = JSON.parse(await readFile(resolved, 'utf8')) as Partial<ManualNotificationStateFile>
    if (raw && raw.schema_version === 1 && raw.notified && typeof raw.notified === 'object') {
      const out: Record<string, string> = {}
      for (const [key, value] of Object.entries(raw.notified)) {
        if (typeof value === 'string') out[key] = value
      }
      return out
    }
    return {}
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {}
    }
    throw error
  }
}

async function readGitSnapshotAtCommit(
  gitDir: string,
  request: HistoricalEnReadRequest,
): Promise<{ snapshot: VerifiedEnSnapshot } | { errors: LocalizedDocsError[] }> {
  const location = { file: request.enPath, page: request.sharedPage }
  if (!isCommit(request.devCommit)) {
    return {
      errors: [
        localizedError(
          'EN_PROVENANCE_INVALID',
          `Invalid historical dev_commit SHA: ${request.devCommit}`,
          location,
          1,
        ),
      ],
    }
  }

  const expectedManifestRel = request.manifestPath || sharedReceiptPath('guides', request.sharedPage)
  const gitShow = async (relPath: string): Promise<string> => {
    const { stdout } = await execFileAsync(
      'git',
      ['-C', gitDir, 'show', `${request.devCommit}:${relPath}`],
      { maxBuffer: 15 * 1024 * 1024 },
    )
    return stdout
  }

  let receiptRaw: string
  let rawMdx: string
  try {
    receiptRaw = await gitShow(expectedManifestRel)
    rawMdx = await gitShow(request.enPath)
  } catch (error) {
    return {
      errors: [
        localizedError(
          'BASE_EN_MISMATCH',
          `Unable to read historical EN snapshot at ${request.devCommit}: ${error instanceof Error ? error.message : String(error)}`,
          location,
          1,
        ),
      ],
    }
  }

  let receipt
  try {
    receipt = validateSharedReceipt(JSON.parse(receiptRaw), {
      group: 'guides',
      page: request.sharedPage,
    })
  } catch (error) {
    return {
      errors: [
        localizedError(
          'EN_PROVENANCE_INVALID',
          `Historical SharedReceipt invalid at ${request.devCommit}: ${error instanceof Error ? error.message : String(error)}`,
          location,
          1,
        ),
      ],
    }
  }

  const output = receipt.outputs.find(o => o.manual === request.manual)
  if (!output) {
    return {
      errors: [
        localizedError(
          'EN_PROVENANCE_INVALID',
          `Historical SharedReceipt at ${request.devCommit} missing output for manual "${request.manual}"`,
          location,
          1,
        ),
      ],
    }
  }

  const actualSha = sha256Hex(rawMdx)
  if (actualSha !== output.sha256) {
    return {
      errors: [
        localizedError(
          'EN_DIGEST_MISMATCH',
          `Historical EN file SHA-256 (${actualSha}) does not match SharedReceipt (${output.sha256})`,
          location,
          1,
        ),
      ],
    }
  }

  const stripped = stripEnShell(rawMdx, { file: output.path, page: request.sharedPage })
  if ('errors' in stripped) {
    return { errors: stripped.errors }
  }

  return {
    snapshot: {
      rawMdx,
      stripped,
      provenance: {
        manual: request.manual,
        sharedPage: request.sharedPage,
        devCommit: request.devCommit,
        enPath: output.path,
        manifestPath: expectedManifestRel,
        fileSha256: output.sha256,
        channels: computeChannelDigests(stripped.body),
        receiptChannel: receipt.channel,
        provenanceMode: 'shared-receipt',
        verified: true,
        verificationErrors: [],
      },
    },
  }
}

function createReadOnlyDryRunFallbackAdapter(): GitHubPrAdapter {
  const unsupported = (method: string): never => {
    throw new Error(`Dry-run fallback adapter cannot execute write operation: ${method}`)
  }
  return {
    async findOpenPrByBranch() {
      return null
    },
    async listPrCommits() {
      return []
    },
    async listPrComments() {
      return []
    },
    async readBranchFile() {
      return null
    },
    async pushBranchFiles() {
      return unsupported('pushBranchFiles')
    },
    async createPr() {
      return unsupported('createPr')
    },
    async updatePr() {
      return unsupported('updatePr')
    },
  }
}

function deriveRootRepoRelative(repositoryRoot: string, realRoot: string): string {
  const rel = relative(repositoryRoot, realRoot).split(sep).join('/')
  if (rel && !rel.startsWith('..') && !rel.startsWith('/')) {
    return rel
  }
  return 'localized-docs/zh-CN/guides'
}

export async function runSchedule(
  options: ScheduleOptions,
  deps: ScheduleCommandDeps = {},
): Promise<number> {
  const write = deps.write ?? (text => process.stdout.write(text))
  const writeError = deps.writeError ?? (text => process.stderr.write(text))
  const repositoryRoot = resolve(deps.repositoryRoot ?? process.cwd())

  // 1. Validate scalar CLI options (exit 2 on invalid arguments)
  let llmProvider: DraftLlmProvider
  let nowIso: string
  try {
    if (options.page !== undefined) {
      const idCheck = validatePageId(options.page, { page: options.page })
      if ('errors' in idCheck) {
        throw new Error(idCheck.errors[0].message)
      }
    }
    if (options.devCommit !== undefined && !isCommit(options.devCommit)) {
      throw new Error(`--dev-commit must be a 40-char lowercase hex SHA, got: ${options.devCommit}`)
    }
    if (options.now !== undefined) {
      if (!ISO_TIMESTAMP_RE.test(options.now) || !Number.isFinite(Date.parse(options.now))) {
        throw new Error(`--now must be a valid ISO-8601 timestamp, got: ${options.now}`)
      }
      nowIso = options.now
    } else {
      nowIso = (deps.now ? deps.now() : new Date()).toISOString()
    }
    llmProvider =
      deps.llmProvider ?? createDraftLlmProvider({ provider: options.provider ?? 'fake' })
  } catch (error) {
    writeError(`Invalid schedule argument: ${error instanceof Error ? error.message : String(error)}\n`)
    return 2
  }

  const dryRun = options.dryRun === true
  const alwaysNotify = options.alwaysNotify === true
  const repo = options.repo ?? process.env.GITHUB_REPOSITORY ?? 'zilliztech/zdoc'
  const baseBranch = options.baseBranch ?? 'master'
  const validationWorkflow = options.validationWorkflow ?? DEFAULT_VALIDATION_WORKFLOW
  const dispatchValidate = options.dispatchValidate !== false

  const summary: ScheduleRunSummary = {
    schema_version: 1,
    generated_at: nowIso,
    repo,
    base_branch: baseBranch,
    dry_run: dryRun,
    scanned_pages: 0,
    skipped_pages: [],
    prs: [],
    deferred: [],
    manual: [],
    blocked: [],
    manual_notified_updates: [],
    validation_dispatches: [],
  }

  const emitOutputs = async (resolvedOut: string | undefined): Promise<void> => {
    const digest = renderDailyDigestCardNote(summary, { alwaysNotify })
    const summaryFile: ScheduleSummaryFile = {
      ...summary,
      should_notify: digest.shouldNotify,
      digest_counts: digest.counts,
    }
    if (resolvedOut) {
      await writeScheduleOutputsAtomic(resolvedOut, {
        'schedule-summary.json': `${JSON.stringify(summaryFile, null, 2)}\n`,
        'digest-note.md': digest.markdown,
      })
    }
  }

  try {
    const resolvedRoot = resolve(options.root)
    const resolvedOut = options.out !== undefined ? resolve(options.out) : undefined

    if (resolvedOut) {
      const checkTargets = [
        resolvedRoot,
        ...(options.devRoot ? [resolve(options.devRoot)] : []),
        ...(options.enBaseRoot ? [resolve(options.enBaseRoot)] : []),
      ]
      for (const inputPath of checkTargets) {
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
    }

    // 2. Gracefully handle absent root or absent pages/ directory (exit 0, no card)
    const rootState = await checkDirState(resolvedRoot, 'Localized docs root')
    if (rootState === 'missing') {
      write(`Localized docs root does not exist (${resolvedRoot}); nothing to schedule.\n`)
      await emitOutputs(resolvedOut)
      return 0
    }
    const pagesState = await checkDirState(join(resolvedRoot, 'pages'), 'Localized docs pages directory')
    if (pagesState === 'missing') {
      write(`No localized pages directory found under ${resolvedRoot}; nothing to schedule.\n`)
      await emitOutputs(resolvedOut)
      return 0
    }

    // 3. Read localized group
    const group = await readLocalizedGroup({
      root: options.root,
      ...(options.page !== undefined ? { page: options.page } : {}),
    })

    if (resolvedOut && pathsOverlap(resolvedOut, group.realRoot)) {
      throw new Error(`Output directory must not overlap localized-docs root: ${resolvedOut}`)
    }

    const fatalFsErrors = group.errors.filter(
      e => e.code === 'SYMLINK_FORBIDDEN' || e.code === 'PATH_TRAVERSAL',
    )
    if (fatalFsErrors.length > 0) {
      for (const err of fatalFsErrors) {
        writeError(`${formatDiagnostic(err)}\n`)
      }
      return 1
    }

    if (group.pages.length === 0 && group.errors.length === 0) {
      write(`No localized pages found under ${resolvedRoot}; nothing to schedule.\n`)
      await emitOutputs(resolvedOut)
      return 0
    }

    // Record group-level or page-level config errors as blocked items
    const errorsByPage = new Map<string, LocalizedDocsError[]>()
    for (const err of group.errors) {
      const key = err.page ?? '__group__'
      const list = errorsByPage.get(key) ?? []
      list.push(err)
      errorsByPage.set(key, list)
    }
    for (const [pageKey, errs] of errorsByPage.entries()) {
      if (pageKey === '__group__') continue
      if (!group.pages.some(p => p.pageId === pageKey)) {
        summary.blocked.push({
          pageId: pageKey,
          reason: 'baseline-invalid',
          message: errs[0].message,
        })
      }
    }

    const manualNotifiedState = options.manualStateFile
      ? await readManualStateFile(options.manualStateFile)
      : {}

    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
    const githubAdapter: GitHubPrAdapter =
      deps.githubAdapter ??
      (dryRun && !token
        ? createReadOnlyDryRunFallbackAdapter()
        : createGitHubCliPrAdapter({ repositoryRoot, token }))

    const contractSupport = loadLocalizedContractSupport({
      repositoryRoot: options.localeContractRoot ?? repositoryRoot,
      styleGuidePath: options.styleGuide,
      target: 'zh-CN-guides',
    })

    const preprocessAdapter = createLocalizedPreprocessAdapter({
      groupRoot: group.realRoot,
      hasFragmentsDir: group.hasFragmentsDir,
    })

    const rootRepoRel = deriveRootRepoRelative(repositoryRoot, group.realRoot)
    const devGitDir = options.devGitDir
      ? resolve(options.devGitDir)
      : options.devRoot
        ? resolve(options.devRoot)
        : repositoryRoot

    const resolveHistoricalEn = async (
      request: HistoricalEnReadRequest,
      currentEn: VerifiedEnSnapshot | null,
    ): Promise<VerifiedEnSnapshot | null> => {
      if (currentEn && currentEn.provenance.devCommit === request.devCommit) {
        return currentEn
      }
      if (deps.enSnapshotReader) {
        const res = await deps.enSnapshotReader(request)
        return 'snapshot' in res ? res.snapshot : null
      }
      const gitRes = await readGitSnapshotAtCommit(devGitDir, request)
      if ('snapshot' in gitRes) {
        return gitRes.snapshot
      }
      if (options.enBaseRoot) {
        const fsRes = await readVerifiedEnSnapshot({
          devRoot: options.enBaseRoot,
          manual: request.manual,
          sharedPage: request.sharedPage,
          devCommit: request.devCommit,
          requireReceipt: true,
        })
        if ('snapshot' in fsRes) {
          return fsRes.snapshot
        }
      }
      return null
    }

    // 4. Process each page serially (one rolling branch per page)
    for (const page of group.pages) {
      summary.scanned_pages += 1
      const pageErrors = errorsByPage.get(page.pageId) ?? []
      const baselineDiagnostics: LocalizedDocsError[] = [...pageErrors]
      if (page.baseline) {
        baselineDiagnostics.push(
          ...validateBaselineConsistency({
            baseline: page.baseline,
            dirPageId: page.pageId,
            pageConfig: page.config,
            context: { file: `pages/${page.pageId}/.baseline.json`, page: page.pageId },
          }),
        )
      }

      // Skip EN & GitHub lookups for paused / silent manual / missing baseline early
      let newEn: VerifiedEnSnapshot | null = null
      let enDiagnostics: LocalizedDocsError[] = []
      const needsEn =
        page.config.mode !== 'paused' &&
        !(page.config.mode === 'manual' && page.config.notify_on_en_change !== true) &&
        page.lifecycleState !== 'baseline-missing-error' &&
        page.lifecycleState !== 'source-missing-error' &&
        baselineDiagnostics.length === 0

      if (needsEn) {
        if (!options.devRoot) {
          enDiagnostics = [
            localizedError(
              'EN_PROVENANCE_INVALID',
              'Missing --dev-root to verify EN SharedReceipt provenance',
              { page: page.pageId },
              1,
            ),
          ]
        } else {
          const enRes = await readVerifiedEnSnapshot({
            devRoot: options.devRoot,
            manual: page.config.en_source.manual,
            sharedPage: page.config.en_source.shared_page,
            devCommit: options.devCommit,
            requireReceipt: true,
          })
          if ('errors' in enRes) {
            enDiagnostics = enRes.errors
          } else {
            newEn = enRes.snapshot
          }
        }
      }

      let masterBaseEn: VerifiedEnSnapshot | null = null
      if (needsEn && newEn && page.baseline) {
        masterBaseEn = await resolveHistoricalEn(
          {
            manual: page.baseline.en_baseline.manual,
            sharedPage: page.baseline.en_baseline.shared_page,
            devCommit: page.baseline.en_baseline.dev_commit,
            enPath: page.baseline.en_baseline.en_path,
            manifestPath: page.baseline.en_baseline.manifest_path,
          },
          newEn,
        )
      }

      // Inspect existing rolling PR for incremental pages
      let activePr: ActivePrState | null = null
      let prBaseEn: VerifiedEnSnapshot | null = null
      if (needsEn && newEn && page.config.mode === 'incremental') {
        const branch = translationBranchName(page.pageId)
        const openPr = await githubAdapter.findOpenPrByBranch({
          repo,
          headBranch: branch,
          baseBranch,
        })
        if (openPr) {
          const commits = await githubAdapter.listPrCommits({ repo, prNumber: openPr.number })
          const comments = githubAdapter.listPrComments
            ? await githubAdapter.listPrComments({ repo, prNumber: openPr.number })
            : []

          const prSourceRel = `${rootRepoRel}/pages/${page.pageId}/source.md`
          const prBaselineRel = `${rootRepoRel}/pages/${page.pageId}/.baseline.json`
          const prSourceMdText = githubAdapter.readBranchFile
            ? await githubAdapter.readBranchFile({ repo, ref: openPr.headSha, filePath: prSourceRel })
            : null
          const prBaselineRaw = githubAdapter.readBranchFile
            ? await githubAdapter.readBranchFile({ repo, ref: openPr.headSha, filePath: prBaselineRel })
            : null

          let prBaseline: BaselineJson | null = null
          if (prBaselineRaw) {
            const parsed = parseBaselineJson(prBaselineRaw, {
              file: prBaselineRel,
              page: page.pageId,
            })
            if ('baseline' in parsed) {
              prBaseline = parsed.baseline
            }
          }

          const meta = parseSchedulePrMeta(openPr.body)
          const prTargetEnSha = prBaseline?.en_baseline.file_sha256 ?? meta?.target_en_sha ?? null
          const prTargetEnCommit = prBaseline?.en_baseline.dev_commit ?? meta?.target_en_commit ?? null
          const deferredReviewAfter = parseDeferredReviewDate([
            openPr.body,
            ...comments.map(c => c.body),
          ])

          activePr = {
            number: openPr.number,
            url: openPr.url,
            title: openPr.title,
            headRef: openPr.headRef,
            headSha: openPr.headSha,
            baseRef: openPr.baseRef,
            body: openPr.body,
            labels: openPr.labels,
            commits: commits.map(c => ({
              sha: c.sha,
              isBot: c.isBot,
              authorLogin: c.authorLogin,
              touchedFiles: c.touchedFiles,
            })),
            prTargetEnSha,
            prTargetEnCommit,
            prSourceMdText,
            prBaseline,
            deferredReviewAfter,
          }

          if (prTargetEnCommit && prBaseline) {
            prBaseEn = await resolveHistoricalEn(
              {
                manual: prBaseline.en_baseline.manual,
                sharedPage: prBaseline.en_baseline.shared_page,
                devCommit: prTargetEnCommit,
                enPath: prBaseline.en_baseline.en_path,
                manifestPath: prBaseline.en_baseline.manifest_path,
              },
              newEn,
            )
          }
        }
      }

      const decision = planPageSchedule({
        pageId: page.pageId,
        pageConfig: page.config,
        lifecycleState: page.lifecycleState,
        baseline: page.baseline ?? null,
        hasBaselineErrors: baselineDiagnostics.length > 0,
        baselineDiagnostics,
        newEn,
        enDiagnostics,
        masterBaseEn,
        prBaseEn,
        activePr,
        persistedNotifiedEnSha: manualNotifiedState[page.pageId] ?? null,
        repo,
        baseBranch,
        nowIso,
      })

      if (
        decision.action === 'skip-paused' ||
        decision.action === 'skip-manual-silent' ||
        decision.action === 'skip-unchanged' ||
        decision.action === 'skip-pr-up-to-date' ||
        decision.action === 'skip-deferred-unchanged' ||
        decision.action === 'skip-manual-already-notified'
      ) {
        summary.skipped_pages.push({ pageId: page.pageId, reason: decision.reason })
        write(`[${page.pageId}] skipped (${decision.reason})\n`)
        continue
      }

      if (decision.action === 'deferred-due-reminder') {
        summary.deferred.push({
          pageId: decision.pageId,
          branch: decision.branch,
          kind: 'due-reminder',
          prNumber: decision.prNumber,
          prUrl: decision.prUrl,
          reviewAfter: decision.reviewAfter,
          dryRun,
        })
        write(`[${page.pageId}] deferred due reminder (PR #${decision.prNumber}, due=${decision.reviewAfter})\n`)
        continue
      }

      if (decision.action === 'blocked') {
        summary.blocked.push({
          pageId: decision.pageId,
          reason: decision.reason,
          message: decision.message,
          ...(decision.prNumber != null ? { prNumber: decision.prNumber } : {}),
          ...(decision.prUrl != null ? { prUrl: decision.prUrl } : {}),
          ...(decision.overlappingSections && decision.overlappingSections.length > 0
            ? { overlappingSections: decision.overlappingSections }
            : {}),
        })
        write(`[${page.pageId}] blocked (${decision.reason}): ${decision.message}\n`)
        continue
      }

      if (decision.action === 'notify-manual') {
        summary.manual.push({
          pageId: decision.pageId,
          enPath: decision.enPath,
          enDiffUrl: decision.enDiffUrl,
          enBaseCommit: decision.enBaseCommit,
          enNewCommit: decision.enNewCommit,
          newEnSha: decision.newEnSha,
          zhSourcePath: decision.zhSourcePath,
          zhSourceUrl: decision.zhSourceUrl,
          changedSections: decision.changedSections,
        })
        summary.manual_notified_updates.push({
          page_id: decision.pageId,
          last_notified_en_sha: decision.newEnSha,
          updated_baseline: decision.updatedBaseline,
        })
        manualNotifiedState[decision.pageId] = decision.newEnSha
        if (!dryRun && options.updateManualBaselines) {
          await writeRegularFileAtomic(
            join(page.pageDir, '.baseline.json'),
            `${JSON.stringify(decision.updatedBaseline, null, 2)}\n`,
          )
        }
        write(`[${page.pageId}] manual-notify (${decision.newEnSha.slice(0, 12)})\n`)
        continue
      }

      // 5. Drafting action: open-pr | update-pr | update-deferred-pr
      if (
        decision.action !== 'open-pr' &&
        decision.action !== 'update-pr' &&
        decision.action !== 'update-deferred-pr'
      ) {
        continue
      }
      const usePrBranchCurZh =
        (decision.action === 'update-pr' || decision.action === 'update-deferred-pr') &&
        decision.hasNonOverlappingHumanEdits &&
        activePr?.prSourceMdText != null &&
        activePr.prBaseline != null &&
        prBaseEn != null

      const draftResult = await executeDraftEngine({
        pageId: page.pageId,
        pageConfig: page.config,
        curZh: usePrBranchCurZh
          ? {
              hasSourceMd: true,
              sourceMdText: activePr!.prSourceMdText!,
              hasBaselineJson: true,
              baseline: activePr!.prBaseline!,
              lifecycleState: 'ready',
            }
          : {
              hasSourceMd: page.hasSourceMd,
              sourceMdText: page.sourceMdText,
              hasBaselineJson: page.hasBaselineJson,
              baselineJsonText: page.baselineJsonText,
              baseline: page.baseline,
              lifecycleState: page.lifecycleState,
            },
        newEn: newEn!,
        baseEn: usePrBranchCurZh ? prBaseEn : masterBaseEn,
        llmProvider,
        contractSupport,
        reviewedPr: activePr?.number ?? page.baseline?.zh_reviewed.reviewed_pr ?? 1,
        nowIso,
      })

      if (draftResult.status === 'skipped') {
        summary.skipped_pages.push({ pageId: page.pageId, reason: draftResult.reason })
        write(`[${page.pageId}] skipped after draft diff (${draftResult.reason})\n`)
        continue
      }

      if (draftResult.status === 'blocked') {
        summary.blocked.push({
          pageId: page.pageId,
          reason: draftResult.reason,
          message: draftResult.diagnostics[0]?.message ?? `Draft blocked: ${draftResult.reason}`,
          ...(activePr ? { prNumber: activePr.number, prUrl: activePr.url } : {}),
        })
        write(`[${page.pageId}] blocked during draft (${draftResult.reason})\n`)
        continue
      }

      if (draftResult.status !== 'drafted') {
        continue
      }

      // If drafting on top of non-overlapping human edits surfaced a manual-zh-conflict, pause safely!
      if (
        usePrBranchCurZh &&
        draftResult.todos.some(todo => todo.kind === 'manual-zh-conflict')
      ) {
        const conflictAnchors = [
          ...new Set(
            draftResult.todos
              .filter(t => t.kind === 'manual-zh-conflict' && t.sectionAnchor)
              .map(t => t.sectionAnchor!),
          ),
        ]
        summary.blocked.push({
          pageId: page.pageId,
          reason: 'conflict-paused',
          message: `PR #${activePr!.number} 人工修订与新英文变更存在冲突，已暂停自动写入`,
          prNumber: activePr!.number,
          prUrl: activePr!.url,
          overlappingSections: conflictAnchors,
        })
        write(`[${page.pageId}] conflict-paused during 3-way draft\n`)
        continue
      }

      // Validate candidate MDX / channels / UI tags before pushing anything
      const assembled = await assembleLocalizedPage({
        pageId: page.pageId,
        sourceMd: draftResult.candidateSourceMd,
        groupVariables: group.variables,
        pageConfig: page.config,
        context: { file: `pages/${page.pageId}/source.md`, page: page.pageId },
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      if ('errors' in assembled) {
        summary.blocked.push({
          pageId: page.pageId,
          reason: 'cur-zh-corrupt-or-conflict',
          message: assembled.errors[0]?.message ?? 'Candidate source.md failed MDX/channel validation',
          ...(activePr ? { prNumber: activePr.number, prUrl: activePr.url } : {}),
        })
        write(`[${page.pageId}] blocked by candidate validation\n`)
        continue
      }

      const prBodyInput = buildPrBodyInputFromDraftResult(draftResult, {
        baseCommit: decision.baseEnCommit ?? undefined,
        newCommit: decision.newEnCommit,
      })
      let prBody = renderPrBody(prBodyInput)

      if (decision.action === 'update-deferred-pr') {
        const dualDiffNote = renderDeferredDualDiffSection({
          changesSinceDeferred: decision.changesSinceDeferred,
          cumulativeChangesSinceMerge: decision.cumulativeChangesSinceMerge,
        })
        prBody = `${dualDiffNote}\n\n---\n\n${prBody}`
      }

      const prTitle = draftResult.isInitialTranslation
        ? `docs(zh-CN): initial translation for guides/${page.pageId}`
        : `docs(zh-CN): update translation for guides/${page.pageId}`

      const metaBase = {
        schema_version: 1 as const,
        page_id: page.pageId,
        target_en_sha: decision.newEnSha,
        target_en_commit: decision.newEnCommit,
        base_en_sha: decision.baseEnSha,
        base_en_commit: decision.baseEnCommit,
        deferred_at_en_sha:
          decision.action === 'update-deferred-pr' ? decision.changesSinceDeferred.fromSha : null,
        deferred_at_en_commit:
          decision.action === 'update-deferred-pr' ? decision.changesSinceDeferred.fromCommit : null,
      }

      if (dryRun) {
        if (decision.action === 'update-deferred-pr') {
          summary.deferred.push({
            pageId: page.pageId,
            branch: decision.branch,
            kind: 'new-en-changes',
            prNumber: decision.prNumber,
            prUrl: decision.prUrl,
            changesSinceDeferred: {
              fromCommit: decision.changesSinceDeferred.fromCommit,
              toCommit: decision.changesSinceDeferred.toCommit,
              changedSections: decision.changesSinceDeferred.changedSections,
            },
            cumulativeChangesSinceMerge: {
              fromCommit: decision.cumulativeChangesSinceMerge.fromCommit,
              toCommit: decision.cumulativeChangesSinceMerge.toCommit,
              changedSections: decision.cumulativeChangesSinceMerge.changedSections,
            },
            dryRun: true,
          })
        } else {
          summary.prs.push({
            pageId: page.pageId,
            branch: decision.branch,
            action: decision.action === 'open-pr' ? 'opened' : 'updated',
            mode: draftResult.isInitialTranslation ? 'initial' : 'incremental',
            prNumber: decision.action === 'update-pr' ? decision.prNumber : null,
            prUrl: decision.action === 'update-pr' ? decision.prUrl : null,
            todoCount: draftResult.todos.length,
            enBaseCommit: decision.baseEnCommit,
            enNewCommit: decision.newEnCommit,
            dryRun: true,
          })
        }
        write(`[${page.pageId}] dry-run planned (${decision.action}, todos=${draftResult.todos.length})\n`)
        continue
      }

      // Live delivery (push controlled branch + open/update PR + dispatch validation workflow)
      try {
        const filesToWrite: Record<string, string> = {
          [`${rootRepoRel}/pages/${page.pageId}/source.md`]: draftResult.candidateSourceMd,
          [`${rootRepoRel}/pages/${page.pageId}/.baseline.json`]: `${JSON.stringify(draftResult.updatedBaseline, null, 2)}\n`,
        }
        const commitMessage = draftResult.isInitialTranslation
          ? `docs(zh-CN): draft initial translation for ${page.pageId} (${decision.newEnCommit.slice(0, 7)})`
          : `docs(zh-CN): sync ${page.pageId} to dev@${decision.newEnCommit.slice(0, 7)}`

        const pushed = await githubAdapter.pushBranchFiles({
          repo,
          baseBranch,
          headBranch: decision.branch,
          expectedHeadSha:
            decision.action === 'open-pr' ? null : decision.expectedHeadSha,
          commitMessage,
          files: filesToWrite,
        })

        const finalPrBody = appendScheduleMetaToPrBody(prBody, {
          ...metaBase,
          last_bot_head_sha: pushed.headSha,
        })

        let prSummary
        if (decision.action === 'open-pr') {
          prSummary = await githubAdapter.createPr({
            repo,
            baseBranch,
            headBranch: decision.branch,
            title: prTitle,
            body: finalPrBody,
            labels: [TRANSLATION_PR_LABEL],
            draft: false,
          })
          summary.prs.push({
            pageId: page.pageId,
            branch: decision.branch,
            action: 'opened',
            mode: draftResult.isInitialTranslation ? 'initial' : 'incremental',
            prNumber: prSummary.number,
            prUrl: prSummary.url,
            todoCount: draftResult.todos.length,
            enBaseCommit: decision.baseEnCommit,
            enNewCommit: decision.newEnCommit,
            dryRun: false,
          })
        } else {
          prSummary = await githubAdapter.updatePr({
            repo,
            prNumber: decision.prNumber,
            title: prTitle,
            body: finalPrBody,
          })
          if (decision.action === 'update-deferred-pr') {
            summary.deferred.push({
              pageId: page.pageId,
              branch: decision.branch,
              kind: 'new-en-changes',
              prNumber: prSummary.number,
              prUrl: prSummary.url,
              changesSinceDeferred: {
                fromCommit: decision.changesSinceDeferred.fromCommit,
                toCommit: decision.changesSinceDeferred.toCommit,
                changedSections: decision.changesSinceDeferred.changedSections,
              },
              cumulativeChangesSinceMerge: {
                fromCommit: decision.cumulativeChangesSinceMerge.fromCommit,
                toCommit: decision.cumulativeChangesSinceMerge.toCommit,
                changedSections: decision.cumulativeChangesSinceMerge.changedSections,
              },
              dryRun: false,
            })
          } else {
            summary.prs.push({
              pageId: page.pageId,
              branch: decision.branch,
              action: 'updated',
              mode: draftResult.isInitialTranslation ? 'initial' : 'incremental',
              prNumber: prSummary.number,
              prUrl: prSummary.url,
              todoCount: draftResult.todos.length,
              enBaseCommit: decision.baseEnCommit,
              enNewCommit: decision.newEnCommit,
              dryRun: false,
            })
          }
        }

        if (dispatchValidate && githubAdapter.dispatchValidationWorkflow) {
          const requestId = `translate-zh-guides-${page.pageId}-${pushed.headSha.slice(0, 12)}`
          const dispatchRes = await githubAdapter.dispatchValidationWorkflow({
            repo,
            workflowFile: validationWorkflow,
            ref: decision.branch,
            prNumber: prSummary.number,
            sourceSha: pushed.headSha,
            baseSha: pushed.baseSha,
            requestId,
          })
          summary.validation_dispatches.push({
            page_id: page.pageId,
            pr_number: prSummary.number,
            source_sha: pushed.headSha,
            base_sha: pushed.baseSha,
            request_id: dispatchRes.requestId,
            dispatched: dispatchRes.dispatched,
          })
        }

        write(`[${page.pageId}] ${decision.action} -> PR #${prSummary.number} (${prSummary.url})\n`)
      } catch (error) {
        summary.blocked.push({
          pageId: page.pageId,
          reason: 'pr-delivery-failed',
          message: error instanceof Error ? error.message : String(error),
          ...(activePr ? { prNumber: activePr.number, prUrl: activePr.url } : {}),
        })
        write(`[${page.pageId}] pr-delivery-failed: ${error instanceof Error ? error.message : String(error)}\n`)
      }
    }

    // 6. Persist manual notification state file (only when !dryRun and notifications occurred)
    if (!dryRun && options.manualStateFile && summary.manual_notified_updates.length > 0) {
      const payload: ManualNotificationStateFile = {
        schema_version: 1,
        notified: manualNotifiedState,
      }
      await writeRegularFileAtomic(options.manualStateFile, `${JSON.stringify(payload, null, 2)}\n`)
    }

    // 7. Write schedule-summary.json and digest-note.md
    await emitOutputs(resolvedOut)
    return 0
  } catch (error) {
    writeError(`Schedule failed: ${error instanceof Error ? error.message : String(error)}\n`)
    return 1
  }
}
