import {spawn,execFileSync} from 'node:child_process'
import {createHash,randomUUID} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {open,mkdir,mkdtemp,readFile,writeFile,realpath,stat,lstat,readdir,link} from 'node:fs/promises'
import {homedir} from 'node:os'
import {basename,dirname,isAbsolute,join,relative,resolve,sep} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createRequire} from 'node:module'

const repository=fileURLToPath(new URL('../../',import.meta.url))
const require=createRequire(import.meta.url)
const reporter=fileURLToPath(new URL('./vitest-stop-reporter.mjs',import.meta.url))
export const HEAVY_FILES=['packages/docs-tooling/src/shared-docs/testing/updates/transactions.test.ts',
  'packages/docs-tooling/src/shared-docs/testing/updates/local-runner.test.ts']
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms))
const within=(root,path)=>{const r=relative(root,path);return r===''||r!=='..'&&!r.startsWith(`..${sep}`)&&!isAbsolute(r)}
const jsonWrite=(path,value)=>writeFile(path,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600})
const sha=bytes=>createHash('sha256').update(bytes).digest('hex')

/** One monotonic budget for setup, children, transitions and final output.
 * The short duration is injectable only through this internal contract-test API.
 * Every continuation checks it before starting another operation or side effect.
 */
export async function withGateDeadline(work,{milliseconds=15*60*1000,evidenceRoot=null}={}) {
  const started=performance.now(),expires=started+milliseconds,owned=new Set()
  let stage='preflight',expired=false,rejectExpiry
  const error=new Error('Grouped gate 15-minute outer deadline exhausted')
  error.code='ZDOC_GATE_DEADLINE'
  const expiry=new Promise((_,reject)=>{rejectExpiry=reject})
  expiry.catch(()=>{})
  const expire=()=>{expired=true;rejectExpiry(error)}
  const timer=setTimeout(expire,milliseconds)
  const budget={evidenceRoot,deadline:Date.now()+milliseconds,
    elapsed(){return performance.now()-started},limitMs:milliseconds,
    check(){if(expired||performance.now()>=expires){expire();throw error}},
    remaining(){this.check();return Math.max(1,Math.ceil(expires-performance.now()))},
    get expired(){return expired||performance.now()>=expires},
    register(owner){owned.add(owner)},release(owner){owned.delete(owner)},
    async step(name,action){this.check();stage=name;const result=await Promise.race([action(),expiry]);this.check();return result}}
  try {
    const result=await Promise.race([work(budget),expiry])
    budget.check()
    return result
  } catch(cause) {
    const failure={success:false,failure:cause.message,stage,at:Date.now(),rawCountsComplete:false,
      owners:[...owned].map(o=>({pid:o.pid,directory:o.directory}))}
    // Record the abort before stopping this invocation's registered groups. A
    // preflight without a root still emits a retained stderr failure record.
    console.error(JSON.stringify(failure))
    // Diagnostic persistence must not hold the owned-group stop indefinitely.
    const record=async(name,value)=>{
      if(!budget.evidenceRoot)return
      let timeout
      try{await Promise.race([jsonWrite(join(budget.evidenceRoot,name),value),new Promise(resolve=>{timeout=setTimeout(resolve,250)})])}
      catch{/* The stderr record remains available if the evidence path fails. */}
      finally{clearTimeout(timeout)}
    }
    await record('gate-failure.json',failure)
    const stopped=await Promise.all([...owned].map(async o=>{
      let settled=false;const errors=[]
      try{settled=await o.stop()===true}catch(error){errors.push(cleanupError('stop',null,o.pid,error))}
      return {pid:o.pid,settled,cleanupErrors:[...o.cleanupErrors??[],...errors],signals:[...o.signals??[]],exit:o.exit??null,observedFailure:o.observedFailure??null}
    }))
    await record('gate-stop.json',{failure,stopped})
    throw cause
  } finally {clearTimeout(timer)}
}

export function parseOptions(args) {
  const options={scope:null,output:null,reporters:[]}
  for(let i=0;i<args.length;i++) {
    const [key,...rest]=args[i].split('='),value=rest.length?rest.join('='):args[++i]
    if(!value||value.startsWith('--'))throw new Error(`Missing value or unsupported option: ${key}`)
    if(key==='--scope'&&options.scope===null&&['all','shared-docs'].includes(value))options.scope=value
    else if(key==='--outputFile.json'&&options.output===null)options.output=resolve(value)
    else if(key==='--reporter'&&['default','json'].includes(value))options.reporters.push(value)
    else throw new Error(`Unsupported grouped-gate option: ${key}; use direct Vitest for narrowed diagnostics`)
  }
  if(!options.scope)throw new Error('Expected --scope all or --scope shared-docs')
  return options
}

