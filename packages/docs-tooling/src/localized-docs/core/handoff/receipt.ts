/**
 * Independent `dev` manifest path helpers and strict receipt validation for
 * localized zh-CN Guides (`generated/zh-CN/manifests/localized-pages/guides/`).
 */
import { validatePageId } from '../config.ts'
import type { PageId } from '../types.ts'
import { normalizeLocalizedPageUrl } from './routing.ts'
import {
  COMMIT_SHA_RE,
  safeHandoffPath,
  SHA256_HEX_RE,
  type LocalizedGroup,
  type LocalizedLocale,
} from './source-state.ts'

export interface LocalizedReceiptSourceFile {
  path: string
  sha256: string
}

export interface LocalizedReceiptImage {
  source: string
  published_url: string
  sha256: string
}

export interface LocalizedReceiptInputs {
  master_commit: string
  dev_commit: string
  source_files: LocalizedReceiptSourceFile[]
  md2md_version: string
  navigation_digest: string
  image_base_url: string
  images: LocalizedReceiptImage[]
}

export interface LocalizedReceiptOutput {
  path: string
  sha256: string
}

export interface LocalizedReceipt {
  schema_version: 1
  locale: LocalizedLocale
  group: LocalizedGroup
  page: PageId
  page_url: string
  inputs: LocalizedReceiptInputs
  output: LocalizedReceiptOutput
  channel: null | 'next' | 'retire-in-next'
  fetch_run_id: string
  /** Optional reference-only Feishu Base record ID; never used as primary key. */
  reference_record_id?: string | null
}

export interface LocalizedReceiptExpectation {
  locale?: LocalizedLocale
  group?: LocalizedGroup
  page?: PageId
  page_url?: string
}

const GUIDES_CONTENT_ROOT = 'content/zh-CN/guides/'
const FORBIDDEN_GUIDES_HOME_PATHS = new Set([
  'content/zh-CN/guides/home.md',
  'content/zh-CN/guides/home.mdx',
  'content/zh-CN/guides/index.md',
  'content/zh-CN/guides/index.mdx',
  'content/zh-CN/guides/guides.md',
  'content/zh-CN/guides/guides.mdx',
])
const FORBIDDEN_TOOLS_PREFIX = 'content/zh-CN/guides/tutorials/tools/'
const SAFE_RUN_ID_RE = /^[^\s\x00-\x1f\x7f]+$/

function assertCondition(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function assertPlainObject(value: unknown, label: string): asserts value is Record<string, unknown> {
  assertCondition(
    value !== null && typeof value === 'object' && !Array.isArray(value),
    `${label} must be a plain object`,
  )
}

function assertStrictKeys(
  value: unknown,
  required: readonly string[],
  optional: readonly string[],
  label: string,
): asserts value is Record<string, unknown> {
  assertPlainObject(value, label)
  const allowed = new Set([...required, ...optional])
  for (const key of Object.keys(value)) {
    assertCondition(allowed.has(key), `${label} contains unknown field "${key}"`)
  }
  for (const key of required) {
    assertCondition(Object.hasOwn(value, key), `${label} is missing required field "${key}"`)
  }
}

function assertNonEmptyText(value: unknown, label: string): asserts value is string {
  assertCondition(
    typeof value === 'string' && value.length > 0 && !/[\x00-\x1f\x7f]/.test(value),
    `${label} must be a non-empty string without control characters`,
  )
}

function assertValidHttpsUrl(value: unknown, label: string): asserts value is string {
  assertCondition(
    typeof value === 'string' && value.length > 0 && !/[\s\x00-\x1f\x7f]/.test(value),
    `${label} must be a valid HTTPS URL`,
  )
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(`${label} must be a valid HTTPS URL`)
  }
  assertCondition(
    parsed.protocol === 'https:' && !parsed.username && !parsed.password && parsed.hostname.length > 0,
    `${label} must be an HTTPS URL without embedded credentials`,
  )
}

function assertValidLocaleAndGroup(locale: unknown, group: unknown): void {
  assertCondition(locale === 'zh-CN', `Unsupported localized locale "${String(locale)}"; expected "zh-CN"`)
  assertCondition(group === 'guides', `Unsupported localized group "${String(group)}"; expected "guides"`)
}

/**
 * Canonical `dev` path for the zh-CN Guides activation registry.
 */
export function localizedActiveStatePath(
  locale: LocalizedLocale = 'zh-CN',
  group: LocalizedGroup = 'guides',
): string {
  assertValidLocaleAndGroup(locale, group)
  return `generated/${locale}/manifests/localized-pages/${group}/active.json`
}

