// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { appendFile, cp, mkdtemp, readFile, readdir, realpath, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { tmpdir, release } from 'node:os'
import { dirname, join } from 'node:path'
import { expect, it, vi } from 'vitest'
import { createBuildDemo, externalImage, git, imageBytes, write } from '../build/demo'
import { fixtureMaterial, fixtureSubject } from './fixtures/manual-provider'
import { collectFixedGuidesUnits, createLocalRunnerWithRuntime, parseLocalUpdateRequest, type LocalFaultHooks, type LocalUpdateRequest, type LocalUpdateRuntime } from '../../adapters/updates/local-runner'
import { LocalTransactionHold } from '../../adapters/updates/transactions'
import { bindClosure } from '../../adapters/updates/toolset'
import { createRemoteRunnerWithRuntime } from '../../adapters/updates/remote-runner'
import { createRemoteReads, type RemoteTransport } from '../../adapters/updates/remote-github'
import { inspectRemoteHistory } from '../../adapters/updates/remote-metadata'
import { encodeSealMessage, type RemotePolicy, type RemoteSealV1 } from '../../core/updates/remote'
import { initializeEvidence } from '../../adapters/updates/evidence'
import { rawSha256 } from '../../adapters/updates/evidence'
import * as evidenceModule from '../../adapters/updates/evidence'
import { canonicalBytes, digest } from '../../core/updates/canonical'
import { patchNextLock } from '../../core/updates/transaction'
import { parseLock } from '../../core/lock'
import { captureUnitMaterial } from '../../core/updates/unit-plan'
import { validateUpdateReportEnvelope } from '../../core/updates/envelope'
import { parseRevisionMessage } from '../../core/updates/metadata'
import * as toolset from '../../adapters/updates/toolset'
import { collectGuidesWithDependencies, GuidesCollectionRequestSchema } from '../../adapters/updates/guides-provider'
import { FakeImageFetcher } from '../../adapters/images'
import type { AuthorityObservation } from '../../core/updates/envelope'

/** Actual local Git/material/authority-file observations through the internal seam.
 * This is a synthetic manual fixture, never a production SDK provider installation. */
async function fixture(targetText='new source\n',guides=false) {
  const subject=guides?{kind:'guides-page' as const,group:'guides' as const,pageId:'alpha'}:fixtureSubject
  const contentPath=guides?'content/en/guides/alpha.mdx':'content/en/fixture/a.md'
  const started=process.hrtime.bigint()
  const root=await realpath(await mkdtemp(join(tmpdir(),'local-runner-'))),repository=join(root,'repository'),source=join(root,'source')
  const mark=async(event:string,detail:unknown=null)=>appendFile(join(root,'phase-timings.jsonl'),JSON.stringify({event,milliseconds:Number(process.hrtime.bigint()-started)/1e6,detail})+'\n',{mode:0o600})
  await mark('fixture.start')
  const sourceUrl='https://github.com/example/transaction-fixture'
  await write(source,'api/Client.md','old source\n');await git(source,'init','-q','-b','main','--template=')
  await git(source,'remote','add','origin',sourceUrl);await git(source,'add','.');await git(source,'commit','-qm','source current')
  const current=await git(source,'rev-parse','HEAD')
  async function advance(text:string) {await write(source,'api/Client.md',text);await git(source,'add','.');await git(source,'commit','-qm','source advance');return git(source,'rev-parse','HEAD')}
  const target=await advance(targetText),lockPath=guides?'shared-docs/guides/pages/alpha/lock.yaml':'shared-docs/fixture/lock.yaml'
  await write(repository,lockPath,`schema_version: 1\ncurrent: '${current}'\nnext: '${current}'\n`)
  await write(repository,contentPath,'local fixture config\n')
  await git(repository,'init','-q','-b','master','--template=');await git(repository,'add','.');await git(repository,'commit','-qm','trusted config')
  const master=await git(repository,'rev-parse','HEAD')
  const authorityPath=join(root,'authority.txt'),runtimePath=join(root,'runtime.txt'),groupingPath=join(root,'grouping.json')
  await writeFile(authorityPath,'eligible\n');await writeFile(runtimePath,'trusted fixture runtime\n')
  await writeFile(groupingPath,'[]')
  const bound=bindClosure({kind:'shared-update-executable-closure',schemaVersion:1,
    hostTcb:{kind:'host-os-tcb',schemaVersion:1,policy:'host-os-tcb-v1',platform:process.platform,release:release(),architecture:process.arch,systemLibraries:'trusted-host-unmeasured'},
    entries:[],packageLocators:[],resolutions:[]},
    {kind:'shared-update-toolset',schemaVersion:1,runtime:{name:'synthetic-local-runtime',version:'1',platform:process.platform,architecture:process.arch},flags:[],environment:[],dependencies:[]})
  let collections=0,accessReads=0
  const runtime:LocalUpdateRuntime={master,trustedTools:master,gitBinary:'/usr/bin/git',toolset:bound.material,closureBytes:bound.bytes,
    async fresh(evidence) {
      await mark('fresh.start')
      const bytes=await readFile(runtimePath);accessReads++
      if(bytes.toString()!=='trusted fixture runtime\n')throw new LocalTransactionHold('TRUSTED_CONTEXT_CHANGED')
      const result=await evidence.writeBlob(canonicalBytes({kind:'synthetic-fresh-access',sha256:rawSha256(bytes),observation:accessReads}))
      await mark('fresh.complete');return result
    },
    async dataPaths(transaction,heads) {
      const paths=new Set<string>();for(const head of heads)for(const entry of await transaction.tree(head))if(['shared-docs/fixture/','content/en/fixture/',...(guides?['shared-docs/guides/','content/en/guides/']:[])].some(prefix=>entry.path.startsWith(prefix)))paths.add(entry.path)
      return [...paths].sort()
    },
    async compare(transaction,head,paths) {
      const before=await transaction.tree(master),after=await transaction.tree(head)
      for(const entry of after)if(!paths.includes(entry.path)&&!before.some(old=>old.path===entry.path&&old.oid===entry.oid&&old.mode===entry.mode))throw new LocalTransactionHold('UNREVIEWED_CANDIDATE_DATA')
    },
    async collect({request,base,transaction,evidence}) {
      await mark('collect.start')
      collections++
      const before=await transaction.blobAt(base.prepared.base,lockPath),parsed=parseLock(before.toString())
      if('errors' in parsed)throw new Error('fixture lock invalid')
      const pins=parsed.lock,head=await git(source,'rev-parse','refs/heads/main')
      await transaction.importObjects(source,[pins.current,pins.next,request.sourceTarget,head])
      const initial=fixtureMaterial({subject,...guides?{members:[{logicalId:'alpha',manualId:'guides',token:'shared-alpha',outputPath:'content/en/guides/alpha.mdx',origin:'upstream',current:true,next:true}]}:{},current:pins.current,target:request.sourceTarget,master:request.master}),report=structuredClone(initial.collectedReport)
      const config=await transaction.blobAt(base.prepared.base,contentPath),configRef=await evidence.writeBlob(config)
      const inventories=[]
      for(const oid of [pins.current,pins.next,request.sourceTarget]) {
        const bytes=await transaction.blobAt(oid,'api/Client.md'),ref=await evidence.writeBlob(bytes)
        inventories.push({entries:[{path:'api/Client.md',sha256:ref.sha256,bytes:ref.bytes}]})
      }
      const authorityBytes=await readFile(authorityPath),eligible=authorityBytes.toString()==='eligible\n'
      const authorityRef=await evidence.writeBlob(authorityBytes),detail=await evidence.writeBlob(canonicalBytes({kind:'synthetic-detail',observation:collections,target:request.sourceTarget}))
      report.pins={...report.pins,master:request.master,dev:request.dev,trustedTools:request.master,configSnapshot:base.prepared.base,configTreeOid:base.prepared.tree,
        comparisonConfig:request.comparisonConfig,toolsetSha256:bound.toolsetSha256,source:{repository:sourceUrl,track:'main',observedTrackHead:head,current:pins.current,oldNext:pins.next,target:request.sourceTarget}}
      report.authority={...report.authority,evidence:[authorityRef],updateState:eligible?'eligible-to-propose':'retired',reasons:eligible?[]:['FIXTURE_AUTHORITY_REVOKED']}
      report.detail.file=detail
      const semantic=report.semanticProjection!
      semantic.source.repository=sourceUrl;semantic.config={entries:[{path:contentPath,sha256:configRef.sha256,bytes:configRef.bytes}]}
      semantic.upstream={current:inventories[0],oldNext:inventories[1],target:inventories[2]};semantic.toolsetSha256=bound.toolsetSha256
      semantic.authority={...semantic.authority,state:report.authority.updateState,reasons:report.authority.reasons}
      report.semanticInputSha256=digest('semantic',semantic)
      const targetBytes=await transaction.blobAt(request.sourceTarget,'api/Client.md')
      report.axes=report.axes.map((axis,index)=>({...axis,sourceChanged:!Buffer.from(canonicalBytes(inventories[index])).equals(Buffer.from(canonicalBytes(inventories[2]))),
        contentStatus:targetBytes.toString().includes('FAIL')?'content-failure':'valid'}))
      validateUpdateReportEnvelope(report)
      const beforeRef=await evidence.writeBlob(before),patch=request.sourceTarget===pins.next?null:patchNextLock({subject,before:{path:lockPath,current:pins.current,next:pins.next,sha256:beforeRef.sha256},bytes:before,target:request.sourceTarget,mode:'100644'})
      const ids=[pins.current,pins.next,request.sourceTarget,head],history=[]
      for(const oid of [...new Set(ids)]) {const facts=await transaction.commit(oid);history.push({oid,parents:facts.parents})}
      if(guides){history.length=0;for(const row of (await git(source,'rev-list','--parents',...ids)).split('\n')){const [oid,...parents]=row.split(' ');history.push({oid,parents})}}
      const sourceInventories=await Promise.all(ids.slice(0,3).map(async(oid,index)=>({commit:oid,treeOid:(await transaction.commit(oid)).tree,inventory:await evidence.writeBlob(canonicalBytes(inventories[index])),absentPaths:[]})))
      const context=captureUnitMaterial({...initial,collectedReport:report,reportBlob:await evidence.writeBlob(canonicalBytes(report)),history,sourceInventories,
        lock:{path:lockPath,before:{blob:beforeRef,text:before.toString()},preparedNext:patch?{blob:await evidence.writeBlob(patch.bytes),text:patch.text}:null},relevantSource:semantic.upstream})
      await mark('collect.complete');return {contexts:[context],grouping:{ambiguousExistingSubjects:JSON.parse(await readFile(groupingPath,'utf8'))},holds:[]}
    },
  }
  const request:LocalUpdateRequest={kind:'shared-update-local-request',schemaVersion:1,repository,devRepository:repository,sourceRepository:source,master,dev:master,sourceTarget:target,
    comparisonConfig:null,subjects:[subject],existing:null,lifecycle:null}
  const makeRunner=(hooks:LocalFaultHooks={})=>createLocalRunnerWithRuntime(runtime,{afterPhase:async(phase,journal)=>{
    await mark(`journal.${phase}`);await hooks.afterPhase?.(phase,journal)
  }})
  const runner=makeRunner()
  await mark('fixture.complete')
  return {root,source,repository,master,current,target,runtime,runner,request,subject,lockPath,contentPath,advance,authorityPath,runtimePath,groupingPath,mark,makeRunner,counts:()=>({collections,accessReads})}
}
type Fixture=Awaited<ReturnType<typeof fixture>>
const unit='sdk-manual:fixture'
const readJson=async(path:string)=>JSON.parse(await readFile(path,'utf8'))
async function originalState(f:Fixture) {
  return Promise.all([git(f.repository,'show-ref'),git(f.repository,'count-objects','-v'),git(f.repository,'status','--porcelain'),
    git(f.source,'show-ref'),git(f.source,'count-objects','-v'),git(f.source,'status','--porcelain')])
}
async function files(root:string):Promise<Record<string,string>> {
  const result:Record<string,string>={}
  for(const entry of await readdir(root,{withFileTypes:true})) {
    if(entry.isDirectory())for(const [path,hash] of Object.entries(await files(join(root,entry.name))))result[`${entry.name}/${path}`]=hash
    else result[entry.name]=rawSha256(await readFile(join(root,entry.name)))
  }
  return result
}
async function installed(f:Fixture) {
  const plan=join(f.root,'plan'),output=join(f.root,'installed')
  await f.mark('plan.start');expect((await f.runner.plan(f.request,plan)).status).toBe('planned');await f.mark('plan.complete')
  await f.mark('prepare.start');const result=await f.runner.prepare(f.request,plan,unit,output);await f.mark('prepare.complete',result)
  expect(result.status,result.reasons.join('\n')).toBe('prepared')
  return {plan,output,result}
}
it('strictly rejects unknown and duplicate local request fields before any output acquisition',async()=>{
  const f=await fixture()
  expect(()=>parseLocalUpdateRequest(Buffer.from(JSON.stringify({...f.request,verified:true})))).toThrow('INVALID_LOCAL_REQUEST')
  expect(()=>parseLocalUpdateRequest(Buffer.from(JSON.stringify(f.request).replace('"schemaVersion":1','"schemaVersion":1,"schemaVersion":1')))).toThrow('INVALID_LOCAL_REQUEST')
  await expect(f.runner.plan({...f.request,provider:'fixture'},join(f.root,'bad-output'))).rejects.toThrow('INVALID_LOCAL_REQUEST')
})
it('freshly plans and prepares real local material while preserving input repositories',async()=>{
  const f=await fixture(),plan=join(f.root,'plan'),output=join(f.root,'prepared')
  const state=async()=>Promise.all([git(f.repository,'show-ref'),git(f.repository,'count-objects','-v'),git(f.source,'show-ref'),git(f.source,'count-objects','-v')])
  const before=await state()
  await f.mark('plan.start')
  expect((await f.runner.plan(f.request,plan)).status).toBe('planned')
  await f.mark('plan.complete');await f.mark('prepare.start')
  const snapshot=await readJson(join(plan,'snapshot.json')),reads=new Map<string,number>(),initialize=evidenceModule.initializeEvidence
  const observer=vi.spyOn(evidenceModule,'initializeEvidence').mockImplementation(async options=>{
    const store=await initialize(options)
    if(options.root===plan) {
      const original=store.readBlob
      store.readBlob=async ref=>{reads.set(ref.path,(reads.get(ref.path)??0)+1);return original.call(store,ref)}
    }
    return store
  })
  let result:Awaited<ReturnType<typeof f.runner.prepare>>
  try {result=await f.runner.prepare(f.request,plan,'sdk-manual:fixture',output)}finally{observer.mockRestore()}
  await f.mark('prepare.complete',result)
  expect(result.status,result.reasons.join('\n')).toBe('prepared');expect(result.operations).toEqual([])
  expect(await git(join(output,'scratch.git'),'rev-parse',`refs/shared-update/local/${result.planSha256}`)).toBe(result.candidate)
  expect(await state()).toEqual(before);expect(f.counts().collections).toBeGreaterThanOrEqual(2)
  // Four independent snapshot checks plus the separate source-to-destination copy.
  expect(reads.get(snapshot.closure.path)).toBe(5)
  expect(f.counts()).toEqual({collections:4,accessReads:8})
  await f.mark('snapshot-read-observations',{reads:Object.fromEntries(reads),...f.counts()})
},15_000)

