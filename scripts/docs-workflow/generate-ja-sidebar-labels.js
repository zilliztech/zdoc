#!/usr/bin/env node
'use strict'

const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const DICTIONARY_PATH = 'config/translation/ja-JP-sidebar-labels.json'

// Repository root, resolved from this script's location so the CLI works from
// any cwd (the en site build invokes it from apps/docs).
const DEFAULT_WORKSPACE = path.resolve(__dirname, '..', '..')

// Docusaurus derives a sidebar item's translation key from `item.key ?? item.label`
// (see @docusaurus/plugin-content-docs/src/translations.ts). The dictionary is keyed
// the same way so it stays valid across reordering/renesting; only a brand-new item
// (a key the current English sidebar doesn't already have) needs a new entry.
const PLUGIN_TARGETS = Object.freeze([
  {
    pluginLabel: 'guides',
    legacySidebarPath: 'packages/site-config/src/sidebars/en/guides.legacy.ts',
    outputPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current.json',
  },
  {
    pluginLabel: 'guides-byoc',
    legacySidebarPath: 'packages/site-config/src/sidebars/en/byoc.legacy.ts',
    outputPath: 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current.json',
  },
])

function effectiveKey(item) {
  return item.key ?? item.label
}

// Mirrors Docusaurus's own flattenSidebarItems/collectSidebarItemsOfType: only
// category items recurse, at any depth, in document order.
function collectCategoriesAndLinks(items) {
  const categories = []
  const links = []
  function walk(nodes) {
    for (const item of nodes || []) {
      if (item.type === 'category') {
        categories.push(item)
        walk(item.items)
      } else if (item.type === 'link') {
        links.push(item)
      }
    }
  }
  walk(items)
  return { categories, links }
}

function buildPluginTranslations(sidebarsConfig, labels, pluginLabel) {
  const entries = {}
  const missing = []
  for (const [sidebarName, items] of Object.entries(sidebarsConfig)) {
    const { categories, links } = collectCategoriesAndLinks(items)
    for (const category of categories) {
      const key = effectiveKey(category)
      const message = labels[key]
      if (message === undefined) {
        missing.push({ pluginLabel, sidebarName, type: 'category', key, englishLabel: category.label })
        continue
      }
      entries[`sidebar.${sidebarName}.category.${key}`] = {
        message,
        description: `The label for category '${category.label}' in sidebar '${sidebarName}'`,
      }
    }
    for (const link of links) {
      const key = effectiveKey(link)
      const message = labels[key]
      if (message === undefined) {
        missing.push({ pluginLabel, sidebarName, type: 'link', key, englishLabel: link.label })
        continue
      }
      entries[`sidebar.${sidebarName}.link.${key}`] = {
        message,
        description: `The label for link '${link.label}' in sidebar '${sidebarName}', linking to '${link.href}'`,
      }
    }
  }
  return { entries, missing }
}

function loadDictionary(workspace, fsImpl = fs) {
  const dictionaryPath = path.join(workspace, DICTIONARY_PATH)
  const raw = fsImpl.readFileSync(dictionaryPath, 'utf8')
  const parsed = JSON.parse(raw)
  if (!parsed || typeof parsed.labels !== 'object' || parsed.labels === null) {
    throw new Error(`${DICTIONARY_PATH} must define a "labels" object`)
  }
  return parsed.labels
}

// Code-point order, not localeCompare: the output must be byte-identical
// regardless of the ICU data on the machine that runs the build.
function sortEntries(entries) {
  const sorted = {}
  for (const key of Object.keys(entries).sort()) sorted[key] = entries[key]
  return sorted
}

function formatMissing(missing) {
  return missing
    .map(m => `  - [${m.pluginLabel}] sidebar.${m.sidebarName}.${m.type}.${m.key} (English: "${m.englishLabel}")`)
    .join('\n')
}

