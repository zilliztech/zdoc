import { execFileSync } from 'node:child_process'
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { GitMilvusDocsReader } from '../../adapters/git-milvus-docs-reader'
import { inspectPage } from '../../adapters/inspect-page'
import { RealMd2md } from '../../adapters/md2md'
import { checkProductNames, parseProductNames } from '../../core/product-names'
import type { ProductNameDetail, ProductNameSource } from '../../core/product-names'
import { scanProductNames } from '../../core/product-names/scan'
import type { Channel } from '../../core/types'

export interface PilotCount {
  page: string
  channel: Channel
  manual: string
  mdxHits: Record<string, number>
  inputDiagnostics: Record<string, number>
}

/** Read the frozen pilot bytes through WP3; never fetch or alter a real source checkout. */
export async function countPilotProductNames(): Promise<PilotCount[]> {
  const pilots = fileURLToPath(new URL('../../fixtures/pilots/', import.meta.url))
  const pages = ['delete-entities', 'filtered-search', 'openai']
  const parsed = parseProductNames(await readFile(new URL('../../fixtures/product-names/product-names.yaml', import.meta.url), 'utf8'), {})
  if ('errors' in parsed) throw new Error(JSON.stringify(parsed.errors))
  const { rules } = parsed
  const repo = await mkdtemp(join(tmpdir(), 'shared-docs-product-names-pilots-'))
  try {
    for (const page of pages) await cp(join(pilots, page, 'milvus-docs'), repo, { recursive: true })
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
    Object.assign(env, { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_AUTHOR_NAME: 'Pilot Check', GIT_AUTHOR_EMAIL: 'pilot@example.test',
      GIT_COMMITTER_NAME: 'Pilot Check', GIT_COMMITTER_EMAIL: 'pilot@example.test',
      GIT_AUTHOR_DATE: '2020-01-01T00:00:00Z', GIT_COMMITTER_DATE: '2020-01-01T00:00:00Z' })
    const git = (...args: string[]) => execFileSync('git', ['-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', '-C', repo, ...args],
      { env, encoding: 'utf8' }).trim()
    git('init', '--quiet', '-b', 'v3.0.x')
    git('add', '--all')
    git('commit', '--quiet', '-m', 'Frozen pilot source inputs')
    const commit = git('rev-parse', 'HEAD')
    const reader = new GitMilvusDocsReader(repo)
    const rows: PilotCount[] = []
    const counts = (spellings: string[]) => Object.fromEntries(rules.check.map(spelling =>
      [spelling, spellings.filter(value => value === spelling).length]))
    for (const page of pages) {
      const shared = join(pilots, page, 'shared-docs/guides')
      const variablesJson = await readFile(join(shared, 'Variables.json'), 'utf8')
      const inspected = await inspectPage({ pageId: page,
        sourceYaml: 'schema_version: 1\nrepository: https://github.com/milvus-io/milvus-docs\ntrack: v3.0.x\n',
        pageYaml: await readFile(join(shared, 'page.yaml'), 'utf8'),
        lockYaml: JSON.stringify({ schema_version: 1, current: commit, next: commit }), variablesJson,
        context: { manuals: ['guides', 'guides-byoc'], betaValues: ['FALSE', 'PUBLIC', 'PRIVATE', 'CONTACT SALES'] },
      }, reader, new RealMd2md())
      if ('errors' in inspected) throw new Error(JSON.stringify(inspected.errors))
      for (const channel of ['current', 'next'] as const) {
        const version = inspected.channels[channel]
        const sources: ProductNameSource[] = [{ kind: 'source', file: inspected.config.source.file,
          text: await reader.readFile(version.commit, inspected.config.source.file) }]
        await reader.withFragments(version.commit, async snapshot => {
          for (const dependency of version.dependencies.fragments) {
            const text = snapshot.files.get(dependency.path)
            if (text === undefined) throw new Error(`Missing used fragment: ${dependency.path}`)
            sources.push({ kind: 'fragment', file: `site/en/${dependency.path}`, text })
          }
        })
        for (const { key } of version.dependencies.variables) {
          let value = JSON.parse(variablesJson)
          for (const part of key.split('.')) {
            const name = Object.keys(value).find(name => name.toLowerCase() === part.toLowerCase())
            if (name === undefined) throw new Error(`Missing used variable: ${key}`)
            value = value[name]
          }
          sources.push({ kind: 'variable', file: 'shared-docs/guides/Variables.json', key, text: String(value) })
        }
        for (const { manual } of inspected.config.publish) {
          // WP4 is deliberately not invoked: these counts are the pre-adaptation alignment baseline.
          const { errors } = checkProductNames({ mdx: version.content, rules, manual, sources, context: { page, channel } })
          rows.push({ page, channel, manual, mdxHits: counts(scanProductNames(version.content, rules).map(hit => hit.spelling)),
            inputDiagnostics: counts(errors.map(error => (error.detail as ProductNameDetail).spelling)) })
        }
      }
    }
    return rows
  } finally { await rm(repo, { recursive: true, force: true }) }
}
