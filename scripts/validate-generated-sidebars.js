'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { getGroupPaths } = require('./docs-workflow/group-paths')

const referenceSidebarTargets = Object.freeze([
  { sidebar: 'python.sidebar.js', idPrefix: 'api/python/python' },
  { sidebar: 'java.sidebar.js', idPrefix: 'api/java/java/v2' },
  { sidebar: 'node.sidebar.js', idPrefix: 'api/nodejs/nodejs' },
  { sidebar: 'go.sidebar.js', idPrefix: 'api/go/go/v2' },
  { sidebar: 'cli.sidebar.js', idPrefix: 'cli/cli' },
  { sidebar: 'restful.sidebar.js', idPrefix: 'api/restful/restful' },
])

function validateSidebar(sidebar, label = 'sidebar') {
  const seenIds = new Map()
  const seenKeys = new Map()
  const errors = []

  function visit(items, trail = []) {
    for (const item of items || []) {
      if (!item || typeof item !== 'object') continue
      const itemLabel = item.label || item.id || item.key || item.type || 'item'
      const location = [...trail, itemLabel].join(' > ')
      if ((item.type === 'doc' || item.type === 'ref') && item.id) {
        const identity = `${item.id}\u0000${item.key || ''}`
        if (seenIds.has(identity)) errors.push(`duplicate doc id/key identity "${item.id}" at ${location}; first seen at ${seenIds.get(identity)}`)
        else seenIds.set(identity, location)
      }
      if (item.key) {
        if (seenKeys.has(item.key)) errors.push(`duplicate key "${item.key}" at ${location}; first seen at ${seenKeys.get(item.key)}`)
        else seenKeys.set(item.key, location)
      }
      if (Array.isArray(item.items)) visit(item.items, [...trail, itemLabel])
    }
  }

  visit(sidebar)
  if (errors.length) throw new Error(`${label} contains duplicate sidebar entries:\n- ${errors.join('\n- ')}`)
}

function collectSidebarDocIds(sidebar) {
  const ids = new Set()
  function visit(items) {
    for (const item of items || []) {
      if ((item.type === 'doc' || item.type === 'ref') && item.id) ids.add(item.id)
      if (item.link?.type === 'doc' && item.link.id) ids.add(item.link.id)
      if (Array.isArray(item.items)) visit(item.items)
    }
  }
  visit(sidebar)
  return ids
}

function hasDocFile(root, id) {
  const normalized = id.split('/').filter(Boolean)
  if (normalized.length === 0 || normalized.some(part => part === '.' || part === '..')) return false
  const base = path.join(root, ...normalized)
  return fs.existsSync(`${base}.md`) || fs.existsSync(`${base}.mdx`)
}

function validateSidebarDocTargets({ outputDir, sidebar, idPrefix, label = 'sidebar' }) {
  const missing = [...collectSidebarDocIds(sidebar)]
    .filter(id => id.startsWith(`${idPrefix}/`) || id === idPrefix)
    .filter(id => !hasDocFile(outputDir, id))
    .sort()
  if (missing.length) {
    throw new Error(`${label} references missing generated document files:\n- ${missing.join('\n- ')}`)
  }
  return { checked: collectSidebarDocIds(sidebar).size, missing }
}

function validateAllGeneratedSidebars(directory) {
  const files = fs.readdirSync(directory)
    .filter(file => file.endsWith('.sidebar.js'))
    .sort()
  for (const file of files) {
    const filePath = path.join(directory, file)
    delete require.cache[require.resolve(filePath)]
    validateSidebar(require(filePath), file)
  }
  return files.length
}

function validateReferenceSidebarTargets({ directory, outputDir }) {
  const results = []
  for (const target of referenceSidebarTargets) {
    const sidebarPath = path.join(directory, target.sidebar)
    if (!fs.existsSync(sidebarPath)) continue
    delete require.cache[require.resolve(sidebarPath)]
    results.push({
      sidebar: target.sidebar,
      ...validateSidebarDocTargets({
        outputDir,
        sidebar: require(sidebarPath),
        idPrefix: target.idPrefix,
        label: target.sidebar,
      }),
    })
  }
  return results
}

function validatePreservedEnglishFiles({ cwd = process.cwd() } = {}) {
  const missing = ['python', 'java', 'node', 'go', 'cli']
    .flatMap(group => getGroupPaths(group).preservedEnglish)
    .filter(relativePath => !fs.existsSync(path.join(cwd, ...relativePath.split('/'))))
    .sort()
  if (missing.length) throw new Error(`Missing preserved landing pages:\n- ${missing.join('\n- ')}`)
  return { checked: 5, missing }
}

function main() {
  const directory = path.join(process.cwd(), 'config/generated')
  const count = validateAllGeneratedSidebars(directory)
  console.log(`[sidebar-validation] validated ${count} generated sidebar file(s)`)
  for (const result of validateReferenceSidebarTargets({
    directory,
    outputDir: path.join(process.cwd(), 'reference'),
  })) {
    console.log(`[sidebar-validation] ${result.sidebar}: ${result.checked} doc target(s) checked`)
  }
  const preserved = validatePreservedEnglishFiles()
  console.log(`[sidebar-validation] ${preserved.checked} preserved landing page(s) checked`)
  const candidate = path.join(process.cwd(), 'plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json')
  if (fs.existsSync(candidate)) {
    const applyOverrides = require('../config/applyOverrides')
    const { validateGuidesCoverage } = require('./validate-guides-coverage')
    const { validateGuidesSourceContract } = require('./validate-guides-source-contract')
    const snapshot = JSON.parse(fs.readFileSync(candidate, 'utf8'))
    for (const config of [
      { target: 'zilliz.saas', outputDir: 'docs/tutorials', idPrefix: 'tutorials', sidebarPath: 'config/generated/guides.sidebar.js', overridePath: 'config/sidebar-overrides/guides.json', ignoredGeneratedIds: ['tutorials/home'] },
      { target: 'zilliz.paas', outputDir: 'docs-byoc/tutorials', idPrefix: 'tutorials', sidebarPath: 'config/generated/guides-byoc.sidebar.js', overridePath: 'config/sidebar-overrides/guides-byoc.json', ignoredGeneratedIds: [] },
    ]) {
      delete require.cache[require.resolve(path.resolve(config.sidebarPath))]
      const sidebar = require(path.resolve(config.sidebarPath))
      const contract = validateGuidesSourceContract({ snapshot, target: config.target, outputDir: config.outputDir, idPrefix: config.idPrefix, sidebar })
      console.log(`[guides-contract] ${config.sidebarPath}: ${contract.checkedRecords} Base record(s) checked`)
      const effectiveSidebar = applyOverrides(sidebar, path.resolve(config.overridePath))
      const result = validateGuidesCoverage({ outputDir: config.outputDir, idPrefix: config.idPrefix, sidebar: effectiveSidebar, ignoredGeneratedIds: config.ignoredGeneratedIds })
      console.log(`[guides-coverage] ${config.sidebarPath}: ${result.generatedDocs} generated docs covered`)
    }
  }
}

if (require.main === module) main()

module.exports = {
  collectSidebarDocIds,
  referenceSidebarTargets,
  validateAllGeneratedSidebars,
  validatePreservedEnglishFiles,
  validateReferenceSidebarTargets,
  validateSidebar,
  validateSidebarDocTargets,
}
