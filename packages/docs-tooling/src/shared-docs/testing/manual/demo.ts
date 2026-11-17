import { execFile } from 'node:child_process'
import { mkdir, realpath, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'

const exec = promisify(execFile)
export const sourceDir = 'API_Reference/milvus-sdk-node/v3.0.x'

/** Fixed identities and isolated Git configuration make the demo independent of the operator's setup. */
export async function git(repository: string, ...args: string[]) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
  Object.assign(env, { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_AUTHOR_NAME: 'Manual Fixture',
    GIT_AUTHOR_EMAIL: 'manual@example.test', GIT_COMMITTER_NAME: 'Manual Fixture', GIT_COMMITTER_EMAIL: 'manual@example.test',
    GIT_AUTHOR_DATE: '2020-01-01T00:00:00Z', GIT_COMMITTER_DATE: '2020-01-01T00:00:00Z' })
  return (await exec('git', ['-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', '-c', 'core.autocrlf=false',
    '-C', repository, ...args], { env, maxBuffer: 4 * 1024 * 1024 })).stdout.trim()
}

export async function write(root: string, path: string, text: string) {
  await mkdir(dirname(join(root, path)), { recursive: true })
  await writeFile(join(root, path), text)
}

export const pages = {
  'Collections/createCollection.md': `# createCollection()

Creates a collection with default or customized settings.

See [DataType](DataType.md), [MilvusClientV2](../Client/MilvusClientV2.md), and the external [analyzer guide](https://milvus.io/docs/english-analyzer.md).

\`\`\`javascript
const { MilvusClient } = require('@zilliz/milvus2-sdk-node');
\`\`\`
`,
  'Collections/DataType.md': `# DataType

Describes the data type of a field.
`,
  'Client/MilvusClientV2.md': `# MilvusClientV2

The client for a Milvus instance.

See [createCollection](../Collections/createCollection.md).
`,
}

/** One manual-layout group with an upstream tree, ready for lock and build.
 * Options swap configuration files, add upstream pages, or drop group content/ pages. */
export async function createManualDemo(directory: string, options: {
  manual?: string; variables?: string; productNames?: string
  upstream?: Record<string, string>; cloud?: Record<string, string>
} = {}) {
  const root = await realpath(resolve(directory))
  const sharedDocs = join(root, 'shared-docs/node'), repo = join(root, 'web-content'), out = join(root, 'output')
  for (const [path, text] of Object.entries({ ...pages, ...options.upstream })) await write(repo, `${sourceDir}/${path}`, text)
  await git(repo, 'init', '--quiet', '--initial-branch=master', '--object-format=sha1', '--template=')
  await git(repo, 'add', '.')
  await git(repo, 'commit', '--quiet', '-m', 'Synthetic manual source')
  const commit = await git(repo, 'rev-parse', 'HEAD')
  await write(sharedDocs, 'source.yaml', `schema_version: 1
repository: https://github.com/milvus-io/web-content
track: master
presentation:
  node:
    title_suffix: Node.js
    slug_prefix: /node/node
    displayed_sidebar: nodeSidebar
`)
  await write(sharedDocs, 'manual.yaml', options.manual ?? `schema_version: 1
source:
  dir: ${sourceDir}
publish:
  manual: node
metadata:
  Client/:
    beta: ON REQUEST
  Collections/createCollection.md:
    added_since: v2.3.x
    last_modified: v3.0.x
    type: docx
    token: KPZZd2TiAodSeWxUdlJciHGcnbg
    sidebar_position: 5
    notebook: false
    keywords:
      - Vector retrieval
`)
  if (options.variables !== undefined) await write(sharedDocs, 'Variables.json', options.variables)
  await write(sharedDocs, 'product-names.yaml', options.productNames ?? 'check: [root:Milvus]\nallow: []\n')
  for (const [path, text] of Object.entries(options.cloud ?? {})) await write(sharedDocs, `content/${path}`, text)
  return { sharedDocs, repo, out, root, commit }
}
