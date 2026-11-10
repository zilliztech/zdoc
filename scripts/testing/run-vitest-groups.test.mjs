import test from 'node:test'
import {runInNewContext} from 'node:vm'
import {EventEmitter} from 'node:events'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {mkdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs'
import {mkdtemp,mkdir,rename,symlink,readFile,writeFile,stat,realpath,link} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {spawn,execFileSync} from 'node:child_process'
import {createRequire} from 'node:module'
import {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {HEAVY_FILES,REFERENCE_FILE,parseOptions,partitionFiles,inspectEvents,validateRawReport,supervise,runPhases,summarizeReports,tempParentPath,createTemporaryRoot,verifyTemporaryRoot,resolveProtectedInputs,withGateDeadline,prepareGateReports,settleGateVerdict,readGateReport,observedPlatformSkips,comparePlatformSkips,readPlatformSkipDeclaration} from './run-vitest-groups.mjs'
import StopReporter from './vitest-stop-reporter.mjs'

const expectedIsolatedFiles=['packages/docs-tooling/src/shared-docs/testing/updates/transactions.test.ts',
  'packages/docs-tooling/src/shared-docs/testing/updates/local-runner.test.ts',
  'packages/docs-tooling/src/shared-docs/testing/updates/update-prepare.test.ts']
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))
const fixture=async()=>mkdtemp(join(await realpath(tmpdir()),'vitest-supervisor-contract-'))
function protocol(root,changes={}) {return {runId:'fixture-run',root,expected:[join(root,'a.test.ts')],heavy:true,...changes}}
function events(p,extra={}) {
  return [{version:1,runId:p.runId,sequence:0,kind:'init',pid:process.pid},
    {version:1,runId:p.runId,sequence:1,kind:'start',files:p.expected,configuration:[{pool:'forks',maxWorkers:1,isolate:true}]},
    {version:1,runId:p.runId,sequence:2,kind:'terminal',reason:'passed',errors:[],files:p.expected.map(file=>({file,state:'passed'})),...extra}]
}
const encode=values=>values.map(v=>JSON.stringify(v)+'\n').join('')
function childCode(directory,text,tail='') {
  return `require('node:fs').writeFileSync(${JSON.stringify(join(directory,'events.jsonl'))},${JSON.stringify(text)});${tail}`
}
async function invoke(root,{text,code,deadline=Date.now()+3000,...rest}={}) {
  const directory=join(root,'run'),p=protocol(root)
  return supervise({argv:[process.execPath,'-e',code??childCode(directory,text??encode(events(p)))],cwd:root,
    env:process.env,directory,deadline,protocol:p,graceMs:300,...rest})
}

