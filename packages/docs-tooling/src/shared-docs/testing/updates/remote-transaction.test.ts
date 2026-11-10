// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { mkdtemp, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer, request } from 'node:http'
import { afterEach, expect, it, vi } from 'vitest'
import { canonicalBytes, digest } from '../../core/updates/canonical'
import { encodeRevisionMessage } from '../../core/updates/metadata'
import { guidesUnitKey, type BotRevision, type CandidateSnapshotProof, type UpdateReportEnvelope, type UpdateUnitPlan } from '../../core/updates/envelope'
import { encodeSealMessage, RemoteTransactionIntentSchema, type RemotePolicy, type RemoteSealV1 } from '../../core/updates/remote'
import { createRemoteTransaction, createRemoteTransactionFixture } from '../../adapters/updates/remote-transaction'
import { inspectRemoteHistory } from '../../adapters/updates/remote-metadata'
import { createRemoteReads, REMOTE_REF_CAS, REMOTE_SEAL_APPEND, type RemoteTransport } from '../../adapters/updates/remote-github'
import { initializeEvidence, rawSha256 } from '../../adapters/updates/evidence'
// Real bare Git, owned evidence fsyncs and multiple HTTP readbacks share workers in the light gate.
// Bound each new integration scenario explicitly; the multi-position fault matrix keeps its 120s bound.
const integrationTimeout=30_000
const roots:string[]=[],cleanup:(()=>Promise<void>)[]=[]
afterEach(async()=>{for(const close of cleanup.splice(0))await close();for(const root of roots.splice(0))await rm(root,{recursive:true,force:true})})
const workflow=Buffer.from('trusted fixture-only isolated workflow\n')
const h='a'.repeat(64),source='a'.repeat(40),target='b'.repeat(40),identity='Shared update local <shared-update-local@localhost>'
const policy:RemotePolicy={host:'github.com',repositoryId:100,repositoryFullName:'example/zdoc',baseRef:'master',writerActorId:27,sealIdentity:{scheme:'github-app-author-v1',platformSignerActorId:99},allowedHeadPrefixes:['shared-update/'],checkAppId:9,checkName:'exact',producerArtifactName:'producer',validatorArtifactName:'validation',producer:{actorId:7,workflowId:8,workflowPath:'.github/workflows/producer.yml',workflowDefinitionSha256:rawSha256(workflow),event:'workflow_dispatch'},validator:{actorId:17,workflowId:18,workflowPath:'.github/workflows/validate.yml',workflowDefinitionSha256:rawSha256(workflow),event:'workflow_dispatch'}}
function zip(files:Map<string,Uint8Array>) {
  const chunks:Buffer[]=[],entries:Buffer[]=[];let offset=0
  for(const [name,data] of files){const bytes=Buffer.from(data),nameBytes=Buffer.from(name);let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}crc=(crc^0xffffffff)>>>0
    const local=Buffer.alloc(30),central=Buffer.alloc(46);local.writeUInt32LE(0x04034b50);local.writeUInt32LE(crc,14);local.writeUInt32LE(bytes.length,18);local.writeUInt32LE(bytes.length,22);local.writeUInt16LE(nameBytes.length,26)
    central.writeUInt32LE(0x02014b50);central.writeUInt32LE(crc,16);central.writeUInt32LE(bytes.length,20);central.writeUInt32LE(bytes.length,24);central.writeUInt16LE(nameBytes.length,28);central.writeUInt32LE(offset,42);chunks.push(local,nameBytes,bytes);entries.push(central,nameBytes);offset+=30+nameBytes.length+bytes.length}
  const directory=Buffer.concat(entries),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.size,8);end.writeUInt16LE(files.size,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...chunks,directory,end])
}
async function fixture() {
  const root=await mkdtemp(join(await realpath(tmpdir()),'rt-'));roots.push(root)
  const env={PATH:'/usr/bin:/bin',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null',GIT_NO_REPLACE_OBJECTS:'1',GIT_NO_LAZY_FETCH:'1'}
  const makeGit=(name:string)=>{const path=join(root,name);execFileSync('/usr/bin/git',['init','--bare','--quiet',path],{env});return (args:string[],input?:Uint8Array)=>execFileSync('/usr/bin/git',['--no-replace-objects','-C',path,...args],{input,env,stdio:['pipe','pipe','pipe']})}
  const git=makeGit('scratch.git'),remote=makeGit('remote.git')
  const object=(type:string,bytes:Uint8Array,run=git)=>run(['hash-object','--literally','-w','-t',type,'--stdin'],bytes).toString().trim()
  const tree=(blob:string,run=git)=>{let oid=object('tree',Buffer.concat([Buffer.from('100644 lock.yaml\0'),Buffer.from(blob,'hex')]),run);for(const name of ['alpha','pages','guides','shared-docs'])oid=object('tree',Buffer.concat([Buffer.from('40000 '+name+'\0'),Buffer.from(oid,'hex')]),run);return oid}
  const rawCommit=(tree:string,parents:string[],message:string)=>Buffer.from(`tree ${tree}\n${parents.map(parent=>'parent '+parent+'\n').join('')}author ${identity} 1 +0000\ncommitter ${identity} 1 +0000\n\n${message}`)
  const before=Buffer.from(`schema_version: 1\ncurrent: ${source}\nnext: ${source}\n`),after=Buffer.from(before.toString().replace('next: '+source,'next: '+target))
  const masterTree=tree(object('blob',before)),master=object('commit',rawCommit(masterTree,[],'master\n'))
  const candidateTree=tree(object('blob',after))
  remote(['index-pack','--stdin'],git(['pack-objects','--stdout','--revs'],Buffer.from(master+'\n')))
  remote(['update-ref','refs/heads/master',master]);remote(['update-ref','refs/heads/dev',master])
  const evidence=await initializeEvidence({root:join(root,'evidence'),repositories:[],owner:'fixture'})
  const beforeRef=await evidence.writeBlob(before),afterRef=await evidence.writeBlob(after),empty=await evidence.writeBlob(Buffer.alloc(0)),subject={kind:'guides-page' as const,group:'guides' as const,pageId:'alpha'}
  const plan={kind:'shared-update-unit',schemaVersion:1,unitKey:guidesUnitKey([subject]),subjects:[subject],membersSha256:h,reports:[empty],nextEdits:[{subject,before:{path:'shared-docs/guides/pages/alpha/lock.yaml',sha256:beforeRef.sha256,current:source,next:source},target,afterBlob:afterRef}],disposition:'candidate',holdReasons:[],semanticInputSha256:h}
  const revision={kind:'shared-update-revision' as const,schemaVersion:1 as const,unitKey:plan.unitKey,subjects:[subject],parentHead:master,master,dev:master,tools:master,memberSetSha256:plan.membersSha256,planSha256:digest('plan',plan),previousBotCommit:null,lockDeltas:[{path:plan.nextEdits[0].before.path,current:source,oldNext:source,next:target}],preservedHumanHeads:[]}
  const candidate=object('commit',Buffer.from(rawCommit(candidateTree,[master],encodeRevisionMessage(revision).commitMessage).toString().replaceAll(' 1 +0000',' 2 +0000')))
  const proof={prepared:{kind:'new',master,base:master,tree:masterTree},candidate,candidateTree,patch:empty,preservedHumanHeads:[],trustedToolsetSha256:h,executableClosure:empty,nextEdits:plan.nextEdits}
  const planRef=await evidence.writeBlob(canonicalBytes(plan)),proofRef=await evidence.writeBlob(canonicalBytes(proof))
  const intent=RemoteTransactionIntentSchema.parse({kind:'shared-update-remote-intent',schemaVersion:1,repositoryId:100,repositoryFullName:'example/zdoc',master,dev:master,transactionId:h,unitKey:plan.unitKey,planSha256:digest('plan',plan),proofSha256:proofRef.sha256,plan:planRef,proof:proofRef,preparedBase:master,candidate,candidateTree,previousSeal:null,preservedHumanHeads:[],targetRef:'shared-update/unit',expectedHead:null,stagingRef:'shared-update-staging/'+h,pulls:[],producerRunId:30,producerRunAttempt:1,producerRequestId:'producer-30',requestId:'validate-30'})
  const pulls:any[]=[],writes:{action:string;body:any}[]=[];let fault:{at:number;mode:string}|undefined,seal:string|undefined,failReads=false,moveBase=false,manualPush=false,installed=false,dispatched=false,validationMode='valid',pullScans=0,appearAt=0
  const absent=[empty]
  const readObject=async(oid:string,type:'commit'|'tree'|'blob')=>{if(failReads)return {kind:'unknown' as const,reasons:['READ_FAILED']};try{return {kind:'found' as const,value:remote(['cat-file',type,oid])}}catch{return {kind:'absent' as const,evidence:absent}}}
  const ref=(name:string)=>{try{return remote(['rev-parse','--verify','refs/heads/'+name]).toString().trim()}catch{return null}}
  const fact=(oid:string)=>{const raw=remote(['cat-file','commit',oid]).toString(),[headers,...message]=raw.split('\n\n'),lines=headers.split('\n'),sigAt=lines.findIndex(line=>line.startsWith('gpgsig ')),parents=lines.filter(line=>line.startsWith('parent ')).map(line=>({sha:line.slice(7)}));let end=sigAt+1;while(lines[end]?.startsWith(' '))end++
    const signature=sigAt<0?null:[lines[sigAt].slice(7),...lines.slice(sigAt+1,end).map(line=>line.slice(1))].join('\n')+'\n',payload=sigAt<0?null:[...lines.slice(0,sigAt),...lines.slice(end)].join('\n')+'\n\n'+message.join('\n\n')
    return {sha:oid,author:{id:27},committer:{id:99},parents,commit:{tree:{sha:lines[0].slice(5)},verification:{verified:true,reason:'valid',payload,signature}},payload,signature}}
  const runRecord=(id:number)=>({id,run_attempt:1,repository:{id:100},head_repository:{id:100},head_sha:master,actor:{id:id===30?7:17},event:'workflow_dispatch',workflow_id:id===30?8:18,path:id===30?policy.producer.workflowPath:policy.validator.workflowPath,status:'completed',conclusion:'success',check_suite_id:50,display_title:`Shared update exact ${intent.requestId}`})
  const artifacts=()=>{
    const metadata={repositoryId:100,transactionId:intent.transactionId,unitKey:intent.unitKey,planSha256:intent.planSha256,proofSha256:intent.proofSha256,master,dev:master,preparedBase:intent.preparedBase,candidate:intent.candidate,candidateTree:intent.candidateTree,previousSeal:intent.previousSeal,preservedHumanHeads:intent.preservedHumanHeads,runId:30,runAttempt:1}
    const producerMembers=new Map<string,Uint8Array>([['plan.json',canonicalBytes(plan)],['proof.json',canonicalBytes(proof)]])
    const provenance={kind:'shared-update-producer',schemaVersion:1,...metadata,seal,requestId:intent.producerRequestId,tools:master,workflowDefinitionSha256:policy.producer.workflowDefinitionSha256,members:[...producerMembers].map(([name,bytes])=>({name,sha256:rawSha256(bytes),bytes:bytes.length}))};producerMembers.set('provenance.json',canonicalBytes(provenance))
    const output=canonicalBytes({result:'fixture-only exact validation'}),receipt={kind:'shared-update-exact-validation',schemaVersion:1,repositoryId:100,prNumber:20,head:seal,master,dev:master,tools:master,unitKey:intent.unitKey,planSha256:intent.planSha256,seal,requestId:validationMode==='old-green'?'old-request':intent.requestId,runId:31,runAttempt:1,workflowPath:policy.validator.workflowPath,workflowDefinitionSha256:policy.validator.workflowDefinitionSha256,targetCheckId:41,targetSuiteId:51,targetCheckAppId:9,targetCheckHead:seal,outputDigest:rawSha256(output),conclusion:'success'}
    return [{id:61,runId:30,name:'producer',archive:zip(producerMembers)},{id:62,runId:31,name:'validation',archive:zip(new Map([['receipt.json',canonicalBytes(receipt)],['output.json',output]]))}]
  }
  const artifactMetadata=(item:ReturnType<typeof artifacts>[number])=>({id:item.id,name:item.name,expired:false,size_in_bytes:item.archive.length,digest:'sha256:'+rawSha256(item.archive),workflow_run:{id:item.runId,repository_id:100,head_repository_id:100,head_sha:master,head_branch:'master'}})
  const server=createServer(async(req,res)=>{
    const chunks:Buffer[]=[];for await(const chunk of req)chunks.push(Buffer.from(chunk));const body=chunks.length?JSON.parse(Buffer.concat(chunks).toString()):undefined
    const path=req.url!.split('?')[0].replace('/repos/example/zdoc','');let status=200,value:any
    const isWrite=req.method==='POST'&&!(path==='/graphql'&&String(body.query).startsWith('query '))
    if(!isWrite&&failReads){res.writeHead(500);res.end('{}');return}
    if(isWrite){const action=path==='/graphql'?body.query===REMOTE_REF_CAS?'cas':'seal':path.endsWith('/pulls')?'draft':path.split('/').pop()!;writes.push({action,body})
      const current=fault?.at===writes.length?fault:undefined
      if(current?.mode==='before'){res.writeHead(500);res.end('{"message":"private-token-secret"}');return}
      try {
        if(action==='blobs'){value={sha:object('blob',Buffer.from(body.content,'base64'),remote)};status=201}
        else if(action==='trees'){value={sha:object('tree',Buffer.concat(body.tree.map((entry:any)=>Buffer.concat([Buffer.from((entry.mode==='040000'?'40000':entry.mode)+' '+entry.path+'\0'),Buffer.from(entry.sha,'hex')]))),remote)};status=201}
        else if(action==='commits'){const person=(p:any)=>`${p.name} <${p.email}> ${Date.parse(p.date)/1000} ${p.date.slice(-6).replace(':','')}`,raw=Buffer.from(`tree ${body.tree}\n${body.parents.map((p:string)=>'parent '+p+'\n').join('')}author ${person(body.author)}\ncommitter ${person(body.committer)}\n\n${body.message}`);value={sha:object('commit',raw,remote)};status=201}
        else if(action==='cas'){const update=body.variables.input.refUpdates[0],name=update.name.slice(11);if(manualPush&&name===intent.targetRef){const human=object('commit',rawCommit(masterTree,[master],'human\n'),remote);remote(['update-ref',update.name,human]);manualPush=false}
          try{remote(['update-ref',update.name,update.afterOid,update.beforeOid])}catch{res.writeHead(500);res.end('{"errors":[{"message":"CAS"}]}');return}value={data:{updateRefs:{clientMutationId:body.variables.input.clientMutationId}}}
          if(moveBase&&name===intent.targetRef){const next=object('commit',rawCommit(masterTree,[master],'moved master\n'),remote);remote(['update-ref','refs/heads/master',next])}}
        else if(action==='seal'){const input=body.variables.input,payload=rawCommit(candidateTree,[candidate],input.message.headline+'\n\n'+input.message.body),signature='-----BEGIN PGP SIGNATURE-----\nfixture\n-----END PGP SIGNATURE-----',raw=Buffer.from(payload.toString().replace('\n\n','\ngpgsig '+signature.split('\n').join('\n ')+'\n\n'));seal=object('commit',raw,remote);remote(['update-ref','refs/heads/'+intent.stagingRef,seal,candidate]);value={data:{createCommitOnBranch:{commit:{oid:seal}}}}}
        else if(action==='draft'){const pull={number:20,id:20,created_at:'2026-01-01T00:00:00Z',base:{repo:{id:100},ref:'master',sha:master},head:{repo:{id:100},ref:intent.targetRef,sha:ref(intent.targetRef)},user:{id:27},state:'open',merged_at:null,draft:true};pulls.push(pull);value=pull;status=201}
        else if(action==='dispatches'){dispatched=true;status=204;value=null}
        else throw Error('Unexpected mutation')
      }catch{status=500;value={errors:[{message:'fixture error'}]}}
      if(current?.mode==='after'){status=500;value={errors:[{message:'private-token-secret'}]}}
      if(current?.mode==='lost'){req.socket.destroy();return}
      if(current?.mode==='incomplete'&&action==='dispatches'){req.socket.write('HTTP/1.1 204 No Content\r\nX-Fixture-Incomplete: ');req.socket.destroy();return}
      if(current?.mode==='incomplete'){value=action==='cas'?{data:{updateRefs:null}}:{}}
      if(current?.mode==='read-fails')failReads=true
    } else if(path.startsWith('/actions/workflows/18/runs'))value={total_count:dispatched&&validationMode!=='missing'?validationMode==='ambiguous'?2:1:0,workflow_runs:dispatched&&validationMode!=='missing'?validationMode==='ambiguous'?[runRecord(31),{...runRecord(32)}]:[runRecord(31)]:[]}
    else if(/^\/actions\/runs\/\d+\/attempts\/1$/.test(path))value=runRecord(Number(path.split('/')[3]))
    else if(/^\/actions\/workflows\/\d+$/.test(path)){const id=Number(path.split('/').pop());value={id,path:id===8?policy.producer.workflowPath:policy.validator.workflowPath}}
    else if(path.startsWith('/contents/.github/workflows/'))value={type:'file',path:path.slice('/contents/'.length),encoding:'base64',content:workflow.toString('base64')}
    else if(/^\/actions\/runs\/\d+\/artifacts$/.test(path)){const id=Number(path.split('/')[3]),items=artifacts().filter(item=>item.runId===id);value={total_count:items.length,artifacts:items.map(artifactMetadata)}}
    else if(path.startsWith('/actions/artifacts/')){const item=artifacts().find(item=>item.id===Number(path.split('/')[3]));value=path.endsWith('/zip')?item?.archive:artifactMetadata(item!)}
    else if(path.endsWith('/check-runs'))value={total_count:1,check_runs:[{id:41,name:policy.checkName,app:{id:9},check_suite:{id:51},head_sha:seal,status:'completed',conclusion:'success'}]}
    else if(path==='')value={id:100,node_id:'R_fixture',full_name:'example/zdoc'}
    else if(path==='/git/matching-refs/heads/')value=remote(['for-each-ref','--format=%(refname) %(objectname)','refs/heads/']).toString().trim().split('\n').filter(Boolean).map(line=>{const [ref,sha]=line.split(' ');return {ref,node_id:'REF_fixture',object:{type:'commit',sha}}})
    else if(path.startsWith('/git/ref/heads/')){const name=path.slice('/git/ref/heads/'.length),sha=ref(name);if(!sha){status=404;value=null}else value={ref:'refs/heads/'+name,object:{type:'commit',sha}}}
    else if(path==='/pulls'){pullScans++;if(appearAt===pullScans){remote(['update-ref','refs/heads/shared-update/newly-appeared',master]);pulls.push({number:99,id:99,created_at:'2025-01-01T00:00:00Z',base:{repo:{id:100},ref:'master',sha:master},head:{repo:{id:100},ref:'shared-update/newly-appeared',sha:master},user:{id:27},state:'open',merged_at:null,draft:true})};value=pulls;for(const pull of pulls)pull.head.sha=ref(pull.head.ref)}
    else if(path.startsWith('/pulls/')){value=pulls.find(pull=>pull.number===Number(path.split('/').pop()));if(!value){status=404;value=null}}
    else if(path.startsWith('/commits/'))value=fact(path.split('/').pop()!)
    else if(path==='/graphql'){const f=fact(body.variables.oid);value={data:{repository:{databaseId:100,object:{oid:f.sha,author:{user:{databaseId:27}},committer:{user:null},signature:{isValid:true,state:'VALID',wasSignedByGitHub:true,signer:{databaseId:99},payload:f.payload,signature:f.signature}}}}}}
    else{status=404;value=null}
    res.writeHead(status,{'content-type':'application/json'});res.end(status===204?undefined:value instanceof Uint8Array?value:JSON.stringify(value))
  })
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));cleanup.push(()=>new Promise<void>((resolve,reject)=>{server.close(error=>error?reject(error):resolve());server.closeAllConnections()}))
  const address=server.address() as {port:number}
  const transport:RemoteTransport=input=>new Promise((resolve,reject)=>{const req=request({hostname:'127.0.0.1',port:address.port,path:input.path,method:input.method,signal:input.signal,agent:false},res=>{const chunks:Buffer[]=[];res.on('data',chunk=>chunks.push(Buffer.from(chunk)));res.on('end',()=>resolve({status:res.statusCode!,headers:{},body:Buffer.concat(chunks)}));res.on('error',reject)});req.on('error',reject);if(input.body)req.write(input.body);req.end()})
  const reads=createRemoteReads({policy,transport,evidence,approvedProducers:[{tools:master,...policy.producer,protocol:'shared-update-producer-v1'}]}),scratch={read:async(oid:string,type:'commit'|'tree'|'blob')=>git(['cat-file',type,oid])},remoteObjects={read:readObject}
  const harness=()=>createRemoteTransactionFixture({reads,evidence,transport,scratch,remoteObjects,authenticate:async()=>{},validatorInstalled:installed?async()=>{}:undefined})
  return {intent,reads,evidence,scratch,remoteObjects,harness,transport,writes,ref,remote,object,rawCommit,masterTree,master,candidate,proof,plan,pulls,installValidator:(mode='valid')=>{installed=true;validationMode=mode},appearAfterScans:(count:number)=>{appearAt=count},getSeal:()=>seal,setFault:(at:number,mode:string)=>{fault={at,mode}},moveBase:()=>{moveBase=true},manualPush:()=>{manualPush=true},failReads:()=>{failReads=true},clearFault:()=>{fault=undefined;failReads=false}}
}
it('rejects JSON and fixture writer authority at the production constructor with zero writes',async()=>{
  const f=await fixture(),fixtureWriter=f.harness().writerCapability
  for(const writerCapability of [{authorized:true},fixtureWriter,JSON.parse(JSON.stringify(fixtureWriter))])expect(await createRemoteTransaction({reads:f.reads,evidence:f.evidence,writerCapability}).apply(f.intent)).toMatchObject({status:'report-only',reasons:['WRITER_DISABLED']})
  expect(f.writes).toHaveLength(0)
},integrationTimeout)
it('uploads actual closed objects, seals exactly K, CASes target and creates one draft; validator stays disabled',async()=>{
  const f=await fixture(),result=await f.harness().apply(f.intent)
  expect(result.reasons).toEqual(['VALIDATOR_NOT_INSTALLED']);expect(result.seal).toBe(f.ref(f.intent.targetRef));expect(f.pulls).toHaveLength(1);expect(f.pulls[0].draft).toBe(true)
  expect(f.remote(['merge-base','--is-ancestor',f.candidate,result.seal!]).length).toBe(0)
  expect(f.writes.filter(write=>write.action==='cas').map(write=>write.body.variables.input.refUpdates[0])).toEqual([{name:'refs/heads/'+f.intent.stagingRef,beforeOid:'0'.repeat(40),afterOid:f.candidate,force:false},{name:'refs/heads/'+f.intent.targetRef,beforeOid:'0'.repeat(40),afterOid:result.seal,force:false}])
  expect(f.writes.map(write=>write.action)).not.toContain('dispatches')
},integrationTimeout)
it.each(['before','after','lost','incomplete','read-fails'])('stops every subsequent mutation after %s at each write position',async mode=>{
  const baseline=await fixture();baseline.installValidator();await baseline.harness().apply(baseline.intent);const count=baseline.writes.length;expect(count).toBeGreaterThan(5)
  for(let at=1;at<=count;at++){const f=await fixture();f.installValidator();f.setFault(at,mode);const result=await f.harness().apply(f.intent);expect(result.status).toBe('hold');expect(result.reasons).toEqual(['REMOTE_STATE_UNKNOWN']);expect(f.writes).toHaveLength(at);expect(JSON.stringify(result)).not.toContain('private-token-secret');const before=f.writes.length;await f.harness().reconcile(f.intent);expect(f.writes).toHaveLength(before)}
},120000)
it('refuses a concurrent human target push without overwriting it or creating a PR',async()=>{const f=await fixture();f.manualPush();const result=await f.harness().apply(f.intent);expect(result.reasons).toEqual(['REMOTE_STATE_UNKNOWN']);expect(f.ref(f.intent.targetRef)).not.toBe(f.getSeal());expect(f.pulls).toHaveLength(0)},integrationTimeout)
it('holds M/D movement after CAS and preserves written refs without rollback',async()=>{const f=await fixture();f.moveBase();const result=await f.harness().apply(f.intent);expect(result.reasons).toEqual(['REMOTE_STATE_UNKNOWN']);expect(f.ref(f.intent.targetRef)).toBe(f.getSeal());expect(f.pulls).toHaveLength(0)},integrationTimeout)
it('reconciles response loss read-only and requires a fresh explicit invocation even when old H remains',async()=>{const f=await fixture();f.setFault(1,'before');const transaction=f.harness();expect((await transaction.apply(f.intent)).reasons).toEqual(['REMOTE_STATE_UNKNOWN']);f.clearFault();const before=f.writes.length;expect((await transaction.reconcile(f.intent)).observation?.targetState).toBe('old');expect((await transaction.apply(f.intent)).reasons).toEqual(['FRESH_INVOCATION_REQUIRED']);expect(f.writes).toHaveLength(before)},integrationTimeout)
it('validates all scratch bytes and proof before any upload',async()=>{const f=await fixture();const bad=createRemoteTransactionFixture({reads:f.reads,evidence:f.evidence,transport:async()=>{throw Error('must not write')},scratch:{read:async()=>Buffer.from('bad bytes')},remoteObjects:f.remoteObjects,authenticate:async()=>{}});expect((await bad.apply(f.intent)).reasons).toEqual(['OBJECT_BYTES_OID']);expect(f.writes).toHaveLength(0)},integrationTimeout)

