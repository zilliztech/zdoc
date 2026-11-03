// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { chmodSync, closeSync, openSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { mkdtemp, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { deflateSync } from 'node:zlib'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { checkMetadataVerificationBudget, createMetadataStore, createLocalMetadataInspector, type LocalJournalFacts, type LocalRevisionEvidence } from '../../adapters/updates/metadata-store'
import { initializeEvidence, rawSha256 } from '../../adapters/updates/evidence'
import { canonicalBytes, digest, parseStrictJson } from '../../core/updates/canonical'
import { type BotRevision, type CandidateSnapshotProof, type UpdateUnitPlan } from '../../core/updates/envelope'
import { encodeRevisionMessage, METADATA_LIMITS } from '../../core/updates/metadata'
import { patchNextLock } from '../../core/updates/transaction'

// Measured real-Git scenarios used ~5.25–5.46s of total setup and scanning.
// Local 10s cases give bounded ~2x headroom; setup hooks, 5s fixture Git children
// and the product's 60s/graph/metadata resource guards remain independently bounded.
const metadataCaseBudget = { timeout: 10_000 }
it('never upgrades remote-looking PR metadata into remote verification', metadataCaseBudget, async () => {
  expect(await createMetadataStore().read({ repositoryId: 1, number: 1, actorId: 1, base:'a'.repeat(40),head:'b'.repeat(40),state:'open',draft:false,metadataEvidence:[] })).toEqual({status:'unknown',reasons:['REMOTE_AUTH_REQUIRED']})
})

