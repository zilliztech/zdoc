'use strict'

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const SELECTION_INPUT_SCHEMA_VERSION = 1
const REQUESTED_PAGE_LIMITS = Object.freeze({ min: 1, max: 50 })
const LARK_DOCUMENT_HOST_SUFFIXES = Object.freeze(['feishu.cn', 'larksuite.com'])
const LARK_DOCUMENT_PATH_PREFIXES = Object.freeze(['wiki', 'docx', 'doc', 'docs'])
const SITE_URL_HOSTS = Object.freeze(['docs.zilliz.com', 'www.docs.zilliz.com'])

class InvalidRequestSelection extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'InvalidRequestSelection'
    this.code = code
    this.details = details
  }

  toJSON() {
    return { code: this.code, message: this.message, details: this.details }
  }
}

function larkDocumentTokenFromUrl(value) {
  let url
  try {
    url = new URL(String(value || '').trim())
  } catch (_) {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const host = url.hostname.toLowerCase()
  if (!LARK_DOCUMENT_HOST_SUFFIXES.some(suffix => host === suffix || host.endsWith(`.${suffix}`))) return null
  const segments = url.pathname.split('/').filter(Boolean)
  if (segments.length !== 2 || !LARK_DOCUMENT_PATH_PREFIXES.includes(segments[0])) return null
  const token = segments[1]
  return /^[A-Za-z0-9]+$/.test(token) ? token : null
}

function siteLocaleFromUrlOrPath(value) {
  const text = String(value || '').trim()
  const match = text.match(/^https?:\/\/[^/]+\/([^/?#\s]+)/i)
  const firstSegment = match ? match[1] : text.split('/').filter(Boolean)[0] || ''
  if (/^zh(?:-CN)?$/i.test(firstSegment)) return 'zh-CN'
  return 'en'
}

function isLarkHostedUrl(value) {
  let url
  try {
    url = new URL(String(value || '').trim())
  } catch (_) {
    return false
  }
  const host = url.hostname.toLowerCase()
  return LARK_DOCUMENT_HOST_SUFFIXES.some(suffix => host === suffix || host.endsWith(`.${suffix}`))
}

function isSiteUrl(value) {
  let url
  try {
    url = new URL(String(value || '').trim())
  } catch (_) {
    return false
  }
  return SITE_URL_HOSTS.includes(url.hostname.toLowerCase())
}

function assertSiteMatches(site, selectorLocale, raw) {
  if (site === 'both' || !selectorLocale) return
  if (site !== selectorLocale) {
    throw new InvalidRequestSelection(
      'REQUEST_SITE_MISMATCH',
      `Selector belongs to site ${selectorLocale} but the requested run targets ${site}: ${raw}`,
      { selector: raw, selector_site: selectorLocale, site },
    )
  }
}

function classifySelector(rawEntry, site) {
  const raw = String(rawEntry || '').trim()
  if (!raw) return null
  if (/^https?:\/\//i.test(raw)) {
    const token = larkDocumentTokenFromUrl(raw)
    if (token) return { kind: 'lark_url', value: raw, token, raw }
    if (isLarkHostedUrl(raw)) {
      throw new InvalidRequestSelection(
        'INVALID_REQUEST_SELECTOR',
        `URL does not point to a supported Feishu wiki or docx document: ${raw}`,
        { selector: raw },
      )
    }
    if (isSiteUrl(raw)) {
      assertSiteMatches(site, siteLocaleFromUrlOrPath(raw), raw)
      throw new InvalidRequestSelection(
        'INVALID_REQUEST_SELECTOR',
        `Site URL selectors are not supported yet; pass the Lark document URL or canonical token instead: ${raw}`,
        { selector: raw },
      )
    }
    throw new InvalidRequestSelection(
      'INVALID_REQUEST_SELECTOR',
      `URL host is not supported; use a Feishu wiki or docx URL: ${raw}`,
      { selector: raw },
    )
  }
  if (/^[A-Za-z0-9]+$/.test(raw)) {
    return { kind: 'doc_token', value: raw, token: raw, raw }
  }
  assertSiteMatches(site, siteLocaleFromUrlOrPath(raw), raw)
  throw new InvalidRequestSelection(
    'INVALID_REQUEST_SELECTOR',
    `Site path selectors are not supported yet; pass the Lark document URL or canonical token instead: ${raw}`,
    { selector: raw },
  )
}

function parseRequestedPages({ raw, site }) {
  if (!['both', 'en', 'zh-CN'].includes(site)) {
    throw new InvalidRequestSelection('INVALID_REQUEST_SELECTOR', `Unsupported site selection: ${site}`, { site })
  }
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new InvalidRequestSelection('INVALID_REQUEST_SELECTOR', 'The pages input is required and must contain at least one selector.', { count: 0 })
  }
  const candidates = raw.split(/[\n,]+/).map(entry => entry.trim()).filter(Boolean)
  if (candidates.length === 0) {
    throw new InvalidRequestSelection('INVALID_REQUEST_SELECTOR', 'The pages input contains no usable selector.', { count: 0 })
  }
  const selectors = []
  const seen = new Set()
  let duplicatesRemoved = 0
  for (const candidate of candidates) {
    const selector = classifySelector(candidate, site)
    if (!selector) continue
    const key = selector.token || `${selector.kind}:${selector.value}`
    if (seen.has(key)) {
      duplicatesRemoved += 1
      continue
    }
    seen.add(key)
    selectors.push(selector)
  }
  if (selectors.length < REQUESTED_PAGE_LIMITS.min || selectors.length > REQUESTED_PAGE_LIMITS.max) {
    throw new InvalidRequestSelection(
      'INVALID_REQUEST_SELECTOR',
      `Requested selector count ${selectors.length} is outside the supported range ${REQUESTED_PAGE_LIMITS.min}-${REQUESTED_PAGE_LIMITS.max} after deduplication.`,
      { count: selectors.length, ...REQUESTED_PAGE_LIMITS },
    )
  }
  return { selectors, duplicatesRemoved }
}

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
}

function writeSelectionInput({ output, site, raw, generatedAt = new Date().toISOString() }) {
  const { selectors, duplicatesRemoved } = parseRequestedPages({ raw, site })
  const payload = {
    schema_version: SELECTION_INPUT_SCHEMA_VERSION,
    generated_at: generatedAt,
    site,
    selectors,
    count: selectors.length,
    duplicates_removed: duplicatesRemoved,
  }
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, `${JSON.stringify(payload, null, 2)}\n`)
  return { payload, output }
}

function writeSelectionError({ output, error, site, generatedAt = new Date().toISOString() }) {
  const payload = {
    schema_version: SELECTION_INPUT_SCHEMA_VERSION,
    generated_at: generatedAt,
    site,
    error: error instanceof InvalidRequestSelection ? error.toJSON() : { code: 'INVALID_REQUEST_SELECTOR', message: String(error?.message || error), details: {} },
  }
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, `${JSON.stringify(payload, null, 2)}\n`)
  return { payload, output }
}

