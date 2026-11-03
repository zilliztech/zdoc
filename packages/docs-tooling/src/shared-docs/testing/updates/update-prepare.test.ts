// @vitest-environment node
import { appendFile, mkdtemp, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir, release } from 'node:os'
import { basename, join } from 'node:path'
import { afterEach, expect, it } from 'vitest'
import { git, write } from '../build/demo'
import { fixtureMaterial, fixtureSubject } from './fixtures/manual-provider'
import { createLocalRunnerWithRuntime, type LocalFaultHooks, type LocalUpdateRequest, type LocalUpdateRuntime } from '../../adapters/updates/local-runner'
import { LocalTransactionHold } from '../../adapters/updates/transactions'
import { bindClosure } from '../../adapters/updates/toolset'
import { rawSha256 } from '../../adapters/updates/evidence'
import { canonicalBytes, digest } from '../../core/updates/canonical'
import { patchNextLock } from '../../core/updates/transaction'
import { parseLock } from '../../core/lock'
import { captureUnitMaterial } from '../../core/updates/unit-plan'
import { validateUpdateReportEnvelope } from '../../core/updates/envelope'
import { runUpdatePlan, type LocalCommandIO } from '../../commands/update-plan'
import { runUpdatePrepare } from '../../commands/update-prepare'

const roots: string[] = []
afterEach(async context => {
  const owned = roots.splice(0)
  if (context.task.result?.state === 'fail') { console.error(JSON.stringify({kind:'retained-command-fixtures',roots:owned})); return }
  for (const root of owned) {
    if (process.env.ZDOC_TASK6_DIAGNOSTIC === '1') {
      await writeFile(join(tmpdir(),`${basename(root)}-phase-timings.jsonl`),await readFile(join(root,'phase-timings.jsonl')),{flag:'wx',mode:0o600})
      console.error(JSON.stringify({kind:'retained-command-fixture',root})); continue
    }
    await rm(root, {recursive:true,force:true})
  }
})
/** Actual local Git/material/authority-file observations through the internal seam.
 * This is a synthetic manual fixture, never a production SDK provider installation. */
