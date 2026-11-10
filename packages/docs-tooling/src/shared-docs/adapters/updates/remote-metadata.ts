import { createHash } from 'node:crypto'
import { performance } from 'node:perf_hooks'
import * as z from 'zod'
import { canonicalBytes, compareUtf8, digest, parseStrictJson } from '../../core/updates/canonical'
import { CandidateSnapshotProofSchema, GitShaSchema, RepoPathSchema, UpdateReportEnvelopeSchema, UpdateUnitPlanSchema,
  validateBlobBytes, validateUnitReports, type BlobRef, type BotRevision, type CandidateSnapshotProof, type UpdateUnitPlan, type Subject } from '../../core/updates/envelope'
import { assertRevisionBinding, encodeRevisionMessage, METADATA_LIMITS, parseRevisionMessage } from '../../core/updates/metadata'
import { ProducerBundleReceiptSchema, RemotePolicySchema, REMOTE_IO_LIMITS, REMOTE_LIMITS,
  encodeSealMessage, parseSealMessage, type RemoteCommit, type RemotePolicy, type RemoteSealV1, type RemoteReadResult } from '../../core/updates/remote'
import { assertNextOnlyDiff, type NextOnlyDelta } from '../../core/updates/transaction'
import { protectedToolsetPath } from './toolset'
import { rawSha256 } from './evidence'
import { remoteReadContext, type RemoteReads } from './remote-github'

export interface RemoteObjects { read(oid:string,type:'commit'|'tree'|'blob'):Promise<Uint8Array> }
interface Commit {oid:string;tree:string;parents:string[];time:number;message:Uint8Array;raw:Uint8Array}
interface Entry {mode:string;oid:string}
export interface RemoteHistoryCapability {readonly kind:'remote-history';readonly head:string;readonly master:string;readonly seal:string;readonly candidate:string;readonly unitKey:string;readonly subjects:readonly Subject[];readonly preservedHeads:readonly string[];readonly evidence:readonly BlobRef[];readonly counts:Readonly<{headers:number;relevant:number;objects:number;bytes:number}>}
const capabilities=new WeakSet<RemoteHistoryCapability>()
export const isVerifiedRemoteHistory=(value:unknown):value is RemoteHistoryCapability=>!!value&&typeof value==='object'&&capabilities.has(value as RemoteHistoryCapability)
class RemoteHistoryHold extends Error {}
const fail=(code:string):never=>{throw new RemoteHistoryHold(code)}
const check=(value:unknown,code:string)=>{if(!value)fail(code)}
const same=(a:unknown,b:unknown)=>Buffer.from(canonicalBytes(a)).equals(Buffer.from(canonicalBytes(b)))
const immutable=<T>(value:T):T=>{if(value&&typeof value==='object'&&!(value instanceof Uint8Array)){Object.values(value).forEach(immutable);Object.freeze(value)}return value}
const found=<T>(result:RemoteReadResult<T>):T=>result.kind==='found'?result.value:fail('REMOTE_FACTS_REQUIRED')
const canonical=<T>(schema:z.ZodType<T>,bytes:Uint8Array):T=>{const parsed=schema.parse(parseStrictJson(bytes));check(Buffer.from(bytes).equals(Buffer.from(canonicalBytes(parsed))),'NONCANONICAL_BUNDLE');return parsed}

/** One invocation budget, also exercised at exact boundaries without constructing 100,001 Git objects. */
export function checkRemoteHistoryBudget(counts:{headers:number;relevant:number;merges:number;messageBytes:number;objectBytes:number},elapsed:number):void {
  check(Object.values(counts).every(value=>Number.isSafeInteger(value)&&value>=0)&&Number.isFinite(elapsed)&&elapsed>=0,'HISTORY_BUDGET_INVALID')
  check(counts.headers<=METADATA_LIMITS.verificationHeaders,'HISTORY_HEADER_LIMIT')
  check(counts.relevant<=METADATA_LIMITS.discoveryCommits&&counts.merges<=METADATA_LIMITS.discoveryMergeCommits&&counts.messageBytes<=METADATA_LIMITS.discoveryTotalMessageBytes,'HISTORY_DISCOVERY_LIMIT')
  check(counts.objectBytes<=REMOTE_IO_LIMITS.objectBytes,'RAW_TOTAL_LIMIT')
  check(elapsed<REMOTE_IO_LIMITS.inspectionMilliseconds,'HISTORY_TIME_LIMIT')
}