test('gate options preserve report requests and reject every narrowing/unsupported control',()=>{
  assert.deepEqual(parseOptions(['--scope=shared-docs','--reporter','json']).reporters,['json'])
  assert.equal(parseOptions(['--scope','all','--outputFile.json=./result.json']).scope,'all')
  for(const option of ['--testNamePattern=x','--exclude=x','--changed=HEAD','--shard=1/2','--retry=2','--maxWorkers=1','--testTimeout=90000','--reporter=custom','--scope=other'])
    assert.throws(()=>parseOptions(['--scope=all',option]))
  assert.throws(()=>parseOptions(['--scope=all','--scope=all']))
})
test('temporary parent policy is explicit and rejects aliases/metadata/unsupported platforms',()=>{
  assert.equal(tempParentPath('darwin','/Users/example'),'/Users/example/.cache/zdoc-vitest')
  assert.equal(tempParentPath('linux','/home/example'),'/home/example/.cache/zdoc-vitest')
  assert.equal(tempParentPath('linux','/home/example','/owned/fixtures'),'/owned/fixtures')
  for(const value of ['relative','/owned/../alias','/owned/.git/output'])assert.throws(()=>tempParentPath('linux','/home/example',value))
  assert.throws(()=>tempParentPath('win32','/home/example'))
  assert.throws(()=>tempParentPath('linux',''))
  assert.throws(()=>tempParentPath('linux','relative','/owned/fixtures'))
})
test('actual temporary roots are fresh and private, preserve parent artifacts, and reject unsafe creation',async()=>{
  const root=await fixture(),cwd=join(root,'checkout'),parent=join(root,'owned')
  await mkdir(cwd);await mkdir(parent,{mode:0o700});await writeFile(join(parent,'sentinel'),'preserved')
  await assert.rejects(createTemporaryRoot(cwd,{home:join(root,'missing-home'),override:parent}),{code:'ENOENT'})
  await assert.rejects(stat(join(root,'missing-home')),{code:'ENOENT'})
  const a=await createTemporaryRoot(cwd,{override:parent}),b=await createTemporaryRoot(cwd,{override:parent})
  assert.notEqual(a.root,b.root);assert.equal((await stat(a.root)).mode&0o777,0o700)
  assert.equal(await readFile(join(parent,'sentinel'),'utf8'),'preserved')
  const unsafe=join(root,'unsafe');await mkdir(unsafe,{mode:0o755})
  await assert.rejects(createTemporaryRoot(cwd,{override:unsafe}),/owned0700/)
  assert.notEqual((await stat(unsafe)).mode&0o777,0o700)
  const alias=join(root,'alias');await symlink(cwd,alias)
  await assert.rejects(createTemporaryRoot(cwd,{override:join(alias,'must-not-create')}),/alias/)
  await assert.rejects(stat(join(cwd,'must-not-create')),{code:'ENOENT'})
  await assert.rejects(createTemporaryRoot(cwd,{override:alias}),/alias/)
  await assert.rejects(createTemporaryRoot(cwd,{override:join(cwd,'must-not-create')}),/overlaps/)
  await assert.rejects(stat(join(cwd,'must-not-create')),{code:'ENOENT'})
  await assert.rejects(createTemporaryRoot(cwd,{override:root}),/overlaps/)
  const file=join(root,'file');await writeFile(file,'preserved')
  await assert.rejects(createTemporaryRoot(cwd,{override:file}),/non-directory/)
  await verifyTemporaryRoot(a);await verifyTemporaryRoot(b)
  await rename(a.root,a.root+'-retained');await mkdir(a.root,{mode:0o700})
  await assert.rejects(verifyTemporaryRoot(a),/identity changed/)
  await verifyTemporaryRoot(b)
  await rename(parent,parent+'-retained');await mkdir(parent,{mode:0o700})
  await assert.rejects(verifyTemporaryRoot(b))
  assert.equal(await readFile(join(parent+'-retained','sentinel'),'utf8'),'preserved')
})
test('real external Git metadata, alternate object stores and output ancestors cannot be temporary parents',async()=>{
  const root=await fixture(),cwd=join(root,'checkout'),gitdir=join(root,'metadata'),objects=join(root,'alternate-objects')
  execFileSync('git',['init','--quiet','--separate-git-dir',gitdir,cwd])
  await mkdir(objects,{mode:0o700});await writeFile(join(gitdir,'objects/info/alternates'),objects+'\n')
  const output=join(root,'reports','result.json'),protectedPaths=await resolveProtectedInputs(cwd,output)
  for(const path of [cwd,gitdir,join(gitdir,'objects'),objects,output])assert.ok(protectedPaths.includes(path),path)
  for(const parent of [gitdir,join(gitdir,'new'),objects,join(objects,'new'),join(root,'reports')]) {
    await assert.rejects(createTemporaryRoot(cwd,{override:parent,protectedPaths}),/overlaps/)
  }
  await assert.rejects(stat(join(root,'reports')),{code:'ENOENT'})
  await assert.rejects(stat(join(objects,'new')),{code:'ENOENT'})
  const safe=await createTemporaryRoot(cwd,{override:join(root,'safe'),protectedPaths})
  await verifyTemporaryRoot(safe)
})
test('file partition is disjoint/exhaustive and automatically includes new light files',()=>{
  const root='/repo',files=[...expectedIsolatedFiles,'packages/docs-tooling/src/shared-docs/new.test.ts'].map(p=>({file:join(root,p)}))
  const result=partitionFiles(files,root,'shared-docs')
  assert.deepEqual(HEAVY_FILES,expectedIsolatedFiles)
  assert.deepEqual(result.phases.map(p=>[p.name,p.files.length]),[['light',1],['transactions',1],['local-runner',1],['update-prepare',1]])
  assert.deepEqual(result.phases.at(-1).files,[join(root,expectedIsolatedFiles[2])])
  assert.equal(result.phases[0].files.includes(join(root,expectedIsolatedFiles[2])),false)
  assert.deepEqual(result.phases.flatMap(p=>p.files).sort(),files.map(x=>x.file).sort())
  assert.throws(()=>partitionFiles([...files,files[0]],root,'shared-docs'),/Duplicate/)
  for(const required of expectedIsolatedFiles)assert.throws(()=>partitionFiles(files.filter(p=>p.file!==join(root,required)),root,'shared-docs'),/Missing heavy/)
  assert.throws(()=>partitionFiles([...files,{file:'/other/x.test.ts'}],root,'all'),/Invalid/)
  assert.throws(()=>partitionFiles([...files,{file:'/repo/ui.test.ts'}],root,'shared-docs'),/Out-of-scope/)
  assert.throws(()=>partitionFiles(files.map(x=>({...x,projectName:'extra'})),root,'all'),/project/)
})
test('all scope isolates the complete reference file; shared-docs never admits or requires it',()=>{
  const root='/repo',shared=[...expectedIsolatedFiles,'packages/docs-tooling/src/shared-docs/new.test.ts'].map(p=>({file:join(root,p)}))
  const reference={file:join(root,REFERENCE_FILE)},ui={file:join(root,'src/new.test.ts')}
  const all=[...shared,reference,ui],partition=partitionFiles(all,root,'all')
  assert.deepEqual(partition.phases.map(p=>[p.name,p.files.length,p.heavy]),[
    ['light',2,false],['reference-integration',1,true],['transactions',1,true],['local-runner',1,true],['update-prepare',1,true]])
  assert.deepEqual(partition.phases[1].files,[reference.file])
  assert.deepEqual(partition.phases.flatMap(p=>p.files).sort(),all.map(p=>p.file).sort())
  assert.deepEqual(partitionFiles(shared,root,'shared-docs').phases.map(p=>p.name),['light','transactions','local-runner','update-prepare'])
  assert.throws(()=>partitionFiles(shared,root,'all'),/Missing heavy/)
  for(const required of expectedIsolatedFiles)assert.throws(()=>partitionFiles(all.filter(p=>p.file!==join(root,required)),root,'all'),/Missing heavy/)
  assert.throws(()=>partitionFiles([...shared,reference],root,'shared-docs'),/Out-of-scope/)
  assert.throws(()=>partitionFiles([...all,reference],root,'all'),/Duplicate/)
  assert.throws(()=>partitionFiles(all,root,'invented'),/Unknown gate scope/)
})
test('every scope stops at its first failing phase and reports all later complete files unrun',async()=>{
  const root='/repo'
  for(const scope of ['all','shared-docs']) {
    const files=[...expectedIsolatedFiles,'packages/docs-tooling/src/shared-docs/new.test.ts',...scope==='all'?[REFERENCE_FILE]:[]]
    const {phases}=partitionFiles(files.map(p=>({file:join(root,p)})),root,scope)
    for(let fail=0;fail<phases.length;fail++) {
      const started=[],result=await runPhases(phases,async phase=>{started.push(phase.name);return {...phase,success:started.length!==fail+1}})
      assert.equal(result.success,false)
      assert.deepEqual(started,phases.slice(0,fail+1).map(p=>p.name))
      assert.deepEqual(result.unrun,phases.slice(fail+1).flatMap(p=>p.files))
    }
  }
})
test('platform skips must stay within the committed declaration',async()=>{
  const observed=observedPlatformSkips([{testResults:[{name:'/repo/a.test.ts',assertionResults:[{status:'passed'},{status:'skipped'},{status:'pending'}]}]}],'/repo')
  assert.deepEqual(observed,{'a.test.ts':2})
  assert.deepEqual(comparePlatformSkips(observed,{'a.test.ts':2}),[])
  assert.deepEqual(comparePlatformSkips(observed,{'a.test.ts':3}),[])
  assert.match(comparePlatformSkips(observed,{'a.test.ts':1})[0],/observed 2 skipped test\(s\) in a.test.ts exceeds the declared maximum 1/)
  assert.match(comparePlatformSkips(observed,{})[0],/undeclared 2 skipped test\(s\) in a.test.ts/)
  assert.deepEqual(comparePlatformSkips({},{'a.test.ts':2}),[])
  const root=await mkdtemp(join(await realpath(tmpdir()),'vitest-skip-declaration-'))
  try {
    mkdirSync(join(root,'scripts/testing'),{recursive:true})
    writeFileSync(join(root,'scripts/testing/expected-platform-skips.json'),JSON.stringify({version:1,platforms:{linux:{'a.test.ts':2},darwin:{}}}))
    assert.deepEqual(readPlatformSkipDeclaration(root,'linux'),{'a.test.ts':2})
    assert.deepEqual(readPlatformSkipDeclaration(root,'darwin'),{})
    assert.throws(()=>readPlatformSkipDeclaration(root,'win32'),/Missing platform skip declaration/)
    writeFileSync(join(root,'scripts/testing/expected-platform-skips.json'),JSON.stringify({version:2,platforms:{linux:{}}}))
    assert.throws(()=>readPlatformSkipDeclaration(root,'linux'),/Invalid platform skip declaration/)
  } finally {rmSync(root,{recursive:true,force:true})}
})
test('terminal protocol requires correlation, exact files, sequence and bounded worker policy',()=>{
  const p=protocol('/repo'),valid=events(p)
  assert.equal(inspectEvents(encode(valid),{...p,final:true}).terminal.reason,'passed')
  for(const mutate of [a=>a[0].runId='foreign',a=>a[1].sequence=7,a=>a[1].files.push('/repo/extra.test.ts'),
    a=>a[2].files=[],a=>a[1].configuration[0].maxWorkers=9,a=>a.push({...a[2],sequence:3})]) {
    const changed=structuredClone(valid);mutate(changed)
    assert.throws(()=>inspectEvents(encode(changed),{...p,final:true}))
  }
  assert.throws(()=>inspectEvents('not-json\n',{...p,final:true}))
  assert.throws(()=>inspectEvents(encode(valid.slice(0,2)),{...p,final:true}),/terminal/)
  assert.throws(()=>inspectEvents(encode(valid).trimEnd(),{...p,final:true}),/Incomplete/)
  assert.ok(inspectEvents(encode(events(p,{reason:'failed',errors:[{message:'unhandled'}]})),{...p,final:true}).failure)
})
test('raw report cannot pass with missing/extra/duplicate files or inconsistent counts',()=>{
  const root='/repo',expected=['/repo/a.test.ts'],raw={success:true,numTotalTests:2,numPassedTests:1,numFailedTests:0,
    testResults:[{name:expected[0],status:'passed',assertionResults:[{status:'passed'},{status:'skipped'}]}]}
  validateRawReport(raw,expected,root)
  for(const changed of [{...raw,success:false},{...raw,numTotalTests:3},{...raw,numPassedTests:2},
    {...raw,testResults:[]},{...raw,testResults:[...raw.testResults,...raw.testResults]},
    {...raw,testResults:[{...raw.testResults[0],name:'/repo/extra.test.ts'}]}])assert.throws(()=>validateRawReport(changed,expected,root))
})
test('failed-phase pending cases are unqualified, never normal skips, and malformed raw reports stay failed',()=>{
  const raw={numTotalTestSuites:2,numPassedTestSuites:2,numFailedTestSuites:0,numPendingTestSuites:0,
    snapshot:{matched:3,didUpdate:false,filesRemovedList:[]},testResults:[{assertionResults:[{status:'passed'},{status:'skipped'}]}]}
  const result=summarizeReports([{success:true,raw},{success:false,raw},{success:false,raw:{testResults:{}}}])
  assert.equal(result.numPendingTests,1);assert.equal(result.unqualifiedSkippedTests,1);assert.equal(result.numPassedTests,2)
  assert.equal(result.numTotalTestSuites,4);assert.equal(result.snapshot.matched,6);assert.equal(result.snapshot.didUpdate,false)
  const aborted=summarizeReports([{name:'light',success:false,raw:null,receipt:{observed:{failure:{name:'actual failure',errors:[{message:'retained'}]}}}}])
  assert.equal(aborted.rawCountsComplete,false);assert.equal(aborted.observedFailures[0].event.name,'actual failure')
  assert.equal(aborted.numPendingTests,0)
})
test('real reporter writes its protocol and retains errors before terminal',async()=>{
  const root=await fixture(),path=join(root,'events.jsonl'),p=protocol(root)
  const old={id:process.env.ZDOC_TEST_RUN_ID,path:process.env.ZDOC_TEST_EVENTS}
  process.env.ZDOC_TEST_RUN_ID=p.runId;process.env.ZDOC_TEST_EVENTS=path
  try {
    const reporter=new StopReporter()
    reporter.onInit({config:{maxWorkers:1},projects:[{config:{pool:'forks',maxWorkers:1,isolate:true}}]})
    reporter.onTestRunStart(p.expected.map(moduleId=>({moduleId})))
    reporter.onTestCaseResult({module:{moduleId:p.expected[0]},fullName:'failure',result:()=>({state:'failed',errors:[{message:'retained',stack:'raw stack'}]})})
    const before=await readFile(path,'utf8');assert.match(before,/raw stack/)
    reporter.onTestRunEnd(p.expected.map(moduleId=>({moduleId,state:()=> 'failed'})),[],'failed')
    assert.equal(inspectEvents(await readFile(path,'utf8'),{...p,final:true}).failure.name,'failure')
  } finally {
    for(const [key,value] of [['ZDOC_TEST_RUN_ID',old.id],['ZDOC_TEST_EVENTS',old.path]])if(value===undefined)delete process.env[key];else process.env[key]=value
  }
})
// Run the current private function bodies with synthetic dependencies, without
// exporting a production injection seam or sending any real process signal.
const supervisorSource=readFileSync(new URL('./run-vitest-groups.mjs',import.meta.url),'utf8')
const cleanupStart=supervisorSource.indexOf('function cleanupError(')
const cleanupEnd=supervisorSource.indexOf('\nexport function validateRawReport(',cleanupStart)
assert.ok(cleanupStart>=0&&cleanupEnd>cleanupStart)
const cleanupSource=supervisorSource.slice(cleanupStart,cleanupEnd)
function syntheticCleanup({operation=()=>null,early=false,wallStep=null}={}) {
  let mono=0,wall=100000,timerCount=0
  const operations=[],sent=[],errors=[],files=new Map(),child=new EventEmitter(),process=new EventEmitter()
  child.pid=12345;process.platform='darwin'
  process.kill=(pid,signal)=>{
    assert.equal(pid,-child.pid)
    const event={pid,signal,at:mono};operations.push(event)
    const code=operation(signal,sent,mono,operations)
    if(code){event.error=code;throw Object.assign(new Error(`injected ${code}`),{code})}
    if(signal!==0){sent.push(event);child.emit('exit',null,signal)}
  }
  const bindings={process,performance:{now:()=>mono},Date:{now:()=>wall},join,
    pause:async ms=>{
      assert.ok(++timerCount<=200,'cleanup must remain bounded with early timers and moving wall time')
      assert.ok(ms>0&&ms<=25)
      const elapsed=early?Math.max(0.25,ms/2):ms
      mono+=elapsed;wall+=wallStep??elapsed
    },mkdir:async()=>{},open:async()=>({fd:1,close:async()=>{}}),spawn:()=>child,
    jsonWrite:async(path,value)=>{assert.equal(files.has(path),false);files.set(path,value)},
    stat:async()=>({size:1}),readFile:async()=>'',
    inspectEvents:()=>({failure:{name:'original business failure'}}),console}
  const actual=runInNewContext(cleanupSource.replace('export async function supervise','async function supervise')+
    '\n;({stopGroup,supervise})',bindings,{timeout:1000})
  return {operations,sent,errors,files,get elapsed(){return mono},get wall(){return wall},
    // An already-exited leader resolves immediately in the original implementation.
    stop:()=>actual.stopGroup(child.pid,[],1000,errors,async()=>{}),
    supervise:()=>actual.supervise({argv:['synthetic'],cwd:'/synthetic',env:{},directory:'/synthetic/run',
      deadline:wall+10000,protocol:{},graceMs:1000})}
}
function noOperationsAfterDenial(fixture) {
  const denied=fixture.operations.filter(o=>o.error==='EPERM')
  assert.equal(denied.length,1)
  assert.equal(fixture.operations.at(-1),denied[0])
}
function fullGraceBeforeProbes(fixture) {
  let sentAt=null
  for(const operation of fixture.operations) {
    if(operation.signal!==0&&!operation.error)sentAt=operation.at
    if(operation.signal===0&&sentAt!==null)assert.ok(operation.at-sentAt>=1000)
  }
}
test('monotonic cleanup waits full grace after immediate leader exit before its first probe',async()=>{
  const fixture=syntheticCleanup({operation:(signal,sent,at)=>signal===0&&sent.length?(at<1000?'EPERM':'ESRCH'):null})
  assert.equal(await fixture.stop(),true)
  assert.deepEqual(fixture.errors,[])
  assert.deepEqual(fixture.operations.map(o=>[o.signal,o.at]),[[0,0],['SIGTERM',0],[0,1000]])
})
for(const wallStep of [-5000,5000])test(`monotonic cleanup rechecks early timers despite wall movement ${wallStep}`,async()=>{
  const fixture=syntheticCleanup({early:true,wallStep,operation:(signal,sent,at)=>signal===0&&sent.length?(at<1000?'EPERM':'ESRCH'):null})
  assert.equal(await fixture.stop(),true)
  assert.equal(fixture.errors.length,0);fullGraceBeforeProbes(fixture)
  assert.ok(fixture.elapsed>=1000&&fixture.elapsed<1001)
  assert.ok(wallStep<0?fixture.wall<0:fixture.wall>200000)
})
for(const [stage,denied] of [
  ['initial probe',(signal,sent)=>signal===0&&!sent.length],
  ['TERM',(signal)=>signal==='SIGTERM'],
  ['post-TERM probe',(signal,sent)=>signal===0&&sent.length===1],
  ['KILL',(signal)=>signal==='SIGKILL'],
  ['post-KILL probe',(signal,sent)=>signal===0&&sent.length===2],
])for(const code of ['EPERM','ESRCH'])test(`monotonic cleanup ${stage} ${code} preserves stop semantics`,async()=>{
  const fixture=syntheticCleanup({operation:(signal,sent)=>denied(signal,sent)?code:null})
  assert.equal(await fixture.stop(),code==='ESRCH')
  assert.equal(fixture.errors.length,code==='ESRCH'?0:1)
  assert.equal(fixture.operations.at(-1).error,code)
  if(code==='EPERM'){noOperationsAfterDenial(fixture);assert.equal(fixture.errors[0].code,'EPERM')}
  fullGraceBeforeProbes(fixture);assert.ok(fixture.elapsed<=2000)
})
for(const survivesKill of [false,true])test(`monotonic cleanup bounds both signal rounds, survives KILL ${survivesKill}`,async()=>{
  const fixture=syntheticCleanup({operation:(signal,sent)=>!survivesKill&&signal===0&&sent.length===2?'ESRCH':null})
  assert.equal(await fixture.stop(),!survivesKill);assert.equal(fixture.errors.length,0)
  assert.deepEqual(fixture.operations.map(o=>[o.signal,o.at]),[[0,0],['SIGTERM',0],[0,1000],['SIGKILL',1000],[0,2000]])
  assert.equal(fixture.elapsed,2000)
})
test('monotonic cleanup post-grace denial retains actual supervisor primary failure and stops all operations',async()=>{
  const fixture=syntheticCleanup({operation:(signal,sent)=>signal===0&&sent.length?'EPERM':null})
  const receipt=await fixture.supervise()
  assert.equal(receipt.reason,'Reported test/module failure')
  assert.equal(receipt.observed.failure.name,'original business failure')
  assert.equal(receipt.settled,false);assert.equal(receipt.success,false);assert.equal(receipt.cleanupStatus,'unknown')
  assert.equal(receipt.receiptPersistence,'confirmed');assert.equal(receipt.cleanupErrors.length,1)
  assert.equal(receipt.cleanupErrors[0].code,'EPERM')
  assert.equal(fixture.files.get('/synthetic/run/receipt.json').observed.failure.name,'original business failure')
  noOperationsAfterDenial(fixture);fullGraceBeforeProbes(fixture)
  assert.deepEqual(fixture.operations.map(o=>[o.signal,o.at]),[[0,0],['SIGTERM',0],[0,1000]])
})

