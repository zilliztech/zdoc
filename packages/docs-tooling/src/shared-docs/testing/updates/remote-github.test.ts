// @vitest-environment node
import { mkdtemp, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer, request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import { deflateRawSync } from 'node:zlib'
import { afterEach, expect, it } from 'vitest'
import { canonicalBytes } from '../../core/updates/canonical'
import { REMOTE_LIMITS, type RemotePolicy } from '../../core/updates/remote'
import { createRemoteReads, createRemoteTransport, parseRemoteZip, remoteReadContext, type RemoteTransport } from '../../adapters/updates/remote-github'
import { initializeEvidence, rawSha256 } from '../../adapters/updates/evidence'
const oid='a'.repeat(40),roots:string[]=[]
afterEach(async()=>{for(const root of roots.splice(0))await rm(root,{recursive:true,force:true})})
const policy:RemotePolicy={host:'github.com',repositoryId:100,repositoryFullName:'example/zdoc',baseRef:'master',writerActorId:27,sealIdentity:{scheme:'github-app-author-v1',platformSignerActorId:99},allowedHeadPrefixes:['shared-update/'],checkAppId:9,checkName:'exact',producerArtifactName:'producer',validatorArtifactName:'validation',producer:{actorId:7,workflowId:8,workflowPath:'.github/workflows/producer.yml',workflowDefinitionSha256:rawSha256(Buffer.from('trusted producer')),event:'workflow_dispatch'},validator:{actorId:17,workflowId:18,workflowPath:'.github/workflows/validate.yml',workflowDefinitionSha256:'b'.repeat(64),event:'workflow_dispatch'}}
function zip(files:Record<string,Uint8Array>,descriptor=true) {
  const chunks:Buffer[]=[],central:Buffer[]=[];let offset=0
  for(const [name,input] of Object.entries(files)){
    const bytes=Buffer.from(input),compressed=deflateRawSync(bytes),nameBytes=Buffer.from(name);let crc=0xffffffff
    for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}crc=(crc^0xffffffff)>>>0
    const local=Buffer.alloc(30),entry=Buffer.alloc(46),desc=Buffer.alloc(descriptor?16:0)
    local.writeUInt32LE(0x04034b50);local.writeUInt16LE(descriptor?8:0,6);local.writeUInt16LE(8,8);local.writeUInt16LE(nameBytes.length,26)
    if(!descriptor){local.writeUInt32LE(crc,14);local.writeUInt32LE(compressed.length,18);local.writeUInt32LE(bytes.length,22)}
    else{desc.writeUInt32LE(0x08074b50);desc.writeUInt32LE(crc,4);desc.writeUInt32LE(compressed.length,8);desc.writeUInt32LE(bytes.length,12)}
    entry.writeUInt32LE(0x02014b50);entry.writeUInt16LE(descriptor?8:0,8);entry.writeUInt16LE(8,10);entry.writeUInt32LE(crc,16);entry.writeUInt32LE(compressed.length,20);entry.writeUInt32LE(bytes.length,24);entry.writeUInt16LE(nameBytes.length,28);entry.writeUInt32LE(offset,42)
    chunks.push(local,nameBytes,compressed,desc);central.push(entry,nameBytes);offset+=local.length+nameBytes.length+compressed.length+desc.length
  }
  const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(central.length/2,8);end.writeUInt16LE(central.length/2,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16)
  return Buffer.concat([...chunks,directory,end])
}
async function fixture() {
  const root=await mkdtemp(join(await realpath(tmpdir()),'remote-api-'));roots.push(root)
  const evidence=await initializeEvidence({root:join(root,'evidence'),repositories:[],owner:'fixture'})
  const archive=zip({'receipt.json':Buffer.from('synthetic bytes')}),metadata={id:61,name:'producer',expired:false,size_in_bytes:archive.length,digest:'sha256:'+rawSha256(archive),workflow_run:{id:30,repository_id:100,head_repository_id:100,head_sha:oid,head_branch:'master'}}
  const pr={id:20,number:20,base:{repo:{id:100},ref:'master',sha:oid},head:{repo:{id:100},ref:'shared-update/unit',sha:oid},user:{id:27},state:'open',merged_at:null,draft:true}
  const run={id:30,run_attempt:1,repository:{id:100},head_repository:{id:100},head_sha:oid,actor:{id:7},event:'workflow_dispatch',workflow_id:8,path:policy.producer.workflowPath,status:'completed',conclusion:'success',check_suite_id:50}
  const responses:Record<string,unknown>={
    '':{id:100,full_name:'example/zdoc'},'/git/ref/heads/master':{ref:'refs/heads/master',object:{type:'commit',sha:oid}},'/git/matching-refs/heads/':[],
    '/pulls/20':pr,'/pulls':[pr],'/actions/runs/30/attempts/1':run,'/actions/workflows/8':{id:8,path:policy.producer.workflowPath},
    '/contents/.github/workflows/producer.yml':{type:'file',encoding:'base64',path:policy.producer.workflowPath,content:Buffer.from('trusted producer').toString('base64')},
    '/actions/runs/30/artifacts':{total_count:1,artifacts:[metadata]},'/actions/artifacts/61':metadata,'/actions/artifacts/61/zip':archive,
    [`/commits/${oid}`]:{sha:oid,author:{id:27},committer:{id:99},parents:[],commit:{tree:{sha:oid},verification:{verified:true,reason:'valid',payload:'payload',signature:'signature'}}},
    [`/commits/${oid}/check-runs`]:{total_count:1,check_runs:[{id:41,name:'exact',app:{id:9},check_suite:{id:51},head_sha:oid,status:'completed',conclusion:'success'}]},
    '/graphql':{data:{repository:{databaseId:100,object:{oid,author:{user:{databaseId:27}},committer:{user:null},signature:{isValid:true,state:'VALID',wasSignedByGitHub:true,signer:{databaseId:99},payload:'payload',signature:'signature'}}}}},
  }
  const transcript:{method:string;path:string}[]=[];let intercept:((path:string)=>{status:number;body:unknown;headers?:Record<string,string>}|undefined)|undefined
  const transport:RemoteTransport=async request=>{
    transcript.push({method:request.method,path:request.path});const path=request.path==='/graphql'?'/graphql':request.path.replace('/repos/example/zdoc','').split('?')[0],override=intercept?.(path),value=override?override.body:responses[path]
    return {status:override?.status??(value===undefined?404:200),headers:override?.headers??{},body:value instanceof Uint8Array?value:canonicalBytes(value??null)}
  }
  const reads=createRemoteReads({policy,transport,evidence,approvedProducers:[{tools:oid,...policy.producer,protocol:'shared-update-producer-v1'}]})
  return {reads,policy,responses,pr,run,metadata,archive,evidence,transcript,setIntercept:(value:typeof intercept)=>{intercept=value}}
}
it('reads actual repository/ref/PR/run/workflow/check/signature/artifact API shapes without conflating signer and writer',async()=>{
  const f=await fixture()
  for(const value of [await f.reads.readRepository(),await f.reads.readRef('master'),await f.reads.readPull(20),await f.reads.scanPulls(),await f.reads.readRun({id:30,attempt:1,role:'producer'}),await f.reads.readChecks(oid),await f.reads.readCommit(oid),await f.reads.readArtifact({runId:30,attempt:1,name:'producer'})])expect(value.kind).toBe('found')
  const artifact=await f.reads.readArtifact({runId:30,attempt:1,name:'producer'});if(artifact.kind==='found'){expect(artifact.value).not.toHaveProperty('runAttempt');expect(Buffer.from(artifact.value.members.get('receipt.json')!).toString()).toBe('synthetic bytes')}
  expect(f.transcript.every(item=>item.method==='GET'||item.path==='/graphql')).toBe(true)
  expect(f.transcript.filter(item=>item.method==='POST').every(item=>item.path==='/graphql')).toBe(true)
})
it('only establishes ref/PR absence after readable repository and complete exact inventory',async()=>{
  const f=await fixture();expect((await f.reads.readRef('deleted')).kind).toBe('absent');expect((await f.reads.readPull(99)).kind).toBe('absent')
  f.responses['/git/matching-refs/heads/']=[{ref:'refs/heads/unrelated',node_id:'REF_node',object:{type:'commit',sha:oid}}];expect((await f.reads.readRef('deleted')).kind).toBe('absent')
  f.responses['/git/matching-refs/heads/']=[{ref:'refs/heads/deleted'}];expect((await f.reads.readRef('deleted')).kind).toBe('unknown')
  f.setIntercept(path=>path===''?{status:404,body:null}:undefined);expect((await f.reads.readRef('deleted')).kind).toBe('unknown')
})
it.each(['fork','base','writer','run-attempt','workflow','artifact-owner','expired','archive-digest','duplicate-artifact','graphql-errors','oversized'])('holds malformed or unauthenticated %s facts',async kind=>{
  const f=await fixture();let result:unknown
  if(kind==='fork')f.pr.head.repo.id=101
  if(kind==='base')f.pr.base.ref='dev'
  if(kind==='writer')f.run.actor.id=27
  if(kind==='run-attempt')f.run.run_attempt=2
  if(kind==='workflow')f.responses['/contents/.github/workflows/producer.yml']={type:'file',encoding:'base64',path:policy.producer.workflowPath,content:Buffer.from('candidate code').toString('base64')}
  if(kind==='artifact-owner')f.metadata.workflow_run.head_repository_id=101
  if(kind==='expired')f.metadata.expired=true
  if(kind==='archive-digest')f.metadata.digest='sha256:'+'f'.repeat(64)
  if(kind==='duplicate-artifact')f.responses['/actions/runs/30/artifacts']={total_count:2,artifacts:[f.metadata,{...f.metadata,id:62}]}
  if(kind==='graphql-errors')f.responses['/graphql']={errors:[{message:'Authorization: SECRET'}]}
  if(kind==='oversized')f.setIntercept(path=>path===''?{status:200,body:Buffer.alloc(1048577)}:undefined)
  if(['fork','base'].includes(kind))result=await f.reads.readPull(20)
  else if(['writer','run-attempt','workflow'].includes(kind))result=await f.reads.readRun({id:30,attempt:1,role:'producer'})
  else if(kind==='graphql-errors')result=await f.reads.readCommit(oid)
  else result=await f.reads.readArtifact({runId:30,attempt:1,name:'producer'})
  expect(result).toMatchObject({kind:'unknown'});expect(JSON.stringify(result)).not.toContain('SECRET')
})
it.each([403,429,500])('retains %s as unknown without raw diagnostics',async status=>{const f=await fixture();f.setIntercept(()=>({status,body:{message:'token-secret'}}));expect(await f.reads.readRepository()).toEqual({kind:'unknown',reasons:['REMOTE_READ_UNESTABLISHED']})})
it('holds duplicated/gapped/truncated pagination and changing inventory',async()=>{
  const f=await fixture();const item={...f.pr};f.responses['/pulls']=Array(100).fill(item);expect((await f.reads.scanPulls()).kind).toBe('unknown')
  f.responses['/pulls']=[item];let count=0;f.setIntercept(path=>path==='/pulls'?{status:200,body:++count===1?[item]:[]}:undefined);expect((await f.reads.scanPulls()).kind).toBe('unknown')
  f.setIntercept(path=>path==='/pulls'?{status:200,body:[item],headers:{link:'<https://api.github.com/repos/example/zdoc/pulls?page=3>; rel="next"'}}:undefined);expect((await f.reads.scanPulls()).kind).toBe('unknown')
})
it('exposes only immutable adapter context and locates normalized signature observations in owned evidence',async()=>{
  const f=await fixture(),context=remoteReadContext(f.reads)!;expect(Object.isFrozen(context)).toBe(true);expect(()=>{context.policy.writerActorId=99}).toThrow();expect(()=>{context.check=()=>{}}).toThrow()
  const result=await f.reads.readCommit(oid);expect(result.kind).toBe('found');if(result.kind==='found'){const observations=await Promise.all(result.value.evidence.map(ref=>f.evidence.readBlob(ref)));expect(observations.some(bytes=>Buffer.from(bytes).toString().includes('\"payload\":\"payload\"'))).toBe(true)}
})
it('requires independent approved producer definition rather than receipt or current policy strings',async()=>{
  const f=await fixture(),reads=createRemoteReads({policy,transport:async()=>({status:200,headers:{},body:canonicalBytes({})}),evidence:f.evidence})
  expect((await reads.readRun({id:30,attempt:1,role:'producer'})).kind).toBe('unknown')
})
it.each([true,false])('parses synthetic deflate ZIP with descriptor=%s using central and actual CRC/size',descriptor=>{const archive=zip({'provenance.json':Buffer.from('{}')},descriptor);expect(Buffer.from(parseRemoteZip(archive).get('provenance.json')!).toString()).toBe('{}')})
it.each(['crc','descriptor-size','missing-descriptor','truncated','alias','traversal','zip64','encrypted','overlap','bomb'])('rejects ZIP %s before evidence acceptance',kind=>{
  let archive=zip(kind==='alias'?{'A':Buffer.from('a'),'a':Buffer.from('b')}:kind==='traversal'?{'../bad':Buffer.from('a')}:{'x':Buffer.from('bytes')})
  const central=archive.indexOf(Buffer.from([0x50,0x4b,0x01,0x02])),descriptor=archive.indexOf(Buffer.from([0x50,0x4b,0x07,0x08]))
  if(kind==='crc')archive[descriptor+4]^=1
  if(kind==='descriptor-size')archive[descriptor+12]^=1
  if(kind==='missing-descriptor')archive.fill(0,descriptor,descriptor+16)
  if(kind==='truncated')archive=archive.subarray(0,archive.length-1)
  if(kind==='zip64')archive.writeUInt32LE(0xffffffff,central+20)
  if(kind==='encrypted'){archive.writeUInt16LE(9,6);archive.writeUInt16LE(9,central+8)}
  if(kind==='overlap')archive.writeUInt32LE(1,central+42)
  if(kind==='bomb')archive.writeUInt32LE(REMOTE_LIMITS.outputBytes+1,central+24)
  expect(()=>parseRemoteZip(archive)).toThrow()
})
it('uses the real streaming transport decoder, bounds bodies, rejects writes and strips redirect credentials/URLs',async()=>{
  const received:{url:string;authorization:unknown}[]=[];let oversized=false,redirect=false
  const server=createServer((req,res)=>{received.push({url:req.url!,authorization:req.headers.authorization});if(redirect&&req.url?.includes('/zip')){res.writeHead(302,{location:'https://fixture.blob.core.windows.net/archive?sig=SIGNED_SECRET'});res.end()}else{res.writeHead(200,{'content-type':'application/json'});res.end(oversized?'x'.repeat(100):'{}')}})
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const address=server.address() as {port:number}
  const socket=((url:URL,options:any,callback:any)=>httpRequest({hostname:'127.0.0.1',port:address.port,path:url.pathname+url.search,...options},callback)) as unknown as typeof httpsRequest
  const transport=createRemoteTransport({repositoryFullName:'example/zdoc',token:'SYNTHETIC_TOKEN',socketRequest:socket})
  try{
    const request={method:'GET' as const,path:'/repos/example/zdoc',maximum:10,signal:new AbortController().signal}
    expect((await transport(request)).status).toBe(200);oversized=true;await expect(transport(request)).rejects.toThrow();oversized=false
    for(const method of ['DELETE','PATCH','PUT','HEAD']){const before=received.length;await expect(transport({...request,method:method as 'GET'})).rejects.toThrow();expect(received).toHaveLength(before)}
    await expect(transport({...request,method:'POST',body:Buffer.from('{"query":"mutation{delete}"}')})).rejects.toThrow()
    for(const path of ['/repos/example/zdoc/git/ref/heads/%2e%2e/%2e%2e/%2e%2e/%2e%2e/other','/repos/example/zdoc/git/ref/heads/foo%2fbar']){const before=received.length;await expect(transport({...request,path})).rejects.toThrow();expect(received).toHaveLength(before)}
    redirect=true;const response=await transport({...request,path:'/repos/example/zdoc/actions/artifacts/1/zip'})
    expect(response.headers).not.toHaveProperty('location');expect(received.at(-1)?.authorization).toBeUndefined();expect(received[0].authorization).toBe('Bearer SYNTHETIC_TOKEN')
  }finally{await new Promise<void>(resolve=>server.close(()=>resolve()))}
})

