import { request as httpsRequest } from 'node:https'
import { rootCertificates } from 'node:tls'
import { inflateRawSync } from 'node:zlib'
import { performance } from 'node:perf_hooks'
import * as z from 'zod'
import { canonicalBytes, parseStrictJson } from '../../core/updates/canonical'
import { GitShaSchema, RepoPathSchema, type BlobRef } from '../../core/updates/envelope'
import { ApprovedProducerDefinitionSchema, REMOTE_IO_LIMITS as IO, REMOTE_LIMITS as LIMIT,
  RemoteCommitSchema, RemotePolicySchema, RemotePullSchema, RemoteRefSchema, RemoteRepositorySchema,
  type ApprovedProducerDefinition, type RemoteCommit, type RemotePolicy, type RemotePull,
  type RemoteReadResult, type RemoteRef, type RemoteRepository } from '../../core/updates/remote'
import { rawSha256, writeOwnedBlob, type EvidenceStore } from './evidence'

const fail = (code: string): never => { throw new Error(code) }
const integer = (value: unknown): number => z.number().int().positive().max(Number.MAX_SAFE_INTEGER).parse(value)
const str = (value: unknown): string => z.string().min(1).max(512).parse(value)
const obj = (value: unknown): Record<string, any> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : fail('API_SHAPE')
const same = (a: unknown, b: unknown) => Buffer.from(canonicalBytes(a)).equals(Buffer.from(canonicalBytes(b)))
const freeze = <T>(value: T): T => { if (value && typeof value === 'object' && !(value instanceof Uint8Array)) { Object.values(value).forEach(freeze); Object.freeze(value) }; return value }
export interface ReadonlyRequest { readonly method: 'GET' | 'POST'; readonly path: string; readonly body?: Uint8Array; readonly maximum: number; readonly signal: AbortSignal }
export interface RawResponse { readonly status: number; readonly headers: Readonly<Record<string, string>>; readonly body: Uint8Array }
/** Trusted network boundary only. A response does not attest any normalized identity. */
export type RemoteTransport = (request: ReadonlyRequest) => Promise<RawResponse>
const signatureQuery = 'query RemoteCommit($owner:String!,$name:String!,$oid:GitObjectID!){repository(owner:$owner,name:$name){databaseId object(oid:$oid){... on Commit{oid author{user{databaseId}} committer{user{databaseId}} signature{isValid state wasSignedByGitHub signer{databaseId} payload signature}}}}}'

