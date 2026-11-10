// @vitest-environment node
import { mkdtemp, readFile, realpath, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { git, write } from '../build/demo'
import { initializeEvidence, rawSha256 } from '../../adapters/updates/evidence'
import { createScratchTransaction, type CandidateInput } from '../../adapters/updates/transactions'
import { canonicalBytes, digest } from '../../core/updates/canonical'
import { patchNextLock } from '../../core/updates/transaction'
import { encodeRevisionMessage, parseRevisionMessage } from '../../core/updates/metadata'
import type { UpdateUnitPlan } from '../../core/updates/envelope'

const lockPath='shared-docs/fixture/lock.yaml'
const lock=(current='1'.repeat(40),next='1'.repeat(40))=>`schema_version: 1\ncurrent: '${current}'\nnext: '${next}'\n`
async function history() {
  const root=await realpath(await mkdtemp(join(tmpdir(),'local-transactions-'))),repository=join(root,'input')
  await write(repository,lockPath,lock());await write(repository,'content/en/fixture/a.md','base\n')
  await git(repository,'init','-q','-b','master','--template=');await git(repository,'add','.');await git(repository,'commit','-qm','base')
  const base=await git(repository,'rev-parse','HEAD')
  async function branch(name:string,from:string,files:Record<string,string>) {
    await git(repository,'checkout','-q','-b',name,from)
    for(const [path,bytes] of Object.entries(files)) await write(repository,path,bytes)
    await git(repository,'add','.');await git(repository,'commit','-qm',name)
    return git(repository,'rev-parse','HEAD')
  }
  async function scratch(name:string,heads:string[]) {
    const evidence=await initializeEvidence({root:join(root,name),repositories:[repository],owner:'transaction-fixture'})
    const transaction=await createScratchTransaction({evidence,gitBinary:'/usr/bin/git'})
    await transaction.importObjects(repository,heads)
    return {transaction,evidence}
  }
  async function state() {return {head:await git(repository,'rev-parse','HEAD'),refs:await git(repository,'show-ref'),status:await git(repository,'status','--porcelain'),objects:await git(repository,'count-objects','-v'),lock:await readFile(join(repository,lockPath),'utf8')}}
  return {root,repository,base,branch,scratch,state}
}
const dataPaths=[lockPath,'content/en/fixture/a.md','content/en/fixture/human.md','content/en/fixture/master.md','content/en/fixture/donor1.md','content/en/fixture/donor2.md']
async function candidate(disposition:'candidate'|'draft-failure'='candidate') {
  const f=await history(),before=await f.state(),{transaction,evidence}=await f.scratch('candidate',[f.base])
  const base=await transaction.prepare({master:f.base,donorHeads:[],lockPaths:[lockPath],dataPaths})
  const bytes=await transaction.blobAt(base.prepared.base,lockPath),subject={kind:'sdk-manual' as const,group:'fixture',manualId:'fixture'}
  const beforeLock={path:lockPath,current:'1'.repeat(40),next:'1'.repeat(40),sha256:rawSha256(bytes)},target='2'.repeat(40)
  const patch=patchNextLock({subject,before:beforeLock,bytes,target,mode:'100644'})
  const report=await evidence.writeBlob(canonicalBytes({kind:'synthetic-transaction-report'})),executableClosure=await evidence.writeBlob(Buffer.from('synthetic transaction closure\n'))
  const plan:UpdateUnitPlan={kind:'shared-update-unit',schemaVersion:1,unitKey:'sdk-manual:fixture',subjects:[subject],membersSha256:'3'.repeat(64),reports:[report],
    nextEdits:[{subject,before:beforeLock,target,afterBlob:await evidence.writeBlob(patch.bytes)}],disposition,holdReasons:[],semanticInputSha256:'4'.repeat(64)}
  const value:CandidateInput={base,plan,trustedTools:f.base,dev:f.base,toolsetSha256:'5'.repeat(64),executableClosure,
    revision:{kind:'shared-update-revision',schemaVersion:1,unitKey:plan.unitKey,subjects:plan.subjects,parentHead:base.prepared.base,master:f.base,dev:f.base,tools:f.base,
      memberSetSha256:plan.membersSha256,planSha256:digest('plan',plan),previousBotCommit:null,lockDeltas:[{path:lockPath,current:beforeLock.current,oldNext:beforeLock.next,next:target}],preservedHumanHeads:[]}}
  return {f,before,transaction,evidence,value,patch}
}
describe('isolated ordinary Git preparation',()=>{
  it('reproduces ordinary H+M merges, preserves both donors and never changes input refs or blobs',async()=>{
    const f=await history(),human=await f.branch('human',f.base,{'content/en/fixture/human.md':'human\n'}),master=await f.branch('reviewed',f.base,{'content/en/fixture/master.md':'master\n'})
    const donor1=await f.branch('donor1',human,{'content/en/fixture/donor1.md':'one\n'}),donor2=await f.branch('donor2',human,{'content/en/fixture/donor2.md':'two\n'})
    const before=await f.state(), request={master,head:human,donorHeads:[donor2,donor1],lockPaths:[lockPath],dataPaths}
    const a=await f.scratch('first',[master,human,donor1,donor2]),b=await f.scratch('second',[master,human,donor1,donor2])
    const first=await a.transaction.prepare(request),second=await b.transaction.prepare(request)
    expect(first.prepared).toEqual(second.prepared)
    expect(first.merges).toHaveLength(3)
    expect(first.merges[0].parents).toEqual([human,master])
    for(const merge of first.merges) {
      expect(await a.transaction.commit(merge.commit)).toMatchObject({parents:merge.parents,tree:merge.tree})
      expect(await git(a.transaction.repository,'merge-tree','--write-tree',...merge.parents)).toBe(merge.tree)
    }
    for(const head of [human,donor1,donor2]) expect(await a.transaction.isAncestor(head,first.prepared.base)).toBe(true)
    expect(await git(a.transaction.repository,'remote')).toBe('')
    expect(await f.state()).toEqual(before)
  })
  it('holds text conflicts and same-lock edits on both sides even when bytes agree',async()=>{
    const f=await history(),human=await f.branch('human',f.base,{'content/en/fixture/a.md':'human\n'}),master=await f.branch('reviewed',f.base,{'content/en/fixture/a.md':'master\n'})
    const a=await f.scratch('conflict',[human,master])
    await expect(a.transaction.prepare({master,head:human,donorHeads:[],lockPaths:[lockPath],dataPaths})).rejects.toThrow('MERGE_CONFLICT')
    const text=lock('1'.repeat(40),'2'.repeat(40)),h=await f.branch('human-lock',f.base,{[lockPath]:text}),m=await f.branch('master-lock',f.base,{[lockPath]:text})
    const b=await f.scratch('collision',[h,m])
    await expect(b.transaction.prepare({master:m,head:h,donorHeads:[],lockPaths:[lockPath],dataPaths})).rejects.toThrow('BOTH_SIDES_LOCK_CHANGED')
  })
  it('preserves a master-only current promotion and skips ancestor merges',async()=>{
    const f=await history(),human=await f.branch('human',f.base,{'content/en/fixture/human.md':'human\n'}),master=await f.branch('promotion',f.base,{[lockPath]:lock('2'.repeat(40),'3'.repeat(40))})
    const a=await f.scratch('promotion-output',[human,master])
    const result=await a.transaction.prepare({master,head:human,donorHeads:[f.base],lockPaths:[lockPath],dataPaths})
    expect(Buffer.from(await a.transaction.blobAt(result.prepared.base,lockPath)).toString()).toBe(lock('2'.repeat(40),'3'.repeat(40)))
    expect(result.merges).toHaveLength(1)
    const next=await a.transaction.prepare({master,head:result.prepared.base,donorHeads:[],lockPaths:[lockPath],dataPaths})
    expect(next.prepared.base).toBe(result.prepared.base);expect(next.merges).toEqual([])
  })
})
it.each(['candidate','draft-failure'] as const)('creates a reproducible next-only %s K with a complete raw diff and local CAS',async disposition=>{
  const {f,before,transaction,evidence,value,patch}=await candidate(disposition)
  const proof=await transaction.createCandidate(value),again=await transaction.createCandidate(value)
  expect(proof).toEqual(again)
  expect((await transaction.commit(proof.candidate)).parents).toEqual([value.base.prepared.base])
  expect(parseRevisionMessage((await transaction.commit(proof.candidate)).message)).toEqual(value.revision)
  expect(await transaction.blobAt(proof.candidate,lockPath)).toEqual(Buffer.from(patch.bytes))
  const raw=await evidence.readBlob(proof.patch)
  expect(Buffer.from(raw)).toEqual(await transaction.rawDiff(value.base.prepared.base,proof.candidate))
  expect(Buffer.from(raw).toString().split('\0').filter(Boolean)).toHaveLength(2)
  expect(Buffer.from(raw).toString().split('\0')[1]).toBe(lockPath)
  expect(await transaction.readRef(value.revision.planSha256)).toBeNull()
  await transaction.install(value.revision.planSha256,proof.candidate,null)
  expect(await transaction.readRef(value.revision.planSha256)).toBe(proof.candidate)
  await expect(transaction.install(value.revision.planSha256,f.base,null)).rejects.toThrow('LOCAL_REF_CHANGED')
  expect(await transaction.readRef(value.revision.planSha256)).toBe(proof.candidate)
  expect(await f.state()).toEqual(before)
  expect((await transaction.tree(proof.candidate)).map(entry=>entry.path)).toEqual(['content/en/fixture/a.md',lockPath])
})
it('rejects a hostile extra candidate entry and altered plan bytes before local ref installation',async()=>{
  const {f,transaction,value,patch}=await candidate(),proof=await transaction.createCandidate(value)
  const hostile=await f.branch('hostile',f.base,{[lockPath]:patch.text,'content/en/fixture/human.md':'unapproved\n'})
  await transaction.importObjects(f.repository,[hostile])
  const hostileTree=(await transaction.commit(hostile)).tree
  const counterfeit=await git(transaction.repository,'commit-tree',hostileTree,'-p',f.base,'-m',encodeRevisionMessage(value.revision).commitMessage)
  expect((await transaction.commit(counterfeit)).parents).toEqual([f.base])
  expect(parseRevisionMessage((await transaction.commit(counterfeit)).message)).toEqual(value.revision)
  await expect(transaction.validateCandidate(value,counterfeit)).rejects.toThrow('CANDIDATE_OBJECT_CHANGED')
  const altered={...value,plan:{...value.plan,nextEdits:[{...value.plan.nextEdits[0],afterBlob:{...value.plan.nextEdits[0].afterBlob,sha256:'f'.repeat(64)}}]}}
  await expect(transaction.validateCandidate(altered,proof.candidate)).rejects.toThrow()
  expect(await transaction.readRef(value.revision.planSha256)).toBeNull()
})
it('rejects different commit identity or prose even with the exact tree, parent and revision trailer',async()=>{
  const {transaction,value}=await candidate(),proof=await transaction.createCandidate(value)
  const message=encodeRevisionMessage(value.revision).commitMessage
  for(const text of [message,`Unreviewed extra prose\n\n${message}`]) {
    const forged=await git(transaction.repository,'commit-tree',proof.candidateTree,'-p',value.base.prepared.base,'-m',text)
    expect(forged).not.toBe(proof.candidate)
    expect(parseRevisionMessage((await transaction.commit(forged)).message)).toEqual(value.revision)
    await expect(transaction.validateCandidate(value,forged)).rejects.toThrow('CANDIDATE_OBJECT_CHANGED')
  }
  expect(await transaction.readRef(value.revision.planSha256)).toBeNull()
})
it.each(['config','object-directory'] as const)('rejects scratch %s redirection before Git can write to it',async change=>{
  const f=await history(),{transaction,evidence}=await f.scratch('unsafe-resume',[f.base]),before=await f.state()
  if(change==='config')await writeFile(join(transaction.repository,'config'),'[core]\n bare = true\n[include]\n path = /unexpected/config\n')
  else await symlink(join(f.repository,'.git','objects'),join(transaction.repository,'objects','unsafe'))
  await expect(createScratchTransaction({evidence,gitBinary:'/usr/bin/git',resume:true})).rejects.toThrow(change==='config'?'SCRATCH_CONFIG_CHANGED':'SCRATCH_LAYOUT_UNSUPPORTED')
  expect(await f.state()).toEqual(before)
})

it('reads exact hash-addressed scratch objects without assigning remote provenance',async()=>{
  const f=await history(),{transaction}=await f.scratch('raw-read',[f.base])
  const raw=await transaction.read(f.base,'commit'),facts=await transaction.commit(f.base)
  expect(Buffer.from(raw).toString()).toContain(`tree ${facts.tree}\n`)
  expect(transaction).not.toHaveProperty('remoteOrigin')
  await expect(transaction.read('f'.repeat(40),'commit')).rejects.toThrow()
})

it('remote Git preparation accepts master-only tooling advances but rejects human tools and both-side lock changes',async()=>{
  const f=await history(),human=await f.branch('human',f.base,{'content/en/fixture/human.md':'human\n'}),master=await f.branch('tools',f.base,{'scripts/tool.ts':'reviewed tools\n'})
  const {transaction}=await f.scratch('remote-tools',[human,master])
  const request={master,head:human,donorHeads:[],lockPaths:[lockPath],dataPaths}
  await expect(transaction.prepare(request)).rejects.toThrow('UNREVIEWED_CANDIDATE_DATA')
  const prepared=await transaction.prepareRemote(request)
  expect((await transaction.blobAt(prepared.prepared.base,'scripts/tool.ts')).toString()).toBe('reviewed tools\n')
  expect(await transaction.isAncestor(human,prepared.prepared.base)).toBe(true)
  const unsafe=await f.branch('unsafe',human,{'scripts/unsafe.ts':'human code\n'}),bad=await f.scratch('remote-human-tools',[unsafe,master])
  await expect(bad.transaction.prepareRemote({...request,head:unsafe})).rejects.toThrow('UNREVIEWED_CANDIDATE_DATA')
  const lockHead=await f.branch('lock-human',f.base,{[lockPath]:lock(undefined,'2'.repeat(40))}),lockMaster=await f.branch('lock-master',f.base,{[lockPath]:lock(undefined,'2'.repeat(40))}),locks=await f.scratch('remote-locks',[lockHead,lockMaster])
  await expect(locks.transaction.prepareRemote({...request,master:lockMaster,head:lockHead})).rejects.toThrow('BOTH_SIDES_LOCK_CHANGED')
})