it.each(['sha256','bytes'] as const)('rejects conflicting snapshot ref %s before acquiring prepare output',async field=>{
  const f=await fixture(),plan=join(f.root,'plan'),output=join(f.root,'conflicting-ref'),before=await originalState(f)
  expect((await f.runner.plan(f.request,plan)).status).toBe('planned')
  const snapshot=await readJson(join(plan,'snapshot.json')),conflict={...snapshot.closure}
  if(field==='sha256')conflict.sha256='f'.repeat(64)
  else conflict.bytes++
  snapshot.collectionEvidence.push(conflict)
  await writeFile(join(plan,'snapshot.json'),canonicalBytes(snapshot))
  await expect(f.runner.prepare(f.request,plan,unit,output)).rejects.toThrow('BLOB_REF_CONFLICT')
  await expect(stat(output)).rejects.toMatchObject({code:'ENOENT'})
  expect(await originalState(f)).toEqual(before)
},15_000)

it.each(['missing','tampered'] as const)('rejects %s snapshot bytes on the first verified read',async change=>{
  const f=await fixture(),plan=join(f.root,'plan'),output=join(f.root,'bad-snapshot-bytes'),before=await originalState(f)
  expect((await f.runner.plan(f.request,plan)).status).toBe('planned')
  const snapshot=await readJson(join(plan,'snapshot.json')),path=join(plan,snapshot.closure.path)
  if(change==='missing')await unlink(path)
  else {const bytes=await readFile(path);bytes[0]^=1;await writeFile(path,bytes)}
  await expect(f.runner.prepare(f.request,plan,unit,output)).rejects.toThrow(change==='missing'?'ENOENT':'BlobRef raw SHA-256 mismatch')
  await expect(stat(output)).rejects.toMatchObject({code:'ENOENT'})
  expect(await originalState(f)).toEqual(before)
},15_000)

it('does not merge different snapshot paths with the same hash',async()=>{
  const f=await fixture(),plan=join(f.root,'plan'),output=join(f.root,'missing-distinct-path'),before=await originalState(f)
  expect((await f.runner.plan(f.request,plan)).status).toBe('planned')
  const snapshot=await readJson(join(plan,'snapshot.json'))
  snapshot.collectionEvidence.push({...snapshot.closure,path:'missing-closure-copy.json'})
  await writeFile(join(plan,'snapshot.json'),canonicalBytes(snapshot))
  await expect(f.runner.prepare(f.request,plan,unit,output)).rejects.toThrow('ENOENT')
  await expect(stat(output)).rejects.toMatchObject({code:'ENOENT'})
  expect(await originalState(f)).toEqual(before)
},15_000)