test('real child success requires terminal, zero exit and a settled group',async()=>{
  const root=await fixture(),result=await invoke(root)
  assert.equal(result.success,true);assert.equal(result.exitCode,0);assert.equal(result.settled,true)
  assert.deepEqual(result.signals,[])
})
test('zero exit without terminal and abnormal exit both fail with retained raw logs',async()=>{
  const missing=await fixture(),a=await invoke(missing,{code:'console.error("retained crash context")'})
  assert.equal(a.success,false);assert.match(a.reason,/protocol/)
  assert.match(await readFile(join(missing,'run/stderr'),'utf8'),/retained crash context/)
  const crashed=await fixture(),b=await invoke(crashed,{code:childCode(join(crashed,'run'),encode(events(protocol(crashed))),'process.exit(7)')})
  assert.equal(b.success,false);assert.equal(b.exitCode,7);assert.equal(b.settled,true)
})
test('malformed and foreign reporter events fail closed and stop the owned process',async()=>{
  for(const text of ['{invalid}\n',encode(events(protocol('/foreign')))]) {
    const root=await fixture(),r=await invoke(root,{code:childCode(join(root,'run'),text,'setInterval(()=>{},1000)')})
    assert.equal(r.success,false);assert.equal(r.settled,true);assert.ok(r.signals.length)
    assert.ok(await stat(join(root,'run/failure.json')))
  }
})
test('reported failure retains evidence before stopping and never starts a following phase',async()=>{
  const root=await fixture(),p=protocol(root),entries=events(p).slice(0,2)
  entries.push({version:1,runId:p.runId,sequence:2,kind:'failure',name:'test timed out',errors:[{message:'deadline evidence'}]})
  let later=false
  const result=await runPhases([{name:'first',files:p.expected},{name:'later',files:[join(root,'later.test.ts')]}],async phase=>{
    if(phase.name==='later'){later=true;return {success:true}}
    return invoke(root,{code:childCode(join(root,'run'),encode(entries),'setInterval(()=>{},1000)')})
  })
  assert.equal(result.success,false);assert.equal(later,false);assert.deepEqual(result.unrun,[join(root,'later.test.ts')])
  assert.match(await readFile(join(root,'run/events.jsonl'),'utf8'),/deadline evidence/)
  const receipt=result.completed[0],failure=JSON.parse(await readFile(join(root,'run/failure.json'),'utf8'))
  assert.ok(failure.at<=receipt.signals[0].at);assert.equal(receipt.settled,true)
})
test('outer timeout stops child and grandchild delayed effects while unrelated sentinel survives',async()=>{
  const root=await fixture(),marker=join(root,'late'),pidFile=join(root,'grandchild.pid')
  const sentinel=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore'})
  try {
    const grandchild=`require('node:fs').writeFileSync(${JSON.stringify(pidFile)},String(process.pid));setTimeout(()=>require('node:fs').writeFileSync(${JSON.stringify(marker)},'bad'),1600);setInterval(()=>{},1000)`
    const code=`require('node:child_process').spawn(process.execPath,['-e',${JSON.stringify(grandchild)}],{stdio:'ignore'});setInterval(()=>{},1000)`
    const result=await invoke(root,{code,protocol:null,deadline:Date.now()+650})
    assert.equal(result.success,false);assert.match(result.reason,/deadline/);assert.equal(result.settled,true)
    assert.ok(await readFile(pidFile,'utf8'));assert.doesNotThrow(()=>process.kill(sentinel.pid,0))
    await sleep(1100);await assert.rejects(stat(marker),{code:'ENOENT'})
  } finally {sentinel.kill();await new Promise(resolve=>sentinel.once('exit',resolve))}
})
test('surviving descendant after already-observed leader exit is an infrastructure failure',async()=>{
  const root=await fixture(),code=`require('node:child_process').spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore'}).unref()`
  const result=await invoke(root,{code,protocol:null})
  assert.equal(result.exitCode,0);assert.equal(result.success,false);assert.match(result.reason,/survived/);assert.equal(result.settled,true)
})
test('an owned child that ignores TERM receives bounded KILL escalation',async()=>{
  const root=await fixture(),p=protocol(root),entries=events(p).slice(0,2)
  entries.push({version:1,runId:p.runId,sequence:2,kind:'failure',name:'stop resistant fixture'})
  const code=`process.on('SIGTERM',()=>{});${childCode(join(root,'run'),encode(entries),'setInterval(()=>{},1000)')}`
  const result=await invoke(root,{code,graceMs:100})
  assert.equal(result.success,false);assert.equal(result.settled,true)
  assert.deepEqual(result.signals.map(s=>s.signal),['SIGTERM','SIGKILL'])
  const delay=result.signals[1].at-result.signals[0].at
  assert.ok(delay>=100&&delay<190,`one fixed100ms grace, observed ${delay}ms`)
})
test('controller exception prevents subsequent phases and is not an ordinary skip',async()=>{
  let calls=0
  const r=await runPhases([{name:'a',files:['a']},{name:'b',files:['b']}],async()=>{calls++;throw new Error('controller failed')})
  assert.equal(calls,1);assert.equal(r.success,false);assert.deepEqual(r.unrun,['b']);assert.equal(r.completed[0].receipt.settled,false)
})
test('an expired child deadline rejects before spawning or creating its output directory',async()=>{
  const root=await fixture(),marker=join(root,'unexpected-child')
  await assert.rejects(invoke(root,{deadline:Date.now()-1,code:`require('node:fs').writeFileSync(${JSON.stringify(marker)},'bad')`}),/before spawn/)
  await assert.rejects(stat(marker),{code:'ENOENT'});await assert.rejects(stat(join(root,'run')),{code:'ENOENT'})
})
for(const stage of ['preflight','between phases','finalization'])test(`whole-run deadline covers stalled ${stage} and forbids a late continuation`,async()=>{
  const root=await fixture(),marker=join(root,'late-continuation'),started=join(root,'first-phase')
  const module=fileURLToPath(new URL('./run-vitest-groups.mjs',import.meta.url))
  const code=`import {withGateDeadline} from ${JSON.stringify(module)};
    import {writeFile} from 'node:fs/promises';
    const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    await withGateDeadline(async budget=>{
      ${stage==='preflight'?'':`await budget.step('first phase',()=>writeFile(${JSON.stringify(started)},'complete'));`}
      await budget.step(${JSON.stringify(stage)},async()=>{
        await pause(180);budget.check();await writeFile(${JSON.stringify(marker)},'bad');
      });
      await budget.step('next phase or success',()=>writeFile(${JSON.stringify(marker)},'bad'));
      return {success:true};
    },{milliseconds:60,evidenceRoot:${JSON.stringify(root)}});`
  const child=spawn(process.execPath,['--input-type=module','-e',code],{stdio:['ignore','ignore','pipe']})
  let stderr='';child.stderr.on('data',chunk=>stderr+=chunk)
  const codeResult=await new Promise(resolve=>child.once('exit',resolve))
  assert.equal(codeResult,1);assert.match(stderr,/outer deadline exhausted/)
  const failure=JSON.parse(await readFile(join(root,'gate-failure.json'),'utf8'))
  assert.equal(failure.success,false);assert.equal(failure.stage,stage);assert.equal(failure.rawCountsComplete,false)
  const stopped=JSON.parse(await readFile(join(root,'gate-stop.json'),'utf8'));assert.deepEqual(stopped.stopped,[])
  if(stage!=='preflight')assert.equal(await readFile(started,'utf8'),'complete')
  await assert.rejects(stat(marker),{code:'ENOENT'})
})
test('whole-run watchdog records failure then settles its registered active child',async()=>{
  const root=await fixture(),marker=join(root,'late-child'),pidFile=join(root,'child.pid'),insurance=join(root,'self-exit-insurance')
  const module=fileURLToPath(new URL('./run-vitest-groups.mjs',import.meta.url))
  const childCode=`require('node:fs').writeFileSync(${JSON.stringify(pidFile)},String(process.pid));setTimeout(()=>require('node:fs').writeFileSync(${JSON.stringify(marker)},'bad'),1000);setTimeout(()=>{require('node:fs').writeFileSync(${JSON.stringify(insurance)},'cleanup failed');process.exit(0)},2000)`
  const code=`import {withGateDeadline,supervise} from ${JSON.stringify(module)};import {readFile,writeFile} from 'node:fs/promises';
    let pending,error;
    try{await withGateDeadline(async budget=>{
      pending=supervise({argv:[process.execPath,'-e',${JSON.stringify(childCode)}],cwd:${JSON.stringify(root)},env:process.env,
        directory:${JSON.stringify(join(root,'child'))},deadline:Date.now()+5000,budget,graceMs:100});
      await budget.step('child ready',async()=>{while(true){try{await readFile(${JSON.stringify(pidFile)});break}catch(e){if(e.code!=='ENOENT')throw e}await new Promise(r=>setTimeout(r,10));budget.check()}});
      await budget.step('active child',()=>pending);
    },{milliseconds:500,evidenceRoot:${JSON.stringify(root)}})}catch(e){error=e.message}
    const receipt=await pending;await writeFile(${JSON.stringify(join(root,'driver.json'))},JSON.stringify({error,receipt}));process.exitCode=1;`
  const child=spawn(process.execPath,['--input-type=module','-e',code],{stdio:'ignore'})
  assert.equal(await new Promise(resolve=>child.once('exit',resolve)),1)
  const failure=JSON.parse(await readFile(join(root,'gate-failure.json'),'utf8'))
  const stopped=JSON.parse(await readFile(join(root,'gate-stop.json'),'utf8'))
  const driver=JSON.parse(await readFile(join(root,'driver.json'),'utf8')),pid=Number(await readFile(pidFile,'utf8'))
  assert.deepEqual(failure.owners.map(o=>o.pid),[pid]);assert.equal(stopped.stopped[0].pid,pid)
  assert.equal(stopped.stopped[0].settled,true);assert.deepEqual(stopped.stopped[0].cleanupErrors,[])
  assert.deepEqual(stopped.stopped[0].signals.map(s=>s.signal),['SIGTERM'])
  assert.equal(driver.receipt.settled,true);assert.equal(driver.receipt.signal,'SIGTERM')
  await sleep(650);await assert.rejects(stat(marker),{code:'ENOENT'});await assert.rejects(stat(insurance),{code:'ENOENT'})
  assert.throws(()=>process.kill(-pid,0),{code:'ESRCH'})
})

