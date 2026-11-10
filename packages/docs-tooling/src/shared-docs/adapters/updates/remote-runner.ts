import * as z from 'zod'
import { canonicalBytes, compareUtf8, digest } from '../../core/updates/canonical'
import { type BlobRef, type Subject } from '../../core/updates/envelope'
import { RemotePolicySchema, RemoteTransactionIntentSchema, type RemotePolicy, type RemotePull, type RemoteReadResult, type RemoteTransactionIntent } from '../../core/updates/remote'
import { initializeEvidence, rawSha256, type EvidenceStore } from './evidence'
import { createLocalRunnerWithRuntime, createLocalUpdateRuntime, LocalUpdateRequestSchema, type LocalUpdateRuntime } from './local-runner'
import { remoteReadContext, type RemoteReads } from './remote-github'
import { inspectRemoteHistory } from './remote-metadata'
import { createRemoteTransaction } from './remote-transaction'
import { createScratchTransaction, LocalTransactionHold } from './transactions'
import { type TrustedToolsetCapture } from './toolset'

const same=(a:unknown,b:unknown)=>Buffer.from(canonicalBytes(a)).equals(Buffer.from(canonicalBytes(b)))
const claim=z.string().min(1).max(256)
/** Run identities are untrusted claims. They do not attest a producer or enable writing. */
export const RemoteUpdateRequestSchema=z.strictObject({local:LocalUpdateRequestSchema,
  producer:z.strictObject({runId:z.number().int().positive(),attempt:z.number().int().positive(),requestId:claim}),validationRequestId:claim})
export interface RemoteRunObservation {status:'held'|'noop'|'planned';reasons:string[];operations:[];evidence:BlobRef[];intent?:RemoteTransactionIntent}
const fail=(reason:string):never=>{throw new LocalTransactionHold(reason)}
const found=<T>(value:RemoteReadResult<T>):T=>value.kind==='found'?value.value:fail('REMOTE_STATE_UNKNOWN')

/** Pure subject comparison; unit-key equality cannot establish absence of overlap. */
export function remoteSubjectOverlap(subjects:readonly Subject[],authenticated:ReadonlyMap<string,string>):boolean {
  return subjects.some(subject=>authenticated.has(Buffer.from(canonicalBytes(subject)).toString('base64')))
}

/** Internal library only. Real capture membership is checked before a runtime is derived.
 * Production transaction authority remains disabled, including for capability-shaped values. */
export function createRemoteUpdateRunner(input:{capture:TrustedToolsetCapture;reads:RemoteReads;policy:RemotePolicy;writerCapability?:unknown;transactionEvidence?:EvidenceStore}) {
  return createRemoteRunnerWithRuntime({...input,runtime:createLocalUpdateRuntime(input.capture)})
}

