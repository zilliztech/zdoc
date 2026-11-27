import { lstatSync, mkdtempSync, realpathSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { RealMd2md } from '../../shared-docs/adapters/md2md.ts'
import type { PreprocessAdapter, PreprocessAdapterResult, Variables } from '../core/types.ts'

export interface LocalizedMd2mdOptions {
  groupRoot: string
  hasFragmentsDir: boolean
}

export function createLocalizedPreprocessAdapter(options: LocalizedMd2mdOptions): PreprocessAdapter {
  const md2md = new RealMd2md()

  return {
    preprocess(input: { content: string; variables: Variables; sourceName?: string }): PreprocessAdapterResult {
      if (options.hasFragmentsDir) {
        const resolvedRoot = resolve(options.groupRoot)
        const rootStat = lstatSync(resolvedRoot)
        if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
          throw new Error(`Localized docs root must be a regular directory: ${resolvedRoot}`)
        }
        const fragmentsPath = join(resolvedRoot, 'fragments')
        const fragStat = lstatSync(fragmentsPath)
        if (fragStat.isSymbolicLink() || !fragStat.isDirectory()) {
          throw new Error(`Localized docs fragments must be a regular directory: ${fragmentsPath}`)
        }
        const realRoot = realpathSync(resolvedRoot)
        return md2md.preprocess({
          content: input.content,
          fragmentRoot: realRoot,
          variables: input.variables,
          sourceName: input.sourceName,
        })
      }

      const emptyRoot = mkdtempSync(join(tmpdir(), 'localized-docs-empty-fragments-'))
      try {
        return md2md.preprocess({
          content: input.content,
          fragmentRoot: emptyRoot,
          variables: input.variables,
          sourceName: input.sourceName,
        })
      } finally {
        rmSync(emptyRoot, { recursive: true, force: true })
      }
    },
  }
}
