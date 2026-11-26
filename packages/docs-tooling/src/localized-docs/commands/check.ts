import { readLocalizedGroup } from '../adapters/fs-reader.ts'
import { createLocalizedPreprocessAdapter } from '../adapters/md2md.ts'
import { localizedMdxAdapter } from '../adapters/mdx.ts'
import { assembleLocalizedPage } from '../core/assemble.ts'
import { validateBaselineConsistency } from '../core/baseline.ts'
import type { LocalizedDocsError } from '../core/types.ts'
import { formatDiagnostic, localizedError } from '../core/types.ts'

export interface CheckOptions {
  root: string
  page?: string
}

export async function runCheck(
  options: CheckOptions,
  write: (text: string) => void = text => process.stdout.write(text),
  writeError: (text: string) => void = text => process.stderr.write(text),
): Promise<number> {
  try {
    const group = await readLocalizedGroup({ root: options.root, page: options.page })
    const errors: LocalizedDocsError[] = [...group.errors]
    const preprocessAdapter = createLocalizedPreprocessAdapter({
      groupRoot: group.realRoot,
      hasFragmentsDir: group.hasFragmentsDir,
    })

    for (const page of group.pages) {
      if (page.lifecycleState === 'pending-initial-translation') {
        write(`[${page.pageId}] status: pending-initial-translation\n`)
        continue
      }
      if (page.lifecycleState === 'paused') {
        write(`[${page.pageId}] status: paused\n`)
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
        write(
          `[${page.pageId}] status: ready (uiTags=${assembled.uiTags.length}, components=${assembled.components.join(',') || 'none'})\n`,
        )
      }
    }

    if (errors.length > 0) {
      for (const error of errors) {
        writeError(`${formatDiagnostic(error)}\n`)
      }
      return 1
    }

    write(`Localized docs check passed for ${group.pages.length} page(s).\n`)
    return 0
  } catch (error) {
    writeError(`Check failed: ${error instanceof Error ? error.message : String(error)}\n`)
    return 1
  }
}
