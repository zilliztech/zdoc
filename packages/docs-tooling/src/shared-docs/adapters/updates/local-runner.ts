import { constants } from 'node:fs'
import { lstat, mkdir, open, realpath } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import * as z from 'zod'
import { canonicalBytes, compareUtf8, digest, parseStrictJson } from '../../core/updates/canonical'
import { BlobRefSchema, CandidateSnapshotProofSchema, ContentMembersSchema, GitShaSchema, MaterialTreeSchema, PreparedBaseSchema,
  RepoPathSchema, SubjectSchema, ToolsetMaterialSchema, UpdateReportEnvelopeSchema, UpdateUnitPlanSchema, expectedLockPath,
  subjectKey, validateBlobBytes, validateUnitReports, type BlobRef, type BotRevision, type Subject, type ToolsetMaterial,
  type UpdateReportEnvelope, type UpdateUnitPlan } from '../../core/updates/envelope'
import { captureUnitMaterial, planUpdateBatch, type PlanningGroups, type UnitMaterialContext } from '../../core/updates/unit-plan'
import { parseRevisionMessage as importRevision } from '../../core/updates/metadata'
import { patchNextLock } from '../../core/updates/transaction'
import { immutable } from '../../core/updates/types'
import { checkedAncestors, initializeEvidence, rawSha256, readRegularBytes, writeOwnedBlob, type EvidenceStore } from './evidence'
import { assertRemoteHistoryBinding, retainRemoteHistoryOrigin, type RemoteHistoryCapability } from './remote-metadata'
import type { RemoteReads } from './remote-github'
import type { RemotePolicy } from '../../core/updates/remote'
import { createGuidesProvider } from './guides-provider'
import { createLocalMetadataInspector, type LocalJournalFacts, type LocalRevisionEvidence } from './metadata-store'
import { createScratchTransaction, LocalTransactionHold, type CandidateInput, type PreparedTransaction, type ScratchTransaction } from './transactions'
import { compareCandidateToolset, describeTrustedToolset, retainTrustedAccessEvidence, verifyClosureBinding, type TrustedToolsetCapture } from './toolset'

const absolutePath=z.string().min(1).max(4096).refine(path=>isAbsolute(path)&&resolve(path)===path&&!/[\x00-\x1f\x7f]/.test(path))
export const LocalUpdateRequestSchema=z.strictObject({kind:z.literal('shared-update-local-request'),schemaVersion:z.literal(1),
  repository:absolutePath,devRepository:absolutePath,sourceRepository:absolutePath,master:GitShaSchema,dev:GitShaSchema,sourceTarget:GitShaSchema,
  comparisonConfig:GitShaSchema.nullable(),subjects:z.array(SubjectSchema).min(1).max(64),
  existing:z.strictObject({head:GitShaSchema,donorHeads:z.array(GitShaSchema).max(8),localEvidence:z.array(absolutePath).max(256)}).nullable(),
  lifecycle:z.strictObject({runId:z.number().int().positive().max(Number.MAX_SAFE_INTEGER),archive:absolutePath.nullable()}).nullable(),
}).refine(value=>new Set(value.subjects.map(subject=>JSON.stringify(subjectKey(subject)))).size===value.subjects.length,'Duplicate subjects')
  .refine(value=>!value.existing||new Set(value.existing.donorHeads).size===value.existing.donorHeads.length,'Duplicate donors')
export type LocalUpdateRequest=z.infer<typeof LocalUpdateRequestSchema>
export class LocalInputError extends Error {}
const same=(a:unknown,b:unknown)=>Buffer.from(canonicalBytes(a)).equals(Buffer.from(canonicalBytes(b)))
const held=(reason:string):never=>{throw new LocalTransactionHold(reason)}
const name=(value:unknown)=>rawSha256(canonicalBytes(value))
const json=<T>(value:T):T=>JSON.parse(JSON.stringify(value))
export function parseLocalUpdateRequest(bytes:Uint8Array):LocalUpdateRequest {
  try {const value=LocalUpdateRequestSchema.parse(parseStrictJson(bytes));return immutable({...value,subjects:[...value.subjects].sort((a,b)=>compareUtf8(JSON.stringify(subjectKey(a)),JSON.stringify(subjectKey(b))))})}
  catch(error){throw new LocalInputError(`INVALID_LOCAL_REQUEST: ${String(error)}`)}
}
const lockBytesSchema=z.strictObject({blob:BlobRefSchema,text:z.string()})
const contextSchema=z.strictObject({subject:SubjectSchema,reportBlob:BlobRefSchema,collectedReport:UpdateReportEnvelopeSchema,members:ContentMembersSchema,
  lock:z.strictObject({path:RepoPathSchema,before:lockBytesSchema,preparedNext:lockBytesSchema.nullable()}),
  history:z.array(z.strictObject({oid:GitShaSchema,parents:z.array(GitShaSchema)})).nullable(),
  sourceInventories:z.array(z.strictObject({commit:GitShaSchema,treeOid:GitShaSchema,inventory:BlobRefSchema,absentPaths:z.array(RepoPathSchema)})),
  relevantSource:z.strictObject({current:MaterialTreeSchema,oldNext:MaterialTreeSchema,target:MaterialTreeSchema}).nullable(),reportingChanges:z.array(z.string()),holdReasons:z.array(z.string())})
const mergeSchema=z.strictObject({commit:GitShaSchema,parents:z.tuple([GitShaSchema,GitShaSchema]),mergeBase:GitShaSchema,tree:GitShaSchema,diff:BlobRefSchema})
const preparedSchema=z.strictObject({prepared:PreparedBaseSchema,preservedHeads:z.array(GitShaSchema),merges:z.array(mergeSchema)})
const directoryIdentitySchema=z.strictObject({root:absolutePath,device:z.string().regex(/^\d+$/),inode:z.string().regex(/^\d+$/)})
const inputIdentitySchema=directoryIdentitySchema.extend({head:GitShaSchema,gitDirectory:directoryIdentitySchema,commonDirectory:directoryIdentitySchema,objects:z.array(directoryIdentitySchema).min(1).max(256)})
const pageIdentitySchema=z.strictObject({pageId:z.string().min(1),manual:z.string().min(1),path:RepoPathSchema})
const position=z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)
const spanSchema=z.strictObject({file:z.string(),start:position,end:position,line:position,endLine:position})
const headingSchema=z.strictObject({anchor:z.string(),text:z.string(),line:position,source:spanSchema.optional(),stableId:z.string().optional(),context:z.string().optional()})
const axisSchema=z.enum(['old-next-to-target','current-to-candidate-next'])
const groupingSchema=z.strictObject({
  dependencies:z.array(z.strictObject({from:pageIdentitySchema,to:pageIdentitySchema,evidence:z.strictObject({axis:axisSchema,
    relation:z.strictObject({axis:axisSchema,manual:z.string(),path:RepoPathSchema,kind:z.enum(['unchanged','renamed','deleted','added']),status:z.enum(['confirmed','advisory']),
      before:headingSchema.optional(),after:headingSchema.optional(),reason:z.string()}),
    reference:z.strictObject({url:z.string(),start:position,end:position,line:position,source:spanSchema.optional()})})})).optional(),
  localJournalUnits:z.array(z.array(pageIdentitySchema)).optional(),ambiguousExistingSubjects:z.array(SubjectSchema).optional(),
})
const snapshotSchema=z.strictObject({kind:z.literal('shared-update-local-snapshot'),schemaVersion:z.literal(1),request:LocalUpdateRequestSchema,
  trustedTools:GitShaSchema,toolset:ToolsetMaterialSchema,closure:BlobRefSchema,access:BlobRefSchema,prepared:preparedSchema,
  identities:z.strictObject({repository:inputIdentitySchema,dev:inputIdentitySchema,source:inputIdentitySchema}),
  contexts:z.array(contextSchema),plans:z.array(UpdateUnitPlanSchema),grouping:groupingSchema,holds:z.array(z.string()),collectionEvidence:z.array(BlobRefSchema),dataPaths:z.array(RepoPathSchema)})
