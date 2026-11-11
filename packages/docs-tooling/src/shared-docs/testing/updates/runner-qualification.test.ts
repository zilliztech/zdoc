import * as childProcess from 'node:child_process'
import * as fsPromises from 'node:fs/promises'
// @vitest-environment node
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'
import { git } from '../build/demo'
import { dirname, join } from 'node:path'
import * as provider from '../../adapters/updates/guides-provider'
import { release } from 'node:os'
import { rawSha256 } from '../../adapters/updates/evidence'
import { patchNextLock } from '../../core/updates/transaction'
import type { NextLockEdit } from '../../core/updates/envelope'
import * as toolset from '../../adapters/updates/toolset'
import { collectRunnerQualification, parseTreeLowerBound, validateDiagnosticSettlement, classifyCaptureRefusal, captureRefusalReason, workerRefusalReason, observeRuntimePreflight } from './runner-qualification'

vi.mock('node:child_process',async importOriginal=>({...await importOriginal<typeof import('node:child_process')>(),spawnSync:vi.fn()}))
vi.mock('node:fs/promises',async importOriginal=>{const actual=await importOriginal<typeof import('node:fs/promises')>();return {...actual,lstat:vi.fn(actual.lstat),realpath:vi.fn(actual.realpath)}})
beforeEach(async()=>{const actual=await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');vi.mocked(fsPromises.lstat).mockImplementation(actual.lstat);vi.mocked(fsPromises.realpath).mockImplementation(actual.realpath);vi.mocked(childProcess.spawnSync).mockClear().mockReturnValue({status:1,stdout:'SECRET',stderr:'SECRET',signal:null,pid:0,output:[]} as never)})
const platformDescriptor=Object.getOwnPropertyDescriptor(process,'platform')!
const setPlatform=(value:string)=>Object.defineProperty(process,'platform',{...platformDescriptor,value})
const roots:string[]=[]
/** Mocked capture cases own a full local checkout, independent of CI's shallow source checkout. */
async function diagnosticFixture(){
  const root=await realpath(await mkdtemp(join(tmpdir(),'runner-diagnostic-test-')));roots.push(root)
  const repository=join(root,'repository');await mkdir(repository)
  await git(repository,'init','-q','-b','master','--template=');await writeFile(join(repository,'data'),'fixed diagnostic data')
  await git(repository,'add','.');await git(repository,'commit','-qm','fixed diagnostic input')
  return {root,repository,master:await git(repository,'rev-parse','HEAD')}
}
afterEach(async()=>{Object.defineProperty(process,'platform',platformDescriptor);vi.restoreAllMocks();await Promise.all(roots.splice(0).map(root=>rm(root,{recursive:true,force:true})))})
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
  const {root,repository,master}=await diagnosticFixture()
  const spy=vi.spyOn(toolset,'captureTrustedToolset').mockRejectedValue(new Error('secret-canary-do-not-retain'))
  const result=await collectRunnerQualification({toolRoot:repository,master,evidenceRoot:join(root,'evidence')})
  expect(spy).toHaveBeenCalledOnce();expect(spy.mock.calls[0][0].helpers).toBeUndefined()
  expect(result).toMatchObject({kind:'shared-update-runner-diagnostic',schemaVersion:1,productionQualified:false,capture:'held',worker:{status:'not-run'},failure:{phase:'capture',code:'CAPTURE_REFUSED'}})
  expect(JSON.stringify(result)).not.toContain('secret-canary')
  expect(await readFile(join(root,'evidence','diagnostic.json'),'utf8')).not.toContain('secret-canary')
})
it('refuses a mismatched M before calling capture',async()=>{
  const {root,repository,master}=await diagnosticFixture()
  const spy=vi.spyOn(toolset,'captureTrustedToolset').mockRejectedValue(new Error('must not call'))
  const result=await collectRunnerQualification({toolRoot:repository,master:'0'.repeat(40),evidenceRoot:join(root,'evidence')})
  expect(result.capture).toBe('not-run');expect(result.failure?.code).toBe('MASTER_MISMATCH');expect(spy).not.toHaveBeenCalled()
})

