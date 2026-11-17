/** Manual-level generation record (design 10, WP-R1): schema, generation and pure
 * validation. The record attests one whole-manual build — its inputs, the page set with
 * each page's whole-page channel, and every output byte digest — so a consumer can
 * authenticate the collection instead of trusting parseable JSON. Filesystem, Git and
 * image access belong to the caller; this module only hashes strings and checks shapes.
 * The sandbox build stages the record at `manifests/shared-manuals/<manual>.json`; the
 * production root is `generated/en/manifests/shared-manuals/<manual>.json` (R2 wiring). */
import { createHash } from 'node:crypto'
import type { SharedDocsError } from '../types'

export const MANUAL_RECORD_KIND = 'shared-manual'
export const MANUAL_RECORD_SCHEMA_VERSION = 1

const SHA = /^[a-f0-9]{64}$/
const COMMIT = /^[a-f0-9]{40}$/
const CHANNELS = ['current', 'next', 'retire-in-next'] as const
const SAFE_PATH = /^[A-Za-z0-9][A-Za-z0-9._-]*(?:\/[A-Za-z0-9][A-Za-z0-9._-]*)*$/

export type RecordChannel = (typeof CHANNELS)[number]
/** Where a page's bytes came from: an upstream file at one commit (null = both locked
 * commits; whole-manual upstream pages publish both channels through the merge), or a
 * Cloud-authored content/ file in this repository. */
export type ManualRecordSource =
  | { kind: 'upstream'; file: string; commit: string | null }
  | { kind: 'cloud'; file: string }
export interface ManualRecordPage {
  /** Path relative to source.dir; cloud pages use their manual.yaml logical path. */
  logical: string
  /** The page's stable token when one exists (metadata token or the derived default). */
  token?: string
  source: ManualRecordSource
  /** Whole-page release channel: `current` publishes to both channels. */
  channel: RecordChannel
  output: { path: string; sha256: string }
}
export interface SharedManualRecord {
  schema_version: typeof MANUAL_RECORD_SCHEMA_VERSION
  kind: typeof MANUAL_RECORD_KIND
  /** shared-docs group directory (e.g. `node`). */
  group: string
  /** Registered manual the pages publish into. */
  manual: string
  site: 'en'
  inputs: {
    upstream: { repository: string; dir: string; current: string; next: string }
    /** The fixed zdoc tooling commit this build ran at; configuration files pin the rest. */
    tools: { zdoc: string }
    config: { files: { path: string; sha256: string }[] }
    images: { source: string; sha256: string; address: string }[]
  }
  pages: ManualRecordPage[]
  /** Every written artifact: one entry per page output plus build sidecars (images.json). */
  outputs: { path: string; sha256: string }[]
}

export const sha256 = (text: string) => createHash('sha256').update(text, 'utf8').digest('hex')
/** Sandbox staging path; R2 maps it under generated/en/manifests/. */
export const manualRecordPath = (manual: string) => `manifests/shared-manuals/${manual}.json`

export interface ManualRecordInput {
  group: string
  manual: string
  upstream: { repository: string; dir: string; current: string; next: string }
  tools: { zdoc: string }
  config: { files: { path: string; text: string }[] }
  images: readonly { original: string; sha256: string; address: string }[]
  pages: readonly { logical: string; token?: string; source: ManualRecordSource; channel: RecordChannel; output: { path: string; mdx: string } }[]
  /** Sidecar artifacts beyond page outputs, e.g. the images manifest. */
  artifacts?: readonly { path: string; text: string }[]
}
const byPath = <T extends { path: string }>() => (a: T, b: T) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0
/** Hash the build's final bytes into the record. Ordering is canonical: config files,
 * images, pages and outputs are sorted by their path/identity so equal builds compare equal. */
