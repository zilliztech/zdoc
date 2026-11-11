/** Internal diagnostic only. No report produced here is a capability or production receipt.
 * Run under the reviewed external owned-process launcher: capture is not abortable.
 * Inner deadlines are cooperative; only that launcher can certify an overall timeout.
 */
import { spawnSync } from 'node:child_process'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { lstat, readFile, realpath, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { release } from 'node:os'
import type { BlobRef } from '../../core/updates/envelope'
import { REMOTE_IO_LIMITS } from '../../core/updates/remote'
import { canonicalBytes } from '../../core/updates/canonical'
import { patchNextLock } from '../../core/updates/transaction'
import { initializeEvidence, rawSha256, writeOwnedBlob } from '../../adapters/updates/evidence'
import { trustedLauncherEnvironment, captureTrustedToolset, describeTrustedToolset, retainTrustedAccessEvidence, verifyClosureBinding, verifyTrustedToolset } from '../../adapters/updates/toolset'
import { createGuidesProvider } from '../../adapters/updates/guides-provider'
import { createBuildDemo, git, write } from '../build/demo'

const exec=promisify(execFile)
const treeOutputLimit=4*1024*1024,treeEntryLimit=100000,objectBudget=REMOTE_IO_LIMITS.objectBytes
const gitEnvironment={LANG:'C',LC_ALL:'C',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null',GIT_TERMINAL_PROMPT:'0',GIT_NO_LAZY_FETCH:'1',GIT_OPTIONAL_LOCKS:'0'}
// A hosted capture and a full access recheck each took about 72 seconds.
// These bounds cover the diagnostic harness. The collector owns its own child timeout.
const diagnosticDeadlineMs = 9 * 60_000
const providerDeadlineMs = 5 * 60_000
type DiagnosticStage = 'binding' | 'capacity' | 'preflight' | 'capture' | 'retain-access' |
  'fixture' | 'provider-setup' | 'collect' | 'validate' | 'final-verify'

export interface TreeLowerBound {complete:boolean;entries:number;distinctBlobs:number;bytes:number;verdict:'over-budget'|'not-proven';scope:'master-tree-blobs-only';objectBudget:number}
/** Strict NUL-delimited ls-tree -rlz output. No raw path/content is retained in the report. */
export function parseTreeLowerBound(input:Uint8Array):TreeLowerBound {
  if(input.length>treeOutputLimit)throw new Error('TREE_OUTPUT_LIMIT')
  const text=new TextDecoder('utf8',{fatal:true}).decode(input)
  if(text&&!text.endsWith('\0'))throw new Error('TRUNCATED_TREE')
  const rows=text?text.slice(0,-1).split('\0'):[],objects=new Map<string,number>(),paths=new Set<string>()
  if(rows.length>treeEntryLimit)throw new Error('TREE_ENTRY_LIMIT')
  let bytes=0
  for(const row of rows){
    const match=/^(100644|100755|120000) blob ([a-f0-9]{40}) +([0-9]+)\t([^\0]+)$/.exec(row)
    if(!match||paths.has(match[4]))throw new Error('INVALID_TREE')
    const size=Number(match[3]);if(!Number.isSafeInteger(size)||size<0)throw new Error('INVALID_TREE_SIZE')
    paths.add(match[4]);const old=objects.get(match[2])
    if(old!==undefined&&old!==size)throw new Error('INCONSISTENT_OBJECT_SIZE')
    if(old===undefined){objects.set(match[2],size);bytes+=size;if(!Number.isSafeInteger(bytes))throw new Error('TREE_SIZE_LIMIT')}
  }
  return {complete:true,entries:rows.length,distinctBlobs:objects.size,bytes,scope:'master-tree-blobs-only',objectBudget,verdict:bytes>objectBudget?'over-budget':'not-proven'}
}
export function validateDiagnosticSettlement(value:unknown):boolean {
  const v=value as {pid?:number;born?:boolean;close?:{code:number|null;signal:string|null}|null;group?:string;cleanupErrors?:unknown[]}|null
  return !!v&&Number.isSafeInteger(v.pid)&&v.pid!>0&&v.born===true&&v.close?.code===0&&v.close.signal===null&&v.group==='absent'&&Array.isArray(v.cleanupErrors)&&v.cleanupErrors.length===0
}
function settlementSummary(value:unknown):unknown {
  if(!value||typeof value!=='object')return null
  const v=value as import('../../adapters/updates/toolset').GuidesWorkerSettlement
  return {pid:Number.isSafeInteger(v.pid)?v.pid:null,born:v.born===true,
    close:v.close?{code:Number.isInteger(v.close.code)?v.close.code:null,signal:v.close.signal===null?null:'observed'}:null,
    group:v.group==='absent'?'absent':'unknown',signals:Array.isArray(v.signals)?v.signals.length:0,
    cleanupErrorCount:Array.isArray(v.cleanupErrors)?v.cleanupErrors.length:null}
}
export interface RuntimePreflight {
  qualification:'unqualified';status:'observed'|'unavailable';limitations:readonly string[]
  observations:{name:string;status:'observed'|'unavailable';path?:string;physical?:string;alias?:boolean;kind?:string;uid?:number;gid?:number;mode?:number;reason?:string}[]
}
/** Fixed prerequisites only. Metadata is not native, identity, ACL or capture approval. */
export async function observeRuntimePreflight(toolRoot:string):Promise<RuntimePreflight> {
  const result:RuntimePreflight={qualification:'unqualified',status:'unavailable',limitations:['metadata-is-not-access-approval','locations-are-not-native-closure-proof','eight-second-budget-is-cooperative-metadata-is-not-cancelable'],observations:[]}
  if(process.platform!=='darwin')return result
  const started=performance.now(),expired=()=>performance.now()-started>=8000
  let environment:NodeJS.ProcessEnv
  try{environment=await trustedLauncherEnvironment(toolRoot,toolRoot)}catch{result.observations.push({name:'environment',status:'unavailable',reason:'sanitized-environment-unavailable'});return result}
  const safePath=(value:string)=>value.length<=4096&&isAbsolute(value)&&!/[\x00-\x20\x7f]/.test(value)
  const metadata=async(name:string,path:string)=>{
    if(result.observations.length>=32)return
    if(!safePath(path)){result.observations.push({name,status:'unavailable',reason:'tool-location-unavailable'});return}
    if(expired()){result.observations.push({name,status:'unavailable',reason:'preflight-deadline'});return}
    try{
      const stat=await lstat(path),physical=await realpath(path)
      if(!safePath(physical))throw new Error('invalid')
      result.observations.push({name,status:'observed',path,physical,alias:stat.isSymbolicLink()||physical!==path,kind:stat.isFile()?'file':stat.isDirectory()?'directory':stat.isSymbolicLink()?'symlink':'other',uid:stat.uid,gid:stat.gid,mode:stat.mode})
    }catch(error){result.observations.push({name,status:'unavailable',reason:captureRefusalReason(error)})}
  }
  for(const tool of ['git','python3'] as const){
    const name='xcrun-'+tool
    if(expired()){result.observations.push({name,status:'unavailable',reason:'preflight-deadline'});continue}
    try{
      const observed=spawnSync('/usr/bin/xcrun',['--find',tool],{env:environment,timeout:Math.min(2000,Math.max(1,8000-(performance.now()-started))),maxBuffer:4096,encoding:'utf8',killSignal:'SIGKILL'})
      if(observed.error){const reason=captureRefusalReason(observed.error);result.observations.push({name,status:'unavailable',reason:reason==='unclassified'?'tool-location-unavailable':reason});continue}
      const path=typeof observed.stdout==='string'?observed.stdout.trim():''
      // Only recognized fixed provisioning roots may leave this diagnostic boundary.
      if(observed.status!==0||observed.signal||!safePath(path)||resolve(path)!==path||!(/^\/(?:Library\/Developer\/CommandLineTools\/|Applications\/Xcode(?:_[0-9]+(?:\.[0-9]+)*)?\.app\/Contents\/Developer\/)usr\/bin\/(?:git|python3(?:\.\d+)?)$/.test(path))||!(tool==='git'?path.endsWith('/git'):/\/python3(?:\.\d+)?$/.test(path))){
        result.observations.push({name,status:'unavailable',reason:'tool-location-unavailable'});continue
      }
      result.observations.push({name,status:'observed',path})
      await metadata(tool,path)
      const physical=result.observations.at(-1)?.physical
      if(tool==='python3'&&physical&&/^python3\.\d+$/.test(physical.slice(physical.lastIndexOf('/')+1))){
        const version=physical.slice(physical.lastIndexOf('/')+1).slice(6)
        await metadata('python-stdlib',join(dirname(dirname(physical)),'lib','python'+version))
      }
    }catch{result.observations.push({name,status:'unavailable',reason:'tool-location-unavailable'})}
  }
  await metadata('node',process.execPath)
  await metadata('gh',process.arch==='arm64'?'/opt/homebrew/bin/gh':'/usr/local/bin/gh')
  for(const [index,path] of ['/','/Library','/Library/Preferences','/Library/Preferences/OpenDirectory','/Library/Preferences/OpenDirectory/Configurations','/Library/Preferences/OpenDirectory/Configurations/Search.plist'].entries())await metadata(index===5?'identity-profile':'identity-ancestor-'+index,path)
  result.status='observed';return result
}
export function classifyCaptureRefusal(message:string):string {
  if(message==='Trusted toolset capture is not yet supported on Linux'||message==='Unsupported access inspection platform')return 'unsupported-platform'
  if(/^(Unsafe access (owner|mode)|Local identity policy)/.test(message))return 'access-owner-mode'
  if(/ACL|access inspector|filesystem capability/.test(message))return 'acl'
  if(/^(Forbidden ambient|Forbidden Node execution|Launcher must run)/.test(message))return 'environment'
  if(message==='Unknown system Git provisioning'||/native|Mach|xcrun|Python|python|runtime helper/.test(message))return 'native'
  if(/dependency|package|locator|closure|Closure|resolution|symlink/.test(message))return 'dependency'
  return 'unknown'
}
/** Fixed diagnostic vocabulary only; dynamic paths, package names and values never leave the exception. */
export function captureRefusalReason(error:unknown):string {
  const value=error as {code?:unknown;message?:unknown}|null
  const codes:Record<string,string>={ENOENT:'filesystem-input-missing',ENOTDIR:'filesystem-not-directory',EACCES:'filesystem-access-denied',EPERM:'filesystem-operation-denied',ELOOP:'filesystem-symlink-loop',ETIMEDOUT:'operation-timeout',ENOBUFS:'operation-output-bound'}
  if(typeof value?.code==='string'&&Object.hasOwn(codes,value.code))return codes[value.code]
  const message=typeof value?.message==='string'?value.message.slice(0,4096):''
  const prefixes:readonly (readonly [string,string])[]=[
    ['Unknown system Git provisioning','git-provisioning-unsupported'],
    ['Unknown Python provisioning','python-provisioning-unsupported'],
    ['Unsupported Python installation layout','python-layout-unsupported'],
    ['Aliased Python standard library','python-stdlib-alias'],
    ['Unsafe trusted file','trusted-file-unsafe'],
    ['Trusted file replaced','trusted-file-replaced'],
    ['Trusted file truncated','trusted-file-truncated'],
    ['Trusted file changed','trusted-file-changed'],
    ['Trusted file grew','trusted-file-grew'],
    ['Malformed Mach-O header','native-header-malformed'],
    ['Malformed Mach-O commands','native-commands-malformed'],
    ['Malformed Mach-O command','native-command-malformed'],
    ['Truncated Mach-O command','native-command-truncated'],
    ['Missing identity plist declaration','identity-declaration-missing'],
    ['Unknown identity plist declaration','identity-declaration-unsupported'],
    ['Invalid identity record','identity-record-invalid'],
    ['Invalid identity field','identity-field-invalid'],
    ['Missing identity records','identity-records-missing'],
    ['Identity resolver error','identity-resolver-error'],
    ['Unsupported identity source coverage','identity-source-unsupported'],
    ['Unsupported identity provisioning context','identity-context-unsupported'],
    ['Unsupported local identity profile','identity-profile-unsupported'],
    ['Missing identity observations','identity-observations-missing'],
    ['Missing trusted principal records','identity-principals-missing'],
    ['Malformed identity plist','identity-profile-malformed'],
    ['Unsupported runtime executable','native-executable-unsupported'],
    ['Unknown non-system runtime dependency','native-dependency-unknown'],
    ['Missing non-system runtime dependency','native-dependency-missing'],
    ['Forbidden ambient execution setting','environment-setting-forbidden'],
    ['Forbidden ambient loader setting','environment-loader-forbidden'],
    ['Forbidden Node execution flag','environment-flag-forbidden'],
    ['Launcher must run from trusted root','environment-cwd-invalid'],
    ['Unsupported pnpm lock layout','lock-layout-unsupported'],
    ['External pnpm store must be independently materialized inside trusted root','virtual-store-external'],
    ['Ambiguous pnpm locator directory','virtual-store-locator-ambiguous'],
    ['Unrecognized pnpm virtual-store locator','virtual-store-locator-unknown'],
    ['Unsupported trusted lock locator','lock-locator-unsupported'],
    ['Aliased installed package root','installed-package-alias'],
    ['Installed package differs from lock identity','installed-identity-mismatch'],
    ['Missing lock peer context','lock-peer-context-missing'],
    ['Workspace identity unavailable','workspace-identity-missing'],
    ['Unmeasured dependency escape','dependency-escape'],
    ['Dependency resolution escapes captured packages','dependency-resolution-escape'],
    ['Invalid lock dependency locator','dependency-locator-invalid'],
    ['Installed dependency resolution differs from lock','installed-resolution-mismatch'],
    ['Untracked ancestor package configuration','ancestor-package-untracked'],
    ['Unknown source dependency discovery scope','source-discovery-scope-unknown'],
    ['Aliased dependency discovery scope','discovery-scope-alias'],
    ['Unknown dependency discovery entry','discovery-entry-unknown'],
    ['Aliased package scope','package-scope-alias'],
    ['Unmeasured dependency discovery target','discovery-target-unmeasured'],
    ['Unknown dependency discovery package','discovery-package-unknown'],
    ['Closure material binding mismatch','closure-binding-mismatch'],
    ['Noncanonical closure bytes','closure-noncanonical'],
  ]
  return prefixes.find(([prefix])=>message===prefix||message.startsWith(prefix+':'))?.[1]??'unclassified'
}
export function workerRefusalReason(error:unknown):string {
  const value=error as {name?:unknown;message?:unknown}|null
  if(value?.name==='TimeoutError')return 'worker-timeout'
  if(value?.name==='AbortError')return 'worker-aborted'
  const message=typeof value?.message==='string'?value.message.slice(0,4096):''
  if(message==='Guides worker timeout')return 'worker-timeout'
  if(message==='Guides worker input exceeds byte bound')return 'worker-input-bound'
  if(message==='Guides worker output exceeds byte bound')return 'worker-output-bound'
  if(message.includes('Guides worker result exceeds byte bound'))return 'worker-result-bound'
  if(message.startsWith('Guides worker interrupted:'))return 'worker-interrupted'
  if(message==='Guides worker settlement is unknown'||message==='Guides worker group settlement is unknown')return 'worker-settlement-unknown'
  return 'unclassified'
}
interface ToolDescriptionSummary {
  commit:string;root:string|null;git:string|null;gitVersion:string|null
  runtimeCount:number;hostExclusionCount:number;accessInspected:number;accessInspectorCount:number;description:BlobRef
}
interface Failure {phase:string;code:string;category?:string;reason?:string}
export interface RunnerDiagnostic {
  kind:'shared-update-runner-diagnostic';schemaVersion:1;productionQualified:false;master:string
  missingObservations:string[]
  host:{platform:string;architecture:string;release:string;node:string;uid:number|null;gid:number|null}
  preflight:RuntimePreflight|null
  capture:'passed'|'held'|'not-run';capacity:TreeLowerBound
  worker:{status:'passed'|'held'|'not-run';generationExecuted:boolean;resultValidated:boolean;observation:unknown;settlement:unknown;planDispositions:string[];tripwireUntouched:boolean|null}
  phases:{phase:string;milliseconds:number;status:'passed'|'held'}[];failure:Failure|null
  report:{status:'complete'|'held';reason:'REPORT_OUTPUT_LIMIT'|null}
  tools:ToolDescriptionSummary|null
  closure:{sha256:string;bytes:number;toolsetSha256:string;access:unknown}|null
  limits:{treeOutputBytes:number;treeEntries:number;overallDeadline:'external-owned-launcher';collectorResultBytes:number}
}
/** Bootstrap arguments come from reviewed code, never candidate/request JSON. No writer/env/runtime seam. */
export async function collectRunnerQualification(input:{toolRoot:string;master:string;evidenceRoot:string}):Promise<RunnerDiagnostic> {
  if(Object.keys(input).sort().join(',')!=='evidenceRoot,master,toolRoot'||!isAbsolute(input.toolRoot)||!isAbsolute(input.evidenceRoot)||!(/^[a-f0-9]{40}$/).test(input.master))throw new Error('INVALID_DIAGNOSTIC_BOOTSTRAP')
  const toolRoot=await realpath(input.toolRoot)
  // New output only; initializeEvidence independently rejects overlap/aliases and pins ownership.
  try{await lstat(input.evidenceRoot);throw new Error('DIAGNOSTIC_OUTPUT_EXISTS')}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error}
  const evidence=await initializeEvidence({root:input.evidenceRoot,repositories:[toolRoot],owner:'runner-diagnostic-v1',maxBytes:192*1024*1024})
  const result:RunnerDiagnostic={kind:'shared-update-runner-diagnostic',schemaVersion:1,productionQualified:false,master:input.master,
    missingObservations:['host-image-identity','helper-semantic-versions','measured-child-credential-canary','filesystem-credential-isolation'],
    host:{platform:process.platform,architecture:process.arch,release:release(),node:process.version,uid:process.getuid?.()??null,gid:process.getgid?.()??null},
    preflight:null,capture:'not-run',capacity:{complete:false,entries:0,distinctBlobs:0,bytes:0,scope:'master-tree-blobs-only',objectBudget,verdict:'not-proven'},
    worker:{status:'not-run',generationExecuted:false,resultValidated:false,observation:null,settlement:null,planDispositions:[],tripwireUntouched:null},
    phases:[],failure:null,report:{status:'complete',reason:null},tools:null,closure:null,limits:{treeOutputBytes:treeOutputLimit,treeEntries:treeEntryLimit,overallDeadline:'external-owned-launcher',collectorResultBytes:128*1024*1024}}
  const started=performance.now()
  const stages: { stage: DiagnosticStage; elapsedMs: number }[] = []
  // Each entry precedes its operation. An interrupted run retains the last atomic journal,
  // which records progress only. The terminal report owns all outcome/settlement claims.
  async function enter(stage: DiagnosticStage) {
    stages.push({ stage, elapsedMs: Math.ceil(performance.now() - started) })
    await evidence.writeJournal('diagnostic-progress.json', canonicalBytes({
      kind: 'shared-update-runner-diagnostic-progress', schemaVersion: 1,
      productionQualified: false, master: input.master, stages,
    }))
  }
  let phase='bootstrap',phaseStart=started
  const check=()=>{if(performance.now()-started>diagnosticDeadlineMs)throw new Error('COOPERATIVE_DEADLINE')}
  const begin=(next:string)=>{check();phase=next;phaseStart=performance.now()}
  const pass=()=>{check();result.phases.push({phase,milliseconds:Math.ceil(performance.now()-phaseStart),status:'passed'})}
  const gitRead=async(...args:string[])=> (await exec('/usr/bin/git',['--no-replace-objects','-c','core.hooksPath=/dev/null','-C',toolRoot,...args],{env:gitEnvironment,timeout:10000,maxBuffer:treeOutputLimit,encoding:'buffer'})).stdout
  try{
    begin('binding'); await enter('binding')
    for(const name of ['shallow','info/grafts','objects/info/alternates']){
      const path=resolve(toolRoot,(await gitRead('rev-parse','--git-path',name)).toString().trim())
      try{await lstat(path);throw new Error('AMBIGUOUS_GIT_STORAGE')}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error}
    }
    if((await gitRead('rev-parse','HEAD')).toString().trim()!==input.master)throw new Error('MASTER_MISMATCH');pass()
    begin('capacity'); await enter('capacity')
    result.capacity=parseTreeLowerBound(await gitRead('ls-tree','-r','-l','-z',input.master));pass()
    begin('capture');result.capture='held'
    await enter('preflight')
    result.preflight=await observeRuntimePreflight(toolRoot)
    // Default helper coverage is intentional: gh/Python cannot be omitted to pass.
    await enter('capture')
    const capture=await captureTrustedToolset({root:toolRoot,commit:input.master,cwd:toolRoot})
    const description=describeTrustedToolset(capture)
    if(description.commit!==input.master||await realpath(description.root)!==toolRoot)throw new Error('CAPTURE_BINDING_MISMATCH')
    const descriptionBytes=canonicalBytes(description)
    if(descriptionBytes.length>32*1024*1024)throw new Error('TOOL_DESCRIPTION_OUTPUT_LIMIT')
    const descriptionRef=await writeOwnedBlob(evidence,descriptionBytes)
    const bounded=(value:string,limit:number)=>value.length<=limit?value:null
    result.tools={commit:description.commit,root:bounded(description.root,4096),git:bounded(description.git,4096),gitVersion:bounded(description.gitVersion,256),
      runtimeCount:description.runtime.length,hostExclusionCount:description.hostExclusions.length,accessInspected:description.access.inspected,accessInspectorCount:description.access.inspectors.length,description:descriptionRef}
    const ref=await writeOwnedBlob(evidence,capture.bytes)
    verifyClosureBinding(capture.material,ref,capture.bytes,capture.toolsetSha256)
    await enter('retain-access')
    // Retention revalidates the toolset. The provider rechecks it again before use.
    const access=await retainTrustedAccessEvidence(capture,evidence)
    result.closure={sha256:rawSha256(capture.bytes),bytes:capture.bytes.length,toolsetSha256:capture.toolsetSha256,access}
    pass();result.capture='passed'
    begin('worker');result.worker.status='held'
    await enter('fixture')
    const fixture=await createBuildDemo(join(evidence.root,'fixture'))
    // No external resource request: both fixture pins below contain local images only.
    const sourcePath=join(fixture.repo,'site/en/build-pipeline.md')
    const source=(await readFile(sourcePath,'utf8')).replace(/^!\[External[^\n]*\n/gm,'')
    await writeFile(sourcePath,source);await git(fixture.repo,'add','.');await git(fixture.repo,'commit','-qm','diagnostic local-only current')
    const current=await git(fixture.repo,'rev-parse','HEAD')
    for(const page of ['build-pipeline','shared-target'])await write(fixture.sharedDocs,`pages/${page}/lock.yaml`,JSON.stringify({schema_version:1,current,next:current}))
    const repository=dirname(dirname(fixture.sharedDocs)),tripwire=join(repository,'candidate-executed')
    await write(repository,'scripts/candidate.cjs',`require('node:fs').writeFileSync(${JSON.stringify(tripwire)},'EXECUTED')`)
    await write(repository,'package.json',JSON.stringify({scripts:{postinstall:'node scripts/candidate.cjs'}}))
    await git(repository,'init','-q','-b','master','--template=');await git(repository,'add','.');await git(repository,'commit','-qm','diagnostic fixed configuration')
    const config=await git(repository,'rev-parse','HEAD')
    await writeFile(sourcePath,source.replaceAll('Pipeline example','Forward pipeline example'));await git(fixture.repo,'add','.');await git(fixture.repo,'commit','-qm','diagnostic forward source')
    const target=await git(fixture.repo,'rev-parse','HEAD')
    await git(fixture.repo,'remote','add','origin','https://github.com/milvus-io/milvus-docs')
    await enter('provider-setup')
    const provider=await createGuidesProvider({capture,evidence,signal:AbortSignal.timeout(providerDeadlineMs),request:{kind:'guides-collection',schemaVersion:1,repositoryRoot:repository,sourceRepository:fixture.repo,devRepository:fixture.dev,master:config,configSnapshot:config,dev:fixture.devCommit,pages:['build-pipeline'],comparisonConfig:null,target,evidenceRun:null,evidenceZip:null},
      async prepareNext(context){const before=Buffer.from(context.lock.before.text),patch=patchNextLock({subject:context.subject,before:{path:context.lock.path,sha256:context.lock.before.blob.sha256,current,next:current},bytes:before,target,mode:'100644'});return {blob:await writeOwnedBlob(evidence,patch.bytes),text:patch.text}}})
    try{
      await enter('collect')
      const collected=await provider.collectAll();result.worker.generationExecuted=true
      await enter('validate')
      const settlement=collected.workerSettlement;result.worker.settlement=settlementSummary(settlement)
      if(!validateDiagnosticSettlement(settlement))throw new Error('WORKER_UNSETTLED')
      const plans=provider.planAll();result.worker.resultValidated=true;result.worker.planDispositions=plans.map(plan=>plan.disposition)
      // Candidate data must never run, and no generated content/lock is installed.
      try{await lstat(tripwire);throw new Error('CANDIDATE_EXECUTED')}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error}
      result.worker.tripwireUntouched=true
      if(plans.some(plan=>plan.disposition==='candidate'&&plan.nextEdits.length!==1))throw new Error('NON_NEXT_ONLY_PLAN')
      for(const plan of plans)for(const edit of plan.nextEdits)if(edit.before.current!==current||edit.before.next!==current||edit.target!==target||edit.before.path!=='shared-docs/guides/pages/build-pipeline/lock.yaml')throw new Error('NON_NEXT_ONLY_PLAN')
      result.worker.observation=await writeOwnedBlob(evidence,canonicalBytes({kind:'diagnostic-worker-observation',schemaVersion:1,fixture:{current,target,master:config,trustedTools:input.master,dev:fixture.devCommit},plans,settlement:settlementSummary(settlement)}))
      if(collected.collection.holds.length||plans.length!==1||plans.some(plan=>plan.disposition!=='candidate'))throw new Error('WORKER_PREPARATION_HELD')
      await enter('final-verify')
      await verifyTrustedToolset(capture)
      if((await gitRead('rev-parse','HEAD')).toString().trim()!==input.master)throw new Error('MASTER_MISMATCH')
      pass();result.worker.status='passed'
    }catch(error){
      const observed=provider.getWorkerSettlement()??(error as {settlement?:unknown})?.settlement
      result.worker.settlement=settlementSummary(observed)??result.worker.settlement
      if(observed&&typeof observed==='object'&&(observed as {born?:boolean}).born===true)result.worker.generationExecuted=true
      throw error
    }
  }catch(error){
    const message=error instanceof Error?error.message:''
    const allowed=['MASTER_MISMATCH','AMBIGUOUS_GIT_STORAGE','CAPTURE_BINDING_MISMATCH','WORKER_UNSETTLED','WORKER_PREPARATION_HELD','CANDIDATE_EXECUTED','NON_NEXT_ONLY_PLAN','COOPERATIVE_DEADLINE','TOOL_DESCRIPTION_OUTPUT_LIMIT']
    result.failure={phase,code:allowed.includes(message)?message:phase==='capture'?'CAPTURE_REFUSED':phase==='capacity'?'CAPACITY_INCOMPLETE':phase==='worker'?'WORKER_REFUSED':'DIAGNOSTIC_REFUSED'}
    if(phase==='capture'){result.failure.category=classifyCaptureRefusal(message.slice(0,4096));result.failure.reason=captureRefusalReason(error)}
    if(phase==='worker')result.failure.reason=workerRefusalReason(error)
    result.phases.push({phase,milliseconds:Math.ceil(performance.now()-phaseStart),status:'held'})
  }
  // Do not retain raw exceptions, environment values, stdout/stderr or credential canaries.
  let reportBytes=canonicalBytes(result)
  if(reportBytes.length>1024*1024){
    result.report={status:'held',reason:'REPORT_OUTPUT_LIMIT'}
    result.worker.planDispositions=[];reportBytes=canonicalBytes(result)
  }
  await evidence.writeJournal('diagnostic.json',reportBytes)
  return result
}