async function fixture(targetText='new source\n') {
  const started=process.hrtime.bigint()
  const root=await realpath(await mkdtemp(join(tmpdir(),'update-prepare-command-'))),repository=join(root,'repository'),source=join(root,'source')
  roots.push(root)
  const mark=async(event:string,detail:unknown=null)=>appendFile(join(root,'phase-timings.jsonl'),JSON.stringify({event,milliseconds:Number(process.hrtime.bigint()-started)/1e6,detail})+'\n',{mode:0o600})
  await mark('fixture.start')
  const sourceUrl='https://github.com/example/transaction-fixture'
  await write(source,'api/Client.md','old source\n');await git(source,'init','-q','-b','main','--template=')
  await git(source,'remote','add','origin',sourceUrl);await git(source,'add','.');await git(source,'commit','-qm','source current')
  const current=await git(source,'rev-parse','HEAD')
  async function advance(text:string) {await write(source,'api/Client.md',text);await git(source,'add','.');await git(source,'commit','-qm','source advance');return git(source,'rev-parse','HEAD')}
  const target=await advance(targetText),lockPath='shared-docs/fixture/lock.yaml'
  await write(repository,lockPath,`schema_version: 1\ncurrent: '${current}'\nnext: '${current}'\n`)
  await write(repository,'content/en/fixture/a.md','local fixture config\n')
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
      const paths=new Set<string>();for(const head of heads)for(const entry of await transaction.tree(head))if(['shared-docs/fixture/','content/en/fixture/'].some(prefix=>entry.path.startsWith(prefix)))paths.add(entry.path)
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
      const initial=fixtureMaterial({current:pins.current,target:request.sourceTarget,master}),report=structuredClone(initial.collectedReport)
      const config=await transaction.blobAt(base.prepared.base,'content/en/fixture/a.md'),configRef=await evidence.writeBlob(config)
      const inventories=[]
      for(const oid of [pins.current,pins.next,request.sourceTarget]) {
        const bytes=await transaction.blobAt(oid,'api/Client.md'),ref=await evidence.writeBlob(bytes)
        inventories.push({entries:[{path:'api/Client.md',sha256:ref.sha256,bytes:ref.bytes}]})
      }
      const authorityBytes=await readFile(authorityPath),eligible=authorityBytes.toString()==='eligible\n'
      const authorityRef=await evidence.writeBlob(authorityBytes),detail=await evidence.writeBlob(canonicalBytes({kind:'synthetic-detail',observation:collections,target:request.sourceTarget}))
      report.pins={...report.pins,master,dev:request.dev,trustedTools:master,configSnapshot:base.prepared.base,configTreeOid:base.prepared.tree,
        comparisonConfig:request.comparisonConfig,toolsetSha256:bound.toolsetSha256,source:{repository:sourceUrl,track:'main',observedTrackHead:head,current:pins.current,oldNext:pins.next,target:request.sourceTarget}}
      report.authority={...report.authority,evidence:[authorityRef],updateState:eligible?'eligible-to-propose':'retired',reasons:eligible?[]:['FIXTURE_AUTHORITY_REVOKED']}
      report.detail.file=detail
      const semantic=report.semanticProjection!
      semantic.source.repository=sourceUrl;semantic.config={entries:[{path:'content/en/fixture/a.md',sha256:configRef.sha256,bytes:configRef.bytes}]}
      semantic.upstream={current:inventories[0],oldNext:inventories[1],target:inventories[2]};semantic.toolsetSha256=bound.toolsetSha256
      semantic.authority={...semantic.authority,state:report.authority.updateState,reasons:report.authority.reasons}
      report.semanticInputSha256=digest('semantic',semantic)
      const targetBytes=await transaction.blobAt(request.sourceTarget,'api/Client.md')
      report.axes=report.axes.map((axis,index)=>({...axis,sourceChanged:!Buffer.from(canonicalBytes(inventories[index])).equals(Buffer.from(canonicalBytes(inventories[2]))),
        contentStatus:targetBytes.toString().includes('FAIL')?'content-failure':'valid'}))
      validateUpdateReportEnvelope(report)
      const beforeRef=await evidence.writeBlob(before),patch=request.sourceTarget===pins.next?null:patchNextLock({subject:fixtureSubject,before:{path:lockPath,current:pins.current,next:pins.next,sha256:beforeRef.sha256},bytes:before,target:request.sourceTarget,mode:'100644'})
      const ids=[pins.current,pins.next,request.sourceTarget,head],history=[]
      for(const oid of [...new Set(ids)]) {const facts=await transaction.commit(oid);history.push({oid,parents:facts.parents})}
      const sourceInventories=await Promise.all(ids.slice(0,3).map(async(oid,index)=>({commit:oid,treeOid:(await transaction.commit(oid)).tree,inventory:await evidence.writeBlob(canonicalBytes(inventories[index])),absentPaths:[]})))
      const context=captureUnitMaterial({...initial,collectedReport:report,reportBlob:await evidence.writeBlob(canonicalBytes(report)),history,sourceInventories,
        lock:{path:lockPath,before:{blob:beforeRef,text:before.toString()},preparedNext:patch?{blob:await evidence.writeBlob(patch.bytes),text:patch.text}:null},relevantSource:semantic.upstream})
      await mark('collect.complete');return {contexts:[context],grouping:{ambiguousExistingSubjects:JSON.parse(await readFile(groupingPath,'utf8'))},holds:[]}
    },
  }
  const request:LocalUpdateRequest={kind:'shared-update-local-request',schemaVersion:1,repository,devRepository:repository,sourceRepository:source,master,dev:master,sourceTarget:target,
    comparisonConfig:null,subjects:[fixtureSubject],existing:null,lifecycle:null}
  const makeRunner=(hooks:LocalFaultHooks={})=>createLocalRunnerWithRuntime(runtime,{afterPhase:async(phase,journal)=>{
    await mark(`journal.${phase}`);await hooks.afterPhase?.(phase,journal)
  }})
  const runner=makeRunner()
  await mark('fixture.complete')
  return {root,source,repository,master,current,target,runtime,runner,request,advance,authorityPath,runtimePath,groupingPath,mark,makeRunner,counts:()=>({collections,accessReads})}
}

