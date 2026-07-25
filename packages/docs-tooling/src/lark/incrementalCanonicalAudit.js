'use strict'

function canonicalAuditRequestForPlan(plan) {
  if (!plan || plan.mode !== 'incremental') {
    return { sourceTokens: null, reason: 'full-fetch' }
  }
  const sourceTokens = plan.expanded_tokens || []
  if (sourceTokens.length === 0) {
    return { sourceTokens: null, reason: 'zero-change-full-audit' }
  }
  return { sourceTokens, reason: 'incremental-scope' }
}

module.exports = { canonicalAuditRequestForPlan }
