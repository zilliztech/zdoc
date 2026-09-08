'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const {execFileSync} = require('node:child_process')

const {parseReferenceTranslationManifest} = require('../../packages/docs-tooling/src/reference/translationManifest.ts')

const CACHE_PATH = '.translation-cache/ja-JP.json'
const MANIFEST_PATH = 'generated/ja-JP/manifests/reference-translations.json'
const SHA256 = /^[0-9a-f]{64}$/
const COMMIT = /^[0-9a-f]{40}$/
const MAPPINGS = Object.freeze([
  {sourceRoot: 'content/en/guides/tutorials', targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials'},
  {sourceRoot: 'content/en/byoc/tutorials', targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials'},
  {sourceRoot: 'content/en/reference', targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current'},
])

function compareText(left, right) { return left < right ? -1 : left > right ? 1 : 0 }
function sha256(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex') }
function canonicalSourcePath(value) {
  if (value.startsWith('docs/tutorials/')) return `content/en/guides/tutorials/${value.slice('docs/tutorials/'.length)}`
  if (value.startsWith('docs-byoc/tutorials/')) return `content/en/byoc/tutorials/${value.slice('docs-byoc/tutorials/'.length)}`
  if (value.startsWith('reference/')) return `content/en/reference/${value.slice('reference/'.length)}`
  return value
}
function mappingForSource(sourcePath) { return MAPPINGS.find(mapping => sourcePath.startsWith(`${mapping.sourceRoot}/`)) }
function targetForSource(sourcePath) {
  const mapping = mappingForSource(sourcePath)
  if (!mapping) throw new Error(`Japanese cache source is outside canonical mappings: ${sourcePath}`)
  return `${mapping.targetRoot}/${sourcePath.slice(mapping.sourceRoot.length + 1)}`
}
function manualForSource(sourcePath) {
  if (sourcePath.startsWith('content/en/guides/') || sourcePath.startsWith('content/en/byoc/')) return 'guides'
  const relative = sourcePath.slice('content/en/reference/'.length)
  if (relative.startsWith('api/python/')) return 'python'
  if (relative.startsWith('api/java/')) return 'java'
  if (relative.startsWith('api/nodejs/')) return 'node'
  if (relative.startsWith('api/go/')) return 'go'
  if (relative.startsWith('api/cpp/')) return 'cpp'
  if (relative.startsWith('cli/')) return 'cli'
  if (relative.startsWith('api/restful/')) return 'rest'
  throw new Error(`Japanese source has no canonical manual owner: ${sourcePath}`)
}
function regularFile(root, relativePath) {
  const absolute = path.join(root, relativePath)
  let stat
  try { stat = fs.lstatSync(absolute) } catch (error) { if (error.code === 'ENOENT') return null; throw error }
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`Japanese publication path must be a regular file: ${relativePath}`)
  return fs.readFileSync(absolute)
}
function repositoryFiles(root, relativeRoot) {
  const result = []
  const visit = relative => {
    const absolute = path.join(root, relative)
    for (const entry of fs.readdirSync(absolute, {withFileTypes: true}).sort((a, b) => compareText(a.name, b.name))) {
      const child = `${relative}/${entry.name}`
      if (entry.isSymbolicLink()) throw new Error(`Japanese source tree must not contain symlinks: ${child}`)
      if (entry.isDirectory()) visit(child)
      else if (entry.isFile() && entry.name !== '.gitkeep' && entry.name !== 'content-manifest.json') result.push(child)
      else if (!entry.isFile()) throw new Error(`Japanese source tree contains a non-regular file: ${child}`)
    }
  }
  visit(relativeRoot)
  return result
}
function targetLastCommitMap(repositoryRoot, revision, git = execFileSync) {
  const output = git('git', ['log', '--format=@@%H', '--name-only', revision, '--', 'i18n/ja-JP'], {cwd: repositoryRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024})
  const result = new Map()
  let commit = null
  for (const line of output.split('\n')) {
    if (line.startsWith('@@')) { commit = line.slice(2); if (!COMMIT.test(commit)) throw new Error('Japanese target history contains an invalid commit'); continue }
    if (!line || !commit || result.has(line)) continue
    result.set(line, commit)
  }
  return result
}
function historicalBlob(repositoryRoot, commit, sourcePath, git = execFileSync) {
  try { return git('git', ['show', `${commit}:${sourcePath}`], {cwd: repositoryRoot, maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore']}) }
  catch (error) { throw new Error(`Japanese cache source is absent from target publication commit: ${commit}:${sourcePath}`, {cause: error}) }
}
function readCache(repositoryRoot) {
  const value = JSON.parse(fs.readFileSync(path.join(repositoryRoot, CACHE_PATH), 'utf8'))
  if (!value || typeof value !== 'object' || Array.isArray(value) || !value.files || typeof value.files !== 'object' || Array.isArray(value.files)) throw new Error('Japanese translation cache must contain a files object')
  return value.files
}

function auditJapaneseCacheProvenance({repositoryRoot, revision = 'HEAD', git = execFileSync}) {
  const cache = readCache(repositoryRoot)
  const lastCommit = targetLastCommitMap(repositoryRoot, revision, git)
  const accepted = []
  const rejected = []
  const selected = new Map()
  for (const [legacyPath, entry] of Object.entries(cache)) {
    const sourcePath = canonicalSourcePath(legacyPath)
    const previous = selected.get(sourcePath)
    if (!previous || legacyPath === sourcePath) selected.set(sourcePath, {legacyPath, entry})
  }
  for (const [sourcePath, {legacyPath, entry}] of [...selected].sort(([a], [b]) => compareText(a, b))) {
    try {
      const manual = manualForSource(sourcePath)
      if (manual === 'rest') continue
      if (!entry || typeof entry !== 'object' || !SHA256.test(entry.sourceHash || '')) throw new Error('invalid source hash')
      const targetPath = targetForSource(sourcePath)
      if (entry.targetPath !== targetPath) throw new Error('non-canonical target path')
      const targetBytes = regularFile(repositoryRoot, targetPath)
      if (!targetBytes) throw new Error('target is missing')
      const publicationCommit = lastCommit.get(targetPath)
      if (!publicationCommit) throw new Error('target has no publication commit')
      const historicalSource = historicalBlob(repositoryRoot, publicationCommit, sourcePath, git)
      if (sha256(historicalSource) !== entry.sourceHash) throw new Error('source hash is absent from target publication commit')
      accepted.push({legacyPath, sourcePath, targetPath, manual, publicationCommit, sourceHash: entry.sourceHash, targetHash: sha256(targetBytes)})
    } catch (error) {
      rejected.push({legacyPath, sourcePath: canonicalSourcePath(legacyPath), reason: error.message})
    }
  }
  return {schemaVersion: 1, revision, accepted, rejected}
}

function buildJapanesePublicationManifest({repositoryRoot, sourceCommit, revision = 'HEAD', git = execFileSync}) {
  if (!COMMIT.test(sourceCommit)) throw new Error('Japanese manifest source commit must be a full commit SHA')
  const audit = auditJapaneseCacheProvenance({repositoryRoot, revision, git})
  if (audit.rejected.length) throw new Error(`Japanese cache provenance audit rejected ${audit.rejected.length} entries; first rejection: ${audit.rejected[0].sourcePath}: ${audit.rejected[0].reason}`)
  const records = []
  const covered = new Set()
  for (const entry of audit.accepted) {
    const {sourcePath, targetPath, manual, publicationCommit, sourceHash, targetHash} = entry
    records.push({manual, sourcePath, targetPath, sourceCommit: publicationCommit, sourceHash, targetHash, status: sourceHash === targetHash ? 'unchanged' : 'translated'})
    covered.add(sourcePath)
  }
  const pendingRecords = []
  for (const mapping of MAPPINGS) {
    for (const sourcePath of repositoryFiles(repositoryRoot, mapping.sourceRoot)) {
      const manual = manualForSource(sourcePath)
      if (manual === 'rest' || covered.has(sourcePath)) continue
      const targetPath = targetForSource(sourcePath)
      if (regularFile(repositoryRoot, targetPath)) throw new Error(`Japanese target is not represented in the translation cache: ${targetPath}`)
      const sourceBytes = regularFile(repositoryRoot, sourcePath)
      pendingRecords.push({manual, sourcePath, targetPath, sourceCommit, sourceHash: sha256(sourceBytes)})
    }
  }
  const order = (a, b) => compareText(a.manual, b.manual) || compareText(a.sourcePath, b.sourcePath) || compareText(a.targetPath, b.targetPath)
  return parseReferenceTranslationManifest({schemaVersion: 1, records: records.sort(order), pendingRecords: pendingRecords.sort(order)})
}

function main(argv = process.argv.slice(2)) {
  const args = new Map()
  for (let index = 0; index < argv.length; index += 2) args.set(argv[index], argv[index + 1])
  if (![3, 4].includes(args.size) || !args.get('--repository') || !args.get('--source-commit') || !args.get('--revision')) throw new Error('Usage: migrate-ja-publication-manifest --repository <dir> --source-commit <sha> --revision <ref> [--audit-output <path>]')
  const repositoryRoot = fs.realpathSync(args.get('--repository'))
  const audit = auditJapaneseCacheProvenance({repositoryRoot, revision: args.get('--revision')})
  if (args.get('--audit-output')) fs.writeFileSync(path.resolve(args.get('--audit-output')), `${JSON.stringify(audit, null, 2)}\n`)
  if (audit.rejected.length) throw new Error(`Japanese cache provenance audit rejected ${audit.rejected.length} entries; see the audit report before migration`)
  const manifest = buildJapanesePublicationManifest({repositoryRoot, sourceCommit: args.get('--source-commit'), revision: args.get('--revision')})
  const output = path.join(repositoryRoot, MANIFEST_PATH)
  fs.mkdirSync(path.dirname(output), {recursive: true})
  fs.writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`)
  process.stdout.write(`wrote ${manifest.records.length} Japanese publication records and ${manifest.pendingRecords.length} pending records\n`)
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {auditJapaneseCacheProvenance, buildJapanesePublicationManifest, canonicalSourcePath, targetForSource}