function normalizedFiles(files,root) {
  if(!Array.isArray(files)||!files.length)throw new Error('Empty or invalid file manifest')
  const normalized=files.map(file=>{
    if(typeof file!=='string'||!isAbsolute(file)||resolve(file)!==file||!within(root,file)||file===root)throw new Error('Invalid manifest path')
    return file
  })
  if(new Set(normalized).size!==normalized.length)throw new Error('Duplicate manifest file')
  return normalized.sort()
}
function equalFiles(actual,expected,root) {
  const a=normalizedFiles(actual,root),b=normalizedFiles(expected,root)
  if(JSON.stringify(a)!==JSON.stringify(b))throw new Error('File manifest mismatch')
}
export function partitionFiles(discovery,root,scope) {
  if(!Array.isArray(discovery)||discovery.some(x=>!x||typeof x!=='object'||x.projectName))throw new Error('Unsupported discovery manifest/project')
  const files=normalizedFiles(discovery.map(x=>x.file),root)
  if(scope==='shared-docs'&&files.some(f=>!within(join(root,'packages/docs-tooling/src/shared-docs'),f)))throw new Error('Out-of-scope discovered file')
  const heavy=HEAVY_FILES.map(p=>join(root,p))
  if(heavy.some(f=>!files.includes(f)))throw new Error('Missing heavy test file')
  const phases=[{name:'light',files:files.filter(f=>!heavy.includes(f)),heavy:false},
    ...heavy.map((file,i)=>({name:i?'local-runner':'transactions',files:[file],heavy:true}))]
  if(!phases[0].files.length)throw new Error('Empty light selection')
  equalFiles(phases.flatMap(p=>p.files),files,root)
  return {files,phases}
}

export function inspectEvents(text,{runId,expected,root,heavy,final=false}) {
  const chunks=text.split('\n'),tail=chunks.pop()
  if(final&&tail)throw new Error('Incomplete reporter event')
  let start=null,terminal=null,initialized=false,failure=null
  for(let i=0;i<chunks.length;i++) {
    const e=JSON.parse(chunks[i])
    if(!e||e.version!==1||e.runId!==runId||e.sequence!==i||terminal)throw new Error('Invalid or foreign reporter event')
    if(e.kind==='init'&&i===0&&Number.isSafeInteger(e.pid)&&e.pid>0)initialized=true
    else if(e.kind==='start'&&initialized&&!start) {
      equalFiles(e.files,expected,root)
      if(!Array.isArray(e.configuration)||!e.configuration.length)throw new Error('Missing resolved configuration')
      if(heavy&&e.configuration.some(c=>c.pool!=='forks'||c.maxWorkers!==1||c.isolate!==true))throw new Error('Heavy worker policy mismatch')
      start=e
    } else if(e.kind==='failure'&&initialized&&typeof e.name==='string')failure??=e
    else if(e.kind==='terminal'&&start&&Array.isArray(e.errors)&&Array.isArray(e.files)) {
      equalFiles(e.files.map(x=>x.file),expected,root)
      if(!['passed','failed','interrupted'].includes(e.reason)||e.files.some(x=>!['passed','failed','skipped'].includes(x.state)))throw new Error('Invalid terminal state')
      terminal=e
      if(e.reason!=='passed'||e.errors.length||e.files.some(x=>x.state==='failed'))failure??=e
    } else throw new Error('Unexpected reporter event sequence')
  }
  if(final&&(!start||!terminal))throw new Error('Missing reporter terminal')
  return {start,terminal,failure}
}

function cleanupError(operation,signal,pid,error) {
  return {operation,signal,processGroup:pid,code:error.code??null,message:error.message,at:Date.now()}
}
function groupAlive(pid,errors) {
  try{process.kill(-pid,0);return true}catch(error){
    if(error.code==='ESRCH')return false
    errors.push(cleanupError('probe',0,pid,error));return null
  }
}
async function stopGroup(pid,signals,graceMs,errors,waitForLeaderExit) {
  const initial=groupAlive(pid,errors)
  if(initial!==true)return initial===false
  for(const signal of ['SIGTERM','SIGKILL']) {
    try{process.kill(-pid,signal);signals.push({pid,signal,at:Date.now()})}catch(error){
      if(error.code==='ESRCH')return true
      errors.push(cleanupError('signal',signal,pid,error));return false
    }
    const until=Date.now()+graceMs
    await waitForLeaderExit(until)
    while(true) {
      const state=groupAlive(pid,errors)
      if(state!==true)return state===false
      if(Date.now()>=until)break
      await pause(25)
    }
  }
  return false
}