function parseCommit(oid:string,raw:Uint8Array):Commit {
  const bytes=Buffer.from(raw),split=bytes.indexOf('\n\n');check(split>0&&split<=8192,'COMMIT_HEADER')
  const lines=new TextDecoder('utf8',{fatal:true}).decode(bytes.subarray(0,split)).split('\n')
  check(!lines.some(line=>/[\0\r]/.test(line))&&/^tree [a-f0-9]{40}$/.test(lines[0]),'COMMIT_HEADER')
  let at=1;const parents:string[]=[]
  while(lines[at]?.startsWith('parent '))parents.push(GitShaSchema.parse(lines[at++].slice(7)))
  check(parents.length<=2&&new Set(parents).size===parents.length,'COMMIT_PARENTS')
  check(/^author [^\n]+ -?\d+ [+-]\d{4}$/.test(lines[at++]??''),'COMMIT_AUTHOR')
  const committer=/^committer [^\n]+ (-?\d+) [+-]\d{4}$/.exec(lines[at++]??'');check(committer,'COMMIT_COMMITTER')
  const time=Number(committer[1]);check(Number.isSafeInteger(time)&&time>=0&&time<253402300799,'COMMIT_TIME')
  let extension=false
  for(;at<lines.length;at++){const line=lines[at];if(line.startsWith(' ')){check(extension,'COMMIT_HEADER');continue}const key=line.split(' ',1)[0];check(/^[^\x00-\x20\x7f]+$/.test(key)&&!['tree','parent','author','committer'].includes(key),'COMMIT_HEADER');extension=true}
  return {oid,tree:lines[0].slice(5),parents,time,message:Uint8Array.from(bytes.subarray(split+2)),raw:Uint8Array.from(raw)}
}
/** GitHub verifies the signature cryptographically; this independently binds that verification to raw S. */
export function verifyRemoteSealSignature(commitBytes:Uint8Array,fact:RemoteCommit,identity:{writerActorId:number;platformSignerActorId:number}):void {
  check(Number.isSafeInteger(identity.writerActorId)&&identity.writerActorId>0&&Number.isSafeInteger(identity.platformSignerActorId)&&identity.platformSignerActorId>0,'SEAL_SIGNATURE_IDENTITY')
  check(fact.signatureValid&&fact.signatureState==='VALID'&&fact.wasSignedByGitHub&&fact.authorActorId===identity.writerActorId&&fact.signerActorId===identity.platformSignerActorId,'SEAL_SIGNATURE_IDENTITY')
  check(typeof fact.payload==='string'&&typeof fact.signature==='string','SEAL_SIGNATURE_BYTES')
  const raw=Buffer.from(commitBytes),split=raw.indexOf('\n\n');check(split>0,'SEAL_SIGNATURE_BYTES')
  const header=raw.subarray(0,split).toString('utf8').split('\n'),positions=header.flatMap((line,index)=>line.startsWith('gpgsig ')?[index]:[])
  check(positions.length===1&&!header.some(line=>line.startsWith('gpgsig-')),'SEAL_SIGNATURE_HEADER');const at=positions[0];let end=at+1
  while(header[end]?.startsWith(' '))end++
  const signature=[header[at].slice(7),...header.slice(at+1,end).map(line=>line.slice(1))].join('\n')
  // Git's signature header excludes the final armor LF; payload excludes the entire header block.
  check(signature+'\n'===fact.signature||signature===fact.signature,'SEAL_SIGNATURE_BYTES')
  const stripped=Buffer.concat([Buffer.from([...header.slice(0,at),...header.slice(end)].join('\n')+'\n\n'),raw.subarray(split+2)])
  check(stripped.equals(Buffer.from(fact.payload)),'SEAL_SIGNED_PAYLOAD')
  const inserted=Buffer.concat([Buffer.from([...header.slice(0,at),...signature.split('\n').map((line,index)=>index?' '+line:'gpgsig '+line),...header.slice(end)].join('\n')+'\n\n'),raw.subarray(split+2)])
  check(inserted.equals(raw),'SEAL_RECONSTRUCTION')
  check(createHash('sha1').update(`commit ${raw.length}\0`).update(raw).digest('hex')===fact.oid,'SEAL_OID')
}

