// @vitest-environment node
import { readFileSync } from 'node:fs'
import { it, expect } from 'vitest'
import { guidesBaseContract } from '../../adapters/contract/suites'
import { normalizeGuidesSnapshot } from '../../adapters/guides-snapshot'
import type { GuidesSnapshot } from '../../adapters/types'

const text = readFileSync(new URL('../../fixtures/guides-base.json', import.meta.url), 'utf8')
const snapshot = JSON.parse(text) as GuidesSnapshot
guidesBaseContract('normalized Guides snapshot', snapshot, () => ({ async getRecords() { return normalizeGuidesSnapshot(text) } }))

it('normalizes real snapshot product targets, empty output arrays and case-insensitive release channels', () => {
  const records = normalizeGuidesSnapshot(JSON.stringify({ records: ['current', 'NeXt', 'retire-in-next'].map((release_channel, index) => ({
    record_id: String(index), slug: `example-${index}`, title: 'Example', placement_type: 'canonical',
    publish_targets: ['Zilliz.SaaS'], output_paths: [], release_channel,
  })) }))
  expect(records.map(record => record.release_channel)).toEqual(['CURRENT', 'NEXT', 'RETIRE-IN-NEXT'])
  expect(records.every(record => record.publish_targets[0] === 'Zilliz.SaaS')).toBe(true)
  expect(records.map(record => record.output_paths)).toEqual([{}, {}, {}])
})
