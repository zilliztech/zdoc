// @vitest-environment node
import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'
import { canonicalBytes, digest, parseStrictJson } from '../../core/updates/canonical'
const bytes = (text: string) => new TextEncoder().encode(text)
const text = (value: unknown) => Buffer.from(canonicalBytes(value)).toString()

it.each(['{"a":1,"a":2}', '{"outer":{"x":1,"\\u0078":2}}', '[{"a":1,"a":1}]', '{"__proto__":1,"__proto__":2}'])('rejects duplicate keys before constructing objects: %s', value => {
  expect(() => parseStrictJson(bytes(value))).toThrow(/duplicate/i)
})
it.each(['\ufeff{}', '"\\ud800"', '"\\udfff"', '{"\\ud800":0}', '0.5', '1.0', '1e2', '-0', '9007199254740992', '[1,]', '{"a":1,}', 'true false', '01', '"\n"', '', 'undefined'])('rejects invalid strict JSON: %s', value => {
  expect(() => parseStrictJson(bytes(value))).toThrow()
})
it.each([[0xc0, 0xaf], [0xed, 0xa0, 0x80], [0xf0, 0x80, 0x80, 0x80], [0xff], [0xe2, 0x82]].map(value => [value]))('rejects malformed UTF-8: %j', value => {
  expect(() => parseStrictJson(Uint8Array.from(value))).toThrow()
})
it('parses null, safe integers, valid Unicode and prototype-named own keys', () => {
  expect(parseStrictJson(bytes(' {"__proto__":null,"constructor":1,"a":[true,false,-9007199254740991,"😀"]} '))).toEqual({ ['__proto__']: null, constructor: 1, a: [true, false, -9007199254740991, '😀'] })
  expect(Object.getPrototypeOf(parseStrictJson(bytes('{"__proto__":null}')))).toBe(Object.prototype)
})
it('uses unsigned UTF-8 key ordering, literal Unicode and lowercase control escapes', () => {
  expect(text({ z: 1, a: '\n' })).toBe('{"a":"\\u000a","z":1}')
  expect(text({ '\u{10000}': 1, '\ue000': 2 })).toBe('{"\ue000":2,"𐀀":1}')
  expect(text({ a: '\b\t\n\f\r\u001f"\\/é😀', b: null })).toBe('{"a":"\\u0008\\u0009\\u000a\\u000c\\u000d\\u001f\\"\\\\/é😀","b":null}')
  expect(text(['é', 'e\u0301'])).toBe('["é","é"]')
})
it.each([-0, 1.1, NaN, Infinity, 9007199254740992, '\ud800', { '\udfff': 1 }, undefined, new Date(), [, 1], { a: undefined }, { a: () => 1 }, Object.assign([], { extra: 1 })].map(value => [value]))('rejects non-JSON canonical values: %j', value => {
  expect(() => canonicalBytes(value)).toThrow()
})
it('rejects cycles, symbol keys and accessors without invoking them', () => {
  const cycle: unknown[] = []; cycle.push(cycle)
  expect(() => canonicalBytes(cycle)).toThrow()
  expect(() => canonicalBytes({ [Symbol('hidden')]: 1 })).toThrow()
  expect(() => canonicalBytes(Object.defineProperty({}, 'a', { enumerable: true, get() { throw new Error('invoked') } }))).toThrow(/accessor/i)
})
it.each(['members', 'semantic', 'unit-members', 'unit-semantic', 'plan', 'toolset', 'policy'] as const)('separates %s structured hashes from raw blobs', domain => {
  const value = { z: 1, a: '\n' }, raw = canonicalBytes(value)
  const expected = createHash('sha256').update(`shared-update/${domain}/v1\n`).update(raw).digest('hex')
  expect(digest(domain, value)).toBe(expected)
  expect(digest(domain, value)).not.toBe(createHash('sha256').update(raw).digest('hex'))
  expect(createHash('sha256').update(raw).digest('hex')).not.toBe(createHash('sha256').update(Buffer.concat([raw, bytes('\n')])).digest('hex'))
})
it('rejects an unknown digest domain at runtime', () => {
  expect(() => digest('other' as 'members', {})).toThrow()
})
