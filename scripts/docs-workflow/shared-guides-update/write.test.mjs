import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { test } from 'node:test'
import { authenticateBatchPrepare, authenticatePrepare, batchDraftMaterial, batchWriterContext, context, createBatchDraft,
  createDraft, gitReader, inspectPreparedBatch, material, producerBundle, runWithJournal, stageSignedCandidate, verifySignature } from './write.mjs'

const master = 'a'.repeat(40), dev = 'b'.repeat(40), k = 'c'.repeat(40), tree = 'd'.repeat(40), s = 'e'.repeat(40)
const targetRef = 'shared-update/' + 'a'.repeat(64), stage = 'shared-update-staging/' + 'd'.repeat(64)
const lockPath = id => 'shared-docs/guides/pages/' + id + '/lock.yaml'
function overlay(path, bytes = Buffer.from(`schema_version: 1\ncurrent: ${master}\nnext: ${dev}\n`)) {
  return {path,bytes,sha256:createHash('sha256').update(bytes).digest('hex')}
}
const pilotOverlay = overlay(lockPath('json-field-overview'))
const unit = {nextEdits:[{before:{current:master,next:master},target:dev,afterBlob:{sha256:pilotOverlay.sha256}}]}
const seal = {candidate:k,candidateTree:tree,master,runId:15}
const axes = ['old-next-to-target','current-to-candidate-next'].map(axis =>
  ({axis,sourceChanged:true,outputChanged:true,contentStatus:'valid',added:[],removed:[],renameCandidates:[]}))
const candidate = {stage,targetRef,seal,unit,report:{axes},reportArtifact:32,prep:{dev,fetchRun:11},baseTree:'f'.repeat(40),
  after:pilotOverlay.bytes.toString('utf8'),commit:{tree,parents:[master]}}
const env = {GITHUB_ACTIONS:'true',GITHUB_SERVER_URL:'https://github.com',GITHUB_API_URL:'https://api.github.com',
  GITHUB_REPOSITORY:'zilliztech/zdoc',GITHUB_REPOSITORY_ID:'660446555',GITHUB_REF:'refs/heads/master',GITHUB_SHA:master,
  GITHUB_WORKFLOW_REF:'zilliztech/zdoc/.github/workflows/shared-guides-update.yml@refs/heads/master',GITHUB_WORKFLOW_SHA:master,
  GITHUB_JOB:'write',GITHUB_RUN_ATTEMPT:'1',GITHUB_RUN_ID:'15',GITHUB_EVENT_NAME:'schedule',
  PREPARE_ARTIFACT_ID:'31',REPORT_ARTIFACT_ID:'32',PREPARE_ARTIFACT_DIGEST:'4'.repeat(64)}

test('both CLI writer branches resolve their journal and result variables', () => {
  const ts = createRequire(import.meta.url)('typescript')
  const pathname = fileURLToPath(new URL('./write.mjs', import.meta.url))
  const program = ts.createProgram([pathname], {
    allowJs:true, checkJs:true, noEmit:true, skipLibCheck:true, module:ts.ModuleKind.NodeNext,
    target:ts.ScriptTarget.ES2022
  })
  const errors = program.getSemanticDiagnostics(program.getSourceFile(pathname))
    .filter(d => [2304,2552,2448,18004].includes(d.code))
  assert.deepEqual(errors.map(d => ts.flattenDiagnosticMessageText(d.messageText,'\n')), [])
})

test('writer accepts only the original run on the fixed production workflow and repository',() => {
  assert.equal(context(env).master,master)
  for (const [key,value] of Object.entries({GITHUB_RUN_ATTEMPT:'2',GITHUB_EVENT_NAME:'pull_request',GITHUB_SHA:'bad',
    GITHUB_JOB:'discover',GITHUB_WORKFLOW_SHA:k,GITHUB_REF:'refs/heads/dev',GITHUB_REPOSITORY_ID:'22',
    GITHUB_WORKFLOW_REF:'zilliztech/zdoc/.github/workflows/fork.yml@refs/heads/master',PREPARE_ARTIFACT_ID:'013'}))
    assert.throws(() => context({...env,[key]:value}))
})

test('batch writer accepts only an earlier read-only run reference on protected master',() => {
  const batch = {...env,GITHUB_EVENT_NAME:'workflow_dispatch',GITHUB_REF_PROTECTED:'true',GITHUB_RUN_NUMBER:'20',
    GITHUB_ACTOR_ID:'123',BATCH_ACCEPTED_RUN_ID:'14'}
  assert.equal(batchWriterContext(batch).acceptedRun,14)
  for (const [key,value] of Object.entries({GITHUB_EVENT_NAME:'schedule',GITHUB_REF_PROTECTED:'false',GITHUB_RUN_ATTEMPT:'2',
    GITHUB_ACTOR_ID:'',GITHUB_RUN_NUMBER:'x',BATCH_ACCEPTED_RUN_ID:'014'}))
    assert.throws(() => batchWriterContext({...batch,[key]:value}))
  assert.throws(() => batchWriterContext({...batch,BATCH_ACCEPTED_RUN_ID:batch.GITHUB_RUN_ID}))
})