const sourceOld = 'a'.repeat(40), sourceNext = 'c'.repeat(40), hash = 'b'.repeat(64)
const subject = { kind: 'sdk-manual' as const, group: 'rust', manualId: 'rust' }, lockPath = 'shared-docs/rust/lock.yaml'
const lock = (next = sourceOld) => `# repeated ${sourceOld}\r\nschema_version: 1\r\ncurrent: ${sourceOld}\r\nnext: '${next}' # ${sourceOld}\r\n`
async function fixture(baselineCount = 1, bulkLeaves = 0) {
  const started=process.hrtime.bigint(), milliseconds=()=>Number(process.hrtime.bigint()-started)/1e6
  const root = await mkdtemp(join(tmpdir(), 'metadata-store-')), repository = join(root, 'repo.git')
  let serial = 0, batchSerial = 0
  const gitBytes = (args: string[], input?: string | Uint8Array, stdinFile?: string) => {
    const descriptor=stdinFile ? openSync(stdinFile,'r') : undefined
    try { return execFileSync('/usr/bin/git', ['--no-replace-objects', '-C', repository, ...args], {
    env: { PATH: '/usr/bin:/bin', GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null', GIT_AUTHOR_NAME: 'Local fixture', GIT_AUTHOR_EMAIL: 'fixture@example.test',
      GIT_COMMITTER_NAME: 'Local fixture', GIT_COMMITTER_EMAIL: 'fixture@example.test', GIT_AUTHOR_DATE: '2001-01-01T00:00:00Z', GIT_COMMITTER_DATE: '2001-01-01T00:00:00Z' }, input,
    stdio: [descriptor ?? (input === undefined ? 'ignore' : 'pipe'), 'pipe', 'pipe'], timeout: 5_000, maxBuffer:8*1024*1024 }) }
    finally { if(descriptor!==undefined) closeSync(descriptor) }
  }
  const git = (args: string[], input?: string | Uint8Array) => gitBytes(args, input).toString('utf8').trim()
  await mkdir(repository); git(['init', '--bare', '-q'])
  let bulk: string
  if(bulkLeaves) {
    const blob=git(['hash-object','-w','--stdin'],'shared fixture bytes\n')
    const leaf=(i:number)=>`100644 blob ${blob}\tf${String(i).padStart(6,'0')}\n`
    const block=git(['mktree'],Array.from({length:500},(_,i)=>leaf(i)).join(''))
    bulk=git(['mktree'],Array.from({length:Math.floor(bulkLeaves/500)},(_,i)=>`040000 tree ${block}\td${String(i).padStart(3,'0')}\n`).join('')+Array.from({length:bulkLeaves%500},(_,i)=>leaf(i)).join(''))
  }
  const makeTree = (text: string, files: Record<string,string> = {}) => {
    const entries: Record<string, string> = { ...files, [lockPath]: text }
    const build = (prefix: string): string => {
      const immediate = new Map<string, { type: 'tree'|'blob'; oid: string }>()
      for (const path of Object.keys(entries).filter(path => path.startsWith(prefix)).sort()) {
        const rest = path.slice(prefix.length), slash = rest.indexOf('/')
        if (slash < 0) immediate.set(rest, {type:'blob',oid:git(['hash-object','-w','--stdin'], entries[path])})
        else if (!immediate.has(rest.slice(0,slash))) immediate.set(rest.slice(0,slash), {type:'tree',oid:build(prefix+rest.slice(0,slash)+'/')})
      }
      return git(['mktree'], [...immediate].map(([name,entry])=>`${entry.type==='tree'?'040000':'100644'} ${entry.type} ${entry.oid}\t${name}\n`).join(''))
    }
    const tree=build('')
    return bulk ? git(['mktree'],`040000 tree ${bulk}\tbulk\n`+gitBytes(['ls-tree',tree]).toString()) : tree
  }
  const exactCommit = (tree: string, parents: string[], message: string) => {
    // Retain exact message bytes, avoiding a synchronous large stdin/EOF transport.
    // A stuck fixture child is bounded independently of product verification limits.
    const file = join(root, `commit-message-${serial++}.txt`)
    writeFileSync(file, message, {flag:'wx',mode:0o600})
    return git(['commit-tree',tree,...parents.flatMap(parent=>['-p',parent]),'-F',file])
  }
  const humanMessage = (message = 'human\n') => `${message.replace(/\n?$/, '\n')}\nfixture-${serial++}\n`
  const commit = (tree: string, parents: string[], message = 'human\n') => exactCommit(tree, parents, humanMessage(message))
  const batchMessages = (messages: readonly string[]) => messages.map(message => {
    const bytes=humanMessage(message)
    serial++ // Preserve the original exactCommit message-file reservation too.
    return bytes
  })
  /** Real Git object batching, with an independent byte/parent/tree proof for EVERY commit.
   * Streams are retained and read through a file descriptor, never a large synchronous pipe. */
  const chain = (tree:string,parent:string|null,messages:readonly string[]):string[] => {
    const id=batchSerial++, stream=join(root,`chain-${id}.fast-import`), marks=join(root,`chain-${id}.marks`)
    const entries=git(['ls-tree',tree]).split('\n').filter(Boolean).map(line=>{
      const match=/^(\d+) (?:tree|blob|commit) ([a-f0-9]{40})\t(.+)$/.exec(line)!
      return `M ${match[1]} ${match[2]} ${JSON.stringify(match[3])}\n`
    }).join('')
    const chunks:Buffer[]=[]
    messages.forEach((message,i)=>{
      chunks.push(Buffer.from(`commit refs/fixture/chain-${id}\nmark :${i+1}\nauthor Local fixture <fixture@example.test> 978307200 +0000\ncommitter Local fixture <fixture@example.test> 978307200 +0000\ndata ${Buffer.byteLength(message)}\n`),Buffer.from(message),Buffer.from('\n'))
      if(i || parent) chunks.push(Buffer.from(`from ${i ? ':'+i : parent}\n`))
      if(i===0) chunks.push(Buffer.from('deleteall\n'+entries))
      chunks.push(Buffer.from('\n'))
    })
    chunks.push(Buffer.from('done\n')); writeFileSync(stream,Buffer.concat(chunks),{flag:'wx',mode:0o600})
    gitBytes(['fast-import','--quiet',`--export-marks=${marks}`],undefined,stream); chmodSync(marks,0o600)
    const mapped=new Map(readFileSync(marks,'utf8').trim().split('\n').map(line=>{const [mark,oid]=line.split(' ');return [Number(mark.slice(1)),oid] as const}))
    const commits=messages.map((_,i)=>mapped.get(i+1)!)
    expect(mapped.size).toBe(messages.length); expect(commits.every(oid=>/^[a-f0-9]{40}$/.test(oid))).toBe(true)
    const request=join(root,`chain-${id}.objects-request`)
    writeFileSync(request,commits.join('\n')+'\n',{flag:'wx',mode:0o600})
    const objects=gitBytes(['cat-file','--batch'],undefined,request)
    writeFileSync(join(root,`chain-${id}.objects`),objects,{flag:'wx',mode:0o600})
    let at=0
    const proof=commits.map((oid,i)=>{
      const end=objects.indexOf(10,at),match=/^([a-f0-9]{40}) commit (\d+)$/.exec(objects.subarray(at,end).toString())!
      expect(match?.[1]).toBe(oid)
      const length=Number(match[2]),raw=objects.subarray(end+1,end+1+length);at=end+length+2
      expect(createHash('sha1').update(`commit ${length}\0`).update(raw).digest('hex')).toBe(oid)
      const split=raw.indexOf('\n\n'),header=raw.subarray(0,split).toString().split('\n')
      const parents=header.filter(line=>line.startsWith('parent ')).map(line=>line.slice(7))
      expect(header[0]).toBe(`tree ${tree}`);expect(parents).toEqual(i?[commits[i-1]]:parent?[parent]:[])
      expect(raw.subarray(split+2)).toEqual(Buffer.from(messages[i]))
      const identity='Local fixture <fixture@example.test> 978307200 +0000'
      const expected=Buffer.from(`tree ${tree}\n${parents.map(oid=>`parent ${oid}\n`).join('')}author ${identity}\ncommitter ${identity}\n\n${messages[i]}`)
      expect(raw).toEqual(expected) // The exact ordinary commit-tree encoding, not just graph equivalence.
      return {oid,tree,parents,messageBytes:Buffer.byteLength(messages[i]),messageSha256:rawSha256(Buffer.from(messages[i]))}
    })
    expect(at).toBe(objects.length)
    writeFileSync(join(root,`chain-${id}.proof.json`),JSON.stringify(proof,null,2)+'\n',{flag:'wx',mode:0o600})
    return commits
  }
  const baseTree = makeTree(lock()), accepted: string[] = []
  if(baselineCount>1) accepted.push(...chain(baseTree,null,batchMessages(Array.from({length:baselineCount},(_,i)=>`baseline-${i}\n`))))
  else accepted.push(commit(baseTree,[], 'baseline-0\n'))
  const baseline = accepted.at(-1)!
  git(['update-ref','refs/heads/baseline',baseline])
  const evidence = await initializeEvidence({root:join(root,'owned'),repositories:[repository],owner:'metadata-test'})
  const closure = await evidence.writeBlob(Buffer.from('fixture executable closure\n'))
  const context = {baseline,baselineTree:baseTree,trustedTools:baseline,gitBinary:'/usr/bin/git',toolsetSha256:hash,executableClosure:closure}
  const journals = new Map<string, LocalRevisionEvidence>()
  const revalidateJournal = vi.fn(async (facts: LocalJournalFacts) => {
    const retained = journals.get(facts.candidate.oid)
    if (!retained) throw new Error('OWNED_JOURNAL_MISSING')
    // Fixture verifier reconstructs exact local journal/ref/plan/authority binding;
    // it deliberately does not stand in for Task 5's provider authority verifier.
    const recorded = parseStrictJson(await evidence.readJournal(retained.journal))
    expect(recorded).toEqual({anchor:retained.anchor,candidate:facts.candidate.oid,tree:facts.candidate.tree,parent:facts.parent.oid,planSha256:digest('plan',retained.plan)})
    expect(git(['rev-parse',`refs/shared-update/local/${digest('plan',retained.plan)}`])).toBe(facts.candidate.oid)
    expect(Buffer.from(await evidence.readBlob(retained.authority[0])).toString()).toBe('fixture-source-authority\n')
    return retained
  })
  const inspectLocal = createLocalMetadataInspector({repository,evidence,trustedContext:async()=>context,revalidateJournal})
  const timing={fixtureSetupMilliseconds:0,firstScanStartMilliseconds:null as number|null,scans:[] as {milliseconds:number;status:string;counts:unknown}[]}
  const inspect:typeof inspectLocal=async request=>{
    if(timing.firstScanStartMilliseconds===null) timing.firstScanStartMilliseconds=milliseconds()
    const at=milliseconds(),result=await inspectLocal(request)
    timing.scans.push({milliseconds:milliseconds()-at,status:result.status,counts:result.counts})
    writeFileSync(join(root,'fixture-timings.json'),JSON.stringify(timing,null,2)+'\n',{mode:0o600})
    return result
  }
  async function bot(parent = baseline, previous: string | null = null, oldNext = sourceOld, target = sourceNext, files: Record<string,string> = {}) {
    const beforeBytes = Buffer.from(lock(oldNext)), before = {path:lockPath,sha256:rawSha256(beforeBytes),current:sourceOld,next:oldNext}
    const patch = patchNextLock({subject,before,bytes:beforeBytes,target,mode:'100644'})
    const afterBlob = await evidence.writeBlob(patch.bytes), report = await evidence.writeBlob(Buffer.from(`fixture report ${target}\n`))
    const plan: UpdateUnitPlan = {kind:'shared-update-unit',schemaVersion:1,unitKey:'sdk-manual:rust',subjects:[subject],membersSha256:hash,reports:[report],
      nextEdits:[{subject,before,target,afterBlob}],disposition:'candidate',holdReasons:[],semanticInputSha256:hash}
    const revision: BotRevision = {kind:'shared-update-revision',schemaVersion:1,unitKey:plan.unitKey,subjects:[subject],parentHead:parent,master:baseline,dev:baseline,tools:baseline,
      memberSetSha256:hash,planSha256:digest('plan',plan),previousBotCommit:previous,lockDeltas:[{path:lockPath,current:sourceOld,oldNext,next:target}],preservedHumanHeads:[]}
    const tree = makeTree(patch.text, files), oid = exactCommit(tree,[parent],encodeRevisionMessage(revision).commitMessage)
    const rawDiff = gitBytes(['diff-tree','--raw','-r','-z','--no-renames','--no-commit-id',parent,oid])
    const diff = await evidence.writeBlob(rawDiff), validation = await evidence.writeBlob(Buffer.from('fixture fresh validation\n')), authority = await evidence.writeBlob(Buffer.from('fixture-source-authority\n'))
    const proof: CandidateSnapshotProof = {prepared: parent===baseline ? {kind:'new',master:baseline,base:parent,tree:baseTree} : {kind:'existing',master:baseline,humanHead:parent,base:parent,tree:git(['rev-parse',`${parent}^{tree}`]),mergeEvidence:diff,preservationEvidence:diff},
      candidate:oid,candidateTree:tree,patch:diff,preservedHumanHeads:[],trustedToolsetSha256:hash,executableClosure:closure,nextEdits:plan.nextEdits}
    const journalBytes = canonicalBytes({anchor:{commit:baseline,tree:baseTree},candidate:oid,tree,parent,planSha256:digest('plan',plan)})
    const name = `journal-${serial++}.json`; await evidence.writeJournal(name,journalBytes)
    const journal = {path:name,sha256:rawSha256(journalBytes),bytes:journalBytes.length}
    const local: LocalRevisionEvidence = {anchor:{commit:baseline,tree:baseTree},journal,plan,proof,originalReports:[report],validation,authority:[authority]}
    git(['update-ref',`refs/shared-update/local/${digest('plan',plan)}`,oid]); journals.set(oid,local)
    return {oid,tree,revision,local}
  }
  timing.fixtureSetupMilliseconds=milliseconds()
  return {root,repository,git,gitBytes,makeTree,commit,exactCommit,chain,batchMessages,baseTree,baseline,accepted,evidence,context,journals,revalidateJournal,inspect,bot}
}