function syntheticCapture(master:string,repository:string){
  const capture={root:repository,...toolset.bindClosure({kind:'shared-update-executable-closure',schemaVersion:1,hostTcb:{kind:'host-os-tcb',schemaVersion:1,policy:'host-os-tcb-v1',platform:process.platform,release:release(),architecture:process.arch,systemLibraries:'trusted-host-unmeasured'},entries:[],packageLocators:[],resolutions:[]},{kind:'shared-update-toolset',schemaVersion:1,runtime:{name:'synthetic-runtime',version:'1',platform:process.platform,architecture:process.arch},flags:[],environment:[],dependencies:[]})}
  vi.spyOn(toolset,'captureTrustedToolset').mockResolvedValue(capture)
  vi.spyOn(toolset,'describeTrustedToolset').mockReturnValue({root:repository,commit:master,git:'/usr/bin/git',gitVersion:'synthetic',runtime:[],hostExclusions:[],access:{inspected:0,identity:null,homeRestriction:null,inspectors:[]}})
  return capture
}
it('rejects changed closure bytes before worker and does not retain raw errors',async()=>{
  const {root,repository,master}=await diagnosticFixture()
  const capture=syntheticCapture(master,repository);capture.bytes[0]^=1
  const worker=vi.spyOn(provider,'createGuidesProvider')
  const result=await collectRunnerQualification({toolRoot:repository,master,evidenceRoot:join(root,'evidence')})
  expect(result).toMatchObject({capture:'held',worker:{status:'not-run'},closure:null,failure:{phase:'capture',code:'CAPTURE_REFUSED'}})
  expect(worker).not.toHaveBeenCalled()
})
it.each(['held','unsettled','draft-failure','empty-candidate','candidate'] as const)('synthetic boundary: %s preserves observed worker status and checks the tripwire',async mode=>{
  const {root,repository,master}=await diagnosticFixture()
  syntheticCapture(master,repository)
  let clock=0
  vi.spyOn(performance,'now').mockImplementation(()=>clock)
  const timeout=vi.spyOn(AbortSignal,'timeout')
  const finalVerify=vi.spyOn(toolset,'verifyTrustedToolset').mockResolvedValue(undefined)
  vi.spyOn(toolset,'retainTrustedAccessEvidence').mockImplementation(async(_capture,evidence)=>{
    clock=144000 // Two hosted capture/access intervals elapsed before the provider starts.
    return evidence.writeBlob(Buffer.from('synthetic-access'))
  })
  const settlement={pid:123,born:true,close:{code:0,signal:null},group:mode==='unsettled'?'unknown':'absent',signals:[],cleanupErrors:[]}
  const progress=join(root,'evidence','diagnostic-progress.json')
  const collectAll=vi.fn(async()=>{
    const journal=JSON.parse(await readFile(progress,'utf8'))
    expect(journal).toEqual({kind:'shared-update-runner-diagnostic-progress',schemaVersion:1,productionQualified:false,master,
      stages:['binding','capacity','preflight','capture','retain-access','fixture','provider-setup','collect'].map(stage=>({stage,elapsedMs:expect.any(Number)}))})
    await expect(readFile(join(root,'evidence','diagnostic.json'))).rejects.toMatchObject({code:'ENOENT'})
    return {collection:{holds:[]},workerSettlement:settlement}
  })
  const providerConstructor=vi.spyOn(provider,'createGuidesProvider').mockImplementation(async({request,evidence})=>{
    const disposition={candidate:'candidate','empty-candidate':'candidate','draft-failure':'draft-failure',unsettled:'hold',held:'hold'}[mode]
    const nextEdits:NextLockEdit[]=[]
    if(mode==='candidate'){
      const subject={kind:'guides-page',group:'guides',pageId:'build-pipeline'} as const
      const path='shared-docs/guides/pages/build-pipeline/lock.yaml'
      const bytes=await readFile(join(request.repositoryRoot,path))
      const {current,next}=JSON.parse(bytes.toString())
      const before={path,current,next,sha256:rawSha256(bytes)}
      const target=request.target!
      const patch=patchNextLock({subject,before,bytes,target,mode:'100644'})
      nextEdits.push({subject,before,target,afterBlob:await evidence.writeBlob(patch.bytes)})
    }
    return {collectAll,planAll:()=>[{disposition,nextEdits}],getWorkerSettlement:()=>settlement} as unknown as Awaited<ReturnType<typeof provider.createGuidesProvider>>
  })
  const result=await collectRunnerQualification({toolRoot:repository,master,evidenceRoot:join(root,'evidence')})
  expect(timeout).toHaveBeenCalledWith(300000)
  expect(collectAll).toHaveBeenCalledOnce();expect(result.productionQualified).toBe(false)
  const actualFixtureMaster=await git(join(root,'evidence','fixture'),'rev-parse','HEAD')
  expect(providerConstructor.mock.calls[0][0].request.master).toBe(actualFixtureMaster)
  expect(providerConstructor.mock.calls[0][0].request.configSnapshot).toBe(actualFixtureMaster)
  expect(actualFixtureMaster).not.toBe(master);expect(result.master).toBe(master)
  if(mode==='candidate'){
    expect(result.worker.status).toBe('passed');expect(result.failure).toBeNull()
    expect(finalVerify).toHaveBeenCalledOnce()
    expect(JSON.parse(await readFile(progress,'utf8')).stages.at(-1).stage).toBe('final-verify')
  }else{
    const expectedFailure={unsettled:'WORKER_UNSETTLED','empty-candidate':'NON_NEXT_ONLY_PLAN','draft-failure':'WORKER_PREPARATION_HELD',held:'WORKER_PREPARATION_HELD'}[mode]
    expect(result.worker.status).toBe('held');expect(result.failure?.code).toBe(expectedFailure)
    expect(finalVerify).not.toHaveBeenCalled()
  }
  expect(result.worker.resultValidated).toBe(mode!=='unsettled')
  if(mode!=='unsettled')expect(result.worker.tripwireUntouched).toBe(true)
},15000)
it('rejects a captured commit mismatch independently of the checkout M',async()=>{
  const {root,repository,master}=await diagnosticFixture()
  syntheticCapture('f'.repeat(40),repository)
  const result=await collectRunnerQualification({toolRoot:repository,master,evidenceRoot:join(root,'evidence')})
  expect(result.capture).toBe('held');expect(result.worker.status).toBe('not-run');expect(result.failure?.code).toBe('CAPTURE_BINDING_MISMATCH')
})
it('rejects caller-selected runtime/capability fields before any capture',async()=>{
  const spy=vi.spyOn(toolset,'captureTrustedToolset')
  await expect(collectRunnerQualification({toolRoot:'/unused-tools',master:'a'.repeat(40),evidenceRoot:'/unused',capture:{}} as never)).rejects.toThrow('INVALID_DIAGNOSTIC_BOOTSTRAP')
  expect(spy).not.toHaveBeenCalled()
})

