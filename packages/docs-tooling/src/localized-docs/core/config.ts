import { parseVariables } from '../../shared-docs/core/variables.ts'
import { ConfigValidation, parseYaml } from '../../shared-docs/core/yaml.ts'
import type {
  DiagnosticContext,
  LocalizedDocsError,
  PageConfig,
  PageLifecycleState,
  PageMode,
  Variables,
} from './types.ts'
import { localizedError } from './types.ts'

export const PAGE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const RESERVED_PAGE_IDS = new Set(['active'])

const LEGACY_FORBIDDEN_MESSAGES: Readonly<Record<string, string>> = {
  owner: 'Legacy field "owner" is forbidden in page.yaml; ownership is managed through GitHub CODEOWNERS',
  feishu_record_id:
    'Legacy field "feishu_record_id" is forbidden in page.yaml; page identity binds to page_id and page url',
}

const VALID_MODES: readonly PageMode[] = ['incremental', 'manual', 'paused']
const VALID_SYNC_POLICIES = ['independent', 'bilingual_sync'] as const
const ROOT_ALLOWED_FIELDS = [
  'schema_version',
  'mode',
  'en_source',
  'sync_policy',
  'notify_on_en_change',
  'pause_reason',
  'follow_up',
  'variables',
]

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function validatePageId(
  pageId: string,
  context: DiagnosticContext = {},
): { pageId: string } | { errors: LocalizedDocsError[] } {
  if (typeof pageId !== 'string' || !pageId.length) {
    return {
      errors: [localizedError('CONFIG_PAGE_ID_INVALID', 'Page ID must be a nonempty string', context, 1)],
    }
  }
  if (pageId === '.' || pageId === '..' || /[\\/\0\r\n]/.test(pageId)) {
    return {
      errors: [
        localizedError(
          'CONFIG_PAGE_ID_INVALID',
          `Invalid page ID "${pageId}": path separators and traversal segments are forbidden`,
          context,
          1,
        ),
      ],
    }
  }
  if (RESERVED_PAGE_IDS.has(pageId)) {
    return {
      errors: [
        localizedError(
          'CONFIG_PAGE_ID_INVALID',
          `Page ID "${pageId}" is reserved and cannot be used`,
          context,
          1,
        ),
      ],
    }
  }
  if (!PAGE_ID_PATTERN.test(pageId)) {
    return {
      errors: [
        localizedError(
          'CONFIG_PAGE_ID_INVALID',
          `Invalid page ID "${pageId}": must match lowercase hyphenated slug /^[a-z0-9]+(?:-[a-z0-9]+)*$/`,
          context,
          1,
        ),
      ],
    }
  }
  return { pageId }
}

export function parseLocalizedVariables(
  text: string,
  context: DiagnosticContext = {},
): { variables: Variables } | { errors: LocalizedDocsError[] } {
  return parseVariables(text, { file: 'Variables.json', ...context })
}

export function mergeVariables(
  groupVariables: Variables,
  pageVariables?: Record<string, string>,
  context: DiagnosticContext = {},
): { variables: Variables } | { errors: LocalizedDocsError[] } {
  const merged: Variables = {}
  const foldedIndex = new Map<string, string>()

  for (const [key, value] of Object.entries(groupVariables)) {
    const folded = key.toLowerCase()
    if (foldedIndex.has(folded)) {
      return {
        errors: [
          localizedError(
            'CONFIG_VARIABLES_INVALID',
            `Ambiguous group variable keys: ${foldedIndex.get(folded)} and ${key}`,
            context,
            1,
          ),
        ],
      }
    }
    foldedIndex.set(folded, key)
    merged[key] = value
  }

  if (pageVariables) {
    const pageFolded = new Map<string, string>()
    for (const [key, value] of Object.entries(pageVariables)) {
      const folded = key.toLowerCase()
      if (pageFolded.has(folded)) {
        return {
          errors: [
            localizedError(
              'CONFIG_VARIABLES_INVALID',
              `Ambiguous page variable keys: ${pageFolded.get(folded)} and ${key}`,
              context,
              1,
            ),
          ],
        }
      }
      pageFolded.set(folded, key)
      const existingGroupKey = foldedIndex.get(folded)
      if (existingGroupKey && existingGroupKey !== key) {
        delete merged[existingGroupKey]
      }
      foldedIndex.set(folded, key)
      merged[key] = value
    }
  }

  return { variables: merged }
}

