import { lstatSync, readFileSync, realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LocaleContractIssue, LocaleContractSupport } from '../core/draft.ts'

interface LocaleContractModule {
  loadLocaleContract(
    targetId: string,
    repositoryRoot?: string,
  ): {
    contractId: string
  }
  formatLocaleContract(contract: unknown): string
  applyDeterministicLocaleRepairs(
    sourceContent: string,
    draftContent: string,
    contract: unknown,
  ): string
  validateLocaleContractDraft(
    sourceContent: string,
    draftContent: string,
    contract: unknown,
  ): readonly LocaleContractIssue[]
}

export interface LoadContractSupportOptions {
  repositoryRoot?: string
  styleGuidePath?: string
  target?: 'zh-CN-guides'
}

const DEFAULT_REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..')

function assertRegularFileNoSymlink(filePath: string, label: string): string {
  const resolved = resolve(filePath)
  const ancestors: string[] = []
  for (let current = resolved; ; current = dirname(current)) {
    ancestors.push(current)
    if (dirname(current) === current) break
  }
  for (const current of ancestors.reverse()) {
    const stat = lstatSync(current)
    if (stat.isSymbolicLink()) {
      throw new Error(`${label} must not use symbolic links: ${current}`)
    }
  }
  const stat = lstatSync(resolved)
  if (!stat.isFile()) {
    throw new Error(`${label} must be a regular file: ${resolved}`)
  }
  return realpathSync(resolved)
}

export function extractStyleGuideChapters0And1(markdown: string): string {
  const normalized = markdown.replace(/^\uFEFF/, '').replace(/\r\n|\r/g, '\n')
  const chapter2Idx = normalized.indexOf('\n## 2.')
  if (chapter2Idx >= 0) {
    return normalized.slice(0, chapter2Idx).trim()
  }
  return normalized.trim()
}

export function loadLocalizedContractSupport(
  options: LoadContractSupportOptions = {},
): LocaleContractSupport {
  const repoRoot = resolve(options.repositoryRoot ?? DEFAULT_REPO_ROOT)
  const target = options.target ?? 'zh-CN-guides'

  const require = createRequire(import.meta.url)
  const contractLoaderPath = assertRegularFileNoSymlink(
    join(repoRoot, 'scripts/translation/localeContract.js'),
    'localeContract.js',
  )
  const localeContract = require(contractLoaderPath) as LocaleContractModule
  const contract = localeContract.loadLocaleContract(target, repoRoot)

  const styleGuideTarget = options.styleGuidePath
    ? resolve(options.styleGuidePath)
    : join(repoRoot, '.github/prompts/codex-style-guide.zh-CN-reference.md')

  let styleGuideExcerpt = ''
  if (options.styleGuidePath) {
    const safeStylePath = assertRegularFileNoSymlink(styleGuideTarget, 'Style guide')
    styleGuideExcerpt = extractStyleGuideChapters0And1(readFileSync(safeStylePath, 'utf8'))
  } else {
    try {
      const safeStylePath = assertRegularFileNoSymlink(styleGuideTarget, 'Style guide')
      styleGuideExcerpt = extractStyleGuideChapters0And1(readFileSync(safeStylePath, 'utf8'))
    } catch {
      styleGuideExcerpt = ''
    }
  }

  return {
    contractId: contract.contractId,
    formattedContract: localeContract.formatLocaleContract(contract),
    styleGuideExcerpt,
    applyDeterministicRepairs(sourceEn: string, draftZh: string): string {
      return localeContract.applyDeterministicLocaleRepairs(sourceEn, draftZh, contract)
    },
    validateDraft(sourceEn: string, draftZh: string): readonly LocaleContractIssue[] {
      return localeContract.validateLocaleContractDraft(sourceEn, draftZh, contract)
    },
  }
}