// These files are generated at build time, never published as tracked dev
// content. If one ever lands tracked, build-time generation would silently
// shadow it on every build:en, so refuse instead.
function assertOutputsUntracked(workspace, execImpl = execFileSync) {
  for (const target of PLUGIN_TARGETS) {
    try {
      execImpl('git', ['ls-files', '--error-unmatch', '--', target.outputPath], { cwd: workspace, stdio: 'ignore' })
    } catch {
      continue
    }
    throw new Error(
      `${target.outputPath} is git-tracked; build-time generation refuses to shadow a publication-lane-owned file`,
    )
  }
}

// `loadSidebars` is injected (rather than requiring `../lib/load-typescript.js`
// directly) so tests can supply an in-memory sidebars config instead of loading
// real TypeScript through jiti.
//
// missingPolicy 'fail' (default) throws when any sidebar item has no dictionary
// entry; 'allow' writes the found entries, skips the rest (Docusaurus falls back
// to the English label), and returns them in `missing` so callers can report the
// gap. The en site build runs this with --allow-missing so a brand-new English
// category cannot break every locale's build.
function generateJaSidebarLabels({
  workspace = DEFAULT_WORKSPACE,
  fsImpl = fs,
  loadSidebars,
  targets = PLUGIN_TARGETS,
  missingPolicy = 'fail',
}) {
  if (!['fail', 'allow'].includes(missingPolicy)) {
    throw new Error(`missingPolicy must be 'fail' or 'allow', got '${missingPolicy}'`)
  }
  if (typeof loadSidebars !== 'function') throw new Error('loadSidebars loader function is required')

  const labels = loadDictionary(workspace, fsImpl)
  const allMissing = []
  const results = []

  for (const target of targets) {
    const sidebarsConfig = loadSidebars(path.join(workspace, target.legacySidebarPath))
    const { entries, missing } = buildPluginTranslations(sidebarsConfig, labels, target.pluginLabel)
    allMissing.push(...missing)
    results.push({ target, entries })
  }

  if (allMissing.length > 0 && missingPolicy === 'fail') {
    throw new Error(
      `${DICTIONARY_PATH} is missing ${allMissing.length} sidebar label(s):\n${formatMissing(allMissing)}`,
    )
  }

  const written = []
  for (const { target, entries } of results) {
    const outputPath = path.join(workspace, target.outputPath)
    const content = `${JSON.stringify(sortEntries(entries), null, 2)}\n`
    fsImpl.mkdirSync(path.dirname(outputPath), { recursive: true })
    fsImpl.writeFileSync(outputPath, content)
    written.push({ pluginLabel: target.pluginLabel, outputPath: target.outputPath, entryCount: Object.keys(entries).length })
  }

  return { written, missing: allMissing }
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2)
    const unknown = args.filter(arg => arg !== '--allow-missing')
    if (unknown.length > 0) {
      throw new Error(`Unknown argument(s): ${unknown.join(', ')}; supported: --allow-missing`)
    }
    const { loadTypeScript } = require('../lib/load-typescript.js')
    assertOutputsUntracked(DEFAULT_WORKSPACE)
    const result = generateJaSidebarLabels({
      workspace: DEFAULT_WORKSPACE,
      loadSidebars: loadTypeScript,
      missingPolicy: args.includes('--allow-missing') ? 'allow' : 'fail',
    })
    for (const entry of result.written) {
      console.log(`Wrote ${entry.entryCount} label(s) to ${entry.outputPath} (${entry.pluginLabel})`)
    }
    if (result.missing.length > 0) {
      console.warn(
        `[ja-sidebar-labels] ${DICTIONARY_PATH} is missing ${result.missing.length} sidebar label(s); ` +
        'they fall back to English until the dictionary gains their keys:',
      )
      console.warn(formatMissing(result.missing))
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = {
  DEFAULT_WORKSPACE,
  DICTIONARY_PATH,
  PLUGIN_TARGETS,
  effectiveKey,
  collectCategoriesAndLinks,
  buildPluginTranslations,
  loadDictionary,
  sortEntries,
  assertOutputsUntracked,
  generateJaSidebarLabels,
}