it('rejects deflate streams with compressed trailing garbage even when central/descriptors agree',()=>{
  const original=zip({'x':Buffer.from('bytes')}),descriptor=original.indexOf(Buffer.from([0x50,0x4b,0x07,0x08])),oldCentral=original.indexOf(Buffer.from([0x50,0x4b,0x01,0x02]))
  const archive=Buffer.concat([original.subarray(0,descriptor),Buffer.from([0]),original.subarray(descriptor)]),central=oldCentral+1,end=archive.length-22
  archive.writeUInt32LE(archive.readUInt32LE(central+20)+1,central+20);archive.writeUInt32LE(archive.readUInt32LE(descriptor+1+8)+1,descriptor+1+8);archive.writeUInt32LE(archive.readUInt32LE(end+16)+1,end+16)
  expect(()=>parseRemoteZip(archive)).toThrow('ZIP_COMPRESSED_TRAILING')
})
it('uses all-base PR inventory for absence while keeping open shared scans base-filtered',async()=>{
  const f=await fixture();expect((await f.reads.readPull(99)).kind).toBe('absent')
  expect(f.transcript.some(item=>item.path.includes('/pulls?state=all&per_page='))).toBe(true)
  expect(f.transcript.some(item=>item.path.includes('/pulls?state=all&base='))).toBe(false)
})
it('rereads exact attempt after artifact download and holds an intervening attempt/head change',async()=>{
  const f=await fixture();let reads=0
  f.setIntercept(path=>path==='/actions/runs/30/attempts/1'?{status:200,body:{...f.run,head_sha:++reads===1?oid:'f'.repeat(40)}}:undefined)
  expect((await f.reads.readArtifact({runId:30,attempt:1,name:'producer'})).kind).toBe('unknown');expect(reads).toBe(2)
})