type Snapshot=z.infer<typeof snapshotSchema>
const journalSchema=z.strictObject({kind:z.literal('shared-update-local-journal'),schemaVersion:z.literal(1),request:LocalUpdateRequestSchema,
  requestSha256:z.string().regex(/^[a-f0-9]{64}$/),planSha256:z.string().regex(/^[a-f0-9]{64}$/),unitKey:z.string(),
  phase:z.enum(['prepared','created','validated','installed']),snapshot:BlobRefSchema,plan:BlobRefSchema,
  candidate:GitShaSchema.nullable(),proof:BlobRefSchema.nullable(),validation:BlobRefSchema,expectedRef:GitShaSchema.nullable()})
  .refine(value=>value.phase==='prepared'?value.candidate===null&&value.proof===null:
    value.phase==='created'?value.candidate!==null&&value.proof===null:value.candidate!==null&&value.proof!==null,'Invalid journal phase bindings')
type Journal=z.infer<typeof journalSchema>
export interface LocalRunResult {kind:'shared-update-local-result';schemaVersion:1;status:'planned'|'held'|'prepared'|'reused';unitKey:string|null;
  disposition:UpdateUnitPlan['disposition']|null;planSha256:string|null;candidate:string|null;reasons:string[];operations:[];validation:BlobRef|null;proof:BlobRef|null}
export interface CollectedLocalUnits {contexts:readonly UnitMaterialContext[];grouping:PlanningGroups;holds:string[];collectionEvidence?:readonly BlobRef[]}
/** Ordinary internal fixture seam, never a request/CLI value or installable provider registry.
 * Production obtains all of these functions from the accepted toolset capability below. */
export interface LocalUpdateRuntime {
  readonly master:string;readonly trustedTools:string;readonly gitBinary:string;readonly toolset:ToolsetMaterial;readonly closureBytes:Uint8Array
  fresh(evidence:EvidenceStore):Promise<BlobRef>
  dataPaths(transaction:ScratchTransaction,heads:readonly string[]):Promise<string[]>
  compare(transaction:ScratchTransaction,head:string,paths:readonly string[]):Promise<void>
  collect(input:{request:LocalUpdateRequest;base:PreparedTransaction;transaction:ScratchTransaction;evidence:EvidenceStore}):Promise<CollectedLocalUnits>
}
export interface RemoteCandidateBridge {
  reads:RemoteReads;policy:RemotePolicy;history:RemoteHistoryCapability|null;protectedRoots?:readonly string[]
  /** Fresh remote checks are observations, never an origin or writer grant. */
  recheck():Promise<void>
}
export interface RemoteCandidateResult {
  status:'held'|'noop'|'prepared';reasons:string[];operations:[];evidence:BlobRef[]
  plan?:UpdateUnitPlan;planRef?:BlobRef;proof?:import('../../core/updates/envelope').CandidateSnapshotProof;proofRef?:BlobRef
  transaction?:ScratchTransaction;store?:EvidenceStore
}
export interface LocalFaultHooks {afterPhase?(phase:Journal['phase'],journal:Readonly<Journal>):Promise<void>}

/** No candidate executables are loaded: the fixed Guides worker is rooted in capture. */
export function createLocalUpdateRuntime(capture:TrustedToolsetCapture,secrets:{GH_TOKEN?:string}={}):LocalUpdateRuntime {
  const trusted=describeTrustedToolset(capture)
  const runtime:LocalUpdateRuntime={master:trusted.commit,trustedTools:trusted.commit,gitBinary:trusted.git,toolset:capture.material,closureBytes:capture.bytes,
    fresh:evidence=>retainTrustedAccessEvidence(capture,evidence),
    async dataPaths(transaction,heads) {
      const allowed=new Set<string>()
      for(const head of heads)for(const entry of await transaction.tree(head))
        if(['shared-docs/guides/','content/en/guides/','content/en/byoc/'].some(root=>entry.path.startsWith(root)))allowed.add(entry.path)
      return [...allowed].sort(compareUtf8)
    },
    compare:(transaction,head,paths)=>compareCandidateToolset(capture,{root:transaction.repository,commit:head,dataPaths:[...paths]}),
    collect:input=>collectFixedGuidesUnits(capture,secrets,input),
  }
  return runtime
}

export function createLocalUpdateRunner(capture:TrustedToolsetCapture,secrets:{GH_TOKEN?:string}={}) {
  return createLocalRunnerWithRuntime(createLocalUpdateRuntime(capture,secrets))
}

/** Fixed production collection body. Direct adapter-internal reuse only; the public
 * factory still derives M/tools/runtime exclusively from its real capture. */
export async function collectFixedGuidesUnits(capture:TrustedToolsetCapture,secrets:{GH_TOKEN?:string},
  {request,base,transaction,evidence}:Parameters<LocalUpdateRuntime['collect']>[0]):Promise<CollectedLocalUnits> {
  const subjects=request.subjects.filter((subject):subject is Extract<Subject,{kind:'guides-page'}>=>subject.kind==='guides-page')
  const holds=request.subjects.filter(subject=>subject.kind==='sdk-manual').map(()=> 'PROVIDER_NOT_INSTALLED')
  if(!subjects.length)return {contexts:[],grouping:{},holds}
  const provider=await createGuidesProvider({capture,evidence,secrets,request:{kind:'guides-collection',schemaVersion:1,
    repositoryRoot:transaction.repository,sourceRepository:request.sourceRepository,devRepository:request.devRepository,master:request.master,
    configSnapshot:base.prepared.base,dev:request.dev,pages:subjects.map(subject=>subject.pageId),comparisonConfig:request.comparisonConfig,
    target:request.sourceTarget,evidenceRun:request.lifecycle?String(request.lifecycle.runId):null,evidenceZip:request.lifecycle?.archive??null},
    async prepareNext(context) {
      const entry=(await transaction.tree(base.prepared.base)).find(entry=>entry.path===context.lock.path)
      if(!entry)held('LOCK_MISSING')
      const before=await transaction.blobAt(base.prepared.base,context.lock.path)
      validateBlobBytes(context.lock.before.blob,before)
      const patch=patchNextLock({subject:context.subject,before:{path:context.lock.path,sha256:context.lock.before.blob.sha256,
        current:context.collectedReport.pins.source.current,next:context.collectedReport.pins.source.oldNext},bytes:before,
        target:context.collectedReport.pins.source.target,mode:entry.mode})
      return {blob:await writeOwnedBlob(evidence,patch.bytes),text:patch.text}
    }})
  const result=await provider.collectAll()
  const collectionEvidence=[await evidence.writeBlob(canonicalBytes({kind:'guides-local-collection-observation',schemaVersion:1,
    inventory:result.collection.inventory,holds:result.collection.holds,detailFiles:result.collection.detailFiles,grouping:result.collection.grouping})),
    ...result.collection.detailFiles.map(file=>file.blob)]
  return {contexts:result.contexts,grouping:result.collection.grouping,collectionEvidence,
    holds:[...holds,...result.collection.holds.flatMap(hold=>hold.diagnostics.map(diagnostic=>diagnostic.code))]}
}

