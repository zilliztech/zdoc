import { execFile } from 'node:child_process'
import { mkdir, readFile, realpath } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { guidesSnapshotPath } from '../../adapters/guides-snapshot'
import { git, pageYaml, write } from '../build/demo'

const require = createRequire(import.meta.url)
const { resolveNextChannelCurrentView } = require('../../../../../../apps/docs/plugins/next-channel-view.js') as {
  resolveNextChannelCurrentView(text: string): string
}
const fixture = new URL('../../fixtures/merge/delete-entities/', import.meta.url)
const repositoryRoot = fileURLToPath(new URL('../../../../../..', import.meta.url))
const outputFile = 'tutorials/delete-entities.mdx'

/** Demo-only NEXT projection: these inputs contain no authored gates/directives.
 * Use the existing deployment resolver with reversed generated gate actions;
 * standalone CLI outputs, built independently, are the restoration oracle. */
function nextProjection(text: string) {
  return resolveNextChannelCurrentView(text.replace(/<NextChannel action="(include|exclude)">/g,
    (_, action) => `<NextChannel action="${action === 'include' ? 'exclude' : 'include'}">`))
}

/** Local committed source versions and minimal dev navigation; no service calls. */
export async function createMergeDemo(directory: string) {
  await mkdir(resolve(directory), { recursive: true })
  const root = await realpath(resolve(directory))
  const repo = join(root, 'milvus-docs'), dev = join(root, 'zdoc-dev')
  const sharedDocs = join(root, 'shared-docs/guides'), out = join(root, 'merged'), views = join(root, 'views')
  await mkdir(repo); await mkdir(dev)
  const sourceFile = 'site/en/userGuide/insert-and-delete/delete-entities.md'
  await git(repo, 'init', '--quiet', '--initial-branch=v3.0.x', '--object-format=sha1', '--template=')
  const commits: string[] = []
  for (const version of ['current', 'next']) {
    await write(repo, sourceFile, await readFile(new URL(`${version}.md`, fixture)))
    await git(repo, 'add', '.')
    await git(repo, 'commit', '--quiet', '-m', version === 'current' ? 'Pinned original Delete Entities' : 'Synthetic next Delete Entities')
    commits.push(await git(repo, 'rev-parse', 'HEAD'))
  }
  await write(sharedDocs, 'source.yaml', 'schema_version: 1\nrepository: https://github.com/milvus-io/milvus-docs\ntrack: v3.0.x\n')
  for (const path of ['Variables.json', 'presentation/cloud-sdk-tabs.yaml', 'product-names.yaml']) {
    await write(sharedDocs, path, await readFile(join(repositoryRoot, 'shared-docs/guides', path)))
  }
  await write(sharedDocs, 'links.yaml', 'boolean.md: filtering-overview\n')
  await write(sharedDocs, 'pages/delete-entities/page.yaml', pageYaml(sourceFile, 'tutorials/delete-entities'))
  await write(sharedDocs, 'pages/delete-entities/lock.yaml', JSON.stringify({ schema_version: 1, current: commits[0], next: commits[1] }))
  for (const physical of ['guides', 'byoc']) {
    await write(dev, `content/en/${physical}/${outputFile}`, '---\nslug: /delete-entities\ntitle: Delete Entities\nsidebar_position: 1\n---\nExisting content.\n')
    await write(dev, `content/en/${physical}/filtering-overview.mdx`, '---\nslug: /filtering-overview\ntitle: Filtering Overview\n---\nLocal link target.\n')
  }
  await write(dev, guidesSnapshotPath, JSON.stringify({ schema_version: 1, records: [{ record_id: 'delete-entities',
    slug: 'delete-entities', title: 'Delete Entities', placement_type: 'canonical', release_channel: 'current',
    publish_targets: ['Zilliz.SaaS'], output_paths: [] }] }))
  await git(dev, 'init', '--quiet', '--initial-branch=dev', '--object-format=sha1', '--template=')
  await git(dev, 'add', '.'); await git(dev, 'commit', '--quiet', '-m', 'Minimal local demo navigation')
  return { root, repo, dev, sharedDocs, out, views, current: commits[0], next: commits[1] }
}

/** Invoke the real CLI three times, retaining the merge and independent baselines. */
export async function runMergeDemo(directory: string) {
  const options = await createMergeDemo(directory)
  const exec = promisify(execFile)
  const args = ['scripts/docs-tooling.js', 'shared-docs', 'build', '--shared-docs', options.sharedDocs,
    '--repo', options.repo, '--dev', options.dev, '--page', 'delete-entities', '--out']
  const commands: string[][] = [], summaries: unknown[] = []
  const baselines = { current: join(options.root, 'standalone-current'), next: join(options.root, 'standalone-next') }
  for (const selection of ['merged', 'current', 'next'] as const) {
    if (selection !== 'merged') await write(options.sharedDocs, 'pages/delete-entities/lock.yaml',
      JSON.stringify({ schema_version: 1, current: options[selection], next: options[selection] }))
    const command = [process.execPath, ...args, selection === 'merged' ? options.out : baselines[selection]]
    commands.push(command)
    const result = await exec(command[0], command.slice(1), { cwd: repositoryRoot, timeout: 60_000, maxBuffer: 4 * 1024 * 1024 })
    summaries.push(JSON.parse(result.stdout.slice(result.stdout.lastIndexOf('{\n  "pages"'))))
  }
  // Leave the inspectable group configured for the original two-version build.
  await write(options.sharedDocs, 'pages/delete-entities/lock.yaml', JSON.stringify({ schema_version: 1, current: options.current, next: options.next }))
  for (const manual of ['guides', 'guides-byoc']) {
    const merged = await readFile(join(options.out, manual, outputFile), 'utf8')
    for (const channel of ['current', 'next'] as const) await write(options.views, `${channel}/${manual}/${outputFile}`,
      channel === 'current' ? resolveNextChannelCurrentView(merged) : nextProjection(merged))
  }
  await write(options.root, 'evidence.json', JSON.stringify({ current: options.current, next: options.next, commands, summaries }, null, 2) + '\n')
  return { ...options, baselines, commands, summaries }
}
