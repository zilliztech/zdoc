/** Pure handoff validation. Filesystem, Git and Feishu access belong to adapters. */
export type SourceRoute =
  | {kind: 'feishu'; token: string; url: string}
  | {kind: 'shared-page'; group: string; page: string; directory: string; url: string}
  | {kind: 'invalid'; code: 'OWNERSHIP_CONFIG_MISSING' | 'OWNERSHIP_PATH_MISMATCH'; message: string}
export interface SharedPageIdentity {group: string; page: string; inputs_sha256: string; record: string}
export interface ActivePage {page: string; record: string; feishu_token: string | null; feishu_aliases?: string[]; anchors: Record<string, string>; activated_in: string}
export interface ActiveState {schema_version: 1; pages: ActivePage[]}
export interface SharedReceipt {
  schema_version: 1; page: string; token: string
  inputs: {
    milvus_docs: {repository: string; current: string; next: string; files: {path: string; current: string | null; next: string | null}[]}
    zdoc: {repository: string; commit: string; files: {path: string; sha256: string}[]}
    dev: {commit: string; files: {path: string; sha256: string}[]}
    'fetch': {navigation: string | {navigationRecords: Record<string, any>[]; tableDigests: Record<string, string>}; image_base_url: string; render_targets?: {schema_version: 1; targets: {manual: 'guides' | 'guides-byoc'; path: string; extension: '.md' | '.mdx'; navigation: {sidebar_label: string; sidebar_position: number}; channel: 'current' | 'next' | 'retire-in-next'}[]}}
    tools: {zdoc: string; md2md: string}
    images: {source: string; sha256: string; object: string}[]
  }
  outputs: {manual: string; path: string; sha256: string}[]
  channel: null | 'next' | 'retire-in-next'; notes: string[]
}
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const TOKEN = /^[A-Za-z0-9_-]+$/
const SHA = /^[a-f0-9]{64}$/
const COMMIT = /^[a-f0-9]{40}$/
function matches(value: unknown, pattern: RegExp): value is string { return typeof value === 'string' && pattern.test(value) }
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message) }
function object(value: unknown, label: string): asserts value is Record<string, any> {
  assert(value && typeof value === 'object' && !Array.isArray(value), `${label} must be an object`)
}
function keys(value: unknown, required: string[], label: string) {
  object(value, label)
  assert(Object.keys(value).every(key => required.includes(key)) && required.every(key => Object.hasOwn(value, key)), `${label} has missing or unknown fields`)
}
function text(value: unknown, label: string): asserts value is string { assert(typeof value === 'string' && value.length > 0 && !/[\0\r\n]/.test(value), `${label} must be a nonempty string`) }
export function safeHandoffPath(value: unknown): value is string {
  return typeof value === 'string' && !!value && !value.startsWith('/') && !/[\\\0\r\n]/.test(value)
    && value.split('/').every(part => !!part && part !== '.' && part !== '..')
}
export function sharedReceiptPath(group: string, page: string) {
  assert(matches(group, SLUG) && matches(page, SLUG), 'Invalid shared group/page')
  assert(page !== 'active', 'Shared page name active is reserved for activation metadata')
  return `generated/en/manifests/shared-pages/${group}/${page}.json`
}
export function classifySourceRoute(value: unknown, context: {availablePages?: readonly string[]} = {}): SourceRoute {
  const invalid: SourceRoute = {kind: 'invalid', code: 'OWNERSHIP_CONFIG_MISSING', message: 'Canonical Docs must select a valid Feishu document or an existing shared Guides page at pinned master'}
  if (typeof value !== 'string') return invalid
  // Match the original bytes: URL parsing would normalize traversal and encoded paths.
  const shared = /^https:\/\/github\.com\/zilliztech\/zdoc\/tree\/master\/shared-docs\/([a-z0-9]+(?:-[a-z0-9]+)*)\/pages\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/.exec(value)
  if (shared) {
    const [, group, page] = shared
    if (page === 'active') return {kind: 'invalid', code: 'OWNERSHIP_PATH_MISMATCH', message: 'Shared page name active is reserved for activation metadata'}
    return group === 'guides' && context.availablePages?.includes(`${group}/${page}`)
      ? {kind: 'shared-page', group, page, directory: `shared-docs/${group}/pages/${page}`, url: value} : invalid
  }
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    const match = /^\/(?:wiki|doc|docs|docx)\/([A-Za-z0-9_-]+)\/?$/.exec(url.pathname)
    if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && !url.port && match
      && /^(?:[a-z0-9-]+\.)*(?:feishu\.cn|larksuite\.com)$/.test(host)) {
      return {kind: 'feishu', token: match[1], url: value}
    }
  } catch { /* Invalid routes are page-local configuration failures. */ }
  return invalid
}
export function validateActiveState(value: unknown): ActiveState {
  keys(value, ['schema_version', 'pages'], 'Shared active state')
  const state = value as ActiveState
  assert(state.schema_version === 1 && Array.isArray(state.pages), 'Invalid shared active schema')
  const pages = new Set(), records = new Set(), aliases = new Set()
  for (const entry of state.pages) {
    keys(entry, ['page', 'record', 'feishu_token', 'anchors', 'activated_in', ...(Object.hasOwn(entry, 'feishu_aliases') ? ['feishu_aliases'] : [])], 'Shared active page')
    assert(matches(entry.page, SLUG), 'Invalid active page')
    text(entry.record, 'Active record'); text(entry.activated_in, 'Active run')
    assert(/^\d+$/.test(entry.activated_in), 'Active run must be a run ID')
    assert(entry.feishu_token === null || (typeof entry.feishu_token === 'string' && matches(entry.feishu_token, TOKEN)), 'Invalid active Feishu token')
    const tokens = Object.hasOwn(entry, 'feishu_aliases') ? entry.feishu_aliases : (entry.feishu_token ? [entry.feishu_token] : [])
    assert(Array.isArray(tokens) && tokens.every(token => matches(token, TOKEN) && !/^(?:base_|shared-)/.test(token)) && new Set(tokens).size === tokens.length, 'Invalid active Feishu aliases')
    assert(entry.feishu_token === null ? tokens.length === 0 : tokens.includes(entry.feishu_token), 'Active aliases must include primary token')
    assert(!pages.has(entry.page) && !records.has(entry.record) && tokens.every(token => !aliases.has(token)), 'Duplicate active authority')
    pages.add(entry.page); records.add(entry.record); tokens.forEach(token => aliases.add(token))
    object(entry.anchors, 'Active anchors')
    for (const [block, anchor] of Object.entries(entry.anchors)) {
      assert(matches(block, TOKEN) && typeof anchor === 'string' && !!anchor && !/[\s/#?\\\0]/.test(anchor) && anchor !== '.' && anchor !== '..', 'Invalid active anchor')
    }
  }
  return state
}
export function validateSharedPageIdentity(value: unknown): SharedPageIdentity {
  keys(value, ['group', 'page', 'inputs_sha256', 'record'], 'Shared page identity')
  const identity = value as SharedPageIdentity
  assert(identity.group === 'guides' && matches(identity.page, SLUG), 'Invalid shared page group/page')
  assert(matches(identity.inputs_sha256, SHA), 'Invalid shared input digest')
  assert(identity.record === sharedReceiptPath(identity.group, identity.page), 'Invalid shared receipt path')
  return identity
}
export function validateSharedSnapshotRecord<T>(value: T): T {
  object(value, 'Shared snapshot record')
  const record = value as Record<string, any>
  const allowed = ['record_id', 'table_id', 'table_name', 'placement_type', 'title', 'labels', 'slug', 'release_channel',
    'doc_token', 'doc_link', 'source_kind', 'shared_page', 'source_file', 'source_hash', 'node_metadata', 'output_paths',
    'publish_targets', 'publish_status', 'parent_record_ids', 'order', 'outgoing_tokens',
    'node_token', 'origin_node_token', 'obj_token', 'obj_type', 'obj_edit_time', 'revision_id']
  assert(Object.keys(record).every(key => allowed.includes(key)), 'Shared snapshot contains unknown fields or receipt data')
  text(record.record_id, 'Shared snapshot record ID')
  assert(record.source_kind === 'shared-page' && record.placement_type === 'canonical', 'Invalid shared snapshot discriminant')
  const identity = validateSharedPageIdentity(record.shared_page)
  const route = classifySourceRoute(record.doc_link, {availablePages: [`${identity.group}/${identity.page}`]})
  assert(route.kind === 'shared-page' && route.group === identity.group && route.page === identity.page, 'Shared snapshot route mismatch')
  for (const key of ['doc_token', 'source_file', 'source_hash', 'node_metadata']) assert(record[key] === null, `Shared snapshot ${key} must be null`)
  for (const key of ['node_token', 'origin_node_token', 'obj_token', 'obj_type', 'obj_edit_time', 'revision_id']) {
    assert(record[key] === undefined || record[key] === null, `Shared snapshot ${key} must not carry Feishu evidence`)
  }
  assert(Array.isArray(record.outgoing_tokens) && record.outgoing_tokens.length === 0, 'Shared outgoing tokens must be empty')
  return value
}
export function sharedSourceProjection(record: Record<string, any>) {
  validateSharedSnapshotRecord(record)
  return {source_kind: 'shared-page', shared_page: {...record.shared_page}}
}
export function validateSharedReceipt(value: unknown, expected: {group: string; page: string}): SharedReceipt {
  sharedReceiptPath(expected.group, expected.page)
  keys(value, ['schema_version', 'page', 'token', 'inputs', 'outputs', 'channel', 'notes'], 'Shared receipt')
  const receipt = value as SharedReceipt
  assert(receipt.schema_version === 1 && receipt.page === expected.page && receipt.token === `shared-${expected.page}`, 'Shared receipt identity mismatch')
  keys(receipt.inputs, ['milvus_docs', 'zdoc', 'dev', 'fetch', 'tools', 'images'], 'Shared receipt inputs')
  const {milvus_docs: upstream, zdoc, dev, 'fetch': fetchInputs, tools, images} = receipt.inputs
  keys(upstream, ['repository', 'current', 'next', 'files'], 'Shared upstream')
  assert(upstream.repository === 'milvus-io/milvus-docs' && matches(upstream.current, COMMIT) && matches(upstream.next, COMMIT), 'Invalid upstream commits/repository')
  const files = (entries: unknown, fields: string[], label: string) => {
    assert(Array.isArray(entries), `${label} must be an array`)
    const paths = new Set()
    for (const entry of entries) {
      keys(entry, ['path', ...fields], label)
      assert(safeHandoffPath(entry.path) && !paths.has(entry.path), `Invalid or duplicate ${label} path`)
      paths.add(entry.path)
      for (const field of fields) assert((fields.length > 1 && entry[field] === null) || matches(entry[field], SHA), `Invalid ${label} digest`)
      assert(fields.some(field => entry[field] !== null), `${label} requires a digest`)
    }
  }
  files(upstream.files, ['current', 'next'], 'Shared upstream files')
  keys(zdoc, ['repository', 'commit', 'files'], 'Shared zdoc input')
  assert(zdoc.repository === 'zilliztech/zdoc' && matches(zdoc.commit, COMMIT), 'Invalid zdoc commit/repository')
  files(zdoc.files, ['sha256'], 'Shared zdoc files')
  keys(dev, ['commit', 'files'], 'Shared dev input'); assert(matches(dev.commit, COMMIT), 'Invalid dev commit'); files(dev.files, ['sha256'], 'Shared dev files')
  keys(fetchInputs, ['navigation', 'image_base_url', ...(Object.hasOwn(fetchInputs, 'render_targets') ? ['render_targets'] : [])], 'Shared Fetch inputs')
  if (fetchInputs.render_targets !== undefined) {
    const projection = fetchInputs.render_targets
    keys(projection, ['schema_version', 'targets'], 'Shared render targets')
    assert(projection.schema_version === 1 && Array.isArray(projection.targets) && projection.targets.length === 2
      && Array.isArray(receipt.outputs) && receipt.outputs.length === 2, 'Invalid render target version or pair')
    const manuals = new Set<string>()
    for (const target of projection.targets) {
      keys(target, ['manual', 'path', 'extension', 'navigation', 'channel'], 'Shared render target')
      assert(['guides', 'guides-byoc'].includes(target.manual) && !manuals.has(target.manual), 'Invalid render target manual'); manuals.add(target.manual)
      assert(safeHandoffPath(target.path) && ['.md', '.mdx'].includes(target.extension), 'Invalid render target path/extension')
      keys(target.navigation, ['sidebar_label', 'sidebar_position'], 'Shared render navigation')
      text(target.navigation.sidebar_label, 'Render label')
      assert(Number.isSafeInteger(target.navigation.sidebar_position) && target.navigation.sidebar_position > 0, 'Invalid render position')
      assert(target.channel === (receipt.channel || 'current'), 'Render channel mismatch')
      const output = receipt.outputs?.find(output => output.manual === target.manual)
      assert(output?.path === `content/en/${target.manual === 'guides' ? 'guides' : 'byoc'}/${target.path}${target.extension}`, 'Render output path mismatch')
    }
  }
  if (typeof fetchInputs.navigation === 'string') assert(matches(fetchInputs.navigation, SHA), 'Invalid Fetch navigation digest')
  else {
    keys(fetchInputs.navigation, ['navigationRecords', 'tableDigests'], 'Shared permanent navigation')
    assert(Array.isArray(fetchInputs.navigation.navigationRecords), 'Invalid permanent navigation records')
    object(fetchInputs.navigation.tableDigests, 'Shared permanent table digests')
    const records = new Set()
    for (const row of fetchInputs.navigation.navigationRecords) {
      text(row.record_id, 'Navigation record'); text(row.table_id, 'Navigation table')
      assert(!records.has(row.record_id), 'Duplicate permanent navigation record'); records.add(row.record_id)
    }
  }
  assert(matches(fetchInputs.image_base_url, /^https?:\/\/[^\s]+$/), 'Invalid image base URL')
  keys(tools, ['zdoc', 'md2md'], 'Shared tools'); assert(matches(tools.zdoc, COMMIT), 'Invalid tooling commit'); text(tools.md2md, 'md2md version')
  assert(Array.isArray(images), 'Shared images must be an array')
  const sources = new Set()
  for (const image of images) {
    keys(image, ['source', 'sha256', 'object'], 'Shared image')
    text(image.source, 'Image source'); assert(matches(image.sha256, SHA) && !sources.has(image.source), 'Invalid or duplicate image digest/source'); sources.add(image.source)
    assert(typeof image.object === 'string' && (image.object.startsWith(`shared/${image.sha256}.`) && /^shared\/[a-f0-9]{64}\.[a-z0-9]+$/.test(image.object)
      || /^https?:\/\/[^\s]+$/.test(image.object)), 'Invalid shared image object')
  }
  assert(Array.isArray(receipt.outputs) && receipt.outputs.length > 0, 'Shared outputs must be nonempty')
  const manuals = new Set()
  for (const output of receipt.outputs) {
    keys(output, ['manual', 'path', 'sha256'], 'Shared output')
    assert(typeof output.manual === 'string' && matches(output.manual, SLUG) && !manuals.has(output.manual), 'Invalid or duplicate shared manual'); manuals.add(output.manual)
    assert(safeHandoffPath(output.path) && /\.mdx?$/.test(output.path) && matches(output.sha256, SHA), 'Invalid shared output path/digest')
  }
  assert(receipt.channel === null || ['next', 'retire-in-next'].includes(receipt.channel), 'Invalid shared channel')
  assert(Array.isArray(receipt.notes) && receipt.notes.every(note => typeof note === 'string'), 'Invalid shared notes')
  return receipt
}
