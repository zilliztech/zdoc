import {createHash} from 'node:crypto'
import * as z from 'zod'
import fixedRules from '../../../../../../scripts/docs-workflow/shared-guides-update/historical-render-rules.json'
import {isValidUnicode} from '../../core/updates/canonical'
import {DigestSchema, GitShaSchema, RepoPathSchema} from '../../core/updates/envelope'

export const historicalRenderRulesSha256 = 'ba01bcf85b15cbaf1bc727bc2027f4f23a74a1eb21d89571d4c216bd1549d577'
const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
const invalid = (): never => {throw Error('BATCH_HISTORICAL_RENDER_UNPROVEN')}
const marker = /^<!-- doc:block:(?:start|end) id="[a-z0-9]+(?:-[a-z0-9]+)*" -->$/
const variables = new Map([
  ['Milvus', '{{var.product_name}}'],
  ['http://localhost:19530', '{{var.example_endpoint}}'],
  ['localhost:19530', '{{var.example_endpoint}}'],
  ['root:Milvus', '{{var.example_token}}'],
])
const literal = z.string().refine(value => isValidUnicode(value) && Buffer.byteLength(value) <= 128)
const editSchema = z.strictObject({offset: z.number().int().nonnegative(), before: literal, after: literal})
const ruleSchema = z.strictObject({
  pageId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  sourceFile: RepoPathSchema.refine(value => value.startsWith('site/en/') && /\.mdx?$/.test(value)),
  rawOid: GitShaSchema,
  rawSha256: DigestSchema,
  commits: z.array(GitShaSchema).min(1).max(24),
  markedOid: GitShaSchema,
  renderSha256: DigestSchema,
  edits: z.array(editSchema).min(1).max(128),
})
const rulesSchema = z.strictObject({kind: z.literal('guides-historical-render-rules-v1'), rules: z.array(ruleSchema).length(2)})

declare const historicalRenderRulesBrand: unique symbol
export type HistoricalRenderRules = Readonly<{rulesSha256: string; [historicalRenderRulesBrand]: true}>
type Point = {pageId: string; commit: string}
const key = ({pageId, commit}: Point) => `${pageId}:${commit}`

function fixedRegistry() {
  // The JSON is embedded by bundlers and loaded by the measured resolver in
  // the worker. CI also checks these serialized bytes against the fixed file
  // that the independent Python verifier reads directly.
  const bytes = Buffer.from(JSON.stringify(fixedRules, null, 2) + '\n')
  if (bytes.length > 32 * 1024 || sha256(bytes) !== historicalRenderRulesSha256) invalid()
  const parsed = rulesSchema.safeParse(fixedRules)
  if (!parsed.success) return invalid()
  const indexed = new Map<string, z.infer<typeof ruleSchema>>()
  let previousPage = ''
  for (const rule of parsed.data.rules) {
    if (rule.pageId <= previousPage || rule.rawOid === rule.markedOid) invalid()
    previousPage = rule.pageId
    let previousCommit = '', previousOffset = -1, previousEnd = 0
    for (const commit of rule.commits) {
      if (commit <= previousCommit) invalid()
      previousCommit = commit
      indexed.set(key({pageId: rule.pageId, commit}), rule)
    }
    for (const {offset, before, after} of rule.edits) {
      const insertion = before === '' && after.endsWith('\n') && after.slice(0, -1).split('\n').every(line => marker.test(line))
      if (offset <= previousOffset || offset < previousEnd || (!insertion && variables.get(before) !== after)) invalid()
      previousOffset = offset
      previousEnd = offset + Buffer.byteLength(before)
    }
  }
  if (indexed.size !== 24) invalid()
  const handle = Object.freeze({rulesSha256: historicalRenderRulesSha256}) as HistoricalRenderRules
  return {indexed, handle}
}

let registry: ReturnType<typeof fixedRegistry> | undefined
export function loadHistoricalRenderRules(): HistoricalRenderRules {
  return (registry ??= fixedRegistry()).handle
}

function findRule(rules: HistoricalRenderRules, point: Point) {
  if (rules !== loadHistoricalRenderRules()) return invalid()
  return registry!.indexed.get(key(point))
}

export function isHistoricalRenderPoint(rules: HistoricalRenderRules, pageId: string, commit: string): boolean {
  return findRule(rules, {pageId, commit}) !== undefined
}

/** Derive a view only from the original authenticated Git bytes at an approved point. */
export function getHistoricalRenderView(rules: HistoricalRenderRules, point: Point & {sourceFile: string; rawOid: string}, raw: Uint8Array) {
  const rule = findRule(rules, point)
  if (!rule) return undefined
  if (point.sourceFile !== rule.sourceFile || point.rawOid !== rule.rawOid || raw.byteLength > 1024 * 1024) invalid()
  const original = Buffer.from(raw)
  const oid = createHash('sha1').update(`blob ${original.length}\0`).update(original).digest('hex')
  if (oid !== rule.rawOid || sha256(original) !== rule.rawSha256) invalid()
  const chunks: Buffer[] = []
  let end = 0
  for (const {offset, before, after} of rule.edits) {
    const from = Buffer.from(before), next = offset + from.length
    if (next > original.length || !original.subarray(offset, next).equals(from) ||
        (!from.length && offset > 0 && original[offset - 1] !== 10)) invalid()
    chunks.push(original.subarray(end, offset), Buffer.from(after))
    end = next
  }
  const bytes = Buffer.concat([...chunks, original.subarray(end)])
  if (sha256(bytes) !== rule.renderSha256) invalid()
  return {bytes, rawSha256: rule.rawSha256, renderSha256: rule.renderSha256, rulesSha256: rules.rulesSha256,
    ruleId: `${rule.pageId}:${rule.rawOid}`}
}
