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

type MdxOptions = { preserveFrontMatter?: boolean }
export async function toMdx(adapted: AdaptedPage, context: DiagnosticContext, { preserveFrontMatter = false }: MdxOptions = {}): Promise<{ mdx: string } | { errors: SharedDocsError[] }> {
  const markdown = adapted.markdown
  let mdx = markdown
  let sources: (number | null)[] | undefined
  const failure = (message: string, outputLine?: number): SharedDocsError => {
    if (outputLine !== undefined) {
      sources ??= patchedLineMap(markdown.split('\n'), mdx.split('\n'), adapted.provenance.outputLines)
    }
    const line = outputLine === undefined ? undefined : sources?.[outputLine - 1] ?? undefined
    return { ...context, code: 'ADAPT_MDX_INVALID', message, ...(line === undefined ? {} : { line }),
      detail: { ...(line === undefined ? {} : { text: adapted.provenance.inputLines[line - 1] }) } }
  }
  // Structural cleanup must not silently discard malformed component content.
  const before = (validateMdxStructure(mdx) as string[]).filter(message => /^prose found between|^\d+ (?:unclosed|extra)/.test(message))
  if (before.length) return { errors: before.map(message => failure(message)) }
  try {
    const front = preserveFrontMatter ? /^---[ \t]*\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.exec(mdx)?.[0] || '' : ''
    mdx = front + await applyMdxPatches(mdx.slice(front.length), { repairEndTagMismatch: true })
    const structure = validateMdxStructure(mdx) as string[]
    const errors = structure.map(message => failure(message))
    try {
      const { compile, remarkMath } = await compiler()
      await compile(preserveFrontMatter ? mdx.slice(front.length) : mdx, { development: false, remarkPlugins: [remarkMath] })
    } catch (error) {
      const problem = error as { message: string; line?: number; place?: { line?: number; start?: { line?: number } } }
      const bodyLine = problem.line ?? problem.place?.line ?? problem.place?.start?.line
      errors.push(failure(problem.message, bodyLine === undefined ? undefined : bodyLine + (front.match(/\n/g)?.length || 0)))
    }
    if (errors.length) return { errors }
    return { mdx }
  } catch (error) {
    return { errors: [failure(error instanceof Error ? error.message : String(error))] }
  }
}

/** Per historical worker, share only successfully validated text. A failed parse
 * must report the file, channel and source lines from each caller's own input. */
export function createHistoricalMdxFinalizer(): typeof toMdx {
  const maxBytes = 4 * 1024 * 1024, maxEntries = 32
  type Entry = { mdx: Promise<string | undefined>; bytes: number }
  const entries = new Map<string, Entry>()
  let used = 0
  function remove(key: string) {
    used -= entries.get(key)!.bytes
    entries.delete(key)
  }
  function put(key: string, entry: Entry) {
    while (entries.size >= maxEntries || used + entry.bytes > maxBytes) remove(entries.keys().next().value!)
    entries.set(key, entry)
    used += entry.bytes
  }
  return async (adapted, context, { preserveFrontMatter = false } = {}) => {
    const options = { preserveFrontMatter }
    const key = (preserveFrontMatter ? '1' : '0') + adapted.markdown
    const hit = entries.get(key)
    if (hit) {
      const mdx = await hit.mdx
      if (mdx !== undefined) return { mdx }
      return toMdx(adapted, context, options)
    }
    const keyBytes = 2 * key.length + 1024
    if (keyBytes > maxBytes) return toMdx(adapted, context, options)
    const rendering = toMdx(adapted, context, options)
    const entry = { bytes: keyBytes, mdx: rendering.then(result => 'mdx' in result ? result.mdx : undefined, () => undefined) }
    put(key, entry)
    let mdx: string | undefined
    try {
      const result = await rendering
      if ('mdx' in result) mdx = result.mdx
      return result
    } finally {
      // Other commits can evict pending work; a late completion must never replace a newer entry.
      if (entries.get(key) === entry) {
        remove(key)
        if (mdx !== undefined) {
          const bytes = keyBytes + 2 * mdx.length
          if (bytes <= maxBytes) put(key, { bytes, mdx: entry.mdx })
        }
      }
    }
  }
}