/** The socket seam exercises this same streaming decoder in local tests, never changes production hosts. */
export function createRemoteTransport(options: { repositoryFullName: string; token?: string; socketRequest?: typeof httpsRequest }): RemoteTransport {
  const socket = options.socketRequest ?? httpsRequest
  const token = options.token ?? process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
  return async input => {
    if (!token) fail('CREDENTIAL_UNAVAILABLE')
    const prefix=`/repos/${options.repositoryFullName}`
    if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(options.repositoryFullName))fail('ENDPOINT_INVALID')
    // Only these historical listing queries need percent-encoded comparison operators.
    const lifecycleList = options.repositoryFullName === 'zilliztech/zdoc' && /^\/repos\/zilliztech\/zdoc\/actions\/workflows\/(?:fetch-docs|fetch-guides-requested)\.yml\/runs\?created=%3E%3D[0-9]{4}-[0-9]{2}-[0-9]{2}&per_page=100&page=(?:[1-9]|10)$/.test(input.path)
    const lifecycleTip = options.repositoryFullName === 'zilliztech/zdoc' && input.path === prefix + '/branches/dev'
    // The single reviewed Milvus track ref (dotted, so it does not match the generic ref shape).
    const milvusRef = options.repositoryFullName === 'milvus-io/milvus-docs' && input.path === prefix + '/git/ref/heads/v3.0.x'
    if(input.method==='POST') {
      if(input.path!=='/graphql'||!input.body)fail('ENDPOINT_INVALID')
      const body=obj(parseStrictJson(input.body)),variables=obj(body.variables)
      if(body.query!==signatureQuery||variables.owner+'/'+variables.name!==options.repositoryFullName||!GitShaSchema.safeParse(variables.oid).success||Object.keys(body).sort().join(',')!=='query,variables'||Object.keys(variables).sort().join(',')!=='name,oid,owner')fail('ENDPOINT_INVALID')
    } else {
      if(input.method!=='GET')fail('ENDPOINT_INVALID')
      if(input.body||!input.path.startsWith(prefix))fail('ENDPOINT_INVALID')
      const suffix=input.path.slice(prefix.length),parts=suffix.split('?')
      if (!lifecycleList && !lifecycleTip && !milvusRef) {
        if(parts.length>2||parts[0].includes('..')||! /^(?:|\/git\/(?:ref\/heads\/[A-Za-z0-9_/-]+|matching-refs\/heads\/)|\/pulls(?:\/[1-9][0-9]*)?|\/commits\/[a-f0-9]{40}(?:\/check-runs)?|\/actions\/runs\/[1-9][0-9]*(?:\/attempts\/[1-9][0-9]*(?:\/jobs)?|\/artifacts)?|\/actions\/workflows\/[1-9][0-9]*(?:\/runs)?|\/actions\/artifacts\/[1-9][0-9]*(?:\/zip)?|\/contents\/\.github\/workflows\/[A-Za-z0-9_.-]+)$/.test(parts[0]))fail('ENDPOINT_INVALID')
        for(const [key,value] of new URLSearchParams(parts[1]??''))if(!['page','per_page','state','base','filter','ref','event','head_sha'].includes(key)||! /^(?:[1-9][0-9]*|all|open|master|workflow_dispatch|[a-f0-9]{40})$/.test(value))fail('ENDPOINT_INVALID')
      }
    }
    const canonicalUrl=new URL(input.path,'https://api.github.com')
    if(canonicalUrl.origin!=='https://api.github.com'||canonicalUrl.pathname!==input.path.split('?')[0]||(!lifecycleList && input.path.includes('%')))fail('ENDPOINT_INVALID')
    const receive = (url: URL, credentials: boolean): Promise<RawResponse> => new Promise((resolve, reject) => {
      const headers: Record<string,string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'zdoc-remote-reads', 'X-GitHub-Api-Version': '2022-11-28' }
      if (credentials) headers.Authorization = `Bearer ${token}`
      if (input.body) headers['Content-Type'] = 'application/json'
      // Keep authenticated connections independent of ambient proxy agents and extra CA files.
      const req = socket(url, { method: input.method, headers, signal: input.signal, agent: false,
        ca: [...rootCertificates], rejectUnauthorized: true }, response => {
        let size = 0; const chunks: Buffer[] = []
        response.on('data', chunk => { const bytes = Buffer.from(chunk); size += bytes.length; if (size > input.maximum) { response.destroy(); req.destroy(); reject(new Error('RESPONSE_LIMIT')) } else chunks.push(bytes) })
        response.on('error', () => reject(new Error('TRANSPORT_FAILED')))
        response.on('end', () => {
          const selected: Record<string,string> = {}
          // Location is transient and never leaves this transport except inside a private redirect read.
          for (const key of ['content-type','link','location']) if (typeof response.headers[key] === 'string') selected[key] = response.headers[key] as string
          resolve({status:response.statusCode ?? 0,headers:selected,body:Buffer.concat(chunks)})
        })
      })
      req.on('error', () => reject(new Error('TRANSPORT_FAILED')))
      if (input.body) req.write(input.body)
      req.end()
    })
    let result = await receive(canonicalUrl, true)
    if (result.status >= 300 && result.status < 400) {
      if (!/\/actions\/artifacts\/[1-9][0-9]*\/zip$/.test(input.path) || input.method !== 'GET') fail('REDIRECT_REJECTED')
      const target = new URL(result.headers.location ?? '')
      if (target.protocol !== 'https:' || target.username || target.password || target.port && target.port !== '443'
        || !['.blob.core.windows.net','.actions.githubusercontent.com'].some(suffix=>target.hostname.endsWith(suffix))) fail('REDIRECT_REJECTED')
      result = await receive(target,false)
      if (result.status >= 300 && result.status < 400) fail('REDIRECT_REJECTED')
    }
    const headers: Record<string,string> = {}
    for (const key of ['content-type','link']) if (result.headers[key]) headers[key]=result.headers[key]
    return {status:result.status,headers,body:result.body}
  }
}

