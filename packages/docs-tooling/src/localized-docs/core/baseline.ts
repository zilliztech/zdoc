import { isCommit, isRepositoryPath } from '../../shared-docs/core/yaml.ts'
import { validatePageId } from './config.ts'
import type {
  BaselineJson,
  DiagnosticContext,
  LocalizedDocsError,
  PageConfig,
} from './types.ts'
import { localizedError, sha256Hex } from './types.ts'

const SHA256_RE = /^[a-f0-9]{64}$/
const NOTIFIED_SHA_RE = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/
const ISO_TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/

const ROOT_FIELDS = [
  'schema_version',
  'page_id',
  'en_baseline',
  'zh_reviewed',
  'last_notified_en_sha',
  'sections',
] as const

const EN_BASELINE_FIELDS = [
  'manual',
  'shared_page',
  'dev_commit',
  'en_path',
  'manifest_path',
  'file_sha256',
  'channels',
] as const

const CHANNELS_FIELDS = ['current_sha256', 'next_sha256'] as const
const ZH_REVIEWED_FIELDS = ['source_sha256', 'reviewed_pr', 'updated_at'] as const
const SECTION_FIELDS = ['anchor', 'en_sha256', 'zh_sha256', 'code_blocks'] as const
const CODE_BLOCK_FIELDS = ['lang', 'customized_for_zh', 'en_sha256'] as const

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function checkStrictKeys(
  value: unknown,
  requiredFields: readonly string[],
  label: string,
  context: DiagnosticContext,
  errors: LocalizedDocsError[],
): value is Record<string, unknown> {
  if (!isPlainRecord(value)) {
    errors.push(localizedError('BASELINE_INVALID', `${label} must be a JSON object`, context, 1))
    return false
  }
  for (const key of Object.keys(value)) {
    if (!requiredFields.includes(key)) {
      errors.push(localizedError('BASELINE_INVALID', `Unknown field in ${label}: ${key}`, context, 1))
    }
  }
  for (const key of requiredFields) {
    if (!Object.hasOwn(value, key)) {
      errors.push(localizedError('BASELINE_INVALID', `Missing required field in ${label}: ${key}`, context, 1))
    }
  }
  return true
}

