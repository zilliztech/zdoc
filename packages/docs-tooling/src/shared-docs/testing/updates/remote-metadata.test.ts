// @vitest-environment node
import { createHash } from 'node:crypto'
import { performance } from 'node:perf_hooks'
import { execFileSync } from 'node:child_process'
import { mkdtemp, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { canonicalBytes, digest } from '../../core/updates/canonical'
import { guidesUnitKey, type BotRevision, type CandidateSnapshotProof, type UpdateReportEnvelope, type UpdateUnitPlan } from '../../core/updates/envelope'
import { encodeRevisionMessage } from '../../core/updates/metadata'
import { encodeSealMessage, type RemoteCommit, type RemotePolicy, type RemoteSealV1 } from '../../core/updates/remote'
import { createRemoteReads, type RemoteTransport } from '../../adapters/updates/remote-github'
import { assertRemoteHistoryBinding, checkRemoteHistoryBudget, inspectRemotePulls, inspectRemoteHistory, isVerifiedRemoteHistory, verifyRemoteSealSignature } from '../../adapters/updates/remote-metadata'
import { initializeEvidence, rawSha256 } from '../../adapters/updates/evidence'
vi.setConfig({testTimeout:30000})
const roots:string[]=[]
afterEach(async()=>{for(const root of roots.splice(0))await rm(root,{recursive:true,force:true})})
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
async function fixture(omitSealLF = false) {
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
  const message=encodeSealMessage(seal)
  const s=commit(candidateFiles,[k.oid],omitSealLF ? message.slice(0,-1) : message,true)
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
it('authenticates real temporary Git objects, API server signature, historical producer and independently checked bundle bytes',async()=>{
  const f=await fixture(),result=await f.inspect();expect(result).toMatchObject({status:'verified'})
  if(result.status==='verified'){expect(result.history.candidate).toBe(f.k.oid);expect(isVerifiedRemoteHistory(result.history)).toBe(true);expect(isVerifiedRemoteHistory(JSON.parse(JSON.stringify(result.history)))).toBe(false);expect(Object.isFrozen(result.history.counts)).toBe(true)}
  // Historical closure >22MiB is explicitly attested, never fetched as a tiny bundle member or executed.
  expect(f.proof.executableClosure.bytes).toBeGreaterThan(22*1024*1024);expect(f.transcript.every(line=>line.startsWith('GET ')||line==='POST /graphql')).toBe(true)
})
it('authenticates a GitHub seal whose signed payload omits the final LF',async()=>{
  const f=await fixture(true)
  expect(await f.inspect()).toMatchObject({status:'verified'})
  f.signature({isValid:false})
  expect(await f.inspect()).toMatchObject({status:'hold'})
})
it('accepts human YAML/config and ordinary disjoint data merges, preserving donors and all parents',async()=>{
  const f=await fixture(),a=f.editFiles(f.candidateFiles,{'shared-docs/guides/pages/alpha/config.yaml':'human: true\n'}),b=f.editFiles(f.candidateFiles,{'content/en/byoc/human.md':'human\n'})
  const left=f.commit(a,[f.s.oid]),right=f.commit(b,[f.s.oid]),merged=f.commit({...a,...b,[path]:a[path]},[left.oid,right.oid])
  const result=await f.inspect(merged.oid,f.master,[right.oid]);expect(result).toMatchObject({status:'verified'});if(result.status==='verified')expect(result.history.preservedHeads).toContain(right.oid)
})
it('accepts historical tools M different from current master and exact trusted-master protected changes in an ordinary merge',async()=>{
  const f=await fixture(),masterFiles=f.editFiles(f.files,{'packages/trusted-tool.txt':'reviewed tools\n'}),current=f.commit(masterFiles,[f.master]),merged=f.commit({...f.candidateFiles,...masterFiles,[path]:f.candidateFiles[path]},[f.s.oid,current.oid])
  expect(await f.inspect(merged.oid,current.oid)).toMatchObject({status:'verified'})
})
it.each(['forged-author','wrong-signature','not-github-signed','wrong-attempt','wrong-producer','expired','wrong-artifact-repo','wrong-workflow','wrong-tools','wrong-definition','wrong-run','wrong-repository','mixed-provenance','replayed-transaction','replayed-plan','replayed-proof','missing-provenance','malformed-plan','patch','lock-member','unexpected-member'])('holds %s instead of accepting JSON authority',async kind=>{
  const f=await fixture()
  if(kind==='forged-author')f.signature({signer:{databaseId:27},isValid:false})
  if(kind==='wrong-signature')f.signature({signature:'different'})
  if(kind==='not-github-signed')f.signature({wasSignedByGitHub:false})
  if(kind==='wrong-attempt')f.run({run_attempt:2})
  if(kind==='wrong-producer')f.run({actor:{id:27}})
  if(kind==='wrong-workflow')f.run({workflow_id:9})
  if(kind==='wrong-tools')f.run({head_sha:'f'.repeat(40)})
  if(kind==='wrong-definition')f.definitions[0].workflowDefinitionSha256='f'.repeat(64)
  if(kind==='wrong-run')f.run({id:31})
  if(kind==='wrong-repository')f.run({repository:{id:101}})
  if(['mixed-provenance','replayed-transaction','replayed-plan','replayed-proof'].includes(kind)){
    const receipt:Record<string,unknown>={...f.receipt};if(kind==='mixed-provenance')receipt.seal='f'.repeat(40)
    if(kind==='replayed-transaction')receipt.transactionId='f'.repeat(64)
    if(kind==='replayed-plan')receipt.planSha256='f'.repeat(64)
    if(kind==='replayed-proof')receipt.proofSha256='f'.repeat(64)
    f.members.set('provenance.json',canonicalBytes(receipt))
  }
  if(kind==='expired')f.artifact({expired:true})
  if(kind==='wrong-artifact-repo')f.artifact({workflow_run:{id:30,repository_id:100,head_repository_id:101,head_sha:f.master}})
  if(kind==='missing-provenance')f.members.delete('provenance.json')
  if(kind==='malformed-plan')f.members.set('plan.json',Buffer.from('{"trusted":true}'))
  if(kind==='patch')f.members.set('patch.raw',Buffer.from('textual patch'))
  if(kind==='lock-member')f.members.set([...f.members.keys()].find(name=>name.startsWith('locks/'))!,Buffer.from('changed lock'))
  if(kind==='unexpected-member')f.members.set('extra.json',Buffer.from('{}'))
  expect(await f.inspect()).toMatchObject({status:'hold'})
})
it('authenticates existing prepared P with complete merge/preservation evidence and a second authenticated K/S revision',async()=>{
  const f=await fixture(),humanFiles=f.editFiles(f.files,{'content/en/guides/human.md':'human'}),human=f.commit(humanFiles,[f.master]),masterFiles=f.editFiles(f.files,{'content/en/guides/master.md':'master'}),m=f.commit(masterFiles,[f.master]),preparedFiles={...humanFiles,...masterFiles},p=f.commit(preparedFiles,[human.oid,m.oid],`Prepare shared update base\n\n${human.oid}\n${m.oid}\n`)
  const first=f.addRevision({parent:p.oid,baseFiles:preparedFiles,master:m.oid,preservedHeads:[human.oid],merges:[{commit:p.oid,mergeBase:f.master}]})
  expect(await f.inspect(first.s.oid,m.oid)).toMatchObject({status:'verified'})
  const second=f.addRevision({parent:first.s.oid,baseFiles:first.files,master:m.oid,previous:first.s.oid,preservedHeads:[first.s.oid]})
  const result=await f.inspect(second.s.oid,m.oid);expect(result).toMatchObject({status:'verified'});if(result.status==='verified')expect(result.history.seal).toBe(second.s.oid)
})
it.each(['revision-dev','proof-tree','non-next-only','erased-chain','incomparable','missing-merge-evidence'])('holds internally rehashed/resealed %s evidence',async kind=>{
  const f=await fixture()
  const next=f.addRevision({parent:kind==='incomparable'?f.master:f.s.oid,baseFiles:kind==='incomparable'?f.files:f.candidateFiles,previous:['erased-chain','incomparable'].includes(kind)?undefined:f.s.oid,preservedHeads:kind==='incomparable'?[]:[f.s.oid],
    changeRevision:kind==='revision-dev'?value=>{value.dev='e'.repeat(40)}:undefined,changeProof:kind==='proof-tree'?value=>{value.candidateTree='e'.repeat(40)}:undefined,
    changeFiles:kind==='non-next-only'?files=>{files['content/en/guides/injected.md']={mode:'100644',oid:f.object('blob',Buffer.from('extra'))}}:undefined})
  if(kind==='missing-merge-evidence'){
    // This variant has a valid first-seal P=humanHead, so force an existing prepared merge and omit it.
    const a=f.commit(f.editFiles(f.candidateFiles,{'content/en/guides/a.md':'a'}),[f.s.oid]),b=f.commit(f.editFiles(f.candidateFiles,{'content/en/guides/b.md':'b'}),[f.s.oid]),files=f.editFiles(f.candidateFiles,{'content/en/guides/a.md':'a','content/en/guides/b.md':'b'}),p=f.commit(files,[a.oid,b.oid],`Prepare shared update base\n\n${a.oid}\n${b.oid}\n`),bad=f.addRevision({parent:p.oid,baseFiles:files,previous:f.s.oid,preservedHeads:[a.oid,b.oid].sort(),merges:[]})
    expect(await f.inspect(bad.s.oid)).toMatchObject({status:'hold',reasons:['PREPARED_MERGE_INVENTORY']})
  }else if(kind==='incomparable')expect(await f.inspect(next.s.oid,f.master,[f.s.oid])).toMatchObject({status:'hold'})
  else expect(await f.inspect(next.s.oid)).toMatchObject({status:'hold'})
})
it.each(['protected','outside-config','hidden-reverted','merge-injection','merge-overlap','attributes','link','orphan','copied-trailer'])('holds unsafe human history %s',async kind=>{
  const f=await fixture();let head:string
  if(kind==='hidden-reverted'){const changed=f.commit(f.editFiles(f.candidateFiles,{'scripts/run.js':'evil'}),[f.s.oid]);head=f.commit(f.candidateFiles,[changed.oid]).oid}
  else if(kind==='merge-injection'){const a=f.commit(f.editFiles(f.candidateFiles,{'content/en/guides/a.md':'a'}),[f.s.oid]),b=f.commit(f.editFiles(f.candidateFiles,{'content/en/guides/b.md':'b'}),[f.s.oid]);head=f.commit(f.editFiles(f.candidateFiles,{'content/en/guides/a.md':'a','content/en/guides/b.md':'b','scripts/run.js':'evil'}),[a.oid,b.oid]).oid}
  else if(kind==='merge-overlap'){const a=f.commit(f.editFiles(f.candidateFiles,{'content/en/guides/a.md':'a'}),[f.s.oid]),b=f.commit(f.editFiles(f.candidateFiles,{'content/en/guides/a.md':'b'}),[f.s.oid]);head=f.commit(f.editFiles(f.candidateFiles,{'content/en/guides/a.md':'resolved'}),[a.oid,b.oid]).oid}
  else if(kind==='copied-trailer')head=f.commit(f.candidateFiles,[f.s.oid],encodeRevisionMessage(f.revision).commitMessage).oid
  else if(kind==='orphan')head=f.commit(f.candidateFiles).oid
  else{const name=kind==='protected'?'scripts/run.js':kind==='outside-config'?'shared-docs/other/config.yaml':kind==='attributes'?'content/en/guides/.gitattributes':'content/en/guides/link';head=f.commit(f.editFiles(f.candidateFiles,{[name]:'evil'},kind==='link'?'120000':'100644'),[f.s.oid]).oid}
  expect(await f.inspect(head)).toMatchObject({status:'hold'})
})
it('rejects raw object hash tampering, missing history and a forged structural adapter',async()=>{
  const f=await fixture(),request={head:f.s.oid,master:f.master,donorHeads:[],policy:f.policy}
  expect(await inspectRemoteHistory(request,f.reads(),{read:async()=>Buffer.from('forged')})).toMatchObject({status:'hold',reasons:['RAW_OBJECT_HASH']})
  expect(await inspectRemoteHistory(request,f.reads(),{read:async()=>{throw new Error('SECRET_TOKEN_ABC')}})).toEqual({status:'hold',reasons:['REMOTE_HISTORY_UNESTABLISHED']})
  expect(await inspectRemoteHistory(request,{...f.reads()},f.objects)).toEqual({status:'hold',reasons:['REMOTE_ADAPTER_REQUIRED']})
})
it('does not accept a missing production producer registry or contradictory signed raw payload',async()=>{
  const f=await fixture(),reads=createRemoteReads({policy:f.policy,evidence:f.evidence,transport:f.transport})
  expect(await inspectRemoteHistory({head:f.s.oid,master:f.master,donorHeads:[],policy:f.policy},reads,f.objects)).toMatchObject({status:'hold'})
  const result=await f.reads().readCommit(f.s.oid);if(result.kind==='found')expect(()=>verifyRemoteSealSignature(f.known.get(f.s.oid)!.raw,{...result.value,payload:'different'},{writerActorId:27,platformSignerActorId:99})).toThrow('SEAL_SIGNED_PAYLOAD')
})

it('enforces invocation bounds at exact accepted and rejected counters',()=>{
  const counts={headers:100000,relevant:256,merges:32,messageBytes:4194304,objectBytes:67108864}
  expect(()=>checkRemoteHistoryBudget(counts,119999)).not.toThrow()
  for(const key of Object.keys(counts))expect(()=>checkRemoteHistoryBudget({...counts,[key]:counts[key]+1},0)).toThrow()
  expect(()=>checkRemoteHistoryBudget(counts,120000)).toThrow('HISTORY_TIME_LIMIT');expect(()=>checkRemoteHistoryBudget({...counts,headers:-1},0)).toThrow()
})
it.each(['hidden-header','duplicate-tree-name'])('rejects raw %s independently of plausible messages or tree hashes',async kind=>{
  const f=await fixture(),empty=f.object('tree',Buffer.alloc(0)),data=f.object('blob',Buffer.from('data'))
  const collision=f.object('tree',Buffer.concat([Buffer.from('100644 foo\0'),Buffer.from(data,'hex'),Buffer.from('40000 foo\0'),Buffer.from(empty,'hex')]))
  const raw=Buffer.from(`tree ${kind==='hidden-header'?f.known.get(f.s.oid)!.tree:collision}\nparent ${f.s.oid}\nauthor Human <human@example.com> 10 +0000\ncommitter Human <human@example.com> 10 +0000${kind==='hidden-header'?'\nextra value\nparent '+f.master:''}\n\nhuman data\n`),head=f.object('commit',raw)
  expect(await f.inspect(head)).toMatchObject({status:'hold',reasons:[kind==='hidden-header'?'COMMIT_HEADER':'TREE_NAME_COLLISION']})
})
it('snapshots caller request before raw-object awaits and retains a raw graph evidence manifest',async()=>{
  const f=await fixture(),request={head:f.s.oid,master:f.master,donorHeads:[],policy:structuredClone(f.policy)};let once=false
  const result=await inspectRemoteHistory(request,f.reads(),{read:async(oid,type)=>{if(!once){once=true;request.head='f'.repeat(40);request.master='f'.repeat(40);request.policy.writerActorId=999}return f.objects.read(oid,type)}})
  expect(result.status).toBe('verified');if(result.status==='verified'){expect(result.history.head).toBe(f.s.oid);const bytes=await Promise.all(result.history.evidence.map(ref=>f.evidence.readBlob(ref)));expect(bytes.some(value=>Buffer.from(value).toString().includes('remote-raw-objects'))).toBe(true)}
})

it('verifies a representative 3000-header baseline without per-header subprocesses or evidence fsyncs',async()=>{
  const f=await fixture(),supplied=new Map<string,Uint8Array>();let parent=f.master
  for(let i=0;i<3000;i++){const bytes=Buffer.from(`tree ${f.known.get(f.master)!.tree}\nparent ${parent}\nauthor Reviewed <reviewed@example.com> ${100+i} +0000\ncommitter Reviewed <reviewed@example.com> ${100+i} +0000\n\nreviewed baseline ${i}\n`),oid=createHash('sha1').update(`commit ${bytes.length}\0`).update(bytes).digest('hex');supplied.set(oid,bytes);parent=oid}
  const started=performance.now(),result=await inspectRemoteHistory({head:f.s.oid,master:parent,donorHeads:[],policy:f.policy},f.reads(),{read:async(oid,type)=>type==='commit'&&supplied.has(oid)?supplied.get(oid)!:f.objects.read(oid,type)})
  expect(result.status).toBe('verified');if(result.status==='verified')expect(result.history.counts.headers).toBe(3003)
  console.info('remote history 3000-header baseline milliseconds',Math.round(performance.now()-started))
},30000)
it('rejects a coherently resealed prepared merge claiming an older common ancestor instead of the unique maximal base',async()=>{
  const f=await fixture(),commonFiles=f.editFiles(f.files,{'content/en/guides/common.md':'common'}),common=f.commit(commonFiles,[f.master]),humanFiles=f.editFiles(commonFiles,{'content/en/guides/human.md':'human'}),human=f.commit(humanFiles,[common.oid]),masterFiles=f.editFiles(commonFiles,{'content/en/guides/master.md':'master'}),m=f.commit(masterFiles,[common.oid]),preparedFiles={...humanFiles,...masterFiles},p=f.commit(preparedFiles,[human.oid,m.oid],`Prepare shared update base\n\n${human.oid}\n${m.oid}\n`)
  const bad=f.addRevision({parent:p.oid,baseFiles:preparedFiles,master:m.oid,preservedHeads:[human.oid],merges:[{commit:p.oid,mergeBase:f.master}]})
  expect(await f.inspect(bad.s.oid,m.oid)).toMatchObject({status:'hold',reasons:['PREPARED_MERGE']})
})

it('groups only authenticated same-unit PR subjects and blocks the whole overlapping scan on unknown origin',async()=>{
  const f=await fixture(),result=await inspectRemotePulls({master:f.master,policy:f.policy},f.reads(),f.objects)
  expect(result.status).toBe('verified');if(result.status==='verified')expect(result.groups[f.plan.unitKey][0].number).toBe(20)
  f.pulls.push({...structuredClone(f.pulls[0]),id:22,number:22});const same=await inspectRemotePulls({master:f.master,policy:f.policy},f.reads(),f.objects);expect(same.status).toBe('verified');if(same.status==='verified')expect(same.groups[f.plan.unitKey]).toHaveLength(2)
  f.pulls.push({...structuredClone(f.pulls[0]),id:21,number:21,head:{...f.pulls[0].head,sha:f.master}})
  expect(await inspectRemotePulls({master:f.master,policy:f.policy},f.reads(),f.objects)).toEqual({status:'hold',reasons:['PULL_ORIGIN_UNKNOWN']})
})

it('holds overlapping authenticated subjects even when their legitimate unit keys differ',async()=>{
  const f=await fixture(),beta={...subject,pageId:'beta'},baseFiles={...f.files,['shared-docs/guides/pages/beta/lock.yaml']:f.files[path]},m=f.commit(baseFiles,[f.master]),one=f.addRevision({parent:m.oid,baseFiles,master:m.oid}),two=f.addRevision({parent:m.oid,baseFiles,master:m.oid,subjects:[subject,beta]})
  expect(one.seal.unitKey).not.toBe(two.seal.unitKey)
  f.pulls.splice(0,f.pulls.length,...[one,two].map((value,i)=>({...structuredClone(f.pulls[0]),id:20+i,number:20+i,base:{repo:{id:100},ref:'master',sha:m.oid},head:{repo:{id:100},ref:'shared-update/unit-'+i,sha:value.s.oid}})))
  expect(await inspectRemotePulls({master:m.oid,policy:f.policy},f.reads(),f.objects)).toEqual({status:'hold',reasons:['AUTHENTICATED_SUBJECT_OVERLAP']})
},30000)

it.each(['depth','full-path'])('bounds hash-valid expanded tree %s before retaining amplified paths',async kind=>{
  const f=await fixture(),data=f.object('blob',Buffer.from('data'));let tree=f.object('tree',Buffer.concat([Buffer.from('100644 '+(kind==='full-path'?'x'.repeat(513):'leaf')+'\0'),Buffer.from(data,'hex')]))
  if(kind==='depth')for(let i=0;i<65;i++)tree=f.object('tree',Buffer.concat([Buffer.from('40000 x\0'),Buffer.from(tree,'hex')]))
  const raw=Buffer.from(`tree ${tree}\nparent ${f.s.oid}\nauthor Human <human@example.com> 10 +0000\ncommitter Human <human@example.com> 10 +0000\n\ndata\n`),head=f.object('commit',raw)
  expect(await f.inspect(head)).toMatchObject({status:'hold',reasons:['TREE_PATH_LIMIT']})
})

// Retained run 42743539633: helper-only evidence; its message is not RemoteSealV1.
const retainedRaw=Buffer.from("dHJlZSBmNWIyZTI0MDc1OTE0MGE4ODdlMGUxZWJlMDI0MDU2ZWUyYmQ5ZjVkCnBhcmVudCA5ZWIwMDk0YzZlMWQ4YjdkOGRmZTQ4OGIzMzliNTcxMDdkNDFjYjRmCmF1dGhvciBnaXRodWItYWN0aW9uc1tib3RdIDw0MTg5ODI4MitnaXRodWItYWN0aW9uc1tib3RdQHVzZXJzLm5vcmVwbHkuZ2l0aHViLmNvbT4gMTc5NDI3Nzk5OSArMDAwMApjb21taXR0ZXIgR2l0SHViIDxub3JlcGx5QGdpdGh1Yi5jb20+IDE3OTQyNzc5OTkgKzAwMDAKZ3Bnc2lnIC0tLS0tQkVHSU4gUEdQIFNJR05BVFVSRS0tLS0tCiAKIHdzRmNCQUFCQ0FBUUJRSnE4b0p2Q1JDMWFRN3V1NVVobEFBQUhESVFBQjdIbmRhcGg3M3ZkdzVoeU5JTWZRNUIKIEZydXNvVk9hTTdTODNaM09wNjloVGpEeTlFSEdPQVUvTVpxNVhhY2daalI3K2FHUnJKMldYaFdaNlFGVzNmSG8KIDRBQ29SZmpJTHA3a3JjZENDOUgwOENZTWlSVyt0UE5jVnI2R21ZMXZkRE5vSjdwZ1JLekJzVTg0Wk0xUzRZSEoKIDViMUxIZ1NZZU5qeFlJa1JqTnNNUEx5NXBWcS9ENjJNc2s0bW1qOGxUUHR6eFp1Z29NTUFydGdZV2lzZUJJK0EKIEhOUUYzYzJDdUh5YytrSnIxV0U5WGtuaWNRaHlPK1l4emRsYlJWaVVOZWJhdzB3RWFNZDBMVVEyUm9aZTJrTUQKIGQ3WE1vRDJlMmJQa2lraTJyTVpDTisrR0Y0WDJlZzFOdnIrTjk2R2UvRi9YVVVXNXBvMDdxZzRSd3RseWVHYmIKIHpNMVlSNFk0eTRDZnlwL2JPV2tyQ2hLVmNXZytYMmNHRUtKcDYrQmNyUHV2bWVETEdUb3RHZncrdFB0QWxjKzIKIElRT1c0b2h4aVFSR25BOWVNQzM2ajVLK05LSFhaWUlVYkJJN0ZkSEpNUWR6YWFJVHNoL3pqaWcwN2dsWTdzbjMKIFhlNGsraTRHMG9YWVNnZ1lOR2Z4SHZvaXczKzFZWjBlV1FldU1tQlV3N29XMHlsSEJROFZoNmhUR21IU3RsdVAKIEF6RFV6K2xKZjBXb3dTNE9tS3pFR2ZTVXowUVUvWkd6S2ZoUldGdzVzYnBCanJSYjlta0lFcXRDUzJtVWZSYUUKIFF4bUlxb0IzOEZtSjQ5MGZ5eFdKaFFRd1ZZVWtoVUMyMHJKZGQ3Z3g2V0kwR0pSWFZPMjdTU3VxVlRIWnowNnkKIGwzcWlndXJLdlhLVDhPdFdkaE1nCiA9Ynp2VwogLS0tLS1FTkQgUEdQIFNJR05BVFVSRS0tLS0tCiAKCldQMTItQjMgcHJlZmxpZ2h0IHNlYWwgcmVwbz0xNDUyMTE1NTY5IHJ1bj00Mjc0MzUzOTYzMyBhdHRlbXB0PTEgSz05ZWIwMDk0YzZlMWQ4YjdkOGRmZTQ4OGIzMzliNTcxMDdkNDFjYjRm",'base64')
const retainedFact:RemoteCommit={"oid":"402eadbae470ffbf48e8a9cbbceb1f295282586e","tree":"f5b2e240759140a887e0e1ebe024056ee2bd9f5d","parents":["9eb0094c6e1d8b7d8dfe488b339b57107d41cb4f"],"authorActorId":41898282,"committerActorId":null,"signerActorId":19864447,"signatureValid":true,"signatureState":"VALID","wasSignedByGitHub":true,"payload":"tree f5b2e240759140a887e0e1ebe024056ee2bd9f5d\nparent 9eb0094c6e1d8b7d8dfe488b339b57107d41cb4f\nauthor github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com> 1794277999 +0000\ncommitter GitHub <noreply@github.com> 1794277999 +0000\n\nWP12-B3 preflight seal repo=1452115569 run=42743539633 attempt=1 K=9eb0094c6e1d8b7d8dfe488b339b57107d41cb4f","signature":"-----BEGIN PGP SIGNATURE-----\n\nwsFcBAABCAAQBQJq8oJvCRC1aQ7uu5UhlAAAHDIQAB7Hndaph73vdw5hyNIMfQ5B\nFrusoVOaM7S83Z3Op69hTjDy9EHGOAU/MZq5XacgZjR7+aGRrJ2WXhWZ6QFW3fHo\n4ACoRfjILp7krcdCC9H08CYMiRW+tPNcVr6GmY1vdDNoJ7pgRKzBsU84ZM1S4YHJ\n5b1LHgSYeNjxYIkRjNsMPLy5pVq/D62Msk4mmj8lTPtzxZugoMMArtgYWiseBI+A\nHNQF3c2CuHyc+kJr1WE9XknicQhyO+YxzdlbRViUNebaw0wEaMd0LUQ2RoZe2kMD\nd7XMoD2e2bPkiki2rMZCN++GF4X2eg1Nvr+N96Ge/F/XUUW5po07qg4RwtlyeGbb\nzM1YR4Y4y4Cfyp/bOWkrChKVcWg+X2cGEKJp6+BcrPuvmeDLGTotGfw+tPtAlc+2\nIQOW4ohxiQRGnA9eMC36j5K+NKHXZYIUbBI7FdHJMQdzaaITsh/zjig07glY7sn3\nXe4k+i4G0oXYSggYNGfxHvoiw3+1YZ0eWQeuMmBUw7oW0ylHBQ8Vh6hTGmHStluP\nAzDUz+lJf0WowS4OmKzEGfSUz0QU/ZGzKfhRWFw5sbpBjrRb9mkIEqtCS2mUfRaE\nQxmIqoB38FmJ490fyxWJhQQwVYUkhUC20rJdd7gx6WI0GJRXVO27SSuqVTHZz06y\nl3qigurKvXKT8OtWdhMg\n=bzvW\n-----END PGP SIGNATURE-----\n","evidence":[{"path":"retained/api.json","sha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","bytes":1}]}
const retainedIdentity={writerActorId:41898282,platformSignerActorId:19864447}
it('binds the retained 1182-byte seal to bot author and platform signature with nullable GraphQL committer',()=>{
  expect(retainedRaw.length).toBe(1182)
  expect(()=>verifyRemoteSealSignature(retainedRaw,retainedFact,retainedIdentity)).not.toThrow()
})
it.each(['author-missing','author-wrong','signer-missing','signer-wrong','invalid-signature','payload','raw-oid','signature-tail','signature-terminal-continuation'])('rejects retained helper evidence tampering %s',kind=>{
  const fact={...retainedFact};let raw=Buffer.from(retainedRaw)
  if(kind==='author-missing')fact.authorActorId=null
  if(kind==='author-wrong')fact.authorActorId=19864447
  if(kind==='signer-missing')fact.signerActorId=null
  if(kind==='signer-wrong')fact.signerActorId=41898282
  if(kind==='invalid-signature')fact.signatureValid=false
  if(kind==='payload')fact.payload+='x'
  if(kind==='raw-oid')fact.oid='a'.repeat(40)
  if(kind==='signature-terminal-continuation')raw=Buffer.from(raw.toString().replace(' \n\n','\n'))
  if(kind==='signature-tail')raw=Buffer.from(raw.toString().replace(' =bzvW',' =bzvX'))
  expect(()=>verifyRemoteSealSignature(raw,fact,retainedIdentity)).toThrow()
})

it('binds genuine capabilities to exact reads policy and current inspection roots rather than structural membership',async()=>{
  const f=await fixture(),reads=f.reads(),request={head:f.s.oid,donorHeads:[],master:f.master,policy:f.policy}
  const result=await inspectRemoteHistory(request,reads,f.objects);expect(result.status).toBe('verified');if(result.status!=='verified')return
  const binding={...request,reads}
  expect(()=>assertRemoteHistoryBinding(result.history,binding)).not.toThrow()
  for(const changed of [{reads:f.reads()},{policy:{...f.policy,writerActorId:28}},{head:f.k.oid},{master:f.k.oid},{donorHeads:[f.s.oid]}])
    expect(()=>assertRemoteHistoryBinding(result.history,{...binding,...changed})).toThrow('REMOTE_HISTORY_CONTEXT_CHANGED')
  expect(()=>assertRemoteHistoryBinding(JSON.parse(JSON.stringify(result.history)),binding)).toThrow('REMOTE_HISTORY_CONTEXT_CHANGED')
})