it.each([
  'BROKEN; rel="next", <https://api.github.com/repos/example/zdoc/git/matching-refs/heads/?per_page=100&page=1>; rel="prev"',
  '<https://api.github.com/repos/example/zdoc/git/matching-refs/heads/?per_page=100&page=2>; rel="next", <https://api.github.com/repos/example/zdoc/git/matching-refs/heads/?per_page=100&page=2>; rel="next"',
  '<https://api.github.com/repos/example/zdoc/git/matching-refs/heads/?per_page=100&page=2&page=3>; rel="next"',
  '<https://api.github.com/repos/example/zdoc/git/matching-refs/heads/?per_page=1&page=2>; rel="next"',
])('never certifies absence from partially parsed or contradictory Link header %s',async link=>{
  const f=await fixture();f.setIntercept(path=>path==='/git/matching-refs/heads/'?{status:200,body:[],headers:{link}}:undefined)
  expect((await f.reads.readRef('deleted')).kind).toBe('unknown')
})
it('accepts complete genuine paginated ref inventory with unrelated refs',async()=>{
  const f=await fixture();let page=0;f.setIntercept(path=>path==='/git/matching-refs/heads/'?++page===1?{status:200,body:Array.from({length:100},(_,i)=>({ref:'refs/heads/unrelated-'+i,node_id:'REF_'+i,object:{type:'commit',sha:oid}})),headers:{link:'<https://api.github.com/repos/example/zdoc/git/matching-refs/heads/?per_page=100&page=2>; rel="next"'}}:{status:200,body:[],headers:{link:'<https://api.github.com/repos/example/zdoc/git/matching-refs/heads/?per_page=100&page=1>; rel="prev"'}}:undefined)
  expect((await f.reads.readRef('deleted')).kind).toBe('absent');expect(page).toBe(2)
})

