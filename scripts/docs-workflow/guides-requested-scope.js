#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const SITES = new Set(['en', 'zh-CN'])
const CONTENT_MARKERS = Object.freeze({
  guides: /^\/content\/(en|zh-CN)\/guides\//,
  byoc: /^\/content\/(en|zh-CN)\/byoc\//,
})

class RequestedScopeViolation extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'RequestedScopeViolation'
    this.code = code
    this.details = details
  }
}

function contentRoots(site) {
  if (!SITES.has(site)) throw new Error('Requested scope site must be en or zh-CN')
  return [`content/${site}/guides`, `content/${site}/byoc`]
}

function sidebarPaths(site) {
  return [`generated/${site}/sidebars/guides.sidebar.js`, `generated/${site}/sidebars/guides-byoc.sidebar.js`]
}

function normalizeRenderedPath(renderPath, site) {
  const normalized = path.posix.normalize(String(renderPath || ''))
  const marker = `/content/${site}/guides/`
  const byocMarker = `/content/${site}/byoc/`
  const guidesIndex = normalized.indexOf(marker)
  const byocIndex = normalized.indexOf(byocMarker)
  if (guidesIndex === -1 && byocIndex === -1) return null
  if (guidesIndex !== -1 && (byocIndex === -1 || guidesIndex < byocIndex)) {
    return `content/${site}/guides/${normalized.slice(guidesIndex + marker.length)}`
  }
  return `content/${site}/byoc/${normalized.slice(byocIndex + byocMarker.length)}`
}