it.each([
  {phase:'prepared',location:'original'},{phase:'validated',location:'original'},
  {phase:'prepared',location:'destination'},{phase:'validated',location:'destination'},
] as const)('rereads $location snapshot evidence after $phase before the next write boundary',async({phase,location})=>{
  const f=await fixture(),plan=join(f.root,'plan'),output=join(f.root,'changed-snapshot'),before=await originalState(f)
  expect((await f.runner.plan(f.request,plan)).status).toBe('planned')
  const snapshot=await readJson(join(plan,'snapshot.json')),path=join(location==='original'?plan:output,snapshot.closure.path)
  const runner=f.makeRunner({afterPhase:async current=>{
    if(current===phase){const bytes=await readFile(path);bytes[0]^=1;await writeFile(path,bytes)}
  }})
  await expect(runner.prepare(f.request,plan,unit,output)).rejects.toThrow('BlobRef raw SHA-256 mismatch')
  expect((await readJson(join(output,'journal.json'))).phase).toBe(phase)
  expect(await git(join(output,'scratch.git'),'for-each-ref','refs/shared-update/local')).toBe('')
  expect(await originalState(f)).toEqual(before)
},15_000)

// Reviewed case budgets: ordinary plan/prepare 15s, interruption/resume 60s, complete K1/K2 60s.
// Recovery includes planning, an interrupted prepare and a fully revalidated resume.
// Give these combined filesystem/Git stages headroom under complete-gate load.
it.each(['prepared','created','validated','installed'] as const)('revalidates the %s journal after interruption and reuses existing candidate objects',async phase=>{
  const f=await fixture(),plan=join(f.root,'plan'),output=join(f.root,`resume-${phase}`),before=await originalState(f)
  await f.mark('plan.start');expect((await f.runner.plan(f.request,plan)).status).toBe('planned');await f.mark('plan.complete')
  const interrupted=f.makeRunner({afterPhase:async current=>{if(current===phase)throw new Error('FIXTURE_INTERRUPTION')}})
  await f.mark('interrupted-prepare.start')
  await expect(interrupted.prepare(f.request,plan,unit,output)).rejects.toThrow('FIXTURE_INTERRUPTION')
  await f.mark('interrupted-prepare.complete')
  const journal=await readJson(join(output,'journal.json')),counts=f.counts()
  expect(journal.phase).toBe(phase)
  if(phase==='prepared')expect(journal.candidate).toBeNull()
  else expect(journal.candidate).toMatch(/^[a-f0-9]{40}$/)
  if(phase!=='installed')expect(await git(join(output,'scratch.git'),'for-each-ref','refs/shared-update/local')).toBe('')
  await f.mark('resume.start')
  const result=await f.runner.prepare(f.request,plan,unit,output,{resume:true});await f.mark('resume.complete',result)
  expect(result.status,result.reasons.join('\n')).toBe(phase==='installed'?'reused':'prepared')
  if(journal.candidate)expect(result.candidate).toBe(journal.candidate)
  expect(f.counts().collections-counts.collections).toBeGreaterThanOrEqual(3)
  expect(f.counts().accessReads-counts.accessReads).toBeGreaterThanOrEqual(3)
  expect((await readJson(join(output,'journal.json'))).phase).toBe('installed')
  expect(await git(join(output,'scratch.git'),'rev-parse',`refs/shared-update/local/${result.planSha256}`)).toBe(result.candidate)
  expect(await originalState(f)).toEqual(before)
},60_000)

it('revalidates installed K1 at its original target after source advancement and prepares fresh K2',async()=>{
  const f=await fixture(),first=await installed(f),oldFiles=await files(first.output),oldPlan=await files(first.plan)
  const next=await f.advance('second source change\n'),before=await originalState(f)
  const request:LocalUpdateRequest={...f.request,sourceTarget:next,existing:{head:first.result.candidate!,donorHeads:[],localEvidence:[first.output]}}
  const plan=join(f.root,'plan-k2'),output=join(f.root,'prepared-k2')
  await f.mark('history-plan.start')
  const planned=await f.runner.plan(request,plan);await f.mark('history-plan.complete',planned)
  expect(planned.status,planned.reasons.join('\n')).toBe('planned')
  await f.mark('history-prepare.start')
  const result=await f.runner.prepare(request,plan,unit,output);await f.mark('history-prepare.complete',result)
  expect(result.status,result.reasons.join('\n')).toBe('prepared')
  const scratch=join(output,'scratch.git'),message=await git(scratch,'show','-s','--format=%B',result.candidate!)
  const revision=parseRevisionMessage(Buffer.from(message+'\n'))!
  expect(revision.previousBotCommit).toBe(first.result.candidate)
  expect(revision.parentHead).toBe(first.result.candidate)
  expect(revision.lockDeltas).toEqual([{path:'shared-docs/fixture/lock.yaml',current:f.current,oldNext:f.target,next}])
  expect(await git(scratch,'merge-base','--is-ancestor',first.result.candidate!,result.candidate!)).toBe('')
  const validationFiles=await readdir(join(output,'blobs')),validations=[]
  for(const path of validationFiles) {
    try {const value=await readJson(join(output,'blobs',path));if(value.kind==='historical-local-validation')validations.push(value)}catch{}
  }
  expect(validations.length).toBeGreaterThan(0)
  for(const value of validations) {
    expect(value.candidate).toBe(first.result.candidate)
    expect(value.headTransitions).toEqual([{subject:fixtureSubject,target:f.target,before:f.target,after:next,repository:'https://github.com/example/transaction-fixture',track:'main'}])
    for(const ref of [value.snapshot,value.plan,...value.originalReports,...value.freshReports,value.access])expect(rawSha256(await readFile(join(output,ref.path)))).toBe(ref.sha256)
  }
  expect(await files(first.output)).toEqual(oldFiles);expect(await files(first.plan)).toEqual(oldPlan)
  expect(await originalState(f)).toEqual(before)
},60_000)

it('rejects a forward source observation change between the current plan and prepare',async()=>{
  const f=await fixture(),plan=join(f.root,'plan'),output=join(f.root,'changed-source')
  expect((await f.runner.plan(f.request,plan)).status).toBe('planned')
  await f.advance('source advanced after plan\n');const before=await originalState(f)
  const result=await f.runner.prepare(f.request,plan,unit,output)
  expect(result).toMatchObject({status:'held',reasons:['PLAN_CHANGED'],operations:[]})
  expect(await git(join(output,'scratch.git'),'for-each-ref','refs/shared-update/local')).toBe('')
  expect(await originalState(f)).toEqual(before)
},15_000)

it.each(['prepared','validated'] as const)('rechecks current authority after %s before creating or installing K',async phase=>{
  const f=await fixture(),plan=join(f.root,'plan'),output=join(f.root,'revoked'),before=await originalState(f)
  expect((await f.runner.plan(f.request,plan)).status).toBe('planned')
  const runner=f.makeRunner({afterPhase:async current=>{if(current===phase)await writeFile(f.authorityPath,'retired\n')}})
  const result=await runner.prepare(f.request,plan,unit,output)
  expect(result).toMatchObject({status:'held',reasons:['PLAN_CHANGED'],operations:[]})
  const journal=await readJson(join(output,'journal.json'));expect(journal.phase).toBe(phase)
  if(phase==='prepared')expect(journal.candidate).toBeNull()
  expect(await git(join(output,'scratch.git'),'for-each-ref','refs/shared-update/local')).toBe('')
  expect(await originalState(f)).toEqual(before)
},15_000)

it.each(['source','authority','runtime','ref'] as const)('refuses created-only recovery after %s changes',async change=>{
  const f=await fixture(),plan=join(f.root,'plan'),output=join(f.root,'changed-resume')
  expect((await f.runner.plan(f.request,plan)).status).toBe('planned')
  await expect(f.makeRunner({afterPhase:async phase=>{if(phase==='created')throw new Error('FIXTURE_INTERRUPTION')}})
    .prepare(f.request,plan,unit,output)).rejects.toThrow('FIXTURE_INTERRUPTION')
  const journal=await readJson(join(output,'journal.json')),scratch=join(output,'scratch.git'),ref=`refs/shared-update/local/${journal.planSha256}`
  if(change==='source')await f.advance('changed during interruption\n')
  if(change==='authority')await writeFile(f.authorityPath,'retired\n')
  if(change==='runtime')await writeFile(f.runtimePath,'changed runtime\n')
  if(change==='ref')await git(scratch,'update-ref',ref,f.master,'0'.repeat(40))
  const before=await originalState(f)
  const result=await f.runner.prepare(f.request,plan,unit,output,{resume:true})
  expect(result.status).toBe('held');expect(result.operations).toEqual([])
  expect(result.reasons.join(';')).toContain(change==='runtime'?'TRUSTED_CONTEXT_CHANGED':change==='ref'?'LOCAL_REF_CHANGED':'PLAN_CHANGED')
  expect((await readJson(join(output,'journal.json'))).phase).toBe('created')
  expect(await git(scratch,'for-each-ref','--format=%(objectname)',ref)).toBe(change==='ref'?f.master:'')
  expect(await originalState(f)).toEqual(before)
},30_000)

