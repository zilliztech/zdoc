// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import * as provider from '../../adapters/updates/guides-provider'
import { release } from 'node:os'
import * as toolset from '../../adapters/updates/toolset'
import { collectRunnerQualification, parseTreeLowerBound, validateDiagnosticSettlement, classifyCaptureRefusal, captureRefusalReason } from './runner-qualification'

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
it.each([{pid:123,born:false,close:{code:0,signal:null},group:'absent',cleanupErrors:[]},{pid:123,born:true,close:null,group:'absent',cleanupErrors:[]},{pid:123,born:true,close:{code:0,signal:null},group:'unknown',cleanupErrors:[]},{pid:123,born:true,close:{code:0,signal:null},group:'absent',cleanupErrors:[{}]},{pid:123,born:true,close:{code:2,signal:null},group:'absent',cleanupErrors:[]}])('refuses incomplete or failed settlement even with exit zero',value=>{
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
it.each(['held','unsettled','draft-failure'] as const)('synthetic boundary: %s cannot qualify worker; candidate scripts stay untouched',async mode=>{
  const root=await realpath(await mkdtemp(join(tmpdir(),'runner-diagnostic-test-')));roots.push(root)
  const {git}=await import('../build/demo'),master=await git(process.cwd(),'rev-parse','HEAD')
  syntheticCapture(master)
  vi.spyOn(toolset,'verifyTrustedToolset').mockResolvedValue(undefined)
  vi.spyOn(toolset,'retainTrustedAccessEvidence').mockImplementation(async(_capture,evidence)=>evidence.writeBlob(Buffer.from('synthetic-access')))
  const settlement={pid:123,born:true,close:{code:0,signal:null},group:mode==='unsettled'?'unknown':'absent',signals:[],cleanupErrors:[]}
  const collectAll=vi.fn(async()=>({collection:{holds:[]},workerSettlement:settlement}))
  const providerConstructor=vi.spyOn(provider,'createGuidesProvider').mockResolvedValue({collectAll,planAll:()=>[{disposition:mode==='draft-failure'?'draft-failure':'hold',nextEdits:[]}],getWorkerSettlement:()=>settlement} as unknown as Awaited<ReturnType<typeof provider.createGuidesProvider>>)
  const result=await collectRunnerQualification({toolRoot:process.cwd(),master,evidenceRoot:join(root,'evidence')})
  expect(collectAll).toHaveBeenCalledOnce();expect(result.productionQualified).toBe(false)
  const actualFixtureMaster=await git(join(root,'evidence','fixture'),'rev-parse','HEAD')
  expect(providerConstructor.mock.calls[0][0].request.master).toBe(actualFixtureMaster)
  expect(providerConstructor.mock.calls[0][0].request.configSnapshot).toBe(actualFixtureMaster)
  expect(actualFixtureMaster).not.toBe(master);expect(result.master).toBe(master)
  expect(result.worker.status).toBe('held');expect(result.failure?.code).toBe(mode==='unsettled'?'WORKER_UNSETTLED':'WORKER_PREPARATION_HELD')
  expect(result.worker.resultValidated).toBe(mode!=='unsettled')
  if(mode!=='unsettled')expect(result.worker.tripwireUntouched).toBe(true)
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

it('invalid child pid separately refuses otherwise settled worker',()=>{
  expect(validateDiagnosticSettlement({pid:null,born:true,close:{code:0,signal:null},group:'absent',cleanupErrors:[]})).toBe(false)
})
it.each([['Trusted toolset capture is not yet supported on Linux','unsupported-platform'],['Unsafe access mode','access-owner-mode'],['Unsupported ACL access: /private/canary','acl'],['Forbidden ambient execution setting: SECRET','environment'],['Unsupported Python native closure','native'],['Closure material binding mismatch','dependency'],['private-secret-unknown','unknown']])('classifies capture refusal without retaining input %s',(message,category)=>{
  expect(classifyCaptureRefusal(message)).toBe(category)
})
it('cooperative deadline cannot leave capture passed when its phase is held',async()=>{
  const root=await realpath(await mkdtemp(join(tmpdir(),'runner-diagnostic-test-')));roots.push(root)
  const {git}=await import('../build/demo'),master=await git(process.cwd(),'rev-parse','HEAD');syntheticCapture(master)
  let clock=0;vi.spyOn(performance,'now').mockImplementation(()=>clock)
  vi.spyOn(toolset,'verifyTrustedToolset').mockResolvedValue(undefined)
  vi.spyOn(toolset,'retainTrustedAccessEvidence').mockImplementation(async(_capture,evidence)=>{clock=120001;return evidence.writeBlob(Buffer.from('synthetic-access'))})
  const result=await collectRunnerQualification({toolRoot:process.cwd(),master,evidenceRoot:join(root,'evidence')})
  expect(result.capture).toBe('held');expect(result.failure?.code).toBe('COOPERATIVE_DEADLINE');expect(result.worker.status).toBe('not-run')
})

it.each(['shallow','info/grafts','objects/info/alternates'])('refuses ambiguous Git storage %s before capture',async file=>{
  const root=await realpath(await mkdtemp(join(tmpdir(),'runner-diagnostic-test-')));roots.push(root)
  const {git}=await import('../build/demo'),repository=join(root,'repository');await mkdir(repository)
  await git(repository,'init','-q','-b','master','--template=');await writeFile(join(repository,'data'),'fixed data');await git(repository,'add','.');await git(repository,'commit','-qm','fixed input')
  const master=await git(repository,'rev-parse','HEAD'),ambiguous=join(repository,'.git',file)
  await mkdir(dirname(ambiguous),{recursive:true});await writeFile(ambiguous,'')
  const capture=vi.spyOn(toolset,'captureTrustedToolset')
  const result=await collectRunnerQualification({toolRoot:repository,master,evidenceRoot:join(root,'evidence')})
  expect(result.failure?.code).toBe('AMBIGUOUS_GIT_STORAGE');expect(result.capture).toBe('not-run');expect(capture).not.toHaveBeenCalled()
})

it.each([
  ['Unrecognized pnpm virtual-store locator: SECRET-LOCATOR','virtual-store-locator-unknown'],
  ['Installed dependency resolution differs from lock: SECRET -> SECRET','installed-resolution-mismatch'],
  ['Unmeasured dependency escape: /private/SECRET','dependency-escape'],
  ['Unknown dependency discovery entry: SECRET','discovery-entry-unknown'],
  ['Aliased installed package root','installed-package-alias'],
  ['Closure material binding mismatch','closure-binding-mismatch'],
  ['private SECRET unknown','unclassified'],
])('fixed capture refusal reason strips dynamic suffixes',(message,reason)=>{
  expect(captureRefusalReason(new Error(message))).toBe(reason)
})
it('retained capture reason never copies dynamic secret suffix',async()=>{
  const root=await realpath(await mkdtemp(join(tmpdir(),'runner-diagnostic-test-')));roots.push(root)
  const {git}=await import('../build/demo'),master=await git(process.cwd(),'rev-parse','HEAD')
  vi.spyOn(toolset,'captureTrustedToolset').mockRejectedValue(new Error('Installed dependency resolution differs from lock: SECRET-LOCATOR -> SECRET-DEPENDENCY'))
  const result=await collectRunnerQualification({toolRoot:process.cwd(),master,evidenceRoot:join(root,'evidence')})
  expect(result.failure).toMatchObject({category:'dependency',reason:'installed-resolution-mismatch'})
  expect(await readFile(join(root,'evidence','diagnostic.json'),'utf8')).not.toContain('SECRET')
})

it.each([['ENOENT','filesystem-input-missing'],['ENOTDIR','filesystem-not-directory'],['EACCES','filesystem-access-denied'],['EPERM','filesystem-operation-denied'],['ELOOP','filesystem-symlink-loop'],['SECRET-CODE','unclassified']])('structured errno produces only fixed reason tokens',(code,reason)=>{
  expect(captureRefusalReason(Object.assign(new Error('SECRET-PATH'),{code,path:'SECRET-PATH'}))).toBe(reason)
})
