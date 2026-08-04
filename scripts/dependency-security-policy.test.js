'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const yaml = require('js-yaml')

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

function compareVersions(left, right) {
  const leftParts = left.split('.').map(Number)
  const rightParts = right.split('.').map(Number)
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const difference = (leftParts[index] || 0) - (rightParts[index] || 0)
    if (difference !== 0) return difference
  }
  return 0
}

function lockVersions(lock, packageName) {
  return Object.keys(lock.packages || {})
    .filter(key => key.startsWith(`${packageName}@`))
    .map(key => key.slice(packageName.length + 1).split('(')[0])
    .sort(compareVersions)
}

function assertAllLockVersionsAtLeast(lock, packageName, floor) {
  const versions = lockVersions(lock, packageName)
  assert.ok(versions.length > 0, `${packageName} must exist in the lockfile`)
  for (const version of versions) {
    assert.ok(compareVersions(version, floor) >= 0, `${packageName}@${version} must be at least ${floor}`)
  }
}

function assertNoLockVersionsBelow(lock, packageName, floor) {
  for (const version of lockVersions(lock, packageName)) {
    assert.ok(compareVersions(version, floor) >= 0, `${packageName}@${version} must be at least ${floor}`)
  }
}

function assertLockMajorAtLeast(lock, packageName, major, floor) {
  const versions = lockVersions(lock, packageName).filter(version => Number(version.split('.')[0]) === major)
  assert.ok(versions.length > 0, `${packageName} major ${major} must exist in the lockfile`)
  for (const version of versions) {
    assert.ok(compareVersions(version, floor) >= 0, `${packageName}@${version} must be at least ${floor}`)
  }
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

test('transitive dependency lockfile stays above current advisory floors', () => {
  const lock = yaml.load(fs.readFileSync('pnpm-lock.yaml', 'utf8'))

  for (const [packageName, floor] of [
    ['@babel/core', '7.29.6'],
    ['@babel/plugin-transform-modules-systemjs', '7.29.4'],
    ['ajv', '6.15.0'],
    ['body-parser', '1.20.6'],
    ['esbuild', '0.25.0'],
    ['fast-uri', '3.1.5'],
    ['fast-xml-builder', '1.1.7'],
    ['form-data', '4.0.6'],
    ['glob', '10.5.0'],
    ['http-proxy-middleware', '2.0.10'],
    ['joi', '17.13.4'],
    ['launch-editor', '2.14.1'],
    ['lodash', '4.18.1'],
    ['postcss', '8.5.23'],
    ['qs', '6.15.2'],
    ['serialize-javascript', '7.0.5'],
    ['shell-quote', '1.9.0'],
    ['svgo', '3.3.4'],
    ['undici', '7.29.0'],
    ['vite', '6.4.3'],
    ['webpack-dev-server', '5.2.6'],
    ['websocket-driver', '0.7.5'],
  ]) assertAllLockVersionsAtLeast(lock, packageName, floor)

  assertLockMajorAtLeast(lock, 'brace-expansion', 1, '1.1.18')
  assertLockMajorAtLeast(lock, 'brace-expansion', 2, '2.1.4')
  assertLockMajorAtLeast(lock, 'brace-expansion', 5, '5.0.9')
  assertLockMajorAtLeast(lock, 'js-yaml', 3, '3.15.0')
  assertLockMajorAtLeast(lock, 'js-yaml', 4, '4.3.0')
  assertLockMajorAtLeast(lock, 'minimatch', 3, '3.1.4')
  assertLockMajorAtLeast(lock, 'ws', 7, '7.5.11')
  assertLockMajorAtLeast(lock, 'ws', 8, '8.21.0')
  assertNoLockVersionsBelow(lock, 'uuid', '11.1.1')
})

test('unmaintained parents are patched without incompatible transitive overrides', () => {
  const root = manifest('package.json')
  const patched = root.pnpm?.patchedDependencies || {}
  const overrides = root.pnpm?.overrides || {}

  assert.equal(fs.existsSync('.pnpmfile.cjs'), true)
  assert.match(patched['sockjs@0.3.24'] || '', /^patches\/sockjs@0\.3\.24\.patch$/)
  assert.equal(Object.keys(overrides).some(selector => selector.includes('serialize-javascript')), false)
  assert.equal(Object.keys(overrides).some(selector => /(^|>)uuid(?:@|$)/.test(selector)), false)
})
