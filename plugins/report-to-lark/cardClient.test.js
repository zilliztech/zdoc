'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { createCardClient } = require('./cardClient')

function state() {
  return {
    title: 'Build',
    overallStatus: 'running',
    phases: [{ key: 'produce', label: 'Produce', done: 0, total: 1, status: 'running' }],
    manuals: [],
    reports: [],
    startedAt: '2026-07-16T10:00:00.000Z',
    targetBranch: 'test/card',
  }
}

test('patches one Card V2 message with an injected token and request client', async () => {
  const calls = []
  const client = createCardClient({
    feishuHost: 'https://open.feishu.cn',
    appId: 'app-id',
    appSecret: 'app-secret',
    tokenProvider: async credentials => {
      assert.deepEqual(credentials, { appId: 'app-id', appSecret: 'app-secret', feishuHost: 'https://open.feishu.cn' })
      return 'tenant-token'
    },
    requestJson: async (...args) => { calls.push(args); return { code: 0 } },
    now: () => new Date('2026-07-16T10:01:00.000Z'),
  })

  await client.patch({ messageId: 'om_123/a', state: state() })

  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], 'https://open.feishu.cn/open-apis/im/v1/messages/om_123%2Fa')
  assert.equal(calls[0][1].method, 'PATCH')
  assert.equal(calls[0][1].headers.Authorization, 'Bearer tenant-token')
  const body = JSON.parse(calls[0][1].body)
  const card = JSON.parse(body.content)
  assert.equal(card.schema, '2.0')
  assert.match(card.header.subtitle.content, /1m 0s elapsed/)
  assert.equal(calls[0][2], 'report-to-lark patch card')
})

test('rejects missing configuration and message identifiers before network access', async () => {
  let called = false
  const dependencies = {
    tokenProvider: async () => { called = true; return 'token' },
    requestJson: async () => { called = true },
  }
  for (const overrides of [
    { feishuHost: '', appId: 'a', appSecret: 's' },
    { feishuHost: 'https://open.feishu.cn', appId: '', appSecret: 's' },
    { feishuHost: 'https://open.feishu.cn', appId: 'a', appSecret: '' },
  ]) {
    assert.throws(() => createCardClient({ ...overrides, ...dependencies }), /required/)
  }
  const client = createCardClient({ feishuHost: 'https://open.feishu.cn', appId: 'a', appSecret: 's', ...dependencies })
  await assert.rejects(client.patch({ messageId: '', state: state() }), /messageId/)
  assert.equal(called, false)
})

test('rejects an empty token without sending the card request', async () => {
  let requested = false
  const client = createCardClient({
    feishuHost: 'https://open.feishu.cn',
    appId: 'a',
    appSecret: 's',
    tokenProvider: async () => '',
    requestJson: async () => { requested = true },
  })
  await assert.rejects(client.patch({ messageId: 'om_1', state: state() }), /token/)
  assert.equal(requested, false)
})