/**
 * Canonical `dev` path for a single localized zh-CN Guides page receipt.
 * Rejects reserved name `active` and any unsafe or non-slug page ID.
 */
export function localizedReceiptPath(
  locale: LocalizedLocale,
  group: LocalizedGroup,
  page: PageId,
): string {
  assertValidLocaleAndGroup(locale, group)
  assertCondition(typeof page === 'string', 'Localized receipt page must be a string')
  const idCheck = validatePageId(page)
  assertCondition(!('errors' in idCheck), 'errors' in idCheck ? idCheck.errors[0].message : 'Invalid page ID')
  return `generated/${locale}/manifests/localized-pages/${group}/${page}.json`
}

/**
 * Verifies strict write-boundary isolation for zh-CN Guides localized outputs:
 * - Must be a safe repository-relative `.md` or `.mdx` path under `content/zh-CN/guides/`
 * - Must NOT be the Guides home page (`home.md`, `index.md`, `guides.md`, or `.mdx` variants)
 * - Must NOT fall under `content/zh-CN/guides/tutorials/tools/`
 * - Never permits `content/en/...`, `content/zh-CN/reference/...`, or traversal paths
 */
export function isAllowedLocalizedGuidesOutputPath(outputPath: unknown): outputPath is string {
  if (!safeHandoffPath(outputPath)) return false
  if (!outputPath.startsWith(GUIDES_CONTENT_ROOT)) return false
  if (!/\.mdx?$/.test(outputPath)) return false
  if (FORBIDDEN_GUIDES_HOME_PATHS.has(outputPath)) return false
  if (outputPath.startsWith(FORBIDDEN_TOOLS_PREFIX)) return false
  return true
}

