'use strict'

function safeDecodeUrl(value) {
  if (!value) return null
  let decoded = String(value)
  for (let index = 0; index < 2; index++) {
    try {
      const next = decodeURIComponent(decoded)
      if (next === decoded) break
      decoded = next
    } catch (_) {
      break
    }
  }
  return decoded
}

function isFeishuHost(hostname) {
  const host = String(hostname || '').toLowerCase()
  return host === 'feishu.cn'
    || host.endsWith('.feishu.cn')
    || host === 'larksuite.com'
    || host.endsWith('.larksuite.com')
}

function parseFeishuDocumentLink(value) {
  const decoded = safeDecodeUrl(value)
  if (!decoded) return null
  const linkMatch = decoded.match(/https?:\/\/\S+/)
  const link = linkMatch ? linkMatch[0] : decoded.trim()
  let parsed
  try {
    parsed = new URL(link)
  } catch (_) {
    return null
  }
  if (!isFeishuHost(parsed.hostname)) return null
  const segments = parsed.pathname.split('/').filter(Boolean)
  const kind = segments[0]
  if (!['wiki', 'doc', 'docs', 'docx'].includes(kind)) return null
  const token = segments[segments.length - 1]
  if (!token) return null
  return {
    url: decoded,
    token,
    kind,
    anchor: parsed.hash ? parsed.hash.slice(1) : null,
  }
}

module.exports = { isFeishuHost, parseFeishuDocumentLink, safeDecodeUrl }
