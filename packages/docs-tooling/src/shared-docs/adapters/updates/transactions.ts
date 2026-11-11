import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { constants } from 'node:fs'
import { lstat, mkdir, open, readdir, realpath } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import { canonicalBytes, compareUtf8, digest } from '../../core/updates/canonical'
import { GitShaSchema, RepoPathSchema, UpdateUnitPlanSchema, CandidateSnapshotProofSchema, validateBlobBytes,
  type BlobRef, type BotRevision, type CandidateSnapshotProof, type PreparedBase, type UpdateUnitPlan } from '../../core/updates/envelope'
import { assertRevisionBinding, encodeRevisionMessage, parseRevisionMessage } from '../../core/updates/metadata'
import { assertNextOnlyDiff, verifyNextLockPatch } from '../../core/updates/transaction'
import { immutable } from '../../core/updates/types'
import { checkedAncestors, readRegularBytes, writeOwnedBlob, type EvidenceStore } from './evidence'
import { protectedToolsetPath } from './toolset'

const zero='0'.repeat(40), identity='Shared update local <shared-update-local@localhost>'
const scratchConfig=Buffer.from('[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = true\n')
const same=(a:unknown,b:unknown)=>Buffer.from(canonicalBytes(a)).equals(Buffer.from(canonicalBytes(b)))
export class LocalTransactionHold extends Error {}
const hold=(reason:string):never=>{throw new LocalTransactionHold(reason)}
const environment=()=>({PATH:'/usr/bin:/bin',LANG:'C',LC_ALL:'C',TZ:'UTC',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null',
  GIT_ATTR_NOSYSTEM:'1',GIT_NO_LAZY_FETCH:'1',GIT_NO_REPLACE_OBJECTS:'1',GIT_TERMINAL_PROMPT:'0',GIT_OPTIONAL_LOCKS:'0'})
const options=['--no-replace-objects','-c','core.hooksPath=/dev/null','-c','core.fsmonitor=false','-c','core.useReplaceRefs=false',
  '-c','core.attributesFile=/dev/null','-c','diff.external=','-c','commit.gpgsign=false','-c','merge.gpgsign=false',
  '-c','core.autocrlf=false','-c','gc.auto=0','-c','maintenance.auto=false']
interface TreeEntry {path:string;mode:string;type:string;oid:string}
export interface TransactionCommit {oid:string;tree:string;parents:string[];time:number;message:Uint8Array}
export interface PreparationRequest {master:string;head?:string;donorHeads:readonly string[];lockPaths:readonly string[];dataPaths:readonly string[]}
export interface MergeRecord {commit:string;parents:[string,string];mergeBase:string;tree:string;diff:BlobRef}
export interface PreparedTransaction {prepared:PreparedBase;preservedHeads:string[];merges:MergeRecord[]}
export interface CandidateInput {base:PreparedTransaction;plan:UpdateUnitPlan;revision:BotRevision;trustedTools:string;dev:string;toolsetSha256:string;executableClosure:BlobRef}

/** Internal adapter only. Every writer targets a capability-owned bare database;
 * request JSON cannot choose its executable, configuration, index or object store. */