function prepareEvidence() {
  const bytes = Buffer.from('fixture ZIP'),digest = createHash('sha256').update(bytes).digest('hex')
  const ctx = context({...env,PREPARE_ARTIFACT_DIGEST:digest})
  const origin = {id:15,head_sha:master,head_branch:'master',repository_id:660446555,head_repository_id:660446555}
  const run = {...origin,run_attempt:1,event:'schedule',status:'in_progress',path:'.github/workflows/shared-guides-update.yml',
    repository:{id:660446555},head_repository:{id:660446555}}
  const job = {name:'prepare',run_id:15,run_attempt:1,head_sha:master,status:'completed',conclusion:'success'}
  const artifact = {id:31,name:'shared-guides-candidate-15-1',expired:false,digest:'sha256:' + digest,size_in_bytes:bytes.length,workflow_run:origin}
  const human = {...artifact,id:32,name:'shared-guides-report-15-1'}
  const members = ['report.json','plan.json','prepare.json','preparation.json','proof.json','candidate.commit','unit-plan.json','before.lock','after.lock','lock.next.patch']
  const files = new Map(members.map(name => [name,Buffer.from(name)]))
  const responses = [run,{total_count:1,jobs:[job]},{total_count:2,artifacts:[artifact,human]},bytes]
  let calls = 0
  const authenticate = () => authenticatePrepare({parseStrictJson:JSON.parse,parseRemoteZip:() => files},async ({method,path}) => {
    assert.equal(method,'GET')
    const paths = ['/actions/runs/15/attempts/1','/actions/runs/15/attempts/1/jobs?per_page=100',
      '/actions/runs/15/artifacts?per_page=100','/actions/artifacts/31/zip']
    assert.equal(path,'/repos/zilliztech/zdoc' + paths[calls])
    const response = responses[calls++]
    return {status:200,body:Buffer.isBuffer(response) ? response : Buffer.from(JSON.stringify(response))}
  },ctx)
  return {run,job,artifact,human,files,responses,authenticate}
}

test('authenticate the prepare job and exact current-run archive, including every member and downloaded digest',async () => {
  assert.equal((await prepareEvidence().authenticate()).size,10)
  for (const tamper of [
    f => {f.run.path = '.github/workflows/other.yml'}, f => {f.job.conclusion = 'skipped'},
    f => {f.job.head_sha = k}, f => {f.run.run_attempt = 2}, f => {f.artifact.workflow_run.id = 16},
    f => {f.artifact.digest = 'sha256:' + '0'.repeat(64)}, f => {f.artifact.expired = true},
    f => {f.responses[3] = Buffer.from('wrong bytes')}, f => {f.responses[2].total_count = 3}, f => {f.human.id = 44}, f => {f.human.name = 'report-for-a-different-run'},
    f => {f.files.set('unknown.js',Buffer.from('unexpected'))}
  ]) {
    const f = prepareEvidence()
    tamper(f)
    await assert.rejects(f.authenticate)
  }
})

function batchPrepareEvidence(payload = Buffer.from('bound handoff')) {
  const bytes = Buffer.from('batch ZIP')
  const digest = createHash('sha256').update(bytes).digest('hex')
  const ctx = {master,run:16,acceptedRun:15,actor:123,runNumber:20,attempt:1,event:'workflow_dispatch'}
  const origin = {id:15,head_sha:master,head_branch:'master',repository_id:660446555,head_repository_id:660446555}
  const run = {...origin,run_number:19,run_attempt:1,event:'workflow_dispatch',status:'completed',conclusion:'success',
    workflow_id:414826845,actor:{id:456},triggering_actor:{id:456},path:'.github/workflows/shared-guides-update.yml',
    repository:{id:660446555},head_repository:{id:660446555}}
  const step = {name:'Upload verified batch handoff',status:'completed',conclusion:'success',
    started_at:'2026-11-20T13:03:00Z',completed_at:'2026-11-20T13:03:06Z'}
  const job = {name:'prepare_batch',run_id:15,run_attempt:1,head_sha:master,status:'completed',conclusion:'success',
    started_at:'2026-11-20T13:00:00Z',completed_at:'2026-11-20T13:03:09Z',steps:[step]}
  const marker = {...step,name:'Confirm read-only batch acceptance'}
  job.steps.push(marker)
  const priorWrite = {...job,name:'write',conclusion:'skipped',steps:[]}
  const current = {...run,id:16,run_number:20,status:'in_progress',conclusion:null,actor:{id:123},triggering_actor:{id:123}}
  const latest = structuredClone(run)
  const artifact = {id:31,name:'shared-guides-batch-handoff-15-1',expired:false,digest:'sha256:' + digest,size_in_bytes:bytes.length,
    created_at:'2026-11-20T13:03:01Z',workflow_run:origin}
  const after = structuredClone(artifact)
  const members = new Map([['handoff.json',payload]])
  const jobs = {total_count:2,jobs:[job,priorWrite]}
  const artifacts = {total_count:1,artifacts:[artifact]}
  const responses = new Map([
    ['/actions/runs/16',current], ['/actions/runs/15',latest], ['/actions/runs/15/attempts/1',run], ['/actions/runs/15/attempts/1/jobs?per_page=100',jobs],
    ['/actions/runs/15/artifacts?per_page=100',artifacts], ['/actions/artifacts/31/zip',bytes],
    ['/actions/artifacts/31',after]
  ])
  const calls = []
  const contract = {parseStrictJson:JSON.parse,parseBatchHandoffZip:() => members}
  const transport = async ({method,path,maximum}) => {
    assert.equal(method,'GET')
    assert.ok(path.startsWith('/repos/zilliztech/zdoc/'))
    const suffix = path.slice('/repos/zilliztech/zdoc'.length)
    calls.push(suffix)
    if (suffix.endsWith('/zip')) assert.equal(maximum,artifact.size_in_bytes)
    const response = responses.get(suffix)
    return {status:200,body:Buffer.isBuffer(response) ? response : Buffer.from(JSON.stringify(response))}
  }
  const authenticate = () => authenticateBatchPrepare(contract,transport,ctx)
  return {run,job,step,marker,current,latest,priorWrite,artifact,after,payload,members,artifacts,responses,authenticate,calls,contract,transport,ctx}
}