/** Bounded supported ZIP subset. No extraction, shell, URL, or candidate code. */
export function parseRemoteZip(input: Uint8Array): ReadonlyMap<string, Uint8Array> {
  if (input.length > LIMIT.archiveBytes || input.length < 22) fail('ZIP_LIMIT')
  const bytes = Buffer.from(input), end = bytes.length - 22
  if (bytes.readUInt32LE(end) !== 0x06054b50 || bytes.readUInt16LE(end+20) || bytes.readUInt16LE(end+4) || bytes.readUInt16LE(end+6)) fail('ZIP_FORMAT')
  const count = bytes.readUInt16LE(end+10), countDisk=bytes.readUInt16LE(end+8), length=bytes.readUInt32LE(end+12), offset=bytes.readUInt32LE(end+16)
  if (!count || count>LIMIT.members || count!==countDisk || offset+length!==end) fail('ZIP_DIRECTORY')
  const result=new Map<string,Uint8Array>(), folded=new Set<string>(), ranges:{start:number;end:number}[]=[]
  let at=offset, expanded=0
  const crc32=(data:Uint8Array)=>{let crc=0xffffffff;for(const byte of data){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return (crc^0xffffffff)>>>0}
  for(let n=0;n<count;n++) {
    if(at+46>end||bytes.readUInt32LE(at)!==0x02014b50)fail('ZIP_DIRECTORY')
    const flags=bytes.readUInt16LE(at+8), method=bytes.readUInt16LE(at+10), crc=bytes.readUInt32LE(at+16), compressed=bytes.readUInt32LE(at+20), size=bytes.readUInt32LE(at+24)
    const names=bytes.readUInt16LE(at+28), extra=bytes.readUInt16LE(at+30), comments=bytes.readUInt16LE(at+32), disk=bytes.readUInt16LE(at+34), attributes=bytes.readUInt32LE(at+38), local=bytes.readUInt32LE(at+42)
    if(flags&~0x808||![0,8].includes(method)||disk||extra||comments||compressed===0xffffffff||size>LIMIT.outputBytes||at+46+names>end||local+30>offset)fail('ZIP_UNSUPPORTED')
    const nameBytes=bytes.subarray(at+46,at+46+names), name=new TextDecoder('utf8',{fatal:true}).decode(nameBytes)
    RepoPathSchema.parse(name)
    if(folded.has(name.toLowerCase())||name.endsWith('/')||![0,0x8000].includes((attributes>>>16)&0xf000)||(attributes&0x10)!==0)fail('ZIP_MEMBER')
    folded.add(name.toLowerCase())
    if(bytes.readUInt32LE(local)!==0x04034b50||bytes.readUInt16LE(local+6)!==flags||bytes.readUInt16LE(local+8)!==method)fail('ZIP_LOCAL')
    const localNames=bytes.readUInt16LE(local+26),localExtra=bytes.readUInt16LE(local+28),start=local+30+localNames+localExtra, stop=start+compressed
    if(localExtra||localNames!==names||!bytes.subarray(local+30,local+30+names).equals(nameBytes)||stop>offset)fail('ZIP_LOCAL')
    const localValues=[bytes.readUInt32LE(local+14),bytes.readUInt32LE(local+18),bytes.readUInt32LE(local+22)],actual=[crc,compressed,size]
    let rangeEnd=stop
    if(flags&8) {
      if(!localValues.every((value,i)=>value===0||value===actual[i]))fail('ZIP_DESCRIPTOR')
      const signed=stop+4<=offset&&bytes.readUInt32LE(stop)===0x08074b50,descriptor=stop+(signed?4:0)
      rangeEnd=descriptor+12
      if(rangeEnd>offset||actual.some((value,i)=>bytes.readUInt32LE(descriptor+i*4)!==value)||!signed&&crc===0x08074b50)fail('ZIP_DESCRIPTOR')
    } else if(!same(localValues,actual))fail('ZIP_LOCAL')
    if(ranges.some(range=>local<range.end&&rangeEnd>range.start))fail('ZIP_OVERLAP')
    ranges.push({start:local,end:rangeEnd})
    expanded+=size;if(expanded>IO.expandedBytes)fail('ZIP_LIMIT')
    const inflated=method===8?(inflateRawSync(bytes.subarray(start,stop),{maxOutputLength:LIMIT.outputBytes,info:true}) as unknown as {buffer:Buffer;engine:{bytesWritten:number}}):null
    if(inflated&&inflated.engine.bytesWritten!==compressed)fail('ZIP_COMPRESSED_TRAILING')
    const data=inflated?inflated.buffer:bytes.subarray(start,stop)
    if(data.length!==size||crc32(data)!==crc)fail('ZIP_CRC')
    result.set(name,Uint8Array.from(data));at+=46+names+extra+comments
  }
  ranges.sort((a,b)=>a.start-b.start)
  if(at!==end||ranges[0].start!==0||ranges.some((range,i)=>range.end!==(ranges[i+1]?.start??offset)))fail('ZIP_RANGES')
  return result
}

export interface RemoteRun {
  id:number;attempt:number;repositoryId:number;headRepositoryId:number;actorId:number;workflowId:number;workflowPath:string;
  workflowDefinitionSha256:string;toolingHead:string;event:string;status:string;conclusion:string;
  workflowSuiteId:number;workflowSuiteHead:string;evidence:BlobRef[]
}
export interface RemoteArtifact {id:number;name:string;runId:number;toolingHead:string;archive:BlobRef;members:ReadonlyMap<string,Uint8Array>;evidence:BlobRef[]}
export interface RemoteCheck {id:number;name:string;appId:number;suiteId:number;head:string;status:string;conclusion:string;evidence:BlobRef[]}
export interface RemoteReads {
  readRepository():Promise<RemoteReadResult<RemoteRepository>>
  readRef(ref:string):Promise<RemoteReadResult<RemoteRef>>
  readPull(number:number):Promise<RemoteReadResult<RemotePull>>
  scanPulls(options?:{state:'all'}):Promise<RemoteReadResult<RemotePull[]>>
  readCommit(oid:string):Promise<RemoteReadResult<RemoteCommit>>
  readRun(request:{id:number;attempt:number;role:'producer'|'validator'}):Promise<RemoteReadResult<RemoteRun>>
  findValidationRuns(request:{requestId:string;master:string}):Promise<RemoteReadResult<{id:number;attempt:number}[]>>
  readChecks(oid:string):Promise<RemoteReadResult<RemoteCheck[]>>
  readArtifact(request:{runId:number;attempt:number;name:string}):Promise<RemoteReadResult<RemoteArtifact>>
}
const instances=new WeakMap<RemoteReads,{policy:RemotePolicy;definitions:readonly ApprovedProducerDefinition[];check:()=>void;retain:(bytes:Uint8Array)=>Promise<BlobRef>;repositoryNodeId:()=>Promise<string>}>()
/** Only actual constructor instances qualify, never structural interfaces or decoded JSON. */
export function remoteReadContext(reads:RemoteReads) {return instances.get(reads)}

export function createRemoteReads(input:{policy:RemotePolicy;transport?:RemoteTransport;evidence:EvidenceStore;approvedProducers?:readonly ApprovedProducerDefinition[]}):RemoteReads {
  const policy=freeze(RemotePolicySchema.parse(input.policy)) as RemotePolicy
  if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(policy.repositoryFullName))fail('POLICY_REPOSITORY')
  const definitions=freeze(z.array(ApprovedProducerDefinitionSchema).max(32).parse(input.approvedProducers??[])) as ApprovedProducerDefinition[]
  const transport=input.transport??createRemoteTransport({repositoryFullName:policy.repositoryFullName}),root=`/repos/${policy.repositoryFullName}`
  const started=performance.now();let calls=0
  const check=()=>{if(performance.now()-started>=IO.inspectionMilliseconds||calls>IO.calls)fail('READ_BUDGET')}
  const retain=(value:unknown)=>writeOwnedBlob(input.evidence,canonicalBytes(value))
  const api=async(path:string,post?:unknown,maximum:number=IO.jsonBytes)=>{
    check();calls++;check()
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),Math.max(1,Math.min(IO.requestMilliseconds,IO.inspectionMilliseconds-(performance.now()-started))))
    try {
      const response=await Promise.race([transport({method:post?'POST':'GET',path,body:post?canonicalBytes(post):undefined,maximum,signal:controller.signal}),
        new Promise<never>((_,reject)=>controller.signal.addEventListener('abort',()=>reject(new Error('READ_TIMEOUT')),{once:true}))])
      check();if(response.body.length>maximum)fail('RESPONSE_LIMIT')
      const next=nextPage(response.headers.link,path)
      // Do not retain headers, signed URLs, or API bodies containing arbitrary user text.
      const observation=await retain({path: path==='/graphql'?'/graphql':path.split('?')[0],status:response.status,bodySha256:rawSha256(response.body),nextPage:next})
      if(response.status!==200&&response.status!==404)fail('READ_HTTP')
      const value=response.status===200?post||!path.endsWith('/zip')?parseStrictJson(response.body):response.body:null
      if(post&&obj(value).errors)fail('READ_GRAPHQL')
      return {status:response.status,value,evidence:observation,next,bytes:response.body}
    } finally{clearTimeout(timer)}
  }
  function nextPage(link:string|undefined,path:string):number|null {
    if(!link)return null
    if(link.length>8192)fail('PAGINATION_LINK')
    const expected=new URL(path,'https://api.github.com'),parts=link.split(','),relations=new Set<string>()
    let next:number|null=null
    for(const part of parts){
      const match=/^\s*<([^<>\s]+)>;\s*rel="(next|prev|first|last)"\s*$/.exec(part)
      if(!match||relations.has(match[2]))fail('PAGINATION_LINK');relations.add(match[2])
      const url=new URL(match[1]);if(url.origin!=='https://api.github.com'||url.pathname!==expected.pathname||url.hash||url.username||url.password)fail('PAGINATION_LINK')
      const keys=[...url.searchParams.keys()];if(new Set(keys).size!==keys.length||!keys.includes('page'))fail('PAGINATION_LINK')
      for(const [key,value] of expected.searchParams)if(key!=='page'&&url.searchParams.get(key)!==value)fail('PAGINATION_LINK')
      for(const [key] of url.searchParams)if(key!=='page'&&!expected.searchParams.has(key))fail('PAGINATION_LINK')
      const pageText=url.searchParams.get('page')!;if(!/^[1-9][0-9]*$/.test(pageText))fail('PAGINATION_LINK')
      const page=integer(Number(pageText)),current=integer(Number(expected.searchParams.get('page')))
      if(match[2]==='next'){if(page!==current+1)fail('PAGINATION_LINK');next=page}
      if(match[2]==='prev'&&page!==current-1||match[2]==='first'&&page!==1||match[2]==='last'&&page<current)fail('PAGINATION_LINK')
    }
    return next
  }
  const guarded=async<T>(work:()=>Promise<RemoteReadResult<T>>):Promise<RemoteReadResult<T>>=>{try{
    const result=await work()
    if(result.kind!=='found')return freeze(result)
    const projection=(value:any):any=>value instanceof Uint8Array?{sha256:rawSha256(value),bytes:value.length}:value instanceof Map?[...value].map(([name,bytes])=>({name,sha256:rawSha256(bytes),bytes:bytes.length})):Array.isArray(value)?value.map(projection):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,child])=>[key,projection(child)])):value
    const manifest=await retain({kind:'remote-read-observation',value:projection(result.value)})
    const attach=(value:any)=>({...value,evidence:[...value.evidence,manifest]})
    return {kind:'found',value:freeze((Array.isArray(result.value)?result.value.map(attach):attach(result.value)) as T)}
  }catch{return {kind:'unknown',reasons:['REMOTE_READ_UNESTABLISHED']}}}
  const found=<T>(value:T):RemoteReadResult<T>=>({kind:'found',value:freeze(value)})
  const repository=async()=>{const response=await api(root);if(response.status!==200)fail('REPOSITORY_UNREADABLE');const raw=obj(response.value);if(raw.id!==policy.repositoryId||raw.full_name!==policy.repositoryFullName)fail('REPOSITORY_ID');return {id:raw.id,fullName:raw.full_name,evidence:[response.evidence]} as RemoteRepository}
  const collection=async(path:string,key?:string)=>{
    const values:Record<string,any>[]=[],evidence:BlobRef[]=[],ids=new Set<string>();let total:number|undefined
    for(let page=1;page<=IO.pages;page++){
      const response=await api(`${path}${path.includes('?')?'&':'?'}per_page=100&page=${page}`)
      if(response.status!==200)fail('COLLECTION_UNKNOWN')
      evidence.push(response.evidence)
      const data=key?obj(response.value)[key]:response.value
      if(!Array.isArray(data)||data.length>100)fail('COLLECTION_SHAPE')
      if(key){const count=z.number().int().min(0).max(2000).parse(obj(response.value).total_count);if(total!==undefined&&total!==count)fail('COLLECTION_RACE');total=count}
      for(const raw of data){const value=obj(raw),id=path.includes('/git/matching-refs/')?str(value.ref):String(integer(value.id??value.number));if(ids.has(id))fail('COLLECTION_DUPLICATE');ids.add(id);values.push(value)}
      if(response.next!==null&&response.next!==page+1)fail('PAGINATION_GAP')
      if(data.length<100){if(response.next!==null||total!==undefined&&total!==values.length)fail('COLLECTION_TRUNCATED');return {values,evidence}}
      if(response.next===null)fail('PAGINATION_TRUNCATED')
    }
    return fail('PAGINATION_LIMIT')
  }
  const pull=(value:unknown,refs:BlobRef[])=>{
    const raw=obj(value),base=obj(raw.base),head=obj(raw.head)
    const result=RemotePullSchema.parse({number:raw.number,repositoryId:policy.repositoryId,baseRepositoryId:obj(base.repo).id,headRepositoryId:obj(head.repo).id,
      baseRef:base.ref,headRef:head.ref,base:base.sha,head:head.sha,actorId:obj(raw.user).id,state:raw.merged_at?'merged':raw.state,draft:raw.draft,createdAt:raw.created_at,evidence:refs}) as RemotePull
    if(result.baseRepositoryId!==policy.repositoryId||result.headRepositoryId!==policy.repositoryId||result.baseRef!==policy.baseRef||!policy.allowedHeadPrefixes.some(prefix=>result.headRef.startsWith(prefix)))fail('PULL_SCOPE')
    return result
  }
  const run=async(request:{id:number;attempt:number;role:'producer'|'validator'})=>{
    integer(request.id);integer(request.attempt);await repository()
    const path=`${root}/actions/runs/${request.id}/attempts/${request.attempt}`,response=await api(path),raw=obj(response.value)
    const tools=GitShaSchema.parse(raw.head_sha)
    const identity=request.role==='producer'?(()=>{const matches=definitions.filter(def=>def.tools===tools&&def.workflowId===raw.workflow_id&&def.event===raw.event);if(matches.length!==1)fail('PRODUCER_AMBIGUOUS');return matches[0]})():policy.validator
    if(!identity||raw.id!==request.id||raw.run_attempt!==request.attempt||obj(raw.repository).id!==policy.repositoryId||obj(raw.head_repository).id!==policy.repositoryId
      ||obj(raw.actor).id!==identity.actorId||raw.event!==identity.event||raw.workflow_id!==identity.workflowId||raw.path!==identity.workflowPath||raw.status!=='completed'||raw.conclusion!=='success')fail('RUN_IDENTITY')
    const workflow=await api(`${root}/actions/workflows/${identity.workflowId}`)
    if(obj(workflow.value).id!==identity.workflowId||obj(workflow.value).path!==identity.workflowPath)fail('WORKFLOW_IDENTITY')
    const content=await api(`${root}/contents/${identity.workflowPath}?ref=${tools}`),file=obj(content.value)
    if(file.type!=='file'||file.encoding!=='base64'||file.path!==identity.workflowPath||typeof file.content!=='string'||file.content.length>IO.jsonBytes)fail('WORKFLOW_CONTENT')
    const encoded=file.content.replace(/\n/g,'');if(!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded))fail('WORKFLOW_CONTENT')
    const bytes=Buffer.from(encoded,'base64')
    if(rawSha256(bytes)!==identity.workflowDefinitionSha256)fail('WORKFLOW_DEFINITION')
    const again=await api(path)
    if(!same(raw,again.value))fail('RUN_RACE')
    return {id:request.id,attempt:request.attempt,repositoryId:policy.repositoryId,headRepositoryId:policy.repositoryId,actorId:identity.actorId,workflowId:identity.workflowId,
      workflowPath:identity.workflowPath,workflowDefinitionSha256:identity.workflowDefinitionSha256,toolingHead:tools,event:raw.event,status:raw.status,conclusion:raw.conclusion,
      workflowSuiteId:integer(raw.check_suite_id),workflowSuiteHead:tools,evidence:[response.evidence,workflow.evidence,content.evidence,await writeOwnedBlob(input.evidence,bytes),again.evidence]} as RemoteRun
  }
  const reads:RemoteReads={
    readRepository:()=>guarded(async()=>found(RemoteRepositorySchema.parse(await repository()) as RemoteRepository)),
    readRef:ref=>guarded(async()=>{
      if(!/^[A-Za-z0-9_/-]+$/.test(ref)||ref.includes('..')||ref.startsWith('/')||ref.endsWith('/'))fail('REF_INVALID')
      const before=await repository(),path=`${root}/git/ref/heads/${ref.split('/').map(encodeURIComponent).join('/')}`,response=await api(path)
      if(response.status===404){const listing=await collection(`${root}/git/matching-refs/heads/`);for(const value of listing.values){if(!/^refs\/heads\/.+/.test(value.ref)||obj(value.object).type!=='commit')fail('REF_INVENTORY');GitShaSchema.parse(obj(value.object).sha);str(value.node_id)}if(listing.values.some(value=>value.ref===`refs/heads/${ref}`))fail('REF_HIDDEN');await repository();return {kind:'absent',evidence:[...before.evidence,response.evidence,...listing.evidence]}}
      const raw=obj(response.value);if(raw.ref!==`refs/heads/${ref}`||obj(raw.object).type!=='commit')fail('REF_IDENTITY')
      const again=await api(path);if(!same(raw,again.value))fail('REF_RACE');await repository()
      return found(RemoteRefSchema.parse({ref,oid:obj(raw.object).sha,evidence:[response.evidence,again.evidence]}) as RemoteRef)
    }),
    readPull:number=>guarded(async()=>{
      integer(number);await repository();const path=`${root}/pulls/${number}`,response=await api(path)
      if(response.status===404){const list=await collection(`${root}/pulls?state=all`);if(list.values.some(value=>value.number===number))fail('PULL_HIDDEN');await repository();return {kind:'absent',evidence:[response.evidence,...list.evidence]}}
      const value=pull(response.value,[response.evidence]);if(value.number!==number)fail('PULL_IDENTITY')
      const again=await api(path);if(!same(response.value,again.value))fail('PULL_RACE');await repository();return found({...value,evidence:[...value.evidence,again.evidence]})
    }),
    scanPulls:options=>guarded(async()=>{await repository();const state=options?.state==='all'?'all':'open';const first=await collection(`${root}/pulls?state=${state}&base=master`),second=await collection(`${root}/pulls?state=${state}&base=master`);if(!same(first.values,second.values))fail('PULL_SCAN_RACE');await repository()
      // Out-of-namespace ordinary PRs do not claim a shared update. Unknown overlapping namespace PRs remain visible or stop the scan.
      return found(first.values.filter(raw=>policy.allowedHeadPrefixes.some(prefix=>String(raw.head?.ref??'').startsWith(prefix))).map(raw=>pull(raw,[...first.evidence,...second.evidence]))) }),
    readCommit:oid=>guarded(async()=>{
      GitShaSchema.parse(oid);await repository()
      const response=await api(`${root}/commits/${oid}`),raw=obj(response.value),commit=obj(raw.commit),verification=obj(commit.verification)
      const [owner,name]=policy.repositoryFullName.split('/'),graph=await api('/graphql',{query:signatureQuery,variables:{owner,name,oid}}),repo=obj(obj(graph.value).data?.repository),node=obj(repo.object)
      if(repo.databaseId!==policy.repositoryId||raw.sha!==oid||node.oid!==oid||!Array.isArray(raw.parents)||raw.parents.length>2)fail('COMMIT_IDENTITY')
      const author=integer(obj(raw.author).id),graphAuthor=integer(node.author?.user?.databaseId)
      if(author!==graphAuthor)fail('COMMIT_AUTHOR_IDENTITY')
      const restCommitter=raw.committer?.id??null,graphCommitter=node.committer?.user?.databaseId??null
      if(restCommitter!==null)integer(restCommitter)
      if(graphCommitter!==null)integer(graphCommitter)
      if(restCommitter!==null&&graphCommitter!==null&&restCommitter!==graphCommitter)fail('COMMIT_COMMITTER_IDENTITY')
      const signature=node.signature,valid=verification.verified===true&&verification.reason==='valid'&&signature?.isValid===true
      if(signature&&(signature.payload!==verification.payload||signature.signature!==verification.signature))fail('SIGNATURE_PAYLOAD')
      const identityEvidence=await retain({kind:'remote-commit-identity',repositoryId:policy.repositoryId,oid,
        rest:{authorActorId:author,committerActorId:restCommitter,response:response.evidence,bodySha256:rawSha256(response.bytes)},
        graphql:{authorActorId:graphAuthor,committerActorId:graphCommitter,response:graph.evidence,bodySha256:rawSha256(graph.bytes)}})
      return found(RemoteCommitSchema.parse({oid,tree:obj(commit.tree).sha,parents:raw.parents.map((parent:any)=>obj(parent).sha),authorActorId:author,
        committerActorId:node.committer?.user?.databaseId??null,signerActorId:signature?.signer?.databaseId??null,signatureValid:valid,signatureState:signature?.state??'UNSIGNED',
        wasSignedByGitHub:signature?.wasSignedByGitHub===true,payload:verification.payload??null,signature:verification.signature??null,evidence:[response.evidence,graph.evidence,identityEvidence]}) as RemoteCommit)
    }),
    readRun:request=>guarded(async()=>found(await run(request))),
    findValidationRuns:request=>guarded(async()=>{
      str(request.requestId);GitShaSchema.parse(request.master);await repository()
      const path=`${root}/actions/workflows/${policy.validator.workflowId}/runs?event=workflow_dispatch&head_sha=${request.master}`,first=await collection(path,'workflow_runs'),second=await collection(path,'workflow_runs')
      if(!same(first.values,second.values))fail('RUN_DISCOVERY_RACE')
      const selected=first.values.filter(raw=>raw.display_title===`Shared update exact ${request.requestId}`)
      for(const raw of selected)if(raw.workflow_id!==policy.validator.workflowId||raw.path!==policy.validator.workflowPath||raw.head_sha!==request.master||raw.event!=='workflow_dispatch'||obj(raw.repository).id!==policy.repositoryId||obj(raw.head_repository).id!==policy.repositoryId||obj(raw.actor).id!==policy.validator.actorId)fail('RUN_DISCOVERY_IDENTITY')
      await repository();return found(selected.map(raw=>({id:integer(raw.id),attempt:integer(raw.run_attempt),evidence:[...first.evidence,...second.evidence]})))
    }),
    readChecks:oid=>guarded(async()=>{GitShaSchema.parse(oid);await repository();const list=await collection(`${root}/commits/${oid}/check-runs?filter=all`,'check_runs'),again=await collection(`${root}/commits/${oid}/check-runs?filter=all`,'check_runs');if(!same(list.values,again.values))fail('CHECK_RACE');list.evidence.push(...again.evidence);await repository()
      const values=list.values.map(raw=>({id:integer(raw.id),name:str(raw.name),appId:integer(obj(raw.app).id),suiteId:integer(obj(raw.check_suite).id),head:GitShaSchema.parse(raw.head_sha),status:str(raw.status),conclusion:raw.conclusion===null?'pending':str(raw.conclusion),evidence:list.evidence}))
      if(values.some(value=>value.head!==oid)||values.length>LIMIT.observations)fail('CHECK_SCOPE');return found(values) }),
    readArtifact:request=>guarded(async()=>{
      integer(request.runId);integer(request.attempt);str(request.name);await repository()
      const attemptPath=`${root}/actions/runs/${request.runId}/attempts/${request.attempt}`,attemptBefore=await api(attemptPath),attempt=obj(attemptBefore.value)
      if(attempt.id!==request.runId||attempt.run_attempt!==request.attempt||obj(attempt.repository).id!==policy.repositoryId||obj(attempt.head_repository).id!==policy.repositoryId)fail('ARTIFACT_ATTEMPT')
      const list=await collection(`${root}/actions/runs/${request.runId}/artifacts`,'artifacts'),selected=list.values.filter(raw=>raw.name===request.name)
      if(selected.length!==1)fail('ARTIFACT_AMBIGUOUS');const raw=selected[0],id=integer(raw.id),owner=obj(raw.workflow_run)
      if(owner.head_sha!==attempt.head_sha||raw.expired!==false||owner.id!==request.runId||owner.repository_id!==policy.repositoryId||owner.head_repository_id!==policy.repositoryId||!/^sha256:[a-f0-9]{64}$/.test(raw.digest)||raw.size_in_bytes>LIMIT.archiveBytes)fail('ARTIFACT_OWNER')
      const before=await api(`${root}/actions/artifacts/${id}`);if(!same(raw,before.value))fail('ARTIFACT_RACE')
      const download=await api(`${root}/actions/artifacts/${id}/zip`,undefined,LIMIT.archiveBytes)
      if(download.status!==200||rawSha256(download.bytes)!==raw.digest.slice(7))fail('ARTIFACT_DIGEST')
      const members=parseRemoteZip(download.bytes),after=await api(`${root}/actions/artifacts/${id}`),again=await collection(`${root}/actions/runs/${request.runId}/artifacts`,'artifacts')
      const attemptAfter=await api(attemptPath)
      if(!same(attempt,attemptAfter.value)||!same(raw,after.value)||!same(list.values,again.values))fail('ARTIFACT_RACE');await repository()
      // runAttempt is deliberately NOT manufactured from this API: provenance authenticates it later.
      return found({id,name:request.name,runId:request.runId,toolingHead:GitShaSchema.parse(owner.head_sha),archive:await writeOwnedBlob(input.evidence,download.bytes),members,evidence:[attemptBefore.evidence,...list.evidence,before.evidence,download.evidence,after.evidence,...again.evidence,attemptAfter.evidence]})
    }),
  }
  freeze(reads);instances.set(reads,Object.freeze({policy,definitions,check,retain:(bytes:Uint8Array)=>writeOwnedBlob(input.evidence,bytes),repositoryNodeId:async()=>{await repository();const response=await api(root);const raw=obj(response.value);if(raw.id!==policy.repositoryId||raw.full_name!==policy.repositoryFullName)fail('REPOSITORY_ID');return str(raw.node_id)}}));return reads
}

