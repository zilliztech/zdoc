import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { cp, mkdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inspectPage } from '../../adapters/inspect-page'
import { GitMilvusDocsReader } from '../../adapters/git-milvus-docs-reader'
import { RealMd2md } from '../../adapters/md2md'
import { inspectionContext } from '../../commands/inspect'
import { adaptPage, parseTabsRules } from '../../core/site'
import type { AdaptedPage, AdaptPageInput } from '../../core/site'
import { createInspectDemo } from '../demo'

export const context = { file: 'page.md', page: 'example', channel: 'current' as const }
export const rulesText = readFileSync(new URL('../../fixtures/site/cloud-sdk-tabs.yaml', import.meta.url), 'utf8')
export function rules(text = rulesText) {
  const result = parseTabsRules(text, { ...context, file: 'rules.yaml' })
  if ('errors' in result) throw new Error(JSON.stringify(result.errors))
  return result.rules
}
/** Deliberately a test stub, not the WP5 Cloud anchor algorithm. */
export const headingStub = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const page = (body: string) => `---\ntitle: Example\nsummary: An example.\n---\n\n${body}\n`
export function adapt(markdown: string, overrides: Partial<AdaptPageInput> = {}) {
  return adaptPage({ markdown, pageId: 'example', manual: 'guides', tabsRules: rules(),
    betaValues: inspectionContext.betaValues, headingAnchor: headingStub, context, ...overrides })
}
export function adapted(markdown: string, overrides: Partial<AdaptPageInput> = {}): AdaptedPage {
  const result = adapt(markdown, overrides)
  if ('errors' in result) throw new Error(JSON.stringify(result.errors))
  return result
}
export const group = (...languages: string[]) => '<div class="multipleCode"><a>Ignored</a></div>\n\n'
  + languages.map(language => `\`\`\`${language}\nvalue\n\`\`\``).join('\n\n')

/** Retained pilot bytes enter WP3 through a committed, isolated local Git repository. */
export async function preparePilot(root: string, pageId: string) {
  const demo = await createInspectDemo(root)
  const pilot = fileURLToPath(new URL(`../../fixtures/pilots/${pageId}/`, import.meta.url))
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
  Object.assign(env, { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_AUTHOR_NAME: 'Site fixtures',
    GIT_AUTHOR_EMAIL: 'fixtures@example.test', GIT_COMMITTER_NAME: 'Site fixtures', GIT_COMMITTER_EMAIL: 'fixtures@example.test' })
  const git = (...args: string[]) => execFileSync('git', ['-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', '-C', demo.repo, ...args], { env, stdio: 'pipe' })
  git('checkout', 'v3.0.x')
  await cp(join(pilot, 'milvus-docs'), demo.repo, { recursive: true })
  await mkdir(join(demo.pages, pageId), { recursive: true })
  await cp(join(pilot, 'shared-docs/guides/page.yaml'), join(demo.pages, pageId, 'page.yaml'))
  await cp(join(pilot, 'shared-docs/guides/Variables.json'), join(root, 'shared-docs/guides/Variables.json'))
  git('add', '--all')
  git('commit', '--quiet', '--allow-empty', '-m', 'Retained pilot for temporary site adaptation')
  return { ...demo, page: pageId }
}

export async function inspectPilot(root: string, pageId: string) {
  const result = await inspectPage({ pageId,
    sourceYaml: await readFile(join(root, 'shared-docs/guides/source.yaml'), 'utf8'),
    pageYaml: await readFile(join(root, 'shared-docs/guides/pages', pageId, 'page.yaml'), 'utf8'),
    variablesJson: await readFile(join(root, 'shared-docs/guides/Variables.json'), 'utf8'),
    context: { ...inspectionContext, file: `shared-docs/guides/pages/${pageId}/page.yaml`, page: pageId, channel: 'both' },
  }, new GitMilvusDocsReader(join(root, 'milvus-docs')), new RealMd2md())
  if ('errors' in result) throw new Error(JSON.stringify(result.errors))
  return result
}
