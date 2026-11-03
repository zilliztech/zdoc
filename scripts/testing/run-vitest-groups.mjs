import {spawn,execFileSync} from 'node:child_process'
import {createHash,randomUUID} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {open,mkdir,mkdtemp,readFile,writeFile,realpath,stat,lstat,readdir} from 'node:fs/promises'
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

function groupAlive(pid) {
  try{process.kill(-pid,0);return true}catch(e){if(e.code==='ESRCH')return false;throw e}
}
async function stopGroup(pid,signals,graceMs) {
  if(!groupAlive(pid))return true
  for(const signal of ['SIGTERM','SIGKILL']) {
    try{process.kill(-pid,signal);signals.push({pid,signal,at:Date.now()})}catch(e){if(e.code!=='ESRCH')throw e}
    const until=Date.now()+graceMs
    while(groupAlive(pid)&&Date.now()<until)await pause(25)
    if(!groupAlive(pid))return true
  }
  return false
}

/** Internal process primitive: each call owns only its newly detached POSIX group. */
export async function supervise({argv,cwd,env,directory,deadline,protocol=null,graceMs=1000}) {
  if(!['darwin','linux'].includes(process.platform))throw new Error('Grouped test ownership supports macOS/Linux only')
  await mkdir(directory,{mode:0o700})
  const stdout=await open(join(directory,'stdout'),'wx',0o600),stderr=await open(join(directory,'stderr'),'wx',0o600)
  const started=Date.now(),signals=[]
  let child,exit=null,reason=null,spawnError=null,observed=null,settled=false
  const interrupt=signal=>{reason??=`Supervisor interrupted: ${signal}`}
  const onInt=()=>interrupt('SIGINT'),onTerm=()=>interrupt('SIGTERM')
  process.on('SIGINT',onInt);process.on('SIGTERM',onTerm)
  try {
    child=spawn(argv[0],argv.slice(1),{cwd,env,detached:true,stdio:['ignore',stdout.fd,stderr.fd]})
    child.once('error',e=>{spawnError=e;reason??=`Spawn failed: ${e.message}`;exit={code:null,signal:null}})
    child.once('exit',(code,signal)=>{exit={code,signal}})
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
      if(Date.now()>=deadline)reason??='Grouped gate 15-minute outer deadline exhausted'
      if(reason) {
        await jsonWrite(join(directory,'failure.json'),{reason,observed,exit,at:Date.now()})
        if(child.pid)settled=await stopGroup(child.pid,signals,graceMs)
        break
      }
      if(exit!==null)break
      await pause(25)
    }
    if(!exit&&child.pid) {
      const until=Date.now()+graceMs
      while(!exit&&Date.now()<until)await pause(25)
    }
    if(child.pid&&!settled) {
      const until=Date.now()+250
      while(groupAlive(child.pid)&&Date.now()<until)await pause(25)
      if(groupAlive(child.pid)) {
        reason??='Owned child processes survived invocation exit'
        if(!await stat(join(directory,'failure.json')).catch(()=>null))await jsonWrite(join(directory,'failure.json'),{reason,exit,at:Date.now()})
        settled=await stopGroup(child.pid,signals,graceMs)
      } else settled=true
    }
    const result={argv,cwd,started,ended:Date.now(),exitCode:exit?.code??null,signal:exit?.signal??null,reason,
      settled:spawnError?true:settled,signals,observed,success:!reason&&exit?.code===0&&settled}
    await jsonWrite(join(directory,'receipt.json'),result)
    return result
  } catch(error) {
    try{await jsonWrite(join(directory,'supervisor-error.json'),{message:error.message,at:Date.now()})}catch{/* Preserve any existing failure record. */}
    if(child?.pid)await stopGroup(child.pid,signals,graceMs)
    throw error
  } finally {
    process.off('SIGINT',onInt);process.off('SIGTERM',onTerm)
    await stdout.close();await stderr.close()
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
  return {...suites,snapshot,testResults,numTotalTests:cases.length,numPassedTests:cases.filter(t=>t.status==='passed').length,
    numFailedTests:cases.filter(t=>t.status==='failed').length,
    numPendingTests:reports.filter(p=>p.success).flatMap(p=>p.raw.testResults).flatMap(f=>f.assertionResults).filter(skipped).length,
    unqualifiedSkippedTests:reports.filter(p=>!p.success).flatMap(p=>p.raw.testResults).flatMap(f=>f.assertionResults).filter(skipped).length,
    numTodoTests:cases.filter(t=>t.status==='todo').length}
}