/** Internal process primitive: each call owns only its newly detached POSIX group. */
export async function supervise({argv,cwd,env,directory,deadline,protocol=null,graceMs=1000,budget=null}) {
  if(!['darwin','linux'].includes(process.platform))throw new Error('Grouped test ownership supports macOS/Linux only')
  const beforeSpawn=()=>{budget?.check();if(Date.now()>=deadline)throw new Error('Grouped gate deadline expired before spawn')}
  beforeSpawn()
  await mkdir(directory,{mode:0o700})
  const stdout=await open(join(directory,'stdout'),'wx',0o600),stderr=await open(join(directory,'stderr'),'wx',0o600)
  const started=Date.now(),signals=[],cleanupErrors=[],persistenceErrors=[]
  let child,owner,stopping,exit=null,reason=null,spawnError=null,observed=null,settled=false,supervisorError=null
  let notifyExit
  const leaderExited=new Promise(resolve=>{notifyExit=resolve})
  const waitForLeaderExit=async until=>{
    if(exit!==null||Date.now()>=until)return
    let timer
    try{await Promise.race([leaderExited,new Promise(resolve=>{timer=setTimeout(resolve,Math.max(0,until-Date.now()))})])}
    finally{clearTimeout(timer)}
  }
  const stopOwned=()=>stopping??=(cleanupErrors.length?Promise.resolve(false):child?.pid?stopGroup(child.pid,signals,graceMs,cleanupErrors,waitForLeaderExit):Promise.resolve(true))
  const persistError=(operation,error)=>{persistenceErrors.push({operation,code:error.code??null,message:error.message,at:Date.now()})}
  const interrupt=signal=>{reason??=`Supervisor interrupted: ${signal}`}
  const onInt=()=>interrupt('SIGINT'),onTerm=()=>interrupt('SIGTERM')
  process.on('SIGINT',onInt);process.on('SIGTERM',onTerm)
  try {
    beforeSpawn()
    child=spawn(argv[0],argv.slice(1),{cwd,env,detached:true,stdio:['ignore',stdout.fd,stderr.fd]})
    owner={pid:child.pid,directory,stop:stopOwned,cleanupErrors,signals,get exit(){return exit},get observedFailure(){return observed?.failure??null}};if(child.pid)budget?.register(owner)
    child.once('error',e=>{spawnError=e;reason??=`Spawn failed: ${e.message}`;exit={code:null,signal:null}})
    child.once('exit',(code,signal)=>{exit={code,signal};notifyExit()})
    await jsonWrite(join(directory,'owner.json'),{pid:child.pid??null,processGroup:child.pid??null,started,argv,cwd})
    while(true) {
      if(protocol) {
        try {
          const path=join(directory,'events.jsonl')
          const info=await stat(path)
          if(info.size>4*1024*1024)throw new Error('Reporter event channel exceeded bound; raw file retained')
          observed=inspectEvents(await readFile(path,'utf8'),{...protocol,final:exit!==null})
          if(observed.failure)reason??='Reported test/module failure'
        }catch(e){if(e.code!=='ENOENT'||exit!==null)reason??=`Reporter protocol: ${e.message}`}
      }
      if(budget?.expired||Date.now()>=deadline)reason??='Grouped gate 15-minute outer deadline exhausted'
      if(reason) {
        await jsonWrite(join(directory,'failure.json'),{reason,observed,exit,at:Date.now()})
        if(child.pid)settled=await stopOwned()
        break
      }
      if(exit!==null)break
      await pause(25)
    }
    if(!exit&&child.pid) {
      const until=Date.now()+graceMs
      while(!exit&&Date.now()<until)await pause(25)
    }
    // A denied cleanup is already an unknown result. Do not probe/escalate
    // again through the natural-exit branch or retry the same rejected action.
    if(child.pid&&!settled&&!stopping) {
      const until=Date.now()+250
      let state=groupAlive(child.pid,cleanupErrors)
      while(state===true&&Date.now()<until){await pause(25);state=groupAlive(child.pid,cleanupErrors)}
      if(state===false)settled=true
      else {
        reason??=state===null?'Owned process group state unknown':'Owned child processes survived invocation exit'
        if(!await stat(join(directory,'failure.json')).catch(()=>null))await jsonWrite(join(directory,'failure.json'),{reason,observed,exit,at:Date.now()})
        if(state===true)settled=await stopOwned()
      }
    }
  } catch(error) {
    supervisorError={code:error.code??null,message:error.message,stack:error.stack,at:Date.now()}
    reason??=`Supervisor failed: ${error.message}`
    try{await jsonWrite(join(directory,'supervisor-error.json'),supervisorError)}catch(e){persistError('supervisor-error',e)}
    if(child?.pid)settled=await stopOwned()
  } finally {
    process.off('SIGINT',onInt);process.off('SIGTERM',onTerm)
    if(settled&&owner)budget?.release(owner)
    for(const [name,handle] of [['stdout',stdout],['stderr',stderr]]) {
      try{await handle.close()}catch(error){persistError(`close ${name}`,error);reason??=`Could not close ${name}`}
    }
  }
  const result={argv,cwd,started,ended:Date.now(),exitCode:exit?.code??null,signal:exit?.signal??null,reason,
    settled:spawnError?true:settled,signals,observed,cleanupErrors,supervisorError,persistenceErrors,
    cleanupStatus:cleanupErrors.length?'unknown':settled?'settled':child?.pid?'unsettled':'not-started',
    success:!reason&&!cleanupErrors.length&&!persistenceErrors.length&&exit?.code===0&&settled}
  try {
    await jsonWrite(join(directory,'receipt.json'),result)
    return {...result,receiptPersistence:'confirmed'}
  } catch(error) {
    persistError('receipt',error)
    result.success=false;result.reason??='Supervisor receipt persistence unconfirmed'
    console.error(JSON.stringify({supervisorFailure:{reason:result.reason,observedFailure:observed?.failure??null,cleanupErrors,persistenceErrors,exitCode:result.exitCode,settled:result.settled}}))
    return {...result,receiptPersistence:'unconfirmed'}
  }
}

