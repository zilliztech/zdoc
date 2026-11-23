import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {createBuildDemo, git, write, externalImage, imageBytes} from '../../build/demo'
import {FakeImageFetcher} from '../../../adapters/images'
import {batchSha256, type BatchRenderRequest} from '../../../adapters/updates/batch-collection-contract'
import type {RemoteTransport} from '../../../adapters/updates/remote-github'
import {guidesSnapshotPath} from '../../../adapters/guides-snapshot'

/** Real isolated Git/render inputs. Their origin is replay; no fixture can mint observed authority. */
export async function batchQualificationFixture(root: string) {
  const d = await createBuildDemo(root)
  await git(d.repo, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
  const ids = ['build-pipeline', 'shared-target']
  const active = ids.map(page => ({page, record: `rec-${page}`, feishu_token: null, anchors: {}, activated_in: '123'}))
  await write(d.dev, 'generated/en/manifests/shared-pages/guides/active.json', JSON.stringify({schema_version: 1, pages: active}))
  const records = ids.map(id => ({record_id: `rec-${id}`, slug: id, release_channel: 'current', placement_type: 'canonical',
    source_kind: 'shared-page', shared_page: {group: 'guides', page: id, inputs_sha256: 'a'.repeat(64), record: `generated/en/manifests/shared-pages/guides/${id}.json`},
    doc_link: `https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/${id}`, doc_token: null, source_file: null,
    source_hash: null, node_metadata: null, outgoing_tokens: [], publish_targets: ['Zilliz.SaaS', 'Zilliz.PaaS'],
    output_paths: [`content/en/guides/tutorials/${id}.mdx`, `content/en/byoc/tutorials/${id}.md`]}))
  await write(d.dev, guidesSnapshotPath, JSON.stringify({manual: 'guides', schema_version: 3, build_env: 'uat', source_branch: 'dev',
    targets_built: ['zilliz.saas', 'zilliz.paas'], records}))
  await git(d.dev, 'add', '.'); await git(d.dev, 'commit', '-qm', 'active current outputs')
  d.devCommit = await git(d.dev, 'rev-parse', 'HEAD')
  await git(root, 'init', '-q', '-b', 'master'); await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'all M configuration')
  let master = await git(root, 'rev-parse', 'HEAD')
  await git(root, 'fetch', '--no-write-fetch-head', '--no-tags', d.dev, d.devCommit)
  const tools = await git(process.cwd(), 'rev-parse', 'HEAD')
  const fixtureBytes = Buffer.from('batch qualification isolated Git and image fixture v1')
  const origin = {kind: 'replay' as const, fixtureSha256: batchSha256(fixtureBytes), replayClockMs: 1577836800000}
  const fetcher = new FakeImageFetcher(new Map([[externalImage, imageBytes]]))
  const request = async (pageId = ids[0]): Promise<BatchRenderRequest> => ({kind: 'guides-batch-render-v1', origin, session: 'f'.repeat(64), pageId,
    pins: {master, dev: d.devCommit, source: await git(d.repo, 'rev-parse', 'HEAD'), trustedTools: tools, toolsetSha256: 'e'.repeat(64)}, sourceRepository: d.repo, devRepository: d.dev})
  const transport: RemoteTransport = async ({path}) => {
    let value: unknown
    if (path.endsWith('zilliztech/zdoc')) value = {id: 660446555, full_name: 'zilliztech/zdoc'}
    else if (path.endsWith('milvus-io/milvus-docs')) value = {id: 267273319, full_name: 'milvus-io/milvus-docs'}
    else if (path.includes('/git/ref/heads/')) {
      const branch = path.split('/heads/')[1]
      value = {ref: `refs/heads/${branch}`, object: {type: 'commit', sha: branch === 'master' ? master : branch === 'dev' ? d.devCommit : await git(d.repo, 'rev-parse', 'HEAD')}}
    } else if (path.includes('/commits/')) value = []
    else throw Error(`Unexpected fixture GET ${path}`)
    return {status: 200, headers: {}, body: Buffer.from(JSON.stringify(value))}
  }
  return {...d, root, ids, origin, fetcher, request, transport,
    async configChange() {await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'M config change'); master = await git(root, 'rev-parse', 'HEAD')},
    async sourceChange(path: string, content: string) {await write(d.repo, path, content); await git(d.repo, 'add', '.'); await git(d.repo, 'commit', '-qm', 'source edge'); return git(d.repo, 'rev-parse', 'HEAD')},
    async append(path: string, text: string) {return this.sourceChange(path, await readFile(join(d.repo, path), 'utf8') + text)},
  }
}

