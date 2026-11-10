import { constants } from 'node:fs'
import { open } from 'node:fs/promises'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { createHash } from 'node:crypto'
import { canonicalBytes, digest, parseStrictJson } from '../../core/updates/canonical'
import { CandidateSnapshotProofSchema, UpdateUnitPlanSchema, type BlobRef } from '../../core/updates/envelope'
import { immutable } from '../../core/updates/types'
import { parseRevisionMessage, assertRevisionBinding, encodeRevisionMessage } from '../../core/updates/metadata'
import { assertNextOnlyDiff } from '../../core/updates/transaction'
import { RemoteTransactionIntentSchema, RemoteTransactionJournalSchema, encodeSealMessage, parseSealMessage,
  acceptExactValidation, ExactValidationReceiptV1Schema, ProducerBundleReceiptSchema, REMOTE_IO_LIMITS, type RemoteReadResult, type RemoteTransactionIntent, type RemoteSealV1, type RemotePull } from '../../core/updates/remote'
import { type EvidenceStore, rawSha256, writeOwnedBlob, readRegularBytes } from './evidence'
import { createRemoteMutationFixtureClient, remoteReadContext, type RemoteReads, type RemoteTransport } from './remote-github'
import { verifyRemoteSealSignature, inspectRemoteHistory, type RemoteObjects } from './remote-metadata'

type ObjectType='commit'|'tree'|'blob'
export interface RemoteTransactionObjectReads { read(oid:string,type:ObjectType):Promise<RemoteReadResult<Uint8Array>> }
export interface RemoteTransactionResult {
  status:'report-only'|'hold'|'accepted'; reasons:string[]; evidence:BlobRef[]; seal?:string; prNumber?:number;
  readyProposal?:{prNumber:number;head:string}; donorCloseProposals?:{prNumber:number;head:string;survivor:number;seal:string}[];
  observation?:{target:string|null;staging:string|null;targetState:'old'|'written'|'written-stale'|'unknown';pulls:number[];pullHeads:{number:number;head:string;headRef:string;state:string;draft:boolean}[];intentBindings:boolean};
}
class TransactionHold extends Error {}
const check=(value:unknown,reason:string):void=>{if(!value)throw new TransactionHold(reason)}
const same=(a:unknown,b:unknown)=>Buffer.from(canonicalBytes(a)).equals(Buffer.from(canonicalBytes(b)))
const found=<T>(value:RemoteReadResult<T>):T=>{check(value.kind==='found','REMOTE_STATE_UNKNOWN');return (value as {kind:'found';value:T}).value}
const hashObject=(type:ObjectType,bytes:Uint8Array)=>createHash('sha1').update(`${type} ${bytes.length}\0`).update(bytes).digest('hex')
const refOid=(value:RemoteReadResult<{oid:string}>)=>value.kind==='found'?value.value.oid:value.kind==='absent'?null:(()=>{throw new TransactionHold('REMOTE_STATE_UNKNOWN')})()
const zero='0'.repeat(40)
interface GitObject {oid:string;type:ObjectType;bytes:Buffer;dependencies:{oid:string;type:ObjectType}[];tree?:string;parents?:string[];message?:Uint8Array}
function parseObject(oid:string,type:ObjectType,input:Uint8Array):GitObject {
  const bytes=Buffer.from(input);check(bytes.length<=REMOTE_IO_LIMITS.objectBytes&&hashObject(type,bytes)===oid,'OBJECT_BYTES_OID')
  const result:GitObject={oid,type,bytes,dependencies:[]}
  if(type==='commit') {
    const split=bytes.indexOf('\n\n');check(split>0&&split<=8192,'COMMIT_HEADER')
    const text=new TextDecoder('utf8',{fatal:true}).decode(bytes.subarray(0,split)),lines=text.split('\n')
    check(/^tree [a-f0-9]{40}$/.test(lines[0])&&!text.includes('\r')&&!text.includes('\0'),'COMMIT_HEADER')
    const parents:string[]=[];let at=1
    while(lines[at]?.startsWith('parent ')){check(/^parent [a-f0-9]{40}$/.test(lines[at]),'COMMIT_PARENT');parents.push(lines[at++].slice(7))}
    check(parents.length<=2&&new Set(parents).size===parents.length,'COMMIT_PARENT')
    check(/^author .+ <[^<>]+> \d+ [+-]\d{4}$/.test(lines[at++])&&/^committer .+ <[^<>]+> \d+ [+-]\d{4}$/.test(lines[at++]),'COMMIT_IDENTITY')
    result.tree=lines[0].slice(5);result.parents=parents;result.message=bytes.subarray(split+2)
    result.dependencies=[{oid:result.tree,type:'tree'},...parents.map(parent=>({oid:parent,type:'commit' as const}))]
  } else if(type==='tree') {
    let at=0;const names=new Set<string>();let previous:Buffer|undefined
    while(at<bytes.length) {
      const end=bytes.indexOf(0,at);check(end>at&&end+21<=bytes.length,'TREE_BYTES')
      const header=new TextDecoder('utf8',{fatal:true}).decode(bytes.subarray(at,end)),match=/^(40000|100644|100755|120000) ([^/\0]+)$/.exec(header)
      check(match&&match[2]!=='.'&&match[2]!=='..'&&!names.has(match[2]),'TREE_ENTRY')
      names.add(match[2]);const order=Buffer.from(match[2]+(match[1]==='40000'?'/':''));check(!previous||Buffer.compare(previous,order)<0,'TREE_ORDER');previous=order
      result.dependencies.push({oid:bytes.subarray(end+1,end+21).toString('hex'),type:match[1]==='40000'?'tree':'blob'});at=end+21
    }
  }
  return result
}
function treeEntries(object:GitObject):{name:string;mode:string;oid:string;type:'tree'|'blob'}[] {
  const entries=[];let at=0
  while(at<object.bytes.length){const end=object.bytes.indexOf(0,at),[mode,name]=object.bytes.subarray(at,end).toString('utf8').split(/ (.*)/s);entries.push({mode,name,oid:object.bytes.subarray(end+1,end+21).toString('hex'),type:mode==='40000'?'tree' as const:'blob' as const});at=end+21}
  return entries
}
/** Production authority installation is deliberately absent until the trusted capture bridge is qualified.
 * Neither structural objects nor a fixture capability can make this constructor write. */
