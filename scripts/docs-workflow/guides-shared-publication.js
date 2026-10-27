#!/usr/bin/env node
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const {ROOT, loadBundle} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
const publication = require('../../packages/docs-tooling/src/lark/sharedPagePublication')
const {hashSnapshot} = require('../../packages/docs-tooling/src/lark/sourceCompleteness')
const {promoteCandidateSnapshot, writeSnapshot} = require('../../packages/docs-tooling/src/lark/sourceSnapshot')
function main(argv) {
  const args = Object.fromEntries(argv.reduce((pairs, value, index) => value.startsWith('--') ? [...pairs, [value.slice(2), argv[index + 1]]] : pairs, []))
  const workspace = path.resolve(args.workspace || '.')
  const bundleRoot = path.join(workspace, ROOT)
  if (args.operation === 'validate') {
    // Legacy retained checkpoints have no shared authority and retain their validation behavior.
    if (!fs.existsSync(path.join(workspace, publication.MANIFEST)) && !fs.existsSync(path.join(workspace, args.snapshot))) return
    const snapshot = JSON.parse(fs.readFileSync(path.join(workspace, args.snapshot), 'utf8'))
    if (!fs.existsSync(path.join(workspace, publication.MANIFEST)) && !snapshot.records?.some(row => row.source_kind === 'shared-page')) return
    publication.publishedEvidence(workspace, snapshot)
    return
  }
  if (!fs.existsSync(bundleRoot)) return
  const handoff = loadBundle(bundleRoot, {masterSha: args['master-sha'], devBaselineSha: args['dev-baseline-sha']})
  if (args.operation === 'finalize') {
    const candidate = JSON.parse(fs.readFileSync(path.join(workspace, args.candidate), 'utf8'))
    publication.finalizePublication({workspace, handoff, candidate})
  } else if (args.operation === 'promote') {
    const effective = JSON.parse(fs.readFileSync(path.join(workspace, publication.EFFECTIVE), 'utf8'))
    publication.publishedEvidence(workspace, effective)
    const promoted = promoteCandidateSnapshot(effective, {manual: 'guides', buildEnv: 'uat', allowEmptySharedEffective: true, sourceDir: args['source-dir'],
      targetsBuilt: ['zilliz.saas', 'zilliz.paas'], sourceBranch: args['source-branch'], publishUrl: 'https://docs.cloud-uat3.zilliz.com', linkCheckRemote: 'https://docs.zilliz.com'})
    writeSnapshot(path.join(workspace, args.output), promoted)
    const file = path.join(workspace, publication.MANIFEST, '_publication.json'), authority = JSON.parse(fs.readFileSync(file))
    authority.effective_sha256 = hashSnapshot(promoted)
    fs.writeFileSync(file, JSON.stringify(authority, null, 2) + '\n')
  } else throw new Error('Unknown shared publication operation')
}
if (require.main === module) {try {main(process.argv.slice(2))} catch (error) {console.error(error); process.exitCode = 1}}
module.exports = {main}
