// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, readFile, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as provider from '../../adapters/updates/guides-provider'
import { release } from 'node:os'
import * as toolset from '../../adapters/updates/toolset'
import { collectRunnerQualification, parseTreeLowerBound, validateDiagnosticSettlement } from './runner-qualification'

const roots:string[]=[]
afterEach(async()=>{vi.restoreAllMocks();await Promise.all(roots.splice(0).map(root=>rm(root,{recursive:true,force:true})))})
const row=(oid:string,size:number,path:string)=>`100644 blob ${oid} ${size}\t${path}\0`
const a='a'.repeat(40),b='b'.repeat(40)
describe('bounded tree lower bound (never a full graph qualification)',()=>{
  it('deduplicates OIDs and distinguishes over-budget from not-proven',()=>{
    expect(parseTreeLowerBound(Buffer.from(row(a,40,'one')+row(a,40,'two')+row(b,30,'three')))).toMatchObject({entries:3,distinctBlobs:2,bytes:70,verdict:'not-proven',complete:true})
    expect(parseTreeLowerBound(Buffer.from(row(a,67108865,'large'))).verdict).toBe('over-budget')
  })
  it.each([row(a,3,'one').slice(0,-1),row(a,3,'one')+row(a,4,'two'),'100644 blob bad 4\tx\0',row(a,1,'x')+row(b,1,'x'),'160000 commit '+a+' -\tsubmodule\0'])('rejects malformed/inconsistent inventories',input=>{
    expect(()=>parseTreeLowerBound(Buffer.from(input))).toThrow()
  })
  it('bounds records/output and handles empty trees conservatively',()=>{
    expect(parseTreeLowerBound(Buffer.alloc(0))).toMatchObject({bytes:0,verdict:'not-proven'})
    expect(()=>parseTreeLowerBound(Buffer.alloc(4*1024*1024+1))).toThrow()
  })
})
it.each([{born:false,close:{code:0,signal:null},group:'absent',cleanupErrors:[]},{born:true,close:null,group:'absent',cleanupErrors:[]},{born:true,close:{code:0,signal:null},group:'unknown',cleanupErrors:[]},{born:true,close:{code:0,signal:null},group:'absent',cleanupErrors:[{}]},{born:true,close:{code:2,signal:null},group:'absent',cleanupErrors:[]}])('refuses incomplete or failed settlement even with exit zero',value=>{
  expect(validateDiagnosticSettlement(value)).toBe(false)
})
it('accepts only an observed clean child settlement',()=>{
  expect(validateDiagnosticSettlement({pid:123,born:true,close:{code:0,signal:null},group:'absent',cleanupErrors:[]})).toBe(true)
})
it('retains redacted held capture and stops before worker; mocked capture never grants qualification',async()=>{
  const root=await realpath(await mkdtemp(join(tmpdir(),'runner-diagnostic-test-')));roots.push(root)
  const spy=vi.spyOn(toolset,'captureTrustedToolset').mockRejectedValue(new Error('secret-canary-do-not-retain'))
  const result=await collectRunnerQualification({toolRoot:process.cwd(),master:await import('../build/demo').then(({git})=>git(process.cwd(),'rev-parse','HEAD')),evidenceRoot:join(root,'evidence')})
  expect(spy).toHaveBeenCalledOnce();expect(spy.mock.calls[0][0].helpers).toBeUndefined()
  expect(result).toMatchObject({kind:'shared-update-runner-diagnostic',schemaVersion:1,productionQualified:false,capture:'held',worker:{status:'not-run'},failure:{phase:'capture',code:'CAPTURE_REFUSED'}})
  expect(JSON.stringify(result)).not.toContain('secret-canary')
  expect(await readFile(join(root,'evidence','diagnostic.json'),'utf8')).not.toContain('secret-canary')
})
it('refuses a mismatched M before calling capture',async()=>{
  const root=await realpath(await mkdtemp(join(tmpdir(),'runner-diagnostic-test-')));roots.push(root)
  const spy=vi.spyOn(toolset,'captureTrustedToolset').mockRejectedValue(new Error('must not call'))
  const result=await collectRunnerQualification({toolRoot:process.cwd(),master:'0'.repeat(40),evidenceRoot:join(root,'evidence')})
  expect(result.capture).toBe('not-run');expect(result.failure?.code).toBe('MASTER_MISMATCH');expect(spy).not.toHaveBeenCalled()
})

