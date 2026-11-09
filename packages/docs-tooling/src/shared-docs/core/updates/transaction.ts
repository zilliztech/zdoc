import { createHash } from 'node:crypto'
import { JSON_SCHEMA, load } from 'js-yaml'
import { parseLock } from '../lock'
import { expectedLockPath, GitShaSchema, LockStateSchema, NextLockEditSchema, SubjectSchema, validateBlobBytes, type LockState, type NextLockEdit, type Subject } from './envelope'

const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
const equal = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((byte, i) => byte === b[i])
const fail = (code: string): never => { throw new Error(code) }
export interface NextLockPatchInput {
  readonly subject: Subject
  readonly before: LockState
  readonly bytes: Uint8Array
  readonly target: string
  readonly mode: string
}
export interface NextLockPatch {
  readonly bytes: Uint8Array
  readonly text: string
  /** Byte offsets, excluding quote delimiters, never JS string offsets. */
  readonly span: { readonly start: number; readonly end: number }
  readonly beforeSha256: string
  readonly afterSha256: string
}
interface Node { start: number; end: number; kind: string | null; value: unknown; tag: string | null; anchor: string | null; children: Node[] }

/** Find the parser's actual top-level value node, then recognize only a bounded scalar token.
 * js-yaml remains the sole parser. No YAML serializer, global substitution or fallback parser. */
