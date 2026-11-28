/**
 * record_id-decoupled activation registry and routing context for localized zh-CN Guides.
 *
 * Primary identity keys are strictly `(page, normalized page_url)`.
 * Feishu Base `record_id` (`last_seen_record_id`) is optional reference-only metadata
 * and NEVER participates in uniqueness checks, route lookups, or fallback matching.
 */
import { validatePageId } from '../config.ts'
import type { PageId } from '../types.ts'
import {
  classifyLocalizedSourceRoute,
  FEISHU_TOKEN_RE,
  type LocalizedGroup,
  type LocalizedLocale,
  type LocalizedSourceRoute,
} from './source-state.ts'

export interface ActiveLocalizedPage {
  page: PageId
  page_url: string
  feishu_token: string | null
  feishu_aliases?: string[]
  anchors: Record<string, string>
  activated_in: string
  /** Optional reference-only Feishu Base record ID; never used as primary key. */
  last_seen_record_id?: string | null
}

export interface ActiveLocalizedRegistry {
  schema_version: 1
  locale: LocalizedLocale
  group: LocalizedGroup
  pages: ActiveLocalizedPage[]
}

export interface LocalizedRoutingRecord {
  /** Optional reference-only Feishu Base record ID; never used for routing or lookup. */
  record_id?: string | null
  placement_type: string
  /** Target relative publish path / slug in Guides. */
  page_url: string
  doc_link: string
  /** Optional normalized publish targets (e.g. `zilliz.saas`, `zilliz.paas`) for disjoint Feishu records. */
  publish_targets?: readonly string[] | null
}

export interface LocalizedFallbackSnapshotRecord {
  /** Optional reference-only metadata; never used for fallback matching. */
  record_id?: string | null
  page_url: string
  source_kind?: string | null
  publish_targets?: readonly string[] | null
  doc_token?: string | null
  node_token?: string | null
  origin_node_token?: string | null
  obj_token?: string | null
}

export interface LocalizedRoutingError {
  page_url: string
  record_id?: string | null
  code: 'OWNERSHIP_CONFIG_MISSING' | 'OWNERSHIP_PATH_MISMATCH'
  message: string
}

export interface CreateLocalizedRoutingContextInput {
  site?: string
  records: readonly LocalizedRoutingRecord[]
  availablePages?: readonly string[] | ReadonlySet<string>
  active?: ActiveLocalizedRegistry | null
  previousSnapshot?: {
    records?: readonly LocalizedFallbackSnapshotRecord[]
  } | null
}

export interface ComputeNextActiveRegistryOptions {
  activatedIn: string
  anchorsByPageUrl?: ReadonlyMap<string, Record<string, string>>
}

export interface LocalizedRoutingContext {
  site: string
  availablePages: readonly string[]
  activeByPageUrl: ReadonlyMap<string, ActiveLocalizedPage>
  activeByPageId: ReadonlyMap<PageId, ActiveLocalizedPage>
  activePageUrls: ReadonlySet<string>
  routesByPageUrl: Map<string, LocalizedSourceRoute>
  inspectedDocsByPageUrl: Map<string, string>
  inspectedFeishuLinksByPageUrl: Map<string, Set<string>>
  recordsByPageUrl: Map<string, LocalizedRoutingRecord>
  ownerPageUrlByPageId: Map<PageId, string>
  fallbackBaselineByPageUrl: Map<string, LocalizedFallbackSnapshotRecord>
  aliasesByToken: Map<string, string>
  errors: LocalizedRoutingError[]
  resolveRoute(rawPageUrl: string): LocalizedSourceRoute | undefined
  getFallbackBaseline(rawPageUrl: string): LocalizedFallbackSnapshotRecord | undefined
  computeNextActiveRegistry(options: ComputeNextActiveRegistryOptions): ActiveLocalizedRegistry
}

const SAFE_PAGE_URL_SEGMENT_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/
const SAFE_RUN_ID_RE = /^[^\s\x00-\x1f\x7f]+$/
const RESERVED_ALIAS_PREFIX_RE = /^(?:base_|shared-|localized-)/

