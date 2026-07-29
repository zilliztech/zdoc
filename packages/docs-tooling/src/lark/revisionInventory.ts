export const REVISION_GROUPS = ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest'] as const

export type RevisionGroup = typeof REVISION_GROUPS[number]

export interface SourceNodeMetadata {
  obj_token?: string | null
  parent_node_token?: string | null
  revision_id?: string | number | null
  obj_edit_time?: string | number | null
  fetch_error?: string | null
}

export interface SourceSnapshotRecord {
  doc_token?: string | null
  title?: string | null
  output_paths?: string[] | null
  node_metadata?: SourceNodeMetadata | null
}

export interface RevisionInventoryRecord {
  canonicalToken: string
  title?: string
  contentPath?: string
  objToken?: string
  parentNodeToken?: string
  revisionId?: string
  objEditTime?: string
  fetchError?: string
}

export interface RevisionInventory {
  schemaVersion: 1
  group: RevisionGroup
  complete: boolean
  generatedAt: string
  sourceRunId: string
  records: RevisionInventoryRecord[]
}

export interface BuildRevisionInventoryInput {
  group: RevisionGroup
  complete: boolean
  generatedAt: string
  sourceRunId: string
  snapshots: SourceSnapshotRecord[]
}

export type RevisionDiffClassification =
  | 'created'
  | 'updated'
  | 'moved'
  | 'renamed'
  | 'deleted'
  | 'fetch_failed'

export interface RevisionDiffEntry {
  classification: RevisionDiffClassification
  canonicalToken: string
  title?: string
}

const optionalString = (value: unknown): string | undefined =>
  value === null || value === undefined || value === '' ? undefined : String(value)

const compareTokens = (left: string, right: string): number => left < right ? -1 : left > right ? 1 : 0

export function buildRevisionInventory(input: BuildRevisionInventoryInput): RevisionInventory {
  const records = input.snapshots.map(snapshot => {
    const canonicalToken = optionalString(snapshot.doc_token)
    if (!canonicalToken) throw new Error('Source snapshot record is missing doc_token')
    const metadata = snapshot.node_metadata
    return {
      canonicalToken,
      title: optionalString(snapshot.title),
      contentPath: snapshot.output_paths?.slice().sort()[0],
      objToken: optionalString(metadata?.obj_token),
      parentNodeToken: optionalString(metadata?.parent_node_token),
      revisionId: optionalString(metadata?.revision_id),
      objEditTime: optionalString(metadata?.obj_edit_time),
      fetchError: optionalString(metadata?.fetch_error),
    }
  }).sort((a, b) => compareTokens(a.canonicalToken, b.canonicalToken))

  const result: RevisionInventory = {
    schemaVersion: 1,
    group: input.group,
    complete: input.complete,
    generatedAt: input.generatedAt,
    sourceRunId: input.sourceRunId,
    records,
  }
  validateRevisionInventory(result)
  return result
}

export function validateRevisionInventory(value: RevisionInventory): true {
  if (value.schemaVersion !== 1) throw new Error(`Unsupported inventory schema version: ${value.schemaVersion}`)
  if (!REVISION_GROUPS.includes(value.group)) throw new Error(`Unsupported inventory group: ${value.group}`)
  let previous: string | undefined
  for (const record of value.records) {
    if (!record.canonicalToken) throw new Error('Inventory record is missing canonical token')
    if (record.canonicalToken === previous) throw new Error(`Duplicate canonical token: ${record.canonicalToken}`)
    if (previous !== undefined && compareTokens(previous, record.canonicalToken) > 0) {
      throw new Error('Inventory records must be sorted by canonical token')
    }
    previous = record.canonicalToken
  }
  if (value.complete && value.records.some(record => record.fetchError)) {
    throw new Error('A complete inventory cannot contain fetch errors')
  }
  return true
}

export function serializeRevisionInventory(
  value: RevisionInventory,
  baseline?: {inventory: RevisionInventory; bytes: string},
): string {
  validateRevisionInventory(value)
  if (baseline) {
    validateRevisionInventory(baseline.inventory)
    const unchanged = value.group === baseline.inventory.group
      && value.complete === baseline.inventory.complete
      && JSON.stringify(value.records) === JSON.stringify(baseline.inventory.records)
    if (unchanged) return baseline.bytes
  }
  return `${JSON.stringify(value, null, 2)}\n`
}

export function diffRevisionInventories(
  baseline: RevisionInventory,
  candidate: RevisionInventory,
): RevisionDiffEntry[] {
  validateRevisionInventory(baseline)
  validateRevisionInventory(candidate)
  if (baseline.group !== candidate.group) throw new Error('Cannot diff inventories from different groups')

  const before = new Map(baseline.records.map(record => [record.canonicalToken, record]))
  const after = new Map(candidate.records.map(record => [record.canonicalToken, record]))
  const missing = baseline.records.filter(record => !after.has(record.canonicalToken))
  if (!candidate.complete && missing.length > 0) {
    throw new Error('Incomplete candidate inventory cannot be used to infer deletion')
  }

  const changes: RevisionDiffEntry[] = []
  for (const record of candidate.records) {
    const prior = before.get(record.canonicalToken)
    if (record.fetchError) {
      changes.push(change('fetch_failed', record))
    } else if (!prior) {
      changes.push(change('created', record))
    } else if (record.revisionId !== prior.revisionId) {
      changes.push(change('updated', record))
    } else if (record.parentNodeToken !== prior.parentNodeToken) {
      changes.push(change('moved', record))
    } else if (record.title !== prior.title) {
      changes.push(change('renamed', record))
    }
  }
  if (candidate.complete) {
    for (const record of missing) changes.push(change('deleted', record))
  }
  return changes.sort((a, b) => compareTokens(a.canonicalToken, b.canonicalToken))
}

function change(classification: RevisionDiffClassification, record: RevisionInventoryRecord): RevisionDiffEntry {
  return {classification, canonicalToken: record.canonicalToken, title: record.title}
}

export function editedToday<T extends RevisionInventoryRecord>(
  records: T[],
  now: Date,
  timeZone = 'Asia/Shanghai',
): T[] {
  const day = dateKey(now, timeZone)
  return records.filter(record => {
    if (!record.objEditTime) return false
    const seconds = Number(record.objEditTime)
    return Number.isFinite(seconds) && dateKey(new Date(seconds * 1000), timeZone) === day
  })
}

function dateKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

const MARKDOWN_ORDER: RevisionDiffClassification[] = [
  'created', 'updated', 'moved', 'renamed', 'deleted', 'fetch_failed',
]

export function renderRevisionDiffMarkdown(changes: RevisionDiffEntry[]): string {
  const lines = ['# Revision inventory diff']
  for (const classification of MARKDOWN_ORDER) {
    const entries = changes
      .filter(change => change.classification === classification)
      .sort((a, b) => compareTokens(a.canonicalToken, b.canonicalToken))
    if (entries.length === 0) continue
    const heading = classification.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')
    lines.push('', `## ${heading}`, '')
    for (const entry of entries) {
      lines.push(`- \`${entry.canonicalToken}\`${entry.title ? ` — ${entry.title}` : ''}`)
    }
  }
  return `${lines.join('\n')}\n`
}