describe('long accepted baseline with independently inspected local revisions', () => {
  let history: Readonly<{baseline:string;k:string;h:string;donor:string;merged:string;k2:string;nextEditsJson:string;
    inspect:ReturnType<typeof createLocalMetadataInspector>;refs:()=>string}>
  beforeAll(async () => {
    const started=process.hrtime.bigint(),f=await fixture(320),k=await f.bot()
    const h=f.commit(f.makeTree(lock(sourceNext),{'human.txt':'human\n'}),[k.oid])
    const donor=f.commit(f.makeTree(lock(sourceNext),{'donor.txt':'donor\n'}),[k.oid])
    const tree=f.git(['merge-tree','--write-tree',h,donor]),merged=f.commit(tree,[h,donor])
    const k2=await f.bot(merged,k.oid,sourceNext,'d'.repeat(40),{'human.txt':'human\n','donor.txt':'donor\n'})
    const ids=f.git(['cat-file','--batch-all-objects','--batch-check=%(objectname) %(objecttype)']).split('\n').filter(line=>line.endsWith(' commit')).map(line=>line.split(' ')[0]).sort()
    expect(ids).toHaveLength(325)
    const request=join(f.root,'complete-history.request');writeFileSync(request,ids.join('\n')+'\n',{flag:'wx',mode:0o600})
    const raw=f.gitBytes(['cat-file','--batch'],undefined,request)
    writeFileSync(join(f.root,'complete-history.raw'),raw,{flag:'wx',mode:0o600})
    writeFileSync(join(f.root,'history-setup.json'),JSON.stringify({milliseconds:Number(process.hrtime.bigint()-started)/1e6,commits:ids.length,rawSha256:rawSha256(raw)},null,2)+'\n',{flag:'wx',mode:0o600})
    // Tests receive immutable object IDs/read facades, never writable journals or
    // cached scan results. Every inspect invocation constructs its own full graph.
    history=Object.freeze({baseline:f.baseline,k:k.oid,h,donor,merged,k2:k2.oid,nextEditsJson:JSON.stringify(k.local.plan.nextEdits),inspect:f.inspect,refs:()=>f.git(['show-ref'])})
  })
  it('excludes 320 accepted baseline messages, visits both short merge arms and retains next-only/local-chain proof', metadataCaseBudget, async () => {
    const {baseline,k,h,donor,merged}=history,before=history.refs()
    const result=await history.inspect({master:baseline,head:merged,donorHeads:[donor],journalCandidates:[k]})
    expect(result.status,result.reasons.join('\n')).toBe('local-consistent')
    expect(result.counts).toMatchObject({verificationHeaders:324,metadataCommits:4,mergeCommits:1})
    expect(result.graph.find(item=>item.oid===merged)?.parents).toEqual([h,donor])
    expect(result.revision?.commit).toBe(k)
    expect(result.preservedHeads).toEqual([donor,merged].sort())
    expect(result.evidence[0].proof.nextEdits).toEqual(JSON.parse(history.nextEditsJson))
    expect(history.refs()).toBe(before)
  })
  it('independently resumes K2 over the same complete 320-commit baseline without a cross-call graph cache', metadataCaseBudget, async () => {
    const {baseline,k,k2}=history,before=history.refs()
    const resumed=await history.inspect({master:baseline,head:k2,journalCandidates:[k,k2]})
    expect(resumed.status,resumed.reasons.join('\n')).toBe('local-consistent')
    expect(resumed.revision?.commit).toBe(k2)
    expect(resumed.counts).toMatchObject({verificationHeaders:325,metadataCommits:5,mergeCommits:1})
    expect(history.refs()).toBe(before)
  })
})
it('round trips complete large fixture messages across the pipe boundary with a bounded file transport', metadataCaseBudget, async () => {
  const f=await fixture()
  for(const bytes of [65_535,65_536,67_584,67_585]) {
    const message='x'.repeat(bytes-1)+'\n', oid=f.exactCommit(f.baseTree,[f.baseline],message)
    const raw=f.gitBytes(['cat-file','commit',oid]), at=raw.indexOf('\n\n')
    expect(raw.subarray(at+2)).toEqual(Buffer.from(message))
  }
})
it('constructs identical raw commits and OIDs through batched Git and ordinary commit-tree', metadataCaseBudget, async () => {
  const f=await fixture(),messages=f.batchMessages(['human\n','雪\n','x'.repeat(67_583)+'\n'])
  const batched=f.chain(f.baseTree,f.baseline,messages);let parent=f.baseline
  for(let i=0;i<messages.length;i++) {
    const ordinary=f.exactCommit(f.baseTree,[parent],messages[i])
    expect(batched[i]).toBe(ordinary);parent=ordinary
  }
})
it('treats baseline trailers as historical data and requires local journal proof for existing origins', metadataCaseBudget, async () => {
  const f = await fixture(), k = await f.bot(), before = f.git(['show-ref'])
  expect((await f.inspect({master:f.baseline})).status).toBe('local-consistent')
  const historical = createLocalMetadataInspector({repository:f.repository,evidence:f.evidence,trustedContext:async()=>({...f.context,baseline:k.oid,baselineTree:k.tree,trustedTools:k.oid}),revalidateJournal:f.revalidateJournal})
  const baselineOnly=await historical({master:k.oid})
  expect(baselineOnly.status).toBe('local-consistent'); expect(baselineOnly.revision).toBeNull()
  expect(baselineOnly.counts.metadataCommits).toBe(0); expect(f.revalidateJournal).not.toHaveBeenCalled()
  const forged = f.exactCommit(k.tree,[f.baseline],encodeRevisionMessage(k.revision).commitMessage)
  f.journals.delete(forged)
  const result = await f.inspect({master:f.baseline,head:forged})
  expect(result.status).toBe('hold'); expect(result.reasons).toContain('OWNED_JOURNAL_MISSING')
  expect(result.preservedHeads).toEqual([forged]); expect(f.git(['show-ref'])).toBe(before)
  const noVerifier = createLocalMetadataInspector({repository:f.repository,evidence:f.evidence,trustedContext:async()=>f.context})
  expect((await noVerifier({master:f.baseline,head:k.oid})).reasons).toContain('LOCAL_JOURNAL_REQUIRED')
  const human = f.commit(f.baseTree,[f.baseline])
  expect((await f.inspect({master:f.baseline,head:human})).reasons).toContain('LOCAL_ORIGIN_UNKNOWN')
})
it('authenticates baseline membership on an older second-arm boundary and rejects an unrooted second arm', metadataCaseBudget, async () => {
  const f = await fixture(4), k = await f.bot(), side = f.commit(f.baseTree,[f.accepted[1]])
  const merged = f.commit(k.tree,[k.oid,side])
  const good = await f.inspect({master:f.baseline,head:merged})
  expect(good.status,good.reasons.join('\n')).toBe('local-consistent')
  expect(good.counts.metadataCommits).toBe(3)
  expect(good.boundaries).toContainEqual({from:side,to:f.accepted[1]})
  const foreign = f.commit(f.baseTree,[]), bad = f.commit(k.tree,[k.oid,foreign])
  const result = await f.inspect({master:f.baseline,head:bad})
  expect(result.reasons).toContain('UNROOTED_ARM'); expect(result.preservedHeads).toContain(bad)
  const donorResult = await f.inspect({master:f.baseline,head:k.oid,donorHeads:[side]})
  expect(donorResult.reasons).toContain('LOCAL_ORIGIN_UNKNOWN')
})
it('rejects forged request/journal frontiers, stored coverage and changed trusted execution context', metadataCaseBudget, async () => {
  const f = await fixture(), k = await f.bot(), foreign = f.commit(f.baseTree,[])
  expect((await f.inspect({master:foreign,head:k.oid})).reasons).toContain('TRUSTED_BASELINE_MISMATCH')
  const forged = createLocalMetadataInspector({repository:f.repository,evidence:f.evidence,trustedContext:async()=>f.context,revalidateJournal:async()=>({...k.local,anchor:{commit:foreign,tree:f.baseTree}})})
  expect((await forged({master:f.baseline,head:k.oid})).reasons).toContain('JOURNAL_ANCHOR_MISMATCH')
  const coverage = createLocalMetadataInspector({repository:f.repository,evidence:f.evidence,trustedContext:async()=>f.context,revalidateJournal:async()=>({...k.local,covered:true})})
  expect((await coverage({master:f.baseline,head:k.oid})).status).toBe('hold')
  let calls=0
  const changed = createLocalMetadataInspector({repository:f.repository,evidence:f.evidence,trustedContext:async()=>({...f.context,toolsetSha256:++calls===1?hash:'d'.repeat(64)}),revalidateJournal:f.revalidateJournal})
  expect((await changed({master:f.baseline,head:k.oid})).reasons).toContain('TRUSTED_CONTEXT_CHANGED')
})
it('holds tampered parent/tree/plan/authority/next diff and missing previous commits', metadataCaseBudget, async () => {
  const f = await fixture(), k = await f.bot()
  for (const change of [
    (v:LocalRevisionEvidence)=>({...v,proof:{...v.proof,candidateTree:f.baseTree}}),
    (v:LocalRevisionEvidence)=>({...v,proof:{...v.proof,prepared:{...v.proof.prepared,base:'0'.repeat(40)}}}),
    (v:LocalRevisionEvidence)=>({...v,plan:{...v.plan,membersSha256:'d'.repeat(64)}}),
    (v:LocalRevisionEvidence)=>({...v,authority:[{...v.authority[0],sha256:'0'.repeat(64)}]}),
  ]) {
    const inspect = createLocalMetadataInspector({repository:f.repository,evidence:f.evidence,trustedContext:async()=>f.context,revalidateJournal:async()=>change(k.local)})
    expect((await inspect({master:f.baseline,head:k.oid})).status).toBe('hold')
  }
  const wrongParent = f.exactCommit(k.tree,[f.baseline,k.oid],encodeRevisionMessage(k.revision).commitMessage)
  expect((await f.inspect({master:f.baseline,head:wrongParent})).reasons).toContain('LOCAL_REVISION_PARENT_CHANGED')
  const wrongDiff = f.exactCommit(f.makeTree(lock(sourceNext),{'extra.txt':'not next only'}),[f.baseline],encodeRevisionMessage(k.revision).commitMessage)
  expect((await f.inspect({master:f.baseline,head:wrongDiff})).reasons).toContain('LOCAL_REVISION_NOT_NEXT_ONLY')
  const prior = {...k.revision,previousBotCommit:'0'.repeat(40)}
  const missing = f.exactCommit(k.tree,[f.baseline],encodeRevisionMessage(prior).commitMessage)
  const inspect = createLocalMetadataInspector({repository:f.repository,evidence:f.evidence,trustedContext:async()=>f.context,revalidateJournal:async()=>({...k.local,proof:{...k.local.proof,candidate:missing}})})
  expect((await inspect({master:f.baseline,head:missing})).reasons).toContain('PREVIOUS_REVISION_NOT_ANCESTOR')
  const unrelatedAuthority=await f.evidence.writeBlob(Buffer.from('untrusted-source-authority\n'))
  f.journals.set(k.oid,{...k.local,authority:[unrelatedAuthority]})
  expect((await f.inspect({master:f.baseline,head:k.oid})).status).toBe('hold')
  f.journals.set(k.oid,k.local)
  await f.evidence.writeJournal(k.local.journal.path,Buffer.from('{"anchor":1,"anchor":2}\n'))
  expect((await f.inspect({master:f.baseline,head:k.oid})).status).toBe('hold')
})
it('shares the 256-commit budget across roots and journals without installing or changing any ref', metadataCaseBudget, async () => {
  const f = await fixture(), k = await f.bot()
  const commits=f.chain(k.tree,k.oid,f.batchMessages(Array.from({length:256},()=> 'human\n'))),head=commits.at(-1)!,roots=[k.oid,commits[127]]
  const before=f.git(['show-ref']), result=await f.inspect({master:f.baseline,head,journalCandidates:roots})
  expect(result.reasons).toContain('METADATA_SCAN_LIMIT'); expect(result.counts.metadataCommits).toBe(256)
  expect(result.revision).toBeNull(); expect(result.pendingHeads).toContain(head)
  expect(f.git(['show-ref'])).toBe(before); expect(f.revalidateJournal).not.toHaveBeenCalled()
})
it('holds at 32 relevant merges and at the shared message-byte budget', metadataCaseBudget, async () => {
  const f = await fixture(), k = await f.bot(); let head=k.oid
  for(let i=0;i<33;i++) { const side=f.commit(k.tree,[k.oid]); head=f.commit(k.tree,[head,side]) }
  const result=await f.inspect({master:f.baseline,head})
  expect(result.reasons).toContain('METADATA_SCAN_LIMIT'); expect(result.counts.mergeCommits).toBe(32)
  head=k.oid
  for(let i=0;i<63;i++) head=f.exactCommit(k.tree,[head],`${i}`.padEnd(METADATA_LIMITS.commitMessageBytes-1,'x')+'\n')
  const large=await f.inspect({master:f.baseline,head})
  expect(large.reasons).toContain('METADATA_SCAN_LIMIT'); expect(large.counts.messageBytes).toBeLessThanOrEqual(METADATA_LIMITS.discoveryTotalMessageBytes)
})
it('does not choose between two incomparable locally journaled revisions', metadataCaseBudget, async () => {
  const f=await fixture(), first=await f.bot(), second=await f.bot(f.baseline,null,sourceOld,'d'.repeat(40))
  const head=f.commit(first.tree,[first.oid,second.oid]), before=f.git(['show-ref'])
  const result=await f.inspect({master:f.baseline,head,donorHeads:[second.oid]})
  expect(result.reasons).toContain('INCOMPARABLE_PRIOR_REVISIONS'); expect(result.revision).toBeNull()
  expect(f.git(['show-ref'])).toBe(before)
})
it.each(['shallow','info/grafts','replace'])('rejects %s history even with a cached-looking journal', metadataCaseBudget, async kind => {
  const f=await fixture(), k=await f.bot()
  if(kind==='replace') f.git(['update-ref',`refs/replace/${k.oid}`,f.baseline])
  else { await mkdir(join(f.repository,'info'),{recursive:true}); await writeFile(join(f.repository,kind),f.baseline+'\n') }
  expect((await f.inspect({master:f.baseline,head:k.oid})).reasons).toContain('INCOMPLETE_OR_REWRITTEN_HISTORY')
})
it('holds missing objects, unknown donors, octopus merges and raw message overflow', metadataCaseBudget, async () => {
  const f=await fixture(), k=await f.bot()
  const missing=f.exactCommit(k.tree,[f.baseline],'human\n')
  // A crafted raw commit makes the missing second-parent object explicit without deleting evidence.
  const bytes=f.gitBytes(['cat-file','commit',missing]).toString().replace(`parent ${f.baseline}`,`parent ${f.baseline}\nparent ${'0'.repeat(40)}`)
  const broken=f.git(['hash-object','-t','commit','-w','--stdin'],bytes)
  expect((await f.inspect({master:f.baseline,head:broken})).status).toBe('hold')
  const octopus=f.exactCommit(k.tree,[f.baseline,k.oid,missing],'octopus\n')
  expect((await f.inspect({master:f.baseline,head:octopus})).reasons).toContain('UNSUPPORTED_OCTOPUS_MERGE')
  const tooLarge=f.exactCommit(k.tree,[k.oid],'x'.repeat(METADATA_LIMITS.commitMessageBytes+1))
  expect((await f.inspect({master:f.baseline,head:tooLarge})).reasons).toContain('METADATA_LIMIT_EXCEEDED')
  const donors=Array.from({length:9},(_,i)=>i.toString(16).padStart(40,'0'))
  const tooMany=await f.inspect({master:f.baseline,head:k.oid,donorHeads:donors})
  expect(tooMany.reasons).toContain('METADATA_LIMIT_EXCEEDED'); expect(tooMany.preservedHeads).toHaveLength(10)
})
it('independently hashes P/K tree objects instead of trusting a plausible raw Git diff', metadataCaseBudget, async () => {
  const f=await fixture(), k=await f.bot(), counterfeit='e'.repeat(40)
  const tree=f.gitBytes(['cat-file','tree',k.tree])
  await mkdir(join(f.repository,'objects',counterfeit.slice(0,2)),{recursive:true})
  await writeFile(join(f.repository,'objects',counterfeit.slice(0,2),counterfeit.slice(2)),deflateSync(Buffer.concat([Buffer.from(`tree ${tree.length}\0`),tree])))
  const raw=f.gitBytes(['cat-file','commit',k.oid]).toString().replace(`tree ${k.tree}`,`tree ${counterfeit}`)
  const forged=f.git(['hash-object','-t','commit','-w','--stdin'],raw)
  expect((await f.inspect({master:f.baseline,head:forged})).reasons).toContain('GIT_OBJECT_HASH_MISMATCH')
})
it('bounds expanded leaves globally across cached shared subtrees at exactly 100,000 and one pair over', metadataCaseBudget, async () => {
  const at=await fixture(1,49_999), k=await at.bot()
  const accepted=await at.inspect({master:at.baseline,head:k.oid})
  expect(accepted.status,accepted.reasons.join('\n')).toBe('local-consistent')
  const over=await fixture(1,50_000), overK=await over.bot()
  const held=await over.inspect({master:over.baseline,head:overK.oid})
  expect(held.reasons).toContain('GIT_TREE_SIZE_LIMIT'); expect(over.revalidateJournal).not.toHaveBeenCalled()
})
it('rejects duplicate raw tree names with a bounded set-based parser', metadataCaseBudget, async () => {
  const f=await fixture(), raw=f.gitBytes(['cat-file','tree',f.baseTree])
  const tree=f.git(['hash-object','--literally','-t','tree','-w','--stdin'],Buffer.concat([raw,raw]))
  const baseline=f.exactCommit(tree,[f.baseline],'duplicate names\n')
  const inspect=createLocalMetadataInspector({repository:f.repository,evidence:f.evidence,trustedContext:async()=>({...f.context,baseline,baselineTree:tree,trustedTools:baseline})})
  expect((await inspect({master:baseline})).reasons).toContain('GIT_TREE_INVALID')
})
it('stops incomplete verification on the real deadline and header-count guard', metadataCaseBudget, async () => {
  const f=await fixture(), k=await f.bot()
  const now=vi.spyOn(performance,'now'); let calls=0
  now.mockImplementation(()=>++calls>2?METADATA_LIMITS.verificationMilliseconds+1:0)
  const timed=await f.inspect({master:f.baseline,head:k.oid})
  now.mockRestore()
  expect(timed.reasons).toContain('ANCESTRY_VERIFICATION_LIMIT')
  expect(()=>checkMetadataVerificationBudget(100_000,59_999)).not.toThrow()
  expect(()=>checkMetadataVerificationBudget(100_001,0)).toThrow('ANCESTRY_VERIFICATION_LIMIT')
  expect(()=>checkMetadataVerificationBudget(1,60_000)).toThrow('ANCESTRY_VERIFICATION_LIMIT')
})
