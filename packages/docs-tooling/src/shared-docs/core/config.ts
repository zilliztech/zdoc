import type { ConfigResult, DiagnosticContext, PageConfig, PageConfigContext, SourceConfig } from './types'
import { ConfigValidation, diagnostic, isBranchName, isRepositoryPath, parseYaml } from './yaml'

export function parseSourceConfig(text: string, context: DiagnosticContext = {}): ConfigResult<SourceConfig> {
  const location = { file: 'source.yaml', channel: 'both' as const, ...context }
  const parsed = parseYaml(text, 'CONFIG_SYNTAX_INVALID', location)
  if ('errors' in parsed) return parsed
  const check = new ConfigValidation(parsed.document, location)
  const value = parsed.document.value
  if (check.object(value, [], ['schema_version', 'repository', 'track'], ['schema_version', 'repository', 'track'])) {
    if ('schema_version' in value && value.schema_version !== 1) check.error(['schema_version'], 'Unsupported schema_version; expected 1')
    if ('repository' in value) check.string(value.repository, ['repository'])
    if ('track' in value && check.string(value.track, ['track']) && !isBranchName(value.track)) {
      check.error(['track'], 'track must name a Git branch')
    }
  }
  return check.errors.length ? { errors: check.errors } : { config: value as SourceConfig }
}

export function parsePageConfig(pageId: string, text: string, context: PageConfigContext): ConfigResult<PageConfig> {
  const location = { file: context.file ?? `shared-docs/pages/${pageId}/page.yaml`, page: pageId,
    channel: context.channel ?? 'both' as const }
  const idErrors = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pageId) ? []
    : [diagnostic('CONFIG_PAGE_ID_INVALID', 'Page ID must be a lowercase slug', location)]
  const parsed = parseYaml(text, 'CONFIG_SYNTAX_INVALID', location)
  if ('errors' in parsed) return { errors: [...idErrors, ...parsed.errors] }
  const check = new ConfigValidation(parsed.document, location)
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
    if ('metadata' in value && check.object(value.metadata, ['metadata'], ['title', 'description', 'beta'])) {
      for (const key of ['title', 'description']) {
        if (key in value.metadata) check.string(value.metadata[key], ['metadata', key])
      }
      if ('beta' in value.metadata) {
        // YAML's FALSE scalar is boolean false; both spellings denote the no-tag value.
        const beta = value.metadata.beta === false ? 'FALSE' : value.metadata.beta
        if (typeof beta !== 'string' || beta === 'BYOC' || (beta !== 'FALSE' && !context.betaValues.includes(beta))) {
          check.error(['metadata', 'beta'], 'beta must be FALSE or a supported heading tag other than BYOC', 'CONFIG_BETA_INVALID')
        } else value.metadata.beta = beta
      }
    }
    if ('transforms' in value && !Array.isArray(value.transforms)) check.error(['transforms'], 'transforms must be a list')
  }
  return check.errors.length ? { errors: check.errors } : { config: value as unknown as PageConfig }
}
