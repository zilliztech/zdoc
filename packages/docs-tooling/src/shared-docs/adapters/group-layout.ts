import { lstat } from 'node:fs/promises'
import { join } from 'node:path'
import type { SharedDocsError } from '../core/types'

export type GroupLayout = { kind: 'pages' } | { kind: 'manual' } | { errors: SharedDocsError[] }

/** Which engine layout a group directory uses: per-page page.yaml files or one whole-manual manual.yaml. */
export async function readGroupLayout(root: string, path: string): Promise<GroupLayout> {
  let manual = false
  try {
    const stat = await lstat(join(root, 'manual.yaml'))
    if (stat.isSymbolicLink()) return { errors: [{ code: 'CONFIG_SYNTAX_INVALID', message: 'Symbolic link is not allowed: manual.yaml',
      file: `${path}/manual.yaml`, line: 1, channel: 'both' as const }] }
    if (!stat.isFile()) return { errors: [{ code: 'CONFIG_SYNTAX_INVALID', message: 'manual.yaml must be a regular file',
      file: `${path}/manual.yaml`, line: 1, channel: 'both' as const }] }
    manual = true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  if (!manual) return { kind: 'pages' }
  try { await lstat(join(root, 'pages')) } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    return { kind: 'manual' }
  }
  return { errors: [{ code: 'CONFIG_FIELD_UNKNOWN', message: 'A group cannot combine the pages and manual layouts; remove pages/ or manual.yaml',
    file: path, line: 1, channel: 'both' as const }] }
}