it('revalidates and regenerates a missing installed proof without creating another candidate',async()=>{
  const f=await fixture(),first=await installed(f),journal=await readJson(join(first.output,'journal.json')),before=await originalState(f),counts=f.counts()
  await unlink(join(first.output,journal.proof.path));await unlink(join(first.output,'proof.json'))
  const result=await f.runner.prepare(f.request,first.plan,unit,first.output,{resume:true})
  expect(result.status,result.reasons.join('\n')).toBe('reused');expect(result.candidate).toBe(first.result.candidate)
  expect(rawSha256(await readFile(join(first.output,result.proof!.path)))).toBe(journal.proof.sha256)
  expect(await readJson(join(first.output,'proof.json'))).toEqual(await readJson(join(first.output,result.proof!.path)))
  expect(f.counts().collections-counts.collections).toBeGreaterThanOrEqual(3)
  expect(await originalState(f)).toEqual(before)
},30_000)

it.each(['unit','report','pins'] as const)('rejects altered displayed %s evidence before acquiring prepare output',async kind=>{
  const f=await fixture(),plan=join(f.root,'plan'),output=join(f.root,'tampered'),before=await originalState(f)
  expect((await f.runner.plan(f.request,plan)).status).toBe('planned')
  const path=kind==='pins'?'pins.json':kind==='unit'?`units/${rawSha256(canonicalBytes(unit))}.json`:`reports/${rawSha256(canonicalBytes(fixtureSubject))}.json`
  await writeFile(join(plan,path),'{}')
  await expect(f.runner.prepare(f.request,plan,unit,output)).rejects.toThrow('PLAN_OUTPUT_CHANGED')
  await expect(stat(output)).rejects.toMatchObject({code:'ENOENT'})
  expect(await originalState(f)).toEqual(before)
},15_000)

it('keeps deterministic content failure as a local draft-failure with next-only changes',async()=>{
  const f=await fixture('FAIL deterministic content\n'),before=await originalState(f),value=await installed(f)
  expect(value.result.disposition).toBe('draft-failure');expect(value.result.operations).toEqual([])
  const scratch=join(value.output,'scratch.git')
  expect(await git(scratch,'diff-tree','--no-commit-id','--name-only','-r',f.master,value.result.candidate!)).toBe('shared-docs/fixture/lock.yaml')
  expect((await readdir(value.output)).some(path=>/receipt|publish/i.test(path))).toBe(false)
  expect(await originalState(f)).toEqual(before)
},15_000)

it.each(['rewind','fork'] as const)('rejects historical source %s even when the original target remains an ancestor',async change=>{
  const f=await fixture(),observed=await f.advance('observed beyond original target\n'),first=await installed(f),old=await files(first.output)
  let head=f.target
  if(change==='fork') {
    await git(f.source,'checkout','-q','-b','fork',f.target);head=await f.advance('divergent source\n')
  }
  await git(f.source,'update-ref','refs/heads/main',head,observed)
  const request={...f.request,sourceTarget:head,existing:{head:first.result.candidate!,donorHeads:[],localEvidence:[first.output]}}
  const before=await originalState(f),result=await f.runner.plan(request,join(f.root,'rewritten-history'))
  expect(result.status).toBe('held');expect(result.reasons.join(';')).toContain('HISTORICAL_SOURCE_REWRITTEN')
  expect(await git(f.source,'merge-base','--is-ancestor',f.target,head)).toBe('')
  expect(await files(first.output)).toEqual(old);expect(await originalState(f)).toEqual(before)
},30_000)

it.each(['authority','report','objects'] as const)('rejects historical %s changes without rewriting installed evidence',async change=>{
  const f=await fixture(),first=await installed(f)
  if(change==='authority')await writeFile(f.authorityPath,'retired\n')
  if(change==='report') {
    const journal=await readJson(join(first.output,'journal.json')),snapshot=await readJson(join(first.output,journal.snapshot.path))
    await writeFile(join(first.output,snapshot.contexts[0].reportBlob.path),'tampered report')
  }
  if(change==='objects')await rename(join(f.source,'.git','objects'),join(f.source,'.git','objects-retained'))
  const old=await files(first.output),request={...f.request,existing:{head:first.result.candidate!,donorHeads:[],localEvidence:[first.output]}}
  // Missing/corrupt owned evidence may fail before a result can be durably written;
  // neither such failure nor a classified hold may authorize a local candidate.
  let result
  try{result=await f.runner.plan(request,join(f.root,'invalid-history'))}catch(error){expect(error).toBeInstanceOf(Error)}
  if(result)expect(result.status).toBe('held')
  expect(await files(first.output)).toEqual(old)
},30_000)

it('does not overwrite newly observed unit ambiguity with the submitted grouping',async()=>{
  const f=await fixture(),plan=join(f.root,'plan'),output=join(f.root,'grouping-changed')
  expect((await f.runner.plan(f.request,plan)).status).toBe('planned')
  const runner=f.makeRunner({afterPhase:async phase=>{if(phase==='prepared')await writeFile(f.groupingPath,JSON.stringify([fixtureSubject]))}})
  const result=await runner.prepare(f.request,plan,unit,output)
  expect(result).toMatchObject({status:'held',reasons:['PLAN_CHANGED']})
  expect((await readJson(join(output,'journal.json'))).candidate).toBeNull()
  expect(await git(join(output,'scratch.git'),'for-each-ref','refs/shared-update/local')).toBe('')
},15_000)

it('revalidates historical repository checkout observations and preserves a newly pinned human H',async()=>{
  const f=await fixture(),first=await installed(f),old=await files(first.output)
  // Only the test fixture is changed before the invocation; the runner still only
  // writes its owned scratch database and never fetches into an input repository.
  await git(f.repository,'fetch','--no-tags',join(first.output,'scratch.git'),first.result.candidate!)
  await git(f.repository,'checkout','-q','-b','human',first.result.candidate!)
  await write(f.repository,'content/en/fixture/human.md','preserve human text\n');await git(f.repository,'add','.');await git(f.repository,'commit','-qm','human continuation')
  const human=await git(f.repository,'rev-parse','HEAD'),target=await f.advance('next target after human edit\n'),before=await originalState(f)
  const request:LocalUpdateRequest={...f.request,sourceTarget:target,existing:{head:human,donorHeads:[],localEvidence:[first.output]}}
  const plan=join(f.root,'human-plan'),output=join(f.root,'human-output')
  const planned=await f.runner.plan(request,plan);expect(planned.status,planned.reasons.join('\n')).toBe('planned')
  const result=await f.runner.prepare(request,plan,unit,output)
  expect(result.status,result.reasons.join('\n')).toBe('prepared')
  expect(await git(join(output,'scratch.git'),'show',`${result.candidate}:content/en/fixture/human.md`)).toBe('preserve human text')
  expect(await git(join(output,'scratch.git'),'merge-base','--is-ancestor',human,result.candidate!)).toBe('')
  const snapshot=await readJson(join(plan,'snapshot.json'));expect(snapshot.prepared.prepared.humanHead).toBe(human)
  expect(snapshot.prepared.prepared.base).toBe(human)
  const validations=[]
  for(const path of await readdir(join(output,'blobs')))try{const value=await readJson(join(output,'blobs',path));if(value.kind==='historical-local-validation')validations.push(value)}catch{}
  expect(validations.length).toBeGreaterThan(0)
  for(const value of validations)for(const role of ['repository','dev'])expect(value.checkoutObservations).toContainEqual({role,before:f.master,after:human})
  expect(await files(first.output)).toEqual(old);expect(await originalState(f)).toEqual(before)
},60_000)

it('rejects changed explicit D while inspecting a historical K',async()=>{
  const f=await fixture(),first=await installed(f),old=await files(first.output)
  await write(f.repository,'content/en/fixture/dev.md','changed publication snapshot\n');await git(f.repository,'add','.');await git(f.repository,'commit','-qm','new dev observation')
  const request={...f.request,dev:await git(f.repository,'rev-parse','HEAD'),existing:{head:first.result.candidate!,donorHeads:[],localEvidence:[first.output]}}
  const before=await originalState(f),result=await f.runner.plan(request,join(f.root,'changed-dev'))
  expect(result).toMatchObject({status:'held',reasons:['HISTORICAL_PINS_CHANGED']})
  expect(await files(first.output)).toEqual(old);expect(await originalState(f)).toEqual(before)
},30_000)

it('rejects an incidental repository HEAD change within the current prepare invocation',async()=>{
  const f=await fixture(),plan=join(f.root,'plan'),output=join(f.root,'head-moved')
  expect((await f.runner.plan(f.request,plan)).status).toBe('planned')
  const runner=f.makeRunner({afterPhase:async phase=>{
    if(phase==='prepared') {
      await write(f.repository,'content/en/fixture/human.md','concurrent checkout edit\n');await git(f.repository,'add','.');await git(f.repository,'commit','-qm','concurrent human head')
    }
  }})
  const result=await runner.prepare(f.request,plan,unit,output)
  expect(result).toMatchObject({status:'held',reasons:['PLAN_CHANGED']})
  expect(await git(join(output,'scratch.git'),'for-each-ref','refs/shared-update/local')).toBe('')
  expect((await readJson(join(output,'journal.json'))).candidate).toBeNull()
},15_000)