function nextSpan(text: string): { start: number; end: number } {
  const stack: Node[] = []; let root: Node
  load(text, { schema: JSON_SCHEMA, listener(event: string, state: { position: number; kind: string | null; result: unknown; tag: string | null; anchor: string | null }) {
    if (event === 'open') {
      const node: Node = { start: state.position, end: 0, kind: null, value: null, tag: null, anchor: null, children: [] }
      if (stack.length) stack[stack.length - 1].children.push(node); else root = node
      stack.push(node)
    } else {
      const node = stack.pop()!
      Object.assign(node, { end: state.position, kind: state.kind, value: state.result, tag: state.tag, anchor: state.anchor })
    }
  } })
  const inspect = (node: Node) => {
    // Non-specific implicit tags are parser-internal. Explicit !/!! tags and anchors
    // are rejected by inspecting the source token, including on schema/current/keys.
    const token = text.slice(node.start, node.end).replace(/^(?:[\s\ufeff]|#[^\r\n]*(?:\r?\n|$))*/, '')
    if (node.anchor !== null || /^[!&*]/.test(token)) fail('LOCK_UNSUPPORTED_YAML')
    for (const child of node.children) inspect(child)
  }
  if (!root) return fail('LOCK_INVALID')
  inspect(root)
  // Block mappings have a parser wrapper around the mapping node.
  while (root.children.length === 1 && root.children[0].kind === 'mapping') root = root.children[0]
  if (root.kind !== 'mapping') return fail('LOCK_INVALID')
  let value: Node
  for (let i = 0; i + 1 < root.children.length; i += 2) if (root.children[i].value === 'next') {
    if (value) fail('LOCK_DUPLICATE_NEXT')
    value = root.children[i + 1]
  }
  while (value?.children.length === 1 && value.kind === 'scalar' && value.children[0].kind === 'scalar' && value.value === value.children[0].value) value = value.children[0]
  if (!value || value.kind !== 'scalar' || value.children.length) return fail('LOCK_UNSUPPORTED_NEXT')
  const raw = text.slice(value.start, value.end)
  const trivia = /^(?:\s|#[^\r\n]*(?:\r?\n|$))*/.exec(raw)![0].length
  const token = raw.slice(trivia)
  const match = /^(?:([a-f0-9]{40})|'([a-f0-9]{40})'|"([a-f0-9]{40})")(?=$|[\s,}\]#])/.exec(token)
  if (!match || (match[1] !== undefined && token[40] === '#')) return fail('LOCK_UNSUPPORTED_NEXT')
  const start = value.start + trivia + (match[1] !== undefined ? 0 : 1)
  return { start, end: start + 40 }
}

/** Pure byte transformation. This does not authenticate source order, authority or a plan. */
export function patchNextLock(input: NextLockPatchInput): NextLockPatch {
  SubjectSchema.parse(input.subject); LockStateSchema.parse(input.before); GitShaSchema.parse(input.target)
  if (input.before.path !== expectedLockPath(input.subject)) fail('LOCK_PATH_MISMATCH')
  if (!['100644', '100755'].includes(input.mode)) fail('LOCK_MODE_UNSUPPORTED')
  if (!(input.bytes instanceof Uint8Array) || input.bytes.length > 1024 * 1024) fail('LOCK_BYTES_LIMIT')
  if (hash(input.bytes) !== input.before.sha256) fail('LOCK_BEFORE_CHANGED')
  if (input.target === input.before.next) fail('LOCK_NO_CHANGE')
  const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(input.bytes)
  const before = parseLock(text)
  if ('errors' in before) return fail('LOCK_BEFORE_CHANGED')
  if (before.lock.current !== input.before.current || before.lock.next !== input.before.next) fail('LOCK_BEFORE_CHANGED')
  const span = nextSpan(text)
  if (text.slice(span.start, span.end) !== input.before.next) fail('LOCK_SPAN_MISMATCH')
  const start = new TextEncoder().encode(text.slice(0, span.start)).length, end = start + 40
  const bytes = Uint8Array.from(input.bytes); bytes.set(new TextEncoder().encode(input.target), start)
  const afterText = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes)
  const after = parseLock(afterText)
  if ('errors' in after || after.lock.schema_version !== before.lock.schema_version || after.lock.current !== before.lock.current || after.lock.next !== input.target
    || !equal(input.bytes.subarray(0, start), bytes.subarray(0, start)) || !equal(input.bytes.subarray(end), bytes.subarray(end))) fail('LOCK_PATCH_INVALID')
  const afterSpan = nextSpan(afterText)
  if (span.start !== afterSpan.start || span.end !== afterSpan.end) fail('LOCK_PATCH_INVALID')
  return { bytes, text: afterText, span: { start, end }, beforeSha256: input.before.sha256, afterSha256: hash(bytes) }
}

/** Independently rederive the only permitted after bytes; arbitrary patch text has no authority. */
export function verifyNextLockPatch(input: NextLockPatchInput & { readonly afterBytes: Uint8Array }): NextLockPatch {
  const patch = patchNextLock(input)
  if (!equal(patch.bytes, input.afterBytes)) fail('LOCK_NOT_NEXT_ONLY')
  return patch
}
export interface NextOnlyDelta {
  readonly edit: NextLockEdit; readonly path: string
  readonly beforeBytes: Uint8Array; readonly afterBytes: Uint8Array
  readonly beforeMode: string; readonly afterMode: string
}
/** Caller must supply the COMPLETE raw tree diff, not a path-filtered subset. */
export function assertNextOnlyDiff(deltas: readonly NextOnlyDelta[]): void {
  const paths = new Set<string>()
  for (const delta of deltas) {
    const edit = NextLockEditSchema.parse(delta.edit)
    if (paths.has(delta.path) || [...paths].some(path => path.toLowerCase() === delta.path.toLowerCase() || path.startsWith(delta.path + '/') || delta.path.startsWith(path + '/'))) fail('LOCK_PATH_COLLISION')
    paths.add(delta.path)
    if (delta.path !== edit.before.path) fail('LOCK_PATH_MISMATCH')
    if (delta.beforeMode !== delta.afterMode) fail('LOCK_MODE_CHANGED')
    verifyNextLockPatch({ subject: edit.subject, before: edit.before, bytes: delta.beforeBytes, afterBytes: delta.afterBytes, target: edit.target, mode: delta.beforeMode })
    validateBlobBytes(edit.afterBlob, delta.afterBytes)
  }
}
