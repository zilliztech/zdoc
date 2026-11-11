// Trusted create-only entry. GitHub calls use the job token only in this process.
// The downloaded candidate is inspected as Git objects, never checked out.
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'

const repo = 'zilliztech/zdoc'
const repoId = 660446555
const page = 'json-field-overview'
const lock = 'shared-docs/guides/pages/' + page + '/lock.yaml'
const workflow = '.github/workflows/shared-guides-update.yml'
const bot = 41898282
const signer = 19864447
const members = ['after.lock', 'before.lock', 'candidate.commit', 'lock.next.patch', 'plan.json', 'preparation.json', 'prepare.json', 'proof.json', 'unit-plan.json']
const oid = value => typeof value === 'string' && /^[0-9a-f]{40}$/.test(value) && value.length === 40 && !/^0+$/.test(value)
const hash = data => createHash('sha256').update(data).digest('hex')
const need = (condition, message) => { if (!condition) throw new Error(message) }
const number = value => {
  const n = Number(value)
  need(Number.isSafeInteger(n) && n > 0 && String(n) === String(value), 'Invalid numeric identity')
  return n
}

export function context(env) {
  need(env.GITHUB_ACTIONS === 'true' && env.GITHUB_SERVER_URL === 'https://github.com' &&
    env.GITHUB_API_URL === 'https://api.github.com' && env.GITHUB_REPOSITORY === repo &&
    env.GITHUB_REPOSITORY_ID === String(repoId) && env.GITHUB_REF === 'refs/heads/master' &&
    oid(env.GITHUB_SHA) && env.GITHUB_WORKFLOW_SHA === env.GITHUB_SHA &&
    env.GITHUB_WORKFLOW_REF === repo + '/' + workflow + '@refs/heads/master' &&
    env.GITHUB_JOB === 'write' && env.GITHUB_RUN_ATTEMPT === '1' &&
    ['schedule', 'workflow_dispatch'].includes(env.GITHUB_EVENT_NAME), 'Untrusted workflow context')
  const digest = env.PREPARE_ARTIFACT_DIGEST
  need(typeof digest === 'string' && /^[a-f0-9]{64}$/.test(digest) && digest.length === 64, 'Invalid prepare artifact digest')
  return { master:env.GITHUB_SHA, run:number(env.GITHUB_RUN_ID), attempt:1, event:env.GITHUB_EVENT_NAME,
    artifact:number(env.PREPARE_ARTIFACT_ID), digest }
}

export function gitReader(workspace, scratch) {
  const safe = { PATH:'/usr/bin:/bin', LC_ALL:'C', GIT_CONFIG_GLOBAL:'/dev/null', GIT_CONFIG_NOSYSTEM:'1',
    GIT_NO_REPLACE_OBJECTS:'1', GIT_NO_LAZY_FETCH:'1', GIT_TERMINAL_PROMPT:'0' }
  function git(args, extra = {}, input) {
    return execFileSync('/usr/bin/git', ['-C', workspace, '-c', 'core.hooksPath=/dev/null', ...args],
      {env:{...safe, ...extra}, input, maxBuffer:2 * 1024 * 1024, timeout:180000})
  }
  const path = name => git(['rev-parse', '--path-format=absolute', '--git-path', name]).toString().trim()
  const objects = join(scratch, 'objects')
  mkdirSync(objects)
  const isolated = {GIT_OBJECT_DIRECTORY:objects, GIT_ALTERNATE_OBJECT_DIRECTORIES:path('objects'), GIT_INDEX_FILE:join(scratch, 'index')}
  const read = (extra, id, type) => {
    need(oid(id) && ['blob','tree','commit'].includes(type) &&
      git(['cat-file','-t',id], extra).toString().trim() === type, 'Invalid Git object or type')
    return git(['cat-file',type,id], extra)
  }
  return {
    head:git(['rev-parse','HEAD']).toString().trim(),
    baseFile:(m, name) => git(['show', m + ':' + name]),
    baseline:{read:(id,type) => read({},id,type), verifyConnected:async ids => {
      need(ids.every(oid) && git(['rev-parse','--is-shallow-repository']).toString().trim() === 'false' &&
        !existsSync(path('objects/info/alternates')) && !existsSync(path('info/grafts')) &&
        !readdirSync(path('objects/pack')).some(n => n.endsWith('.promisor')) &&
        !git(['for-each-ref','refs/replace']).length, 'Incomplete Git baseline')
      git(['fsck','--connectivity-only','--no-dangling',...ids])
    }},
    source:{read:(id,type) => read(isolated,id,type)},
    reconstruct(master, candidate, tree, after, commit) {
      need([master,candidate,tree].every(oid), 'Invalid candidate identity')
      git(['read-tree',master], isolated)
      const blob = git(['hash-object','-w','--stdin'],isolated,after).toString().trim()
      git(['update-index','--cacheinfo','100644,' + blob + ',' + lock],isolated)
      need(git(['write-tree'],isolated).toString().trim() === tree &&
        git(['hash-object','-w','-t','commit','--stdin'],isolated,commit).toString().trim() === candidate, 'Candidate tree or OID changed')
    },
    patch:(m,k,abbrev) => git(['diff','--no-ext-diff','--no-textconv','--no-color','--abbrev=' + abbrev,m,k],isolated),
    readSeal(s) {
      need(oid(s), 'Invalid seal OID')
      git(['-c','fetch.writeCommitGraph=false','fetch','--no-tags','--no-write-fetch-head','--no-auto-maintenance',
        'https://github.com/' + repo + '.git',s],isolated)
      return read(isolated,s,'commit')
    }
  }
}