it('invalid child pid separately refuses otherwise settled worker',()=>{
  expect(validateDiagnosticSettlement({pid:null,born:true,close:{code:0,signal:null},group:'absent',cleanupErrors:[]})).toBe(false)
})
it.each([['Trusted toolset capture is not yet supported on Linux','unsupported-platform'],['Unsafe access mode','access-owner-mode'],['Unsupported ACL access: /private/canary','acl'],['Forbidden ambient execution setting: SECRET','environment'],['Unsupported Python native closure','native'],['Closure material binding mismatch','dependency'],['private-secret-unknown','unknown']])('classifies capture refusal without retaining input %s',(message,category)=>{
  expect(classifyCaptureRefusal(message)).toBe(category)
})
it('cooperative deadline cannot leave capture passed when its phase is held',async()=>{
  const {root,repository,master}=await diagnosticFixture()
  syntheticCapture(master,repository)
  let clock=0;vi.spyOn(performance,'now').mockImplementation(()=>clock)
  vi.spyOn(toolset,'verifyTrustedToolset').mockResolvedValue(undefined)
  vi.spyOn(toolset,'retainTrustedAccessEvidence').mockImplementation(async(_capture,evidence)=>{clock=540001;return evidence.writeBlob(Buffer.from('synthetic-access'))})
  const result=await collectRunnerQualification({toolRoot:repository,master,evidenceRoot:join(root,'evidence')})
  expect(result.capture).toBe('held');expect(result.failure?.code).toBe('COOPERATIVE_DEADLINE');expect(result.worker.status).toBe('not-run')
})

