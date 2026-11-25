import test from 'node:test'
import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
const entry = fileURLToPath(new URL('./batch-collect.mjs', import.meta.url))
for (const args of [[], ['--help'], ['--source-repo', '/tmp/source'], ['--source-repo', '/tmp/source', '--out', '/tmp/out', '--run', '123'],
  ['--source-repo', '/tmp/source', '--out', '/tmp/out', '--out', '/tmp/other'], ['--source-repo', '--out', '/tmp/out'],
  ['--source-repo', '/tmp/source', '--out', '/tmp/out', '--dependency-index', '--dependency-index'],
  ['--source-repo', '--dependency-index', '--out', '/tmp/out']]) {
  test('strict batch CLI rejects ' + JSON.stringify(args), () => {
    const child = spawnSync(process.execPath, [entry, ...args], {encoding: 'utf8'})
    assert.equal(child.status, 2)
    assert.match(child.stderr, /Usage:/)
    assert.equal(child.stdout, '')
  })
}

test('dependency index export is opt-in and an early collection hold grants no coverage', () => {
  const args = ['--source-repo', '/dev/null/missing-git-store', '--out', '/dev/null/missing-evidence']
  const run = extra => spawnSync(process.execPath, [entry, ...args, ...extra], {encoding: 'utf8'})
  const normal = run([]), exported = run(['--dependency-index'])
  for (const process of [normal, exported]) {
    assert.equal(process.status, 1)
    assert.equal(process.stderr, '')
  }
  const held = JSON.parse(normal.stdout)
  assert.equal(held.kind, 'guides-batch-collection-v1')
  assert.equal(held.status, 'held')
  assert.deepEqual(JSON.parse(exported.stdout), {schema: 'guides-batch-dependency-export-v1', result: held,
    entries: [], unavailable: [], writeEligible: false, operations: []})
})