it('rejects a replaced object-store directory even when HEAD and all object bytes still match',async()=>{
  const f=await fixture(),plan=join(f.root,'plan'),output=join(f.root,'object-store-moved'),objects=join(f.repository,'.git/objects')
  expect((await f.runner.plan(f.request,plan)).status).toBe('planned')
  const before=await originalState(f),originalIdentity=await stat(objects,{bigint:true})
  const runner=f.makeRunner({afterPhase:async phase=>{
    if(phase==='prepared') {
      const retained=join(f.repository,'.git/objects-retained');await rename(objects,retained)
      await cp(retained,objects,{recursive:true,force:false,errorOnExist:true})
    }
  }})
  const result=await runner.prepare(f.request,plan,unit,output)
  expect((await stat(objects,{bigint:true})).ino).not.toBe(originalIdentity.ino)
  expect(result).toMatchObject({status:'held',reasons:['PLAN_CHANGED'],candidate:null,proof:null,operations:[]})
  expect(await git(join(output,'scratch.git'),'for-each-ref','refs/shared-update/local')).toBe('')
  expect(await originalState(f)).toEqual(before)
},15_000)

it('retains a noop plan without creating a candidate or proof',async()=>{
  const f=await fixture(),request={...f.request,sourceTarget:f.current},plan=join(f.root,'noop-plan'),output=join(f.root,'noop-prepare'),before=await originalState(f)
  expect((await f.runner.plan(request,plan)).status).toBe('planned')
  expect((await readJson(join(plan,'snapshot.json'))).plans[0]).toMatchObject({disposition:'noop',nextEdits:[]})
  const result=await f.runner.prepare(request,plan,unit,output)
  expect(result).toMatchObject({status:'held',disposition:'noop',candidate:null,proof:null,operations:[]})
  expect(await git(join(output,'scratch.git'),'for-each-ref','refs/shared-update/local')).toBe('')
  await expect(stat(join(output,'proof.json'))).rejects.toMatchObject({code:'ENOENT'})
  expect(await originalState(f)).toEqual(before)
},15_000)

it('refuses an existing human head without authenticated local origin metadata',async()=>{
  const f=await fixture(),request={...f.request,existing:{head:f.master,donorHeads:[],localEvidence:[]}},output=join(f.root,'unknown-origin'),before=await originalState(f)
  const result=await f.runner.plan(request,output)
  expect(result).toMatchObject({status:'held',reasons:['LOCAL_ORIGIN_UNKNOWN'],candidate:null,proof:null,operations:[]})
  expect(await git(join(output,'scratch.git'),'for-each-ref','refs/shared-update/local')).toBe('')
  expect(await originalState(f)).toEqual(before)
},15_000)

it('holds missing original source observation objects in the historical scratch instead of guessing from the current track',async()=>{
  const f=await fixture(),observed=await f.advance('old observed source\n'),first=await installed(f),scratch=join(first.output,'scratch.git')
  const packs=join(scratch,'objects/pack'),retained=join(f.root,'retained-source-packs');await write(retained,'reason.txt','Test-owned missing-history fault; preserve removed pack bytes.\n')
  let moved=0
  for(const name of await readdir(packs))if(name.endsWith('.idx')) {
    const listing=await git(scratch,'verify-pack','-v',join(packs,name))
    if(listing.split('\n').some(line=>line.startsWith(observed+' commit '))) {
      for(const extension of ['.idx','.pack']) {const file=name.slice(0,-4)+extension;await rename(join(packs,file),join(retained,file))}
      moved++
    }
  }
  expect(moved).toBeGreaterThan(0)
  await expect(git(scratch,'cat-file','-t',observed)).rejects.toThrow()
  // The original source still has this object; historical evidence must not
  // silently substitute that other source for a missing retained journal object.
  expect(await git(f.source,'cat-file','-t',observed)).toBe('commit')
  await git(f.source,'update-ref','refs/heads/main',f.target,observed)
  const before=await originalState(f),old=await files(first.output),output=join(f.root,'missing-history')
  const result=await f.runner.plan({...f.request,existing:{head:first.result.candidate!,donorHeads:[],localEvidence:[first.output]}},output)
  expect(result).toMatchObject({status:'held',candidate:null,proof:null,operations:[]})
  expect(await git(join(output,'scratch.git'),'for-each-ref','refs/shared-update/local')).toBe('')
  expect(await files(first.output)).toEqual(old);expect(await originalState(f)).toEqual(before)
},30_000)

/** Internal runtime seam -> shared production Guides collection body -> provider/B1
 * collector/build -> planner -> Git transaction (NOT the public factory's full chain).
 * Capability/launcher and authority acquisition are explicitly test-local substitutes.
 * This does NOT qualify the measured worker, real access policy or production authority. */
async function guidesFixture(failure=false,authorityState:AuthorityObservation['updateState']='eligible-to-propose') {
  const started=process.hrtime.bigint(),root=await realpath(await mkdtemp(join(tmpdir(),'guides-local-runner-')))
  const mark=async(event:string)=>appendFile(join(root,'phase-timings.jsonl'),JSON.stringify({event,milliseconds:Number(process.hrtime.bigint()-started)/1e6})+'\n')
  await mark('fixture.start')
  const toolsHead=await git(process.cwd(),'rev-parse','HEAD')
  const d=await createBuildDemo(join(root,'inputs'))
  const repository=dirname(dirname(d.sharedDocs)),authorityPath=join(root,'synthetic-authority.json')
  await git(d.repo,'remote','add','origin','https://github.com/milvus-io/milvus-docs')
  await git(repository,'init','-q','-b','master','--template=');await git(repository,'add','shared-docs');await git(repository,'commit','-qm','synthetic Guides configuration')
  const master=await git(repository,'rev-parse','HEAD'),source=await readFile(join(d.repo,'site/en/build-pipeline.md'),'utf8')
  await write(d.repo,'site/en/build-pipeline.md',failure?source.replace('title: Pipeline example\n',''):source.replaceAll('Pipeline example','Forward pipeline example'))
  await git(d.repo,'add','.');await git(d.repo,'commit','-qm','actual Guides source change')
  const target=await git(d.repo,'rev-parse','HEAD'),subject={kind:'guides-page' as const,group:'guides' as const,pageId:'build-pipeline'}
  const authority={kind:'synthetic-guides-authority',subject,repository:'https://github.com/milvus-io/milvus-docs',track:'v3.0.x',state:authorityState}
  await writeFile(authorityPath,canonicalBytes(authority))
  const capture={root:process.cwd(),...bindClosure({kind:'shared-update-executable-closure',schemaVersion:1,
    hostTcb:{kind:'host-os-tcb',schemaVersion:1,policy:'host-os-tcb-v1',platform:process.platform,release:release(),architecture:process.arch,systemLibraries:'trusted-host-unmeasured'},
    entries:[],packageLocators:[],resolutions:[]},{kind:'shared-update-toolset',schemaVersion:1,runtime:{name:'synthetic-guides-runtime',version:'1',platform:process.platform,architecture:process.arch},flags:[],environment:[],dependencies:[]})}
  let launches=0,accessReads=0,authorityReads=0
  vi.spyOn(toolset,'describeTrustedToolset').mockImplementation(value=>{
    expect(value).toBe(capture)
    return {root:process.cwd(),commit:toolsHead,git:'/usr/bin/git',gitVersion:'synthetic-capability/actual-git',runtime:[],hostExclusions:[],
      access:{inspected:0,identity:null,homeRestriction:null,inspectors:[]}}
  })
  vi.spyOn(toolset,'retainTrustedAccessEvidence').mockImplementation(async(value,evidence)=>{
    expect(value).toBe(capture);accessReads++
    return evidence.writeBlob(canonicalBytes({kind:'synthetic-capability-access',observation:accessReads}))
  })
  vi.spyOn(toolset,'compareCandidateToolset').mockImplementation(async(value,candidate)=>{
    expect(value).toBe(capture)
    const original=await git(repository,'ls-tree','-r','-z',master),actual=await git(candidate.root,'ls-tree','-r','-z',candidate.commit)
    const entries=(raw:string)=>new Map(raw.split('\0').filter(Boolean).map(line=>{const [value,path]=line.split('\t');return [path,value]}))
    const before=entries(original),after=entries(actual)
    for(const path of new Set([...before.keys(),...after.keys()]))if(before.get(path)!==after.get(path)) {
      if(!candidate.dataPaths.includes(path)||toolset.protectedToolsetPath(path))throw new LocalTransactionHold('UNREVIEWED_CANDIDATE_DATA')
    }
  })
  vi.spyOn(toolset,'prepareTrustedLauncher').mockImplementation(async value=>{
    expect(value).toBe(capture)
    return {bin:root,cwd:process.cwd(),environment:{},run:async()=>{throw new Error('Unexpected test launcher entry')},
      async runGuidesCollector(data) {
        launches++;await mark(`collector.${launches}.start`)
        const request=GuidesCollectionRequestSchema.parse(data)
        expect(request.trustedTools).toBe(toolsHead);expect(request.sourceRepository).toBe(d.repo)
        const value=await collectGuidesWithDependencies(request,{b1:{fetcher:new FakeImageFetcher(new Map([[externalImage,imageBytes]]))},
          authority:{async observe(input) {
            const bytes=await readFile(authorityPath),observed=JSON.parse(bytes.toString());authorityReads++
            expect(observed.kind).toBe('synthetic-guides-authority');expect(observed.subject).toEqual(input.subject)
            expect(observed.repository).toBe(input.pins.source.repository);expect(observed.track).toBe(input.pins.source.track)
            expect(['eligible-to-propose','unknown','retired']).toContain(observed.state)
            return {provider:'guides-retained-source',subject:input.subject,evidence:[input.retain(bytes)],updateState:observed.state,
              reasons:observed.state==='eligible-to-propose'?[]:['SYNTHETIC_AUTHORITY_UNAVAILABLE']}
          }}})
        await writeFile(join(root,`collection-${launches}.json`),canonicalBytes(value))
        await mark(`collector.${launches}.complete`)
        // Synthetic adapter fixture: no real worker/group settlement is claimed.
        return {value,stdout:'',stderr:'',settlement:{pid:null,born:false,close:null,group:'unknown' as const,signals:[],cleanupErrors:[]}}
      }}
  })
  const request:LocalUpdateRequest={kind:'shared-update-local-request',schemaVersion:1,repository,devRepository:d.dev,sourceRepository:d.repo,
    master,dev:d.devCommit,sourceTarget:target,comparisonConfig:null,subjects:[subject],existing:null,lifecycle:null}
  const state=()=>Promise.all([repository,d.repo,d.dev].flatMap(path=>[git(path,'show-ref'),git(path,'status','--porcelain'),git(path,'count-objects','-v')]))
  const runner=createLocalRunnerWithRuntime({master,trustedTools:toolsHead,gitBinary:'/usr/bin/git',toolset:capture.material,closureBytes:capture.bytes,
    fresh:evidence=>toolset.retainTrustedAccessEvidence(capture,evidence),
    async dataPaths(transaction,heads) {
      const paths=new Set<string>()
      for(const head of heads)for(const entry of await transaction.tree(head))if(['shared-docs/guides/','content/en/guides/','content/en/byoc/'].some(prefix=>entry.path.startsWith(prefix)))paths.add(entry.path)
      return [...paths].sort()
    },
    compare:(transaction,commit,dataPaths)=>toolset.compareCandidateToolset(capture,{root:transaction.repository,commit,dataPaths:[...dataPaths]}),
    collect:input=>collectFixedGuidesUnits(capture,{},input)},{afterPhase:async phase=>mark(`journal.${phase}`)})
  await mark('fixture.complete')
  return {root,d,repository,master,toolsHead,target,subject,authority,authorityPath,request,runner,state,mark,counts:()=>({launches,accessReads,authorityReads})}
}