it.each(['shallow','info/grafts','objects/info/alternates'])('refuses ambiguous Git storage %s before capture',async file=>{
  const {root,repository,master}=await diagnosticFixture()
  const ambiguous=join(repository,'.git',file)
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
  const {root,repository,master}=await diagnosticFixture()
  vi.spyOn(toolset,'captureTrustedToolset').mockRejectedValue(new Error('Installed dependency resolution differs from lock: SECRET-LOCATOR -> SECRET-DEPENDENCY'))
  const result=await collectRunnerQualification({toolRoot:repository,master,evidenceRoot:join(root,'evidence')})
  expect(result.failure).toMatchObject({category:'dependency',reason:'installed-resolution-mismatch'})
  expect(await readFile(join(root,'evidence','diagnostic.json'),'utf8')).not.toContain('SECRET')
})

it.each([['ENOENT','filesystem-input-missing'],['ENOTDIR','filesystem-not-directory'],['EACCES','filesystem-access-denied'],['EPERM','filesystem-operation-denied'],['ELOOP','filesystem-symlink-loop'],['SECRET-CODE','unclassified']])('structured errno produces only fixed reason tokens',(code,reason)=>{
  expect(captureRefusalReason(Object.assign(new Error('SECRET-PATH'),{code,path:'SECRET-PATH'}))).toBe(reason)
})

it('compact report preserves completed capture with oversized runtime description and pre-spawn timeout',async()=>{
  const {root,repository,master}=await diagnosticFixture()
  syntheticCapture(master,repository)
  const description=toolset.describeTrustedToolset({} as never),runtime=Array.from({length:5000},(_,index)=>({path:`runtime/fixed-${index}`,physical:'/fixed/'+String(index)+'x'.repeat(300)}))
  vi.mocked(toolset.describeTrustedToolset).mockReturnValue({...description,runtime})
  vi.spyOn(toolset,'verifyTrustedToolset').mockResolvedValue(undefined)
  vi.spyOn(toolset,'retainTrustedAccessEvidence').mockImplementation(async(_capture,evidence)=>evidence.writeBlob(Buffer.from('synthetic-access')))
  vi.spyOn(provider,'createGuidesProvider').mockRejectedValue(Object.assign(new Error('SECRET timeout details'),{name:'TimeoutError'}))
  const result=await collectRunnerQualification({toolRoot:repository,master,evidenceRoot:join(root,'evidence')})
  expect(result.capture).toBe('passed');expect(result.phases.find(item=>item.phase==='capture')?.status).toBe('passed')
  expect(result.tools?.runtimeCount).toBe(5000);expect(result.tools?.description.bytes).toBeGreaterThan(1024*1024)
  const retained=JSON.parse(await readFile(join(root,'evidence',result.tools!.description.path),'utf8'))
  expect(retained.runtime).toHaveLength(5000)
  const report=await readFile(join(root,'evidence','diagnostic.json'),'utf8');expect(Buffer.byteLength(report)).toBeLessThan(1024*1024)
  expect(report).not.toContain('SECRET');expect(result.report.status).toBe('complete')
  expect(result.worker).toMatchObject({status:'held',generationExecuted:false,settlement:null})
  expect(result.failure).toMatchObject({code:'WORKER_REFUSED',reason:'worker-timeout'})
})
it.each([
  [Object.assign(new Error('SECRET'),{name:'TimeoutError'}),'worker-timeout'],
  [Object.assign(new Error('SECRET'),{name:'AbortError'}),'worker-aborted'],
  [new Error('Guides worker input exceeds byte bound'),'worker-input-bound'],
  [new Error('Guides worker output exceeds byte bound'),'worker-output-bound'],
  [new Error('Guides worker failed: Error: Guides worker result exceeds byte bound SECRET'),'worker-result-bound'],
  [new Error('SECRET unrecognized'),'unclassified'],
])('worker refusal uses fixed reason without raw error data',(error,reason)=>expect(workerRefusalReason(error)).toBe(reason))

