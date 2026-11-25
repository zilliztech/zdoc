import {DOC_HEADING_TAGS} from '../../../../../docs-ui/src/shared/utils/docHeadingTags'
import {inventoryBlocks} from '../../core/blocks'
import {parsePageConfig} from '../../core/config'
import {parseLock} from '../../core/lock'
import {parseTabsRules} from '../../core/site'
import {applyPlan, planTransforms, stripMappedMarkers, type ContentFile, type TransformInput} from '../../core/transforms'
import {parseVariables} from '../../core/variables'
import {canonicalBytes, compareUtf8} from '../../core/updates/canonical'
import {classifyBatchScopeWithReadIndex, type BatchScopeInput, type ScopePage, type ScopeReadLookup} from '../../core/updates/batch-scope'
import {createHistoricalFragmentReader} from '../git-milvus-docs-reader'
import {RealMd2md} from '../md2md'
import {batchSha256} from './batch-collection-contract'
import {parseBatchGitCommit} from './batch-git-object'
import {BatchGitStore, batchBudget} from './batch-source'
import {guidesRegistryRoot, guidesVariantNames} from './guides-batch-registry'
import {isHistoricalRenderPoint, loadHistoricalRenderRules} from './historical-render'

const fragmentRoot = 'site/en/fragments'
const maxPoints = 4096, maxRootBytes = 1024 * 1024
const maxSnapshotBytes = 8 * 1024 * 1024, maxSnapshotNodes = 4096
const utf8 = new TextDecoder('utf-8', {fatal: true, ignoreBOM: true})
const requestKey = (page: string, commit: string, path: string, oid: string) => [page, commit, path, oid].join('\0')
type Request = {page: ScopePage; commit: string; path: string; oid: string}
type PointState = 'read' | 'absent' | 'unknown'
type Point = {pageId: string; commit: string; path: string; oid: string; state: PointState; reason: string;
  rootOid?: string; fragmentTree?: string; variablesOid?: string; configOid?: string; lockOid?: string; engine?: {name: string; version: string};
  transformInputs?: {tabsOid: string; contentOids: {file: string; oid: string}[]}; evidence?: string}
type PlanInput = Omit<TransformInput, 'markdown' | 'blocks' | 'channel' | 'availableChannels'>
const pointOf = (request: Request, state: PointState, reason: string): Point => ({pageId: request.page.pageId,
  commit: request.commit, path: request.path, oid: request.oid, state, reason})

