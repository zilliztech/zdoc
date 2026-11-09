// @vitest-environment node
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { patchNextLock, verifyNextLockPatch, assertNextOnlyDiff } from '../../core/updates/transaction'

const old = 'a'.repeat(40), target = 'b'.repeat(40), subject = { kind: 'guides-page' as const, group: 'guides' as const, pageId: 'alpha' }
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
const input = (text: string) => {
  const bytes = Buffer.from(text)
  return { subject, bytes, before: { path: 'shared-docs/guides/pages/alpha/lock.yaml', sha256: hash(bytes), current: old, next: old }, target, mode: '100644' }
}
describe('lossless next scalar patch', () => {
  it.each([
    `# 雪 ${old}\r\nschema_version: 1\r\ncurrent: ${old} # ${old}\r\nnext: ${old} # ${old}\r\n`,
    `{schema_version: 1, current: '${old}', next: '${old}'} # ${old}\n`,
    `{"schema_version":1,"current":"${old}","next":"${old}"}\r\n`,
    `schema_version: 1\ncurrent: "${old}"\nnext: # ${old}\n  "${old}"\n`,
  ])('changes only forty next bytes in %s', text => {
    const request = input(text), result = patchNextLock(request)
    expect(result.span.end - result.span.start).toBe(40)
    expect(Buffer.from(result.bytes.subarray(0, result.span.start))).toEqual(request.bytes.subarray(0, result.span.start))
    expect(Buffer.from(result.bytes.subarray(result.span.end))).toEqual(request.bytes.subarray(result.span.end))
    expect(Buffer.from(result.bytes.subarray(result.span.start, result.span.end)).toString()).toBe(target)
    expect(result.text).toBe(Buffer.from(result.bytes).toString('utf8'))
    expect(result.afterSha256).toBe(hash(result.bytes))
    expect(verifyNextLockPatch({ ...request, afterBytes: result.bytes })).toEqual(result)
  })
  it.each([
    `schema_version: 1\ncurrent: ${old}\nnext: ${old}\nnext: ${old}\n`,
    `schema_version: 1\ncurrent: &sha ${old}\nnext: *sha\n`,
    `schema_version: 1\ncurrent: ${old}\nnext: !!str ${old}\n`,
    `schema_version: !!int 1\ncurrent: ${old}\nnext: ${old}\n`,
    `schema_version: 1\ncurrent: ${old}\nnext: &sha ${old}\n`,
    `schema_version: 1\ncurrent: ${old}\nnext: >-\n  ${old}\n`,
    `schema_version: 1\ncurrent: ${old}\nnext: ${old}\n---\na: 1\n`,
    `schema_version: 2\ncurrent: ${old}\nnext: ${old}\n`,
  ])('rejects unsupported or ambiguous YAML %s', text => expect(() => patchNextLock(input(text))).toThrow())
  it('rejects before tampering, no-op, invalid bytes, modes, wrong spelling and path collisions', () => {
    const request = input(`schema_version: 1\ncurrent: ${old}\nnext: ${old}\n`), result = patchNextLock(request)
    for (const bad of [
      { ...request, target: old }, { ...request, before: { ...request.before, sha256: '0'.repeat(64) } },
      { ...request, before: { ...request.before, current: target } }, { ...request, mode: '120000' },
      { ...request, before: { ...request.before, path: request.before.path.replace('lock.yaml', 'LOCK.yaml') } },
      { ...request, bytes: Buffer.from([0xff]) },
    ]) expect(() => patchNextLock(bad)).toThrow()
    expect(() => verifyNextLockPatch({ ...request, afterBytes: Buffer.from(result.text + '# extra\n') })).toThrow()
    const edit = { subject, before: request.before, target, afterBlob: { path: 'blobs/after', sha256: result.afterSha256, bytes: result.bytes.length } }
    const delta = { edit, path: request.before.path, beforeBytes: request.bytes, afterBytes: result.bytes, beforeMode: '100644', afterMode: '100644' }
    expect(() => assertNextOnlyDiff([delta])).not.toThrow()
    expect(() => assertNextOnlyDiff([delta, delta])).toThrow(/COLLISION/)
    expect(() => assertNextOnlyDiff([{ ...delta, afterMode: '100755' }])).toThrow(/MODE/)
    expect(() => assertNextOnlyDiff([{ ...delta, path: '.updates/receipt' }])).toThrow()
  })
})
