'use strict'

const fs = require('node:fs')
const path = require('node:path')

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

function main() {
  const directory = path.join(process.cwd(), 'config/generated')
  const count = validateAllGeneratedSidebars(directory)
  console.log(`[sidebar-validation] validated ${count} generated sidebar file(s)`)
  const candidate = path.join(process.cwd(), 'plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json')
  if (fs.existsSync(candidate)) {
    const { validateGuidesCoverage } = require('./validate-guides-coverage')
    for (const config of [
      { outputDir: 'docs/tutorials', idPrefix: 'tutorials', sidebarPath: 'config/generated/guides.sidebar.js' },
      { outputDir: 'docs-byoc/tutorials', idPrefix: 'tutorials', sidebarPath: 'config/generated/guides-byoc.sidebar.js' },
    ]) {
      const result = validateGuidesCoverage({ outputDir: config.outputDir, idPrefix: config.idPrefix, sidebar: require(path.resolve(config.sidebarPath)) })
      console.log(`[guides-coverage] ${config.sidebarPath}: ${result.generatedDocs} generated docs covered`)
    }
  }
}

if (require.main === module) main()

module.exports = { validateAllGeneratedSidebars, validateSidebar }