export function parseBaselineJson(
  text: string,
  context: DiagnosticContext = {},
): { baseline: BaselineJson } | { errors: LocalizedDocsError[] } {
  const location: DiagnosticContext = { file: '.baseline.json', ...context }
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const lineMatch = /line (\d+)/i.exec(message)
    const position = /position (\d+)/i.exec(message)
    const line = lineMatch
      ? Number(lineMatch[1])
      : position
        ? text.slice(0, Number(position[1])).split(/\r\n|\r|\n/).length
        : 1
    return {
      errors: [localizedError('BASELINE_SYNTAX_INVALID', `Malformed .baseline.json: ${message}`, location, line)],
    }
  }

  const errors: LocalizedDocsError[] = []
  if (!checkStrictKeys(parsed, ROOT_FIELDS, 'baseline', location, errors)) {
    return { errors }
  }

  if (Object.hasOwn(parsed, 'schema_version') && parsed.schema_version !== 1) {
    errors.push(localizedError('BASELINE_INVALID', 'Unsupported baseline schema_version; expected 1', location, 1))
  }

  if (Object.hasOwn(parsed, 'page_id')) {
    if (typeof parsed.page_id !== 'string') {
      errors.push(localizedError('BASELINE_INVALID', 'baseline.page_id must be a string', location, 1))
    } else {
      const idCheck = validatePageId(parsed.page_id, location)
      if ('errors' in idCheck) {
        errors.push(...idCheck.errors)
      }
    }
  }

  if (Object.hasOwn(parsed, 'en_baseline')) {
    const en = parsed.en_baseline
    if (checkStrictKeys(en, EN_BASELINE_FIELDS, 'en_baseline', location, errors)) {
      if (Object.hasOwn(en, 'manual') && en.manual !== 'guides') {
        errors.push(localizedError('BASELINE_INVALID', 'en_baseline.manual must be "guides"', location, 1))
      }
      if (Object.hasOwn(en, 'shared_page')) {
        if (typeof en.shared_page !== 'string') {
          errors.push(localizedError('BASELINE_INVALID', 'en_baseline.shared_page must be a string', location, 1))
        } else {
          const sharedCheck = validatePageId(en.shared_page, location)
          if ('errors' in sharedCheck) {
            errors.push(
              localizedError('BASELINE_INVALID', `en_baseline.shared_page is invalid: ${sharedCheck.errors[0].message}`, location, 1),
            )
          }
        }
      }
      if (Object.hasOwn(en, 'dev_commit') && !isCommit(en.dev_commit)) {
        errors.push(localizedError('BASELINE_INVALID', 'en_baseline.dev_commit must be a 40-char lowercase hex SHA', location, 1))
      }
      for (const pathField of ['en_path', 'manifest_path'] as const) {
        if (Object.hasOwn(en, pathField)) {
          if (typeof en[pathField] !== 'string' || !en[pathField].trim() || !isRepositoryPath(en[pathField])) {
            errors.push(
              localizedError(
                'BASELINE_INVALID',
                `en_baseline.${pathField} must be a safe repository-relative path`,
                location,
                1,
              ),
            )
          }
        }
      }
      if (Object.hasOwn(en, 'file_sha256') && (typeof en.file_sha256 !== 'string' || !SHA256_RE.test(en.file_sha256))) {
        errors.push(localizedError('BASELINE_INVALID', 'en_baseline.file_sha256 must be a 64-char hex SHA-256', location, 1))
      }
      if (Object.hasOwn(en, 'channels')) {
        const ch = en.channels
        if (checkStrictKeys(ch, CHANNELS_FIELDS, 'en_baseline.channels', location, errors)) {
          for (const chKey of CHANNELS_FIELDS) {
            if (Object.hasOwn(ch, chKey) && (typeof ch[chKey] !== 'string' || !SHA256_RE.test(ch[chKey]))) {
              errors.push(
                localizedError(
                  'BASELINE_INVALID',
                  `en_baseline.channels.${chKey} must be a 64-char hex SHA-256`,
                  location,
                  1,
                ),
              )
            }
          }
        }
      }
    }
  }

  if (Object.hasOwn(parsed, 'zh_reviewed')) {
    const zh = parsed.zh_reviewed
    if (checkStrictKeys(zh, ZH_REVIEWED_FIELDS, 'zh_reviewed', location, errors)) {
      if (Object.hasOwn(zh, 'source_sha256') && (typeof zh.source_sha256 !== 'string' || !SHA256_RE.test(zh.source_sha256))) {
        errors.push(
          localizedError('BASELINE_INVALID', 'zh_reviewed.source_sha256 must be a 64-char hex SHA-256', location, 1),
        )
      }
      if (
        Object.hasOwn(zh, 'reviewed_pr') &&
        (typeof zh.reviewed_pr !== 'number' || !Number.isSafeInteger(zh.reviewed_pr) || zh.reviewed_pr <= 0)
      ) {
        errors.push(
          localizedError('BASELINE_INVALID', 'zh_reviewed.reviewed_pr must be a positive integer', location, 1),
        )
      }
      if (
        Object.hasOwn(zh, 'updated_at') &&
        (typeof zh.updated_at !== 'string' || !ISO_TIMESTAMP_RE.test(zh.updated_at) || !Number.isFinite(Date.parse(zh.updated_at)))
      ) {
        errors.push(
          localizedError('BASELINE_INVALID', 'zh_reviewed.updated_at must be a valid ISO-8601 timestamp', location, 1),
        )
      }
    }
  }

  if (Object.hasOwn(parsed, 'last_notified_en_sha')) {
    const notified = parsed.last_notified_en_sha
    if (notified !== null && (typeof notified !== 'string' || !NOTIFIED_SHA_RE.test(notified))) {
      errors.push(
        localizedError('BASELINE_INVALID', 'last_notified_en_sha must be null or a 40/64-char hex SHA', location, 1),
      )
    }
  }

  if (Object.hasOwn(parsed, 'sections')) {
    if (!Array.isArray(parsed.sections)) {
      errors.push(localizedError('BASELINE_INVALID', 'sections must be an array', location, 1))
    } else {
      parsed.sections.forEach((section, index) => {
        if (!checkStrictKeys(section, SECTION_FIELDS, `sections[${index}]`, location, errors)) return
        if (Object.hasOwn(section, 'anchor') && (typeof section.anchor !== 'string' || !section.anchor.trim())) {
          errors.push(localizedError('BASELINE_INVALID', `sections[${index}].anchor must be a nonempty string`, location, 1))
        }
        for (const hashField of ['en_sha256', 'zh_sha256'] as const) {
          if (
            Object.hasOwn(section, hashField) &&
            (typeof section[hashField] !== 'string' || !SHA256_RE.test(section[hashField]))
          ) {
            errors.push(
              localizedError(
                'BASELINE_INVALID',
                `sections[${index}].${hashField} must be a 64-char hex SHA-256`,
                location,
                1,
              ),
            )
          }
        }
        if (Object.hasOwn(section, 'code_blocks')) {
          if (!Array.isArray(section.code_blocks)) {
            errors.push(
              localizedError('BASELINE_INVALID', `sections[${index}].code_blocks must be an array`, location, 1),
            )
          } else {
            section.code_blocks.forEach((block, blockIndex) => {
              if (!checkStrictKeys(block, CODE_BLOCK_FIELDS, `sections[${index}].code_blocks[${blockIndex}]`, location, errors)) {
                return
              }
              if (
                Object.hasOwn(block, 'lang') &&
                block.lang !== null &&
                (typeof block.lang !== 'string' || !block.lang.trim())
              ) {
                errors.push(
                  localizedError(
                    'BASELINE_INVALID',
                    `sections[${index}].code_blocks[${blockIndex}].lang must be a nonempty string or null`,
                    location,
                    1,
                  ),
                )
              }
              if (Object.hasOwn(block, 'customized_for_zh') && typeof block.customized_for_zh !== 'boolean') {
                errors.push(
                  localizedError(
                    'BASELINE_INVALID',
                    `sections[${index}].code_blocks[${blockIndex}].customized_for_zh must be a boolean`,
                    location,
                    1,
                  ),
                )
              }
              if (
                Object.hasOwn(block, 'en_sha256') &&
                (typeof block.en_sha256 !== 'string' || !SHA256_RE.test(block.en_sha256))
              ) {
                errors.push(
                  localizedError(
                    'BASELINE_INVALID',
                    `sections[${index}].code_blocks[${blockIndex}].en_sha256 must be a 64-char hex SHA-256`,
                    location,
                    1,
                  ),
                )
              }
            })
          }
        }
      })
    }
  }

  return errors.length ? { errors } : { baseline: parsed as unknown as BaselineJson }
}

