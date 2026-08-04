#!/usr/bin/env node
'use strict'

const fs = require('node:fs/promises')
const path = require('node:path')
const { artifactId, validateGuidesTableArtifact } = require('./guides-table-artifact')

function frontmatterToken(source) {
  if (!source.startsWith('---\n')) return null
  const end = source.indexOf('\n---\n', 4)
  if (end < 0) return null
  const match = /^token:\s*(?:"([^"]+)"|'([^']+)'|(\S+))\s*$/m.exec(source.slice(4, end))
  return match ? (match[1] || match[2] || match[3]) : null
}

function tutorialsRoot(ownedPath) {
  const marker = '/tutorials/'
  const index = ownedPath.indexOf(marker)
  if (index < 0) throw new Error(`Guides table artifact is outside tutorials: ${ownedPath}`)
  return ownedPath.slice(0, index + '/tutorials'.length)
}

async function pruneMovedCanonicalFiles({ artifacts, target }) {
  const incoming = new Map()
  for (const { directory, manifest } of artifacts.values()) {
    const root = tutorialsRoot(manifest.ownedPath)
    for (const file of manifest.files) {
      if (!/\.mdx?$/u.test(file.path)) continue
      const token = frontmatterToken(await fs.readFile(path.join(directory, 'payload', file.path), 'utf8'))
      if (!token) continue
      const key = `${root}\0${token}`
      if (!incoming.has(key)) incoming.set(key, new Set())
      incoming.get(key).add(file.path)
    }
  }

  const roots = new Set([...incoming.keys()].map(key => key.slice(0, key.indexOf('\0'))))
  async function visit(root, directory) {
    let entries
    try { entries = await fs.readdir(path.join(target, directory), { withFileTypes: true }) }
    catch (error) { if (error.code === 'ENOENT') return; throw error }
    for (const entry of entries) {
      const relative = path.posix.join(directory, entry.name)
      if (entry.isDirectory()) await visit(root, relative)
      else if (entry.isFile() && /\.mdx?$/u.test(entry.name)) {
        const token = frontmatterToken(await fs.readFile(path.join(target, relative), 'utf8'))
        const expected = token ? incoming.get(`${root}\0${token}`) : null
        if (expected && !expected.has(relative)) await fs.rm(path.join(target, relative))
      }
    }
  }
  for (const root of roots) await visit(root, root)
}

async function restoreGuidesTableArtifacts({ matrix, artifactDirs, target, sourceArtifactSha256 = null }) {
  if (!Array.isArray(matrix) || !Array.isArray(artifactDirs)) throw new Error('matrix and artifactDirs must be arrays')
  const expected = new Map()
  for (const entry of matrix) {
    const id = artifactId(entry)
    if (expected.has(id)) throw new Error(`Duplicate Guides table matrix entry: ${id}`)
    expected.set(id, entry)
  }
  const artifacts = new Map()
  for (const directory of artifactDirs) {
    const manifest = await validateGuidesTableArtifact(directory)
    if (sourceArtifactSha256 && manifest.sourceArtifactSha256 !== sourceArtifactSha256) throw new Error(`Guides table source artifact mismatch: ${manifest.id}`)
    if (artifacts.has(manifest.id)) throw new Error(`Duplicate Guides table artifact: ${manifest.id}`)
    artifacts.set(manifest.id, { directory, manifest })
  }
  for (const id of expected.keys()) if (!artifacts.has(id)) throw new Error(`Missing Guides table artifact: ${id}`)
  for (const id of artifacts.keys()) if (!expected.has(id)) throw new Error(`Extra Guides table artifact: ${id}`)

  await pruneMovedCanonicalFiles({ artifacts, target })

  const restored = []
  for (const [id, entry] of expected) {
    const { directory, manifest } = artifacts.get(id)
    await validateGuidesTableArtifact(directory, entry)
    await fs.rm(path.join(target, manifest.ownedPath), { recursive: true, force: true })
    for (const file of manifest.files) {
      const destination = path.join(target, file.path)
      await fs.mkdir(path.dirname(destination), { recursive: true })
      await fs.copyFile(path.join(directory, 'payload', file.path), destination)
    }
    restored.push(manifest)
  }
  return restored
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

async function main(argv) {
  try {
    const args = parseArgs(argv)
    const matrix = JSON.parse(await fs.readFile(args['matrix-file'], 'utf8')).include || []
    const artifactDirs = (await fs.readdir(args['artifacts-root'], { withFileTypes: true }))
      .filter(entry => entry.isDirectory())
      .map(entry => path.join(args['artifacts-root'], entry.name, 'guides-table'))
    await restoreGuidesTableArtifacts({ matrix, artifactDirs, target: args.target, sourceArtifactSha256: args['source-artifact-sha256'] || null })
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

if (require.main === module) main(process.argv.slice(2))

module.exports = { frontmatterToken, pruneMovedCanonicalFiles, restoreGuidesTableArtifacts }