export function validateLocalizedReceipt(
  value: unknown,
  expected: LocalizedReceiptExpectation = {},
): LocalizedReceipt {
  if (expected.locale !== undefined || expected.group !== undefined) {
    assertValidLocaleAndGroup(expected.locale ?? 'zh-CN', expected.group ?? 'guides')
  }
  if (expected.page !== undefined) {
    localizedReceiptPath(expected.locale ?? 'zh-CN', expected.group ?? 'guides', expected.page)
  }

  assertStrictKeys(
    value,
    ['schema_version', 'locale', 'group', 'page', 'page_url', 'inputs', 'output', 'channel', 'fetch_run_id'],
    ['reference_record_id'],
    'LocalizedReceipt',
  )

  assertCondition(value.schema_version === 1, 'LocalizedReceipt.schema_version must be 1')
  assertValidLocaleAndGroup(value.locale, value.group)
  if (expected.locale !== undefined) {
    assertCondition(value.locale === expected.locale, `LocalizedReceipt.locale mismatch: expected "${expected.locale}"`)
  }
  if (expected.group !== undefined) {
    assertCondition(value.group === expected.group, `LocalizedReceipt.group mismatch: expected "${expected.group}"`)
  }

  assertCondition(typeof value.page === 'string', 'LocalizedReceipt.page must be a string')
  localizedReceiptPath(value.locale as LocalizedLocale, value.group as LocalizedGroup, value.page)
  if (expected.page !== undefined) {
    assertCondition(value.page === expected.page, `LocalizedReceipt.page mismatch: expected "${expected.page}"`)
  }

  assertCondition(typeof value.page_url === 'string', 'LocalizedReceipt.page_url must be a string')
  const normalizedUrl = normalizeLocalizedPageUrl(value.page_url)
  assertCondition(
    normalizedUrl === value.page_url,
    `LocalizedReceipt.page_url "${value.page_url}" must be canonical (expected "${normalizedUrl}")`,
  )
  if (expected.page_url !== undefined) {
    const expectedUrl = normalizeLocalizedPageUrl(expected.page_url)
    assertCondition(
      normalizedUrl === expectedUrl,
      `LocalizedReceipt.page_url mismatch: expected "${expectedUrl}", got "${normalizedUrl}"`,
    )
  }

  const inputs = value.inputs
  assertStrictKeys(
    inputs,
    [
      'master_commit',
      'dev_commit',
      'source_files',
      'md2md_version',
      'navigation_digest',
      'image_base_url',
      'images',
    ],
    [],
    'LocalizedReceipt.inputs',
  )

  assertCondition(
    typeof inputs.master_commit === 'string' && COMMIT_SHA_RE.test(inputs.master_commit),
    'LocalizedReceipt.inputs.master_commit must be a 40-char lowercase hex SHA',
  )
  assertCondition(
    typeof inputs.dev_commit === 'string' && COMMIT_SHA_RE.test(inputs.dev_commit),
    'LocalizedReceipt.inputs.dev_commit must be a 40-char lowercase hex SHA',
  )

  assertCondition(
    Array.isArray(inputs.source_files) && inputs.source_files.length > 0,
    'LocalizedReceipt.inputs.source_files must be a non-empty array',
  )
  const seenSourcePaths = new Set<string>()
  for (const rawFile of inputs.source_files) {
    assertStrictKeys(rawFile, ['path', 'sha256'], [], 'LocalizedReceipt.inputs.source_files[]')
    assertCondition(
      safeHandoffPath(rawFile.path) && !seenSourcePaths.has(rawFile.path),
      `Invalid or duplicate source_files path: "${String(rawFile.path)}"`,
    )
    assertCondition(
      typeof rawFile.sha256 === 'string' && SHA256_HEX_RE.test(rawFile.sha256),
      `Invalid SHA-256 digest for source file "${rawFile.path}"`,
    )
    seenSourcePaths.add(rawFile.path)
  }

  const requiredSourceFiles = [
    `localized-docs/zh-CN/guides/pages/${value.page}/source.md`,
    `localized-docs/zh-CN/guides/pages/${value.page}/page.yaml`,
    'localized-docs/zh-CN/guides/Variables.json',
  ]
  for (const requiredPath of requiredSourceFiles) {
    assertCondition(
      seenSourcePaths.has(requiredPath),
      `LocalizedReceipt.inputs.source_files must include "${requiredPath}"`,
    )
  }

  assertNonEmptyText(inputs.md2md_version, 'LocalizedReceipt.inputs.md2md_version')
  assertCondition(
    typeof inputs.navigation_digest === 'string' && SHA256_HEX_RE.test(inputs.navigation_digest),
    'LocalizedReceipt.inputs.navigation_digest must be a 64-char lowercase hex SHA-256',
  )
  assertValidHttpsUrl(inputs.image_base_url, 'LocalizedReceipt.inputs.image_base_url')

  assertCondition(Array.isArray(inputs.images), 'LocalizedReceipt.inputs.images must be an array')
  const seenImageSources = new Set<string>()
  for (const rawImage of inputs.images) {
    assertStrictKeys(rawImage, ['source', 'published_url', 'sha256'], [], 'LocalizedReceipt.inputs.images[]')
    assertNonEmptyText(rawImage.source, 'LocalizedReceipt.inputs.images[].source')
    assertCondition(
      !seenImageSources.has(rawImage.source),
      `Duplicate image source in LocalizedReceipt: "${rawImage.source}"`,
    )
    seenImageSources.add(rawImage.source)
    assertValidHttpsUrl(rawImage.published_url, 'LocalizedReceipt.inputs.images[].published_url')
    assertCondition(
      typeof rawImage.sha256 === 'string' && SHA256_HEX_RE.test(rawImage.sha256),
      `Invalid SHA-256 digest for image "${rawImage.source}"`,
    )
  }

  const output = value.output
  assertStrictKeys(output, ['path', 'sha256'], [], 'LocalizedReceipt.output')
  assertCondition(
    isAllowedLocalizedGuidesOutputPath(output.path),
    `LocalizedReceipt.output.path "${String(output.path)}" violates zh-CN Guides path isolation`,
  )
  assertCondition(
    typeof output.sha256 === 'string' && SHA256_HEX_RE.test(output.sha256),
    'LocalizedReceipt.output.sha256 must be a 64-char lowercase hex SHA-256',
  )

  assertCondition(
    value.channel === null || value.channel === 'next' || value.channel === 'retire-in-next',
    'LocalizedReceipt.channel must be null, "next", or "retire-in-next"',
  )
  assertCondition(
    typeof value.fetch_run_id === 'string' && SAFE_RUN_ID_RE.test(value.fetch_run_id),
    'LocalizedReceipt.fetch_run_id must be a non-empty string without whitespace or control characters',
  )

  if (
    Object.hasOwn(value, 'reference_record_id') &&
    value.reference_record_id !== null &&
    value.reference_record_id !== undefined
  ) {
    assertNonEmptyText(value.reference_record_id, 'LocalizedReceipt.reference_record_id')
  }

  return value as unknown as LocalizedReceipt
}

export function parseLocalizedReceipt(
  jsonText: string,
  expected: LocalizedReceiptExpectation = {},
): LocalizedReceipt {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Malformed localized receipt JSON: ${message}`)
  }
  return validateLocalizedReceipt(parsed, expected)
}