function denyOwnedOperation(directory,deniedSignal) {
  const original=process.kill,operations=[];let injected=false
  process.kill=function(pid,signal) {
    let owner
    try{owner=JSON.parse(readFileSync(join(directory,'owner.json'),'utf8'))}catch{}
    if(owner&&pid===-owner.processGroup) {
      operations.push({signal,injected:false})
      if(!injected&&signal===deniedSignal) {
        injected=true;operations.at(-1).injected=true
        const error=new Error('contract kill EPERM');error.code='EPERM';throw error
      }
    }
    return original.call(process,pid,signal)
  }
  return {operations,restore:()=>{process.kill=original},wasInjected:()=>injected}
}
for(const [name,signal] of [['probe',0],['TERM','SIGTERM'],['KILL','SIGKILL']])test(`cleanup ${name} denial preserves first failure through receipt, phases and aggregate`,async()=>{
  const root=await fixture(),p=protocol(root),entries=events(p).slice(0,2)
  entries.push({version:1,runId:p.runId,sequence:2,kind:'failure',name:'original test failure',errors:[{message:'retain me'}]})
  const module=fileURLToPath(new URL('./run-vitest-groups.mjs',import.meta.url)),resultPath=join(root,'driver.json')
  const childSource=`process.on('SIGTERM',()=>{});${childCode(join(root,'run'),encode(entries),'setTimeout(()=>process.exit(0),500)')}`
  const code=`import {supervise,runPhases,summarizeReports,finishGateCommand} from ${JSON.stringify(module)};
    import {readFileSync} from 'node:fs';import {writeFile} from 'node:fs/promises';import {join} from 'node:path';
    ${denyOwnedOperation.toString()}
    const patch=denyOwnedOperation(${JSON.stringify(join(root,'run'))},${JSON.stringify(signal)});let later=false,result;
    try{result=await runPhases([{name:'first',files:${JSON.stringify(p.expected)}},{name:'later',files:['later']}],async phase=>{
      if(phase.name==='later'){later=true;return {success:true}}
      const receipt=await supervise({argv:[process.execPath,'-e',${JSON.stringify(childSource)}],cwd:${JSON.stringify(root)},env:process.env,
        directory:${JSON.stringify(join(root,'run'))},deadline:Date.now()+3000,protocol:${JSON.stringify(p)},graceMs:30});
      return {name:phase.name,files:phase.files,success:receipt.success,receipt,raw:null}
    })}finally{patch.restore()}
    await writeFile(${JSON.stringify(resultPath)},JSON.stringify({result,later,injected:patch.wasInjected(),operations:patch.operations,aggregate:summarizeReports(result.completed)}));
    finishGateCommand(result);`
  const driver=spawn(process.execPath,['--input-type=module','-e',code],{stdio:'ignore'})
  assert.equal(await new Promise(resolve=>driver.once('exit',resolve)),1)
  const saved=JSON.parse(await readFile(resultPath,'utf8')),result=saved.result
  assert.equal(saved.injected,true);assert.equal(result.success,false);assert.equal(saved.later,false)
  assert.equal(saved.operations.at(-1).injected,true,'no further probing or escalation after denial')
  const receipt=result.completed[0].receipt
  assert.equal(receipt.observed.failure.name,'original test failure');assert.equal(receipt.reason,'Reported test/module failure')
  assert.equal(receipt.settled,false);assert.equal(receipt.cleanupStatus,'unknown');assert.equal(receipt.receiptPersistence,'confirmed')
  assert.equal(receipt.cleanupErrors.length,1);assert.equal(receipt.cleanupErrors[0].signal,signal)
  assert.equal(receipt.cleanupErrors[0].operation,signal===0?'probe':'signal');assert.equal(receipt.cleanupErrors[0].code,'EPERM')
  assert.deepEqual(receipt.signals.map(s=>s.signal),signal==='SIGKILL'?['SIGTERM']:[])
  const persisted=JSON.parse(await readFile(join(root,'run/receipt.json'),'utf8'))
  assert.deepEqual(persisted.observed,receipt.observed);assert.deepEqual(persisted.cleanupErrors,receipt.cleanupErrors)
  const aggregate=summarizeReports(result.completed)
  assert.equal(aggregate.observedFailures[0].event.name,'original test failure');assert.equal(aggregate.rawCountsComplete,false)
  assert.deepEqual(saved.aggregate.observedFailures,aggregate.observedFailures)
  await sleep(550)
  const owner=JSON.parse(await readFile(join(root,'run/owner.json'),'utf8'))
  assert.throws(()=>process.kill(-owner.processGroup,0),{code:'ESRCH'})
})
test('receipt persistence and supervisory errors cannot erase the original observed failure',async()=>{
  const root=await fixture(),p=protocol(root),entries=events(p).slice(0,2)
  entries.push({version:1,runId:p.runId,sequence:2,kind:'failure',name:'first failure remains'})
  const code=`require('node:fs').mkdirSync(${JSON.stringify(join(root,'run/failure.json'))});require('node:fs').mkdirSync(${JSON.stringify(join(root,'run/receipt.json'))});${childCode(join(root,'run'),encode(entries),'setInterval(()=>{},1000)')}`
  let later=false
  const result=await runPhases([{name:'first',files:p.expected},{name:'later',files:['later']}],async phase=>{
    if(phase.name==='later'){later=true;return {success:true}}
    const receipt=await invoke(root,{code});return {name:phase.name,success:receipt.success,receipt,raw:null}
  })
  const receipt=result.completed[0].receipt
  assert.equal(result.success,false);assert.equal(later,false);assert.equal(receipt.receiptPersistence,'unconfirmed')
  assert.equal(receipt.reason,'Reported test/module failure');assert.ok(receipt.supervisorError)
  assert.equal(receipt.settled,true);assert.equal(receipt.persistenceErrors.at(-1).operation,'receipt')
  assert.equal(summarizeReports(result.completed).observedFailures[0].event.name,'first failure remains')
})
test('global deadline retains its cause and records cleanup denial without erasing another owned group',async()=>{
  const root=await fixture(),one=join(root,'denied'),two=join(root,'normal'),patch=denyOwnedOperation(one,0)
  const pending=[]
  try {
    await assert.rejects(withGateDeadline(async budget=>{
      pending.push(supervise({argv:[process.execPath,'-e',"process.on('SIGTERM',()=>{});setTimeout(()=>process.exit(0),600)"],cwd:root,env:process.env,directory:one,deadline:Date.now()+4000,graceMs:30,budget}))
      pending.push(supervise({argv:[process.execPath,'-e','setInterval(()=>{},1000)'],cwd:root,env:process.env,directory:two,deadline:Date.now()+4000,graceMs:100,budget}))
      await budget.step('two owned fixtures',()=>Promise.all(pending))
    },{milliseconds:200,evidenceRoot:root}),/outer deadline exhausted/)
    await Promise.all(pending)
  } finally {patch.restore()}
  const failure=JSON.parse(await readFile(join(root,'gate-failure.json'),'utf8')),stop=JSON.parse(await readFile(join(root,'gate-stop.json'),'utf8'))
  assert.match(failure.failure,/outer deadline exhausted/);assert.equal(patch.wasInjected(),true)
  assert.equal(stop.stopped.length,2)
  // Concurrent supervisors may register in either order; bind results to their owners.
  const owner=JSON.parse(await readFile(join(one,'owner.json'),'utf8'))
  const normalOwner=JSON.parse(await readFile(join(two,'owner.json'),'utf8'))
  const deniedStop=stop.stopped.find(entry=>entry.pid===owner.processGroup)
  const normalStop=stop.stopped.find(entry=>entry.pid===normalOwner.processGroup)
  assert.ok(deniedStop);assert.ok(normalStop)
  assert.equal(deniedStop.settled,false);assert.equal(deniedStop.cleanupErrors[0].code,'EPERM')
  assert.equal(normalStop.settled,true);assert.deepEqual(normalStop.cleanupErrors,[])
  assert.equal(patch.operations.at(-1).injected,true)
  await sleep(650)
  assert.throws(()=>process.kill(-owner.processGroup,0),{code:'ESRCH'})
})