export function buildManualRecord(input: ManualRecordInput): SharedManualRecord {
  const pages = [...input.pages].map(page => ({ logical: page.logical, ...(page.token !== undefined ? { token: page.token } : {}),
    source: page.source, channel: page.channel, output: { path: page.output.path, sha256: sha256(page.output.mdx) } }))
  const artifacts = (input.artifacts ?? []).map(artifact => ({ path: artifact.path, sha256: sha256(artifact.text) }))
  return {
    schema_version: MANUAL_RECORD_SCHEMA_VERSION,
    kind: MANUAL_RECORD_KIND,
    group: input.group,
    manual: input.manual,
    site: 'en',
    inputs: {
      upstream: { ...input.upstream },
      tools: { ...input.tools },
      config: { files: input.config.files.map(file => ({ path: file.path, sha256: sha256(file.text) })).sort(byPath()) },
      images: input.images.map(image => ({ source: image.original, sha256: image.sha256, address: image.address }))
        .sort((a, b) => a.source < b.source ? -1 : a.source > b.source ? 1 : 0),
    },
    pages: pages.sort((a, b) => a.logical < b.logical ? -1 : a.logical > b.logical ? 1 : 0),
    outputs: [...pages.map(page => page.output), ...artifacts].sort(byPath()),
  }
}

export interface ManualRecordExpectation {
  group: string
  manual: string
  upstream: { repository: string; dir: string; current: string; next: string }
  /** Configuration file digests the build must attest (manual.yaml, source.yaml, …). */
  config: { files: { path: string; sha256: string }[] }
  images: readonly { source: string; sha256: string; address: string }[]
  pages: readonly { logical: string; token?: string; source: ManualRecordSource; channel: RecordChannel; output: { path: string; sha256: string } }[]
  outputs: readonly { path: string; sha256: string }[]
}

const error = (message: string): SharedDocsError => ({ code: 'MANUAL_RECORD_INVALID', message, file: 'manifests/shared-manuals/<manual>.json', line: 1, channel: 'both' })
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.length > 0
/** object() only ever rejects with the result of error(), so callers rethrow it directly. */
function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw error(`${label} must be an object`)
  return value as Record<string, unknown>
}
/** True when the record carries exactly the expected keys; false means later field
 * comparisons would only produce noise, so the caller can stop early. */
function exactKeys(value: Record<string, unknown>, keys: readonly string[], label: string, errors: SharedDocsError[]): boolean {
  const actual = Object.keys(value).sort(), expected = [...keys].sort()
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    errors.push(error(`${label} has missing or unknown fields; expected ${expected.join(', ')}`))
    return false
  }
  return true
}
function textOr(value: unknown, label: string, fallback: string, errors: SharedDocsError[]): string {
  if (value === undefined) return fallback
  if (!nonempty(value)) { errors.push(error(`${label} must be a nonempty string`)); return fallback }
  return value
}
function digest(value: unknown, label: string, errors: SharedDocsError[]): string {
  if (typeof value !== 'string' || !SHA.test(value)) { errors.push(error(`${label} must be a lowercase sha-256 digest`)); return '' }
  return value
}
function commitOr(value: unknown, label: string, errors: SharedDocsError[]): string | null {
  if (value === null) return null
  if (typeof value !== 'string' || !COMMIT.test(value)) { errors.push(error(`${label} must be null or a complete lowercase commit SHA`)); return null }
  return value
}
/** Path/digest set equality: every expected file present once with the expected digest. */
function sameFiles(actual: unknown, expected: readonly { path: string; sha256: string }[], label: string, errors: SharedDocsError[]): void {  if (!Array.isArray(actual)) { errors.push(error(`${label} must be an array`)); return }
  const seen = new Map<string, string>()
  for (const [index, entry] of actual.entries()) {
    let item: Record<string, unknown>
    try { item = object(entry, `${label}[${index}]`) } catch (caught) { errors.push(caught as SharedDocsError); continue }
    if (!exactKeys(item, ['path', 'sha256'], `${label}[${index}]`, errors)) continue
    const path = textOr(item.path, `${label}[${index}].path`, '', errors)
    const sha = digest(item.sha256, `${label}[${index}].sha256`, errors)
    if (!nonempty(path) || !SAFE_PATH.test(path)) { errors.push(error(`${label}[${index}].path must be a repository-relative path`)); continue }
    if (seen.has(path)) { errors.push(error(`${label} lists ${path} more than once`)); continue }
    seen.set(path, sha)
  }
  const want = new Map(expected.map(file => [file.path, file.sha256]))
  for (const [path, sha] of want) {
    if (!seen.has(path)) errors.push(error(`${label} is missing ${path}`))
    else if (seen.get(path) !== sha) errors.push(error(`${label} digest mismatch for ${path}`))
  }
  for (const path of seen.keys()) if (!want.has(path)) errors.push(error(`${label} has an unexpected entry ${path}`))
}