it('dispatches only the pinned-version legacy204 master contract and accepts authenticated exact artifact facts',async()=>{
  const f=await fixture();f.installValidator();const result=await f.harness().apply(f.intent)
  expect(result.reasons).toEqual([]);expect(result.status).toBe('accepted');expect(result.readyProposal).toEqual({prNumber:20,head:f.getSeal()});expect(result.donorCloseProposals).toEqual([])
  const dispatch=f.writes.filter(write=>write.action==='dispatches');expect(dispatch).toHaveLength(1);expect(dispatch[0].body).toEqual({ref:'master',inputs:{requestId:f.intent.requestId,seal:f.getSeal(),master:f.master,dev:f.master}})
},integrationTimeout)
it.each(['old-green','missing','ambiguous'])('holds installed validation %s and never loops dispatch',async mode=>{
  const f=await fixture();f.installValidator(mode);const result=await f.harness().apply(f.intent);expect(result.status).toBe('hold');expect(result.readyProposal).toBeUndefined();expect(result.donorCloseProposals).toBeUndefined();expect(f.writes.filter(write=>write.action==='dispatches')).toHaveLength(1)
},integrationTimeout)
it('fresh authenticated same-intent invocation reuses verified seal/ref/PR without another write',async()=>{
  const f=await fixture();expect((await f.harness().apply(f.intent)).reasons).toEqual(['VALIDATOR_NOT_INSTALLED']);const count=f.writes.length;const second=await f.harness().apply(f.intent);expect(second.reasons).toEqual(['VALIDATOR_NOT_INSTALLED']);expect(f.writes).toHaveLength(count);expect(f.pulls).toHaveLength(1)
},integrationTimeout)