function readTableArtifactManifest(directory) {
  const manifestPath = path.join(directory, 'manifest.json')
  if (!fs.existsSync(manifestPath) || !fs.statSync(manifestPath).isFile()) {
    throw new Error(`Requested scope table artifact manifest is missing: ${directory}`)
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  if (manifest.schemaVersion !== 1 || manifest.manual !== 'guides' || manifest.artifactType !== 'table') {
    throw new Error(`Requested scope table artifact identity is invalid: ${directory}`)
  }
  if (!SITES.has(manifest.site)) throw new Error(`Requested scope table artifact site is invalid: ${directory}`)
  if (typeof manifest.ownedPath !== 'string' || !manifest.ownedPath) throw new Error(`Requested scope table artifact ownedPath is missing: ${directory}`)
  if (typeof manifest.cleanup !== 'boolean') throw new Error(`Requested scope table artifact cleanup flag is invalid: ${directory}`)
  if (!Array.isArray(manifest.files)) throw new Error(`Requested scope table artifact files are invalid: ${directory}`)
  return manifest
}

function collectTableArtifactAllowlist({ directories, site }) {
  const rendered = new Set()
  const ownedRoots = new Set()
  const artifactIds = []
  for (const directory of directories) {
    const manifest = readTableArtifactManifest(directory)
    if (manifest.site !== site) {
      throw new RequestedScopeViolation('CHECKPOINT_SCOPE_VIOLATION', `Table artifact site ${manifest.site} does not match the requested scope site ${site}.`, { directory })
    }
    const ownedRoot = normalizeRenderedPath(manifest.ownedPath, site)
    if (!ownedRoot) {
      throw new RequestedScopeViolation('CHECKPOINT_SCOPE_VIOLATION', `Table artifact ownedPath does not map to a site content root: ${manifest.ownedPath}`, { directory })
    }
    ownedRoots.add(ownedRoot)
    artifactIds.push(manifest.id || path.basename(directory))
    for (const file of manifest.files) {
      const normalized = normalizeRenderedPath(file.path, site)
      if (!normalized) {
        throw new RequestedScopeViolation('CHECKPOINT_SCOPE_VIOLATION', `Table artifact file does not map to a site content root: ${file.path}`, { directory })
      }
      rendered.add(normalized)
    }
  }
  return { rendered, ownedRoots: [...ownedRoots].sort(), artifactIds }
}

function walkTree(root, relativeRoot) {
  const files = new Map()
  if (!fs.existsSync(root)) return files
  const stack = [[root, relativeRoot]]
  while (stack.length > 0) {
    const [directory, relativeDirectory] = stack.pop()
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const full = path.join(directory, entry.name)
      const relative = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name
      if (entry.isSymbolicLink()) {
        throw new RequestedScopeViolation('CHECKPOINT_SCOPE_VIOLATION', `Symlinks are not allowed in requested checkpoint candidates: ${relative}`)
      }
      if (entry.isDirectory()) {
        stack.push([full, relative])
        continue
      }
      if (!entry.isFile()) {
        throw new RequestedScopeViolation('CHECKPOINT_SCOPE_VIOLATION', `Only regular files are allowed in requested checkpoint candidates: ${relative}`)
      }
      const stat = fs.statSync(full)
      if (stat.mode & 0o111) {
        throw new RequestedScopeViolation('CHECKPOINT_SCOPE_VIOLATION', `Executable files are not allowed in requested checkpoint candidates: ${relative}`)
      }
      files.set(relative, crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex'))
    }
  }
  return files
}

function fileHashIfPresent(root, relative) {
  const full = path.join(root, relative)
  if (!fs.existsSync(full)) return null
  const stat = fs.lstatSync(full)
  if (!stat.isFile()) {
    throw new RequestedScopeViolation('CHECKPOINT_SCOPE_VIOLATION', `Requested checkpoint candidate path is not a regular file: ${relative}`)
  }
  return crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex')
}

function underAnyRoot(pathname, roots) {
  return roots.some(root => pathname === root || pathname.startsWith(`${root}/`))
}

function evaluateRequestedScope({ site, baselineRoot, candidateRoot, tableArtifactDirectories, plan, stateMergeReceipt, generatedAt = new Date().toISOString() }) {
  if (!SITES.has(site)) throw new Error('Requested scope site must be en or zh-CN')
  if (!plan || plan.selection_mode !== 'requested') throw new Error('Requested scope evaluation requires a requested plan')
  if (!stateMergeReceipt || stateMergeReceipt.plan_sha256 !== plan.plan_sha256) {
    throw new RequestedScopeViolation('CHECKPOINT_SCOPE_VIOLATION', 'State-merge receipt is not bound to the requested plan.')
  }
  const allowlist = collectTableArtifactAllowlist({ directories: tableArtifactDirectories, site })

  const changed = { rendered: [], deletions: [], sidebars: [] }
  const violations = []
  for (const contentRoot of contentRoots(site)) {
    const baselineFiles = walkTree(path.join(baselineRoot, contentRoot), contentRoot)
    const candidateFiles = walkTree(path.join(candidateRoot, contentRoot), contentRoot)
    for (const [relative, candidateHash] of candidateFiles) {
      const baselineHash = baselineFiles.get(relative) || null
      if (baselineHash === candidateHash) continue
      if (allowlist.rendered.has(relative)) {
        changed.rendered.push(relative)
      } else {
        violations.push({ kind: 'content_change_outside_table_renders', path: relative })
      }
    }
    for (const relative of baselineFiles.keys()) {
      if (candidateFiles.has(relative)) continue
      if (underAnyRoot(relative, allowlist.ownedRoots)) {
        changed.deletions.push(relative)
      } else {
        violations.push({ kind: 'undeclared_deletion', path: relative })
      }
    }
  }
  for (const sidebar of sidebarPaths(site)) {
    const baselineHash = fileHashIfPresent(baselineRoot, sidebar)
    const candidateHash = fileHashIfPresent(candidateRoot, sidebar)
    if (baselineHash === candidateHash) continue
    changed.sidebars.push(sidebar)
  }

  violations.sort((left, right) => left.kind.localeCompare(right.kind) || left.path.localeCompare(right.path))
  const receipt = {
    schema_version: 1,
    generated_at: generatedAt,
    site,
    manual: 'guides',
    plan_sha256: plan.plan_sha256,
    state_merge_receipt_sha256: stateMergeReceipt.receipt_sha256 || null,
    table_artifacts: allowlist.artifactIds,
    changed,
    violations,
    conclusion: violations.length === 0 ? 'within_scope' : 'CHECKPOINT_SCOPE_VIOLATION',
  }
  if (violations.length > 0) {
    throw new RequestedScopeViolation('CHECKPOINT_SCOPE_VIOLATION', 'Requested checkpoint candidate contains changes outside the table-derived allowlist.', {
      violations,
      receipt,
    })
  }
  return receipt
}

function parseArgs(argv) {
  const required = new Set(['--site', '--baseline-root', '--candidate-root', '--plan', '--state-merge-receipt', '--table-artifacts'])
  const args = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!required.has(flag) && flag !== '--output') throw new Error(`Invalid argument: ${flag || '(missing)'}`)
    if (value === undefined || value === '') throw new Error(`Missing value for ${flag}`)
    if (Object.hasOwn(args, flag)) throw new Error(`Duplicate argument: ${flag}`)
    args[flag] = value
  }
  for (const flag of required) if (!Object.hasOwn(args, flag)) throw new Error(`Missing required argument: ${flag}`)
  return args
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  const receipt = evaluateRequestedScope({
    site: args['--site'],
    baselineRoot: path.resolve(args['--baseline-root']),
    candidateRoot: path.resolve(args['--candidate-root']),
    tableArtifactDirectories: args['--table-artifacts'].split(',').map(value => value.trim()).filter(Boolean).map(value => path.resolve(value)),
    plan: JSON.parse(fs.readFileSync(args['--plan'], 'utf8')),
    stateMergeReceipt: JSON.parse(fs.readFileSync(args['--state-merge-receipt'], 'utf8')),
  })
  if (args['--output']) {
    fs.mkdirSync(path.dirname(path.resolve(args['--output'])), { recursive: true })
    fs.writeFileSync(args['--output'], `${JSON.stringify(receipt, null, 2)}\n`)
  }
  process.stdout.write(`${JSON.stringify(receipt)}\n`)
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    if (error.name === 'RequestedScopeViolation') {
      console.error(`[requested-scope] ${error.code}: ${error.message}`)
    } else {
      console.error(`[requested-scope] ${error.message}`)
    }
    process.exitCode = 1
  }
}

module.exports = { evaluateRequestedScope, normalizeRenderedPath, RequestedScopeViolation }
