import {parseYaml} from '../yaml'
import {isMilvusFilename} from './map'

/** Shared with WP5's target lookup; invalid or deprecated IDs are not public targets. */
export function milvusPageMetadata(path: string, content: string): { id: string; title: string } | undefined {
  const front = /^---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/.exec(content)
  if (!front) return undefined
  const parsed = parseYaml(front[1], 'LINK_TARGET_ABSENT', { file: path })
  if ('errors' in parsed) return undefined
  const meta = parsed.document.value as { id?: unknown; title?: unknown; deprecate?: unknown } | null
  if (!meta || typeof meta.id !== 'string' || !isMilvusFilename(meta.id) || meta.deprecate) return undefined
  return { id: meta.id, title: typeof meta.title === 'string' ? meta.title : '' }
}
