'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')

function manifest(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function assertAtLeast(range, floor, requiredMajor) {
  assert.match(range, /^\^\d+\.\d+\.\d+$/)
  const actual = range.slice(1).split('.').map(Number)
  const minimum = floor.split('.').map(Number)
  assert.equal(actual[0], requiredMajor)
  assert.ok(actual.some((part, index) => part > minimum[index] && actual.slice(0, index).every((value, prior) => value === minimum[prior])) || actual.every((part, index) => part === minimum[index]), `${range} must be at least ^${floor} within major ${requiredMajor}`)
}

test('direct dependencies declare the patched security floors', () => {
  const root = manifest('package.json')
  const tooling = manifest('packages/docs-tooling/package.json')
  const ui = manifest('packages/docs-ui/package.json')
  const docs = manifest('apps/docs/package.json')
  const chat = manifest('packages/chat-ui/package.json')

  assertAtLeast(root.dependencies.axios, '1.18.0', 1)
  assertAtLeast(root.dependencies['js-yaml'], '4.3.0', 4)
  assertAtLeast(root.devDependencies.vitest, '3.2.6', 3)
  assertAtLeast(root.devDependencies['@vitest/coverage-v8'], '3.2.6', 3)
  assertAtLeast(tooling.dependencies['js-yaml'], '4.3.0', 4)
  assertAtLeast(ui.devDependencies.vitest, '3.2.6', 3)
  assertAtLeast(docs.dependencies['js-yaml'], '4.3.0', 4)
  assertAtLeast(chat.devDependencies.vite, '6.4.3', 6)
  assertAtLeast(chat.devDependencies['vite-plugin-dts'], '5.0.3', 5)
})