/** Evaluate only existing fragment objects requested by the selected PR's actual Git edges. */
export async function observeBatchScopeSourceReads(options: {zdocRepository: string; sourceRepository: string; input: BatchScopeInput}) {
  const {input} = options, {pins} = input
  const requests = new Map<string, Request>(), points = new Map<string, Point>()
  let capped = false
  classifyBatchScopeWithReadIndex(input, (page, _pins, commit, path, oid) => {
    const key = requestKey(page.pageId, commit, path, oid)
    if (requests.size < maxPoints) requests.set(key, {page, commit, path, oid})
    else if (!requests.has(key)) capped = true
    return {state: 'unknown'}
  })
  function finish() {
    const lookup: ScopeReadLookup = (page, _pins, commit, path, oid) => points.get(requestKey(page.pageId, commit, path, oid)) ?? {state: 'unknown'}
    const report = classifyBatchScopeWithReadIndex(input, lookup)
    const ordered = [...points.entries()].sort(([a], [b]) => compareUtf8(a, b)).map(([, point]) => point)
    const counts = {read: 0, absent: 0, unknown: 0}
    for (const point of ordered) counts[point.state]++
    return {report, sourceReads: {schema: 'guides-batch-scope-raw-fragments-v1' as const, pins, capped, counts, points: ordered}}
  }
  if (!requests.size) return finish()
  // A failed point contributes no negative evidence. Preserve the complete Git scope report.
  for (const [key, request] of requests) points.set(key, pointOf(request, 'unknown', 'SOURCE_INPUT_UNAVAILABLE'))
  const budget = batchBudget()
  const open = (path: string) => BatchGitStore.open(path, budget).catch(() => undefined)
  const zdoc = await open(options.zdocRepository), source = await open(options.sourceRepository)
  if (!zdoc || !source || !await zdoc.rootTree(pins.dev).catch(() => undefined)) return finish()
  const variablesBlob = await zdoc.file(pins.master, `${guidesRegistryRoot}/Variables.json`).catch(() => undefined)
  if (!variablesBlob || variablesBlob.bytes.length > maxRootBytes) return finish()
  let variables: ReturnType<typeof parseVariables>
  try { variables = parseVariables(utf8.decode(variablesBlob.bytes)) } catch { return finish() }
  if ('errors' in variables) return finish()
  const rules = loadHistoricalRenderRules(), engine = new RealMd2md()
  const readFragments = createHistoricalFragmentReader(source, budget.remaining)

  const configByPage = new Map<string, {configOid: string; lockOid: string; transformed: boolean; planner?: PlanInput; transformInputs?: Point['transformInputs']}>()
  let tabs: {oid: string; rules: PlanInput['tabsRules']} | null | undefined
  for (const {page} of new Map([...requests.values()].map(row => [row.page.pageId, row])).values()) {
    try {
      const directory = `${guidesRegistryRoot}/pages/${page.pageId}`
      const files = await zdoc.directory(pins.master, directory)
      if (guidesVariantNames.some(name => files.has(name))) continue
      const config = await zdoc.file(pins.master, `${directory}/page.yaml`)
      const lock = await zdoc.file(pins.master, `${directory}/lock.yaml`)
      const configFile = `${directory}/page.yaml`, pageYaml = utf8.decode(config.bytes)
      const parsed = parsePageConfig(page.pageId, pageYaml, {
        manuals: ['guides', 'guides-byoc'], betaValues: DOC_HEADING_TAGS.filter(tag => tag !== 'BYOC'),
      }, budget.remaining)
      const state = parseLock(utf8.decode(lock.bytes))
      if ('errors' in parsed || 'errors' in state || parsed.config.source.file !== page.sourceFile ||
          state.lock.current !== page.current || state.lock.next !== page.oldNext) continue
      const transforms = parsed.config.transforms ?? []
      const binding = {configOid: config.oid, lockOid: lock.oid, transformed: transforms.length > 0}
      configByPage.set(page.pageId, binding)
      if (!transforms.length) continue
      if (tabs === undefined) {
        tabs = null
        const file = await zdoc.file(pins.master, `${guidesRegistryRoot}/presentation/cloud-sdk-tabs.yaml`)
        if (file.bytes.length > maxRootBytes) continue
        const parsedTabs = parseTabsRules(utf8.decode(file.bytes), {})
        if (!('errors' in parsedTabs)) tabs = {oid: file.oid, rules: parsedTabs.rules}
      }
      if (!tabs) continue
      const contentFiles = new Map<string, ContentFile>(), contentOids: {file: string; oid: string}[] = []
      for (const name of [...new Set(transforms.flatMap(rule => rule.content?.file ? [rule.content.file] : []))].sort(compareUtf8)) {
        if (/[\\/\x00]/.test(name) || name === '.' || name === '..') throw Error('SOURCE_TRANSFORM_PATH_INVALID')
        const path = `${directory}/${name}`, file = await zdoc.file(pins.master, path)
        if (file.bytes.length > maxRootBytes) throw Error('SOURCE_TRANSFORM_LIMIT')
        contentFiles.set(name, {file: path, text: utf8.decode(file.bytes)})
        contentOids.push({file: path, oid: file.oid})
      }
      configByPage.set(page.pageId, {...binding, transformInputs: {tabsOid: tabs.oid, contentOids}, planner: {contentFiles, transforms,
        page: page.pageId, pageYaml, configFile, sourceFile: page.sourceFile, tabsRules: tabs.rules}})
    } catch { /* Page remains unknown if its exact registry bytes are unavailable. */ }
  }

  const expectedCommits = new Map(input.history.map(row => [row.oid, row]))
  const commits = new Map<string, {tree: string; requests: [string, Request][]} | null>()
  const groups = new Map<string, {commit: string; requests: [string, Request][]}>()
  for (const [key, request] of requests) {
    if (!configByPage.has(request.page.pageId) || isHistoricalRenderPoint(rules, request.page.pageId, request.commit)) continue
    if (!commits.has(request.commit)) {
      commits.set(request.commit, null)
      try {
        const expected = expectedCommits.get(request.commit), actual = parseBatchGitCommit(await source.read(request.commit, 'commit'))
        if (!expected || actual.tree !== expected.tree || actual.parents.join(',') !== expected.parents.join(',')) continue
        const directory = await source.directory(request.commit, 'site/en'), fragments = directory.get('fragments')
        if (fragments?.mode !== '40000') continue
        commits.set(request.commit, {tree: fragments.oid, requests: []})
      } catch { continue }
    }
    commits.get(request.commit)?.requests.push([key, request])
  }
  for (const [commit, recorded] of commits) {
    if (!recorded) continue
    const {tree, requests: members} = recorded
    const group = groups.get(tree) ?? {commit, requests: []}
    group.requests.push(...members)
    groups.set(tree, group)
  }

  for (const [fragmentTree, group] of groups) {
    try {
      const [footprint] = await source.measureFragmentSnapshots([group.commit])
      if (footprint.bytes > maxSnapshotBytes || footprint.count > maxSnapshotNodes) {
        for (const [key, request] of group.requests) points.set(key, pointOf(request, 'unknown', 'SOURCE_FRAGMENT_SNAPSHOT_LIMIT'))
        continue
      }
      await readFragments.withFragments(group.commit, async snapshot => {
        type Preprocessed = ReturnType<RealMd2md['preprocess']>
        const examined = new Map<string, Preprocessed>(), transformed = new Map<string, Preprocessed[] | null>()
        for (const [key, request] of group.requests) {
          try {
            const {page, commit, path, oid} = request, relative = path.slice('site/en/'.length)
            const config = configByPage.get(page.pageId)!
            const fragment = await source.file(group.commit, path)
            if (fragment.oid !== oid || !snapshot.files.has(relative)) continue
            const root = await source.file(commit, page.sourceFile)
            if (root.bytes.length > maxRootBytes) {
              points.set(key, pointOf(request, 'unknown', 'SOURCE_ROOT_LIMIT'))
              continue
            }
            const cacheKey = `${page.sourceFile}:${root.oid}`
            let preprocessed = examined.get(cacheKey)
            if (!preprocessed) {
              const content = utf8.decode(root.bytes)
              if (!engine.parseBlocks(content, {sourceName: page.sourceFile}).ok) continue
              preprocessed = engine.preprocess({content: engine.stripBlockMarkers(content), fragmentRoot: snapshot.root,
                variables: variables.variables, sourceName: page.sourceFile})
              examined.set(cacheKey, preprocessed)
            }
            const read = preprocessed.dependencies.fragments.find(dep => dep.path === relative)
            const text = snapshot.files.get(relative)!
            if (read && (read.sha256 !== batchSha256(Buffer.from(text)) || read.bytes !== Buffer.byteLength(text))) continue
            const transformKey = `${page.pageId}:${root.oid}`
            if (!read && preprocessed.ok && config.planner && !transformed.has(transformKey)) {
              const markdown = utf8.decode(root.bytes), parsed = engine.parseBlocks(markdown, {sourceName: page.sourceFile})
              const rows: Preprocessed[] = []
              if (parsed.ok) for (const channel of ['current', 'next'] as const) {
                // Channel availability can reject an edit. It cannot introduce an edit not in this union.
                const plan = planTransforms({...config.planner, markdown, blocks: inventoryBlocks(markdown, parsed), channel})
                if ('errors' in plan) break
                const content = stripMappedMarkers(applyPlan(markdown, page.sourceFile, plan), parsed.blocks).map(line => line.text).join('\n')
                rows.push(engine.preprocess({content, fragmentRoot: snapshot.root, variables: variables.variables, sourceName: page.sourceFile}))
              }
              transformed.set(transformKey, rows.length === 2 && rows.every(row => row.ok) ? rows : null)
            }
            const generated = transformed.get(transformKey)
            const generatedRead = generated?.some(row => row.dependencies.fragments.some(dep => dep.path === relative))
            const canProveAbsence = preprocessed.ok && (!config.transformed || !!generated && !generatedRead)
            const state = read ? 'read' : canProveAbsence ? 'absent' : 'unknown'
            const reason = read ? 'RAW_FRAGMENT_CONSUMED' : !preprocessed.ok ? 'PREPROCESS_INCOMPLETE' : generatedRead ? 'GENERATED_FRAGMENT_POSSIBLE' :
              generated ? 'COMPLETE_TRANSFORM_FRAGMENT_READS' : config.transformed ? 'GENERATED_FRAGMENT_READ_UNPROVEN' : 'COMPLETE_NATIVE_FRAGMENT_READS'
            const point: Point = {...pointOf(request, state, reason), rootOid: root.oid, fragmentTree,
              variablesOid: variablesBlob.oid, configOid: config.configOid, lockOid: config.lockOid, engine: preprocessed.engine,
              ...(generated && config.transformInputs ? {transformInputs: config.transformInputs} : {})}
            if (state !== 'unknown') point.evidence = batchSha256(canonicalBytes({schema: 'guides-batch-scope-raw-fragments-v1', pins, ...point}))
            points.set(key, point)
          } catch { /* Malformed bytes or failed Git reads leave this point unknown. */ }
        }
      })
    } catch { /* An unavailable fragment tree leaves its points unknown. */ }
  }
  try {
    await source.verify()
    await zdoc.verify()
  } catch {
    for (const [key, request] of requests) points.set(key, pointOf(request, 'unknown', 'SOURCE_READ_VERIFICATION_UNAVAILABLE'))
  }
  return finish()
}