export async function authenticatePrepare(contract, transport, ctx) {
  async function get(suffix, max = 2 * 1024 * 1024, zip = false) {
    const result = await transport({method:'GET',path:'/repos/' + repo + suffix,maximum:max,signal:AbortSignal.timeout(30000)})
    need(result.status === 200, 'Prepare evidence unavailable')
    return zip ? Buffer.from(result.body) : contract.parseStrictJson(result.body)
  }
  const [run, inventory, artifacts] = await Promise.all([
    get('/actions/runs/' + ctx.run + '/attempts/1'),
    get('/actions/runs/' + ctx.run + '/attempts/1/jobs?per_page=100'),
    get('/actions/runs/' + ctx.run + '/artifacts?per_page=100')
  ])
  need(run.id === ctx.run && run.run_attempt === 1 && run.head_sha === ctx.master && run.head_branch === 'master' &&
    run.event === ctx.event && run.status === 'in_progress' && run.path === workflow &&
    run.repository.id === repoId && run.head_repository.id === repoId, 'Prepare execution origin changed')
  need(inventory.total_count === inventory.jobs.length && inventory.total_count <= 100, 'Incomplete job inventory')
  const jobs = inventory.jobs.filter(j => j.name === 'prepare')
  need(jobs.length === 1 && jobs[0].run_id === ctx.run && jobs[0].run_attempt === 1 &&
    jobs[0].head_sha === ctx.master && jobs[0].status === 'completed' && jobs[0].conclusion === 'success', 'Prepare job not authenticated')
  need(artifacts.total_count === artifacts.artifacts.length && artifacts.total_count <= 100, 'Incomplete artifact inventory')
  const matches = artifacts.artifacts.filter(a => a.name === 'shared-guides-candidate-' + ctx.run + '-1')
  need(matches.length === 1, 'Missing or ambiguous candidate artifact')
  const a = matches[0], origin = a.workflow_run
  need(a.id === ctx.artifact && a.expired === false && a.digest === 'sha256:' + ctx.digest &&
    Number.isSafeInteger(a.size_in_bytes) && a.size_in_bytes > 0 && a.size_in_bytes <= 2 * 1024 * 1024 &&
    origin.id === ctx.run && origin.head_sha === ctx.master && origin.head_branch === 'master' &&
    origin.repository_id === repoId && origin.head_repository_id === repoId, 'Artifact binding changed')
  const bytes = await get('/actions/artifacts/' + a.id + '/zip',a.size_in_bytes,true)
  need(bytes.length === a.size_in_bytes && hash(bytes) === ctx.digest, 'Downloaded artifact digest changed')
  const files = contract.parseRemoteZip(bytes)
  need([...files.keys()].sort().join(',') === members.join(','), 'Unexpected prepare archive membership')
  return new Map([...files].map(([key, value]) => [key,Buffer.from(value)]))
}