test('batch writer verifies provenance of the handoff upload and rereads metadata after downloading',async () => {
  const fixture = batchPrepareEvidence()
  const accepted = await fixture.authenticate()
  assert.deepEqual(accepted.bytes,fixture.payload)
  fixture.latest.run_attempt = 2
  await assert.rejects(accepted.recheckAcceptance, /acceptance run identity/)
  assert.ok(fixture.calls.indexOf('/actions/artifacts/31/zip') < fixture.calls.indexOf('/actions/artifacts/31'))
  for (const [change,error] of [
    [f => { f.run.path = '.github/workflows/shared-guides-batch-qualify.yml' }, /run identity/],
    [f => { f.job.name = 'prepare' }, /job not authenticated/],
    [f => { f.step.conclusion = 'skipped' }, /step not authenticated/],
    [f => { f.marker.conclusion = 'skipped' }, /step not authenticated/],
    [f => { f.latest.run_attempt = 2 }, /acceptance run identity/],
    [f => { f.priorWrite.conclusion = 'success' }, /job not authenticated/],
    [f => { f.run.status = 'in_progress' }, /acceptance run identity/],
    [f => { f.run.head_sha = dev }, /acceptance run identity/],
    [f => { f.run.workflow_id++ }, /acceptance run identity/],
    [f => { f.run.run_number = f.current.run_number }, /acceptance run identity/],
    [f => { f.latest.triggering_actor.id++ }, /acceptance run identity/],
    [f => { f.current.actor.id++ }, /writer run identity/],
    [f => { f.artifact.created_at = '2026-11-20T13:01:00Z' }, /artifact binding/],
    [f => { f.artifact.workflow_run.head_repository_id = 1 }, /artifact binding/],
    [f => { f.artifacts.artifacts.push({...f.artifact,id:32}); f.artifacts.total_count++ }, /ambiguous/],
    [f => { f.after.expired = true }, /artifact binding/],
    [f => { f.after.created_at = '2026-11-20T13:03:02Z' }, /changed after download/],
    [f => { f.responses.set('/actions/artifacts/31/zip',Buffer.alloc(f.artifact.size_in_bytes)) }, /digest changed/],
    [f => { f.members.set('extra.json',Buffer.from('{}')) }, /archive members/]
  ]) {
    const invalid = batchPrepareEvidence()
    change(invalid)
    await assert.rejects(invalid.authenticate,error)
  }
})

test('joins hosted artifact provenance, independent Git inspection and live Fetch authority before admission',async () => {
  const pins = {master,dev,source:k,trustedTools:master,toolsetSha256:'1'.repeat(64)}
  const executableClosure = {path:'blobs/' + '2'.repeat(64),sha256:'2'.repeat(64),bytes:51}
  const fetch = {run:{id:4,attempt:1,head:master}}
  const manifest = {base:{pins},toolset:{executableClosure},fetch}
  const payload = Buffer.from(JSON.stringify({manifest}))
  const fixture = batchPrepareEvidence(payload)
  const ctx = fixture.ctx, handoffDigest = createHash('sha256').update(payload).digest('hex')
  const baseline = {}
  const stages = []
  const verified = {status:'verified-witness',observation:'observed',manifest}
  const contract = {...fixture.contract,
    inspectObservedBatchHandoff(input) {
      stages.push('reader')
      assert.deepEqual(input,{bytes:payload,baseline,expected:{pins,executableClosure,
        ref:{path:'blobs/' + handoffDigest,sha256:handoffDigest,bytes:payload.length}}})
      return verified
    },
    verifyBatchFinalFreshness(input,now,replay,signal) {
      stages.push('fresh')
      assert.deepEqual(input,{...fetch,pins})
      assert.ok(Number.isSafeInteger(now) && replay === undefined && !signal.aborted)
    },
  }
  const inspect = (request = ctx, git = {head:master,baseline}) => inspectPreparedBatch(contract,fixture.transport,request,git)
  await assert.rejects(inspect(ctx,{head:dev,baseline}), /checkout/)
  assert.equal(fixture.calls.length,0)
  const admitted = await inspect()
  assert.equal(admitted.handoffDigest,handoffDigest)
  assert.equal(admitted.artifact,31)
  assert.deepEqual(admitted.witness,verified)
  assert.deepEqual(stages,['reader','fresh'])
  contract.verifyBatchFinalFreshness = () => { throw Error('BATCH_FINAL_RUN_CHANGED') }
  await assert.rejects(inspect(), /BATCH_FINAL_RUN_CHANGED/)
})

