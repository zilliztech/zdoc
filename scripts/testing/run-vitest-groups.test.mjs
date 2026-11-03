import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,rename,symlink,readFile,writeFile,stat,realpath,link} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {spawn,execFileSync} from 'node:child_process'
import {createRequire} from 'node:module'
import {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {HEAVY_FILES,parseOptions,partitionFiles,inspectEvents,validateRawReport,supervise,runPhases,summarizeReports,tempParentPath,createTemporaryRoot,verifyTemporaryRoot,resolveProtectedInputs,withGateDeadline,prepareGateReports,settleGateVerdict,readGateReport} from './run-vitest-groups.mjs'
import StopReporter from './vitest-stop-reporter.mjs'

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
  const root='/repo',files=[...HEAVY_FILES,'packages/docs-tooling/src/shared-docs/new.test.ts'].map(p=>({file:join(root,p)}))
  const result=partitionFiles(files,root,'shared-docs')
  assert.deepEqual(result.phases.map(p=>p.files.length),[1,1,1])
  assert.deepEqual(result.phases.flatMap(p=>p.files).sort(),files.map(x=>x.file).sort())
  assert.throws(()=>partitionFiles([...files,files[0]],root,'shared-docs'),/Duplicate/)
  assert.throws(()=>partitionFiles(files.slice(1),root,'shared-docs'),/Missing heavy/)
  assert.throws(()=>partitionFiles([...files,{file:'/other/x.test.ts'}],root,'all'),/Invalid/)
  assert.throws(()=>partitionFiles([...files,{file:'/repo/ui.test.ts'}],root,'shared-docs'),/Out-of-scope/)
  assert.throws(()=>partitionFiles(files.map(x=>({...x,projectName:'extra'})),root,'all'),/project/)
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
test('surviving owned descendant after clean parent exit is an infrastructure failure',async()=>{
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
  const root=await fixture(),marker=join(root,'late-child'),pidFile=join(root,'child.pid')
  const module=fileURLToPath(new URL('./run-vitest-groups.mjs',import.meta.url))
  const childCode=`require('node:fs').writeFileSync(${JSON.stringify(pidFile)},String(process.pid));setTimeout(()=>require('node:fs').writeFileSync(${JSON.stringify(marker)},'bad'),800);setInterval(()=>{},1000)`
  const code=`import {withGateDeadline,supervise} from ${JSON.stringify(module)};
    await withGateDeadline(async budget=>budget.step('active child',()=>supervise({
      argv:[process.execPath,'-e',${JSON.stringify(childCode)}],cwd:${JSON.stringify(root)},env:process.env,
      directory:${JSON.stringify(join(root,'child'))},deadline:Date.now()+5000,budget,graceMs:100
    })),{milliseconds:250,evidenceRoot:${JSON.stringify(root)}});`
  const child=spawn(process.execPath,['--input-type=module','-e',code],{stdio:'ignore'})
  assert.equal(await new Promise(resolve=>child.once('exit',resolve)),1)
  const failure=JSON.parse(await readFile(join(root,'gate-failure.json'),'utf8'))
  const stopped=JSON.parse(await readFile(join(root,'gate-stop.json'),'utf8'))
  const pid=Number(await readFile(pidFile,'utf8'))
  assert.deepEqual(failure.owners.map(o=>o.pid),[pid]);assert.deepEqual(stopped.stopped,[{pid,settled:true}])
  await sleep(850);await assert.rejects(stat(marker),{code:'ENOENT'})
})

async function terminalFixture() {
  const root=await fixture(),checkout=join(root,'checkout')
  await mkdir(checkout)
  const phases=[]
  for(const [index,name] of ['light','transactions','local-runner'].entries()) {
    const files=[join(checkout,`${index}.test.ts`)],directory=join(root,name)
    await mkdir(directory)
    const raw={success:true,numTotalTests:1,numPassedTests:1,numFailedTests:0,testResults:[{name:files[0],status:'passed',assertionResults:[{status:'passed'}]}]}
    const receipt={success:true,exitCode:0,settled:true,observed:{terminal:{reason:'passed',errors:[],files:files.map(file=>({file,state:'passed'}))}}}
    await writeFile(join(directory,'raw.json'),JSON.stringify(raw));await writeFile(join(directory,'receipt.json'),JSON.stringify(receipt))
    phases.push({name,files,success:true,exitCode:0,settled:true,error:null,reason:null})
  }
  const aggregate={success:true,runId:root,checkout,evidenceRoot:root,phases,discoveredFiles:phases.flatMap(p=>p.files),unrunFiles:[],unaccountedFiles:[],rawCountsComplete:true}
  return {root,aggregate,paths:[join(root,'aggregate.json'),join(root,'requested.json')]}
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
  for(const corrupt of ['partial','foreign','phase failed','raw tampered']) {
    const f=await terminalFixture(),prepared=await withGateDeadline(b=>prepareGateReports(f.aggregate,f.paths,b),{evidenceRoot:f.root})
    const value=JSON.parse(prepared.terminalBytes)
    if(corrupt==='partial')await writeFile(prepared.terminalPath,'{"version":')
    else {
      if(corrupt==='foreign')value.runId='foreign'
      if(corrupt==='phase failed')value.phases[0].settled=false
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
