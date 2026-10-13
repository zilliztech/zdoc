'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {ALERT_LEDGER_LIMIT, composeGuardNote, markAlertsNotified} = require('./translation-dispatch-alerts')

const EVENT = {key: 'source-block:aaaa:java', title: 'Source build gate blocked a translation group', body: 'Group java was NOT dispatched.'}

test('the note renders one titled section per event and validates the shape', () => {
  const note = composeGuardNote([EVENT, {key: 'backoff:u:sha', title: 'T2', body: 'B2'}])
  assert.match(note, /^### Source build gate blocked a translation group\n\nGroup java was NOT dispatched\.\n\n### T2\n\nB2$/)
  assert.throws(() => composeGuardNote([]), /required/)
  assert.throws(() => composeGuardNote([{key: 'has spaces', title: 't', body: 'b'}]), /invalid key/)
  assert.throws(() => composeGuardNote([{key: 'ok', title: '', body: 'b'}]), /title/)
})

test('marking notified keeps the ledger bounded and oldest entries drop first', () => {
  const plan = {schemaVersion: 1, units: {}}
  let marked = markAlertsNotified({plan, keys: ['a', 'b'], now: '2026-10-13T10:00:00.000Z'})
  assert.deepEqual(marked.alerts.notified, {a: '2026-10-13T10:00:00.000Z', b: '2026-10-13T10:00:00.000Z'})
  const bulk = Array.from({length: ALERT_LEDGER_LIMIT + 5}, (_, index) => `key-${index}`)
  const bounded = markAlertsNotified({plan: marked, keys: bulk, now: '2026-10-13T11:00:00.000Z'})
  const keys = Object.keys(bounded.alerts.notified)
  assert.equal(keys.length, ALERT_LEDGER_LIMIT)
  assert.equal(keys.includes('a'), false, 'the oldest delivered keys fall out of the ledger')
  assert.equal(keys.includes(`key-${ALERT_LEDGER_LIMIT + 4}`), true)
  assert.deepEqual(plan, {schemaVersion: 1, units: {}}, 'the input plan is not mutated')
  assert.throws(() => markAlertsNotified({plan, keys: [1], now: 'x'}), /keys/)
})