test('batch writer sends one signed Draft with two changed locks and one unchanged member',async () => {
  const overlays = [overlay(lockPath('page-a')),overlay(lockPath('page-b'))]
  const members = ['page-a','page-b','page-c'].map((pageId,i) => ({pageId,disposition:i === 2 ? 'noop' : 'advance'}))
  const ctx = {master,run:15,acceptedRun:14,attempt:1,artifact:31,digest:'1'.repeat(64),handoffDigest:'2'.repeat(64)}
  const manifest = {members,base:{pins:{master,dev,source:k}},groupSha256:'3'.repeat(64),binding:{digest:'4'.repeat(64)}}
  const proof = {candidate:k,candidateTree:tree,prepared:{base:master}}
  const bytes = Buffer.from('tree ' + tree + '\nparent ' + master +
    '\nauthor Shared update local <shared-update-local@localhost> 1 +0000' +
    '\ncommitter Shared update local <shared-update-local@localhost> 1 +0000\n\nbatch revision\n')
  const witness = {status:'verified-witness',observation:'observed',writeEligible:false,manifest,proof,baseTree:candidate.baseTree,
    upstream:{pulls:[3848,3850],directCommits:[tree]},
    nextLocks:[{pageId:'page-a',before:master,after:k},{pageId:'page-b',before:dev,after:k},{pageId:'page-c',before:dev,after:dev}],
    objects:[{type:'commit',oid:k,bytes},...overlays.map(({bytes}) => ({type:'blob',bytes}))],
    plan:{disposition:'candidate',unitKey:'guides:batch',nextEdits:overlays.map(item => ({
      before:{path:item.path},afterBlob:{sha256:item.sha256},
    }))}}
  const contract = {canonicalBytes:value => Buffer.from(JSON.stringify(value)),digest:() => '5'.repeat(64)}
  const material = batchDraftMaterial(contract,ctx,witness)
  assert.deepEqual(material.overlays,overlays)
  assert.equal(material.commit.message,'batch revision\n')
  assert.equal(material.seal.runId,ctx.run)
  assert.equal(material.seal.candidate,k)
  assert.notEqual(batchDraftMaterial(contract,{...ctx,artifact:32},witness).seal.transactionId,material.seal.transactionId)
  assert.throws(() => batchDraftMaterial(contract,ctx,{...witness,observation:'replay'}),/observed verified witness/)

  const fixture = scenario({batch:true,expectedOverlays:overlays})
  const run = hooks => createBatchDraft({...hooks,candidate:{...material,stage,targetRef}})
  const result = await run(fixture.hooks)
  assert.equal(result.status,'created')
  assert.equal(result.groupSha256,manifest.groupSha256)
  assert.deepEqual(fixture.calls,['tree','candidate','stage','sign','target','draft'])
  const blocked = scenario({batch:true,expectedOverlays:overlays,stopAt:1})
  await assert.rejects(run(blocked.hooks),/stale inputs/)
  const large = {...material,upstream:{pulls:Array.from({length:1000},(_,i) => i+1),directCommits:[]}}
  await assert.rejects(createBatchDraft({...blocked.hooks,candidate:{...large,stage,targetRef}}),/Draft body exceeds limit/)
  assert.deepEqual(blocked.calls,[])
})