async function historicalFixture() {
const source='a'.repeat(40),target='b'.repeat(40),hash='c'.repeat(64),path='shared-docs/guides/pages/alpha/lock.yaml'
const subject={kind:'guides-page' as const,group:'guides' as const,pageId:'alpha'}
const identity='Shared update local <shared-update-local@localhost>'
const blob=(bytes:Uint8Array)=>({path:'blobs/'+rawSha256(bytes),sha256:rawSha256(bytes),bytes:bytes.length})
function zip(files:Map<string,Uint8Array>) {
  const chunks:Buffer[]=[],entries:Buffer[]=[];let offset=0
  for(const [name,data] of files){const bytes=Buffer.from(data),nameBytes=Buffer.from(name);let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}crc=(crc^0xffffffff)>>>0
    const local=Buffer.alloc(30),central=Buffer.alloc(46);local.writeUInt32LE(0x04034b50);local.writeUInt32LE(crc,14);local.writeUInt32LE(bytes.length,18);local.writeUInt32LE(bytes.length,22);local.writeUInt16LE(nameBytes.length,26)
    central.writeUInt32LE(0x02014b50);central.writeUInt32LE(crc,16);central.writeUInt32LE(bytes.length,20);central.writeUInt32LE(bytes.length,24);central.writeUInt16LE(nameBytes.length,28);central.writeUInt32LE(offset,42);chunks.push(local,nameBytes,bytes);entries.push(central,nameBytes);offset+=30+nameBytes.length+bytes.length}
  const directory=Buffer.concat(entries),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.size,8);end.writeUInt16LE(files.size,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...chunks,directory,end])
}
async function build() {
  const root=await mkdtemp(join(await realpath(tmpdir()),'remote-history-'));roots.push(root);const repository=join(root,'repo.git')
  execFileSync('/usr/bin/git',['init','--bare','--quiet',repository])
  const git=(args:string[],input?:Uint8Array)=>execFileSync('/usr/bin/git',['--no-replace-objects','-C',repository,...args],{input,env:{PATH:'/usr/bin:/bin',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null',GIT_NO_LAZY_FETCH:'1',GIT_TERMINAL_PROMPT:'0'},maxBuffer:4*1024*1024})
  const object=(type:string,bytes:Uint8Array)=>git(['hash-object','--literally','-w','-t',type,'--stdin'],bytes).toString().trim()
  type Files=Record<string,{mode:string;oid:string}>
  const tree=(files:Files)=>{
    const subtree=(prefix:string):string=>{const names=new Map<string,{directory:boolean;entry?:{mode:string;oid:string}}>();for(const [path,entry] of Object.entries(files)){if(!path.startsWith(prefix))continue;const suffix=path.slice(prefix.length),slash=suffix.indexOf('/'),name=slash<0?suffix:suffix.slice(0,slash);names.set(name,{directory:slash>=0,entry})}
      const entries=[...names].sort(([a,x],[b,y])=>Buffer.compare(Buffer.from(a+(x.directory?'/':'')),Buffer.from(b+(y.directory?'/':'')))).map(([name,value])=>Buffer.concat([Buffer.from((value.directory?'40000':value.entry!.mode)+' '+name+'\0'),Buffer.from(value.directory?subtree(prefix+name+'/'):value.entry!.oid,'hex')]))
      return object('tree',Buffer.concat(entries))};return subtree('')
  }
  const known=new Map<string,{tree:string;parents:string[];raw:Buffer;time:number}>()
  const commit=(files:Files,parents:string[]=[],message='data\n',signed=false,time?:number)=>{const oidTree=tree(files),timestamp=time??Math.max(0,...parents.map(parent=>known.get(parent)!.time))+1
    const payload=Buffer.from(`tree ${oidTree}\n${parents.map(parent=>'parent '+parent+'\n').join('')}author ${identity} ${timestamp} +0000\ncommitter ${identity} ${timestamp} +0000\n\n${message}`),signature='-----BEGIN PGP SIGNATURE-----\nsynthetic\n-----END PGP SIGNATURE-----\n'
    const raw=signed?Buffer.from(payload.toString().replace('\n\n','\ngpgsig '+signature.trimEnd().split('\n').join('\n ')+'\n\n')):payload,oid=object('commit',raw)
    known.set(oid,{tree:oidTree,parents,raw,time:timestamp});return {oid,payload,signature}
  }
  const before=Buffer.from(`schema_version: 1\ncurrent: ${source}\nnext: ${source}\n`),after=Buffer.from(`schema_version: 1\ncurrent: ${source}\nnext: ${target}\n`)
  const files:Files={[path]:{mode:'100644',oid:object('blob',before)}}
  const m=commit(files),master=m.oid,workflow=Buffer.from('reviewed fixture-only isolated producer v1\n')
  const policy:RemotePolicy={host:'github.com',repositoryId:100,repositoryFullName:'example/zdoc',baseRef:'master',writerActorId:27,sealIdentity:{scheme:'github-app-author-v1',platformSignerActorId:99},allowedHeadPrefixes:['shared-update/'],checkAppId:9,checkName:'exact',producerArtifactName:'producer',validatorArtifactName:'validation',producer:{actorId:7,workflowId:8,workflowPath:'.github/workflows/producer.yml',workflowDefinitionSha256:rawSha256(workflow),event:'workflow_dispatch'},validator:{actorId:17,workflowId:18,workflowPath:'.github/workflows/validate.yml',workflowDefinitionSha256:hash,event:'workflow_dispatch'}}
  const member={manualId:'guides',logicalId:'alpha',origin:'upstream' as const,token:'shared-alpha',outputPath:'content/en/guides/alpha.mdx',current:true,next:true},emptyRef=blob(Buffer.alloc(0)),material={entries:[{path:'data/input.md',sha256:hash,bytes:0}]}
  const semantic={kind:'shared-update-semantic' as const,schemaVersion:1 as const,subject,source:{repository:'source',directory:'pages/alpha',track:'main'},config:material,lockSchema:{version:1,path},upstream:{current:material,oldNext:material,target:material},images:[],members:[member],registry:null,authority:{provider:'guides-retained-source' as const,state:'eligible-to-propose' as const,reasons:[],policySha256:hash},providerPolicySha256:hash,toolsetSha256:hash}
  const report:UpdateReportEnvelope={kind:'shared-update',schemaVersion:1,subject,pins:{master,dev:master,trustedTools:master,configSnapshot:master,configTreeOid:known.get(master)!.tree,relevantConfigSha256:hash,comparisonConfig:null,toolsetSha256:hash,registrySha256:hash,source:{repository:'source',track:'main',observedTrackHead:target,current:source,oldNext:source,target}},authority:{provider:'guides-retained-source',subject,evidence:[emptyRef],updateState:'eligible-to-propose',reasons:[]},members:[member],memberSetSha256:digest('members',[member]),axes:[{axis:'old-next-to-target',sourceChanged:true,outputChanged:true,contentStatus:'valid',added:[],removed:[],renameCandidates:[]},{axis:'current-to-candidate-next',sourceChanged:true,outputChanged:true,contentStatus:'valid',added:[],removed:[],renameCandidates:[]}],configurationChanges:[],detail:{kind:'guides-impact-v1',file:emptyRef},diagnostics:[],semanticProjection:semantic,semanticInputSha256:digest('semantic',semantic)}
  const reportBytes=canonicalBytes(report),afterBlob=blob(after)
  const plan:UpdateUnitPlan={kind:'shared-update-unit',schemaVersion:1,unitKey:guidesUnitKey([subject]),subjects:[subject],membersSha256:digest('unit-members',[{subject,memberSetSha256:report.memberSetSha256}]),reports:[blob(reportBytes)],nextEdits:[{subject,before:{path,sha256:rawSha256(before),current:source,next:source},target,afterBlob}],disposition:'candidate',holdReasons:[],semanticInputSha256:digest('unit-semantic',[{subject,semanticInputSha256:report.semanticInputSha256}])}
  const revision:BotRevision={kind:'shared-update-revision',schemaVersion:1,unitKey:plan.unitKey,subjects:[subject],parentHead:master,master,dev:master,tools:master,memberSetSha256:plan.membersSha256,planSha256:digest('plan',plan),previousBotCommit:null,lockDeltas:[{path,current:source,oldNext:source,next:target}],preservedHumanHeads:[]}
  const candidateFiles={...files,[path]:{mode:'100644',oid:object('blob',after)}},k=commit(candidateFiles,[master],encodeRevisionMessage(revision).commitMessage)
  const patch=git(['diff-tree','--raw','-r','-z','--no-abbrev','--no-color','--no-renames','--no-ext-diff','--no-commit-id',master,k.oid])
  const proof:CandidateSnapshotProof={prepared:{kind:'new',master,base:master,tree:known.get(master)!.tree},candidate:k.oid,candidateTree:known.get(k.oid)!.tree,patch:blob(patch),preservedHumanHeads:[],trustedToolsetSha256:hash,executableClosure:{path:'historical/closure.json',sha256:hash,bytes:23*1024*1024},nextEdits:plan.nextEdits}
  const seal:RemoteSealV1={kind:'shared-update-seal',schemaVersion:1,repositoryId:100,transactionId:hash,unitKey:plan.unitKey,planSha256:digest('plan',plan),proofSha256:rawSha256(canonicalBytes(proof)),master,dev:master,preparedBase:master,candidate:k.oid,candidateTree:known.get(k.oid)!.tree,previousSeal:null,preservedHumanHeads:[],runId:30,runAttempt:1}
  const s=commit(candidateFiles,[k.oid],encodeSealMessage(seal),true)
  const members=new Map<string,Uint8Array>([['plan.json',canonicalBytes(plan)],['proof.json',canonicalBytes(proof)],['patch.raw',patch],[`reports/${rawSha256(reportBytes)}.json`,reportBytes],[`locks/${afterBlob.sha256}.yaml`,after]])
  const receipt={kind:'shared-update-producer',schemaVersion:1,...Object.fromEntries(Object.entries(seal).filter(([key])=>!['kind','schemaVersion'].includes(key))),seal:s.oid,requestId:'fixture-only-request',tools:master,workflowDefinitionSha256:policy.producer.workflowDefinitionSha256,members:[...members].map(([name,bytes])=>({name,sha256:rawSha256(bytes),bytes:bytes.length}))}
  members.set('provenance.json',canonicalBytes(receipt))
  const records=new Map<string,{s:typeof s;seal:RemoteSealV1;members:Map<string,Uint8Array>}>([[s.oid,{s,seal,members}]])
  const evidence=await initializeEvidence({root:join(root,'evidence'),repositories:[repository],owner:'fixture'})
  const pulls=[{id:20,number:20,base:{repo:{id:100},ref:'master',sha:master},head:{repo:{id:100},ref:'shared-update/unit',sha:s.oid},user:{id:27},state:'open',merged_at:null,draft:true,created_at:'2026-01-01T00:00:00Z'}]
  let signaturePatch:Record<string,unknown>={},runPatch:Record<string,unknown>={},artifactPatch:Record<string,unknown>={};const transcript:string[]=[]
  const transport:RemoteTransport=async request=>{
    transcript.push(request.method+' '+request.path);const url=new URL(request.path,'https://api.github.com'),part=url.pathname.replace('/repos/example/zdoc','');let value:unknown
    const runMatch=/\/actions\/(?:runs|artifacts)\/(\d+)/.exec(part),id=runMatch?Number(runMatch[1]):30,record=[...records.values()].find(record=>record.seal.runId===id)??records.get(s.oid)!,runId=record.seal.runId,recordMaster=record.seal.master
    const archive=zip(record.members),artifact={id:runId,name:'producer',expired:false,size_in_bytes:archive.length,digest:'sha256:'+rawSha256(archive),workflow_run:{id:runId,repository_id:100,head_repository_id:100,head_sha:recordMaster,head_branch:'master'},...artifactPatch}
    if(part==='')value={id:100,full_name:'example/zdoc'}
    else if(part==='/pulls')value=pulls
    else if(part===`/actions/runs/${runId}/attempts/1`)value={id:runId,run_attempt:1,repository:{id:100},head_repository:{id:100},head_sha:recordMaster,actor:{id:7},event:'workflow_dispatch',workflow_id:8,path:policy.producer.workflowPath,status:'completed',conclusion:'success',check_suite_id:50,...runPatch}
    else if(part==='/actions/workflows/8')value={id:8,path:policy.producer.workflowPath}
    else if(part==='/contents/'+policy.producer.workflowPath)value={type:'file',path:policy.producer.workflowPath,encoding:'base64',content:workflow.toString('base64')}
    else if(part===`/actions/runs/${runId}/artifacts`)value={total_count:1,artifacts:[artifact]}
    else if(part===`/actions/artifacts/${runId}`)value=artifact
    else if(part===`/actions/artifacts/${runId}/zip`)value=archive
    else if(part.startsWith('/commits/')){const oid=part.slice(9),entry=known.get(oid)!,signed=records.get(oid)!.s;value={sha:oid,author:{id:27},committer:{id:99},parents:entry.parents.map(sha=>({sha})),commit:{tree:{sha:entry.tree},verification:{verified:true,reason:'valid',payload:signed.payload.toString(),signature:signed.signature}}}}
    else if(url.pathname==='/graphql'){const body=JSON.parse(Buffer.from(request.body!).toString()),oid=body.variables.oid,signed=records.get(oid)!.s;value={data:{repository:{databaseId:100,object:{oid,author:{user:{databaseId:27}},committer:{user:null},signature:{isValid:true,state:'VALID',wasSignedByGitHub:true,signer:{databaseId:99},payload:signed.payload.toString(),signature:signed.signature,...signaturePatch}}}}}}
    return {status:value===undefined?404:200,headers:{},body:value instanceof Uint8Array?value:canonicalBytes(value??null)}
  }
  const definitions=[{tools:master,...policy.producer,protocol:'shared-update-producer-v1' as const}]
  const reads=()=>createRemoteReads({policy,evidence,transport,approvedProducers:definitions})
  const objects={read:async(oid:string,type:'commit'|'tree'|'blob')=>git(['cat-file',type,oid])}
  const inspect=(head=s.oid,currentMaster=master,donorHeads:string[]=[])=>inspectRemoteHistory({head,master:currentMaster,donorHeads,policy},reads(),objects)
  const editFiles=(base:Files,changes:Record<string,string>,mode='100644')=>({...base,...Object.fromEntries(Object.entries(changes).map(([path,text])=>[path,{mode,oid:object('blob',Buffer.from(text))}]))})
  const addRevision=(options:{parent:string;baseFiles:Files;master?:string;previous?:string;preservedHeads?:string[];subjects?:typeof subject[];merges?:{commit:string;mergeBase:string}[];changeRevision?:(value:BotRevision)=>void;changeProof?:(value:CandidateSnapshotProof)=>void;changePlan?:(value:UpdateUnitPlan)=>void;changeFiles?:(value:Files)=>void})=>{
    const p=options.parent,m=options.master??master,previous=options.previous?records.get(options.previous):undefined,heads=options.preservedHeads??[],runId=30+records.size
    if(!definitions.some(def=>def.tools===m))definitions.push({tools:m,...policy.producer,protocol:'shared-update-producer-v1'})
    const subjects=options.subjects??[subject],nextFiles={...options.baseFiles},reportRows:UpdateReportEnvelope[]=[],reportMembers:[string,Uint8Array][]=[],lockMembers:[string,Uint8Array][]=[],edits:UpdateUnitPlan['nextEdits']=[]
    for(const currentSubject of subjects){const lockPath=`shared-docs/guides/pages/${currentSubject.pageId}/lock.yaml`,beforeBytes=git(['cat-file','blob',options.baseFiles[lockPath].oid]),oldNext=/next: ([a-f0-9]{40})/.exec(beforeBytes.toString())![1],next=oldNext===target?'d'.repeat(40):target,afterBytes=Buffer.from(beforeBytes.toString().replace('next: '+oldNext,'next: '+next))
      const r=structuredClone(report);r.subject=currentSubject;r.authority.subject=currentSubject;Object.assign(r.pins,{master:m,dev:m,trustedTools:m,configSnapshot:p,configTreeOid:known.get(p)!.tree});Object.assign(r.pins.source,{oldNext,target:next,observedTrackHead:next})
      r.members=[{...member,logicalId:currentSubject.pageId,token:'shared-'+currentSubject.pageId,outputPath:`content/en/guides/${currentSubject.pageId}.mdx`}];r.memberSetSha256=digest('members',r.members)
      r.semanticProjection={...structuredClone(semantic),subject:currentSubject,source:{...semantic.source,directory:'pages/'+currentSubject.pageId},lockSchema:{version:1,path:lockPath},members:r.members};r.semanticInputSha256=digest('semantic',r.semanticProjection)
      const bytes=canonicalBytes(r);reportRows.push(r);reportMembers.push([`reports/${rawSha256(bytes)}.json`,bytes]);lockMembers.push([`locks/${rawSha256(afterBytes)}.yaml`,afterBytes]);edits.push({subject:currentSubject,before:{path:lockPath,sha256:rawSha256(beforeBytes),current:source,next:oldNext},target:next,afterBlob:blob(afterBytes)});nextFiles[lockPath]={mode:'100644',oid:object('blob',afterBytes)}
    }
    const pPlan:UpdateUnitPlan={...structuredClone(plan),unitKey:guidesUnitKey(subjects),subjects,membersSha256:digest('unit-members',reportRows.map(r=>({subject:r.subject,memberSetSha256:r.memberSetSha256}))),semanticInputSha256:digest('unit-semantic',reportRows.map(r=>({subject:r.subject,semanticInputSha256:r.semanticInputSha256}))),reports:reportMembers.map(([,bytes])=>blob(bytes)),nextEdits:edits};options.changePlan?.(pPlan)
    const pRevision:BotRevision={...structuredClone(revision),unitKey:pPlan.unitKey,subjects:pPlan.subjects,memberSetSha256:pPlan.membersSha256,parentHead:p,master:m,dev:m,tools:m,planSha256:digest('plan',pPlan),previousBotCommit:previous?.seal.candidate??null,lockDeltas:edits.map(edit=>({path:edit.before.path,current:source,oldNext:edit.before.next,next:edit.target})),preservedHumanHeads:heads};options.changeRevision?.(pRevision)
    options.changeFiles?.(nextFiles)
    const candidate=commit(nextFiles,[p],encodeRevisionMessage(pRevision).commitMessage),rawPatch=git(['diff-tree','--raw','-r','-z','--no-abbrev','--no-color','--no-renames','--no-ext-diff','--no-commit-id',p,candidate.oid]),extra=new Map<string,Uint8Array>()
    const retain=(bytes:Uint8Array)=>{const ref=blob(bytes);extra.set('evidence/'+ref.sha256,bytes);return ref}
    const rawDiff=(a:string,b:string)=>git(['diff-tree','--raw','-r','-z','--no-abbrev','--no-color','--no-renames','--no-ext-diff','--no-commit-id',a,b])
    const mergeRows=(options.merges??[]).map(value=>({commit:value.commit,parents:known.get(value.commit)!.parents,mergeBase:value.mergeBase,tree:known.get(value.commit)!.tree,diff:retain(rawDiff(known.get(value.commit)!.parents[0],value.commit))}))
    const prepared:CandidateSnapshotProof['prepared']=heads.length?{kind:'existing',master:m,humanHead:heads[0],base:p,tree:known.get(p)!.tree,mergeEvidence:retain(canonicalBytes(mergeRows)),preservationEvidence:retain(canonicalBytes({base:p,heads,diff:retain(rawDiff(heads[0],p))}))}:{kind:'new',master:m,base:p,tree:known.get(p)!.tree}
    const pProof:CandidateSnapshotProof={...structuredClone(proof),prepared,candidate:candidate.oid,candidateTree:known.get(candidate.oid)!.tree,patch:blob(rawPatch),preservedHumanHeads:heads,nextEdits:pPlan.nextEdits};options.changeProof?.(pProof)
    const pSeal:RemoteSealV1={...structuredClone(seal),unitKey:pPlan.unitKey,master:m,dev:m,preparedBase:p,candidate:candidate.oid,candidateTree:known.get(candidate.oid)!.tree,planSha256:digest('plan',pPlan),proofSha256:rawSha256(canonicalBytes(pProof)),previousSeal:previous?.s.oid??null,preservedHumanHeads:heads,runId}
    const signed=commit(nextFiles,[candidate.oid],encodeSealMessage(pSeal),true),bundle=new Map<string,Uint8Array>([['plan.json',canonicalBytes(pPlan)],['proof.json',canonicalBytes(pProof)],['patch.raw',rawPatch],...reportMembers,...lockMembers,...extra])
    bundle.set('provenance.json',canonicalBytes({kind:'shared-update-producer',schemaVersion:1,...Object.fromEntries(Object.entries(pSeal).filter(([key])=>!['kind','schemaVersion'].includes(key))),seal:signed.oid,requestId:'fixture-'+runId,tools:m,workflowDefinitionSha256:policy.producer.workflowDefinitionSha256,members:[...bundle].map(([name,bytes])=>({name,sha256:rawSha256(bytes),bytes:bytes.length}))}))
    records.set(signed.oid,{s:signed,seal:pSeal,members:bundle});return {s:signed,k:candidate,seal:pSeal,proof:pProof,revision:pRevision,files:nextFiles,bundle}
  }
  return {pulls,addRevision,records,master,s,k,known,files,candidateFiles,commit,object,tree,editFiles,plan,proof,revision,seal,receipt,members,policy,evidence,reads,objects,inspect,transcript,definitions,transport,
    signature:(patch:Record<string,unknown>)=>{signaturePatch=patch},run:(patch:Record<string,unknown>)=>{runPatch=patch},artifact:(patch:Record<string,unknown>)=>{artifactPatch=patch}}
}
return build()
}

// History authentication plus two complete apply passes use real Git and evidence I/O.
// Budget this combined scenario separately from ordinary cases in the parallel light phase.
it('authenticates donor history and survivor ordering, preserves both branches, and proposes only unchanged open donors after exact validation',async()=>{
  const f=await historicalFixture(),history=await f.inspect();expect(history.status).toBe('verified')
  const next=f.addRevision({parent:f.s.oid,baseFiles:f.candidateFiles,previous:f.s.oid,preservedHeads:[f.s.oid]})
  const intent=RemoteTransactionIntentSchema.parse({kind:'shared-update-remote-intent',schemaVersion:1,repositoryId:100,repositoryFullName:'example/zdoc',master:f.master,dev:f.master,transactionId:next.seal.transactionId,unitKey:next.seal.unitKey,planSha256:next.seal.planSha256,proofSha256:next.seal.proofSha256,plan:await f.evidence.writeBlob(next.bundle.get('plan.json')!),proof:await f.evidence.writeBlob(next.bundle.get('proof.json')!),preparedBase:f.s.oid,candidate:next.k.oid,candidateTree:next.seal.candidateTree,previousSeal:f.s.oid,preservedHumanHeads:[f.s.oid],targetRef:'shared-update/oldest',expectedHead:f.s.oid,stagingRef:'shared-update-staging/'+next.seal.transactionId,pulls:[{number:20,head:f.s.oid,headRef:'shared-update/oldest',createdAt:'2026-01-01T00:00:00Z',state:'open'},{number:21,head:f.s.oid,headRef:'shared-update/donor',createdAt:'2026-01-01T00:00:00.100Z',state:'open'}],producerRunId:next.seal.runId,producerRunAttempt:1,producerRequestId:'fixture-'+next.seal.runId,requestId:'validate-donors'})
  const refs=new Map([['master',f.master],['dev',f.master],[intent.targetRef,f.s.oid],['shared-update/donor',f.s.oid],[intent.stagingRef,next.s.oid]]),pulls=intent.pulls.map(expected=>({number:expected.number,id:expected.number,created_at:expected.createdAt,base:{repo:{id:100},ref:'master',sha:f.master},head:{repo:{id:100},ref:expected.headRef,sha:expected.head},user:{id:27},state:'open',merged_at:null,draft:true}))
  const transcript:string[]=[];let dispatched=false
  const validatorWorkflow=Buffer.from('fixture-only exact validator\n'),policy={...f.policy,validator:{...f.policy.validator,workflowDefinitionSha256:rawSha256(validatorWorkflow)}}
  const output=canonicalBytes({fixture:'donors'}),receipt={kind:'shared-update-exact-validation',schemaVersion:1,repositoryId:100,prNumber:20,head:next.s.oid,master:f.master,dev:f.master,tools:f.master,unitKey:intent.unitKey,planSha256:intent.planSha256,seal:next.s.oid,requestId:intent.requestId,runId:90,runAttempt:1,workflowPath:policy.validator.workflowPath,workflowDefinitionSha256:policy.validator.workflowDefinitionSha256,targetCheckId:41,targetSuiteId:51,targetCheckAppId:9,targetCheckHead:next.s.oid,outputDigest:rawSha256(output),conclusion:'success'}
  const archive=zip(new Map([['receipt.json',canonicalBytes(receipt)],['output.json',output]])),metadata={id:90,name:'validation',expired:false,size_in_bytes:archive.length,digest:'sha256:'+rawSha256(archive),workflow_run:{id:90,repository_id:100,head_repository_id:100,head_sha:f.master,head_branch:'master'}}
  const run={id:90,run_attempt:1,repository:{id:100},head_repository:{id:100},head_sha:f.master,actor:{id:17},event:'workflow_dispatch',workflow_id:18,path:policy.validator.workflowPath,status:'completed',conclusion:'success',check_suite_id:50,display_title:'Shared update exact '+intent.requestId}
  const transport:RemoteTransport=async request=>{
    const path=request.path.replace('/repos/example/zdoc','').split('?')[0],body=request.body?JSON.parse(Buffer.from(request.body).toString()):undefined;let value:any,status=200
    if(request.method==='POST'&&path==='/graphql'&&body.query===REMOTE_REF_CAS){transcript.push('cas');const update=body.variables.input.refUpdates[0],ref=update.name.slice(11);expect(refs.get(ref)??'0'.repeat(40)).toBe(update.beforeOid);refs.set(ref,update.afterOid);value={data:{updateRefs:{clientMutationId:body.variables.input.clientMutationId}}}}
    else if(path.endsWith('/dispatches')){transcript.push('dispatch');dispatched=true;return {status:204,headers:{},body:Buffer.alloc(0)}}
    else if(path==='')value={id:100,node_id:'R_fixture',full_name:'example/zdoc'}
    else if(path.startsWith('/git/ref/heads/')){const ref=path.slice('/git/ref/heads/'.length),oid=refs.get(ref);if(!oid){status=404;value=null}else value={ref:'refs/heads/'+ref,object:{type:'commit',sha:oid}}}
    else if(path==='/pulls'){for(const pull of pulls)pull.head.sha=refs.get(pull.head.ref)!;value=pulls}
    else if(path==='/actions/workflows/18/runs')value={total_count:dispatched?1:0,workflow_runs:dispatched?[run]:[]}
    else if(path==='/actions/runs/90/attempts/1')value=run
    else if(path==='/actions/workflows/18')value={id:18,path:policy.validator.workflowPath}
    else if(path==='/contents/'+policy.validator.workflowPath)value={type:'file',path:policy.validator.workflowPath,encoding:'base64',content:validatorWorkflow.toString('base64')}
    else if(path==='/actions/runs/90/artifacts')value={total_count:1,artifacts:[metadata]}
    else if(path==='/actions/artifacts/90')value=metadata
    else if(path==='/actions/artifacts/90/zip')value=archive
    else if(path.endsWith('/check-runs'))value={total_count:1,check_runs:[{id:41,name:policy.checkName,app:{id:9},check_suite:{id:51},head_sha:next.s.oid,status:'completed',conclusion:'success'}]}
    else return f.transport(request)
    return {status,headers:{},body:value instanceof Uint8Array?value:canonicalBytes(value)}
  }
  const reads=createRemoteReads({policy,transport,evidence:f.evidence,approvedProducers:f.definitions}),remoteObjects={read:async(oid:string,type:'commit'|'tree'|'blob')=>({kind:'found' as const,value:await f.objects.read(oid,type)})}
  const apply=()=>createRemoteTransactionFixture({reads,evidence:f.evidence,transport,scratch:f.objects,remoteObjects,authenticate:async()=>{},validatorInstalled:async()=>{}}).apply(intent)
  const result=await apply();expect(result.reasons).toEqual([]);expect(result.status).toBe('accepted');expect(result.donorCloseProposals).toEqual([{prNumber:21,head:f.s.oid,survivor:20,seal:next.s.oid}]);expect(refs.get('shared-update/donor')).toBe(f.s.oid);expect(transcript).toEqual(['cas','dispatch'])
  pulls[1].state='closed';const second=await apply();expect(second.reasons).toEqual([]);expect(second.status).toBe('accepted');expect(second.donorCloseProposals).toEqual([]);expect(transcript).toEqual(['cas','dispatch'])
},60_000)

it('uses retained dispatch attempts only as a veto and never redispatches an invisible queued request',async()=>{
  const f=await fixture();f.installValidator('missing');expect((await f.harness().apply(f.intent)).reasons).toEqual(['VALIDATION_PENDING']);const count=f.writes.length
  expect((await f.harness().apply(f.intent)).reasons).toEqual(['VALIDATION_PENDING']);expect(f.writes).toHaveLength(count);expect(f.writes.filter(write=>write.action==='dispatches')).toHaveLength(1)
},integrationTimeout)
it('does not redispatch a lost dispatch response with no visible run in a fresh same-store invocation',async()=>{
  const f=await fixture();f.installValidator('missing');const baseline=await fixture();await baseline.harness().apply(baseline.intent);f.setFault(baseline.writes.length+1,'lost')
  expect((await f.harness().apply(f.intent)).reasons).toEqual(['REMOTE_STATE_UNKNOWN']);f.clearFault();const count=f.writes.length;expect((await f.harness().apply(f.intent)).reasons).toEqual(['VALIDATION_PENDING']);expect(f.writes).toHaveLength(count)
},integrationTimeout)
it('bounds repeated-subtree DAG expansion before uploads',async()=>{
  const f=await fixture();let tree=f.intent.candidateTree
  for(let index=0;index<14;index++)tree=f.object('tree',Buffer.concat([Buffer.from('40000 a\0'),Buffer.from(tree,'hex'),Buffer.from('40000 b\0'),Buffer.from(tree,'hex')]))
  const raw=Buffer.from(await f.scratch.read(f.candidate,'commit')).toString().replace('tree '+f.intent.candidateTree,'tree '+tree),candidate=f.object('commit',Buffer.from(raw)),proof={...f.proof,candidate,candidateTree:tree},proofRef=await f.evidence.writeBlob(canonicalBytes(proof))
  const result=await f.harness().apply({...f.intent,candidate,candidateTree:tree,proof:proofRef,proofSha256:proofRef.sha256});expect(result.reasons).toEqual(['TRANSACTION_BUDGET']);expect(f.writes).toHaveLength(0)
},integrationTimeout)

it('rejects a PR appearing between authenticated discovery and the second snapshot before any upload',async()=>{
  const f=await fixture();f.appearAfterScans(5);const result=await f.harness().apply(f.intent);expect(result.reasons).toEqual(['PULL_SET_CHANGED']);expect(f.writes).toHaveLength(0)
},integrationTimeout)
it('reuses a uniquely authenticated draft after its creation response is lost, without duplicate creation',async()=>{
  const baseline=await fixture();await baseline.harness().apply(baseline.intent);const f=await fixture();f.setFault(baseline.writes.length,'lost');expect((await f.harness().apply(f.intent)).reasons).toEqual(['REMOTE_STATE_UNKNOWN']);f.clearFault();const count=f.writes.length
  const result=await f.harness().apply(f.intent);expect(result.reasons).toEqual(['VALIDATOR_NOT_INSTALLED']);expect(f.writes).toHaveLength(count);expect(f.pulls).toHaveLength(1)
},integrationTimeout)
it.each(['closed','merged','duplicate'])('holds an existing exact-ref %s PR without reopening or creating another',async state=>{
  const f=await fixture(),pull={number:20,id:20,created_at:'2026-01-01T00:00:00Z',base:{repo:{id:100},ref:'master',sha:f.master},head:{repo:{id:100},ref:f.intent.targetRef,sha:f.master},user:{id:27},state:state==='merged'?'closed':state==='duplicate'?'open':'closed',merged_at:state==='merged'?'2026-02-01T00:00:00Z':null,draft:true};f.pulls.push(pull);if(state==='duplicate')f.pulls.push({...pull,number:21,id:21})
  expect((await f.harness().apply(f.intent)).status).toBe('hold');expect(f.writes).toHaveLength(0)
},integrationTimeout)

it('latches a transport timeout and an authority revocation without issuing a second mutation',async()=>{
  const f=await fixture();let requests=0
  const transaction=createRemoteTransactionFixture({reads:f.reads,evidence:f.evidence,scratch:f.scratch,remoteObjects:f.remoteObjects,authenticate:async()=>{},transport:async()=>{requests++;throw Error('MUTATION_TIMEOUT')}})
  expect((await transaction.apply(f.intent)).reasons).toEqual(['REMOTE_STATE_UNKNOWN']);expect(requests).toBe(1);await transaction.reconcile(f.intent);expect(requests).toBe(1)
  const revoked=await fixture();let authorityChecks=0
  const result=await createRemoteTransactionFixture({reads:revoked.reads,evidence:revoked.evidence,scratch:revoked.scratch,remoteObjects:revoked.remoteObjects,transport:revoked.transport,authenticate:async()=>{if(++authorityChecks>1)throw Error('Authority revoked')}}).apply(revoked.intent)
  expect(result.status).toBe('hold');expect(revoked.writes).toHaveLength(0)
},integrationTimeout)

it('reconstructs a human successor as written-but-stale without treating it as authorization',async()=>{
  const f=await fixture();await f.harness().apply(f.intent);const count=f.writes.length,seal=f.getSeal()!,human=f.object('commit',f.rawCommit(f.intent.candidateTree,[seal],'human edit\n'),f.remote)
  f.remote(['update-ref','refs/heads/'+f.intent.targetRef,human,seal]);const result=await f.harness().reconcile(f.intent)
  expect(result.reasons).toEqual(['TARGET_STALE']);expect(result.observation?.targetState).toBe('written-stale');expect(f.writes).toHaveLength(count)
},integrationTimeout)
it('rejects a foreign staging object or stale M before any upload',async()=>{
  const f=await fixture();f.remote(['update-ref','refs/heads/'+f.intent.stagingRef,f.master]);expect((await f.harness().apply(f.intent)).status).toBe('hold');expect(f.writes).toHaveLength(0)
  const stale=await fixture(),newMaster=stale.object('commit',stale.rawCommit(stale.masterTree,[stale.master],'moved\n'),stale.remote);stale.remote(['update-ref','refs/heads/master',newMaster]);expect((await stale.harness().apply(stale.intent)).reasons).toEqual(['BASE_CHANGED']);expect(stale.writes).toHaveLength(0)
},integrationTimeout)
it('rejects proof/plan/revision substitutions before any mutation',async()=>{
  const f=await fixture();const proof={...f.proof,prepared:{...f.proof.prepared,tree:'f'.repeat(40)}},ref=await f.evidence.writeBlob(canonicalBytes(proof));expect((await f.harness().apply({...f.intent,proof:ref,proofSha256:ref.sha256})).reasons).toEqual(['PREPARED_TREE_BINDING']);expect(f.writes).toHaveLength(0)
},integrationTimeout)

it('expires a genuinely pending mutation transport via its 30-second AbortSignal and never writes again',async()=>{
  const f=await fixture();let requests=0,aborted=false,entered!:()=>void
  const pending=new Promise<void>(resolve=>{entered=resolve})
  const transport:RemoteTransport=request=>new Promise((_,reject)=>{requests++;request.signal.addEventListener('abort',()=>{aborted=true;reject(new Error('Fixture observed controller abort'))},{once:true});entered()})
  const transaction=createRemoteTransactionFixture({reads:f.reads,evidence:f.evidence,scratch:f.scratch,remoteObjects:f.remoteObjects,authenticate:async()=>{},transport})
  vi.useFakeTimers({toFake:['setTimeout','clearTimeout']})
  try {
    const applying=transaction.apply(f.intent);await pending;expect(requests).toBe(1);expect(aborted).toBe(false)
    await vi.advanceTimersByTimeAsync(30001);const result=await applying
    expect(aborted).toBe(true);expect(result.reasons).toEqual(['REMOTE_STATE_UNKNOWN']);expect(requests).toBe(1)
    await transaction.reconcile(f.intent);expect(requests).toBe(1)
  } finally {vi.useRealTimers()}
},integrationTimeout)