export function validateRawReport(raw,expected,root) {
  if(!raw||raw.success!==true||raw.numFailedTests!==0||!Array.isArray(raw.testResults))throw new Error('Missing or unsuccessful raw result')
  equalFiles(raw.testResults.map(f=>f.name),expected,root)
  for(const file of raw.testResults) {
    if(file.status!=='passed'||!Array.isArray(file.assertionResults)||file.assertionResults.some(t=>!['passed','skipped','pending','todo'].includes(t.status)))throw new Error('Failed/incomplete file result')
  }
  const cases=raw.testResults.flatMap(f=>f.assertionResults)
  if(raw.numTotalTests!==cases.length||raw.numPassedTests!==cases.filter(t=>t.status==='passed').length)throw new Error('Raw result count mismatch')
}

export async function runPhases(phases,execute) {
  const completed=[]
  for(const phase of phases) {
    let result
    try{result=await execute(phase)}catch(e){result={name:phase.name,files:phase.files,success:false,error:e.message,raw:null,receipt:{exitCode:null,settled:false,reason:'Supervisor failed'}}}
    completed.push(result)
    if(!result.success)return {success:false,completed,unrun:phases.slice(completed.length).flatMap(p=>p.files)}
  }
  return {success:true,completed,unrun:[]}
}

export function summarizeReports(completed) {
  const reports=completed.filter(p=>Array.isArray(p.raw?.testResults)&&p.raw.testResults.every(f=>Array.isArray(f?.assertionResults)))
  const testResults=reports.flatMap(p=>p.raw.testResults),cases=testResults.flatMap(f=>f.assertionResults)
  const skipped=t=>['skipped','pending'].includes(t.status)
  const suites=Object.fromEntries(['numTotalTestSuites','numPassedTestSuites','numFailedTestSuites','numPendingTestSuites']
    .map(key=>[key,reports.reduce((sum,p)=>sum+(Number.isSafeInteger(p.raw[key])?p.raw[key]:0),0)]))
  const snapshot={}
  for(const phase of reports)for(const [key,value] of Object.entries(phase.raw.snapshot??{})) {
    if(typeof value==='number')snapshot[key]=(snapshot[key]??0)+value
    else if(typeof value==='boolean')snapshot[key]=(snapshot[key]??false)||value
    else if(Array.isArray(value))snapshot[key]=[...snapshot[key]??[],...value]
  }
  const observedFailures=completed.flatMap(p=>p.receipt?.observed?.failure?[{phase:p.name,event:p.receipt.observed.failure}]:[])
  return {...suites,snapshot,testResults,observedFailures,rawCountsComplete:reports.length===completed.length&&completed.every(p=>p.success),
    numTotalTests:cases.length,numPassedTests:cases.filter(t=>t.status==='passed').length,
    numFailedTests:cases.filter(t=>t.status==='failed').length,
    numPendingTests:reports.filter(p=>p.success).flatMap(p=>p.raw.testResults).flatMap(f=>f.assertionResults).filter(skipped).length,
    unqualifiedSkippedTests:reports.filter(p=>!p.success).flatMap(p=>p.raw.testResults).flatMap(f=>f.assertionResults).filter(skipped).length,
    numTodoTests:cases.filter(t=>t.status==='todo').length}
}

