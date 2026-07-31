#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')

function readJson(file, label) {
  const value = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be a JSON object`)
  return value
}

function replaceDirectory(root, preserved = []) {
  const saved = preserved.map(relative => {
    const target = path.join(root, relative)
    return fs.existsSync(target) ? [relative, fs.readFileSync(target)] : null
  }).filter(Boolean)
  fs.rmSync(root, { recursive: true, force: true })
  fs.mkdirSync(root, { recursive: true })
  for (const [relative, bytes] of saved) {
    const target = path.join(root, relative)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, bytes, { flag: 'wx' })
  }
}

function prepareGuidesBootstrapStage({ site, workspace, decisionFile, matrixFile }) {
  if (site !== 'zh-CN') return { cleaned: false, reason: 'site-not-chinese' }
  const decision = readJson(decisionFile, 'Guides assembly decision')
  if (decision.baselineDescriptorPresent !== false) return { cleaned: false, reason: 'baseline-descriptor-present' }
  if (decision.mode !== 'regenerate') throw new Error('Chinese Guides bootstrap cleanup requires regenerate mode')
  const matrix = readJson(matrixFile, 'Guides table matrix')
  if (!Array.isArray(matrix.include) || matrix.include.length !== decision.tableCount) {
    throw new Error('Chinese Guides bootstrap cleanup requires the complete planned table matrix')
  }
  if (matrix.include.some(entry => entry?.site !== 'zh-CN' || entry.cleanup === true)) {
    throw new Error('Chinese Guides bootstrap cleanup requires active Chinese table renders')
  }

  const root = path.resolve(workspace)
  replaceDirectory(path.join(root, 'tmp/docs-tooling/zh-CN/guides/content/zh-CN/guides'), ['tutorials/home.md'])
  replaceDirectory(path.join(root, 'tmp/docs-tooling/zh-CN/guides-byoc/content/zh-CN/byoc'))
  return { cleaned: true, reason: 'first-bootstrap' }
}

function parseArgs(argv) {
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined) throw new Error('Invalid arguments')
    values[flag.slice(2)] = value
  }
  for (const key of ['site', 'workspace', 'decision', 'matrix-file']) if (!values[key]) throw new Error(`Missing --${key}`)
  return values
}

if (require.main === module) {
  try {
    const args = parseArgs(process.argv.slice(2))
    const result = prepareGuidesBootstrapStage({
      site: args.site,
      workspace: args.workspace,
      decisionFile: args.decision,
      matrixFile: args['matrix-file'],
    })
    console.log(`[guides-bootstrap] ${result.cleaned ? 'cleaned seeded Chinese output' : `skipped: ${result.reason}`}`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = { prepareGuidesBootstrapStage, replaceDirectory }
