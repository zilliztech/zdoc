import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { createBuildDemo, externalImage, git, write } from '../build/demo'

/** Isolated, committed synthetic inputs; no external image server or publishing. */
export async function createTransformDemo(directory: string) {
  const options = await createBuildDemo(directory)
  const file = 'site/en/build-pipeline.md'
  const original = await readFile(join(options.repo, file), 'utf8')
  await write(options.repo, file, original.split('\n').filter(line => !line.includes(externalImage)).join('\n')
    .replace('Use {{VAR.Cloud.Product}} in {{var.cloud.region}}.', '<!-- doc:block:start id="intro" -->\nSource introduction.\n<!-- doc:block:end id="intro" -->'))
  await git(options.repo, 'add', file)
  await git(options.repo, 'commit', '--quiet', '-m', 'Add synthetic WP10 targets')
  const commit = await git(options.repo, 'rev-parse', 'HEAD')
  for (const page of ['build-pipeline', 'shared-target']) await write(options.sharedDocs, `pages/${page}/lock.yaml`, JSON.stringify({ schema_version: 1, current: commit, next: commit }))
  const config = 'pages/build-pipeline/page.yaml'
  await write(options.sharedDocs, config, await readFile(join(options.sharedDocs, config), 'utf8') + `transforms:
  - operation: replace
    target: {block: intro}
    content: {file: cloud-intro.md}
  - operation: replace
    target:
      block: connect
      language: python
      lines: |
        connect("{{var.cloud.region}}")
    content:
      lines: |
        connect_cloud("{{var.cloud.region}}")
`)
  await write(options.sharedDocs, 'pages/build-pipeline/cloud-intro.md', 'Cloud setup replaces the source introduction.\n')
  return { ...options, commit }
}

export async function runTransformDemo(directory: string) {
  const options = await createTransformDemo(directory)
  const exec = promisify(execFile)
  const root = fileURLToPath(new URL('../../../../../..', import.meta.url))
  const args = ['scripts/docs-tooling.js', 'shared-docs', 'build', '--shared-docs', options.sharedDocs,
    '--repo', options.repo, '--dev', options.dev, '--page', 'build-pipeline', '--out', options.out]
  const success = await exec(process.execPath, args, { cwd: root, timeout: 60_000 })
  const config = 'pages/build-pipeline/page.yaml'
  await write(options.sharedDocs, config, (await readFile(join(options.sharedDocs, config), 'utf8')).replace('connect("{{var.cloud.region}}")', 'stale_selector()'))
  const failedOut = join(dirname(options.out), 'failed-output')
  const failure = await exec(process.execPath, [...args.slice(0, -1), failedOut], { cwd: root, timeout: 60_000 })
    .then(result => ({ code: 0, stdout: result.stdout }), error => ({ code: error.code as number, stdout: error.stdout as string }))
  return { ...options, stdout: success.stdout, failure, failedOut }
}