it.each(['missing-rest-author','missing-graphql-author','author-conflict','invalid-author','committer-conflict'])('holds dual API identity failure %s',async kind=>{
  const f=await fixture(),rest=f.responses[`/commits/${oid}`] as any,graph=(f.responses['/graphql'] as any).data.repository.object
  if(kind==='missing-rest-author')delete rest.author
  if(kind==='missing-graphql-author')graph.author.user=null
  if(kind==='author-conflict')rest.author.id=28
  if(kind==='invalid-author')rest.author.id=0
  if(kind==='committer-conflict')graph.committer.user={databaseId:27}
  expect(await f.reads.readCommit(oid)).toMatchObject({kind:'unknown'})
})
it('preserves nullable GraphQL committer and bounded dual API identity evidence',async()=>{
  const f=await fixture();(f.responses[`/commits/${oid}`] as any).commit.message='PRIVATE_MESSAGE'
  const result=await f.reads.readCommit(oid)
  expect(result.kind).toBe('found')
  if(result.kind==='found'){
    expect(result.value).toMatchObject({authorActorId:27,committerActorId:null,signerActorId:99})
    const bytes=await Promise.all(result.value.evidence.map(ref=>f.evidence.readBlob(ref)))
    const observations=bytes.map(value=>JSON.parse(Buffer.from(value).toString())),identity=observations.find(value=>value.kind==='remote-commit-identity')
    expect(identity).toMatchObject({repositoryId:100,oid,rest:{authorActorId:27,committerActorId:99},graphql:{authorActorId:27,committerActorId:null}})
    for(const side of ['rest','graphql']){
      expect(observations).toContainEqual(expect.objectContaining({bodySha256:identity[side].bodySha256}))
      expect(result.value.evidence).toContainEqual(identity[side].response)
    }
    expect(JSON.stringify(observations)).not.toContain('PRIVATE_MESSAGE')
  }
})