it.each(['candidate','draft-failure'] as const)('integrates the shared Guides collection body into a local %s through the internal runtime seam',async disposition=>{
  try {
    const f=await guidesFixture(disposition==='draft-failure'),plan=join(f.root,'plan'),output=join(f.root,'prepared'),before=await f.state()
    await f.mark('plan.start');const planned=await f.runner.plan(f.request,plan);await f.mark('plan.complete')
    expect(planned.status,planned.reasons.join('\n')).toBe('planned')
    const snapshot=await readJson(join(plan,'snapshot.json')),unitPlan=snapshot.plans[0]
    expect(unitPlan.disposition).toBe(disposition);expect(unitPlan.nextEdits).toHaveLength(1)
    expect(snapshot.collectionEvidence).toHaveLength(5)
    const observation=await readJson(join(plan,snapshot.collectionEvidence[0].path)),raw=await readJson(join(f.root,'collection-1.json'))
    expect(observation.inventory).toHaveLength(2);expect(observation.holds).toEqual([])
    expect(observation.detailFiles).toHaveLength(4)
    for(const file of observation.detailFiles)expect(await readFile(join(plan,file.blob.path),'utf8')).toBe(raw.detail[file.path])
    expect(snapshot.contexts[0].collectedReport.members.map(member=>member.outputPath)).toEqual(['content/en/guides/tutorials/build-pipeline.mdx','content/en/byoc/tutorials/build-pipeline.md'])
    await f.mark('prepare.start');const result=await f.runner.prepare(f.request,plan,unitPlan.unitKey,output);await f.mark('prepare.complete')
    await f.mark('assertions.start')
    expect(result.status,result.reasons.join('\n')).toBe('prepared');expect(result.disposition).toBe(disposition);expect(result.operations).toEqual([])
    const scratch=join(output,'scratch.git'),lock='shared-docs/guides/pages/build-pipeline/lock.yaml'
    expect(await git(scratch,'diff-tree','--no-commit-id','--name-only','-r',f.master,result.candidate!)).toBe(lock)
    expect(JSON.parse(await git(scratch,'show',`${result.candidate}:${lock}`))).toEqual({schema_version:1,current:f.d.commit,next:f.target})
    const journal=await readJson(join(output,'journal.json')),proof=await readJson(join(output,result.proof!.path))
    expect(journal).toMatchObject({phase:'installed',candidate:result.candidate,proof:result.proof,validation:result.validation})
    expect(proof).toMatchObject({candidate:result.candidate,nextEdits:unitPlan.nextEdits,prepared:snapshot.prepared.prepared})
    expect(rawSha256(await readFile(join(output,'validation.json')))).toBe(result.validation!.sha256)
    for(const ref of snapshot.collectionEvidence)expect(await readFile(join(output,ref.path))).toEqual(await readFile(join(plan,ref.path)))
    const validation=await readJson(join(output,'validation.json'))
    expect(validation.collectionEvidence).toHaveLength(5)
    for(const ref of validation.collectionEvidence)expect(rawSha256(await readFile(join(output,ref.path)))).toBe(ref.sha256)
    expect(f.counts().launches).toBeGreaterThanOrEqual(4);expect(f.counts().authorityReads).toBe(f.counts().launches)
    expect(f.counts().accessReads).toBeGreaterThanOrEqual(f.counts().launches)
    expect(await f.state()).toEqual(before)
    expect(await git(process.cwd(),'rev-parse','HEAD')).toBe(f.toolsHead)
    await f.mark('assertions.complete')
  } finally {vi.restoreAllMocks()}
},40_000)

it.each(['unknown','changed'] as const)('holds %s authority through the actual Guides facade with no local candidate',async kind=>{
  try {
    const f=await guidesFixture(false,kind==='unknown'?'unknown':'eligible-to-propose'),plan=join(f.root,'plan'),output=join(f.root,'prepared'),before=await f.state()
    const planned=await f.runner.plan(f.request,plan),snapshot=await readJson(join(plan,'snapshot.json'))
    if(kind==='unknown') {
      expect(planned.status).toBe('held');expect(snapshot.plans[0]).toMatchObject({disposition:'hold',nextEdits:[]})
    } else {
      expect(planned.status).toBe('planned');await writeFile(f.authorityPath,canonicalBytes({...f.authority,state:'retired'}))
    }
    const result=await f.runner.prepare(f.request,plan,snapshot.plans[0].unitKey,output)
    expect(result).toMatchObject({status:'held',candidate:null,proof:null,operations:[]})
    expect(await git(join(output,'scratch.git'),'for-each-ref','refs/shared-update/local')).toBe('')
    expect(await f.state()).toEqual(before)
  } finally {vi.restoreAllMocks()}
},15_000)

it('keeps production SDK dispatch explicitly uninstalled without launching a collector',async()=>{
  try {
    const f=await guidesFixture(),before=await f.state(),output=join(f.root,'sdk-hold')
    const result=await f.runner.plan({...f.request,subjects:[fixtureSubject]},output)
    expect(result.status).toBe('held');expect(result.reasons).toContain('PROVIDER_NOT_INSTALLED');expect(result.operations).toEqual([])
    expect(f.counts().launches).toBe(0)
    expect(await git(join(output,'scratch.git'),'for-each-ref','refs/shared-update/local')).toBe('')
    expect(await f.state()).toEqual(before)
    expect(await git(process.cwd(),'rev-parse','HEAD')).toBe(f.toolsHead)
  } finally {vi.restoreAllMocks()}
},15_000)

it.each(['missing','tampered'] as const)('rejects %s retained Guides detail bytes before preparing a candidate',async kind=>{
  try {
    const f=await guidesFixture(),plan=join(f.root,'plan'),output=join(f.root,'refused'),before=await f.state()
    expect((await f.runner.plan(f.request,plan)).status).toBe('planned')
    const snapshot=await readJson(join(plan,'snapshot.json')),observation=await readJson(join(plan,snapshot.collectionEvidence[0].path))
    const detail=observation.detailFiles.find(file=>file.path==='guides-impact-v1/report.md').blob
    if(kind==='missing')await rename(join(plan,detail.path),join(f.root,'retained-missing-report.md'))
    else await writeFile(join(plan,detail.path),'tampered retained detail')
    await expect(f.runner.prepare(f.request,plan,snapshot.plans[0].unitKey,output)).rejects.toThrow()
    await expect(stat(output)).rejects.toMatchObject({code:'ENOENT'})
    expect(await f.state()).toEqual(before)
  } finally {vi.restoreAllMocks()}
},15_000)

