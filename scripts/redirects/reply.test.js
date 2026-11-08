'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const {
  extractReplyBlock,
  looksLikeTriageComment,
  parseReplyMapping,
} = require('./reply.js')

function replyComment(payload, {begin = true, end = true, fence = true} = {}) {
  const lines = ['Some human preamble.', '']
  if (begin) lines.push('<!-- ga4-404-reply-data begin; the JSON between these markers is the machine-readable protocol -->')
  if (fence) {
    lines.push('```json')
    lines.push(typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2))
    lines.push('```')
  }
  if (end) lines.push('<!-- ga4-404-reply-data end -->')
  lines.push('', 'Trailing prose.')
  return lines.join('\n')
}

const VALID = {
  schema_version: 1,
  mappings: [{from: '/docs/old', to: '/docs/home', note: 'renamed'}],
  declined: [{from: '/docs/one-off', note: 'typo'}],
  denylist: [{from: '/docs/never', note: 'probe path'}],
}

test('parseReplyMapping extracts the fenced payload between the markers', () => {
  const parsed = parseReplyMapping(replyComment(VALID))
  assert.equal(parsed.ok, true)
  assert.deepEqual(parsed.mapping, VALID)
})

test('parseReplyMapping tolerates prose, blank lines, and code fences without a language tag', () => {
  const body = [
    'prefix',
    '<!-- ga4-404-reply-data begin -->',
    '',
    '```',
    '{"schema_version":1,"declined":[{"from":"/a"}]}',
    '```',
    '<!-- ga4-404-reply-data end -->',
    'suffix',
  ].join('\n')
  const parsed = parseReplyMapping(body)
  assert.equal(parsed.ok, true)
  assert.deepEqual(parsed.mapping, {schema_version: 1, declined: [{from: '/a'}]})
})

test('parseReplyMapping rejects every malformed shape with an actionable reason', () => {
  const cases = [
    ['plain comment without markers', 'no reply here'],
    ['unclosed block', '<!-- ga4-404-reply-data begin -->\n```json\n{}\n```'],
    ['block without a fence', '<!-- ga4-404-reply-data begin -->\n<!-- ga4-404-reply-data end -->'],
    ['invalid JSON', replyComment('{not json')],
    ['non-object payload', replyComment('[1,2]')],
    ['wrong schema_version', replyComment({...VALID, schema_version: 2})],
    ['mappings not an array', replyComment({...VALID, mappings: 'x'})],
    ['no decision arrays at all', replyComment({schema_version: 1})],
    ['mapping missing to', replyComment({...VALID, mappings: [{from: '/docs/old'}]})],
    ['declined missing from', replyComment({...VALID, declined: [{note: 'x'}]})],
  ]
  for (const [name, body] of cases) {
    const parsed = parseReplyMapping(body)
    assert.equal(parsed.ok, false, name)
    assert.equal(typeof parsed.reason, 'string', name)
    assert.ok(parsed.reason.length > 0, name)
  }
})

test('extractReplyBlock takes the first block when several appear', () => {
  const body = `${replyComment({schema_version: 1, declined: [{from: '/first'}]})}\n${replyComment({schema_version: 1, declined: [{from: '/second'}]})}`
  const parsed = parseReplyMapping(body)
  assert.equal(parsed.ok, true)
  assert.deepEqual(parsed.mapping.declined, [{from: '/first'}])
})

test('looksLikeTriageComment flags the bot triage block for the executor pre-gate', () => {
  assert.equal(looksLikeTriageComment('<!-- ga4-404-triage:v1 -->\n...'), true)
  assert.equal(looksLikeTriageComment(replyComment(VALID)), false)
  // A full quote of the triage comment is skipped as well — the operator must
  // reply with their own edited block only.
  assert.equal(looksLikeTriageComment(`quote:\n> <!-- ga4-404-triage:v1 -->\n${replyComment(VALID)}`), true)
})
