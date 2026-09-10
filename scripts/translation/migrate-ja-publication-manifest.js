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
const ARTIFACT_DIGEST = /^sha256:[0-9a-f]{64}$/
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

function readSourceEvidence(file) {
  if (!file) return []
  const value = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'))
  if (value?.schemaVersion !== 1 || !Array.isArray(value.records)) throw new Error('Japanese source evidence must be a schema-v1 records document')
  const sources = new Set()
  return value.records.map((record, index) => {
    if (!record || typeof record !== 'object'
      || typeof record.sourcePath !== 'string'
      || typeof record.sourcePathAtCommit !== 'string'
      || typeof record.targetPath !== 'string'
      || !COMMIT.test(record.sourceCommit || '')
      || !SHA256.test(record.sourceHash || '')
      || !SHA256.test(record.targetHash || '')
      || !/^\d+$/.test(record.runId || '')
      || !/^translation-report-ja-JP-[A-Za-z0-9._-]+$/.test(record.reportArtifact || '')
      || !Number.isSafeInteger(record.artifactId)
      || !ARTIFACT_DIGEST.test(record.artifactDigest || '')
      || record.artifactExpired !== false
      || record.status !== 'translated') throw new Error(`Invalid Japanese source evidence record at index ${index}`)
    if (sources.has(record.sourcePath)) throw new Error(`Duplicate Japanese source evidence: ${record.sourcePath}`)
    sources.add(record.sourcePath)
    return record
  })
}

function cacheHistory(repositoryRoot, revision, git) {
  const commits = git('git', ['log', '--format=%H', revision, '--', CACHE_PATH], {
    cwd: repositoryRoot, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  }).trim().split('\n').filter(Boolean)
  return commits.map(commit => {
    const files = JSON.parse(git('git', ['show', `${commit}:${CACHE_PATH}`], {
      cwd: repositoryRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    })).files || {}
    const tree = git('git', ['ls-tree', '-r', '--name-only', '-z', commit, '--', 'docs', 'docs-byoc', 'reference', 'content/en', 'i18n/ja-JP'], {
      cwd: repositoryRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    }).split('\0').filter(Boolean)
    return {commit, files, paths: new Set(tree)}
  })
}

function matchingHistoricalEntry(files, sourcePath, selectedEntry) {
  return Object.entries(files).find(([candidatePath, candidate]) => (
    canonicalSourcePath(candidatePath) === sourcePath
    && candidate?.sourceHash === selectedEntry.sourceHash
    && candidate?.targetPath === selectedEntry.targetPath
  ))
}

function recoverHistoricalPathEvidence({repositoryRoot, revision, unresolved, git}) {
  const history = cacheHistory(repositoryRoot, revision, git)
  const recovered = []
  const rejected = []
  for (const item of unresolved) {
    const candidates = history.map(version => {
      const entry = matchingHistoricalEntry(version.files, item.sourcePath, item.entry)
      return entry ? {version, historicalSourcePath: entry[0]} : null
    }).filter(candidate => candidate
      && candidate.version.paths.has(candidate.historicalSourcePath)
      && candidate.version.paths.has(item.targetPath))
    let match = null
    for (const candidate of candidates) {
      const sourceBytes = historicalBlob(repositoryRoot, candidate.version.commit, candidate.historicalSourcePath, git)
      const targetBytes = historicalBlob(repositoryRoot, candidate.version.commit, item.targetPath, git)
      if (sha256(sourceBytes) === item.entry.sourceHash && sha256(targetBytes) === item.targetHash) {
        match = candidate
        break
      }
    }
    if (!match) {
      rejected.push({legacyPath: item.legacyPath, sourcePath: item.sourcePath, reason: item.reason})
      continue
    }
    recovered.push({
      legacyPath: item.legacyPath,
      sourcePath: item.sourcePath,
      sourcePathAtCommit: match.historicalSourcePath,
      targetPath: item.targetPath,
      manual: item.manual,
      publicationCommit: match.version.commit,
      sourceHash: item.entry.sourceHash,
      targetHash: item.targetHash,
    })
  }
  return {recovered, rejected}
}

function recoverRetainedReportEvidence({repositoryRoot, rejected, selected, sourceEvidence, git}) {
  const evidenceBySource = new Map(sourceEvidence.map(record => [record.sourcePath, record]))
  const recovered = []
  const remaining = []
  for (const rejection of rejected) {
    const evidence = evidenceBySource.get(rejection.sourcePath)
    const cached = selected.get(rejection.sourcePath)
    if (!evidence || !cached) {
      remaining.push(rejection)
      continue
    }
    const {legacyPath, entry} = cached
    const targetBytes = regularFile(repositoryRoot, entry.targetPath)
    if (evidence.targetPath !== entry.targetPath
      || evidence.sourceHash !== entry.sourceHash
      || !targetBytes
      || evidence.targetHash !== sha256(targetBytes)) {
      remaining.push({...rejection, reason: 'retained report evidence does not match the current cache and target'})
      continue
    }
    const sourceBytes = historicalBlob(repositoryRoot, evidence.sourceCommit, evidence.sourcePathAtCommit, git)
    if (sha256(sourceBytes) !== evidence.sourceHash) {
      remaining.push({...rejection, reason: 'retained report checkpoint source hash mismatch'})
      continue
    }
    recovered.push({
      legacyPath,
      sourcePath: rejection.sourcePath,
      sourcePathAtCommit: evidence.sourcePathAtCommit,
      targetPath: evidence.targetPath,
      manual: manualForSource(rejection.sourcePath),
      publicationCommit: evidence.sourceCommit,
      sourceHash: evidence.sourceHash,
      targetHash: evidence.targetHash,
      retainedReport: {
        runId: evidence.runId,
        artifactId: evidence.artifactId,
        artifact: evidence.reportArtifact,
        digest: evidence.artifactDigest,
      },
    })
  }
  return {recovered, rejected: remaining}
}

