import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  rmdir,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { isCommit } from '../../shared-docs/core/yaml.ts'
import { loadLocalizedContractSupport } from '../adapters/contract.ts'
import { readVerifiedEnSnapshot } from '../adapters/en-reader.ts'
import {
  pathsOverlap,
  validateOutputDirectoryState,
  withinPath,
} from '../adapters/fs-reader.ts'
import { createDraftLlmProvider } from '../adapters/llm.ts'
import { createLocalizedPreprocessAdapter } from '../adapters/md2md.ts'
import { localizedMdxAdapter } from '../adapters/mdx.ts'
import { assembleLocalizedPage } from '../core/assemble.ts'
import {
  bootstrapPageCore,
  type BootstrapPageMode,
} from '../core/bootstrap.ts'
import { parseLocalizedVariables, validatePageId } from '../core/config.ts'
import type { DraftLlmProvider, LocaleContractSupport } from '../core/draft.ts'
import type { SyncPolicy, Variables } from '../core/types.ts'
import { formatDiagnostic } from '../core/types.ts'

const ISO_TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
const VALID_BOOTSTRAP_MODES: readonly BootstrapPageMode[] = ['incremental', 'manual']
const VALID_SYNC_POLICIES: readonly SyncPolicy[] = ['independent', 'bilingual_sync']
const VALID_PROVIDERS = new Set(['fake', 'openai'])

export interface BootstrapOptions {
  page: string
  sharedPage?: string
  enFile?: string
  enManifest?: string
  enDevCommit?: string
  devRoot?: string
  zhLegacyFile: string
  mode?: BootstrapPageMode
  syncPolicy?: SyncPolicy
  alignGap?: boolean
  provider?: string
  variablesFile?: string
  fragmentsDir?: string
  out: string
  reviewedPr?: string | number
  updatedAt?: string
  styleGuide?: string
  localeContractRoot?: string
  llmProvider?: DraftLlmProvider
  contractSupport?: LocaleContractSupport
}

function readFlagValue(argv: readonly string[], index: number, flag: string): string {
  const value = argv[index + 1]
  if (value === undefined || value.length === 0 || value.startsWith('--')) {
    throw new Error(`${flag} requires a non-empty value`)
  }
  return value
}

