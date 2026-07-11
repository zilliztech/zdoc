'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')

test('generated state restore preserves translations and incremental cache from dev', () => {
  const script = fs.readFileSync('scripts/restore-generated-state.sh', 'utf8')
  assert.match(script, /^\s*"i18n"\s*$/m)
  assert.match(script, /^\s*"\.translation-cache"\s*$/m)
})