export const REMOTE_REF_CAS = 'mutation SharedUpdateRefs($input:UpdateRefsInput!){updateRefs(input:$input){clientMutationId}}'
export const REMOTE_SEAL_APPEND = 'mutation SharedUpdateSeal($input:CreateCommitOnBranchInput!){createCommitOnBranch(input:$input){commit{oid}}}'
/** An injected executable transport is fixture code, not production authorization. No credential lookup. */
export function createRemoteMutationFixtureClient(input:{transport:RemoteTransport;repositoryFullName:string;repositoryId:string;targetRef:string;stagingRef:string;workflowId:number;observe?:(value:{action:string;path:string;requestSha256:string;status:number|null;responseSha256:string|null;correlationId:string|null})=>Promise<void>}) {
  const root=`/repos/${input.repositoryFullName}`
  if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(input.repositoryFullName)||!/^shared-update\/[A-Za-z0-9_/-]+$/.test(input.targetRef)||!/^shared-update-staging\/[a-f0-9]{64}$/.test(input.stagingRef)||[input.targetRef,input.stagingRef].some(ref=>ref.includes('..')||ref.endsWith('/'))||!input.repositoryId)fail('MUTATION_ALLOWLIST')
  return async(action:'blob'|'tree'|'commit'|'cas'|'seal'|'draft'|'dispatch',body:Record<string,any>):Promise<unknown>=>{
    let path:string,expected=201
    const exact=(value:Record<string,any>,keys:string[])=>{if(Object.keys(value).sort().join(',')!==keys.sort().join(','))fail('MUTATION_ALLOWLIST')}
    if(action==='cas') {
      exact(body,['name','beforeOid','afterOid','force']);if(![input.targetRef,input.stagingRef].includes(body.name)||body.force!==false)fail('MUTATION_ALLOWLIST')
      GitShaSchema.parse(body.beforeOid);GitShaSchema.parse(body.afterOid);if(/^0+$/.test(body.afterOid))fail('MUTATION_ALLOWLIST')
      path='/graphql';expected=200;body={query:REMOTE_REF_CAS,variables:{input:{repositoryId:input.repositoryId,refUpdates:[{...body,name:`refs/heads/${body.name}`}],clientMutationId:body.afterOid}}}
    } else if(action==='seal') {
      exact(body,['expectedHeadOid','message']);GitShaSchema.parse(body.expectedHeadOid)
      path='/graphql';expected=200;body={query:REMOTE_SEAL_APPEND,variables:{input:{branch:{repositoryNameWithOwner:input.repositoryFullName,branchName:input.stagingRef},expectedHeadOid:body.expectedHeadOid,message:body.message,fileChanges:{additions:[],deletions:[]}}}}
    } else if(action==='draft') {
      exact(body,['title','head','base','body','draft']);if(body.head!==input.targetRef||body.base!=='master'||body.draft!==true)fail('MUTATION_ALLOWLIST');path=`${root}/pulls`
    } else if(action==='dispatch') {
      exact(body,['ref','inputs']);exact(obj(body.inputs),['requestId','seal','master','dev']);if(body.ref!=='master'||!['seal','master','dev'].every(key=>GitShaSchema.safeParse(body.inputs[key]).success)||typeof body.inputs.requestId!=='string'||!body.inputs.requestId||body.inputs.requestId.length>256)fail('MUTATION_ALLOWLIST');path=`${root}/actions/workflows/${integer(input.workflowId)}/dispatches`;expected=204
    } else if(action==='blob'){exact(body,['content','encoding']);if(body.encoding!=='base64'||typeof body.content!=='string'||Buffer.from(body.content,'base64').toString('base64')!==body.content)fail('MUTATION_ALLOWLIST');path=`${root}/git/blobs`}
    else if(action==='tree'){exact(body,['tree']);if(!Array.isArray(body.tree)||body.tree.length>10000)fail('MUTATION_ALLOWLIST');for(const entry of body.tree){exact(obj(entry),['path','mode','type','sha']);if(typeof entry.path!=='string'||!entry.path||/[\/\0]/.test(entry.path)||['.','..'].includes(entry.path)||!['040000','100644','100755','120000'].includes(entry.mode)||entry.type!==(entry.mode==='040000'?'tree':'blob'))fail('MUTATION_ALLOWLIST');GitShaSchema.parse(entry.sha)}path=`${root}/git/trees`}
    else if(action==='commit'){exact(body,['tree','parents','author','committer','message']);GitShaSchema.parse(body.tree);if(!Array.isArray(body.parents)||body.parents.length>2||typeof body.message!=='string')fail('MUTATION_ALLOWLIST');body.parents.forEach(value=>GitShaSchema.parse(value));for(const key of ['author','committer']){exact(obj(body[key]),['name','email','date']);if(!['name','email','date'].every(field=>typeof body[key][field]==='string'&&!/[\0\r\n]/.test(body[key][field])))fail('MUTATION_ALLOWLIST')}path=`${root}/git/commits`}
    else fail('MUTATION_ALLOWLIST')
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),IO.requestMilliseconds),requestSha256=rawSha256(canonicalBytes(body));let observed=false
    try {
      const response=await Promise.race([input.transport({method:'POST',path,body:canonicalBytes(body),maximum:IO.jsonBytes,signal:controller.signal}),new Promise<never>((_,reject)=>controller.signal.addEventListener('abort',()=>reject(new Error('MUTATION_TIMEOUT')),{once:true}))])
      const correlation=response.headers['x-github-request-id'];await input.observe?.({action,path,requestSha256,status:response.status,responseSha256:rawSha256(response.body),correlationId:typeof correlation==='string'&&/^[A-Za-z0-9:-]{1,128}$/.test(correlation)?correlation:null});observed=true
      if(response.status!==expected||response.body.length>IO.jsonBytes)fail('MUTATION_UNCLASSIFIED')
      if(expected===204){if(response.body.length)fail('MUTATION_INCOMPLETE');return null}
      const value=obj(parseStrictJson(response.body));if(value.errors)fail('MUTATION_UNCLASSIFIED')
      if(path==='/graphql'&&!value.data)fail('MUTATION_INCOMPLETE')
      if(action==='cas'){const result=obj(obj(value.data).updateRefs);if(result.clientMutationId!==body.variables.input.clientMutationId)fail('MUTATION_INCOMPLETE')}
      return value
    } catch(error){if(!observed)await input.observe?.({action,path,requestSha256,status:null,responseSha256:null,correlationId:null});throw error}finally {clearTimeout(timer)}
  }
}
