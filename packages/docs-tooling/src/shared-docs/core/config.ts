import type { ConfigResult, DiagnosticContext, PageConfig, PageConfigContext, SourceConfig } from './types'
import { ConfigValidation, diagnostic, isBranchName, isRepositoryPath, parseYaml } from './yaml'
import { validateTransforms } from './transforms/schema'

export function parseSourceConfig(text: string, context: DiagnosticContext = {}, checkBudget = () => {}): ConfigResult<SourceConfig> {
  checkBudget()
  const location = { file: 'source.yaml', channel: 'both' as const, ...context }
  const parsed = parseYaml(text, 'CONFIG_SYNTAX_INVALID', location, checkBudget)
  if ('errors' in parsed) return parsed
  const check = new ConfigValidation(parsed.document, location, undefined, undefined, checkBudget)
  const value = parsed.document.value
  if (check.object(value, [], ['schema_version', 'repository', 'track', 'source_dir', 'presentation'], ['schema_version', 'repository', 'track'])) {
    if ('schema_version' in value && value.schema_version !== 1) check.error(['schema_version'], 'Unsupported schema_version; expected 1')
    if ('repository' in value) check.string(value.repository, ['repository'])
    if ('track' in value && check.string(value.track, ['track']) && !isBranchName(value.track)) {
      check.error(['track'], 'track must name a Git branch')
    }
    if ('source_dir' in value && check.string(value.source_dir, ['source_dir']) && !isRepositoryPath(value.source_dir)) {
      check.error(['source_dir'], 'source_dir must be a repository-relative path without traversal')
    }
    if ('presentation' in value) {
      const presentation = value.presentation
      const entries = presentation && typeof presentation === 'object' && !Array.isArray(presentation) ? Object.keys(presentation) : []
      if (check.object(presentation, ['presentation'], entries, [])) {
        for (const [manual, entry] of Object.entries(presentation as Record<string, unknown>)) {
          if (!check.object(entry, ['presentation', manual], ['title_suffix', 'slug_prefix', 'displayed_sidebar'], ['title_suffix'])) continue
          if ('title_suffix' in entry) check.string(entry.title_suffix, ['presentation', manual, 'title_suffix'])
          for (const key of ['slug_prefix', 'displayed_sidebar'] as const) {
            if (key in entry) check.string(entry[key], ['presentation', manual, key])
          }
        }
      }
    }
  }
  checkBudget()
  return check.errors.length ? { errors: check.errors } : { config: value as SourceConfig }
}

export function parsePageConfig(pageId: string, text: string, context: PageConfigContext, checkBudget = () => {}): ConfigResult<PageConfig> {
  checkBudget()
  const location = { file: context.file ?? `shared-docs/guides/pages/${pageId}/page.yaml`, page: pageId,
    channel: context.channel ?? 'both' as const }
  const idErrors = /^[A-Za-z0-9_]+(?:-[A-Za-z0-9_]+)*$/.test(pageId) ? []
    : [diagnostic('CONFIG_PAGE_ID_INVALID', 'Page ID must contain letters, numbers, underscores, and hyphens', location)]
  const parsed = parseYaml(text, 'CONFIG_SYNTAX_INVALID', location, checkBudget)
  if ('errors' in parsed) return { errors: [...idErrors, ...parsed.errors] }
  const check = new ConfigValidation(parsed.document, location, undefined, undefined, checkBudget)
  check.errors.push(...idErrors)
  const value = parsed.document.value
  if (check.object(value, [], ['schema_version', 'source', 'publish', 'metadata', 'transforms'], ['schema_version', 'source', 'publish'])) {
    if ('schema_version' in value && value.schema_version !== 1) check.error(['schema_version'], 'Unsupported schema_version; expected 1')
    if ('source' in value && check.object(value.source, ['source'], ['file'], ['file'])) {
      if ('file' in value.source && check.string(value.source.file, ['source', 'file']) && !isRepositoryPath(value.source.file)) {
        check.error(['source', 'file'], 'source.file must be a repository-relative path without traversal')
      }
    }
    if ('publish' in value) {
      if (!Array.isArray(value.publish) || value.publish.length === 0) check.error(['publish'], 'publish must be a nonempty list')
      else value.publish.forEach((target: unknown, index: number) => {
        const path = ['publish', index]
        if (!check.object(target, path, ['manual', 'path'], ['manual', 'path'])) return
        if ('manual' in target && check.string(target.manual, [...path, 'manual']) && !context.manuals.includes(target.manual)) {
          check.error([...path, 'manual'], `Unknown manual: ${target.manual}`, 'CONFIG_MANUAL_UNKNOWN')
        }
        if ('path' in target && check.string(target.path, [...path, 'path']) && !isRepositoryPath(target.path)) {
          check.error([...path, 'path'], 'Publish path must be relative to the manual, without traversal')
        }
      })
    }
    if ('metadata' in value && check.object(value.metadata, ['metadata'], ['title', 'description', 'beta', 'added_since', 'last_modified',
      'deprecate_since', 'notebook', 'type', 'token', 'sidebar_position', 'keywords'])) {
      for (const key of ['title', 'description', 'added_since', 'last_modified', 'type', 'token'] as const) {
        if (key in value.metadata) check.string(value.metadata[key], ['metadata', key])
      }
      if ('deprecate_since' in value.metadata && value.metadata.deprecate_since !== false) {
        check.string(value.metadata.deprecate_since, ['metadata', 'deprecate_since'])
      }
      if ('notebook' in value.metadata && typeof value.metadata.notebook !== 'boolean') {
        check.error(['metadata', 'notebook'], 'notebook must be a boolean')
      }
      if ('sidebar_position' in value.metadata && (typeof value.metadata.sidebar_position !== 'number' || !Number.isInteger(value.metadata.sidebar_position))) {
        check.error(['metadata', 'sidebar_position'], 'sidebar_position must be an integer')
      }
      if ('keywords' in value.metadata && (!Array.isArray(value.metadata.keywords) || !value.metadata.keywords.length
        || value.metadata.keywords.some((item: unknown) => typeof item !== 'string' || !item.trim()))) {
        check.error(['metadata', 'keywords'], 'keywords must be a nonempty list of nonempty strings')
      }
      if ('beta' in value.metadata) {
        // YAML's FALSE scalar is boolean false; both spellings denote the no-tag value.
        // The pages layout normalizes to the guides spelling; the manual layout feeds the
        // string `false` it validated itself, and both pass through unchanged.
        const beta = value.metadata.beta === false ? 'FALSE' : value.metadata.beta
        const untagged = beta === 'FALSE' || beta === 'false'
        if (typeof beta !== 'string' || beta === 'BYOC' || (!untagged && !context.betaValues.includes(beta))) {
          check.error(['metadata', 'beta'], 'beta must be FALSE or a supported heading tag other than BYOC', 'CONFIG_BETA_INVALID')
        } else value.metadata.beta = beta
      }
    }
    if ('transforms' in value && !Array.isArray(value.transforms)) check.error(['transforms'], 'transforms must be a list')
    else if (Array.isArray(value.transforms)) validateTransforms(value.transforms, check)
  }
  checkBudget()
  return check.errors.length ? { errors: check.errors } : { config: value as unknown as PageConfig }
}
