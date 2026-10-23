import { execFile } from 'node:child_process'
import { lstat, readFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { parseYaml } from '../core/yaml'
import { collectLabeledLinks } from '../core/links/references'
import { requirePath } from './reader-errors'

export interface ZdocPage { readonly path: string; readonly slug: string; readonly title: string }
export interface ZdocInternalLink { readonly text: string; readonly target: string }
export interface ZdocContentReader {
  listPages(): Promise<readonly ZdocPage[]>
  readInternalLinks(pagePath: string): Promise<readonly ZdocInternalLink[]>
  readFrontMatter(pagePath: string): Promise<Readonly<Record<string, unknown>>>
  /** Require a clean selected manual before attributing its content to this commit. */
  getCommit(): Promise<string>
}

/** Reads one manual directly, including a checkout containing only that directory. */
export function createZdocContentReader(options: { checkout: string; manualDirectory: string }): ZdocContentReader {
  const manual = options.manualDirectory.replace(/\/$/, '')
  requirePath(manual)
  const checkout = resolve(options.checkout)
  const root = join(checkout, manual)
  const pages = new Map<string, Promise<{ markdown: string; meta: Record<string, unknown> }>>()
  async function regularPath(relative: string) {
    requirePath(relative)
    let path = checkout
    for (const part of `${manual}/${relative}`.split('/')) {
      path = join(path, part)
      if ((await lstat(path)).isSymbolicLink()) throw new Error(`Symbolic link in manual path: ${path}`)
    }
    if (!(await lstat(path)).isFile()) throw new Error(`Expected a regular page: ${relative}`)
    return path
  }
  function read(pagePath: string) {
    requirePath(pagePath)
    if (!/\.mdx?$/.test(pagePath)) throw new Error(`Expected a Markdown page: ${pagePath}`)
    let pending = pages.get(pagePath)
    if (!pending) {
      pending = (async () => {
        const markdown = await readFile(await regularPath(pagePath), 'utf8')
        const front = /^---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/.exec(markdown)
        if (!front) throw new Error(`Missing front matter: ${pagePath}`)
        const parsed = parseYaml(front[1], 'CONFIG_SYNTAX_INVALID', { file: pagePath })
        if ('errors' in parsed) throw new Error(JSON.stringify(parsed.errors))
        const meta = parsed.document.value
        if (!meta || typeof meta !== 'object' || Array.isArray(meta)) throw new Error(`Invalid front matter: ${pagePath}`)
        return { markdown, meta: meta as Record<string, unknown> }
      })()
      pages.set(pagePath, pending)
    }
    return pending
  }
  async function git(args: string[]) {
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
    Object.assign(env, { GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' })
    return (await promisify(execFile)('git', ['--no-replace-objects', '-C', checkout, ...args],
      { env, timeout: 30_000, maxBuffer: 4 * 1024 * 1024 })).stdout
  }
  return {
    async listPages() {
      const files: string[] = []
      // Check the manual's ancestors before traversing it, including sparse worktrees.
      let directory = checkout
      for (const part of manual.split('/')) {
        directory = join(directory, part)
        if (!(await lstat(directory)).isDirectory() || (await lstat(directory)).isSymbolicLink()) {
          throw new Error(`Expected a regular manual directory: ${manual}`)
        }
      }
      async function walk(prefix: string) {
        for (const entry of await readdir(join(root, prefix), { withFileTypes: true })) {
          const path = prefix ? `${prefix}/${entry.name}` : entry.name
          if (entry.isSymbolicLink()) throw new Error(`Symbolic link in manual: ${path}`)
          if (entry.isDirectory()) await walk(path)
          else if (entry.isFile() && /\.mdx?$/.test(entry.name)) files.push(path)
        }
      }
      await walk('')
      const result: ZdocPage[] = []
      const slugs = new Set<string>()
      for (const path of files.sort()) {
        const { meta } = await read(path)
        if (typeof meta.slug !== 'string' || !meta.slug) continue
        const slug = meta.slug.replace(/^\/+/, '')
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid Cloud slug in ${path}: ${slug}`)
        if (slugs.has(slug)) throw new Error(`Duplicate Cloud slug: ${slug}`)
        slugs.add(slug)
        const title = typeof meta.title === 'string' ? meta.title.replace(/\s*\|\s*(Cloud|BYOC)\s*$/, '') : ''
        result.push({ path, slug, title })
      }
      return result
    },
    async readInternalLinks(pagePath) {
      return collectLabeledLinks((await read(pagePath)).markdown).filter(link => link.url.startsWith('./'))
        .map(link => ({ text: link.text, target: link.url }))
    },
    async readFrontMatter(pagePath) { return structuredClone((await read(pagePath)).meta) },
    async getCommit() {
      const status = await git(['status', '--porcelain=v1', '--untracked-files=all', '--', `:(literal)${manual}`])
      if (status) throw new Error(`Selected manual has uncommitted changes: ${manual}`)
      return (await git(['rev-parse', '--verify', 'HEAD^{commit}'])).trim()
    },
  }
}
