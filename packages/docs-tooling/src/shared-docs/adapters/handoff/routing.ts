import {execFileSync} from 'node:child_process'
import {lstatSync, readFileSync} from 'node:fs'
import {resolve, join} from 'node:path'
import {classifySourceRoute, sharedReceiptPath, validateActiveState, validateSharedPageIdentity, validateSharedReceipt,
  type ActiveState, type SharedPageIdentity, type SourceRoute} from '../../core/handoff/source-state'

export interface RoutingRecord {record_id: string; placement_type: string; doc_link: string}
export interface RoutingContext {
  availablePages: readonly string[]
  routesByRecordId: Map<string, SourceRoute>
  inspectedDocsByRecordId: Map<string, string>
  activeRecordIds: ReadonlySet<string>
  sharedInputsByRecordId: Map<string, SharedPageIdentity>
  aliasesByToken: Map<string, string>
  errors: {record_id: string; code: string; message: string}[]
}
export function createRoutingContext(input: {
  records: RoutingRecord[]; availablePages?: readonly string[]; active?: ActiveState | null
  sharedInputsByRecordId?: Map<string, SharedPageIdentity>
  previousSnapshot?: {records?: {record_id: string; doc_token?: string | null; node_token?: string | null; origin_node_token?: string | null; obj_token?: string | null}[]}
}): RoutingContext {
  const active = input.active == null ? null : validateActiveState(input.active)
  const context: RoutingContext = {availablePages: [...(input.availablePages || [])], routesByRecordId: new Map(),
    sharedInputsByRecordId: new Map(), aliasesByToken: new Map(), errors: [],
    inspectedDocsByRecordId: new Map(), activeRecordIds: new Set((active?.pages || []).map(entry => entry.record))}
  const activeByRecord = new Map((active?.pages || []).map(entry => [entry.record, entry]))
  for (const record of input.records) {
    const activeEntry = activeByRecord.get(record.record_id)
    if (record.placement_type !== 'canonical' && !activeEntry) continue
    if (context.routesByRecordId.has(record.record_id)) throw new Error(`Duplicate canonical record ID: ${record.record_id}`)
    let route = classifySourceRoute(record.doc_link, context)
    const previous = activeByRecord.get(record.record_id)
    if (previous && route.kind === 'feishu') {
      throw Object.assign(new Error(`OWNERSHIP_REVERTED: activated record ${record.record_id} cannot return to Feishu`), {code: 'OWNERSHIP_REVERTED', record_id: record.record_id})
    }
    if (previous && route.kind === 'shared-page' && previous.page !== route.page) route = {kind: 'invalid', code: 'OWNERSHIP_CONFIG_MISSING', message: `Active page identity changed for ${record.record_id}`}
    context.routesByRecordId.set(record.record_id, route)
    context.inspectedDocsByRecordId.set(record.record_id, record.doc_link)
    if (route.kind === 'invalid') context.errors.push({record_id: record.record_id, code: route.code, message: route.message})
    if (route.kind === 'feishu') continue
    const identity = route.kind === 'shared-page' ? input.sharedInputsByRecordId?.get(record.record_id) : null
    if (identity && route.kind === 'shared-page') {
      validateSharedPageIdentity(identity)
      if (identity.group !== route.group || identity.page !== route.page) throw new Error(`Shared input route mismatch: ${record.record_id}`)
      context.sharedInputsByRecordId.set(record.record_id, {...identity})
    }
    const baseline = input.previousSnapshot?.records?.find(entry => entry.record_id === record.record_id)
    for (const token of [previous?.feishu_token, ...(previous?.feishu_aliases || []), baseline?.doc_token, baseline?.node_token, baseline?.origin_node_token, baseline?.obj_token].filter(Boolean) as string[]) {
      const owner = context.aliasesByToken.get(token)
      if (owner && owner !== record.record_id) throw new Error(`Conflicting shared alias: ${token}`)
      context.aliasesByToken.set(token, record.record_id)
    }
  }
  for (const [id, route] of context.routesByRecordId) if (route.kind === 'feishu') {
    const owner = context.aliasesByToken.get(route.token)
    if (owner && owner !== id) throw new Error(`Conflicting shared alias: ${route.token}`)
  }
  return context
}
/** Only the exact pinned Git tree proves a shared page exists; a dirty working tree never does. */
export function pinnedSharedPages(repositoryRoot: string, masterCommit: string, links: readonly string[]): string[] {
  if (typeof masterCommit !== 'string' || !/^[a-f0-9]{40}$/.test(masterCommit)) throw new Error('Pinned master commit must be a full Git SHA')
  const pages = new Set<string>()
  for (const link of links) {
    if (typeof link !== 'string') continue
    const match = /^https:\/\/github\.com\/zilliztech\/zdoc\/tree\/master\/shared-docs\/guides\/pages\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/.exec(link)
    if (!match) continue
    const page = match[1]
    try {
      const type = execFileSync('git', ['-C', repositoryRoot, 'cat-file', '-t', `${masterCommit}:shared-docs/guides/pages/${page}`], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim()
      if (type === 'tree') pages.add(`guides/${page}`)
    } catch { /* A missing directory is a page-local configuration error. */ }
  }
  return [...pages].sort()
}
export function readHandoffJson(root: string, relative: string): unknown {
  const target = resolve(root, relative)
  if (!target.startsWith(`${resolve(root)}/`) || relative.split('/').some(segment => !segment || segment === '..' || segment === '.') || relative.includes('\\')) throw new Error('Unsafe handoff path')
  let current = resolve(root)
  if (lstatSync(current).isSymbolicLink()) throw new Error('Handoff root must not be a symlink')
  for (const segment of relative.split('/')) {
    current = join(current, segment)
    if (lstatSync(current).isSymbolicLink()) throw new Error(`Handoff path must not use symlinks: ${relative}`)
  }
  if (!lstatSync(target).isFile()) throw new Error(`Handoff file must be regular: ${relative}`)
  return JSON.parse(readFileSync(target, 'utf8'))
}
export function readActiveState(root: string, group = 'guides'): ActiveState | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(group)) throw new Error('Invalid shared group')
  const relative = `generated/en/manifests/shared-pages/${group}/active.json`
  let current = resolve(root)
  if (lstatSync(current).isSymbolicLink()) throw new Error('Handoff root must not be a symlink')
  for (const segment of relative.split('/')) {
    current = join(current, segment)
    try {
      if (lstatSync(current).isSymbolicLink()) throw new Error(`Handoff path must not use symlinks: ${relative}`)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
      throw error
    }
  }
  return validateActiveState(readHandoffJson(root, relative))
}
export function readSharedReceipt(root: string, identity: SharedPageIdentity) {
  validateSharedPageIdentity(identity)
  return validateSharedReceipt(readHandoffJson(root, identity.record), identity)
}