async function terminalFixture(scope='shared-docs') {
  const root=await fixture(),checkout=join(root,'checkout')
  await mkdir(checkout)
  const discovery=[...expectedIsolatedFiles,'packages/docs-tooling/src/shared-docs/ordinary.test.ts',...scope==='all'?[REFERENCE_FILE]:[]].map(p=>({file:join(checkout,p)}))
  await writeFile(join(root,'discovery.json'),JSON.stringify(discovery))
  const phases=[]
  for(const {name,files} of partitionFiles(discovery,checkout,scope).phases) {
    const directory=join(root,name)
    await mkdir(directory)
    const raw={success:true,numTotalTests:1,numPassedTests:1,numFailedTests:0,testResults:[{name:files[0],status:'passed',assertionResults:[{status:'passed'}]}]}
    const receipt={success:true,exitCode:0,settled:true,observed:{start:{files,configuration:[{pool:'forks',maxWorkers:1,isolate:true}]},terminal:{reason:'passed',errors:[],files:files.map(file=>({file,state:'passed'}))}}}
    await writeFile(join(directory,'raw.json'),JSON.stringify(raw));await writeFile(join(directory,'receipt.json'),JSON.stringify(receipt))
    phases.push({name,files,success:true,exitCode:0,settled:true,error:null,reason:null})
  }
  const aggregate={success:true,scope,runId:root,checkout,evidenceRoot:root,phases,discoveredFiles:phases.flatMap(p=>p.files),unrunFiles:[],unaccountedFiles:[],rawCountsComplete:true}
  return {root,aggregate,paths:[join(root,'aggregate.json'),join(root,'requested.json')]}
}
for(const scope of ['all','shared-docs']) {
  test(`${scope} terminal reader derives complete ordered phases from bound discovery and scope`,async()=>{
    const f=await terminalFixture(scope),prepared=await withGateDeadline(b=>prepareGateReports(f.aggregate,f.paths,b),{evidenceRoot:f.root})
    assert.equal((await settleGateVerdict(prepared)).success,true)
    const qualified=await readGateReport(f.paths[0])
    assert.equal(qualified.success,true);assert.equal(qualified.terminal.version,2)
    assert.equal(qualified.terminal.scope,scope)
    assert.deepEqual(qualified.terminal.phases.map(p=>p.name),scope==='all'?['light','reference-integration','transactions','local-runner','update-prepare']:['light','transactions','local-runner','update-prepare'])
    await writeFile(join(f.root,'discovery.json'),'[]')
    assert.equal((await readGateReport(f.paths[0])).success,false,'discovery bytes are bound')
  })
  test(`${scope} rejects internally bound but incomplete, reordered or mis-scoped phase reports`,async()=>{
    for(const fault of ['missing phase','duplicate phase','reordered phase','unknown phase','wrong phase files','duplicate file','reported discovery omission','actual discovery extra','reference boundary','unknown scope','parallel isolated phase']) {
      const f=await terminalFixture(scope),a=f.aggregate
      if(fault==='missing phase')a.phases.splice(1,1)
      if(fault==='duplicate phase')a.phases.push(a.phases[1])
      if(fault==='reordered phase')[a.phases[1],a.phases[2]]=[a.phases[2],a.phases[1]]
      if(fault==='unknown phase')a.phases[1].name='invented'
      if(fault==='wrong phase files')a.phases[1].files=a.phases[0].files
      if(fault==='duplicate file')a.phases[0].files.push(a.phases[0].files[0])
      if(fault==='reported discovery omission')a.discoveredFiles.pop()
      if(fault==='unknown scope')a.scope='invented'
      if(['actual discovery extra','reference boundary'].includes(fault)) {
        let discovery=JSON.parse(await readFile(join(f.root,'discovery.json'),'utf8'))
        if(fault==='actual discovery extra')discovery.push({file:join(a.checkout,'packages/docs-tooling/src/shared-docs/unreported.test.ts')})
        else if(scope==='all')discovery=discovery.filter(p=>p.file!==join(a.checkout,REFERENCE_FILE))
        else discovery.push({file:join(a.checkout,REFERENCE_FILE)})
        await writeFile(join(f.root,'discovery.json'),JSON.stringify(discovery))
      }
      if(fault==='parallel isolated phase') {
        const path=join(f.root,a.phases[1].name,'receipt.json'),receipt=JSON.parse(await readFile(path,'utf8'))
        receipt.observed.start.configuration[0].maxWorkers=9
        await writeFile(path,JSON.stringify(receipt))
      }
      await assert.rejects(withGateDeadline(b=>prepareGateReports(a,f.paths,b),{evidenceRoot:f.root}),undefined,fault)
      assert.equal((await readGateReport(f.paths[0])).success,false,fault)
    }
  })
}
test('actual report reader qualifies only a bound committed terminal; provisional copies never pass',async()=>{
  const f=await terminalFixture()
  const prepared=await withGateDeadline(b=>prepareGateReports(f.aggregate,f.paths,b),{evidenceRoot:f.root})
  for(const path of f.paths) {
    assert.equal(JSON.parse(await readFile(path,'utf8')).success,undefined)
    assert.equal((await readGateReport(path)).success,false)
  }
  const result=await settleGateVerdict(prepared)
  assert.equal(result.success,true);assert.equal(result.settlementStatus,'acknowledged');assert.equal(result.commandStatus,'passed')
  for(const path of f.paths) {
    const read=await readGateReport(path);assert.equal(read.success,true);assert.equal(read.committed,true)
    assert.equal(read.commandStatus,'not-established-by-artifacts')
  }
  await writeFile(f.paths[1],(await readFile(f.paths[1],'utf8'))+' ')
  assert.equal((await readGateReport(f.paths[0])).success,false)
})
for(const failure of ['second report I/O','preparation timeout','diagnostic write failure'])test(`${failure} cannot qualify an already written first report`,async()=>{
  const f=await terminalFixture(),original=f.paths[1]
  if(failure==='second report I/O') {await writeFile(original,'caller-owned');f.paths[1]=join(original,'nested.json')}
  if(failure==='diagnostic write failure') {await mkdir(join(f.root,'gate-failure.json'));await mkdir(join(f.root,'gate-stop.json'))}
  await assert.rejects(withGateDeadline(async budget=>{
    const step=budget.step.bind(budget);let reports=0
    budget.step=(name,action)=>step(name,async()=>{
      if(name==='provisional report'&&++reports===2&&failure!=='second report I/O') {
        if(failure==='preparation timeout'){await sleep(150);budget.check()}
        throw new Error('injected second report failure')
      }
      return action()
    })
    return prepareGateReports(f.aggregate,f.paths,budget)
  },{milliseconds:failure==='preparation timeout'?60:2000,evidenceRoot:f.root}))
  assert.equal(JSON.parse(await readFile(f.paths[0],'utf8')).phaseResultsPassed,true)
  assert.equal((await readGateReport(f.paths[0])).success,false)
  await assert.rejects(stat(join(f.root,'terminal.json')),{code:'ENOENT'})
  if(failure==='second report I/O')assert.equal(await readFile(original,'utf8'),'caller-owned')
})
test('partial, corrupt, mismatched and non-passing terminal evidence is rejected',async()=>{
  for(const corrupt of ['partial','foreign','phase failed','raw tampered','legacy version','missing discovery','scope mismatch']) {
    const f=await terminalFixture(),prepared=await withGateDeadline(b=>prepareGateReports(f.aggregate,f.paths,b),{evidenceRoot:f.root})
    const value=JSON.parse(prepared.terminalBytes)
    if(corrupt==='partial')await writeFile(prepared.terminalPath,'{"version":')
    else {
      if(corrupt==='foreign')value.runId='foreign'
      if(corrupt==='phase failed')value.phases[0].settled=false
      if(corrupt==='legacy version')value.version=1
      if(corrupt==='missing discovery')delete value.discovery
      if(corrupt==='scope mismatch')value.scope='all'
      await writeFile(prepared.terminalPath,JSON.stringify(value))
      if(corrupt==='raw tampered')await writeFile(join(f.root,'light/raw.json'),'{}')
    }
    assert.equal((await readGateReport(f.paths[0])).success,false,corrupt)
  }
})
test('lost publication acknowledgment stays command-unknown while the offline reader distinguishes an actual commit',async()=>{
  for(const landed of [true,false]) {
    const f=await terminalFixture(),prepared=await withGateDeadline(b=>prepareGateReports(f.aggregate,f.paths,b),{evidenceRoot:f.root})
    const result=await settleGateVerdict(prepared,{publish:async(from,to)=>{if(landed)await link(from,to);throw new Error('lost publication acknowledgment')}})
    assert.equal(result.success,false);assert.equal(result.commandStatus,'unknown');assert.equal(result.settlementStatus,'unknown')
    const offline=await readGateReport(f.paths[0]);assert.equal(offline.success,landed);assert.equal(offline.commandStatus,'not-established-by-artifacts')
  }
})
test('slow settlement is bounded, attempts publication once and does not run confirmation after expiry',async()=>{
  const f=await terminalFixture(),prepared=await withGateDeadline(b=>prepareGateReports(f.aggregate,f.paths,b),{evidenceRoot:f.root})
  let publications=0,confirmations=0
  const started=performance.now()
  const result=await settleGateVerdict(prepared,{milliseconds:50,publish:async(from,to)=>{publications++;await sleep(150);await link(from,to)},confirm:async path=>{confirmations++;return readGateReport(path)}})
  assert.equal(result.success,false);assert.equal(result.settlementStatus,'unknown');assert.ok(performance.now()-started<140)
  await sleep(170);assert.equal(publications,1);assert.equal(confirmations,0)
  assert.equal((await readGateReport(f.paths[0])).success,true)
})
test('exclusive terminal publication preserves a prior terminal and cannot retry into success',async()=>{
  const f=await terminalFixture(),prepared=await withGateDeadline(b=>prepareGateReports(f.aggregate,f.paths,b),{evidenceRoot:f.root})
  await writeFile(prepared.terminalPath,'prior caller-owned terminal')
  const result=await settleGateVerdict(prepared)
  assert.equal(result.success,false);assert.equal(result.settlementStatus,'unknown')
  assert.equal(await readFile(prepared.terminalPath,'utf8'),'prior caller-owned terminal')
  assert.equal((await readGateReport(f.paths[0])).success,false)
})
test('real command exits zero only on acknowledged qualification and nonzero on lost acknowledgment',async()=>{
  for(const lost of [false,true]) {
    const f=await terminalFixture(),prepared=await withGateDeadline(b=>prepareGateReports(f.aggregate,f.paths,b),{evidenceRoot:f.root})
    const module=fileURLToPath(new URL('./run-vitest-groups.mjs',import.meta.url))
    const code=`import {settleGateVerdict} from ${JSON.stringify(module)};import {link} from 'node:fs/promises';
      const result=await settleGateVerdict(${JSON.stringify(prepared)},${lost?"{publish:async(from,to)=>{await link(from,to);throw new Error('lost acknowledgment')}}":"{}"});
      if(result.settlementStatus==='unknown')process.exit(1);process.exitCode=result.success?0:1;`
    const child=spawn(process.execPath,['--input-type=module','-e',code],{stdio:'ignore'})
    assert.equal(await new Promise(resolve=>child.once('exit',resolve)),lost?1:0)
    const offline=await readGateReport(f.paths[0]);assert.equal(offline.success,true)
    assert.equal(offline.commandStatus,'not-established-by-artifacts')
  }
})

