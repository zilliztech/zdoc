import { createHash } from 'node:crypto'

export type DigestDomain = 'members' | 'semantic' | 'unit-members' | 'unit-semantic' | 'plan' | 'toolset' | 'policy'
const domains: readonly string[] = ['members', 'semantic', 'unit-members', 'unit-semantic', 'plan', 'toolset', 'policy']
const encoder = new TextEncoder()

/** JSON strings must contain Unicode scalar values, including after escape decoding. */
export function isValidUnicode(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(++i)
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false
    } else if (code >= 0xdc00 && code <= 0xdfff) return false
  }
  return true
}

/** Compare tuples componentwise with this comparator, never locale or UTF-16 ordering. */
export function compareUtf8(a: string, b: string): number {
  const left = encoder.encode(a), right = encoder.encode(b)
  for (let i = 0; i < Math.min(left.length, right.length); i++) {
    if (left[i] !== right[i]) return left[i] - right[i]
  }
  return left.length - right.length
}

/** Scan keys before constructing each object; JSON.parse alone erases duplicate claims. */
export function parseStrictJson(bytes: Uint8Array): unknown {
  if (!(bytes instanceof Uint8Array)) throw new Error('Expected UTF-8 bytes')
  const source = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes)
  if (source.charCodeAt(0) === 0xfeff) throw new Error('JSON BOM is forbidden')
  let at = 0
  const fail = (message: string): never => { throw new Error(`${message} at JSON offset ${at}`) }
  const whitespace = () => { while (/[\x20\x09\x0a\x0d]/.test(source[at] ?? '') && at < source.length) at++ }
  const string = (): string => {
    const start = at++
    while (at < source.length) {
      const char = source[at++]
      if (char === '"') {
        let value: string
        try { value = JSON.parse(source.slice(start, at)) as string } catch { return fail('Invalid JSON string') }
        if (!isValidUnicode(value)) fail('Invalid Unicode surrogate')
        return value
      }
      if (char === '\\') {
        if (at >= source.length) fail('Unterminated JSON escape')
        at++
      } else if (char.charCodeAt(0) < 0x20) fail('Unescaped JSON control character')
    }
    return fail('Unterminated JSON string')
  }
  const value = (): unknown => {
    whitespace()
    const char = source[at]
    if (char === '"') return string()
    if (char === '{') {
      at++; whitespace()
      const keys = new Set<string>(), entries: [string, unknown][] = []
      if (source[at] !== '}') while (true) {
        if (source[at] !== '"') fail('Expected object key')
        const key = string()
        if (keys.has(key)) fail(`Duplicate JSON key ${key}`)
        keys.add(key); whitespace()
        if (source[at++] !== ':') fail('Expected colon')
        entries.push([key, value()]); whitespace()
        if (source[at] !== ',') break
        at++; whitespace()
      }
      if (source[at++] !== '}') fail('Expected object end')
      const object: Record<string, unknown> = {}
      for (const [key, child] of entries) Object.defineProperty(object, key, { value: child, enumerable: true, writable: true, configurable: true })
      return object
    }
    if (char === '[') {
      at++; whitespace()
      const array: unknown[] = []
      if (source[at] !== ']') while (true) {
        array.push(value()); whitespace()
        if (source[at] !== ',') break
        at++
      }
      if (source[at++] !== ']') fail('Expected array end')
      return array
    }
    for (const [literal, parsed] of [['true', true], ['false', false], ['null', null]] as const) {
      if (source.startsWith(literal, at)) { at += literal.length; return parsed }
    }
    const match = /^-?(?:0|[1-9][0-9]*)/.exec(source.slice(at))
    if (match) {
      at += match[0].length
      if (/[.eE0-9]/.test(source[at] ?? '') && at < source.length) fail('Only minimal safe integers are allowed')
      const number = Number(match[0])
      if (!Number.isSafeInteger(number) || Object.is(number, -0)) fail('Invalid safe integer')
      return number
    }
    return fail('Expected JSON value')
  }
  const result = value(); whitespace()
  if (at !== source.length) fail('Trailing JSON input')
  return result
}

/** Strict JSON encoding. No normalization, whitespace, short control escapes or implicit omissions. */
export function canonicalBytes(value: unknown): Uint8Array {
  const ancestors = new Set<object>()
  const quote = (text: string): string => {
    if (!isValidUnicode(text)) throw new Error('Invalid Unicode surrogate')
    return '"' + text.replace(/["\\\x00-\x1f]/g, char => char === '"' ? '\\"' : char === '\\' ? '\\\\' : `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`) + '"'
  }
  const encode = (child: unknown): string => {
    if (child === null) return 'null'
    if (typeof child === 'string') return quote(child)
    if (typeof child === 'boolean') return child ? 'true' : 'false'
    if (typeof child === 'number') {
      if (!Number.isSafeInteger(child) || Object.is(child, -0)) throw new Error('Only safe integers other than -0 are allowed')
      return String(child)
    }
    if (typeof child !== 'object') throw new Error('Non-JSON value')
    if (ancestors.has(child)) throw new Error('Cyclic JSON value')
    if (Object.getOwnPropertySymbols(child).length) throw new Error('Symbol JSON key')
    ancestors.add(child)
    try {
      const descriptors = Object.getOwnPropertyDescriptors(child)
      for (const [key, descriptor] of Object.entries(descriptors)) {
        if (!('value' in descriptor)) throw new Error('JSON accessor is forbidden')
        if (!descriptor.enumerable && !(Array.isArray(child) && key === 'length')) throw new Error('Nonenumerable JSON property')
      }
      if (Array.isArray(child)) {
        if (Object.keys(child).length !== child.length || Object.keys(child).some((key, i) => key !== String(i))) throw new Error('Sparse or extended JSON array')
        return `[${child.map(encode).join(',')}]`
      }
      if (Object.getPrototypeOf(child) !== Object.prototype && Object.getPrototypeOf(child) !== null) throw new Error('Non-JSON object prototype')
      return `{${Object.keys(child).sort(compareUtf8).map(key => `${quote(key)}:${encode(descriptors[key].value)}`).join(',')}}`
    } finally { ancestors.delete(child) }
  }
  return encoder.encode(encode(value))
}

export function digest(domain: DigestDomain, value: unknown): string {
  if (!domains.includes(domain)) throw new Error('Unknown shared-update digest domain')
  return createHash('sha256').update(`shared-update/${domain}/v1\n`, 'utf8').update(canonicalBytes(value)).digest('hex')
}
