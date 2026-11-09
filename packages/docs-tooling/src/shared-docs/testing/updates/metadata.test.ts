// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { canonicalBytes, compareUtf8 } from '../../core/updates/canonical'
import { BotRevisionSchema, guidesUnitKey, type BotRevision } from '../../core/updates/envelope'
import { encodeRevisionMessage, parseRevisionMessage, METADATA_LIMITS } from '../../core/updates/metadata'

const sha = 'a'.repeat(40), hash = 'b'.repeat(64)
function revision(count = 1, length = 5): BotRevision {
  const subjects = Array.from({ length: count }, (_, i) => ({ kind: 'guides-page' as const, group: 'guides' as const, pageId: `p${i.toString().padStart(3, '0')}${'x'.repeat(length - 4)}` }))
  return { kind: 'shared-update-revision', schemaVersion: 1, unitKey: guidesUnitKey(subjects), subjects, parentHead: sha, master: sha, dev: sha, tools: sha,
    memberSetSha256: hash, planSha256: hash, previousBotCommit: null, lockDeltas: subjects.map(s => ({ path: `shared-docs/guides/pages/${s.pageId}/lock.yaml`, current: sha, oldNext: sha, next: 'c'.repeat(40) })), preservedHumanHeads: [] }
}
const message = (bytes: Uint8Array) => Buffer.from(`Prepare shared update\n\nShared-Update-Revision: v1.${Buffer.from(bytes).toString('base64url')}\n`)
it('reproduces all five measured payload/trailer/message sizes under strict runtime ordering', () => {
  // The experiment used Git tree order for IDs. Runtime subjects and lock paths
  // each have their own canonical order (prefix IDs differ from tree slash order).
  const ids = ['alphanumonly-filter','alter-collection-field','ascii-folding-filter','create-struct-array','decay-ranker-oveview','decompounder-filter','delete-entities','drop-collection','filtered-search-with-struct-arrays','filtered-search','grouping-search-with-struct-array','hybrid-search-with-struct-array','icu-tokenizer','index-struct-array','insert-entities','insert-struct-array','lindera-tokenizer','lowercase-filter','range-search-with-struct-arrays','regex-filter','remove-punct-filter','reranking-rrf','search-with-struct-array','standard-tokenizer','stop-filter','struct-array-filtering','struct-array-limits','tutorial-colbert-colpali','use-array-of-structs','use-string-field','view-collections','whitespace-tokenizer']
  const measured = (names: string[], heads=1): BotRevision => {
    const subjects = names.map(pageId=>({kind:'guides-page' as const,group:'guides' as const,pageId})).sort((a,b)=>compareUtf8(a.pageId,b.pageId))
    return {...revision(),subjects,unitKey:guidesUnitKey(subjects),parentHead:'1'.repeat(40),master:'2'.repeat(40),dev:'3'.repeat(40),tools:'4'.repeat(40),memberSetSha256:'5'.repeat(64),planSha256:'6'.repeat(64),
      lockDeltas:names.map(pageId=>({path:`shared-docs/guides/pages/${pageId}/lock.yaml`,current:'7'.repeat(40),oldNext:'8'.repeat(40),next:'9'.repeat(40)})).sort((a,b)=>compareUtf8(a.path,b.path)),
      preservedHumanHeads:Array.from({length:heads},(_,i)=>(i+1).toString(16).padStart(40,'0'))}
  }
  const sdk:BotRevision={...measured(ids.slice(0,1)),unitKey:'sdk-manual:rust',subjects:[{kind:'sdk-manual',group:'rust',manualId:'rust'}],lockDeltas:[{path:'shared-docs/rust/lock.yaml',current:'7'.repeat(40),oldNext:'8'.repeat(40),next:'9'.repeat(40)}]}
  const cases: [BotRevision,number,number,number][] = [
    [measured(ids.slice(0,1)),921,1255,1279], [measured(ids),10038,13411,13435], [sdk,821,1122,1146],
    [{...measured(Array.from({length:64},(_,i)=>`p${String(i).padStart(3,'0')}-`+'x'.repeat(123)),16),previousBotCommit:'a'.repeat(40)},34015,45381,45405],
    [measured(Array.from({length:128},(_,i)=>`p${String(i).padStart(3,'0')}-`+'x'.repeat(123)),16),66681,88935,88959],
  ]
  for(const [value,payload,line,total] of cases) {
    const raw=canonicalBytes(value), wire=message(raw)
    expect(BotRevisionSchema.parse(value)).toEqual(value)
    expect([raw.length,wire.toString().split('\n')[2].length,wire.length]).toEqual([payload,line,total])
    if(value.subjects.length<=64) expect(parseRevisionMessage(wire)).toEqual(value)
    else expect(()=>parseRevisionMessage(wire)).toThrow(/METADATA_LIMIT_EXCEEDED/)
  }
})
it('round trips measured small, 32-page, whole-manual and maximal shapes without metadata files', () => {
  for (const value of [revision(), revision(32), { ...revision(64, 128), previousBotCommit: sha, preservedHumanHeads: Array.from({length:16}, (_, i) => i.toString(16).padStart(40, '0')) }]) {
    const prepared = encodeRevisionMessage(value)
    expect(prepared.files).toEqual([])
    expect(parseRevisionMessage(Buffer.from(prepared.commitMessage))).toEqual(value)
    expect(Buffer.byteLength(prepared.commitMessage)).toBeLessThanOrEqual(METADATA_LIMITS.commitMessageBytes)
  }
  const sdk: BotRevision = { ...revision(), unitKey: 'sdk-manual:rust', subjects: [{kind:'sdk-manual', group:'rust', manualId:'rust'}], lockDeltas: [{path:'shared-docs/rust/lock.yaml', current:sha,oldNext:sha,next:'c'.repeat(40)}] }
  expect(parseRevisionMessage(Buffer.from(encodeRevisionMessage(sdk).commitMessage))).toEqual(sdk)
})
it('keeps report schemas larger than local preparation capacity and never falls back to files', () => {
  for (const value of [revision(65), revision(128, 128), revision(1, 129), { ...revision(), preservedHumanHeads: Array.from({length:17}, (_, i)=>i.toString(16).padStart(40,'0')) }]) {
    expect(BotRevisionSchema.parse(value)).toEqual(value)
    expect(() => encodeRevisionMessage(value)).toThrow(/METADATA_LIMIT_EXCEEDED/)
  }
})
it('bounds raw decoded payload and complete message exactly at and one byte above each limit', () => {
  // Valid maximum revision is smaller than the byte ceiling. An invalid shape can
  // reach that ceiling: it must reach schema validation, rather than fail its size guard.
  const exactPayload = canonicalBytes({ padding: 'x'.repeat(METADATA_LIMITS.canonicalPayloadBytes-14) })
  expect(exactPayload.length).toBe(METADATA_LIMITS.canonicalPayloadBytes)
  expect(message(exactPayload).toString().split('\n')[2].length).toBe(METADATA_LIMITS.trailerLineBytes)
  expect(() => parseRevisionMessage(message(exactPayload))).not.toThrow(/METADATA_LIMIT_EXCEEDED/)
  expect(() => parseRevisionMessage(Buffer.from(message(exactPayload).toString().replace(/\n$/, 'A\n')))).toThrow(/METADATA_LIMIT_EXCEEDED/)
  expect(() => parseRevisionMessage(message(Buffer.concat([exactPayload, Buffer.from(' ')])))).toThrow(/METADATA_LIMIT_EXCEEDED/)
  const normal = encodeRevisionMessage(revision()).commitMessage
  const exactMessage = Buffer.from(normal.replace('Prepare shared update', 's'.repeat(METADATA_LIMITS.commitMessageBytes-Buffer.byteLength(normal)+21)))
  expect(exactMessage.length).toBe(METADATA_LIMITS.commitMessageBytes)
  expect(parseRevisionMessage(exactMessage)).toEqual(revision())
  expect(() => parseRevisionMessage(Buffer.concat([Buffer.from('s'), exactMessage]))).toThrow(/METADATA_LIMIT_EXCEEDED/)
})
it('rejects duplicate, folded, padded, truncated, invalid UTF8, noncanonical and unknown trailers', () => {
  const normal = encodeRevisionMessage(revision()).commitMessage
  const canonical = Buffer.from(canonicalBytes(revision())).toString()
  for (const bytes of [
    Buffer.from(normal + normal.split('\n')[2]+'\n'), Buffer.from(normal.replace('Prepare shared update', 'shared-update-revision: v1.a')),
    Buffer.from(normal.replace('Prepare shared update', 'text Shared-Update-Revision: v1.a')),
    Buffer.from(normal.replaceAll('\n','\r\n')), Buffer.from(normal.replace(/\n$/, '\nextra\n')),
    Buffer.from(normal.replace('v1.', 'v2.')), Buffer.from(normal.replace(/\n$/, '=\n')),
    Buffer.from(normal.slice(0,-3)+'\n'), Buffer.from(normal.replace('v1.', 'v1.\n ')),
    message(Buffer.from([0xff])), message(Buffer.from(canonical.replace('"schemaVersion":1', '"schemaVersion":1,"schemaVersion":1'))),
    message(Buffer.from(canonical.replace('shared-update-revision', 'shared-update-\\u0072evision'))),
    message(Buffer.from(JSON.stringify(revision()))), message(Buffer.from(canonical.replace('"subjects":[', '"subjects": ['))),
    message(Buffer.from(canonical.replace('"schemaVersion":1', '"schemaVersion":2'))),
  ]) expect(() => parseRevisionMessage(bytes)).toThrow()
  const reverse = revision(2); reverse.subjects.reverse()
  expect(() => parseRevisionMessage(message(canonicalBytes(reverse)))).toThrow()
  expect(parseRevisionMessage(Buffer.from('human commit\n'))).toBeNull()
})

it('loads patcher, codec and local metadata boundary through the actual app-local jiti loader', () => {
  const launcher=fileURLToPath(new URL('../../../../../../scripts/lib/load-typescript.js',import.meta.url))
  const modules=['../../core/updates/transaction.ts','../../core/updates/metadata.ts','../../adapters/updates/metadata-store.ts'].map(path=>fileURLToPath(new URL(path,import.meta.url)))
  const output=execFileSync(process.execPath,['-e',`
    const {loadTypeScript}=require(process.argv[1]);const assert=require('node:assert/strict');
    const [transaction,metadata,store]=process.argv.slice(2,5).map(path=>loadTypeScript(path));
    const revision=JSON.parse(process.argv[5]);
    assert.deepEqual(metadata.parseRevisionMessage(Buffer.from(metadata.encodeRevisionMessage(revision).commitMessage)),revision);
    assert.equal(typeof transaction.patchNextLock,'function');
    store.createMetadataStore().read({}).then(result=>{assert.equal(result.status,'unknown');process.stdout.write('app-local-task4-ok')});
  `,launcher,...modules,JSON.stringify(revision())],{encoding:'utf8',timeout:30_000})
  expect(output).toBe('app-local-task4-ok')
})