async function realVitest(root,source) {
  const file=join(root,'fixture.test.js'),config=join(root,'config.mjs'),directory=join(root,'run'),p=protocol(root,{expected:[file]})
  await writeFile(file,source)
  await writeFile(config,'export default {test:{include:["fixture.test.js"],globals:true,environment:"node"}}')
  const vitest=join(dirname(createRequire(import.meta.url).resolve('vitest/package.json')),'vitest.mjs')
  const reporter=fileURLToPath(new URL('./vitest-stop-reporter.mjs',import.meta.url))
  return supervise({argv:[process.execPath,vitest,'run','--root='+root,'--config='+config,'--pool=forks','--maxWorkers=1','--isolate','--bail=1',
    '--reporter=json','--reporter='+reporter,'--outputFile.json='+join(directory,'raw.json')],cwd:root,
    env:{...process.env,VITEST_MAX_WORKERS:'1',ZDOC_TEST_RUN_ID:p.runId,ZDOC_TEST_EVENTS:join(directory,'events.jsonl')},
    directory,deadline:Date.now()+15000,protocol:p,graceMs:500})
}
test('actual installed Vitest and reporter preserve complete case results and normal skips',async()=>{
  const root=await fixture(),result=await realVitest(root,"test('pass',()=>expect(2+2).toBe(4));test.skip('platform skip',()=>{})")
  assert.equal(result.success,true,JSON.stringify(result))
  const raw=JSON.parse(await readFile(join(root,'run/raw.json'),'utf8'))
  validateRawReport(raw,[join(root,'fixture.test.js')],root)
  assert.equal(raw.numPassedTests,1);assert.equal(raw.numPendingTests,1)
})
test('actual Vitest timeout cannot execute its delayed effect or subsequent testcase',async()=>{
  const root=await fixture(),late=join(root,'late'),next=join(root,'next')
  const source=`import {writeFileSync} from 'node:fs';test('timeout',async()=>{await new Promise(resolve=>setTimeout(()=>{writeFileSync(${JSON.stringify(late)},'bad');resolve()},1200))},100);test('next',()=>writeFileSync(${JSON.stringify(next)},'bad'))`
  const result=await realVitest(root,source)
  assert.equal(result.success,false);assert.equal(result.settled,true);assert.match(result.reason,/Reported test\/module failure/)
  assert.match(await readFile(join(root,'run/events.jsonl'),'utf8'),/timed out/)
  await sleep(1300)
  await assert.rejects(stat(late),{code:'ENOENT'});await assert.rejects(stat(next),{code:'ENOENT'})
})
test('actual Vitest module failure retains its message before stopping',async()=>{
  const root=await fixture(),result=await realVitest(root,"throw new Error('module import broke');test('unreachable',()=>{})")
  assert.equal(result.success,false);assert.equal(result.settled,true)
  assert.match(await readFile(join(root,'run/events.jsonl'),'utf8'),/module import broke/)
})