export function createRemoteTransaction(input:{reads:RemoteReads;writerCapability?:unknown;evidence:EvidenceStore}) {
  return {apply:async(_intent:unknown):Promise<RemoteTransactionResult>=>({status:'report-only',reasons:['WRITER_DISABLED'],evidence:[]}),
    reconcile:(intent:unknown)=>reconstruct(input.reads,input.evidence,intent)}
}
function policyIntent(reads:RemoteReads,value:unknown):RemoteTransactionIntent {
  const intent=immutable(RemoteTransactionIntentSchema.parse(value)) as RemoteTransactionIntent,context=remoteReadContext(reads)
  check(context,'REMOTE_ADAPTER_REQUIRED');const policy=context.policy
  check(intent.repositoryId===policy.repositoryId&&intent.repositoryFullName===policy.repositoryFullName,'INTENT_REPOSITORY')
  check(intent.targetRef!=='master'&&intent.targetRef!=='dev'&&!intent.targetRef.startsWith('shared-update-staging/')&&policy.allowedHeadPrefixes.some(prefix=>intent.targetRef.startsWith(prefix)),'TARGET_POLICY')
  return intent
}
function sealMetadata(intent:RemoteTransactionIntent):RemoteSealV1 {
  return {kind:'shared-update-seal',schemaVersion:1,repositoryId:intent.repositoryId,transactionId:intent.transactionId,unitKey:intent.unitKey,
    planSha256:intent.planSha256,proofSha256:intent.proofSha256,master:intent.master,dev:intent.dev,preparedBase:intent.preparedBase,
    candidate:intent.candidate,candidateTree:intent.candidateTree,previousSeal:intent.previousSeal,preservedHumanHeads:intent.preservedHumanHeads,
    runId:intent.producerRunId,runAttempt:intent.producerRunAttempt}
}
async function exactPulls(reads:RemoteReads,intent:RemoteTransactionIntent,target?:string) {
  const pulls=found(await reads.scanPulls({state:'all'})),policy=remoteReadContext(reads)!.policy
  for(const expected of intent.pulls) {
    const actual=pulls.filter(pull=>pull.number===expected.number);check(actual.length===1,'PULL_CHANGED');const pull=actual[0]
    check(pull.repositoryId===intent.repositoryId&&pull.baseRepositoryId===intent.repositoryId&&pull.headRepositoryId===intent.repositoryId&&pull.baseRef==='master'&&pull.base===intent.master&&pull.actorId===policy.writerActorId&&pull.headRef===expected.headRef&&pull.createdAt===expected.createdAt,'PULL_CHANGED')
    check(pull.head===(pull.headRef===intent.targetRef&&target?target:expected.head),'PULL_HEAD_CHANGED')
    check((pull.state===expected.state||pull.state==='closed'&&pull.headRef!==intent.targetRef)&& (pull.state!=='open'||pull.draft),'PULL_STATE_CHANGED')
  }
  if(intent.pulls.length) {
    const open=intent.pulls.filter(pull=>pull.state==='open').sort((a,b)=>Date.parse(a.createdAt)-Date.parse(b.createdAt)||a.number-b.number)
    check(open.length&&open[0].headRef===intent.targetRef&&open[0].head===intent.expectedHead,'SURVIVOR_ORDER')
    check(intent.pulls.every(pull=>intent.preservedHumanHeads.includes(pull.head)),'PRESERVED_HEADS_REQUIRED')
  } else check(intent.expectedHead===null,'SURVIVOR_MISSING')
  return pulls
}
async function preflight(reads:RemoteReads,intent:RemoteTransactionIntent,target:string|null) {
  const policy=remoteReadContext(reads)!.policy,repository=found(await reads.readRepository())
  check(repository.id===intent.repositoryId&&repository.fullName===intent.repositoryFullName,'REPOSITORY_CHANGED')
  check(refOid(await reads.readRef('master'))===intent.master&&refOid(await reads.readRef('dev'))===intent.dev,'BASE_CHANGED')
  check(refOid(await reads.readRef(intent.targetRef))===target,'TARGET_CHANGED')
  const pulls=await exactPulls(reads,intent,target??undefined)
  const matching=pulls.filter(pull=>pull.headRef===intent.targetRef)
  check(matching.length<=1,'PULL_AMBIGUOUS')
  if(matching.length)check(matching[0].state==='open'&&matching[0].draft&&matching[0].actorId===policy.writerActorId,'PULL_STATE_CHANGED')
  return pulls
}
async function verifiedSeal(reads:RemoteReads,objects:RemoteTransactionObjectReads,intent:RemoteTransactionIntent,oid:string) {
  const raw=found(await objects.read(oid,'commit')),object=parseObject(oid,'commit',raw),fact=found(await reads.readCommit(oid)),policy=remoteReadContext(reads)!.policy
  check(same(object.parents,[intent.candidate])&&object.tree===intent.candidateTree&&same(parseSealMessage(object.message!),sealMetadata(intent)),'SEAL_INTENT')
  check(fact.oid===oid&&fact.tree===object.tree&&same(fact.parents,object.parents),'SEAL_API_OBJECT')
  verifyRemoteSealSignature(raw,fact,{writerActorId:policy.writerActorId,platformSignerActorId:policy.sealIdentity.platformSignerActorId})
  return {object,fact}
}
/** Read-only reconstruction. It never retries a mutation, even when the old head is still visible. */
async function reconstruct(reads:RemoteReads,evidence:EvidenceStore,value:unknown,objects?:RemoteTransactionObjectReads):Promise<RemoteTransactionResult> {
  const retained:BlobRef[]=[]
  try {
    const intent=policyIntent(reads,value),target=refOid(await reads.readRef(intent.targetRef)),staging=refOid(await reads.readRef(intent.stagingRef))
    const pulls=found(await reads.scanPulls({state:'all'}));let seal:string|undefined,state:'old'|'written'|'written-stale'|'unknown'=target===intent.expectedHead?'old':'unknown'
    if(staging&&staging!==intent.candidate&&objects){await verifiedSeal(reads,objects,intent,staging);seal=staging
      if(target===seal)state='written'
      else if(target) {
        const pending=[target],seen=new Set<string>();let reaches=false
        while(pending.length){check(seen.size<1024,'RECONCILE_ANCESTRY_LIMIT');const oid=pending.pop()!;if(oid===seal){reaches=true;continue}if(seen.has(oid))continue;seen.add(oid);const object=parseObject(oid,'commit',found(await objects.read(oid,'commit')));pending.push(...object.parents!)}
        if(reaches)state='written-stale'
      }
    }
    const pullHeads=pulls.filter(pull=>pull.headRef===intent.targetRef||intent.pulls.some(expected=>expected.number===pull.number)).map(({number,head,headRef,state,draft})=>({number,head,headRef,state,draft}))
    const intentBindings=intent.pulls.every(expected=>pulls.some(pull=>pull.number===expected.number&&pull.head===(pull.headRef===intent.targetRef&&seal?seal:expected.head)&&pull.headRef===expected.headRef&&pull.actorId===remoteReadContext(reads)!.policy.writerActorId&&pull.base===intent.master&&pull.baseRef==='master'&&(pull.state!=='open'||pull.draft)&&(pull.state===expected.state||pull.state==='closed'&&pull.headRef!==intent.targetRef)))
    const rawObjects:unknown[]=[]
    if(objects)for(const oid of new Set([target,staging,intent.candidate,intent.preparedBase,...intent.preservedHumanHeads].filter((oid):oid is string=>oid!==null))){const read=await objects.read(oid,'commit');if(read.kind==='absent'){rawObjects.push({oid,absent:true});continue}const object=parseObject(oid,'commit',found(read));rawObjects.push({oid,tree:object.tree,parents:object.parents,rawSha256:rawSha256(object.bytes)})}
    const observation={target,staging,targetState:state,pulls:pulls.filter(pull=>pull.headRef===intent.targetRef).map(pull=>pull.number),pullHeads,intentBindings}
    const basesMatch=refOid(await reads.readRef('master'))===intent.master&&refOid(await reads.readRef('dev'))===intent.dev
    retained.push(await writeOwnedBlob(evidence,canonicalBytes({kind:'remote-transaction-reconstruction',intentSha256:rawSha256(canonicalBytes(intent)),observation,basesMatch,rawObjects,seal:seal??null})))
    return {status:'hold',reasons:[!basesMatch?'BASE_CHANGED':state==='written-stale'?'TARGET_STALE':!intentBindings?'PULL_CHANGED':state==='unknown'?'REMOTE_STATE_UNKNOWN':'RECONCILED_EXPLICIT_INVOCATION_REQUIRED'],evidence:retained,seal,observation}
  } catch {return {status:'hold',reasons:['REMOTE_STATE_UNKNOWN'],evidence:retained}}
}

