'use strict'

const STRATEGY_NAMES = new Set(['checkpoint', 'ja-guides', 'tooling-merge'])
const REQUIRED_STRATEGY_METHODS = Object.freeze(['compose', 'validate', 'promote'])

function definePublicationStrategy(strategy) {
  if (!strategy || typeof strategy !== 'object' || Array.isArray(strategy)) {
    throw new Error('Publication strategy must be an object')
  }
  if (!STRATEGY_NAMES.has(strategy.name)) throw new Error('Publication strategy identity is invalid')
  for (const method of REQUIRED_STRATEGY_METHODS) {
    if (typeof strategy[method] !== 'function') throw new Error(`Publication strategy is missing ${method}`)
  }
  return Object.freeze({...strategy})
}

function createPublicationStrategyRegistry(strategies) {
  if (!Array.isArray(strategies)) throw new Error('Publication strategies must be an array')
  const entries = strategies.map(definePublicationStrategy)
  const byName = new Map(entries.map(strategy => [strategy.name, strategy]))
  if (byName.size !== entries.length) throw new Error('Publication strategy identities must be unique')
  return Object.freeze({
    require(name) {
      const strategy = byName.get(name)
      if (!strategy) throw new Error(`Unsupported publication strategy: ${name}`)
      return strategy
    },
  })
}

module.exports = {
  REQUIRED_STRATEGY_METHODS,
  createPublicationStrategyRegistry,
  definePublicationStrategy,
}
