import { basename, isAbsolute, relative, resolve, sep } from 'node:path'
import { SHARED_DOC_GROUPS } from '../core/groups'
import type { SharedDocsError } from '../core/types'

interface GroupContext { root: string; path: string; name: string; file(file: string): string }

/** Join diagnostic locations without turning an empty group prefix into a root path. */
export function groupFile(groupPath: string | undefined, file: string): string {
  const prefix = groupPath ?? 'shared-docs/guides'
  return prefix ? `${prefix}/${file}` : file
}

/** Group directories the engine currently accepts; each maps to one shared-docs manual. */
export const SUPPORTED_GROUPS = new Set(SHARED_DOC_GROUPS)

/** The manuals a per-page group may publish into, keyed by the group's directory name.
 * The guides group keeps both site manuals; every other group publishes into the
 * same-named manual only. Take the name from GroupContext.name: an empty group prefix
 * (the repository root itself selected) has no basename to re-derive. */
export function groupManuals(groupName: string): string[] {
  return groupName === 'guides' ? ['guides', 'guides-byoc'] : [groupName]
}

/** Validate the lexical group before any input/output or Git access. */
export function groupContext(directory: string, repositoryRoot = process.cwd()): GroupContext | { errors: SharedDocsError[] } {
  const root = resolve(repositoryRoot, directory)
  const repositoryPath = relative(repositoryRoot, root)
  const outside = repositoryPath === '..' || repositoryPath.startsWith(`..${sep}`) || isAbsolute(repositoryPath)
  const path = (outside ? root : repositoryPath).split(sep).join('/')
  const name = basename(root)
  if (!SUPPORTED_GROUPS.has(name)) return { errors: [{ code: 'CONFIG_FIELD_MISSING',
    message: 'Only the guides, node, and rust groups are supported; --shared-docs must select its group directory',
    file: path, line: 1, channel: 'both' as const }] }
  return { root, path, name, file: (file: string) => groupFile(path, file) }
}
