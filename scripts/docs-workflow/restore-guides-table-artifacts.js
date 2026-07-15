#!/usr/bin/env node
'use strict'

const fs = require('node:fs/promises')
const path = require('node:path')
const { artifactId, validateGuidesTableArtifact } = require('./guides-table-artifact')

async function restoreGuidesTableArtifacts({ matrix, artifactDirs, target }) {
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
    if (artifacts.has(manifest.id)) throw new Error(`Duplicate Guides table artifact: ${manifest.id}`)
    artifacts.set(manifest.id, { directory, manifest })
  }
  for (const id of expected.keys()) if (!artifacts.has(id)) throw new Error(`Missing Guides table artifact: ${id}`)
  for (const id of artifacts.keys()) if (!expected.has(id)) throw new Error(`Extra Guides table artifact: ${id}`)

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

module.exports = { restoreGuidesTableArtifacts }
