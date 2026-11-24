import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {test} from 'node:test'
import {fileURLToPath} from 'node:url'
import cli from './batch-scope.cjs'

const require = createRequire(import.meta.url)
const {loadTypeScript} = require('../../lib/load-typescript.js')
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const adapter = resolve(root, 'packages/docs-tooling/src/shared-docs/adapters/updates')
const {batchBudget} = loadTypeScript(resolve(adapter, 'batch-source.ts'))
const {createBatchGitHub} = loadTypeScript(resolve(adapter, 'batch-github.ts'))
const sha = 'a'.repeat(40)

test('requires immutable pins and unique, positive PR numbers', () => {
  const args = ['--master', sha, '--dev', sha, '--source', sha, '--source-repo', '/src', '--zdoc-repo', '/docs', '--pulls']
  assert.deepEqual(cli.parseArgs([...args, '3861,3842']).pulls, [3842, 3861])
  for (const bad of ['0','3842,3842','1,','9007199254740992','1.2']) {
    assert.throws(() => cli.parseArgs([...args, bad]), /Usage/)
  }
  assert.throws(() => cli.parseArgs([...args, '3842', '--pulls', '3861']), /Usage/)
  assert.throws(() => cli.parseArgs(['--master','master',...args.slice(2),'3842']), /Usage/)
})

test('binds every selected PR to its numbered merge on the upstream track', async () => {
  const pr = {id: 52, number: 3842, state: 'closed', merged_at: '2026-11-17T06:46:17Z',
    base:{ref:'v3.0.x', sha, repo:{id:267273319, full_name:'milvus-io/milvus-docs'}},
    head:{sha}, merged:true, merge_commit_sha:'b'.repeat(40), commits:1, changed_files:2}
  let observation = pr
  const transport = async request => {
    assert.equal(request.method,'GET')
    assert.equal(request.path,'/repos/milvus-io/milvus-docs/pulls/3842')
    return {status:200, headers:{}, body:Buffer.from(JSON.stringify(observation))}
  }
  const reads = createBatchGitHub(batchBudget(), {transport})
  try {
    const seed = await reads.mergedSeed(3842)
    assert.equal(seed.mergeCommit,pr.merge_commit_sha)
    assert.equal(seed.commits,1)
    assert.match(seed.digest, /^api:[a-f0-9]{64}:[a-f0-9]{64}$/)
    for (const bad of [{...pr, number:3843}, {...pr, base:{...pr.base,ref:'master'}},
      {...pr, base:{...pr.base,repo:{...pr.base.repo,id:1}}}]) {
      observation = bad
      await assert.rejects(reads.mergedSeed(3842),/PR_BASE_MISMATCH/)
    }
    observation = {...pr, merged:false}
    await assert.rejects(reads.mergedSeed(3842),/UPSTREAM_UNMERGED/)
  } finally { reads.close() }
})
