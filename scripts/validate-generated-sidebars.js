'use strict'

const fs = require('node:fs')
const path = require('node:path')

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

function parseSite(argv) {
  if (argv.length !== 2 || argv[0] !== '--site' || !['en', 'zh-CN'].includes(argv[1])) {
    throw new Error('Usage: validate-generated-sidebars.js --site <en|zh-CN>')
  }
  return argv[1]
}

function validateGeneratedSidebarsForSite({ site, cwd = process.cwd() }) {
  if (!['en', 'zh-CN'].includes(site)) throw new Error(`Unsupported documentation site: ${site}`)
  const directory = path.join(cwd, 'generated', site, 'sidebars')
  const count = validateAllGeneratedSidebars(directory)
  const referenceResults = site === 'en'
    ? validateReferenceSidebarTargets({ directory, outputDir: path.join(cwd, 'content/en/reference') })
    : []
  return { count, directory, referenceResults }
}

function main() {
  const site = parseSite(process.argv.slice(2))
  const result = validateGeneratedSidebarsForSite({ site })
  console.log(`[sidebar-validation] ${site}: validated ${result.count} generated sidebar file(s)`)
  for (const reference of result.referenceResults) {
    console.log(`[sidebar-validation] ${reference.sidebar}: ${reference.checked} doc target(s) checked`)
  }
}

if (require.main === module) main()

module.exports = {
  collectSidebarDocIds,
  parseSite,
  referenceSidebarTargets,
  validateAllGeneratedSidebars,
  validateGeneratedSidebarsForSite,
  validateReferenceSidebarTargets,
  validateSidebar,
  validateSidebarDocTargets,
}
