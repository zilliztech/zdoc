'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { hooks } = require('../.pnpmfile.cjs')

test('upgrades the exact Docusaurus bundler parents with patched transitive graphs', () => {
  const manifest = {
    name: '@docusaurus/bundler',
    version: '3.10.2',
    dependencies: {
      'copy-webpack-plugin': '^11.0.0',
      'css-minimizer-webpack-plugin': '^5.0.1',
    },
  }

  const updated = hooks.readPackage(structuredClone(manifest))
  assert.equal(updated.dependencies['copy-webpack-plugin'], '^14.0.0')
  assert.equal(updated.dependencies['css-minimizer-webpack-plugin'], '^8.0.0')
})

test('removes uuid only from the patched SockJS release', () => {
  const manifest = {
    name: 'sockjs',
    version: '0.3.24',
    dependencies: {
      uuid: '^8.3.2',
      'websocket-driver': '^0.7.4',
    },
  }

  const updated = hooks.readPackage(structuredClone(manifest))
  assert.equal(updated.dependencies.uuid, undefined)
  assert.equal(updated.dependencies['websocket-driver'], '^0.7.4')
})

test('leaves unrelated package versions unchanged', () => {
  for (const manifest of [
    { name: '@docusaurus/bundler', version: '3.10.3', dependencies: { 'copy-webpack-plugin': '^11.0.0' } },
    { name: 'sockjs', version: '0.3.25', dependencies: { uuid: '^8.3.2' } },
    { name: 'other', version: '1.0.0', dependencies: { uuid: '^8.3.2' } },
  ]) {
    assert.deepEqual(hooks.readPackage(structuredClone(manifest)), manifest)
  }
})
