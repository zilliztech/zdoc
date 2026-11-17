import type { ConfigResult, DiagnosticContext, ManualCloudChannel, ManualConfig, Variables } from './types'
import { ConfigValidation, isRepositoryPath, parseYaml } from './yaml'

/** Manual-layout page metadata; the title always comes from the H1 heading. */
const PAGE_METADATA_FIELDS = ['beta', 'deprecate_since', 'added_since', 'description', 'last_modified', 'notebook', 'type', 'token', 'sidebar_position', 'keywords']
const MODULE_METADATA_FIELDS = ['beta']
const CLOUD_CHANNEL_VALUES: readonly ManualCloudChannel[] = ['current', 'next', 'retire-in-next']

function checkBeta(check: ConfigValidation, record: Record<string, unknown>, path: (string | number)[], betaValues: readonly string[]): void {
  // YAML's FALSE scalar is boolean false; both spellings denote the no-tag value.
  const beta = record.beta === false ? 'FALSE' : record.beta
  if (typeof beta !== 'string' || beta === 'BYOC' || (beta !== 'FALSE' && !betaValues.includes(beta))) {
    check.error(path, 'beta must be FALSE or a supported heading tag other than BYOC', 'CONFIG_BETA_INVALID')
  } else record.beta = beta
}

/** One upstream hardcoded value may not contain another (or equal it): replacement is a single
 * exact-match pass, and overlapping values would make the output order-dependent. check.string
 * already flags non-string entries; the pairwise containment check runs on valid strings only. */
function checkMilvusValueConflicts(check: ConfigValidation, values: Record<string, unknown>): void {
  const entries = Object.entries(values).filter(([, value]) => typeof value === 'string') as [string, string][]
  for (let left = 0; left < entries.length; left++) for (let right = left + 1; right < entries.length; right++) {
    const [leftKey, leftValue] = entries[left], [rightKey, rightValue] = entries[right]
    if (leftValue.includes(rightValue) || rightValue.includes(leftValue)) {
      check.error(['milvus_values'], `milvus_values entries ${leftKey} and ${rightKey} have overlapping source values; unify the upstream examples instead`,
        'CONFIG_MILVUS_VALUES_INVALID')
      return
    }
  }
}

