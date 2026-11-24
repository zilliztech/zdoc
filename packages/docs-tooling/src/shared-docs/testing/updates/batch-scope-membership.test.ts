// @vitest-environment node
import {cp, mkdtemp, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {expect, it, onTestFinished} from 'vitest'
import {applyPageMembershipWitness, inspectBatchScopePage, membershipDecision, preparationClasses} from '../../adapters/updates/batch-scope-membership'
import type {BatchScopeReport, ScopePage} from '../../core/updates/batch-scope'
import {createBuildDemo, git, write} from '../build/demo'

it('partitions the preparation stage by both root and fragment tree', () => {
  const rows = [{commit:'a',rootOid:'r',fragmentTree:'f'}, {commit:'b',rootOid:'r',fragmentTree:'f'},
    {commit:'c',rootOid:'s',fragmentTree:'f'}, {commit:'d',rootOid:'r',fragmentTree:null}]
  expect(preparationClasses(rows).map(group => group.map(p => p.commit))).toEqual([['a','b'],['c'],['d']])
})

it('never promotes partial, duplicate, held, or consumed history, or a possible adoption', () => {
  const base = {adoptionIndependent:true, actualCommits:['a','b'], requiredCommits:['a','b'], edges:['unchanged' as const], reasons:[]}
  expect(membershipDecision(base)).toBe(true)
  expect(membershipDecision({...base,actualCommits:['a']})).toBe(false)
  expect(membershipDecision({...base,actualCommits:['a','a']})).toBe(false)
  expect(membershipDecision({...base,actualCommits:['a','x']})).toBe(false)
  expect(membershipDecision({...base,reasons:['INTERMEDIATE_OBSERVATION_INCOMPLETE']})).toBe(false)
  expect(membershipDecision({...base,edges:['changed']})).toBe(false)
  expect(membershipDecision({...base,edges:['unproven']})).toBe(false)
  expect(membershipDecision({...base,adoptionIndependent:false})).toBe(false)
})

it('applies only the live page certificate to the same pins and complete published output coverage', async () => {
  const root = await mkdtemp(join(tmpdir(),'scope-membership-test-'))
  onTestFinished(() => rm(root,{recursive:true,force:true}))
  const demo = await createBuildDemo(root), pageId = 'build-pipeline'
  await write(demo.repo,'site/en/build-pipeline.md','---\nid: build-pipeline.md\ntitle: Build Pipeline\nsummary: Scope fixture.\n---\n\n# Build Pipeline\n\n## Section\n\nPlain text.\n')
  await git(demo.repo,'commit','-qam','Plain page')
  const oldNext = await git(demo.repo,'rev-parse','HEAD')
  await write(demo.sharedDocs,'pages/build-pipeline/lock.yaml',JSON.stringify({schema_version:1,current:oldNext,next:oldNext}))
  await cp(demo.sharedDocs,join(demo.dev,'shared-docs/guides'),{recursive:true})
  for (const [kind,ext] of [['guides','mdx'],['byoc','md']]) {
    const file = `content/en/${kind}/tutorials/build-pipeline.${ext}`
    await write(demo.dev,file,'---\nslug: /build-pipeline\ntitle: Build pipeline\n---\n\n[Peer](./shared-target)\n')
  }
  await git(demo.dev,'add','.'); await git(demo.dev,'commit','-qm','Register scope fixture')
  const master = await git(demo.dev,'rev-parse','HEAD')
  for (const name of ['a','b','c']) {
    await write(demo.repo,'unrelated',name);await git(demo.repo,'add','unrelated');await git(demo.repo,'commit','-qm','Unrelated '+name)
  }
  const source = await git(demo.repo,'rev-parse','HEAD'), pins = {master,dev:master,source}
  const options = {zdocRepository:demo.dev,sourceRepository:demo.repo,pageId,pins}
  const witness = await inspectBatchScopePage({...options, verifyHistory:true})
  expect(witness, JSON.stringify(witness)).toMatchObject({status:'excluded-from-source-and-adoption',actualHistoricalRenders:2,
    sourceAndAdoptionNonmember:true,namespace:'requires-selected-group-and-pinned-dev', productionQualified:false})
  const page: ScopePage = {pageId,current:oldNext,oldNext,sourceFile:'site/en/build-pipeline.md',evidence:[]}
  const row = (id: string) => ({...page,pageId:id,target:source,disposition:'unknown' as const,reasons:['DEPENDENCY_CLOSURE_UNPROVEN'],
    selectedEdges:0,intervalEdges:3,sourceObligations:'disjoint' as const,crossPage:'unproven' as const,otherInputs:'unproven' as const})
  const scope: BatchScopeReport = {schema:'guides-batch-scope-v1',pins,seeds:[],writeEligible:false,
    counts:{full:0,excluded:0,unknown:2},sourceCounts:{hit:0,unknown:0,'possible-fragment':0,disjoint:2},pages:[row(pageId),row('shared-target')]}
  const pubs = [{pageId,outputsRead:2,reasons:[]},{pageId:'shared-target',outputsRead:2,reasons:[]}]
  const applied = await applyPageMembershipWitness(scope,page,pubs,witness)
  expect(witness).toMatchObject({publishedNamespace:{complete:true, outputs:[
    {references:[{route:'shared-target',anchor:false,stableOwner:true,targetManualCount:2}]},
    {references:[{route:'shared-target',anchor:false,stableOwner:true,targetManualCount:2}]}]}})
  expect(applied.membership).toMatchObject({verifiedNonmembers:1,historicalRendersAlreadyObserved:2,
    reason:witness.toolsWorkingTreeModified ? 'MEMBERSHIP_TOOLS_MODIFIED' : 'PAGE_HISTORY_SKIPPABLE'})
  expect(applied.report.pages[0].disposition).toBe(witness.toolsWorkingTreeModified ? 'unknown' : 'excluded')
  expect(scope.pages[0].disposition).toBe('unknown')
  expect((await applyPageMembershipWitness(scope,page,[pubs[0]],witness)).membership).toMatchObject({
    reason:'PUBLISHED_NAMESPACE_RETAINED', retainedRoutes:['shared-target']})
  expect((await applyPageMembershipWitness(scope,page,pubs,structuredClone(witness))).membership.reason).toBe('MEMBERSHIP_WITNESS_UNAVAILABLE')
  expect((await applyPageMembershipWitness({...scope,pins:{...pins,dev:demo.devCommit}},page,pubs,witness)).membership.reason).toBe('MEMBERSHIP_WITNESS_BINDING')
  expect((await applyPageMembershipWitness(scope,page,[{...pubs[0],outputsRead:1}],witness)).membership).toMatchObject({
    verifiedNonmembers:1,skippablePages:0,reason:'PUBLISHED_NAMESPACE_UNPROVEN'})
  // Only the D body changes: that ordinary link now depends on the target's future heading.
  await write(demo.dev,'content/en/guides/tutorials/build-pipeline.mdx',
    '---\nslug: /build-pipeline\ntitle: Build pipeline\n---\n\n[Peer](./shared-target#new-anchor)\n')
  await git(demo.dev,'commit','-qam','Introduce an anchored published reference')
  const newPins = {...pins, dev: await git(demo.dev,'rev-parse','HEAD')}
  const anchored = await inspectBatchScopePage({...options, pins:newPins, verifyHistory:true})
  expect((await applyPageMembershipWitness({...scope,pins:newPins},page,pubs,anchored)).membership)
    .toMatchObject({verifiedNonmembers:1, skippablePages:0, retainedRoutes:['shared-target']})

  const sampled = await inspectBatchScopePage(options)
  expect(sampled).toMatchObject({sourceAndAdoptionNonmember:false,actualHistoricalRenders:1})
  expect((await applyPageMembershipWitness(scope,page,pubs,sampled)).membership.verifiedNonmembers).toBe(0)
}, 30_000)