export function tempParentPath(platform,home,override) {
  if(typeof home!=='string'||!home||!isAbsolute(home)||resolve(home)!==home)throw new Error('Missing or unsafe home directory')
  const parent=override??join(home,'.cache/zdoc-vitest')
  if(!['darwin','linux'].includes(platform)||!isAbsolute(parent)||resolve(parent)!==parent||parent.split(sep).includes('.git'))throw new Error('Invalid grouped test temporary parent')
  return parent
}
async function canonicalCandidate(path) {
  const suffix=[];let existing=path
  while(true) {
    try{return join(await realpath(existing),...suffix.reverse())}
    catch(e){if(e.code!=='ENOENT')throw e;suffix.push(basename(existing));existing=dirname(existing)}
  }
}
async function directoryPins(path,{allowMissing=false}={}) {
  const pins=[]
  for(let current=path;;current=dirname(current)) {
    const s=await lstat(current,{bigint:true}).catch(e=>{if(allowMissing&&e.code==='ENOENT')return null;throw e})
    if(s) {
      if(!s.isDirectory()||s.isSymbolicLink())throw new Error('Directory ancestor alias or non-directory')
      const parent=dirname(current),names=parent===current?[]:await readdir(parent),name=basename(current)
      if(names.some(n=>n!==name&&n.toLocaleLowerCase('en-US')===name.toLocaleLowerCase('en-US')))throw new Error('Directory case alias')
      pins.push({path:current,device:s.dev.toString(),inode:s.ino.toString(),mode:Number(s.mode&0o777n),uid:s.uid.toString(),entries:(await readdir(current)).length})
    }
    if(dirname(current)===current)break
  }
  return pins
}
export async function verifyTemporaryRoot(layout) {
  for(const pin of layout.ancestors) {
    const s=await lstat(pin.path,{bigint:true})
    if(!s.isDirectory()||s.isSymbolicLink()||s.dev.toString()!==pin.device||s.ino.toString()!==pin.inode||Number(s.mode&0o777n)!==pin.mode||s.uid.toString()!==pin.uid)throw new Error('Temporary directory identity changed')
  }
}
export async function resolveProtectedInputs(cwd,output=null,budget=null) {
  const git=args=>execFileSync('git',['--no-replace-objects','rev-parse','--path-format=absolute',...args],{cwd,encoding:'utf8',timeout:Math.min(10000,budget?.remaining()??10000),killSignal:'SIGKILL'}).trim()
  const gitdir=await realpath(git(['--git-dir'])),common=await realpath(git(['--git-common-dir']))
  const paths=[await realpath(cwd),gitdir,common],pending=[git(['--git-path','objects'])],seen=new Set()
  if(process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES) {
    const alternates=process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES
    if(/["\0\r\n]/.test(alternates))throw new Error('Unsupported ambient object alternate path')
    pending.push(...alternates.split(':').filter(Boolean).map(p=>resolve(cwd,p)))
  }
  while(pending.length) {
    budget?.check()
    const objects=await realpath(pending.pop())
    if(seen.has(objects))continue
    if(seen.size>=256)throw new Error('Too many protected object stores')
    seen.add(objects);paths.push(objects)
    const file=join(objects,'info/alternates'),info=await stat(file).catch(e=>{if(e.code==='ENOENT')return null;throw e})
    if(info) {
      if(!info.isFile()||info.size>1024*1024)throw new Error('Unsupported object alternates')
      for(const line of (await readFile(file,'utf8')).split('\n').filter(Boolean)) {
        if(/[\0\r]/.test(line)||line.startsWith('"'))throw new Error('Unsupported object alternate path')
        pending.push(resolve(objects,line))
      }
    }
  }
  if(output)paths.push(await canonicalCandidate(output))
  return [...new Set(paths)]
}
export async function createTemporaryRoot(cwd,{platform=process.platform,home=homedir(),override=process.env.ZDOC_TEST_TMP_PARENT,protectedPaths=[],budget=null}={}) {
  // A dedicated user-owned parent avoids assuming a crowded system temp root is
  // equivalent to a retained-artifact layout. Existing directories are never chmodded.
  const requested=tempParentPath(platform,home,override)
  const homePins=await directoryPins(home)
  if(homePins[0].uid!==String(process.getuid()))throw new Error('Home directory must be owned by the current user')
  const initialPins=await directoryPins(requested,{allowMissing:true}),canonical=await canonicalCandidate(requested)
  const protectedActual=await Promise.all([cwd,...protectedPaths].map(canonicalCandidate))
  if(protectedActual.some(p=>within(p,canonical)||within(canonical,p))||canonical.split(sep).includes('.git'))throw new Error('Test temporary parent overlaps a protected input/output')
  const protectedIdentities=await Promise.all(protectedActual.map(p=>lstat(p,{bigint:true}).catch(e=>{if(e.code==='ENOENT')return null;throw e})))
  if(initialPins.some(pin=>protectedIdentities.some(s=>s&&s.dev.toString()===pin.device&&s.ino.toString()===pin.inode)))throw new Error('Physical alias of protected input/output')
  await verifyTemporaryRoot({ancestors:initialPins})
  budget?.check()
  await mkdir(canonical,{recursive:true,mode:0o700})
  await verifyTemporaryRoot({ancestors:initialPins})
  const parentInfo=await lstat(canonical)
  if(!parentInfo.isDirectory()||parentInfo.isSymbolicLink()||parentInfo.uid!==process.getuid()||(parentInfo.mode&0o777)!==0o700)throw new Error('Temporary parent must be an owned0700 directory, not a symlink')
  const parent=await realpath(canonical),parentPins=await directoryPins(canonical)
  if(parent!==canonical)throw new Error('Temporary parent changed during creation')
  budget?.check()
  const root=await mkdtemp(join(parent,'run-'))
  if(budget)budget.evidenceRoot=root
  budget?.check()
  await verifyTemporaryRoot({ancestors:parentPins})
  if(within(cwd,root)||root.split(sep).includes('.git'))throw new Error('Test temporary root must be outside the checkout and Git metadata')
  const info=await stat(root)
  if((info.mode&0o777)!==0o700||info.uid!==process.getuid())throw new Error('Temporary root is not privately owned')
  const ancestors=await directoryPins(root),layout={root,parent,ancestors,requested,protectedPaths:protectedActual,override:override??null,
    policy:'dedicated owned0700 ~/.cache/zdoc-vitest parent on macOS/Linux, or explicit ZDOC_TEST_TMP_PARENT; new canonical gate/phase roots; no chmod, cleanup or global TMPDIR change'}
  await verifyTemporaryRoot(layout);return layout
}
function sourceIdentity(cwd,budget) {
  const files=['package.json','vitest.config.ts','scripts/testing/run-vitest-groups.mjs','scripts/testing/vitest-stop-reporter.mjs','scripts/testing/run-vitest-groups.test.mjs']
  const git=args=>execFileSync('git',args,{cwd,timeout:Math.min(10000,budget.remaining()),killSignal:'SIGKILL'})
  return {head:git(['rev-parse','HEAD']).toString().trim(),
    trackedDiffSha256:sha(git(['diff','HEAD','--binary','--no-ext-diff','--no-textconv'])),
    harnessSha256:sha(Buffer.concat(files.flatMap(file=>[Buffer.from(file+'\0'),readFileSync(join(cwd,file)),Buffer.from('\0')])))}
}

async function boundFile(path,expected=null,maxBytes=64*1024*1024) {
  const info=await lstat(path,{bigint:true})
  if(!info.isFile()||info.size>BigInt(maxBytes))throw new Error('Invalid report/evidence file')
  const bytes=await readFile(path),binding={path,bytes:bytes.length,sha256:sha(bytes),device:String(info.dev),inode:String(info.ino)}
  const after=await lstat(path,{bigint:true})
  if(after.dev!==info.dev||after.ino!==info.ino||after.size!==info.size||BigInt(bytes.length)!==info.size)throw new Error('Report identity changed while reading')
  if(expected&&JSON.stringify(binding)!==JSON.stringify(expected))throw new Error('Report/evidence binding mismatch')
  return {binding,bytes}
}

/** Provisional reports never grant qualification. All fallible report work is
 * inside the execution budget; this returns an immutable, measured verdict.
 */
export async function prepareGateReports(aggregate,paths,budget) {
  const terminalPath=join(aggregate.evidenceRoot,'terminal.json'),runId=aggregate.runId
  const {success:phaseResultsPassed,...details}=aggregate
  const report={...details,phaseResultsPassed,qualification:'provisional; requires validated committed terminal',terminalPath}
  const reports=[]
  for(const path of paths) {
    await budget.step('report directory',()=>mkdir(dirname(path),{recursive:true}))
    await budget.step('provisional report',()=>jsonWrite(path,report))
    reports.push((await budget.step('report binding',()=>boundFile(path))).binding)
  }
  const phases=[]
  for(const phase of aggregate.phases) {
    const base=join(aggregate.evidenceRoot,phase.name)
    const capture=async file=>{
      try{return (await budget.step('phase evidence binding',()=>boundFile(join(base,file)))).binding}
      catch(error){if(!phaseResultsPassed&&error.code==='ENOENT')return null;throw error}
    }
    phases.push({...phase,raw:await capture('raw.json'),receipt:await capture('receipt.json')})
  }
  const verdict={version:1,runId,terminalPath,reports,phases,
    execution:{status:phaseResultsPassed?'passed':'failed',elapsedMs:budget.elapsed(),limitMs:budget.limitMs}}
  // Validate the exact artifact relationships before freezing; settlement only
  // persists/confirms these bytes and never runs tests or copies reports.
  await budget.step('prepared verdict validation',()=>validateGateVerdict(verdict,paths[0]))
  verdict.execution.elapsedMs=budget.elapsed();budget.check()
  return {terminalPath,reportPath:paths[0],terminalBytes:JSON.stringify(verdict,null,2)+'\n'}
}

async function validateGateVerdict(verdict,reportPath) {
  if(verdict?.version!==1||typeof verdict.runId!=='string'||!verdict.runId||
    !Array.isArray(verdict.reports)||!verdict.reports.length||verdict.reports.length>2||
    new Set(verdict.reports.map(r=>r.path)).size!==verdict.reports.length||
    !verdict.reports.some(r=>r.path===reportPath)||!Array.isArray(verdict.phases))throw new Error('Invalid terminal manifest')
  const execution=verdict.execution
  if(!['passed','failed'].includes(execution?.status)||!Number.isFinite(execution.elapsedMs)||execution.elapsedMs<0||
    !Number.isFinite(execution.limitMs)||execution.limitMs<=0||execution.limitMs>15*60*1000||execution.elapsedMs>=execution.limitMs)throw new Error('Invalid measured execution verdict')
  let report
  for(const binding of verdict.reports) {
    const value=JSON.parse((await boundFile(binding.path,binding)).bytes)
    if(value.runId!==verdict.runId||value.terminalPath!==verdict.terminalPath||
      value.terminalPath!==join(value.evidenceRoot,'terminal.json')||value.success!==undefined||
      value.qualification!=='provisional; requires validated committed terminal'||value.phaseResultsPassed!==(execution.status==='passed'))throw new Error('Invalid provisional report identity')
    if(binding.path===reportPath)report=value
  }
  if(execution.status==='passed') {
    if(verdict.phases.length!==3||verdict.phases.map(p=>p.name).join(',')!=='light,transactions,local-runner'||
      report.unrunFiles.length||report.unaccountedFiles.length||!report.rawCountsComplete)throw new Error('Incomplete successful phase manifest')
    equalFiles(verdict.phases.flatMap(p=>p.files),report.discoveredFiles,report.checkout)
  }
  for(const phase of verdict.phases) {
    const summary=report.phases.find(p=>p.name===phase.name)
    const {raw,receipt,...terminalSummary}=phase
    if(!summary||JSON.stringify(summary)!==JSON.stringify(terminalSummary))throw new Error('Phase summary mismatch')
    const rawData=raw?JSON.parse((await boundFile(raw.path,raw)).bytes):null
    const receiptData=receipt?JSON.parse((await boundFile(receipt.path,receipt)).bytes):null
    if(execution.status==='passed') {
      if(!phase.success||phase.exitCode!==0||!phase.settled||!receiptData?.success||receiptData.exitCode!==0||!receiptData.settled||
        receiptData.observed?.terminal?.reason!=='passed'||receiptData.observed.terminal.errors.length)throw new Error('Non-passing phase terminal')
      equalFiles(receiptData.observed.terminal.files.map(f=>f.file),phase.files,report.checkout)
      validateRawReport(rawData,phase.files,report.checkout)
    }
  }
  return {success:execution.status==='passed',committed:true,executionStatus:execution.status,
    commandStatus:'not-established-by-artifacts',report,terminal:verdict}
}

/** The only artifact qualification reader. A committed execution result does
 * not prove that the CLI received acknowledgment or exited successfully. */
export async function readGateReport(reportPath) {
  try {
    reportPath=resolve(reportPath)
    const report=JSON.parse((await boundFile(reportPath)).bytes)
    if(report.terminalPath!==join(report.evidenceRoot,'terminal.json'))throw new Error('Invalid terminal location')
    const terminal=JSON.parse((await boundFile(report.terminalPath,null,128*1024)).bytes)
    return await validateGateVerdict(terminal,reportPath)
  } catch(error){return {success:false,committed:false,executionStatus:'unknown',commandStatus:'not-established-by-artifacts',reason:error.message}}
}

/** Single attempt after the execution verdict is frozen. A publish call can
 * commit and lose its acknowledgment; unknown command delivery is not rollback.
 * Short limits/publish injection are private contract seams, never CLI options.
 */
export async function settleGateVerdict(prepared,{milliseconds=1000,publish=link,confirm=readGateReport}={}) {
  const started=performance.now();let aborted=false,timer
  const check=()=>{if(aborted||performance.now()-started>=milliseconds)throw new Error('Terminal settlement deadline exhausted')}
  const attempt=async()=>{
    const staged=join(dirname(prepared.terminalPath),'terminal-staged.json')
    check();const handle=await open(staged,'wx',0o600)
    try {check();await handle.writeFile(prepared.terminalBytes);check();await handle.sync();check()}
    finally{await handle.close()}
    check();await publish(staged,prepared.terminalPath);check()
    const verified=await confirm(prepared.reportPath);check()
    if(!verified.committed)throw new Error(`Terminal confirmation failed: ${verified.reason}`)
    return {...verified,settlementStatus:'acknowledged',commandStatus:verified.success?'passed':'failed'}
  }
  try {
    return await Promise.race([attempt(),new Promise((_,reject)=>{timer=setTimeout(()=>{aborted=true;reject(new Error('Terminal settlement deadline exhausted'))},milliseconds)})])
  } catch(error) {
    aborted=true
    const result={success:false,committed:null,executionStatus:'unknown',commandStatus:'unknown',settlementStatus:'unknown',reason:error.message,
      reportPath:prepared.reportPath,terminalPath:prepared.terminalPath}
    console.error(JSON.stringify(result));return result
  } finally{clearTimeout(timer)}
}

export async function runGate(options) {
  const prepared=await withGateDeadline(async budget=>{
    const started=Date.now(),deadline=budget.deadline,step=(name,action)=>budget.step(name,action)
    const cwd=await step('checkout preflight',()=>realpath(repository))
    if(!['darwin','linux'].includes(process.platform))throw new Error('Grouped gates support macOS/Linux process ownership only')
    if(options.output&&await step('output preflight',()=>stat(options.output).catch(e=>{if(e.code==='ENOENT')return null;throw e})))throw new Error('Requested aggregate output already exists; preserve or choose a fresh path')
    const protectedPaths=await step('Git preflight',()=>resolveProtectedInputs(cwd,options.output,budget))
    const layout=await step('temporary directory preflight',()=>createTemporaryRoot(cwd,{protectedPaths,budget})),root=layout.root
    const before=await step('source preflight',()=>sourceIdentity(cwd,budget)),vitest=join(dirname(require.resolve('vitest/package.json')),'vitest.mjs')
    const filters=options.scope==='shared-docs'?['packages/docs-tooling/src/shared-docs']:[]
    await step('setup record',()=>jsonWrite(join(root,'setup.json'),{started,deadline,cwd,scope:options.scope,layout,before,
      environment:{node:process.version,platform:process.platform,VITEST_MAX_WORKERS:process.env.VITEST_MAX_WORKERS??null,CI:process.env.CI??null}}))
    console.log(`Grouped Vitest evidence: ${root}`)
    let manifest=[],result={success:false,completed:[],unrun:[]},failure=null
    try {
      const discovery=join(root,'discovery.json')
      await step('discovery identity',()=>verifyTemporaryRoot(layout))
      const discovered=await step('discovery',()=>supervise({argv:[process.execPath,vitest,'list',...filters,'--filesOnly',`--json=${discovery}`],cwd,
        env:{...process.env,TMPDIR:root},directory:join(root,'discovery'),deadline,budget}))
      if(!discovered.success)throw new Error('Test discovery failed; see retained discovery logs/receipt')
      await step('discovery result identity',()=>verifyTemporaryRoot(layout))
      const partition=partitionFiles(JSON.parse(await step('discovery manifest',()=>readFile(discovery,'utf8'))),cwd,options.scope)
      manifest=partition.files
      await step('partition record',()=>jsonWrite(join(root,'manifest.json'),partition))
      result=await runPhases(partition.phases,async phase=>{
        const directory=join(root,phase.name),temp=join(root,`${phase.name}-tmp`),runId=randomUUID()
        await step(`${phase.name} identity`,()=>verifyTemporaryRoot(layout))
        await step(`${phase.name} temporary root`,()=>mkdir(temp,{mode:0o700}))
        const phaseLayout={ancestors:await step(`${phase.name} pins`,()=>directoryPins(temp))}
        await step(`${phase.name} root recheck`,()=>verifyTemporaryRoot(layout))
        await step(`${phase.name} phase recheck`,()=>verifyTemporaryRoot(phaseLayout))
        const rawPath=join(directory,'raw.json'),argv=[process.execPath,vitest,'run',...phase.files,'--allowOnly=false',
          '--reporter=default','--reporter=json',`--reporter=${reporter}`,`--outputFile.json=${rawPath}`,
          ...(phase.heavy?['--pool=forks','--isolate','--maxWorkers=1','--bail=1']:[])]
        console.log(`Starting ${phase.name}: ${phase.files.length} complete files${phase.heavy?' (one worker)':''}`)
        const receipt=await step(phase.name,()=>supervise({argv,cwd,env:{...process.env,...phase.heavy?{VITEST_MAX_WORKERS:'1'}:{},TMPDIR:temp,ZDOC_TEST_RUN_ID:runId,ZDOC_TEST_EVENTS:join(directory,'events.jsonl')},
          directory,deadline,budget,protocol:{runId,expected:phase.files,root:cwd,heavy:phase.heavy}}))
        let raw=null,error=null
        try {
          await step(`${phase.name} completed root`,()=>verifyTemporaryRoot(layout))
          await step(`${phase.name} completed phase`,()=>verifyTemporaryRoot(phaseLayout))
          raw=JSON.parse(await step(`${phase.name} raw report`,()=>readFile(rawPath,'utf8')))
          validateRawReport(raw,phase.files,cwd)
        }catch(e){error=e.message}
        const completed={name:phase.name,files:phase.files,success:receipt.success&&!error,receipt,raw,error}
        await step(`${phase.name} validated record`,()=>jsonWrite(join(directory,'validated.json'),{success:completed.success,error,rawPath,temporaryIdentity:phaseLayout}))
        console.log(`${phase.name}: ${completed.success?'PASS':'FAIL'}; evidence ${directory}`)
        return completed
      })
    } catch(e){failure=e.message}
    const after=await step('final source identity',()=>sourceIdentity(cwd,budget))
    if(JSON.stringify(before)!==JSON.stringify(after))failure??='Source identity changed during grouped gate'
    const success=!failure&&result.success&&result.completed.length===3
    const reports=summarizeReports(result.completed)
    reports.rawCountsComplete&&=result.completed.length===3&&!result.unrun.length
    const aggregate={success,runId:randomUUID(),checkout:cwd,startTime:started,endTime:Date.now(),evidenceRoot:root,scope:options.scope,before,after,failure,
      discoveredFiles:manifest,phases:result.completed.map(p=>({name:p.name,files:p.files,success:p.success,exitCode:p.receipt.exitCode,settled:p.receipt.settled,error:p.error,reason:p.receipt.reason,cleanupStatus:p.receipt.cleanupStatus??'unknown',cleanupErrors:p.receipt.cleanupErrors??[],receiptPersistence:p.receipt.receiptPersistence??'unconfirmed'})),
      unrunFiles:result.unrun,unaccountedFiles:manifest.filter(file=>!reports.testResults.some(f=>f.name===file)),...reports,
      qualification:success?'Complete discovered selection passed and every owned group settled':'Failed/incomplete; raw counts cover only available reports, unrun files and cancelled tests are not ordinary platform skips'}
    await step('final root identity',()=>verifyTemporaryRoot(layout))
    return prepareGateReports(aggregate,[join(root,'aggregate.json'),...options.output?[options.output]:[]],budget)
  })
  const result=await settleGateVerdict(prepared),report=result.report
  if(result.settlementStatus==='acknowledged')console.log(`${result.success?'PASS':'FAIL'} grouped ${options.scope}: ${report.rawCountsComplete?`${report.numPassedTests} passed, ${report.numFailedTests} failed, ${report.numPendingTests} skipped`:`INCOMPLETE raw counts; at least ${report.observedFailures.length} observed failure event(s)`}; ${report.evidenceRoot}`)
  return result
}

export function finishGateCommand(result) {
  if(result.settlementStatus==='unknown'||result.report?.phases.some(p=>p.settled!==true))process.exit(1)
  process.exitCode=result.success?0:1
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try{finishGateCommand(await runGate(parseOptions(process.argv.slice(2))))}
  catch(e){console.error(e.stack??e);if(e.code==='ZDOC_GATE_DEADLINE')process.exit(1);process.exitCode=1}
}
