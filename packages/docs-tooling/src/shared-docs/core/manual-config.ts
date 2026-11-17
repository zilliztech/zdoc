import type { ConfigResult, DiagnosticContext, ManualConfig, SharedDocsError } from './types'
import { ConfigValidation, diagnostic, isRepositoryPath, parseYaml } from './yaml'

/** Manual-layout page metadata; the title always comes from the H1 heading. */
const PAGE_METADATA_FIELDS = ['beta', 'deprecate_since', 'added_since', 'description', 'last_modified', 'notebook', 'type', 'token', 'sidebar_position', 'keywords']
const MODULE_METADATA_FIELDS = ['beta']

function checkBeta(check: ConfigValidation, record: Record<string, unknown>, path: (string | number)[], betaValues: readonly string[]): void {
  // YAML's FALSE scalar is boolean false; both spellings denote the no-tag value.
  const beta = record.beta === false ? 'FALSE' : record.beta
  if (typeof beta !== 'string' || beta === 'BYOC' || (beta !== 'FALSE' && !betaValues.includes(beta))) {
    check.error(path, 'beta must be FALSE or a supported heading tag other than BYOC', 'CONFIG_BETA_INVALID')
  } else record.beta = beta
}

export function parseManualConfig(text: string, context: DiagnosticContext & { manuals: readonly string[]; betaValues: readonly string[] }): ConfigResult<ManualConfig> {
  const location = { file: 'manual.yaml', channel: 'both' as const, ...context }
  const parsed = parseYaml(text, 'CONFIG_SYNTAX_INVALID', location)
  if ('errors' in parsed) return parsed
  const check = new ConfigValidation(parsed.document, location)
  const value = parsed.document.value
  // exclude / milvus_values / cloud_pages / transforms are deliberately not accepted yet;
  // the manual layout only takes shape here and gains one semantic per follow-up package.
  if (check.object(value, [], ['schema_version', 'source', 'publish', 'metadata'], ['schema_version', 'source', 'publish'])) {
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
        if (check.object(entry, ['metadata', key], isModule ? MODULE_METADATA_FIELDS : PAGE_METADATA_FIELDS, [])) {
          if (isModule) {
            for (const field of Object.keys(entry as Record<string, unknown>)) {
              if (field !== 'beta') check.error(['metadata', key, field, '$key'], `Module metadata only supports beta: ${key}${field}`)
            }
          }
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
