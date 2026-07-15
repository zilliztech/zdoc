'use strict'

const CANONICAL_ROUTES = new Map([
  ['/reference/cli/overview', '/reference/cli/cli/overview'],
])

function canonicalizeInternalDocLink(url) {
  if (!url) return url
  const normalized = String(url).replace(/^https:\/\/docs\.zilliz\.com/, '')
  return CANONICAL_ROUTES.get(normalized) || url
}

module.exports = { canonicalizeInternalDocLink }