function scenario({stopAt,wrongTree,wrongK,badSeal,failAfter,brokenDraft,batch,expectedOverlays = [pilotOverlay]} = {}, record = () => {}) {
  const calls = [], checks = [], journal = [], verified = [], receipts = [], readbacks = []
  const pr = {id:9,number:8,state:'open',draft:true,merged:false,user:{id:41898282},changed_files:expectedOverlays.length,
    head:{ref:targetRef,sha:s,repo:{id:660446555}},base:{ref:'master',sha:master,repo:{id:660446555}}}
  const mutation = (name,response) => {
    calls.push(name)
    if (name === failAfter) throw new Error('Unknown remote outcome')
    return response
  }
  const api = {
    async graph(query,args) {
      if (query.startsWith('query')) return {viewer:{login:'github-actions[bot]',databaseId:41898282}}
      assert.deepEqual(args.input,{branch:{repositoryNameWithOwner:'zilliztech/zdoc',branchName:stage},
        expectedHeadOid:k,message:{headline:'seal',body:'body'},fileChanges:{additions:[],deletions:[]}})
      return mutation('sign',{createCommitOnBranch:{commit:{oid:s}}})
    },
    async rest(path,method,body) {
      if (path === '/pulls/8') return {...pr,changed_files:brokenDraft ? expectedOverlays.length + 1 : expectedOverlays.length}
      assert.equal(method,'POST')
      if (path === '/git/trees') {
        assert.deepEqual(body,{base_tree:candidate.baseTree,tree:expectedOverlays.map(({path,bytes}) =>
          ({path,mode:'100644',type:'blob',content:bytes.toString('utf8')}))})
        return mutation('tree',{sha:wrongTree ? s : tree})
      }
      if (path === '/git/commits') return mutation('candidate',{sha:wrongK ? s : k,tree:{sha:tree},parents:[{sha:master}]})
      if (path === '/git/refs') {
        const branch = body.ref.slice(11)
        assert.equal(body.sha,branch === stage ? k : s)
        assert.ok([stage,targetRef].includes(branch))
        return mutation(branch === stage ? 'stage' : 'target',{ref:body.ref,object:{type:'commit',sha:body.sha}})
      }
      assert.equal(path,'/pulls')
      assert.equal(body.base,'master')
      assert.equal(body.head,targetRef)
      assert.equal(body.draft,true)
      if (batch) {
        assert.ok(body.body.includes('[milvus-io/milvus-docs#3848](https://github.com/milvus-io/milvus-docs/pull/3848)'))
        assert.ok(body.body.includes('[milvus-io/milvus-docs#3850](https://github.com/milvus-io/milvus-docs/pull/3850)'))
        assert.ok(body.body.includes('[`' + tree + '`](https://github.com/milvus-io/milvus-docs/commit/' + tree + ') (direct commit)'))
        assert.ok(body.body.includes('| `page-a` | `' + master + '` | `' + k + '` | Advanced |'))
        assert.ok(body.body.includes('| `page-b` | `' + dev + '` | `' + k + '` | Advanced |'))
        assert.ok(body.body.includes('| `page-c` | `' + dev + '` | `' + dev + '` | Unchanged |'))
      } else {
        assert.match(body.body,/Prior next to proposed next \| changed \| changed/)
        assert.match(body.body,/runs\/15\/artifacts\/32/)
      }
      return mutation('draft',pr)
    }}
  const hooks = {candidate,api,
    form:() => ({status:'encoded',githubMessage:{headline:'seal',body:'body'}}),
    fresh:async owned => { checks.push(structuredClone(owned)); if (checks.length === stopAt) throw new Error('Existing PR or stale inputs') },
    verify:async (_,oid) => { verified.push(oid); if (badSeal) throw new Error('Wrong signature') },
    journal:item => { journal.push(item); record(item) },provenance:oid => receipts.push(oid),
    waitRef:async (_, branch, exact, previous) => { readbacks.push([branch,exact,previous]) }}
  return {calls,checks,journal,verified,receipts,readbacks,hooks,run:() => createDraft(hooks),
    stageSigned: overlays => stageSignedCandidate({...hooks,overlays})}
}

test('stages and verifies one signed candidate for the exact ordered lock overlays', async () => {
  const overlays = [overlay(lockPath('first-page')), overlay(lockPath('second-page'),
    Buffer.from(`# Retain framing\r\nschema_version: 1\r\ncurrent: '${master}'\r\nnext: "${dev}"\r\n`))]
  const f = scenario({expectedOverlays:overlays})
  const result = await f.stageSigned(overlays)
  assert.deepEqual(f.calls,['tree','candidate','stage','sign'])
  assert.deepEqual(f.readbacks,[[stage,k,undefined],[stage,s,k]])
  assert.deepEqual(f.verified,[s])
  assert.deepEqual(f.checks,[{},{},{},{ownedStage:{ref:stage,sha:k}}])
  assert.deepEqual(f.receipts,[])
  assert.equal(result.candidate,k)
  assert.equal(result.seal,s)
  assert.deepEqual(result.ownedStage,{ref:stage,sha:s})
})

test('rejects a duplicate, unsorted, foreign, unsafe or changed overlay before any outbound mutation', async () => {
  const first = overlay(lockPath('first-page')), second = overlay(lockPath('second-page'))
  for (const overlays of [
    [first,first],
    [second,first],
    [first,overlay('shared-docs/node/lock.yaml')],
    [first,overlay('shared-docs/guides/pages/../lock.yaml')],
    [first,overlay(lockPath('second-page') + '\n')],
    [first,{...second,bytes:Buffer.from('unverified after bytes')}],
    [first,overlay(lockPath('second-page'),Buffer.from([0xff]))],
    Array.from({length:65},(_,i) => overlay(lockPath('page-' + String(i).padStart(3,'0')))),
  ]) {
    const f = scenario()
    await assert.rejects(() => f.stageSigned(overlays),/overlay/i)
    assert.deepEqual(f.calls,[])
    assert.deepEqual(f.journal,[])
  }
})

