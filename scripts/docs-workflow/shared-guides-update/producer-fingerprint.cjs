// Print measurements from committed Git objects for review. This command never edits policy.
const {execFileSync} = require('node:child_process')
const {createHash} = require('node:crypto')
const path = require('node:path')
const {loadTypeScript} = require('../../lib/load-typescript')
const policy = 'packages/docs-tooling/src/shared-docs/adapters/updates/reviewed-fetch-tree.json'
const {producerInventoryDigest} = loadTypeScript(path.resolve('packages/docs-tooling/src/shared-docs/adapters/updates/selected-lifecycle.ts'))
const git = (...args) => execFileSync('git', ['--no-replace-objects', ...args], {maxBuffer: 32 * 1024 * 1024})
const args = process.argv.slice(2)
const inspect = args.length === 2 && args[0] === '--inspect' && /^[0-9a-f]{40}$/.test(args[1]) && args[1].length === 40
if (!inspect && !(args.length === 0 || args.length === 1 && args[0] === '--check')) {
  throw new Error('Usage: producer-fingerprint.cjs [--check | --inspect <40-hex-producer-commit>]')
}
const ref = inspect ? args[1] : 'HEAD'
if (git('cat-file', '-t', ref).toString().trim() !== 'commit') throw new Error('Expected a producer commit')
const bytes = git('cat-file', 'blob', ref + ':' + policy)
const digest = producerInventoryDigest(git('ls-tree', '-rtz', '--full-tree', ref).toString('utf8'), bytes)
if (inspect) {
  console.log(JSON.stringify({producer: ref, policyBlobOid: git('rev-parse', ref + ':' + policy).toString().trim(),
    policySha256: createHash('sha256').update(bytes).digest('hex'), producerInventorySha256: digest}, null, 2))
} else {
  console.log(digest)
  if (args[0] === '--check' && digest !== JSON.parse(bytes).strictProducerSha256) {
    console.error('The registered Fetch producer differs from the checked-out tree.')
    process.exitCode = 1
  }
}