export async function createScratchTransaction(input:{evidence:EvidenceStore;gitBinary:string;resume?:boolean}) {
  if(!isAbsolute(input.gitBinary)) throw new Error('Absolute trusted Git required')
  const store=input.evidence,repository=join(store.root,'scratch.git')
  await writeOwnedBlob(store,canonicalBytes({kind:'scratch-owner',schemaVersion:1}))
  if(input.resume) {
    const stat=await lstat(repository)
    if(!stat.isDirectory()||stat.isSymbolicLink()) hold('SCRATCH_IDENTITY_CHANGED')
  } else await mkdir(repository,{mode:0o700})
  const pins=await checkedAncestors(repository)
  async function verify() {
    await writeOwnedBlob(store,canonicalBytes({kind:'scratch-owner',schemaVersion:1}))
    for(const pin of pins) {const now=await lstat(pin.path,{bigint:true});if(now.isSymbolicLink()||!now.isDirectory()||now.dev!==pin.dev||now.ino!==pin.ino) hold('SCRATCH_IDENTITY_CHANGED')}
  }
  async function run(root:string,args:string[],stdin?:Uint8Array,extra:Record<string,string>={},budget?:()=>void):Promise<Buffer> {
    budget?.();const started=performance.now(),maximum=256*1024*1024
    return new Promise((resolve,reject)=>{
      const child=spawn(input.gitBinary,[...options,'-C',root,...args],{env:{...environment(),...extra},stdio:['pipe','pipe','pipe']})
      const out:Buffer[]=[],err:Buffer[]=[];let size=0,errorBytes=0,failed:Error|null=null
      const stop=(error:Error)=>{failed??=error;child.kill()}
      const timer=setTimeout(()=>stop(new LocalTransactionHold('GIT_OPERATION_LIMIT')),60_000)
      const poll=budget?setInterval(()=>{try{budget()}catch(error){stop(error as Error)}},25):null
      child.stdout.on('data',(chunk:Buffer)=>{size+=chunk.length;if(size>maximum)stop(new LocalTransactionHold('GIT_OUTPUT_LIMIT'));else out.push(chunk)})
      child.stderr.on('data',(chunk:Buffer)=>{errorBytes+=chunk.length;if(errorBytes<=65536)err.push(chunk)})
      child.on('error',error=>{clearTimeout(timer);if(poll)clearInterval(poll);reject(error)})
      child.on('close',code=>{
        clearTimeout(timer);if(poll)clearInterval(poll)
        try{budget?.()}catch(error){failed??=error as Error}
        if(failed)return reject(failed)
        if(code!==0)return reject(Object.assign(new Error(`Git ${args[0]} failed: ${Buffer.concat(err).toString('utf8')}`),{exitCode:code,stdout:Buffer.concat(out)}))
        if(performance.now()-started>=60_000)return reject(new LocalTransactionHold('GIT_OPERATION_LIMIT'))
        resolve(Buffer.concat(out))
      })
      child.stdin.on('error',error=>stop(error));child.stdin.end(stdin)
    })
  }
  if(!input.resume) {
    await run(repository,['init','--bare','--quiet','--object-format=sha1','--template='])
    const config=await open(join(repository,'config'),constants.O_WRONLY|constants.O_TRUNC|constants.O_NOFOLLOW)
    try {await config.writeFile(scratchConfig);await config.sync()}finally{await config.close()}
    await verify()
  }
  async function validateLayout() {
    await verify()
    if(!Buffer.from(await readRegularBytes(join(repository,'config'),4096)).equals(scratchConfig))hold('SCRATCH_CONFIG_CHANGED')
    // Git's writers may descend into loose-object/ref directories. Reject redirected
    // files and directories before import, preparation, validation or installation.
    const pending=[''];let entries=0
    while(pending.length) {
      const path=pending.pop()!,stat=await lstat(join(repository,path))
      if(stat.isSymbolicLink()||(!stat.isDirectory()&&(!stat.isFile()||stat.nlink!==1)))hold('SCRATCH_LAYOUT_UNSUPPORTED')
      if(++entries>100_000)hold('SCRATCH_LAYOUT_LIMIT')
      if(stat.isDirectory())for(const child of await readdir(join(repository,path)))pending.push(path?`${path}/${child}`:child)
    }
    if((await run(repository,['rev-parse','--is-bare-repository'])).toString().trim()!=='true')hold('SCRATCH_NOT_BARE')
    if((await run(repository,['remote'])).length)hold('SCRATCH_REMOTE_UNEXPECTED')
    for(const relative of ['objects/info/alternates','objects/info/http-alternates','shallow','info/grafts']) {
      try {await lstat(join(repository,relative));hold('SCRATCH_LAYOUT_UNSUPPORTED')}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error}
    }
    if((await run(repository,['for-each-ref','--format=%(refname)','refs/replace'])).length)hold('SCRATCH_LAYOUT_UNSUPPORTED')
    for(const path of ['objects','refs'])await checkedAncestors(join(repository,path))
  }
  await validateLayout()
  async function object(oid:string,type:'commit'|'tree'|'blob',budget?:()=>void) {
    GitShaSchema.parse(oid);const bytes=await run(repository,['cat-file',type,oid],undefined,{},budget)
    if(createHash('sha1').update(`${type} ${bytes.length}\0`).update(bytes).digest('hex')!==oid)hold('GIT_OBJECT_HASH_MISMATCH')
    return bytes
  }
  async function commit(oid:string,budget?:()=>void):Promise<TransactionCommit> {
    const raw=await object(oid,'commit',budget),split=raw.indexOf('\n\n')
    if(split<0||split>8192)hold('GIT_COMMIT_HEADER_INVALID')
    const header=new TextDecoder('utf8',{fatal:true}).decode(raw.subarray(0,split))
    const match=/^tree ([a-f0-9]{40})\n((?:parent [a-f0-9]{40}\n)*)author [^\n]+\ncommitter [^\n]+ (-?\d+) [+-]\d{4}(?:\n|$)/.exec(header)
    if(!match||/[\0\r]/.test(header))hold('GIT_COMMIT_HEADER_INVALID')
    if(/^(tree|parent|author|committer)(?: |$)/m.test(header.slice(match[0].length)))hold('GIT_COMMIT_HEADER_INVALID')
    const parents=match[2].trim().split('\n').filter(Boolean).map(line=>line.slice(7)),time=Number(match[3])
    if(parents.length>2||new Set(parents).size!==parents.length)hold('UNSUPPORTED_PARENT_GRAPH')
    if(!Number.isSafeInteger(time)||time<0||time>=253402300799)hold('UNSAFE_COMMIT_TIME')
    return {oid,tree:match[1],parents,time,message:Uint8Array.from(raw.subarray(split+2))}
  }
  async function tree(commitOrTree:string,recursive=true,budget?:()=>void):Promise<TreeEntry[]> {
    GitShaSchema.parse(commitOrTree)
    const raw=await run(repository,['ls-tree',...(recursive?['-r']:[]),'-z',commitOrTree],undefined,{},budget)
    if(raw.length>32*1024*1024)hold('TREE_INSPECTION_LIMIT')
    const lines=new TextDecoder('utf8',{fatal:true}).decode(raw).split('\0').filter(Boolean)
    if(lines.length>100_000)hold('TREE_INSPECTION_LIMIT')
    return lines.map(line=>{
      const match=/^(\d{6}) (blob|tree|commit) ([a-f0-9]{40})\t(.+)$/.exec(line)
      if(!match)hold('GIT_TREE_INVALID');RepoPathSchema.parse(match[4])
      return {mode:match[1],type:match[2],oid:match[3],path:match[4]}
    })
  }
  async function blobAt(oid:string,path:string,budget?:()=>void) {
    RepoPathSchema.parse(path);const entries=await tree(oid,true,budget),entry=entries.find(item=>item.path===path)
    if(!entry||entry.type!=='blob'||!['100644','100755'].includes(entry.mode))hold('REGULAR_INPUT_REQUIRED')
    return object(entry.oid,'blob',budget)
  }
  async function isAncestor(ancestor:string,descendant:string,budget?:()=>void) {
    GitShaSchema.parse(ancestor);GitShaSchema.parse(descendant)
    try{await run(repository,['merge-base','--is-ancestor',ancestor,descendant],undefined,{},budget);return true}
    catch(error){if((error as {exitCode?:number}).exitCode===1)return false;throw error}
  }
  async function rawDiff(before:string,after:string,budget?:()=>void) {
    GitShaSchema.parse(before);GitShaSchema.parse(after)
    return run(repository,['diff-tree','--raw','-r','-z','--no-abbrev','--no-color','--no-renames','--no-ext-diff','--no-commit-id',before,after],undefined,{},budget)
  }
  async function deterministicCommit(treeOid:string,parents:string[],message:string,budget?:()=>void) {
    const records=await Promise.all(parents.map(parent=>commit(parent,budget))),time=Math.max(...records.map(record=>record.time))+1
    if(!parents.length||!Number.isSafeInteger(time)||time>=253402300799)hold('UNSAFE_COMMIT_TIME')
    GitShaSchema.parse(treeOid)
    const raw=Buffer.from(`tree ${treeOid}\n${parents.map(parent=>`parent ${parent}\n`).join('')}author ${identity} ${time} +0000\ncommitter ${identity} ${time} +0000\n\n${message}`)
    const oid=(await run(repository,['hash-object','-t','commit','-w','--stdin'],raw,{},budget)).toString().trim()
    if(createHash('sha1').update(`commit ${raw.length}\0`).update(raw).digest('hex')!==oid)hold('GIT_OBJECT_HASH_MISMATCH')
    return oid
  }
  async function changedPaths(before:string,after:string,budget?:()=>void) {
    const a=new Map((await tree(before,true,budget)).map(entry=>[entry.path,entry])),b=new Map((await tree(after,true,budget)).map(entry=>[entry.path,entry]))
    return [...new Set([...a.keys(),...b.keys()])].filter(path=>!same(a.get(path)??null,b.get(path)??null))
  }
  async function checkData(before:string,after:string,allowed:Set<string>,budget?:()=>void) {
    const entries=new Map((await tree(after,true,budget)).map(entry=>[entry.path,entry]))
    for(const path of await changedPaths(before,after,budget)) {
      const entry=entries.get(path)
      if(protectedToolsetPath(path)||!allowed.has(path)||entry&&(!['100644','100755'].includes(entry.mode)||entry.type!=='blob'))hold('UNREVIEWED_CANDIDATE_DATA')
    }
  }
  async function prepareWithBoundary(request:PreparationRequest,budget:(()=>void)|undefined,remote:boolean):Promise<PreparedTransaction> {
    await validateLayout();budget?.();await commit(request.master,budget)
    const donors=[...request.donorHeads].sort(compareUtf8),preservedHeads=[...new Set([request.head,...donors].filter((x):x is string=>!!x))].sort(compareUtf8)
    if(donors.length>8||new Set(donors).size!==donors.length||!request.head&&donors.length)hold('DONOR_HEADS_INVALID')
    const allowed=new Set(request.dataPaths.map(path=>RepoPathSchema.parse(path))),locks=new Set(request.lockPaths.map(path=>RepoPathSchema.parse(path))),merges:MergeRecord[]=[]
    for(const head of preservedHeads){
      await commit(head,budget)
      let baseline=request.master
      if(remote){const bases=(await run(repository,['merge-base','--all',request.master,head],undefined,{},budget)).toString().trim().split('\n');if(bases.length!==1||!GitShaSchema.safeParse(bases[0]).success)hold('MERGE_BASE_UNSUPPORTED');baseline=bases[0]}
      await checkData(baseline,head,allowed,budget)
    }
    async function merge(left:string,right:string) {
      budget?.();if(await isAncestor(right,left,budget))return left
      if(await isAncestor(left,right,budget))return right
      const bases=(await run(repository,['merge-base','--all',left,right],undefined,{},budget)).toString().trim().split('\n')
      if(bases.length!==1||!GitShaSchema.safeParse(bases[0]).success)hold('MERGE_BASE_UNSUPPORTED')
      const touchedLeft=new Set(await changedPaths(bases[0],left,budget)),touchedRight=new Set(await changedPaths(bases[0],right,budget))
      if([...locks].some(path=>touchedLeft.has(path)&&touchedRight.has(path)))hold('BOTH_SIDES_LOCK_CHANGED')
      for(const head of [bases[0],left,right]) if((await tree(head,true,budget)).some(entry=>/(^|\/)\.gitattributes$/.test(entry.path)))hold('MERGE_ATTRIBUTES_UNSUPPORTED')
      let treeOid:string
      try{treeOid=(await run(repository,['merge-tree','--write-tree',left,right],undefined,{},budget)).toString().trim()}
      catch(error){if((error as {exitCode?:number}).exitCode===1)hold('MERGE_CONFLICT');throw error}
      if(!GitShaSchema.safeParse(treeOid).success)hold('MERGE_RESULT_INVALID')
      const oid=await deterministicCommit(treeOid,[left,right],`Prepare shared update base\n\n${left}\n${right}\n`,budget)
      await checkData(request.master,oid,allowed,budget)
      merges.push({commit:oid,parents:[left,right],mergeBase:bases[0],tree:treeOid,diff:await store.writeBlob(await rawDiff(left,oid,budget))})
      return oid
    }
    let base=request.head?await merge(request.head,request.master):request.master
    for(const donor of donors)base=await merge(base,donor)
    for(const head of preservedHeads)if(!await isAncestor(head,base,budget))hold('HUMAN_HISTORY_NOT_PRESERVED')
    const treeOid=(await commit(base,budget)).tree
    const prepared:PreparedBase=request.head?{kind:'existing',master:request.master,humanHead:request.head,base,tree:treeOid,
      mergeEvidence:await store.writeBlob(canonicalBytes(merges)),preservationEvidence:await store.writeBlob(canonicalBytes({base,heads:preservedHeads,diff:await store.writeBlob(await rawDiff(request.head,base,budget))}))}
      :{kind:'new',master:request.master,base,tree:treeOid}
    await verify();return immutable({prepared,preservedHeads,merges})
  }
  async function replaceLocks(baseTree:string,edits:Map<string,string>,prefix='',budget?:()=>void):Promise<string> {
    const entries=await tree(baseTree,false,budget)
    for(const entry of entries) {
      const path=prefix+entry.path
      if(edits.has(path)) {if(entry.type!=='blob'||!['100644','100755'].includes(entry.mode))hold('LOCK_MODE_UNSUPPORTED');entry.oid=edits.get(path)!;edits.delete(path)}
      else if(entry.type==='tree'&&[...edits.keys()].some(key=>key.startsWith(path+'/')))entry.oid=await replaceLocks(entry.oid,edits,path+'/',budget)
    }
    return (await run(repository,['mktree','-z'],Buffer.from(entries.map(entry=>`${entry.mode} ${entry.type} ${entry.oid}\t${entry.path}\0`).join('')),{},budget)).toString().trim()
  }
  async function candidateTree(value:CandidateInput,budget?:()=>void) {
    const plan=UpdateUnitPlanSchema.parse(value.plan)
    if(!['candidate','draft-failure'].includes(plan.disposition)||!plan.nextEdits.length)hold('UNIT_NOT_PREPARABLE')
    assertRevisionBinding(value.revision,{parent:value.base.prepared.base,master:value.base.prepared.master,tools:value.trustedTools,
      planSha256:digest('plan',plan),unitKey:plan.unitKey,memberSetSha256:plan.membersSha256})
    if(value.revision.dev!==value.dev||!same(value.revision.subjects,plan.subjects)||!same(value.revision.preservedHumanHeads,value.base.preservedHeads)
      ||!same(value.revision.lockDeltas,plan.nextEdits.map(edit=>({path:edit.before.path,current:edit.before.current,oldNext:edit.before.next,next:edit.target}))))hold('REVISION_PLAN_CHANGED')
    const base=await commit(value.base.prepared.base,budget),entries=await tree(base.tree,true,budget),edits=new Map<string,string>()
    if(base.tree!==value.base.prepared.tree)hold('PREPARED_TREE_CHANGED')
    const deltas=[]
    for(const edit of plan.nextEdits) {
      const entry=entries.find(entry=>entry.path===edit.before.path)
      if(!entry)hold('LOCK_MISSING')
      const before=await object(entry.oid,'blob',budget),after=await store.readBlob(edit.afterBlob)
      verifyNextLockPatch({subject:edit.subject,before:edit.before,bytes:before,afterBytes:after,target:edit.target,mode:entry.mode})
      deltas.push({edit,path:entry.path,beforeBytes:before,afterBytes:after,beforeMode:entry.mode,afterMode:entry.mode})
      edits.set(entry.path,(await run(repository,['hash-object','-t','blob','-w','--stdin'],after,{},budget)).toString().trim())
    }
    assertNextOnlyDiff(deltas)
    const treeOid=await replaceLocks(base.tree,edits,'',budget)
    if(edits.size||treeOid===base.tree)hold('CANDIDATE_TREE_INVALID')
    return treeOid
  }
  async function validateCandidate(value:CandidateInput,candidate:string,budget?:()=>void):Promise<CandidateSnapshotProof> {
    await validateLayout();const facts=await commit(candidate,budget),expectedTree=await candidateTree(value,budget)
    if(!same(facts.parents,[value.base.prepared.base])||facts.tree!==expectedTree||!same(parseRevisionMessage(facts.message),value.revision))hold('CANDIDATE_OBJECT_CHANGED')
    const expectedCandidate=await deterministicCommit(expectedTree,[value.base.prepared.base],encodeRevisionMessage(value.revision).commitMessage,budget)
    if(candidate!==expectedCandidate)hold('CANDIDATE_OBJECT_CHANGED')
    for(const head of value.base.preservedHeads)if(!await isAncestor(head,facts.parents[0],budget))hold('HUMAN_HISTORY_NOT_PRESERVED')
    await store.readBlob(value.executableClosure)
    const proof=CandidateSnapshotProofSchema.parse({prepared:value.base.prepared,candidate,candidateTree:facts.tree,
      patch:await store.writeBlob(await rawDiff(facts.parents[0],candidate,budget)),preservedHumanHeads:value.base.preservedHeads,
      trustedToolsetSha256:value.toolsetSha256,executableClosure:value.executableClosure,nextEdits:value.plan.nextEdits})
    await verify();return immutable(proof)
  }
  return {
    repository,commit,tree,blobAt,isAncestor,rawDiff,
    prepare:(request:PreparationRequest,budget?:()=>void)=>prepareWithBoundary(request,budget,false),
    // Git facts only: remote provenance is checked by the caller before this boundary.
    prepareRemote:(request:PreparationRequest,budget?:()=>void)=>prepareWithBoundary(request,budget,true),
    validateCandidate,read:object,
    async inputIdentity(source:string) {
      const root=await realpath(source);await checkedAncestors(root)
      const stat=await lstat(root,{bigint:true}),head=(await run(root,['rev-parse','--verify','HEAD^{commit}'])).toString().trim()
      GitShaSchema.parse(head)
      const directory=async(path:string)=>{
        if(await realpath(path)!==path)hold('REPOSITORY_PATH_ALIAS')
        await checkedAncestors(path);const entry=await lstat(path,{bigint:true})
        return {root:path,device:entry.dev.toString(),inode:entry.ino.toString()}
      }
      const gitDirectory=await directory((await run(root,['rev-parse','--path-format=absolute','--git-dir'])).toString().trim())
      const commonDirectory=await directory((await run(root,['rev-parse','--path-format=absolute','--git-common-dir'])).toString().trim())
      const objects=[],pending=[join(commonDirectory.root,'objects')],seen=new Set<string>()
      while(pending.length) {
        const path=pending.pop()!;if(seen.has(path))continue
        if(seen.size>=256)hold('OBJECT_STORE_LIMIT');seen.add(path)
        objects.push(await directory(path))
        let bytes:Uint8Array
        try{bytes=await readRegularBytes(join(path,'info/alternates'),1024*1024)}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')continue;throw error}
        for(const line of Buffer.from(bytes).toString().split('\n').filter(Boolean)) {
          if(/[\0\r]/.test(line)||line.startsWith('"'))hold('OBJECT_STORE_UNSUPPORTED')
          pending.push(resolve(path,line))
        }
      }
      objects.sort((a,b)=>compareUtf8(a.root,b.root))
      return {root,device:stat.dev.toString(),inode:stat.ino.toString(),head,gitDirectory,commonDirectory,objects}
    },
    async sourceObservation(source:string,track:string) {
      const root=await realpath(source);await checkedAncestors(root)
      const ref=`refs/heads/${track}`;await run(root,['check-ref-format',ref])
      const head=(await run(root,['rev-parse','--verify',`${ref}^{commit}`])).toString().trim();GitShaSchema.parse(head)
      const origin=(await run(root,['remote','get-url','origin'])).toString().trim()
      return {root,track,head,origin}
    },
    async importObjects(source:string,heads:readonly string[],budget?:()=>void) {
      budget?.()
      await validateLayout();const root=await realpath(source);await checkedAncestors(root)
      const unique=[...new Set(heads.map(head=>GitShaSchema.parse(head)))]
      if(!unique.length)return
      for(const option of ['--git-dir','--git-common-dir']) {
        const directory=(await run(root,['rev-parse','--path-format=absolute',option])).toString().trim();await checkedAncestors(directory)
        for(const name of ['shallow','info/grafts'])try{await lstat(join(directory,name));hold('INCOMPLETE_OR_REWRITTEN_HISTORY')}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error}
      }
      if((await run(root,['for-each-ref','--format=%(refname)','refs/replace'])).length)hold('INCOMPLETE_OR_REWRITTEN_HISTORY')
      const headers=(await run(root,['rev-list','--max-count=100001',...unique],undefined,{},budget)).toString().trim().split('\n')
      if(headers.length>100_000)hold('ANCESTRY_VERIFICATION_LIMIT')
      const missing=(await run(root,['rev-list','--objects','--missing=print',...unique],undefined,{},budget)).toString()
      if(/^\?/m.test(missing))hold('GIT_OBJECT_MISSING')
      const pack=await run(root,['pack-objects','--stdout','--revs'],Buffer.from(unique.join('\n')+'\n'),{},budget)
      await run(repository,['index-pack','--stdin','--strict'],pack,{},budget)
      for(const head of unique)await commit(head,budget)
      await validateLayout()
      budget?.()
    },
    async createCandidate(value:CandidateInput,budget?:()=>void) {
      const treeOid=await candidateTree(value,budget),candidate=await deterministicCommit(treeOid,[value.base.prepared.base],encodeRevisionMessage(value.revision).commitMessage,budget)
      return validateCandidate(value,candidate,budget)
    },
    async readRef(planSha256:string) {
      if(!/^[a-f0-9]{64}$/.test(planSha256))hold('PLAN_DIGEST_INVALID')
      const ref=`refs/shared-update/local/${planSha256}`
      const text=(await run(repository,['for-each-ref','--format=%(objectname) %(refname)',ref])).toString().trim()
      if(!text)return null
      const match=/^([a-f0-9]{40}) (.+)$/.exec(text)
      if(!match||match[2]!==ref)hold('LOCAL_REF_CHANGED')
      return match[1]
    },
    async install(planSha256:string,candidate:string,expected:string|null) {
      if(!/^[a-f0-9]{64}$/.test(planSha256))hold('PLAN_DIGEST_INVALID')
      GitShaSchema.parse(candidate);if(expected)GitShaSchema.parse(expected)
      await validateLayout()
      try{await run(repository,['update-ref',`refs/shared-update/local/${planSha256}`,candidate,expected??zero])}
      catch(error){if((error as {exitCode?:number}).exitCode)hold('LOCAL_REF_CHANGED');throw error}
      await verify()
    },
  }
}
export type ScratchTransaction=Awaited<ReturnType<typeof createScratchTransaction>>