it('rejects a real shallow source checkout while a separate full fixture reaches mocked capture',async()=>{
  const {root,repository,master}=await diagnosticFixture(),shallow=join(root,'shallow')
  await git(repository,'clone','--quiet','--depth=1',pathToFileURL(repository).href,shallow)
  expect(await git(shallow,'rev-parse','--is-shallow-repository')).toBe('true')
  const capture=vi.spyOn(toolset,'captureTrustedToolset').mockRejectedValue(new Error('synthetic capture refusal'))
  const held=await collectRunnerQualification({toolRoot:shallow,master,evidenceRoot:join(root,'shallow-evidence')})
  expect(held.failure?.code).toBe('AMBIGUOUS_GIT_STORAGE');expect(held.capture).toBe('not-run');expect(capture).not.toHaveBeenCalled()
  expect(await git(repository,'rev-parse','--is-shallow-repository')).toBe('false')
  const full=await collectRunnerQualification({toolRoot:repository,master,evidenceRoot:join(root,'full-evidence')})
  expect(full.failure?.code).toBe('CAPTURE_REFUSED');expect(capture).toHaveBeenCalledOnce()
})

it.each([
 ['Unknown system Git provisioning','git-provisioning-unsupported'],
 ['Unknown Python provisioning','python-provisioning-unsupported'],
 ['Unsupported Python installation layout','python-layout-unsupported'],
 ['Unsafe trusted file: SECRET','trusted-file-unsafe'],
 ['Unknown non-system runtime dependency: SECRET','native-dependency-unknown'],
 ['Unsupported identity source coverage','identity-source-unsupported'],
 ['Forbidden ambient execution setting: SECRET','environment-setting-forbidden'],
])('first-stage failures have fixed redacted vocabulary',(message,reason)=>expect(captureRefusalReason(new Error(message))).toBe(reason))
it('observes independent fixed prerequisites under the capture sanitizer without accepting them',async()=>{
 setPlatform('darwin')
 const {repository}=await diagnosticFixture()
 const environment={LANG:'C',LC_ALL:'C'}
 vi.spyOn(toolset,'trustedLauncherEnvironment').mockResolvedValue(environment)
 vi.mocked(childProcess.spawnSync).mockImplementation((_file,args,options)=>{
   expect(options?.env).toBe(environment);expect(options?.maxBuffer).toBe(4096);expect(options?.killSignal).toBe('SIGKILL')
   expect(args?.[0]).toBe('--find')
   return {status:0,stdout:args?.[1]==='git'?'/Applications/Xcode_16.4.app/Contents/Developer/usr/bin/git\n':'/Applications/Xcode_16.4.app/Contents/Developer/usr/bin/python3\n',stderr:'SECRET',signal:null} as never
 })
 vi.spyOn(fsPromises,'lstat').mockImplementation(async path=>{
   if(String(path).endsWith('Search.plist'))throw Object.assign(new Error('SECRET'),{code:'ENOENT'})
   return {isSymbolicLink:()=>false,isFile:()=>true,isDirectory:()=>false,uid:0,gid:0,mode:0o100755} as never
 })
 vi.spyOn(fsPromises,'realpath').mockImplementation(async path=>String(path).endsWith('/python3')?String(path)+'.9':String(path) as never)
 const result=await observeRuntimePreflight(repository)
 expect(toolset.trustedLauncherEnvironment).toHaveBeenCalledWith(repository,repository)
 expect(result.qualification).toBe('unqualified')
 expect(result.observations).toContainEqual({name:'identity-profile',status:'unavailable',reason:'filesystem-input-missing'})
 expect(result.observations.some(item=>item.name==='python-stdlib')).toBe(true)
 expect(result.observations.some(item=>item.name==='gh')).toBe(true)
 expect(JSON.stringify(result)).not.toContain('SECRET')
 expect(result.observations.length).toBeLessThanOrEqual(32)
})
it('discards malformed command output and still observes profile alias metadata',async()=>{
 setPlatform('darwin')
 const {repository}=await diagnosticFixture()
 vi.spyOn(toolset,'trustedLauncherEnvironment').mockResolvedValue({LANG:'C'})
 vi.mocked(childProcess.spawnSync).mockReturnValue({status:0,stdout:'/private/SECRET\nmalformed',stderr:'SECRET',signal:null} as never)
 vi.spyOn(fsPromises,'lstat').mockResolvedValue({isSymbolicLink:()=>true,isFile:()=>false,isDirectory:()=>false,uid:0,gid:0,mode:0o120755} as never)
 vi.spyOn(fsPromises,'realpath').mockImplementation(async path=>String(path)==='/Library/Preferences/OpenDirectory/Configurations/Search.plist'?'/fixed/profile':String(path) as never)
 const result=await observeRuntimePreflight(repository)
 expect(result.observations.filter(item=>item.name.startsWith('xcrun-')).every(item=>item.reason==='tool-location-unavailable')).toBe(true)
 expect(result.observations.find(item=>item.name==='identity-profile')?.alias).toBe(true)
 expect(JSON.stringify(result)).not.toContain('SECRET')
})