/** Internal offline harness. Supplied executable seams are trusted fixture code, never qualification.
 * The returned marker has no production mint authority and is rejected by createRemoteTransaction. */
export function createRemoteTransactionFixture(input:{reads:RemoteReads;evidence:EvidenceStore;transport:RemoteTransport;scratch:RemoteObjects;remoteObjects:RemoteTransactionObjectReads;authenticate:(request:{intentSha256:string;intent:RemoteTransactionIntent})=>Promise<void>;validatorInstalled?:()=>Promise<void>}) {
  const writerCapability=Object.freeze({kind:'fixture-only-remote-writer'})
  check(typeof input.authenticate==='function','FIXTURE_AUTHENTICATOR_REQUIRED')
  let used=false,poisoned=false,sequence=0,calls=0
  const deadline=performance.now()+REMOTE_IO_LIMITS.inspectionMilliseconds
  const budget=()=>{check(performance.now()<deadline&&++calls<=REMOTE_IO_LIMITS.calls&&retained.length<1024,'TRANSACTION_BUDGET')}
  const bounded=async<T>(work:()=>Promise<T>):Promise<T>=>{budget();let timer:ReturnType<typeof setTimeout>;try{return await Promise.race([work(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{poisoned=true;reject(new TransactionHold('TRANSACTION_BUDGET'))},Math.max(1,deadline-performance.now()))})])}finally{clearTimeout(timer!)}}
  const remoteObjects:RemoteTransactionObjectReads={read:(oid,type)=>bounded(()=>input.remoteObjects.read(oid,type))}
  const retained:BlobRef[]=[]
  const journal=async(intent:RemoteTransactionIntent,phase:'before'|'after'|'hold'|'reconcile',action:string,observation:unknown=null,reasons:string[]=[])=>{
    budget();const ref=observation===null?null:await bounded(()=>writeOwnedBlob(input.evidence,canonicalBytes(observation)));if(ref)retained.push(ref)
    const record=RemoteTransactionJournalSchema.parse({kind:'shared-update-remote-journal',schemaVersion:1,intentSha256:rawSha256(canonicalBytes(intent)),transactionId:intent.transactionId,sequence:sequence++,phase,action,observation:ref,reasons})
    retained.push(await bounded(()=>writeOwnedBlob(input.evidence,canonicalBytes(record))))
  }
  const apply=async(value:unknown):Promise<RemoteTransactionResult>=>{
    let intent:RemoteTransactionIntent|undefined,seal:string|undefined,prNumber:number|undefined
    try {
      check(!used&&!poisoned,'FRESH_INVOCATION_REQUIRED');used=true
      intent=policyIntent(input.reads,value);await bounded(()=>input.authenticate({intentSha256:rawSha256(canonicalBytes(intent!)),intent:intent!}));const context=remoteReadContext(input.reads)!,policy=context.policy
      await journal(intent,'before','authenticate',intent)
      const initialStaging=refOid(await input.reads.readRef(intent.stagingRef)),initialTarget=refOid(await input.reads.readRef(intent.targetRef))
      if(initialStaging&&initialStaging!==intent.candidate){await verifiedSeal(input.reads,remoteObjects,intent,initialStaging);seal=initialStaging}
      const alreadyWritten=!!seal&&initialTarget===seal
      await preflight(input.reads,intent,alreadyWritten?seal!:intent.expectedHead)
      const planBytes=await bounded(()=>input.evidence.readBlob(intent!.plan)),proofBytes=await bounded(()=>input.evidence.readBlob(intent!.proof))
      const plan=UpdateUnitPlanSchema.parse(parseStrictJson(planBytes)),proof=CandidateSnapshotProofSchema.parse(parseStrictJson(proofBytes))
      check(Buffer.from(planBytes).equals(Buffer.from(canonicalBytes(plan)))&&Buffer.from(proofBytes).equals(Buffer.from(canonicalBytes(proof))),'NONCANONICAL_INTENT_MATERIAL')
      check(digest('plan',plan)===intent.planSha256&&rawSha256(proofBytes)===intent.proofSha256&&plan.unitKey===intent.unitKey&&plan.disposition==='candidate','PLAN_BINDING')
      check(proof.candidate===intent.candidate&&proof.candidateTree===intent.candidateTree&&proof.prepared.base===intent.preparedBase&&proof.prepared.master===intent.master&&same(proof.preservedHumanHeads,intent.preservedHumanHeads)&&same(proof.nextEdits,plan.nextEdits),'PROOF_BINDING')
      const discovered=found(await input.reads.scanPulls({state:'all'})),eligible:number[]=[],historyCandidates=new Map<string,string>()
      for(const pull of discovered.filter(pull=>pull.state==='open'||intent!.pulls.some(expected=>expected.number===pull.number))) {
        check(pull.actorId===policy.writerActorId&&pull.base===intent.master&&pull.baseRef==='master'&&pull.repositoryId===intent.repositoryId&&pull.baseRepositoryId===intent.repositoryId&&pull.headRepositoryId===intent.repositoryId&&(pull.state!=='open'||pull.draft),'PULL_IDENTITY')
        const activeTarget=alreadyWritten&&pull.headRef===intent.targetRef&&pull.head===seal
        if(activeTarget&&!intent.pulls.some(expected=>expected.number===pull.number))continue
        const historyHead=activeTarget?intent.expectedHead:pull.head
        check(historyHead,'PULL_HISTORY_UNESTABLISHED')
        const history=await bounded(()=>inspectRemoteHistory({head:historyHead!,donorHeads:[],master:intent!.master,policy},input.reads,{read:async(oid,type)=>found(await remoteObjects.read(oid,type))}))
        check(history.status==='verified','PULL_HISTORY_UNESTABLISHED')
        if(history.status==='verified'){historyCandidates.set(history.history.seal,history.history.candidate);check(history.history.unitKey===intent.unitKey||!history.history.subjects.some(subject=>plan.subjects.some(wanted=>same(wanted,subject))),'AUTHENTICATED_SUBJECT_OVERLAP');if(history.history.unitKey===intent.unitKey&&pull.state==='open')eligible.push(pull.number)}
      }
      check(same(eligible.sort((a,b)=>a-b),intent.pulls.filter(pull=>pull.state==='open'&&discovered.some(actual=>actual.number===pull.number&&actual.state==='open')).map(pull=>pull.number).sort((a,b)=>a-b)),'PULL_SET_CHANGED')
      const initialPulls=found(await input.reads.scanPulls({state:'all'}));const projection=(pulls:RemotePull[])=>pulls.map(({number,head,headRef,base,draft,actorId,createdAt,state})=>({number,head,headRef,base,draft,actorId,createdAt,state})).sort((a,b)=>a.number-b.number);check(same(projection(discovered),projection(initialPulls)),'PULL_SET_CHANGED')
      const projectOthers=(pulls:RemotePull[])=>pulls.filter(pull=>pull.headRef!==intent!.targetRef&&pull.state==='open').map(({number,head,headRef,base,draft,actorId,createdAt})=>({number,head,headRef,base,draft,actorId,createdAt})).sort((a,b)=>a.number-b.number),otherInventory=projectOthers(initialPulls)
      const flight=async(target:string|null)=>{const observed=await preflight(input.reads,intent!,target);check(same(projectOthers(observed),otherInventory),'PULL_SET_CHANGED');return observed}
      const graph=new Map<string,GitObject>(),order:GitObject[]=[],active=new Set<string>();let total=0
      const visit=async(oid:string,type:ObjectType):Promise<void>=>{
        const previous=graph.get(oid);if(previous){check(previous.type===type,'OBJECT_TYPE_CONFLICT');return}
        check(!active.has(oid)&&graph.size+active.size<10000,'OBJECT_CLOSURE_LIMIT');active.add(oid)
        const object=parseObject(oid,type,await bounded(()=>input.scratch.read(oid,type)));total+=object.bytes.length;check(total<=REMOTE_IO_LIMITS.objectBytes,'OBJECT_CLOSURE_LIMIT')
        for(const dependency of object.dependencies)await visit(dependency.oid,dependency.type)
        active.delete(oid);graph.set(oid,object);order.push(object)
      }
      await visit(intent.candidate,'commit');await visit(intent.master,'commit');await visit(intent.dev,'commit')
      const candidate=graph.get(intent.candidate)!,prepared=graph.get(intent.preparedBase)!;check(proof.prepared.tree===prepared.tree,'PREPARED_TREE_BINDING')
      const revision=parseRevisionMessage(candidate.message!);check(revision,'CANDIDATE_REVISION_REQUIRED')
      check(intent.previousSeal?historyCandidates.get(intent.previousSeal)===revision.previousBotCommit:revision.previousBotCommit===null,'PREVIOUS_SEAL_BINDING')
      assertRevisionBinding(revision,{parent:intent.preparedBase,master:intent.master,tools:intent.master,planSha256:intent.planSha256,unitKey:intent.unitKey,memberSetSha256:plan.membersSha256})
      check(revision.dev===intent.dev&&same(revision.subjects,plan.subjects)&&same(revision.preservedHumanHeads,intent.preservedHumanHeads)&&same(revision.lockDeltas,plan.nextEdits.map(edit=>({path:edit.before.path,current:edit.before.current,oldNext:edit.before.next,next:edit.target}))),'REVISION_BINDING')
      const parentTime=/\ncommitter .+ (\d+) [+-]\d{4}\n/.exec(prepared.bytes.toString('utf8')),time=Number(parentTime?.[1])+1,identity='Shared update local <shared-update-local@localhost>'
      check(Number.isSafeInteger(time)&&time<253402300799&&candidate.bytes.equals(Buffer.from(`tree ${intent.candidateTree}\nparent ${intent.preparedBase}\nauthor ${identity} ${time} +0000\ncommitter ${identity} ${time} +0000\n\n${encodeRevisionMessage(revision).commitMessage}`)),'CANDIDATE_NOT_DETERMINISTIC')
      check(same(candidate.parents,[intent.preparedBase])&&candidate.tree===intent.candidateTree,'CANDIDATE_BINDING')
      const ancestor=(old:string,next:string)=>{const pending=[next],seen=new Set<string>();while(pending.length){const oid=pending.pop()!;if(oid===old)return true;if(seen.has(oid))continue;seen.add(oid);const object=graph.get(oid);if(object?.type==='commit')pending.push(...object.parents!)}return false}
      check(ancestor(intent.master,intent.preparedBase)&&intent.preservedHumanHeads.every(head=>ancestor(head,intent.preparedBase)),'PRESERVED_ANCESTRY')
      const flatten=(root:string):Map<string,{mode:string;oid:string}>=>{
        const result=new Map<string,{mode:string;oid:string}>(),pending=[{oid:root,prefix:'',depth:0}];let expanded=0
        while(pending.length){budget();const current=pending.pop()!;check(current.depth<=64,'TREE_EXPANSION_LIMIT')
          for(const entry of treeEntries(graph.get(current.oid)!)){check(++expanded<=10000&&current.prefix.length+entry.name.length<=512,'TREE_EXPANSION_LIMIT');const path=current.prefix+entry.name
            if(entry.type==='tree')pending.push({oid:entry.oid,prefix:path+'/',depth:current.depth+1});else {check(result.size<10000,'TREE_EXPANSION_LIMIT');result.set(path,{mode:entry.mode,oid:entry.oid})}}
        }
        return result
      }
      const before=flatten(graph.get(intent.preparedBase)!.tree!),after=flatten(intent.candidateTree),changed=[...new Set([...before.keys(),...after.keys()])].filter(path=>!same(before.get(path)??null,after.get(path)??null))
      check(changed.length===plan.nextEdits.length,'CANDIDATE_NOT_NEXT_ONLY')
      assertNextOnlyDiff(changed.map(path=>{const a=before.get(path),b=after.get(path),edit=plan.nextEdits.find(edit=>edit.before.path===path);check(a&&b&&edit,'CANDIDATE_NOT_NEXT_ONLY');return {path,edit,beforeBytes:graph.get(a.oid)!.bytes,afterBytes:graph.get(b.oid)!.bytes,beforeMode:a.mode,afterMode:b.mode}}))
      const mutate=createRemoteMutationFixtureClient({transport:input.transport,repositoryFullName:policy.repositoryFullName,repositoryId:await context.repositoryNodeId(),targetRef:intent.targetRef,stagingRef:intent.stagingRef,workflowId:policy.validator.workflowId,observe:async observation=>{retained.push(await bounded(()=>writeOwnedBlob(input.evidence,canonicalBytes({kind:'remote-mutation-observation',transactionId:intent!.transactionId,...observation}))))}})
      const write=async(action:Parameters<typeof mutate>[0],body:Record<string,any>,readback:(response:any)=>Promise<unknown>)=>{
        budget();check(!poisoned,'MUTATIONS_STOPPED');await bounded(()=>input.authenticate({intentSha256:rawSha256(canonicalBytes(intent!)),intent:intent!}));await journal(intent!,'before',action,{bodySha256:rawSha256(canonicalBytes(body))})
        try {const response=await bounded(()=>mutate(action,body)),observation=await bounded(()=>readback(response));await journal(intent!,'after',action,observation);return observation}
        catch {poisoned=true;throw new TransactionHold('REMOTE_STATE_UNKNOWN')}
      }
      // Authenticate every existing remote object by its actual bytes; absence is supplied by the fixture's complete object inventory.
      const missing:GitObject[]=[]
      for(const object of order){const remote=await remoteObjects.read(object.oid,object.type);if(remote.kind==='found')check(Buffer.from(remote.value).equals(object.bytes)&&hashObject(object.type,remote.value)===object.oid,'REMOTE_OBJECT_MISMATCH');else {check(remote.kind==='absent','REMOTE_STATE_UNKNOWN');missing.push(object)}}
      // Validate representability of all missing objects before uploading the first one. Signed/extension commits are never normalized.
      const bodies=new Map<string,Record<string,any>>()
      for(const object of missing) {
        if(object.type==='blob')bodies.set(object.oid,{content:object.bytes.toString('base64'),encoding:'base64'})
        else if(object.type==='tree')bodies.set(object.oid,{tree:treeEntries(object).map(entry=>({path:entry.name,mode:entry.mode==='40000'?'040000':entry.mode,type:entry.type,sha:entry.oid}))})
        else {
          const split=object.bytes.indexOf('\n\n'),lines=object.bytes.subarray(0,split).toString('utf8').split('\n'),at=1+object.parents!.length
          check(lines.length===at+2,'COMMIT_UPLOAD_UNREPRESENTABLE')
          const person=(line:string)=>{const match=/^(?:author|committer) (.+) <([^<>]+)> (\d+) ([+-])(\d{2})(\d{2})$/.exec(line);check(match,'COMMIT_UPLOAD_UNREPRESENTABLE');const seconds=Number(match[3]),offset=(Number(match[5])*60+Number(match[6]))*(match[4]==='+'?1:-1);check(Number.isSafeInteger(seconds)&&Math.abs(offset)<=840,'COMMIT_UPLOAD_UNREPRESENTABLE');return {name:match[1],email:match[2],date:new Date((seconds+offset*60)*1000).toISOString().replace('.000Z',`${match[4]}${match[5]}:${match[6]}`)}}
          const message=new TextDecoder('utf8',{fatal:true}).decode(object.message!);check(Buffer.from(message).equals(Buffer.from(object.message!)),'COMMIT_UPLOAD_UNREPRESENTABLE')
          bodies.set(object.oid,{tree:object.tree,parents:object.parents,author:person(lines[at]),committer:person(lines[at+1]),message})
        }
      }
      for(const object of missing)await write(object.type,bodies.get(object.oid)!,async response=>{check(response.sha===object.oid,'UPLOAD_OID_MISMATCH');const bytes=found(await remoteObjects.read(object.oid,object.type));check(Buffer.from(bytes).equals(object.bytes),'UPLOAD_READBACK');return {oid:object.oid,type:object.type}})
      await flight(alreadyWritten?seal!:intent.expectedHead)
      let staging=refOid(await input.reads.readRef(intent.stagingRef))
      if(staging===null){await write('cas',{name:intent.stagingRef,beforeOid:zero,afterOid:intent.candidate,force:false},async()=>{check(refOid(await input.reads.readRef(intent!.stagingRef))===intent!.candidate,'STAGING_READBACK');return {staging:intent!.candidate}});staging=intent.candidate}
      if(staging===intent.candidate) {
        const message=encodeSealMessage(sealMetadata(intent)),[headline,...rest]=message.split('\n')
        await write('seal',{expectedHeadOid:intent.candidate,message:{headline,body:rest.join('\n').replace(/^\n/,'')}},async response=>{
          const oid=response.data?.createCommitOnBranch?.commit?.oid;check(typeof oid==='string','SEAL_RESPONSE_INCOMPLETE')
          check(refOid(await input.reads.readRef(intent!.stagingRef))===oid,'SEAL_READBACK');const verified=await verifiedSeal(input.reads,remoteObjects,intent!,oid);seal=oid;return {seal:oid,evidence:verified.fact.evidence}
        })
      } else {await verifiedSeal(input.reads,remoteObjects,intent,staging);seal=staging}
      await flight(alreadyWritten?seal!:intent.expectedHead)
      if(!alreadyWritten)await write('cas',{name:intent.targetRef,beforeOid:intent.expectedHead??zero,afterOid:seal,force:false},async()=>{await flight(seal!);return {target:seal}})
      let pulls=found(await input.reads.scanPulls({state:'all'})),matches=pulls.filter(pull=>pull.headRef===intent!.targetRef)
      check(matches.length<=1,'PULL_AMBIGUOUS')
      if(!matches.length) {
        await write('draft',{title:`Shared update ${intent.unitKey}`,head:intent.targetRef,base:'master',draft:true,body:`Shared-Update-Transaction: ${intent.transactionId}\nSeal: ${seal}`},async response=>{
          check(Number.isSafeInteger(response.number)&&response.number>0,'PULL_RESPONSE_INCOMPLETE')
          pulls=found(await input.reads.scanPulls({state:'all'}));matches=pulls.filter(pull=>pull.headRef===intent!.targetRef);check(matches.length===1&&matches[0].number===response.number,'PULL_READBACK');return {number:response.number}
        })
      }
      const pull=matches[0];check(pull&&pull.head===seal&&pull.base===intent.master&&pull.baseRef==='master'&&pull.actorId===policy.writerActorId&&pull.state==='open'&&pull.draft,'PULL_IDENTITY');prNumber=pull.number
      await flight(seal!)
      if(!input.validatorInstalled){await journal(intent,'hold','validation',null,['VALIDATOR_NOT_INSTALLED']);return {status:'hold',reasons:['VALIDATOR_NOT_INSTALLED'],evidence:[...retained],seal,prNumber}}
      await bounded(()=>input.validatorInstalled!())
      let runs=found(await input.reads.findValidationRuns({requestId:intent.requestId,master:intent.master}))
      check(runs.length<=1,'VALIDATION_AMBIGUOUS')
      if(!runs.length){
        // Durable veto only: a fresh/empty root never establishes cross-run authority.
        const markerBytes=canonicalBytes({kind:'remote-dispatch-attempt',intentSha256:rawSha256(canonicalBytes(intent)),requestId:intent.requestId,seal}),markerName=`remote-dispatch-${rawSha256(canonicalBytes({repositoryId:intent.repositoryId,requestId:intent.requestId}))}.json`,markerPath=join(input.evidence.root,markerName)
        let attempted=false
        try{await bounded(()=>readRegularBytes(markerPath,4096));attempted=true}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw new TransactionHold('DISPATCH_LEDGER_UNESTABLISHED')}
        if(!attempted){
          await flight(seal!);await bounded(()=>writeOwnedBlob(input.evidence,markerBytes))
          let marker:Awaited<ReturnType<typeof open>>
          try{marker=await bounded(()=>open(markerPath,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600))}catch(error){if((error as NodeJS.ErrnoException).code==='EEXIST')throw new TransactionHold('VALIDATION_PENDING');throw error}
          try{await bounded(()=>marker.writeFile(markerBytes));await bounded(()=>marker.sync())}finally{await marker.close()}
          await bounded(()=>writeOwnedBlob(input.evidence,markerBytes))
          await write('dispatch',{ref:'master',inputs:{requestId:intent.requestId,seal,master:intent.master,dev:intent.dev}},async()=>{runs=found(await input.reads.findValidationRuns({requestId:intent!.requestId,master:intent!.master}));check(runs.length<=1,'VALIDATION_AMBIGUOUS');await flight(seal!);return {runs}})
        }
      }
      // A bounded second read never redispatches. Missing, unfinished or ambiguous runs remain held.
      if(!runs.length)runs=found(await input.reads.findValidationRuns({requestId:intent.requestId,master:intent.master}))
      check(runs.length===1,'VALIDATION_PENDING')
      const validation=await bounded(()=>authenticateValidation(input.reads,input.evidence,intent!,seal!,pull,runs[0],remoteObjects))
      if(validation.status!=='accepted')throw new TransactionHold(validation.reasons[0])
      await flight(seal!)
      const finalPulls=await exactPulls(input.reads,intent,seal!),remaining=intent.pulls.filter(expected=>expected.headRef!==intent!.targetRef&&finalPulls.some(pull=>pull.number===expected.number&&pull.state==='open'&&pull.head===expected.head))
      await journal(intent,'after','validation',{seal,prNumber})
      return {status:'accepted',reasons:[],evidence:[...retained,...validation.evidence],seal,prNumber,readyProposal:{prNumber,head:seal!},donorCloseProposals:remaining.map(donor=>({prNumber:donor.number,head:donor.head,survivor:prNumber!,seal:seal!}))}
    } catch(error) {
      const reasons=[error instanceof TransactionHold?error.message:'TRANSACTION_UNESTABLISHED']
      if(intent){try{await journal(intent,'hold','stopped',null,reasons)}catch{/* No mutation follows evidence failure. */}
        const reconstruction=await reconstruct(input.reads,input.evidence,intent,remoteObjects)
        return {...reconstruction,status:'hold',reasons,evidence:[...retained,...reconstruction.evidence],seal:seal??reconstruction.seal,prNumber}
      }
      return {status:'hold',reasons,evidence:[...retained]}
    }
  }
  return {writerCapability,apply,reconcile:(intent:unknown)=>reconstruct(input.reads,input.evidence,intent,remoteObjects)}
}