async function refForFile(store:EvidenceStore,path:string):Promise<BlobRef> {
  const bytes=await readRegularBytes(join(store.root,path));const ref={path,sha256:rawSha256(bytes),bytes:bytes.length}
  await store.readJournal(ref);return ref
}
async function readJson<T>(store:EvidenceStore,ref:BlobRef,schema:z.ZodType<T>):Promise<T> {return schema.parse(parseStrictJson(await store.readBlob(ref)))}
async function writeJson(store:EvidenceStore,path:string,value:unknown) {
  const bytes=canonicalBytes(json(value))
  // An identical retained record needs no rewrite or newly acquired write ownership.
  try{if(Buffer.from(await readRegularBytes(join(store.root,path))).equals(Buffer.from(bytes)))return}
  catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error}
  await store.writeJournal(path,bytes)
}
async function writeNamed(store:EvidenceStore,path:string,value:unknown) {
  if(!/^(reports|units)\/[a-f0-9]{64}\.json$/.test(path))throw new LocalInputError('INVALID_OUTPUT_PATH')
  await writeOwnedBlob(store,canonicalBytes(value));const directory=dirname(join(store.root,path))
  try{await mkdir(directory,{mode:0o700})}catch(error){if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error}
  await checkedAncestors(directory)
  const handle=await open(join(store.root,path),constants.O_CREAT|constants.O_EXCL|constants.O_WRONLY|constants.O_NOFOLLOW,0o600)
  try {await handle.writeFile(canonicalBytes(value));await handle.sync();const before=await handle.stat({bigint:true}),after=await lstat(join(store.root,path),{bigint:true});if(before.ino!==after.ino||before.dev!==after.dev||after.nlink!==1n)held('OUTPUT_CHANGED')}
  finally{await handle.close()}
  await writeOwnedBlob(store,canonicalBytes(value))
}
function reportReferences(report:UpdateReportEnvelope):BlobRef[] {
  return [report.detail.file,...report.authority.evidence,...report.configurationChanges.flatMap(change=>[change.before,change.after].filter((ref):ref is BlobRef=>!!ref)),
    ...report.axes.flatMap(axis=>axis.renameCandidates.flatMap(change=>change.evidence))]
}
function snapshotReferences(snapshot:Snapshot):BlobRef[] {
  return [snapshot.closure,snapshot.access,...snapshot.collectionEvidence,...snapshot.prepared.merges.map(merge=>merge.diff),
    ...(snapshot.prepared.prepared.kind==='existing'?[snapshot.prepared.prepared.mergeEvidence,snapshot.prepared.prepared.preservationEvidence]:[]),
    ...snapshot.contexts.flatMap(context=>[context.reportBlob,context.lock.before.blob,...(context.lock.preparedNext?[context.lock.preparedNext.blob]:[]),
      ...context.sourceInventories.map(inventory=>inventory.inventory),...reportReferences(context.collectedReport)]),...snapshot.plans.flatMap(plan=>[...plan.reports,...plan.nextEdits.map(edit=>edit.afterBlob)])]
}
function meaningfulReport(report:UpdateReportEnvelope) {
  return {subject:report.subject,pins:report.pins,members:report.members,memberSetSha256:report.memberSetSha256,axes:report.axes,
    configurationChanges:report.configurationChanges,diagnostics:report.diagnostics,semanticProjection:report.semanticProjection,semanticInputSha256:report.semanticInputSha256,
    authority:{provider:report.authority.provider,subject:report.authority.subject,updateState:report.authority.updateState,reasons:report.authority.reasons}}
}

