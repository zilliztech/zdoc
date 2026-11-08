'use strict'

// GA4 service-account auth shared by the GA4 report scripts
// (ga4-search-404-report.js, ga4-engagement-report.js, redirects/ga4-404-remediation.js).
// Zero runtime dependencies: the service-account key is exchanged for an
// access token with a hand-built RS256 JWT (node:crypto) and the GA4 Data API
// is called over global fetch with the resulting bearer token.

const fs = require('node:fs')
const crypto = require('node:crypto')

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const TOKEN_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
const RUN_REPORT_URL = 'https://analyticsdata.googleapis.com/v1beta/properties'

function loadServiceAccount(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const credentials = JSON.parse(raw)
  for (const field of ['client_email', 'private_key']) {
    if (typeof credentials[field] !== 'string' || credentials[field] === '') {
      throw new Error(`service account ${filePath} is missing ${field}`)
    }
  }
  return credentials
}

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function createJwt(credentials, nowMs) {
  const issuedAt = Math.floor(nowMs / 1000)
  const header = base64url(JSON.stringify({alg: 'RS256', typ: 'JWT'}))
  const claims = base64url(JSON.stringify({
    iss: credentials.client_email,
    scope: TOKEN_SCOPE,
    aud: TOKEN_URL,
    exp: issuedAt + 3600,
    iat: issuedAt,
  }))
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(`${header}.${claims}`)
  return `${header}.${claims}.${base64url(signer.sign(credentials.private_key))}`
}

async function getAccessToken(fetchImpl, credentials, nowMs = Date.now()) {
  const response = await fetchImpl(TOKEN_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: createJwt(credentials, nowMs),
    }),
  })
  if (!response.ok) throw new Error(`token exchange failed: HTTP ${response.status}`)
  const body = await response.json()
  if (typeof body.access_token !== 'string' || body.access_token === '') {
    throw new Error('token exchange returned no access_token')
  }
  return body.access_token
}

module.exports = {
  RUN_REPORT_URL,
  TOKEN_SCOPE,
  TOKEN_URL,
  base64url,
  createJwt,
  getAccessToken,
  loadServiceAccount,
}