/** Assemble exact facts only from constructor-authenticated API reads and independently retained archive bytes. */
async function authenticateValidation(reads:RemoteReads,evidence:EvidenceStore,intent:RemoteTransactionIntent,seal:string,pull:RemotePull,run:{id:number;attempt:number},objects:RemoteTransactionObjectReads) {
  const policy=remoteReadContext(reads)!.policy
  const producer=found(await reads.readRun({id:intent.producerRunId,attempt:intent.producerRunAttempt,role:'producer'})),validator=found(await reads.readRun({...run,role:'validator'}))
  const producerArchive=found(await reads.readArtifact({runId:producer.id,attempt:producer.attempt,name:policy.producerArtifactName})),validatorArchive=found(await reads.readArtifact({runId:validator.id,attempt:validator.attempt,name:policy.validatorArtifactName}))
  const member=(archive:typeof producerArchive,name:string)=>{const bytes=archive.members.get(name);check(bytes,'VALIDATION_MEMBER_MISSING');return bytes}
  const producerBytes=member(producerArchive,'provenance.json'),provenance=ProducerBundleReceiptSchema.parse(parseStrictJson(producerBytes))
  check(Buffer.from(producerBytes).equals(Buffer.from(canonicalBytes(provenance))),'VALIDATION_NONCANONICAL')
  const names=new Set(['provenance.json'])
  for(const claim of provenance.members){check(!names.has(claim.name),'PROVENANCE_DUPLICATE');names.add(claim.name);const bytes=member(producerArchive,claim.name);check(bytes.length===claim.bytes&&rawSha256(bytes)===claim.sha256,'PROVENANCE_MEMBER_DIGEST')}
  check(names.size===producerArchive.members.size,'PROVENANCE_INVENTORY')
  check(provenance.requestId===intent.producerRequestId&&provenance.tools===intent.master&&provenance.workflowDefinitionSha256===policy.producer.workflowDefinitionSha256,'PROVENANCE_IDENTITY')
  check(Buffer.from(member(producerArchive,'plan.json')).equals(Buffer.from(await evidence.readBlob(intent.plan)))&&Buffer.from(member(producerArchive,'proof.json')).equals(Buffer.from(await evidence.readBlob(intent.proof))),'PROVENANCE_PLAN_PROOF')
  const receiptBytes=member(validatorArchive,'receipt.json'),receipt=ExactValidationReceiptV1Schema.parse(parseStrictJson(receiptBytes)),output=member(validatorArchive,'output.json')
  check(Buffer.from(receiptBytes).equals(Buffer.from(canonicalBytes(receipt)))&&rawSha256(output)===receipt.outputDigest&&validatorArchive.members.size===2,'VALIDATION_OUTPUT_INVENTORY')
  const producerRef=await writeOwnedBlob(evidence,producerBytes),receiptRef=await writeOwnedBlob(evidence,receiptBytes),outputRef=await writeOwnedBlob(evidence,output)
  const checked=await verifiedSeal(reads,objects,intent,seal),fact=checked.fact
  const stripRun=(value:typeof producer)=>({id:value.id,attempt:value.attempt,repositoryId:value.repositoryId,headRepositoryId:value.headRepositoryId,actorId:value.actorId,workflowId:value.workflowId,workflowPath:value.workflowPath,workflowDefinitionSha256:value.workflowDefinitionSha256,event:value.event,toolingHead:value.toolingHead,status:value.status,conclusion:value.conclusion,evidence:value.evidence})
  const artifact=(value:typeof producerArchive,attempt:number)=>({id:value.id,name:value.name,runId:value.runId,runAttempt:attempt,expired:false,archiveApiDigest:value.archive.sha256,archiveActualDigest:value.archive.sha256,archive:value.archive})
  const memberFact=(archive:typeof producerArchive,name:string,ref:BlobRef)=>({artifactId:archive.id,archiveDigest:archive.archive.sha256,memberPath:name,actualDigest:ref.sha256,member:ref})
  const {kind:_kind,schemaVersion:_version,members:_members,tools:_tools,workflowDefinitionSha256:_definition,...provenanceFact}=provenance
  const facts={host:policy.host,repositoryId:policy.repositoryId,repositoryFullName:policy.repositoryFullName,baseRepositoryId:pull.baseRepositoryId,headRepositoryId:pull.headRepositoryId,baseRef:pull.baseRef,headRef:pull.headRef,master:refOid(await reads.readRef('master')),dev:refOid(await reads.readRef('dev')),
    pr:{repositoryId:pull.repositoryId,number:pull.number,base:pull.base,head:pull.head,state:pull.state,draft:pull.draft,actorId:pull.actorId,metadataEvidence:[...new Map(pull.evidence.map(ref=>[ref.path,ref])).values()].sort((a,b)=>Buffer.compare(Buffer.from(a.path),Buffer.from(b.path)))},evidence:(found(await reads.readRepository())).evidence,
    producerRuns:{kind:'found',value:[stripRun(producer)]},validatorRuns:{kind:'found',value:[{...stripRun(validator),workflowSuiteId:validator.workflowSuiteId,workflowSuiteHead:validator.workflowSuiteHead}]},
    producerProvenance:{kind:'found',value:[{...provenanceFact,receipt:producerRef,artifactId:producerArchive.id,memberPath:'provenance.json'}]},
    associations:{kind:'found',value:[{repositoryId:receipt.repositoryId,runId:receipt.runId,runAttempt:receipt.runAttempt,requestId:receipt.requestId,targetCheckId:receipt.targetCheckId,targetSuiteId:receipt.targetSuiteId,targetCheckAppId:receipt.targetCheckAppId,targetCheckHead:receipt.targetCheckHead,receipt:receiptRef,artifactId:validatorArchive.id,memberPath:'receipt.json'}]},
    checks:await reads.readChecks(seal),artifacts:{kind:'found',value:[artifact(producerArchive,producer.attempt),artifact(validatorArchive,validator.attempt)]},members:{kind:'found',value:[memberFact(producerArchive,'provenance.json',producerRef),memberFact(validatorArchive,'receipt.json',receiptRef)]},
    seal:{kind:'found',value:{oid:seal,parents:checked.object.parents,tree:checked.object.tree,signatureValid:fact.signatureValid,signatureState:fact.signatureState,wasSignedByGitHub:fact.wasSignedByGitHub,signerActorId:fact.signerActorId,authorActorId:fact.authorActorId,writerAttribution:{role:'author',actorId:policy.writerActorId},metadata:sealMetadata(intent),evidence:fact.evidence}},output:outputRef}
  return acceptExactValidation({repositoryId:intent.repositoryId,prNumber:pull.number,branch:intent.targetRef,base:intent.master,seal,master:intent.master,dev:intent.dev,tools:intent.master,unitKey:intent.unitKey,planSha256:intent.planSha256,proofSha256:intent.proofSha256,transactionId:intent.transactionId,preparedBase:intent.preparedBase,candidate:intent.candidate,candidateTree:intent.candidateTree,previousSeal:intent.previousSeal,preservedHumanHeads:intent.preservedHumanHeads,requestId:intent.requestId,validatorRunId:run.id,validatorRunAttempt:run.attempt,producerRequestId:intent.producerRequestId,producerRunId:intent.producerRunId,producerRunAttempt:intent.producerRunAttempt},facts,receiptBytes,policy)
}