async function commandFixture(target = 'new source\n') {
  const f = await fixture(target), request = join(f.root,'request.json'), plan = join(f.root,'plan'), output = join(f.root,'prepared')
  await writeFile(request,JSON.stringify(f.request))
  const dependencies = {preflight:async()=>{},createRunner:async()=>f.runner}
  let stdout = '', stderr = ''
  const io: LocalCommandIO = {write:s=>{stdout+=s},error:s=>{stderr+=s}}
  const planArgs = ['--request',request,'--out',plan]
  const prepareArgs = ['--request',request,'--plan',plan,'--unit','sdk-manual:fixture','--out',output]
  const take = () => { const value = {stdout,stderr}; stdout='';stderr=''; return value }
  return {...f,requestFile:request,plan,output,dependencies,io,planArgs,prepareArgs,take}
}
const state = async (f: Awaited<ReturnType<typeof commandFixture>>) => Promise.all([
  git(f.repository,'show-ref'),git(f.repository,'count-objects','-v'),git(f.source,'show-ref'),git(f.source,'count-objects','-v'),
])
it('dispatches an actual next-only local candidate and revalidates resume without changing input refs',async()=>{
  const f=await commandFixture(), before=await state(f)
  await f.mark('command.plan.start')
  expect(await runUpdatePlan(f.planArgs,f.io,f.dependencies)).toBe(0)
  expect(JSON.parse(f.take().stdout)).toMatchObject({status:'planned',operations:[]})
  await f.mark('command.plan.complete'); await f.mark('command.prepare.start')
  expect(await runUpdatePrepare(f.prepareArgs,f.io,f.dependencies)).toBe(0)
  await f.mark('command.prepare.complete')
  const first=f.take();expect(first.stderr).toBe('')
  const result=JSON.parse(first.stdout);expect(result).toMatchObject({status:'prepared',disposition:'candidate',operations:[]})
  expect(result.candidate).toMatch(/^[a-f0-9]{40}$/)
  expect(await git(join(f.output,'scratch.git'),'diff','--name-only',f.master,result.candidate)).toBe('shared-docs/fixture/lock.yaml')
  const lock=await git(join(f.output,'scratch.git'),'show',`${result.candidate}:shared-docs/fixture/lock.yaml`)
  expect(lock).toContain(f.current);expect(lock).toContain(f.target)
  await f.mark('command.resume.start')
  expect(await runUpdatePrepare([...f.prepareArgs,'--resume'],f.io,f.dependencies)).toBe(0)
  expect(JSON.parse(f.take().stdout)).toMatchObject({status:'reused',candidate:result.candidate,operations:[]})
  expect(await state(f)).toEqual(before)
  await f.mark('command.resume.complete')
},30_000)
it('holds a stale plan with PLAN_CHANGED, no candidate and unchanged input refs',async()=>{
  const f=await commandFixture()
  expect(await runUpdatePlan(f.planArgs,f.io,f.dependencies)).toBe(0);f.take()
  await f.advance('source advanced after plan\n');const before=await state(f)
  expect(await runUpdatePrepare(f.prepareArgs,f.io,f.dependencies)).toBe(0)
  expect(JSON.parse(f.take().stdout)).toMatchObject({status:'held',reasons:['PLAN_CHANGED'],candidate:null,proof:null,operations:[]})
  expect(await git(join(f.output,'scratch.git'),'for-each-ref','refs/shared-update/local')).toBe('')
  expect(await state(f)).toEqual(before)
},15_000)
it('returns exit 2 for an invalid owned output and never replaces existing data',async()=>{
  const f=await commandFixture();await write(f.output,'keep.txt','operator data\n')
  expect(await runUpdatePlan(['--request',f.requestFile,'--out',f.output],f.io,f.dependencies)).toBe(2)
  expect(f.take().stderr).toContain('INVALID_OWNED_OUTPUT');expect(await readFile(join(f.output,'keep.txt'),'utf8')).toBe('operator data\n')
  await expect(stat(join(f.output,'result.json'))).rejects.toMatchObject({code:'ENOENT'})
})
it('returns a completed content-failure observation without authorizing external operations',async()=>{
  const f=await commandFixture('FAIL deterministic source\n')
  expect(await runUpdatePlan(f.planArgs,f.io,f.dependencies)).toBe(0);f.take()
  expect(await runUpdatePrepare(f.prepareArgs,f.io,f.dependencies)).toBe(0)
  expect(JSON.parse(f.take().stdout)).toMatchObject({status:'prepared',disposition:'draft-failure',operations:[]})
},15_000)