/** No capture, fetch, checkout, candidate process or normalized authentication callback. */
export async function inspectRemoteHistory(request:{head:string;donorHeads:readonly string[];master:string;policy:RemotePolicy},reads:RemoteReads,objects:RemoteObjects):Promise<{status:'verified';history:RemoteHistoryCapability}|{status:'hold';reasons:string[]}> {
  const started=performance.now(),counts={headers:0,relevant:0,objects:0,bytes:0},graph=new Map<string,Commit>(),baseline=new Set<string>(),relevant=new Set<string>(),rawObjects=new Map<string,Uint8Array>(),trees=new Map<string,Map<string,Entry>>()
  const evidence:BlobRef[]=[],verified=new Map<string,{seal:RemoteSealV1;revision:BotRevision;plan:UpdateUnitPlan;proof:CandidateSnapshotProof}>()
  const context=remoteReadContext(reads)
  const budget=()=>{checkRemoteHistoryBudget({headers:counts.headers,relevant:counts.relevant,merges:0,messageBytes:0,objectBytes:counts.bytes},performance.now()-started);context?.check()}
  const bounded=async<T>(operation:Promise<T>):Promise<T>=>{budget();let timer:ReturnType<typeof setTimeout>;try{return await Promise.race([operation,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new RemoteHistoryHold('HISTORY_TIME_LIMIT')),Math.max(1,REMOTE_IO_LIMITS.inspectionMilliseconds-(performance.now()-started)))})])}finally{clearTimeout(timer)}}
  try {
    request={...request,donorHeads:[...request.donorHeads],policy:RemotePolicySchema.parse(request.policy) as RemotePolicy}
    check(context,'REMOTE_ADAPTER_REQUIRED');check(objects&&typeof objects.read==='function','RAW_OBJECT_SOURCE_REQUIRED')
    RemotePolicySchema.parse(request.policy);check(same(request.policy,context.policy),'POLICY_MISMATCH')
    GitShaSchema.parse(request.master);GitShaSchema.parse(request.head)
    check(request.donorHeads.length<=METADATA_LIMITS.donorHeads&&new Set(request.donorHeads).size===request.donorHeads.length,'DONOR_LIMIT')
    const roots=[...new Set([request.head,...request.donorHeads.map(oid=>GitShaSchema.parse(oid))])].sort(compareUtf8)
    const raw=async(oid:string,type:'commit'|'tree'|'blob')=>{
      budget();GitShaSchema.parse(oid);const key=type+oid;if(rawObjects.has(key))return rawObjects.get(key)!
      const value=await bounded(objects.read(oid,type));check(value instanceof Uint8Array,'RAW_OBJECT_TYPE')
      const cap=type==='commit'?8192+METADATA_LIMITS.commitMessageBytes+2:type==='tree'?32*1024*1024:REMOTE_LIMITS.outputBytes
      check(value.length<=cap,'RAW_OBJECT_LIMIT');counts.bytes+=value.length;counts.objects++
      check(counts.bytes<=REMOTE_IO_LIMITS.objectBytes,'RAW_TOTAL_LIMIT')
      check(createHash('sha1').update(`${type} ${value.length}\0`).update(value).digest('hex')===oid,'RAW_OBJECT_HASH')
      const copy=Uint8Array.from(value);rawObjects.set(key,copy);budget();return copy
    }
    const load=async(oid:string)=>{
      if(graph.has(oid))return graph.get(oid)!
      check(counts.headers<METADATA_LIMITS.verificationHeaders,'HISTORY_HEADER_LIMIT')
      const commit=parseCommit(oid,await raw(oid,'commit'));graph.set(oid,commit);counts.headers++;return commit
    }
    const walk=async(root:string,set:Set<string>,isBaseline:boolean)=>{const pending=[root];while(pending.length){budget();const oid=pending.pop()!;if(set.has(oid)||!isBaseline&&baseline.has(oid))continue;const commit=await load(oid);set.add(oid);if(!isBaseline){counts.relevant++;check(counts.relevant<=METADATA_LIMITS.discoveryCommits,'HISTORY_DISCOVERY_LIMIT')}pending.push(...commit.parents)}}
    await walk(request.master,baseline,true);for(const root of roots)await walk(root,relevant,false)
    let merges=0,messageBytes=0
    for(const oid of relevant){const commit=graph.get(oid)!;merges+=Number(commit.parents.length===2);messageBytes+=commit.message.length}
    checkRemoteHistoryBudget({headers:counts.headers,relevant:counts.relevant,merges,messageBytes,objectBytes:counts.bytes},performance.now()-started)
    const ancestor=(a:string,b:string)=>{const pending=[b],seen=new Set<string>();while(pending.length){budget();const oid=pending.pop()!;if(oid===a)return true;if(seen.has(oid))continue;seen.add(oid);const value=graph.get(oid);check(value,'HISTORY_INCOMPLETE');pending.push(...value.parents)}return false}
    const ancestorSet=(root:string)=>{const seen=new Set<string>(),pending=[root];while(pending.length){budget();const oid=pending.pop()!;if(seen.has(oid))continue;seen.add(oid);const value=graph.get(oid);check(value,'HISTORY_INCOMPLETE');pending.push(...value.parents)}return seen}
    const mergeBase=(left:string,right:string)=>{const leftSet=ancestorSet(left),rightSet=ancestorSet(right),common=new Set([...leftSet].filter(oid=>rightSet.has(oid))),nonmaximal=new Set<string>()
      for(const oid of common)for(const parent of graph.get(oid)!.parents)if(common.has(parent))nonmaximal.add(parent)
      const bases=[...common].filter(oid=>!nonmaximal.has(oid));check(bases.length===1,'MERGE_BASE');return bases[0]
    }
    let treeBytes=0,leaves=0,expandedPathBytes=0
    const tree=async(oid:string):Promise<Map<string,Entry>>=>{
      if(trees.has(oid))return trees.get(oid)!
      const result=new Map<string,Entry>(),pending=[{oid,prefix:'',depth:0}]
      while(pending.length){budget();const node=pending.pop()!,bytes=Buffer.from(await raw(node.oid,'tree'));treeBytes+=bytes.length;check(treeBytes<=32*1024*1024,'TREE_LIMIT');let at=0,previous:Buffer|null=null;const names=new Set<string>()
        while(at<bytes.length){budget();const space=bytes.indexOf(32,at),nul=bytes.indexOf(0,space+1);check(space>=at&&nul>space&&nul+21<=bytes.length,'TREE_FORMAT');const mode=bytes.subarray(at,space).toString(),nameBytes=bytes.subarray(space+1,nul);check(nameBytes.length<=REMOTE_LIMITS.path,'TREE_PATH_LIMIT');const name=new TextDecoder('utf8',{fatal:true}).decode(nameBytes)
          check(['40000','100644','100755','120000','160000'].includes(mode)&&!name.includes('/'),'TREE_ENTRY');RepoPathSchema.parse(name);check(!names.has(name),'TREE_NAME_COLLISION');names.add(name)
          const ordering=Buffer.concat([nameBytes,mode==='40000'?Buffer.from('/'):Buffer.alloc(0)]);check(!previous||Buffer.compare(previous,ordering)<0,'TREE_ORDER');previous=ordering
          const path=node.prefix+name,pathBytes=Buffer.byteLength(path,'utf8');expandedPathBytes+=pathBytes;check(pathBytes<=REMOTE_LIMITS.path&&node.depth<=64&&expandedPathBytes<=16*1024*1024,'TREE_PATH_LIMIT');const target=bytes.subarray(nul+1,nul+21).toString('hex');at=nul+21
          if(mode==='40000'){check(node.depth<64&&pathBytes+1<=REMOTE_LIMITS.path,'TREE_PATH_LIMIT');pending.push({oid:target,prefix:path+'/',depth:node.depth+1})}
          else{check(!result.has(path)&&++leaves<=100000,'TREE_LIMIT');result.set(path,{mode,oid:target})}
        }
      }
      trees.set(oid,result);return result
    }
    const changed=(a:Map<string,Entry>,b:Map<string,Entry>)=>[...new Set([...a.keys(),...b.keys()])].filter(path=>!same(a.get(path)??null,b.get(path)??null)).sort(compareUtf8)
    const rawDiff=(before:Map<string,Entry>,after:Map<string,Entry>)=>Buffer.concat(changed(before,after).map(path=>{const a=before.get(path),b=after.get(path);check(a&&b,'NEXT_ONLY_ADDITION');return Buffer.from(`:${a.mode} ${b.mode} ${a.oid} ${b.oid} M\0${path}\0`)}))
    const deterministic=(commit:Commit,parents:Commit[],message:string)=>{
      const time=Math.max(...parents.map(parent=>parent.time))+1;check(Number.isSafeInteger(time)&&time<253402300799,'COMMIT_TIME')
      const bytes=Buffer.from(`tree ${commit.tree}\n${parents.map(parent=>`parent ${parent.oid}\n`).join('')}author Shared update local <shared-update-local@localhost> ${time} +0000\ncommitter Shared update local <shared-update-local@localhost> ${time} +0000\n\n${message}`)
      check(bytes.equals(Buffer.from(commit.raw)),'DETERMINISTIC_COMMIT')
    }
    const candidateOids=new Set<string>(),sealOids=new Set<string>()
    for(const oid of relevant){const value=graph.get(oid)!,seal=parseSealMessage(value.message);if(seal)sealOids.add(oid);if(parseRevisionMessage(value.message))candidateOids.add(oid)}
    check(sealOids.size>0,'REMOTE_ORIGIN_REQUIRED')
    for(const oid of sealOids){budget();const s=graph.get(oid)!,seal=parseSealMessage(s.message)!
      check(seal.repositoryId===request.policy.repositoryId&&same(s.parents,[seal.candidate])&&s.tree===seal.candidateTree,'SEAL_BINDING')
      const k=graph.get(seal.candidate),p=graph.get(seal.preparedBase);check(k&&p&&same(k.parents,[p.oid])&&k.tree===s.tree,'CANDIDATE_PARENT')
      const revision=parseRevisionMessage(k.message);check(revision,'REVISION_REQUIRED')
      const fact=found(await bounded(reads.readCommit(oid)));check(fact.oid===oid&&fact.tree===s.tree&&same(fact.parents,s.parents),'SEAL_API_OBJECT');verifyRemoteSealSignature(s.raw,fact,{writerActorId:request.policy.writerActorId,platformSignerActorId:request.policy.sealIdentity.platformSignerActorId});evidence.push(...fact.evidence as BlobRef[])
      const run=found(await bounded(reads.readRun({id:seal.runId,attempt:seal.runAttempt,role:'producer'})))
      check(run.toolingHead===seal.master,'HISTORICAL_TOOLS');evidence.push(...run.evidence)
      const artifact=found(await bounded(reads.readArtifact({runId:seal.runId,attempt:seal.runAttempt,name:request.policy.producerArtifactName})))
      check(artifact.toolingHead===run.toolingHead,'ARTIFACT_RUN_HEAD')
      const runAfter=found(await bounded(reads.readRun({id:seal.runId,attempt:seal.runAttempt,role:'producer'})));check(same(run,runAfter),'PRODUCER_RUN_RACE')
      evidence.push(artifact.archive,...artifact.evidence)
      const member=(name:string)=>{const bytes=artifact.members.get(name);check(bytes,'BUNDLE_MEMBER_MISSING');return bytes}
      const receipt=canonical(ProducerBundleReceiptSchema,member('provenance.json'))
      const {kind:_kind,schemaVersion:_version,...binding}=seal
      for(const [key,value] of Object.entries(binding))check(same(receipt[key],value),'PROVENANCE_BINDING')
      check(receipt.seal===oid&&receipt.tools===seal.master&&receipt.workflowDefinitionSha256===run.workflowDefinitionSha256,'PROVENANCE_IDENTITY')
      const names=new Set<string>(['provenance.json'])
      for(const ref of receipt.members){check(!names.has(ref.name),'BUNDLE_DUPLICATE');names.add(ref.name);const bytes=member(ref.name);check(bytes.length===ref.bytes&&rawSha256(bytes)===ref.sha256,'BUNDLE_DIGEST')}
      check(names.size===artifact.members.size&&[...artifact.members.keys()].every(name=>names.has(name)),'BUNDLE_INVENTORY')
      const required=new Set(['provenance.json','plan.json','proof.json','patch.raw'])
      const plan=canonical(UpdateUnitPlanSchema,member('plan.json')),proof=canonical(CandidateSnapshotProofSchema,member('proof.json'))
      check(digest('plan',plan)===seal.planSha256&&rawSha256(member('proof.json'))===seal.proofSha256,'PLAN_PROOF_DIGEST')
      check(['candidate','draft-failure'].includes(plan.disposition),'PLAN_DISPOSITION')
      const reportValues=plan.reports.map(ref=>{const name=`reports/${ref.sha256}.json`;required.add(name);const bytes=member(name);validateBlobBytes(ref,bytes);return canonical(UpdateReportEnvelopeSchema,bytes)})
      validateUnitReports(plan,reportValues)
      for(const report of reportValues)check(report.pins.master===seal.master&&report.pins.dev===seal.dev&&report.pins.trustedTools===seal.master&&report.pins.configSnapshot===p.oid&&report.pins.configTreeOid===p.tree&&report.pins.toolsetSha256===proof.trustedToolsetSha256,'REPORT_PINS')
      check(revision.dev===seal.dev,'REVISION_DEV')
      assertRevisionBinding(revision,{parent:p.oid,master:seal.master,tools:seal.master,planSha256:seal.planSha256,unitKey:seal.unitKey,memberSetSha256:plan.membersSha256})
      check(same(revision.subjects,plan.subjects)&&same(revision.preservedHumanHeads,seal.preservedHumanHeads)&&same(proof.preservedHumanHeads,seal.preservedHumanHeads),'REVISION_BINDING')
      check(proof.candidate===k.oid&&proof.candidateTree===k.tree&&proof.prepared.base===p.oid&&proof.prepared.tree===p.tree&&proof.prepared.master===seal.master&&same(proof.nextEdits,plan.nextEdits),'PROOF_BINDING')
      const before=await tree(p.tree),after=await tree(k.tree),paths=changed(before,after)
      check(paths.length===plan.nextEdits.length&&paths.length===revision.lockDeltas.length,'NEXT_ONLY_PATHS')
      const deltas:NextOnlyDelta[]=[]
      for(const edit of plan.nextEdits){const path=edit.before.path,a=before.get(path),b=after.get(path),claim=revision.lockDeltas.find(delta=>delta.path===path);check(a&&b&&claim&&paths.includes(path),'NEXT_ONLY_PATHS')
        const beforeBytes=await raw(a.oid,'blob'),afterBytes=await raw(b.oid,'blob'),name=`locks/${edit.afterBlob.sha256}.yaml`;required.add(name);validateBlobBytes(edit.afterBlob,member(name));check(Buffer.from(member(name)).equals(Buffer.from(afterBytes)),'LOCK_MEMBER_BYTES')
        check(claim.current===edit.before.current&&claim.oldNext===edit.before.next&&claim.next===edit.target,'REVISION_LOCKS')
        deltas.push({path,beforeMode:a.mode,afterMode:b.mode,beforeBytes,afterBytes,edit})
      }
      assertNextOnlyDiff(deltas);validateBlobBytes(proof.patch,member('patch.raw'));check(Buffer.from(member('patch.raw')).equals(rawDiff(before,after)),'PATCH_BYTES')
      deterministic(k,[p],encodeRevisionMessage(revision).commitMessage)
      for(const head of seal.preservedHumanHeads)check(graph.has(head)&&ancestor(head,p.oid),'PRESERVED_HEAD')
      check(graph.has(seal.master)&&ancestor(seal.master,p.oid),'HISTORICAL_MASTER')
      if(proof.prepared.kind==='new')check(p.oid===seal.master&&seal.preservedHumanHeads.length===0,'NEW_ORIGIN')
      else {
        check(seal.preservedHumanHeads.includes(proof.prepared.humanHead),'HUMAN_ORIGIN')
        const evidenceMember=(ref:BlobRef)=>{const name=`evidence/${ref.sha256}`;required.add(name);const bytes=member(name);validateBlobBytes(ref,bytes);return bytes}
        const mergeSchema=z.array(z.strictObject({commit:GitShaSchema,parents:z.tuple([GitShaSchema,GitShaSchema]),mergeBase:GitShaSchema,tree:GitShaSchema,diff:z.strictObject({path:RepoPathSchema,sha256:z.string().regex(/^[a-f0-9]{64}$/),bytes:z.number().int().nonnegative().max(REMOTE_LIMITS.outputBytes)})})).max(16)
        const merges=canonical(mergeSchema,evidenceMember(proof.prepared.mergeEvidence))
        check(new Set(merges.map(merge=>merge.commit)).size===merges.length,'PREPARED_MERGE_DUPLICATE')
        const boundaries=new Set([seal.master,...seal.preservedHumanHeads]),pending=[p.oid],requiredMerges=new Set<string>(),visited=new Set<string>()
        while(pending.length){budget();const oid=pending.pop()!;if(boundaries.has(oid)||visited.has(oid))continue;visited.add(oid);const value=graph.get(oid);check(value&&value.parents.length===2,'PREPARED_MERGE_CHAIN');requiredMerges.add(oid);pending.push(...value.parents)}
        check(requiredMerges.size===merges.length&&merges.every(merge=>requiredMerges.has(merge.commit)),'PREPARED_MERGE_INVENTORY')
        for(const merge of merges){const value=graph.get(merge.commit);check(value&&same(value.parents,merge.parents)&&value.tree===merge.tree&&merge.mergeBase===mergeBase(value.parents[0],value.parents[1]),'PREPARED_MERGE');deterministic(value,value.parents.map(parent=>graph.get(parent)!),`Prepare shared update base\n\n${value.parents[0]}\n${value.parents[1]}\n`);check(Buffer.from(evidenceMember(merge.diff as BlobRef)).equals(encodeDiff(await tree(graph.get(value.parents[0])!.tree),await tree(value.tree))),'MERGE_PATCH')}
        const preservationSchema=z.strictObject({base:GitShaSchema,heads:z.array(GitShaSchema).max(16),diff:z.strictObject({path:RepoPathSchema,sha256:z.string().regex(/^[a-f0-9]{64}$/),bytes:z.number().int().nonnegative().max(REMOTE_LIMITS.outputBytes)})})
        const preservation=canonical(preservationSchema,evidenceMember(proof.prepared.preservationEvidence))
        check(preservation.base===p.oid&&same(preservation.heads,seal.preservedHumanHeads),'PRESERVATION_BINDING')
        check(Buffer.from(evidenceMember(preservation.diff as BlobRef)).equals(encodeDiff(await tree(graph.get(proof.prepared.humanHead)!.tree),before)),'PRESERVATION_PATCH')
      }
      check(required.size===names.size&&[...required].every(name=>names.has(name)),'BUNDLE_UNEXPECTED_MEMBER')
      verified.set(oid,{seal,revision,plan,proof})
    }
    // No bare copied BotRevision trailer can be mistaken for authenticated history.
    check([...candidateOids].every(oid=>[...verified.values()].some(value=>value.seal.candidate===oid)),'UNSEALED_REVISION')
    for(const [oid,value] of verified){const {seal,revision}=value
      if(seal.previousSeal){const previous=verified.get(seal.previousSeal);check(previous&&previous.seal.unitKey===seal.unitKey&&same(previous.revision.subjects,revision.subjects)&&revision.previousBotCommit===previous.seal.candidate&&ancestor(seal.previousSeal,seal.preparedBase),'PREVIOUS_CHAIN')}
      else check(revision.previousBotCommit===null,'PREVIOUS_CHAIN')
      for(const [other] of verified)if(other!==oid&&ancestor(other,seal.preparedBase))check(seal.previousSeal&&ancestor(other,seal.previousSeal),'PREVIOUS_CHAIN_ERASED')
    }
    const allowed=(path:string)=>['shared-docs/guides/','content/en/guides/','content/en/byoc/'].some(prefix=>path.startsWith(prefix))&&!protectedToolsetPath(path)
    const inspectData=(before:Map<string,Entry>,after:Map<string,Entry>)=>{for(const path of changed(before,after)){const a=before.get(path),b=after.get(path);check(allowed(path)&&(!a||['100644','100755'].includes(a.mode))&&(!b||['100644','100755'].includes(b.mode)),'HUMAN_EXECUTION_CHANGE')}}
    for(const oid of relevant){budget();if(sealOids.has(oid)||candidateOids.has(oid))continue;const value=graph.get(oid)!,after=await tree(value.tree)
      check(![...after.keys()].some(path=>/(^|\/)\.gitattributes$/.test(path)),'MERGE_ATTRIBUTES')
      if(value.parents.length===1)inspectData(await tree(graph.get(value.parents[0])!.tree),after)
      else if(value.parents.length===2){const [left,right]=value.parents
        const base=await tree(graph.get(mergeBase(left,right))!.tree),a=await tree(graph.get(left)!.tree),b=await tree(graph.get(right)!.tree),ac=changed(base,a),bc=changed(base,b)
        check(!ac.some(path=>bc.includes(path)),'MERGE_OVERLAP');const union=new Map(base)
        for(const [parent,files,paths] of [[left,a,ac],[right,b,bc]] as const){if(!baseline.has(parent))inspectData(base,files);for(const path of paths){const entry=files.get(path);if(entry)union.set(path,entry);else union.delete(path)}}
        check(changed(union,after).length===0,'MERGE_RESULT')
      }else fail('HUMAN_ORPHAN')
    }
    let selected:string|null=null
    for(const [oid,value] of verified){if(selected){check(value.seal.unitKey===verified.get(selected)!.seal.unitKey&&(ancestor(selected,oid)||ancestor(oid,selected)),'INCOMPARABLE_REVISIONS')}if(!selected||ancestor(selected,oid))selected=oid}
    for(const root of roots)check([...verified.keys()].some(oid=>ancestor(oid,root)),'ROOT_ORIGIN')
    // Batch exact bytes to keep ordinary multi-thousand-header baselines usable.
    // Segment locators retain per-object identity even when a large object spans batches.
    const batches:BlobRef[]=[],objectRefs:{oid:string;type:string;bytes:number;segments:{batch:number;offset:number;bytes:number}[]}[]=[]
    const batchLimit=4*1024*1024;let chunks:Uint8Array[]=[],batchBytes=0
    const flush=async()=>{if(batchBytes){batches.push(await bounded(context.retain(Buffer.concat(chunks,batchBytes))));chunks=[];batchBytes=0}}
    for(const [key,bytes] of rawObjects){budget();const segments:{batch:number;offset:number;bytes:number}[]=[];let at=0
      while(at<bytes.length){const length=Math.min(batchLimit-batchBytes,bytes.length-at);segments.push({batch:batches.length,offset:batchBytes,bytes:length});chunks.push(bytes.subarray(at,at+length));batchBytes+=length;at+=length;if(batchBytes===batchLimit)await flush()}
      objectRefs.push({oid:key.slice(-40),type:key.slice(0,-40),bytes:bytes.length,segments})
    }
    await flush();evidence.push(await bounded(context.retain(canonicalBytes({kind:'remote-raw-objects',batches,objects:objectRefs}))))
    const refs=new Map<string,BlobRef>();for(const ref of evidence){const previous=refs.get(ref.path);check(!previous||same(previous,ref),'EVIDENCE_CONFLICT');refs.set(ref.path,{...ref})}
    check(refs.size<=REMOTE_LIMITS.evidence,'EVIDENCE_LIMIT');budget()
    const history=immutable({kind:'remote-history' as const,head:request.head,master:request.master,seal:selected!,candidate:verified.get(selected!)!.seal.candidate,unitKey:verified.get(selected!)!.seal.unitKey,subjects:structuredClone(verified.get(selected!)!.revision.subjects),preservedHeads:roots,evidence:[...refs.values()].sort((a,b)=>compareUtf8(a.path,b.path)),counts:{...counts}})
    capabilities.add(history);return {status:'verified',history}
  } catch(error) {
    // Only fixed internal codes survive. Never retain raw object/parser/transport diagnostics.
    const code=error instanceof RemoteHistoryHold?error.message:'REMOTE_HISTORY_UNESTABLISHED'
    return {status:'hold',reasons:[code]}
  }
}