function normalizePublishTargets(targets?: readonly string[] | null): string[] {
  if (!Array.isArray(targets)) return []
  const normalized = new Set<string>()
  for (const raw of targets) {
    const value = String(raw ?? '').trim().toLowerCase()
    if (!value) continue
    if (value === 'saas' || value === 'zilliz.saas') normalized.add('zilliz.saas')
    else if (value === 'paas' || value === 'byoc' || value === 'zilliz.paas' || value === 'zilliz.byoc') {
      normalized.add('zilliz.paas')
    } else {
      normalized.add(value)
    }
  }
  return [...normalized].sort((a, b) => a.localeCompare(b))
}

function hasDisjointNonEmptyTargets(a: readonly string[], b: readonly string[]): boolean {
  return a.length > 0 && b.length > 0 && !a.some(target => b.includes(target))
}

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

function isValidFeishuAlias(token: unknown): token is string {
  return (
    typeof token === 'string' &&
    FEISHU_TOKEN_RE.test(token) &&
    !RESERVED_ALIAS_PREFIX_RE.test(token)
  )
}

function assertValidAnchors(value: unknown, label: string): asserts value is Record<string, string> {
  assertPlainObject(value, label)
  for (const [block, anchor] of Object.entries(value)) {
    assertCondition(
      FEISHU_TOKEN_RE.test(block) &&
        typeof anchor === 'string' &&
        anchor.length > 0 &&
        !/[\s/#?\\\x00-\x1f\x7f]/.test(anchor) &&
        anchor !== '.' &&
        anchor !== '..',
      `Invalid anchor entry "${block}" in ${label}`,
    )
  }
}

/**
 * Single canonical normalizer for localized Guides `page_url` primary keys.
 *
 * - Strips at most one leading `/` and one trailing `/`
 * - Strips trailing `.md` / `.mdx` extension
 * - Rejects empty input, `..`, `.`, control characters, whitespace, backslashes,
 *   query (`?`), hash (`#`), double slashes (`//`), or unsafe segments
 */
export function normalizeLocalizedPageUrl(rawUrl: unknown): string {
  assertCondition(typeof rawUrl === 'string' && rawUrl.length > 0, 'page_url must be a non-empty string')
  assertCondition(
    !/[\x00-\x1f\x7f\\?#\s]/.test(rawUrl),
    `Invalid page_url "${rawUrl}": whitespace, control characters, backslashes, query, and hash are forbidden`,
  )
  assertCondition(!rawUrl.includes('//'), `Invalid page_url "${rawUrl}": double slashes are forbidden`)

  let normalized = rawUrl
  if (normalized.startsWith('/')) normalized = normalized.slice(1)
  if (normalized.endsWith('/')) normalized = normalized.slice(0, -1)
  normalized = normalized.replace(/\.mdx?$/i, '')

  assertCondition(normalized.length > 0, `Invalid page_url "${rawUrl}": normalized path is empty`)

  const segments = normalized.split('/')
  for (const segment of segments) {
    assertCondition(
      segment.length > 0 &&
        segment !== '.' &&
        segment !== '..' &&
        !segment.includes('..') &&
        !segment.endsWith('.') &&
        SAFE_PAGE_URL_SEGMENT_RE.test(segment),
      `Invalid page_url "${rawUrl}": unsafe path segment "${segment}"`,
    )
  }

  return segments.join('/')
}

export function tryNormalizeLocalizedPageUrl(rawUrl: unknown): string | null {
  try {
    return normalizeLocalizedPageUrl(rawUrl)
  } catch {
    return null
  }
}

export function validateActiveLocalizedPage(value: unknown): ActiveLocalizedPage {
  assertStrictKeys(
    value,
    ['page', 'page_url', 'feishu_token', 'anchors', 'activated_in'],
    ['feishu_aliases', 'last_seen_record_id'],
    'ActiveLocalizedPage',
  )

  assertCondition(typeof value.page === 'string', 'ActiveLocalizedPage.page must be a string')
  const idCheck = validatePageId(value.page)
  assertCondition(!('errors' in idCheck), 'errors' in idCheck ? idCheck.errors[0].message : 'Invalid page ID')

  assertCondition(typeof value.page_url === 'string', 'ActiveLocalizedPage.page_url must be a string')
  const normalizedUrl = normalizeLocalizedPageUrl(value.page_url)
  assertCondition(
    normalizedUrl === value.page_url,
    `ActiveLocalizedPage.page_url "${value.page_url}" must be canonical (expected "${normalizedUrl}")`,
  )

  const feishuToken = value.feishu_token
  let validPrimaryToken: string | null = null
  if (feishuToken !== null) {
    assertCondition(
      isValidFeishuAlias(feishuToken),
      'ActiveLocalizedPage.feishu_token must be null or a valid Feishu token',
    )
    validPrimaryToken = feishuToken
  }

  const aliases = Object.hasOwn(value, 'feishu_aliases')
    ? value.feishu_aliases
    : validPrimaryToken
      ? [validPrimaryToken]
      : []
  assertCondition(
    Array.isArray(aliases) &&
      aliases.every(token => isValidFeishuAlias(token)) &&
      new Set(aliases).size === aliases.length,
    'ActiveLocalizedPage.feishu_aliases must be an array of unique valid Feishu tokens',
  )
  assertCondition(
    validPrimaryToken === null ? aliases.length === 0 : aliases.includes(validPrimaryToken),
    'ActiveLocalizedPage.feishu_aliases must match primary feishu_token',
  )

  assertValidAnchors(value.anchors, 'ActiveLocalizedPage.anchors')

  assertCondition(
    typeof value.activated_in === 'string' && SAFE_RUN_ID_RE.test(value.activated_in),
    'ActiveLocalizedPage.activated_in must be a non-empty run identifier without whitespace or control characters',
  )

  if (Object.hasOwn(value, 'last_seen_record_id') && value.last_seen_record_id !== null && value.last_seen_record_id !== undefined) {
    assertNonEmptyText(value.last_seen_record_id, 'ActiveLocalizedPage.last_seen_record_id')
  }

  return value as unknown as ActiveLocalizedPage
}

export function validateActiveLocalizedRegistry(value: unknown): ActiveLocalizedRegistry {
  assertStrictKeys(value, ['schema_version', 'locale', 'group', 'pages'], [], 'ActiveLocalizedRegistry')
  assertCondition(value.schema_version === 1, 'ActiveLocalizedRegistry.schema_version must be 1')
  assertCondition(value.locale === 'zh-CN', 'ActiveLocalizedRegistry.locale must be "zh-CN"')
  assertCondition(value.group === 'guides', 'ActiveLocalizedRegistry.group must be "guides"')
  assertCondition(Array.isArray(value.pages), 'ActiveLocalizedRegistry.pages must be an array')

  const seenPages = new Set<string>()
  const seenPageUrls = new Set<string>()
  const seenAliases = new Set<string>()

  for (const rawEntry of value.pages) {
    const entry = validateActiveLocalizedPage(rawEntry)
    const normalizedUrl = normalizeLocalizedPageUrl(entry.page_url)
    assertCondition(!seenPages.has(entry.page), `Duplicate active localized page ID: "${entry.page}"`)
    assertCondition(!seenPageUrls.has(normalizedUrl), `Duplicate active localized page_url: "${normalizedUrl}"`)
    seenPages.add(entry.page)
    seenPageUrls.add(normalizedUrl)

    const tokens = Object.hasOwn(entry, 'feishu_aliases')
      ? entry.feishu_aliases ?? []
      : entry.feishu_token
        ? [entry.feishu_token]
        : []
    for (const token of tokens) {
      assertCondition(!seenAliases.has(token), `Duplicate active localized Feishu alias: "${token}"`)
      seenAliases.add(token)
    }
  }

  return value as unknown as ActiveLocalizedRegistry
}

export function parseActiveLocalizedRegistry(jsonText: string): ActiveLocalizedRegistry {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Malformed active localized registry JSON: ${message}`)
  }
  return validateActiveLocalizedRegistry(parsed)
}

function collectValidTokens(candidates: readonly (string | null | undefined)[]): string[] {
  const unique: string[] = []
  const seen = new Set<string>()
  for (const candidate of candidates) {
    if (!candidate || !isValidFeishuAlias(candidate) || seen.has(candidate)) continue
    seen.add(candidate)
    unique.push(candidate)
  }
  return unique
}

/**
 * Builds the pure localized routing context keyed strictly by normalized `page_url`
 * and `<page-id>` — completely immune to Feishu Base `record_id` changes.
 */
export function createLocalizedRoutingContext(
  input: CreateLocalizedRoutingContextInput,
): LocalizedRoutingContext {
  const site = input.site ?? 'zh-CN'
  const availablePages = input.availablePages ? [...input.availablePages] : []
  const active = input.active == null ? null : validateActiveLocalizedRegistry(input.active)

  const activeByPageUrl = new Map<string, ActiveLocalizedPage>()
  const activeByPageId = new Map<PageId, ActiveLocalizedPage>()
  const aliasesByToken = new Map<string, string>()

  for (const entry of active?.pages ?? []) {
    const normalizedUrl = normalizeLocalizedPageUrl(entry.page_url)
    activeByPageUrl.set(normalizedUrl, entry)
    activeByPageId.set(entry.page, entry)
    for (const token of collectValidTokens([entry.feishu_token, ...(entry.feishu_aliases ?? [])])) {
      aliasesByToken.set(token, normalizedUrl)
    }
  }

  const fallbackBaselineByPageUrl = new Map<string, LocalizedFallbackSnapshotRecord>()
  const fallbackTargetsByPageUrl = new Map<string, string[]>()
  for (const snapshotRecord of input.previousSnapshot?.records ?? []) {
    const normalizedUrl = normalizeLocalizedPageUrl(snapshotRecord.page_url)
    const nextTargets = normalizePublishTargets(snapshotRecord.publish_targets)
    const existingBaseline = fallbackBaselineByPageUrl.get(normalizedUrl)
    if (existingBaseline) {
      const seenTargets = fallbackTargetsByPageUrl.get(normalizedUrl) ?? []
      const canCoexist =
        existingBaseline.source_kind !== 'localized-page' &&
        snapshotRecord.source_kind !== 'localized-page' &&
        hasDisjointNonEmptyTargets(seenTargets, nextTargets)
      assertCondition(canCoexist, `Duplicate previous snapshot page_url: "${normalizedUrl}"`)
      fallbackTargetsByPageUrl.set(normalizedUrl, [...seenTargets, ...nextTargets])
      continue
    }
    fallbackBaselineByPageUrl.set(normalizedUrl, { ...snapshotRecord, page_url: normalizedUrl })
    fallbackTargetsByPageUrl.set(normalizedUrl, nextTargets)
  }

  const routesByPageUrl = new Map<string, LocalizedSourceRoute>()
  const inspectedDocsByPageUrl = new Map<string, string>()
  const inspectedFeishuLinksByPageUrl = new Map<string, Set<string>>()
  const feishuTargetsByPageUrl = new Map<string, string[]>()
  const feishuRoutesByPageUrl = new Map<string, Array<Extract<LocalizedSourceRoute, { kind: 'feishu' }>>>()
  const recordsByPageUrl = new Map<string, LocalizedRoutingRecord>()
  const ownerPageUrlByPageId = new Map<PageId, string>()
  const errors: LocalizedRoutingError[] = []

  for (const record of input.records) {
    const maybeUrl = tryNormalizeLocalizedPageUrl(record.page_url)
    if (!maybeUrl) {
      if (record.placement_type !== 'canonical') continue
      const errorMessage = `Canonical record has invalid page_url "${String(record.page_url)}"`
      errors.push({
        page_url: String(record.page_url ?? ''),
        ...(record.record_id !== undefined ? { record_id: record.record_id } : {}),
        code: 'OWNERSHIP_CONFIG_MISSING',
        message: errorMessage,
      })
      continue
    }

    const normalizedUrl = maybeUrl
    const activeEntry = activeByPageUrl.get(normalizedUrl)
    if (record.placement_type !== 'canonical' && !activeEntry) {
      continue
    }

    const existingRoute = routesByPageUrl.get(normalizedUrl)
    if (existingRoute) {
      const candidateRoute = classifyLocalizedSourceRoute(record.doc_link, { site, availablePages })
      const seenTargets = feishuTargetsByPageUrl.get(normalizedUrl) ?? []
      const nextTargets = normalizePublishTargets(record.publish_targets)
      const canCoexist =
        !activeEntry &&
        existingRoute.kind === 'feishu' &&
        candidateRoute.kind === 'feishu' &&
        hasDisjointNonEmptyTargets(seenTargets, nextTargets)
      assertCondition(canCoexist, `Duplicate canonical page_url: "${normalizedUrl}"`)
      feishuTargetsByPageUrl.set(normalizedUrl, [...seenTargets, ...nextTargets])
      inspectedFeishuLinksByPageUrl.get(normalizedUrl)!.add(record.doc_link)
      feishuRoutesByPageUrl.get(normalizedUrl)!.push(candidateRoute)
      continue
    }

    let route = classifyLocalizedSourceRoute(record.doc_link, { site, availablePages })

    if (activeEntry && route.kind === 'feishu') {
      throw Object.assign(
        new Error(
          `OWNERSHIP_REVERTED: activated page_url "${normalizedUrl}" (page "${activeEntry.page}") cannot return to Feishu`,
        ),
        {
          code: 'OWNERSHIP_REVERTED',
          page_url: normalizedUrl,
          page: activeEntry.page,
          record_id: record.record_id ?? null,
        },
      )
    }

    if (activeEntry && route.kind === 'localized-page' && activeEntry.page !== route.page) {
      route = {
        kind: 'invalid',
        code: 'OWNERSHIP_CONFIG_MISSING',
        message: `Active page identity changed for page_url "${normalizedUrl}": expected "${activeEntry.page}", got "${route.page}"`,
      }
    }

    if (route.kind === 'localized-page') {
      const existingActiveForPage = activeByPageId.get(route.page)
      const existingClaimant = ownerPageUrlByPageId.get(route.page)
      if (existingActiveForPage && existingActiveForPage.page_url !== normalizedUrl) {
        route = {
          kind: 'invalid',
          code: 'OWNERSHIP_CONFIG_MISSING',
          message: `Duplicate localized page owner: "${route.page}" is already actively owned by "${existingActiveForPage.page_url}" and cannot be bound to "${normalizedUrl}"`,
        }
      } else if (existingClaimant && existingClaimant !== normalizedUrl) {
        route = {
          kind: 'invalid',
          code: 'OWNERSHIP_CONFIG_MISSING',
          message: `Duplicate localized page owner: "${route.page}" is claimed by both "${existingClaimant}" and "${normalizedUrl}"`,
        }
      } else {
        ownerPageUrlByPageId.set(route.page, normalizedUrl)
      }
    }

    routesByPageUrl.set(normalizedUrl, route)
    inspectedDocsByPageUrl.set(normalizedUrl, record.doc_link)
    recordsByPageUrl.set(normalizedUrl, { ...record, page_url: normalizedUrl })

    if (route.kind === 'invalid') {
      errors.push({
        page_url: normalizedUrl,
        ...(record.record_id !== undefined ? { record_id: record.record_id } : {}),
        code: route.code,
        message: route.message,
      })
      continue
    }

    if (route.kind === 'feishu') {
      feishuTargetsByPageUrl.set(normalizedUrl, normalizePublishTargets(record.publish_targets))
      inspectedFeishuLinksByPageUrl.set(normalizedUrl, new Set([record.doc_link]))
      feishuRoutesByPageUrl.set(normalizedUrl, [route])
      continue
    }

    const baseline = fallbackBaselineByPageUrl.get(normalizedUrl)
    const tokens = collectValidTokens([
      activeEntry?.feishu_token,
      ...(activeEntry?.feishu_aliases ?? []),
      baseline?.doc_token,
      baseline?.node_token,
      baseline?.origin_node_token,
      baseline?.obj_token,
    ])
    for (const token of tokens) {
      const existingOwner = aliasesByToken.get(token)
      assertCondition(
        !existingOwner || existingOwner === normalizedUrl,
        `Conflicting localized Feishu alias "${token}" between "${existingOwner}" and "${normalizedUrl}"`,
      )
      aliasesByToken.set(token, normalizedUrl)
    }
  }

  for (const [pageUrl, feishuRoutes] of feishuRoutesByPageUrl) {
    for (const route of feishuRoutes) {
      const owner = aliasesByToken.get(route.token)
      assertCondition(
        !owner || owner === pageUrl,
        `Conflicting localized Feishu alias "${route.token}" between "${owner}" and "${pageUrl}"`,
      )
    }
  }

  const resolveRoute = (rawPageUrl: string): LocalizedSourceRoute | undefined => {
    const normalizedUrl = normalizeLocalizedPageUrl(rawPageUrl)
    return routesByPageUrl.get(normalizedUrl)
  }

  const getFallbackBaseline = (rawPageUrl: string): LocalizedFallbackSnapshotRecord | undefined => {
    const normalizedUrl = normalizeLocalizedPageUrl(rawPageUrl)
    return fallbackBaselineByPageUrl.get(normalizedUrl)
  }

  const computeNextActiveRegistry = (
    options: ComputeNextActiveRegistryOptions,
  ): ActiveLocalizedRegistry => {
    assertCondition(
      typeof options.activatedIn === 'string' && SAFE_RUN_ID_RE.test(options.activatedIn),
      'activatedIn must be a non-empty run identifier without whitespace or control characters',
    )

    const nextByPageUrl = new Map<string, ActiveLocalizedPage>()
    for (const [url, existing] of activeByPageUrl) {
      nextByPageUrl.set(url, {
        ...existing,
        ...(existing.feishu_aliases ? { feishu_aliases: [...existing.feishu_aliases] } : {}),
        anchors: { ...existing.anchors },
      })
    }

    const normalizedAnchorsByUrl = new Map<string, Record<string, string>>()
    if (options.anchorsByPageUrl) {
      for (const [rawUrl, anchors] of options.anchorsByPageUrl) {
        normalizedAnchorsByUrl.set(normalizeLocalizedPageUrl(rawUrl), anchors)
      }
    }

    for (const [pageUrl, route] of routesByPageUrl) {
      if (route.kind !== 'localized-page') continue
      const existing = nextByPageUrl.get(pageUrl)
      const record = recordsByPageUrl.get(pageUrl)
      const baseline = fallbackBaselineByPageUrl.get(pageUrl)
      const fallbackPrimaryToken =
        collectValidTokens([
          baseline?.doc_token,
          baseline?.node_token,
          baseline?.origin_node_token,
          baseline?.obj_token,
        ])[0] ?? null
      const primaryToken =
        existing?.feishu_token !== undefined ? existing.feishu_token : fallbackPrimaryToken

      const mergedAliases = primaryToken
        ? collectValidTokens([
            primaryToken,
            ...(existing?.feishu_aliases ?? []),
            baseline?.doc_token,
            baseline?.node_token,
            baseline?.origin_node_token,
            baseline?.obj_token,
          ])
        : []

      const mergedAnchors: Record<string, string> = {
        ...(existing?.anchors ?? {}),
        ...(normalizedAnchorsByUrl.get(pageUrl) ?? {}),
      }

      const lastSeenRecordId =
        record?.record_id !== undefined && record.record_id !== null
          ? record.record_id
          : existing?.last_seen_record_id ?? null

      const nextEntry: ActiveLocalizedPage = {
        page: route.page,
        page_url: pageUrl,
        feishu_token: primaryToken,
        ...(mergedAliases.length > 0 || existing?.feishu_aliases !== undefined
          ? { feishu_aliases: mergedAliases }
          : {}),
        anchors: mergedAnchors,
        activated_in: existing?.activated_in ?? options.activatedIn,
        ...(lastSeenRecordId !== null ? { last_seen_record_id: lastSeenRecordId } : {}),
      }

      nextByPageUrl.set(pageUrl, nextEntry)
    }

    const pages = [...nextByPageUrl.values()].sort((a, b) => a.page.localeCompare(b.page))
    return validateActiveLocalizedRegistry({
      schema_version: 1,
      locale: 'zh-CN',
      group: 'guides',
      pages,
    })
  }

  return {
    site,
    availablePages,
    activeByPageUrl,
    activeByPageId,
    activePageUrls: new Set(activeByPageUrl.keys()),
    routesByPageUrl,
    inspectedDocsByPageUrl,
    inspectedFeishuLinksByPageUrl,
    recordsByPageUrl,
    ownerPageUrlByPageId,
    fallbackBaselineByPageUrl,
    aliasesByToken,
    errors,
    resolveRoute,
    getFallbackBaseline,
    computeNextActiveRegistry,
  }
}