export function parseLocalizedPageConfig(
  pageId: string,
  text: string,
  context: DiagnosticContext = {},
): { config: PageConfig } | { errors: LocalizedDocsError[] } {
  const location: DiagnosticContext = {
    file: context.file ?? `localized-docs/zh-CN/guides/pages/${pageId}/page.yaml`,
    page: context.page ?? pageId,
  }
  const idResult = validatePageId(pageId, location)
  const idErrors = 'errors' in idResult ? idResult.errors : []

  const parsed = parseYaml(text, 'CONFIG_SYNTAX_INVALID', location)
  if ('errors' in parsed) {
    return { errors: [...idErrors, ...parsed.errors] }
  }

  const check = new ConfigValidation(parsed.document, location, 'CONFIG_FIELD_UNKNOWN', 'CONFIG_FIELD_MISSING')
  check.errors.push(...idErrors)
  const value = parsed.document.value

  if (!isPlainRecord(value)) {
    check.error([], 'page.yaml must be a YAML mapping', 'CONFIG_FIELD_INVALID')
    return { errors: check.errors }
  }

  const allowedKeys = [...ROOT_ALLOWED_FIELDS]
  for (const legacyField of Object.keys(LEGACY_FORBIDDEN_MESSAGES)) {
    if (Object.hasOwn(value, legacyField)) {
      check.error(
        [legacyField, '$key'],
        LEGACY_FORBIDDEN_MESSAGES[legacyField],
        'CONFIG_LEGACY_FIELD_FORBIDDEN',
      )
      allowedKeys.push(legacyField)
    }
  }

  if (check.object(value, [], allowedKeys, ['schema_version', 'mode', 'en_source'])) {
    if (Object.hasOwn(value, 'schema_version') && value.schema_version !== 1) {
      check.error(['schema_version'], 'Unsupported schema_version; expected 1', 'CONFIG_FIELD_INVALID')
    }

    let mode: PageMode | undefined
    if (Object.hasOwn(value, 'mode')) {
      if (typeof value.mode !== 'string' || !VALID_MODES.includes(value.mode as PageMode)) {
        check.error(['mode'], 'mode must be one of: incremental, manual, paused', 'CONFIG_FIELD_INVALID')
      } else {
        mode = value.mode as PageMode
      }
    }

    if (Object.hasOwn(value, 'en_source')) {
      const enSource = value.en_source
      if (check.object(enSource, ['en_source'], ['manual', 'shared_page'], ['manual', 'shared_page'])) {
        if (Object.hasOwn(enSource, 'manual') && enSource.manual !== 'guides') {
          check.error(['en_source', 'manual'], 'en_source.manual must be "guides"', 'CONFIG_FIELD_INVALID')
        }
        if (Object.hasOwn(enSource, 'shared_page')) {
          if (check.string(enSource.shared_page, ['en_source', 'shared_page'])) {
            const sharedPageId = validatePageId(enSource.shared_page, location)
            if ('errors' in sharedPageId) {
              check.error(
                ['en_source', 'shared_page'],
                `en_source.shared_page is invalid: ${sharedPageId.errors[0].message}`,
                'CONFIG_FIELD_INVALID',
              )
            }
          }
        }
      }
    }

    if (Object.hasOwn(value, 'sync_policy')) {
      if (
        typeof value.sync_policy !== 'string' ||
        !VALID_SYNC_POLICIES.includes(value.sync_policy as (typeof VALID_SYNC_POLICIES)[number])
      ) {
        check.error(
          ['sync_policy'],
          'sync_policy must be one of: independent, bilingual_sync',
          'CONFIG_FIELD_INVALID',
        )
      }
    }

    if (Object.hasOwn(value, 'notify_on_en_change') && typeof value.notify_on_en_change !== 'boolean') {
      check.error(['notify_on_en_change'], 'notify_on_en_change must be a boolean', 'CONFIG_FIELD_INVALID')
    }

    for (const pausedField of ['pause_reason', 'follow_up'] as const) {
      if (Object.hasOwn(value, pausedField)) {
        if (typeof value[pausedField] !== 'string' || !value[pausedField].trim()) {
          check.error([pausedField], `${pausedField} must be a nonempty string`, 'CONFIG_FIELD_INVALID')
        } else if (mode && mode !== 'paused') {
          check.error(
            [pausedField, '$key'],
            `${pausedField} is only allowed when mode is "paused"`,
            'CONFIG_FIELD_INVALID',
          )
        }
      }
    }

    if (Object.hasOwn(value, 'variables')) {
      const vars = value.variables
      if (!isPlainRecord(vars)) {
        check.error(['variables'], 'variables must be a key-value mapping of strings', 'CONFIG_VARIABLES_INVALID')
      } else {
        const seenFolded = new Map<string, string>()
        for (const [varKey, varVal] of Object.entries(vars)) {
          if (!varKey.trim()) {
            check.error(['variables', varKey, '$key'], 'Variable keys must be nonempty strings', 'CONFIG_VARIABLES_INVALID')
          }
          const folded = varKey.toLowerCase()
          if (seenFolded.has(folded)) {
            check.error(
              ['variables', varKey, '$key'],
              `Ambiguous page variable keys: ${seenFolded.get(folded)} and ${varKey}`,
              'CONFIG_VARIABLES_INVALID',
            )
          }
          seenFolded.set(folded, varKey)
          if (typeof varVal !== 'string') {
            check.error(
              ['variables', varKey],
              `Page variable "${varKey}" must have a scalar string value`,
              'CONFIG_VARIABLES_INVALID',
            )
          }
        }
      }
    }
  }

  return check.errors.length ? { errors: check.errors } : { config: value as unknown as PageConfig }
}

export function resolvePageLifecycleState(
  mode: PageMode,
  hasSourceMd: boolean,
  hasBaselineJson: boolean,
): PageLifecycleState {
  if (hasSourceMd && !hasBaselineJson) {
    return 'baseline-missing-error'
  }
  if (!hasSourceMd && hasBaselineJson) {
    return 'source-missing-error'
  }
  if (!hasSourceMd && !hasBaselineJson) {
    if (mode === 'incremental') return 'pending-initial-translation'
    if (mode === 'paused') return 'paused'
    return 'source-missing-error'
  }
  return 'ready'
}