test('stops before K, staging and signing when GitHub returns an unexpected root tree', async () => {
  const overlays = [overlay(lockPath('first-page')),overlay(lockPath('second-page'))]
  const f = scenario({wrongTree:true,expectedOverlays:overlays})
  await assert.rejects(() => f.stageSigned(overlays),/GitHub created another tree/)
  assert.deepEqual(f.calls,['tree'])
  assert.deepEqual(f.readbacks,[])
  assert.deepEqual(f.verified,[])
})

test('create only the exact candidate, signed stage, new target and Draft; check each boundary',async () => {
  const f = scenario(), result = await f.run()
  assert.deepEqual(f.calls,['tree','candidate','stage','sign','target','draft'])
  assert.equal(result.seal,s)
  assert.deepEqual(f.verified,[s])
  assert.deepEqual(f.receipts,[s])
  assert.deepEqual(f.checks,[{},{},{},{ownedStage:{ref:stage,sha:k}},{ownedStage:{ref:stage,sha:s}},
    {ownedStage:{ref:stage,sha:s},ownedHead:{ref:targetRef,sha:s}},
    {ownedStage:{ref:stage,sha:s},ownedHead:{ref:targetRef,sha:s},ownedPull:{number:8,ref:targetRef,sha:s}}])
})

test('stale input or newly recognized overlap stops the next mutation at all six write boundaries',async () => {
  for (let stopAt = 1; stopAt <= 6; stopAt++) {
    const f = scenario({stopAt})
    await assert.rejects(f.run,/Existing PR/)
    assert.equal(f.calls.length,stopAt - 1)
  }
})

test('incorrect K, rejected seal, lost responses and changed Draft never cause retry or repair writes',async () => {
  for (const [settings,last] of [[{wrongK:true},'candidate'],[{badSeal:true},'sign'],[{brokenDraft:true},'draft'],
    ...['tree','candidate','stage','sign','target','draft'].map(failAfter => [{failAfter},failAfter])]) {
    const f = scenario(settings)
    await assert.rejects(f.run)
    assert.equal(f.calls.at(-1),last)
    assert.equal(f.calls.filter(call => call === last).length,1)
    if (settings.failAfter) assert.equal(f.journal.at(-1).state,'requested')
  }
})

test('a proven pre-mutation hold can return success; uncertain writes continue to veto subsequent runs',async () => {
  const journal = []
  const run = settings => runWithJournal(record => scenario(settings,record).run(),entry => journal.push(entry))
  const held = await run({stopAt:1})
  assert.deepEqual(held,{status:'held',mutationRequested:false,reason:'Existing PR or stale inputs'})
  assert.deepEqual(journal.map(entry => entry.state),['started','held'])
  await assert.rejects(() => run({failAfter:'tree'}),/Unknown remote outcome/)
  assert.equal(journal.at(-1).state,'stopped')
  assert.equal((await run({})).status,'created')
  assert.equal(journal.at(-1).state,'created')
})

test('CLI reports status=held with a retained reason and zero producer artifacts before the first mutation',t => {
  const temp = mkdtempSync(join(tmpdir(),'shared-guides-held-test-'))
  t.after(() => rmSync(temp,{recursive:true,force:true}))
  const dest = join(temp,'shared-guides-writer'), output = join(temp,'outputs')
  execFileSync(process.execPath,['scripts/docs-workflow/shared-guides-update/write.mjs'],{env:{...env,
    RUNNER_TEMP:temp,GITHUB_WORKSPACE:process.cwd(),WRITER_OUTPUT:dest,GITHUB_OUTPUT:output,GITHUB_STEP_SUMMARY:join(temp,'summary')}})
  assert.equal(readFileSync(output,'utf8'),'status=held\n')
  assert.deepEqual(JSON.parse(readFileSync(join(dest,'held.json'))),{status:'held',mutationRequested:false,reason:'Job token unavailable'})
  assert.equal(existsSync(join(temp,'shared-guides-producer')),false)
})