export function parseBootstrapArgs(argv: string[]): BootstrapOptions {
  const seen = new Set<string>()
  const markSeen = (flag: string) => {
    if (seen.has(flag)) throw new Error(`Duplicate option: ${flag}`)
    seen.add(flag)
  }

  let page: string | undefined
  let sharedPage: string | undefined
  let enFile: string | undefined
  let enManifest: string | undefined
  let enDevCommit: string | undefined
  let devRoot: string | undefined
  let zhLegacyFile: string | undefined
  let mode: BootstrapPageMode | undefined
  let syncPolicy: SyncPolicy | undefined
  let alignGap = false
  let provider: string | undefined
  let variablesFile: string | undefined
  let fragmentsDir: string | undefined
  let out: string | undefined
  let reviewedPr: string | undefined
  let updatedAt: string | undefined
  let styleGuide: string | undefined
  let localeContractRoot: string | undefined

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`)
    }
    switch (arg) {
      case '--owner':
      case '--feishu-record-id':
        throw new Error(
          `Forbidden legacy option ${arg}: bootstrap never writes "owner" or "feishu_record_id" into page.yaml`,
        )
      case '--page':
        markSeen(arg)
        page = readFlagValue(argv, i, arg)
        i += 1
        break
      case '--shared-page':
        markSeen(arg)
        sharedPage = readFlagValue(argv, i, arg)
        i += 1
        break
      case '--en-file':
        markSeen(arg)
        enFile = readFlagValue(argv, i, arg)
        i += 1
        break
      case '--en-manifest':
        markSeen(arg)
        enManifest = readFlagValue(argv, i, arg)
        i += 1
        break
      case '--en-dev-commit':
        markSeen(arg)
        enDevCommit = readFlagValue(argv, i, arg)
        i += 1
        break
      case '--dev-root':
        markSeen(arg)
        devRoot = readFlagValue(argv, i, arg)
        i += 1
        break
      case '--zh-legacy-file':
        markSeen(arg)
        zhLegacyFile = readFlagValue(argv, i, arg)
        i += 1
        break
      case '--mode': {
        markSeen(arg)
        const val = readFlagValue(argv, i, arg)
        if (!VALID_BOOTSTRAP_MODES.includes(val as BootstrapPageMode)) {
          throw new Error(`--mode must be one of: incremental, manual (got "${val}")`)
        }
        mode = val as BootstrapPageMode
        i += 1
        break
      }
      case '--sync-policy': {
        markSeen(arg)
        const val = readFlagValue(argv, i, arg)
        if (!VALID_SYNC_POLICIES.includes(val as SyncPolicy)) {
          throw new Error(`--sync-policy must be one of: independent, bilingual_sync (got "${val}")`)
        }
        syncPolicy = val as SyncPolicy
        i += 1
        break
      }
      case '--align-gap':
        markSeen(arg)
        alignGap = true
        break
      case '--provider':
        markSeen(arg)
        provider = readFlagValue(argv, i, arg)
        i += 1
        break
      case '--variables-file':
        markSeen(arg)
        variablesFile = readFlagValue(argv, i, arg)
        i += 1
        break
      case '--fragments-dir':
        markSeen(arg)
        fragmentsDir = readFlagValue(argv, i, arg)
        i += 1
        break
      case '--out':
        markSeen(arg)
        out = readFlagValue(argv, i, arg)
        i += 1
        break
      case '--reviewed-pr':
        markSeen(arg)
        reviewedPr = readFlagValue(argv, i, arg)
        i += 1
        break
      case '--updated-at':
        markSeen(arg)
        updatedAt = readFlagValue(argv, i, arg)
        i += 1
        break
      case '--style-guide':
        markSeen(arg)
        styleGuide = readFlagValue(argv, i, arg)
        i += 1
        break
      case '--locale-contract-root':
        markSeen(arg)
        localeContractRoot = readFlagValue(argv, i, arg)
        i += 1
        break
      default:
        throw new Error(`Unknown localized-docs bootstrap option: ${arg}`)
    }
  }

  if (!page) throw new Error('--page is required')
  if (!enFile && !(enManifest && devRoot)) {
    throw new Error('--en-file is required (or provide both --en-manifest and --dev-root)')
  }
  if (!enManifest && !enDevCommit) {
    throw new Error('Either --en-manifest or --en-dev-commit is required to pin EN provenance')
  }
  if (!zhLegacyFile) throw new Error('--zh-legacy-file is required')
  if (!out) throw new Error('--out is required')

  return {
    page,
    ...(sharedPage !== undefined ? { sharedPage } : {}),
    ...(enFile !== undefined ? { enFile } : {}),
    ...(enManifest !== undefined ? { enManifest } : {}),
    ...(enDevCommit !== undefined ? { enDevCommit } : {}),
    ...(devRoot !== undefined ? { devRoot } : {}),
    zhLegacyFile,
    ...(mode !== undefined ? { mode } : {}),
    ...(syncPolicy !== undefined ? { syncPolicy } : {}),
    ...(alignGap ? { alignGap: true } : {}),
    ...(provider !== undefined ? { provider } : {}),
    ...(variablesFile !== undefined ? { variablesFile } : {}),
    ...(fragmentsDir !== undefined ? { fragmentsDir } : {}),
    out,
    ...(reviewedPr !== undefined ? { reviewedPr } : {}),
    ...(updatedAt !== undefined ? { updatedAt } : {}),
    ...(styleGuide !== undefined ? { styleGuide } : {}),
    ...(localeContractRoot !== undefined ? { localeContractRoot } : {}),
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

async function assertNoSymlinksOnPath(targetPath: string, label: string): Promise<void> {
  const resolved = resolve(targetPath)
  const ancestors: string[] = []
  for (let current = resolved; ; current = dirname(current)) {
    ancestors.push(current)
    if (dirname(current) === current) break
  }
  for (const current of ancestors.reverse()) {
    const stats = await lstat(current)
    if (stats.isSymbolicLink()) {
      throw new Error(`${label} must not use symbolic links: ${current}`)
    }
    if (current !== resolved && !stats.isDirectory()) {
      throw new Error(`${label} ancestor must be a directory: ${current}`)
    }
  }
}

async function readSafeRegularFile(filePath: string, label: string): Promise<{ resolved: string; text: string }> {
  const resolved = resolve(filePath)
  await assertNoSymlinksOnPath(resolved, label)
  const stats = await lstat(resolved)
  if (!stats.isFile()) {
    throw new Error(`${label} must be a regular file: ${resolved}`)
  }
  const real = await realpath(resolved)
  return { resolved: real, text: await readFile(real, 'utf8') }
}

async function assertSafeFragmentsDirectory(fragmentsDir: string): Promise<string> {
  const resolved = resolve(fragmentsDir)
  await assertNoSymlinksOnPath(resolved, 'Fragments directory')
  const rootStat = await lstat(resolved)
  if (!rootStat.isDirectory()) {
    throw new Error(`Fragments path must be a directory: ${resolved}`)
  }
  const realFragments = await realpath(resolved)

  const visit = async (dir: string): Promise<void> => {
    const dirReal = await realpath(dir)
    if (!withinPath(realFragments, dirReal)) {
      throw new Error(`Fragments entry escapes fragments directory: ${dir}`)
    }
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      const stat = await lstat(fullPath)
      if (stat.isSymbolicLink()) {
        throw new Error(`Symbolic link is forbidden inside fragments directory: ${fullPath}`)
      }
      if (stat.isDirectory()) {
        await visit(fullPath)
      } else if (!stat.isFile()) {
        throw new Error(`Fragments entries must be regular files or directories: ${fullPath}`)
      }
    }
  }
  await visit(realFragments)
  return realFragments
}

async function writeBootstrapOutputsAtomic(
  resolvedOut: string,
  pageId: string,
  files: {
    pageYamlText: string
    sourceMd: string
    baselineJsonText: string
    reportMd: string
  },
): Promise<void> {
  await mkdir(dirname(resolvedOut), { recursive: true })
  const stage = await mkdtemp(join(dirname(resolvedOut), '.localized-docs-bootstrap-'))
  try {
    const pageDir = join(stage, 'pages', pageId)
    if (!withinPath(stage, pageDir)) {
      throw new Error(`Bootstrap page directory escapes staging root: ${pageDir}`)
    }
    await mkdir(pageDir, { recursive: true })

    const targets: [string, string][] = [
      [join(pageDir, 'page.yaml'), files.pageYamlText],
      [join(pageDir, 'source.md'), files.sourceMd],
      [join(pageDir, '.baseline.json'), files.baselineJsonText],
      [join(stage, 'bootstrap-report.md'), files.reportMd],
    ]
    for (const [target, content] of targets) {
      if (!withinPath(stage, target)) {
        throw new Error(`Bootstrap output escapes staging root: ${target}`)
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

export async function runBootstrap(
  options: BootstrapOptions,
  write: (text: string) => void = text => process.stdout.write(text),
  writeError: (text: string) => void = text => process.stderr.write(text),
  repositoryRoot?: string,
): Promise<number> {
  // 1. Validate scalar arguments (exit 2 on invalid arguments)
  let sharedPage: string
  let mode: BootstrapPageMode
  let syncPolicy: SyncPolicy
  let reviewedPr: number | undefined
  let updatedAt: string | undefined

  try {
    const rawRecord = options as unknown as Record<string, unknown>
    if (Object.hasOwn(rawRecord, 'owner') || Object.hasOwn(rawRecord, 'feishu_record_id') || Object.hasOwn(rawRecord, 'feishuRecordId')) {
      throw new Error('Legacy fields "owner" and "feishu_record_id" are forbidden in bootstrap')
    }

    const pageCheck = validatePageId(options.page, { page: options.page })
    if ('errors' in pageCheck) throw new Error(pageCheck.errors[0].message)

    sharedPage = options.sharedPage ?? options.page
    const sharedCheck = validatePageId(sharedPage, { page: options.page })
    if ('errors' in sharedCheck) throw new Error(`Invalid --shared-page: ${sharedCheck.errors[0].message}`)

    mode = options.mode ?? 'incremental'
    if (!VALID_BOOTSTRAP_MODES.includes(mode)) {
      throw new Error(`--mode must be one of: incremental, manual (got "${String(mode)}")`)
    }

    syncPolicy = options.syncPolicy ?? 'independent'
    if (!VALID_SYNC_POLICIES.includes(syncPolicy)) {
      throw new Error(`--sync-policy must be one of: independent, bilingual_sync (got "${String(syncPolicy)}")`)
    }

    if (!options.enFile && !(options.enManifest && options.devRoot)) {
      throw new Error('--en-file is required (or provide both --en-manifest and --dev-root)')
    }
    if (!options.enManifest && !options.enDevCommit) {
      throw new Error('Either --en-manifest or --en-dev-commit is required to pin EN provenance')
    }
    if (options.enDevCommit !== undefined && !isCommit(options.enDevCommit)) {
      throw new Error(`--en-dev-commit must be a 40-char lowercase hex SHA, got: ${options.enDevCommit}`)
    }
    if (options.provider !== undefined && !VALID_PROVIDERS.has(options.provider)) {
      throw new Error(`Unsupported --provider "${options.provider}"; expected "fake" or "openai"`)
    }

    reviewedPr = parseReviewedPr(options.reviewedPr)
    updatedAt = parseUpdatedAt(options.updatedAt)
  } catch (error) {
    writeError(`Invalid bootstrap argument: ${error instanceof Error ? error.message : String(error)}\n`)
    return 2
  }

  try {
    const resolvedOut = resolve(options.out)

    // 2. Output directory safety checks (no overlaps, no symlinks, empty or absent)
    const inputPathsToCheck = [
      resolve(options.zhLegacyFile),
      ...(options.enFile ? [resolve(options.enFile)] : []),
      ...(options.enManifest ? [resolve(options.enManifest)] : []),
      ...(options.devRoot ? [resolve(options.devRoot)] : []),
      ...(options.variablesFile ? [resolve(options.variablesFile)] : []),
      ...(options.fragmentsDir ? [resolve(options.fragmentsDir)] : []),
      ...(options.styleGuide ? [resolve(options.styleGuide)] : []),
      ...(options.localeContractRoot ? [resolve(options.localeContractRoot)] : []),
    ]
    for (const inputPath of inputPathsToCheck) {
      if (pathsOverlap(resolvedOut, inputPath)) {
        throw new Error(`Output directory must not overlap input path: ${resolvedOut} <-> ${inputPath}`)
      }
    }

    const outState = await validateOutputDirectoryState(resolvedOut)
    if (outState === 'empty') {
      const realOut = await realpath(resolvedOut)
      for (const inputPath of inputPathsToCheck) {
        if (pathsOverlap(realOut, inputPath)) {
          throw new Error(`Output directory must not overlap input path: ${resolvedOut} <-> ${inputPath}`)
        }
      }
    }

    // 3. Safely read legacy ZH file (rejecting symlinks)
    const legacyZh = await readSafeRegularFile(options.zhLegacyFile, 'Legacy ZH file')

    // 4. Read & verify EN snapshot (rejects symlinks and verifies SharedReceipt digest when manifest provided)
    const enRes = await readVerifiedEnSnapshot({
      filePath: options.enFile,
      manifestPath: options.enManifest,
      devRoot: options.devRoot,
      manual: 'guides',
      sharedPage,
      devCommit: options.enDevCommit,
      requireReceipt: Boolean(options.enManifest || options.devRoot),
    })
    if ('errors' in enRes) {
      for (const err of enRes.errors) {
        writeError(`${formatDiagnostic(err)}\n`)
      }
      return 1
    }

    // 5. Optional variables & fragments inputs
    let groupVariables: Variables | undefined
    if (options.variablesFile) {
      const varsFile = await readSafeRegularFile(options.variablesFile, 'Variables file')
      const parsedVars = parseLocalizedVariables(varsFile.text, { file: options.variablesFile })
      if ('errors' in parsedVars) {
        for (const err of parsedVars.errors) {
          writeError(`${formatDiagnostic(err)}\n`)
        }
        return 1
      }
      groupVariables = parsedVars.variables
    }

    let safeFragmentsDir: string | undefined
    if (options.fragmentsDir) {
      safeFragmentsDir = await assertSafeFragmentsDirectory(options.fragmentsDir)
    }

    // 6. Optional --align-gap LLM provider & locale contract (NEVER instantiated unless --align-gap is enabled)
    let llmProvider: DraftLlmProvider | undefined
    let contractSupport: LocaleContractSupport | undefined
    if (options.alignGap) {
      llmProvider =
        options.llmProvider ??
        createDraftLlmProvider({ provider: options.provider ?? 'fake' })
      contractSupport =
        options.contractSupport ??
        loadLocalizedContractSupport({
          repositoryRoot: options.localeContractRoot ?? repositoryRoot,
          styleGuidePath: options.styleGuide,
          target: 'zh-CN-guides',
        })
    }

    // 7. Run pure bootstrap core
    const result = await bootstrapPageCore({
      pageId: options.page,
      sharedPage,
      manual: 'guides',
      mode,
      syncPolicy,
      enSnapshot: enRes.snapshot,
      zhLegacyRaw: legacyZh.text,
      zhLegacyFileLabel: options.zhLegacyFile,
      alignGap: Boolean(options.alignGap),
      ...(llmProvider ? { llmProvider } : {}),
      ...(contractSupport ? { contractSupport } : {}),
      reviewedPr,
      nowIso: updatedAt ?? new Date().toISOString(),
    })

    if ('errors' in result) {
      for (const err of result.errors) {
        writeError(`${formatDiagnostic(err)}\n`)
      }
      return 1
    }

    const { output } = result

    // 8. When --variables-file is provided, run full assembleLocalizedPage (md2md + MDX) precheck
    if (groupVariables !== undefined) {
      let tempGroupRoot: string | undefined
      try {
        let groupRootForAdapter: string
        let hasFragmentsDir = false

        if (safeFragmentsDir) {
          const parentDir = dirname(safeFragmentsDir)
          if (basename(safeFragmentsDir) === 'fragments') {
            await assertNoSymlinksOnPath(parentDir, 'Fragments parent directory')
            groupRootForAdapter = parentDir
            hasFragmentsDir = true
          } else {
            tempGroupRoot = await mkdtemp(join(tmpdir(), 'localized-docs-bootstrap-frags-'))
            await cp(safeFragmentsDir, join(tempGroupRoot, 'fragments'), { recursive: true })
            groupRootForAdapter = tempGroupRoot
            hasFragmentsDir = true
          }
        } else {
          groupRootForAdapter = dirname(resolve(options.variablesFile!))
          hasFragmentsDir = false
        }

        const preprocessAdapter = createLocalizedPreprocessAdapter({
          groupRoot: groupRootForAdapter,
          hasFragmentsDir,
        })

        const assembled = await assembleLocalizedPage({
          pageId: output.pageId,
          sourceMd: output.sourceMd,
          groupVariables,
          pageConfig: output.pageConfig,
          context: { file: `pages/${output.pageId}/source.md`, page: output.pageId },
          preprocessAdapter,
          mdxAdapter: localizedMdxAdapter,
        })

        if ('errors' in assembled) {
          for (const err of assembled.errors) {
            writeError(`${formatDiagnostic(err)}\n`)
          }
          return 1
        }
      } finally {
        if (tempGroupRoot) {
          await rm(tempGroupRoot, { recursive: true, force: true })
        }
      }
    }

    // 9. Atomically write pages/<page-id>/{page.yaml, source.md, .baseline.json} & bootstrap-report.md
    await writeBootstrapOutputsAtomic(resolvedOut, output.pageId, {
      pageYamlText: output.pageYamlText,
      sourceMd: output.sourceMd,
      baselineJsonText: output.baselineJsonText,
      reportMd: output.reportMd,
    })

    write(
      `[${output.pageId}] bootstrapped (mode=${output.pageConfig.mode}, customizedCodeBlocks=${output.customizedCodeBlockCount}, anchorMismatches=${output.anchorComparisons.filter(c => c.status === 'anchor-mismatch').length}, alignGap=${options.alignGap ? 'on' : 'off'})\n`,
    )
    return 0
  } catch (error) {
    writeError(`Bootstrap failed: ${error instanceof Error ? error.message : String(error)}\n`)
    return 1
  }
}