export function parseManualConfig(text: string, context: DiagnosticContext & {
  manuals: readonly string[]; betaValues: readonly string[]; variables?: Variables
}): ConfigResult<ManualConfig> {
  const location = { file: 'manual.yaml', channel: 'both' as const, ...context }
  const parsed = parseYaml(text, 'CONFIG_SYNTAX_INVALID', location)
  if ('errors' in parsed) return parsed
  const check = new ConfigValidation(parsed.document, location)
  const value = parsed.document.value
  // transforms joins with the R1c channel package; the manual layout gains one semantic per follow-up.
  if (check.object(value, [], ['schema_version', 'source', 'publish', 'metadata', 'exclude', 'milvus_values', 'cloud_pages'], ['schema_version', 'source', 'publish'])) {
    if ('schema_version' in value && value.schema_version !== 1) check.error(['schema_version'], 'Unsupported schema_version; expected 1')
    if ('source' in value && check.object(value.source, ['source'], ['dir'], ['dir'])) {
      if ('dir' in value.source && check.string(value.source.dir, ['source', 'dir']) && !isRepositoryPath(value.source.dir)) {
        check.error(['source', 'dir'], 'source.dir must be a repository-relative path without traversal')
      }
    }
    if ('publish' in value && check.object(value.publish, ['publish'], ['manual'], ['manual'])) {
      if ('manual' in value.publish && check.string(value.publish.manual, ['publish', 'manual'])
        && !context.manuals.includes(value.publish.manual)) {
        check.error(['publish', 'manual'], `Unknown manual: ${value.publish.manual}`, 'CONFIG_MANUAL_UNKNOWN')
      }
    }
    if ('exclude' in value && Array.isArray(value.exclude)) {
      value.exclude.forEach((entry, index) => {
        // A trailing slash names a module; strip it before the repository-path check.
        const candidate = typeof entry === 'string' && entry.endsWith('/') ? entry.slice(0, -1) : entry
        if (check.string(entry, ['exclude', index]) && !isRepositoryPath((candidate as string).trim())) {
          check.error(['exclude', index], 'exclude entries must be repository-relative paths without traversal')
        }
      })
    } else if ('exclude' in value) check.error(['exclude'], 'exclude must be an array')
    if ('milvus_values' in value && check.object(value.milvus_values, ['milvus_values'], Object.keys((value.milvus_values as Record<string, unknown>) ?? {}), [])) {
      const values = value.milvus_values as Record<string, unknown>
      for (const [key, entry] of Object.entries(values)) {
        if (!check.string(entry, ['milvus_values', key])) continue
        const variable = context.variables?.[key]
        if (typeof variable !== 'string' || !variable.trim()) {
          check.error(['milvus_values', key], `Variables.json must define a nonempty string value for ${key}`, 'CONFIG_MILVUS_VALUES_INVALID')
        }
      }
      checkMilvusValueConflicts(check, values)
    }
    if ('cloud_pages' in value && check.object(value.cloud_pages, ['cloud_pages'],
      Object.keys((value.cloud_pages as Record<string, unknown>) ?? {}), [])) {
      for (const [logical, entry] of Object.entries(value.cloud_pages as Record<string, unknown>)) {
        if (!logical.endsWith('.md') || !isRepositoryPath(logical)) {
          check.error(['cloud_pages', logical, '$key'], 'cloud_pages keys must be .md page paths relative to source.dir')
          continue
        }
        if (!check.object(entry, ['cloud_pages', logical], ['file', 'channel'], ['file'])) continue
        const record = entry as Record<string, unknown>
        if (check.string(record.file, ['cloud_pages', logical, 'file']) && !isRepositoryPath(record.file.trim())) {
          check.error(['cloud_pages', logical, 'file'], 'cloud_pages file must be a repository-relative path without traversal')
        }
        if ('channel' in record) {
          if (!CLOUD_CHANNEL_VALUES.includes(record.channel as ManualCloudChannel)) {
            check.error(['cloud_pages', logical, 'channel'], `channel must be one of ${CLOUD_CHANNEL_VALUES.join(', ')}`, 'CONFIG_CHANNEL_UNSUPPORTED')
          }
        }
      }
    }
    if ('metadata' in value && check.object(value.metadata, ['metadata'],
      Object.keys((value.metadata as Record<string, unknown>) ?? {}), [])) {
      for (const key of Object.keys(value.metadata as Record<string, unknown>)) {
        const entry = (value.metadata as Record<string, unknown>)[key]
        const isModule = key.endsWith('/')
        const isPage = key.endsWith('.md')
        if (!isModule && !isPage) {
          check.error(['metadata', key, '$key'], 'Metadata keys must name a module (trailing /) or a page (.md) relative to source.dir')
          continue
        }
        if (!isRepositoryPath(isModule ? key.slice(0, -1) : key)) {
          check.error(['metadata', key, '$key'], `Metadata key must be relative to source.dir without traversal: ${key}`)
          continue
        }
        // check.object already reports module keys outside beta as unknown fields.
        if (check.object(entry, ['metadata', key], isModule ? MODULE_METADATA_FIELDS : PAGE_METADATA_FIELDS, [])) {
          if ('beta' in (entry as Record<string, unknown>)) checkBeta(check, entry as Record<string, unknown>, ['metadata', key, 'beta'], context.betaValues)
          const record = entry as Record<string, unknown>
          for (const field of ['added_since', 'description', 'last_modified', 'type', 'token'] as const) {
            if (field in record) check.string(record[field], ['metadata', key, field])
          }
          if ('deprecate_since' in record && record.deprecate_since !== false) check.string(record.deprecate_since, ['metadata', key, 'deprecate_since'])
          if ('notebook' in record && typeof record.notebook !== 'boolean') check.error(['metadata', key, 'notebook'], 'notebook must be a boolean')
          if ('sidebar_position' in record && (typeof record.sidebar_position !== 'number' || !Number.isInteger(record.sidebar_position))) {
            check.error(['metadata', key, 'sidebar_position'], 'sidebar_position must be an integer')
          }
          if ('keywords' in record) {
            if (!Array.isArray(record.keywords) || !record.keywords.length || record.keywords.some((item: unknown) => typeof item !== 'string' || !item.trim())) {
              check.error(['metadata', key, 'keywords'], 'keywords must be a nonempty list of nonempty strings')
            }
          }
        }
      }
    }
  }
  return check.errors.length ? { errors: check.errors } : { config: value as unknown as ManualConfig }
}
