import { basename, isAbsolute, relative, resolve, sep } from 'node:path'
import type { SharedDocsError } from '../core/types'

interface GroupContext { root: string; path: string; file(file: string): string }

/** Join diagnostic locations without turning an empty group prefix into a root path. */
export function groupFile(groupPath: string | undefined, file: string): string {
  const prefix = groupPath ?? 'shared-docs/guides'
  return prefix ? `${prefix}/${file}` : file
}

/** Validate the lexical group before any input/output or Git access. */
export function groupContext(directory: string, repositoryRoot = process.cwd()): GroupContext | { errors: SharedDocsError[] } {
  const root = resolve(repositoryRoot, directory)
  const repositoryPath = relative(repositoryRoot, root)
  const outside = repositoryPath === '..' || repositoryPath.startsWith(`..${sep}`) || isAbsolute(repositoryPath)
  const path = (outside ? root : repositoryPath).split(sep).join('/')
  if (basename(root) !== 'guides') return { errors: [{ code: 'CONFIG_FIELD_MISSING',
    message: 'Only the guides group is supported; --shared-docs must select its group directory',
    file: path, line: 1, channel: 'both' as const }] }
  return { root, path, file: (file: string) => groupFile(path, file) }
}
