import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { GuidesBase, GuidesRecord } from './types'

export const guidesSnapshotPath = 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'

/** Normalize the retained snapshot; publication paths and product targets are not routing inputs. */
export function normalizeGuidesSnapshot(text: string): GuidesRecord[] {
  const snapshot: unknown = JSON.parse(text)
  if (!snapshot || typeof snapshot !== 'object' || !Array.isArray((snapshot as { records?: unknown }).records)) {
    throw new Error('Guides snapshot must contain a records array')
  }
  return (snapshot as { records: unknown[] }).records.map((entry, index) => {
    if (!entry || typeof entry !== 'object') throw new Error(`Invalid Guides snapshot record ${index}`)
    const record = entry as Record<string, unknown>
    if (typeof record.record_id !== 'string' || typeof record.slug !== 'string' || typeof record.placement_type !== 'string') {
      throw new Error(`Invalid Guides snapshot record ${index}: record_id, slug and placement_type are required`)
    }
    const channel = typeof record.release_channel === 'string' ? record.release_channel.toUpperCase() : undefined
    if (channel !== undefined && !['CURRENT', 'NEXT', 'RETIRE-IN-NEXT'].includes(channel)) {
      throw new Error(`Invalid Guides release_channel for ${record.slug}: ${channel}`)
    }
    const paths = record.output_paths
    if (paths !== undefined && (!paths || typeof paths !== 'object' || (Array.isArray(paths) && paths.length))) {
      throw new Error(`Invalid Guides output_paths for ${record.slug}`)
    }
    const targets = record.publish_targets ?? []
    if (!Array.isArray(targets) || targets.some(target => typeof target !== 'string')) {
      throw new Error(`Invalid Guides publish_targets for ${record.slug}`)
    }
    return { record_id: record.record_id, slug: record.slug, placement_type: record.placement_type,
      ...(channel === undefined ? {} : { release_channel: channel as GuidesRecord['release_channel'] }),
      publish_targets: [...targets] as string[], output_paths: Array.isArray(paths) || paths === undefined ? {} : { ...(paths as Record<string, string>) } }
  })
}

/** Read once per build and never expose mutable cached records. */
export function createGuidesSnapshot(checkout: string): GuidesBase {
  const records = readFile(join(checkout, guidesSnapshotPath), 'utf8').then(normalizeGuidesSnapshot)
  return { async getRecords() { return structuredClone(await records) } }
}