function auditJapaneseCacheProvenance({repositoryRoot, revision = 'HEAD', git = execFileSync, recoverHistoricalAliases = true, sourceEvidence = []}) {
  const cache = readCache(repositoryRoot)
  const lastCommit = targetLastCommitMap(repositoryRoot, revision, git)
  const accepted = []
  const rejected = []
  const unresolved = []
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
      if (entry && typeof entry === 'object' && SHA256.test(entry.sourceHash || '') && entry.targetPath === targetForSource(sourcePath)) {
        const targetBytes = regularFile(repositoryRoot, entry.targetPath)
        if (targetBytes) {
          unresolved.push({legacyPath, sourcePath, targetPath: entry.targetPath, manual: manualForSource(sourcePath), entry, targetHash: sha256(targetBytes), reason: error.message})
          continue
        }
      }
      rejected.push({legacyPath, sourcePath, reason: error.message})
    }
  }
  if (recoverHistoricalAliases && unresolved.length) {
    const historical = recoverHistoricalPathEvidence({repositoryRoot, revision, unresolved, git})
    accepted.push(...historical.recovered)
    rejected.push(...historical.rejected)
  } else {
    rejected.push(...unresolved.map(item => ({legacyPath: item.legacyPath, sourcePath: item.sourcePath, reason: item.reason})))
  }
  if (sourceEvidence.length && rejected.length) {
    const retained = recoverRetainedReportEvidence({repositoryRoot, rejected, selected, sourceEvidence, git})
    accepted.push(...retained.recovered)
    rejected.splice(0, rejected.length, ...retained.rejected)
  }
  accepted.sort((left, right) => compareText(left.manual, right.manual) || compareText(left.sourcePath, right.sourcePath))
  rejected.sort((left, right) => compareText(left.sourcePath, right.sourcePath))
  return {schemaVersion: 1, revision, accepted, rejected}
}

function buildJapanesePublicationManifest({repositoryRoot, sourceCommit, revision = 'HEAD', git = execFileSync, recoverHistoricalAliases = true, sourceEvidence = []}) {
  if (!COMMIT.test(sourceCommit)) throw new Error('Japanese manifest source commit must be a full commit SHA')
  const audit = auditJapaneseCacheProvenance({repositoryRoot, revision, git, recoverHistoricalAliases, sourceEvidence})
  if (audit.rejected.length) throw new Error(`Japanese cache provenance audit rejected ${audit.rejected.length} entries; first rejection: ${audit.rejected[0].sourcePath}: ${audit.rejected[0].reason}`)
  const records = []
  const covered = new Set()
  for (const entry of audit.accepted) {
    const {sourcePath, sourcePathAtCommit, targetPath, manual, publicationCommit, sourceHash, targetHash} = entry
    records.push({manual, sourcePath, ...(sourcePathAtCommit && sourcePathAtCommit !== sourcePath ? {sourcePathAtCommit} : {}), targetPath, sourceCommit: publicationCommit, sourceHash, targetHash, status: sourceHash === targetHash ? 'unchanged' : 'translated'})
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
  if (![3, 4, 5].includes(args.size) || !args.get('--repository') || !args.get('--source-commit') || !args.get('--revision')) throw new Error('Usage: migrate-ja-publication-manifest --repository <dir> --source-commit <sha> --revision <ref> [--audit-output <path>] [--source-evidence <path>]')
  const repositoryRoot = fs.realpathSync(args.get('--repository'))
  const sourceEvidence = readSourceEvidence(args.get('--source-evidence'))
  const audit = auditJapaneseCacheProvenance({repositoryRoot, revision: args.get('--revision'), sourceEvidence})
  if (args.get('--audit-output')) fs.writeFileSync(path.resolve(args.get('--audit-output')), `${JSON.stringify(audit, null, 2)}\n`)
  if (audit.rejected.length) throw new Error(`Japanese cache provenance audit rejected ${audit.rejected.length} entries; see the audit report before migration`)
  const manifest = buildJapanesePublicationManifest({repositoryRoot, sourceCommit: args.get('--source-commit'), revision: args.get('--revision'), sourceEvidence})
  const output = path.join(repositoryRoot, MANIFEST_PATH)
  fs.mkdirSync(path.dirname(output), {recursive: true})
  fs.writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`)
  process.stdout.write(`wrote ${manifest.records.length} Japanese publication records and ${manifest.pendingRecords.length} pending records\n`)
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {auditJapaneseCacheProvenance, buildJapanesePublicationManifest, canonicalSourcePath, readSourceEvidence, targetForSource}
