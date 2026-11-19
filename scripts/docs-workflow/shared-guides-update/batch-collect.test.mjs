import test from 'node:test'
import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
const entry = fileURLToPath(new URL('./batch-collect.mjs', import.meta.url))
for (const args of [[], ['--help'], ['--source-repo', '/tmp/source'], ['--source-repo', '/tmp/source', '--out', '/tmp/out', '--run', '123'],
  ['--source-repo', '/tmp/source', '--out', '/tmp/out', '--out', '/tmp/other'], ['--source-repo', '--out', '/tmp/out'],
  ['--local-candidate', '--source-repo', '/tmp/source', '--out', '/tmp/out', '--run', '123'],
  ['--local-candidate', '--source-repo', '/tmp/source', '--out', '/tmp/out', '--local-candidate']]) {
  test('strict batch CLI rejects ' + JSON.stringify(args), () => {
    const child = spawnSync(process.execPath, [entry, ...args], {encoding: 'utf8'})
    assert.equal(child.status, 2)
    assert.match(child.stderr, /Usage:/)
    assert.equal(child.stdout, '')
  })
}