// The orchestration below installs this runtime only in ordinary trusted code.
// No serialized transport value is interpreted as a verifier or provider.
export function createLocalRunnerWithRuntime(runtime:LocalUpdateRuntime,faults:LocalFaultHooks={}) {
  const toolsetSha256=digest('toolset',runtime.toolset)
  const owner=(request:LocalUpdateRequest,planSha256?:string)=>`local-${planSha256?'prepare':'plan'}-${name({request,planSha256:planSha256??null})}`
  const repositories=(request:LocalUpdateRequest)=>[request.repository,request.devRepository,request.sourceRepository]
  function requestValue(value:unknown) {return parseLocalUpdateRequest(canonicalBytes(value))}
  async function canonicalInputs(request:LocalUpdateRequest) {
    for(const path of repositories(request))if(await realpath(path)!==path)throw new LocalInputError('INPUT_PATH_ALIAS')
    if(request.lifecycle?.archive&&await realpath(request.lifecycle.archive)!==request.lifecycle.archive)throw new LocalInputError('EVIDENCE_PATH_ALIAS')
    if(request.master!==runtime.master)held('TRUSTED_BASELINE_MISMATCH')
  }
  async function openOutput(request:LocalUpdateRequest,root:string,planSha256?:string,resume=false,protectedPaths:string[]=[]) {
    if(!absolutePath.safeParse(root).success)throw new LocalInputError('INVALID_OUTPUT_PATH')
    try{return await initializeEvidence({root,repositories:repositories(request),protectedPaths:[...protectedPaths,...request.existing?.localEvidence??[],...request.lifecycle?.archive?[request.lifecycle.archive]:[]],owner:owner(request,planSha256),resume})}
    catch(error){throw new LocalInputError(`INVALID_OWNED_OUTPUT: ${String(error)}`)}
  }
  async function closure(store:EvidenceStore) {
    const ref=await writeOwnedBlob(store,runtime.closureBytes)
    verifyClosureBinding(runtime.toolset,ref,await store.readBlob(ref),toolsetSha256)
    return ref
  }
  async function identity(transaction:ScratchTransaction,request:LocalUpdateRequest) {
    return {repository:await transaction.inputIdentity(request.repository),dev:await transaction.inputIdentity(request.devRepository),source:await transaction.inputIdentity(request.sourceRepository)}
  }
  async function verifyIdentities(transaction:ScratchTransaction,request:LocalUpdateRequest,expected:Snapshot['identities']) {
    if(!same(await identity(transaction,request),expected))held('PLAN_CHANGED')
  }
  async function importPins(transaction:ScratchTransaction,request:LocalUpdateRequest) {
    await transaction.importObjects(request.repository,[request.master,...request.comparisonConfig?[request.comparisonConfig]:[]])
    await transaction.importObjects(request.devRepository,[request.dev])
    await transaction.importObjects(request.sourceRepository,[request.sourceTarget])
  }
  async function retainReference(source:EvidenceStore,destination:EvidenceStore,ref:BlobRef) {
    const bytes=await source.readBlob(ref)
    if(ref.path===`blobs/${ref.sha256}`) {if(!same(await destination.writeBlob(bytes),ref))held('BLOB_BINDING_CHANGED');return}
    if(!/^launcher-[a-f0-9-]+\/guides-impact-v1\/(pins\.json|plan\.json|report\.json|report\.md)$/.test(ref.path))held('UNSUPPORTED_RETAINED_PATH')
    // Only the fixed provider's detail namespace may retain a non-content-addressed path.
    await writeOwnedBlob(destination,bytes)
    const parts=ref.path.split('/');let directory=destination.root
    for(const part of parts.slice(0,-1)) {directory=join(directory,part);try{await mkdir(directory,{mode:0o700})}catch(error){if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error}await checkedAncestors(directory)}
    let handle:Awaited<ReturnType<typeof open>>
    try {handle=await open(join(destination.root,ref.path),constants.O_CREAT|constants.O_EXCL|constants.O_WRONLY|constants.O_NOFOLLOW,0o600);await handle.writeFile(bytes);await handle.sync()}
    catch(error){if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error}
    finally{await handle?.close()}
    validateBlobBytes(ref,await destination.readBlob(ref))
  }
  async function checkSnapshot(store:EvidenceStore,snapshot:Snapshot) {
    if(snapshot.trustedTools!==runtime.trustedTools||snapshot.request.master!==runtime.master)held('TRUSTED_CONTEXT_CHANGED')
    // One verified observation per exact ref in this call only. Independent calls,
    // including pre-K/pre-CAS checks and retention transfers, still read afresh.
    const references=new Map<string,BlobRef>(),reports=new Map<string,Snapshot['contexts']>()
    for(const value of snapshotReferences(snapshot)) {
      const ref=BlobRefSchema.parse(value),previous=references.get(ref.path)
      if(previous&&(previous.sha256!==ref.sha256||previous.bytes!==ref.bytes))held('BLOB_REF_CONFLICT')
      references.set(ref.path,ref)
    }
    for(const context of snapshot.contexts)reports.set(context.reportBlob.path,[...reports.get(context.reportBlob.path)??[],context])
    for(const ref of references.values()) {
      const bytes=await store.readBlob(ref)
      if(ref.path===snapshot.closure.path) {
        verifyClosureBinding(snapshot.toolset,snapshot.closure,bytes,toolsetSha256)
        if(!same(snapshot.toolset,runtime.toolset)||!Buffer.from(bytes).equals(Buffer.from(runtime.closureBytes)))held('TRUSTED_CONTEXT_CHANGED')
      }
      for(const context of reports.get(ref.path)??[]) {
        validateBlobBytes(context.reportBlob,canonicalBytes(context.collectedReport))
        if(!same(UpdateReportEnvelopeSchema.parse(parseStrictJson(bytes)),context.collectedReport))held('ORIGINAL_REPORT_CHANGED')
      }
      // Bodies are consumed immediately, never retained in the metadata map.
    }
    for(const context of snapshot.contexts) {
      validateBlobBytes(context.lock.before.blob,Buffer.from(context.lock.before.text))
      if(context.lock.preparedNext)validateBlobBytes(context.lock.preparedNext.blob,Buffer.from(context.lock.preparedNext.text))
    }
    for(const plan of snapshot.plans)validateUnitReports(plan,snapshot.contexts.filter(context=>plan.subjects.some(subject=>same(subject,context.subject))).map(context=>context.collectedReport))
  }
  async function retainSnapshot(source:EvidenceStore,destination:EvidenceStore,snapshot:Snapshot) {
    await checkSnapshot(source,snapshot)
    for(const ref of snapshotReferences(snapshot))await retainReference(source,destination,ref)
    return destination.writeBlob(canonicalBytes(snapshot))
  }
  async function sourceFacts(transaction:ScratchTransaction,request:LocalUpdateRequest,contexts:readonly UnitMaterialContext[],budget?:()=>void) {
    const observations=[]
    for(const context of contexts) {
      budget?.();const report=context.collectedReport,pins=report.pins.source
      const actual=await transaction.sourceObservation(request.sourceRepository,pins.track)
      if(actual.origin.replace(/\.git$/,'')!==pins.repository.replace(/\.git$/,'')||actual.head!==pins.observedTrackHead||pins.target!==request.sourceTarget)held('SOURCE_PINS_CHANGED')
      await transaction.importObjects(request.sourceRepository,[pins.current,pins.oldNext,pins.target,pins.observedTrackHead],budget)
      for(const [from,to] of [[pins.current,pins.oldNext],[pins.oldNext,pins.target],[pins.target,pins.observedTrackHead]])if(!await transaction.isAncestor(from,to,budget))held('NON_FORWARD_HISTORY')
      for(const inventory of context.sourceInventories)if((await transaction.commit(inventory.commit,budget)).tree!==inventory.treeOid)held('SOURCE_INVENTORY_CHANGED')
      observations.push(actual)
    }
    return observations
  }
  async function recheckSources(transaction:ScratchTransaction,request:LocalUpdateRequest,observations:Awaited<ReturnType<typeof sourceFacts>>) {
    for(const observation of observations)if(!same(await transaction.sourceObservation(request.sourceRepository,observation.track),observation))held('SOURCE_PINS_CHANGED')
  }
  async function collect(request:LocalUpdateRequest,store:EvidenceStore,transaction:ScratchTransaction,base:PreparedTransaction,grouping?:PlanningGroups,budget?:()=>void) {
    budget?.();const access=await runtime.fresh(store);budget?.()
    const collected=await runtime.collect({request,base,transaction,evidence:store});budget?.()
    const contexts=collected.contexts.map(context=>captureUnitMaterial(contextSchema.parse(json(context)) as UnitMaterialContext))
    if(new Set(contexts.map(context=>JSON.stringify(subjectKey(context.subject)))).size!==contexts.length)held('DUPLICATE_COLLECTED_SUBJECT')
    for(const context of contexts) {
      const report=context.collectedReport
      if(!request.subjects.some(subject=>same(subject,context.subject))||!same(report.subject,context.subject)||report.pins.master!==request.master||report.pins.dev!==request.dev
        ||report.pins.trustedTools!==runtime.trustedTools||report.pins.toolsetSha256!==toolsetSha256||report.pins.configSnapshot!==base.prepared.base
        ||report.pins.configTreeOid!==base.prepared.tree||report.pins.comparisonConfig!==request.comparisonConfig)held('COLLECTED_PINS_CHANGED')
      validateBlobBytes(context.reportBlob,canonicalBytes(report));await store.readBlob(context.reportBlob)
      const bytes=await transaction.blobAt(base.prepared.base,context.lock.path);validateBlobBytes(context.lock.before.blob,bytes)
      for(const ref of [context.lock.before.blob,...reportReferences(report),...context.sourceInventories.map(inventory=>inventory.inventory)])await store.readBlob(ref)
    }
    const collectionEvidence=[...collected.collectionEvidence??[]]
    for(const ref of collectionEvidence)await store.readBlob(ref)
    const observations=await sourceFacts(transaction,request,contexts,budget);budget?.()
    // Only authenticated historical unit identities supplement a fresh collection.
    // Old dependencies or ambiguity observations must never overwrite today's facts.
    const groups=groupingSchema.parse(json({...collected.grouping,...grouping?.localJournalUnits?{localJournalUnits:grouping.localJournalUnits}:{}}))
    const plans=planUpdateBatch(contexts,groups)
    const missing=request.subjects.filter(subject=>!contexts.some(context=>same(context.subject,subject)))
    const holds=[...new Set([...collected.holds,...missing.length?['SUBJECT_OBSERVATION_UNAVAILABLE']:[]])].sort(compareUtf8)
    return {access,contexts,grouping:groups,plans,holds,observations,collectionEvidence}
  }
  async function makeBase(request:LocalUpdateRequest,transaction:ScratchTransaction,additionalLocks:string[]=[],budget?:()=>void,remote=false) {
    const heads=[request.master,...request.existing?[request.existing.head,...request.existing.donorHeads]:[]]
    for(const head of heads)try{await transaction.commit(head,budget)}catch(error){budget?.();if(error instanceof LocalTransactionHold)throw error;await transaction.importObjects(request.repository,[head],budget)}
    const dataPaths=await runtime.dataPaths(transaction,heads);budget?.()
    for(const head of heads){if(!remote||head===request.master)await runtime.compare(transaction,head,dataPaths);budget?.()}
    const base=await (remote?transaction.prepareRemote:transaction.prepare)({master:request.master,head:request.existing?.head,donorHeads:request.existing?.donorHeads??[],
      lockPaths:[...new Set([...request.subjects.map(expectedLockPath),...additionalLocks])],dataPaths},budget)
    await runtime.compare(transaction,base.prepared.base,dataPaths)
    return {base,dataPaths}
  }
  interface Historical {root:string;store:EvidenceStore;transaction:ScratchTransaction;journal:Journal;journalRef:BlobRef;snapshot:Snapshot;plan:UpdateUnitPlan}
  async function histories(request:LocalUpdateRequest,transaction:ScratchTransaction) {
    const result=new Map<string,Historical>(),pending=[...request.existing?.localEvidence??[]],seen=new Set<string>()
    while(pending.length) {
      const root=pending.pop()!;if(seen.has(root))continue
      if(seen.size>=256)held('METADATA_SCAN_LIMIT');seen.add(root)
      if(await realpath(root)!==root)held('HISTORICAL_PATH_ALIAS')
      const raw=parseStrictJson(await readRegularBytes(join(root,'journal.json'))),journal=journalSchema.parse(raw)
      if(journal.phase!=='installed'||!journal.candidate||!journal.proof||journal.expectedRef!==null||journal.requestSha256!==name(journal.request))held('HISTORICAL_JOURNAL_NOT_INSTALLED')
      if(journal.request.sourceRepository!==request.sourceRepository||journal.request.repository!==request.repository||journal.request.devRepository!==request.devRepository)held('HISTORICAL_REPOSITORY_CHANGED')
      if(journal.request.master!==request.master||journal.request.dev!==request.dev)held('HISTORICAL_PINS_CHANGED')
      const store=await openOutput(journal.request,root,journal.planSha256,true),journalRef=await refForFile(store,'journal.json')
      if(!same(await readJson(store,journalRef,journalSchema),journal))held('JOURNAL_CHANGED')
      const snapshot=await readJson(store,journal.snapshot,snapshotSchema),plan=await readJson(store,journal.plan,UpdateUnitPlanSchema)
      if(!same(snapshot.request,journal.request)||digest('plan',plan)!==journal.planSha256||plan.unitKey!==journal.unitKey||!snapshot.plans.some(value=>same(value,plan)))held('HISTORICAL_PLAN_CHANGED')
      await checkSnapshot(store,snapshot)
      const previous=await createScratchTransaction({evidence:store,gitBinary:runtime.gitBinary,resume:true})
      if(await previous.readRef(journal.planSha256)!==journal.candidate)held('LOCAL_REF_CHANGED')
      const existing=result.get(journal.candidate)
      if(existing&&!same(existing.journal,journal))held('AMBIGUOUS_LOCAL_JOURNAL')
      result.set(journal.candidate,{root,store,transaction:previous,journal,journalRef,snapshot,plan})
      await transaction.importObjects(previous.repository,[journal.candidate])
      pending.push(...journal.request.existing?.localEvidence??[])
    }
    return result
  }
  function candidateInput(snapshot:Snapshot,plan:UpdateUnitPlan,revision:BotRevision):CandidateInput {
    return {base:snapshot.prepared as PreparedTransaction,plan,revision,trustedTools:runtime.trustedTools,dev:snapshot.request.dev,
      toolsetSha256,executableClosure:snapshot.closure}
  }
  async function compareFresh(original:Snapshot,fresh:Awaited<ReturnType<typeof collect>>,transaction:ScratchTransaction,historicalInstalled=false) {
    if(fresh.holds.length||original.holds.length||fresh.contexts.length!==original.contexts.length||!same(fresh.grouping,original.grouping))held('PLAN_CHANGED')
    const headTransitions=[]
    for(const context of original.contexts) {
      const current=fresh.contexts.find(item=>same(item.subject,context.subject));if(!current)held('PLAN_CHANGED')
      const before=json(meaningfulReport(context.collectedReport)),after=meaningfulReport(current.collectedReport)
      if(historicalInstalled) {
        const old=context.collectedReport.pins.source,now=current.collectedReport.pins.source
        if(old.repository!==now.repository||old.track!==now.track||old.target!==now.target
          ||!await transaction.isAncestor(old.target,old.observedTrackHead)||!await transaction.isAncestor(old.observedTrackHead,now.observedTrackHead))held('HISTORICAL_SOURCE_REWRITTEN')
        before.pins.source.observedTrackHead=now.observedTrackHead
        headTransitions.push({subject:context.subject,target:old.target,before:old.observedTrackHead,after:now.observedTrackHead,repository:old.repository,track:old.track})
      }
      if(!same(before,after)||!same(context.lock,current.lock)||!same(context.relevantSource,current.relevantSource)
        ||!same(context.sourceInventories,current.sourceInventories)||!same(context.reportingChanges,current.reportingChanges)||!same(context.holdReasons,current.holdReasons))held('PLAN_CHANGED')
    }
    if(fresh.plans.length!==original.plans.length)held('PLAN_CHANGED')
    for(const plan of original.plans) {
      const current=fresh.plans.find(value=>value.unitKey===plan.unitKey)
      if(!current||!same({...current,reports:plan.reports},plan))held('PLAN_CHANGED')
    }
    return headTransitions
  }
  async function verifyHistorical(record:Historical,facts:LocalJournalFacts,destination:EvidenceStore,transaction:ScratchTransaction):Promise<LocalRevisionEvidence> {
    facts.checkBudget();const {journal,snapshot,plan}=record
    if(journal.candidate!==facts.candidate.oid||snapshot.request.master!==facts.context.baseline||snapshot.prepared.prepared.base!==facts.parent.oid)held('HISTORICAL_PINS_CHANGED')
    if(!same(await readJson(record.store,record.journalRef,journalSchema),journal)||await record.transaction.readRef(journal.planSha256)!==journal.candidate)held('LOCAL_REF_CHANGED')
    await checkSnapshot(record.store,snapshot)
    const identities=await identity(transaction,snapshot.request)
    const checkoutObservations=[]
    for(const role of ['repository','dev','source'] as const) {
      const {head:before,...oldIdentity}=snapshot.identities[role],{head:after,...newIdentity}=identities[role]
      if(!same(oldIdentity,newIdentity))held('HISTORICAL_PINS_CHANGED')
      checkoutObservations.push({role,before,after})
    }
    const {base,dataPaths}=await makeBase(snapshot.request,transaction,[],facts.checkBudget)
    if(!same(base,snapshot.prepared)||!same(dataPaths,snapshot.dataPaths))held('PREPARED_BASE_CHANGED')
    // Only this installed-history branch may accept a monotonic observed track advance.
    const resolvedTarget=snapshot.contexts[0]?.collectedReport.pins.source.target
    if(!resolvedTarget||snapshot.contexts.some(context=>context.collectedReport.pins.source.target!==resolvedTarget))held('HISTORICAL_TARGET_UNKNOWN')
    const originalRequest={...snapshot.request,sourceTarget:resolvedTarget}
    // A rewritten current track may no longer reach the old observation. Its
    // independently retained objects are still required to distinguish rewind/fork
    // from absent evidence instead of asking Git about an unimported commit.
    for(const context of snapshot.contexts) {
      const pins=context.collectedReport.pins.source
      await transaction.importObjects(record.transaction.repository,[pins.current,pins.oldNext,pins.target,pins.observedTrackHead],facts.checkBudget)
    }
    const fresh=await collect(originalRequest,destination,transaction,base,snapshot.grouping,facts.checkBudget)
    const transitions=await compareFresh(snapshot,fresh,transaction,true)
    await retainSnapshot(record.store,destination,snapshot)
    const proof=await transaction.validateCandidate(candidateInput(snapshot,plan,facts.revision),facts.candidate.oid,facts.checkBudget)
    const originalProof=await readJson(record.store,journal.proof!,CandidateSnapshotProofSchema)
    if(!same(proof,originalProof))held('HISTORICAL_PROOF_CHANGED')
    for(const ref of [journal.snapshot,journal.plan,journal.validation,journal.proof!])await retainReference(record.store,destination,ref)
    const validation=await destination.writeBlob(canonicalBytes({kind:'historical-local-validation',schemaVersion:1,candidate:journal.candidate,
      journal:record.journalRef,snapshot:journal.snapshot,plan:journal.plan,originalReports:plan.reports,
      freshReports:fresh.contexts.map(context=>context.reportBlob),collectionEvidence:fresh.collectionEvidence,access:fresh.access,headTransitions:transitions,checkoutObservations}))
    const authority=fresh.contexts.flatMap(context=>context.collectedReport.authority.evidence)
    if(!authority.length||fresh.contexts.some(context=>context.collectedReport.authority.updateState!=='eligible-to-propose'))held('AUTHORITY_UNKNOWN')
    await recheckSources(transaction,originalRequest,fresh.observations)
    await verifyIdentities(transaction,originalRequest,identities)
    const copiedJournal=`history-${journal.candidate}.json`;await writeJson(destination,copiedJournal,parseStrictJson(await record.store.readJournal(record.journalRef)))
    facts.checkBudget()
    return {anchor:{commit:runtime.master,tree:(await transaction.commit(runtime.master,facts.checkBudget)).tree},journal:await refForFile(destination,copiedJournal),
      plan,proof,originalReports:plan.reports,validation,authority}
  }
  async function inspectHistory(request:LocalUpdateRequest,store:EvidenceStore,transaction:ScratchTransaction,records:Map<string,Historical>,closureRef:BlobRef) {
    if(!request.existing)return null
    const baselineTree=(await transaction.commit(runtime.master)).tree
    const inspect=createLocalMetadataInspector({repository:transaction.repository,evidence:store,
      async trustedContext(){await runtime.fresh(store);return {baseline:runtime.master,baselineTree,trustedTools:runtime.trustedTools,gitBinary:runtime.gitBinary,toolsetSha256,executableClosure:closureRef}},
      async revalidateJournal(facts){const record=records.get(facts.candidate.oid);if(!record)held('LOCAL_JOURNAL_REQUIRED');return verifyHistorical(record,facts,store,transaction)}})
    const roots=[request.existing.head,...request.existing.donorHeads],candidates=[]
    for(const candidate of records.keys())if((await Promise.all(roots.map(root=>transaction.isAncestor(candidate,root)))).some(Boolean))candidates.push(candidate)
    const result=await inspect({master:runtime.master,head:request.existing.head,donorHeads:request.existing.donorHeads,journalCandidates:candidates})
    if(result.status!=='local-consistent')held(result.reasons.join(';'))
    return result
  }
  async function snapshot(request:LocalUpdateRequest,store:EvidenceStore,transaction:ScratchTransaction) {
    await canonicalInputs(request);const closureRef=await closure(store);await runtime.fresh(store)
    const identities=await identity(transaction,request);await importPins(transaction,request)
    const records=await histories(request,transaction)
    const {base,dataPaths}=await makeBase(request,transaction,[...records.values()].flatMap(record=>record.plan.nextEdits.map(edit=>edit.before.path)))
    const prior=await inspectHistory(request,store,transaction,records,closureRef)
    if(request.existing&&!prior?.revision)held('LOCAL_ORIGIN_UNKNOWN')
    const grouping:PlanningGroups={localJournalUnits:prior?.evidence.filter(evidence=>evidence.plan.subjects.every(subject=>subject.kind==='guides-page')).map(evidence=>evidence.plan.subjects.flatMap(subject=>{
      const record=records.get(evidence.proof.candidate)!,context=record.snapshot.contexts.find(context=>same(context.subject,subject))!
      return context.members.map(member=>({pageId:(subject as Extract<Subject,{kind:'guides-page'}>).pageId,manual:member.manualId,path:member.outputPath}))}))??[]}
    const fresh=await collect(request,store,transaction,base,grouping)
    await verifyIdentities(transaction,request,identities);await recheckSources(transaction,request,fresh.observations)
    const value=snapshotSchema.parse(json({kind:'shared-update-local-snapshot',schemaVersion:1,request,trustedTools:runtime.trustedTools,toolset:runtime.toolset,
      closure:closureRef,access:fresh.access,prepared:base,identities,contexts:fresh.contexts,plans:fresh.plans,grouping:fresh.grouping,holds:fresh.holds,collectionEvidence:fresh.collectionEvidence,dataPaths}))
    return {value,prior,records,observations:fresh.observations}
  }
  async function result(store:EvidenceStore,status:LocalRunResult['status'],options:Partial<LocalRunResult>={}) {
    const value:LocalRunResult={kind:'shared-update-local-result',schemaVersion:1,status,unitKey:null,disposition:null,planSha256:null,candidate:null,reasons:[],operations:[],validation:null,proof:null,...options}
    await writeJson(store,'result.json',value);return immutable(value)
  }
  function displayedPins(value:Snapshot) {
    return {master:value.request.master,dev:value.request.dev,trustedTools:value.trustedTools,prepared:value.prepared.prepared,
      source:value.contexts.map(context=>context.collectedReport.pins.source),toolsetSha256}
  }
  async function checkPlanOutput(store:EvidenceStore,value:Snapshot) {
    const expected=[['request.json',value.request],['pins.json',displayedPins(value)],
      ...value.contexts.map(context=>[`reports/${name(context.subject)}.json`,context.collectedReport]),
      ...value.plans.map(plan=>[`units/${name(plan.unitKey)}.json`,plan])] as [string,unknown][]
    for(const [path,data] of expected) {
      const bytes=await readRegularBytes(join(store.root,path))
      if(!Buffer.from(bytes).equals(Buffer.from(canonicalBytes(data))))held('PLAN_OUTPUT_CHANGED')
    }
  }
  async function savePlan(store:EvidenceStore,value:Snapshot) {
    await writeJson(store,'request.json',value.request)
    await writeJson(store,'pins.json',displayedPins(value))
    await writeJson(store,'snapshot.json',value)
    for(const context of value.contexts)await writeNamed(store,`reports/${name(context.subject)}.json`,context.collectedReport)
    for(const plan of value.plans)await writeNamed(store,`units/${name(plan.unitKey)}.json`,plan)
  }
  return {
    /** Separate remote provenance: this path never reads or creates a local journal. */
    async prepareRemoteCandidate(value:unknown,output:string,bridge:RemoteCandidateBridge):Promise<RemoteCandidateResult> {
      const request=requestValue(value);await canonicalInputs(request)
      if(request.existing?.localEvidence.length)held('REMOTE_LOCAL_EVIDENCE_FORBIDDEN')
      const store=await openOutput(request,output,undefined,false,[...bridge.protectedRoots??[]]),transaction=await createScratchTransaction({evidence:store,gitBinary:runtime.gitBinary})
      const evidence:BlobRef[]=[]
      try {
        const verifyOrigin=async()=>{
          if(!request.existing){if(bridge.history)held('REMOTE_HISTORY_CONTEXT_CHANGED');return}
          try{assertRemoteHistoryBinding(bridge.history,{reads:bridge.reads,policy:bridge.policy,head:request.existing.head,master:request.master,donorHeads:request.existing.donorHeads})}
          catch{held('REMOTE_HISTORY_CONTEXT_CHANGED')}
          const history=bridge.history!
          if(!same(history.subjects,request.subjects))held('EXISTING_UNIT_AUTHENTICATION_REQUIRED')
          const candidate=await transaction.commit(history.candidate),seal=await transaction.commit(history.seal)
          const revision=importRevision(candidate.message)
          if(!revision||revision.unitKey!==history.unitKey||!same(revision.subjects,history.subjects)||!same(seal.parents,[history.candidate])||seal.tree!==candidate.tree)held('REMOTE_ORIGIN_CHANGED')
        }
        const closureRef=await closure(store);await runtime.fresh(store)
        const identities=await identity(transaction,request);await importPins(transaction,request)
        if(request.existing)await transaction.importObjects(request.repository,[request.existing.head,...request.existing.donorHeads])
        await verifyOrigin();await bridge.recheck()
        const {base,dataPaths}=await makeBase(request,transaction,[],undefined,true)
        const first=await collect(request,store,transaction,base)
        const history=bridge.history
        // Authenticated subjects are bound to today's collected member identities.
        const grouping:PlanningGroups={localJournalUnits:history?[first.contexts.filter(context=>history.subjects.some(subject=>same(subject,context.subject))).flatMap(context=>context.subject.kind==='guides-page'?context.members.map(member=>({pageId:context.subject.kind==='guides-page'?context.subject.pageId:'',manual:member.manualId,path:member.outputPath})):[])].filter(unit=>unit.length):[]}
        const fresh=await collect(request,store,transaction,base,grouping)
        const current=snapshotSchema.parse(json({kind:'shared-update-local-snapshot',schemaVersion:1,request,trustedTools:runtime.trustedTools,toolset:runtime.toolset,
          closure:closureRef,access:fresh.access,prepared:base,identities,contexts:fresh.contexts,plans:fresh.plans,grouping:fresh.grouping,holds:fresh.holds,collectionEvidence:fresh.collectionEvidence,dataPaths}))
        await checkSnapshot(store,current)
        const reasons=[...fresh.holds,...fresh.plans.filter(plan=>plan.disposition==='hold').flatMap(plan=>plan.holdReasons)]
        if(reasons.length)return {status:'held',reasons,operations:[],evidence}
        if(fresh.plans.length!==1)held('REMOTE_UNIT_AMBIGUOUS')
        const plan=fresh.plans[0]
        if(history&&(plan.unitKey!==history.unitKey||!same(plan.subjects,history.subjects)))held('EXISTING_UNIT_AUTHENTICATION_REQUIRED')
        const provenance=history?await retainRemoteHistoryOrigin(history,{reads:bridge.reads,policy:bridge.policy,head:request.existing!.head,master:request.master,donorHeads:request.existing!.donorHeads},store):await store.writeBlob(canonicalBytes({kind:'remote-origin',schemaVersion:1,history:null}))
        evidence.push(provenance)
        const checkFresh=async()=>{
          await runtime.fresh(store);await verifyOrigin();await bridge.recheck();await checkSnapshot(store,current)
          const retained=parseStrictJson(await store.readBlob(provenance)) as {batches?:BlobRef[];records?:{blob:BlobRef}[]}
          for(const ref of [...retained.batches??[],...retained.records?.map(record=>record.blob)??[]])await store.readBlob(ref)
          const observed=await collect(request,store,transaction,base,grouping)
          await compareFresh(current,observed,transaction);await verifyIdentities(transaction,request,identities);await recheckSources(transaction,request,observed.observations)
        }
        await checkFresh()
        const planRef=await store.writeBlob(canonicalBytes(plan));evidence.push(planRef)
        if(!plan.nextEdits.length)return {status:'noop',reasons:[],operations:[],evidence,plan,planRef,transaction,store}
        if(!['candidate','draft-failure'].includes(plan.disposition))held('UNIT_NOT_PREPARABLE')
        const revision:BotRevision={kind:'shared-update-revision',schemaVersion:1,unitKey:plan.unitKey,subjects:plan.subjects,parentHead:base.prepared.base,
          master:request.master,dev:request.dev,tools:runtime.trustedTools,memberSetSha256:plan.membersSha256,planSha256:digest('plan',plan),
          previousBotCommit:history?.candidate??null,lockDeltas:plan.nextEdits.map(edit=>({path:edit.before.path,current:edit.before.current,oldNext:edit.before.next,next:edit.target})),preservedHumanHeads:base.preservedHeads}
        const input:CandidateInput={base,plan,revision,trustedTools:runtime.trustedTools,dev:request.dev,toolsetSha256,executableClosure:closureRef}
        let proof=await transaction.createCandidate(input)
        await checkFresh();await runtime.compare(transaction,proof.candidate,dataPaths)
        proof=await transaction.validateCandidate(input,proof.candidate)
        if(history&&(!await transaction.isAncestor(history.candidate,proof.prepared.base)||!await transaction.isAncestor(history.seal,proof.prepared.base)))held('REMOTE_ORIGIN_CHANGED')
        const proofRef=await store.writeBlob(canonicalBytes(proof));evidence.push(proofRef)
        return {status:'prepared',reasons:[],operations:[],evidence,plan,planRef,proof,proofRef,transaction,store}
      }catch(error){return {status:'held',reasons:[error instanceof LocalTransactionHold?error.message:'REMOTE_BRIDGE_UNESTABLISHED'],operations:[],evidence}}
    },
    async plan(value:unknown,output:string):Promise<LocalRunResult> {
      const request=requestValue(value);await canonicalInputs(request)
      const store=await openOutput(request,output),transaction=await createScratchTransaction({evidence:store,gitBinary:runtime.gitBinary})
      try {
        const current=await snapshot(request,store,transaction);await savePlan(store,current.value)
        const reasons=[...new Set([...current.value.holds,...current.value.plans.filter(plan=>plan.disposition==='hold').flatMap(plan=>plan.holdReasons)])].sort(compareUtf8)
        return result(store,reasons.length?'held':'planned',{reasons})
      } catch(error){if(error instanceof LocalTransactionHold)return result(store,'held',{reasons:[error.message]});throw error}
    },
    async prepare(value:unknown,planRoot:string,unitKey:string,output:string,options:{resume?:boolean}={}):Promise<LocalRunResult> {
      const request=requestValue(value);await canonicalInputs(request)
      if(!absolutePath.safeParse(planRoot).success||!unitKey)throw new LocalInputError('INVALID_PLAN_INPUT')
      const originalStore=await openOutput(request,planRoot,undefined,true)
      const originalSnapshotRef=await refForFile(originalStore,'snapshot.json')
      const original=await readJson(originalStore,originalSnapshotRef,snapshotSchema)
      if(!same(parseLocalUpdateRequest(await originalStore.readJournal(await refForFile(originalStore,'request.json'))),request))held('PLAN_CHANGED')
      if(!same(original.request,request))held('PLAN_CHANGED')
      await checkSnapshot(originalStore,original);await checkPlanOutput(originalStore,original)
      const plan=original.plans.find(plan=>plan.unitKey===unitKey);if(!plan)throw new LocalInputError('UNKNOWN_UNIT')
      const planSha256=digest('plan',plan),store=await openOutput(request,output,planSha256,!!options.resume,[planRoot])
      const transaction=await createScratchTransaction({evidence:store,gitBinary:runtime.gitBinary,resume:!!options.resume})
      let journal:Journal|null=null
      try {
        if(options.resume) {
          journal=await readJson(store,await refForFile(store,'journal.json'),journalSchema)
          if(journal.requestSha256!==name(request)||!same(journal.request,request)||journal.planSha256!==planSha256||journal.unitKey!==unitKey||journal.expectedRef!==null)held('JOURNAL_CHANGED')
          if(!same(await readJson(store,journal.snapshot,snapshotSchema),original)||!same(await readJson(store,journal.plan,UpdateUnitPlanSchema),plan))held('JOURNAL_CHANGED')
          const namedValidation=await refForFile(store,'validation.json')
          if(namedValidation.sha256!==journal.validation.sha256||namedValidation.bytes!==journal.validation.bytes)held('VALIDATION_CHANGED')
          await store.readBlob(journal.validation)
          const ref=await transaction.readRef(planSha256)
          if(ref!==null&&ref!==journal.candidate||journal.phase==='installed'&&ref!==journal.candidate)held('LOCAL_REF_CHANGED')
          try{await refForFile(store,'result.json')}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error}
        }
        if(original.holds.length||!['candidate','draft-failure'].includes(plan.disposition))return result(store,'held',{unitKey,disposition:plan.disposition,planSha256,reasons:[...original.holds,...plan.holdReasons,'UNIT_NOT_PREPARABLE']})
        const current=await snapshot(request,store,transaction)
        if(!same(current.value.prepared,original.prepared)||!same(current.value.identities,original.identities))held('PLAN_CHANGED')
        const fresh={contexts:current.value.contexts as UnitMaterialContext[],plans:current.value.plans,holds:current.value.holds,access:current.value.access,
          grouping:current.value.grouping,observations:current.observations,collectionEvidence:current.value.collectionEvidence}
        await compareFresh(original,fresh,transaction)
        const snapshotRef=await retainSnapshot(originalStore,store,original),planRef=await store.writeBlob(canonicalBytes(plan))
        let validation=await store.writeBlob(canonicalBytes({kind:'local-prepare-validation',schemaVersion:1,requestSha256:name(request),originalSnapshot:snapshotRef,
          originalPlan:planRef,originalReports:plan.reports,freshReports:current.value.contexts.map(context=>context.reportBlob),collectionEvidence:current.value.collectionEvidence,access:current.value.access,
          authority:current.value.contexts.flatMap(context=>context.collectedReport.authority.evidence),pins:current.value.contexts.map(context=>context.collectedReport.pins)}))
        async function phase(next:Journal['phase'],candidate:string|null,proof:BlobRef|null) {
          journal=journalSchema.parse({kind:'shared-update-local-journal',schemaVersion:1,request,requestSha256:name(request),planSha256,unitKey,
            phase:next,snapshot:snapshotRef,plan:planRef,candidate,proof,validation,expectedRef:null})
          await writeJson(store,'validation.json',parseStrictJson(await store.readBlob(validation)))
          await writeJson(store,'journal.json',journal);await faults.afterPhase?.(next,immutable(json(journal)))
        }
        if(!journal) {await writeJson(store,'request.json',request);await phase('prepared',null,null)}
        const revision:BotRevision={kind:'shared-update-revision',schemaVersion:1,unitKey,subjects:plan.subjects,parentHead:original.prepared.prepared.base,
          master:request.master,dev:request.dev,tools:runtime.trustedTools,memberSetSha256:plan.membersSha256,planSha256,
          previousBotCommit:current.prior?.revision?.commit??null,lockDeltas:plan.nextEdits.map(edit=>({path:edit.before.path,current:edit.before.current,oldNext:edit.before.next,next:edit.target})),
          preservedHumanHeads:original.prepared.preservedHeads}
        if(request.existing&&!revision.previousBotCommit)held('LOCAL_ORIGIN_UNKNOWN')
        if(current.prior?.revision&&(current.prior.revision.value.unitKey!==plan.unitKey||!same(current.prior.revision.value.subjects,plan.subjects)))held('EXISTING_UNIT_AUTHENTICATION_REQUIRED')
        const candidateValue=candidateInput(original,plan,revision)
        async function freshBeforeWrite() {
          await runtime.fresh(store)
          if(!same(await readJson(originalStore,originalSnapshotRef,snapshotSchema),original))held('PLAN_CHANGED')
          await checkSnapshot(originalStore,original);await checkPlanOutput(originalStore,original);await checkSnapshot(store,original)
          const observed=await collect(request,store,transaction,original.prepared as PreparedTransaction,current.value.grouping as PlanningGroups)
          await compareFresh(original,observed,transaction)
          if(request.existing)await inspectHistory(request,store,transaction,current.records,original.closure)
          await verifyIdentities(transaction,request,original.identities);await recheckSources(transaction,request,observed.observations)
          validation=await store.writeBlob(canonicalBytes({kind:'local-prepare-validation',schemaVersion:1,requestSha256:name(request),originalSnapshot:snapshotRef,
            originalPlan:planRef,originalReports:plan.reports,freshReports:observed.contexts.map(context=>context.reportBlob),collectionEvidence:observed.collectionEvidence,access:observed.access,
            authority:observed.contexts.flatMap(context=>context.collectedReport.authority.evidence),pins:observed.contexts.map(context=>context.collectedReport.pins)}))
        }
        await freshBeforeWrite()
        let proof=journal.candidate?await transaction.validateCandidate(candidateValue,journal.candidate):await transaction.createCandidate(candidateValue)
        if(!journal.candidate)await phase('created',proof.candidate,null)
        if(journal.proof) {
          try {if(!same(await readJson(store,journal.proof,CandidateSnapshotProofSchema),proof))held('CANDIDATE_PROOF_CHANGED')}
          catch(error){if(journal.phase!=='installed'||(error as NodeJS.ErrnoException).code!=='ENOENT')throw error}
        }
        const proofRef=await store.writeBlob(canonicalBytes(proof))
        // Reopen named proof before an atomic replacement during an owned resume.
        if(options.resume)try{await refForFile(store,'proof.json')}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error}
        await writeJson(store,'proof.json',proof)
        const wasInstalled=journal.phase==='installed'
        if(!wasInstalled)await phase('validated',proof.candidate,proofRef)
        await freshBeforeWrite()
        await runtime.compare(transaction,proof.candidate,original.dataPaths)
        proof=await transaction.validateCandidate(candidateValue,proof.candidate)
        const ref=await transaction.readRef(planSha256)
        if(ref!==null&&ref!==proof.candidate)held('LOCAL_REF_CHANGED')
        if(ref===null)await transaction.install(planSha256,proof.candidate,null)
        await phase('installed',proof.candidate,proofRef)
        return result(store,wasInstalled?'reused':'prepared',{unitKey,disposition:plan.disposition,planSha256,candidate:proof.candidate,validation,proof:proofRef})
      } catch(error) {if(error instanceof LocalTransactionHold)return result(store,'held',{unitKey,disposition:plan.disposition,planSha256,reasons:[error.message]});throw error}
    },
  }
}
