// @vitest-environment node
import { mkdtemp, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { canonicalBytes, digest } from '../../core/updates/canonical'
import { RemoteUpdateRequestSchema, remoteSubjectOverlap, createRemoteRunnerWithRuntime, createRemoteUpdateRunner } from '../../adapters/updates/remote-runner'
import { createRemoteReads, type RemoteTransport } from '../../adapters/updates/remote-github'
import { initializeEvidence, rawSha256 } from '../../adapters/updates/evidence'
import { type LocalUpdateRuntime } from '../../adapters/updates/local-runner'
import { type RemotePolicy } from '../../core/updates/remote'
import { fixtureMaterial } from './fixtures/manual-provider'
import { planUpdateUnit } from '../../core/updates/unit-plan'
import { git, write } from '../build/demo'
const seam=vi.hoisted(()=>({prepare:vi.fn()}))
vi.mock('../../adapters/updates/local-runner',async original=>({...await original<typeof import('../../adapters/updates/local-runner')>(),createLocalRunnerWithRuntime:()=>({prepareRemoteCandidate:seam.prepare})}))
const roots:string[]=[]
afterEach(async()=>{vi.clearAllMocks();for(const root of roots.splice(0))await rm(root,{recursive:true,force:true})})
async function fixture() {
  const root=await realpath(await mkdtemp(join(tmpdir(),'remote-runner-')));roots.push(root)
  const repository=join(root,'repo');await write(repository,'data.txt','fixture\n');await git(repository,'init','-q','-b','master','--template=');await git(repository,'add','.');await git(repository,'commit','-qm','fixture')
  const master=await git(repository,'rev-parse','HEAD'),hash='a'.repeat(64)
  const identity={workflowId:8,workflowPath:'.github/workflows/producer.yml',workflowDefinitionSha256:hash,actorId:7,event:'workflow_dispatch' as const}
  const policy:RemotePolicy={host:'github.com',repositoryId:100,repositoryFullName:'example/zdoc',baseRef:'master',writerActorId:27,sealIdentity:{scheme:'github-app-author-v1',platformSignerActorId:99},allowedHeadPrefixes:['shared-update/'],checkAppId:10,checkName:'exact-validation',producer:identity,validator:{...identity,workflowId:9},producerArtifactName:'producer',validatorArtifactName:'validator'}
  const evidence=await initializeEvidence({root:join(root,'evidence'),repositories:[repository],owner:'fixture'})
  const refs=new Map([['master',master],['dev',master]]),pulls:unknown[]=[];let masterReads=0,race=false
  const requests:string[]=[]
  const transport:RemoteTransport=async request=>{
    requests.push(request.method+' '+request.path)
    const part=new URL(request.path,'https://api.github.com').pathname.replace('/repos/example/zdoc','');let value:unknown
    if(part==='')value={id:100,full_name:'example/zdoc'}
    else if(part==='/pulls')value=pulls
    else if(part==='/git/matching-refs/heads/')value=[]
    else if(part.startsWith('/git/ref/heads/')){const ref=part.slice('/git/ref/heads/'.length),oid=refs.get(ref);if(ref==='master'&&++masterReads>2&&race)value={ref:'refs/heads/master',object:{sha:'b'.repeat(40),type:'commit'}};else if(oid)value={ref:'refs/heads/'+ref,object:{sha:oid,type:'commit'}}}
    return {status:value===undefined?404:200,headers:{},body:canonicalBytes(value??null)}
  }
  const reads=createRemoteReads({policy,evidence,transport}),material=fixtureMaterial({master}),plan=planUpdateUnit([material.collectedReport],[material])
  const planRef=await evidence.writeBlob(canonicalBytes(plan)),empty=await evidence.writeBlob(Buffer.from(''))
  const proof={prepared:{kind:'new' as const,master,base:master,tree:master},candidate:'c'.repeat(40),candidateTree:'d'.repeat(40),patch:empty,preservedHumanHeads:[],trustedToolsetSha256:hash,executableClosure:empty,nextEdits:plan.nextEdits}
  const proofRef=await evidence.writeBlob(canonicalBytes(proof))
  seam.prepare.mockResolvedValue({status:'prepared',reasons:[],operations:[],evidence:[],plan,planRef,proof,proofRef})
  const runtime={master,trustedTools:master,gitBinary:'/usr/bin/git',fresh:async(store:typeof evidence)=>store.writeBlob(Buffer.from('fixture access'))} as LocalUpdateRuntime
  const local={kind:'shared-update-local-request',schemaVersion:1,repository,devRepository:repository,sourceRepository:repository,master,dev:master,sourceTarget:master,comparisonConfig:null,subjects:[material.subject],existing:null,lifecycle:null}
  const request={local,producer:{runId:30,attempt:1,requestId:'producer-30'},validationRequestId:'validate-30'}
  const runner=createRemoteRunnerWithRuntime({runtime,reads,policy,transactionEvidence:evidence,writerCapability:{kind:'fixture-only-remote-writer'}})
  return {root,repository,master,policy,evidence,runtime,reads,refs,pulls,requests,plan,proof,request,runner,race:()=>{race=true},observe:(suffix='one')=>runner.observe(request,join(root,'prepare-'+suffix),join(root,'inspect-'+suffix))}
}
it('derives deterministic intents from fixed bridge facts and keeps all production writes disabled',async()=>{
  const f=await fixture(),first=await f.observe(),second=await f.observe('two')
  expect(first.status,JSON.stringify(first)).toBe('planned');expect(first.operations).toEqual([]);expect(second.intent).toEqual(first.intent)
  expect(first.intent).toMatchObject({master:f.master,unitKey:f.plan.unitKey,planSha256:digest('plan',f.plan),proofSha256:rawSha256(canonicalBytes(f.proof)),expectedHead:null,previousSeal:null})
  expect(first.intent!.stagingRef).toBe('shared-update-staging/'+first.intent!.transactionId)
  expect(await f.runner.apply(first)).toMatchObject({status:'report-only',reasons:['WRITER_DISABLED']})
  expect(f.requests.every(request=>request.startsWith('GET '))).toBe(true)
},30000)
it('rejects arbitrary intent/runtime overrides and forged captures before observing',async()=>{
  const f=await fixture()
  for(const extra of [{runtime:{}},{intent:{}},{trusted:true},{plan:{}},{writerCapability:{}}])expect(()=>RemoteUpdateRequestSchema.parse({...f.request,...extra})).toThrow()
  expect(()=>createRemoteUpdateRunner({capture:{} as never,reads:f.reads,policy:f.policy})).toThrow()
  expect(()=>createRemoteRunnerWithRuntime({runtime:f.runtime,reads:{...f.reads},policy:f.policy})).toThrow('REMOTE_ADAPTER_REQUIRED')
  expect(()=>createRemoteRunnerWithRuntime({runtime:f.runtime,reads:f.reads,policy:{...f.policy,writerActorId:28}})).toThrow('REMOTE_ADAPTER_REQUIRED')
},30000)
it('returns noop without constructing an intent or invoking the writer',async()=>{
  const f=await fixture();seam.prepare.mockResolvedValue({status:'noop',reasons:[],operations:[],evidence:[],plan:f.plan})
  expect(await f.observe()).toEqual({status:'noop',reasons:[],operations:[],evidence:[]})
},30000)
it('holds a remote master race during preparation',async()=>{
  const f=await fixture();f.race();expect(await f.observe()).toMatchObject({status:'held',reasons:['REMOTE_OBSERVATION_CHANGED'],operations:[]})
},30000)
it('holds a deterministic target collision even without a pull request',async()=>{
  const f=await fixture(),target='shared-update/'+rawSha256(canonicalBytes({kind:'remote-unit',unitKey:f.plan.unitKey}));f.refs.set(target,f.master)
  expect(await f.observe()).toMatchObject({status:'held',reasons:['TARGET_COLLISION'],operations:[]})
},30000)
it('does not reopen a closed pull at the deterministic target ref',async()=>{
  const f=await fixture(),headRef='shared-update/'+rawSha256(canonicalBytes({kind:'remote-unit',unitKey:f.plan.unitKey}))
  f.pulls.push({id:20,number:20,base:{repo:{id:100},ref:'master',sha:f.master},head:{repo:{id:100},ref:headRef,sha:f.master},user:{id:27},state:'closed',merged_at:null,draft:true,created_at:'2026-01-01T00:00:00Z'})
  expect(await f.observe()).toMatchObject({status:'held',reasons:['TARGET_COLLISION']})
},30000)
it('recovery ignores phase claims and retains exact receipt/raw qualification holds across new outputs',async()=>{
  const f=await fixture(),observation=await f.observe()
  const marker=await f.evidence.writeBlob(canonicalBytes({kind:'dispatch-attempt',intent:observation.intent!.transactionId}))
  const recovered=await f.runner.reconcile(observation.intent)
  expect((await f.runner.reconcile({...observation.intent,phase:'accepted'})).status).toBe('hold')
  expect(recovered.status).toBe('hold');expect(recovered.reasons).toContain('EXACT_VALIDATION_RECEIPT_REQUIRED');expect(recovered.reasons).toContain('REMOTE_RAW_EVIDENCE_REQUIRED')
  expect((await f.observe('recovery')).intent).toEqual(observation.intent)
  expect(await f.evidence.readBlob(marker)).toEqual(canonicalBytes({kind:'dispatch-attempt',intent:observation.intent!.transactionId}))
  expect(f.requests.every(request=>request.startsWith('GET '))).toBe(true)
},30000)

it('holds unavailable raw Git history without falling back to a new unit',async()=>{
  const f=await fixture(),request={...f.request,local:{...f.request.local,existing:{head:'f'.repeat(40),donorHeads:[],localEvidence:[]}}}
  expect(await f.runner.observe(request,join(f.root,'missing-prepare'),join(f.root,'missing-inspect'))).toMatchObject({status:'held',operations:[]})
  expect(seam.prepare).not.toHaveBeenCalled()
},30000)

it('detects partial subject overlap across unequal authenticated and newly planned unit keys',()=>{
  const alpha={kind:'guides-page' as const,group:'guides' as const,pageId:'alpha'},beta={...alpha,pageId:'beta'},gamma={...alpha,pageId:'gamma'}
  const subjects=new Map([alpha,beta].map(subject=>[Buffer.from(canonicalBytes(subject)).toString('base64'),'authenticated-alpha-beta']))
  expect(remoteSubjectOverlap([alpha],subjects)).toBe(true)
  expect(remoteSubjectOverlap([alpha,gamma],subjects)).toBe(true)
  expect(remoteSubjectOverlap([gamma],subjects)).toBe(false)
})
