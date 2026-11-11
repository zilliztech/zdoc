import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { test } from 'node:test'
import { authenticatePrepare, context, createDraft, gitReader, material } from './write.mjs'

const master = 'a'.repeat(40), dev = 'b'.repeat(40), k = 'c'.repeat(40), tree = 'd'.repeat(40), s = 'e'.repeat(40)
const targetRef = 'shared-update/' + 'a'.repeat(64), stage = 'shared-update-staging/' + 'd'.repeat(64)
const unit = {nextEdits:[{before:{current:master,next:master},target:dev}]}
const seal = {candidate:k,candidateTree:tree,master,runId:15}
const candidate = {stage,targetRef,seal,unit,prep:{dev},baseTree:'f'.repeat(40),after:'new lock',commit:{tree,parents:[master]}}
const env = {GITHUB_ACTIONS:'true',GITHUB_SERVER_URL:'https://github.com',GITHUB_API_URL:'https://api.github.com',
  GITHUB_REPOSITORY:'zilliztech/zdoc',GITHUB_REPOSITORY_ID:'660446555',GITHUB_REF:'refs/heads/master',GITHUB_SHA:master,
  GITHUB_WORKFLOW_REF:'zilliztech/zdoc/.github/workflows/shared-guides-update.yml@refs/heads/master',GITHUB_WORKFLOW_SHA:master,
  GITHUB_JOB:'write',GITHUB_RUN_ATTEMPT:'1',GITHUB_RUN_ID:'15',GITHUB_EVENT_NAME:'schedule',
  PREPARE_ARTIFACT_ID:'31',PREPARE_ARTIFACT_DIGEST:'4'.repeat(64)}

test('writer accepts only the original run on the fixed production workflow and repository',() => {
  assert.equal(context(env).master,master)
  for (const [key,value] of Object.entries({GITHUB_RUN_ATTEMPT:'2',GITHUB_EVENT_NAME:'pull_request',GITHUB_SHA:'bad',
    GITHUB_JOB:'discover',GITHUB_WORKFLOW_SHA:k,GITHUB_REF:'refs/heads/dev',GITHUB_REPOSITORY_ID:'22',
    GITHUB_WORKFLOW_REF:'zilliztech/zdoc/.github/workflows/fork.yml@refs/heads/master',PREPARE_ARTIFACT_ID:'013'}))
    assert.throws(() => context({...env,[key]:value}))
})

function prepareEvidence() {
  const bytes = Buffer.from('fixture ZIP'),digest = createHash('sha256').update(bytes).digest('hex')
  const ctx = context({...env,PREPARE_ARTIFACT_DIGEST:digest})
  const origin = {id:15,head_sha:master,head_branch:'master',repository_id:660446555,head_repository_id:660446555}
  const run = {...origin,run_attempt:1,event:'schedule',status:'in_progress',path:'.github/workflows/shared-guides-update.yml',
    repository:{id:660446555},head_repository:{id:660446555}}
  const job = {name:'prepare',run_id:15,run_attempt:1,head_sha:master,status:'completed',conclusion:'success'}
  const artifact = {id:31,name:'shared-guides-candidate-15-1',expired:false,digest:'sha256:' + digest,size_in_bytes:bytes.length,workflow_run:origin}
  const members = ['plan.json','prepare.json','preparation.json','proof.json','candidate.commit','unit-plan.json','before.lock','after.lock','lock.next.patch']
  const files = new Map(members.map(name => [name,Buffer.from(name)]))
  const responses = [run,{total_count:1,jobs:[job]},{total_count:1,artifacts:[artifact]},bytes]
  let calls = 0
  const authenticate = () => authenticatePrepare({parseStrictJson:JSON.parse,parseRemoteZip:() => files},async ({method,path}) => {
    assert.equal(method,'GET')
    const paths = ['/actions/runs/15/attempts/1','/actions/runs/15/attempts/1/jobs?per_page=100',
      '/actions/runs/15/artifacts?per_page=100','/actions/artifacts/31/zip']
    assert.equal(path,'/repos/zilliztech/zdoc' + paths[calls])
    const response = responses[calls++]
    return {status:200,body:Buffer.isBuffer(response) ? response : Buffer.from(JSON.stringify(response))}
  },ctx)
  return {run,job,artifact,files,responses,authenticate}
}

