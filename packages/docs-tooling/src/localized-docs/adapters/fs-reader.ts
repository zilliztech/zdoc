import { lstat, mkdir, mkdtemp, readFile, readdir, realpath, rename, rm, rmdir, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { parseLocalizedPageConfig, parseLocalizedVariables, resolvePageLifecycleState, validatePageId } from '../core/config.ts'
import { parseBaselineJson } from '../core/baseline.ts'
import type {
  BaselineJson,
  LocalizedDocsError,
  PageConfig,
  PageLifecycleState,
  PreprocessDependencySummary,
  Variables,
} from '../core/types.ts'
import { localizedError } from '../core/types.ts'

export interface ReadPageEntry {
  pageId: string
  pageDir: string
  pageYamlText: string
  config: PageConfig
  hasSourceMd: boolean
  sourceMdText?: string
  hasBaselineJson: boolean
  baselineJsonText?: string
  baseline?: BaselineJson
  lifecycleState: PageLifecycleState
}

export interface ReadLocalizedGroupResult {
  root: string
  realRoot: string
  hasFragmentsDir: boolean
  variablesJsonText: string
  variables: Variables
  pages: ReadPageEntry[]
  errors: LocalizedDocsError[]
}

export interface BuiltLocalizedPageOutput {
  pageId: string
  mdx: string
  title: string
  description: string
  components: string[]
  sourceSha256: string
  dependencies: PreprocessDependencySummary
  engine: { name: string; version: string }
}

export interface LocalizedBuildManifest {
  schema_version: 1
  built_pages: {
    page_id: string
    output_file: string
    source_sha256: string
    components: string[]
    dependencies: PreprocessDependencySummary
    engine: { name: string; version: string }
  }[]
  skipped_pages: {
    page_id: string
    state: 'pending-initial-translation' | 'paused'
  }[]
}

export const withinPath = (parent: string, target: string): boolean => {
  const child = relative(parent, target)
  return child === '' || (!child.startsWith(`..${sep}`) && child !== '..' && !isAbsolute(child))
}

export const pathsOverlap = (a: string, b: string): boolean => withinPath(a, b) || withinPath(b, a)

async function assertNoSymlinkedComponents(targetPath: string, label: string): Promise<'exists' | 'absent'> {
  const resolved = resolve(targetPath)
  const ancestors: string[] = []
  for (let current = resolved; ; current = dirname(current)) {
    ancestors.push(current)
    if (dirname(current) === current) break
  }
  let absent = false
  for (const current of ancestors.reverse()) {
    try {
      const stats = await lstat(current)
      if (stats.isSymbolicLink()) {
        throw new Error(`${label} must not use symlinks: ${current}`)
      }
      if (absent) {
        throw new Error(`Unexpected state under absent ancestor: ${current}`)
      }
      if (current !== resolved && !stats.isDirectory()) {
        throw new Error(`${label} ancestor must be a directory: ${current}`)
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      absent = true
    }
  }
  return absent ? 'absent' : 'exists'
}

export async function validateOutputDirectoryState(outPath: string): Promise<'absent' | 'empty'> {
  const state = await assertNoSymlinkedComponents(outPath, 'Output path')
  if (state === 'absent') return 'absent'
  const stats = await lstat(outPath)
  if (!stats.isDirectory()) {
    throw new Error(`Output path must be a directory: ${outPath}`)
  }
  const entries = await readdir(outPath)
  if (entries.length > 0) {
    throw new Error(`Output directory must be empty or absent: ${outPath}`)
  }
  return 'empty'
}

async function assertSafeFragmentsTree(fragmentsDir: string, realRoot: string): Promise<void> {
  const visit = async (dir: string): Promise<void> => {
    const dirReal = await realpath(dir)
    if (!withinPath(realRoot, dirReal)) {
      throw new Error(`fragments directory escapes localized-docs root: ${dir}`)
    }
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      const stat = await lstat(fullPath)
      if (stat.isSymbolicLink()) {
        throw new Error(`Symbolic link is forbidden inside fragments/: ${fullPath}`)
      }
      if (stat.isDirectory()) {
        await visit(fullPath)
      } else if (!stat.isFile()) {
        throw new Error(`fragments/ entries must be regular files or directories: ${fullPath}`)
      }
    }
  }
  await visit(fragmentsDir)
}

async function readRegularFileIfPresent(
  filePath: string,
  realBaseDir: string,
): Promise<{ exists: true; text: string } | { exists: false }> {
  try {
    const stat = await lstat(filePath)
    if (stat.isSymbolicLink()) {
      throw new Error(`Symbolic link is forbidden: ${filePath}`)
    }
    if (!stat.isFile()) {
      throw new Error(`Expected regular file: ${filePath}`)
    }
    const resolved = await realpath(filePath)
    if (dirname(resolved) !== realBaseDir) {
      throw new Error(`File resolves outside expected directory: ${filePath}`)
    }
    return { exists: true, text: await readFile(resolved, 'utf8') }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { exists: false }
    }
    throw error
  }
}