test('the bundled production contract reconstructs the exact B2 commit from master and rejects a changed lock or candidate',async t => {
  const root = mkdtempSync(join(tmpdir(),'shared-guides-writer-test-'))
  t.after(() => rmSync(root,{recursive:true,force:true}))
  const bundle = join(root,'writer-contract.mjs')
  execFileSync('node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/bin/esbuild',
    ['scripts/docs-workflow/shared-guides-update/writer-contract.ts','--bundle','--platform=node','--format=esm','--target=node22','--log-level=error','--outfile=' + bundle])
  const c = await import(pathToFileURL(bundle)), canon = v => Buffer.from(c.canonicalBytes(v))
  const require = createRequire(import.meta.url)
  const {loadTypeScript} = require('../../lib/load-typescript.js')
  const {encodeRevisionMessage} = loadTypeScript(resolve('packages/docs-tooling/src/shared-docs/core/updates/metadata.ts'))
  const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
  const blob = bytes => ({path:'blobs/' + sha256(bytes),bytes:bytes.length,sha256:sha256(bytes)})
  const subject = {kind:'guides-page',group:'guides',pageId:'json-field-overview'}
  const lock = 'shared-docs/guides/pages/json-field-overview/lock.yaml'
  const before = Buffer.from('schema_version: 1\ncurrent: ' + master + '\nnext: ' + master + '\n')
  const after = Buffer.from(before.toString().replace('next: ' + master,'next: ' + dev))
  const repo = join(root,'zdoc')
  mkdirSync(join(repo,'shared-docs/guides/pages/json-field-overview'),{recursive:true})
  const git = (args,input) => execFileSync('/usr/bin/git',['-C',repo,...args],{input,env:{PATH:'/usr/bin:/bin',LC_ALL:'C',
    GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null',GIT_AUTHOR_NAME:'Test',GIT_AUTHOR_EMAIL:'test@example.com',
    GIT_AUTHOR_DATE:'1700000000 +0000',GIT_COMMITTER_NAME:'Test',GIT_COMMITTER_EMAIL:'test@example.com',GIT_COMMITTER_DATE:'1700000000 +0000'}})
  const rev = name => git(['rev-parse',name]).toString().trim()
  git(['init','--quiet'])
  writeFileSync(join(repo,lock),before)
  git(['add',lock])
  git(['commit','--quiet','-m','Master'])
  const m = rev('HEAD'), baseTree = rev('HEAD^{tree}')
  writeFileSync(join(repo,lock),after)
  git(['add',lock])
  const candidateTree = git(['write-tree']).toString().trim()
  const {fixtureMaterial} = loadTypeScript(resolve('packages/docs-tooling/src/shared-docs/testing/updates/fixtures/manual-provider.ts'))
  const report = structuredClone(fixtureMaterial({subject,master:m,current:master,target:dev,members:[{
    logicalId:'json-field-overview',manualId:'guides',token:'shared-json-field-overview',
    outputPath:'content/en/guides/json-field-overview.mdx',origin:'upstream',current:true,next:true}]}).collectedReport)
  report.pins.configTreeOid = baseTree
  const source = {repository:'https://github.com/milvus-io/milvus-docs',track:'v3.0.x'}
  Object.assign(report.pins.source,source)
  Object.assign(report.semanticProjection.source,source)
  report.semanticInputSha256 = c.digest('semantic',report.semanticProjection)
  const plan = {kind:'shared-update-unit',schemaVersion:1,unitKey:'guides:' + sha256(canon([subject])),subjects:[subject],
    disposition:'candidate',membersSha256:c.digest('unit-members',[{subject,memberSetSha256:report.memberSetSha256}]),
    semanticInputSha256:c.digest('unit-semantic',[{subject,semanticInputSha256:report.semanticInputSha256}]),
    holdReasons:[],reports:[blob(canon(report))],
    nextEdits:[{subject,before:{path:lock,current:master,next:master,sha256:sha256(before)},afterBlob:blob(after),target:dev}]}
  const planSha256 = c.digest('plan',plan)
  const revision = {kind:'shared-update-revision',schemaVersion:1,unitKey:plan.unitKey,subjects:[subject],
    parentHead:m,master:m,dev:m,tools:m,memberSetSha256:plan.membersSha256,planSha256,previousBotCommit:null,
    lockDeltas:[{path:lock,current:master,oldNext:master,next:dev}],preservedHumanHeads:[]}
  const identity = 'Shared update local <shared-update-local@localhost> 1700000001 +0000'
  const raw = Buffer.from('tree ' + candidateTree + '\nparent ' + m + '\nauthor ' + identity + '\ncommitter ' + identity +
    '\n\n' + encodeRevisionMessage(revision).commitMessage)
  const candidate = git(['hash-object','-w','-t','commit','--stdin'],raw).toString().trim()
  const proof = {prepared:{kind:'new',master:m,base:m,tree:baseTree},candidate,candidateTree,
    patch:blob(git(['diff','--raw','--no-abbrev','-z',m,candidate])),preservedHumanHeads:[],trustedToolsetSha256:report.pins.toolsetSha256,
    executableClosure:blob(before),nextEdits:plan.nextEdits}
  const patch = git(['diff','--no-ext-diff',m,candidate]), ctx = {run:15,attempt:1,master:m}
  const result = {kind:'shared-update-local-result',schemaVersion:1,reasons:[],operations:[]}
  const files = new Map(Object.entries({'report.json':canon(report),'unit-plan.json':canon(plan),'proof.json':canon(proof),'before.lock':before,'after.lock':after,
    'candidate.commit':raw,'lock.next.patch':patch,'plan.json':canon({...result,status:'planned'}),
    'prepare.json':canon({...result,status:'prepared',disposition:'candidate',candidate,unitKey:plan.unitKey,planSha256,proof:blob(canon(proof))}),
    'preparation.json':canon({page:subject.pageId,status:'prepared',runId:15,runAttempt:1,master:m,dev:m,source:dev,
      sourceTrackHead:dev,candidate,proofSha256:sha256(canon(proof)),patchSha256:sha256(patch)})}))
  const reader = gitReader(repo,mkdtempSync(join(root,'scratch-')))
  const actual = await material(c,ctx,files,reader)
  assert.equal(actual.seal.candidate,candidate)
  assert.equal(actual.seal.planSha256,planSha256)
  assert.equal(actual.seal.proofSha256,sha256(canon(proof)))
  assert.equal(c.formalValidation({op:'seal',seal:actual.seal}).status,'encoded')
  const bundleMembers = producerBundle(c,actual,files,s,Buffer.from('reviewed workflow'))
  const reportPath = 'reports/' + plan.reports[0].sha256 + '.json'
  const lockPath = 'locks/' + plan.nextEdits[0].afterBlob.sha256 + '.yaml'
  assert.deepEqual([...bundleMembers.keys()].sort(),['provenance.json','plan.json','proof.json','patch.raw',reportPath,lockPath].sort())
  const receipt = JSON.parse(bundleMembers.get('provenance.json'))
  assert.equal(receipt.seal,s)
  for (const {name,bytes,sha256:digest} of receipt.members) {
    assert.equal(bundleMembers.get(name).length,bytes)
    assert.equal(sha256(bundleMembers.get(name)),digest)
  }
  assert.deepEqual(bundleMembers.get(reportPath),canon(report))
  assert.deepEqual(bundleMembers.get(lockPath),after)
  assert.deepEqual(blob(bundleMembers.get('patch.raw')),proof.patch)
  for (const [name,wrong] of [['report.json',canon({...report,authority:{...report.authority,updateState:'unknown'}})],['candidate.commit',Buffer.concat([raw,Buffer.from('\n')])],['after.lock',before],
    ['before.lock',after],['unit-plan.json',Buffer.concat([canon(plan),Buffer.from('\n')])],
    ['prepare.json',canon({...result,status:'held'})],['lock.next.patch',Buffer.from('bad diff')]]) {
    await assert.rejects(() => material(c,ctx,new Map(files).set(name,wrong),reader))
  }
})

