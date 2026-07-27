'use strict'

const { createRequire } = require('node:module')
const path = require('node:path')

const repositoryRoot = path.resolve(__dirname, '../..')
const requireFromDocsApp = createRequire(path.join(repositoryRoot, 'apps/docs/package.json'))
const jiti = requireFromDocsApp('jiti')(__filename, { interopDefault: true })

function loadTypeScript(modulePath) {
  return jiti(modulePath)
}

module.exports = { loadTypeScript }