export function tempParentPath(platform,home,override) {
  if(typeof home!=='string'||!home||!isAbsolute(home)||resolve(home)!==home)throw new Error('Missing or unsafe home directory')
  const parent=override??(platform==='darwin'?join(home,'Library/Caches/zdoc-vitest'):join(home,'.cache/zdoc-vitest'))
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
export async function resolveProtectedInputs(cwd,output=null) {
  const git=args=>execFileSync('git',['--no-replace-objects','rev-parse','--path-format=absolute',...args],{cwd,encoding:'utf8'}).trim()
  const gitdir=await realpath(git(['--git-dir'])),common=await realpath(git(['--git-common-dir']))
  const paths=[await realpath(cwd),gitdir,common],pending=[git(['--git-path','objects'])],seen=new Set()
  if(process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES) {
    const alternates=process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES
    if(/["\0\r\n]/.test(alternates))throw new Error('Unsupported ambient object alternate path')
    pending.push(...alternates.split(':').filter(Boolean).map(p=>resolve(cwd,p)))
  }
  while(pending.length) {
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
export async function createTemporaryRoot(cwd,{platform=process.platform,home=homedir(),override=process.env.ZDOC_TEST_TMP_PARENT,protectedPaths=[]}={}) {
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
  await mkdir(canonical,{recursive:true,mode:0o700})
  await verifyTemporaryRoot({ancestors:initialPins})
  const parentInfo=await lstat(canonical)
  if(!parentInfo.isDirectory()||parentInfo.isSymbolicLink()||parentInfo.uid!==process.getuid()||(parentInfo.mode&0o777)!==0o700)throw new Error('Temporary parent must be an owned0700 directory, not a symlink')
  const parent=await realpath(canonical),parentPins=await directoryPins(canonical)
  if(parent!==canonical)throw new Error('Temporary parent changed during creation')
  const root=await mkdtemp(join(parent,'run-'))
  await verifyTemporaryRoot({ancestors:parentPins})
  if(within(cwd,root)||root.split(sep).includes('.git'))throw new Error('Test temporary root must be outside the checkout and Git metadata')
  const info=await stat(root)
  if((info.mode&0o777)!==0o700||info.uid!==process.getuid())throw new Error('Temporary root is not privately owned')
  const ancestors=await directoryPins(root),layout={root,parent,ancestors,requested,protectedPaths:protectedActual,override:override??null,
    policy:'dedicated owned0700 user-cache parent (macOS Library/Caches/zdoc-vitest; Linux .cache/zdoc-vitest), or explicit ZDOC_TEST_TMP_PARENT; new canonical gate/phase roots; no chmod, cleanup or global TMPDIR change'}
  await verifyTemporaryRoot(layout);return layout
}
function sourceIdentity(cwd) {
  const files=['package.json','vitest.config.ts','scripts/testing/run-vitest-groups.mjs','scripts/testing/vitest-stop-reporter.mjs','scripts/testing/run-vitest-groups.test.mjs']
  return {head:execFileSync('git',['rev-parse','HEAD'],{cwd,encoding:'utf8'}).trim(),
    trackedDiffSha256:sha(execFileSync('git',['diff','HEAD','--binary'],{cwd})),
    harnessSha256:sha(Buffer.concat(files.flatMap(file=>[Buffer.from(file+'\0'),readFileSync(join(cwd,file)),Buffer.from('\0')])))}
}

export async function runGate(options) {
  const started=Date.now(),deadline=started+15*60*1000,cwd=await realpath(repository)
  if(!['darwin','linux'].includes(process.platform))throw new Error('Grouped gates support macOS/Linux process ownership only')
  if(options.output&&await stat(options.output).catch(()=>null))throw new Error('Requested aggregate output already exists; preserve or choose a fresh path')
  const protectedPaths=await resolveProtectedInputs(cwd,options.output),layout=await createTemporaryRoot(cwd,{protectedPaths}),root=layout.root,before=sourceIdentity(cwd),vitest=join(dirname(require.resolve('vitest/package.json')),'vitest.mjs')
  const filters=options.scope==='shared-docs'?['packages/docs-tooling/src/shared-docs']:[]
  await jsonWrite(join(root,'setup.json'),{started,deadline,cwd,scope:options.scope,layout,before,
    environment:{node:process.version,platform:process.platform,VITEST_MAX_WORKERS:process.env.VITEST_MAX_WORKERS??null,CI:process.env.CI??null}})
  console.log(`Grouped Vitest evidence: ${root}`)
  let manifest=[],phases=[],result={success:false,completed:[],unrun:[]},failure=null
  try {
    const discovery=join(root,'discovery.json')
    await verifyTemporaryRoot(layout)
    const discovered=await supervise({argv:[process.execPath,vitest,'list',...filters,'--filesOnly',`--json=${discovery}`],cwd,
      env:{...process.env,TMPDIR:root},directory:join(root,'discovery'),deadline})
    if(!discovered.success)throw new Error('Test discovery failed; see retained discovery logs/receipt')
    await verifyTemporaryRoot(layout)
    const partition=partitionFiles(JSON.parse(await readFile(discovery,'utf8')),cwd,options.scope)
    manifest=partition.files;phases=partition.phases
    await jsonWrite(join(root,'manifest.json'),partition)
    result=await runPhases(phases,async phase=>{
      const directory=join(root,phase.name),temp=join(root,`${phase.name}-tmp`),runId=randomUUID()
      await verifyTemporaryRoot(layout)
      await mkdir(temp,{mode:0o700})
      const phaseLayout={ancestors:await directoryPins(temp)}
      await verifyTemporaryRoot(layout);await verifyTemporaryRoot(phaseLayout)
      const rawPath=join(directory,'raw.json'),argv=[process.execPath,vitest,'run',...phase.files,'--allowOnly=false',
        '--reporter=default','--reporter=json',`--reporter=${reporter}`,`--outputFile.json=${rawPath}`,
        ...(phase.heavy?['--pool=forks','--isolate','--maxWorkers=1','--bail=1']:[])]
      console.log(`Starting ${phase.name}: ${phase.files.length} complete files${phase.heavy?' (one worker)':''}`)
      const receipt=await supervise({argv,cwd,env:{...process.env,...phase.heavy?{VITEST_MAX_WORKERS:'1'}:{},TMPDIR:temp,ZDOC_TEST_RUN_ID:runId,ZDOC_TEST_EVENTS:join(directory,'events.jsonl')},
        directory,deadline,protocol:{runId,expected:phase.files,root:cwd,heavy:phase.heavy}})
      let raw=null,error=null
      try {await verifyTemporaryRoot(layout);await verifyTemporaryRoot(phaseLayout);raw=JSON.parse(await readFile(rawPath,'utf8'));validateRawReport(raw,phase.files,cwd)}catch(e){error=e.message}
      const completed={name:phase.name,files:phase.files,success:receipt.success&&!error,receipt,raw,error}
      await jsonWrite(join(directory,'validated.json'),{success:completed.success,error,rawPath,temporaryIdentity:phaseLayout})
      console.log(`${phase.name}: ${completed.success?'PASS':'FAIL'}; evidence ${directory}`)
      return completed
    })
  } catch(e){failure=e.message}
  const after=sourceIdentity(cwd)
  if(JSON.stringify(before)!==JSON.stringify(after))failure??='Source identity changed during grouped gate'
  const success=!failure&&result.success&&result.completed.length===3
  const reports=summarizeReports(result.completed)
  const aggregate={success,startTime:started,endTime:Date.now(),evidenceRoot:root,scope:options.scope,before,after,failure,
    discoveredFiles:manifest,phases:result.completed.map(p=>({name:p.name,success:p.success,exitCode:p.receipt.exitCode,settled:p.receipt.settled,error:p.error,reason:p.receipt.reason})),
    unrunFiles:result.unrun,unaccountedFiles:manifest.filter(file=>!reports.testResults.some(f=>f.name===file)),...reports,
    qualification:success?'Complete discovered selection passed and every owned group settled':'Failed/incomplete; unrun files and cancelled tests are not ordinary platform skips'}
  await jsonWrite(join(root,'aggregate.json'),aggregate)
  if(options.output){await mkdir(dirname(options.output),{recursive:true});await jsonWrite(options.output,aggregate)}
  console.log(`${success?'PASS':'FAIL'} grouped ${options.scope}: ${aggregate.numPassedTests} passed, ${aggregate.numFailedTests} failed, ${aggregate.numPendingTests} skipped; ${root}`)
  return aggregate
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try{const result=await runGate(parseOptions(process.argv.slice(2)));process.exitCode=result.success?0:1}
  catch(e){console.error(e.stack??e);process.exitCode=1}
}