test('authenticate the prepare job and exact current-run archive, including every member and downloaded digest',async () => {
  assert.equal((await prepareEvidence().authenticate()).size,9)
  for (const tamper of [
    f => {f.run.path = '.github/workflows/other.yml'}, f => {f.job.conclusion = 'skipped'},
    f => {f.job.head_sha = k}, f => {f.run.run_attempt = 2}, f => {f.artifact.workflow_run.id = 16},
    f => {f.artifact.digest = 'sha256:' + '0'.repeat(64)}, f => {f.artifact.expired = true},
    f => {f.responses[3] = Buffer.from('wrong bytes')}, f => {f.responses[2].total_count = 2},
    f => {f.files.set('unknown.js',Buffer.from('unexpected'))}
  ]) {
    const f = prepareEvidence()
    tamper(f)
    await assert.rejects(f.authenticate)
  }
})

function scenario({stopAt,wrongK,badSeal,failAfter,brokenDraft} = {}) {
  const calls = [], checks = [], journal = [], verified = [], receipts = []
  const pr = {id:9,number:8,state:'open',draft:true,merged:false,user:{id:41898282},changed_files:1,
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
      if (path === '/pulls/8') return {...pr,changed_files:brokenDraft ? 2 : 1}
      assert.equal(method,'POST')
      if (path === '/git/trees') {
        assert.deepEqual(body,{base_tree:candidate.baseTree,tree:[{path:'shared-docs/guides/pages/json-field-overview/lock.yaml',
          mode:'100644',type:'blob',content:'new lock'}]})
        return mutation('tree',{sha:tree})
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
      return mutation('draft',pr)
    }}
  return {calls,checks,journal,verified,receipts,run:() => createDraft({candidate,api,
    form:() => ({status:'encoded',githubMessage:{headline:'seal',body:'body'}}),
    fresh:async owned => { checks.push(structuredClone(owned)); if (checks.length === stopAt) throw new Error('Existing PR or stale inputs') },
    verify:async (_,oid) => { verified.push(oid); if (badSeal) throw new Error('Wrong signature') },
    journal:item => journal.push(item),provenance:oid => receipts.push(oid),waitRef:async () => {}})}
}

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
  const plan = {kind:'shared-update-unit',schemaVersion:1,unitKey:'guides:' + sha256(canon([subject])),subjects:[subject],
    disposition:'candidate',membersSha256:'a'.repeat(64),semanticInputSha256:'b'.repeat(64),holdReasons:[],reports:[blob(before)],
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
    patch:blob(git(['diff','--raw','--no-abbrev','-z',m,candidate])),preservedHumanHeads:[],trustedToolsetSha256:'c'.repeat(64),
    executableClosure:blob(before),nextEdits:plan.nextEdits}
  const patch = git(['diff','--no-ext-diff',m,candidate]), ctx = {run:15,attempt:1,master:m}
  const result = {kind:'shared-update-local-result',schemaVersion:1,reasons:[],operations:[]}
  const files = new Map(Object.entries({'unit-plan.json':canon(plan),'proof.json':canon(proof),'before.lock':before,'after.lock':after,
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
  for (const [name,wrong] of [['candidate.commit',Buffer.concat([raw,Buffer.from('\n')])],['after.lock',before],
    ['before.lock',after],['unit-plan.json',Buffer.concat([canon(plan),Buffer.from('\n')])],
    ['prepare.json',canon({...result,status:'held'})],['lock.next.patch',Buffer.from('bad diff')]]) {
    await assert.rejects(() => material(c,ctx,new Map(files).set(name,wrong),reader))
  }
})