export async function material(contract, ctx, files, git) {
  const json = name => contract.parseStrictJson(files.get(name))
  const prep = json('preparation.json'), unit = json('unit-plan.json'), proof = json('proof.json')
  const planned = json('plan.json'), result = json('prepare.json'), raw = files.get('candidate.commit')
  const planBytes = files.get('unit-plan.json'), proofBytes = files.get('proof.json'), patch = files.get('lock.next.patch')
  const planHash = contract.digest('plan',unit), proofHash = hash(proofBytes)
  need(prep.runId === ctx.run && prep.runAttempt === ctx.attempt && prep.page === page &&
    prep.status === 'prepared' && prep.master === ctx.master && [prep.dev,prep.source,prep.sourceTrackHead].every(oid) &&
    [planned,result].every(r => r.kind === 'shared-update-local-result' && r.schemaVersion === 1 &&
      Array.isArray(r.operations) && r.operations.length === 0 && Array.isArray(r.reasons) && r.reasons.length === 0) &&
    planned.status === 'planned' && result.status === 'prepared' && result.disposition === 'candidate' &&
    result.proof?.sha256 === proofHash && result.proof.path === 'blobs/' + proofHash && result.proof.bytes === proofBytes.length &&
    result.candidate === proof.candidate &&
    result.planSha256 === planHash && result.unitKey === unit.unitKey && prep.candidate === proof.candidate &&
    prep.proofSha256 === proofHash && prep.patchSha256 === hash(patch) &&
    planBytes.equals(contract.canonicalBytes(unit)) && proofBytes.equals(contract.canonicalBytes(proof)), 'Prepare result or proof binding changed')
  need(unit.subjects.length === 1 && unit.subjects[0].kind === 'guides-page' && unit.subjects[0].group === 'guides' &&
    unit.subjects[0].pageId === page && unit.nextEdits.length === 1 && unit.nextEdits[0].before.path === lock &&
    unit.nextEdits[0].target === prep.source && git.baseFile(ctx.master,lock).equals(files.get('before.lock')), 'Candidate subject changed')
  git.reconstruct(ctx.master,proof.candidate,proof.candidateTree,files.get('after.lock'),raw)
  const abbrev = /^index ([a-f0-9]{4,40})\.\.[a-f0-9]{4,40} 100644$/m.exec(patch.toString())
  need(abbrev && git.patch(ctx.master,proof.candidate,abbrev[1].length).equals(patch), 'Full candidate patch differs')
  const delta = await contract.planNewGuidesObjectTransfer({master:ctx.master,dev:prep.dev,plan:unit,proof,
    source:git.source,baseline:git.baseline})
  const targetRef = 'shared-update/' + hash(contract.canonicalBytes({kind:'remote-unit',unitKey:unit.unitKey}))
  const binding = {repositoryId:repoId,repositoryFullName:repo,master:ctx.master,dev:prep.dev,unitKey:unit.unitKey,
    planSha256:planHash,proofSha256:proofHash,preparedBase:ctx.master,candidate:proof.candidate,candidateTree:proof.candidateTree,
    previousSeal:null,preservedHumanHeads:[],targetRef,expectedHead:null,pulls:[],producerRunId:ctx.run,producerRunAttempt:1,
    producerRequestId:page + '/produce/' + ctx.run + '/1',requestId:page + '/validate/' + ctx.run + '/1'}
  const transactionId = hash(contract.canonicalBytes({kind:'remote-transaction',...binding}))
  const seal = {kind:'shared-update-seal',schemaVersion:1,repositoryId:repoId,transactionId,unitKey:unit.unitKey,
    planSha256:planHash,proofSha256:proofHash,master:ctx.master,dev:prep.dev,preparedBase:ctx.master,candidate:proof.candidate,
    candidateTree:proof.candidateTree,previousSeal:null,preservedHumanHeads:[],runId:ctx.run,runAttempt:1}
  const clock = /^committer Shared update local <shared-update-local@localhost> (\d+) \+0000$/m.exec(raw.toString())
  need(clock, 'Unrepresentable deterministic candidate')
  const actor = {name:'Shared update local',email:'shared-update-local@localhost',
    date:new Date(Number(clock[1]) * 1000).toISOString().replace('.000Z','+00:00')}
  return {prep,unit,proof,seal,binding,targetRef,stage:'shared-update-staging/' + transactionId,
    baseTree:delta.baseTree,after:files.get('after.lock').toString('utf8'),
    commit:{tree:proof.candidateTree,parents:[ctx.master],author:actor,committer:actor,message:raw.subarray(raw.indexOf('\n\n') + 2).toString()}}
}