import {mkdir, cp, realpath, writeFile} from 'node:fs/promises'
import {relative, isAbsolute, dirname} from 'node:path'
import {createRequire} from 'node:module'
import {execFileSync} from 'node:child_process'
import {pageYaml} from '../../build/demo'
import {canonicalBytes} from '../../../core/updates/canonical'
import {BatchReplayFixtureSchema, batchRef, type BatchReplayFixture} from '../../../adapters/updates/batch-collection-contract'
const requireFixture = createRequire(import.meta.url)
const fixtureCodeRoot = new URL('../../../../../../../', import.meta.url)
/** Generates raw producer inputs and immutable histories. Passing an executable
 * checkout inside root yields HEAD=M=tools for the later actual captured replay.
 * The default miniature repo tests raw validators only, never measured authority. */
export async function rawBatchLifecycleFixture(inputRoot: string, executableRoot?: string, scenario: {wrongCurrent?: boolean; mixedTargets?: boolean; allNoop?: boolean; mergedPull?: boolean; manualFetch?: boolean} = {}) {
  await mkdir(inputRoot, {recursive: true, mode: 0o700})
  const root = await realpath(inputRoot), tools = executableRoot ?? join(root, 'tools')
  const rel = relative(root, tools)
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) throw Error('Fixture tools must be an owned sibling input')
  const upstream = join(root, 'upstream'), dev = join(root, 'dev'), sources = join(root, 'sources')
  for (const path of [tools, upstream, dev, sources]) await mkdir(path, {recursive: true, mode: 0o700})
  const replay = requireFixture('../../../../../../../scripts/docs-workflow/replay-shared-pages.js')
  const fetch = requireFixture('../../../../lark/sharedPageFetch.js')
  const publication = requireFixture('../../../../lark/sharedPagePublication.js')
  const bundleApi = requireFixture('../../../../lark/sharedPageBundle.js')
  const snapshotApi = requireFixture('../../../../lark/sourceSnapshot.js')
  const {Scraper} = {Scraper: requireFixture('../../../../lark/larkDocScraper.js')}
  const {generateSharedSources} = requireFixture('../../../../../../../scripts/docs-workflow/guides-shared-sources.js')
  const {createGuidesStageArtifact, validateGuidesStageArtifact} = requireFixture('../../../../../../../scripts/docs-workflow/guides-stage-artifact.js')
  const pages = ['json-field-overview', 'member-b', 'member-c']
  const markdown = (page: string, body: string) => `---\nid: ${page}.md\ntitle: ${page}\nsummary: Raw qualification fixture\n---\n\n${body}\n`
  const oldBody = '<!-- doc:block:start id="section" -->\n## Old\n\nStable section context.\n<!-- doc:block:end id="section" -->\n\n{{fragments/shared.md}}\n\n![Diagram](assets/diagram.png)\n'
  await write(upstream, 'site/en/json-field-overview.md', markdown(pages[0], oldBody))
  await write(upstream, 'site/en/member-b.md', markdown(pages[1], '## Member B\n\n{{fragments/shared.md}}'))
  await write(upstream, 'site/en/member-c.md', markdown(pages[2], '## Member C\n\n[Overview](json-field-overview.md#Old)'))
  await write(upstream, 'site/en/fragments/shared.md', 'Shared fragment before.\n')
  await write(upstream, 'site/en/assets/diagram.png', replay.image)
  await git(upstream, 'init', '-q', '-b', 'v3.0.x', '--object-format=sha1', '--template=')
  await git(upstream, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
  await git(upstream, 'add', '.'); await git(upstream, 'commit', '-qm', 'Current source')
  const current = await git(upstream, 'rev-parse', 'HEAD')
  let configuredCurrent = current
  if (scenario.wrongCurrent) {
    await git(upstream, 'commit', '--allow-empty', '-qm', 'Different current owner with identical source tree')
    configuredCurrent = await git(upstream, 'rev-parse', 'HEAD')
  }
  await write(upstream, 'site/en/json-field-overview.md', markdown(pages[0], oldBody.replace('## Old', '## New')))
  await write(upstream, 'site/en/member-c.md', markdown(pages[2], '## Member C\n\n[Overview](json-field-overview.md#New)'))
  await write(upstream, 'site/en/fragments/shared.md', 'Shared fragment after.\n')
  await git(upstream, 'add', '.'); await git(upstream, 'commit', '-qm', 'One seed with a real adoption noop peer')
  const changed = await git(upstream, 'rev-parse', 'HEAD')
  if (scenario.allNoop) {
    await write(upstream, 'site/en/json-field-overview.md', markdown(pages[0], oldBody))
    await write(upstream, 'site/en/member-c.md', markdown(pages[2], '## Member C\n\n[Overview](json-field-overview.md#Old)'))
    await write(upstream, 'site/en/fragments/shared.md', 'Shared fragment before.\n')
    await git(upstream, 'add', '.'); await git(upstream, 'commit', '-qm', 'Restore exact consumed source bytes')
  }
  const target = await git(upstream, 'rev-parse', 'HEAD')
  await git(upstream, 'update-ref', 'refs/remotes/origin/v3.0.x', target)
  const overlay = 'shared-docs/guides'
  // Only this disposable owned checkout is configured. Never edit the real source.
  await write(tools, `${overlay}/source.yaml`, 'schema_version: 1\nrepository: https://github.com/milvus-io/milvus-docs\ntrack: v3.0.x\n')
  await write(tools, `${overlay}/Variables.json`, '{}\n')
  await write(tools, `${overlay}/links.yaml`, 'json-field-overview.md: json-field-overview\n')
  await write(tools, `${overlay}/product-names.yaml`, 'check: [Milvus]\nallow: []\n')
  await write(tools, `${overlay}/presentation/cloud-sdk-tabs.yaml`, await readFile(new URL('../../../fixtures/site/cloud-sdk-tabs.yaml', import.meta.url)))
  for (const page of pages) {
    await write(tools, `${overlay}/pages/${page}/page.yaml`, pageYaml(`site/en/${page}.md`, `tutorials/manage-data/${page}`, scenario.mixedTargets && page === 'member-b' ? ['guides'] : ['guides', 'guides-byoc']))
    await write(tools, `${overlay}/pages/${page}/lock.yaml`, `schema_version: 1\ncurrent: ${current}\nnext: ${page === 'member-c' && !scenario.allNoop ? target : current}\n`)
  }
  if (!executableRoot) await git(tools, 'init', '-q', '-b', 'master', '--object-format=sha1', '--template=')
  await git(tools, 'add', 'shared-docs'); await git(tools, 'commit', '-qm', 'Three configured current Guides pages')
  const master = await git(tools, 'rev-parse', 'HEAD')
  const snapshotPath = 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'
  const baseToken = 'Ac7xbs2k1ad7bjsCXr0ccHe9nMh', sourceDir = 'packages/docs-tooling/src/lark/meta/sources/guides', reports = 'packages/docs-tooling/src/lark/meta/reports/'
  for (const physical of ['guides', 'byoc']) await write(dev, `content/en/${physical}/tutorials/manage-data/existing.md`, '---\nslug: /existing\ntitle: Existing\n---\nExisting fixture landing.\n')
  await write(dev, snapshotPath, JSON.stringify({schema_version: 3, manual: 'guides', build_env: 'uat', base_app_token: baseToken,
    generated_at: new Date().toISOString(), source_dir: sourceDir, records: [], navigation_records: [], table_digests: {}, source_branch: 'dev', targets_built: ['zilliz.saas', 'zilliz.paas']}))
  await git(dev, 'init', '-q', '-b', 'dev', '--object-format=sha1', '--template=')
  await git(dev, 'add', '.'); await git(dev, 'commit', '-qm', 'Before activation')
  const records = pages.map((page, index) => ({record_id: `rec${index}`, base_table_id: 'table', base_table_name: 'Manage Data', base_record_index: index,
    fields: {Docs: {text: page, link: `https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/${page}`}, Slug: page,
      Labels: page, Targets: scenario.mixedTargets && page === 'member-b' ? ['Zilliz.SaaS'] : ['Zilliz.SaaS', 'Zilliz.PaaS'], Progress: 'Published', 'Sidebar Order': index + 1.5, 'Placement Type': 'canonical', 'Release Channel': 'CURRENT'}}))
  let sequence = 0
  const produce = async () => {
    const baseline = await git(dev, 'rev-parse', 'HEAD')
    const prepared = fetch.prepareSharedSources({records, repositoryRoot: tools, baselineRoot: dev, masterCommit: master, devCommit: baseline, sourceDir: sources, rootToken: 'root'})
    const scraper = new Scraper('root', 'base:*', 'wiki', sources)
    scraper.records = records; scraper.base_tables = [{table_id: 'table', name: 'Manage Data'}]; scraper.routingContext = prepared.context
    await scraper.__apply_base_navigation()
    const candidate = snapshotApi.createSourceSnapshot({manualName: 'guides', buildEnv: 'uat', docSourceDir: sources, baseAppToken: baseToken, records, routingContext: prepared.context})
    candidate.source_dir = sourceDir; candidate.generated_at = new Date().toISOString()
    const out = join(root, `bundle-${++sequence}`), scratch = join(root, `scratch-${sequence}`)
    const options = {preparation: prepared.data, repositoryRoot: tools, baselineRoot: dev, repo: upstream, sourceDir: sources, candidate,
      masterCommit: master, devCommit: baseline, rootToken: 'root', out, scratch, runId: '123', imageBaseUrl: 'https://images.example.test',
      plan: {mode: 'incremental', affected_tables: [], changed_records: structuredClone(candidate.records)}}
    // This ordinary seam prepares raw replay input only. It is never a measured
    // collector/qualifier dependency or an injected lifecycle observation.
    const bundle = await generateSharedSources(options, {assertToolIdentity: () => {}, fetchOld: async () => ({blocks: {items: []}})})
    if (bundle.outcomes.some((o: {status: string}) => !['success', 'reused'].includes(o.status))) throw Error('Raw fixture generation failed: ' + JSON.stringify(bundle.outcomes))
    return {options, bundle, baseline}
  }
  const publish = async (round: Awaited<ReturnType<typeof produce>>) => {
    const handoff = bundleApi.loadBundle(round.options.out)
    for (const outcome of handoff.bundle.outcomes) for (const output of outcome.outputs) await write(dev, output.path, handoff.files.get(output.file))
    const result = publication.finalizePublication({workspace: dev, handoff, candidate: round.options.candidate})
    const promoted = snapshotApi.promoteCandidateSnapshot(result.snapshot, {manual: 'guides', buildEnv: 'uat', allowEmptySharedEffective: true,
      sourceDir, targetsBuilt: ['zilliz.saas', 'zilliz.paas'], sourceBranch: 'dev', publishUrl: 'https://docs.cloud-uat3.zilliz.com', linkCheckRemote: 'https://docs.zilliz.com'})
    publication.publishedEvidence(dev, result.snapshot)
    await write(dev, snapshotPath, JSON.stringify(promoted, null, 2) + '\n')
    const authorityPath = 'generated/en/manifests/shared-pages/guides/_publication.json', authority = JSON.parse(await readFile(join(dev, authorityPath), 'utf8'))
    authority.effective_sha256 = requireFixture('../../../../lark/sourceCompleteness.js').hashSnapshot(promoted)
    await write(dev, authorityPath, JSON.stringify(authority, null, 2) + '\n')
    await git(dev, 'add', '.'); await git(dev, 'commit', '-qm', 'Actual generated publication ' + sequence)
    return git(dev, 'rev-parse', 'HEAD')
  }
  await publish(await produce())
  await publish(await produce())
  records[0].fields.Labels = 'Fresh observed label'
  const round = await produce(), {baseline} = round
  const workspace = join(root, 'source-worker'), stage = join(root, 'guides-source')
  await mkdir(join(workspace, dirname(bundleApi.ROOT)), {recursive: true})
  await cp(round.options.out, join(workspace, bundleApi.ROOT), {recursive: true})
  await cp(sources, join(workspace, sourceDir), {recursive: true})
  await write(workspace, reports + 'guides-source-snapshot-candidate.json', JSON.stringify(round.options.candidate))
  await write(workspace, 'packages/docs-tooling/src/lark/meta/media-cache/guides.json', JSON.stringify({schemaVersion: 1, entries: []}))
  await write(workspace, reports + 'guides-media-prefetch.json', JSON.stringify({schemaVersion: 1, generated_at: new Date().toISOString(), mode: 'recovery', cacheState: 'missing',
    metrics: {canonicalReferencesRequired: 0, selectedReferences: 0, validatedManifestReuse: 0, committedDocsReconstruction: 0, resolvedByNetwork: 0, staleEntriesDropped: 0, finalManifestEntries: 0}}))
  requireFixture('../../../../../../../scripts/docs-workflow/guides-render-readiness.js').validateGuidesRenderReadiness({workspace, site: 'en',
    snapshotPath: join(workspace, reports + 'guides-source-snapshot-candidate.json'), manual: {root: 'root', base: 'base:*', docSourceDir: sourceDir}, expectedSource: {root: 'root', base: 'base:*', sourceDir}})
  const decision = requireFixture('../../../../../../../scripts/docs-workflow/guides-assembly-identity.js').decideAssembly({candidateSnapshot: publication.effectiveSnapshot(round.options.candidate, bundleApi.loadBundle(round.options.out)),
    incrementalPlan: round.options.plan, tableCount: 1, repositoryRoot: executableRoot ? tools : new URL('.', fixtureCodeRoot).pathname, baselineRoot: dev,
    baselineDescriptorPath: 'packages/docs-tooling/src/lark/meta/assembly/guides.json', baselineSaasSidebarPath: 'generated/en/sidebars/guides.sidebar.js', baselineByocSidebarPath: 'generated/en/sidebars/guides-byoc.sidebar.js',
    masterSha: master, devBaselineSha: baseline, baselineSourceSha: baseline, generatedAt: new Date().toISOString()})
  await write(workspace, reports + 'guides-assembly-decision.json', JSON.stringify(decision))
  const manifest = await createGuidesStageArtifact({site: 'en', stage: 'source', workspace, baselineDir: dev, output: stage, masterSha: master, devBaselineSha: baseline, rootToken: 'root'})
  await validateGuidesStageArtifact(stage, {site: 'en', stage: 'source', masterSha: master, devBaselineSha: baseline})
  const resultSha = await publish(round), sampledDev = resultSha
  await git(tools, 'fetch', '--no-write-fetch-head', '--no-tags', dev, resultSha)
  await git(tools, 'update-ref', 'refs/heads/dev', sampledDev)
  let measuredMaster = master
  if (scenario.wrongCurrent) {
    for (const page of pages) await write(tools, `${overlay}/pages/${page}/lock.yaml`, `schema_version: 1\ncurrent: ${configuredCurrent}\nnext: ${page === 'member-c' ? target : configuredCurrent}\n`)
    await git(tools, 'add', 'shared-docs'); await git(tools, 'commit', '-qm', 'M current owner differs while source bytes remain identical')
    measuredMaster = await git(tools, 'rev-parse', 'HEAD')
  }
  const sourceAt = new Date(Date.parse(manifest.createdAt) + 1000).toISOString(), publishAt = new Date(Date.parse(sourceAt) + 5000).toISOString(), scanAt = round.options.candidate.generated_at
  const rootApi = 'repos/zilliztech/zdoc', runId = 123, run = {id: runId, run_attempt: 1, repository: {id: 660446555}, head_repository: {id: 660446555}, workflow_id: 83360731,
    path: '.github/workflows/fetch-docs.yml', head_sha: master, head_branch: 'master', event: scenario.manualFetch ? 'workflow_dispatch' : 'schedule', status: 'completed', conclusion: 'success', updated_at: publishAt,
    ...(scenario.manualFetch ? {actor: {id: 100}, triggering_actor: {id: 100}} : {}),
    referenced_workflows: [{path: `zilliztech/zdoc/.github/workflows/_fetch-guides-sources.yml@${master}`, sha: master}]}
  const time = (at: string, delta: number) => new Date(Date.parse(at) + delta).toISOString()
  const step = (name: string, started_at: string, completed_at: string) => ({name, started_at, completed_at, conclusion: 'success'})
  const job = (id: number, name: string, steps: ReturnType<typeof step>[], started_at = time(scanAt, -1000), completed_at = time(sourceAt, 3000)) => ({id, name, run_id: runId,
    run_attempt: 1, head_sha: master, status: 'completed', conclusion: 'success', started_at, completed_at, steps})
  const jobs = [job(21, 'produce_guides_sources / fetch', [step('Fetch shared guides sources', time(scanAt, -1000), scanAt),
    step('Generate selected shared Guides sources', scanAt, manifest.createdAt), step('Create shared source artifact', manifest.createdAt, sourceAt), step('Run actions/upload-artifact@v6', sourceAt, time(sourceAt, 2000))]),
    job(22, 'produce_guides / assemble', []), job(23, 'publish_ready', [step('Publish ready Fetch units in producer completion FIFO order', time(publishAt, -1000), time(publishAt, 1000))], time(publishAt, -1000), time(publishAt, 1000))]
  const selection = scenario.manualFetch ? requireFixture('../../../../../../../scripts/docs-workflow/fetch-publication-selection.js').buildFetchPublicationSelection({
    repository: 'zilliztech/zdoc', runId, runAttempt: 1, toolingSha: master, targetBranch: 'dev', initialTargetSha: baseline,
    sourceBaselineSha: baseline, selectedGroup: 'guides', publish: true, runTranslations: false,
  }) : undefined
  const selectionAt = time(scanAt, -4000)
  if (selection) jobs.push(job(24, 'prepare', [step('Qualify exact manual Guides dispatch inputs', time(selectionAt, -2000), time(selectionAt, -1000)),
    step('Upload immutable Fetch publication selection', time(selectionAt, -1000), time(selectionAt, 1000))], time(selectionAt, -3000), time(selectionAt, 1000)))
  const result = {schemaVersion: 1, document: 'publication-results', workflow: 'fetch', repository: 'zilliztech/zdoc', runId, runAttempt: 1,
    selectionSha256: selection?.selectionSha256 ?? batchSha256(Buffer.from('fixture selection')), mode: 'publish', targetBranch: 'dev', initialTargetSha: baseline, finalTargetSha: resultSha,
    startedAt: time(publishAt, -1000), completedAt: publishAt, overallStatus: 'success', orchestratorFailure: null,
    units: [{unitKey: 'source/guides-en', attempts: 1, baseSha: baseline, commitShas: [resultSha], failure: null, producerCompletedAt: time(publishAt, -1000), producerJobId: 22,
      publishCompletedAt: publishAt, publishStartedAt: time(publishAt, -1000), readyAt: time(publishAt, -1000), reconciled: null, resultSha, sequence: 1, status: 'published'}]}
  if (selection) result.units.push({...result.units[0], unitKey: 'source/guides-zh-CN', producerJobId: 25,
    sequence: 2, baseSha: resultSha, commitShas: [], status: 'no_changes'})
  requireFixture('../../../../../../../scripts/docs-workflow/publication-contracts.js').validatePublicationResults(result, {selection})
  const transportRoot = join(root, 'transport'); await mkdir(transportRoot)
  const sourceZip = join(transportRoot, 'source.zip'), publicationZip = join(transportRoot, 'publication.zip')
  execFileSync('python3', ['-c', `import io,tarfile,zipfile,sys,pathlib
root=pathlib.Path(sys.argv[1]);tar=io.BytesIO()
with tarfile.open(fileobj=tar,mode='w') as t:t.add(root/'guides-source',arcname='guides-source')
with zipfile.ZipFile(sys.argv[2],'w',compression=zipfile.ZIP_DEFLATED) as z:z.writestr('guides-source.tar',tar.getvalue())
with zipfile.ZipFile(sys.argv[3],'w',compression=zipfile.ZIP_DEFLATED) as z:z.writestr('publication-results.json',sys.stdin.buffer.read())`, root, sourceZip, publicationZip], {input: JSON.stringify(result)})
  const sourceBytes = await readFile(sourceZip), publicationBytes = await readFile(publicationZip)
  const artifact = (id: number, name: string, bytes: Buffer, created_at: string) => ({id, name, expired: false, created_at, size_in_bytes: bytes.length, digest: 'sha256:' + batchSha256(bytes),
    workflow_run: {id: runId, repository_id: 660446555, head_repository_id: 660446555, head_sha: master, head_branch: 'master'}})
  const artifacts = [artifact(31, 'guides-sources-en-123', sourceBytes, sourceAt), artifact(32, 'publication-results-fetch-123-1', publicationBytes, publishAt)]
  const selectionZip = join(transportRoot, 'selection.zip')
  const selectionBytes = selection ? execFileSync('python3', ['-c', `import io,sys,zipfile
output=io.BytesIO()
with zipfile.ZipFile(output,'w',compression=zipfile.ZIP_DEFLATED) as z:z.writestr('publication-selection.json',sys.stdin.buffer.read())
sys.stdout.buffer.write(output.getvalue())`], {input: JSON.stringify(selection)}) : undefined
  if (selectionBytes) {
    await writeFile(selectionZip, selectionBytes)
    artifacts.push(artifact(33, 'publication-selection-fetch-123-1', selectionBytes, selectionAt))
  }
  const raw = (path: string, value: unknown) => {const bytes = Buffer.from(JSON.stringify(value)); return {path, bytes: bytes.length, sha256: batchSha256(bytes), base64: bytes.toString('base64')}}
  const metadata = [raw(rootApi, {id: 660446555}), raw(rootApi + '/actions/runs/123', run), raw(rootApi + '/actions/runs/123/attempts/1/jobs?per_page=100&page=1', {total_count: jobs.length, jobs}),
    raw(rootApi + '/actions/runs/123/artifacts?per_page=100&page=1', {total_count: artifacts.length, artifacts})]
  const earliest = new Date(Date.parse(scanAt) - 1000 - 70 * 24 * 3600_000).toISOString().slice(0, 10)
  const qualification = [...metadata, raw(rootApi + `/actions/workflows/fetch-docs.yml/runs?created=%3E%3D${earliest}&per_page=100&page=1`, {total_count: 1, workflow_runs: [run]}),
    raw(rootApi + `/actions/workflows/fetch-guides-requested.yml/runs?created=%3E%3D${earliest}&per_page=100&page=1`, {total_count: 0, workflow_runs: []}), raw(rootApi + '/branches/dev', {name: 'dev', commit: {sha: sampledDev}})]
  const pins = [raw(rootApi, {id: 660446555, full_name: 'zilliztech/zdoc'}), raw('repos/milvus-io/milvus-docs', {id: 267273319, full_name: 'milvus-io/milvus-docs'}),
    ...[['zilliztech/zdoc', 'master', measuredMaster], ['zilliztech/zdoc', 'dev', sampledDev], ['milvus-io/milvus-docs', 'v3.0.x', target]].map(([repo, branch, sha]) => raw(`repos/${repo}/git/ref/heads/${branch}`, {ref: 'refs/heads/' + branch, object: {type: 'commit', sha}}))]
  const merged = {id: 999, number: 999, state: 'closed', merged_at: publishAt,
    base: {ref: 'v3.0.x', sha: current, repo: {id: 267273319, full_name: 'milvus-io/milvus-docs'}}, head: {sha: target}}
  const changedPaths = scenario.allNoop ? [] : ['site/en/fragments/shared.md', 'site/en/json-field-overview.md', 'site/en/member-c.md']
  const files = await Promise.all(changedPaths.map(async filename => ({filename, status: 'modified', sha: await git(upstream, 'rev-parse', `${target}:${filename}`)})))
  const discovery = [...pins, ...[...new Set([changed, target])].map(oid => raw(`repos/milvus-io/milvus-docs/commits/${oid}/pulls?per_page=100&page=1`, scenario.mergedPull ? [merged] : [])),
    ...(scenario.mergedPull ? [raw('repos/milvus-io/milvus-docs/pulls/999', {...merged, merged: true, merge_commit_sha: target, commits: scenario.allNoop ? 2 : 1, changed_files: files.length}),
      raw('repos/milvus-io/milvus-docs/pulls/999/files?per_page=100&page=1', files)] : [])]
  const fixture: BatchReplayFixture = BatchReplayFixtureSchema.parse({kind: 'guides-batch-replay-fixture-v1', root, pins, qualification, discovery,
    finalPass: [raw(rootApi + '/actions/workflows/fetch-docs.yml/runs?branch=master&per_page=1', {workflow_runs: [run]}), ...qualification.slice(0, -1), ...pins],
    acquisition: [raw(rootApi + '/actions/workflows/fetch-docs.yml/runs?branch=master&per_page=1', {workflow_runs: [run]}), ...metadata],
    archives: {source: {id: 31, path: 'transport/source.zip', bytes: sourceBytes.length, sha256: batchSha256(sourceBytes)}, publication: {id: 32, path: 'transport/publication.zip', bytes: publicationBytes.length, sha256: batchSha256(publicationBytes)},
      ...(selectionBytes ? {selection: {id: 33, path: 'transport/selection.zip', bytes: selectionBytes.length, sha256: batchSha256(selectionBytes)}} : {})}, images: []})
  const fixtureBytes = canonicalBytes(fixture), replayClockMs = Date.parse(publishAt) + 2000
  await writeFile(join(root, 'replay-fixture.json'), fixtureBytes)
  await writeFile(join(root, 'fixture-summary.json'), JSON.stringify({master: measuredMaster, producer: master, current, configuredCurrent, target, baseline, resultSha, sampledDev, replayClockMs, pages, rawOnly: !executableRoot,
    source: batchRef(sourceBytes), publication: batchRef(publicationBytes), outcomes: round.bundle.outcomes.map((o: {page: string; status: string}) => ({page: o.page, status: o.status}))}, null, 2))
  const discoveryTransport: RemoteTransport = async ({path}) => {
    const found = discovery.find(p => p.path === path.slice(1))
    if (found) return {status: 200, headers: {}, body: Buffer.from(found.base64, 'base64')}
    if (/^\/repos\/milvus-io\/milvus-docs\/commits\/[a-f0-9]{40}\/pulls\?per_page=100&page=1$/.test(path)) return {status: 200, headers: {}, body: Buffer.from('[]')}
    throw Error('Unexpected raw fixture discovery GET ' + path)
  }
  return {root, tools, upstream, dev, stage, sourceZip, publicationZip, master: measuredMaster, producer: master, current, configuredCurrent, target, baseline, resultSha, sampledDev, pages,
    selectionZip, selection, result, outcomes: round.bundle.outcomes as {page: string; status: string}[], fixtureBytes, fixture, replayClockMs, discoveryTransport}
}
