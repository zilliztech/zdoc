'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {
  REQUIRED_STRATEGY_METHODS,
  createPublicationStrategyRegistry,
  definePublicationStrategy,
} = require('./publication-strategy-registry')

function strategy(name, overrides = {}) {
  return {
    name,
    compose(context) { return context },
    validate(context) { return context },
    promote(context) { return context },
    ...overrides,
  }
}

test('defines the exact immutable publication strategy interface', () => {
  assert.deepEqual(REQUIRED_STRATEGY_METHODS, ['compose', 'validate', 'promote'])
  assert.equal(Object.isFrozen(REQUIRED_STRATEGY_METHODS), true)
  for (const name of ['checkpoint', 'ja-guides', 'tooling-merge']) {
    const defined = definePublicationStrategy(strategy(name))
    assert.equal(defined.name, name)
    assert.equal(Object.isFrozen(defined), true)
  }
})

test('rejects non-object, unknown, and incomplete strategies', () => {
  assert.throws(() => definePublicationStrategy(null), /must be an object/i)
  assert.throws(() => definePublicationStrategy([]), /must be an object/i)
  assert.throws(() => definePublicationStrategy(strategy('unknown')), /identity is invalid/i)
  for (const method of REQUIRED_STRATEGY_METHODS) {
    assert.throws(() => definePublicationStrategy(strategy('checkpoint', {[method]: undefined})), new RegExp(`missing ${method}`, 'i'))
  }
})

test('registry rejects duplicates and unsupported lookups', () => {
  assert.throws(() => createPublicationStrategyRegistry([
    strategy('checkpoint'),
    strategy('checkpoint'),
  ]), /identities must be unique/i)
  const registry = createPublicationStrategyRegistry([strategy('checkpoint')])
  assert.equal(registry.require('checkpoint').name, 'checkpoint')
  assert.throws(() => registry.require('ja-guides'), /Unsupported publication strategy: ja-guides/)
})
