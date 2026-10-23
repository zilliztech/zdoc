import type { DiagnosticContext } from '../types'
import { diagnostic, parseYaml } from '../yaml'
import type { LinkMap } from './types'

export const isMilvusFilename = (value: string): boolean => /^[^/\\:#?\s]+\.md$/.test(value) && !value.startsWith('.')
export function isMilvusUrl(value: string): boolean {
  try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === 'milvus.io' && !url.username && !url.password && !url.port }
  catch { return false }
}
export function parseLinkMap(yamlText: string, context: DiagnosticContext):
  { map: LinkMap } | { errors: ReturnType<typeof diagnostic>[] } {
  const parsed = parseYaml(yamlText, 'LINK_MAP_INVALID', context)
  if ('errors' in parsed) return parsed
  const { document } = parsed
  const value = document.value
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { errors: [diagnostic('LINK_MAP_INVALID', 'The link map must be a YAML mapping.', context)] }
  }
  const map = new Map<string, string>()
  const errors: ReturnType<typeof diagnostic>[] = []
  for (const [key, destination] of Object.entries(value)) {
    if (!isMilvusFilename(key)) errors.push(diagnostic('LINK_MAP_INVALID', 'A link-map key must be a bare .md filename.', context, document.line([key, '$key'])))
    if (typeof destination !== 'string' || !(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(destination) || isMilvusUrl(destination))) {
      errors.push(diagnostic('LINK_MAP_INVALID', 'A destination must be a Cloud slug or an https://milvus.io/ URL.', context, document.line([key])))
    } else map.set(key, destination)
  }
  return errors.length ? { errors } : { map }
}
export type LinkKind = 'anchor' | 'external' | 'milvus-url' | 'page' | 'root' | 'unknown'
export function classifyLink(url: string): LinkKind {
  if (url.startsWith('#')) return 'anchor'
  if (url.startsWith('/')) return 'root'
  if (isMilvusUrl(url)) return 'milvus-url'
  if (/^(?:https?:\/\/|mailto:)/i.test(url)) {
    try { new URL(url); return 'external' } catch { return 'unknown' }
  }
  if (isMilvusFilename(url.split('#')[0])) return 'page'
  return 'unknown'
}