it('unavailable sanitizer observations do not replace actual capture refusal',async()=>{
 setPlatform('darwin')
 const {root,repository,master}=await diagnosticFixture()
 vi.spyOn(toolset,'trustedLauncherEnvironment').mockRejectedValue(new Error('SECRET'))
 const capture=vi.spyOn(toolset,'captureTrustedToolset').mockRejectedValue(new Error('Unknown system Git provisioning'))
 const result=await collectRunnerQualification({toolRoot:repository,master,evidenceRoot:join(root,'evidence')})
 expect(capture).toHaveBeenCalledOnce()
 expect(result.failure?.reason).toBe('git-provisioning-unsupported')
 expect(result.productionQualified).toBe(false)
 expect(JSON.stringify(result)).not.toContain('SECRET')
})
it('preflight deadline prevents further commands without changing capture policy',async()=>{
 setPlatform('darwin')
 const {root,repository,master}=await diagnosticFixture()
 vi.spyOn(toolset,'trustedLauncherEnvironment').mockResolvedValue({LANG:'C'})
 let time=0;vi.spyOn(performance,'now').mockImplementation(()=>time)
 vi.mocked(childProcess.spawnSync).mockImplementation(()=>{time=8001;return {status:1,stdout:'SECRET',stderr:'SECRET'} as never})
 const capture=vi.spyOn(toolset,'captureTrustedToolset').mockRejectedValue(new Error('Unknown system Git provisioning'))
 const result=await collectRunnerQualification({toolRoot:repository,master,evidenceRoot:join(root,'evidence')})
 expect(childProcess.spawnSync).toHaveBeenCalledOnce()
 expect(result.preflight?.observations.find(item=>item.name==='xcrun-python3')?.reason).toBe('preflight-deadline')
 expect(result.preflight?.qualification).toBe('unqualified');expect(capture).toHaveBeenCalledOnce()
 expect(result.failure?.reason).toBe('git-provisioning-unsupported')
})