it('retains full Guides inventory and unavailable-subject diagnostics without inventing reports',async()=>{
  try {
    const f=await guidesFixture(),output=join(f.root,'unavailable'),before=await f.state()
    const result=await f.runner.plan({...f.request,subjects:[{...f.subject,pageId:'not-configured'}]},output)
    expect(result.status).toBe('held');expect(result.reasons).toContain('GUIDES_INPUT_UNAVAILABLE')
    const snapshot=await readJson(join(output,'snapshot.json')),observation=await readJson(join(output,snapshot.collectionEvidence[0].path))
    expect(snapshot.contexts).toEqual([]);expect(snapshot.plans).toEqual([])
    expect(observation.inventory).toHaveLength(2)
    expect(observation.holds[0]).toMatchObject({subject:{...f.subject,pageId:'not-configured'},disposition:'hold'})
    expect(observation.holds[0].diagnostics[0].message).toContain('absent from the committed configured inventory')
    const raw=await readJson(join(f.root,'collection-1.json'))
    for(const file of observation.detailFiles)expect(await readFile(join(output,file.blob.path),'utf8')).toBe(raw.detail[file.path])
    expect(await f.state()).toEqual(before)
  } finally {vi.restoreAllMocks()}
},15_000)

function originZip(files:Map<string,Uint8Array>) {
  const chunks:Buffer[]=[],entries:Buffer[]=[];let offset=0
  for(const [name,data] of files){const bytes=Buffer.from(data),nameBytes=Buffer.from(name);let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}crc=(crc^0xffffffff)>>>0
    const local=Buffer.alloc(30),central=Buffer.alloc(46);local.writeUInt32LE(0x04034b50);local.writeUInt32LE(crc,14);local.writeUInt32LE(bytes.length,18);local.writeUInt32LE(bytes.length,22);local.writeUInt16LE(nameBytes.length,26)
    central.writeUInt32LE(0x02014b50);central.writeUInt32LE(crc,16);central.writeUInt32LE(bytes.length,20);central.writeUInt32LE(bytes.length,24);central.writeUInt16LE(nameBytes.length,28);central.writeUInt32LE(offset,42);chunks.push(local,nameBytes,bytes);entries.push(central,nameBytes);offset+=30+nameBytes.length+bytes.length}
  const directory=Buffer.concat(entries),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.size,8);end.writeUInt16LE(files.size,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...chunks,directory,end])
}
/** API and signatures are fixture code; raw candidate/ancestry bytes are real Git objects. */
async function remoteOrigin(f:Fixture,old:Awaited<ReturnType<typeof installed>>) {
  const scratch=join(old.output,'scratch.git'),candidate=old.result.candidate!
  const journal=await readJson(join(old.output,'journal.json')),snapshot=await readJson(join(old.output,'blobs',journal.snapshot.sha256))
  const plan=await readJson(join(old.output,'blobs',journal.plan.sha256)),proof=await readJson(join(old.output,'proof.json'))
  await git(f.repository,'fetch','--no-tags',scratch,candidate)
  const tree=await git(f.repository,'rev-parse',`${candidate}^{tree}`),time=Number(await git(f.repository,'show','-s','--format=%ct',candidate))+1
  const payload=`tree ${tree}\nparent ${candidate}\nauthor Fixture <fixture@example.test> ${time} +0000\ncommitter Fixture <fixture@example.test> ${time} +0000\n\n`
  const workflow=Buffer.from('name: producer\n'),workflowHash=rawSha256(workflow)
  const policy:RemotePolicy={host:'github.com',repositoryId:100,repositoryFullName:'example/zdoc',baseRef:'master',writerActorId:27,
    sealIdentity:{scheme:'github-app-author-v1',platformSignerActorId:99},allowedHeadPrefixes:['shared-update/'],checkAppId:10,checkName:'exact-validation',
    producer:{workflowId:8,workflowPath:'.github/workflows/producer.yml',workflowDefinitionSha256:workflowHash,actorId:7,event:'workflow_dispatch'},
    validator:{workflowId:9,workflowPath:'.github/workflows/validator.yml',workflowDefinitionSha256:workflowHash,actorId:7,event:'workflow_dispatch'},producerArtifactName:'producer',validatorArtifactName:'validator'}
  const seal:RemoteSealV1={kind:'shared-update-seal',schemaVersion:1,repositoryId:100,transactionId:'a'.repeat(64),unitKey:plan.unitKey,planSha256:digest('plan',plan),proofSha256:rawSha256(canonicalBytes(proof)),master:f.master,dev:f.master,preparedBase:proof.prepared.base,candidate,candidateTree:tree,previousSeal:null,preservedHumanHeads:[],runId:30,runAttempt:1}
  const message=encodeSealMessage(seal),signature='fixture signature\n',unsigned=payload+message
  const signed=payload.replace('\n\n',`\ngpgsig ${signature.trim()}\n\n`)+message
  const sealFile=join(f.root,'seal.raw');await writeFile(sealFile,signed)
  const oid=await git(f.repository,'hash-object','-w','-t','commit',sealFile)
  const members=new Map<string,Uint8Array>([['plan.json',canonicalBytes(plan)],['proof.json',canonicalBytes(proof)]])
  const retained=async(ref:{sha256:string})=>readFile(join(old.output,'blobs',ref.sha256))
  members.set('patch.raw',await retained(proof.patch))
  for(const ref of plan.reports)members.set(`reports/${ref.sha256}.json`,await retained(ref))
  for(const edit of plan.nextEdits)members.set(`locks/${edit.afterBlob.sha256}.yaml`,await retained(edit.afterBlob))
  members.set('provenance.json',canonicalBytes({kind:'shared-update-producer',schemaVersion:1,...Object.fromEntries(Object.entries(seal).filter(([key])=>!['kind','schemaVersion'].includes(key))),seal:oid,requestId:'producer-30',tools:f.master,workflowDefinitionSha256:workflowHash,members:[...members].map(([name,bytes])=>({name,sha256:rawSha256(bytes),bytes:bytes.length}))}))
  const evidence=await initializeEvidence({root:join(f.root,'remote-evidence'),repositories:[f.repository,f.source],owner:'remote-fixture'})
  const archive=originZip(members),artifact={id:30,name:'producer',expired:false,size_in_bytes:archive.length,digest:'sha256:'+rawSha256(archive),workflow_run:{id:30,repository_id:100,head_repository_id:100,head_sha:f.master,head_branch:'master'}}
  const state={master:f.master,dev:f.master,pulls:[] as unknown[],refs:new Map<string,string>()},requests:string[]=[]
  const transport:RemoteTransport=async request=>{
    requests.push(request.method+' '+request.path)
    const url=new URL(request.path,'https://api.github.com'),part=url.pathname.replace('/repos/example/zdoc','');let value:unknown
    if(part==='')value={id:100,full_name:'example/zdoc'}
    else if(part==='/pulls')value=state.pulls
    else if(part==='/git/matching-refs/heads/')value=[]
    else if(part.startsWith('/git/ref/heads/')){const ref=part.slice('/git/ref/heads/'.length),sha=ref==='master'?state.master:ref==='dev'?state.dev:state.refs.get(ref);if(sha)value={ref:'refs/heads/'+ref,object:{sha,type:'commit'}}}
    else if(part==='/actions/runs/30/attempts/1')value={id:30,run_attempt:1,repository:{id:100},head_repository:{id:100},head_sha:f.master,actor:{id:7},event:'workflow_dispatch',workflow_id:8,path:policy.producer.workflowPath,status:'completed',conclusion:'success',check_suite_id:50}
    else if(part==='/actions/workflows/8')value={id:8,path:policy.producer.workflowPath}
    else if(part==='/contents/'+policy.producer.workflowPath)value={type:'file',path:policy.producer.workflowPath,encoding:'base64',content:workflow.toString('base64')}
    else if(part==='/actions/runs/30/artifacts')value={total_count:1,artifacts:[artifact]}
    else if(part==='/actions/artifacts/30')value=artifact
    else if(part==='/actions/artifacts/30/zip')value=archive
    else if(part===`/commits/${oid}`)value={sha:oid,author:{id:27},committer:{id:99},parents:[{sha:candidate}],commit:{tree:{sha:tree},verification:{verified:true,reason:'valid',payload:unsigned,signature}}}
    else if(url.pathname==='/graphql')value={data:{repository:{databaseId:100,object:{oid,author:{user:{databaseId:27}},committer:{user:null},signature:{isValid:true,state:'VALID',wasSignedByGitHub:true,signer:{databaseId:99},payload:unsigned,signature}}}}}
    return {status:value===undefined?404:200,headers:{},body:value instanceof Uint8Array?value:canonicalBytes(value??null)}
  }
  const reads=createRemoteReads({policy,evidence,transport,approvedProducers:[{tools:f.master,...policy.producer,protocol:'shared-update-producer-v1'}]})
  // cat-file must preserve bytes rather than the text wrapper's trim operation.
  const rawObjects={read:async(oid:string,type:'commit'|'tree'|'blob')=>execFileSync('/usr/bin/git',['-C',f.repository,'cat-file',type,oid])}
  return {oid,reads,policy,evidence,objects:rawObjects,plan,proof,snapshot,seal,state,requests}
}
it('bridges genuine remote P K S human history into a fresh candidate across master without a local journal',async()=>{
  const f=await fixture('new source\n',true),old=await installedGuides(f),origin=await remoteOrigin(f,old)
  await git(f.repository,'checkout','-qb','human',origin.oid)
  await write(f.repository,f.contentPath,'human Cloud content\n');await git(f.repository,'add','.');await git(f.repository,'commit','-qm','human content')
  const human=await git(f.repository,'rev-parse','HEAD')
  await git(f.repository,'checkout','master');await write(f.repository,'content/en/guides/master.mdx','master promotion\n');await write(f.repository,'scripts/tool.ts','reviewed current master tools\n');await git(f.repository,'add','.');await git(f.repository,'commit','-qm','master advance')
  const master=await git(f.repository,'rev-parse','HEAD'),target=await f.advance('third source\n')
  const authenticated=await inspectRemoteHistory({head:human,donorHeads:[],master,policy:origin.policy},origin.reads,origin.objects)
  expect(authenticated.status,JSON.stringify(authenticated)).toBe('verified');if(authenticated.status!=='verified')return
  const request={...f.request,master,dev:master,sourceTarget:target,existing:{head:human,donorHeads:[],localEvidence:[]}}
  const currentRuntime={...f.runtime,master,trustedTools:master,async compare(transaction:Parameters<LocalUpdateRuntime['compare']>[0],head:string,paths:readonly string[]){
    const before=new Map((await transaction.tree(master)).map(entry=>[entry.path,entry])),after=new Map((await transaction.tree(head)).map(entry=>[entry.path,entry]))
    for(const path of new Set([...before.keys(),...after.keys()]))if(!paths.includes(path)&&JSON.stringify(before.get(path))!==JSON.stringify(after.get(path)))throw new LocalTransactionHold('UNREVIEWED_CANDIDATE_DATA')
  }}
  const runner=createLocalRunnerWithRuntime(currentRuntime)
  const prepared=await runner.prepareRemoteCandidate(request,join(f.root,'remote-prepared'),{reads:origin.reads,policy:origin.policy,history:authenticated.history,recheck:async()=>{}})
  expect(prepared.status,prepared.reasons.join(';')).toBe('prepared')
  expect(prepared.proof?.prepared.kind).toBe('existing')
  const tx=prepared.transaction!,revision=parseRevisionMessage((await tx.commit(prepared.proof!.candidate)).message)!
  expect(revision.previousBotCommit).toBe(old.result.candidate);expect(revision.master).toBe(master)
  for(const ancestor of [old.result.candidate!,origin.oid,human,master])expect(await tx.isAncestor(ancestor,prepared.proof!.candidate)).toBe(true)
  expect((await tx.blobAt(prepared.proof!.candidate,f.contentPath)).toString()).toBe('human Cloud content\n')
  expect((await tx.blobAt(prepared.proof!.candidate,'scripts/tool.ts')).toString()).toBe('reviewed current master tools\n')
  expect(await readdir(join(f.root,'remote-prepared'))).not.toContain('journal.json')
  const originManifest=await prepared.store!.readBlob(prepared.evidence[0]),retained=JSON.parse(Buffer.from(originManifest).toString())
  for(const ref of retained.batches)await prepared.store!.readBlob(ref)
  const oldProof=retained.records.find((record:{name:string})=>record.name==='proof.json')
  expect(JSON.parse(Buffer.from(await prepared.store!.readBlob(oldProof.blob)).toString())).toEqual(origin.proof)
  origin.state.master=master;origin.state.dev=master;origin.state.refs.set('shared-update/unit',human)
  const pull={id:20,number:20,base:{repo:{id:100},ref:'master',sha:master},head:{repo:{id:100},ref:'shared-update/unit',sha:human},user:{id:27},state:'open',merged_at:null,draft:true,created_at:'2026-01-01T00:00:00Z'}
  origin.state.pulls.push(pull)
  const remote=createRemoteRunnerWithRuntime({runtime:currentRuntime,reads:origin.reads,policy:origin.policy,transactionEvidence:origin.evidence})
  const claims={local:request,producer:{runId:31,attempt:1,requestId:'producer-31'},validationRequestId:'validator-31'}
  const observed=await remote.observe(claims,join(f.root,'observed-prepare'),join(f.root,'observed-inspect'))
  expect(observed.status,observed.reasons.join(';')).toBe('planned')
  expect(observed.intent).toMatchObject({previousSeal:origin.oid,expectedHead:human})
  const observedRaw=execFileSync('/usr/bin/git',['-C',join(f.root,'observed-prepare','scratch.git'),'cat-file','commit',observed.intent!.candidate])
  const observedRevision=parseRevisionMessage(observedRaw.subarray(observedRaw.indexOf('\n\n')+2))
  expect(observedRevision?.previousBotCommit).toBe(old.result.candidate)
  const observedNoop=await remote.observe({...claims,local:{...request,sourceTarget:f.target}},join(f.root,'observed-noop'),join(f.root,'observed-noop-inspect'))
  expect(observedNoop.status,observedNoop.reasons.join(';')).toBe('noop');expect(observedNoop.intent).toBeUndefined()
  origin.state.pulls.push({...pull,id:21,number:21,state:'closed'})
  expect(await remote.observe(claims,join(f.root,'ambiguous-ref'),join(f.root,'ambiguous-inspect'))).toMatchObject({status:'held',reasons:['PULL_REF_AMBIGUOUS']})
  origin.state.pulls.pop()
  const duplicate=await remote.observe({...claims,local:{...request,existing:null}},join(f.root,'duplicate-plan'),join(f.root,'duplicate-inspect'))
  expect(duplicate).toMatchObject({status:'held',reasons:['EXISTING_UNIT_AUTHENTICATION_REQUIRED']})
  expect(origin.requests.every(request=>request.startsWith('GET ')||request==='POST /graphql')).toBe(true)

  const noop=await runner.prepareRemoteCandidate({...request,sourceTarget:f.target},join(f.root,'remote-noop'),{reads:origin.reads,policy:origin.policy,history:authenticated.history,recheck:async()=>{}})
  expect(noop.status,noop.reasons.join(';')).toBe('noop');expect(noop.proof).toBeUndefined()
  const raced=await runner.prepareRemoteCandidate(request,join(f.root,'remote-race'),{reads:origin.reads,policy:origin.policy,history:authenticated.history,recheck:async()=>{throw new LocalTransactionHold('REMOTE_OBSERVATION_CHANGED')}})
  expect(raced).toMatchObject({status:'held',reasons:['REMOTE_OBSERVATION_CHANGED'],operations:[]})
  let originChecks=0
  const missingRoot=join(f.root,'missing-origin'),missing=await runner.prepareRemoteCandidate(request,missingRoot,{reads:origin.reads,policy:origin.policy,history:authenticated.history,recheck:async()=>{if(++originChecks===2)await unlink(join(missingRoot,'blobs',origin.seal.proofSha256))}})
  expect(missing).toMatchObject({status:'held',reasons:['REMOTE_BRIDGE_UNESTABLISHED'],operations:[]})
  expect(await runner.prepareRemoteCandidate(request,join(f.root,'forged'),{reads:origin.reads,policy:origin.policy,history:JSON.parse(JSON.stringify(authenticated.history)),recheck:async()=>{}})).toMatchObject({status:'held',reasons:['REMOTE_HISTORY_CONTEXT_CHANGED'],operations:[]})
  await expect(runner.plan({...request,existing:{...request.existing,localEvidence:[join(f.root,'remote-evidence')]}},join(f.root,'remote-as-local'))).rejects.toThrow()
  await git(f.repository,'checkout','-qb','human-tools',human);await write(f.repository,'scripts/tool.ts','human untrusted tool\n');await git(f.repository,'add','.');await git(f.repository,'commit','-qm','human tool edit')
  const tools=await inspectRemoteHistory({head:await git(f.repository,'rev-parse','HEAD'),donorHeads:[],master,policy:origin.policy},origin.reads,origin.objects)
  expect(tools).toMatchObject({status:'hold',reasons:['HUMAN_EXECUTION_CHANGE']})
},120000)
async function installedGuides(f:Fixture) {
  const plan=join(f.root,'plan'),output=join(f.root,'installed')
  expect((await f.runner.plan(f.request,plan)).status).toBe('planned')
  const snapshot=await readJson(join(plan,'snapshot.json')),unitKey=snapshot.plans[0].unitKey
  const result=await f.runner.prepare(f.request,plan,unitKey,output)
  expect(result.status,result.reasons.join(';')).toBe('prepared');return {plan,output,result}
}
