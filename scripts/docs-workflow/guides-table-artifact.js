#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs/promises')
const path = require('node:path')
const { tableOutputPath } = require('./render-guides-table')

const SHA = /^[0-9a-f]{40}$/
const SHA256 = /^[0-9a-f]{64}$/

function artifactId(entry) {
  return `${entry.target}:${entry.table_id}`
}

function allowedPath(ownedPath, relative) {
  return relative === ownedPath || relative.startsWith(`${ownedPath}/`)
}

async function collectFiles(workspace, ownedPath) {
  const files = []
  const root = path.join(workspace, ownedPath)
  async function visit(directory, relative) {
    let entries
    try { entries = await fs.readdir(directory, { withFileTypes: true }) } catch (error) {
      if (error.code === 'ENOENT') return
      throw error
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(directory, entry.name)
      const item = path.posix.join(relative, entry.name)
      if (entry.isSymbolicLink()) throw new Error(`Symlink is not allowed: ${item}`)
      if (entry.isDirectory()) await visit(full, item)
      else if (entry.isFile()) files.push(item)
      else throw new Error(`Unsupported file type: ${item}`)
    }
  }
  await visit(root, ownedPath)
  return files
}

async function createGuidesTableArtifact({ workspace, output, entry, masterSha, devBaselineSha, sourceArtifactSha256 }) {
  if (!SHA.test(masterSha) || !SHA.test(devBaselineSha) || !SHA256.test(sourceArtifactSha256 || '')) throw new Error('Invalid Guides table artifact identity hashes')
  const ownedPath = tableOutputPath(entry)
  const sourceFiles = await collectFiles(workspace, ownedPath)
  if (!entry.cleanup && sourceFiles.length === 0) throw new Error(`Guides table artifact has no files: ${artifactId(entry)}`)
  await fs.rm(output, { recursive: true, force: true })
  await fs.mkdir(path.join(output, 'payload'), { recursive: true })
  const files = []
  for (const relative of sourceFiles) {
    const bytes = await fs.readFile(path.join(workspace, relative))
    const destination = path.join(output, 'payload', relative)
    await fs.mkdir(path.dirname(destination), { recursive: true })
    await fs.writeFile(destination, bytes, { flag: 'wx' })
    files.push({ path: relative, size: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') })
  }
  const manifest = {
    schemaVersion: 1, manual: 'guides', artifactType: 'table', id: artifactId(entry),
    table_id: entry.table_id, table_name: entry.table_name, table_slug: entry.table_slug,
    target: entry.target, target_name: entry.target_name, cleanup: Boolean(entry.cleanup), ownedPath,
    masterSha, devBaselineSha, sourceArtifactSha256, files,
  }
  await fs.writeFile(path.join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' })
  await validateGuidesTableArtifact(output, entry)
  return manifest
}

async function validateGuidesTableArtifact(directory, expected = null) {
  const manifest = JSON.parse(await fs.readFile(path.join(directory, 'manifest.json'), 'utf8'))
  if (manifest.schemaVersion !== 1 || manifest.manual !== 'guides' || manifest.artifactType !== 'table') throw new Error('Invalid Guides table artifact identity')
  if (!SHA.test(manifest.masterSha) || !SHA.test(manifest.devBaselineSha) || !SHA256.test(manifest.sourceArtifactSha256 || '')) throw new Error('Invalid Guides table artifact hashes')
  const ownedPath = tableOutputPath(manifest)
  if (manifest.ownedPath !== ownedPath || manifest.id !== artifactId(manifest)) throw new Error('Invalid Guides table artifact ownership identity')
  if (expected && artifactId(manifest) !== artifactId(expected)) throw new Error(`Unexpected Guides table artifact: ${manifest.id}`)
  if (expected && Boolean(manifest.cleanup) !== Boolean(expected.cleanup)) throw new Error(`Guides table cleanup identity mismatch: ${manifest.id}`)
  const seen = new Set()
  for (const file of manifest.files || []) {
    if (typeof file.path !== 'string' || path.posix.normalize(file.path) !== file.path || !allowedPath(ownedPath, file.path) || seen.has(file.path)) throw new Error(`Unauthorized or duplicate table artifact path: ${file.path}`)
    seen.add(file.path)
    const full = path.join(directory, 'payload', file.path)
    const stat = await fs.lstat(full)
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Invalid table artifact payload: ${file.path}`)
    const bytes = await fs.readFile(full)
    if (bytes.length !== file.size || crypto.createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw new Error(`Table artifact checksum mismatch: ${file.path}`)
  }
  if (!manifest.cleanup && seen.size === 0) throw new Error(`Guides table artifact has no files: ${manifest.id}`)
  return manifest
}

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index], value = argv[index + 1]
    if (!flag?.startsWith('--') || value == null) throw new Error('Invalid arguments')
    args[flag.slice(2)] = value
  }
  return args
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2))
  const entry = JSON.parse(args.entry)
  const promise = args.operation === 'create'
    ? createGuidesTableArtifact({ workspace: args.workspace, output: args.output, entry, masterSha: args['master-sha'], devBaselineSha: args['dev-baseline-sha'], sourceArtifactSha256: args['source-artifact-sha256'] })
    : args.operation === 'validate'
      ? validateGuidesTableArtifact(args.artifact, entry)
      : Promise.reject(new Error('Unknown operation'))
  promise.catch(error => { console.error(error.message); process.exitCode = 1 })
}

module.exports = { artifactId, createGuidesTableArtifact, validateGuidesTableArtifact }