function encodeDiff(before:Map<string,Entry>,after:Map<string,Entry>):Buffer {
  const zero='0'.repeat(40)
  return Buffer.concat([...new Set([...before.keys(),...after.keys()])].sort(compareUtf8).filter(path=>!same(before.get(path)??null,after.get(path)??null)).map(path=>{const a=before.get(path),b=after.get(path);return Buffer.from(`:${a?.mode??'000000'} ${b?.mode??'000000'} ${a?.oid??zero} ${b?.oid??zero} ${!a?'A':!b?'D':a.mode===b.mode?'M':'M'}\0${path}\0`)}))
}

/** A namespace PR with unknown origin blocks grouping; callers cannot ignore it and create a duplicate unit. */
export async function inspectRemotePulls(request:{master:string;policy:RemotePolicy},reads:RemoteReads,objects:RemoteObjects):Promise<
  {status:'verified';groups:Readonly<Record<string,readonly {number:number;head:string;history:RemoteHistoryCapability}[]>>}|{status:'hold';reasons:string[]}> {
  try {
    const policy=RemotePolicySchema.parse(request.policy) as RemotePolicy,master=GitShaSchema.parse(request.master)
    check(remoteReadContext(reads)&&same(remoteReadContext(reads)!.policy,policy),'REMOTE_ADAPTER_REQUIRED')
    const pulls=found(await reads.scanPulls()),subjectUnits=new Map<string,string>(),verifiedHeads=new Map<string,RemoteHistoryCapability>(),groups:Record<string,{number:number;head:string;history:RemoteHistoryCapability}[]>={}
    for(const pull of pulls){check(pull.actorId===policy.writerActorId&&pull.base===master&&pull.baseRepositoryId===policy.repositoryId&&pull.headRepositoryId===policy.repositoryId,'PULL_IDENTITY_UNKNOWN')
      let history=verifiedHeads.get(pull.head)
      if(!history){const result=await inspectRemoteHistory({head:pull.head,donorHeads:[],master,policy},reads,objects);if(result.status==='hold')return {status:'hold',reasons:['PULL_ORIGIN_UNKNOWN']};history=result.history;verifiedHeads.set(pull.head,history)}
      const key=history.unitKey
      for(const subject of history.subjects){const identity=Buffer.from(canonicalBytes(subject)).toString('base64'),previous=subjectUnits.get(identity);check(!previous||previous===key,'AUTHENTICATED_SUBJECT_OVERLAP');subjectUnits.set(identity,key)}
      // Null-prototype-free insertion prevents arbitrary unit names from mutating the grouping prototype.
      if(!Object.prototype.hasOwnProperty.call(groups,key))Object.defineProperty(groups,key,{value:[],enumerable:true})
      groups[key].push({number:pull.number,head:pull.head,history})
    }
    const after=found(await reads.scanPulls()),identity=(values:typeof pulls)=>values.map(({number,head,base,state,draft,actorId,headRef,baseRef})=>({number,head,base,state,draft,actorId,headRef,baseRef})).sort((a,b)=>a.number-b.number)
    check(same(identity(pulls),identity(after)),'PULL_GROUP_RACE')
    return {status:'verified',groups:immutable(groups)}
  } catch(error) {return {status:'hold',reasons:[error instanceof RemoteHistoryHold?error.message:'PULL_GROUP_UNESTABLISHED']}}
}