function syntheticCapture(master:string){
  const capture={root:process.cwd(),...toolset.bindClosure({kind:'shared-update-executable-closure',schemaVersion:1,hostTcb:{kind:'host-os-tcb',schemaVersion:1,policy:'host-os-tcb-v1',platform:process.platform,release:release(),architecture:process.arch,systemLibraries:'trusted-host-unmeasured'},entries:[],packageLocators:[],resolutions:[]},{kind:'shared-update-toolset',schemaVersion:1,runtime:{name:'synthetic-runtime',version:'1',platform:process.platform,architecture:process.arch},flags:[],environment:[],dependencies:[]})}
  vi.spyOn(toolset,'captureTrustedToolset').mockResolvedValue(capture)
  vi.spyOn(toolset,'describeTrustedToolset').mockReturnValue({root:process.cwd(),commit:master,git:'/usr/bin/git',gitVersion:'synthetic',runtime:[],hostExclusions:[],access:{inspected:0,identity:null,homeRestriction:null,inspectors:[]}})
  return capture
}
it('rejects changed closure bytes before worker and does not retain raw errors',async()=>{
  const root=await realpath(await mkdtemp(join(tmpdir(),'runner-diagnostic-test-')));roots.push(root)
  const {git}=await import('../build/demo'),master=await git(process.cwd(),'rev-parse','HEAD')
  const capture=syntheticCapture(master);capture.bytes[0]^=1
  const worker=vi.spyOn(provider,'createGuidesProvider')
  const result=await collectRunnerQualification({toolRoot:process.cwd(),master,evidenceRoot:join(root,'evidence')})
  expect(result).toMatchObject({capture:'held',worker:{status:'not-run'},closure:null,failure:{phase:'capture',code:'CAPTURE_REFUSED'}})
  expect(worker).not.toHaveBeenCalled()
})
it.each(['held','unsettled'] as const)('synthetic boundary: %s cannot qualify worker; candidate scripts stay untouched',async mode=>{
  const root=await realpath(await mkdtemp(join(tmpdir(),'runner-diagnostic-test-')));roots.push(root)
  const {git}=await import('../build/demo'),master=await git(process.cwd(),'rev-parse','HEAD')
  syntheticCapture(master)
  vi.spyOn(toolset,'verifyTrustedToolset').mockResolvedValue(undefined)
  vi.spyOn(toolset,'retainTrustedAccessEvidence').mockImplementation(async(_capture,evidence)=>evidence.writeBlob(Buffer.from('synthetic-access')))
  const settlement={pid:123,born:true,close:{code:0,signal:null},group:mode==='unsettled'?'unknown':'absent',signals:[],cleanupErrors:[]}
  const collectAll=vi.fn(async()=>({collection:{holds:[]},workerSettlement:settlement}))
  vi.spyOn(provider,'createGuidesProvider').mockResolvedValue({collectAll,planAll:()=>[{disposition:'hold',nextEdits:[]}],getWorkerSettlement:()=>settlement} as unknown as Awaited<ReturnType<typeof provider.createGuidesProvider>>)
  const result=await collectRunnerQualification({toolRoot:process.cwd(),master,evidenceRoot:join(root,'evidence')})
  expect(collectAll).toHaveBeenCalledOnce();expect(result.productionQualified).toBe(false)
  expect(result.worker.status).toBe('held');expect(result.failure?.code).toBe(mode==='unsettled'?'WORKER_UNSETTLED':'WORKER_PREPARATION_HELD')
  expect(result.worker.resultValidated).toBe(mode==='held')
  if(mode==='held')expect(result.worker.tripwireUntouched).toBe(true)
},15000)
it('rejects a captured commit mismatch independently of the checkout M',async()=>{
  const root=await realpath(await mkdtemp(join(tmpdir(),'runner-diagnostic-test-')));roots.push(root)
  const {git}=await import('../build/demo'),master=await git(process.cwd(),'rev-parse','HEAD')
  syntheticCapture('f'.repeat(40))
  const result=await collectRunnerQualification({toolRoot:process.cwd(),master,evidenceRoot:join(root,'evidence')})
  expect(result.capture).toBe('held');expect(result.worker.status).toBe('not-run');expect(result.failure?.code).toBe('CAPTURE_BINDING_MISMATCH')
})
it('rejects caller-selected runtime/capability fields before any capture',async()=>{
  const spy=vi.spyOn(toolset,'captureTrustedToolset')
  await expect(collectRunnerQualification({toolRoot:process.cwd(),master:'a'.repeat(40),evidenceRoot:'/unused',capture:{}} as never)).rejects.toThrow('INVALID_DIAGNOSTIC_BOOTSTRAP')
  expect(spy).not.toHaveBeenCalled()
})