it('Linux preflight is unavailable and executes no commands or sanitizer',async()=>{
 setPlatform('linux')
 const sanitizer=vi.spyOn(toolset,'trustedLauncherEnvironment')
 expect(await observeRuntimePreflight('/fixed')).toMatchObject({status:'unavailable',qualification:'unqualified',observations:[]})
 expect(childProcess.spawnSync).not.toHaveBeenCalled();expect(sanitizer).not.toHaveBeenCalled()
})
it.each(['/Applications/Xcode_16.4.app/Contents/Developer/usr/../bin/git','/Applications/Xcode_16.4.app/Contents/Developer/./usr/bin/git'])('rejects noncanonical location without inspecting it',async output=>{
 setPlatform('darwin')
 vi.spyOn(toolset,'trustedLauncherEnvironment').mockResolvedValue({LANG:'C'})
 vi.mocked(childProcess.spawnSync).mockReturnValue({status:0,stdout:output,stderr:'',signal:null} as never)
 const metadata=vi.spyOn(fsPromises,'lstat').mockRejectedValue(Object.assign(new Error('SECRET'),{code:'ENOENT'}))
 const result=await observeRuntimePreflight('/fixed')
 expect(result.observations.filter(item=>item.name.startsWith('xcrun-')).every(item=>item.status==='unavailable')).toBe(true)
 expect(metadata.mock.calls.some(([path])=>path===output)).toBe(false)
 expect(JSON.stringify(result)).not.toContain(output)
})
it.each([['ENOBUFS','operation-output-bound'],['ETIMEDOUT','operation-timeout']])('bounded command failure %s leaves independent profile observation and actual capture attempted',async(code,reason)=>{
 setPlatform('darwin')
 const {root,repository,master}=await diagnosticFixture()
 vi.spyOn(toolset,'trustedLauncherEnvironment').mockResolvedValue({LANG:'C'})
 vi.mocked(childProcess.spawnSync).mockReturnValue({status:null,stdout:'/Applications/Xcode.app/Contents/Developer/usr/bin/git',stderr:'SECRET',error:Object.assign(new Error('SECRET'),{code})} as never)
 const capture=vi.spyOn(toolset,'captureTrustedToolset').mockRejectedValue(new Error('Unsupported identity source coverage'))
 const result=await collectRunnerQualification({toolRoot:repository,master,evidenceRoot:join(root,'evidence')})
 expect(childProcess.spawnSync).toHaveBeenCalledTimes(2)
 expect(result.preflight?.observations.some(item=>item.name==='identity-profile')).toBe(true)
 expect(result.preflight?.observations.filter(item=>item.name.startsWith('xcrun-')).every(item=>item.status==='unavailable'&&item.reason===reason)).toBe(true)
 expect(capture).toHaveBeenCalledOnce();expect(result.failure?.reason).toBe('identity-source-unsupported')
 expect(JSON.stringify(result)).not.toContain('SECRET')
})

it('observes direct versioned Python and derives its standard-library metadata',async()=>{
 setPlatform('darwin')
 vi.spyOn(toolset,'trustedLauncherEnvironment').mockResolvedValue({LANG:'C'})
 vi.mocked(childProcess.spawnSync).mockImplementation((_file,args)=>({status:0,stdout:args?.[1]==='python3'?'/Applications/Xcode_16.4.app/Contents/Developer/usr/bin/python3.9':'/Applications/Xcode_16.4.app/Contents/Developer/usr/bin/git',stderr:'',signal:null} as never))
 vi.spyOn(fsPromises,'lstat').mockResolvedValue({isSymbolicLink:()=>false,isFile:()=>true,isDirectory:()=>false,uid:0,gid:0,mode:0o100755} as never)
 vi.spyOn(fsPromises,'realpath').mockImplementation(async path=>String(path) as never)
 const result=await observeRuntimePreflight('/fixed')
 expect(result.observations).toContainEqual({name:'xcrun-python3',status:'observed',path:'/Applications/Xcode_16.4.app/Contents/Developer/usr/bin/python3.9'})
 expect(result.observations.find(item=>item.name==='python-stdlib')).toMatchObject({status:'observed',path:'/Applications/Xcode_16.4.app/Contents/Developer/usr/lib/python3.9'})
 expect(result.qualification).toBe('unqualified')
})
