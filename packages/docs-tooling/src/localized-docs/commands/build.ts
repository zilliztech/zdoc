import { resolve } from 'node:path'
import {
  pathsOverlap,
  readLocalizedGroup,
  validateOutputDirectoryState,
  writeLocalizedBuildOutput,
} from '../adapters/fs-reader.ts'
import type { BuiltLocalizedPageOutput, LocalizedBuildManifest } from '../adapters/fs-reader.ts'
import { createLocalizedPreprocessAdapter } from '../adapters/md2md.ts'
import { localizedMdxAdapter } from '../adapters/mdx.ts'
import { assembleLocalizedPage } from '../core/assemble.ts'
import { validateBaselineConsistency } from '../core/baseline.ts'
import type { LocalizedDocsError } from '../core/types.ts'
import { formatDiagnostic, localizedError, sha256Hex } from '../core/types.ts'

export interface BuildOptions {
  root: string
  out: string
  page?: string
}

export async function runBuild(
  options: BuildOptions,
  write: (text: string) => void = text => process.stdout.write(text),
  writeError: (text: string) => void = text => process.stderr.write(text),
): Promise<number> {
  try {
    const resolvedOut = resolve(options.out)
    const resolvedRoot = resolve(options.root)
    if (pathsOverlap(resolvedOut, resolvedRoot)) {
      throw new Error(`Output directory must not overlap localized-docs root: ${resolvedOut}`)
    }
    await validateOutputDirectoryState(resolvedOut)

    const group = await readLocalizedGroup({ root: options.root, page: options.page })
    if (pathsOverlap(resolvedOut, group.realRoot)) {
      throw new Error(`Output directory must not overlap localized-docs root: ${resolvedOut}`)
    }

    const errors: LocalizedDocsError[] = [...group.errors]
    const preprocessAdapter = createLocalizedPreprocessAdapter({
      groupRoot: group.realRoot,
      hasFragmentsDir: group.hasFragmentsDir,
    })

    const builtPages: BuiltLocalizedPageOutput[] = []
    const skippedPages: LocalizedBuildManifest['skipped_pages'] = []

    for (const page of group.pages) {
      if (page.lifecycleState === 'pending-initial-translation') {
        skippedPages.push({ page_id: page.pageId, state: 'pending-initial-translation' })
        continue
      }
      if (page.lifecycleState === 'paused') {
        skippedPages.push({ page_id: page.pageId, state: 'paused' })
        continue
      }
      if (page.lifecycleState === 'baseline-missing-error') {
        errors.push(
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
        errors.push(
          localizedError(
            'SOURCE_MISSING',
            `Page "${page.pageId}" (mode=${page.config.mode}) is missing source.md`,
            { file: `pages/${page.pageId}/source.md`, page: page.pageId },
            1,
          ),
        )
        continue
      }

      if (page.baseline) {
        errors.push(
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
        errors.push(...assembled.errors)
      } else {
        builtPages.push({
          pageId: page.pageId,
          mdx: assembled.mdx,
          title: assembled.title,
          description: assembled.description,
          components: assembled.components,
          sourceSha256: sha256Hex(page.sourceMdText!),
          dependencies: assembled.dependencies,
          engine: assembled.engine,
        })
      }
    }

    if (errors.length > 0) {
      for (const error of errors) {
        writeError(`${formatDiagnostic(error)}\n`)
      }
      return 1
    }

    const manifest: LocalizedBuildManifest = {
      schema_version: 1,
      built_pages: builtPages.map(page => ({
        page_id: page.pageId,
        output_file: `${page.pageId}.mdx`,
        source_sha256: page.sourceSha256,
        components: page.components,
        dependencies: page.dependencies,
        engine: page.engine,
      })),
      skipped_pages: skippedPages,
    }

    await writeLocalizedBuildOutput({
      root: group.root,
      out: resolvedOut,
      pages: builtPages,
      manifest,
    })

    write(`${JSON.stringify(manifest, null, 2)}\n`)
    return 0
  } catch (error) {
    writeError(`Build failed: ${error instanceof Error ? error.message : String(error)}\n`)
    return 1
  }
}
