'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { loadTypeScript } = require('./lib/load-typescript')

const repositoryRoot = path.resolve(__dirname, '..')
const referencePresentation = loadTypeScript(path.resolve(repositoryRoot, 'packages/docs-tooling/src/manuals/derive/referencePresentation.ts'))

const outputs = [
  ['config/reference-navigation.json', referencePresentation.generateReferenceNavigationJson()],
  ['packages/site-config/src/sidebars/en/reference.ts', referencePresentation.generateEnReferenceSidebarModule()],
  ['packages/site-config/src/sidebars/zh-CN/reference.ts', referencePresentation.generateZhCnReferenceSidebarModule()],
  ['packages/site-config/src/generated/referencePresentation.ts', referencePresentation.generateSiteConfigReferenceFragment()],
  ['packages/docs-ui/src/shared/navigation/referenceTargets.generated.ts', referencePresentation.generateDocsUiReferenceTargetsModule()],
]

if (process.argv.length > 3 || (process.argv[2] && process.argv[2] !== '--check')) {
  throw new Error('Usage: generate-reference-presentation.js [--check]')
}

if (process.argv[2] === '--check') {
  for (const [relativePath, bytes] of outputs) {
    const absolutePath = path.join(repositoryRoot, relativePath)
    const current = fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : ''
    if (current !== bytes) {
      throw new Error(relativePath + ' is stale; run pnpm generate:reference-presentation')
    }
  }
} else {
  for (const [relativePath, bytes] of outputs) {
    const absolutePath = path.join(repositoryRoot, relativePath)
    fs.mkdirSync(path.dirname(absolutePath), {recursive: true})
    fs.writeFileSync(absolutePath, bytes)
  }
}