export async function readLocalizedGroup(options: {
  root: string
  page?: string
}): Promise<ReadLocalizedGroupResult> {
  const resolvedRoot = resolve(options.root)
  const errors: LocalizedDocsError[] = []

  let rootStat
  try {
    rootStat = await lstat(resolvedRoot)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Localized docs root does not exist: ${resolvedRoot}`)
    }
    throw error
  }
  if (rootStat.isSymbolicLink()) {
    throw new Error(`Localized docs root must not be a symbolic link: ${resolvedRoot}`)
  }
  if (!rootStat.isDirectory()) {
    throw new Error(`Localized docs root must be a directory: ${resolvedRoot}`)
  }
  const realRoot = await realpath(resolvedRoot)

  // Variables.json (required)
  const varsFile = await readRegularFileIfPresent(join(realRoot, 'Variables.json'), realRoot)
  let variablesJsonText = ''
  let variables: Variables = {}
  if (!varsFile.exists) {
    errors.push(
      localizedError('CONFIG_FIELD_MISSING', 'Required file not found: Variables.json', {
        file: 'Variables.json',
      }, 1),
    )
  } else {
    variablesJsonText = varsFile.text
    const parsedVars = parseLocalizedVariables(variablesJsonText, { file: 'Variables.json' })
    if ('errors' in parsedVars) {
      errors.push(...parsedVars.errors)
    } else {
      variables = parsedVars.variables
    }
  }

  // fragments/ (optional)
  let hasFragmentsDir = false
  const fragmentsPath = join(realRoot, 'fragments')
  try {
    const fragStat = await lstat(fragmentsPath)
    if (fragStat.isSymbolicLink()) {
      errors.push(
        localizedError('SYMLINK_FORBIDDEN', 'fragments/ must not be a symbolic link', { file: 'fragments' }, 1),
      )
    } else if (!fragStat.isDirectory()) {
      errors.push(
        localizedError('CONFIG_FIELD_INVALID', 'fragments must be a directory when present', { file: 'fragments' }, 1),
      )
    } else {
      await assertSafeFragmentsTree(fragmentsPath, realRoot)
      hasFragmentsDir = true
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      errors.push(
        localizedError(
          'SYMLINK_FORBIDDEN',
          error instanceof Error ? error.message : String(error),
          { file: 'fragments' },
          1,
        ),
      )
    }
  }

  // pages/ (required)
  const pagesDir = join(realRoot, 'pages')
  let pageIdsToInspect: string[] = []
  let pagesDirReal: string | undefined
  try {
    const pagesStat = await lstat(pagesDir)
    if (pagesStat.isSymbolicLink()) {
      errors.push(localizedError('SYMLINK_FORBIDDEN', 'pages/ must not be a symbolic link', { file: 'pages' }, 1))
    } else if (!pagesStat.isDirectory()) {
      errors.push(localizedError('CONFIG_FIELD_INVALID', 'pages must be a directory', { file: 'pages' }, 1))
    } else {
      pagesDirReal = await realpath(pagesDir)
      if (!withinPath(realRoot, pagesDirReal)) {
        errors.push(localizedError('PATH_TRAVERSAL', 'pages/ escapes localized-docs root', { file: 'pages' }, 1))
      } else if (options.page !== undefined) {
        const idCheck = validatePageId(options.page, { file: 'pages', page: options.page })
        if ('errors' in idCheck) {
          errors.push(...idCheck.errors)
        } else {
          pageIdsToInspect = [options.page]
        }
      } else {
        const dirEntries = await readdir(pagesDirReal, { withFileTypes: true })
        pageIdsToInspect = dirEntries.map(entry => entry.name).sort((a, b) => a.localeCompare(b, 'en'))
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      errors.push(localizedError('CONFIG_FIELD_MISSING', 'Required pages directory not found', { file: 'pages' }, 1))
    } else {
      throw error
    }
  }

  const pages: ReadPageEntry[] = []
  if (pagesDirReal) {
    for (const pageId of pageIdsToInspect) {
      const idCheck = validatePageId(pageId, { file: `pages/${pageId}`, page: pageId })
      if ('errors' in idCheck) {
        errors.push(...idCheck.errors)
        continue
      }

      const candidateDir = join(pagesDirReal, pageId)
      let pageStat
      try {
        pageStat = await lstat(candidateDir)
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          errors.push(
            localizedError('CONFIG_FIELD_MISSING', `Page directory not found: pages/${pageId}`, {
              file: `pages/${pageId}`,
              page: pageId,
            }, 1),
          )
          continue
        }
        throw error
      }

      if (pageStat.isSymbolicLink()) {
        errors.push(
          localizedError('SYMLINK_FORBIDDEN', `Page directory must not be a symbolic link: pages/${pageId}`, {
            file: `pages/${pageId}`,
            page: pageId,
          }, 1),
        )
        continue
      }
      if (!pageStat.isDirectory()) {
        errors.push(
          localizedError('CONFIG_FIELD_INVALID', `Expected directory under pages/: ${pageId}`, {
            file: `pages/${pageId}`,
            page: pageId,
          }, 1),
        )
        continue
      }

      const pageRealDir = await realpath(candidateDir)
      if (!withinPath(pagesDirReal, pageRealDir) || dirname(pageRealDir) !== pagesDirReal) {
        errors.push(
          localizedError('PATH_TRAVERSAL', `Page directory escapes pages/: ${pageId}`, {
            file: `pages/${pageId}`,
            page: pageId,
          }, 1),
        )
        continue
      }

      let pageYamlFile
      let sourceMdFile
      let baselineFile
      try {
        ;[pageYamlFile, sourceMdFile, baselineFile] = await Promise.all([
          readRegularFileIfPresent(join(pageRealDir, 'page.yaml'), pageRealDir),
          readRegularFileIfPresent(join(pageRealDir, 'source.md'), pageRealDir),
          readRegularFileIfPresent(join(pageRealDir, '.baseline.json'), pageRealDir),
        ])
      } catch (error) {
        errors.push(
          localizedError(
            'SYMLINK_FORBIDDEN',
            error instanceof Error ? error.message : String(error),
            { file: `pages/${pageId}`, page: pageId },
            1,
          ),
        )
        continue
      }

      if (!pageYamlFile.exists) {
        errors.push(
          localizedError('CONFIG_FIELD_MISSING', `Required file not found: pages/${pageId}/page.yaml`, {
            file: `pages/${pageId}/page.yaml`,
            page: pageId,
          }, 1),
        )
        continue
      }

      const parsedConfig = parseLocalizedPageConfig(pageId, pageYamlFile.text, {
        file: `pages/${pageId}/page.yaml`,
        page: pageId,
      })
      if ('errors' in parsedConfig) {
        errors.push(...parsedConfig.errors)
        continue
      }

      let parsedBaseline: BaselineJson | undefined
      if (baselineFile.exists) {
        const baselineResult = parseBaselineJson(baselineFile.text, {
          file: `pages/${pageId}/.baseline.json`,
          page: pageId,
        })
        if ('errors' in baselineResult) {
          errors.push(...baselineResult.errors)
        } else {
          parsedBaseline = baselineResult.baseline
        }
      }

      const lifecycleState = resolvePageLifecycleState(
        parsedConfig.config.mode,
        sourceMdFile.exists,
        baselineFile.exists,
      )

      pages.push({
        pageId,
        pageDir: pageRealDir,
        pageYamlText: pageYamlFile.text,
        config: parsedConfig.config,
        hasSourceMd: sourceMdFile.exists,
        ...(sourceMdFile.exists ? { sourceMdText: sourceMdFile.text } : {}),
        hasBaselineJson: baselineFile.exists,
        ...(baselineFile.exists ? { baselineJsonText: baselineFile.text } : {}),
        ...(parsedBaseline ? { baseline: parsedBaseline } : {}),
        lifecycleState,
      })
    }
  }

  return {
    root: resolvedRoot,
    realRoot,
    hasFragmentsDir,
    variablesJsonText,
    variables,
    pages,
    errors,
  }
}

export async function writeLocalizedBuildOutput(options: {
  root: string
  out: string
  pages: readonly BuiltLocalizedPageOutput[]
  manifest: LocalizedBuildManifest
}): Promise<void> {
  const resolvedRoot = resolve(options.root)
  const realRoot = await realpath(resolvedRoot)
  const resolvedOut = resolve(options.out)

  if (pathsOverlap(resolvedOut, resolvedRoot) || pathsOverlap(resolvedOut, realRoot)) {
    throw new Error(`Output directory must not overlap localized-docs root: ${resolvedOut}`)
  }

  const state = await validateOutputDirectoryState(resolvedOut)
  if (state === 'empty') {
    const realOut = await realpath(resolvedOut)
    if (pathsOverlap(realOut, realRoot)) {
      throw new Error(`Output directory must not overlap localized-docs root: ${resolvedOut}`)
    }
  }

  await mkdir(dirname(resolvedOut), { recursive: true })
  const stage = await mkdtemp(join(dirname(resolvedOut), '.localized-docs-build-'))
  try {
    for (const page of options.pages) {
      const target = join(stage, `${page.pageId}.mdx`)
      if (!withinPath(stage, target)) {
        throw new Error(`Output escapes staging directory: ${target}`)
      }
      await writeFile(target, page.mdx, { flag: 'wx' })
    }
    const manifestTarget = join(stage, 'manifest.json')
    await writeFile(manifestTarget, `${JSON.stringify(options.manifest, null, 2)}\n`, { flag: 'wx' })

    if ((await validateOutputDirectoryState(resolvedOut)) === 'empty') {
      await rmdir(resolvedOut)
    }
    await rename(stage, resolvedOut)
  } finally {
    await rm(stage, { recursive: true, force: true })
  }
}
