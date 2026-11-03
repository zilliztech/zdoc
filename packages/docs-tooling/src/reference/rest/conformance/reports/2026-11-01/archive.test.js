const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

// Frozen archive of the 2026-11-01 first live round: 130 param-level cases
// built from the PR #1005 fragment request bodies (pin 5f7e112) and executed
// against Milvus v2.6.26 standalone on a milvus-cell vCluster (REST v2 on
// :19530). These assertions pin the archive as recorded; bump them only when
// re-recording a new round, never to turn a red round green.

const DIR = __dirname

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(DIR, name), 'utf8'))
}

test('archived JSON artifacts parse and hold objects', () => {
  for (const name of [
    'results.json',
    'attribution.json',
    'added-paths.json',
    'skeleton-2626.json',
    'skeleton-305.json',
  ]) {
    const parsed = readJson(name)
    assert.ok(parsed && typeof parsed === 'object', `${name} must hold a JSON object`)
  }
})

test('results.json records the 130-case round verbatim', () => {
  const results = readJson('results.json')
  assert.equal(results.base, 'http://127.0.0.1:19530')
  assert.match(results.startedAt, /^2026-11-01T/)
  assert.equal(results.results.length, 130)
  assert.deepEqual(results.counts, {
    RECORDED: 10,
    'PASS-EFFECT': 63,
    REJECTED: 16,
    'REJECTED(record)': 16,
    PASS: 25,
  })
})

test('route skeletons pin the two track anchors from upstream httpserver', () => {
  const expected = [
    ['skeleton-2626.json', 89],
    ['skeleton-305.json', 113],
  ]
  for (const [name, operations] of expected) {
    const skeleton = readJson(name)
    assert.equal(skeleton.extractedFrom.repository, 'milvus-io/milvus')
    assert.equal(skeleton.extractedFrom.sourceDir, 'internal/distributed/proxy/httpserver')
    assert.equal(skeleton.extractedFrom.mountPrefix, '/v2/vectordb')
    assert.equal(skeleton.operations.length, operations)
    for (const op of skeleton.operations) {
      assert.match(op.path, /^\/v2\/vectordb\//)
      assert.ok(op.method && op.handler, `${name} entry missing method/handler`)
    }
  }
})

test('case runner and three-category report are present', () => {
  const runner = fs.readFileSync(path.join(DIR, 'rest-v2-param-tests.mjs'), 'utf8')
  assert.ok(runner.length > 40000, 'case runner must be archived in full')
  const report = fs.readFileSync(path.join(DIR, 'REPORT.md'), 'utf8')
  assert.ok(report.includes('服务端不符'), 'report must keep the doc-mismatch category')
  assert.ok(report.includes('尚未接线'), 'report must keep the master-pin-not-wired category')
  assert.ok(report.includes('实现怪象'), 'report must keep the server-quirk category')
})
