'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

test('library build emits the stylesheet path exported by the package', () => {
  const directory = __dirname
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'))
  const exportedCss = manifest.exports['./dist/style.css']
  const config = fs.readFileSync(path.join(directory, 'vite.config.ts'), 'utf8')

  assert.equal(exportedCss, './dist/style.css')
  assert.match(config, /cssFileName:\s*['"]style['"]/)
})