export function validateBaselineConsistency(options: {
  baseline: BaselineJson
  dirPageId: string
  pageConfig: PageConfig
  sourceMdText?: string
  context?: DiagnosticContext
}): LocalizedDocsError[] {
  const { baseline, dirPageId, pageConfig, sourceMdText } = options
  const location: DiagnosticContext = { file: '.baseline.json', page: dirPageId, ...options.context }
  const errors: LocalizedDocsError[] = []

  if (baseline.page_id !== dirPageId) {
    errors.push(
      localizedError(
        'BASELINE_PAGE_ID_MISMATCH',
        `.baseline.json page_id "${baseline.page_id}" does not match directory page ID "${dirPageId}"`,
        location,
        1,
      ),
    )
  }

  if (
    baseline.en_baseline.manual !== pageConfig.en_source.manual ||
    baseline.en_baseline.shared_page !== pageConfig.en_source.shared_page
  ) {
    errors.push(
      localizedError(
        'BASELINE_EN_SOURCE_MISMATCH',
        `.baseline.json en_baseline (${baseline.en_baseline.manual}/${baseline.en_baseline.shared_page}) does not match page.yaml en_source (${pageConfig.en_source.manual}/${pageConfig.en_source.shared_page})`,
        location,
        1,
      ),
    )
  }

  if (sourceMdText !== undefined) {
    const actualSha = sha256Hex(sourceMdText)
    if (actualSha !== baseline.zh_reviewed.source_sha256) {
      errors.push(
        localizedError(
          'BASELINE_SOURCE_HASH_MISMATCH',
          `source.md SHA-256 (${actualSha}) does not match .baseline.json zh_reviewed.source_sha256 (${baseline.zh_reviewed.source_sha256})`,
          location,
          1,
        ),
      )
    }
  }

  return errors
}
