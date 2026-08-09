'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {execFile} = require('node:child_process')
const {promisify} = require('node:util')

const execFileAsync = promisify(execFile)

function normalizeExpectedFiles(expectedFiles) {
  if (!Array.isArray(expectedFiles) || !expectedFiles.length) throw new Error('expectedFiles must be a non-empty array')
  const result = expectedFiles.map(file => {
    if (typeof file !== 'string' || !file || path.posix.isAbsolute(file) || path.posix.normalize(file) !== file ||
      file.split('/').some(part => !part || part === '.' || part === '..') || /[\\\0\r\n]/u.test(file)) {
      throw new Error(`Expected artifact file is unsafe: ${file}`)
    }
    return file
  })
  if (new Set(result).size !== result.length) throw new Error('Expected artifact files must be unique')
  return result.sort()
}

function safeArchivePath(value) {
  if (typeof value !== 'string' || !value || value.includes('\\') || value.startsWith('/') || value.includes('\0')) return false
  const normalized = value.endsWith('/') ? value.slice(0, -1) : value
  if (!normalized || path.posix.normalize(normalized) !== normalized) return false
  return !normalized.split('/').some(part => !part || part === '.' || part === '..')
}

function validateArchiveEntries(entries, expectedFilesInput = null) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('Artifact archive is empty')
  const seen = new Set()
  const files = []
  for (const raw of entries) {
    const entry = typeof raw === 'string'
      ? {path: raw, type: raw.endsWith('/') ? 'directory' : 'file'}
      : raw
    if (!entry || !safeArchivePath(entry.path)) throw new Error(`unsafe artifact path: ${String(entry?.path ?? raw)}`)
    const normalized = entry.path.endsWith('/') ? entry.path.slice(0, -1) : entry.path
    if (seen.has(normalized)) throw new Error(`Artifact archive contains a duplicate entry: ${normalized}`)
    seen.add(normalized)
    if (entry.type === 'symlink') throw new Error(`Artifact archive contains a symlink: ${normalized}`)
    if (!['file', 'directory'].includes(entry.type)) throw new Error(`Artifact archive contains an unsupported entry: ${normalized}`)
    if (entry.type === 'file') files.push(normalized)
  }
  if (expectedFilesInput !== null) {
    const expectedFiles = normalizeExpectedFiles(expectedFilesInput)
    files.sort()
    if (files.length !== expectedFiles.length || files.some((file, index) => file !== expectedFiles[index])) {
      throw new Error(`Artifact archive contains unexpected or missing files: ${files.join(', ')}`)
    }
  }
  return entries
}

function assertSafeExtraction(root) {
  const resolvedRoot = path.resolve(root)
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const file = path.resolve(directory, entry.name)
      if (file !== resolvedRoot && !file.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error('Artifact extraction escaped its destination')
      const stats = fs.lstatSync(file)
      if (stats.isSymbolicLink()) throw new Error('Artifact contains a symlink')
      if (stats.isDirectory()) visit(file)
      else if (!stats.isFile()) throw new Error('Artifact contains an unsupported extracted entry')
    }
  }
  visit(resolvedRoot)
}

function inspectExtractedFiles(root, expectedFilesInput) {
  const expectedFiles = normalizeExpectedFiles(expectedFilesInput)
  assertSafeExtraction(root)
  const actual = []
  const visit = (directory, prefix = '') => {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name
      const target = path.join(directory, entry.name)
      const stat = fs.lstatSync(target)
      if (stat.isDirectory()) visit(target, relative)
      else if (stat.isFile()) actual.push(relative)
    }
  }
  visit(root)
  actual.sort()
  if (actual.length !== expectedFiles.length || actual.some((file, index) => file !== expectedFiles[index])) {
    throw new Error(`Artifact download contains unexpected or missing files: ${actual.join(', ')}`)
  }
  return Object.freeze(Object.fromEntries(actual.map(relative => [relative, path.join(root, ...relative.split('/'))])))
}

function findExactFile(root, expectedName) {
  const matches = []
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const file = path.join(directory, entry.name)
      if (entry.isDirectory()) visit(file)
      else if (entry.name === expectedName) matches.push(file)
    }
  }
  visit(root)
  if (matches.length !== 1) throw new Error(`Artifact must contain exactly one ${expectedName}`)
  return matches[0]
}

async function inspectZipArchive(archive, execute = execFileAsync) {
  const [{stdout: namesOutput}, {stdout: detailsOutput}] = await Promise.all([
    execute('unzip', ['-Z1', archive]),
    execute('unzip', ['-ZTs', archive]),
  ])
  const names = String(namesOutput).split('\n').filter(Boolean)
  const detailLines = String(detailsOutput).split('\n').filter(line => /^[bcdlps-][rwxStTs-]*\s+/u.test(line))
  if (detailLines.length !== names.length) throw new Error('Artifact archive entry metadata is ambiguous')
  return names.map((entryPath, index) => {
    const mode = detailLines[index][0]
    const type = mode === '-' ? 'file' : mode === 'd' ? 'directory' : mode === 'l' ? 'symlink' : 'unsupported'
    return {path: entryPath, type}
  })
}

async function unzipArchive(archive, destination, execute = execFileAsync) {
  await execute('unzip', ['-qq', archive, '-d', destination])
}

module.exports = {
  assertSafeExtraction,
  findExactFile,
  inspectExtractedFiles,
  inspectZipArchive,
  normalizeExpectedFiles,
  unzipArchive,
  validateArchiveEntries,
}