/** Key-order-insensitive JSON comparison for untrusted record values. */
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>).sort()
      .map(key => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

/** Pure validation of an untrusted record against the expected build identity. Unknown
 * kinds or schema versions are rejected outright and never fall into another validator. */
export function validateManualRecord(value: unknown, expected: ManualRecordExpectation): SharedDocsError[] {
  const errors: SharedDocsError[] = []
  let record: Record<string, unknown>
  try { record = object(value, 'Record') } catch (caught) { return [caught as SharedDocsError] }
  const kind = textOr(record.kind, 'Record.kind', '', errors)
  if (record.schema_version !== MANUAL_RECORD_SCHEMA_VERSION) {
    errors.push(error(`Unsupported record schema_version: ${JSON.stringify(record.schema_version)}`))
  }
  if (kind !== MANUAL_RECORD_KIND) {
    errors.push(error(`Unknown record kind: ${JSON.stringify(record.kind)}; expected ${MANUAL_RECORD_KIND}`))
    return errors
  }
  if (!exactKeys(record, ['schema_version', 'kind', 'group', 'manual', 'site', 'inputs', 'pages', 'outputs'], 'Record', errors)) return errors
  if (textOr(record.group, 'Record.group', '', errors) !== expected.group) errors.push(error(`Record group ${JSON.stringify(record.group)} does not match ${expected.group}`))
  if (textOr(record.manual, 'Record.manual', '', errors) !== expected.manual) errors.push(error(`Record manual ${JSON.stringify(record.manual)} does not match ${expected.manual}`))
  if (textOr(record.site, 'Record.site', '', errors) !== 'en') errors.push(error('Record site must be en'))

  let inputs: Record<string, unknown>
  try { inputs = object(record.inputs, 'Record.inputs') } catch (caught) { errors.push(caught as SharedDocsError); inputs = {} }
  if (exactKeys(inputs, ['upstream', 'tools', 'config', 'images'], 'Record.inputs', errors)) {
    let upstream: Record<string, unknown>
    try { upstream = object(inputs.upstream, 'Record.inputs.upstream') } catch (caught) { errors.push(caught as SharedDocsError); upstream = {} }
    if (exactKeys(upstream, ['repository', 'dir', 'current', 'next'], 'Record.inputs.upstream', errors)) {
      for (const field of ['repository', 'dir'] as const) {
        if (textOr(upstream[field], `Record.inputs.upstream.${field}`, '', errors) !== expected.upstream[field]) {
          errors.push(error(`Record inputs.upstream.${field} ${JSON.stringify(upstream[field])} does not match ${expected.upstream[field]}`))
        }
      }
      for (const field of ['current', 'next'] as const) {
        // Unlike a page's source.commit, the attested lock commits are never null.
        if (typeof upstream[field] !== 'string' || !COMMIT.test(upstream[field])) {
          errors.push(error(`Record inputs.upstream.${field} must be a complete lowercase commit SHA`))
          continue
        }
        if (upstream[field] !== expected.upstream[field]) {
          errors.push(error(`Record inputs.upstream.${field} ${JSON.stringify(upstream[field])} does not match ${expected.upstream[field]}`))
        }
      }
    }
    let tools: Record<string, unknown>
    try { tools = object(inputs.tools, 'Record.inputs.tools') } catch (caught) { errors.push(caught as SharedDocsError); tools = {} }
    if (exactKeys(tools, ['zdoc'], 'Record.inputs.tools', errors)
      && (typeof tools.zdoc !== 'string' || !COMMIT.test(tools.zdoc))) {
      errors.push(error('Record inputs.tools.zdoc must be a complete lowercase commit SHA'))
    }
    let config: Record<string, unknown>
    try { config = object(inputs.config, 'Record.inputs.config') } catch (caught) { errors.push(caught as SharedDocsError); config = {} }
    if (exactKeys(config, ['files'], 'Record.inputs.config', errors)) sameFiles(config.files, expected.config.files, 'Record.inputs.config.files', errors)
    if (!Array.isArray(inputs.images)) errors.push(error('Record.inputs.images must be an array'))
    else {
      const seen = new Map<string, { sha256: string; address: string }>()
      for (const [index, entry] of inputs.images.entries()) {
        let image: Record<string, unknown>
        try { image = object(entry, `Record.inputs.images[${index}]`) } catch (caught) { errors.push(caught as SharedDocsError); continue }
        if (!exactKeys(image, ['source', 'sha256', 'address'], `Record.inputs.images[${index}]`, errors)) continue
        const source = textOr(image.source, `Record.inputs.images[${index}].source`, '', errors)
        const sha = digest(image.sha256, `Record.inputs.images[${index}].sha256`, errors)
        const address = textOr(image.address, `Record.inputs.images[${index}].address`, '', errors)
        if (!nonempty(source) || !nonempty(address)) continue
        if (seen.has(source)) { errors.push(error(`Record.inputs.images lists ${source} more than once`)); continue }
        seen.set(source, { sha256: sha, address })
      }
      const want = new Map(expected.images.map(image => [image.source, image]))
      for (const [source, observed] of want) {
        const got = seen.get(source)
        if (!got) errors.push(error(`Record.inputs.images is missing ${source}`))
        else if (got.sha256 !== observed.sha256 || got.address !== observed.address) errors.push(error(`Record.inputs.images mismatch for ${source}`))
      }
      for (const source of seen.keys()) if (!want.has(source)) errors.push(error(`Record.inputs.images has an unexpected entry ${source}`))
    }
  }

  const pages = Array.isArray(record.pages) ? record.pages : (errors.push(error('Record.pages must be an array')), undefined)
  const declared = new Map<string, string>()
  if (pages) {
    const actualPages = new Map<string, Record<string, unknown>>()
    const logicals = new Set<string>(), tokens = new Set<string>()
    for (const [index, entry] of pages.entries()) {
      let page: Record<string, unknown>
      try { page = object(entry, `Record.pages[${index}]`) } catch (caught) { errors.push(caught as SharedDocsError); continue }
      // token is optional: generation omits the key for pages without one.
      if (!exactKeys(page, ['logical', 'source', 'channel', 'output', ...(page.token !== undefined ? ['token'] : [])], `Record.pages[${index}]`, errors)) continue
      const logical = textOr(page.logical, `Record.pages[${index}].logical`, '', errors)
      if (!nonempty(logical) || !SAFE_PATH.test(logical)) errors.push(error(`Record.pages[${index}].logical must be a source.dir-relative path`))
      else if (logicals.has(logical)) errors.push(error(`Record.pages lists ${logical} more than once`))
      else logicals.add(logical)
      if (page.token !== undefined) {
        const token = textOr(page.token, `Record.pages[${index}].token`, '', errors)
        if (!nonempty(token)) errors.push(error(`Record.pages[${index}].token must be a nonempty string when present`))
        else if (tokens.has(token)) errors.push(error(`Record token ${token} is claimed by more than one page`))
        else tokens.add(token)
      }
      if (page.channel !== undefined && !CHANNELS.includes(page.channel as RecordChannel)) {
        errors.push(error(`Record.pages[${index}].channel must be one of ${CHANNELS.join(', ')}`))
      }
      let source: Record<string, unknown>
      try { source = object(page.source, `Record.pages[${index}].source`) } catch (caught) { errors.push(caught as SharedDocsError); source = {} }
      const sourceKind = source.kind
      if (sourceKind === 'cloud') {
        if (exactKeys(source, ['kind', 'file'], `Record.pages[${index}].source`, errors)
          && !nonempty(textOr(source.file, `Record.pages[${index}].source.file`, '', errors))) {
          errors.push(error(`Record.pages[${index}].source.file must be a nonempty string`))
        }
      } else if (sourceKind === 'upstream') {
        if (exactKeys(source, ['kind', 'file', 'commit'], `Record.pages[${index}].source`, errors)) {
          if (!nonempty(textOr(source.file, `Record.pages[${index}].source.file`, '', errors))) {
            errors.push(error(`Record.pages[${index}].source.file must be a nonempty string`))
          }
          const commit = commitOr(source.commit, `Record.pages[${index}].source.commit`, errors)
          if (commit === null && page.channel === 'next') errors.push(error(`Record.pages[${index}]: a next-only page must pin the next commit`))
          else if (commit === null && page.channel === 'retire-in-next') errors.push(error(`Record.pages[${index}]: a retire-in-next page must pin the current commit`))
          else if (commit !== null && page.channel === 'current') {
            errors.push(error(`Record.pages[${index}]: a two-sided page reads both locked commits and must not pin one`))
          } else if (commit !== null && page.channel === 'next' && commit !== expected.upstream.next) {
            errors.push(error(`Record.pages[${index}]: a next-only page must pin the next commit`))
          } else if (commit !== null && page.channel === 'retire-in-next' && commit !== expected.upstream.current) {
            errors.push(error(`Record.pages[${index}]: a retire-in-next page must pin the current commit`))
          }
        }
      } else {
        errors.push(error(`Record.pages[${index}].source.kind must be upstream or cloud`))
      }
      let output: Record<string, unknown>
      try { output = object(page.output, `Record.pages[${index}].output`) } catch (caught) { errors.push(caught as SharedDocsError); output = {} }
      if (exactKeys(output, ['path', 'sha256'], `Record.pages[${index}].output`, errors)) {
        const path = textOr(output.path, `Record.pages[${index}].output.path`, '', errors)
        const sha = digest(output.sha256, `Record.pages[${index}].output.sha256`, errors)
        if (nonempty(path)) {
          if (declared.has(path)) errors.push(error(`Output path ${path} is claimed by more than one page`))
          else declared.set(path, sha)
        }
      }
      if (nonempty(logical)) actualPages.set(logical, page)
    }
    const wantPages = new Map(expected.pages.map(page => [page.logical, page]))
    for (const [logical, want] of wantPages) {
      const got = actualPages.get(logical)
      if (!got) { errors.push(error(`Record.pages is missing ${logical}`)); continue }
      if ((got.token ?? undefined) !== (want.token ?? undefined)) errors.push(error(`Record token mismatch for ${logical}`))
      if (got.channel !== want.channel) errors.push(error(`Record channel mismatch for ${logical}`))
      if (stable(got.source) !== stable(want.source)) errors.push(error(`Record source mismatch for ${logical}`))
      const gotOutput = got.output as Record<string, unknown> | undefined
      if (!gotOutput || gotOutput.path !== want.output.path || gotOutput.sha256 !== want.output.sha256) {
        errors.push(error(`Record output mismatch for ${logical}`))
      }
    }
    for (const logical of actualPages.keys()) if (!wantPages.has(logical)) errors.push(error(`Record.pages has an unexpected page ${logical}`))
  }

  const outputs = Array.isArray(record.outputs) ? record.outputs : (errors.push(error('Record.outputs must be an array')), undefined)
  if (outputs) {
    const actualOutputs = new Map<string, string>()
    for (const [index, entry] of outputs.entries()) {
      let item: Record<string, unknown>
      try { item = object(entry, `Record.outputs[${index}]`) } catch (caught) { errors.push(caught as SharedDocsError); continue }
      if (!exactKeys(item, ['path', 'sha256'], `Record.outputs[${index}]`, errors)) continue
      const path = textOr(item.path, `Record.outputs[${index}].path`, '', errors)
      if (!nonempty(path)) { errors.push(error(`Record.outputs[${index}].path must be a nonempty string`)); continue }
      if (actualOutputs.has(path)) errors.push(error(`Record.outputs lists ${path} more than once`))
      else actualOutputs.set(path, digest(item.sha256, `Record.outputs[${index}].sha256`, errors))
    }
    const wantOutputs = new Map(expected.outputs.map(output => [output.path, output.sha256]))
    for (const [path, sha] of wantOutputs) {
      if (!actualOutputs.has(path)) errors.push(error(`Record.outputs is missing ${path}`))
      else if (actualOutputs.get(path) !== sha) errors.push(error(`Record.outputs digest mismatch for ${path}`))
    }
    for (const path of actualOutputs.keys()) if (!wantOutputs.has(path)) errors.push(error(`Record.outputs has an unexpected entry ${path}`))
    // Collection completeness: every declared page output must appear in the artifact list.
    for (const path of declared.keys()) if (!actualOutputs.has(path)) errors.push(error(`Record.outputs does not cover the page output ${path}`))
  }
  return errors
}
