// Prints the reviewed Fetch inventory for the checked-out commit. Never edits the policy.
const {execFileSync} = require('node:child_process')
const path = require('node:path')
const {loadTypeScript} = require('../../lib/load-typescript')
const policy = 'packages/docs-tooling/src/shared-docs/adapters/updates/reviewed-fetch-tree.json'
const {producerInventoryDigest} = loadTypeScript(path.resolve('packages/docs-tooling/src/shared-docs/adapters/updates/selected-lifecycle.ts'))

const bytes = execFileSync('git', ['show', 'HEAD:' + policy])
const tree = execFileSync('git', ['ls-tree', '-rtz', '--full-tree', 'HEAD'], {encoding: 'utf8', maxBuffer: 32 * 1024 * 1024})
const digest = producerInventoryDigest(tree, bytes)
console.log(digest)
if (process.argv.includes('--check') && digest !== JSON.parse(bytes).strictProducerSha256) {
  console.error('The registered Fetch producer differs from the checked-out tree.')
  process.exitCode = 1
}
