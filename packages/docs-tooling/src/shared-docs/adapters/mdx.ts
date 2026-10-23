import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { compileFunction, constants } from 'node:vm'
import { applyMdxPatches, validateMdxStructure } from '../../mdx/index'
import type { AdaptedPage } from '../core/site'
import type { DiagnosticContext, SharedDocsError } from '../core/types'

// The repository's jiti 1 launcher lowers import() to require(). MDX's ESM-only
// dependency graph must instead use Node's native loader, as validate.cjs does.
const require = createRequire(import.meta.url)
const importEsm = compileFunction('return import(url)', ['url'], {
  importModuleDynamically: constants.USE_MAIN_CONTEXT_DEFAULT_LOADER,
}) as (url: string) => Promise<unknown>
async function compiler() {
  const mdx = await importEsm(pathToFileURL(require.resolve('@mdx-js/mdx')).href) as typeof import('@mdx-js/mdx')
  const math = await importEsm(pathToFileURL(require.resolve('remark-math')).href) as typeof import('remark-math')
  return { compile: mdx.compile, remarkMath: math.default }
}

/** Align patched lines to their pre-patch source without mistaking escaped text for insertion. */
function patchedLineMap(before: string[], after: string[], sources: readonly (number | null)[]): (number | null)[] {
  if (before.length === after.length) return [...sources]
  // Patching normally edits in place. Cleanup can also remove complete lines;
  // a sequence alignment preserves source locations beyond those deletions.
  const normalize = (line: string) => line.replace(/\\([{}<])/g, '$1').replace(/&lt;/g, '<')
  const a = before.map(normalize)
  const b = after.map(normalize)
  const rows = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1))
  for (let i = a.length; i >= 0; i--) {
    for (let j = b.length; j >= 0; j--) {
      if (i === a.length) rows[i][j] = b.length - j
      else if (j === b.length) rows[i][j] = a.length - i
      else rows[i][j] = Math.min(rows[i + 1][j + 1] + (a[i] === b[j] ? 0 : 1), rows[i + 1][j] + 1, rows[i][j + 1] + 1)
    }
  }
  const result: (number | null)[] = []
  let i = 0; let j = 0
  while (j < b.length) {
    if (i < a.length && rows[i][j] === rows[i + 1][j + 1] + (a[i] === b[j] ? 0 : 1)) { result.push(sources[i] ?? null); i++; j++ }
    else if (i < a.length && rows[i][j] === rows[i + 1][j] + 1) i++
    else { result.push(null); j++ }
  }
  return result
}

export async function toMdx(adapted: AdaptedPage, context: DiagnosticContext): Promise<{ mdx: string } | { errors: SharedDocsError[] }> {
  let mdx = adapted.markdown
  let sources = [...adapted.provenance.outputLines]
  const failure = (message: string, outputLine?: number): SharedDocsError => {
    const line = outputLine === undefined ? undefined : sources[outputLine - 1] ?? undefined
    return { ...context, code: 'ADAPT_MDX_INVALID', message, ...(line === undefined ? {} : { line }),
      detail: { ...(line === undefined ? {} : { text: adapted.provenance.inputLines[line - 1] }) } }
  }
  // Structural cleanup must not silently discard malformed component content.
  const before = (validateMdxStructure(mdx) as string[]).filter(message => /^prose found between|^\d+ (?:unclosed|extra)/.test(message))
  if (before.length) return { errors: before.map(message => failure(message)) }
  try {
    mdx = await applyMdxPatches(mdx, { repairEndTagMismatch: true })
    sources = patchedLineMap(adapted.markdown.split('\n'), mdx.split('\n'), sources)
    const structure = validateMdxStructure(mdx) as string[]
    const errors = structure.map(message => failure(message))
    try {
      const { compile, remarkMath } = await compiler()
      await compile(mdx, { development: false, remarkPlugins: [remarkMath] })
    }
    catch (error) {
      const problem = error as { message: string; line?: number; place?: { line?: number; start?: { line?: number } } }
      errors.push(failure(problem.message, problem.line ?? problem.place?.line ?? problem.place?.start?.line))
    }
    return errors.length ? { errors } : { mdx }
  } catch (error) {
    return { errors: [failure(error instanceof Error ? error.message : String(error))] }
  }
}