function main(argv = process.argv.slice(2)) {
  const args = {}
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]
    if (!key.startsWith('--')) throw new InvalidRequestSelection('INVALID_REQUEST_SELECTOR', `Unexpected argument: ${key}`, {})
    args[key.slice(2)] = argv[index + 1]
  }
  const required = ['pages', 'site', 'output']
  for (const name of required) {
    if (!args[name]) throw new InvalidRequestSelection('INVALID_REQUEST_SELECTOR', `Missing required --${name} argument.`, { argument: name })
  }
  const result = writeSelectionInput({ output: args.output, site: args.site, raw: args.pages })
  console.log(`[requested-selection] Wrote ${result.payload.count} selector(s) to ${result.output} (duplicates removed: ${result.payload.duplicates_removed})`)
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    const output = process.argv[process.argv.indexOf('--output') + 1]
    const siteIndex = process.argv.indexOf('--site')
    if (output) {
      writeSelectionError({ output, error, site: siteIndex > 0 ? process.argv[siteIndex + 1] : 'both' })
    }
    console.error(error instanceof InvalidRequestSelection ? `[requested-selection] ${error.code}: ${error.message}` : `[requested-selection] ${error.message}`)
    process.exitCode = 2
  }
}

module.exports = {
  SELECTION_INPUT_SCHEMA_VERSION,
  REQUESTED_PAGE_LIMITS,
  InvalidRequestSelection,
  parseRequestedPages,
  classifySelector,
  larkDocumentTokenFromUrl,
  siteLocaleFromUrlOrPath,
  sha256File,
  writeSelectionInput,
  writeSelectionError,
}