const signMutation = 'mutation Sign($input:CreateCommitOnBranchInput!){createCommitOnBranch(input:$input){commit{oid}}}'
const signatureQuery = 'query Signature($oid:GitObjectID!){repository(owner:"zilliztech",name:"zdoc"){databaseId object(oid:$oid){... on Commit{oid tree{oid} parents(first:2){totalCount nodes{oid}} author{user{databaseId}} signature{isValid state wasSignedByGitHub signer{databaseId} payload signature}}}}}'

function apiClient(token) {
  async function call(path, method = 'GET', data, expected = 200) {
    const res = await fetch('https://api.github.com' + path,{method,redirect:'error',signal:AbortSignal.timeout(30000),
      headers:{Accept:'application/vnd.github+json',Authorization:'Bearer ' + token,'X-GitHub-Api-Version':'2022-11-28',
        'Content-Type':'application/json'},...(data === undefined ? {} : {body:JSON.stringify(data)})})
    if (res.status === 404 && expected === 'optional') return null
    need(res.status === (expected === 'optional' ? 200 : expected), method + ' ' + path + ' returned ' + res.status)
    const chunks = []
    let bytes = 0
    for await (const chunk of res.body) {
      bytes += chunk.length
      need(bytes <= 2 * 1024 * 1024, 'GitHub response exceeds limit')
      chunks.push(chunk)
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  }
  const rest = (path,...args) => call('/repos/' + repo + path,...args)
  const graph = async (query,variables = {}) => {
    const body = await call('/graphql','POST',{query,variables})
    need(!body.errors && body.data, 'Unexpected GraphQL result')
    return body.data
  }
  return {rest, graph}
}

// Reads may await visibility of an acknowledged mutation. Mutations are never retried.
async function awaitRef(api, branch, exact, previous) {
  for (const wait of [0,1000,2000,4000,8000,12000]) {
    if (wait) await delay(wait)
    const ref = await api.rest('/git/ref/heads/' + branch,'GET',undefined,'optional')
    if (ref === null) continue
    need(ref.ref === 'refs/heads/' + branch && ref.object.type === 'commit', 'Invalid ref readback')
    if (ref.object.sha === exact) return
    need(previous && ref.object.sha === previous, 'Concurrent ref movement')
  }
  throw new Error('Acknowledged ref did not converge')
}

async function verifySignature(api, git, contract, seal, s) {
  const [gql, rest] = await Promise.all([api.graph(signatureQuery,{oid:s}),api.rest('/commits/' + s)])
  const q = gql.repository.object, g = q.signature, r = rest.commit.verification
  need(gql.repository.databaseId === repoId && rest.sha === s && q.oid === s && rest.author.id === q.author.user.databaseId &&
    q.tree.oid === seal.candidateTree && rest.commit.tree.sha === q.tree.oid &&
    q.parents.totalCount === 1 && q.parents.nodes.length === 1 && rest.parents.length === 1 &&
    rest.parents[0].sha === seal.candidate && q.parents.nodes[0].oid === seal.candidate &&
    r.verified === true && r.reason === 'valid' && r.payload === g.payload && r.signature === g.signature, 'GitHub seal sources disagree')
  const signature = {oid:s,tree:q.tree.oid,parents:[q.parents.nodes[0].oid],signatureValid:g.isValid,signatureState:g.state,
    wasSignedByGitHub:g.wasSignedByGitHub,authorActorId:rest.author.id,signerActorId:g.signer.databaseId,payload:g.payload,signature:g.signature}
  const raw = git.readSeal(s)
  const verified = contract.formalValidation({op:'verify-seal',seal,signature,expectedOid:s,rawCommitBase64:raw.toString('base64'),
    identity:{writerActorId:bot,platformSignerActorId:signer}})
  need(verified.status === 'verified' && verified.oid === s, 'Formal seal rejected')
  return {rawSha256:hash(raw),signatureSha256:hash(signature.signature),authorId:signature.authorActorId,signerId:signature.signerActorId}
}

export async function createDraft({api, candidate, fresh, form, verify, journal, provenance, waitRef = awaitRef}) {
  const {seal, prep, unit, targetRef, stage, commit} = candidate
  const owned = {}
  const stageRef = sha => ({ref:stage,sha})
  const viewer = (await api.graph('query{viewer{databaseId login}}')).viewer
  need(viewer.databaseId === bot && viewer.login === 'github-actions[bot]', 'Wrong job token identity')
  async function mutate(name, operation) {
    await fresh(owned)
    journal({operation:name,state:'requested',stage,targetRef})
    const response = await operation()
    journal({operation:name,state:'acknowledged',responseDigest:hash(JSON.stringify(response))})
    return response
  }
  // base_tree inherits all existing objects. Supplying the one fixed path materializes
  // precisely the verified changed blob and directory spine without traversing history.
  const tree = await mutate('create-tree',() => api.rest('/git/trees','POST',{base_tree:candidate.baseTree,
    tree:[{path:lock,mode:'100644',type:'blob',content:candidate.after}]},201))
  need(tree.sha === seal.candidateTree, 'GitHub created another tree')
  const k = await mutate('create-candidate',() => api.rest('/git/commits','POST',commit,201))
  need(k.sha === seal.candidate && k.tree.sha === tree.sha && k.parents.length === 1 &&
    k.parents[0].sha === seal.master, 'GitHub created another candidate')
  async function createRef(branch, sha) {
    const ref = 'refs/heads/' + branch
    const response = await mutate('create-' + (branch === stage ? 'staging' : 'target'),
      () => api.rest('/git/refs','POST',{ref,sha},201))
    need(response.ref === ref && response.object.type === 'commit' && response.object.sha === sha, 'Unexpected new ref')
    await waitRef(api,branch,sha)
  }
  await createRef(stage,k.sha)
  owned.ownedStage = stageRef(k.sha)
  const message = form({op:'seal',seal})
  need(message.status === 'encoded', 'Seal encoding failed')
  const result = await mutate('sign',() => api.graph(signMutation,{input:{branch:{repositoryNameWithOwner:repo,branchName:stage},
    expectedHeadOid:k.sha,message:message.githubMessage,fileChanges:{additions:[],deletions:[]}}}))
  const s = result.createCommitOnBranch.commit.oid
  need(oid(s) && s !== k.sha, 'Unexpected signed commit identity')
  await waitRef(api,stage,s,k.sha)
  owned.ownedStage = stageRef(s)
  const signed = await verify(seal,s)
  provenance(s)
  await createRef(targetRef,s)
  owned.ownedHead = {ref:targetRef,sha:s}
  const edit = unit.nextEdits[0]
  const created = await mutate('open-draft',() => api.rest('/pulls','POST',{
    head:targetRef,base:'master',draft:true,title:'Update the json-field-overview next lock',
    body:'Advance the Milvus source used by the next channel of the JSON Field Overview guide.\n\n' +
      'Current stays at `' + edit.before.current + '`. Next advances from `' + edit.before.next + '` to `' + edit.target + '`.\n\n' +
      'Prepared from master `' + seal.master + '` and dev `' + prep.dev + '`. Signed head `' + s + '`. ' +
      '[Preparation and writer evidence](https://github.com/' + repo + '/actions/runs/' + seal.runId + ').'
  },201))
  const prNumber = number(created.number)
  const pr = await api.rest('/pulls/' + prNumber)
  need(pr.id === created.id && pr.number === prNumber && pr.state === 'open' && pr.draft === true && pr.merged === false &&
    pr.user.id === bot && pr.changed_files === 1 && pr.base.repo.id === repoId && pr.head.repo.id === repoId &&
    pr.base.ref === 'master' && pr.base.sha === seal.master && pr.head.ref === targetRef && pr.head.sha === s,
    'Draft PR readback differs')
  await fresh({...owned,ownedPull:{number:prNumber,...owned.ownedHead}})
  return {status:'created',repository:repo,prNumber,url:'https://github.com/' + repo + '/pull/' + prNumber,master:seal.master,
    dev:prep.dev,target:edit.target,candidate:k.sha,seal:s,...signed,stage,targetRef}
}

async function main() {
  need(process.argv.length === 2, 'Writer accepts no command-line arguments')
  const ctx = context(process.env)
  const token = process.env.GH_TOKEN, workspace = process.env.GITHUB_WORKSPACE, temp = process.env.RUNNER_TEMP
  const dest = process.env.WRITER_OUTPUT
  need(token && workspace === process.cwd() && resolve(temp) === temp && dest === join(temp,'shared-guides-writer'), 'Invalid job paths or token')
  mkdirSync(dest,{mode:0o700})
  const journal = entry => appendFileSync(join(dest,'journal.ndjson'),JSON.stringify({run:ctx.run,attempt:ctx.attempt,
    master:ctx.master,artifactId:ctx.artifact,archiveSha256:ctx.digest,...entry}) + '\n',{mode:0o600})
  const write = (name,bytes) => writeFileSync(join(dest,name),bytes,{flag:'wx',mode:0o600})
  journal({state:'started'})
  try {
    const contract = await import(pathToFileURL(join(temp,'writer-contract.mjs')))
    const {discover} = await import('./discover.mjs')
    const git = gitReader(workspace,mkdtempSync(join(temp,'shared-guides-objects-')))
    need(git.head === ctx.master, 'Writer checkout differs from workflow head')
    const files = await authenticatePrepare(contract,contract.createRemoteTransport({repositoryFullName:repo,token}),ctx)
    const candidate = await material(contract,ctx,files,git)
    const {prep,unit,seal,binding} = candidate, edit = unit.nextEdits[0]
    const fresh = async owned => {
      execFileSync('/usr/bin/python3',['-B','scripts/docs-workflow/shared-guides-update/prepare.py','verify-fetch'],
        {input:files.get('preparation.json'),timeout:180000,maxBuffer:1024*1024,env:{PATH:'/usr/bin:/bin',GH_TOKEN:token}})
      const live = await discover({token,...owned})
      need(live.status === 'candidate' && live.master === ctx.master && live.dev === prep.dev &&
        live.page === page && live.sourceHead === prep.sourceTrackHead && live.sourceTarget === prep.source &&
        live.current === edit.before.current && live.next === edit.before.next, 'Changed writer inputs: ' + live.reasons.join(','))
    }
    const api = apiClient(token)
    const provenance = s => {
      const {kind, schemaVersion, ...fields} = seal
      const plan = files.get('unit-plan.json'), proof = files.get('proof.json')
      const encoded = contract.formalValidation({op:'producer',producer:{...fields,kind:'shared-update-producer',schemaVersion,
        seal:s,requestId:binding.producerRequestId,tools:ctx.master,workflowDefinitionSha256:hash(git.baseFile(ctx.master,workflow)),
        members:[{name:'plan.json',sha256:hash(plan),bytes:plan.length},{name:'proof.json',sha256:hash(proof),bytes:proof.length}]}})
      need(encoded.status === 'encoded', 'Cannot retain seal provenance')
      write('plan.json',plan)
      write('proof.json',proof)
      write('provenance.json',Buffer.from(encoded.bytesBase64,'base64'))
    }
    const draft = await createDraft({api,candidate,fresh,form:contract.formalValidation,
      verify:(seal,s) => verifySignature(api,git,contract,seal,s),journal,provenance})
    write('draft.json',contract.canonicalBytes({...draft,artifactId:ctx.artifact,archiveSha256:ctx.digest}))
    journal({state:'created',prNumber:draft.prNumber,seal:draft.seal})
    console.log('Created draft ' + draft.url)
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY,'Created [Draft PR #' + draft.prNumber + '](' + draft.url + ') at `' + draft.seal + '`.\n')
  } catch (error) {
    journal({state:'stopped'})
    throw error
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
