'use strict'

const { buildCardV2 } = require('./cardV2')

async function defaultTokenProvider() {
  const TokenFetcher = require('../lark-docs/larkTokenFetcher')
  const fetcher = new TokenFetcher()
  await fetcher.fetchToken()
  return fetcher.token()
}

function defaultRequestJson(...args) {
  const { fetchFeishuJsonWithRetry } = require('../lark-docs/feishuFetch')
  return fetchFeishuJsonWithRetry(...args)
}

function required(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required`)
  return value.trim()
}

function createCardClient({
  feishuHost,
  appId,
  appSecret,
  tokenProvider = defaultTokenProvider,
  requestJson = defaultRequestJson,
  now = () => new Date(),
}) {
  const host = required(feishuHost, 'feishuHost').replace(/\/$/, '')
  const credentials = {
    appId: required(appId, 'appId'),
    appSecret: required(appSecret, 'appSecret'),
    feishuHost: host,
  }
  if (typeof tokenProvider !== 'function') throw new Error('tokenProvider is required')
  if (typeof requestJson !== 'function') throw new Error('requestJson is required')

  return {
    async patch({ messageId, state }) {
      const id = required(messageId, 'messageId')
      const token = await tokenProvider(credentials)
      if (typeof token !== 'string' || !token) throw new Error('Feishu token is unavailable')
      return requestJson(`${host}/open-apis/im/v1/messages/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: JSON.stringify(buildCardV2(state, { now: now() })) }),
      }, 'report-to-lark patch card')
    },
  }
}

module.exports = { createCardClient }