/** Trusted executable fixture seam; never decoded from a request or installed into production. */
export function createRemoteRunnerWithRuntime(input:{runtime:LocalUpdateRuntime;reads:RemoteReads;policy:RemotePolicy;writerCapability?:unknown;transactionEvidence?:EvidenceStore}) {
  const policy=RemotePolicySchema.parse(input.policy) as RemotePolicy,context=remoteReadContext(input.reads)
  if(!context||!same(context.policy,policy))throw new Error('REMOTE_ADAPTER_REQUIRED')
  const runner=createLocalRunnerWithRuntime(input.runtime)
  async function facts() {
    const repository=found(await input.reads.readRepository()),master=found(await input.reads.readRef('master')).oid,dev=found(await input.reads.readRef('dev')).oid
    if(repository.id!==policy.repositoryId||repository.fullName!==policy.repositoryFullName)fail('REPOSITORY_CHANGED')
    return {master,dev,pulls:[...found(await input.reads.scanPulls({state:'all'}))].sort((a,b)=>Date.parse(a.createdAt)-Date.parse(b.createdAt)||a.number-b.number)}
  }
  const pullsIdentity=(pulls:RemotePull[])=>pulls.map(({number,head,base,headRef,baseRef,state,draft,actorId,createdAt,baseRepositoryId,headRepositoryId})=>({number,head,base,headRef,baseRef,state,draft,actorId,createdAt,baseRepositoryId,headRepositoryId}))
  return {
    /** New isolated preparation and inspection roots are required for each invocation.
     * Persistent transaction-attempt evidence is constructor-bound and never reset here. */
    async observe(value:unknown,preparationRoot:string,inspectionRoot:string):Promise<RemoteRunObservation> {
      const request=RemoteUpdateRequestSchema.parse(value),local=request.local,evidence:BlobRef[]=[]
      try {
        if(local.existing?.localEvidence.length)fail('REMOTE_LOCAL_EVIDENCE_FORBIDDEN')
        const initial=await facts()
        if(initial.master!==local.master||initial.dev!==local.dev||local.master!==input.runtime.master)fail('BASE_CHANGED')
        const inspectStore=await initializeEvidence({root:inspectionRoot,repositories:[local.repository,local.devRepository,local.sourceRepository],protectedPaths:[preparationRoot,...input.transactionEvidence?[input.transactionEvidence.root]:[]],owner:'remote-inspection-'+rawSha256(canonicalBytes({policy,local}))})
        const scratch=await createScratchTransaction({evidence:inspectStore,gitBinary:input.runtime.gitBinary})
        await input.runtime.fresh(inspectStore)
        await scratch.importObjects(local.repository,[local.master,...local.existing?[local.existing.head,...local.existing.donorHeads]:[]])
        let history=null
        if(local.existing) {
          const result=await inspectRemoteHistory({head:local.existing.head,donorHeads:local.existing.donorHeads,master:local.master,policy},input.reads,scratch)
          if(result.status==='hold')return {status:'held',reasons:result.reasons,operations:[],evidence}
          history=result.history
        }
        // Every namespace PR is authenticated; an unknown one blocks a duplicate new unit.
        const authenticated=new Map<number,string>(),subjectUnits=new Map<string,string>()
        for(const pull of initial.pulls.filter(pull=>pull.state==='open')) {
          if(pull.actorId!==policy.writerActorId||pull.base!==local.master||pull.baseRef!=='master'||pull.baseRepositoryId!==policy.repositoryId||pull.headRepositoryId!==policy.repositoryId||!pull.draft)fail('PULL_IDENTITY_UNKNOWN')
          await scratch.importObjects(local.repository,[pull.head])
          const result=await inspectRemoteHistory({head:pull.head,donorHeads:[],master:local.master,policy},input.reads,scratch)
          if(result.status==='hold')return fail('PULL_ORIGIN_UNKNOWN')
          for(const subject of result.history.subjects){const key=Buffer.from(canonicalBytes(subject)).toString('base64'),previous=subjectUnits.get(key);if(previous&&previous!==result.history.unitKey)fail('AUTHENTICATED_SUBJECT_OVERLAP');subjectUnits.set(key,result.history.unitKey)}
          authenticated.set(pull.number,result.history.unitKey)
        }
        const selected=history?initial.pulls.filter(pull=>pull.state==='open'&&authenticated.get(pull.number)===history!.unitKey):[]
        if(history) {
          if(!selected.length||selected[0].head!==local.existing!.head||!same([...new Set(selected.slice(1).map(pull=>pull.head))].sort(compareUtf8),[...local.existing!.donorHeads].sort(compareUtf8)))fail('PULL_GROUP_CHANGED')
        }
        for(const pull of selected)if(initial.pulls.filter(other=>other.headRef===pull.headRef).length!==1)fail('PULL_REF_AMBIGUOUS')
        const refs=new Map<string,string|null>()
        const readTarget=async(ref:string)=>{const result=await input.reads.readRef(ref);return result.kind==='found'?result.value.oid:result.kind==='absent'?null:fail('REMOTE_STATE_UNKNOWN')}
        for(const pull of selected){const oid=await readTarget(pull.headRef);if(oid!==pull.head)fail('TARGET_CHANGED');refs.set(pull.headRef,oid)}
        const recheck=async()=>{
          const current=await facts()
          if(current.master!==initial.master||current.dev!==initial.dev||!same(pullsIdentity(current.pulls),pullsIdentity(initial.pulls)))fail('REMOTE_OBSERVATION_CHANGED')
          for(const [ref,oid] of refs)if(await readTarget(ref)!==oid)fail('TARGET_CHANGED')
        }
        const prepared=await runner.prepareRemoteCandidate(local,preparationRoot,{reads:input.reads,policy,history,recheck,protectedRoots:[inspectionRoot,...input.transactionEvidence?[input.transactionEvidence.root]:[]]})
        evidence.push(...prepared.evidence)
        if(prepared.status==='held')return {status:'held',reasons:prepared.reasons,operations:[],evidence}
        await recheck()
        if(!history&&remoteSubjectOverlap(prepared.plan!.subjects,subjectUnits))fail('EXISTING_UNIT_AUTHENTICATION_REQUIRED')
        const plan=prepared.plan!
        const targetRef=selected[0]?.headRef??`${policy.allowedHeadPrefixes[0]}${rawSha256(canonicalBytes({kind:'remote-unit',unitKey:plan.unitKey}))}`
        if(!selected.length){if(initial.pulls.some(pull=>pull.headRef===targetRef)||await readTarget(targetRef)!==null)fail('TARGET_COLLISION');refs.set(targetRef,null)}
        await recheck()
        if(prepared.status==='noop')return {status:'noop',reasons:[],operations:[],evidence}
        const proof=prepared.proof!,planRef=prepared.planRef!,proofRef=prepared.proofRef!
        const binding={repositoryId:policy.repositoryId,repositoryFullName:policy.repositoryFullName,master:local.master,dev:local.dev,unitKey:plan.unitKey,
          planSha256:digest('plan',plan),proofSha256:proofRef.sha256,preparedBase:proof.prepared.base,candidate:proof.candidate,candidateTree:proof.candidateTree,
          previousSeal:history?.seal??null,preservedHumanHeads:proof.preservedHumanHeads,targetRef,expectedHead:selected[0]?.head??null,
          pulls:selected.map(({number,head,headRef,createdAt,state})=>({number,head,headRef,createdAt,state})),
          producerRunId:request.producer.runId,producerRunAttempt:request.producer.attempt,producerRequestId:request.producer.requestId,requestId:request.validationRequestId}
        const transactionId=rawSha256(canonicalBytes({kind:'remote-transaction',...binding}))
        const intent=RemoteTransactionIntentSchema.parse({kind:'shared-update-remote-intent',schemaVersion:1,...binding,transactionId,stagingRef:`shared-update-staging/${transactionId}`,plan:planRef,proof:proofRef}) as RemoteTransactionIntent
        return {status:'planned',reasons:[],operations:[],evidence,intent}
      }catch(error){return {status:'held',reasons:[error instanceof LocalTransactionHold?error.message:'REMOTE_PREPARATION_UNESTABLISHED'],operations:[],evidence}}
    },
    async reconcile(value:unknown) {
      if(!input.transactionEvidence)return {status:'hold' as const,reasons:['TRANSACTION_EVIDENCE_REQUIRED','REMOTE_RAW_EVIDENCE_REQUIRED','EXACT_VALIDATION_RECEIPT_REQUIRED'],evidence:[]}
      // Retained intent is a claim, never authorization; phase cannot establish completion.
      const result=await createRemoteTransaction({reads:input.reads,evidence:input.transactionEvidence}).reconcile(value)
      return {...result,status:'hold' as const,reasons:[...result.reasons,'REMOTE_RAW_EVIDENCE_REQUIRED','EXACT_VALIDATION_RECEIPT_REQUIRED']}
    },
    async apply(_observation:RemoteRunObservation) {
      // No production writer installation exists. Even a copied or fixture intent cannot enable it.
      if(!input.transactionEvidence)return {status:'report-only' as const,reasons:['TRANSACTION_EVIDENCE_REQUIRED','WRITER_DISABLED'],evidence:[]}
      return createRemoteTransaction({reads:input.reads,evidence:input.transactionEvidence,writerCapability:input.writerCapability}).apply(_observation.intent)
    },
  }
}
