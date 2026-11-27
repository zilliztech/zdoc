/**
 * Pure site-exclusive route classification for localized Chinese Guides handoff.
 * Zero filesystem, Git, Feishu, process, or network access.
 */
import { validatePageId } from '../config.ts'
import type { PageId } from '../types.ts'

export type LocalizedLocale = 'zh-CN'
export type LocalizedGroup = 'guides'

export type LocalizedSourceRoute =
  | { kind: 'feishu'; token: string; url: string }
  | {
      kind: 'localized-page'
      locale: LocalizedLocale
      group: LocalizedGroup
      page: PageId
      directory: string
      url: string
    }
  | {
      kind: 'invalid'
      code: 'OWNERSHIP_CONFIG_MISSING' | 'OWNERSHIP_PATH_MISMATCH'
      message: string
    }

export interface LocalizedSourceRouteContext {
  site: string
  availablePages?: readonly string[] | ReadonlySet<string>
}

export const SHA256_HEX_RE = /^[a-f0-9]{64}$/
export const COMMIT_SHA_RE = /^[a-f0-9]{40}$/
export const FEISHU_TOKEN_RE = /^[A-Za-z0-9_-]+$/

const LOCALIZED_DOCS_PREFIX_RE =
  /^https:\/\/github\.com\/zilliztech\/zdoc\/tree\/master\/localized-docs(?:\/|$|[?#])/
const SHARED_DOCS_PREFIX_RE =
  /^https:\/\/github\.com\/zilliztech\/zdoc\/tree\/master\/shared-docs(?:\/|$|[?#])/
const LOCALIZED_LOCALE_SEGMENT_RE =
  /^https:\/\/github\.com\/zilliztech\/zdoc\/tree\/master\/localized-docs\/([A-Za-z0-9][A-Za-z0-9_-]*)(?:\/|$)/
const LOCALIZED_ZH_GUIDES_PAGE_RE =
  /^https:\/\/github\.com\/zilliztech\/zdoc\/tree\/master\/localized-docs\/zh-CN\/guides\/pages\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/
const FEISHU_DOC_PATH_RE = /^\/(?:wiki|doc|docs|docx)\/([A-Za-z0-9_-]+)\/?$/
const FEISHU_HOST_RE = /^(?:[a-z0-9-]+\.)*(?:feishu\.cn|larksuite\.com)$/

/** Safe repository-relative POSIX path with no traversal, backslashes, or control characters. */
export function safeHandoffPath(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !value.startsWith('/') &&
    !/[\\\0\r\n]/.test(value) &&
    value.split('/').every(part => part.length > 0 && part !== '.' && part !== '..')
  )
}

/**
 * Detects `https://github.com/zilliztech/zdoc/tree/master/localized-docs/...` URLs.
 * Used on both zh-CN and symmetrically on EN to prevent cross-site routing leaks.
 */
export function isLocalizedDocsUrl(value: unknown): value is string {
  return typeof value === 'string' && LOCALIZED_DOCS_PREFIX_RE.test(value)
}

/**
 * Detects `https://github.com/zilliztech/zdoc/tree/master/shared-docs/...` URLs.
 */
export function isSharedDocsUrl(value: unknown): value is string {
  return typeof value === 'string' && SHARED_DOCS_PREFIX_RE.test(value)
}

function hasAvailableLocalizedPage(
  availablePages: readonly string[] | ReadonlySet<string> | undefined,
  page: PageId,
): boolean {
  if (!availablePages) return false
  const candidates = [page, `guides/${page}`, `zh-CN/guides/${page}`]
  if (availablePages instanceof Set) {
    return candidates.some(candidate => availablePages.has(candidate))
  }
  return candidates.some(candidate => (availablePages as readonly string[]).includes(candidate))
}

/**
 * Site-exclusive route classifier for Chinese Guides canonical Docs links.
 *
 * Raw bytes are matched directly without URL normalization so encoded traversal
 * (`%2e%2e`), `..`, query strings, fragments, and extra path segments are rejected.
 */
export function classifyLocalizedSourceRoute(
  value: unknown,
  context: LocalizedSourceRouteContext,
): LocalizedSourceRoute {
  const missingConfig = (message: string): LocalizedSourceRoute => ({
    kind: 'invalid',
    code: 'OWNERSHIP_CONFIG_MISSING',
    message,
  })
  const pathMismatch = (message: string): LocalizedSourceRoute => ({
    kind: 'invalid',
    code: 'OWNERSHIP_PATH_MISMATCH',
    message,
  })

  if (typeof value !== 'string' || !value.trim()) {
    return missingConfig(
      'Canonical Docs must select a valid Feishu document or an existing localized zh-CN guides page at pinned master',
    )
  }

  // Site exclusivity: reject localized-docs URLs on non-zh-CN sites (e.g. en).
  if (context.site !== 'zh-CN' && isLocalizedDocsUrl(value)) {
    return pathMismatch(
      `Localized docs URL is not allowed on site "${context.site}"; expected site "zh-CN"`,
    )
  }

  // Cross-pipeline isolation: zh-CN localized routing never accepts shared-docs URLs.
  if (isSharedDocsUrl(value)) {
    return pathMismatch(
      'shared-docs URLs are exclusive to English shared pages and cannot be routed on localized zh-CN guides',
    )
  }

  // Cross-locale isolation: reject other locales under localized-docs/<other>/...
  const localeMatch = LOCALIZED_LOCALE_SEGMENT_RE.exec(value)
  if (localeMatch && localeMatch[1] !== 'zh-CN') {
    return pathMismatch(
      `Localized docs URL targets locale "${localeMatch[1]}", which does not match site "zh-CN"`,
    )
  }

  // Strict raw-byte match for pinned master localized-docs/zh-CN/guides/pages/<page-id>.
  const localizedMatch = LOCALIZED_ZH_GUIDES_PAGE_RE.exec(value)
  if (context.site === 'zh-CN' && localizedMatch) {
    const page = localizedMatch[1]
    const idCheck = validatePageId(page)
    if ('errors' in idCheck) {
      return missingConfig(idCheck.errors[0].message)
    }
    if (!hasAvailableLocalizedPage(context.availablePages, page)) {
      return missingConfig(
        `Localized page "${page}" was not found in pinned master availablePages`,
      )
    }
    return {
      kind: 'localized-page',
      locale: 'zh-CN',
      group: 'guides',
      page,
      directory: `localized-docs/zh-CN/guides/pages/${page}`,
      url: value,
    }
  }

  // Valid Feishu / Lark document link.
  try {
    const parsed = new URL(value)
    const host = parsed.hostname.toLowerCase()
    const pathMatch = FEISHU_DOC_PATH_RE.exec(parsed.pathname)
    if (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      !parsed.username &&
      !parsed.password &&
      !parsed.port &&
      pathMatch &&
      FEISHU_HOST_RE.test(host)
    ) {
      return { kind: 'feishu', token: pathMatch[1], url: value }
    }
  } catch {
    // Malformed URLs fall through to OWNERSHIP_CONFIG_MISSING.
  }

  return missingConfig(
    'Canonical Docs must select a valid Feishu document or an existing localized zh-CN guides page at pinned master',
  )
}