// Rewrite all hashes after each synthetic corruption so the reader must reject
// the trusted-policy mismatch, not merely an incidental stale file hash.
async function rebindFixtureFile(path) {
  const bytes=await readFile(path),info=await stat(path,{bigint:true})
  return {path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),device:String(info.dev),inode:String(info.ino)}
}
for(const scope of ['all','shared-docs'])test(`${scope} reader rejects internally rebound missing or incomplete update-prepare phases`,async()=>{
  for(const fault of ['missing','duplicate','reordered','failed raw','missing terminal','unrun','historical v2 policy']) {
    const f=await terminalFixture(scope),prepared=await withGateDeadline(b=>prepareGateReports(f.aggregate,f.paths,b),{evidenceRoot:f.root})
    const terminal=JSON.parse(prepared.terminalBytes),index=terminal.phases.findIndex(p=>p.name==='update-prepare')
    assert.equal(index,scope==='all'?4:3)
    const reports=await Promise.all(f.paths.map(async path=>JSON.parse(await readFile(path,'utf8'))))
    if(fault==='missing'||fault==='historical v2 policy') {terminal.phases.splice(index,1);for(const report of reports)report.phases.splice(index,1)}
    if(fault==='duplicate') {terminal.phases.push(terminal.phases[index]);for(const report of reports)report.phases.push(report.phases[index])}
    if(fault==='reordered') {
      [terminal.phases[index-1],terminal.phases[index]]=[terminal.phases[index],terminal.phases[index-1]]
      for(const report of reports)[report.phases[index-1],report.phases[index]]=[report.phases[index],report.phases[index-1]]
    }
    if(fault==='historical v2 policy') {
      const discovery=JSON.parse(await readFile(terminal.discovery.path,'utf8')).filter(p=>!p.file.endsWith('/update-prepare.test.ts'))
      await writeFile(terminal.discovery.path,JSON.stringify(discovery));terminal.discovery=await rebindFixtureFile(terminal.discovery.path)
      for(const report of reports)report.discoveredFiles=report.discoveredFiles.filter(p=>!p.endsWith('/update-prepare.test.ts'))
    }
    if(fault==='failed raw') {
      const path=terminal.phases[index].raw.path,raw=JSON.parse(await readFile(path,'utf8'))
      raw.success=false;raw.numPassedTests=0;raw.numFailedTests=1;raw.testResults[0].status='failed';raw.testResults[0].assertionResults[0].status='failed'
      await writeFile(path,JSON.stringify(raw));terminal.phases[index].raw=await rebindFixtureFile(path)
    }
    if(fault==='missing terminal') {
      const path=terminal.phases[index].receipt.path,receipt=JSON.parse(await readFile(path,'utf8'))
      receipt.observed.terminal=null;await writeFile(path,JSON.stringify(receipt));terminal.phases[index].receipt=await rebindFixtureFile(path)
    }
    if(fault==='unrun')for(const report of reports)report.unrunFiles.push(join(report.checkout,expectedIsolatedFiles[2]))
    for(let i=0;i<f.paths.length;i++)await writeFile(f.paths[i],JSON.stringify(reports[i]))
    terminal.reports=await Promise.all(f.paths.map(rebindFixtureFile))
    await writeFile(prepared.terminalPath,JSON.stringify(terminal))
    assert.equal((await readGateReport(f.paths[0])).success,false,`${scope}: ${fault}`)
  }
})
