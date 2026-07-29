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

export interface SourceSnapshot {
  records: SourceSnapshotRecord[]
}

export interface RevisionInventoryRecord {
  canonicalToken: string
  title: string
  contentPath: string | null
  objectToken: string | null
  parentToken: string | null
  revisionId: string | null
  objectEditTime: string | null
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
  snapshots: SourceSnapshot[]
}

export type RevisionDiffClassification =
  | 'created'
  | 'updated'
  | 'moved'
  | 'renamed'
  | 'deleted'
  | 'fetch_failed'

export interface RevisionChange {
  type: RevisionDiffClassification
  canonicalToken: string
  title: string
  previousRevisionId: string | null
  revisionId: string | null
  objectEditTime: string | null
  contentPath: string | null
}

const optionalString = (value: unknown): string | undefined =>
  value === null || value === undefined || value === '' ? undefined : String(value)

const compareTokens = (left: string, right: string): number => left < right ? -1 : left > right ? 1 : 0

export function buildRevisionInventory(input: BuildRevisionInventoryInput): RevisionInventory {
  const projected = input.snapshots.flatMap(snapshot => snapshot.records).map(record => {
    const canonicalToken = optionalString(record.doc_token)
    if (!canonicalToken) throw new Error('Source snapshot record is missing doc_token')
    const metadata = record.node_metadata
    return {
      canonicalToken,
      title: optionalString(record.title) ?? canonicalToken,
      contentPath: record.output_paths?.slice().sort()[0] ?? null,
      objectToken: optionalString(metadata?.obj_token) ?? null,
      parentToken: optionalString(metadata?.parent_node_token) ?? null,
      revisionId: optionalString(metadata?.revision_id) ?? null,
      objectEditTime: optionalString(metadata?.obj_edit_time) ?? null,
      fetchError: optionalString(metadata?.fetch_error),
    }
  }).sort((a, b) => compareTokens(a.canonicalToken, b.canonicalToken))

  const records = projected.filter((record, index) => {
    const previous = projected[index - 1]
    if (!previous || previous.canonicalToken !== record.canonicalToken) return true
    if (JSON.stringify(previous) !== JSON.stringify(record)) {
      throw new Error(`Conflicting duplicate canonical token: ${record.canonicalToken}`)
    }
    return false
  })

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

export function validateRevisionInventory(value: unknown): value is RevisionInventory {
  if (!isObject(value)) throw new Error('Revision inventory must be an object')
  rejectUnknownKeys(value, ['schemaVersion', 'group', 'complete', 'generatedAt', 'sourceRunId', 'records'], 'inventory')
  if (value.schemaVersion !== 1) throw new Error(`Unsupported inventory schema version: ${String(value.schemaVersion)}`)
  if (typeof value.group !== 'string' || !REVISION_GROUPS.includes(value.group as RevisionGroup)) {
    throw new Error(`Unsupported inventory group: ${String(value.group)}`)
  }
  if (typeof value.complete !== 'boolean') throw new Error('Inventory complete must be a boolean')
  if (typeof value.generatedAt !== 'string') throw new Error('Inventory generatedAt must be a string')
  if (typeof value.sourceRunId !== 'string') throw new Error('Inventory sourceRunId must be a string')
  if (!Array.isArray(value.records)) throw new Error('Inventory records must be an array')

  let previous: string | undefined
  for (const [index, record] of value.records.entries()) {
    if (!isObject(record)) throw new Error(`Inventory record ${index} must be an object`)
    rejectUnknownKeys(record, [
      'canonicalToken', 'title', 'contentPath', 'objectToken', 'parentToken',
      'revisionId', 'objectEditTime', 'fetchError',
    ], `inventory record ${index}`)
    if (typeof record.canonicalToken !== 'string' || !record.canonicalToken) {
      throw new Error('Inventory record is missing canonical token')
    }
    if (typeof record.title !== 'string') throw new Error(`Inventory record ${index} title must be a string`)
    for (const field of ['contentPath', 'objectToken', 'parentToken', 'revisionId', 'objectEditTime'] as const) {
      if (record[field] !== null && typeof record[field] !== 'string') {
        throw new Error(`Inventory record ${index} ${field} must be a string or null`)
      }
    }
    if (record.fetchError !== undefined && typeof record.fetchError !== 'string') {
      throw new Error(`Inventory record ${index} fetchError must be a string`)
    }
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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function rejectUnknownKeys(value: Record<string, unknown>, allowed: readonly string[], label: string): void {
  const unknown = Object.keys(value).find(key => !allowed.includes(key))
  if (unknown) throw new Error(`Unknown ${label} field: ${unknown}`)
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
  baseline: RevisionInventory | null,
  candidate: RevisionInventory,
): RevisionChange[] {
  if (baseline) validateRevisionInventory(baseline)
  validateRevisionInventory(candidate)
  if (baseline && baseline.group !== candidate.group) throw new Error('Cannot diff inventories from different groups')

  const before = new Map((baseline?.records ?? []).map(record => [record.canonicalToken, record]))
  const after = new Map(candidate.records.map(record => [record.canonicalToken, record]))
  const missing = (baseline?.records ?? []).filter(record => !after.has(record.canonicalToken))
  if (!candidate.complete && missing.length > 0) {
    throw new Error('Incomplete candidate inventory cannot be used to infer deletion')
  }

  const changes: RevisionChange[] = []
  for (const record of candidate.records) {
    const prior = before.get(record.canonicalToken)
    if (record.fetchError) {
      changes.push(change('fetch_failed', record, prior))
    } else if (!prior) {
      changes.push(change('created', record))
    } else if (record.revisionId !== prior.revisionId) {
      changes.push(change('updated', record, prior))
    } else if (record.parentToken !== prior.parentToken) {
      changes.push(change('moved', record, prior))
    } else if (record.title !== prior.title) {
      changes.push(change('renamed', record, prior))
    }
  }
  if (candidate.complete) {
    for (const record of missing) changes.push(change('deleted', record, record, true))
  }
  return changes.sort((a, b) => compareTokens(a.canonicalToken, b.canonicalToken))
}

function change(
  type: RevisionDiffClassification,
  record: RevisionInventoryRecord,
  prior?: RevisionInventoryRecord,
  deleted = false,
): RevisionChange {
  return {
    type,
    canonicalToken: record.canonicalToken,
    title: record.title,
    previousRevisionId: prior?.revisionId ?? null,
    revisionId: deleted ? null : record.revisionId,
    objectEditTime: record.objectEditTime,
    contentPath: record.contentPath,
  }
}

export function editedToday<T extends RevisionInventoryRecord>(
  records: T[],
  now: Date,
  timeZone = 'Asia/Shanghai',
): T[] {
  const day = dateKey(now, timeZone)
  return records.filter(record => {
    if (!record.objectEditTime) return false
    const seconds = Number(record.objectEditTime)
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

export function renderRevisionDiffMarkdown(group: RevisionGroup, changes: RevisionChange[]): string {
  const rank = new Map(MARKDOWN_ORDER.map((type, index) => [type, index]))
  const sorted = changes.slice().sort((left, right) =>
    (rank.get(left.type) ?? Number.MAX_SAFE_INTEGER) - (rank.get(right.type) ?? Number.MAX_SAFE_INTEGER)
      || compareTokens(left.canonicalToken, right.canonicalToken))
  const lines = [
    `# ${group} Feishu revision changes`,
    '',
    '| Change | Title | Previous revision | Revision | Edit time | Content path | Token |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ]
  for (const entry of sorted) {
    lines.push(`| ${entry.type} | ${markdownCell(entry.title)} | ${markdownCell(entry.previousRevisionId)} | ${markdownCell(entry.revisionId)} | ${markdownCell(entry.objectEditTime)} | ${markdownCell(entry.contentPath)} | \`${markdownCell(entry.canonicalToken)}\` |`)
  }
  return `${lines.join('\n')}\n`
}

function markdownCell(value: string | null | undefined): string {
  return (value ?? '').replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ')
}
