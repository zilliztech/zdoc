import { execFile } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { guidesSnapshotPath } from '../../adapters/guides-snapshot'

const exec = promisify(execFile)
const fixture = new URL('../../fixtures/build/synthetic/', import.meta.url)
export const externalImage = 'https://images.example.test/diagram.png'
export const imageBytes = new Uint8Array([137, 80, 78, 71, 1, 2, 3])

/** Fixed identities and isolated Git configuration make the demo independent of the operator's setup. */
export async function git(repository: string, ...args: string[]) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
  Object.assign(env, { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_AUTHOR_NAME: 'Build Fixture',
    GIT_AUTHOR_EMAIL: 'build@example.test', GIT_COMMITTER_NAME: 'Build Fixture', GIT_COMMITTER_EMAIL: 'build@example.test',
    GIT_AUTHOR_DATE: '2020-01-01T00:00:00Z', GIT_COMMITTER_DATE: '2020-01-01T00:00:00Z' })
  return (await exec('git', ['-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', '-c', 'core.autocrlf=false',
    '-C', repository, ...args], { env, maxBuffer: 4 * 1024 * 1024 })).stdout.trim()
}
export async function write(root: string, path: string, text: string | Uint8Array) {
  await mkdir(dirname(join(root, path)), { recursive: true })
  await writeFile(join(root, path), text)
}
export function pageYaml(source: string, path: string, manuals = ['guides', 'guides-byoc']) {
  return `schema_version: 1\nsource:\n  file: ${source}\npublish:\n${manuals.map(manual => `  - manual: ${manual}\n    path: ${path}\n`).join('')}`
}
export async function createBuildDemo(directory: string, url = externalImage) {
  await mkdir(resolve(directory), { recursive: true })
  // Canonicalize macOS's /var temporary-directory alias before testing output symlinks.
  const root = await realpath(resolve(directory))
  const sharedDocs = join(root, 'shared-docs/guides'), repo = join(root, 'milvus-docs'), dev = join(root, 'zdoc-dev'), out = join(root, 'output')
  await mkdir(repo); await mkdir(dev)
  const sourceFile = 'site/en/build-pipeline.md'
  await write(repo, sourceFile, (await readFile(new URL('page.md', fixture), 'utf8')).replaceAll('EXTERNAL_IMAGE', url))
  await write(repo, 'site/en/source-target.md', await readFile(new URL('target.md', fixture), 'utf8'))
  await write(repo, 'site/en/fragments/used.md', 'A fragment for {{var.cloud.Product}}.\n')
  await write(repo, 'site/en/fragments/unused.md', 'Milvus must not enter source attribution.\n')
  await write(repo, 'site/en/assets/diagram.png', imageBytes)
  await git(repo, 'init', '--quiet', '--initial-branch=v3.0.x', '--object-format=sha1', '--template=')
  await git(repo, 'add', '.'); await git(repo, 'commit', '--quiet', '-m', 'Synthetic WP8a source')
  const commit = await git(repo, 'rev-parse', 'HEAD')
  await write(sharedDocs, 'source.yaml', 'schema_version: 1\nrepository: https://github.com/milvus-io/milvus-docs\ntrack: v3.0.x\n')
  await write(sharedDocs, 'Variables.json', JSON.stringify({ Cloud: { Product: 'Zilliz Cloud', Region: 'eu-west' }, unused: 'Milvus' }, null, 2))
  await write(sharedDocs, 'links.yaml', 'mapped.md: mapped-cloud\n')
  await write(sharedDocs, 'product-names.yaml', 'check: [Milvus, localhost:19530]\nallow: []\n')
  await write(sharedDocs, 'presentation/cloud-sdk-tabs.yaml', await readFile(new URL('../../fixtures/site/cloud-sdk-tabs.yaml', import.meta.url), 'utf8'))
  await write(sharedDocs, 'pages/build-pipeline/page.yaml', pageYaml(sourceFile, 'tutorials/build-pipeline'))
  await write(sharedDocs, 'pages/shared-target/page.yaml', pageYaml('site/en/source-target.md', 'tutorials/shared-target'))
  for (const page of ['build-pipeline', 'shared-target']) await write(sharedDocs, `pages/${page}/lock.yaml`, JSON.stringify({ schema_version: 1, current: commit, next: commit }))
  for (const [manual, physical, position] of [['guides', 'guides', 4], ['guides-byoc', 'byoc', 8]] as const) {
    for (const page of ['build-pipeline', 'shared-target', 'cloud-page']) {
      await write(dev, `content/en/${physical}/tutorials/${page}.${manual === 'guides' ? 'mdx' : 'md'}`,
        `---\nslug: /${page}\ntitle: ${page}\nsidebar_label: ${manual} navigation\nsidebar_position: ${position}\n---\n\nExisting content.\n`)
    }
    // This same-name Cloud target must never hide an absent shared target.
    await write(dev, `content/en/${physical}/public-target.mdx`, '---\nslug: /public-target\ntitle: Other target\n---\n')
  }
  await write(dev, guidesSnapshotPath, JSON.stringify({ schema_version: 1, records: ['build-pipeline', 'shared-target'].map((slug, index) => ({
    record_id: `build-${index}`, slug, title: slug, placement_type: 'canonical', release_channel: index ? 'next' : 'current',
    publish_targets: ['Zilliz.SaaS'], output_paths: [],
  })) }))
  await git(dev, 'init', '--quiet', '--initial-branch=dev', '--object-format=sha1', '--template=')
  await git(dev, 'add', '.'); await git(dev, 'commit', '--quiet', '-m', 'Synthetic WP8a dev inputs')
  return { sharedDocs, repo, dev, out, commit, devCommit: await git(dev, 'rev-parse', 'HEAD') }
}

/** The real CLI uses a local image endpoint; no credentials or external network are required. */
export async function runBuildDemo(directory: string) {
  let requests = 0
  const server = createServer((_request, response) => { requests++; response.writeHead(200, { 'content-type': 'image/png' }); response.end(imageBytes) })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Missing demo image endpoint')
    const options = await createBuildDemo(directory, `http://127.0.0.1:${address.port}/diagram.png`)
    const root = fileURLToPath(new URL('../../../../../..', import.meta.url))
    const args = ['scripts/docs-tooling.js', 'shared-docs', 'build', '--shared-docs', options.sharedDocs,
      '--repo', options.repo, '--dev', options.dev, '--out', options.out]
    const success = await exec(process.execPath, args, { cwd: root, timeout: 60_000 })
    await write(options.sharedDocs, 'pages/build-pipeline/page.yaml',
      await readFile(join(options.sharedDocs, 'pages/build-pipeline/page.yaml'), 'utf8') + 'transforms: [{replace: unsupported}]\n')
    const failedOut = join(dirname(options.out), 'failed-output')
    const failure = await exec(process.execPath, [...args.slice(0, -1), failedOut], { cwd: root, timeout: 60_000 })
      .then(result => ({ code: 0, stdout: result.stdout }), error => ({ code: error.code as number, stdout: error.stdout as string }))
    return { ...options, command: [process.execPath, ...args], stdout: success.stdout, summary: JSON.parse(success.stdout.slice(success.stdout.lastIndexOf('{\n  "pages"'))), failure, failedOut, imageRequests: requests }
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())) }
}
