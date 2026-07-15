#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')

function collectSidebarIds(sidebar) {
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

function standaloneSidebar(contents) {
  const match = contents.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!match) return false
  const sidebar = match[1].match(/^displayed_sidebar:\s*['"]?([^'"\s]+)['"]?\s*$/m)?.[1]
  return sidebar === 'releasesSidebar'
}

function collectGeneratedDocIds(outputDir, idPrefix) {
  const ids = new Set()
  function visit(relative = '') {
    const directory = path.join(outputDir, relative)
    if (!fs.existsSync(directory)) return
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const child = path.posix.join(relative.replaceAll(path.sep, '/'), entry.name)
      if (entry.isDirectory()) visit(child)
      else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
        const contents = fs.readFileSync(path.join(outputDir, child), 'utf8')
        if (standaloneSidebar(contents)) continue
        ids.add(path.posix.join(idPrefix, child.replace(/\.mdx?$/, '')))
      }
    }
  }
  visit()
  return ids
}

function validateGuidesCoverage({ outputDir, idPrefix = 'tutorials', sidebar, ignoredGeneratedIds = [] }) {
  const generated = collectGeneratedDocIds(outputDir, idPrefix)
  const sidebarIds = collectSidebarIds(sidebar)
  const ignored = new Set(ignoredGeneratedIds)
  const missingFromSidebar = [...generated].filter(id => !ignored.has(id) && !sidebarIds.has(id)).sort()
  const missingGeneratedFiles = [...sidebarIds].filter(id => id.startsWith(`${idPrefix}/`) && !generated.has(id)).sort()
  if (missingFromSidebar.length || missingGeneratedFiles.length) {
    throw new Error([
      'Guides coverage mismatch:',
      `generated docs: ${generated.size}`,
      `sidebar docs/refs: ${sidebarIds.size}`,
      `missing from sidebar: ${missingFromSidebar.length}${missingFromSidebar.length ? ` (${missingFromSidebar.slice(0, 5).join(', ')})` : ''}`,
      `missing generated files: ${missingGeneratedFiles.length}${missingGeneratedFiles.length ? ` (${missingGeneratedFiles.slice(0, 5).join(', ')})` : ''}`,
    ].join(' '))
  }
  return { generatedDocs: generated.size, sidebarDocs: sidebarIds.size, missingFromSidebar, missingGeneratedFiles }
}

if (require.main === module) {
  try {
    for (const config of [
      { outputDir: 'docs/tutorials', idPrefix: 'tutorials', sidebarPath: 'config/generated/guides.sidebar.js' },
      { outputDir: 'docs-byoc/tutorials', idPrefix: 'tutorials', sidebarPath: 'config/generated/guides-byoc.sidebar.js' },
    ]) {
      delete require.cache[require.resolve(path.resolve(config.sidebarPath))]
      const result = validateGuidesCoverage({ ...config, sidebar: require(path.resolve(config.sidebarPath)) })
      console.log(`[guides-coverage] ${config.sidebarPath}: ${result.generatedDocs} generated docs covered`)
    }
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = { collectSidebarIds, collectGeneratedDocIds, validateGuidesCoverage }