test('authenticate the two native signature observations against the raw Git object and formal seal',async () => {
  const {loadTypeScript} = createRequire(import.meta.url)('../../lib/load-typescript.js')
  const contract = loadTypeScript(resolve('packages/docs-tooling/src/shared-docs/adapters/updates/formal-validation.ts'))
  const formal = {kind:'shared-update-seal',schemaVersion:1,repositoryId:660446555,transactionId:'1'.repeat(64),
    unitKey:'guides:' + '3'.repeat(64),planSha256:'4'.repeat(64),proofSha256:'5'.repeat(64),master,dev,
    preparedBase:master,candidate:k,candidateTree:tree,previousSeal:null,preservedHumanHeads:[],runId:15,runAttempt:1}
  const {headline,body} = contract.formalValidation({op:'seal',seal:formal}).githubMessage
  const signature = '-----BEGIN PGP SIGNATURE-----\nfixture\n-----END PGP SIGNATURE-----'
  const headers = ['tree ' + tree,'parent ' + k,'author workflow <actions@example.com> 120 +0000',
    'committer workflow <actions@example.com> 120 +0000'].join('\n')
  const message = headline + '\n\n' + body
  const payload = headers + '\n\n' + message
  const raw = Buffer.from(headers + '\ngpgsig ' + signature.replaceAll('\n','\n ') + '\n\n' + message)
  const id = createHash('sha1').update('commit ' + raw.length + '\0').update(raw).digest('hex')
  const facts = () => ({q:{oid:id,tree:{oid:tree},parents:{totalCount:1,nodes:[{oid:k}]},author:{user:{databaseId:41898282}},
    signature:{isValid:true,state:'VALID',wasSignedByGitHub:true,signer:{databaseId:19864447},payload,signature}},
    r:{sha:id,author:{id:41898282},parents:[{sha:k}],commit:{tree:{sha:tree},verification:{verified:true,reason:'valid',payload,signature}}},raw})
  const verify = f => verifySignature({graph:async () => ({repository:{databaseId:660446555,object:f.q}}),rest:async () => f.r},
    {readSeal:() => f.raw},contract,formal,id)
  assert.equal((await verify(facts())).authorId,41898282)
  for (const tamper of [f => {f.q.signature.signer.databaseId++},f => {f.q.signature.wasSignedByGitHub = false},
    f => {f.r.commit.verification.payload += '\n'},f => {f.q.parents.totalCount++},f => {f.raw = Buffer.concat([raw,Buffer.from('\n')])}]) {
    const f = facts()
    tamper(f)
    await assert.rejects(() => verify(f))
  }
})
